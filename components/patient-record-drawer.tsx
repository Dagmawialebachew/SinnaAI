'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  User,
  Phone,
  Stethoscope,
  Calendar,
  AlertCircle,
  Clock,
  Receipt,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  FileText,
  Printer,
  Pill,
  Activity,
  MapPin,
  HeartPulse,
  Send
} from 'lucide-react';
import { useSinnaStore, sinnaStore } from '@/lib/store';
import { Appointment } from '@/lib/types';

interface PatientRecordDrawerProps {
  appointmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientRecordDrawer({
  appointmentId,
  isOpen,
  onClose,
}: PatientRecordDrawerProps) {
  const router = useRouter();
  const store = useSinnaStore();

  if (!isOpen || !appointmentId) return null;

  const apt = store.appointments.find((a) => a.id === appointmentId) || store.appointments[0];
  if (!apt) return null;

  const chart = apt.patientChart;
  const contract = store.contracts?.find(
    (c) => c.patientId === apt.id || c.patientName.toLowerCase() === apt.patientName.toLowerCase()
  );

  const handleOpenDoctorChair = () => {
    const targetChair = apt.chairNumber || 1;
    sinnaStore.occupyChair(targetChair, apt.id, apt.doctorName, apt.patientName);
    onClose();
    router.push('/doctor');
  };

  const handlePrintChart = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer (Width: max-w-2xl for full clinical paper chart) */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              {apt.patientName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-lg text-slate-900">
                  {apt.patientName}
                </h2>
                {chart?.fullNameAmharic && (
                  <span className="text-xs font-semibold text-slate-500 font-amharic">
                    ({chart.fullNameAmharic})
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  {apt.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                <span>MRN: {chart?.cardNo || 'BDS-MRN-2026-0041'}</span>
                <span>·</span>
                <span>{apt.patientPhone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintChart}
              title="Print official clinical paper chart"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors border border-slate-200/70"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Ethiopian Clinical Chart */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* 1. Critical Medical Alerts & Systemic Precautions */}
          {apt.medicalAlerts && apt.medicalAlerts.length > 0 && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Critical Medical Alerts & Precautions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {apt.medicalAlerts.map((alert) => (
                  <span
                    key={alert.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white text-rose-700 border border-rose-200 shadow-2xs"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{alert.labelEn}</span>
                    <span className="text-rose-500 font-normal">({alert.labelAm})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. Patient Demographics & Administrative Record */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Demographic & Contact Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Age & Gender</p>
                <p className="font-semibold text-slate-800 mt-0.5">{chart?.age || 32} yrs · {chart?.gender || 'Female'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Occupation</p>
                <p className="font-semibold text-slate-800 mt-0.5">{chart?.occupation || 'Private Sector Professional'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Address / Subcity</p>
                <p className="font-semibold text-slate-800 mt-0.5">{chart?.subcityWoreda || 'Bole Subcity, Addis Ababa'}</p>
              </div>
            </div>

            {chart?.emergencyContact && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {chart.emergencyContact.name} ({chart.emergencyContact.relationship}) · {chart.emergencyContact.phone}
                </span>
              </div>
            )}
          </div>

          {/* 3. Chief Complaint (CC) & History of Present Illness (HPI) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chief Complaint & HPI</span>
            </h3>
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs italic">
              "{chart?.chiefComplaint || 'Sharp toothache on lower left molar radiating to ear, exacerbates with cold drinks.'}"
            </div>
            <div className="text-xs text-slate-600 leading-relaxed pt-1">
              <span className="font-semibold text-slate-800">HPI: </span>
              {chart?.hpi || 'Pain progressive over past 3 days, VAS 8/10, partially relieved by Paracetamol.'}
            </div>
          </div>

          {/* 4. Clinical Examination & Diagnostic Findings */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>Clinical Examination Findings</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                <span className="w-32 shrink-0 font-semibold text-slate-700">Extraoral Exam:</span>
                <span className="text-slate-600">{chart?.clinicalFindings.extraoral || 'Symmetrical face, TMJ normal, no regional lymphadenopathy.'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                <span className="w-32 shrink-0 font-semibold text-slate-700">Intraoral Soft Tissue:</span>
                <span className="text-slate-600">{chart?.clinicalFindings.intraoralSoftTissue || 'Normal buccal mucosa, marginal gingival erythema.'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                <span className="w-32 shrink-0 font-semibold text-slate-700">Hard Tissue (Teeth):</span>
                <span className="text-slate-600">{chart?.clinicalFindings.intraoralHardTissue || 'Cavitated dentin caries on Tooth #36 communicating with pulp.'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                <span className="w-32 shrink-0 font-semibold text-slate-700">Diagnostic Tests:</span>
                <span className="font-mono text-slate-800">Percussion: {chart?.clinicalFindings.percussionTest || 'Positive (+)'} · Vitality: {chart?.clinicalFindings.vitalityTest || 'Non-vital'}</span>
              </div>
              {chart?.radiographicNotes && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 pt-1 border-t border-slate-100">
                  <span className="w-32 shrink-0 font-semibold text-slate-700">Radiographic (X-Ray):</span>
                  <span className="text-slate-600">{chart.radiographicNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Course-of-Care Contract (Braces / Multi-visit Plan) */}
          {contract && (
            <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border border-indigo-200/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white shadow-2xs">
                    {contract.id}
                  </span>
                  <span className="text-xs font-bold text-indigo-950">
                    Course-of-Care Installment Plan
                  </span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-md border border-indigo-200">
                  {contract.intervalWeeks}-Wk Cadence (1 Month)
                </span>
              </div>

              <div>
                <p className="font-bold text-slate-900 text-xs">{contract.title}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{contract.currentStage}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>Visit Progress:</span>
                  <span className="font-bold font-mono text-indigo-900">
                    {contract.completedVisitsCount} of {contract.estimatedVisits} visits ({Math.round((contract.completedVisitsCount / contract.estimatedVisits) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round((contract.completedVisitsCount / contract.estimatedVisits) * 100))}%` }}
                  />
                </div>
              </div>

              {/* 3-metric financial breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="bg-white/90 p-2 rounded-xl border border-indigo-100 shadow-2xs">
                  <p className="text-[10px] font-sans text-slate-500">Total Contract</p>
                  <p className="font-bold text-slate-900">{contract.totalContractETB.toLocaleString()} ETB</p>
                </div>
                <div className="bg-white/90 p-2 rounded-xl border border-indigo-100 shadow-2xs">
                  <p className="text-[10px] font-sans text-slate-500">Collected</p>
                  <p className="font-bold text-emerald-700">{contract.totalCollectedETB.toLocaleString()} ETB</p>
                </div>
                <div className="bg-white/90 p-2 rounded-xl border border-indigo-100 shadow-2xs">
                  <p className="text-[10px] font-sans text-slate-500">Remaining Balance</p>
                  <p className="font-bold text-amber-700">{contract.remainingBalanceETB.toLocaleString()} ETB</p>
                </div>
              </div>

              {/* Prepaid Reserve & Bracket Repair Policy */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-indigo-100 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-slate-500">Broken Bracket Policy:</span>
                  <span className="font-semibold text-slate-900">
                    {contract.bracketRepairPolicy === 'complimentary' ? 'Complimentary (Option A)' : 'Chargeable +400 ETB (Option B)'}
                  </span>
                </div>
                {contract.prepaidCreditETB > 0 && (
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Prepaid Reserve: {contract.prepaidCreditETB.toLocaleString()} ETB
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 5. Definitive Diagnosis & Staged Treatment Plan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Diagnosis & Treatment Staging</span>
              </h3>
              <span className="text-[11px] font-mono font-bold text-blue-600">
                FDI World Dental Federation
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-xs text-slate-900">
              Diagnosis: {chart?.definitiveDiagnosis || 'Pulpal Necrosis with Symptomatic Apical Periodontitis (Tooth #36)'}
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-700 uppercase">Treatment Stages:</p>
              {(chart?.stagedTreatmentPlan || [
                'Stage 1: Pulpectomy, rotary biomechanical cleaning & Ca(OH)2 dressing',
                'Stage 2: Gutta-percha warm vertical condensation obturation',
                'Stage 3: Core buildup and monolithic zirconia crown',
              ]).map((stage, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Medical Prescriptions (Rx) */}
          {chart?.prescriptions && chart.prescriptions.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-indigo-600" />
                <span>Prescription Orders (Rx)</span>
              </h3>
              <div className="divide-y divide-slate-100">
                {chart.prescriptions.map((rx, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{rx.drugName}</p>
                      <p className="text-slate-500 text-[11px]">{rx.dosage} · {rx.frequency}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {rx.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Financial & Fiscal Statement (ETB) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Financial Statement (ETB)
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                apt.paymentStatus === 'fully_paid'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {apt.paymentStatus.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-slate-600">
                <span>Total Procedure Fee:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {apt.totalDueETB.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Deposit Credited:</span>
                <span className="font-semibold text-emerald-600 font-mono">
                  -{apt.depositPaidETB.toLocaleString()} ETB
                </span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
                <span>Outstanding Balance:</span>
                <span className="font-mono text-blue-600">
                  {(apt.totalDueETB - apt.depositPaidETB).toLocaleString()} ETB
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono pt-1">
              Ministry of Revenues TIN: 0049283711 · Receipt Ref: {apt.receiptNumber || 'RCP-2026-0041'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-2 gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              router.push('/treatment-plans');
            }}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Odontogram</span>
          </button>

          <button
            onClick={handleOpenDoctorChair}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Seat in Chair & Chart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { PatientRecordDrawer };
