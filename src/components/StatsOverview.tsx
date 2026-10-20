import React from 'react';
import { 
  Users, 
  CalendarClock, 
  Clock, 
  ShieldCheck, 
  Building2,
  AlertOctagon,
  FileSpreadsheet
} from 'lucide-react';
import { DutySchedule, StaffMember } from '../types';
import { formatDateISO } from '../utils/storage';

interface StatsOverviewProps {
  staffList: StaffMember[];
  schedules: DutySchedule[];
  onOpenScheduler: () => void;
  onOpenStaff: () => void;
  onOpenRoster: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  staffList,
  schedules,
  onOpenScheduler,
  onOpenStaff,
  onOpenRoster,
}) => {
  const todayStr = formatDateISO(new Date());

  const activeStaff = staffList.filter((s) => s.status === 'active');
  const dutiesToday = schedules.filter((s) => s.date === todayStr);
  const totalScheduledHours = schedules.reduce((acc, s) => acc + (s.durationHours || 8), 0);
  const overriddenCount = schedules.filter((s) => s.isOverridden).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
      {/* Stat 1: Registered Staff */}
      <div 
        onClick={onOpenStaff}
        className="bg-white border border-slate-200 hover:border-emerald-300 p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Registered Staff
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{staffList.length}</span>
          <span className="text-xs text-emerald-600 font-medium">({activeStaff.length} Active)</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Stored in Database (Step 4)
        </div>
      </div>

      {/* Stat 2: Active Duties Today */}
      <div 
        onClick={onOpenRoster}
        className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Duties Today
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{dutiesToday.length}</span>
          <span className="text-xs text-blue-600 font-medium">Active Posts</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          {todayStr} Rota Rotation
        </div>
      </div>

      {/* Stat 3: Total Scheduled Shifts */}
      <div 
        onClick={onOpenRoster}
        className="bg-white border border-slate-200 hover:border-purple-300 p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Schedules
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{schedules.length}</span>
          <span className="text-xs text-purple-600 font-medium font-mono">{totalScheduledHours}h total</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Retrieved Records (Step 8)
        </div>
      </div>

      {/* Stat 4: Evaluation Engine Status */}
      <div 
        onClick={onOpenScheduler}
        className="bg-white border border-slate-200 hover:border-amber-300 p-4 rounded-xl shadow-xs cursor-pointer transition-all hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Conflict Engine
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-bold text-emerald-700 uppercase">Operational</span>
          <span className="text-xs text-slate-500">5 Rules</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          {overriddenCount > 0 ? `${overriddenCount} emergency overrides logged` : 'Zero unresolved conflicts'}
        </div>
      </div>
    </div>
  );
};
