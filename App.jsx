import React, { useState, useEffect, useRef } from 'react';
import {
    UserCircle,
    Calendar,
    Activity,
    Bell,
    LogOut,
    Shield,
    Menu,
    X,
} from 'lucide-react';
import { auth, db } from './src/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import AiDiagnostic from './AiDiagnostic';
import AppointmentsQueue from './AppointmentsQueue';
import BookAppointment from './BookAppointment';
import DentistDashboard from './src/DentistDashboard';
import PatientProfileCard from './src/PatientProfileCard';
import PatientTreatmentHistory from './src/PatientTreatmentHistory';
import PatientNotifications from './src/PatientNotifications';
import MyAppointments from './src/MyAppointments';
import PatientLoginPage from './src/components/auth/PatientLoginPage';
import AdminLoginPage from './src/components/admin/AdminLoginPage';
import AdminPortal from './src/components/admin/AdminPortal';
import PatientPortal from './src/components/patient/PatientPortal';
import PortalSelectionLanding from './src/components/auth/PortalSelectionLanding';
import OnboardingFormPage from './src/components/auth/OnboardingFormPage';
import { syncUserWithFirestore } from './src/services/userService';
import Spinner from './src/components/auth/Spinner';
import PWAStatus from './src/components/PWAStatus';

import MascotLoader from './src/components/common/MascotLoader';

function AppContent() {

    const { currentUser, userProfile, loading, onboardingCompleted, isAdmin, logout, refreshProfile } = useAuth();
    const [isSessionAuthenticated, setIsSessionAuthenticated] = useState(false);
    const [userType, setUserType] = useState('landing');
    const [activeTab, setActiveTab] = useState('My Profile');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [signInMessage, setSignInMessage] = useState('Signing in to SmileGuard AI...');

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } finally {
            setTimeout(() => {
                setIsSessionAuthenticated(false);
                setUserType('landing');
                setIsLoggingOut(false);
            }, 2500);
        }
    };

    const handleAdminAuthenticated = () => {
        setSignInMessage('Signing in to Clinician Workspace...');
        setIsSigningIn(true);
        setTimeout(() => {
            setIsSessionAuthenticated(true);
            setUserType('admin');
            setActiveTab('Dashboard');
            setIsSigningIn(false);
        }, 2500);
    };

    const handlePatientAuthenticated = () => {
        setSignInMessage('Signing in to Patient Portal...');
        setIsSigningIn(true);
        setTimeout(() => {
            setIsSessionAuthenticated(true);
            setUserType('patient');
            setActiveTab('My Profile');
            setIsSigningIn(false);
        }, 2500);
    };

    if (loading) {
        return <MascotLoader message="Initializing SmileGuard AI Workspace..." />;
    }

    if (isLoggingOut) {
        return <MascotLoader message="Signing out safely..." />;
    }

    if (isSigningIn) {
        return <MascotLoader message={signInMessage} />;
    }

    // REQUIRE PORTAL SELECTION / LOGIN FIRST ON EVERY VISIT:
    // If user has not explicitly signed in during this session, render Portal Selection or Login Page
    if (!isSessionAuthenticated) {
        if (userType === 'admin_login') {
            return (
                <AdminLoginPage
                    onAdminAuthenticated={handleAdminAuthenticated}
                    onSwitchToPatientPortal={() => setUserType('patient_login')}
                />
            );
        }

        if (userType === 'patient_login') {
            return (
                <PatientLoginPage
                    onAuthenticated={handlePatientAuthenticated}
                    onCancel={() => setUserType('landing')}
                    onSwitchToAdmin={() => setUserType('admin_login')}
                />
            );
        }

        // Default: Render Portal Selection Landing Page (Choose whether Patient or Admin)
        return (
            <PortalSelectionLanding
                onSelectDentistPortal={() => setUserType('admin_login')}
                onSelectPatientPortal={() => setUserType('patient_login')}
            />
        );
    }

    // Render Admin Workspace (for Dentist/Admin accounts)
    if (currentUser && (userType === 'admin' || isAdmin)) {
        return <AdminPortal adminUser={currentUser} onLogout={handleLogout} />;
    }

    // MANDATORY ONBOARDING FLOW FOR PATIENTS:
    // If logged in as patient but onboarding is incomplete, block workspace and render OnboardingFormPage
    if (currentUser && !isAdmin && !onboardingCompleted) {
        return (
            <OnboardingFormPage
                onLogout={handleLogout}
                onCompleted={async () => {
                    await refreshProfile();
                    setUserType('patient');
                    setActiveTab('My Profile');
                }}
            />
        );
    }

    // Render Standalone Patient Workspace (Matches AdminPortal Architecture)
    return (
        <PatientPortal
            patientUser={currentUser}
            userProfile={userProfile}
            onLogout={handleLogout}
        />
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
            <PWAStatus />
        </AuthProvider>
    );
}

