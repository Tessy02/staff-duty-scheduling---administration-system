import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarCheck2, 
  Sparkles, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  User, 
  Calendar, 
  Stamp, 
  ArrowRight,
  Info,
  ChevronDown,
  UserCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  AdministratorCredentials, 
  DutySchedule, 
  EvaluationResult, 
  ShiftCategoryConfig, 
  ShiftCategoryType, 
  StaffMember 
} from '../types';
import { DUTY_STATIONS, SHIFT_CATEGORIES } from '../utils/constants';
import { evaluateSchedulingChoice } from '../utils/evaluationEngine';
import { formatDateISO } from '../utils/storage';

interface DutySchedulerProps {
  staffList: StaffMember[];
  schedules: DutySchedule[];
  admin: AdministratorCredentials;
  initialSelectedStaff?: StaffMember | null;
  onSubmitSchedule: (schedule: DutySchedule) => void;
  onViewRoster: () => void;
}

export const DutyScheduler: React.FC<DutySchedulerProps> = ({
  staffList,
  schedules,
  admin,
  initialSelectedStaff,
  onSubmitSchedule,
  onViewRoster,
}) => {
  // Step 5 Selections
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    initialSelectedStaff?.id || staffList[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<ShiftCategoryType>('morning');
  const [shiftDate, setShiftDate] = useState<string>(() => formatDateISO(new Date()));
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('16:00');
  const [dutyStation, setDutyStation] = useState<string>(DUTY_STATIONS[0]);
  const [priority, setPriority] = useState<DutySchedule['priority']>('routine');
  const [notes, setNotes] = useState<string>('');

  // Step 6 Evaluation State & Override
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [showRuleDetails, setShowRuleDetails] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<DutySchedule | null>(null);

  // Sync when initialSelectedStaff changes from outside
  useEffect(() => {
    if (initialSelectedStaff) {
      setSelectedStaffId(initialSelectedStaff.id);
    }
  }, [initialSelectedStaff]);

  // Current staff object
  const currentStaff = useMemo(() => {
    return staffList.find((s) => s.id === selectedStaffId) || staffList[0];
  }, [staffList, selectedStaffId]);

  // Handle Category Change -> auto fill times
  const handleCategoryChange = (catId: ShiftCategoryType) => {
    setSelectedCategory(catId);
    const catConfig = SHIFT_CATEGORIES.find((c) => c.id === catId);
    if (catConfig) {
      setStartTime(catConfig.defaultStartTime);
      setEndTime(catConfig.defaultEndTime);
    }
  };

  // Calculate duration in hours
  const calculatedDuration = useMemo(() => {
    if (!startTime || !endTime) return 8;
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    let startMin = sH * 60 + sM;
    let endMin = eH * 60 + eM;
    if (endMin <= startMin) {
      endMin += 24 * 60; // Overnight shift
    }
    return Math.round(((endMin - startMin) / 60) * 10) / 10;
  }, [startTime, endTime]);

  // STEP 6: Execute Evaluation Engine in real-time
  const evaluation: EvaluationResult | null = useMemo(() => {
    if (!currentStaff) return null;

    return evaluateSchedulingChoice({
      staff: currentStaff,
      candidateCategory: selectedCategory,
      candidateDate: shiftDate,
      candidateStartTime: startTime,
      candidateEndTime: endTime,
      candidateDurationHours: calculatedDuration,
      candidateDutyStation: dutyStation,
      existingSchedules: schedules,
    });
  }, [currentStaff, selectedCategory, shiftDate, startTime, endTime, calculatedDuration, dutyStation, schedules]);

  // Can submit check
  const isSubmissionAllowed = useMemo(() => {
    if (!evaluation) return false;
    if (evaluation.canSubmit) return true;
    // If conflict detected, only allowed if emergency override is checked with reason
    if (evaluation.requiresOverride && isOverrideEnabled && overrideReason.trim().length >= 5) {
      return true;
    }
    return false;
  }, [evaluation, isOverrideEnabled, overrideReason]);

  // STEP 7: Submit the schedule
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff || !isSubmissionAllowed) return;

    const catObj = SHIFT_CATEGORIES.find((c) => c.id === selectedCategory) || SHIFT_CATEGORIES[0];
    const generatedId = `SCH-${shiftDate.replace(/-/g, '').slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSchedule: DutySchedule = {
      id: generatedId,
      staffId: currentStaff.id,
      staffName: currentStaff.fullName,
      staffDepartment: currentStaff.department,
      staffRole: currentStaff.role,
      category: selectedCategory,
      categoryName: catObj.name,
      date: shiftDate,
      startTime,
      endTime,
      durationHours: calculatedDuration,
      dutyStation,
      priority,
      notes: notes.trim() || undefined,
      isOverridden: evaluation?.requiresOverride && isOverrideEnabled,
      overrideReason: isOverrideEnabled ? overrideReason : undefined,
      registeredBy: {
        officerName: admin.officerName,
        officerId: admin.officerId,
        cadre: admin.cadre,
        timestamp: new Date().toISOString(),
        signatureStamp: admin.signatureStamp,
      },
      createdAt: new Date().toISOString(),
    };

    onSubmitSchedule(newSchedule);
    setSubmissionSuccess(newSchedule);
    setIsOverrideEnabled(false);
    setOverrideReason('');
  };

  // Find alternative staff who has no conflicts on this date/time
  const alternativeStaff = useMemo(() => {
    if (!evaluation || evaluation.overallStatus === 'passed' || !currentStaff) return [];
    return staffList
      .filter((s) => s.id !== currentStaff.id && s.department === currentStaff.department && s.status === 'active')
      .filter((s) => {
        const evalRes = evaluateSchedulingChoice({
          staff: s,
          candidateCategory: selectedCategory,
          candidateDate: shiftDate,
          candidateStartTime: startTime,
          candidateEndTime: endTime,
          candidateDurationHours: calculatedDuration,
          candidateDutyStation: dutyStation,
          existingSchedules: schedules,
        });
        return evalRes.overallStatus === 'passed';
      })
      .slice(0, 3);
  }, [evaluation, currentStaff, staffList, selectedCategory, shiftDate, startTime, endTime, calculatedDuration, dutyStation, schedules]);

  return (
    <div className="space-y-6">
      {/* 3-Step Defense Workflow Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            DEFENSE STEPS 5, 6 &amp; 7 WORKFLOW
          </span>
          <span className="text-xs text-slate-500">· Automated Clinical Verification Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              5
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Select Details</div>
              <div className="text-[11px] text-slate-500">Staff, Shift Category &amp; Duration</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              evaluation?.overallStatus === 'conflict'
                ? 'bg-rose-600 text-white'
                : evaluation?.overallStatus === 'warning'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-600 text-white'
            }`}>
              6
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Evaluate Choice</div>
              <div className="text-[11px] text-slate-500">Overlap, Rest Fatigue, Hours Quota</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              7
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Submit Schedule</div>
              <div className="text-[11px] text-slate-500">Database Commit &amp; Admin Sign Stamp</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scheduling & Evaluation Workspace */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Step 5 Selection Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-blue-600" />
                <span>Step 5: Identify Staff &amp; Select Parameters</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Active Staff Records: {staffList.length}
              </span>
            </div>

            {/* Staff Selection Dropdown & Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Identify Staff Member *
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} ({staff.id}) — {staff.department} [{staff.role}]
                  </option>
                ))}
              </select>

              {/* Selected Staff Micro-Card */}
              {currentStaff && (
                <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{currentStaff.fullName}</span>
                      <span className="text-[10px] font-mono text-slate-500">({currentStaff.id})</span>
                    </div>
                    <div>
                      {currentStaff.status === 'active' ? (
                        <span className="text-[11px] font-semibold text-emerald-700">● Active</span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700">● {currentStaff.status.toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                    <span>Dept: {currentStaff.department}</span>
                    <span aria-hidden="true">·</span>
                    <span>Role: {currentStaff.role}</span>
                    <span aria-hidden="true">·</span>
                    <span>Max: {currentStaff.maxWeeklyHours}h/wk</span>
                    <span aria-hidden="true">·</span>
                    <span>Min Rest: {currentStaff.minRestHours}h</span>
                  </div>
                </div>
              )}
            </div>

            {/* Shift Category Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Scheduling Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SHIFT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedCategory === cat.id
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs truncate">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {cat.defaultStartTime} - {cat.defaultEndTime} ({cat.durationHours}h)
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Duty Date *
                </label>
                <input
                  type="date"
                  required
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md flex items-center justify-between">
              <span>Calculated Shift Duration: <strong>{calculatedDuration} hours</strong></span>
              <span className="font-mono text-[10px] text-slate-400">
                {endTime <= startTime ? '(Crosses Midnight)' : '(Same-Day Rotation)'}
              </span>
            </div>

            {/* Spatial Location & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Assigned Duty Station / Ward *
                </label>
                <select
                  value={dutyStation}
                  onChange={(e) => setDutyStation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {DUTY_STATIONS.map((station) => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duty Priority Level *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as DutySchedule['priority'])}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="routine">Routine Roster Assignment</option>
                  <option value="critical">Critical High-Dependency Coverage</option>
                  <option value="emergency_replacement">Emergency Relief / Replacement</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Instructions / Shift Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Lead clinical handover at trauma bay; supervise resident registrar."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Step 6 Automated Evaluation Component & Step 7 Submission (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Step 6 Evaluation Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Step 6: Algorithmic Evaluation
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Rules Engine v1.0
              </span>
            </div>

            {/* Overall Evaluation Status Result */}
            {evaluation && (
              <div className={`p-4 rounded-xl border transition-all ${
                evaluation.overallStatus === 'conflict'
                  ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                  : evaluation.overallStatus === 'warning'
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                  : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex items-start gap-3">
                  {evaluation.overallStatus === 'conflict' && (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  {evaluation.overallStatus === 'warning' && (
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  {evaluation.overallStatus === 'passed' && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {evaluation.overallStatus === 'conflict' && 'CONFLICT DETECTED — SUBMISSION BLOCKED'}
                      {evaluation.overallStatus === 'warning' && 'ADVISORY WARNING — SUPERVISOR REVIEW'}
                      {evaluation.overallStatus === 'passed' && 'EVALUATION CLEARED — SCHEDULE VERIFIED'}
                    </div>
                    <p className="text-xs">
                      {evaluation.overallStatus === 'conflict' &&
                        'The scheduling choice violates critical clinical scheduling rules (double-booking or severe fatigue).'}
                      {evaluation.overallStatus === 'warning' &&
                        'The scheduling choice meets basic requirements but triggers policy advisories (weekly hour threshold or preference).'}
                      {evaluation.overallStatus === 'passed' &&
                        'All clinical scheduling constraints, rest buffers, and workload limits are fully satisfied.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5 Rule Verification Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Clinical Rule Checks (5 Rules Evaluated):</span>
                <button
                  type="button"
                  onClick={() => setShowRuleDetails(!showRuleDetails)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 underline"
                >
                  {showRuleDetails ? 'Collapse Details' : 'View Full Details'}
                </button>
              </div>

              {evaluation?.checks.map((check) => (
                <div
                  key={check.ruleId}
                  className={`p-2.5 rounded-lg border text-xs transition-colors ${
                    check.status === 'conflict'
                      ? 'bg-rose-50/60 border-rose-200'
                      : check.status === 'warning'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      {check.status === 'conflict' && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                      {check.status === 'warning' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                      {check.status === 'passed' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                      <span>{check.ruleName}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      check.status === 'conflict'
                        ? 'text-rose-700'
                        : check.status === 'warning'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}>
                      {check.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1">
                    {check.message}
                  </p>

                  {showRuleDetails && check.details && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                      {check.details}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Alternative Staff Suggestions if conflict exists */}
            {alternativeStaff.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Evaluation Assistant: Suggested Available Staff:</span>
                </div>
                <div className="space-y-1">
                  {alternativeStaff.map((alt) => (
                    <div
                      key={alt.id}
                      className="flex items-center justify-between text-xs bg-white p-2 rounded border border-blue-100"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{alt.fullName}</span>
                        <span className="text-[10px] text-slate-500 ml-1">({alt.role})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStaffId(alt.id)}
                        className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold hover:bg-blue-700"
                      >
                        Assign Instead
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Administrative Override Panel (When Conflict Exists) */}
            {evaluation?.requiresOverride && (
              <div className="p-3.5 bg-rose-50/90 border border-rose-300 rounded-lg space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Administrative Emergency Override Protocol</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Clinical safety checks detected a scheduling conflict. 
                  In exceptional institutional emergencies, authorized administrators may override the block with documented justification.
                </p>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-rose-950">
                  <input
                    type="checkbox"
                    checked={isOverrideEnabled}
                    onChange={(e) => setIsOverrideEnabled(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Authorize Emergency Override</span>
                </label>

                {isOverrideEnabled && (
                  <div className="space-y-1 pt-1">
                    <label className="block text-[11px] font-semibold text-rose-950">
                      Emergency Justification (Required for Audit Stamp) *
                    </label>
                    <input
                      type="text"
                      required
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Mass Casualty Incident; approved by Chief Registrar."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Final Submission Button & Digital Stamp */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="text-[11px] text-slate-500 flex items-center justify-between font-mono bg-slate-50 p-2 rounded">
                <span className="flex items-center gap-1">
                  <Stamp className="w-3.5 h-3.5 text-slate-400" />
                  Signing Officer:
                </span>
                <span className="font-semibold text-slate-800">{admin.officerName}</span>
              </div>

              <button
                type="submit"
                disabled={!isSubmissionAllowed}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all ${
                  isSubmissionAllowed
                    ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Submit Schedule to Database (Step 7)</span>
              </button>

              {!isSubmissionAllowed && (
                <div className="text-[11px] text-rose-600 text-center">
                  {evaluation?.requiresOverride
                    ? 'Resolution required: resolve conflicts or authorize emergency override.'
                    : 'Awaiting scheduling selection.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Submission Success Confirmation Modal */}
      {submissionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                STEP 7 COMPLETE · COMMITTED TO DATABASE
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Duty Schedule Successfully Saved!
              </h3>
              <p className="text-xs text-slate-500">
                The duty assignment has been validated, digitally stamped, and indexed into the institutional schedule database.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Schedule Ref ID:</span>
                <span className="font-mono font-bold text-slate-800">{submissionSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Staff Assigned:</span>
                <span className="font-semibold text-slate-800">{submissionSuccess.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shift Category:</span>
                <span className="text-slate-800">{submissionSuccess.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date &amp; Times:</span>
                <span className="text-slate-800">{submissionSuccess.date} ({submissionSuccess.startTime} - {submissionSuccess.endTime})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duty Station:</span>
                <span className="text-slate-800">{submissionSuccess.dutyStation}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-[11px]">
                <span className="text-slate-500">Authenticated Register:</span>
                <span className="text-slate-700 font-mono">{submissionSuccess.registeredBy.officerName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubmissionSuccess(null)}
                className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Schedule Another Duty
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccess(null);
                  onViewRoster();
                }}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>View in Roster (Step 8)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
