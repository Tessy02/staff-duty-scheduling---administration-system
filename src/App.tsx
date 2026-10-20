/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdministratorCredentials, DutySchedule, StaffMember } from './types';
import { 
  getStoredAdmin, 
  saveAdmin, 
  getStoredStaff, 
  addStaffMember, 
  updateStaffMember, 
  deleteStaffMember, 
  getStoredSchedules, 
  addSchedule, 
  deleteSchedule, 
  resetAllDataToDefault,
  formatDateISO
} from './utils/storage';
import { Header } from './components/Header';
import { AdminLoginForm } from './components/AdminLoginForm';
import { StaffManagement } from './components/StaffManagement';
import { DutyScheduler } from './components/DutyScheduler';
import { DutyRosterView } from './components/DutyRosterView';
import { DefenseGuideModal } from './components/DefenseGuideModal';
import { StatsOverview } from './components/StatsOverview';

export default function App() {
  // Authentication & Register Session (Step 2)
  const [admin, setAdmin] = useState<AdministratorCredentials>(() => getStoredAdmin());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Staff Database (Steps 3 & 4)
  const [staffList, setStaffList] = useState<StaffMember[]>(() => getStoredStaff());

  // Schedules Database (Steps 7 & 8)
  const [schedules, setSchedules] = useState<DutySchedule[]>(() => getStoredSchedules());

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'defense' | 'staff' | 'scheduler' | 'roster'>('scheduler');

  // Pre-selected staff for scheduler
  const [quickScheduleStaff, setQuickScheduleStaff] = useState<StaffMember | null>(null);

  // Banner notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Step 2: Save Administrator Credentials
  const handleSaveAdmin = (newCreds: AdministratorCredentials) => {
    saveAdmin(newCreds);
    setAdmin(newCreds);
    showToast(`Officer session verified: ${newCreds.officerName} (${newCreds.cadre})`);
  };

  // Step 3 & 4: Staff Operations
  const handleAddStaff = (newStaff: StaffMember) => {
    const updated = addStaffMember(newStaff);
    setStaffList(updated);
    showToast(`Step 4: Successfully committed ${newStaff.fullName} to Staff Database.`);
  };

  const handleUpdateStaff = (updatedStaff: StaffMember) => {
    const updated = updateStaffMember(updatedStaff);
    setStaffList(updated);
    showToast(`Staff record updated for ${updatedStaff.fullName}.`);
  };

  const handleDeleteStaff = (staffId: string) => {
    const updated = deleteStaffMember(staffId);
    setStaffList(updated);
    showToast(`Staff member record removed from database.`);
  };

  // Step 5 trigger from staff table
  const handleQuickScheduleFromStaff = (staff: StaffMember) => {
    setQuickScheduleStaff(staff);
    setActiveTab('scheduler');
  };

  // Step 7: Submit Schedule
  const handleSubmitSchedule = (newSchedule: DutySchedule) => {
    const updated = addSchedule(newSchedule);
    setSchedules(updated);
    showToast(`Step 7 Complete: Schedule ${newSchedule.id} saved & signed by ${admin.officerName}.`);
  };

  // Step 8: Delete Schedule
  const handleDeleteSchedule = (scheduleId: string) => {
    const updated = deleteSchedule(scheduleId);
    setSchedules(updated);
    showToast(`Duty schedule ${scheduleId} removed from records.`);
  };

  // Reset all to sample defaults
  const handleResetData = () => {
    const res = resetAllDataToDefault();
    setStaffList(res.staff);
    setSchedules(res.schedules);
    showToast('Database reset to institutional sample records.');
  };

  // Live Simulation for Defense: Triggers a conflict evaluation instantly
  const handleSimulateConflict = () => {
    // Find a staff member with a schedule today
    const todayStr = formatDateISO(new Date());
    const existing = schedules.find((s) => s.date === todayStr) || schedules[0];
    if (existing) {
      const matchStaff = staffList.find((s) => s.id === existing.staffId) || staffList[0];
      setQuickScheduleStaff(matchStaff);
      setActiveTab('scheduler');
      showToast(`Conflict Simulation: Selected ${matchStaff.fullName} on existing duty date ${existing.date}.`);
    } else {
      setActiveTab('scheduler');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Step 1: Access System - Top Header & Register Badge */}
      <Header
        admin={admin}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onResetData={handleResetData}
        totalStaffCount={staffList.length}
        totalScheduleCount={schedules.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 no-print">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Stats Overview Bar */}
        <StatsOverview
          staffList={staffList}
          schedules={schedules}
          onOpenScheduler={() => setActiveTab('scheduler')}
          onOpenStaff={() => setActiveTab('staff')}
          onOpenRoster={() => setActiveTab('roster')}
        />

        {/* Content depending on Active Step Tab */}
        {activeTab === 'defense' && (
          <DefenseGuideModal
            onNavigateToTab={setActiveTab}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onSimulateConflict={handleSimulateConflict}
          />
        )}

        {activeTab === 'staff' && (
          <StaffManagement
            staffList={staffList}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            onQuickSchedule={handleQuickScheduleFromStaff}
          />
        )}

        {activeTab === 'scheduler' && (
          <DutyScheduler
            staffList={staffList}
            schedules={schedules}
            admin={admin}
            initialSelectedStaff={quickScheduleStaff}
            onSubmitSchedule={handleSubmitSchedule}
            onViewRoster={() => setActiveTab('roster')}
          />
        )}

        {activeTab === 'roster' && (
          <DutyRosterView
            schedules={schedules}
            staffList={staffList}
            admin={admin}
            onDeleteSchedule={handleDeleteSchedule}
            onNavigateToScheduler={() => setActiveTab('scheduler')}
          />
        )}
      </main>

      {/* Step 2: Authentication / Register Credentials Modal */}
      <AdminLoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentAdmin={admin}
        onSaveAdmin={handleSaveAdmin}
      />

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-5 border-t border-slate-800 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-semibold text-slate-300">
              Staff Information &amp; Duty Scheduling System · Academic Defense Model
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Implements 8-Step Defense Architecture: Access · Credentials Register · Staff Entry · Database Persistence · Detail Selection · Algorithmic Conflict Evaluation · Digital Stamping · Multi-Modal Retrieval
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Signing Officer: {admin.officerName}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('defense')}
              className="text-amber-400 hover:text-amber-300 underline"
            >
              8-Step Defense Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
