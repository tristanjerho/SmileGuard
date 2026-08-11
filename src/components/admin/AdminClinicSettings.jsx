import React, { useState } from 'react';
import { ShieldCheck, Lock, Activity, Key, Server, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * AdminClinicSettings Component
 * Manages Clinic Configurations, HIPAA Audit Trail, and Firebase Security Rules auditor.
 */
export default function AdminClinicSettings() {
  const [clinicName, setClinicName] = useState('SmileGuard AI Smart Clinic');
  const [contactEmail, setContactEmail] = useState('admin@smileguard.ai');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const auditLogs = [
    { action: 'Admin Role Granted', user: 'dr.ana@smileguard.ai', timestamp: '2026-08-05 08:30 AM', status: 'Passed' },
    { action: 'Cloud Firestore Sync', user: 'patient_session_10024', timestamp: '2026-08-05 08:24 AM', status: 'Passed' },
    { action: 'CNN Radiograph AI Diagnostic Executed', user: 'dr.ana@smileguard.ai', timestamp: '2026-08-05 07:15 AM', status: 'Passed' },
    { action: 'Firebase Auth Token Issued', user: 'maria@example.com', timestamp: '2026-08-05 06:40 AM', status: 'Passed' },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-purple-500" />
          Clinic Workspace & Security Audit Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure clinical parameters, inspect HIPAA audit trails, and manage security policy compliance.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Clinic settings successfully updated!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              General Clinic & AI Workspace Profile
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Administrator Support Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-600/20"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-500" />
              HIPAA Audit & Activity Trail
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">System Event</th>
                    <th className="py-2.5 px-3">User / Identity</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Security</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{log.action}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{log.user}</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Compliance Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-purple-950 border border-purple-800/40 rounded-2xl p-6 shadow-xl text-white space-y-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Lock className="h-5 w-5" />
            </div>

            <h4 className="font-black text-base">Firebase Security Status</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              All client connections utilize TLS 1.3 encryption. Cloud Firestore security rules are strictly configured for tenant isolation.
            </p>

            <div className="pt-2 space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <span>Auth Provider</span>
                <span className="text-emerald-400">Active (v10)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <span>Database Mode</span>
                <span className="text-teal-400">Native Firestore</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                <span>HIPAA Compliance</span>
                <span className="text-purple-300">Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
