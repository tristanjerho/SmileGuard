# SmileGuard AI: System Architecture Specification

## 1. Executive System Overview
SmileGuard AI is a professional, modular, 7-layer AI-assisted smart dental clinic management and clinical decision support system. The platform combines real-time administrative workflows with an EfficientNetB0 deep learning CNN image analysis pipeline and Grad-CAM visual explainability.

```
                         SMILEGUARD AI
                              |
              AI-Assisted Smart Dental
                 Clinic Management
                              |
          +-------------------+-------------------+
          |                                       |
          v                                       v
   CLINIC PORTAL                            PATIENT PORTAL
          |                                       |
   +------+------+------+------+             +----+-----+
   |      |      |      |      |             |    |     |
Patients Appointments Treatments Laboratory AI    Records
Records             Monitoring Tracking Assistant Appointments
                                                  Treatment
                                                  History
          |
          v
   APPLICATION SERVICES
          |
   +------+------+------+------+ 
   |      |      |      |      |
Patient Appointment Treatment AI   Notification
Service Service     Service Analysis Service
          |
          +------------------------+
          |                        |
          v                        v
      FIREBASE                 AI SERVICE
          |                        |
  +-------+--------+          +----+---------+
  |       |        |          |              |
 Auth Firestore Storage    FastAPI      TensorFlow
                              |          / Keras
                              |              |
                              |           CNN Model
                              |              |
                              |           Grad-CAM
                              |              |
                              +------+-------+
                                     |
                                     v
                              AI ANALYSIS RESULT
                                     |
                                     v
                              DENTIST REVIEW
                                     |
                                     v
                           FINAL CLINICAL DECISION
                                     |
                                     v
                              PATIENT RECORD
                                     |
                                     v
                              PATIENT PORTAL
```

---

## 2. Layer Specifications

### Layer 1: Clinic Portal
- **Dashboard**: Live patient counts, today's schedule, pending appointments, procedure breakdown, and clinical KPIs.
- **Patients Directory**: Comprehensive patient profile records, medical histories, and emergency contacts.
- **Appointments Queue**: Real-time queue for approving, rejecting, and rescheduling appointments.
- **Treatment Monitoring**: Progress timelines, stage tracking (Initial, In Progress, Completed), and procedure notes.
- **Laboratory Tracking**: Prosthetics work orders, lab vendor management, and target delivery dates (`laboratoryRecords`).
- **Dental Image Assistant**: Clinician workstation for uploading Dental X-rays, running CNN inference, reviewing Grad-CAM attention visualizations, and entering final clinical interpretations.

### Layer 2: Patient Portal
- **Dashboard**: Upcoming appointment countdown, treatment progress, recent notifications.
- **My Appointments**: Real-time 3-step booking wizard, cancellation, and reschedule requests.
- **Treatment History**: Stage-by-stage clinical treatment timeline.
- **Dental Records & X-rays**: View authorized X-rays and patient-accessible summary results.
- **Notifications**: Real-time alert stream.

### Layer 3: Application Services (`src/services/`)
- `authService.js`: Authentication, registration, password resets, role detection.
- `patientService.js`: Onboarding profile persistence and queries.
- `appointmentService.js`: Appointment booking, real-time queues, and status updates.
- `treatmentService.js`: Treatment plan tracking.
- `laboratoryService.js`: Lab work order tracking.
- `xrayService.js`: Firebase Storage upload and X-ray indexing.
- `aiService.js`: FastAPI prediction execution and dentist review persistence.
- `notificationService.js`: Real-time notification streams.

### Layer 4: Firebase Backend
- **Firebase Auth**: Email/Password and Google OAuth sign-in.
- **Cloud Firestore**: 10 collections (`users`, `patients`, `appointments`, `treatments`, `laboratoryRecords`, `dentalXrays`, `aiPredictions`, `dentistReviews`, `notifications`, `activityLogs`).
- **Firebase Storage**: Encrypted bucket for Dental X-rays (`/dentalXrays/{patientId}/...`).

### Layer 5: AI Service & CNN Pipeline
- **Tech Stack**: Python 3.12, FastAPI, TensorFlow/Keras, OpenCV, Pillow, NumPy.
- **Model**: Transfer learning via **EfficientNetB0**.
- **Grad-CAM**: Visual explainability heatmap & overlay output.

### Layer 6: Dentist Review & Decision Workflow
1. Dentist uploads Dental X-ray.
2. FastAPI returns model output, confidence score, and Grad-CAM overlay.
3. Dentist inspects visual attention region.
4. Dentist checks `☐ Reviewed AI output`.
5. Dentist writes Clinical Interpretation and Final Decision.
6. Record saved to Firestore (`dentalXrays`, `aiPredictions`, `dentistReviews`).

### Layer 7: Security & Privacy Layer
- Role-based authorization (`ADMIN`, `DENTIST`, `RECEPTIONIST`, `PATIENT`).
- Patients can strictly read only their own records.
- Encrypted environment variables for Firebase API keys (`.env`).
