'use client';

import { useSyncExternalStore } from 'react';
import { 
  Appointment, 
  Clinic, 
  LedgerTransaction, 
  SmsToastNotification,
  AppointmentStatus,
  PaymentStatus,
  DayCloseReport,
  OperatoryChair,
  ToothStatus,
  UserProfile,
  Doctor,
  ServiceItem,
  TreatmentPlan,
  PlanProcedureItem,
  PlanClinicalNote,
  TreatmentContract,
  ContractInstallment,
  ClinicalToast,
  ClinicalToastType,
  ChairSeatingRequest,
  EthiopianPatientChart
} from './types';
import { 
  INITIAL_CLINICS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_LEDGER, 
  INITIAL_OPERATORY_CHAIRS, 
  INITIAL_TREATMENT_PLANS,
  INITIAL_TREATMENT_CONTRACTS,
  getDynamicMockData
} from './mock-db';

export const DEFAULT_USERS: Record<string, UserProfile> = {
  doctor: {
    id: 'usr-doctor-1',
    name: 'Dr. Senait Tadesse',
    role: 'doctor',
    title: 'Clinical Director & Lead Surgeon',
    stationName: 'Chair 1 Operatory & Management',
  },
  reception: {
    id: 'usr-reception-1',
    name: 'Helen Tadesse',
    role: 'reception',
    title: 'Front Desk Coordinator & Cashier',
    stationName: 'Reception Station #1',
  },
  admin: {
    id: 'usr-owner-1',
    name: 'Ato Dawit Tadesse',
    role: 'admin',
    title: 'Practice Owner & Managing Director',
    stationName: 'Executive Suite',
  },
};

export interface SinnaState {
  activeClinicSlug: string;
  activePersona: 'patient' | 'reception' | 'doctor' | 'manager';
  currentUser: UserProfile;
  clinics: Record<string, Clinic>;
  appointments: Appointment[];
  chairs: OperatoryChair[];
  ledger: LedgerTransaction[];
  activeNotification: SmsToastNotification | null;
  notificationHistory: SmsToastNotification[];
  isDayClosed: boolean;
  dayCloseReport: DayCloseReport | null;
  treatmentPlans: TreatmentPlan[];
  contracts: TreatmentContract[];
  toasts: ClinicalToast[];
  pendingSeatingRequest: ChairSeatingRequest | null;
  isPatientDrawerOpen: boolean;
  selectedPatientRecordId: string | null;
  patientDrawerInitialTab?: 'today' | 'history' | 'billing' | 'demographics' | null;
}

const STORAGE_KEY = 'sinna_os_state_v2';

// Seed initial state
const getInitialState = (): SinnaState => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          currentUser: parsed.currentUser || DEFAULT_USERS.reception,
          clinics: parsed.clinics && Object.keys(parsed.clinics).length > 0 ? parsed.clinics : INITIAL_CLINICS,
          chairs: Array.isArray(parsed.chairs) && parsed.chairs.length > 0 ? parsed.chairs : INITIAL_OPERATORY_CHAIRS,
          appointments: Array.isArray(parsed.appointments) ? parsed.appointments : INITIAL_APPOINTMENTS,
          treatmentPlans: Array.isArray(parsed.treatmentPlans) ? parsed.treatmentPlans : INITIAL_TREATMENT_PLANS,
          contracts: Array.isArray(parsed.contracts) && parsed.contracts.length > 0 ? parsed.contracts : INITIAL_TREATMENT_CONTRACTS,
          ledger: Array.isArray(parsed.ledger) ? parsed.ledger : INITIAL_LEDGER,
          notificationHistory: Array.isArray(parsed.notificationHistory) ? parsed.notificationHistory : [],
          toasts: [],
          pendingSeatingRequest: parsed.pendingSeatingRequest || null,
          isPatientDrawerOpen: false,
          selectedPatientRecordId: null,
          patientDrawerInitialTab: null,
        };
      }
    } catch (e) {
      console.warn('Sinna OS: Failed to restore state from localStorage, falling back to mock seeds', e);
    }
  }

  return {
    activeClinicSlug: 'bole-dental',
    activePersona: 'reception',
    currentUser: DEFAULT_USERS.reception,
    clinics: INITIAL_CLINICS,
    appointments: INITIAL_APPOINTMENTS,
    treatmentPlans: INITIAL_TREATMENT_PLANS,
    contracts: INITIAL_TREATMENT_CONTRACTS,
    ledger: INITIAL_LEDGER,
    activeNotification: null,
    notificationHistory: [
      {
        id: 'sms-seed-1',
        recipientName: 'Abebe Kebede',
        recipientPhone: '+251 91 122 3344',
        templateType: 'confirmation',
        contentAm: 'ሰላም አበበ፣ በ Bole Dental Studio ከ ዶ/ር ሰናይት ታደሰ ጋር ያደረጉት የቀጠሮ ቀን ነገ በ 10:00 ሰዓት ተረጋግጧል። 300 ብር ቅድመ ክፍያ ደርሷል። ቦሌ መድኃኒዓለም።',
        contentEn: 'Hello Abebe, your appointment with Dr. Senait Tadesse at Bole Dental Studio is confirmed for tomorrow at 10:00 AM. 300 ETB deposit received. Bole Medhanialem.',
        timestamp: '10:05 AM',
      }
    ],
    chairs: INITIAL_OPERATORY_CHAIRS,
    isDayClosed: false,
    dayCloseReport: null,
    toasts: [],
    pendingSeatingRequest: null,
    isPatientDrawerOpen: false,
    selectedPatientRecordId: null,
  };
};

let currentState: SinnaState = getInitialState();
const listeners = new Set<() => void>();

// Real-Time Cross-Window Synchronizer (BroadcastChannel + LocalStorage)
const SYNC_CHANNEL_NAME = 'sinna_clinical_sync_bus';
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined') {
  if ('BroadcastChannel' in window) {
    try {
      syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'SINNA_STATE_SYNC' && event.data?.state) {
          currentState = event.data.state;
          listeners.forEach((listener) => listener());
        }
      };
    } catch (e) {
      console.warn('Sinna OS: BroadcastChannel sync setup error', e);
    }
  }

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        currentState = JSON.parse(event.newValue);
        listeners.forEach((listener) => listener());
      } catch (e) {
        console.warn('Sinna OS: storage event sync error', e);
      }
    }
  });
}

function emitChange() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      if (syncChannel) {
        syncChannel.postMessage({ type: 'SINNA_STATE_SYNC', state: currentState });
      }
    } catch (e) {
      console.warn('Sinna OS: localStorage persist failed', e);
    }
  }
  listeners.forEach((listener) => listener());
}

const INITIAL_SERVER_SNAPSHOT: SinnaState = {
  activeClinicSlug: 'bole-dental',
  activePersona: 'reception',
  currentUser: DEFAULT_USERS.reception,
  clinics: INITIAL_CLINICS,
  appointments: INITIAL_APPOINTMENTS,
  treatmentPlans: INITIAL_TREATMENT_PLANS,
  contracts: INITIAL_TREATMENT_CONTRACTS,
  chairs: INITIAL_OPERATORY_CHAIRS,
  ledger: INITIAL_LEDGER,
  activeNotification: null,
  notificationHistory: [],
  isDayClosed: false,
  dayCloseReport: null,
  toasts: [],
  pendingSeatingRequest: null,
  isPatientDrawerOpen: false,
  selectedPatientRecordId: null,
};

export function isOwnerState(): boolean {
  return currentState.currentUser?.role === 'admin' || currentState.activePersona === 'manager';
}

export function isChairBusy(chairNum: number, ignoreAppointmentId?: string): { busy: boolean; patientName?: string } {
  const activeApt = currentState.appointments.find(
    (a) => a.id !== ignoreAppointmentId && a.chairNumber === chairNum && a.status === 'in_progress'
  );
  const chairObj = currentState.chairs.find((c) => c.chairNumber === chairNum);
  if (activeApt || (chairObj && chairObj.status === 'occupied' && chairObj.currentAppointmentId !== ignoreAppointmentId)) {
    return {
      busy: true,
      patientName: activeApt?.patientName || chairObj?.currentPatientName || 'another customer',
    };
  }
  return { busy: false };
}

export const sinnaStore = {
  isOwner(): boolean {
    return isOwnerState();
  },

  isOwnerState(): boolean {
    return isOwnerState();
  },

  isChairBusy(chairNum: number, ignoreAppointmentId?: string): { busy: boolean; patientName?: string } {
    return isChairBusy(chairNum, ignoreAppointmentId);
  },

  getSnapshot(): SinnaState {
    return currentState;
  },

  getServerSnapshot(): SinnaState {
    return INITIAL_SERVER_SNAPSHOT;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Actions
  setActiveClinic(slug: string) {
    currentState = {
      ...currentState,
      activeClinicSlug: slug,
    };
    emitChange();
  },

  setActivePersona(persona: 'patient' | 'reception' | 'doctor' | 'manager') {
    currentState = {
      ...currentState,
      activePersona: persona,
    };
    emitChange();
  },

  switchRole(role: 'reception' | 'doctor' | 'admin') {
    const user = DEFAULT_USERS[role] || DEFAULT_USERS.reception;
    const persona = role === 'admin' ? 'manager' : role;
    currentState = {
      ...currentState,
      activePersona: persona as any,
      currentUser: user,
    };
    emitChange();
    const roleLabel =
      role === 'reception'
        ? 'Reception (Helen)'
        : role === 'doctor'
        ? 'Doctor (Dr. Senait)'
        : 'Owner (Ato Dawit)';
    this.toastSuccess('Role Switched', `Active station is now ${roleLabel}.`);
  },

  resetDemoState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Sinna OS: Failed to clear localStorage', e);
      }
    }
    currentState = {
      activeClinicSlug: 'bole-dental',
      activePersona: 'reception',
      currentUser: DEFAULT_USERS.reception,
      clinics: INITIAL_CLINICS,
      appointments: INITIAL_APPOINTMENTS,
      treatmentPlans: INITIAL_TREATMENT_PLANS,
      contracts: INITIAL_TREATMENT_CONTRACTS,
      chairs: INITIAL_OPERATORY_CHAIRS,
      ledger: INITIAL_LEDGER,
      activeNotification: null,
      notificationHistory: [],
      isDayClosed: false,
      dayCloseReport: null,
      toasts: [],
      pendingSeatingRequest: null,
      isPatientDrawerOpen: false,
      selectedPatientRecordId: null,
    };
    emitChange();
    this.toastSuccess('Demo State Reset', 'Clinic restored to pristine opening-day state.');
  },

  resetToToday() {
    this.resetDemoState();
  },

  createAppointment(
    payload: Appointment | (Omit<Appointment, 'id' | 'status' | 'paymentStatus'> & {
      depositPaidETB?: number;
      depositMethod?: 'telebirr' | 'cbe' | 'chapa_online' | 'cash';
      source?: 'online' | 'walkin' | 'phone' | 'copilot';
      isOnlineBooking?: boolean;
    }),
    transaction?: Partial<LedgerTransaction>
  ): Appointment {
    // 1. DUPLICATION PREVENTION CHECK
    // Normalize phone to last 9 digits and compare startsAt date
    const cleanPhone = (payload.patientPhone || '').replace(/\D/g, '').slice(-9);
    const dateKey = payload.startsAt ? payload.startsAt.split('T')[0] : '';

    const existingApt = currentState.appointments.find((a) => {
      if ('id' in payload && a.id === payload.id) return true;
      const aCleanPhone = (a.patientPhone || '').replace(/\D/g, '').slice(-9);
      const aDateKey = a.startsAt ? a.startsAt.split('T')[0] : '';
      return (
        cleanPhone.length >= 9 &&
        aCleanPhone === cleanPhone &&
        aDateKey === dateKey &&
        a.status !== 'cancelled'
      );
    });

    if (existingApt) {
      this.toastWarning(
        'ቀጠሮ አስቀድሞ ተመዝግቧል',
        `ለዚህ ስልክ ቁጥር (${payload.patientPhone}) ለተመረጠው ቀን ቀጠሮ አስቀድሞ ተመዝግቧል [${existingApt.id}]`
      );
      return existingApt;
    }

    const isFullApt = 'id' in payload;
    const fiveDigits = Math.floor(10000 + Math.random() * 90000);
    const defaultCardNo = `BDS-${fiveDigits}`;
    const aptId = (isFullApt && payload.id && /^BDS-\d{4,5}$/.test(payload.id))
      ? payload.id
      : defaultCardNo;
    const depositPaid = isFullApt ? (payload.depositPaidETB || 0) : (payload.depositPaidETB || 0);
    const hasDeposit = depositPaid > 0;
    const isOnline = isFullApt
      ? Boolean(payload.source === 'online' || payload.isOnlineBooking || (payload.notes && payload.notes.includes('Online')) || (payload.notes && payload.notes.includes('Booked via')))
      : true;

    const patientChart: EthiopianPatientChart = payload.patientChart || {
      cardNo: aptId,
      medicalRecordNumber: aptId,
      fullNameAmharic: payload.patientName,
      age: 30,
      gender: 'Female',
      emergencyContact: {
        name: 'Ato Kebede (Family)',
        relationship: 'Family Member',
        phone: payload.patientPhone,
      },
      chiefComplaint: payload.serviceName || 'Dental Examination & Consultation',
      hpi: `Patient registered with BDS card number ${aptId}. Deposit paid: ${depositPaid} ETB.`,
      medicalHistory: {
        allergies: ['No known allergies documented on self-registration'],
        systemicDiseases: [],
        currentMedications: [],
        bleedingDisorders: false,
      },
      clinicalFindings: {
        extraoral: 'Symmetrical, no lymphadenopathy noted.',
        intraoralSoftTissue: 'Mucosa healthy.',
        intraoralHardTissue: 'Generalized healthy dentition; awaiting doctor assessment.',
        percussionTest: 'Negative',
        vitalityTest: 'Pending clinical assessment',
      },
      radiographicNotes: 'Bitewings / periapical radiographs to be determined at chairside.',
      definitiveDiagnosis: 'Clinical Examination & Dental Assessment Pending',
      stagedTreatmentPlan: [payload.serviceName || 'Comprehensive Clinical Exam'],
      prescriptions: [],
    };

    const newAppointment: Appointment = isFullApt
      ? {
          source: payload.source || 'online',
          isOnlineBooking: isOnline,
          patientChart: payload.patientChart || patientChart,
          ...payload,
          id: aptId,
          depositPaidETB: payload.depositPaidETB !== undefined ? payload.depositPaidETB : depositPaid,
          status: ((payload as any).status as AppointmentStatus) || 'confirmed',
          paymentStatus: ((payload as any).paymentStatus as PaymentStatus) || (hasDeposit ? 'deposit_paid' : 'none'),
        }
      : {
          ...payload,
          id: aptId,
          status: 'confirmed',
          paymentStatus: hasDeposit ? 'deposit_paid' : 'none',
          depositPaidETB: depositPaid,
          totalDueETB: payload.totalDueETB,
          source: payload.source || 'online',
          isOnlineBooking: true,
          patientChart,
        };

    let updatedLedger = currentState.ledger;
    if (transaction && (transaction.amountETB || 0) > 0) {
      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        appointmentId: newAppointment.id,
        patientName: newAppointment.patientName,
        receiptNumber: newAppointment.receiptNumber || `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        amountETB: transaction.amountETB || 0,
        method: transaction.method || 'cash',
        recordedBy: currentState.currentUser?.name || 'Helen Tadesse',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      updatedLedger = [tx, ...updatedLedger];
    } else if (hasDeposit) {
      const depositTx: LedgerTransaction = {
        id: `tx-${Date.now()}`,
        appointmentId: aptId,
        patientName: payload.patientName,
        receiptNumber: `DEP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        amountETB: depositPaid,
        method: (!isFullApt && payload.depositMethod === 'telebirr') ? 'telebirr_manual' : 'chapa_online',
        recordedBy: 'Chapa Telebirr Gateway',
        timestamp: new Date().toISOString(),
      };
      updatedLedger = [depositTx, ...updatedLedger];
    }

    currentState = {
      ...currentState,
      appointments: [newAppointment, ...currentState.appointments],
      ledger: updatedLedger,
    };

    emitChange();
    return newAppointment;
  },

  checkInPatient(appointmentId: string) {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Patient check-in is reserved for front desk reception (Helen Tadesse).'
      );
      return;
    }
    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              status: 'checked_in' as AppointmentStatus,
              checkedInAt: new Date().toISOString(),
            }
          : apt
      ),
    };
    emitChange();
  },

  checkInAppointment(appointmentId: string) {
    this.checkInPatient(appointmentId);
  },

  reassignDoctorAndChair(appointmentId: string, doctorName: string, chairNumber: number) {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Operatory reassignment is reserved for front desk reception.'
      );
      return;
    }
    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              doctorName,
              doctorId: doctorName.includes('Senait') ? 'doc-senait' : 'doc-dawit',
              chairNumber,
            }
          : apt
      ),
    };
    emitChange();
    this.toastSuccess('Operatory Assigned', `Assigned to ${doctorName} (Chair ${chairNumber})`);
  },

  checkInWalkIn(payload: {
    patientName: string;
    patientPhone: string;
    serviceName?: string;
    doctorName?: string;
    totalDueETB?: number;
  }): Appointment {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Walk-in check-in is reserved for front desk reception.'
      );
    }
    const nowIso = new Date().toISOString();
    const aptId = `walkin-${Date.now()}`;
    const newApt: Appointment = {
      id: aptId,
      clinicId: 'clinic-bole-001',
      patientName: payload.patientName,
      patientPhone: payload.patientPhone,
      serviceId: 'srv-emergency',
      serviceName: payload.serviceName || 'Consultation & Exam',
      doctorId: 'doc-senait',
      doctorName: payload.doctorName || 'Dr. Senait Tadesse',
      startsAt: nowIso,
      endsAt: new Date(Date.now() + 30 * 60000).toISOString(),
      status: 'checked_in',
      paymentStatus: 'none',
      depositPaidETB: 0,
      totalDueETB: payload.totalDueETB || 1200,
      checkedInAt: nowIso,
      medicalAlerts: [],
    };

    const notification: SmsToastNotification = {
      id: `sms-${Date.now()}`,
      recipientName: payload.patientName,
      recipientPhone: payload.patientPhone,
      templateType: 'confirmation',
      contentAm: `ሰላም ${payload.patientName}፣ ወደ Bole Dental Studio እንኳን ደህና መጡ! ወደ መጠበቂያ ክፍል ገብተዋል። በቅርቡ ዶክተሩ ይጠሩዎታል።`,
      contentEn: `Welcome ${payload.patientName} to Bole Dental Studio! You are checked in and waiting. The doctor will see you shortly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    currentState = {
      ...currentState,
      appointments: [newApt, ...currentState.appointments],
      activeNotification: notification,
      notificationHistory: [notification, ...currentState.notificationHistory],
    };

    emitChange();
    return newApt;
  },

  startTreatment(appointmentId: string) {
    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              status: 'in_progress' as AppointmentStatus,
            }
          : apt
      ),
    };
    emitChange();
  },

  completeDoctorEncounter(
    appointmentId: string,
    params?: {
      addedProcedures?: { nameEn: string; priceETB: number }[];
      notes?: string;
      recallMonths?: number;
      finalFeeETB?: number;
    }
  ) {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Clinical encounter completion is reserved for Dr. Senait Tadesse.'
      );
      return;
    }
    const apt = currentState.appointments.find((a) => a.id === appointmentId);
    const chairNum = apt?.chairNumber || 1;
    const patientName = apt?.patientName || 'Patient';
    const extraCost = (params?.addedProcedures || []).reduce((acc, p) => acc + p.priceETB, 0);

    // Look up active treatment plan for this patient across all recorded plans
    const matchingPlan = currentState.treatmentPlans?.find(
      (p) =>
        (apt && (p.patientId === apt.id || p.id === apt.id)) ||
        (apt?.patientChart?.cardNo && p.patientId === apt.patientChart.cardNo) ||
        (apt && p.patientName && p.patientName.toLowerCase() === apt.patientName.toLowerCase())
    );

    const planProceduresTotal = matchingPlan?.procedures?.reduce((sum, p) => sum + (p.feeETB || 0), 0) || 0;
    const planQuoteTotal = matchingPlan?.quoteAmountETB || 0;
    const planMonies = planProceduresTotal > 0 ? planProceduresTotal : planQuoteTotal;

    const calculatedTotalDue =
      params?.finalFeeETB !== undefined && params.finalFeeETB > 0
        ? params.finalFeeETB
        : planMonies > 0
        ? planMonies
        : extraCost > 0
        ? (apt?.totalDueETB || 0) + extraCost
        : (apt?.totalDueETB && apt.totalDueETB > 0 ? apt.totalDueETB : 1500);

    const serviceDisplay =
      matchingPlan && matchingPlan.procedures.length > 0
        ? matchingPlan.procedures.map((p) => p.name).join(' · ')
        : (apt?.serviceName || 'Clinical Treatment Encounter');

    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'completed' as AppointmentStatus,
              seatingStatus: 'sent_to_cashier' as any,
              completedAt: new Date().toISOString(),
              serviceName: serviceDisplay,
              notes: params?.notes
                ? `${a.notes || ''}\n${params.notes}\n[Staged Treatment Plan Total: ${calculatedTotalDue.toLocaleString()} ETB]`.trim()
                : a.notes,
              totalDueETB: calculatedTotalDue,
              recallMonths: params?.recallMonths || a.recallMonths || 6,
            }
          : a
      ),
      chairs: currentState.chairs.map((chair) =>
        chair.chairNumber === chairNum || chair.currentAppointmentId === appointmentId
          ? {
              ...chair,
              status: 'available' as const,
              currentAppointmentId: undefined,
              currentPatientName: undefined,
              currentDoctorName: undefined,
              occupiedSince: undefined,
            }
          : chair
      ),
    };
    emitChange();
    this.toastSuccess(
      'Sent to Cashier Desk',
      `${patientName} (${calculatedTotalDue.toLocaleString()} ETB) finished in Chair ${chairNum}. Transferred to reception for cashier checkout.`
    );
  },

  completeAppointment(appointmentId: string) {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Clinical encounter completion is reserved for Dr. Senait Tadesse.'
      );
      return;
    }
    const apt = currentState.appointments.find((a) => a.id === appointmentId);
    if (!apt) return;
    if (apt.chairNumber) {
      this.releaseChair(apt.chairNumber);
    }
    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'completed' as AppointmentStatus,
              completedAt: new Date().toISOString(),
            }
          : a
      ),
    };
    emitChange();
    this.toastSuccess('Encounter Completed', `${apt.patientName}'s treatment completed & released.`);
  },

  checkOutAndSettle(
    appointmentId: string,
    params: {
      method: 'cash' | 'telebirr_manual' | 'cbe_manual' | 'chapa_online';
      amountPaidETB: number;
      recordedBy: string;
      skipLedger?: boolean;
      skipNotification?: boolean;
    }
  ) {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Cashier settlements are managed by Front Desk Cashier (Helen Tadesse).'
      );
      return;
    }
    const receiptNum = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetApt = currentState.appointments.find((a) => a.id === appointmentId);

    // Calculate procedure / treatment plan total
    const matchingPlan = currentState.treatmentPlans?.find(
      (p) =>
        (targetApt && (p.patientId === targetApt.id || p.id === targetApt.id)) ||
        (targetApt?.patientChart?.cardNo && p.patientId === targetApt.patientChart.cardNo) ||
        (targetApt && p.patientName && p.patientName.toLowerCase() === targetApt.patientName.toLowerCase())
    );
    const planTotal =
      matchingPlan?.procedures?.reduce((sum, p) => sum + (p.feeETB || 0), 0) ||
      matchingPlan?.quoteAmountETB ||
      0;
    const baseTotalDue = targetApt?.totalDueETB && targetApt.totalDueETB > 0
      ? targetApt.totalDueETB
      : (planTotal > 0 ? planTotal : 1500);

    const oldDeposit = targetApt?.depositPaidETB || 0;
    const newDeposit = oldDeposit + params.amountPaidETB;
    const effectiveTotalDue = Math.max(baseTotalDue, newDeposit);
    const isFullySettled = newDeposit >= effectiveTotalDue;

    const tx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      appointmentId,
      patientName: targetApt?.patientName || 'Walk-in Patient',
      patientMrn: targetApt?.patientChart?.cardNo || targetApt?.patientChart?.medicalRecordNumber || 'BDS-00041',
      receiptNumber: receiptNum,
      amountETB: params.amountPaidETB,
      method: params.method,
      recordedBy: params.recordedBy,
      timestamp: new Date().toISOString(),
    };

    const notification: SmsToastNotification = {
      id: `sms-${Date.now()}`,
      recipientName: targetApt?.patientName || 'Patient',
      recipientPhone: targetApt?.patientPhone || '+251911000000',
      templateType: 'receipt',
      contentAm: `ክፍያዎ ተጠናቋል! ደረሰኝ ቁጥር ${receiptNum}። የተከፈለው መጠን ${params.amountPaidETB.toLocaleString()} ብር። ለጤናዎ ጥንቃቄ እናመሰግናለን!`,
      contentEn: `Payment complete! Receipt ${receiptNum}. Paid ${params.amountPaidETB.toLocaleString()} ETB. Thank you for visiting!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newLedger = params.skipLedger ? currentState.ledger : [tx, ...currentState.ledger];
    const newNotifications = params.skipNotification
      ? currentState.notificationHistory
      : [notification, ...currentState.notificationHistory];
    const activeNotif = params.skipNotification ? currentState.activeNotification : notification;

    // Dynamically update appointment amounts, status, and related treatment plans
    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              depositPaidETB: newDeposit,
              totalDueETB: effectiveTotalDue,
              paymentStatus: (isFullySettled ? 'fully_paid' : 'deposit_paid') as PaymentStatus,
              receiptNumber: receiptNum,
              depositMethod: params.method,
              cashierSettled: true,
              seatingStatus: 'settled_at_cashier',
              cashierSettledAt: new Date().toISOString(),
            }
          : apt
      ),
      treatmentPlans: isFullySettled && currentState.treatmentPlans
        ? currentState.treatmentPlans.map((plan) => {
            const matches =
              (targetApt && (plan.patientId === targetApt.id || plan.id === targetApt.id)) ||
              (targetApt?.patientChart?.cardNo && plan.patientId === targetApt.patientChart.cardNo) ||
              (targetApt && plan.patientName && plan.patientName.toLowerCase() === targetApt.patientName.toLowerCase());
            if (!matches) return plan;
            return {
              ...plan,
              status: 'closed' as const,
              quoteStatus: 'accepted' as const,
              procedures: plan.procedures.map((proc) => ({ ...proc, status: 'completed' as const })),
            };
          })
        : currentState.treatmentPlans,
      ledger: newLedger,
      activeNotification: activeNotif,
      notificationHistory: newNotifications,
    };

    emitChange();
  },

  addPaymentTransaction(tx: LedgerTransaction) {
    currentState = {
      ...currentState,
      ledger: [tx, ...currentState.ledger],
    };
    emitChange();
  },

  refundPayment(txId: string, refundAmountETB: number, reason: string) {
    currentState = {
      ...currentState,
      ledger: currentState.ledger.map((tx) =>
        tx.id === txId || tx.receiptNumber === txId
          ? {
              ...tx,
              isRefunded: true,
              refundAmountETB,
              refundReason: reason,
            }
          : tx
      ),
    };
    emitChange();
  },

  triggerNotification(notification: SmsToastNotification) {
    currentState = {
      ...currentState,
      activeNotification: notification,
      notificationHistory: [notification, ...currentState.notificationHistory],
    };
    emitChange();
  },

  dismissNotification() {
    currentState = {
      ...currentState,
      activeNotification: null,
    };
    emitChange();
  },

  closeDay(report: DayCloseReport) {
    currentState = {
      ...currentState,
      isDayClosed: true,
      dayCloseReport: report,
    };
    emitChange();
  },

  reopenDay() {
    currentState = {
      ...currentState,
      isDayClosed: false,
      dayCloseReport: null,
    };
    emitChange();
  },

  assignPatientToChair(appointmentId: string, chairNumber: number) {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Chair assignment is reserved for active clinical operators (Dr. Senait / Helen).'
      );
      return;
    }

    const apt = currentState.appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    // Concurrency Lock: Check if target chair is currently conducting another customer
    const chairStatus = isChairBusy(chairNumber, appointmentId);
    if (chairStatus.busy) {
      this.toastWarning(
        chairNumber === 1 ? 'Dr. Senait is In Treatment' : `Chair ${chairNumber} Occupied`,
        chairNumber === 1
          ? `Dr. Senait is currently conducting treatment for ${chairStatus.patientName} in Chair 1. Another patient cannot be assigned until Chair 1 is completed and released.`
          : `Chair ${chairNumber} is currently occupied with ${chairStatus.patientName}. Please wait until released.`
      );
      return;
    }

    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              chairNumber,
              status: 'in_progress' as AppointmentStatus,
              seatingStatus: 'accepted' as const,
              seatingCancelledReason: undefined,
            }
          : a
      ),
      chairs: currentState.chairs.map((chair) =>
        chair.chairNumber === chairNumber
          ? {
              ...chair,
              status: 'occupied' as const,
              currentAppointmentId: appointmentId,
              currentPatientName: apt.patientName,
              currentDoctorName: apt.doctorName,
              occupiedSince: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : chair
      ),
      pendingSeatingRequest:
        currentState.pendingSeatingRequest?.appointmentId === appointmentId
          ? null
          : currentState.pendingSeatingRequest,
    };
    emitChange();
  },

  releaseChair(chairNumber: number) {
    currentState = {
      ...currentState,
      chairs: currentState.chairs.map((chair) =>
        chair.chairNumber === chairNumber
          ? {
              ...chair,
              status: 'available' as const,
              currentAppointmentId: undefined,
              currentPatientName: undefined,
              currentDoctorName: undefined,
              occupiedSince: undefined,
            }
          : chair
      ),
    };
    emitChange();
  },

  openPatientDrawer(appointmentId: string, initialTab: 'today' | 'history' | 'billing' | 'demographics' = 'today') {
    currentState = {
      ...currentState,
      selectedPatientRecordId: appointmentId,
      isPatientDrawerOpen: true,
      patientDrawerInitialTab: initialTab,
    };
    emitChange();
  },

  closePatientDrawer() {
    currentState = {
      ...currentState,
      isPatientDrawerOpen: false,
      selectedPatientRecordId: null,
      patientDrawerInitialTab: null,
    };
    emitChange();
  },

  requestSeatInChair(appointmentId: string, chairNumber?: number) {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Seating requests are managed by Front Desk (Helen Tadesse).'
      );
      return;
    }

    const apt = currentState.appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    const targetChair = chairNumber || apt.chairNumber || ((apt.doctorName && apt.doctorName.includes('Dawit')) ? 2 : 1);
    const targetDoctorName = targetChair === 1 ? 'Dr. Senait Tadesse' : (apt.doctorName || 'Dr. Dawit Bekele');

    // Concurrency Lock: Check if target chair is currently conducting another customer
    const chairStatus = isChairBusy(targetChair, appointmentId);
    if (chairStatus.busy) {
      this.toastWarning(
        targetChair === 1 ? 'Dr. Senait is In Treatment' : `Chair ${targetChair} Occupied`,
        targetChair === 1
          ? `Dr. Senait is currently conducting treatment for ${chairStatus.patientName} in Chair 1. No one can send another patient to her chair while she is conducting another customer.`
          : `Chair ${targetChair} is currently occupied with ${chairStatus.patientName}. Please wait until the chair is released.`
      );
      return;
    }

    // Concurrency Lock: Check if a seating request is already in flight for this chair
    const hasPendingRequest =
      currentState.pendingSeatingRequest &&
      currentState.pendingSeatingRequest.chairNumber === targetChair &&
      currentState.pendingSeatingRequest.status === 'pending' &&
      currentState.pendingSeatingRequest.appointmentId !== appointmentId;

    if (hasPendingRequest) {
      this.toastWarning(
        'Seating Request In Flight',
        `Chair ${targetChair} already has a pending seating request for ${currentState.pendingSeatingRequest?.patientName} awaiting confirmation.`
      );
      return;
    }

    // If caller is doctor, seat immediately without asking themselves
    const isCallerDoctor = currentState.currentUser.role === 'doctor' || currentState.activePersona === 'doctor';
    if (isCallerDoctor) {
      this.assignPatientToChair(appointmentId, targetChair);
      this.toastSuccess('Seated in Chair', `${apt.patientName} is now in Chair ${targetChair}.`);
      return;
    }

    // Otherwise (receptionist or front desk), create doctor seating confirmation request
    const req: ChairSeatingRequest = {
      id: `seat-req-${Date.now()}`,
      appointmentId,
      patientName: apt.patientName,
      serviceName: apt.serviceName,
      doctorName: targetDoctorName,
      chairNumber: targetChair,
      requestedBy: currentState.currentUser.name || 'Helen Tadesse',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };

    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              chairNumber: targetChair,
              doctorName: targetDoctorName,
              seatingStatus: 'requested' as const,
              seatingCancelledReason: undefined,
            }
          : a
      ),
      pendingSeatingRequest: req,
    };
    emitChange();
    this.toastInfo(
      'Seating Request Sent',
      `Prompt sent to ${targetDoctorName}: Confirm readiness for Chair ${targetChair}.`
    );
  },

  acceptSeatingRequest() {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Doctor seating confirmations are managed by Dr. Senait Tadesse.'
      );
      return;
    }

    const req = currentState.pendingSeatingRequest;
    if (!req) return;

    const apt = currentState.appointments.find((a) => a.id === req.appointmentId);
    const chairNum = req.chairNumber || 1;
    const patientName = req.patientName || apt?.patientName || 'Patient';
    const doctorName = req.doctorName || (chairNum === 1 ? 'Dr. Senait Tadesse' : (apt?.doctorName || 'Dr. Dawit Bekele'));

    // Concurrency Lock: Check if chair was occupied in the meantime
    const chairStatus = isChairBusy(chairNum, req.appointmentId);
    if (chairStatus.busy) {
      this.toastWarning(
        'Operatory Busy',
        `Cannot accept ${patientName}: ${chairStatus.patientName} is currently in Chair ${chairNum}.`
      );
      return;
    }

    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((a) =>
        a.id === req.appointmentId
          ? {
              ...a,
              chairNumber: chairNum,
              doctorName,
              doctorId: chairNum === 1 ? 'doc-senait' : 'doc-dawit',
              status: 'in_progress' as AppointmentStatus,
              seatingStatus: 'accepted' as const,
              seatingCancelledReason: undefined,
            }
          : a
      ),
      chairs: currentState.chairs.map((chair) =>
        chair.chairNumber === chairNum
          ? {
              ...chair,
              status: 'occupied' as const,
              currentAppointmentId: req.appointmentId,
              currentPatientName: patientName,
              currentDoctorName: doctorName,
              occupiedSince: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : chair
      ),
      pendingSeatingRequest: null,
    };
    emitChange();
    this.toastSuccess(
      `Chair ${chairNum} Confirmed`,
      `${doctorName} accepted. ${patientName} is now seated in Chair ${chairNum}.`
    );
  },

  seatPatientDirectly(appointmentId: string, chairNumber?: number) {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Chair seating is reserved for active clinical operators.'
      );
      return;
    }

    const apt = currentState.appointments.find((a) => a.id === appointmentId);
    if (!apt) return;
    const targetChair = chairNumber || apt.chairNumber || ((apt.doctorName && apt.doctorName.includes('Dawit')) ? 2 : 1);
    const doctorName = targetChair === 1 ? 'Dr. Senait Tadesse' : (apt.doctorName || 'Dr. Dawit Bekele');

    // Concurrency Lock
    const chairStatus = isChairBusy(targetChair, appointmentId);
    if (chairStatus.busy) {
      this.toastWarning(
        targetChair === 1 ? 'Dr. Senait is In Treatment' : `Chair ${targetChair} Occupied`,
        targetChair === 1
          ? `Dr. Senait is currently conducting treatment for ${chairStatus.patientName} in Chair 1. Another patient cannot be seated until Chair 1 is released.`
          : `Chair ${targetChair} is currently occupied with ${chairStatus.patientName}.`
      );
      return;
    }

    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              chairNumber: targetChair,
              doctorName,
              doctorId: targetChair === 1 ? 'doc-senait' : 'doc-dawit',
              status: 'in_progress' as AppointmentStatus,
              seatingStatus: 'accepted' as const,
              seatingCancelledReason: undefined,
            }
          : a
      ),
      chairs: currentState.chairs.map((chair) =>
        chair.chairNumber === targetChair
          ? {
              ...chair,
              status: 'occupied' as const,
              currentAppointmentId: appointmentId,
              currentPatientName: apt.patientName,
              currentDoctorName: doctorName,
              occupiedSince: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : chair
      ),
      pendingSeatingRequest:
        currentState.pendingSeatingRequest?.appointmentId === appointmentId
          ? null
          : currentState.pendingSeatingRequest,
    };
    emitChange();
    this.toastSuccess(
      'Patient Seated in Operatory',
      `${apt.patientName} seated in Chair ${targetChair} with ${doctorName}. Ready for clinical treatment.`
    );
  },

  declineSeatingRequest() {
    if (isOwnerState()) {
      this.toastInfo(
        'Owner Oversight Mode',
        'Doctor seating confirmations are managed by Dr. Senait Tadesse.'
      );
      return;
    }

    const req = currentState.pendingSeatingRequest;
    if (!req) return;

    const patientName = req.patientName;
    const cancelledTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const doctorName = req.doctorName || (req.chairNumber === 1 ? 'Dr. Senait Tadesse' : 'Dr. Dawit Bekele');

    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((apt) =>
        apt.id === req.appointmentId
          ? {
              ...apt,
              seatingStatus: 'cancelled_by_doctor' as const,
              seatingCancelledAt: cancelledTime,
              seatingCancelledReason: `${doctorName} busy in procedure`,
            }
          : apt
      ),
      pendingSeatingRequest: null,
    };
    emitChange();
    this.toastWarning(
      'Seating Cancelled — Still Waiting',
      `${doctorName} cancelled Chair ${req.chairNumber}. ${patientName} is still waiting in the reception lounge.`
    );
  },

  updateAppointmentAdministrative(
    appointmentId: string,
    updates: {
      patientName?: string;
      patientNameAmharic?: string;
      patientPhone?: string;
      age?: number;
      gender?: 'Female' | 'Male';
      emergencyContact?: { name: string; relationship: string; phone: string };
      startsAt?: string;
      endsAt?: string;
      doctorName?: string;
      chairNumber?: number;
      notes?: string;
      sendSms?: boolean;
    }
  ) {
    const targetApt = currentState.appointments.find((a) => a.id === appointmentId);
    if (!targetApt) return;

    const newApts = currentState.appointments.map((apt) => {
      if (apt.id !== appointmentId) return apt;

      const currentChart = apt.patientChart;
      const updatedChart = currentChart
        ? {
            ...currentChart,
            fullNameAmharic: updates.patientNameAmharic ?? currentChart.fullNameAmharic,
            age: updates.age ?? currentChart.age,
            gender: updates.gender ?? currentChart.gender,
            emergencyContact: updates.emergencyContact ?? currentChart.emergencyContact,
          }
        : undefined;

      return {
        ...apt,
        patientName: updates.patientName ?? apt.patientName,
        patientPhone: updates.patientPhone ?? apt.patientPhone,
        startsAt: updates.startsAt ?? apt.startsAt,
        endsAt: updates.endsAt ?? apt.endsAt,
        doctorName: updates.doctorName ?? apt.doctorName,
        chairNumber: updates.chairNumber ?? apt.chairNumber,
        notes: updates.notes ?? apt.notes,
        patientChart: updatedChart,
      };
    });

    let newNotificationHistory = currentState.notificationHistory;
    let activeNotification = currentState.activeNotification;

    if (updates.sendSms && (updates.patientPhone || targetApt.patientPhone)) {
      const phone = updates.patientPhone || targetApt.patientPhone;
      const name = updates.patientName || targetApt.patientName;
      const dateStr = updates.startsAt ? new Date(updates.startsAt).toLocaleDateString() : 'scheduled date';
      const timeStr = updates.startsAt
        ? new Date(updates.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'scheduled time';

      const sms: SmsToastNotification = {
        id: `sms-${Date.now()}`,
        recipientName: name,
        recipientPhone: phone,
        templateType: 'reminder',
        contentAm: `ሰላም ${name}፣ በ Bole Dental Studio ያደረጉት የቀጠሮ መረጃ ተዘምኗል። ቀን፡ ${dateStr} በ ${timeStr}። ቦሌ መድኃኒዓለም።`,
        contentEn: `Hello ${name}, your appointment at Bole Dental Studio has been updated to ${dateStr} at ${timeStr}. Bole Medhanialem.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      activeNotification = sms;
      newNotificationHistory = [sms, ...newNotificationHistory];
    }

    currentState = {
      ...currentState,
      appointments: newApts,
      activeNotification,
      notificationHistory: newNotificationHistory,
    };
    emitChange();
    this.toastSuccess('Appointment Saved', `Administrative details for ${updates.patientName || targetApt.patientName} updated.`);
  },

  updateToothChart(
    appointmentId: string, 
    toothNumber: number, 
    status: ToothStatus, 
    procedureFeeETB: number = 0
  ) {
    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((a) => {
        if (a.id !== appointmentId) return a;
        const currentChart = a.toothChart || {};
        return {
          ...a,
          totalDueETB: a.totalDueETB + procedureFeeETB,
          toothChart: {
            ...currentChart,
            [toothNumber]: status,
          },
        };
      }),
    };
    emitChange();
  },

  sendPostOpSms(appointmentId: string, customAm?: string, customEn?: string) {
    const apt = currentState.appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    const notification: SmsToastNotification = {
      id: `sms-postop-${Date.now()}`,
      recipientName: apt.patientName,
      recipientPhone: apt.patientPhone,
      templateType: 'receipt',
      contentAm: customAm || `ውድ ${apt.patientName}፣ ከዛሬው የጥርስ ህክምና በኋላ ለ 30 ደቂቃ ጥጥ አጥብቀው ይያዙ። ለ 24 ሰዓት ሙቅ መጠጥ ወይም ምግብ አይውሰዱ። ህመም ከተሰማዎ በ ${apt.patientPhone} ያግኙን። ፈጣን ምቾት! Bole Dental Studio`,
      contentEn: customEn || `Dear ${apt.patientName}, post-treatment care: bite firmly on gauze for 30 mins. Avoid hot liquids/rinsing for 24 hours. Contact us if discomfort persists. Bole Dental Studio.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    currentState = {
      ...currentState,
      activeNotification: notification,
      notificationHistory: [notification, ...currentState.notificationHistory],
    };
    emitChange();
  },

  sendSms(notification: SmsToastNotification) {
    currentState = {
      ...currentState,
      activeNotification: notification,
      notificationHistory: [notification, ...currentState.notificationHistory],
    };
    emitChange();
  },

  setActiveNotification(notification: SmsToastNotification | null) {
    currentState = {
      ...currentState,
      activeNotification: notification,
    };
    emitChange();
  },

  clearNotification() {
    this.setActiveNotification(null);
  },

  // Clinical Satisfaction Toasts (Ultra-premium minimalist notification system)
  toast(params: { title: string; message: string; type?: ClinicalToastType; durationMs?: number }) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ClinicalToast = {
      id,
      title: params.title,
      message: params.message,
      type: params.type || 'success',
      durationMs: params.durationMs || 4500,
    };
    currentState = {
      ...currentState,
      toasts: [...currentState.toasts, newToast],
    };
    emitChange();
    return id;
  },

  toastSuccess(title: string, message: string, durationMs = 4500) {
    return this.toast({ title, message, type: 'success', durationMs });
  },

  toastError(title: string, message: string, durationMs = 5000) {
    return this.toast({ title, message, type: 'error', durationMs });
  },

  toastInfo(title: string, message: string, durationMs = 4500) {
    return this.toast({ title, message, type: 'info', durationMs });
  },

  toastWarning(title: string, message: string, durationMs = 4500) {
    return this.toast({ title, message, type: 'warning', durationMs });
  },

  dismissToast(toastId: string) {
    currentState = {
      ...currentState,
      toasts: currentState.toasts.filter((t) => t.id !== toastId),
    };
    emitChange();
  },

  clearAllToasts() {
    currentState = {
      ...currentState,
      toasts: [],
    };
    emitChange();
  },

  loginAs(user: UserProfile) {
    currentState = {
      ...currentState,
      currentUser: user,
      activePersona: user.role === 'admin' ? 'manager' : user.role,
    };
    emitChange();
  },

  updateClinicProfile(slug: string, updates: Partial<Clinic>) {
    const target = currentState.clinics[slug] || INITIAL_CLINICS[slug] || INITIAL_CLINICS['bole-dental'];
    currentState = {
      ...currentState,
      clinics: {
        ...currentState.clinics,
        [slug]: {
          ...target,
          ...updates,
        },
      },
    };
    emitChange();
  },

  updateDoctor(slug: string, doctorId: string, updates: Partial<Doctor>) {
    const targetClinic = currentState.clinics[slug] || INITIAL_CLINICS[slug] || INITIAL_CLINICS['bole-dental'];
    const updatedDoctors = targetClinic.doctors.map((d) => (d.id === doctorId ? { ...d, ...updates } : d));
    currentState = {
      ...currentState,
      clinics: {
        ...currentState.clinics,
        [slug]: {
          ...targetClinic,
          doctors: updatedDoctors,
        },
      },
    };
    emitChange();
  },

  addDoctor(slug: string, doctor: Doctor) {
    const targetClinic = currentState.clinics[slug] || INITIAL_CLINICS[slug] || INITIAL_CLINICS['bole-dental'];
    currentState = {
      ...currentState,
      clinics: {
        ...currentState.clinics,
        [slug]: {
          ...targetClinic,
          doctors: [...targetClinic.doctors, doctor],
        },
      },
    };
    emitChange();
  },

  deleteDoctor(slug: string, doctorId: string) {
    const targetClinic = currentState.clinics[slug] || INITIAL_CLINICS[slug] || INITIAL_CLINICS['bole-dental'];
    currentState = {
      ...currentState,
      clinics: {
        ...currentState.clinics,
        [slug]: {
          ...targetClinic,
          doctors: targetClinic.doctors.filter((d) => d.id !== doctorId),
        },
      },
    };
    emitChange();
  },

  updateService(slug: string, serviceId: string, updates: Partial<ServiceItem>) {
    const targetClinic = currentState.clinics[slug] || INITIAL_CLINICS[slug] || INITIAL_CLINICS['bole-dental'];
    const updatedServices = targetClinic.services.map((s) => (s.id === serviceId ? { ...s, ...updates } : s));
    currentState = {
      ...currentState,
      clinics: {
        ...currentState.clinics,
        [slug]: {
          ...targetClinic,
          services: updatedServices,
        },
      },
    };
    emitChange();
  },

  addService(slug: string, service: ServiceItem) {
    const targetClinic = currentState.clinics[slug] || INITIAL_CLINICS[slug] || INITIAL_CLINICS['bole-dental'];
    currentState = {
      ...currentState,
      clinics: {
        ...currentState.clinics,
        [slug]: {
          ...targetClinic,
          services: [...targetClinic.services, service],
        },
      },
    };
    emitChange();
  },

  deleteService(slug: string, serviceId: string) {
    const targetClinic = currentState.clinics[slug] || INITIAL_CLINICS[slug] || INITIAL_CLINICS['bole-dental'];
    currentState = {
      ...currentState,
      clinics: {
        ...currentState.clinics,
        [slug]: {
          ...targetClinic,
          services: targetClinic.services.filter((s) => s.id !== serviceId),
        },
      },
    };
    emitChange();
  },

  updateChair(chairNumber: number, updates: Partial<OperatoryChair>) {
    currentState = {
      ...currentState,
      chairs: currentState.chairs.map((c) => (c.chairNumber === chairNumber ? { ...c, ...updates } : c)),
    };
    emitChange();
  },

  occupyChair(chairNumber: number, appointmentId: string, doctorName: string, patientName: string) {
    currentState = {
      ...currentState,
      chairs: currentState.chairs.map((c) =>
        c.chairNumber === chairNumber
          ? {
              ...c,
              status: 'occupied',
              currentAppointmentId: appointmentId,
              currentDoctorName: doctorName,
              currentPatientName: patientName,
              occupiedSince: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      ),
      appointments: currentState.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'in_progress', chairNumber } : a
      ),
    };
    emitChange();
  },

  addTreatmentPlan(newPlan: TreatmentPlan) {
    currentState = {
      ...currentState,
      treatmentPlans: [newPlan, ...currentState.treatmentPlans],
    };
    emitChange();
  },

  updateTreatmentPlan(planId: string, updates: Partial<TreatmentPlan>) {
    currentState = {
      ...currentState,
      treatmentPlans: currentState.treatmentPlans.map((p) =>
        p.id === planId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    };
    emitChange();
  },

  addProcedureToPlan(planId: string, procedure: PlanProcedureItem, fallbackPlan?: TreatmentPlan) {
    const exists = currentState.treatmentPlans.some((p) => p.id === planId);
    if (!exists && fallbackPlan) {
      const newPlan: TreatmentPlan = {
        ...fallbackPlan,
        id: planId,
        procedures: [procedure],
        quoteAmountETB: procedure.feeETB,
        updatedAt: new Date().toISOString(),
      };
      currentState = {
        ...currentState,
        treatmentPlans: [newPlan, ...currentState.treatmentPlans],
      };
      emitChange();
      return;
    }

    currentState = {
      ...currentState,
      treatmentPlans: currentState.treatmentPlans.map((p) => {
        if (p.id !== planId) return p;
        const updatedProcs = [...p.procedures, procedure];
        const newTotal = updatedProcs.reduce((acc, curr) => acc + curr.feeETB, 0);
        return {
          ...p,
          procedures: updatedProcs,
          quoteAmountETB: newTotal,
          updatedAt: new Date().toISOString(),
        };
      }),
    };
    emitChange();
  },

  removeProcedureFromPlan(planId: string, procedureId: string) {
    currentState = {
      ...currentState,
      treatmentPlans: currentState.treatmentPlans.map((p) => {
        if (p.id !== planId) return p;
        const updatedProcs = p.procedures.filter((pr) => pr.id !== procedureId);
        const newTotal = updatedProcs.reduce((acc, curr) => acc + curr.feeETB, 0);
        return {
          ...p,
          procedures: updatedProcs,
          quoteAmountETB: newTotal,
          updatedAt: new Date().toISOString(),
        };
      }),
    };
    emitChange();
  },

  addClinicalNoteToPlan(planId: string, note: PlanClinicalNote) {
    currentState = {
      ...currentState,
      treatmentPlans: currentState.treatmentPlans.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          clinicalNotes: [note, ...p.clinicalNotes],
          updatedAt: new Date().toISOString(),
        };
      }),
    };
    emitChange();
  },

  updatePlanChart(planId: string, toothNumber: number, status: ToothStatus) {
    currentState = {
      ...currentState,
      treatmentPlans: currentState.treatmentPlans.map((p) => {
        if (p.id !== planId) return p;
        const updatedChart = { ...p.chartNotation };
        if (status === 'healthy') {
          delete updatedChart[toothNumber];
        } else {
          updatedChart[toothNumber] = status;
        }
        return {
          ...p,
          chartNotation: updatedChart,
          updatedAt: new Date().toISOString(),
        };
      }),
    };
    emitChange();
  },

  createTreatmentContract(contract: TreatmentContract) {
    currentState = {
      ...currentState,
      contracts: [contract, ...currentState.contracts],
    };
    emitChange();
  },

  recordContractPayment(
    contractId: string,
    payload: {
      amountETB: number;
      method: 'cash' | 'telebirr_manual' | 'cbe_manual' | 'chapa_online';
      recordedBy: string;
      notes?: string;
    }
  ) {
    const contract = currentState.contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const receiptNum = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCollected = contract.totalCollectedETB + payload.amountETB;
    const newRemaining = Math.max(0, contract.totalContractETB - newCollected);

    // Calculate advance payment / prepaid credit
    const installmentDue = contract.installmentPerVisitETB;
    let newPrepaidCredit = contract.prepaidCreditETB;
    if (payload.amountETB > installmentDue) {
      newPrepaidCredit += (payload.amountETB - installmentDue);
    }

    // Allocate payment across installments
    let remainingAmountToAllocate = payload.amountETB;
    const updatedInstallments = contract.installments.map((inst) => {
      if (inst.status === 'paid' || inst.status === 'prepaid_covered') return inst;
      if (remainingAmountToAllocate >= inst.amountETB) {
        remainingAmountToAllocate -= inst.amountETB;
        return {
          ...inst,
          paidAmountETB: inst.amountETB,
          paidAt: new Date().toISOString(),
          receiptNumber: receiptNum,
          status: 'paid' as const,
        };
      }
      return inst;
    });

    const updatedContracts = currentState.contracts.map((c) => {
      if (c.id !== contractId) return c;
      return {
        ...c,
        totalCollectedETB: newCollected,
        remainingBalanceETB: newRemaining,
        prepaidCreditETB: newPrepaidCredit,
        installments: updatedInstallments,
        status: newRemaining === 0 ? ('completed' as const) : c.status,
      };
    });

    // Append to general fiscal ledger
    const tx: LedgerTransaction = {
      id: `tx-contract-${Date.now()}`,
      appointmentId: contract.patientId,
      patientName: contract.patientName,
      receiptNumber: receiptNum,
      amountETB: payload.amountETB,
      method: payload.method,
      recordedBy: payload.recordedBy,
      timestamp: new Date().toISOString(),
    };

    const notification: SmsToastNotification = {
      id: `sms-contract-${Date.now()}`,
      recipientName: contract.patientName,
      recipientPhone: contract.patientPhone,
      templateType: 'receipt',
      contentAm: `ደረሰኝ ቁጥር ${receiptNum} ደርሷል። ${payload.amountETB.toLocaleString()} ብር ለ ${contract.title} ተከፍሏል። የቀሪ ብሬስ ሂሳብ: ${newRemaining.toLocaleString()} ብር። ${newPrepaidCredit > 0 ? `${newPrepaidCredit.toLocaleString()} ብር የቅድሚያ ክሬዲት ተይዟል።` : ''} Bole Dental Studio`,
      contentEn: `Payment complete! Receipt ${receiptNum}. Paid ${payload.amountETB.toLocaleString()} ETB for ${contract.title}. Remaining balance: ${newRemaining.toLocaleString()} ETB. ${newPrepaidCredit > 0 ? `Advance credit of ${newPrepaidCredit.toLocaleString()} ETB held.` : ''} Bole Dental Studio.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    currentState = {
      ...currentState,
      contracts: updatedContracts,
      ledger: [tx, ...currentState.ledger],
      activeNotification: notification,
      notificationHistory: [notification, ...currentState.notificationHistory],
    };
    emitChange();
  },

  advanceContractVisit(
    contractId: string,
    payload: {
      bracketRepaired?: boolean;
      chargedExtra?: boolean;
      customChargeETB?: number;
      notes?: string;
    }
  ) {
    const contract = currentState.contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const nextCount = contract.completedVisitsCount + 1;
    let extraFee = 0;
    if (payload.bracketRepaired && payload.chargedExtra) {
      extraFee = payload.customChargeETB || contract.bracketRepairFeeETB || 400;
    }

    // Deduct from prepaid credit if patient has prepaid credit covering this visit
    let updatedPrepaidCredit = contract.prepaidCreditETB;
    if (updatedPrepaidCredit >= contract.installmentPerVisitETB) {
      updatedPrepaidCredit -= contract.installmentPerVisitETB;
    }

    const updatedContracts = currentState.contracts.map((c) => {
      if (c.id !== contractId) return c;
      const newTotal = c.totalContractETB + extraFee;
      const newRemaining = Math.max(0, newTotal - c.totalCollectedETB);
      return {
        ...c,
        totalContractETB: newTotal,
        remainingBalanceETB: newRemaining,
        completedVisitsCount: nextCount,
        prepaidCreditETB: updatedPrepaidCredit,
        currentStage: `Month ${nextCount} of ${c.estimatedVisits} · Treatment Progress`,
      };
    });

    currentState = {
      ...currentState,
      contracts: updatedContracts,
    };
    emitChange();
  },

  resetToToday(baseDate: Date = new Date()) {
    const dynamicData = getDynamicMockData(baseDate);
    currentState = {
      activeClinicSlug: 'bole-dental',
      activePersona: 'reception',
      currentUser: DEFAULT_USERS.reception,
      clinics: INITIAL_CLINICS,
      appointments: dynamicData.appointments,
      chairs: dynamicData.chairs,
      ledger: dynamicData.ledger,
      activeNotification: null,
      notificationHistory: dynamicData.notificationHistory,
      isDayClosed: false,
      dayCloseReport: null,
      treatmentPlans: INITIAL_TREATMENT_PLANS,
      contracts: INITIAL_TREATMENT_CONTRACTS,
      toasts: [],
      pendingSeatingRequest: null,
      isPatientDrawerOpen: false,
      selectedPatientRecordId: null,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      } catch (e) {
        console.warn('Failed to persist reset data', e);
      }
    }
    this.toastSuccess(
      'Clinical Data Synchronized',
      `System reset to ${baseDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}. All schedules, chairs, and invoices are up to date.`
    );
    emitChange();
  },

  resetDemoData() {
    this.resetToToday(new Date());
  },
};

/**
 * Modern React 19 hook using tearing-free useSyncExternalStore
 */
export function useSinnaStore(): SinnaState {
  return useSyncExternalStore(
    sinnaStore.subscribe,
    sinnaStore.getSnapshot,
    sinnaStore.getServerSnapshot
  );
}

/**
 * Clinic helper selector
 */
export function getClinicData(slug: string): Clinic {
  return currentState.clinics?.[slug] || INITIAL_CLINICS[slug] || INITIAL_CLINICS['bole-dental'];
}
