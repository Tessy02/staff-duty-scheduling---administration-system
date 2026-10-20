import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Calendar, 
  Search, 
  Filter, 
  Printer, 
  Trash2, 
  Eye, 
  Download, 
  Building2, 
  Stamp, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  MapPin,
  X,
  Layers,
  Table as TableIcon
} from 'lucide-react';
import { AdministratorCredentials, DutySchedule, StaffMember } from '../types';
import { DEPARTMENTS, SHIFT_CATEGORIES } from '../utils/constants';

interface DutyRosterViewProps {
  schedules: DutySchedule[];
  staffList: StaffMember[];
  admin: AdministratorCredentials;
  onDeleteSchedule: (scheduleId: string) => void;
  onNavigateToScheduler: () => void;
}

export const DutyRosterView: React.FC<DutyRosterViewProps> = ({
  schedules,
  staffList,
  admin,
  onDeleteSchedule,
  onNavigateToScheduler,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'workload' | 'print'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedScheduleForModal, setSelectedScheduleForModal] = useState<DutySchedule | null>(null);

  // Filters
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch =
        s.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dutyStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registeredBy.officerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || s.staffDepartment === selectedDept;
      const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;

      return matchesSearch && matchesDept && matchesCategory;
    });
  }, [schedules, searchTerm, selectedDept, selectedCategory]);

  // Calendar dates generation (e.g. 7 days starting from 2 days ago)
  const calendarDays = useMemo(() => {
    const today = new Date();
    const days: { dateStr: string; label: string; isToday: boolean }[] = [];
    for (let i = -1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      days.push({
        dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const exportSchedulesJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schedules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `duty_roster_database_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Step 8 Defense Retrieval Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                  DEFENSE STEP 8
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Retrieve Stored Duty Scheduling Information
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Query, inspect, and export committed duty assignments from the persistent schedules database. 
                Provides multiple retrieval modalities: Master Audit Table, Weekly Roster Grid, Workload Analytics, and Official Printable Roster.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={exportSchedulesJson}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              title="Export database schedules to JSON file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Print official clinical duty roster"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Official Roster</span>
            </button>
            <button
              onClick={onNavigateToScheduler}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule New Shift</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Clean Segmented Tabs) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Master Records Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Roster Grid</span>
            </button>
            <button
              onClick={() => setViewMode('workload')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'workload'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Staff Workload Compliance</span>
            </button>
            <button
              onClick={() => setViewMode('print')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'print'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Official Printable Layout</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing <strong className="text-slate-900">{filteredSchedules.length}</strong> of {schedules.length} stored records
          </div>
        </div>
      </div>

      {/* FILTER BAR (for Table & Grid views) */}
      {viewMode !== 'print' && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between no-print">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search schedule by staff name, ID, ward station, or officer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Shift Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="ALL">All Categories</option>
                {SHIFT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: MASTER RECORDS TABLE                                  */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ref ID &amp; Date</th>
                  <th className="py-3 px-4">Staff Member &amp; Dept</th>
                  <th className="py-3 px-4">Shift Category &amp; Hours</th>
                  <th className="py-3 px-4">Assigned Station</th>
                  <th className="py-3 px-4">Register Audit Stamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No duty schedules found for the selected query.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ref ID & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{item.id}</div>
                        <div className="text-[11px] text-slate-500">{item.date}</div>
                      </td>

                      {/* Staff & Dept */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.staffName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.staffDepartment} · {item.staffRole}
                        </div>
                      </td>

                      {/* Category & Hours */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{item.categoryName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.startTime} - {item.endTime} ({item.durationHours}h)</span>
                        </div>
                      </td>

                      {/* Station */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.dutyStation}</span>
                        </div>
                        {item.priority !== 'routine' && (
                          <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                            Priority: {item.priority.toUpperCase()}
                          </div>
                        )}
                      </td>

                      {/* Register Audit Stamp */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700 font-medium">{item.registeredBy.officerName}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate max-w-xs">
                          {item.registeredBy.signatureStamp}
                        </div>
                      </td>

                      {/* Status / Override */}
                      <td className="py-3 px-4">
                        {item.isOverridden ? (
                          <span className="text-amber-700 font-medium text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            Overridden
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Verified
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedScheduleForModal(item)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                            title="Inspect complete audit slip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete duty schedule ${item.id} for ${item.staffName}?`)) {
                                onDeleteSchedule(item.id);
                              }
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title="Delete schedule record"
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
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: WEEKLY ROSTER GRID                                    */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'calendar' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden no-print">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800">
              7-Day Rolling Duty Allocation Grid
            </h3>
            <span className="text-[11px] text-slate-500">
              Click any schedule to view audit details
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[420px]">
            {calendarDays.map((day) => {
              const daySchedules = filteredSchedules.filter((s) => s.date === day.dateStr);

              return (
                <div key={day.dateStr} className={`p-3 space-y-2.5 ${day.isToday ? 'bg-blue-50/40' : 'bg-white'}`}>
                  <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <div className={`text-xs font-bold ${day.isToday ? 'text-blue-700' : 'text-slate-900'}`}>
                        {day.label}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{day.dateStr}</div>
                    </div>
                    {day.isToday && (
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {daySchedules.length === 0 ? (
                      <div className="py-6 text-center text-[11px] text-slate-400">
                        No duties scheduled
                      </div>
                    ) : (
                      daySchedules.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setSelectedScheduleForModal(s)}
                          className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-xs bg-white text-xs space-y-1 cursor-pointer transition-all"
                        >
                          <div className="font-semibold text-slate-900 truncate">
                            {s.staffName}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {s.categoryName} ({s.startTime} - {s.endTime})
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono truncate">
                            {s.dutyStation}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            Ref: {s.id}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 3: STAFF WORKLOAD COMPLIANCE MATRIX                      */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'workload' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden no-print">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-800">
              Staff Workload &amp; Capacity Utilization (Step 6 Rule 3 Metric)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Evaluates current assigned duty hours against individual contract thresholds to prevent burnout.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Department &amp; Cadre</th>
                  <th className="py-3 px-4">Assigned Shifts</th>
                  <th className="py-3 px-4">Total Scheduled Hours</th>
                  <th className="py-3 px-4">Capacity Utilization</th>
                  <th className="py-3 px-4">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffList.map((staff) => {
                  const staffDuties = schedules.filter((s) => s.staffId === staff.id);
                  const totalHours = staffDuties.reduce((acc, s) => acc + (s.durationHours || 8), 0);
                  const percent = Math.min(100, Math.round((totalHours / (staff.maxWeeklyHours || 40)) * 100));

                  const isOver = totalHours > staff.maxWeeklyHours;
                  const isNear = totalHours >= staff.maxWeeklyHours * 0.8 && !isOver;

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{staff.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{staff.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{staff.department}</div>
                        <div className="text-[11px] text-slate-500">{staff.role}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {staffDuties.length} duties
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {totalHours}h / {staff.maxWeeklyHours}h max
                        </div>
                      </td>
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{percent}% utilized</span>
                      </td>
                      <td className="py-3 px-4">
                        {isOver ? (
                          <span className="text-rose-700 font-bold text-[11px]">Overload Warning</span>
                        ) : isNear ? (
                          <span className="text-amber-700 font-medium text-[11px]">Near Quota</span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-[11px]">Normal Load</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 4: OFFICIAL PRINTABLE CLINICAL DUTY ROSTER               */}
      {/* ------------------------------------------------------------- */}
      <div className={`${viewMode === 'print' ? 'block' : 'hidden'} print:block bg-white p-8 border border-slate-300 rounded-xl shadow-xs print:border-none print:shadow-none print:p-0`}>
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                CENTRAL CLINICAL SERVICES &amp; TEACHING HOSPITAL
              </h1>
              <h2 className="text-sm font-semibold text-slate-700 uppercase">
                OFFICIAL ADMINISTRATIVE STAFF DUTY ROSTER
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                Document Code: ROSTER-DOC-GEN/{new Date().getFullYear()} · Status: AUTHENTICATED
              </div>
            </div>
            <div className="text-right text-xs text-slate-600 font-mono">
              <div>Issue Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div>Duty Rota Period: Rolling 14-Day Cycle</div>
            </div>
          </div>
        </div>

        {/* Official Printable Table */}
        <table className="w-full text-left text-xs border border-slate-400 mb-8">
          <thead className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
            <tr>
              <th className="py-2 px-3 border-r border-slate-400">Schedule ID</th>
              <th className="py-2 px-3 border-r border-slate-400">Staff Member &amp; ID</th>
              <th className="py-2 px-3 border-r border-slate-400">Department / Role</th>
              <th className="py-2 px-3 border-r border-slate-400">Date &amp; Shift</th>
              <th className="py-2 px-3 border-r border-slate-400">Hours</th>
              <th className="py-2 px-3 border-r border-slate-400">Duty Workstation</th>
              <th className="py-2 px-3">Registering Officer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {filteredSchedules.map((s) => (
              <tr key={s.id} className="break-inside-avoid">
                <td className="py-2 px-3 font-mono font-semibold border-r border-slate-300">{s.id}</td>
                <td className="py-2 px-3 font-bold border-r border-slate-300">
                  {s.staffName} <span className="font-mono text-[10px] text-slate-500 font-normal">({s.staffId})</span>
                </td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {s.staffDepartment} - {s.staffRole}
                </td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {s.date} · {s.categoryName}
                </td>
                <td className="py-2 px-3 border-r border-slate-300 font-mono">
                  {s.startTime} - {s.endTime} ({s.durationHours}h)
                </td>
                <td className="py-2 px-3 border-r border-slate-300">
                  {s.dutyStation}
                </td>
                <td className="py-2 px-3 font-mono text-[11px]">
                  {s.registeredBy.officerName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Official Signatures Sign-Off Block */}
        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-400 break-inside-avoid">
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase text-slate-900">
              Prepared &amp; Authenticated By (Duty Register):
            </div>
            <div className="font-mono text-xs text-slate-700 space-y-1">
              <div>Officer: {admin.officerName}</div>
              <div>Cadre: {admin.cadre}</div>
              <div>Stamp Code: {admin.signatureStamp}</div>
            </div>
            <div className="pt-6 border-b border-slate-400 w-48"></div>
            <div className="text-[10px] text-slate-500">Official Signature &amp; Date Stamp</div>
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold uppercase text-slate-900">
              Approved By (Medical Director / Hospital Board):
            </div>
            <div className="font-mono text-xs text-slate-700 space-y-1">
              <div>Authorized Signatory: Office of the Chief Medical Superintendent</div>
              <div>Validation: Clinical Governance Committee</div>
            </div>
            <div className="pt-6 border-b border-slate-400 w-48"></div>
            <div className="text-[10px] text-slate-500">Chief Superintendent Signature &amp; Seal</div>
          </div>
        </div>
      </div>

      {/* SCHEDULE AUDIT SLIP INSPECTION MODAL */}
      {selectedScheduleForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Stamp className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                    AUDIT RECORD RETRIEVAL
                  </div>
                  <h3 className="text-sm font-bold">Duty Schedule Ref: {selectedScheduleForModal.id}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedScheduleForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase">Assigned Staff Details</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Full Name:</span>
                    <div className="font-semibold text-slate-900">{selectedScheduleForModal.staffName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Staff ID:</span>
                    <div className="font-mono text-slate-900">{selectedScheduleForModal.staffId}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Department:</span>
                    <div className="text-slate-900">{selectedScheduleForModal.staffDepartment}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Cadre:</span>
                    <div className="text-slate-900">{selectedScheduleForModal.staffRole}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase">Shift Parameters &amp; Duration</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Category:</span>
                    <div className="font-semibold text-slate-900">{selectedScheduleForModal.categoryName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Date:</span>
                    <div className="font-mono text-slate-900">{selectedScheduleForModal.date}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Time Range:</span>
                    <div className="font-mono text-slate-900">{selectedScheduleForModal.startTime} - {selectedScheduleForModal.endTime}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Duration:</span>
                    <div className="font-semibold text-slate-900">{selectedScheduleForModal.durationHours} Hours</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Assigned Duty Station:</span>
                    <div className="font-semibold text-slate-900">{selectedScheduleForModal.dutyStation}</div>
                  </div>
                </div>
              </div>

              {/* Digital Audit Stamp (Step 2 & Step 7 Traceability) */}
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authenticated Register Digital Stamp (Step 2 &amp; 7)</span>
                </div>
                <div className="text-emerald-900 space-y-0.5">
                  <div>Registered By: <strong>{selectedScheduleForModal.registeredBy.officerName}</strong> ({selectedScheduleForModal.registeredBy.cadre})</div>
                  <div>Officer ID: <span className="font-mono">{selectedScheduleForModal.registeredBy.officerId}</span></div>
                  <div>Digital Stamp Code: <span className="font-mono font-bold">{selectedScheduleForModal.registeredBy.signatureStamp}</span></div>
                  <div>Committed At: <span className="font-mono text-[11px]">{new Date(selectedScheduleForModal.createdAt).toLocaleString()}</span></div>
                </div>
              </div>

              {selectedScheduleForModal.isOverridden && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Emergency Administrative Override Logged:</span>
                  </div>
                  <div className="text-[11px]">{selectedScheduleForModal.overrideReason || 'Emergency clinical requirement override.'}</div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedScheduleForModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
