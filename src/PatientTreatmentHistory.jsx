import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const isSeededMock =
          data.title === 'Bracket Placement & Initial Alignment' ||
          data.title === 'Bracket Placement' ||
          data.title === 'Routine Cleaning & Prophylaxis' ||
          data.title === 'Routine Cleaning' ||
          data.title === 'Adjustment Follow-up' ||
          data.doctor === 'Dr. Rhea Navarro' ||
          (data.note && data.note.includes('Upper arch brackets aligned'));

        if (isSeededMock) {
          // Cleanly purge old seeded mock records from Cloud Firestore
          deleteDoc(doc(db, 'treatments', docSnap.id)).catch((e) =>
            console.warn('Auto-cleanup seeded treatment error:', e)
          );
        } else {
          fetched.push({ id: docSnap.id, ...data });
        }
      });

      fetched.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      setTreatments(fetched);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching treatment history:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const totalStages = 6;
  const completedStages = treatments.length;
  const progressPercent = totalStages > 0 ? Math.min(Math.round((completedStages / totalStages) * 100), 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#FFFFFF] border border-[#E9E5F5] rounded-[20px] shadow-xs text-[#667085] gap-3">
        <Spinner size="md" className="text-[#8B5CF6]" />
        <span className="text-xs font-semibold">Loading treatment history from Firestore...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left bg-[#FFFFFF]">
      {/* Overview Progress Card */}
      <div className="rounded-[20px] border border-[#E9E5F5] bg-[#FFFFFF] p-6 sm:p-8 shadow-[0_4px_20px_rgba(100,80,180,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6D5AE6]">Treatment Progress</p>
            <h2 className="mt-1 text-3xl font-black text-[#263238]">{progressPercent}% complete</h2>
            <p className="mt-1 text-xs font-semibold text-[#667085]">
              {treatments.length > 0 
                ? `Stage ${completedStages} of ${totalStages} completed`
                : 'No active treatment procedures logged yet'}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#F0ECFF] border border-[#E9E5F5] px-4 py-2 text-xs font-bold text-[#6D5AE6] shadow-xs">
            <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
            <span>Synced Live with Firestore</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-3 rounded-full bg-[#F7F5FF] border border-[#E9E5F5] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D5AE6] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="rounded-[20px] border border-[#E9E5F5] bg-[#FFFFFF] p-6 sm:p-8 shadow-[0_4px_20px_rgba(100,80,180,0.06)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E9E5F5] pb-4">
          <h3 className="text-base font-bold text-[#263238] flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#8B5CF6]" />
            <span>Treatment Timeline</span>
          </h3>
          <span className="text-xs font-bold text-[#6D5AE6] bg-[#F0ECFF] px-3 py-1 rounded-full border border-[#E9E5F5]">
            {treatments.length} {treatments.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {treatments.length === 0 ? (
            <div className="p-8 text-center rounded-[16px] border border-dashed border-[#E9E5F5] bg-[#F7F5FF]/50 space-y-2">
              <Activity className="h-8 w-8 text-[#8B5CF6] mx-auto opacity-50" />
              <p className="text-sm font-bold text-[#263238]">No Treatment Logs Available</p>
              <p className="text-xs text-[#667085]">
                Your clinical procedure notes and progress reports will appear here in real-time as your attending dentist posts updates.
              </p>
            </div>
          ) : (
            treatments.map((item) => (
              <div key={item.id} className="rounded-[16px] border border-[#E9E5F5] bg-[#F7F5FF]/50 p-5 shadow-xs hover:bg-[#F0ECFF]/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0ECFF] text-[#8B5CF6] font-bold border border-[#E9E5F5]">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-bold text-sm text-[#263238]">{item.title}</p>
                        <p className="text-xs font-semibold text-[#667085]">{item.doctor || 'Attending Dentist'}</p>
                      </div>
                      <span className="text-xs font-bold text-[#667085] bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#E9E5F5]">{item.date || 'Recent'}</span>
                    </div>
                    <p className="mt-2 text-xs italic text-[#263238] font-medium leading-relaxed">
                      “{item.note}”
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

