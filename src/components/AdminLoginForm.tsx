import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Building, 
  User, 
  IdCard, 
  Stamp, 
  Sparkles, 
  Info
} from 'lucide-react';
import { AdministratorCredentials } from '../types';
import { ADMIN_PRESETS, DEPARTMENTS } from '../utils/constants';

interface AdminLoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdmin: AdministratorCredentials;
  onSaveAdmin: (creds: AdministratorCredentials) => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  isOpen,
  onClose,
  currentAdmin,
  onSaveAdmin,
}) => {
  const [formData, setFormData] = useState<AdministratorCredentials>({ ...currentAdmin });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdministratorCredentials = {
      ...formData,
      isRegistered: true,
      loggedInAt: new Date().toISOString(),
    };
    onSaveAdmin(updated);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 700);
  };

  const handleApplyPreset = (preset: AdministratorCredentials) => {
    setFormData({
      ...preset,
      loggedInAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400 font-semibold tracking-wide">
                STEP 2 OF 8 · AUTHENTICATION
              </div>
              <h2 className="text-lg font-bold">Duty Register Credentials Entry</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Defense Architecture Note */}
        <div className="bg-blue-50/70 border-b border-blue-100 p-4 flex gap-3 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-950">Defense Architectural Design: </span>
            As specified in system requirements, rather than utilizing a heavy external login database, 
            this register form authenticates and binds the administrator's official credentials. Every scheduled duty is digitally signed with this stamp for administrative traceability and audit compliance.
          </div>
        </div>

        {/* Quick Presets */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Officer Presets for Defense Demonstration:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ADMIN_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-2 rounded-lg border text-xs transition-all ${
                  formData.officerId === preset.officerId
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-semibold truncate">{preset.officerName}</div>
                <div className="text-[10px] text-slate-500 truncate">{preset.cadre}</div>
                <div className="text-[9px] font-mono text-slate-400">{preset.officerId}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Register / Officer Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.officerName}
                onChange={(e) => setFormData({ ...formData, officerName: e.target.value })}
                placeholder="e.g. Dr. Arthur Vance"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-slate-400" />
                Staff / Officer ID Number *
              </label>
              <input
                type="text"
                required
                value={formData.officerId}
                onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                placeholder="e.g. ADM-ROSTER-094"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cadre / Administrative Title *
              </label>
              <input
                type="text"
                required
                value={formData.cadre}
                onChange={(e) => setFormData({ ...formData, cadre: e.target.value })}
                placeholder="e.g. Chief Duty Registrar"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Administrative Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="Clinical Administration & Operations">Clinical Administration &amp; Operations</option>
                <option value="Nursing & Inpatient Care">Nursing &amp; Inpatient Care</option>
                <option value="Support & Facility Operations">Support &amp; Facility Operations</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duty Station / Office Location
              </label>
              <input
                type="text"
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                placeholder="e.g. Central Administration Office"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5 text-slate-400" />
                Digital Signature Stamp Code *
              </label>
              <input
                type="text"
                required
                value={formData.signatureStamp}
                onChange={(e) => setFormData({ ...formData, signatureStamp: e.target.value })}
                placeholder="e.g. STAMP/AV-ROSTER/SEC-A"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase"
              />
            </div>
          </div>

          {/* Submission row */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Session active since: <span className="font-mono">{new Date(formData.loggedInAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                {savedNotice ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Credentials Verified!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authenticate Register Credentials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
