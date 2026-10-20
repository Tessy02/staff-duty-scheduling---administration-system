import { DutySchedule, EvaluationResult, EvaluationRuleCheck, StaffMember, ShiftCategoryType } from '../types';

/**
 * Helper to parse Date + Time into a standard JS Date object for accurate time-difference calculations.
 */
function getShiftDateTime(dateStr: string, timeStr: string, isNextDay: boolean = false): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (isNextDay) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/**
 * Returns the start (Monday 00:00) and end (Sunday 23:59) of the ISO week containing the target date.
 */
function getWeekRange(dateStr: string): { startOfWeek: Date; endOfWeek: Date } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const dayOfWeek = target.getDay(); // 0 is Sunday, 1 is Monday...
  // Calculate distance to previous Monday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(target);
  monday.setDate(target.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { startOfWeek: monday, endOfWeek: sunday };
}

/**
 * Evaluates a candidate duty schedule against existing schedules and staff constraints.
 * This directly implements Step 6 of the system defense architecture.
 */
export function evaluateSchedulingChoice(params: {
  staff: StaffMember;
  candidateCategory: ShiftCategoryType;
  candidateDate: string; // YYYY-MM-DD
  candidateStartTime: string; // HH:mm
  candidateEndTime: string; // HH:mm
  candidateDurationHours: number;
  candidateDutyStation: string;
  existingSchedules: DutySchedule[];
  currentEditingScheduleId?: string;
}): EvaluationResult {
  const {
    staff,
    candidateCategory,
    candidateDate,
    candidateStartTime,
    candidateEndTime,
    candidateDurationHours,
    candidateDutyStation,
    existingSchedules,
    currentEditingScheduleId,
  } = params;

  const checks: EvaluationRuleCheck[] = [];

  // Filter out the schedule currently being edited (if updating) and filter for this staff member
  const otherSchedules = existingSchedules.filter(
    (s) => s.id !== currentEditingScheduleId
  );
  const staffSchedules = otherSchedules.filter((s) => s.staffId === staff.id);

  // Compute candidate interval
  const isCandidateOvernight = candidateEndTime <= candidateStartTime && candidateEndTime !== '00:00';
  const candidateStart = getShiftDateTime(candidateDate, candidateStartTime);
  const candidateEnd = getShiftDateTime(candidateDate, candidateEndTime, isCandidateOvernight);

  // -------------------------------------------------------------
  // RULE 1: Direct Time Overlap / Double Booking Check
  // -------------------------------------------------------------
  let overlapFound = false;
  let overlappingSchedule: DutySchedule | undefined;

  for (const s of staffSchedules) {
    const isOtherOvernight = s.endTime <= s.startTime && s.endTime !== '00:00';
    const sStart = getShiftDateTime(s.date, s.startTime);
    const sEnd = getShiftDateTime(s.date, s.endTime, isOtherOvernight);

    // Overlap condition: (StartA < EndB) and (EndA > StartB)
    if (candidateStart < sEnd && candidateEnd > sStart) {
      overlapFound = true;
      overlappingSchedule = s;
      break;
    }
  }

  if (overlapFound && overlappingSchedule) {
    checks.push({
      ruleId: 'RULE-1-OVERLAP',
      ruleName: 'Direct Time Overlap / Double Booking',
      status: 'conflict',
      message: `Conflict detected: Staff is already scheduled on ${overlappingSchedule.date} (${overlappingSchedule.startTime} - ${overlappingSchedule.endTime}) at ${overlappingSchedule.dutyStation}.`,
      details: `Cannot schedule two simultaneous duties for the same staff member. Ref ID: ${overlappingSchedule.id}.`,
      conflictingScheduleId: overlappingSchedule.id,
    });
  } else {
    checks.push({
      ruleId: 'RULE-1-OVERLAP',
      ruleName: 'Direct Time Overlap / Double Booking',
      status: 'passed',
      message: 'No time collisions detected with existing assignments for this staff member.',
      details: 'Evaluated against all recorded shifts on adjacent dates.',
    });
  }

  // -------------------------------------------------------------
  // RULE 2: Mandatory Rest Period & Consecutive Shift Fatigue Check
  // -------------------------------------------------------------
  const minRestHours = staff.minRestHours || 11;
  let minRestFound: number | null = null;
  let restViolationSchedule: DutySchedule | undefined;
  let isSevereFatigue = false;

  for (const s of staffSchedules) {
    const isOtherOvernight = s.endTime <= s.startTime && s.endTime !== '00:00';
    const sStart = getShiftDateTime(s.date, s.startTime);
    const sEnd = getShiftDateTime(s.date, s.endTime, isOtherOvernight);

    // If existing shift is before candidate
    if (sEnd <= candidateStart) {
      const restBefore = (candidateStart.getTime() - sEnd.getTime()) / (1000 * 60 * 60);
      if (minRestFound === null || restBefore < minRestFound) {
        minRestFound = restBefore;
        if (restBefore < minRestHours) {
          restViolationSchedule = s;
          if (restBefore < 8) isSevereFatigue = true;
        }
      }
    }

    // If existing shift is after candidate
    if (candidateEnd <= sStart) {
      const restAfter = (sStart.getTime() - candidateEnd.getTime()) / (1000 * 60 * 60);
      if (minRestFound === null || restAfter < minRestFound) {
        minRestFound = restAfter;
        if (restAfter < minRestHours) {
          restViolationSchedule = s;
          if (restAfter < 8) isSevereFatigue = true;
        }
      }
    }
  }

  if (restViolationSchedule && minRestFound !== null && minRestFound < minRestHours) {
    const roundedRest = Math.round(minRestFound * 10) / 10;
    if (isSevereFatigue) {
      checks.push({
        ruleId: 'RULE-2-REST',
        ruleName: 'Mandatory Rest & Fatigue Prevention',
        status: 'conflict',
        message: `Fatigue violation: Only ${roundedRest}h rest between shifts (Mandatory minimum: ${minRestHours}h).`,
        details: `Adjacent shift on ${restViolationSchedule.date} (${restViolationSchedule.startTime} - ${restViolationSchedule.endTime}). Clinical guidelines require at least 8 hours continuous rest.`,
        conflictingScheduleId: restViolationSchedule.id,
      });
    } else {
      checks.push({
        ruleId: 'RULE-2-REST',
        ruleName: 'Mandatory Rest & Fatigue Prevention',
        status: 'warning',
        message: `Rest buffer advisory: ${roundedRest}h rest provided (Target: ${minRestHours}h).`,
        details: `Close succession to shift on ${restViolationSchedule.date}. Requires administrator awareness.`,
        conflictingScheduleId: restViolationSchedule.id,
      });
    }
  } else {
    checks.push({
      ruleId: 'RULE-2-REST',
      ruleName: 'Mandatory Rest & Fatigue Prevention',
      status: 'passed',
      message: minRestFound !== null
        ? `Compliant: Rest buffer is ${Math.round(minRestFound * 10) / 10}h (Exceeds required ${minRestHours}h).`
        : `Compliant: No adjacent shifts in immediate 24h vicinity.`,
      details: 'Staff will have adequate recovery time between duty rotations.',
    });
  }

  // -------------------------------------------------------------
  // RULE 3: Maximum Weekly Workload Limit
  // -------------------------------------------------------------
  const { startOfWeek, endOfWeek } = getWeekRange(candidateDate);
  const weekSchedules = staffSchedules.filter((s) => {
    const sDate = getShiftDateTime(s.date, '12:00');
    return sDate >= startOfWeek && sDate <= endOfWeek;
  });

  const currentWeeklyHours = weekSchedules.reduce((acc, s) => acc + (s.durationHours || 8), 0);
  const projectedWeeklyHours = currentWeeklyHours + candidateDurationHours;
  const maxWeeklyHours = staff.maxWeeklyHours || 40;

  if (projectedWeeklyHours > maxWeeklyHours) {
    const overage = Math.round((projectedWeeklyHours - maxWeeklyHours) * 10) / 10;
    const isExtreme = projectedWeeklyHours > maxWeeklyHours + 8;
    checks.push({
      ruleId: 'RULE-3-WORKLOAD',
      ruleName: 'Weekly Workload & Overtime Limit',
      status: isExtreme ? 'conflict' : 'warning',
      message: `Weekly duty quota exceeded: Projected ${projectedWeeklyHours}h exceeds maximum allowed ${maxWeeklyHours}h by ${overage}h.`,
      details: `Staff currently has ${currentWeeklyHours}h scheduled for week of ${startOfWeek.toISOString().slice(0, 10)}.`,
    });
  } else {
    checks.push({
      ruleId: 'RULE-3-WORKLOAD',
      ruleName: 'Weekly Workload & Overtime Limit',
      status: 'passed',
      message: `Within limit: Projected ${projectedWeeklyHours}h / ${maxWeeklyHours}h weekly maximum (${maxWeeklyHours - projectedWeeklyHours}h remaining).`,
      details: `Active weekly assignments count: ${weekSchedules.length} shifts.`,
    });
  }

  // -------------------------------------------------------------
  // RULE 4: Staff Availability & Status Validation
  // -------------------------------------------------------------
  if (staff.status === 'on_leave') {
    checks.push({
      ruleId: 'RULE-4-STATUS',
      ruleName: 'Staff Status & Availability',
      status: 'conflict',
      message: `Staff member ${staff.fullName} is currently registered as ON LEAVE.`,
      details: 'Staff member cannot be assigned duties while official leave status is active.',
    });
  } else if (staff.status === 'suspended') {
    checks.push({
      ruleId: 'RULE-4-STATUS',
      ruleName: 'Staff Status & Availability',
      status: 'conflict',
      message: `Staff member ${staff.fullName} is SUSPENDED from duty roster.`,
      details: 'Administrative suspension is active. Reinstatement required prior to scheduling.',
    });
  } else if (staff.shiftPreference === 'no_nights' && candidateCategory === 'night') {
    checks.push({
      ruleId: 'RULE-4-STATUS',
      ruleName: 'Staff Status & Shift Preference',
      status: 'warning',
      message: `Preference mismatch: Staff has an official 'No Night Shifts' profile preference.`,
      details: 'Medical exemption or contract preference. Requires explicit supervisor confirmation.',
    });
  } else {
    checks.push({
      ruleId: 'RULE-4-STATUS',
      ruleName: 'Staff Status & Availability',
      status: 'passed',
      message: `Staff status is ACTIVE and eligible for duty allocation.`,
      details: `Profile shift preference: ${staff.shiftPreference.replace('_', ' ').toUpperCase()}.`,
    });
  }

  // -------------------------------------------------------------
  // RULE 5: Duty Station Coverage & Skill Alignment
  // -------------------------------------------------------------
  const stationSchedules = otherSchedules.filter(
    (s) => s.date === candidateDate && s.dutyStation === candidateDutyStation
  );

  const isICUorEmergency =
    candidateDutyStation.toLowerCase().includes('icu') ||
    candidateDutyStation.toLowerCase().includes('trauma') ||
    candidateDutyStation.toLowerCase().includes('emergency');

  const hasCriticalSkills =
    staff.skills.some((s) =>
      ['acls', 'trauma', 'ventilator', 'critical', 'resus', 'ecmo', 'airway'].some((term) =>
        s.toLowerCase().includes(term)
      )
    );

  if (isICUorEmergency && !hasCriticalSkills) {
    checks.push({
      ruleId: 'RULE-5-SKILLS',
      ruleName: 'Duty Station Skill Alignment',
      status: 'warning',
      message: `Skill advisory: ${candidateDutyStation} is a high-acuity station.`,
      details: `Staff member's listed skills (${staff.skills.join(', ') || 'General'}) do not explicitly include ACLS or Critical Resuscitation. Recommend pairing with Senior Officer.`,
    });
  } else {
    checks.push({
      ruleId: 'RULE-5-SKILLS',
      ruleName: 'Duty Station Skill Alignment',
      status: 'passed',
      message: `Staff credentials match workstation requirements. ${stationSchedules.length} other staff stationed on this date.`,
      details: `Workstation: ${candidateDutyStation}.`,
    });
  }

  // Determine overall status
  const hasConflicts = checks.some((c) => c.status === 'conflict');
  const hasWarnings = checks.some((c) => c.status === 'warning');

  let overallStatus: 'passed' | 'warning' | 'conflict' = 'passed';
  if (hasConflicts) {
    overallStatus = 'conflict';
  } else if (hasWarnings) {
    overallStatus = 'warning';
  }

  return {
    overallStatus,
    canSubmit: !hasConflicts,
    requiresOverride: hasConflicts,
    checks,
    totalWeeklyHours: projectedWeeklyHours,
    weeklyLimit: maxWeeklyHours,
    overlapFound,
    restHoursBetween: minRestFound !== null ? Math.round(minRestFound * 10) / 10 : undefined,
    evaluatedAt: new Date().toISOString(),
  };
}
