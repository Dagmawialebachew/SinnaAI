'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printTreatmentPlan } from '@/lib/smart-print';
import { TreatmentPlan, TreatmentPlanStatus, PlanProcedureItem, PlanClinicalNote } from '@/lib/types';
import { TreatmentPlanWorkspace } from '@/components/treatment-plan-workspace';


export default function TreatmentPlansPage() {
  const router = useRouter();
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Pipeline Navigation & Search State
  const [activeTab, setActiveTab] = useState<TreatmentPlanStatus | 'list'>('to_quote');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // New Plan Modal State
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);

  // New Plan Form State
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanPatientId, setNewPlanPatientId] = useState('apt-001');

  const plans = store.treatmentPlans || [];

  // Check URL parameters for direct plan deep-linking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('planId') || params.get('id');
    if (pid && plans.some((p) => p.id === pid)) {
      setSelectedPlanId(pid);
    }
  }, [plans]);

  // Currently Active Plan in Detailed Workspace
  const activePlan = useMemo(() => {
    if (selectedPlanId) {
      const found = plans.find((p) => p.id === selectedPlanId);
      if (found) return found;
    }
    return null;
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


  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* =========================================================================
          VIEW A: DETAILED TREATMENT PLAN WORKSPACE (Exact match to Screenshot 2 & 3)
         ========================================================================= */}
      {activePlan ? (
        <TreatmentPlanWorkspace
          plan={activePlan}
          onBackToPipeline={() => setSelectedPlanId(null)}
          onOpenPatientRecord={(pid) => router.push(`/patients?patientId=${pid}&tab=clinical&clinicalTab=diagnosis`)}
        />
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
    </div>
  );
}

