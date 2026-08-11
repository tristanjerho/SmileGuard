# SmileGuard AI: Cloud Firestore Database Schema Specification

## 1. Overview
SmileGuard AI uses Google Cloud Firestore as its primary document-oriented real-time database. The database consists of 10 collections structured around role-based clinical access.

---

## 2. Collection Schemas

### 1. `users/{userId}`
- `uid`: string (Firebase Auth UID)
- `email`: string
- `FirstName`: string
- `lastName`: string
- `role`: string (`'admin'`, `'dentist'`, `'receptionist'`, `'patient'`)
- `onboardingCompleted`: boolean
- `createdAt`: timestamp

### 2. `patients/{patientId}`
- `uid`: string
- `fullName`: string
- `phone`: string
- `birthDate`: string
- `gender`: string
- `address`: string
- `emergencyContactName`: string
- `emergencyContactPhone`: string
- `medicalHistory`: string
- `allergies`: string
- `onboardingCompleted`: boolean
- `updatedAt`: timestamp

### 3. `appointments/{appointmentId}`
- `userId`: string
- `patientName`: string
- `patientEmail`: string
- `patientPhone`: string
- `service`: string
- `doctor`: string
- `date`: string
- `time`: string
- `status`: string (`'Pending'`, `'Confirmed'`, `'Completed'`, `'Cancelled'`)
- `createdAt`: timestamp

### 4. `treatments/{treatmentId}`
- `userId`: string
- `title`: string
- `doctor`: string
- `note`: string
- `date`: string
- `stage`: string (`'Initial Assessment'`, `'In Progress'`, `'Final Fitting'`, `'Completed'`)
- `createdAt`: timestamp

### 5. `laboratoryRecords/{recordId}`
- `patientName`: string
- `applianceType`: string
- `labVendor`: string
- `targetDate`: string
- `notes`: string
- `status`: string (`'Pending'`, `'In Production'`, `'Ready for Fitting'`, `'Delivered'`)
- `orderedBy`: string
- `createdAt`: timestamp

### 6. `dentalXrays/{xrayId}`
- `patientId`: string
- `uploadedBy`: string
- `imageUrl`: string
- `uploadedAt`: string
- `analysisStatus`: string (`'Analyzed'`)
- `imageType`: string (`'Dental X-ray'`)

### 7. `aiPredictions/{predictionId}`
- `patientId`: string
- `xrayId`: string
- `prediction`: string
- `confidence`: number
- `heatmapUrl`: string
- `overlayUrl`: string
- `modelVersion`: string
- `createdAt`: string

### 8. `dentistReviews/{reviewId}`
- `patientId`: string
- `xrayId`: string
- `predictionId`: string
- `dentistId`: string
- `reviewed`: boolean
- `clinicalInterpretation`: string
- `finalDecision`: string
- `notes`: string
- `reviewedAt`: string

### 9. `notifications/{notificationId}`
- `userId`: string
- `type`: string
- `title`: string
- `body`: string
- `unread`: boolean
- `createdAt`: timestamp

### 10. `activityLogs/{logId}`
- `userId`: string
- `action`: string
- `details`: string
- `timestamp`: timestamp
