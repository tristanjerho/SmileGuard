import React, { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';

/**
 * Top-level Patient Portal Login Page component for SmileGuard AI.
 * Handles system dark mode syncing, state management, and authentication redirects.
 */
export default function PatientLoginPage({ onAuthenticated, onCancel }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    // Check system preference or localStorage
    const userPref = localStorage.getItem('smileguard_theme');
    const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = userPref ? userPref === 'dark' : systemPref;

    setIsDarkMode(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('smileguard_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('smileguard_theme', 'light');
      }
      return next;
    });
  };

  const handleLoginSuccess = (user) => {
    if (onAuthenticated) {
      onAuthenticated(user);
    }
  };

  return (
    <AuthLayout
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      onBackToLanding={onCancel}
    >
      <LoginForm onSuccess={handleLoginSuccess} />
    </AuthLayout>
  );
}
