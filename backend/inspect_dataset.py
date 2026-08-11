import os
import sys
import json
import collections
import numpy as np
from PIL import Image
from typing import Dict, List, Tuple

SUPPORTED_IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.bmp', '.webp', '.tif', '.tiff'}
ANNOTATION_EXTS = {'.json', '.xml', '.txt', '.csv'}

def inspect_dataset(dataset_dir: str):
    """
    Comprehensive Dataset Inspection Script for Dental X-ray Datasets.
    Performs integrity checks, format analysis, image dimension auditing,
    duplicate detection, class imbalance auditing, and suitability analysis
    for EfficientNet image-level classification.
    """
    abs_dataset_dir = os.path.abspath(dataset_dir)
    dir_basename = os.path.basename(abs_dataset_dir)

    print(f"\n==================================================")
    print(f"       SMILEGUARD AI - DATASET INSPECTOR          ")
    print(f"==================================================")
    print(f"Target Directory: {abs_dataset_dir}\n")

    if not os.path.exists(dataset_dir):
        print(f"Error: Dataset directory '{abs_dataset_dir}' does not exist.")
        return

    # 1. Structure Discovery
    all_files = []
    image_files = []
    annotation_files = []

    for root, dirs, files in os.walk(dataset_dir):
        for f in files:
            if f.startswith('.'):
                continue
            full_path = os.path.join(root, f)
            all_files.append(full_path)
            ext = os.path.splitext(f)[1].lower()
            if ext in SUPPORTED_IMAGE_EXTS:
                image_files.append(full_path)
            elif ext in ANNOTATION_EXTS:
                annotation_files.append(full_path)

    print(f"--- 1. Directory & File Breakdown ---")
    print(f"Total Files Found:         {len(all_files)}")
    print(f"Total Image Files:         {len(image_files)}")
    print(f"Total Annotation Files:    {len(annotation_files)}")

    if len(image_files) == 0:
        print("\nNotice: No image files found in dataset path.")
        print(f"Path inspected: '{abs_dataset_dir}'")
        return

    # 2. Duplicate Filename Detection
    filename_counts = collections.defaultdict(list)
    for img_path in image_files:
        fname = os.path.basename(img_path)
        filename_counts[fname].append(img_path)

    duplicates = {fname: paths for fname, paths in filename_counts.items() if len(paths) > 1}
    print(f"\n--- 2. Duplicate Filename Audit ---")
    if duplicates:
        print(f"WARNING: Found {len(duplicates)} duplicate filename(s) across folders:")
        for fname, paths in list(duplicates.items())[:5]:
            print(f"  - '{fname}': found in {len(paths)} locations")
        if len(duplicates) > 5:
            print(f"  ... and {len(duplicates) - 5} more.")
    else:
        print("Duplicate Filenames: None (All image filenames are unique).")

    # 3. Image Integrity & Dimensions Audit
    corrupt_images = []
    dimensions = []
    channels = collections.Counter()

    for img_path in image_files:
        try:
            with Image.open(img_path) as img:
                img.verify()
            with Image.open(img_path) as img:
                w, h = img.size
                dimensions.append((w, h))
                channels[img.mode] += 1
        except Exception:
            corrupt_images.append(img_path)

    valid_image_count = len(image_files) - len(corrupt_images)
    print(f"\n--- 3. Image Integrity & Dimension Analysis ---")
    print(f"Valid Readable Images:     {valid_image_count} / {len(image_files)}")
    print(f"Corrupt / Unreadable:      {len(corrupt_images)}")

    if corrupt_images:
        print("Corrupt Files List:")
        for cpath in corrupt_images[:5]:
            print(f"  - {cpath}")

    if dimensions:
        widths, heights = zip(*dimensions)
        print(f"Width Range:               Min {min(widths)}px | Max {max(widths)}px | Mean {int(np.mean(widths))}px")
        print(f"Height Range:              Min {min(heights)}px | Max {max(heights)}px | Mean {int(np.mean(heights))}px")
        print(f"Color Modes Discovered:    {dict(channels)}")

    # 4. Class & Split Discovery
    train_dir = os.path.join(dataset_dir, "train")
    val_dir = os.path.join(dataset_dir, "val")
    if not os.path.exists(val_dir):
        val_dir = os.path.join(dataset_dir, "validation")
    test_dir = os.path.join(dataset_dir, "test")
    is_presplit = os.path.exists(train_dir) and os.path.isdir(train_dir)

    classes = []
    class_counts = {}
    split_breakdown = {}
    train_count = 0
    val_count = 0
    test_count = 0

    if is_presplit:
        scan_base = train_dir
        classes = [d for d in sorted(os.listdir(scan_base)) if os.path.isdir(os.path.join(scan_base, d)) and not d.startswith('.')]
        for c in classes:
            c_tr = [f for f in os.listdir(os.path.join(train_dir, c)) if os.path.splitext(f)[1].lower() in SUPPORTED_IMAGE_EXTS] if os.path.exists(os.path.join(train_dir, c)) else []
            c_va = [f for f in os.listdir(os.path.join(val_dir, c)) if os.path.splitext(f)[1].lower() in SUPPORTED_IMAGE_EXTS] if os.path.exists(os.path.join(val_dir, c)) else []
            c_te = [f for f in os.listdir(os.path.join(test_dir, c)) if os.path.splitext(f)[1].lower() in SUPPORTED_IMAGE_EXTS] if os.path.exists(os.path.join(test_dir, c)) else []
            
            n_tr, n_va, n_te = len(c_tr), len(c_va), len(c_te)
            train_count += n_tr
            val_count += n_va
            test_count += n_te
            class_counts[c] = n_tr + n_va + n_te
            split_breakdown[c] = {"train": n_tr, "val": n_va, "test": n_te}
    else:
        classes = [d for d in sorted(os.listdir(dataset_dir)) if os.path.isdir(os.path.join(dataset_dir, d)) and not d.startswith('.')]
        for c in classes:
            c_imgs = [f for f in os.listdir(os.path.join(dataset_dir, c)) if os.path.splitext(f)[1].lower() in SUPPORTED_IMAGE_EXTS]
            class_counts[c] = len(c_imgs)
        total_valid = sum(class_counts.values())
        train_count = int(total_valid * 0.70)
        val_count = int(total_valid * 0.15)
        test_count = total_valid - train_count - val_count

    # 5. MD5 & Cross-Split Leakage Audit
    import hashlib
    md5_to_splits = collections.defaultdict(set)
    md5_to_classes = collections.defaultdict(set)
    md5_all = collections.defaultdict(list)

    for img_path in image_files:
        rel_path = os.path.relative_to(img_path, dataset_dir) if hasattr(os, 'relative_to') else os.path.relpath(img_path, dataset_dir)
        parts = rel_path.split(os.sep)
        split_name = parts[0] if (is_presplit and len(parts) > 1) else "unsplit"
        class_name = parts[1] if (is_presplit and len(parts) > 2) else (parts[0] if len(parts) > 1 else "unknown")
        
        try:
            with open(img_path, 'rb') as f:
                h = hashlib.md5(f.read()).hexdigest()
            md5_to_splits[h].add(split_name)
            md5_to_classes[h].add(class_name)
            md5_all[h].append(img_path)
        except Exception:
            pass

    duplicate_md5_count = sum(1 for items in md5_all.values() if len(items) > 1)
    cross_split_leakage = sum(1 for splits in md5_to_splits.values() if len(splits) > 1)
    cross_class_leakage = sum(1 for cls in md5_to_classes.values() if len(cls) > 1)

    # 6. Annotation File Inspection
    dentex_jsons = [f for f in annotation_files if 'dentex' in f.lower() or f.endswith('.json')]
    json_annotation_detected = len(dentex_jsons) > 0

    conversion_required = "NO"
    compatible = "YES" if (len(classes) >= 2 and valid_image_count >= 10) else "NO"

    if json_annotation_detected:
        conversion_required = "YES"

    print(f"\n==================================================")
    print(f"                DATASET INSPECTION                ")
    print(f"==================================================")
    print(f"Dataset:")
    print(f"  {dir_basename} ({abs_dataset_dir})")
    print(f"\nTotal images:")
    print(f"  {valid_image_count}")
    print(f"\nClasses breakdown (Total / Train / Val / Test):")
    for cname in classes:
        if is_presplit:
            sb = split_breakdown[cname]
            print(f"  - {cname}: {class_counts.get(cname, 0)} total (Train: {sb['train']}, Val: {sb['val']}, Test: {sb['test']})")
        else:
            print(f"  - {cname}: {class_counts.get(cname, 0)} total")
    if not classes:
        print("  - None discovered (check folder layout)")

    print(f"\nTraining Count:       {train_count}")
    print(f"Validation Count:     {val_count}")
    print(f"Test Count:           {test_count}")
    print(f"\nMD5 Duplicate Count:  {duplicate_md5_count}")
    print(f"Cross-Split Leakage:  {cross_split_leakage}")
    print(f"Cross-Class Leakage:  {cross_class_leakage}")
    print(f"\nCompatible with EfficientNetB0: {compatible}")
    print(f"==================================================\n")

if __name__ == '__main__':
    dataset_path = sys.argv[1] if len(sys.argv) > 1 else "backend/dataset"
    inspect_dataset(dataset_path)
