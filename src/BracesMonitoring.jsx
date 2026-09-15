import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  Activity,
  Edit3,
  X,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Spinner from './components/auth/Spinner';

export default function BracesMonitoring() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State for updating patient orthodontic progress
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editStage, setEditStage] = useState('Stage 4 of 6');
  const [editProgress, setEditProgress] = useState(65);
  const [editTimeline, setEditTimeline] = useState('Target: 6 months remaining');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time Firestore patients collection
    const unsubscribePatients = onSnapshot(
      collection(db, 'patients'),
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const fullName =
            data.fullName ||
            `${data.FirstName || ''} ${data.lastName || ''}`.trim() ||
            data.email ||
            'Anonymous Patient';
          
          fetched.push({
            id: docSnap.id,
            name: fullName,
            email: data.email || '',
            phone: data.phone || '',
            timeline: data.timeline || 'Target: 6 months remaining',
            lastAdjustment: data.updatedAt?.toDate
              ? `Updated ${data.updatedAt.toDate().toLocaleDateString()}`
              : (data.lastAdjustment || 'Recently updated'),
            stage: data.stage || 'Stage 4 of 6',
            progress: typeof data.progress === 'number' ? data.progress : 65,
          });
        });

        // Also fallback/merge from users collection if patients collection is sparse
        if (fetched.length === 0) {
          const unsubscribeUsers = onSnapshot(
            collection(db, 'users'),
            (userSnap) => {
              const userFetched = [];
              userSnap.forEach((uDoc) => {
                const uData = uDoc.data();
                if (uData.role === 'patient' || !uData.role) {
                  const name =
                    uData.fullName ||
                    `${uData.FirstName || ''} ${uData.lastName || ''}`.trim() ||
                    uData.email;

                  userFetched.push({
                    id: uDoc.id,
                    name: name || 'Patient User',
                    email: uData.email || '',
                    phone: uData.phone || '',
                    timeline: uData.timeline || 'Target: 6 months remaining',
                    lastAdjustment: 'Registered patient',
                    stage: uData.stage || 'Stage 3 of 6',
                    progress: uData.progress || 50,
                  });
                }
              });
              setPatients(userFetched);
              setLoading(false);
            },
            (err) => {
              console.error('Error fetching users:', err);
              setLoading(false);
            }
          );
          return () => unsubscribeUsers();
        } else {
          setPatients(fetched);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching patients for Braces Monitoring:', err);
        setLoading(false);
      }
    );

    return () => unsubscribePatients();
  }, []);

  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setEditStage(patient.stage || 'Stage 4 of 6');
    setEditProgress(patient.progress || 65);
    setEditTimeline(patient.timeline || 'Target: 6 months remaining');
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsUpdating(true);
    try {
      if (db) {
        // Update both patients & users collections in Firestore
        const patientRef = doc(db, 'patients', selectedPatient.id);
        await updateDoc(patientRef, {
          stage: editStage,
          progress: Number(editProgress),
          timeline: editTimeline,
          updatedAt: serverTimestamp(),
        }).catch(() => {});

        const userRef = doc(db, 'users', selectedPatient.id);
        await updateDoc(userRef, {
          stage: editStage,
          progress: Number(editProgress),
          timeline: editTimeline,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }

      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedPatient.id
            ? {
                ...p,
                stage: editStage,
                progress: Number(editProgress),
                timeline: editTimeline,
                lastAdjustment: 'Just now',
              }
            : p
        )
      );

      setSuccessToast(`Orthodontic progress updated for ${selectedPatient.name}!`);
      setSelectedPatient(null);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err) {
      console.error('Error updating patient progress:', err);
      alert('Failed to update patient progress in Firestore.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9E5F5] pb-5">
        <div>
          <h2 className="text-2xl font-black text-[#263238] flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-[#8B5CF6]" />
            Braces & Orthodontic Monitoring
          </h2>
          <p className="text-xs font-medium text-[#667085] mt-1">
            Real-time orthodontic patient tracking synced directly with Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[#F0ECFF] border border-[#E9E5F5] px-3.5 py-1.5 text-xs font-bold text-[#6D5AE6] shadow-xs">
          <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
          <span>{patients.length} Active Patients</span>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E9E5F5] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] shadow-xs"
          />
        </div>
      </div>

      {/* Patients Monitoring Card Container */}
      <div className="rounded-2xl border border-[#E9E5F5] bg-white shadow-xl shadow-purple-900/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-3">
            <Spinner size="md" className="text-[#8B5CF6] mx-auto" />
            <p>Loading active patient cases from Cloud Firestore...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-3">
            <AlertCircle className="h-10 w-10 text-purple-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No active orthodontic patient cases found.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? `No patients match "${searchTerm}".`
                : 'Registered patients from Cloud Firestore will automatically appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-purple-100">
            {filteredPatients.map((patient) => {
              const initials = patient.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={patient.id}
                  className="flex flex-col gap-4 px-6 py-5 hover:bg-[#F7F5FF]/50 transition-colors lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0ECFF] border border-[#E9E5F5] text-sm font-bold text-[#6D5AE6]">
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
                      <p className="text-xs font-semibold text-[#6D5AE6]">{patient.timeline}</p>
                      <p className="text-[11px] text-slate-400">{patient.lastAdjustment}</p>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span className="font-bold text-slate-800">{patient.stage}</span>
                      <span className="font-bold text-[#6D5AE6]">{patient.progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden border border-[#E9E5F5]">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D5AE6] transition-all duration-500"
                        style={{ width: `${Math.min(Math.max(patient.progress, 5), 100)}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(patient)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F0ECFF] hover:bg-purple-100 text-[#6D5AE6] font-bold text-xs border border-[#E9E5F5] transition-all shrink-0 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Update Stage</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Orthodontic Stage Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E9E5F5] p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Edit3 className="h-4 w-4 text-[#8B5CF6]" />
                <span>Update Orthodontic Progress</span>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  disabled
                  value={selectedPatient.name}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Treatment Stage</label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5F5] bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                >
                  <option value="Stage 1 of 6">Stage 1 of 6 (Initial Archwire)</option>
                  <option value="Stage 2 of 6">Stage 2 of 6 (Alignment & Levelling)</option>
                  <option value="Stage 3 of 6">Stage 3 of 6 (Bite Correction)</option>
                  <option value="Stage 4 of 6">Stage 4 of 6 (Space Closure)</option>
                  <option value="Stage 5 of 6">Stage 5 of 6 (Finishing & Detailing)</option>
                  <option value="Stage 6 of 6">Stage 6 of 6 (Retainer Fitting)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Overall Completion Progress ({editProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(e.target.value)}
                  className="w-full accent-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Timeline Goal</label>
                <input
                  type="text"
                  value={editTimeline}
                  onChange={(e) => setEditTimeline(e.target.value)}
                  placeholder="e.g. Target: 4 months remaining"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E9E5F5] bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 rounded-xl border border-[#E9E5F5] text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isUpdating ? <Spinner size="sm" className="text-white" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Save Progress Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
