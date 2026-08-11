import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Scan,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  User,
  Save,
  CheckSquare,
  Square,
  Sparkles,
  Check,
  X,
  FileWarning
} from 'lucide-react';
import { db } from './src/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import Spinner from './src/components/auth/Spinner';
import { API_ENDPOINTS, DISPLAY_API_HOST } from './src/config/api';

export default function AiDiagnostic() {
  const fileInputRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');

  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiError, setApiError] = useState('');

  // Dentist Review Form State
  const [hasReviewedAiOutput, setHasReviewedAiOutput] = useState(false);
  const [clinicalInterpretation, setClinicalInterpretation] = useState('');
  const [finalClinicalDecision, setFinalClinicalDecision] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewSavedSuccess, setReviewSavedSuccess] = useState(false);

  // Fetch patients list from Firestore for patient selector
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.role !== 'admin' && data.role !== 'dentist') {
          const name = data.fullName || `${data.FirstName || ''} ${data.lastName || ''}`.trim() || data.email;
          fetched.push({ id: docSnap.id, name, ...data });
        }
      });
      setPatients(fetched);
      if (fetched.length > 0 && !selectedPatientId) {
        setSelectedPatientId(fetched[0].id);
        setSelectedPatientName(fetched[0].name);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePatientChange = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    const found = patients.find((p) => p.id === id);
    setSelectedPatientName(found ? found.name : 'Patient');
  };

  /**
   * Client-side Dental X-ray Modality & File Integrity Validator
   */
  const validateXrayImage = (file) => {
    return new Promise((resolve) => {
      // 1. File extension validation
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'jfif', 'pjpeg', 'pjp', 'tif', 'tiff'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        return resolve({
          valid: false,
          message: `Unsupported file format '.${ext}'. Allowed formats: JPG, JPEG, PNG, WEBP, BMP, JFIF.`
        });
      }

      // 2. File size validation
      if (file.size > 25 * 1024 * 1024) {
        return resolve({
          valid: false,
          message: 'File size exceeds maximum limit of 25MB.'
        });
      }
      if (file.size < 1 * 1024) {
        return resolve({
          valid: false,
          message: 'File size is too small (under 1KB).'
        });
      }

      // 3. Image Dimensions & Color Modality Check (detect intraoral photos, selfies, non-X-rays)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        if (img.width < 50 || img.height < 50) {
          return resolve({
            valid: false,
            message: `Image resolution too low (${img.width}x${img.height}px). Minimum required is 50x50px.`
          });
        }

        // Render to canvas to analyze pixel color saturation & RGB channel divergence
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = Math.min(img.width, 200);
        canvas.height = Math.min(img.height, 200);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let totalDiff = 0;
        let totalSat = 0;
        const pixelCount = imgData.length / 4;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          // Channel divergence
          const diff = (Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)) / 3;
          totalDiff += diff;

          // Saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          totalSat += sat;
        }

        const meanDiff = totalDiff / pixelCount;
        const meanSat = (totalSat / pixelCount) * 100;

        // Color intraoral photos (like mouth selfies) have high saturation & high channel divergence
        if (meanDiff > 40 && meanSat > 40) {
          return resolve({
            valid: false,
            message: 'Unsupported image modality: SmileGuard AI accepts dental X-ray images only (panoramic, bitewing, or periapical X-rays). Intraoral photographs or non-dental images are not supported.'
          });
        }

        return resolve({ valid: true });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          valid: false,
          message: 'Failed to read image file. File may be corrupted.'
        });
      };

      img.src = objectUrl;
    });
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    setValidationError('');
    setApiError('');
    setAnalysisResult(null);
    setHasReviewedAiOutput(false);
    setClinicalInterpretation('');
    setFinalClinicalDecision('');
    setReviewSavedSuccess(false);

    // Run Client Validation
    const validation = await validateXrayImage(file);
    if (!validation.valid) {
      setUploadedFile(null);
      setImagePreviewUrl(null);
      setValidationError(validation.message);
      return;
    }

    setUploadedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedFile) {
      setValidationError('Please upload a valid Dental X-ray image first.');
      return;
    }

    setIsAnalyzing(true);
    setApiError('');
    setValidationError('');
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s API timeout

    try {
      // Connect to FastAPI AI Backend
      const response = await fetch(API_ENDPOINTS.predict, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned error ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      clearTimeout(timeoutId);
      let msg = err.message;
      if (err.name === 'AbortError') {
        msg = 'API request timed out after 15 seconds. Please ensure the backend is responsive.';
      } else if (msg === 'Failed to fetch') {
        msg = `FastAPI AI Backend Unavailable. Please verify the server is running on ${DISPLAY_API_HOST}.`;
      }
      console.warn('FastAPI connection / prediction error:', msg);
      setApiError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!hasReviewedAiOutput) {
      alert('Please confirm "☐ Reviewed AI output" checkbox before saving.');
      return;
    }
    if (!clinicalInterpretation.trim() || !finalClinicalDecision.trim()) {
      alert('Please complete both Clinical Interpretation and Final Clinical Decision text areas.');
      return;
    }

    setIsSavingReview(true);

    try {
      const patientId = selectedPatientId || 'PATIENT_GUEST';
      const nowIso = new Date().toISOString();

      if (db) {
        // 1. Create dentalXrays document
        const xrayDocRef = await addDoc(collection(db, 'dentalXrays'), {
          patientId: patientId,
          uploadedBy: 'Dr. Ana Santos',
          imageUrl: imagePreviewUrl || 'xray_image_url',
          uploadedAt: nowIso,
          analysisStatus: 'Analyzed',
          imageType: 'Dental X-ray',
          createdAt: serverTimestamp(),
        });

        // 2. Create aiPredictions document
        const predDocRef = await addDoc(collection(db, 'aiPredictions'), {
          patientId: patientId,
          xrayId: xrayDocRef.id,
          prediction: analysisResult?.prediction || 'Normal / Intact Structure',
          confidence: analysisResult?.confidence || 0,
          heatmapUrl: analysisResult?.heatmap || '',
          overlayUrl: analysisResult?.overlay || '',
          modelVersion: analysisResult?.modelVersion || '1.0.0',
          createdAt: nowIso,
        });

        // 3. Create dentistReviews document
        await addDoc(collection(db, 'dentistReviews'), {
          patientId: patientId,
          xrayId: xrayDocRef.id,
          predictionId: predDocRef.id,
          dentistId: 'DR_ANA_SANTOS',
          reviewed: true,
          clinicalInterpretation: clinicalInterpretation.trim(),
          finalDecision: finalClinicalDecision.trim(),
          notes: 'AI Attention Region reviewed by clinician',
          reviewedAt: nowIso,
        });
      }

      setReviewSavedSuccess(true);
      setTimeout(() => setReviewSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving dentist review to Firestore:', err);
      alert('Failed to save dentist review to Cloud Firestore.');
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-800/60 rounded-2xl p-6 shadow-lg text-white space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700 text-purple-300 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Clinical Decision Support System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          AI-ASSISTED DENTAL IMAGE ANALYSIS
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
          CNN-powered feature extraction & Grad-CAM visual explainability. Supports clinical evaluation by dentists.
        </p>
      </div>

      {/* Main Analysis Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <User className="h-4 w-4 text-purple-600" />
              <span>Select Patient</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={handlePatientChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {patients.length === 0 ? (
                <option value="p1">Maria Santos (Patient ID #10024)</option>
              ) : (
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email || p.id})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Modality Requirements Box */}
          <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-800">
              <Scan className="h-4 w-4 text-purple-600" />
              <span>Dental X-Ray Modality Requirements</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-bold text-emerald-700 block mb-0.5">Supported:</span>
                <ul className="space-y-0.5 text-slate-700 font-medium">
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Panoramic X-ray</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Bitewing X-ray</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Periapical X-ray</span>
                  </li>
                </ul>
              </div>

              <div>
                <span className="font-bold text-rose-700 block mb-0.5">Not Supported:</span>
                <ul className="space-y-0.5 text-slate-500 font-medium">
                  <li className="flex items-center gap-1">
                    <X className="h-3 w-3 text-rose-500" />
                    <span>Intraoral photos</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <X className="h-3 w-3 text-rose-500" />
                    <span>Selfies / Color photos</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <X className="h-3 w-3 text-rose-500" />
                    <span>General photos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Drop Zone */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Upload Dental X-Ray File
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-300 hover:border-purple-500 bg-slate-50/50 hover:bg-purple-50/20 rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer group"
          >
            <UploadCloud className="h-10 w-10 text-purple-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-slate-800">Drag & drop radiological X-ray file or click anywhere to Browse</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supported formats: JPG, JPEG, PNG, WEBP, BMP, JFIF (Max 25MB)</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="cursor-pointer px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition-all inline-flex items-center gap-2"
            >
              <span>Browse X-Ray Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onClick={(e) => { e.target.value = null; }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        {/* Client Validation Error Alert */}
        {validationError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-700">
              <FileWarning className="h-4 w-4 text-rose-600 shrink-0" />
              <span>Image Validation Error</span>
            </div>
            <p className="text-slate-700 leading-relaxed pl-6">{validationError}</p>
          </div>
        )}

        {/* Live Upload Preview & Trigger Button */}
        {imagePreviewUrl && !validationError && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={imagePreviewUrl}
                alt="Selected X-ray preview"
                className="h-16 w-16 object-cover rounded-lg border border-slate-300 shadow-sm"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">{uploadedFile?.name || 'xray.png'}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {(uploadedFile?.size ? uploadedFile.size / 1024 : 120).toFixed(1)} KB • Valid Dental X-Ray Format
                </p>
              </div>
            </div>

            <button
              onClick={handleAnalyzeImage}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Analyzing dental image...</span>
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4" />
                  <span>Analyze Image</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* API Notice / Model Not Trained Protection Alert */}
        {apiError && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Model Status Notice</span>
            </div>
            <p className="text-slate-800 font-semibold pl-6">{apiError}</p>
            <p className="text-[11px] text-slate-600 pl-6 mt-1">
              SmileGuard AI strictly prevents synthetic predictions. Upload a dataset to <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">backend/dataset/</code> and execute <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">python backend/train.py</code> to train the CNN.
            </p>
          </div>
        )}
      </div>

      {/* Loading Progress State */}
      {isAnalyzing && (
        <div className="p-8 rounded-2xl bg-white border border-purple-200 shadow-md text-center space-y-3">
          <Spinner size="lg" className="text-purple-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">Analyzing dental X-ray...</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Processing image through EfficientNetB0 feature extraction and generating Grad-CAM visual attention overlays.
          </p>
        </div>
      )}

      {/* Analysis Result Output */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Result Stats Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI-ASSISTED X-RAY ANALYSIS
              </h3>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  Patient: {selectedPatientName}
                </span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                  {selectedPatientId || 'PATIENT_REF'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                <p className="text-[10px] font-bold uppercase text-purple-700">AI Model Output</p>
                <p className="text-base font-black text-slate-900">{analysisResult.prediction}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <p className="text-[10px] font-bold uppercase text-emerald-700">Confidence Score</p>
                <p className="text-2xl font-black text-emerald-900">{analysisResult.confidence}%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Model Architecture</p>
                <p className="text-xs font-bold text-slate-800">{analysisResult.architecture || 'EfficientNetB0'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Analysis Date</p>
                <p className="text-xs font-bold text-slate-800">
                  {new Date(analysisResult.timestamp || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Class Probabilities Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                CLASS PROBABILITIES BREAKDOWN
              </p>
              <div className="space-y-2.5">
                {['Dental Caries', 'Impacted Teeth', 'Infection'].map((cName, idx) => {
                  let pctStr = '0.00';
                  if (analysisResult.probabilities && analysisResult.probabilities[cName] !== undefined) {
                    pctStr = (analysisResult.probabilities[cName] * 100).toFixed(2);
                  } else if (analysisResult.rawVector && analysisResult.rawVector[idx] !== undefined) {
                    pctStr = (analysisResult.rawVector[idx] * 100).toFixed(2);
                  } else if (cName === analysisResult.prediction) {
                    pctStr = analysisResult.confidence?.toFixed(2) || '0.00';
                  }

                  const pctVal = parseFloat(pctStr);
                  const isTop = cName === analysisResult.prediction;

                  return (
                    <div key={cName} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={isTop ? 'text-purple-900 font-extrabold flex items-center gap-1.5' : 'text-slate-700'}>
                          {cName}
                          {isTop && (
                            <span className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.2 rounded">
                              Top Output
                            </span>
                          )}
                        </span>
                        <span className={isTop ? 'text-purple-800 font-extrabold' : 'text-slate-600'}>
                          {pctStr}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTop ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-400/60'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, pctVal))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dual Side-by-Side Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original X-Ray */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">ORIGINAL X-RAY</h3>
              <div className="aspect-video rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                <img
                  src={imagePreviewUrl}
                  alt="Original Dental X-ray"
                  className="max-h-64 object-contain"
                />
              </div>
            </div>

            {/* AI Attention Visualization (Grad-CAM) */}
            <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>AI ATTENTION VISUALIZATION</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                  Grad-CAM
                </span>
              </div>
              <div className="aspect-video rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-purple-300">
                <img
                  src={analysisResult.overlay || imagePreviewUrl}
                  alt="AI Attention Visualization Overlay"
                  className="max-h-64 object-contain"
                />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                Highlighted regions represent areas that influenced the model output. These regions require review by the dentist.
              </p>
            </div>
          </div>

          {/* Dentist Review Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span>DENTIST REVIEW</span>
            </h3>

            {reviewSavedSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Dentist Review saved and synchronized to Cloud Firestore!</span>
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Checkbox Confirmation */}
              <label
                onClick={() => setHasReviewedAiOutput((prev) => !prev)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                {hasReviewedAiOutput ? (
                  <CheckSquare className="h-5 w-5 text-purple-600 shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-slate-400 shrink-0" />
                )}
                <span className="text-xs font-bold text-slate-800">
                  Reviewed AI output & visual attention region
                </span>
              </label>

              {/* Clinical Interpretation Text Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Interpretation
                </label>
                <textarea
                  required
                  rows={3}
                  value={clinicalInterpretation}
                  onChange={(e) => setClinicalInterpretation(e.target.value)}
                  placeholder="Enter detailed radiological and clinical observations..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Final Clinical Decision Text Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Final Clinical Decision
                </label>
                <textarea
                  required
                  rows={3}
                  value={finalClinicalDecision}
                  onChange={(e) => setFinalClinicalDecision(e.target.value)}
                  placeholder="State final diagnosis, treatment plan recommendations, or follow-up procedures..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSavingReview}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {isSavingReview ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    <span>Saving Review to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Review</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Clinical Disclaimer Footer */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-purple-400 font-bold">
          <ShieldAlert className="h-4 w-4" />
          <span>CLINICAL DECISION SUPPORT DISCLAIMER</span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-3xl mx-auto leading-relaxed">
          AI-assisted analysis only. Final interpretation and clinical decisions remain with the dentist.
        </p>
      </div>
    </div>
  );
}
