import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './context/AuthContext';
import Spinner from './components/auth/Spinner';

export default function PatientTreatmentHistory() {
  const { currentUser } = useAuth();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'treatments'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetched = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Seed initial treatment timeline if patient has no treatment record in Firestore
      if (fetched.length === 0) {
        try {
          const defaultTimeline = [
            {
              userId: currentUser.uid,
              title: 'Bracket Placement',
              doctor: 'Dr. Ana Santos',
              note: 'Upper arch brackets aligned and wire tension adjusted for improved tracking.',
              date: 'May 12, 2026',
              stage: 1,
              createdAt: new Date().toISOString(),
            },
            {
              userId: currentUser.uid,
              title: 'Routine Cleaning',
              doctor: 'Dr. Rhea Navarro',
              note: 'Professional cleaning completed with fluoride application and oral care review.',
              date: 'Apr 02, 2026',
              stage: 2,
              createdAt: new Date().toISOString(),
            },
            {
              userId: currentUser.uid,
              title: 'Adjustment Follow-up',
              doctor: 'Dr. Ana Santos',
              note: 'Patient reported and confirmed comfortable bite alignment after the last adjustment.',
              date: 'Mar 10, 2026',
              stage: 3,
              createdAt: new Date().toISOString(),
            },
          ];

          for (const item of defaultTimeline) {
            await addDoc(collection(db, 'treatments'), item);
          }
        } catch (e) {
          console.error('Error seeding default treatment records:', e);
        }
      } else {
        // Sort by date descending
        fetched.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
        setTreatments(fetched);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching treatment history:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Calculate dynamic progress percentage
  const totalStages = 6;
  const completedStages = Math.min(treatments.length, totalStages);
  const progressPercent = Math.round((completedStages / totalStages) * 100);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-3xl shadow-sm text-slate-500 gap-3">
        <Spinner size="md" className="text-emerald-600" />
        <span className="text-xs font-semibold">Loading treatment history from Firestore...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Overview Progress Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Braces & Dental Progress</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">{progressPercent}% complete</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Stage {completedStages} of {totalStages} completed • Next adjustment reminder: Tomorrow at 10:30 AM
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-700">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Synced Live with Firestore</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            <span>Treatment Timeline</span>
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {treatments.length} {treatments.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="space-y-3">
          {treatments.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200/90 bg-slate-50/40 p-4 shadow-sm hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 font-bold border border-emerald-200">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{item.title}</p>
                      <p className="text-xs font-semibold text-slate-500">{item.doctor || 'Dr. Ana Santos'}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{item.date || 'Recent'}</span>
                  </div>
                  <p className="mt-1 text-xs italic text-slate-600 font-medium leading-relaxed">
                    “{item.note}”
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
