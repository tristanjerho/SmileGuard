import urllib.request
import io
import json
import os

url = 'http://127.0.0.1:8000/api/predict'
test_samples = [
    ('Dental Caries', r'backend/dataset_clean/test/Dental Caries/11.jpg'),
    ('Impacted Teeth', r'backend/dataset_clean/test/Impacted Teeth/158.jpg'),
    ('Infection', r'backend/dataset_clean/test/Infection/205.jpg')
]

def upload_file(file_path):
    boundary = '---SmileGuardBoundary123456789'
    filename = os.path.basename(file_path)
    with open(file_path, 'rb') as f:
        file_bytes = f.read()
    
    body = io.BytesIO()
    body.write(f'--{boundary}\r\n'.encode())
    body.write(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode())
    body.write(b'Content-Type: image/jpeg\r\n\r\n')
    body.write(file_bytes)
    body.write(b'\r\n')
    body.write(f'--{boundary}--\r\n'.encode())
    
    req = urllib.request.Request(
        url,
        data=body.getvalue(),
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'},
        method='POST'
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("==================================================")
print("   END-TO-END FASTAPI HTTP PREDICT API TEST      ")
print("==================================================\n")

for true_class, fpath in test_samples:
    fname = os.path.basename(fpath)
    res = upload_file(fpath)
    
    pred = res['prediction']
    conf = res['confidence']
    raw_vec = res['rawVector']
    probs = res['probabilities']
    has_overlay = 'overlay' in res and len(res['overlay']) > 1000
    
    print(f"Test Image:            {fname}")
    print(f"True Class:            {true_class}")
    print(f"API Prediction:        {pred}")
    print(f"API Confidence:        {conf}%")
    print(f"API Probabilities Map: {probs}")
    print(f"API Raw Vector:        {raw_vec}")
    print(f"Grad-CAM Generated:    {has_overlay} ({len(res['overlay'])} bytes Base64)")
    
    top_prob_pct = round(probs[pred] * 100, 2)
    diff = abs(conf - top_prob_pct)
    print(f"Confidence Verification: API Conf ({conf}%) == Top Class Prob ({top_prob_pct}%) [Diff: {diff:.4f}]")
    assert diff < 0.05, f"Confidence mismatch: conf={conf}, top_prob={top_prob_pct}"
    print("  ==> CONFIDENCE MATH MATCHES RAW PROBABILITY PERFECTLY!")
    print("--------------------------------------------------\n")
