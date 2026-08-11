import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Building2,
  FileText,
  User,
} from 'lucide-react';
import { subscribeAllLabRecords, createLabRecord, updateLabRecordStatus } from '../../services/laboratoryService';
import Spinner from '../auth/Spinner';

export default function LaboratoryTracking() {
  const [labRecords, setLabRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Work Order Form State
  const [patientName, setPatientName] = useState('');
  const [applianceType, setApplianceType] = useState('Zirconia Crown');
  const [labVendor, setLabVendor] = useState('Apex Dental Craft Lab');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribeAllLabRecords((records) => {
      setLabRecords(records);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!patientName.trim() || !targetDate) return;

    setIsSubmitting(true);
    try {
      await createLabRecord({
        patientName: patientName.trim(),
        applianceType,
        labVendor,
        targetDate,
        notes: notes.trim(),
        status: 'In Production',
        orderedBy: 'Dr. Ana Santos',
      });
      setShowAddModal(false);
      setPatientName('');
      setTargetDate('');
      setNotes('');
    } catch (err) {
      console.error('Error creating lab record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (recordId, newStatus) => {
    try {
      await updateLabRecordStatus(recordId, newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredRecords = labRecords.filter(
    (r) =>
      r.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.applianceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.labVendor?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" />
            <span>Laboratory Tracking</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor prosthetics, crowns, aligners, and dental lab work orders in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by patient, appliance, or lab vendor..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" className="text-purple-600 mx-auto" />
            <p className="text-xs text-slate-400 font-medium mt-2">Loading lab work orders...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FlaskConical className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No lab records found</p>
            <p className="text-xs text-slate-400">Click "New Work Order" to add a prosthetics or crown order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Appliance Type</th>
                  <th className="p-4">Lab Partner</th>
                  <th className="p-4">Target Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">
                        {(item.patientName || 'P').charAt(0).toUpperCase()}
                      </div>
                      <span>{item.patientName}</span>
                    </td>
                    <td className="p-4 font-semibold text-purple-700">{item.applianceType}</td>
                    <td className="p-4 flex items-center gap-1.5 text-slate-600">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.labVendor || 'Apex Dental Lab'}</span>
                    </td>
                    <td className="p-4 text-slate-500">{item.targetDate || '2026-08-15'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          item.status === 'Ready for Fitting' || item.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'In Production'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={item.status || 'Pending'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Production">In Production</option>
                        <option value="Ready for Fitting">Ready for Fitting</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-600" />
              <span>Create Laboratory Work Order</span>
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appliance Type</label>
                <select
                  value={applianceType}
                  onChange={(e) => setApplianceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Zirconia Crown">Zirconia Crown</option>
                  <option value="Porcelain Veneer">Porcelain Veneer</option>
                  <option value="Clear Aligners">Clear Aligners</option>
                  <option value="Complete Denture">Complete Denture</option>
                  <option value="Night Guard">Night Guard</option>
                  <option value="Orthodontic Retainer">Orthodontic Retainer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lab Partner</label>
                <select
                  value={labVendor}
                  onChange={(e) => setLabVendor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Apex Dental Craft Lab">Apex Dental Craft Lab</option>
                  <option value="Precision Prosthetics Co.">Precision Prosthetics Co.</option>
                  <option value="SmileCraft Ortho Lab">SmileCraft Ortho Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Laboratory Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tooth shade A2, margins sealed..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Submit Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
