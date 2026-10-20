import React, { useState } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  UserPlus, 
  Database, 
  CalendarCheck2, 
  Sparkles, 
  FileCheck, 
  FileSpreadsheet, 
  Compass, 
  Zap, 
  HelpCircle,
  Play
} from 'lucide-react';
import { SYSTEM_STEPS } from '../utils/constants';

interface DefenseGuideModalProps {
  onNavigateToTab: (tab: 'defense' | 'staff' | 'scheduler' | 'roster') => void;
  onOpenLoginModal: () => void;
  onSimulateConflict: () => void;
}

export const DefenseGuideModal: React.FC<DefenseGuideModalProps> = ({
  onNavigateToTab,
  onOpenLoginModal,
  onSimulateConflict,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const stepIcons = [
    <Compass className="w-5 h-5" key="1" />,
    <ShieldCheck className="w-5 h-5" key="2" />,
    <UserPlus className="w-5 h-5" key="3" />,
    <Database className="w-5 h-5" key="4" />,
    <CalendarCheck2 className="w-5 h-5" key="5" />,
    <Sparkles className="w-5 h-5" key="6" />,
    <FileCheck className="w-5 h-5" key="7" />,
    <FileSpreadsheet className="w-5 h-5" key="8" />,
  ];

  const currentStep = SYSTEM_STEPS[activeStepIndex];

  return (
    <div className="space-y-6">
      {/* Defense Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>PROJECT DEFENSE ARCHITECTURE MASTER GUIDE</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              System Operational Flow &amp; Algorithmic Pipeline
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              This master walkthrough articulates the exact 8-stage operational pipeline of the administrative duty scheduling system. 
              Designed specifically for your project defense, examination presentation, and committee review.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onSimulateConflict}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              title="Demonstrate Step 6 Conflict Evaluation Engine live"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate Conflict Evaluation</span>
            </button>
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Inspect Register Credentials</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8-Step Interactive Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {SYSTEM_STEPS.map((step, idx) => {
            const isCurrent = idx === activeStepIndex;
            const isCompleted = idx < activeStepIndex;

            return (
              <React.Fragment key={step.stepNumber}>
                <button
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all text-center flex-1 ${
                    isCurrent
                      ? 'bg-blue-50 border-2 border-blue-600 text-blue-900 shadow-xs'
                      : isCompleted
                      ? 'bg-slate-50 border border-emerald-300 text-slate-800 hover:bg-slate-100'
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                  </div>
                  <div className="text-[11px] font-bold truncate max-w-[100px]">
                    Step {step.stepNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[95px]">
                    {step.title.split(' ')[0]} {step.title.split(' ')[1] || ''}
                  </div>
                </button>

                {idx < SYSTEM_STEPS.length - 1 && (
                  <div className="w-3 h-0.5 bg-slate-300 shrink-0"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Detail Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {stepIcons[activeStepIndex]}
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-blue-600 uppercase">
                PHASE {currentStep.stepNumber} OF 8
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => prev - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous Step
            </button>
            <button
              disabled={activeStepIndex === SYSTEM_STEPS.length - 1}
              onClick={() => setActiveStepIndex((prev) => prev + 1)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Explanation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Formal User &amp; System Specification
              </div>
              <p className="text-sm font-semibold text-slate-900">
                "{currentStep.shortDesc}"
              </p>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Technical Software Implementation
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                {currentStep.fullExplanation}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span>Defense Panel Talking Point (What to Explain to Examiners)</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {currentStep.defenseKeyPoint}
              </p>
            </div>

            {/* Interactive Test Action for this Step */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-blue-950">
                  Live Demonstration Action
                </div>
                <div className="text-[11px] text-blue-700">
                  Test and showcase Step {currentStep.stepNumber} live in the interface:
                </div>
              </div>

              <div>
                {currentStep.stepNumber === 1 && (
                  <button
                    onClick={() => onNavigateToTab('defense')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>View System Home</span>
                  </button>
                )}
                {currentStep.stepNumber === 2 && (
                  <button
                    onClick={onOpenLoginModal}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Open Credentials Form</span>
                  </button>
                )}
                {(currentStep.stepNumber === 3 || currentStep.stepNumber === 4) && (
                  <button
                    onClick={() => onNavigateToTab('staff')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Go to Staff Database</span>
                  </button>
                )}
                {(currentStep.stepNumber === 5 || currentStep.stepNumber === 6 || currentStep.stepNumber === 7) && (
                  <button
                    onClick={() => onNavigateToTab('scheduler')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch Duty Scheduler</span>
                  </button>
                )}
                {currentStep.stepNumber === 8 && (
                  <button
                    onClick={() => onNavigateToTab('roster')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Retrieve Roster Records</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 8-Step System Architecture Flow Summary */}
        <div className="pt-4 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-800 uppercase mb-3">
            Complete Dataflow Pipeline Summary
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">1. Access &amp; 2. Log in</div>
              <p className="text-[11px] text-slate-600">
                Administrator opens app &amp; enters Register credentials. Form captures officer cadre &amp; stamp without bulky DB.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">3. Enter Staff &amp; 4. Save</div>
              <p className="text-[11px] text-slate-600">
                Staff form captures ID, cadre, skills, max weekly hours, and rest constraints, saving records directly to database.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">5. Select &amp; 6. Evaluate</div>
              <p className="text-[11px] text-slate-600">
                Admin selects staff + category + duration. Algorithmic engine verifies overlap, rest fatigue, and weekly load in real-time.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">7. Submit &amp; 8. Retrieve</div>
              <p className="text-[11px] text-slate-600">
                Schedule is committed with officer audit stamp. Multi-view roster retrieves records in Table, Grid, Workload &amp; Print format.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
