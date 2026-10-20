import React, { useState } from 'react';
import { 
  UserPlus, 
  Database, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  CalendarClock, 
  Download, 
  Sparkles,
  Phone,
  Mail,
  ShieldAlert,
  X
} from 'lucide-react';
import { StaffMember } from '../types';
import { DEPARTMENTS } from '../utils/constants';

interface StaffManagementProps {
  staffList: StaffMember[];
  onAddStaff: (staff: StaffMember) => void;
  onUpdateStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  onQuickSchedule: (staff: StaffMember) => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onQuickSchedule,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDept, setFormDept] = useState(DEPARTMENTS[0]);
  const [formRole, setFormRole] = useState('Resident Doctor');
  const [formPreference, setFormPreference] = useState<StaffMember['shiftPreference']>('flexible');
  const [formMaxHours, setFormMaxHours] = useState(40);
  const [formMinRest, setFormMinRest] = useState(11);
  const [formSkillsText, setFormSkillsText] = useState('ACLS Certified, General Triage');
  const [formStatus, setFormStatus] = useState<StaffMember['status']>('active');

  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Generate new Staff ID
  const generateNewId = () => {
    const existingNums = staffList
      .map((s) => {
        const match = s.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 100;
      })
      .filter((n) => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 101;
    return `STF-${nextNum}`;
  };

  const handleOpenNewForm = () => {
    setEditingStaffId(null);
    setFormId(generateNewId());
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDept(DEPARTMENTS[0]);
    setFormRole('Staff Nurse');
    setFormPreference('flexible');
    setFormMaxHours(40);
    setFormMinRest(11);
    setFormSkillsText('Patient Care, Vital Signs');
    setFormStatus('active');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setFormId(staff.id);
    setFormName(staff.fullName);
    setFormEmail(staff.email);
    setFormPhone(staff.phone);
    setFormDept(staff.department);
    setFormRole(staff.role);
    setFormPreference(staff.shiftPreference);
    setFormMaxHours(staff.maxWeeklyHours);
    setFormMinRest(staff.minRestHours);
    setFormSkillsText(staff.skills.join(', '));
    setFormStatus(staff.status);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleLoadDemoStaff = (type: 'doctor' | 'nurse' | 'technician') => {
    const randomId = generateNewId();
    if (type === 'doctor') {
      setFormId(randomId);
      setFormName('Dr. Kwame Mensah');
      setFormEmail('kwame.m@hospital.org');
      setFormPhone('+1 (555) 777-9911');
      setFormDept('Internal Medicine');
      setFormRole('Senior Registrar');
      setFormPreference('morning');
      setFormMaxHours(44);
      setFormMinRest(12);
      setFormSkillsText('Cardiology, ICU Stepdown, Ultrasound');
      setFormStatus('active');
    } else if (type === 'nurse') {
      setFormId(randomId);
      setFormName('Nurse Joy Chisom');
      setFormEmail('joy.c@hospital.org');
      setFormPhone('+1 (555) 888-2233');
      setFormDept('Emergency Medicine');
      setFormRole('Trauma Triage Nurse');
      setFormPreference('flexible');
      setFormMaxHours(38);
      setFormMinRest(11);
      setFormSkillsText('ACLS, Trauma Resuscitation, IV Cannulation');
      setFormStatus('active');
    } else {
      setFormId(randomId);
      setFormName('Chemist Daniel Lee');
      setFormEmail('daniel.l@hospital.org');
      setFormPhone('+1 (555) 999-4455');
      setFormDept('Laboratory & Pathology');
      setFormRole('Diagnostic Technician');
      setFormPreference('no_nights');
      setFormMaxHours(40);
      setFormMinRest(10);
      setFormSkillsText('Biochemistry, Serology Analyzer');
      setFormStatus('active');
    }
  };

  const handleSubmitStaffForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Please enter the full name of the staff member.');
      return;
    }

    const skillsArray = formSkillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const initials = formName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    const staffObject: StaffMember = {
      id: formId.trim().toUpperCase(),
      fullName: formName.trim(),
      email: formEmail.trim() || `${formId.toLowerCase()}@hospital.org`,
      phone: formPhone.trim() || '+1 (555) 000-0000',
      department: formDept,
      role: formRole.trim(),
      shiftPreference: formPreference,
      maxWeeklyHours: Number(formMaxHours),
      minRestHours: Number(formMinRest),
      skills: skillsArray,
      status: formStatus,
      avatarInitials: initials || 'ST',
      createdAt: new Date().toISOString(),
    };

    try {
      if (editingStaffId) {
        onUpdateStaff(staffObject);
        setSuccessBanner(`Successfully updated records for ${staffObject.fullName} (${staffObject.id})`);
      } else {
        onAddStaff(staffObject);
        setSuccessBanner(`Step 4 Complete: Stored ${staffObject.fullName} [${staffObject.id}] into the database.`);
      }
      setIsFormOpen(false);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save staff record.');
      }
    }
  };

  // Filtered staff
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.skills.some((sk) => sk.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const exportStaffJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(staffList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `staff_database_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Step 3 & 4 Defense Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  DEFENSE STEPS 3 &amp; 4
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Staff Information Entry &amp; Database Storage
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Enter staff personal details, clinical cadre, shift preferences, and fatigue constraints. 
                Submitted profiles are immediately indexed and committed to the system database for automated evaluation in Step 6.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={exportStaffJson}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              title="Export staff records snapshot for auditing"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleOpenNewForm}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Staff (Step 3)</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successBanner && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
        )}
      </div>

      {/* Staff Registration / Edit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {editingStaffId ? 'UPDATE RECORD' : 'STEP 3: STAFF INFORMATION FORM'}
                  </div>
                  <h3 className="text-sm font-bold">
                    {editingStaffId ? `Edit Staff Member (${editingStaffId})` : 'Register Staff Member Profile'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Demo Preloads for oral defense */}
            {!editingStaffId && (
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Quick Fill Demo Samples for Examiners:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLoadDemoStaff('doctor')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    + Dr. Kwame (Doctor)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadDemoStaff('nurse')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    + Nurse Joy (ICU)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadDemoStaff('technician')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    + Daniel (Lab Scientist)
                  </button>
                </div>
              </div>
            )}

            {formError && (
              <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitStaffForm} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff ID Code *
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      required
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="e.g. STF-109"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => setFormId(generateNewId())}
                      className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-[10px] text-slate-600 hover:bg-slate-200"
                      title="Auto generate next ID"
                    >
                      Gen
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Staff Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Amina Bello / Nurse David Stone"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. amina.b@hospital.org"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telephone Contact
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Department *
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cadre / Clinical Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Senior Consultant / ICU Charge Nurse"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Duty & Fatigue Constraints */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                  Scheduling &amp; Fatigue Constraints (Used by Evaluation Engine)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Shift Preference
                    </label>
                    <select
                      value={formPreference}
                      onChange={(e) => setFormPreference(e.target.value as StaffMember['shiftPreference'])}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="flexible">Flexible (Any Shift)</option>
                      <option value="morning">Morning Preference</option>
                      <option value="afternoon">Afternoon Preference</option>
                      <option value="night">Night Preference</option>
                      <option value="no_nights">NO NIGHT SHIFTS (Medical/Contract)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Max Weekly Hours
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={80}
                      value={formMaxHours}
                      onChange={(e) => setFormMaxHours(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Min Rest Buffer (Hours)
                    </label>
                    <input
                      type="number"
                      min={8}
                      max={24}
                      value={formMinRest}
                      onChange={(e) => setFormMinRest(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Clinical Skills &amp; Certifications (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formSkillsText}
                    onChange={(e) => setFormSkillsText(e.target.value)}
                    placeholder="e.g. ACLS Certified, Trauma Triage, Ventilator Mgmt"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Status *
                </label>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="staffStatus"
                      checked={formStatus === 'active'}
                      onChange={() => setFormStatus('active')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-emerald-800 font-medium">Active (Eligible for Rota)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="staffStatus"
                      checked={formStatus === 'on_leave'}
                      onChange={() => setFormStatus('on_leave')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-amber-800 font-medium">On Leave</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="staffStatus"
                      checked={formStatus === 'suspended'}
                      onChange={() => setFormStatus('suspended')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-800 font-medium">Suspended</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-mono">
                  Schema: StaffRecord/v1
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Database className="w-4 h-4" />
                    <span>Save to Database (Step 4)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Database Table & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Filter Controls (Segmented / Buttons as permitted) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff by name, ID, cadre or clinical skill..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="ALL">All Status</option>
                <option value="active">Active Only</option>
                <option value="on_leave">On Leave</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database Records List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Department &amp; Cadre</th>
                <th className="py-3 px-4">Preference &amp; Quota</th>
                <th className="py-3 px-4">Skills</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No staff records match the current filter query.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Staff details */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center font-bold text-xs shrink-0">
                          {staff.avatarInitials || staff.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{staff.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                            <span>{staff.id}</span>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {staff.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Cadre */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{staff.department}</div>
                      <div className="text-slate-500 text-[11px]">{staff.role}</div>
                    </td>

                    {/* Shift preference & max weekly hours */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {staff.maxWeeklyHours}h max / week
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Pref: <span className="capitalize">{staff.shiftPreference.replace('_', ' ')}</span> · Rest: {staff.minRestHours}h
                      </div>
                    </td>

                    {/* Skills unboxed text */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-600 text-[11px] line-clamp-2">
                        {staff.skills.join(', ') || 'General Ward Clinical Duty'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {staff.status === 'active' && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      )}
                      {staff.status === 'on_leave' && (
                        <span className="text-amber-700 font-semibold flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          On Leave
                        </span>
                      )}
                      {staff.status === 'suspended' && (
                        <span className="text-rose-700 font-semibold flex items-center gap-1 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onQuickSchedule(staff)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Schedule this staff member for duty (Step 5)"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          <span>Schedule</span>
                        </button>
                        <button
                          onClick={() => handleEditClick(staff)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Edit staff details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${staff.fullName} from the staff records database?`)) {
                              onDeleteStaff(staff.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Delete staff record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Database Footer Status */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>
              Total Database Records: <strong className="text-slate-800">{staffList.length}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Active Eligible: <strong className="text-emerald-700">{staffList.filter((s) => s.status === 'active').length}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              On Leave: <strong className="text-amber-700">{staffList.filter((s) => s.status === 'on_leave').length}</strong>
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Storage Engine: Indexed Persistent Store
          </div>
        </div>
      </div>
    </div>
  );
};
