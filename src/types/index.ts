export type ShiftCategoryType = 
  | 'morning' 
  | 'afternoon' 
  | 'night' 
  | 'intensive_care' 
  | 'emergency_on_call' 
  | 'weekend_vigil' 
  | 'lab_rotation';

export interface ShiftCategoryConfig {
  id: ShiftCategoryType;
  name: string;
  defaultStartTime: string;
  defaultEndTime: string;
  durationHours: number;
  description: string;
  badgeColor: string;
  textColor: string;
}

export interface StaffMember {
  id: string; // e.g., STF-101
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  shiftPreference: 'morning' | 'afternoon' | 'night' | 'flexible' | 'no_nights';
  maxWeeklyHours: number;
  minRestHours: number;
  skills: string[];
  status: 'active' | 'on_leave' | 'suspended';
  avatarInitials?: string;
  createdAt: string;
}

export interface AdministratorCredentials {
  officerName: string;
  officerId: string;
  cadre: string;
  department: string;
  station: string;
  signatureStamp: string;
  loggedInAt: string;
  isRegistered: boolean;
}

export interface DutySchedule {
  id: string; // e.g., SCH-2026-0814
  staffId: string;
  staffName: string;
  staffDepartment: string;
  staffRole: string;
  category: ShiftCategoryType;
  categoryName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationHours: number;
  dutyStation: string; // e.g. Emergency Bay 1, ICU Unit B, etc.
  priority: 'routine' | 'critical' | 'emergency_replacement';
  notes?: string;
  isOverridden?: boolean;
  overrideReason?: string;
  // Audit stamp of the administrator from Step 2
  registeredBy: {
    officerName: string;
    officerId: string;
    cadre: string;
    timestamp: string;
    signatureStamp: string;
  };
  createdAt: string;
}

export interface EvaluationRuleCheck {
  ruleId: string;
  ruleName: string;
  status: 'passed' | 'warning' | 'conflict';
  message: string;
  details?: string;
  conflictingScheduleId?: string;
}

export interface EvaluationResult {
  overallStatus: 'passed' | 'warning' | 'conflict';
  canSubmit: boolean;
  requiresOverride: boolean;
  checks: EvaluationRuleCheck[];
  totalWeeklyHours: number;
  weeklyLimit: number;
  overlapFound: boolean;
  restHoursBetween?: number;
  evaluatedAt: string;
}

export interface SystemStepDef {
  stepNumber: number;
  title: string;
  shortDesc: string;
  fullExplanation: string;
  defenseKeyPoint: string;
  iconName: string;
}
