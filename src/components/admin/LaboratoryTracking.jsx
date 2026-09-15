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
    <div className="space-y-6 text-left font-sans max-w-6xl mx-auto bg-[#FFFFFF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-[20px] bg-gradient-to-r from-[#FFFFFF] via-[#F7F5FF] to-[#FFFFFF] border border-[#E9E5F5] shadow-[0_4px_20px_rgba(100,80,180,0.04)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#263238] flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-[#8B5CF6]" />
            <span>Laboratory Tracking</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] font-semibold mt-1">
            Monitor prosthetics, crowns, clear aligners, and dental lab orders in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#6D5AE6] text-white text-xs font-bold rounded-[11px] shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#667085]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by patient, appliance, or lab vendor..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#F7F5FF] border border-[#E9E5F5] rounded-[12px] text-xs text-[#263238] font-bold focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
        />
      </div>

      {/* Table Card */}
      <div className="bg-[#FFFFFF] border border-[#E9E5F5] rounded-[20px] shadow-[0_4px_20px_rgba(100,80,180,0.06)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Spinner size="lg" className="text-[#8B5CF6] mx-auto" />
            <p className="text-xs text-[#667085] font-semibold mt-2">Loading lab work orders...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FlaskConical className="h-10 w-10 text-[#A78BFA] mx-auto" />
            <p className="text-sm font-bold text-[#263238]">No lab records found</p>
            <p className="text-xs text-[#667085]">Click "New Work Order" to add a prosthetics or crown order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5FF] border-b border-[#E9E5F5] text-[#667085] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Appliance Type</th>
                  <th className="p-4">Lab Partner</th>
                  <th className="p-4">Target Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E5F5] font-medium text-[#263238]">
                {filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F5FF]/60 transition-colors">
                    <td className="p-4 font-bold text-[#263238] flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#F0ECFF] text-[#6D5AE6] border border-[#E9E5F5] flex items-center justify-center text-xs font-black">
                        {(item.patientName || 'P').charAt(0).toUpperCase()}
                      </div>
                      <span>{item.patientName}</span>
                    </td>
                    <td className="p-4 font-semibold text-[#8B5CF6]">{item.applianceType}</td>
                    <td className="p-4 flex items-center gap-1.5 text-[#667085]">
                      <Building2 className="h-3.5 w-3.5 text-[#8B5CF6]" />
                      <span>{item.labVendor || 'Apex Dental Lab'}</span>
                    </td>
                    <td className="p-4 text-[#667085] font-semibold">{item.targetDate || '2026-08-15'}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          item.status === 'Ready for Fitting' || item.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'In Production'
                            ? 'bg-[#F0ECFF] text-[#6D5AE6] border-[#E9E5F5]'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={item.status || 'Pending'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-[#E9E5F5] bg-[#FFFFFF] text-[11px] font-bold text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
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
        <div className="fixed inset-0 z-50 bg-[#263238]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-[20px] p-6 shadow-2xl max-w-md max-h-[90vh] overflow-y-auto w-full space-y-4 border border-[#E9E5F5]">
            <h3 className="text-base font-bold text-[#263238] flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-[#8B5CF6]" />
              <span>Create Laboratory Work Order</span>
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full p-2.5 rounded-xl border border-[#E9E5F5] bg-[#F7F5FF] text-xs font-bold text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1">Appliance Type</label>
                <select
                  value={applianceType}
                  onChange={(e) => setApplianceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E9E5F5] bg-[#F7F5FF] text-xs font-bold text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
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
                <label className="block text-xs font-bold text-[#263238] mb-1">Lab Partner</label>
                <select
                  value={labVendor}
                  onChange={(e) => setLabVendor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E9E5F5] bg-[#F7F5FF] text-xs font-bold text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                >
                  <option value="Apex Dental Craft Lab">Apex Dental Craft Lab</option>
                  <option value="Precision Prosthetics Co.">Precision Prosthetics Co.</option>
                  <option value="SmileCraft Ortho Lab">SmileCraft Ortho Lab</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E9E5F5] bg-[#F7F5FF] text-xs font-bold text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#263238] mb-1">Laboratory Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tooth shade A2, margins sealed..."
                  className="w-full p-2.5 rounded-xl border border-[#E9E5F5] bg-[#F7F5FF] text-xs font-medium text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#F7F5FF] text-[#263238] font-bold text-xs rounded-xl hover:bg-[#F0ECFF] border border-[#E9E5F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#8B5CF6] text-white font-bold text-xs rounded-xl hover:bg-[#6D5AE6] disabled:opacity-60"
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

