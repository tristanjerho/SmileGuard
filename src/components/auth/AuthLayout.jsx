import React, { useState } from 'react';
import AuthSplitLayout from './AuthSplitLayout';
import HelpModal from './HelpModal';

/**
 * AuthLayout — Patient Portal authentication wrapper.
 * Delegates layout to the shared AuthSplitLayout component.
 * Adds the patient-specific footer (Privacy / Terms / Help links + HelpModal).
 */
export default function AuthLayout({
  children,
  isDarkMode,
  onToggleDarkMode,
  onBackToLanding,
  onSwitchToAdmin,
}) {
  const [modalType, setModalType] = useState(null);

  const footerContent = (
    <>
      <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-purple-300/70 flex-wrap">
        <button
          type="button"
          onClick={() => setModalType('privacy')}
          className="hover:text-purple-200 transition-colors focus:outline-none focus:underline"
        >
          Privacy Policy
        </button>
        <span aria-hidden="true" className="text-purple-500/40">•</span>
        <button
          type="button"
          onClick={() => setModalType('terms')}
          className="hover:text-purple-200 transition-colors focus:outline-none focus:underline"
        >
          Terms of Service
        </button>
        <span aria-hidden="true" className="text-purple-500/40">•</span>
        <button
          type="button"
          onClick={() => setModalType('help')}
          className="hover:text-purple-200 transition-colors focus:outline-none focus:underline"
        >
          Need Help?
        </button>
      </div>
      <p className="mt-2 text-[11px] text-purple-300/45 font-medium">
        Protected by 256-Bit SSL Encryption • SmileGuard Dental Health Security
      </p>

      {/* Help / Privacy / Terms modal */}
      <HelpModal
        type={modalType}
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
      />
    </>
  );

  return (
    <AuthSplitLayout
      onBack={onBackToLanding}
      leftTitle1="Smarter Insights."
      leftTitle2="Healthier Smiles."
      leftDescription="Streamline dental practice workflows with AI-assisted radiological diagnosis, patient record encryption, and real-time appointment tracking."
      leftBadges={[
        '✨ CNN Dental Radiograph AI',
        '📅 Clinical Appointments Queue',
        '🦷 Orthodontic Milestone Logs',
      ]}
      leftMascotBadge="Smart Radiological Intelligence"
      headerRightLabel="HIPAA Compliant Dental Platform"
      footerLeft="© 2026 SmileGuard AI • Clinical Platform"
      footerRight="v1.2.0"
      footerContent={footerContent}
    >
      {children}
    </AuthSplitLayout>
  );
}
