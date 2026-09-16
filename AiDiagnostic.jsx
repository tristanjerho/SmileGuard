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
  FileWarning,
  Cloud,
  ExternalLink,
  RefreshCw,
  Clock
} from 'lucide-react';
import { db } from './src/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';
import Spinner from './src/components/auth/Spinner';
import { API_ENDPOINTS, API_BASE_URL } from './src/config/api';
import { uploadToCloudinary } from './src/services/cloudinaryService';

export default function AiDiagnostic() {
  const fileInputRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');

  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [detectedModality, setDetectedModality] = useState('');
  const [rejectedPreviewUrl, setRejectedPreviewUrl] = useState(null);
  const [rejectedFileName, setRejectedFileName] = useState('');

  // Cloudinary CDN Upload State
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [isCloudinaryUploading, setIsCloudinaryUploading] = useState(false);
  const [cloudinaryError, setCloudinaryError] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isWakingService, setIsWakingService] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiError, setApiError] = useState('');

  // Dentist Review Form & Viewer State
  const [hasReviewedAiOutput, setHasReviewedAiOutput] = useState(false);
  const [clinicalInterpretation, setClinicalInterpretation] = useState('');
  const [finalClinicalDecision, setFinalClinicalDecision] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewSavedSuccess, setReviewSavedSuccess] = useState(false);

  // X-Ray Image Viewer Controls
  const [viewerTab, setViewerTab] = useState('overlay'); // 'original' | 'gradcam' | 'overlay'
  const [zoomScale, setZoomScale] = useState(1);

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
   * Strictly verifies radiological characteristics:
   * Rejects: Intraoral photos, Selfies / Color photos, General photos, Documents, Blank images
   * Supports: Panoramic X-ray, Bitewing X-ray, Periapical X-ray
   */
  const validateXrayImage = (file) => {
    return new Promise((resolve) => {
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'jfif', 'pjpeg', 'pjp', 'tif', 'tiff'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        return resolve({
          valid: false,
          isModalityError: false,
          category: 'Unsupported File Format',
          message: `File format '.${ext}' is not supported. Please upload JPG, JPEG, PNG, WEBP, or BMP images.`
        });
      }

      if (file.size > 25 * 1024 * 1024) {
        return resolve({
          valid: false,
          isModalityError: false,
          category: 'File Size Exceeded',
          message: 'File size exceeds the maximum allowed limit of 25MB.'
        });
      }
      if (file.size < 1 * 1024) {
        return resolve({
          valid: false,
          isModalityError: false,
          category: 'File Too Small',
          message: 'File size is too small (under 1KB).'
        });
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        if (img.width < 80 || img.height < 80) {
          return resolve({
            valid: false,
            isModalityError: false,
            category: 'Resolution Too Low',
            message: `Image resolution (${img.width}x${img.height}px) is too low. Dental radiographs require at least 80x80px.`
          });
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sampleDim = 200;
        canvas.width = Math.min(img.width, sampleDim);
        canvas.height = Math.min(img.height, sampleDim);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let totalDiff = 0;
        let totalSat = 0;
        let coloredPixels = 0;
        let oralTonePixels = 0;
        let skinTonePixels = 0;
        let extremePixels = 0;
        let sumLum = 0;
        let sumLumSq = 0;
        const pixelCount = imgData.length / 4;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          const diff = (Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r)) / 3;
          totalDiff += diff;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          totalSat += sat;

          if (sat > 0.15 && diff > 8) {
            coloredPixels++;
          }

          if (r > 60 && r > (g + 18) && r > (b + 14)) {
            oralTonePixels++;
          }

          if (r > 90 && g > 40 && b > 20 && (max - min) > 15 && r > g && g > b) {
            skinTonePixels++;
          }

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          sumLum += lum;
          sumLumSq += lum * lum;
          if (lum < 15 || lum > 240) {
            extremePixels++;
          }
        }

        const meanDiff = totalDiff / pixelCount;
        const meanSat = (totalSat / pixelCount) * 100;
        const coloredRatio = coloredPixels / pixelCount;
        const oralRatio = oralTonePixels / pixelCount;
        const skinRatio = skinTonePixels / pixelCount;
        const extremeRatio = extremePixels / pixelCount;
        const meanLum = sumLum / pixelCount;
        const stdDevLum = Math.sqrt(Math.max(0, (sumLumSq / pixelCount) - (meanLum * meanLum)));

        if (meanSat > 9.0 || meanDiff > 6.5 || coloredRatio > 0.025) {
          let detectedType = 'General photos';
          if (oralRatio > 0.06) {
            detectedType = 'Intraoral photos';
          } else if (skinRatio > 0.06) {
            detectedType = 'Selfies / Color photos';
          }

          return resolve({
            valid: false,
            isModalityError: true,
            category: detectedType,
            message: `The uploaded image was identified as an unsupported ${detectedType.toLowerCase().replace(/s$/, '')}. SmileGuard AI strictly requires radiological dental X-rays.`,
            stats: `Color saturation: ${meanSat.toFixed(1)}%, Chroma divergence: ${meanDiff.toFixed(1)}`
          });
        }

        if (stdDevLum < 9.0) {
          return resolve({
            valid: false,
            isModalityError: true,
            category: 'Blank / Low-contrast image',
            message: 'The uploaded file has insufficient radiographic contrast or is blank. Please provide a clear dental X-ray.'
          });
        }

        if (extremeRatio > 0.75) {
          return resolve({
            valid: false,
            isModalityError: true,
            category: 'General photos / Documents',
            message: 'Detected document, text scan, or high-contrast line art rather than a dental radiograph.'
          });
        }

        const aspectRatio = img.width / img.height;
        let subModality = 'Dental X-Ray';
        if (aspectRatio >= 1.55) {
          subModality = 'Panoramic X-ray (OPG)';
        } else if (aspectRatio >= 1.15) {
          subModality = 'Bitewing X-ray';
        } else {
          subModality = 'Periapical X-ray';
        }

        return resolve({
          valid: true,
          modality: subModality
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          valid: false,
          isModalityError: false,
          category: 'Corrupted File',
          message: 'Failed to read image file. The file may be damaged or corrupted.'
        });
      };

      img.src = objectUrl;
    });
  };

  const performCloudinaryUpload = async (fileToUpload) => {
    const targetFile = fileToUpload || uploadedFile;
    if (!targetFile) return null;

    setIsCloudinaryUploading(true);
    setCloudinaryError('');
    try {
      const res = await uploadToCloudinary(targetFile, 'dental_xrays');
      setCloudinaryUrl(res.url);
      return res.url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      setCloudinaryError(err.message || 'Failed to upload image to Cloudinary.');
      return null;
    } finally {
      setIsCloudinaryUploading(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    setValidationError(null);
    setApiError('');
    setAnalysisResult(null);
    setHasReviewedAiOutput(false);
    setClinicalInterpretation('');
    setFinalClinicalDecision('');
    setReviewSavedSuccess(false);
    setRejectedPreviewUrl(null);
    setRejectedFileName('');
    setCloudinaryUrl('');
    setCloudinaryError('');

    const validation = await validateXrayImage(file);
    if (!validation.valid) {
      setUploadedFile(null);
      setImagePreviewUrl(null);
      setDetectedModality('');
      setRejectedPreviewUrl(URL.createObjectURL(file));
      setRejectedFileName(file.name);
      setValidationError(validation);
      return;
    }

    setUploadedFile(file);
    setDetectedModality(validation.modality || 'Dental X-Ray');
    setImagePreviewUrl(URL.createObjectURL(file));

    performCloudinaryUpload(file);
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedFile) {
      setValidationError({
        valid: false,
        isModalityError: false,
        category: 'Missing File',
        message: 'Please select a valid Dental X-ray image first.'
      });
      return;
    }

    setIsAnalyzing(true);
    setIsWakingService(false);
    setApiError('');
    setValidationError(null);
    setAnalysisResult(null);

    const wakingTimer = setTimeout(() => {
      setIsWakingService(true);
    }, 8000);

    let cUrl = cloudinaryUrl;
    if (!cUrl) {
      cUrl = await performCloudinaryUpload(uploadedFile);
    }

    const formData = new FormData();
    formData.append('file', uploadedFile);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(API_ENDPOINTS.predict, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearTimeout(wakingTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const detail = errData.detail || `Server returned error ${response.status}`;

        if (typeof detail === 'string' && (detail.includes('Unsupported image modality') || detail.includes('Not Supported'))) {
          let category = 'General photos';
          if (detail.includes('Intraoral')) category = 'Intraoral photos';
          else if (detail.includes('Selfie')) category = 'Selfies / Color photos';

          setValidationError({
            valid: false,
            isModalityError: true,
            category,
            message: detail,
          });
          setRejectedPreviewUrl(imagePreviewUrl);
          setRejectedFileName(uploadedFile?.name || 'Uploaded File');
          setUploadedFile(null);
          setImagePreviewUrl(null);
          return;
        }

        setApiError('AI analysis unavailable — the model service could not be reached. No analysis was performed.');
        setAnalysisResult(null);
        return;
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      clearTimeout(timeoutId);
      clearTimeout(wakingTimer);
      setApiError('AI analysis unavailable — the model service could not be reached. No analysis was performed.');
      setAnalysisResult(null);
    } finally {
      clearTimeout(wakingTimer);
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
      setIsWakingService(false);
    }
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!analysisResult?.prediction) {
      alert('Dentist review disabled — a successful AI analysis is required before a review can be documented and saved.');
      return;
    }
    if (!hasReviewedAiOutput) {
      alert('Please confirm "Reviewed AI output" checkbox before saving.');
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
        const savedImageUrl = cloudinaryUrl || imagePreviewUrl || 'xray_image_url';

        const xrayDocRef = await addDoc(collection(db, 'dentalXrays'), {
          patientId: patientId,
          uploadedBy: 'Dr. Ana Santos',
          imageUrl: savedImageUrl,
          cloudinaryUrl: cloudinaryUrl || null,
          uploadedAt: nowIso,
          analysisStatus: 'Analyzed',
          imageType: 'Dental X-ray',
          createdAt: serverTimestamp(),
        });

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

  // Compute current step: 1 (Upload), 2 (Analyzing), 3 (Reviewing)
  const currentStep = analysisResult ? 3 : isAnalyzing ? 2 : 1;

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto font-sans bg-[#FFFFFF]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 rounded-[20px] bg-gradient-to-r from-[#FFFFFF] via-[#F7F5FF] to-[#FFFFFF] border border-[#E9E5F5] shadow-[0_4px_20px_rgba(100,80,180,0.06)] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0ECFF] border border-[#E9E5F5] text-[#6D5AE6] text-xs font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
            <span>AI Dental Workstation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#263238] tracking-tight">
            AI Diagnostic Workstation
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] font-medium mt-1">
            AI-assisted dental X-ray analysis for clinical decision support.
          </p>
        </div>

        {/* 01 Upload X-ray -> 02 AI Analysis -> 03 Review Results Workflow Stepper */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#F7F5FF] p-2 rounded-[16px] border border-[#E9E5F5] self-start sm:self-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${currentStep >= 1 ? 'bg-[#FFFFFF] text-[#6D5AE6] shadow-xs border border-[#E9E5F5]' : 'text-[#667085]'}`}>
            <span className="h-5 w-5 rounded-full bg-[#F0ECFF] text-[#8B5CF6] text-[11px] font-black flex items-center justify-center">01</span>
            <span>Upload</span>
          </div>
          <span className="text-[#667085] text-xs font-bold">&rarr;</span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${currentStep >= 2 ? 'bg-[#FFFFFF] text-[#6D5AE6] shadow-xs border border-[#E9E5F5]' : 'text-[#667085]'}`}>
            <span className="h-5 w-5 rounded-full bg-[#F0ECFF] text-[#8B5CF6] text-[11px] font-black flex items-center justify-center">02</span>
            <span>AI Analysis</span>
          </div>
          <span className="text-[#667085] text-xs font-bold">&rarr;</span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${currentStep >= 3 ? 'bg-[#FFFFFF] text-[#6D5AE6] shadow-xs border border-[#E9E5F5]' : 'text-[#667085]'}`}>
            <span className="h-5 w-5 rounded-full bg-[#F0ECFF] text-[#8B5CF6] text-[11px] font-black flex items-center justify-center">03</span>
            <span>Review</span>
          </div>
        </div>
      </div>

      {/* Main Upload Input Card */}
      <div className="bg-[#FFFFFF] border border-[#E9E5F5] rounded-[20px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(100,80,180,0.06)] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#667085] mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-[#8B5CF6]" />
              <span>Select Patient Record</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={handlePatientChange}
              className="w-full px-4 py-3 rounded-[12px] border border-[#E9E5F5] bg-[#F7F5FF] text-xs font-bold text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
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
          <div className="p-4 rounded-[14px] bg-[#F7F5FF] border border-[#E9E5F5] text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#6D5AE6]">
              <Scan className="h-4 w-4 text-[#8B5CF6]" />
              <span>Radiological Modality Guide</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-bold text-emerald-700 block mb-0.5">Supported X-Rays:</span>
                <ul className="space-y-0.5 text-[#263238] font-semibold">
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Panoramic X-ray (OPG)</span>
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
                <span className="font-bold text-rose-600 block mb-0.5">Not Supported:</span>
                <ul className="space-y-0.5 text-[#667085] font-semibold">
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
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#667085]">
            Upload Dental Radiograph
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
            className="border-2 border-dashed border-[#E9E5F5] hover:border-[#8B5CF6] bg-[#F7F5FF]/50 hover:bg-[#F0ECFF]/30 rounded-[18px] p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer group"
          >
            <div className="h-14 w-14 rounded-2xl bg-[#F0ECFF] text-[#8B5CF6] border border-[#E9E5F5] flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#263238]">Drag and drop your dental X-ray here</p>
              <p className="text-xs text-[#667085] mt-1">Supported formats: JPG, PNG, DICOM, WEBP, BMP (Max 25MB)</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="cursor-pointer px-6 py-2.5 bg-[#8B5CF6] hover:bg-[#6D5AE6] text-white font-bold text-xs rounded-[11px] shadow-sm transition-all inline-flex items-center gap-2"
            >
              <span>Select Dental X-Ray</span>
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

        {/* Modality Validation Error Alert */}
        {validationError && (
          <div className="p-6 rounded-[18px] bg-rose-50/70 border border-rose-200 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-rose-600 text-white shadow-xs shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                      Modality Error
                    </span>
                    {validationError.category && (
                      <span className="text-xs font-bold text-rose-950 bg-rose-200/70 px-2 py-0.5 rounded-md">
                        Detected: {validationError.category}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-[#263238]">
                    Unsupported Image Modality (Not a Dental X-Ray)
                  </h4>
                  <p className="text-xs text-[#667085] leading-relaxed font-medium">
                    {validationError.message || 'SmileGuard AI strictly accepts radiological dental X-rays only.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setRejectedPreviewUrl(null);
                  setRejectedFileName('');
                }}
                className="text-[#667085] hover:text-[#263238] p-1.5 rounded-lg hover:bg-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Live Upload Preview & Trigger Button */}
        {imagePreviewUrl && !validationError && (
          <div className="p-4 rounded-[16px] bg-[#F7F5FF] border border-[#E9E5F5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={imagePreviewUrl}
                alt="Selected X-ray preview"
                className="h-16 w-16 object-cover rounded-xl border border-[#E9E5F5] shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#263238]">{uploadedFile?.name || 'xray.png'}</p>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>{detectedModality || 'Dental X-Ray'}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-[10px] text-[#667085] font-mono">
                    {(uploadedFile?.size ? uploadedFile.size / 1024 : 120).toFixed(1)} KB • Validated Radiological Modality
                  </p>

                  {isCloudinaryUploading && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F0ECFF] text-[#6D5AE6] border border-[#E9E5F5] flex items-center gap-1 animate-pulse">
                      <Spinner size="xs" className="text-[#8B5CF6]" />
                      <span>Uploading to Cloudinary CDN...</span>
                    </span>
                  )}

                  {cloudinaryUrl && (
                    <a
                      href={cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFFFFF] hover:bg-[#F7F5FF] text-[#6D5AE6] border border-[#E9E5F5] flex items-center gap-1 transition-colors"
                    >
                      <Cloud className="h-3 w-3 text-[#8B5CF6]" />
                      <span>Stored on Cloudinary</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyzeImage}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-3 bg-[#8B5CF6] hover:bg-[#6D5AE6] text-white font-bold text-xs rounded-[11px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Analyzing Dental Image...</span>
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4" />
                  <span>Analyze X-Ray</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>AI Service Notice</span>
            </div>
            <p className="text-[#263238] font-semibold pl-6">{apiError}</p>
          </div>
        )}
      </div>

      {/* Polished Skeleton Loading State during AI Analysis */}
      {isAnalyzing && (
        <div className="p-8 rounded-[20px] bg-[#FFFFFF] border border-[#E9E5F5] shadow-[0_4px_20px_rgba(100,80,180,0.06)] text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-[#F0ECFF] text-[#8B5CF6] flex items-center justify-center mx-auto animate-pulse">
            <Spinner size="md" className="text-[#8B5CF6]" />
          </div>
          <h3 className="text-base font-bold text-[#263238]">Analyzing Dental X-Ray...</h3>
          <p className="text-xs text-[#667085] max-w-md mx-auto leading-relaxed">
            Running EfficientNetB0 feature extraction and generating Grad-CAM visual attention overlays for clinician review.
          </p>
          {isWakingService && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold max-w-md mx-auto flex items-center justify-center gap-2 animate-fade-in">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Waking the AI service, this can take up to a minute on first use...</span>
            </div>
          )}
          <div className="max-w-md mx-auto space-y-2 pt-2">
            <div className="h-2 w-full bg-[#F7F5FF] rounded-full overflow-hidden">
              <div className="h-full bg-[#8B5CF6] rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Professional AI Results Layout */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Highlight Banner: Requires Dentist Review */}
          <div className="p-4 rounded-[16px] bg-[#F0ECFF] border border-[#E9E5F5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-[#6D5AE6]">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-[#8B5CF6]" />
              <span className="text-sm font-black">Requires Dentist Review</span>
            </div>
            <span className="text-[11px] text-[#667085] font-semibold bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#E9E5F5]">
              AI-assisted probabilistic findings • Final clinical decision rests with dentist
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Professional X-Ray Viewer with Tabs & Controls */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E9E5F5] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(100,80,180,0.06)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9E5F5] pb-4">
                <div className="flex items-center gap-2">
                  <Scan className="h-4 w-4 text-[#8B5CF6]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Dental X-Ray Viewer
                  </h3>
                </div>

                {/* View Tabs: Original | Grad-CAM | Overlay */}
                <div className="flex items-center gap-1 bg-[#F7F5FF] p-1 rounded-xl border border-[#E9E5F5]">
                  {[
                    { id: 'original', label: 'Original' },
                    { id: 'gradcam', label: 'Grad-CAM' },
                    { id: 'overlay', label: 'Overlay' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setViewerTab(t.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        viewerTab === t.id
                          ? 'bg-[#FFFFFF] text-[#6D5AE6] shadow-xs border border-[#E9E5F5]'
                          : 'text-[#667085] hover:text-[#263238]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Viewer Display Stage */}
              <div className="relative aspect-video rounded-[14px] bg-[#000000] flex items-center justify-center overflow-hidden border border-[#E9E5F5] group">
                <img
                  src={
                    viewerTab === 'original'
                      ? (cloudinaryUrl || imagePreviewUrl)
                      : viewerTab === 'gradcam'
                      ? (analysisResult.heatmap || analysisResult.overlay || imagePreviewUrl)
                      : (analysisResult.overlay || imagePreviewUrl)
                  }
                  alt="Dental X-ray radiological view"
                  className="max-h-72 object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomScale})` }}
                />

                {/* Viewer Tools Controls (Zoom, Reset, Fit) */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#FFFFFF]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#E9E5F5] shadow-xs">
                  <button
                    onClick={() => setZoomScale((z) => Math.min(z + 0.25, 2.5))}
                    className="p-1.5 rounded-lg text-[#263238] hover:bg-[#F7F5FF] font-bold text-xs"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomScale((z) => Math.max(z - 0.25, 0.75))}
                    className="p-1.5 rounded-lg text-[#263238] hover:bg-[#F7F5FF] font-bold text-xs"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setZoomScale(1)}
                    className="px-2 py-1 rounded-lg text-[#667085] hover:bg-[#F7F5FF] text-[10px] font-bold"
                  >
                    Reset Fit
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#667085] font-medium leading-relaxed bg-[#F7F5FF] p-3 rounded-xl border border-[#E9E5F5]">
                {viewerTab === 'gradcam' || viewerTab === 'overlay'
                  ? 'Highlighted Grad-CAM heatmaps indicate anatomical regions that contributed most to the model inference.'
                  : 'Original radiological radiograph viewer for anatomical inspection.'}
              </p>
            </div>

            {/* Right Column (5 cols): AI Prediction & Probability Bars */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#FFFFFF] border border-[#E9E5F5] rounded-[20px] p-6 shadow-[0_4px_20px_rgba(100,80,180,0.06)] space-y-5">
                <div className="border-b border-[#E9E5F5] pb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    AI PREDICTION RESULTS
                  </h3>
                  <span className="text-[10px] font-bold bg-[#F0ECFF] text-[#6D5AE6] px-2.5 py-0.5 rounded-full border border-[#E9E5F5]">
                    EfficientNetB0
                  </span>
                </div>

                {/* Primary Prediction Output Card */}
                <div className="p-4 rounded-[16px] bg-[#F7F5FF] border border-[#E9E5F5] space-y-1">
                  <p className="text-[10px] font-bold uppercase text-[#6D5AE6]">Top Probabilistic Finding</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-[#263238]">{analysisResult.prediction}</p>
                    <span className="text-lg font-black text-[#8B5CF6]">
                      {typeof analysisResult.confidence === 'number'
                        ? (analysisResult.confidence <= 1.0 ? (analysisResult.confidence * 100).toFixed(1) : analysisResult.confidence.toFixed(1))
                        : analysisResult.confidence}%
                    </span>
                  </div>
                </div>

                {/* Probability Breakdown Progress Bars */}
                <div className="space-y-3 pt-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    CLASS PROBABILITIES BREAKDOWN
                  </p>
                  <div className="space-y-3">
                    {['Dental Caries', 'Impacted Teeth', 'Infection'].map((cName, idx) => {
                      let pctVal = 0;
                      if (analysisResult.probabilities && analysisResult.probabilities[cName] !== undefined) {
                        const raw = analysisResult.probabilities[cName];
                        pctVal = raw <= 1.0 ? raw * 100 : raw;
                      } else if (analysisResult.rawVector && analysisResult.rawVector[idx] !== undefined) {
                        const raw = analysisResult.rawVector[idx];
                        pctVal = raw <= 1.0 ? raw * 100 : raw;
                      } else {
                        const isPredictionMatch =
                          cName === analysisResult.prediction ||
                          (analysisResult.prediction && analysisResult.prediction.toLowerCase().includes(cName.toLowerCase())) ||
                          (cName === 'Dental Caries' && analysisResult.prediction && analysisResult.prediction.toLowerCase().includes('cavity'));

                        if (isPredictionMatch) {
                          const confNum = typeof analysisResult.confidence === 'number' ? analysisResult.confidence : parseFloat(analysisResult.confidence);
                          pctVal = confNum <= 1.0 ? confNum * 100 : confNum;
                        }
                      }

                      const pctStr = pctVal.toFixed(2);
                      const isTop =
                        cName === analysisResult.prediction ||
                        (analysisResult.prediction && analysisResult.prediction.toLowerCase().includes(cName.toLowerCase())) ||
                        (cName === 'Dental Caries' && analysisResult.prediction && analysisResult.prediction.toLowerCase().includes('cavity'));

                      return (
                        <div key={cName} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className={isTop ? 'text-[#6D5AE6] font-extrabold flex items-center gap-1.5' : 'text-[#263238]'}>
                              {cName}
                              {isTop && (
                                <span className="text-[9px] bg-[#8B5CF6] text-white font-bold px-1.5 py-0.5 rounded">
                                  Top Output
                                </span>
                              )}
                            </span>
                            <span className={isTop ? 'text-[#8B5CF6] font-extrabold' : 'text-[#667085]'}>
                              {pctStr}%
                            </span>
                          </div>
                          <div className="w-full bg-[#F7F5FF] rounded-full h-2.5 overflow-hidden border border-[#E9E5F5]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isTop ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D5AE6]' : 'bg-[#D8CFFC]'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, pctVal))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Radiological Findings & Recommended Actions */}
                {analysisResult.findings && analysisResult.findings.length > 0 && (
                  <div className="pt-3 border-t border-[#E9E5F5] space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                      KEY RADIOLOGICAL OBSERVATIONS
                    </p>
                    <ul className="space-y-1.5 text-xs text-[#263238]">
                      {analysisResult.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                          <span className="font-medium leading-relaxed">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Dentist Review Form */}
          <div className="bg-[#FFFFFF] border border-[#E9E5F5] rounded-[20px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(100,80,180,0.06)] space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#263238] border-b border-[#E9E5F5] pb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#8B5CF6]" />
              <span>DENTIST CLINICAL REVIEW & FINAL DECISION</span>
            </h3>

            {!analysisResult?.prediction && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Dentist Review disabled — a successful AI analysis is required before a review can be documented and saved.</span>
              </div>
            )}

            {reviewSavedSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Dentist Review saved and synchronized to Cloud Firestore!</span>
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Checkbox Confirmation */}
              <label
                onClick={() => {
                  if (analysisResult?.prediction) {
                    setHasReviewedAiOutput((prev) => !prev);
                  }
                }}
                className={`flex items-center gap-3 p-4 rounded-[12px] border border-[#E9E5F5] bg-[#F7F5FF] select-none ${
                  analysisResult?.prediction ? 'cursor-pointer hover:bg-[#F0ECFF]' : 'opacity-50 cursor-not-allowed'
                } transition-colors`}
              >
                {hasReviewedAiOutput ? (
                  <CheckSquare className="h-5 w-5 text-[#8B5CF6] shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-[#667085] shrink-0" />
                )}
                <span className="text-xs font-bold text-[#263238]">
                  Reviewed AI output & visual attention region
                </span>
              </label>

              {/* Clinical Interpretation Text Area */}
              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1.5">
                  Clinical Interpretation
                </label>
                <textarea
                  required
                  rows={3}
                  disabled={!analysisResult?.prediction}
                  value={clinicalInterpretation}
                  onChange={(e) => setClinicalInterpretation(e.target.value)}
                  placeholder="Enter detailed radiological and clinical observations..."
                  className="w-full p-3.5 rounded-[12px] border border-[#E9E5F5] bg-[#F7F5FF] text-xs font-medium text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Final Clinical Decision Text Area */}
              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1.5">
                  Final Clinical Decision
                </label>
                <textarea
                  required
                  rows={3}
                  disabled={!analysisResult?.prediction}
                  value={finalClinicalDecision}
                  onChange={(e) => setFinalClinicalDecision(e.target.value)}
                  placeholder="State final diagnosis, treatment plan recommendations, or follow-up procedures..."
                  className="w-full p-3.5 rounded-[12px] border border-[#E9E5F5] bg-[#F7F5FF] text-xs font-medium text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={!analysisResult?.prediction || isSavingReview}
                className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#6D5AE6] text-white font-bold text-xs rounded-[11px] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSavingReview ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    <span>Saving Review...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Dentist Review</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Clinical Disclaimer Footer */}
      <div className="p-4 rounded-[14px] bg-[#F7F5FF] border border-[#E9E5F5] text-[#667085] text-xs text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-[#6D5AE6] font-bold">
          <ShieldAlert className="h-4 w-4 text-[#8B5CF6]" />
          <span>CLINICAL DECISION SUPPORT DISCLAIMER</span>
        </div>
        <p className="text-[11px] text-[#667085] max-w-3xl mx-auto leading-relaxed">
          AI-assisted analysis provides probabilistic findings and visual explanations. Final clinical decisions remain with the dentist.
        </p>
      </div>
    </div>
  );
}

