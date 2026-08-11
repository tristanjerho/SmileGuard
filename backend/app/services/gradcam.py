import base64
import cv2
import numpy as np
import tensorflow as tf

def find_target_conv_layer(model):
    """
    Finds the final 4D Conv2D layer in EfficientNetB0 for Grad-CAM.
    Compatible with Keras 3 and Keras 2.
    """
    # 1. Check for 'top_conv' specifically first
    try:
        top_l = model.get_layer('top_conv')
        if top_l:
            return 'top_conv'
    except Exception:
        pass

    # 2. Reverse search model layers for 4D Conv layer
    for layer in reversed(model.layers):
        if 'conv' in layer.name.lower():
            try:
                shape = layer.output.shape if hasattr(layer, 'output') else getattr(layer, 'output_shape', None)
                if shape and len(shape) == 4:
                    return layer.name
            except Exception:
                continue

    # 3. Search nested layers if base model is wrapped
    for layer in model.layers:
        if hasattr(layer, 'layers'):
            for sublayer in reversed(layer.layers):
                if 'conv' in sublayer.name.lower():
                    try:
                        shape = sublayer.output.shape if hasattr(sublayer, 'output') else getattr(sublayer, 'output_shape', None)
                        if shape and len(shape) == 4:
                            return sublayer.name
                    except Exception:
                        continue

    raise ValueError("Could not locate a valid 4D convolutional layer in EfficientNetB0 for Grad-CAM.")

def generate_gradcam(model, input_tensor, orig_bgr, pred_class_idx):
    """
    Generates authentic Grad-CAM visual attention heatmap and overlay from the trained CNN model.
    Throws an explicit RuntimeError if Grad-CAM cannot be computed.
    No synthetic blobs or circular heatmaps are generated.
    """
    try:
        target_layer_name = find_target_conv_layer(model)
        grad_model = None

        # Build gradient model mapping input -> (target_conv_output, final_prediction)
        try:
            target_layer = model.get_layer(target_layer_name)
            grad_model = tf.keras.models.Model(
                inputs=model.inputs,
                outputs=[target_layer.output, model.output]
            )
        except Exception:
            for layer in model.layers:
                if hasattr(layer, 'get_layer'):
                    try:
                        target_layer = layer.get_layer(target_layer_name)
                        grad_model = tf.keras.models.Model(
                            inputs=layer.inputs,
                            outputs=[target_layer.output, layer.output]
                        )
                        break
                    except Exception:
                        pass

        if grad_model is None:
            raise RuntimeError(f"Unable to bind gradient graph for target layer '{target_layer_name}'.")

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(input_tensor)
            if isinstance(predictions, list):
                predictions = predictions[-1]

            # Handle binary vs multiclass output shape
            if predictions.shape[-1] == 1:
                loss = predictions[:, 0]
            else:
                loss = predictions[:, pred_class_idx]

        # Compute gradients of top predicted class score wrt conv layer activations
        grads = tape.gradient(loss, conv_outputs)
        if grads is None:
            raise RuntimeError("Gradient computation returned None. Ensure model weights and graph are active.")

        # Pool gradients across spatial dimensions
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        # Weight feature maps by pooled gradients
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        # Apply ReLU to retain positive contributions
        heatmap = tf.maximum(heatmap, 0)

        # Normalize heatmap to [0, 1]
        max_val = tf.reduce_max(heatmap)
        if max_val > 0:
            heatmap = heatmap / max_val
        heatmap = heatmap.numpy()

        # Resize heatmap to match original image dimension
        h, w = orig_bgr.shape[:2]
        heatmap_resized = cv2.resize(heatmap, (w, h))

        # Convert to uint8
        heatmap_uint8 = np.uint8(255 * heatmap_resized)

        # Apply JET colormap for visual explainability
        heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

        # Overlay heatmap onto original image (60% original, 40% heatmap)
        overlay = cv2.addWeighted(orig_bgr, 0.6, heatmap_color, 0.4, 0)

        # Encode to PNG Base64
        _, heatmap_encoded = cv2.imencode('.png', heatmap_color)
        _, overlay_encoded = cv2.imencode('.png', overlay)

        heatmap_b64 = "data:image/png;base64," + base64.b64encode(heatmap_encoded).decode('utf-8')
        overlay_b64 = "data:image/png;base64," + base64.b64encode(overlay_encoded).decode('utf-8')

        return heatmap_b64, overlay_b64

    except Exception as e:
        raise RuntimeError(f"Grad-CAM generation failed: {str(e)}")
