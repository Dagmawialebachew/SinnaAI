'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Search,
  ChevronRight,
  User,
  Check,
  Clock,
  RotateCcw,
  MoreHorizontal,
  FileText,
  Trash2,
  Copy,
  GripVertical,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
  Receipt,
  FileCheck,
  Printer
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printTreatmentPlan } from '@/lib/smart-print';
import { TreatmentPlan, TreatmentPlanStatus, PlanProcedureItem, PlanClinicalNote } from '@/lib/types';
import { TreatmentOdontogramChart } from '@/components/treatment-odontogram-chart';
import { TreatmentProcedureGrid, ProcedureDefinition } from '@/components/treatment-procedure-grid';
import { PatientRecordDrawer } from '@/components/patient-record-drawer';

interface AppliedToastState {
  id: string;
  title: string;
  procedureName: string;
  feeETB: number;
  toothNumber?: number | string | null;
  procedureId: string;
}

export default function TreatmentPlansPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Pipeline Navigation & Search State
  const [activeTab, setActiveTab] = useState<TreatmentPlanStatus | 'list'>('to_quote');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>('PLAN-2024-0003');

  // Charting & Modal State
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [patientDrawerOpen, setPatientDrawerOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteInputText, setNoteInputText] = useState('');
  const [notesFilter, setNotesFilter] = useState<'all' | 'plan' | 'treatment' | 'visit'>('all');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Minimal & Elegant Bottom-Right Application Toast
  const [appliedToast, setAppliedToast] = useState<AppliedToastState | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showAppliedToast = (toastData: AppliedToastState) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setAppliedToast(toastData);
    toastTimeoutRef.current = setTimeout(() => {
      setAppliedToast(null);
    }, 4000);
  };

  // New Plan Form State
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanPatientId, setNewPlanPatientId] = useState('apt-001');

  const plans = store.treatmentPlans || [];

  // Currently Active Plan in Detailed Workspace
  const activePlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || null;
  }, [plans, selectedPlanId]);

  // Filtered Plans for Pipeline List
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchesTab = activeTab === 'list' || p.status === activeTab;
      const matchesSearch =
        p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [plans, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      to_quote: plans.filter((p) => p.status === 'to_quote').length,
      awaiting_patient: plans.filter((p) => p.status === 'awaiting_patient').length,
      no_appointment: plans.filter((p) => p.status === 'no_appointment').length,
      no_next_appointment: plans.filter((p) => p.status === 'no_next_appointment').length,
      closed: plans.filter((p) => p.status === 'closed').length,
      list: plans.length,
    };
  }, [plans]);

  // Handlers for Plan Operations
  const handleApplyProcedure = (proc: ProcedureDefinition) => {
    if (!activePlan) return;

    const newItem: PlanProcedureItem = {
      id: `proc-${Date.now()}`,
      name: selectedTooth ? `${proc.name} (Tooth #${selectedTooth})` : proc.name,
      category: proc.category,
      toothNumber: selectedTooth || 'whole_mouth',
      feeETB: proc.feeETB,
      assignedDoctorCode: store.currentUser.role === 'doctor' ? 'ST' : 'CL',
      status: 'pending',
    };

    sinnaStore.addProcedureToPlan(activePlan.id, newItem);

    if (selectedTooth && proc.mapsToStatus) {
      sinnaStore.updatePlanChart(activePlan.id, selectedTooth, proc.mapsToStatus);
    }

    showAppliedToast({
      id: `toast-${Date.now()}`,
      title: selectedTooth ? `Applied to Tooth #${selectedTooth}` : 'Applied to Whole Mouth',
      procedureName: proc.name,
      feeETB: proc.feeETB,
      toothNumber: selectedTooth,
      procedureId: newItem.id,
    });
  };

  const handleQuickCleaning = () => {
    if (!activePlan) return;
    const cleaningItem: PlanProcedureItem = {
      id: `proc-${Date.now()}`,
      name: 'Ultrasonic Scaling & Prophylaxis (Whole Mouth)',
      category: 'whole_mouth',
      toothNumber: 'whole_mouth',
      feeETB: 1500,
      assignedDoctorCode: 'ST',
      status: 'pending',
    };
    sinnaStore.addProcedureToPlan(activePlan.id, cleaningItem);
    showAppliedToast({
      id: `toast-${Date.now()}`,
      title: 'Applied to Whole Mouth',
      procedureName: 'Ultrasonic Scaling & Prophylaxis',
      feeETB: 1500,
      toothNumber: 'whole_mouth',
      procedureId: cleaningItem.id,
    });
  };

  const handleQuickFirstVisit = () => {
    if (!activePlan) return;
    const examItem: PlanProcedureItem = {
      id: `proc-${Date.now()}`,
      name: 'First Visit Diagnostic Examination',
      category: 'whole_mouth',
      toothNumber: 'whole_mouth',
      feeETB: 500,
      assignedDoctorCode: 'ST',
      status: 'pending',
    };
    sinnaStore.addProcedureToPlan(activePlan.id, examItem);
    showAppliedToast({
      id: `toast-${Date.now()}`,
      title: 'Applied to Whole Mouth',
      procedureName: 'First Visit Diagnostic Examination',
      feeETB: 500,
      toothNumber: 'whole_mouth',
      procedureId: examItem.id,
    });
  };

  const handleRemoveProcedure = (procedureId: string) => {
    if (!activePlan) return;
    const item = activePlan.procedures.find((p) => p.id === procedureId);
    sinnaStore.removeProcedureFromPlan(activePlan.id, procedureId);
    if (item) {
      showAppliedToast({
        id: `toast-${Date.now()}`,
        title: 'Removed from Plan',
        procedureName: item.name,
        feeETB: item.feeETB,
        toothNumber: item.toothNumber,
        procedureId: '',
      });
    }
  };

  const handleAddNote = () => {
    if (!activePlan || !noteInputText.trim()) return;
    const newNote: PlanClinicalNote = {
      id: `note-${Date.now()}`,
      authorCode: store.currentUser.role === 'doctor' ? 'ST' : 'CL',
      authorName: store.currentUser.name,
      type: 'plan',
      content: noteInputText.trim(),
      createdAt: new Date().toLocaleString([], {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
    sinnaStore.addClinicalNoteToPlan(activePlan.id, newNote);
    setNoteInputText('');
    setNoteModalOpen(false);
    showAppliedToast({
      id: `toast-${Date.now()}`,
      title: 'Clinical Note Saved',
      procedureName: 'Recorded in permanent patient chart',
      feeETB: 0,
      toothNumber: null,
      procedureId: newNote.id,
    });
  };

  const handleCreateNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const patientApt = store.appointments.find((a) => a.id === newPlanPatientId) || store.appointments[0];
    const newPlanId = `PLAN-2026-${String(plans.length + 1).padStart(4, '0')}`;
    const initials = patientApt.patientName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const created: TreatmentPlan = {
      id: newPlanId,
      title: newPlanTitle.trim() || 'Comprehensive Treatment Plan',
      patientId: patientApt.id,
      patientName: patientApt.patientName,
      patientInitials: initials,
      patientPhone: patientApt.patientPhone,
      status: 'to_quote',
      currentStep: 1,
      quoteId: `PRES-2026-${String(plans.length + 1).padStart(4, '0')}`,
      quoteStatus: 'draft',
      quoteAmountETB: 500,
      agingDays: 0,
      appointmentState: 'no_appointment',
      chartNotation: {},
      archType: 'permanent',
      procedures: [
        {
          id: `proc-init-${Date.now()}`,
          name: 'First Visit Comprehensive Oral Examination',
          category: 'whole_mouth',
          toothNumber: 'whole_mouth',
          feeETB: 500,
          assignedDoctorCode: 'ST',
          status: 'pending',
        },
      ],
      clinicalNotes: [
        {
          id: `note-init-${Date.now()}`,
          authorCode: 'ST',
          authorName: store.currentUser.name,
          type: 'plan',
          content: 'Initial treatment planning session opened.',
          createdAt: new Date().toLocaleString([], {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sinnaStore.addTreatmentPlan(created);
    setSelectedPlanId(created.id);
    setNewPlanModalOpen(false);
    setNewPlanTitle('');
  };

  // Filtered notes in workspace
  const filteredNotes = useMemo(() => {
    if (!activePlan) return [];
    if (notesFilter === 'all') return activePlan.clinicalNotes;
    return activePlan.clinicalNotes.filter((n) => n.type === notesFilter);
  }, [activePlan, notesFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* =========================================================================
          VIEW A: DETAILED TREATMENT PLAN WORKSPACE (Exact match to Screenshot 2 & 3)
         ========================================================================= */}
      {activePlan ? (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. Header Bar with Plan Info, Stepper & Quick Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanId(null)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Pipeline</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {activePlan.id}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                {activePlan.title}
              </h1>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(activePlan.patientId);
                    setPatientDrawerOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  title="Open Ethiopian Paper Clinical Chart"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{activePlan.patientName}</span>
                </button>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-mono">
                  {activePlan.patientPhone}
                </span>

                {selectedTooth && (
                  <>
                    <span className="text-xs text-slate-400">·</span>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                      <span className="font-bold">Tooth #{selectedTooth} Active</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTooth(null)}
                        className="text-blue-500 hover:text-blue-800 p-0.5"
                        title="Clear tooth selection"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stepper (Plan -> Confirm -> In progress) & Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Clinical Stepper */}
              <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold gap-1">
                <button
                  type="button"
                  onClick={() => {
                    sinnaStore.updateTreatmentPlan(activePlan.id, { currentStep: 1, status: 'to_quote' });
                    showAppliedToast({
                      id: `toast-${Date.now()}`,
                      title: 'Stage: Treatment Planning',
                      procedureName: 'Active procedure staging',
                      feeETB: activePlan.quoteAmountETB,
                      toothNumber: null,
                      procedureId: '',
                    });
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                    activePlan.currentStep >= 1
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Stage 1: Clinical Planning"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sinnaStore.updateTreatmentPlan(activePlan.id, { currentStep: 2, status: 'awaiting_patient' });
                    showAppliedToast({
                      id: `toast-${Date.now()}`,
                      title: 'Stage: Confirmed with Patient',
                      procedureName: 'Awaiting patient approval & appointment',
                      feeETB: activePlan.quoteAmountETB,
                      toothNumber: null,
                      procedureId: '',
                    });
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activePlan.currentStep === 2
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : activePlan.currentStep > 2
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Stage 2: Patient Confirmation"
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] leading-4 font-mono">
                    2
                  </span>
                  <span>Confirm</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sinnaStore.updateTreatmentPlan(activePlan.id, { currentStep: 3, status: 'no_appointment' });
                    showAppliedToast({
                      id: `toast-${Date.now()}`,
                      title: 'Stage: In Progress',
                      procedureName: 'Restorative treatments underway',
                      feeETB: activePlan.quoteAmountETB,
                      toothNumber: null,
                      procedureId: '',
                    });
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activePlan.currentStep === 3
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Stage 3: Care Delivery"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-center text-[10px] leading-4 font-mono">
                    3
                  </span>
                  <span>In progress</span>
                </button>
              </div>

              {/* Quote Chip & Actions */}
              <Link
                href="/quotes"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
                title="View Treatment Quote"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Quote {activePlan.quoteId || 'PRES-2026-0042'} ({activePlan.quoteStatus || 'draft'})
                </span>
              </Link>

              {/* Reopen Action */}
              <button
                type="button"
                onClick={() => {
                  sinnaStore.updateTreatmentPlan(activePlan.id, {
                    status: 'to_quote',
                    currentStep: 1,
                  });
                  showAppliedToast({
                    id: `toast-${Date.now()}`,
                    title: 'Plan Reset to Planning',
                    procedureName: 'Reopened for clinical adjustments',
                    feeETB: activePlan.quoteAmountETB,
                    toothNumber: null,
                    procedureId: '',
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                title="Reopen plan for adjustments"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen</span>
              </button>

              {/* Print Summary Action */}
              <button
                type="button"
                onClick={() => {
                  if (activePlan) {
                    printTreatmentPlan(
                      {
                        id: activePlan.id,
                        title: activePlan.title,
                        patientName: activePlan.patientName,
                        status: activePlan.status,
                        doctorName: 'Dr. Senait Tadesse',
                        procedures: activePlan.procedures,
                        totalFeeETB: activePlan.quoteAmountETB,
                        clinicalNotes: activePlan.clinicalNotes,
                      },
                      clinic
                    );
                    sinnaStore.toastSuccess('Plan Ready', `Printing treatment plan for ${activePlan.patientName}`);
                  } else {
                    window.print();
                  }
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/90 transition-colors"
                title="Print Clinical Treatment Summary"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Options Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Plan Actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {moreMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 text-xs animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        if (activePlan) {
                          printTreatmentPlan(
                            {
                              id: activePlan.id,
                              title: activePlan.title,
                              patientName: activePlan.patientName,
                              status: activePlan.status,
                              doctorName: 'Dr. Senait Tadesse',
                              procedures: activePlan.procedures,
                              totalFeeETB: activePlan.quoteAmountETB,
                              clinicalNotes: activePlan.clinicalNotes,
                            },
                            clinic
                          );
                          sinnaStore.toastSuccess('Plan Ready', `Printing treatment plan for ${activePlan.patientName}`);
                        } else {
                          window.print();
                        }
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      <span>Print Summary</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        setSelectedPlanId(null);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                      <span>Close to Pipeline</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Main Two-Column Odontogram & Treatment Planning Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 of 12 cols): 32-Tooth Chart + Procedure Grid */}
            <div className="lg:col-span-7 space-y-6">
              {/* Anatomical Odontogram Chart */}
              <TreatmentOdontogramChart
                chartNotation={activePlan.chartNotation}
                selectedTooth={selectedTooth}
                onSelectTooth={(tooth) => {
                  setSelectedTooth(selectedTooth === tooth ? null : tooth);
                }}
                archType={activePlan.archType}
                onToggleArchType={(type) => {
                  sinnaStore.updateTreatmentPlan(activePlan.id, { archType: type });
                }}
                onWholeMouthSelect={() => setSelectedTooth(null)}
                onAddQuickCleaning={handleQuickCleaning}
                onAddQuickFirstVisit={handleQuickFirstVisit}
              />

              {/* Procedure Grid (Screenshot 3) */}
              <TreatmentProcedureGrid
                planTitle={activePlan.title}
                selectedTooth={selectedTooth}
                onApplyProcedure={handleApplyProcedure}
              />
            </div>

            {/* Right Column (5 of 12 cols): Plan Treatments Card + Clinical Notes Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 1: Plan Treatments (Exact match to DentalPin screenshot) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Plan Treatments
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {activePlan.procedures.length} pending
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
                  {activePlan.procedures.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No treatments added yet. Select a procedure from the catalog to stage care.
                    </div>
                  ) : (
                    activePlan.procedures.map((proc, index) => (
                      <div
                        key={proc.id}
                        className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0 cursor-grab" />
                          <span className="text-xs font-mono font-bold text-slate-400 w-4 shrink-0">
                            {index + 1}.
                          </span>
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {proc.assignedDoctorCode}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {proc.name}
                            </p>
                            {proc.toothNumber !== 'whole_mouth' && proc.toothNumber && (
                              <p className="text-[10px] text-blue-600 font-semibold font-mono">
                                Tooth #{proc.toothNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {proc.feeETB.toLocaleString()} ETB
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const duplicate: PlanProcedureItem = {
                                ...proc,
                                id: `proc-dup-${Date.now()}`,
                              };
                              sinnaStore.addProcedureToPlan(activePlan.id, duplicate);
                              showAppliedToast({
                                id: `toast-${Date.now()}`,
                                title:
                                  proc.toothNumber !== 'whole_mouth' && proc.toothNumber
                                    ? `Duplicated on Tooth #${proc.toothNumber}`
                                    : 'Duplicated on Whole Mouth',
                                procedureName: proc.name,
                                feeETB: proc.feeETB,
                                toothNumber: proc.toothNumber,
                                procedureId: duplicate.id,
                              });
                            }}
                            className="p-1 text-slate-300 hover:text-slate-600 rounded transition-colors"
                            title="Duplicate procedure"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveProcedure(proc.id)}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                            title="Remove procedure"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal & Conversion CTA */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Total Treatment Estimate</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {activePlan.quoteAmountETB.toLocaleString()} ETB
                    </span>
                  </div>

                  <Link
                    href={`/quotes?plan=${activePlan.id}`}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Generate Official MoR Fee Quote</span>
                  </Link>
                </div>
              </div>

              {/* Card 2: Clinical notes (Exact match to DentalPin screenshot) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Clinical notes
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNoteModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Plan note</span>
                  </button>
                </div>

                {/* Notes Filter Bar (All / Plan / Treatment / Visit) */}
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1 text-[11px] font-semibold text-slate-600 overflow-x-auto">
                  {(['all', 'plan', 'treatment', 'visit'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setNotesFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                        notesFilter === filter
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Notes List */}
                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  {filteredNotes.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No clinical notes recorded for this filter.
                    </p>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                              {note.authorCode}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {note.authorName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                              {note.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {note.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW B: TREATMENT PLANS PIPELINE (Exact match to Screenshot 1)
           ========================================================================= */
        <div className="space-y-6 animate-fadeIn">
          {/* 1. Header Bar with Pipeline Management */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Treatment Plans
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage the treatment pipeline.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setNewPlanModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New plan</span>
              </button>
            </div>
          </div>

          {/* 2. Pipeline Status Filter Bar (Exact match to Screenshot 1) */}
          <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('to_quote')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'to_quote'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>To quote</span>
              {tabCounts.to_quote > 0 && (
                <span className="ml-1.5 text-[10px] text-slate-400">({tabCounts.to_quote})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('awaiting_patient')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'awaiting_patient'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Awaiting patient</span>
              {tabCounts.awaiting_patient > 0 && (
                <span className="ml-1.5 text-[10px] text-slate-400">({tabCounts.awaiting_patient})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('no_appointment')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'no_appointment'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>No appointment</span>
              {tabCounts.no_appointment > 0 && (
                <span className="ml-1.5 text-[10px] text-slate-400">({tabCounts.no_appointment})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('no_next_appointment')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'no_next_appointment'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>No next appointment</span>
              {tabCounts.no_next_appointment > 0 && (
                <span className="ml-1.5 text-[10px] text-slate-400">({tabCounts.no_next_appointment})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('closed')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'closed'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Closed</span>
              {tabCounts.closed > 0 && (
                <span className="ml-1.5 text-[10px] text-slate-400">({tabCounts.closed})</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>List</span>
              <span className="ml-1.5 text-[10px] text-slate-400">({tabCounts.list})</span>
            </button>
          </div>

          {/* 3. Search Bar */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>

          {/* 4. Treatment Plans Pipeline List (Exact match to Screenshot 1) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden divide-y divide-slate-100">
            {filteredPlans.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No treatment plans in this stage. Click "+ New plan" to create one.
              </div>
            ) : (
              filteredPlans.map((plan) => {
                const completedCount = plan.procedures.filter((p) => p.status === 'completed').length;
                const totalCount = plan.procedures.length;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Left: Patient Avatar & Plan Meta */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:border-blue-400 group-hover:text-blue-600 transition-colors">
                        {plan.patientInitials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {plan.patientName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-slate-400">
                            {plan.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Treatments Fraction, Quote, and Status Aging */}
                    <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                      {/* Treatments Counter */}
                      <div className="text-left sm:text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Treatments
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800">
                          {completedCount} / {totalCount}
                        </span>
                      </div>

                      {/* Quote Column */}
                      <div className="text-left sm:text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Quote
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-400">
                            {plan.quoteStatus || 'draft'}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {plan.quoteAmountETB.toLocaleString()} ETB
                          </span>
                        </div>
                      </div>

                      {/* Aging Days & Appointment */}
                      <div className="text-left sm:text-right hidden md:block">
                        <span className="text-xs font-semibold text-slate-600 block">
                          {plan.agingDays} days in status
                        </span>
                        <span className="text-[11px] text-slate-400 block capitalize">
                          {plan.appointmentState.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Blue 'Open' Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanId(plan.id);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all active:scale-98"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL MODALS: NEW PLAN MODAL & ADD NOTE MODAL
         ========================================================================= */}
      {/* 1. New Treatment Plan Modal */}
      {newPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create Treatment Plan</h3>
              <button
                onClick={() => setNewPlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Comprehensive Scaling & Composite Restoration"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Patient
                </label>
                <select
                  value={newPlanPatientId}
                  onChange={(e) => setNewPlanPatientId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {store.appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.patientName} ({a.patientPhone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPlanModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs transition-colors"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Clinical Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Clinical Note</h3>
              <button
                onClick={() => setNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                rows={4}
                placeholder="Enter clinical observations, patient treatment staging, anesthetic considerations..."
                value={noteInputText}
                onChange={(e) => setNoteInputText(e.target.value)}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Universal Ethiopian Patient Record Drawer */}
      <PatientRecordDrawer
        isOpen={patientDrawerOpen}
        onClose={() => setPatientDrawerOpen(false)}
        appointmentId={selectedPatientId}
      />

      {/* 4. Elegant Minimal Bottom-Right Application Confirmation Bar */}
      {appliedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3.5 bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl shadow-2xl p-3 sm:p-3.5 px-4 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 max-w-sm sm:max-w-md select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">
                {appliedToast.title}
              </span>
              {appliedToast.toothNumber && appliedToast.toothNumber !== 'whole_mouth' && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  FDI #{appliedToast.toothNumber}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
              {appliedToast.procedureName}
              {appliedToast.feeETB > 0 && (
                <>
                  {' '}· <span className="font-mono text-emerald-400 font-bold">{appliedToast.feeETB.toLocaleString()} ETB</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {appliedToast.procedureId && (
              <button
                type="button"
                onClick={() => {
                  if (activePlan) {
                    handleRemoveProcedure(appliedToast.procedureId);
                  }
                  setAppliedToast(null);
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Undo application"
              >
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={() => setAppliedToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
