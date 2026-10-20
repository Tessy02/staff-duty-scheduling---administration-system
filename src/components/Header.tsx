import React from 'react';
import { 
  Building2, 
  UserCheck, 
  GraduationCap, 
  Calendar, 
  Users, 
  CalendarClock, 
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';
import { AdministratorCredentials } from '../types';

interface HeaderProps {
  admin: AdministratorCredentials;
  activeTab: 'defense' | 'staff' | 'scheduler' | 'roster';
  onSelectTab: (tab: 'defense' | 'staff' | 'scheduler' | 'roster') => void;
  onOpenLoginModal: () => void;
  onResetData: () => void;
  totalStaffCount: number;
  totalScheduleCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  admin,
  activeTab,
  onSelectTab,
  onOpenLoginModal,
  onResetData,
  totalStaffCount,
  totalScheduleCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md no-print">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-sm border border-emerald-500">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                CENTRAL STAFF DUTY SCHEDULING SYSTEM
              </h1>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                ACADEMIC DEFENSE EDITION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional Staff Database, Automated Conflict Evaluation &amp; Duty Roster Administration
            </p>
          </div>
        </div>

        {/* Right side: Authenticated Register Credentials & Action */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Defense presentation launcher */}
          <button
            onClick={() => onSelectTab('defense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'defense'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-amber-500/30'
            }`}
            title="Launch 8-Step System Walkthrough for project defense"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Defense Guide (8 Steps)</span>
          </button>

          {/* Authenticated Register badge (Step 2) */}
          <div 
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 cursor-pointer transition-colors"
            title="Click to view or edit Duty Register's credentials (Step 2)"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-slate-200 flex items-center gap-1">
                <span>{admin.officerName}</span>
                <span className="text-[10px] text-slate-400 font-mono">({admin.officerId})</span>
              </div>
              <div className="text-[10px] text-slate-400">
                {admin.cadre} · <span className="text-emerald-400 font-mono">Signed In</span>
              </div>
            </div>
            <span className="text-[11px] text-blue-400 hover:text-blue-300 ml-1 underline underline-offset-2">
              Edit
            </span>
          </div>

          {/* Quick reset data button */}
          <button
            onClick={() => {
              if (window.confirm('Reset staff database and duty schedules back to default institutional samples?')) {
                onResetData();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title="Reset to default sample staff & schedules"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation tabs corresponding to the system workflow */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('staff')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md flex items-center gap-2 transition-colors ${
                activeTab === 'staff'
                  ? 'bg-slate-800 text-white border-b-2 border-emerald-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Management (Steps 3 &amp; 4)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-700/60 text-slate-300 rounded">
                {totalStaffCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('scheduler')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md flex items-center gap-2 transition-colors ${
                activeTab === 'scheduler'
                  ? 'bg-slate-800 text-white border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Duty Scheduler &amp; Evaluation (Steps 5, 6 &amp; 7)</span>
            </button>

            <button
              onClick={() => onSelectTab('roster')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md flex items-center gap-2 transition-colors ${
                activeTab === 'roster'
                  ? 'bg-slate-800 text-white border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Retrieve Schedules / Roster (Step 8)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-700/60 text-slate-300 rounded">
                {totalScheduleCount}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('defense')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md flex items-center gap-2 transition-colors ${
                activeTab === 'defense'
                  ? 'bg-slate-800 text-amber-300 border-b-2 border-amber-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>System Flow Architecture</span>
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Evaluation Engine: Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
