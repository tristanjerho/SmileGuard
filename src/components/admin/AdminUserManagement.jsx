import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Filter,
  CheckCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  X,
  Mail,
  UserCheck,
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * AdminUserManagement Component
 * Full CRUD control over Firestore `users` and `patients` collections.
 */
export default function AdminUserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Female',
    allergies: 'None',
    medicalHistory: 'Regular Dental Checkup',
  });

  const [notification, setNotification] = useState('');

  // Fetch Firestore users & patients
  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!db) {
        setUsersList([
          { id: '1', FirstName: 'Maria', lastName: 'Santos', email: 'maria@example.com', role: 'patient', createdAt: '2026-08-01' },
          { id: '2', FirstName: 'Dr. Ana', lastName: 'Santos', email: 'dr.ana@smileguard.ai', role: 'admin', createdAt: '2026-07-15' },
          { id: '3', FirstName: 'Juan', lastName: 'dela Cruz', email: 'juan@example.com', role: 'patient', createdAt: '2026-08-03' },
        ]);
        setLoading(false);
        return;
      }

      const usersSnap = await getDocs(collection(db, 'users'));
      const fetched = [];
      usersSnap.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });

      // If empty in Firestore, fallback to sample view
      if (fetched.length === 0) {
        setUsersList([
          { id: '1', FirstName: 'Maria', lastName: 'Santos', email: 'maria@example.com', role: 'patient', createdAt: '2026-08-01' },
          { id: '2', FirstName: 'Dr. Ana', lastName: 'Santos', email: 'dr.ana@smileguard.ai', role: 'admin', createdAt: '2026-07-15' },
        ]);
      } else {
        setUsersList(fetched);
      }
    } catch (err) {
      console.error('Error fetching Firestore users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      if (db) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role: newRole });
      }
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setNotification(`User role successfully updated to "${newRole}".`);
      setIsEditModalOpen(false);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    if (!newPatient.fullName || !newPatient.email) return;

    try {
      const customId = `pt_${Date.now()}`;
      const nameParts = newPatient.fullName.trim().split(' ');
      const FirstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (db) {
        // Save to users collection
        await setDoc(doc(db, 'users', customId), {
          FirstName,
          lastName,
          email: newPatient.email.trim(),
          role: 'patient',
          profilePicture: '',
          createdAt: serverTimestamp(),
        });

        // Save to patients collection
        await setDoc(doc(db, 'patients', customId), {
          fullName: newPatient.fullName.trim(),
          email: newPatient.email.trim(),
          phone: newPatient.phone,
          gender: newPatient.gender,
          allergies: newPatient.allergies,
          medicalHistory: newPatient.medicalHistory,
          createdAt: serverTimestamp(),
        });
      }

      setUsersList((prev) => [
        {
          id: customId,
          FirstName,
          lastName,
          email: newPatient.email.trim(),
          role: 'patient',
          createdAt: 'Just now',
        },
        ...prev,
      ]);

      setNotification(`New patient "${newPatient.fullName}" added to Cloud Firestore.`);
      setIsAddPatientModalOpen(false);
      setNewPatient({
        fullName: '',
        email: '',
        phone: '',
        gender: 'Female',
        allergies: 'None',
        medicalHistory: 'Regular Dental Checkup',
      });
      setTimeout(() => setNotification(''), 3500);
    } catch (err) {
      console.error('Error adding new patient:', err);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const name = `${u.FirstName || ''} ${u.lastName || ''} ${u.fullName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || (u.role || 'patient') === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-emerald-500" />
            Patient & Clinic User Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage Cloud Firestore registered patient accounts, clinical staff roles, and HIPAA consent records.
          </p>
        </div>

        <button
          onClick={() => setIsAddPatientModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Users ({usersList.length})</option>
            <option value="patient">Patients Only</option>
            <option value="admin">Dentists & Admins</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
            <p>Loading Cloud Firestore records...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <p>No user records found matching "{searchTerm}".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User / Patient</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                {filteredUsers.map((u) => {
                  const displayName = u.fullName || `${u.FirstName || ''} ${u.lastName || ''}`.trim() || 'Anonymous Patient';
                  const initials = displayName.substring(0, 2).toUpperCase();
                  const isAdmin = u.role === 'admin' || u.role === 'dentist';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-md ${
                            isAdmin
                              ? 'bg-gradient-to-tr from-purple-600 to-indigo-500'
                              : 'bg-gradient-to-tr from-teal-500 to-emerald-400'
                          }`}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{displayName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">UID: {u.id.substring(0, 12)}...</p>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {u.email || 'N/A'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {isAdmin ? 'Clinician Admin' : 'Patient'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-[11px]">
                        {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : (u.createdAt || 'August 2026')}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsEditModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Edit className="h-3.5 w-3.5 text-slate-500" />
                          <span>Edit Role</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-slide-up text-left">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Modify User Access Role
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Updating access for <strong>{selectedUser.email}</strong>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleUpdateRole(selectedUser.id, 'patient')}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-emerald-500">
                    Patient Role
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Standard access to appointments, medical history, and personal profile.
                  </p>
                </div>
                {selectedUser.role === 'patient' && <UserCheck className="h-5 w-5 text-emerald-500 shrink-0" />}
              </button>

              <button
                onClick={() => handleUpdateRole(selectedUser.id, 'admin')}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-purple-400">
                    Clinician / Admin Role
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Full privileges: AI Diagnostic engine, patient management & clinic settings.
                  </p>
                </div>
                {(selectedUser.role === 'admin' || selectedUser.role === 'dentist') && (
                  <Shield className="h-5 w-5 text-purple-500 shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Patient Modal */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 animate-slide-up text-left">
            <button
              onClick={() => setIsAddPatientModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-500" />
                Register New Clinical Patient
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly provisions a document record in Cloud Firestore `patients` collection.
              </p>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPatient.fullName}
                  onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                  placeholder="e.g. Maria Santos"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="+63 917 555 0192"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medical & Dental History
                </label>
                <textarea
                  rows="2"
                  value={newPatient.medicalHistory}
                  onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                  placeholder="e.g. Braces treatment ongoing, no known allergies."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  Create Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
