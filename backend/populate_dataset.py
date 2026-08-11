import os
import shutil

source_base = os.path.abspath(r"C:\Users\My Computer\Downloads\dental_dataset\Dental OPG XRAY Dataset\Dental OPG (Classification)")
target_base = os.path.abspath(r"backend/dataset")

mapping = {
    "Caries": "Dental Caries",
    "Impacted teeth": "Impacted Teeth",
    "Infection": "Infection"
}

print(f"Source Base: {source_base}")
print(f"Target Base: {target_base}")

# Ensure target base exists
os.makedirs(target_base, exist_ok=True)

total_copied = 0
for src_folder, target_folder_name in mapping.items():
    src_dir = os.path.join(source_base, src_folder)
    dst_dir = os.path.join(target_base, target_folder_name)
    
    if os.path.exists(dst_dir):
        shutil.rmtree(dst_dir)
    os.makedirs(dst_dir, exist_ok=True)
    
    if not os.path.exists(src_dir):
        print(f"Error: Source directory missing: {src_dir}")
        continue
        
    files = [f for f in os.listdir(src_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    print(f"Copying {len(files)} images from '{src_folder}' -> '{target_folder_name}'...")
    
    for f in files:
        src_file = os.path.join(src_dir, f)
        dst_file = os.path.join(dst_dir, f)
        shutil.copy2(src_file, dst_file)
        total_copied += 1

print(f"\nSuccessfully populated backend/dataset/ with {total_copied} images across 3 classes!")
