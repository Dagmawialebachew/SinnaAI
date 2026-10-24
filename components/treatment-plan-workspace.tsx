'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Check,
  Clock,
  RotateCcw,
  MoreHorizontal,
  FileText,
  Trash2,
  Copy,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
  Receipt,
  FileCheck,
  Printer,
  User,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Activity,
  Layers,
  ArrowRight,
  ArrowLeft,
  ClipboardList
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printTreatmentPlan } from '@/lib/smart-print';
import { TreatmentPlan, TreatmentPlanStatus, PlanProcedureItem, PlanClinicalNote, ToothStatus } from '@/lib/types';
import { TreatmentOdontogramChart } from '@/components/treatment-odontogram-chart';
import { TreatmentProcedureGrid, ProcedureDefinition } from '@/components/treatment-procedure-grid';

interface AppliedToastState {
  id: string;
  title: string;
  procedureName: string;
  feeETB: number;
  toothNumber?: number | string | null;
  procedureId: string;
}

interface QuickToothProcedure {
  id: string;
  name: string;
  feeETB: number;
  status: ToothStatus;
}

const TOOTH_QUICK_PROCEDURES: QuickToothProcedure[] = [
  { id: 'tq-comp', name: 'Composite Resin Restoration', feeETB: 1800, status: 'filled' },
  { id: 'tq-amal', name: 'Amalgam Restoration', feeETB: 1500, status: 'filled' },
  { id: 'tq-rct', name: 'Single-Visit Rotary Root Canal', feeETB: 6000, status: 'rct' },
  { id: 'tq-crown', name: 'Monolithic Zirconia Crown', feeETB: 7500, status: 'crown' },
  { id: 'tq-pfm', name: 'Porcelain-Fused-to-Metal Crown', feeETB: 5000, status: 'crown' },
  { id: 'tq-ext', name: 'Surgical Tooth Extraction', feeETB: 2000, status: 'missing' },
  { id: 'tq-pulp', name: 'Emergency Pulpotomy & Sedative', feeETB: 1200, status: 'rct' },
];

export interface TreatmentPlanWorkspaceProps {
  plan?: TreatmentPlan | null;
  patientId?: string | null;
  patientName?: string;
  patientMrn?: string;
  patientPhone?: string;
  viewMode?: 'all' | 'diagnosis' | 'treatment_plans';
  hideHeaderBanner?: boolean;
  activePlanTitle?: string;
  activePlanProgress?: { completed: number; total: number; percent: number };
  balanceETB?: number;
  totalPaidETB?: number;
  chartNotation?: Record<number, ToothStatus>;
  diagnosesUntreated?: string[];
  activityNotes?: Array<{
    id: string;
    authorName: string;
    authorInitials: string;
    category: string;
    procedureTag?: string;
    date: string;
    content: string;
  }>;
  onOpenPatientRecord?: (patientId: string) => void;
  onBackToPipeline?: () => void;
}

export function TreatmentPlanWorkspace({
  plan: propPlan,
  patientId,
  patientName,
  patientMrn,
  patientPhone,
  viewMode = 'all',
  hideHeaderBanner = false,
  activePlanTitle,
  activePlanProgress,
  balanceETB,
  totalPaidETB,
  chartNotation: propChartNotation,
  diagnosesUntreated,
  activityNotes,
  onOpenPatientRecord,
  onBackToPipeline
}: TreatmentPlanWorkspaceProps) {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const plans = store.treatmentPlans || [];

  // Resolve or create active plan strictly bound to the active customer (ZERO FLUFF)
  const activePlan = useMemo(() => {
    if (propPlan) return propPlan;
    if (patientId) {
      const found = plans.find((p) => p.patientId === patientId || (patientName && p.patientName.toLowerCase() === patientName.toLowerCase()));
      if (found) {
        return {
          ...found,
          title: activePlanTitle || found.title,
          chartNotation: {
            ...(propChartNotation || {}),
            ...(found.chartNotation || {}),
          },
        };
      }

      // If customer doesn't have an existing plan in store, synthesize a dynamic plan for THIS patient
      const initials = patientName
        ? patientName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        : 'PT';

      return {
        id: `PLAN-2026-${(patientId || '001').replace(/[^0-9]/g, '') || '0042'}`,
        title: activePlanTitle || `${patientName || 'Patient'}'s Clinical Treatment Plan`,
        patientId: patientId || 'apt-custom',
        patientName: patientName || 'Patient',
        patientInitials: initials,
        patientPhone: patientPhone || '+251 91 144 5566',
        status: 'to_quote' as TreatmentPlanStatus,
        currentStep: 1 as 1 | 2 | 3,
        quoteId: `PRES-2026-${(patientId || '001').replace(/[^0-9]/g, '') || '0042'}`,
        quoteStatus: 'draft' as const,
        quoteAmountETB: balanceETB || 0,
        agingDays: 1,
        appointmentState: 'scheduled' as const,
        chartNotation: propChartNotation || {},
        archType: 'permanent' as const,
        procedures: [],
        clinicalNotes: (activityNotes || []).map((act, i) => ({
          id: `note-${act.id || i}`,
          authorCode: act.authorInitials || 'ST',
          authorName: act.authorName || 'Dr. Senait Tadesse',
          type: (act.category === 'plan' ? 'plan' : act.category === 'treatment' ? 'treatment' : 'visit') as 'plan' | 'treatment' | 'visit',
          content: act.content,
          createdAt: act.date,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as TreatmentPlan;
    }
    return plans[0] || null;
  }, [propPlan, patientId, patientName, patientPhone, plans, propChartNotation, activePlanTitle, balanceETB, activityNotes]);

  // Synchronize dynamic plan into the store if not already present
  useEffect(() => {
    if (activePlan && patientId && !plans.some((p) => p.id === activePlan.id)) {
      sinnaStore.addTreatmentPlan(activePlan);
    }
  }, [activePlan, patientId, plans]);

  // Charting & Modal State
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [archType, setArchType] = useState<'permanent' | 'primary'>('permanent');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteInputText, setNoteInputText] = useState('');
  const [notesFilter, setNotesFilter] = useState<'all' | 'plan' | 'treatment' | 'visit'>('all');

  // Collapsible / Foldable Cards State
  const [isOdontogramFolded, setIsOdontogramFolded] = useState(false);
  const [isGridFolded, setIsGridFolded] = useState(false);
  const [isNotesFolded, setIsNotesFolded] = useState(false);
  const [isProtocolFolded, setIsProtocolFolded] = useState(false);
  const [isLedgerFolded, setIsLedgerFolded] = useState(false);

  // Bottom-Right Feedback Toast
  const [appliedToast, setAppliedToast] = useState<AppliedToastState | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showAppliedToast = (toastData: AppliedToastState) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setAppliedToast(toastData);
    toastTimeoutRef.current = setTimeout(() => {
      setAppliedToast(null);
    }, 4000);
  };

  // Plan Calculations
  const procedures = activePlan?.procedures || [];
  const planTotalETB = useMemo(() => {
    return procedures.reduce((sum, p) => sum + (p.feeETB || 0), 0);
  }, [procedures]);

  const activeAppointment = useMemo(() => {
    return store.appointments?.find(
      (a) =>
        a.id === patientId ||
        (patientName && a.patientName.toLowerCase() === patientName.toLowerCase()) ||
        (patientMrn && a.patientChart?.cardNo === patientMrn)
    );
  }, [store.appointments, patientId, patientName, patientMrn]);

  // Phase completion progress calculation
  const calculatedProgress = useMemo(() => {
    if (activePlanProgress) return activePlanProgress;
    if (procedures.length === 0) return { completed: 0, total: 0, percent: 0 };
    const completed = procedures.filter((p) => p.status === 'completed').length;
    const total = procedures.length;
    const percent = Math.round((completed / Math.max(total, 1)) * 100);
    return { completed, total, percent };
  }, [activePlanProgress, procedures]);

  // Handle Tooth Diagnosis / Status Override
  const handleSetToothStatus = (status: ToothStatus) => {
    if (!activePlan || selectedTooth === null) return;
    sinnaStore.updatePlanChart(activePlan.id, selectedTooth, status);
    showAppliedToast({
      id: `toast-${Date.now()}`,
      title: `Tooth #${selectedTooth} Status Updated`,
      procedureName: `Marked as ${status.toUpperCase()}`,
      feeETB: 0,
      toothNumber: selectedTooth,
      procedureId: '',
    });
  };

  // Handle Quick Tooth Procedure (1-Tap from inspector)
  const handleApplyToothProcedure = (proc: QuickToothProcedure) => {
    if (!activePlan || selectedTooth === null) return;
    const newItem: PlanProcedureItem = {
      id: `proc-${Date.now()}`,
      name: `${proc.name} (Tooth #${selectedTooth})`,
      category: 'restorative',
      toothNumber: selectedTooth,
      feeETB: proc.feeETB,
      assignedDoctorCode: store.currentUser.role === 'doctor' ? 'ST' : 'CL',
      status: 'pending',
    };
    sinnaStore.addProcedureToPlan(activePlan.id, newItem, activePlan);
    sinnaStore.updatePlanChart(activePlan.id, selectedTooth, proc.status);
    showAppliedToast({
      id: `toast-${Date.now()}`,
      title: `Applied to Tooth #${selectedTooth}`,
      procedureName: proc.name,
      feeETB: proc.feeETB,
      toothNumber: selectedTooth,
      procedureId: newItem.id,
    });
  };

  // Handle Procedure from Procedure & Add-ons Grid
  const handleApplyGridProcedure = (proc: ProcedureDefinition) => {
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

    sinnaStore.addProcedureToPlan(activePlan.id, newItem, activePlan);

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

  // Handle Quick Prophylaxis Action
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
    sinnaStore.addProcedureToPlan(activePlan.id, cleaningItem, activePlan);
    showAppliedToast({
      id: `toast-${Date.now()}`,
      title: 'Applied to Whole Mouth',
      procedureName: 'Ultrasonic Scaling & Prophylaxis',
      feeETB: 1500,
      toothNumber: 'whole_mouth',
      procedureId: cleaningItem.id,
    });
  };

  // Handle Quick First Visit Diagnostic Exam
  const handleQuickFirstVisit = () => {
    if (!activePlan) return;
    const examItem: PlanProcedureItem = {
      id: `proc-${Date.now()}`,
      name: 'First Visit Comprehensive Diagnostic Exam',
      category: 'whole_mouth',
      toothNumber: 'whole_mouth',
      feeETB: 500,
      assignedDoctorCode: 'ST',
      status: 'pending',
    };
    sinnaStore.addProcedureToPlan(activePlan.id, examItem, activePlan);
    showAppliedToast({
      id: `toast-${Date.now()}`,
      title: 'Applied to Whole Mouth',
      procedureName: 'First Visit Diagnostic Exam',
      feeETB: 500,
      toothNumber: 'whole_mouth',
      procedureId: examItem.id,
    });
  };

  // Remove Procedure from Plan
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

  // Add Clinical Note
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

  // Merged Customer Notes (activePlan notes + patient profile activity notes)
  const allNotes = useMemo(() => {
    const planNotes = activePlan?.clinicalNotes || [];
    const patientActs = (activityNotes || []).map((act) => ({
      id: `act-note-${act.id}`,
      authorCode: act.authorInitials || 'ST',
      authorName: act.authorName || 'Dr. Senait Tadesse',
      type: (act.category === 'plan' ? 'plan' : act.category === 'treatment' ? 'treatment' : 'visit') as 'plan' | 'treatment' | 'visit',
      content: act.content,
      createdAt: act.date,
    }));

    const seen = new Set<string>();
    const merged: PlanClinicalNote[] = [];
    for (const n of [...planNotes, ...patientActs]) {
      const key = n.content.trim().toLowerCase().slice(0, 30);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(n);
      }
    }
    return merged;
  }, [activePlan?.clinicalNotes, activityNotes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    if (notesFilter === 'all') return allNotes;
    return allNotes.filter((n) => n.type === notesFilter);
  }, [allNotes, notesFilter]);

  if (!activePlan) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-card">
        <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">No Treatment Plan Found</h3>
        <p className="text-xs text-slate-500 mt-1">Select or create a treatment plan to begin charting.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          1. HEADER BANNER (Shown on standalone /treatment-plans page)
         ========================================================================= */}
      {!hideHeaderBanner && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-4">
          {onBackToPipeline && (
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={onBackToPipeline}
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
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center shadow-2xs shrink-0">
                {activePlan.patientInitials || 'PT'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenPatientRecord ? (
                    <button
                      type="button"
                      onClick={() => onOpenPatientRecord(activePlan.patientId)}
                      className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                      title="Open Patient Profile"
                    >
                      {activePlan.patientName}
                    </button>
                  ) : (
                    <Link
                      href={`/patients?patientId=${activePlan.patientId}`}
                      className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                      title="Open Patient Profile"
                    >
                      {activePlan.patientName}
                    </Link>
                  )}
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                    {patientMrn || activePlan.id}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {activePlan.status === 'to_quote'
                      ? 'To quote'
                      : activePlan.status === 'awaiting_patient'
                      ? 'Awaiting patient'
                      : activePlan.status === 'no_appointment'
                      ? 'No appointment'
                      : activePlan.status === 'no_next_appointment'
                      ? 'No next appt'
                      : 'Closed'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Plan: {activePlan.title} · Quote: {activePlan.quoteId || 'PRES-2026-0001'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => printTreatmentPlan({ ...activePlan, totalFeeETB: activePlan.quoteAmountETB }, clinic)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                title="Print Ethiopian Clinical Treatment Plan"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Plan</span>
              </button>

              <Link
                href="/quotes"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors"
              >
                <Receipt className="w-3.5 h-3.5 text-blue-400" />
                <span>Stage Formal Quote</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Investment</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">{planTotalETB.toLocaleString()} ETB</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Procedures Staged</span>
              <span className="text-base font-extrabold text-blue-700 font-mono">{procedures.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Attending Specialist</span>
              <span className="text-xs font-bold text-slate-800 block truncate mt-1">Dr. Senait Tadesse</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Compliance</span>
              <span className="text-xs font-semibold text-emerald-700 block mt-1">MoR 0049283711</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. STAGED CLINICAL PROTOCOL & PHASE PROGRESS (Shown in Treatment Plans view)
         ========================================================================= */}
      {viewMode !== 'diagnosis' && (
        <div>
          {isProtocolFolded ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {activePlanTitle || activePlan?.title || 'Clinical Care Protocol'}
                    </h4>
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {calculatedProgress.percent}% Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {calculatedProgress.completed} of {calculatedProgress.total || procedures.length || 1} procedures completed · Total Investment: {(balanceETB !== undefined && totalPaidETB !== undefined ? (balanceETB + totalPaidETB) : planTotalETB).toLocaleString()} ETB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProtocolFolded(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto shrink-0"
              >
                <span>Expand Roadmap</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                    <span>{activePlanTitle || activePlan?.title || 'General Restorative Plan'}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Staged Ethiopian Clinical Dental Protocol &amp; Multi-Phase Restorative Roadmap
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href="/quotes"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Formal ETB Quote</span>
                  </Link>
                  <Link
                    href="/invoices"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Issue Fiscal MoR Invoice</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsProtocolFolded(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                    title="Fold Roadmap Card"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Phase Completion Progress */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">Phase Completion Progress</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {calculatedProgress.percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${calculatedProgress.percent}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    {calculatedProgress.completed} of {calculatedProgress.total || procedures.length || 1} procedures completed
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    Total Protocol Investment: {(balanceETB !== undefined && totalPaidETB !== undefined ? (balanceETB + totalPaidETB) : (planTotalETB > 0 ? planTotalETB : 11200)).toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* Dynamic Staged Procedure Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Staged Clinical Procedures (Phased Care Protocol)
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">BDS Clinical Guideline</span>
                </div>

                {procedures.length === 0 ? (
                  <div className="p-5 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs bg-slate-50/50">
                    <p className="font-semibold text-slate-600">No procedures staged for this protocol yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Switch to the Diagnosis tab to chart teeth or select procedures from the catalog.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {procedures.map((proc, idx) => (
                      <div key={proc.id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {proc.status === 'completed' ? (
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                              {idx + 1}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              Stage {idx + 1}: {proc.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {proc.status === 'completed'
                                ? 'Completed · Attending Specialist: Dr. Senait Tadesse'
                                : 'Planned · BDS Clinical Guideline'}
                              {proc.toothNumber && proc.toothNumber !== 'whole_mouth' ? ` · Tooth #${proc.toothNumber}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-slate-900 shrink-0 ml-2">
                          {proc.feeETB ? `${proc.feeETB.toLocaleString()} ETB` : '0 ETB'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3. ANATOMIC 32-TOOTH FDI ODONTOGRAM CHART (Shown in Diagnosis view)
         ========================================================================= */}
      {viewMode !== 'treatment_plans' && (
        <div className="space-y-4">
          {isOdontogramFolded ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h4v4H4z M16 4h4v4h-4z M4 16h4v4H4z M16 16h4v4h-4z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">32-Tooth FDI Anatomic Odontogram</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      Planning
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {archType === 'permanent' ? 'Permanent Arch (32 Teeth)' : 'Primary Arch (20 Teeth)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Roots, Crown &amp; Occlusal Facets · {Object.keys(activePlan.chartNotation || {}).length} charted conditions on file
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOdontogramFolded(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto shrink-0"
              >
                <span>Expand Dental Chart</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => setIsOdontogramFolded(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
                >
                  <span>Fold Dental Chart</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              <TreatmentOdontogramChart
                chartNotation={activePlan.chartNotation || {}}
                selectedTooth={selectedTooth}
                onSelectTooth={(num) => setSelectedTooth(selectedTooth === num ? null : num)}
                archType={archType}
                onToggleArchType={(type) => setArchType(type)}
                onWholeMouthSelect={() => setSelectedTooth(null)}
                onAddQuickCleaning={handleQuickCleaning}
                onAddQuickFirstVisit={handleQuickFirstVisit}
              />

              {/* Selected Tooth Clinical Action Inspector (Appears when a tooth is selected) */}
              {selectedTooth && (
                <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-4 shadow-card animate-spring-pop space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-2xs">
                        {selectedTooth}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          FDI Tooth #{selectedTooth} Quick Diagnosis &amp; Restorative Staging
                        </h4>
                        <p className="text-xs text-slate-500">
                          Current Condition: <span className="font-bold uppercase text-blue-700">{(activePlan.chartNotation && activePlan.chartNotation[selectedTooth]) || 'Healthy / Sound'}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTooth(null)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 self-start sm:self-auto"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Close</span>
                    </button>
                  </div>

                  {/* Quick Status Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mr-1">
                      Mark Status:
                    </span>
                    {[
                      { label: 'Healthy', val: 'healthy' as ToothStatus, color: 'bg-white text-slate-700 border-slate-200' },
                      { label: 'Caries', val: 'caries' as ToothStatus, color: 'bg-amber-100 text-amber-800 border-amber-300' },
                      { label: 'Filled', val: 'filled' as ToothStatus, color: 'bg-blue-100 text-blue-800 border-blue-300' },
                      { label: 'Crown', val: 'crown' as ToothStatus, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                      { label: 'Root Canal', val: 'rct' as ToothStatus, color: 'bg-purple-100 text-purple-800 border-purple-300' },
                      { label: 'Missing', val: 'missing' as ToothStatus, color: 'bg-slate-200 text-slate-800 border-slate-300' },
                    ].map((st) => (
                      <button
                        key={st.val}
                        type="button"
                        onClick={() => handleSetToothStatus(st.val)}
                        className={`px-2.5 py-1 rounded-lg border transition-all text-xs ${
                          activePlan.chartNotation && activePlan.chartNotation[selectedTooth] === st.val
                            ? 'ring-2 ring-blue-600 font-bold ' + st.color
                            : 'hover:bg-slate-100 ' + st.color
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* 1-Tap Fast Restorative Procedures for this Tooth */}
                  <div className="pt-1">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1-Tap Clinical Procedures for Tooth #{selectedTooth}:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TOOTH_QUICK_PROCEDURES.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleApplyToothProcedure(p)}
                          className="p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-blue-50 hover:border-blue-300 text-left transition-all group shadow-2xs"
                        >
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] font-mono font-semibold text-blue-600 mt-0.5">
                            +{p.feeETB.toLocaleString()} ETB
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          4. FULL PROCEDURE & DOCTOR ADD-ONS CATALOG GRID (Shown in Diagnosis view)
         ========================================================================= */}
      {viewMode !== 'treatment_plans' && (
        <div>
          {isGridFolded ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">Clinical Procedures &amp; Add-ons Catalog</h4>
                    <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      28+ Procedures
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Restorative, Surgery, Endodontics, Orthodontics, Imaging &amp; Whole Mouth catalog
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGridFolded(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto shrink-0"
              >
                <span>Expand Procedure Catalog</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => setIsGridFolded(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
                >
                  <span>Fold Procedure Catalog</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

              <TreatmentProcedureGrid
                planTitle={activePlan.title}
                selectedTooth={selectedTooth}
                onApplyProcedure={handleApplyGridProcedure}
              />
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          5. STAGED TREATMENT PLAN LEDGER (Shown in Treatment Plans view)
         ========================================================================= */}
      {viewMode !== 'diagnosis' && (
        <div>
          {isLedgerFolded ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">Staged Treatment Procedures Ledger</h4>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      {procedures.length} {procedures.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-slate-900">
                      {planTotalETB.toLocaleString()} ETB
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Itemized clinical procedures and fiscal MoR estimate breakdown
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLedgerFolded(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto shrink-0"
              >
                <span>Expand Ledger</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
              <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Staged Treatment Procedures Ledger
                  </h3>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {procedures.length} {procedures.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">Plan Total:</span>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {planTotalETB.toLocaleString()} ETB
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLedgerFolded(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                    title="Fold Ledger Card"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {procedures.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Stethoscope className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                  <p className="font-semibold text-slate-600">No procedures staged yet</p>
                  <p className="text-slate-400 mt-0.5">Switch to the Diagnosis tab to chart teeth or select procedures from the catalog.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {procedures.map((proc, idx) => (
                    <div
                      key={proc.id}
                      className="p-3.5 px-5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {proc.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {proc.toothNumber && proc.toothNumber !== 'whole_mouth' ? `Tooth #${proc.toothNumber} · ` : 'Whole mouth · '}
                            <span className="capitalize">{(proc.category || '').replace('_', ' ')}</span> · Doctor: {proc.assignedDoctorCode || 'ST'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {proc.feeETB ? `${proc.feeETB.toLocaleString()} ETB` : '0 ETB'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveProcedure(proc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove procedure from plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 px-5 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Total Treatment Estimate (MoR Compliant):</span>
                      <span className="font-mono font-extrabold text-blue-700 text-base">
                        {planTotalETB.toLocaleString()} ETB
                      </span>
                    </div>

                    {activeAppointment && activeAppointment.status === 'in_progress' && (
                      <button
                        type="button"
                        onClick={() => {
                          sinnaStore.completeDoctorEncounter(activeAppointment.id, {
                            finalFeeETB: planTotalETB > 0 ? planTotalETB : activeAppointment.totalDueETB,
                            notes: `Staged treatment plan: ${procedures.map((p) => p.name).join(', ')}`,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs active:scale-98 transition-all"
                        title="Complete encounter and send treatment plan monies directly to Cashier Desk"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Done → Send to Cashier ({planTotalETB.toLocaleString()} ETB)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          6. DOCTOR CLINICAL NOTES FEED (Foldable, Shared in both views)
         ========================================================================= */}
      <div>
        {isNotesFolded ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center font-bold text-xs shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">Clinical Notes &amp; Treatment History</h4>
                  <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {allNotes.length} {allNotes.length === 1 ? 'record' : 'records'} on file
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Doctor progress notes, clinical diagnoses &amp; diagnostic chart entries
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNotesFolded(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto shrink-0"
            >
              <span>Expand Notes Feed</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Clinical Notes &amp; Treatment History
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNotesFolded(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
                  title="Fold Notes Card"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(['all', 'plan', 'treatment', 'visit'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setNotesFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    notesFilter === filter
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredNotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No clinical notes recorded for this filter.</p>
            ) : (
              <div className="space-y-2.5">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span className="font-bold text-slate-800">{note.authorName} ({note.authorCode})</span>
                      <span>{note.createdAt}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-sans">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Creation Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Add Clinical Note</h3>
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={4}
              value={noteInputText}
              onChange={(e) => setNoteInputText(e.target.value)}
              placeholder="e.g. Tooth 16 occlusal caries excavated to firm dentin. 37% phosphoric acid etch 15s, composite restored in 2mm increments. Bite verified."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-slate-50/50"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNote}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-2xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. BOTTOM-RIGHT APPLIED PROCEDURE FEEDBACK TOAST
         ========================================================================= */}
      {appliedToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-spring-pop">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-100 truncate">{appliedToast.title}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {appliedToast.procedureName} {appliedToast.feeETB > 0 ? `· +${appliedToast.feeETB.toLocaleString()} ETB` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAppliedToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
