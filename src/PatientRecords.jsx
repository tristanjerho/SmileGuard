import React, { useState, useEffect } from 'react';
import { Search, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Spinner from './components/auth/Spinner';

const riskStyles = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function PatientRecords() {
  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'patients'),
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const name =
            data.fullName ||
            `${data.FirstName || ''} ${data.lastName || ''}`.trim() ||
            data.email ||
            'Anonymous Patient';

          fetched.push({
            id: docSnap.id,
            name,
            demographics: `${data.gender || 'Patient'} • ${data.phone || data.email || 'Verified Record'}`,
            condition: data.medicalHistory || 'Routine Dental Checkup',
            lastVisit: data.updatedAt?.toDate
              ? data.updatedAt.toDate().toLocaleDateString()
              : 'Recent Visit',
            risk: data.risk || 'Low',
          });
        });

        if (fetched.length === 0) {
          // Fallback to query users collection if patients collection has not been populated yet
          onSnapshot(collection(db, 'users'), (userSnap) => {
            const usersFetched = [];
            userSnap.forEach((uDoc) => {
              const uData = uDoc.data();
              if (uData.role === 'patient' || !uData.role) {
                const uName =
                  uData.fullName ||
                  `${uData.FirstName || ''} ${uData.lastName || ''}`.trim() ||
                  uData.email;
                usersFetched.push({
                  id: uDoc.id,
                  name: uName || 'Registered Patient',
                  demographics: `${uData.gender || 'Patient'} • ${uData.phone || uData.email || 'Verified User'}`,
                  condition: uData.medicalHistory || 'General Examination',
                  lastVisit: 'Recent Visit',
                  risk: 'Low',
                });
              }
            });
            setPatientsList(usersFetched);
            setLoading(false);
          });
        } else {
          setPatientsList(fetched);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching patient records:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredPatients = patientsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-[#E9E5F5] pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#263238]">Patient Records</h2>
          <p className="text-xs font-medium text-[#667085] mt-1">
            Registered clinic patients synchronized live with Cloud Firestore
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#E9E5F5] bg-white px-4 py-2.5 shadow-xs min-w-[280px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient by name or condition..."
            className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-3 bg-white rounded-2xl border border-[#E9E5F5]">
          <Spinner size="md" className="text-[#8B5CF6] mx-auto" />
          <p>Loading patient records from Cloud Firestore...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-3 bg-white rounded-2xl border border-[#E9E5F5]">
          <AlertCircle className="h-10 w-10 text-purple-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No patient records found.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No patients match "${searchTerm}".`
              : 'Registered patients in Cloud Firestore will automatically appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                className="rounded-2xl border border-[#E9E5F5] bg-white p-6 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md hover:border-purple-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0ECFF] border border-[#E9E5F5] text-sm font-bold text-[#6D5AE6]">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{patient.demographics}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      riskStyles[patient.risk] || riskStyles.Low
                    }`}
                  >
                    {patient.risk || 'Low'} Risk
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-xs text-slate-600 border-t border-[#F7F5FF] pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Primary Condition / Notes
                    </p>
                    <p className="mt-0.5 font-bold text-slate-800">{patient.condition}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Last Updated
                    </p>
                    <p className="mt-0.5 font-semibold text-slate-600">{patient.lastVisit}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
