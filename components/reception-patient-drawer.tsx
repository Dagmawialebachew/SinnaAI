'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  Clock,
  Receipt,
  Printer,
  CheckCircle2,
  Armchair,
  Send,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Save,
  MessageSquare,
  ChevronRight,
  Stethoscope,
  FileText,
  ArrowRight,
  Banknote,
  Check,
  Globe,
  CreditCard,
  Smartphone,
  Coins,
  QrCode,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printPatientChart, printThermalReceipt } from '@/lib/smart-print';
import { getPatientVisitHistory, PatientPreviousVisit } from '@/lib/patient-history';
import { Appointment, LedgerTransaction } from '@/lib/types';
import { ReceiptModal } from '@/components/receipt-modal';
import { INITIAL_PATIENTS } from '@/lib/initial-patients';

interface ReceptionPatientDrawerProps {
  appointmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: DrawerTab;
}

const AVAILABLE_TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

type DrawerTab = 'today' | 'history' | 'billing' | 'demographics';

export default function ReceptionPatientDrawer({
  appointmentId,
  isOpen,
  onClose,
  initialTab = 'today',
}: ReceptionPatientDrawerProps) {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const apt = useMemo<Appointment | null>(() => {
    if (!appointmentId) return null;
    const cleanId = appointmentId.toLowerCase().trim();

    const UPCOMING_ID_MAP: Record<string, string> = {
      'apt-up-1': 'apt-001',
      'apt-up-2': 'apt-006',
      'apt-up-3': 'apt-005',
      'apt-up-4': 'apt-002',
      'apt-up-5': 'apt-007',
      'apt-up-6': 'apt-008',
      'apt-up-7': 'apt-009',
      'apt-up-8': 'apt-012',
      'apt-up-9': 'apt-011',
    };
    const targetId = UPCOMING_ID_MAP[cleanId] || cleanId;

    // 1. Direct ID match in store appointments
    const directMatch = store.appointments.find(
      (a) => a.id === appointmentId || a.id.toLowerCase() === cleanId || a.id.toLowerCase() === targetId
    );
    if (directMatch) return directMatch;

    // 2. Name, phone or cardNo match in store appointments
    const matchByNameOrPhone = store.appointments.find((a) => {
      const pName = (a.patientName || '').toLowerCase().trim();
      const pAmharic = (a.patientChart?.fullNameAmharic || '').toLowerCase().trim();
      const pCardNo = (a.patientChart?.cardNo || '').toLowerCase().trim();
      const pMrn = (a.patientChart?.medicalRecordNumber || '').toLowerCase().trim();
      const pPhone = (a.patientPhone || '').replace(/\D/g, '');
      const targetPhone = appointmentId.replace(/\D/g, '');

      return (
        pName === cleanId ||
        pName === targetId ||
        pAmharic === cleanId ||
        pCardNo === cleanId ||
        pCardNo === targetId ||
        pMrn === cleanId ||
        pMrn === targetId ||
        (targetPhone.length >= 7 && pPhone.includes(targetPhone))
      );
    });
    if (matchByNameOrPhone) return matchByNameOrPhone;

    // 3. Match from INITIAL_PATIENTS registry
    const targetDigits = appointmentId.replace(/\D/g, '').slice(-9);
    const registryMatch = INITIAL_PATIENTS.find((p) => {
      const pName = p.name.toLowerCase().trim();
      const pAmharic = (p.nameAmharic || '').toLowerCase().trim();
      const pMrn = p.mrn.toLowerCase().trim();
      const pId = p.id.toLowerCase().trim();
      const pPhone = (p.phone || '').replace(/\D/g, '').slice(-9);

      return (
        pId === cleanId ||
        pId === targetId ||
        pMrn === cleanId ||
        pMrn === targetId ||
        pName === cleanId ||
        pName === targetId ||
        pAmharic === cleanId ||
        (targetDigits.length >= 7 && pPhone === targetDigits)
      );
    });

    if (registryMatch) {
      return {
        id: registryMatch.id,
        clinicId: 'clinic-bole-001',
        patientName: registryMatch.name,
        patientPhone: registryMatch.phone,
        doctorId: 'doc-senait',
        doctorName: 'Dr. Senait Tadesse',
        serviceId: 'srv-cleaning',
        serviceName: registryMatch.activePlanTitle || 'Routine Cleaning & Scaling',
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 3600000).toISOString(),
        status: 'confirmed' as const,
        paymentStatus: registryMatch.balanceETB > 0 ? ('deposit_paid' as const) : ('fully_paid' as const),
        depositPaidETB: registryMatch.totalPaidETB || 300,
        totalDueETB: (registryMatch.balanceETB || 0) + (registryMatch.totalPaidETB || 0),
        chairNumber: 1,
        isOnlineBooking: false,
        notes: registryMatch.notes || 'Patient record retrieved from clinic directory.',
        medicalAlerts: registryMatch.allergies?.map((al, idx) => ({
          id: `alt-${idx}`,
          type: 'allergy' as const,
          labelEn: al,
          severity: 'high' as const,
        })) || [],
        patientChart: {
          cardNo: registryMatch.mrn,
          medicalRecordNumber: registryMatch.mrn,
          fullNameAmharic: registryMatch.nameAmharic,
          age: registryMatch.age,
          gender: registryMatch.gender,
          phone: registryMatch.phone,
          subcityWoreda: registryMatch.subcity,
          emergencyContact: registryMatch.emergencyContact
            ? {
                name: registryMatch.emergencyContact.name,
                relationship: registryMatch.emergencyContact.relationship,
                phone: registryMatch.emergencyContact.phone,
              }
            : {
                name: 'Family Contact',
                relationship: 'Family',
                phone: registryMatch.phone,
              },
          chiefComplaint: registryMatch.diagnosesUntreated?.[0] || 'Routine examination & scaling',
          hpi: registryMatch.notes || 'Patient scheduled for follow-up.',
          medicalHistory: {
            allergies: registryMatch.allergies || ['No known allergies'],
            systemicDiseases: registryMatch.systemicDiseases || [],
            currentMedications: registryMatch.currentMedications || [],
            bleedingDisorders: false,
          },
          clinicalFindings: {
            extraoral: 'Normal',
            intraoralSoftTissue: 'Normal',
            intraoralHardTissue: 'Normal',
            percussionTest: 'Negative',
            vitalityTest: 'Normal',
          },
          radiographicNotes: 'Normal',
          definitiveDiagnosis: registryMatch.diagnosesUntreated?.[0] || 'Routine assessment',
          stagedTreatmentPlan: [registryMatch.activePlanTitle || 'Oral prophylaxis'],
          prescriptions: [],
        },
      } as unknown as Appointment;
    }

    // 4. Fallback: Synthesize valid appointment record
    return {
      id: appointmentId,
      clinicId: 'clinic-bole-001',
      patientName: appointmentId.startsWith('apt-') ? 'Registered Clinic Patient' : appointmentId,
      patientPhone: '+251 91 123 4567',
      doctorId: 'doc-senait',
      doctorName: 'Dr. Senait Tadesse',
      serviceId: 'srv-cleaning',
      serviceName: 'Routine Cleaning & Scaling',
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 3600000).toISOString(),
      status: 'confirmed' as const,
      paymentStatus: 'deposit_paid' as const,
      depositPaidETB: 300,
      totalDueETB: 1500,
      chairNumber: 1,
      isOnlineBooking: true,
      notes: 'Patient record opened by reception.',
      medicalAlerts: [],
      patientChart: {
        cardNo: appointmentId.startsWith('BDS-') ? appointmentId : 'BDS-54540',
        fullNameAmharic: '',
        age: 30,
        gender: 'Female' as const,
        phone: '+251 91 123 4567',
        subcityWoreda: 'Bole Subcity, Woreda 03',
        emergencyContact: {
          name: 'Family Member',
          relationship: 'Family',
          phone: '+251 91 100 0000',
        },
        chiefComplaint: 'Routine dental consultation and prophylaxis.',
        hpi: 'Patient scheduled for clinical hygiene and assessment.',
        medicalHistory: {
          allergies: ['No known allergies'],
          systemicDiseases: ['None reported'],
          currentMedications: ['None'],
          bleedingDisorders: false,
        },
        clinicalFindings: {
          extraoral: 'Normal',
          intraoralSoftTissue: 'Normal',
          intraoralHardTissue: 'Normal',
          percussionTest: 'Negative',
          vitalityTest: 'Normal',
        },
        radiographicNotes: 'Normal',
        definitiveDiagnosis: 'Clinical Examination & Prophylaxis',
        stagedTreatmentPlan: ['Oral prophylaxis'],
        prescriptions: [],
      },
    } as unknown as Appointment;
  }, [appointmentId, store.appointments]);

  // Active drawer tab
  const [activeTab, setActiveTab] = useState<DrawerTab>(initialTab);
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  const [historyDoctorFilter, setHistoryDoctorFilter] = useState<string>('all');

  // Local editable form state
  const [patientName, setPatientName] = useState('');
  const [nameAmharic, setNameAmharic] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Female' | 'Male'>('Female');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedChair, setSelectedChair] = useState<number>(1);
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Senait Tadesse');
  const [notes, setNotes] = useState('');
  const [sendSmsNotification, setSendSmsNotification] = useState(true);

  // Front Desk Cashier Terminal State in Billing Tab
  const [cashierMethod, setCashierMethod] = useState<'telebirr_manual' | 'cbe_manual' | 'cash' | 'chapa_online'>('telebirr_manual');
  const [cashierAmount, setCashierAmount] = useState<string>('');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [paymentRefCode, setPaymentRefCode] = useState<string>('');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<LedgerTransaction | null>(null);
  const [showExtraPaymentForm, setShowExtraPaymentForm] = useState(false);

  // Sync state when appointmentId or apt changes
  useEffect(() => {
    if (apt) {
      setPatientName(apt.patientName || '');
      setNameAmharic(apt.patientChart?.fullNameAmharic || '');
      setPatientPhone(apt.patientPhone || '+251 9');
      setAge(apt.patientChart?.age || 30);
      setGender(apt.patientChart?.gender || 'Female');
      setEmergencyName(apt.patientChart?.emergencyContact?.name || '');
      setEmergencyRelation(apt.patientChart?.emergencyContact?.relationship || 'Family');
      setEmergencyPhone(apt.patientChart?.emergencyContact?.phone || '');
      setSelectedChair(apt.chairNumber || 1);
      setSelectedDoctor(apt.doctorName || 'Dr. Senait Tadesse');
      setNotes(apt.notes || '');

      if (apt.startsAt) {
        try {
          const d = new Date(apt.startsAt);
          setSelectedDate(d.toISOString().split('T')[0]);
          const hours = d.getHours();
          const mins = d.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const h12 = hours % 12 || 12;
          const formatted = `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
          setSelectedSlot(formatted);
        } catch {
          setSelectedDate(new Date().toISOString().split('T')[0]);
          setSelectedSlot('10:00 AM');
        }
      } else {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedSlot('10:00 AM');
      }
    }
  }, [apt]);

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Retrieve complete chronological previous visit history
  const previousVisits = useMemo(() => {
    if (!apt) return [];
    return getPatientVisitHistory(apt.id, apt.patientName, store.appointments);
  }, [apt, store.appointments]);

  // Filtered visits by doctor
  const filteredVisits = useMemo(() => {
    if (historyDoctorFilter === 'all') return previousVisits;
    return previousVisits.filter((v) =>
      v.doctorName.toLowerCase().includes(historyDoctorFilter.toLowerCase())
    );
  }, [previousVisits, historyDoctorFilter]);

  // Relevant contract for Orthodontic patients
  const patientContract = useMemo(() => {
    if (!apt) return null;
    return store.contracts?.find(
      (c) =>
        c.patientId === apt.id ||
        c.patientName.toLowerCase() === apt.patientName.toLowerCase()
    ) || null;
  }, [apt, store.contracts]);

  // Patient ledger transactions
  const patientTransactions = useMemo(() => {
    if (!apt) return [];
    return store.ledger.filter(
      (t) =>
        t.appointmentId === apt.id ||
        t.patientName.toLowerCase() === apt.patientName.toLowerCase()
    );
  }, [apt, store.ledger]);

  // Total collected from history
  const totalHistoricalPaidETB = useMemo(() => {
    const fromVisits = previousVisits.reduce((sum, v) => sum + (v.feeETB || 0), 0);
    const fromApt = apt?.depositPaidETB || 0;
    return fromVisits + fromApt;
  }, [previousVisits, apt]);

  const patientTreatmentPlan = useMemo(() => {
    if (!apt) return null;
    return (
      store.treatmentPlans?.find(
        (p) =>
          p.patientId === apt.id ||
          (apt.patientChart?.cardNo && p.patientId === apt.patientChart.cardNo) ||
          (p.patientName && p.patientName.toLowerCase() === apt.patientName.toLowerCase())
      ) || null
    );
  }, [apt, store.treatmentPlans]);

  const planProceduresTotal = useMemo(() => {
    if (!patientTreatmentPlan) return 0;
    const sum = patientTreatmentPlan.procedures?.reduce((acc, p) => acc + (p.feeETB || 0), 0) || 0;
    return sum > 0 ? sum : (patientTreatmentPlan.quoteAmountETB || 0);
  }, [patientTreatmentPlan]);

  if (!isOpen || !apt) return null;

  const chart = apt.patientChart;
  const dynamicTotalDue = apt.totalDueETB > 0 ? apt.totalDueETB : (planProceduresTotal > 0 ? planProceduresTotal : 1500);
  const balanceETB = Math.max(0, dynamicTotalDue - apt.depositPaidETB);
  const isDoctorCancelled = apt.seatingStatus === 'cancelled_by_doctor';

  // Role and Chair Concurrency Guards
  const isOwner = Boolean(
    store.currentUser?.role === 'admin' ||
    store.activePersona === 'manager' ||
    sinnaStore.isOwner?.()
  );

  const isChair1Busy = Boolean(
    store.chairs.find((c) => c.chairNumber === 1)?.status === 'occupied' ||
    store.appointments.some((a) => a.chairNumber === 1 && a.status === 'in_progress' && a.id !== apt?.id) ||
    (store.pendingSeatingRequest?.chairNumber === 1 && store.pendingSeatingRequest?.status === 'pending' && store.pendingSeatingRequest?.appointmentId !== apt?.id)
  );

  const isChair2Busy = Boolean(
    store.chairs.find((c) => c.chairNumber === 2)?.status === 'occupied' ||
    store.appointments.some((a) => a.chairNumber === 2 && a.status === 'in_progress' && a.id !== apt?.id) ||
    (store.pendingSeatingRequest?.chairNumber === 2 && store.pendingSeatingRequest?.status === 'pending' && store.pendingSeatingRequest?.appointmentId !== apt?.id)
  );

  const isTargetChairBusy = selectedChair === 1 ? isChair1Busy : isChair2Busy;

  const handleSaveChanges = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isOwner) {
      sinnaStore.toastWarning('Action Restricted', 'Owner audit mode: Record modifications are restricted to reception and clinical director.');
      return;
    }

    // Reconstruct start date/time ISO
    let startsAtIso = apt.startsAt;
    let endsAtIso = apt.endsAt;
    if (selectedDate) {
      try {
        const [timePart, meridiem] = selectedSlot.split(' ');
        const [hStr, mStr] = timePart.split(':');
        let hours = parseInt(hStr, 10);
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        const minutes = parseInt(mStr, 10) || 0;

        const dateObj = new Date(selectedDate);
        dateObj.setHours(hours, minutes, 0, 0);
        startsAtIso = dateObj.toISOString();
        endsAtIso = new Date(dateObj.getTime() + 45 * 60000).toISOString();
      } catch (err) {
        console.warn('Failed to parse date/time', err);
      }
    }

    sinnaStore.updateAppointmentAdministrative(apt.id, {
      patientName: patientName.trim() || apt.patientName,
      patientNameAmharic: nameAmharic.trim(),
      patientPhone: patientPhone.trim() || apt.patientPhone,
      age: Number(age) || 30,
      gender,
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRelation.trim() || 'Family',
        phone: emergencyPhone.trim(),
      },
      startsAt: startsAtIso,
      endsAt: endsAtIso,
      doctorName: selectedDoctor,
      chairNumber: selectedChair,
      notes: notes.trim(),
      sendSms: sendSmsNotification,
    });

    onClose();
  };

  const handleSeatPatientFromDrawer = () => {
    if (isOwner) {
      sinnaStore.toastWarning('Action Restricted', 'Owner audit mode: Seating patients is restricted to reception staff.');
      return;
    }
    if (selectedChair === 1 && isChair1Busy) {
      sinnaStore.toastWarning('Operatory Busy', 'Dr. Senait is currently conducting treatment in Chair 1. Cannot send another patient until chair is vacated.');
      return;
    }
    if (selectedChair === 2 && isChair2Busy) {
      sinnaStore.toastWarning('Operatory Busy', 'Chair 2 is currently occupied by another patient.');
      return;
    }
    sinnaStore.requestSeatInChair(apt.id, selectedChair);
    onClose();
  };

  const handlePrintSlip = () => {
    printPatientChart(
      {
        id: apt.id,
        mrn: chart?.cardNo || chart?.medicalRecordNumber || (apt.id.startsWith('BDS-') ? apt.id : 'BDS-00041'),
        name: apt.patientName,
        nameAmharic: chart?.fullNameAmharic || nameAmharic || '',
        phone: apt.patientPhone,
        email: 'patient@clinic.et',
        age: chart?.age || age,
        gender: chart?.gender || gender,
        dob: '1996-04-10',
        allergies: chart?.medicalHistory?.allergies || [],
        systemicDiseases: chart?.medicalHistory?.systemicDiseases || [],
        currentMedications: chart?.medicalHistory?.currentMedications || [],
        diagnosesUntreated: chart?.definitiveDiagnosis ? [chart.definitiveDiagnosis] : [],
        notes: chart?.hpi || chart?.chiefComplaint || notes || `Regular dental visit at ${clinic.name}.`,
        activePlanTitle: patientTreatmentPlan?.title || apt.serviceName,
        balanceETB: balanceETB,
        totalPaidETB: apt.depositPaidETB,
      },
      clinic
    );
    sinnaStore.toastSuccess('Slip Ready', `Official visit record printed for ${apt.patientName}`);
  };

  // Cashier Desk Payment Handler (Interactive Desk inside Billing tab)
  const handleProcessPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!apt) return;

    if (isOwner) {
      sinnaStore.toastWarning('Action Restricted', 'Owner audit mode: Cashier settlement is restricted to reception cashier.');
      return;
    }

    const amt = parseFloat(cashierAmount) || balanceETB || 0;
    if (amt <= 0) {
      sinnaStore.toastWarning('Invalid Amount', 'Please specify a valid payment amount greater than 0 ETB.');
      return;
    }

    const isFromCashierDesk = store.patientDrawerInitialTab === 'billing';

    sinnaStore.checkOutAndSettle(apt.id, {
      method: cashierMethod,
      amountPaidETB: amt,
      recordedBy: store.currentUser?.name || 'Helen Tadesse',
    });

    sinnaStore.toastSuccess(
      'Payment Settled · Cashier Released',
      `Received ${amt.toLocaleString()} ETB via ${cashierMethod.replace('_', ' ').toUpperCase()} from ${apt.patientName}. Patient erased from Cashier Desk.`
    );

    const newTx = store.ledger.find((t) => t.appointmentId === apt.id);
    if (newTx) {
      setSelectedReceiptTx(newTx);
    }
    setShowExtraPaymentForm(false);

    if (isFromCashierDesk) {
      onClose();
    }
  };

  // Thermal 80mm Receipt Print Handler
  const handlePrintThermal = (tx?: LedgerTransaction | null) => {
    if (!apt) return;
    const rNumber = tx?.receiptNumber || apt.receiptNumber || `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const rAmount = tx?.amountETB || parseFloat(cashierAmount) || balanceETB || dynamicTotalDue || 1500;
    const rMethod = (tx?.method || cashierMethod).replace('_', ' ').toUpperCase();

    printThermalReceipt(
      {
        receiptNumber: rNumber,
        patientName: apt.patientName,
        doctorName: apt.doctorName || 'Dr. Senait Tadesse',
        serviceName: apt.serviceName || 'Clinical Dental Prophylaxis',
        amountETB: rAmount,
        paymentMethod: rMethod,
        tinNumber: '0049283711',
      },
      clinic
    );
    sinnaStore.toastSuccess('Receipt Printed', `Thermal 80mm MoR receipt ${rNumber} printed successfully.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Slide-over Drawer (Administrative & Rescheduling with Rich Visit History) */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        
        {/* Owner View / Audit Notification Banner */}
        {isOwner && (
          <div className="bg-slate-900 text-white px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold">Owner Audit View:</span>
              <span className="text-slate-300 text-[11px]">Read-only mode. Operational check-in, seating, and cashier billing are staff-managed.</span>
            </div>
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Audit</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. CLINICAL HEADER WITH STATUS & QUICK ACTIONS                    */}
        {/* ================================================================= */}
        <div className={`p-4 sm:p-5 border-b transition-colors ${
          isDoctorCancelled ? 'bg-rose-50/80 border-rose-200' : 'bg-slate-50/95 border-slate-200'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${
                isDoctorCancelled ? 'bg-rose-600' : 'bg-blue-600'
              }`}>
                {patientName ? patientName.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'PT'}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`font-bold text-base sm:text-lg leading-snug transition-colors truncate ${
                    isDoctorCancelled ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {patientName || apt.patientName}
                  </h2>
                  {nameAmharic && (
                    <span className="text-xs font-semibold text-slate-500 font-amharic">
                      ({nameAmharic})
                    </span>
                  )}
                  {isDoctorCancelled ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                      Cancelled Seating · Still Waiting
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      apt.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : apt.status === 'checked_in'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : apt.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {apt.status === 'in_progress' ? 'In Chair' : apt.status === 'checked_in' ? 'Waiting in Lounge' : (apt.status || 'confirmed').replace('_', ' ')}
                    </span>
                  )}
                  {Boolean(apt.isOnlineBooking || apt.source === 'online' || apt.source === 'copilot' || (apt.notes && apt.notes.includes('Online')) || (apt.notes && apt.notes.includes('Booked via'))) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1 shadow-2xs font-amharic">
                      <Globe className="w-3 h-3 text-sky-700" />
                      <span>በኦንላይን የተያዘ (Online)</span>
                    </span>
                  )}
                </div>

                {/* Subtitle details */}
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5 flex-wrap">
                  <span className="font-semibold text-slate-700">{chart?.cardNo || (apt.id.startsWith('BDS-') ? apt.id : 'BDS-00041')}</span>
                  <span>·</span>
                  <a
                    href={`tel:${patientPhone || apt.patientPhone}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                    title="Call patient"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{patientPhone || apt.patientPhone}</span>
                  </a>
                  <span>·</span>
                  <span>{age} yrs ({gender})</span>
                  {isDoctorCancelled && (
                    <>
                      <span>·</span>
                      <span className="text-rose-600 font-bold">Doctor busy at {apt.seatingCancelledAt || 'recent'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Top Right Action Icons & Operatory Dispatch Triggers */}
            <div className="flex items-center gap-1.5 shrink-0">
              {(!apt.status || apt.status === 'confirmed' || apt.status === 'pending_hold') && (
                <button
                  type="button"
                  disabled={isOwner}
                  onClick={() => {
                    if (isOwner) return;
                    sinnaStore.checkInAppointment(apt.id);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1 mr-1 ${
                    isOwner
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : 'text-white bg-slate-900 hover:bg-slate-800 active:scale-98'
                  }`}
                  title={isOwner ? 'Owner audit mode: Patient check-in restricted' : 'Check in patient to lounge'}
                >
                  <Check className={`w-3.5 h-3.5 ${isOwner ? 'text-slate-400' : 'text-emerald-400'}`} />
                  <span>{isOwner ? 'Check In (Locked)' : 'Check In'}</span>
                </button>
              )}

              {apt.status === 'checked_in' && (
                apt.seatingStatus === 'requested' ? (
                  <span className="px-2.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-xl flex items-center gap-1.5 mr-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <span>Awaiting Dr. Accept</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isOwner || isTargetChairBusy}
                    onClick={() => {
                      if (isOwner || isTargetChairBusy) return;
                      sinnaStore.requestSeatInChair(apt.id, selectedChair);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-1 mr-1 ${
                      isOwner
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : isTargetChairBusy
                        ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                        : 'text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                    }`}
                    title={
                      isOwner
                        ? 'Owner audit mode: Operatory seating restricted'
                        : isTargetChairBusy
                        ? selectedChair === 1
                          ? 'Dr. Senait is actively conducting treatment in Chair 1. Cannot send another patient.'
                          : 'Chair 2 is currently occupied by another patient.'
                        : `Send seating request to Doctor for Chair ${selectedChair}`
                    }
                  >
                    <Armchair className="w-3 h-3" />
                    <span>
                      {isOwner
                        ? `Seat Chair ${selectedChair} (Locked)`
                        : isTargetChairBusy
                        ? selectedChair === 1
                          ? 'Dr. Senait Busy'
                          : 'Chair 2 Busy'
                        : `Seat Chair ${selectedChair}`}
                    </span>
                  </button>
                )
              )}

              <button
                type="button"
                onClick={handlePrintSlip}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors border border-slate-200/80 bg-white shadow-2xs"
                title="Print Official Ethiopian Visit Slip / Patient Card"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                title="Close drawer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>



          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-slate-200/60 text-center font-sans">
            <div className="bg-white/80 p-1.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Past Visits</span>
              <strong className="text-xs font-bold text-slate-900">{previousVisits.length} Visits</strong>
            </div>
            <div className="bg-white/80 p-1.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Paid</span>
              <strong className="text-xs font-bold text-emerald-600 font-mono">{totalHistoricalPaidETB.toLocaleString()} ETB</strong>
            </div>
            <div className="bg-white/80 p-1.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Balance Due</span>
              <strong className={`text-xs font-bold font-mono ${balanceETB > 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                {balanceETB.toLocaleString()} ETB
              </strong>
            </div>
            <div className="bg-white/80 p-1.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Primary Doctor</span>
              <strong className="text-xs font-bold text-slate-900 truncate block">
                {apt.doctorName.split(' ')[1] || 'Senait'}
              </strong>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. RECEPTION NAVIGATION TABS                                      */}
        {/* ================================================================= */}
        <div className="px-5 pt-2 border-b border-slate-200 bg-white flex items-center justify-between gap-1 overflow-x-auto text-xs font-medium">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`py-2 px-3 border-b-2 font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'today'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today &amp; Actions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`py-2 px-3 border-b-2 font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Previous Visits</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                {previousVisits.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`py-2 px-3 border-b-2 font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'billing'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Bills &amp; Payments</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('demographics')}
              className={`py-2 px-3 border-b-2 font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'demographics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient Profile</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. TAB CONTENT BODY                                               */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-700">
          
          {/* --------------------------------------------------------------- */}
          {/* TAB 1: TODAY & RESCHEDULING ACTIONS                             */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'today' && (
            <div className="space-y-4 animate-fade-in">
              {/* Doctor Cancelled Seating Banner: Patient is still waiting */}
              {isDoctorCancelled && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                        <span>Doctor Cancelled Seating</span>
                        <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-rose-200/70 text-rose-800">
                          {apt.seatingCancelledAt || 'Recent'}
                        </span>
                      </p>
                      <p className="text-[11px] text-rose-700 font-medium truncate">
                        Dr. Senait is busy with a procedure · Patient is still waiting in the reception lounge
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isOwner || isTargetChairBusy}
                    onClick={handleSeatPatientFromDrawer}
                    className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1.5 ${
                      isOwner
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                        : isTargetChairBusy
                        ? 'bg-slate-400 cursor-not-allowed opacity-75'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                    title={
                      isOwner
                        ? 'Owner audit mode: Seating restricted'
                        : isTargetChairBusy
                        ? selectedChair === 1
                          ? 'Dr. Senait is actively conducting treatment in Chair 1.'
                          : 'Chair 2 is currently occupied.'
                        : `Re-Seat Chair ${selectedChair}`
                    }
                  >
                    <span>
                      {isOwner
                        ? `Re-Seat Chair ${selectedChair} (Locked)`
                        : isTargetChairBusy
                        ? selectedChair === 1
                          ? 'Dr. Senait Busy (Chair 1)'
                          : 'Chair 2 Busy'
                        : `Re-Seat Chair ${selectedChair}`}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Regular Quick Seating Action if Waiting (and not cancelled) */}
              {apt.status === 'checked_in' && !isDoctorCancelled && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Armchair className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs">Patient Waiting in Lounge</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Assigned: Chair {selectedChair} ({selectedChair === 1 ? 'Dr. Senait' : 'Dr. Dawit'})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={isOwner || isTargetChairBusy}
                      onClick={handleSeatPatientFromDrawer}
                      className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                        isOwner
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                          : isTargetChairBusy
                          ? 'bg-slate-400 cursor-not-allowed opacity-75'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      title={
                        isOwner
                          ? 'Owner audit mode: Seating restricted'
                          : isTargetChairBusy
                          ? selectedChair === 1
                            ? 'Dr. Senait is actively conducting treatment in Chair 1.'
                            : 'Chair 2 is currently occupied.'
                          : `Seat in Chair ${selectedChair}`
                      }
                    >
                      <span>
                        {isOwner
                          ? `Seat in Chair ${selectedChair} (Locked)`
                          : isTargetChairBusy
                          ? selectedChair === 1
                            ? 'Dr. Senait Busy (Chair 1)'
                            : 'Chair 2 Busy'
                          : `Seat in Chair ${selectedChair}`}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isOwner}
                      onClick={() => {
                        if (isOwner) return;
                        const otherChair = selectedChair === 1 ? 2 : 1;
                        const otherDoc = otherChair === 1 ? 'Dr. Senait Tadesse' : 'Dr. Dawit Bekele';
                        setSelectedChair(otherChair);
                        setSelectedDoctor(otherDoc);
                        sinnaStore.reassignDoctorAndChair(apt.id, otherDoc, otherChair);
                      }}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
                        isOwner
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title={isOwner ? 'Owner audit mode: Operatory reassignment restricted' : 'Switch operatory and doctor'}
                    >
                      Change to Chair {selectedChair === 1 ? 2 : 1}
                    </button>
                  </div>
                </div>
              )}

              {/* Patient Arrival & Check-In Action Card (for Confirmed / Online Reservations) */}
              {(apt.status === 'confirmed' || apt.status === 'pending_hold') && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent border border-blue-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">Patient Arrival &amp; Check-In</h4>
                        <p className="text-[11px] text-slate-500">
                          Assigned: Chair {selectedChair} ({selectedChair === 1 ? 'Dr. Senait Tadesse' : 'Dr. Dawit Bekele'})
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                      Arrived at Clinic
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-blue-100 flex-wrap">
                    <button
                      type="button"
                      disabled={isOwner}
                      onClick={() => {
                        if (isOwner) return;
                        sinnaStore.checkInAppointment(apt.id);
                        sinnaStore.toastSuccess('Checked In', `${apt.patientName} moved to Waiting Lounge`);
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
                        isOwner
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title={isOwner ? 'Owner audit mode: Patient check-in restricted' : 'Check in patient to lounge'}
                    >
                      <Armchair className="w-3.5 h-3.5" />
                      <span>{isOwner ? 'Check In (Locked)' : 'Check In to Lounge'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={apt.seatingStatus === 'requested' || isOwner || isTargetChairBusy}
                      onClick={() => {
                        if (isOwner || isTargetChairBusy) return;
                        sinnaStore.requestSeatInChair(apt.id, selectedChair);
                        onClose();
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
                        isOwner
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                          : apt.seatingStatus === 'requested'
                          ? 'bg-amber-500 cursor-wait text-white'
                          : isTargetChairBusy
                          ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                          : selectedChair === 1
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                      title={
                        isOwner
                          ? 'Owner audit mode: Operatory seating restricted'
                          : isTargetChairBusy
                          ? selectedChair === 1
                            ? 'Dr. Senait is actively conducting treatment in Chair 1.'
                            : 'Chair 2 is currently occupied.'
                          : `Seat in Chair ${selectedChair}`
                      }
                    >
                      {apt.seatingStatus === 'requested' ? (
                        <span>Awaiting Doctor Accept...</span>
                      ) : isOwner ? (
                        <span>Seat in Chair {selectedChair} (Locked)</span>
                      ) : isTargetChairBusy ? (
                        <span>{selectedChair === 1 ? 'Dr. Senait Busy (Chair 1)' : 'Chair 2 Busy'}</span>
                      ) : (
                        <>
                          <span>Seat in Chair {selectedChair}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isOwner}
                      onClick={() => {
                        if (isOwner) return;
                        const otherChair = selectedChair === 1 ? 2 : 1;
                        const otherDoc = otherChair === 1 ? 'Dr. Senait Tadesse' : 'Dr. Dawit Bekele';
                        setSelectedChair(otherChair);
                        setSelectedDoctor(otherDoc);
                        sinnaStore.reassignDoctorAndChair(apt.id, otherDoc, otherChair);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all shadow-2xs shrink-0 ${
                        isOwner
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title={isOwner ? 'Owner audit mode: Operatory reassignment restricted' : 'Switch operatory and doctor'}
                    >
                      Change to Chair {selectedChair === 1 ? 2 : 1}
                    </button>
                  </div>
                </div>
              )}

              {/* Online Booking Channel & Verified Deposit Card */}
              {Boolean(apt.isOnlineBooking || apt.source === 'online' || apt.source === 'copilot' || (apt.notes && apt.notes.includes('Online')) || (apt.notes && apt.notes.includes('Booked via'))) && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-transparent border border-sky-300 text-slate-900 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sky-900 font-bold text-xs">
                      <Globe className="w-4 h-4 text-sky-600" />
                      <span>በኦንላይን የተያዘ ቀጠሮ · Online Patient Reservation</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-600 text-white shadow-2xs">
                      {apt.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-sky-200/60 font-sans">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">የተመዘገበበት መንገድ (Channel):</span>
                      <strong className="text-slate-800">{apt.bookedVia || 'Sinna Web Portal (ኦንላይን)'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">የቅድመ ክፍያ ሁኔታ (Deposit):</span>
                      <strong className="text-emerald-700 font-mono">
                        {apt.depositPaidETB > 0 ? `${apt.depositPaidETB} ETB የተረጋገጠ (${(apt.depositMethod || 'telebirr').toUpperCase()})` : 'ቅድመ ክፍያ ተረጋግጧል'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Booking Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Today's Treatment Session
                  </span>
                  <span className="text-[11px] font-mono text-slate-700 font-bold">
                    {new Date(apt.startsAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{apt.serviceName}</h3>
                  <span className="font-mono font-bold text-blue-600 text-xs">
                    {apt.totalDueETB.toLocaleString()} ETB
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span>{apt.doctorName}</span>
                  <span>·</span>
                  <Armchair className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chair {apt.chairNumber || 1}</span>
                </div>
              </div>

              {/* Reschedule Date & Time Form */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reschedule Date &amp; Operatory Chair</span>
                  </h3>
                  <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    In-Place Edit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Assigned Operatory Chair
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChair(1);
                          setSelectedDoctor('Dr. Senait Tadesse');
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                          selectedChair === 1
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        Chair 1 (Senait{isChair1Busy ? ' · Busy' : ''})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChair(2);
                          setSelectedDoctor('Dr. Dawit Bekele');
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                          selectedChair === 2
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        Chair 2 (Dawit{isChair2Busy ? ' · Busy' : ''})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Time Slot Chips */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5 flex items-center justify-between">
                    <span>Select Time Slot</span>
                    <span className="font-mono text-blue-600 font-bold">{selectedSlot}</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {AVAILABLE_TIME_SLOTS.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-1.5 px-2 rounded-xl border text-[11px] font-mono font-semibold transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AfroMessage SMS notification toggle */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendSmsNotification}
                      onChange={(e) => setSendSmsNotification(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Send AfroMessage SMS confirmation to patient
                    </span>
                  </label>

                  {sendSmsNotification && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                      <p className="font-amharic text-slate-800">
                        ሰላም {patientName || 'ደንበኛ'}፣ በ {clinic.name} ያደረጉት የቀጠሮ መረጃ ተዘምኗል። ቀን፡ {selectedDate} በ {selectedSlot}።
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        To: {patientPhone || clinic.phone || '+251 91 122 3344'} · AfroMessage Gateway
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Front Desk Administrative Notes */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Front Desk Administrative Notes</span>
                </h3>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Prefers morning appointments, needs printed receipt for employer reimbursement..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 2: PREVIOUS VISITS & APPOINTMENT HISTORY (CORE REQUIREMENT) */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Appointment History &amp; Previous Treatments</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Chronological record of dates, services rendered, attending doctors, and operatory chairs
                  </p>
                </div>

                {/* Filter chips by doctor */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold self-start">
                  <button
                    type="button"
                    onClick={() => setHistoryDoctorFilter('all')}
                    className={`px-2 py-1 rounded transition-colors ${
                      historyDoctorFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({previousVisits.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryDoctorFilter('senait')}
                    className={`px-2 py-1 rounded transition-colors ${
                      historyDoctorFilter === 'senait'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dr. Senait
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryDoctorFilter('dawit')}
                    className={`px-2 py-1 rounded transition-colors ${
                      historyDoctorFilter === 'dawit'
                        ? 'bg-white text-emerald-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dr. Dawit
                  </button>
                </div>
              </div>

              {filteredVisits.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-xs text-slate-700">No Previous Visits Recorded</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    This patient has no archived past visits matching the filter. When today's appointment is completed, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredVisits.map((visit, idx) => {
                    const isSenait = visit.doctorName.includes('Senait');

                    return (
                      <div
                        key={visit.id || idx}
                        className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-blue-300 transition-all space-y-2.5"
                      >
                        {/* Top Row: Date, Time & Status */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-bold text-xs text-slate-900 font-mono">
                              {visit.date} · {visit.time}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {visit.receiptNumber}
                            </span>
                          </div>
                        </div>

                        {/* Service Name & Fee */}
                        <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-100">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">
                              {visit.serviceName}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] border ${
                                isSenait
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}>
                                <Stethoscope className="w-3 h-3" />
                                <span>{visit.doctorName}</span>
                              </span>

                              <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                                <Armchair className="w-3 h-3 text-slate-400" />
                                <span>Chair {visit.chairNumber}</span>
                              </span>

                              <span className="text-slate-300">·</span>

                              <span className="text-[10px] text-slate-500 font-medium">
                                {visit.paymentMethod}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-slate-900 font-mono block">
                              {visit.feeETB.toLocaleString()} ETB
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                              Fully Settled
                            </span>
                          </div>
                        </div>

                        {/* Clinical / Administrative Discharge Summary */}
                        {visit.dischargeNotes && (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 leading-relaxed font-sans">
                            <span className="font-semibold text-slate-800 block text-[10px] uppercase mb-0.5">
                              Encounter Notes:
                            </span>
                            {visit.dischargeNotes}
                          </div>
                        )}

                        {/* Prescriptions from this visit */}
                        {visit.prescriptions && visit.prescriptions.length > 0 && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-700 text-[10px] uppercase">Rx Prescribed:</span>
                            {visit.prescriptions.map((rx, rIdx) => (
                              <span key={rIdx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-mono border border-blue-200">
                                {rx}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 3: BILLS & PAYMENTS (የክፍያ መዝገብ)                           */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'billing' && (
            <div className="space-y-4 animate-fade-in">
              {/* Account Balance Strip */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bills &amp; Payments</span>
                    <span className="text-slate-400 font-normal font-amharic">(የክፍያ መዝገብ)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    TIN: 0049283711
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Today's Fee</span>
                    <strong className="text-xs font-bold text-slate-900 font-mono">
                      {dynamicTotalDue.toLocaleString()} ETB
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Deposit Paid</span>
                    <strong className="text-xs font-bold text-emerald-600 font-mono">
                      {apt.depositPaidETB.toLocaleString()} ETB
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Remaining Due</span>
                    <strong className={`text-xs font-bold font-mono ${balanceETB > 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                      {balanceETB.toLocaleString()} ETB
                    </strong>
                  </div>
                </div>
              </div>

              {/* Dynamic Staged Treatment Plan Breakdown */}
              {patientTreatmentPlan && patientTreatmentPlan.procedures.length > 0 && (
                <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                        Staged Treatment Plan Breakdown
                      </span>
                      <h4 className="font-bold text-xs text-blue-950 mt-0.5">
                        {patientTreatmentPlan.title}
                      </h4>
                    </div>
                    <span className="font-mono font-bold text-xs text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                      {planProceduresTotal.toLocaleString()} ETB Total
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-blue-200/60">
                    {patientTreatmentPlan.procedures.map((proc, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/80 border border-blue-100">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${proc.status === 'completed' ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <span className="text-slate-800 truncate font-medium">{proc.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">
                          {proc.feeETB ? `${proc.feeETB.toLocaleString()} ETB` : '0 ETB'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orthodontic Contract (if client is on braces plan) */}
              {patientContract && (
                <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                        Orthodontic Treatment Contract
                      </span>
                      <h4 className="font-bold text-xs text-indigo-950 mt-0.5">
                        {patientContract.title}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                      Visit {patientContract.completedVisitsCount} of {patientContract.estimatedVisits}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-indigo-200/60">
                    <div>
                      <span className="text-[10px] text-indigo-500 block uppercase font-semibold">Installment per Visit</span>
                      <span className="font-mono font-bold text-indigo-900">
                        {patientContract.installmentPerVisitETB.toLocaleString()} ETB
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-500 block uppercase font-semibold">Contract Balance</span>
                      <span className="font-mono font-bold text-indigo-900">
                        {patientContract.remainingBalanceETB.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* INTERACTIVE CASHIER DESK STATION (የክፍያ መቀበያ ዴስክ)        */}
              {/* ======================================================= */}
              {(balanceETB > 0 || showExtraPaymentForm) ? (
                <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          Cashier Payment Terminal
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Ministry of Revenues (MoR) Fiscal POS Desk
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Balance Due
                      </span>
                      <span className="text-sm font-black font-mono text-slate-900">
                        {balanceETB.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Rails Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Select Payment Rail / Method:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Telebirr */}
                      <button
                        type="button"
                        onClick={() => setCashierMethod('telebirr_manual')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                          cashierMethod === 'telebirr_manual'
                            ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Smartphone className="w-4 h-4 text-sky-600" />
                          {cashierMethod === 'telebirr_manual' && (
                            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">Telebirr</span>
                          <span className="text-[9px] text-slate-400 font-medium">USSD *127# / App</span>
                        </div>
                      </button>

                      {/* CBE Birr */}
                      <button
                        type="button"
                        onClick={() => setCashierMethod('cbe_manual')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                          cashierMethod === 'cbe_manual'
                            ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <CreditCard className="w-4 h-4 text-purple-600" />
                          {cashierMethod === 'cbe_manual' && (
                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">CBE Birr</span>
                          <span className="text-[9px] text-slate-400 font-medium">POS / Mobile *847#</span>
                        </div>
                      </button>

                      {/* Cash */}
                      <button
                        type="button"
                        onClick={() => setCashierMethod('cash')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                          cashierMethod === 'cash'
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Coins className="w-4 h-4 text-emerald-600" />
                          {cashierMethod === 'cash' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">Cash (ብር)</span>
                          <span className="text-[9px] text-slate-400 font-medium">Banknotes &amp; Change</span>
                        </div>
                      </button>

                      {/* Chapa / Card */}
                      <button
                        type="button"
                        onClick={() => setCashierMethod('chapa_online')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                          cashierMethod === 'chapa_online'
                            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Globe className="w-4 h-4 text-blue-600" />
                          {cashierMethod === 'chapa_online' && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">Chapa</span>
                          <span className="text-[9px] text-slate-400 font-medium">Visa / Internet Bank</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Payment Inputs & Quick Fill Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Amount to Settle */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">
                          Amount to Settle (ETB)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Due: {balanceETB.toLocaleString()} ETB
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={cashierAmount}
                          onChange={(e) => {
                            setCashierAmount(e.target.value);
                            if (cashierMethod === 'cash') setCashTendered(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8 shadow-2xs"
                          placeholder="Amount in ETB"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                          ETB
                        </span>
                      </div>
                      {/* Quick Amount Chips */}
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            const val = String(balanceETB > 0 ? balanceETB : 1500);
                            setCashierAmount(val);
                            if (cashierMethod === 'cash') setCashTendered(val);
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold transition-colors"
                        >
                          Exact Due ({balanceETB > 0 ? balanceETB : 1500})
                        </button>
                        {balanceETB > 500 && (
                          <button
                            type="button"
                            onClick={() => {
                              const val = String(Math.round(balanceETB / 2));
                              setCashierAmount(val);
                              if (cashierMethod === 'cash') setCashTendered(val);
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold transition-colors"
                          >
                            50% Deposit ({Math.round(balanceETB / 2)})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Cash Tendered & Change (If Cash selected) OR Reference Code (If Telebirr/CBE) */}
                    {cashierMethod === 'cash' ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">
                            Cash Received from Patient (ETB)
                          </label>
                          <span className="text-[10px] text-emerald-700 font-bold font-mono">
                            Change: {Math.max(0, (parseFloat(cashTendered) || 0) - (parseFloat(cashierAmount) || 0)).toLocaleString()} ETB
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-8 shadow-2xs"
                            placeholder="Cash tendered"
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                            ETB
                          </span>
                        </div>
                        {/* Quick Banknote Adders */}
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setCashTendered(cashierAmount)}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold transition-colors"
                          >
                            Exact
                          </button>
                          <button
                            type="button"
                            onClick={() => setCashTendered(String((parseFloat(cashTendered) || 0) + 200))}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold transition-colors"
                          >
                            +200
                          </button>
                          <button
                            type="button"
                            onClick={() => setCashTendered(String((parseFloat(cashTendered) || 0) + 500))}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold transition-colors"
                          >
                            +500
                          </button>
                          <button
                            type="button"
                            onClick={() => setCashTendered(String((parseFloat(cashTendered) || 0) + 1000))}
                            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold transition-colors"
                          >
                            +1,000
                          </button>
                        </div>
                      </div>
                    ) : cashierMethod === 'chapa_online' ? (
                      <div className="space-y-2 bg-blue-50/80 border border-blue-200 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-blue-600" />
                            <span>Chapa Link</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                            {apt.patientPhone || '+251 9...'}
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-800 leading-snug">
                          Chapa will be used so that the patient can complete payment directly on their phone using Telebirr, CBE Birr, Awash, or cards.
                        </p>
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <a
                            href={`https://checkout.chapa.co/pay/sinna-bds-${apt.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
                          >
                            <span>Open Chapa Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              sinnaStore.toastSuccess(
                                'SMS Link Sent',
                                `Chapa payment link sent via SMS to ${apt.patientPhone}.`
                              );
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-colors"
                          >
                            Send SMS to Phone
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase">
                          Transaction Auth / Ref Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={paymentRefCode}
                          onChange={(e) => setPaymentRefCode(e.target.value)}
                          placeholder={cashierMethod === 'telebirr_manual' ? 'e.g. TB9482103' : 'e.g. CBE-849102'}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        />
                        <p className="text-[10px] text-slate-400">
                          Leave blank to auto-generate MoR electronic verification code.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cash Change Banner */}
                  {cashierMethod === 'cash' && (parseFloat(cashTendered) || 0) > (parseFloat(cashierAmount) || 0) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-emerald-900 shadow-2xs animate-fade-in">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Return Change to Patient:</span>
                      </div>
                      <span className="font-mono text-sm font-extrabold text-emerald-700">
                        {((parseFloat(cashTendered) || 0) - (parseFloat(cashierAmount) || 0)).toLocaleString()} ETB
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isOwner}
                      onClick={handleProcessPayment}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-card transition-all flex items-center justify-center gap-2 ${
                        isOwner
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                          : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98 cursor-pointer'
                      }`}
                      title={isOwner ? 'Owner audit mode: Cashier settlements restricted to Reception' : 'Record payment and release receipt'}
                    >
                      <Receipt className={`w-4 h-4 ${isOwner ? 'text-slate-400' : 'text-emerald-400'}`} />
                      <span>{isOwner ? 'Settle Payment (Locked - Front Desk Only)' : 'Settle Payment'}</span>
                    </button>
                    {showExtraPaymentForm && (
                      <button
                        type="button"
                        onClick={() => setShowExtraPaymentForm(false)}
                        className="py-3 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* FULLY SETTLED CARD WITH RECEIPT ACTIONS & EXTRA PAYMENT TOGGLE */
                <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs animate-fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-emerald-950 leading-tight">
                            Account Fully Settled · MoR Fiscal Approved
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Zero Balance
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-relaxed">
                          All dental treatments, scaling, and prescriptions for this appointment have been paid in full.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrintThermal()}
                        className="py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-900 font-bold rounded-xl text-xs border border-emerald-300 transition-colors shadow-2xs flex items-center gap-1.5 active:scale-98 cursor-pointer"
                        title="Print 80mm thermal receipt"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Print MoR Receipt</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReceiptTx(patientTransactions[0] || null);
                          setReceiptModalOpen(true);
                        }}
                        className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5 active:scale-98 cursor-pointer"
                        title="Preview official MoR receipt"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Receipt</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCashierAmount('1500');
                        setCashTendered('1500');
                        setShowExtraPaymentForm(true);
                      }}
                      className="py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-emerald-100/60 rounded-xl transition-colors cursor-pointer"
                      title="Test or record additional fee / adjustment"
                    >
                      + Record Additional Payment / Tip
                    </button>
                  </div>
                </div>
              )}

              {/* Transactions Ledger */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment Receipts &amp; MoR Fiscal Ledger</span>
                  <span className="text-slate-400 font-normal font-amharic">(የክፍያ ደረሰኞች)</span>
                </h4>

                {patientTransactions.length === 0 ? (
                  <div className="text-[11px] text-slate-400 p-4 text-center border border-dashed border-slate-200 rounded-xl">
                    No payments recorded yet. Receipts issued via Telebirr, CBE Birr, or Cash will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {patientTransactions.map((tx) => (
                      <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-mono font-bold text-xs text-slate-900">{tx.receiptNumber}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(tx.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} · {tx.recordedBy}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="font-mono font-bold text-xs text-emerald-600 block">
                              +{tx.amountETB.toLocaleString()} ETB
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 uppercase">
                              {(tx.method || 'cash').replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <button
                              type="button"
                              onClick={() => handlePrintThermal(tx)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/80 bg-white shadow-2xs"
                              title="Print thermal 80mm receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceiptTx(tx);
                                setReceiptModalOpen(true);
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200/80 bg-white shadow-2xs"
                              title="View official fiscal receipt preview"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 4: PATIENT DEMOGRAPHICS (MINIMAL, NO ADDRESS/SUBCITY)        */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'demographics' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Patient Profile &amp; Demographics</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Front Desk Master Record</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Full Name (English)
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="e.g. Abebe Kebede"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Full Name (Amharic)
                    </label>
                    <input
                      type="text"
                      value={nameAmharic}
                      onChange={(e) => setNameAmharic(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-amharic"
                      placeholder="e.g. አበበ ከበደ"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Phone Number (+251)
                    </label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="+251 91 122 3344"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="115"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'Female' | 'Male')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="pt-2 border-t border-slate-200/60 space-y-2">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">
                    Emergency Contact Details
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Contact Name"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="Relationship (e.g. Spouse)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+251 9... Phone"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ================================================================= */}
        {/* 4. DRAWER STICKY FOOTER ACTIONS                                   */}
        {/* ================================================================= */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintSlip}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 flex items-center gap-1.5 shadow-2xs"
              title="Print official clinical visit card"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <button
            type="button"
            disabled={isOwner}
            onClick={() => handleSaveChanges()}
            className={`py-2.5 px-5 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
              isOwner
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
            title={isOwner ? 'Owner audit mode: Record modifications restricted' : 'Save & Update Record'}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isOwner ? 'Save Record (Locked)' : 'Save & Update Record'}</span>
          </button>
        </div>
      </div>

      {/* MoR Official Fiscal Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        appointment={apt}
        transaction={selectedReceiptTx}
        clinic={clinic}
      />
    </div>
  );
}
