import React from 'react';
import { X, ShieldCheck, HelpCircle, FileText } from 'lucide-react';

/**
 * HelpModal Component for Privacy Policy, Terms of Service, and Clinic Support.
 */
export default function HelpModal({ type, isOpen, onClose }) {
  if (!isOpen || !type) return null;

  const content = {
    privacy: {
      title: 'SmileGuard AI Privacy Policy',
      icon: ShieldCheck,
      body: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>
            At <strong>SmileGuard AI</strong>, your privacy and health record security are our highest priorities. All patient records, AI diagnostic scans, and appointment details are encrypted using 256-bit AES encryption in accordance with HIPAA data protection standards.
          </p>
          <h4 className="font-bold text-slate-900 dark:text-white pt-2">Data Protection Commitments:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>End-to-end encryption for dental X-rays and clinical logs.</li>
            <li>No biometric or radiograph data is shared with unverified third parties.</li>
            <li>Patients maintain strict control over their diagnostic consent settings.</li>
          </ul>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      body: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>
            By accessing the <strong>SmileGuard AI Patient Portal</strong>, you agree to comply with our health service terms.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>AI Clinical Decision Support outputs serve as recommendations for licensed dental clinicians.</li>
            <li>Patients must provide accurate health history when booking dynamic treatment appointments.</li>
            <li>Unauthorized account access attempts are strictly logged and audited.</li>
          </ul>
        </div>
      ),
    },
    help: {
      title: 'Need Help or Technical Support?',
      icon: HelpCircle,
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>
            If you are experiencing trouble logging into your patient portal or need assistance with your appointment schedule:
          </p>
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1.5">
            <p className="font-bold text-blue-900 dark:text-blue-200">SmileGuard AI Patient Help Desk</p>
            <p>📞 Phone: (800) 555-SMILE</p>
            <p>✉️ Email: support@smileguard.ai</p>
            <p>🕒 Support Hours: Mon–Fri, 8:00 AM – 6:00 PM EST</p>
          </div>
        </div>
      ),
    },
  };

  const selected = content[type] || content.help;
  const ModalIcon = selected.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-slide-up text-left">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg p-1"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <ModalIcon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {selected.title}
          </h3>
        </div>

        <div>{selected.body}</div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
