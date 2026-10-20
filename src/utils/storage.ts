import { AdministratorCredentials, DutySchedule, StaffMember } from '../types';
import { DEFAULT_ADMIN, INITIAL_STAFF_MEMBERS, SHIFT_CATEGORIES } from './constants';

const ADMIN_STORAGE_KEY = 'duty_admin_session_v1';
const STAFF_STORAGE_KEY = 'duty_staff_database_v1';
const SCHEDULES_STORAGE_KEY = 'duty_schedules_database_v1';

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates seed schedules across the current week for rich initial demonstration
 */
function generateSeedSchedules(staffList: StaffMember[], admin: AdministratorCredentials): DutySchedule[] {
  const today = new Date();
  const schedules: DutySchedule[] = [];

  const offsets = [-2, -1, 0, 1, 2, 3]; // Days relative to today

  const sampleConfigs = [
    {
      staffIndex: 0, // Dr. Olivia Montgomery
      catId: 'morning',
      station: 'Emergency Trauma Bay 1',
      priority: 'routine' as const,
      offset: 0,
    },
    {
      staffIndex: 1, // Nurse Liam Sterling
      catId: 'night',
      station: 'ICU Isolation Suite 3',
      priority: 'critical' as const,
      offset: 0,
    },
    {
      staffIndex: 2, // Dr. Tariq Al-Mansoor
      catId: 'morning',
      station: 'Main Surgical Theater A',
      priority: 'routine' as const,
      offset: 0,
    },
    {
      staffIndex: 3, // Nurse Beatrice Nwosu
      catId: 'morning',
      station: 'Pediatric Ward 4B',
      priority: 'routine' as const,
      offset: 1,
    },
    {
      staffIndex: 4, // Dr. Marcus Holloway
      catId: 'afternoon',
      station: 'Internal Medicine Ward 2A',
      priority: 'routine' as const,
      offset: 1,
    },
    {
      staffIndex: 5, // Chloe Zhao
      catId: 'lab_rotation',
      station: 'Hematology & Blood Bank Lab',
      priority: 'routine' as const,
      offset: 1,
    },
    {
      staffIndex: 6, // Dr. Sanjay Patel
      catId: 'emergency_on_call',
      station: 'Emergency Trauma Bay 1',
      priority: 'critical' as const,
      offset: 2,
    },
    {
      staffIndex: 0, // Dr. Olivia Montgomery (again on day 2)
      catId: 'morning',
      station: 'Emergency Triage Unit',
      priority: 'routine' as const,
      offset: 2,
    },
    {
      staffIndex: 2, // Dr. Tariq Al-Mansoor
      catId: 'weekend_vigil',
      station: 'Main Surgical Theater A',
      priority: 'routine' as const,
      offset: 3,
    },
    {
      staffIndex: 1, // Nurse Liam Sterling (past day -1)
      catId: 'night',
      station: 'ICU Isolation Suite 3',
      priority: 'critical' as const,
      offset: -1,
    },
  ];

  sampleConfigs.forEach((cfg, idx) => {
    const staff = staffList[cfg.staffIndex];
    if (!staff) return;

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + cfg.offset);
    const dateStr = formatDateISO(targetDate);

    const cat = SHIFT_CATEGORIES.find((c) => c.id === cfg.catId) || SHIFT_CATEGORIES[0];

    schedules.push({
      id: `SCH-${targetDate.getFullYear()}-${String(100 + idx).padStart(4, '0')}`,
      staffId: staff.id,
      staffName: staff.fullName,
      staffDepartment: staff.department,
      staffRole: staff.role,
      category: cat.id,
      categoryName: cat.name,
      date: dateStr,
      startTime: cat.defaultStartTime,
      endTime: cat.defaultEndTime,
      durationHours: cat.durationHours,
      dutyStation: cfg.station,
      priority: cfg.priority,
      notes: `Standard roster assignment for ${staff.department} unit.`,
      registeredBy: {
        officerName: admin.officerName,
        officerId: admin.officerId,
        cadre: admin.cadre,
        timestamp: targetDate.toISOString(),
        signatureStamp: admin.signatureStamp,
      },
      createdAt: targetDate.toISOString(),
    });
  });

  return schedules;
}

// ----------------------------------------------------------------------
// ADMINISTRATOR CREDENTIALS (STEP 2)
// ----------------------------------------------------------------------
export function getStoredAdmin(): AdministratorCredentials {
  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading admin session:', e);
  }
  return DEFAULT_ADMIN;
}

export function saveAdmin(credentials: AdministratorCredentials): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(credentials));
  } catch (e) {
    console.error('Error saving admin session:', e);
  }
}

// ----------------------------------------------------------------------
// STAFF DATABASE (STEPS 3 & 4)
// ----------------------------------------------------------------------
export function getStoredStaff(): StaffMember[] {
  try {
    const data = localStorage.getItem(STAFF_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading staff database:', e);
  }
  // Fallback to initial seed
  saveStoredStaff(INITIAL_STAFF_MEMBERS);
  return INITIAL_STAFF_MEMBERS;
}

export function saveStoredStaff(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
  } catch (e) {
    console.error('Error saving staff database:', e);
  }
}

export function addStaffMember(newStaff: StaffMember): StaffMember[] {
  const current = getStoredStaff();
  // Ensure unique ID
  const exists = current.some((s) => s.id.toLowerCase() === newStaff.id.toLowerCase());
  if (exists) {
    throw new Error(`Staff with ID ${newStaff.id} already exists in the database.`);
  }
  const updated = [newStaff, ...current];
  saveStoredStaff(updated);
  return updated;
}

export function updateStaffMember(updatedStaff: StaffMember): StaffMember[] {
  const current = getStoredStaff();
  const updated = current.map((s) => (s.id === updatedStaff.id ? updatedStaff : s));
  saveStoredStaff(updated);
  return updated;
}

export function deleteStaffMember(staffId: string): StaffMember[] {
  const current = getStoredStaff();
  const updated = current.filter((s) => s.id !== staffId);
  saveStoredStaff(updated);
  return updated;
}

// ----------------------------------------------------------------------
// SCHEDULES DATABASE (STEPS 7 & 8)
// ----------------------------------------------------------------------
export function getStoredSchedules(): DutySchedule[] {
  try {
    const data = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading schedules database:', e);
  }

  // Prepopulate seed schedules
  const staff = getStoredStaff();
  const admin = getStoredAdmin();
  const seeds = generateSeedSchedules(staff, admin);
  saveStoredSchedules(seeds);
  return seeds;
}

export function saveStoredSchedules(schedules: DutySchedule[]): void {
  try {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  } catch (e) {
    console.error('Error saving schedules database:', e);
  }
}

export function addSchedule(newSchedule: DutySchedule): DutySchedule[] {
  const current = getStoredSchedules();
  const updated = [newSchedule, ...current];
  saveStoredSchedules(updated);
  return updated;
}

export function updateSchedule(updatedSchedule: DutySchedule): DutySchedule[] {
  const current = getStoredSchedules();
  const updated = current.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s));
  saveStoredSchedules(updated);
  return updated;
}

export function deleteSchedule(scheduleId: string): DutySchedule[] {
  const current = getStoredSchedules();
  const updated = current.filter((s) => s.id !== scheduleId);
  saveStoredSchedules(updated);
  return updated;
}

export function resetAllDataToDefault(): { staff: StaffMember[]; schedules: DutySchedule[] } {
  saveStoredStaff(INITIAL_STAFF_MEMBERS);
  const admin = getStoredAdmin();
  const seeds = generateSeedSchedules(INITIAL_STAFF_MEMBERS, admin);
  saveStoredSchedules(seeds);
  return { staff: INITIAL_STAFF_MEMBERS, schedules: seeds };
}
