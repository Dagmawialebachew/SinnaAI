'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Printer,
  ChevronRight,
  UserPlus,
  Stethoscope,
  RefreshCw,
  Plus,
  Check,
  AlertCircle,
  Globe,
  User,
  Armchair,
  Smartphone,
  Banknote,
  Receipt,
  ShieldCheck
} from 'lucide-react';
import { useSinnaStore, sinnaStore } from '@/lib/store';
import { Appointment, OperatoryChair } from '@/lib/types';

// Custom Medical Vector Illustration of Dental Operatory Chair
function DentalChairIllustration({ 
  status, 
  className = "w-20 h-20" 
}: { 
  status: 'occupied' | 'available' | 'sanitizing';
  className?: string;
}) {
  const isOccupied = status === 'occupied';
  const isAvailable = status === 'available';

  const baseColor = isOccupied ? '#1A4F9E' : isAvailable ? '#059669' : '#D97706';
  const accentColor = isOccupied ? '#00BFFF' : isAvailable ? '#34D399' : '#FBBF24';
  const fillColor = isOccupied ? '#EFF6FF' : isAvailable ? '#ECFDF5' : '#FFFBEB';

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Hydraulic Floor Base */}
      <ellipse cx="50" cy="88" rx="34" ry="7" fill="#CBD5E1" />
      <rect x="45" y="70" width="10" height="18" rx="2" fill="#64748B" />
      <rect x="42" y="68" width="16" height="4" rx="2" fill="#475569" />

      {/* Chair Seat Base */}
      <rect x="30" y="58" width="40" height="12" rx="4" fill={fillColor} stroke={baseColor} strokeWidth="2.5" />
      
      {/* Reclined Ergonomic Backrest */}
      <path 
        d="M32 60 L20 30 C19 27 21 24 24 24 L34 24 C37 24 39 26 40 29 L48 60 Z" 
        fill={fillColor} 
        stroke={baseColor} 
        strokeWidth="2.5" 
      />

      {/* Headrest */}
      <rect x="18" y="14" width="18" height="9" rx="3.5" fill={fillColor} stroke={baseColor} strokeWidth="2" />
      
      {/* Patient Cushion Overlay */}
      <path d="M26 30 L32 54" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="62" x2="64" y2="62" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />

      {/* Overhead Operating Light Stem */}
      <path d="M72 70 L72 32 L62 26" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="58" cy="24" rx="7" ry="4" fill={accentColor} fillOpacity="0.4" stroke={baseColor} strokeWidth="1.5" />

      {/* Instrument Tray */}
      <rect x="68" y="44" width="18" height="6" rx="1.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
      <line x1="72" y1="50" x2="72" y2="70" stroke="#94A3B8" strokeWidth="2" />
    </svg>
  );
}

export function VisualClinicFloor({
  onOpenPatientChart,
}: {
  onOpenPatientChart?: (aptId: string) => void;
} = {}) {
  const router = useRouter();
  const store = useSinnaStore();
  const isDoctorRole = store.currentUser?.role === 'doctor' || store.activePersona === 'doctor';
  const isOwnerRole = store.currentUser?.role === 'admin' || store.activePersona === 'manager';

  const handleOpenPatient = (aptId: string, initialTab: 'today' | 'history' | 'billing' | 'demographics' = 'today') => {
    if (onOpenPatientChart) {
      onOpenPatientChart(aptId);
    } else if (isDoctorRole) {
      router.push(`/patients?patientId=${encodeURIComponent(aptId)}`);
    } else {
      sinnaStore.openPatientDrawer(aptId, initialTab);
    }
  };

  const formatMedicalAlert = (alert: any): string => {
    if (!alert) return '';
    if (typeof alert === 'string') return alert;
    return alert.labelEn || alert.labelAm || alert.name || alert.text || 'High Risk Alert';
  };

  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInService, setWalkInService] = useState('Routine Cleaning & Scaling');

  const appointments = Array.isArray(store.appointments) ? store.appointments : [];
  const chairs = Array.isArray(store.chairs) ? store.chairs : [];

  // 1. Waiting Room Patients (Checked in at reception)
  const waitingPatients = appointments.filter((a) => {
    if (a.status !== 'checked_in') return false;
    if (isDoctorRole) {
      const doc = (a.doctorName || '').toLowerCase();
      const isSenait = doc.includes('senait') || a.doctorId === 'doc-senait';
      const isDawit = doc.includes('dawit') || a.doctorId === 'doc-dawit' || a.chairNumber === 2;
      return isSenait && !isDawit;
    }
    return true;
  });
  const waitingList = waitingPatients;

  // 2. Chairs
  const chair1 = chairs.find((c) => c.chairNumber === 1) || {
    id: 'chair-1',
    chairNumber: 1,
    name: 'Chair 1 — Room 1',
    status: 'available',
    roomName: 'Main Operatory',
  };

  const chair2 = chairs.find((c) => c.chairNumber === 2) || {
    id: 'chair-2',
    chairNumber: 2,
    name: 'Chair 2 — Room 2',
    status: 'available',
    roomName: 'Surgical Suite',
  };

  // Find active appointment for Chair 1 & 2
  const chair1Apt = appointments.find(
    (a) =>
      (chair1?.currentAppointmentId && a.id === chair1.currentAppointmentId) ||
      (a.chairNumber === 1 && a.status === 'in_progress')
  );
  const chair2Apt = appointments.find(
    (a) =>
      (chair2?.currentAppointmentId && a.id === chair2.currentAppointmentId) ||
      (a.chairNumber === 2 && a.status === 'in_progress')
  );

  const pendingChair1Req =
    store.pendingSeatingRequest?.chairNumber === 1 && store.pendingSeatingRequest?.status === 'pending'
      ? store.pendingSeatingRequest
      : null;

  const pendingChair2Req =
    store.pendingSeatingRequest?.chairNumber === 2 && store.pendingSeatingRequest?.status === 'pending'
      ? store.pendingSeatingRequest
      : null;

  // Operatory Concurrency Check: Is Dr. Senait / Chair 1 conducting another customer?
  const isChair1Busy = Boolean(chair1Apt || chair1.status === 'occupied' || pendingChair1Req);
  const isChair2Busy = Boolean(chair2Apt || chair2.status === 'occupied' || pendingChair2Req);

  // 3. Cashier Desk Patients (Completed today and pending cashier checkout settlement)
  const cashierQueue = appointments.filter(
    (a) =>
      a.status === 'completed' &&
      !a.cashierSettled &&
      a.seatingStatus !== 'settled_at_cashier' &&
      a.paymentStatus !== 'fully_paid'
  );

  const handleSeatInChair = (aptId: string, chairNumber: number) => {
    sinnaStore.requestSeatInChair(aptId, chairNumber);
  };

  const handleFinishTreatment = (chairNumber: number, aptId?: string) => {
    if (aptId) {
      sinnaStore.completeDoctorEncounter(aptId, {
        notes: 'Procedure completed successfully. Patient guided to reception cashier.',
      });
    } else {
      sinnaStore.releaseChair(chairNumber);
    }
  };

  const handleQuickPay = (
    aptId: string,
    method: 'telebirr_manual' | 'cbe_manual' | 'cash' | 'chapa_online'
  ) => {
    const apt = appointments.find((a) => a.id === aptId);
    const matchingPlan = store.treatmentPlans?.find(
      (p) =>
        (apt && (p.patientId === apt.id || p.id === apt.id)) ||
        (apt?.patientChart?.cardNo && p.patientId === apt.patientChart.cardNo) ||
        (apt && p.patientName && p.patientName.toLowerCase() === apt.patientName.toLowerCase())
    );
    const planTotal =
      matchingPlan?.procedures?.reduce((sum, p) => sum + (p.feeETB || 0), 0) ||
      matchingPlan?.quoteAmountETB ||
      0;
    const totalDue = apt?.totalDueETB && apt.totalDueETB > 0 ? apt.totalDueETB : (planTotal > 0 ? planTotal : 1500);
    const balance = Math.max(0, totalDue - (apt?.depositPaidETB || 0));

    sinnaStore.checkOutAndSettle(aptId, {
      method,
      amountPaidETB: balance,
      recordedBy: store.currentUser?.name || 'Helen Tadesse',
    });

    if (method === 'chapa_online') {
      sinnaStore.toastSuccess(
        'Chapa Mobile Link Issued',
        `Chapa link sent for ${apt?.patientPhone || 'patient phone'}. Patient cleared from Cashier Desk.`
      );
    } else {
      sinnaStore.toastSuccess(
        'Cashier Checkout Complete',
        `Settled ${balance.toLocaleString()} ETB for ${apt?.patientName || 'patient'}. Patient cleared from Cashier Desk.`
      );
    }
  };

  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    sinnaStore.checkInWalkIn({
      patientName: walkInName.trim(),
      patientPhone: walkInPhone.trim() || '+251 91 100 0000',
      serviceName: walkInService,
      doctorName: 'Dr. Senait Tadesse',
      totalDueETB: walkInService.includes('Cleaning') ? 1500 : 1200,
    });

    setWalkInName('');
    setWalkInPhone('');
    setWalkInModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* OWNER OVERSIGHT BANNER: Clean Clinical & Fiscal Read-Only Indicator */}
      {/* ------------------------------------------------------------------- */}
    

      {/* ------------------------------------------------------------------- */}
      {/* TOP HEADER: Clean Clinical Precision & Status Counter               */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Live Clinic Floor
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Clinic View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDoctorRole
              ? 'Real-time visual map of the Waiting Room and Dental Operatory Chairs.'
              : 'Real-time visual map of the Waiting Room, Dental Chairs, and Cashier Desk.'}
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span className="text-slate-600 font-medium">Waiting:</span>
            <strong className="text-slate-900 font-bold">{waitingPatients.length}</strong>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-slate-600 font-medium">{isDoctorRole ? 'In Operatory:' : 'In Chairs:'}</span>
            <strong className="text-slate-900 font-bold">
              {isDoctorRole ? (chair1Apt ? '1 / 1' : '0 / 1') : `${[chair1Apt, chair2Apt].filter(Boolean).length} / 2`}
            </strong>
          </div>

          {!isDoctorRole && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 font-medium">To Pay:</span>
              <strong className="text-slate-900 font-bold">{cashierQueue.length}</strong>
            </div>
          )}

          {!isDoctorRole && (
            <button
              type="button"
              disabled={isOwnerRole}
              onClick={() => {
                if (isOwnerRole) {
                  sinnaStore.toastInfo('Owner Oversight Mode', 'Patient registration & check-in is handled by Front Desk (Helen Tadesse).');
                  return;
                }
                setWalkInModalOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs ml-auto md:ml-2 ${
                isOwnerRole
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-brand-primary hover:bg-brand-hover text-white active:scale-95'
              }`}
              title={isOwnerRole ? 'Owner Oversight Mode (Read-Only): Check-in is handled by Reception.' : 'Register and check in a walk-in patient'}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isOwnerRole ? '+ Check In (Front Desk Only)' : '+ Check In Patient'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* CLINIC FLOOR GRID (WAITING -> CHAIR 1 -> CHAIR 2 [-> CASHIER])      */}
      {/* ------------------------------------------------------------------- */}
      <div className={`grid grid-cols-1 ${isDoctorRole ? 'lg:grid-cols-2 max-w-5xl mx-auto' : 'lg:grid-cols-4'} gap-4`}>

        {/* ================================================================= */}
        {/* ZONE 1: WAITING ROOM (RECEPTION LOUNGE)                           */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 flex flex-col shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Waiting Room</h3>
                <p className="text-[10px] text-slate-500">Reception Lounge</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {waitingPatients.length} Waiting in Lounge
            </span>
          </div>

          {/* Waiting Patients List */}
          <div className="p-3 flex-1 flex flex-col gap-2.5 min-h-[300px] overflow-y-auto">
            {waitingPatients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
                <Users className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Waiting Room is Empty</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reception is ready to check in the next patient.
                </p>
                <button
                  type="button"
                  onClick={() => setWalkInModalOpen(true)}
                  className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  + Add Walk-In
                </button>
              </div>
            ) : (
              waitingPatients.map((apt) => {
                const isCancelled = apt.seatingStatus === 'cancelled_by_doctor';
                const isRequested = apt.seatingStatus === 'requested';
                const assignedChair = (apt.doctorName && apt.doctorName.includes('Dawit')) || apt.chairNumber === 2 ? 2 : 1;
                const assignedDoctorName = assignedChair === 1 ? 'Dr. Senait Tadesse' : 'Dr. Dawit Bekele';
                const otherChair = assignedChair === 1 ? 2 : 1;
                const otherDoctorName = otherChair === 1 ? 'Dr. Senait Tadesse' : 'Dr. Dawit Bekele';

                return (
                  <div
                    key={apt.id}
                    onClick={() => handleOpenPatient(apt.id)}
                    className={`p-3.5 rounded-2xl border transition-all hover:shadow-card space-y-2.5 cursor-pointer group active:scale-[0.99] ${
                      isRequested
                        ? 'bg-gradient-to-br from-amber-50 via-amber-100/40 to-white border-2 border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                        : isCancelled
                        ? 'bg-rose-50/50 hover:bg-rose-50/80 border-rose-300 ring-1 ring-rose-300/40'
                        : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-blue-300'
                    }`}
                    title="Click to view patient profile & triage details in side panel"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className={`text-xs font-bold leading-tight transition-colors ${
                              isRequested
                                ? 'text-amber-950 group-hover:text-amber-800'
                                : isCancelled
                                ? 'text-rose-600 group-hover:text-rose-700 underline decoration-rose-300'
                                : 'text-slate-900 group-hover:text-blue-600'
                            }`}
                          >
                            {apt.patientName}
                          </h4>
                          {Boolean(apt.isOnlineBooking || apt.source === 'online' || apt.source === 'copilot' || (apt.notes && apt.notes.includes('Online')) || (apt.notes && apt.notes.includes('Booked via'))) && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-700 bg-sky-100/90 px-1 py-0.2 rounded font-amharic" title="በኦንላይን የተያዘ ቀጠሮ">
                              <Globe className="w-2.5 h-2.5 text-sky-600" />
                              <span>በኦንላይን</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {apt.patientPhone || '+251 91 123 4567'}
                        </p>
                      </div>
                      {isRequested ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-900 bg-amber-200/90 border border-amber-400 px-2.5 py-1 rounded-full shadow-2xs whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping shrink-0" />
                          <span>Waiting</span>
                        </span>
                      ) : isCancelled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300 shrink-0 shadow-2xs whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
                          Cancelled · Waiting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0 whitespace-nowrap">
                          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                          Waiting Lounge
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 font-medium flex items-center justify-between">
                      <span className="truncate">{apt.serviceName}</span>
                      {isRequested ? (
                        <span className="text-[10px] text-amber-900 font-bold bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300/80 shrink-0">
                          Chair {assignedChair}
                        </span>
                      ) : isCancelled ? (
                        <span className="text-[10px] text-rose-600 font-bold shrink-0">
                          Doctor busy at {apt.seatingCancelledAt || 'recent'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                          {isDoctorRole ? 'Chair 1 · Dr. Senait' : assignedChair === 1 ? 'Chair 1 · Dr. Senait' : 'Chair 2 · Dr. Dawit'}
                        </span>
                      )}
                    </div>

                    {/* Operatory Actions (Two-Actor Handshake: Request Seating) */}
                    <div className="pt-0.5 flex flex-col justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {isRequested ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 py-2 px-3 rounded-xl text-[10px] font-bold text-center bg-amber-500/15 text-amber-950 border border-amber-300 flex items-center justify-center gap-1.5 shadow-2xs select-none"
                            title="Waiting"
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                            <span>Waiting for {assignedChair === 1 ? 'Dr. Senait' : 'Dr. Dawit'} to accept...</span>
                          </div>
                      
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {isOwnerRole ? (
                            <button
                              type="button"
                              disabled={true}
                              className="flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold text-center bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                              title="Owner Oversight Mode: Patient seating is managed by Reception & Dr. Senait."
                            >
                              <span>Seat in Chair {isDoctorRole ? 1 : assignedChair} (Locked)</span>
                            </button>
                          ) : (isDoctorRole ? 1 : assignedChair) === 1 && isChair1Busy ? (
                            <button
                              type="button"
                              disabled={true}
                              className="flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold text-center bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none flex items-center justify-center gap-1"
                              title={`Dr. Senait is currently conducting treatment for ${chair1Apt?.patientName || 'a customer'} in Chair 1. No one can send another patient to her chair while she is conducting another customer.`}
                            >
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Dr. Senait Busy (Chair 1)</span>
                            </button>
                          ) : (isDoctorRole ? 1 : assignedChair) === 2 && isChair2Busy ? (
                            <button
                              type="button"
                              disabled={true}
                              className="flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold text-center bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none flex items-center justify-center gap-1"
                              title={`Chair 2 is currently occupied with ${chair2Apt?.patientName || 'a customer'}. Please wait until released.`}
                            >
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Chair 2 Busy</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSeatInChair(apt.id, isDoctorRole ? 1 : assignedChair)}
                              className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold text-center transition-colors shadow-2xs text-white ${
                                isCancelled
                                  ? 'bg-rose-600 hover:bg-rose-700'
                                  : (isDoctorRole ? 1 : assignedChair) === 1
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                              title={isDoctorRole ? 'Seat in Chair 1 (Dr. Senait)' : `Dispatch seating request to ${assignedDoctorName} (Chair ${assignedChair})`}
                            >
                              {isCancelled
                                ? `Re-Request Chair ${isDoctorRole ? 1 : assignedChair}`
                                : isDoctorRole
                                ? `Seat in Chair 1 (Dr. Senait)`
                                : `Seat in Chair ${assignedChair} (${assignedChair === 1 ? 'Dr. Senait' : 'Dr. Dawit'})`}
                            </button>
                          )}

                          {!isDoctorRole && (
                            <button
                              type="button"
                              disabled={isOwnerRole}
                              onClick={() => {
                                if (isOwnerRole) return;
                                sinnaStore.reassignDoctorAndChair(apt.id, otherDoctorName, otherChair);
                              }}
                              className={`py-1.5 px-2.5 rounded-xl text-[10px] font-bold border shadow-2xs transition-colors shrink-0 ${
                                isOwnerRole
                                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                  : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-200'
                              }`}
                              title={isOwnerRole ? 'Owner Oversight Mode (Read-Only)' : `Switch assigned doctor/operatory to Chair ${otherChair} (${otherDoctorName})`}
                            >
                              Chair {otherChair}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* ZONE 2: CHAIR 1 — ROOM 1 (DR. SENAIT TADESSE)                     */}
        {/* ================================================================= */}
        <div className={`rounded-2xl border-2 flex flex-col shadow-xs overflow-hidden transition-all relative ${
          chair1Apt
            ? 'bg-gradient-to-b from-[#E4F7EE] via-[#ECF9F2] to-white border-emerald-400/80 ring-1 ring-emerald-500/20'
            : isDoctorRole && pendingChair1Req
            ? 'bg-gradient-to-b from-amber-50/70 via-amber-50/30 to-white border-amber-400/80 ring-1 ring-amber-500/20'
            : 'bg-gradient-to-b from-[#F2FBF6] via-white to-white border-emerald-300/60 ring-1 ring-emerald-400/10'
        }`}>
          {/* Subtle Geometric Star Accent Watermark */}
          <div className="absolute -right-5 -top-5 w-32 h-32 pointer-events-none text-emerald-500/10 select-none">
            <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
              <path d="M100 0 C100 55, 145 100, 200 100 C145 100, 100 145, 100 200 C100 145, 55 100, 0 100 C55 100, 100 55, 100 0 Z" />
            </svg>
          </div>

          <div className="p-3.5 bg-white/70 border-b border-emerald-200/60 flex items-center justify-between relative z-10 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                C1
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">Chair 1</h3>
                <p className="text-[10px] text-slate-500 font-medium">Dr. Senait Tadesse</p>
              </div>
            </div>

            {chair1Apt ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white whitespace-nowrap shrink-0 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>IN TREATMENT</span>
              </span>
            ) : isDoctorRole && pendingChair1Req ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white whitespace-nowrap shrink-0 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                <span>INCOMING REQUEST</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>READY FOR PATIENT</span>
              </span>
            )}
          </div>

          {/* Chair Graphic & Seated Patient Content */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4 relative z-10">
            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <DentalChairIllustration
                status={chair1Apt ? 'occupied' : 'available'}
                className="w-20 h-20"
              />

              {chair1Apt ? (
                <div
                  onClick={() => handleOpenPatient(chair1Apt.id)}
                  className="w-full bg-white/95 p-3.5 rounded-2xl border border-emerald-300/80 hover:border-emerald-400 space-y-2 text-left shadow-2xs cursor-pointer transition-all"
                  title="Click to view patient profile and clinical chart"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Current Patient in Chair
                        </span>
                        {Boolean(chair1Apt.isOnlineBooking || chair1Apt.source === 'online' || chair1Apt.source === 'copilot' || (chair1Apt.notes && chair1Apt.notes.includes('Online')) || (chair1Apt.notes && chair1Apt.notes.includes('Booked via'))) && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-700 bg-sky-100/90 px-1 py-0.2 rounded font-amharic" title="በኦንላይን የተያዘ ቀጠሮ">
                            <Globe className="w-2.5 h-2.5 text-sky-600" />
                            <span>በኦንላይን</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-950 leading-tight mt-0.5">
                        {chair1Apt.patientName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      Active
                    </span>
                  </div>

                 

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-slate-700">
                    <div className="text-[11px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Procedure</span>
                      <span className="font-semibold text-slate-900 truncate block">{chair1Apt.serviceName}</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">MRN / Card</span>
                      <span className="font-mono text-slate-800 truncate block">{chair1Apt.patientChart?.cardNo || chair1Apt.patientChart?.medicalRecordNumber || (chair1Apt.id.startsWith('BDS-') ? chair1Apt.id : 'BDS-00041')}</span>
                    </div>
                  </div>
                </div>
              ) : isDoctorRole && pendingChair1Req ? (
                <div className="w-full bg-white/95 p-3.5 rounded-2xl border border-amber-300 space-y-2 text-left shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Incoming Seating Request
                  </span>
                  <h4 className="text-sm font-bold text-slate-950 leading-tight">
                    {pendingChair1Req.patientName}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {pendingChair1Req.serviceName} · Dispatched by {pendingChair1Req.requestedBy || 'Helen'}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center space-y-1.5">
                  <p className="text-xs font-bold text-slate-800">Waiting for Next Patient</p>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                    {waitingList.length > 0
                      ? `Next in line from lounge: ${waitingList[0].patientName} (${waitingList[0].serviceName})`
                      : 'Operatory clean & sanitized. Instruments prepped for Dr. Senait.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions for Chair 1 */}
            <div className="pt-3 border-t border-emerald-200/80 flex flex-col gap-2">
              {chair1Apt ? (
                isDoctorRole ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenPatientChart) {
                          onOpenPatientChart(chair1Apt.id);
                        } else {
                          router.push(`/patients?patientId=${chair1Apt.id}`);
                        }
                      }}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-2xs flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Clinical Profile &amp; Chart</span>
                    </button>
                    <button
                      type="button"
                      disabled={isOwnerRole}
                      onClick={() => {
                        if (isOwnerRole) {
                          sinnaStore.toastInfo('Owner Oversight Mode', 'Encounter completion is managed by Dr. Senait Tadesse.');
                          return;
                        }
                        handleFinishTreatment(1, chair1Apt.id);
                      }}
                      className={`w-full py-2 px-3 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs ${
                        isOwnerRole
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300 active:scale-98'
                      }`}
                      title={isOwnerRole ? 'Owner Oversight Mode (Read-Only): Dr. Senait completes treatments.' : 'Done → Send to Cashier'}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isOwnerRole ? 'text-slate-400' : 'text-emerald-600'}`} />
                      <span>{isOwnerRole ? 'Done → Send to Cashier (Doctor Only)' : 'Done → Send to Cashier'}</span>
                    </button>
                  </>
                ) : (
                  /* Reception view */
                  <div
                    onClick={() => handleOpenPatient(chair1Apt.id)}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/90 hover:bg-white border border-emerald-200 cursor-pointer transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-800 truncate">Room 1 · In Treatment</span>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                      Dr. Senait
                    </span>
                  </div>
                )
              ) : isDoctorRole && pendingChair1Req ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200 p-2 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <span>Doctor Seating Gate</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-700 font-bold uppercase">
                      Chair 1
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isOwnerRole}
                      onClick={() => {
                        if (isOwnerRole) return;
                        sinnaStore.acceptSeatingRequest();
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center shadow-xs flex items-center justify-center gap-1.5 transition-colors ${
                        isOwnerRole
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                      }`}
                      title={isOwnerRole ? 'Owner Oversight Mode (Read-Only)' : 'Dr. Senait accepts patient into Chair 1'}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isOwnerRole ? 'Doctor Handshake (Locked)' : 'Accept & Seat in Chair 1'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isOwnerRole}
                      onClick={() => {
                        if (isOwnerRole) return;
                        sinnaStore.declineSeatingRequest();
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold text-center shadow-2xs transition-colors border ${
                        isOwnerRole
                          ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                          : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-200 active:scale-98'
                      }`}
                      title={isOwnerRole ? 'Owner Oversight Mode (Read-Only)' : 'Decline seating request'}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ) : !isDoctorRole && pendingChair1Req ? (
                <div className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/80 p-2.5 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span>Waiting for Dr. Senait to accept...</span>
                </div>
              ) : waitingList.length > 0 ? (
                <button
                  type="button"
                  disabled={isOwnerRole}
                  onClick={() => {
                    if (isOwnerRole) {
                      sinnaStore.toastInfo('Owner Oversight Mode', 'Operatory seating is managed by Reception & Doctor.');
                      return;
                    }
                    if (isDoctorRole) {
                      sinnaStore.assignPatientToChair(waitingList[0].id, 1);
                    } else {
                      handleSeatInChair(waitingList[0].id, 1);
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-center transition-colors shadow-2xs flex items-center justify-center gap-1.5 ${
                    isOwnerRole
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                  }`}
                  title={isOwnerRole ? 'Owner Oversight Mode: Seating is managed by active duty staff.' : 'Seat next waiting patient in Chair 1'}
                >
                  <Armchair className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isOwnerRole
                      ? `Chair 1 Dispatch (Locked - Owner View)`
                      : isDoctorRole
                      ? `Call & Seat ${waitingList[0].patientName.split(' ')[0]} in Chair 1`
                      : `Send ${waitingList[0].patientName.split(' ')[0]} to Chair 1`}
                  </span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 text-center py-2 font-medium">
                  Ready to seat next patient from Waiting Room
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ZONE 3: CHAIR 2 — ROOM 2 (DR. DAWIT BEKELE - RECEPTION ONLY)       */}
        {/* ================================================================= */}
        {!isDoctorRole && (
          <div className={`rounded-2xl border-2 flex flex-col shadow-xs overflow-hidden transition-all relative ${
          chair2Apt
            ? 'bg-gradient-to-b from-[#E8F1FC] via-[#F0F6FD] to-white border-blue-400/80 ring-1 ring-blue-500/20'
            : 'bg-gradient-to-b from-[#F2F7FC] via-white to-white border-blue-300/60 ring-1 ring-blue-400/10'
        }`}>
          {/* Subtle Geometric Star Accent Watermark */}
          <div className="absolute -right-5 -top-5 w-32 h-32 pointer-events-none text-blue-500/10 select-none">
            <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
              <path d="M100 0 C100 55, 145 100, 200 100 C145 100, 100 145, 100 200 C100 145, 55 100, 0 100 C55 100, 100 55, 100 0 Z" />
            </svg>
          </div>

          <div className="p-3.5 bg-white/70 border-b border-blue-200/60 flex items-center justify-between relative z-10 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                C2
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">Chair 2</h3>
                <p className="text-[10px] text-slate-500 font-medium">Dr. Dawit Bekele</p>
              </div>
            </div>

            {chair2Apt ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white whitespace-nowrap shrink-0 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                <span>IN TREATMENT</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-300 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>READY FOR PATIENT</span>
              </span>
            )}
          </div>

          {/* Chair Graphic & Seated Patient Content */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4 relative z-10">
            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <DentalChairIllustration
                status={chair2Apt ? 'occupied' : 'available'}
                className="w-20 h-20"
              />

              {chair2Apt ? (
                <div
                  onClick={() => handleOpenPatient(chair2Apt.id)}
                  className="w-full bg-white/95 p-3.5 rounded-2xl border border-blue-300/80 hover:border-blue-400 space-y-2 text-left shadow-2xs cursor-pointer transition-all"
                  title="Click to view patient profile and clinical chart"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          Current Patient in Chair
                        </span>
                        {Boolean(chair2Apt.isOnlineBooking || chair2Apt.source === 'online' || chair2Apt.source === 'copilot' || (chair2Apt.notes && chair2Apt.notes.includes('Online')) || (chair2Apt.notes && chair2Apt.notes.includes('Booked via'))) && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-700 bg-sky-100/90 px-1 py-0.2 rounded font-amharic" title="በኦንላይን የተያዘ ቀጠሮ">
                            <Globe className="w-2.5 h-2.5 text-sky-600" />
                            <span>በኦንላይን</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-950 leading-tight mt-0.5">
                        {chair2Apt.patientName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      Active
                    </span>
                  </div>

                 
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-slate-700">
                    <div className="text-[11px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Procedure</span>
                      <span className="font-semibold text-slate-900 truncate block">{chair2Apt.serviceName}</span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">MRN / Card</span>
                      <span className="font-mono text-slate-800 truncate block">{chair2Apt.patientChart?.cardNo || chair2Apt.patientChart?.medicalRecordNumber || (chair2Apt.id.startsWith('BDS-') ? chair2Apt.id : 'BDS-00042')}</span>
                    </div>
                  </div>
                </div>
              ) : isDoctorRole && pendingChair2Req ? (
                <div className="w-full bg-white/95 p-3.5 rounded-2xl border border-amber-300 space-y-2 text-left shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Incoming Seating Request
                  </span>
                  <h4 className="text-sm font-bold text-slate-950 leading-tight">
                    {pendingChair2Req.patientName}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {pendingChair2Req.serviceName} · Dispatched by {pendingChair2Req.requestedBy || 'Helen'}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center space-y-1.5">
                  <p className="text-xs font-bold text-slate-800">Waiting for Next Patient</p>
                  <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                    {waitingList.length > 0
                      ? `Next in line from lounge: ${waitingList[0].patientName} (${waitingList[0].serviceName})`
                      : 'Surgical operatory clean & sanitized. Instruments prepped for Dr. Dawit.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions for Chair 2 */}
            <div className="pt-3 border-t border-blue-200/80 flex flex-col gap-2">
              {chair2Apt ? (
                isDoctorRole ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenPatientChart) {
                          onOpenPatientChart(chair2Apt.id);
                        } else {
                          router.push(`/patients?patientId=${chair2Apt.id}`);
                        }
                      }}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-2xs flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Clinical Profile &amp; Chart</span>
                    </button>
                    <button
                      type="button"
                      disabled={isOwnerRole}
                      onClick={() => {
                        if (isOwnerRole) {
                          sinnaStore.toastInfo('Owner Oversight Mode', 'Encounter completion is managed by the attending doctor.');
                          return;
                        }
                        handleFinishTreatment(2, chair2Apt.id);
                      }}
                      className={`w-full py-2 px-3 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs ${
                        isOwnerRole
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-white hover:bg-blue-50 text-blue-950 border border-blue-300 active:scale-98'
                      }`}
                      title={isOwnerRole ? 'Owner Oversight Mode (Read-Only)' : 'Done → Send to Cashier'}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isOwnerRole ? 'text-slate-400' : 'text-blue-600'}`} />
                      <span>{isOwnerRole ? 'Done → Send to Cashier (Doctor Only)' : 'Done → Send to Cashier'}</span>
                    </button>
                  </>
                ) : (
                  /* Reception view */
                  <div
                    onClick={() => handleOpenPatient(chair2Apt.id)}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/90 hover:bg-white border border-blue-200 cursor-pointer transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                      <span className="text-[11px] font-semibold text-slate-800 truncate">Room 2 · In Treatment</span>
                    </div>
                    <span className="text-[10px] text-blue-800 font-mono font-bold bg-blue-100/80 px-2 py-0.5 rounded-full shrink-0">
                      Dr. Dawit
                    </span>
                  </div>
                )
              ) : pendingChair2Req ? (
                <div className="text-[11px] text-blue-900 bg-blue-50/80 border border-blue-200/80 p-2.5 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
                  <span>Waiting for Dr. Dawit to accept...</span>
                </div>
              ) : waitingList.length > 0 ? (
                <button
                  type="button"
                  disabled={isOwnerRole}
                  onClick={() => {
                    if (isOwnerRole) {
                      sinnaStore.toastInfo('Owner Oversight Mode', 'Operatory seating is managed by Reception & Doctor.');
                      return;
                    }
                    if (isDoctorRole) {
                      sinnaStore.assignPatientToChair(waitingList[0].id, 2);
                    } else {
                      handleSeatInChair(waitingList[0].id, 2);
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-center transition-colors shadow-2xs flex items-center justify-center gap-1.5 ${
                    isOwnerRole
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                  }`}
                  title={isOwnerRole ? 'Owner Oversight Mode: Seating is managed by active duty staff.' : 'Seat next waiting patient in Chair 2'}
                >
                  <Armchair className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {isOwnerRole
                      ? `Chair 2 Dispatch (Locked - Owner View)`
                      : isDoctorRole
                      ? `Call & Seat ${waitingList[0].patientName.split(' ')[0]} in Chair 2`
                      : `Send ${waitingList[0].patientName.split(' ')[0]} to Chair 2`}
                  </span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 text-center py-2 font-medium">
                  Ready to seat next patient from Waiting Room
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* ================================================================= */}
        {/* ZONE 4: CASHIER DESK (BILL PAYMENT & MOR FISCAL RECEIPT)          */}
        {/* ================================================================= */}
        {!isDoctorRole && (
          <div className="bg-white rounded-2xl border border-slate-200/90 flex flex-col shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Cashier Desk</h3>
                  <p className="text-[10px] text-slate-500">Collect Bill &amp; MoR Fiscal Receipt</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                cashierQueue.length > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {cashierQueue.length} To Pay
              </span>
            </div>

            {/* Cashier Patients List */}
            <div className="p-3 flex-1 flex flex-col gap-2.5 min-h-[300px] overflow-y-auto">
              {cashierQueue.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">All Patient Bills Settled</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-[210px] leading-relaxed">
                    No completed patients waiting for cashier checkout. MoR fiscal registry is up to date.
                  </p>
                </div>
              ) : (
                cashierQueue.map((apt) => {
                  const matchingPlan = store.treatmentPlans?.find(
                    (p) =>
                      p.patientId === apt.id ||
                      (apt.patientChart?.cardNo && p.patientId === apt.patientChart.cardNo) ||
                      (p.patientName && p.patientName.toLowerCase() === apt.patientName.toLowerCase())
                  );
                  const planTotal =
                    matchingPlan?.procedures?.reduce((sum, p) => sum + (p.feeETB || 0), 0) ||
                    matchingPlan?.quoteAmountETB ||
                    0;
                  const totalDue = apt.totalDueETB > 0 ? apt.totalDueETB : (planTotal > 0 ? planTotal : 1500);
                  const balanceDue = Math.max(0, totalDue - (apt.depositPaidETB || 0));

                  const initials = apt.patientName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  const cardNo = apt.patientChart?.cardNo || apt.patientChart?.medicalRecordNumber || (apt.id.startsWith('BDS-') ? apt.id : ('BDS-' + String(apt.id.replace(/\D/g, '') || '00041').padStart(5, '0')));
                  const procedureTitle = matchingPlan && matchingPlan.procedures.length > 0
                    ? matchingPlan.procedures.map((p) => p.name).join(', ')
                    : apt.serviceName || 'Clinical Dental Prophylaxis';

                  return (
                    <div
                      key={apt.id}
                      onClick={() => handleOpenPatient(apt.id, 'billing')}
                      className="group relative bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-3 shadow-2xs hover:shadow-card transition-all cursor-pointer flex flex-col gap-2 border-l-4 border-l-emerald-500"
                      title="Click to launch Reception Patient Profile &amp; MoR Cashier Desk"
                    >
                      {/* Top Header: Monogram Avatar + Name/MRN + Dynamic DUE Pill */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:border-emerald-400 group-hover:text-emerald-700 transition-colors shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight truncate">
                                {apt.patientName}
                              </h4>
                              {Boolean(apt.isOnlineBooking || apt.source === 'online' || apt.source === 'copilot' || (apt.notes && apt.notes.includes('Online')) || (apt.notes && apt.notes.includes('Booked via'))) && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded font-amharic border border-sky-200 shrink-0" title="በኦንላይን የተያዘ ቀጠሮ">
                                  <Globe className="w-2.5 h-2.5 text-sky-600" />
                                  <span>በኦንላይን</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                              <span className="font-semibold text-slate-600">{cardNo}</span>
                              <span className="text-slate-300">·</span>
                              <span className="font-sans text-slate-500 truncate max-w-[130px]" title={procedureTitle}>
                                {procedureTitle}
                              </span>
                            </div>
                          </div>
                        </div>

                        
                      </div>

                      {/* Doctor Treatment Done Summary */}
                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100 text-slate-500">
                        <div className="flex items-center gap-1 min-w-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">Done by {apt.doctorName || 'Dr. Senait'}</span>
                        </div>
                        
                      </div>

                      {/* Bottom 1-Click Fast Cashier Rails (Telebirr, CBE Birr, Cash, Chapa) */}
                      <div
                        className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                       
                        <div className="grid grid-cols-2 items-center gap-1 shrink-0 flex-wrap justify-end">
                          <button
                            type="button"
                            disabled={isOwnerRole}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isOwnerRole) {
                                sinnaStore.toastInfo('Owner Oversight Mode', 'Cashier payment collection is managed by Front Desk Cashier.');
                                return;
                              }
                              handleQuickPay(apt.id, 'telebirr_manual');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs ${
                              isOwnerRole
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200 active:scale-95'
                            }`}
                            title={isOwnerRole ? 'Owner Oversight Mode (Read-Only)' : 'Instant Telebirr payment settlement'}
                          >
                            <Smartphone className="w-3 h-3" />
                            <span>Telebirr</span>
                          </button>
                          <button
                            type="button"
                            disabled={isOwnerRole}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isOwnerRole) {
                                sinnaStore.toastInfo('Owner Oversight Mode', 'Cashier payment collection is managed by Front Desk Cashier.');
                                return;
                              }
                              handleQuickPay(apt.id, 'cbe_manual');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs ${
                              isOwnerRole
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 active:scale-95'
                            }`}
                            title={isOwnerRole ? 'Owner Oversight Mode (Read-Only)' : 'Instant CBE Birr POS settlement'}
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>CBE Birr</span>
                          </button>
                          <button
                            type="button"
                            disabled={isOwnerRole}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isOwnerRole) {
                                sinnaStore.toastInfo('Owner Oversight Mode', 'Cashier payment collection is managed by Front Desk Cashier.');
                                return;
                              }
                              handleQuickPay(apt.id, 'cash');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs ${
                              isOwnerRole
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200 active:scale-95'
                            }`}
                            title={isOwnerRole ? 'Owner Oversight Mode (Read-Only)' : 'Instant Cash settlement with MoR Receipt'}
                          >
                            <Banknote className="w-3 h-3" />
                            <span>Cash</span>
                          </button>
                          <button
                            type="button"
                            disabled={isOwnerRole}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isOwnerRole) {
                                sinnaStore.toastInfo('Owner Oversight Mode', 'Cashier payment collection is managed by Front Desk Cashier.');
                                return;
                              }
                              handleQuickPay(apt.id, 'chapa_online');
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs ${
                              isOwnerRole
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 active:scale-95'
                            }`}
                            title={isOwnerRole ? 'Owner Oversight Mode (Read-Only)' : "Chapa checkout link for patient's phone"}
                          >
                            <Globe className="w-3 h-3" />
                            <span>Chapa</span>
                          </button>
                        </div>
                      </div>

                      {/* DUE AMOUNT PILL (Dynamic High-Precision) */}
                        <div className="">
                          <div className="bg-slate-900 group-hover:bg-emerald-700 text-white px-2.5 py-2 rounded-xl shadow-2xs transition-colors">
                            <span className="text-[8px] font-bold text-slate-300 uppercase block tracking-wider leading-none">
                              DUE
                            </span>
                            <span className="text-xs font-black font-mono text-white leading-tight">
                              {balanceDue.toLocaleString()} ETB
                            </span>
                          </div>
                          {(apt.depositPaidETB || 0) > 0 && (
                            <span className="text-[9px] font-mono font-bold text-emerald-700 block mt-0.5 text-right">
                              Paid: {apt.depositPaidETB.toLocaleString()} ETB
                            </span>
                          )}
                        </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------------- */}
      {/* QUICK WALK-IN CHECK-IN MODAL                                        */}
      {/* ------------------------------------------------------------------- */}
      {walkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-spring-pop">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-900">
                  Quick Patient Check-In
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWalkInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almaz Bekele"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+251 91 123 4567"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Visit / Procedure
                </label>
                <select
                  value={walkInService}
                  onChange={(e) => setWalkInService(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="Routine Cleaning & Scaling">Routine Cleaning & Scaling (1,500 ETB)</option>
                  <option value="Emergency Pain Relief & Exam">Emergency Toothache & Pain Relief (1,200 ETB)</option>
                  <option value="Root Canal Treatment (RCT)">Root Canal Treatment (RCT - 4,500 ETB)</option>
                  <option value="Consultation & Treatment Plan">Doctor Consultation & Exam (500 ETB)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWalkInModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-brand-primary hover:bg-brand-hover text-white rounded-xl shadow-xs transition-colors"
                >
                  Check In Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
