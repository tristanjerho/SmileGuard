import io
import cv2
import numpy as np
from PIL import Image
from fastapi import HTTPException
from tensorflow.keras.applications.efficientnet import preprocess_input
from config import IMAGE_SIZE

SUPPORTED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'bmp'}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
MIN_FILE_SIZE_BYTES = 5 * 1024       # 5 KB
MIN_IMAGE_DIM = 100                  # 100x100 px

def validate_image_format(filename: str, image_bytes: bytes):
    """
    Validates uploaded image file extension, size, dimensions, readability,
    and radiological X-ray modality characteristics (rejects intraoral photos, selfies, non-X-rays).
    """
    # 1. File extension validation
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '.{ext}'. Supported formats: {', '.join(SUPPORTED_EXTENSIONS).upper()}."
        )

    # 2. File size validation
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum limit of 15MB."
        )
    if len(image_bytes) < MIN_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="File size is too small (under 5KB)."
        )

    # 3. Readability & Dimensions validation
    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img.verify()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is corrupted or not a valid image format."
        )

    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        w, h = pil_img.size
        if w < MIN_IMAGE_DIM or h < MIN_IMAGE_DIM:
            raise HTTPException(
                status_code=400,
                detail=f"Image resolution too low ({w}x{h}px). Minimum required dimension is {MIN_IMAGE_DIM}x{MIN_IMAGE_DIM}px."
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to inspect image dimensions: {str(e)}")

    # 4. Radiological X-ray Modality Validation
    # Decode BGR image to analyze color variance, saturation, and radiographic distribution
    nparr = np.frombuffer(image_bytes, np.uint8)
    bgr_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if bgr_img is not None:
        hsv = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2HSV)
        saturation = hsv[:, :, 1].astype(np.float32)
        mean_sat = float(np.mean(saturation))

        b, g, r = cv2.split(bgr_img)
        diff_rg = np.abs(r.astype(np.float32) - g.astype(np.float32))
        diff_gb = np.abs(g.astype(np.float32) - b.astype(np.float32))
        diff_br = np.abs(b.astype(np.float32) - r.astype(np.float32))
        chroma_diff = (diff_rg + diff_gb + diff_br) / 3.0
        mean_chroma_diff = float(np.mean(chroma_diff))

        # Check percentage of pixels showing color saturation
        colored_pixel_ratio = float(np.mean((saturation > 25.0) & (chroma_diff > 10.0)))

        # Intraoral photos, selfies, color photos, and general photos have chromaticity
        # Whereas dental X-rays (Panoramic, Bitewing, Periapical) are monochromatic radiographs
        if mean_sat > 10.0 or mean_chroma_diff > 7.0 or colored_pixel_ratio > 0.03:
            # Diagnose specific type for user feedback
            is_oral_tone = np.mean(r > (g + 15)) > 0.12
            detected_label = "Intraoral photo" if is_oral_tone else "Selfie / Color photo / General photo"
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported image modality ({detected_label} detected): "
                    "SmileGuard AI accepts dental X-ray images only (Panoramic X-ray, Bitewing X-ray, or Periapical X-ray). "
                    "Not Supported: Intraoral photos, Selfies / Color photos, General photos."
                )
            )

        # Grayscale validation: reject blank images or binarized text documents
        gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
        std_lum = float(np.std(gray))
        if std_lum < 10.0:
            raise HTTPException(
                status_code=400,
                detail="Unsupported image: Blank or uniform image detected. Please upload a clear dental radiograph."
            )

        extreme_ratio = float(np.mean((gray < 15) | (gray > 240)))
        if extreme_ratio > 0.78:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported image: Document or diagram detected. "
                    "SmileGuard AI accepts dental X-ray images only (Panoramic, Bitewing, or Periapical X-rays)."
                )
            )

def preprocess_image(image_bytes: bytes):
    """
    Preprocesses uploaded dental X-ray image bytes:
    1. Decodes BGR/RGB array.
    2. Resizes to target 224x224.
    3. Preprocesses for EfficientNet input tensor (1, 224, 224, 3).
    Returns (preprocessed_batch, resized_bgr).
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    orig_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if orig_bgr is None:
        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            orig_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to decode image pixels.")

    resized_bgr = cv2.resize(orig_bgr, IMAGE_SIZE, interpolation=cv2.INTER_AREA)
    rgb_img = cv2.cvtColor(resized_bgr, cv2.COLOR_BGR2RGB)
    batch_img = np.expand_dims(rgb_img, axis=0).astype(np.float32)
    preprocessed_batch = preprocess_input(batch_img)

    return preprocessed_batch, resized_bgr
