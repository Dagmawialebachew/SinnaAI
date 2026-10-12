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
  ClinicalToastType
} from './types';
import { 
  INITIAL_CLINICS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_LEDGER, 
  INITIAL_OPERATORY_CHAIRS, 
  INITIAL_TREATMENT_PLANS,
  INITIAL_TREATMENT_CONTRACTS 
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
    id: 'usr-doctor-1',
    name: 'Dr. Senait Tadesse',
    role: 'doctor',
    title: 'Clinical Director & Lead Surgeon',
    stationName: 'Chair 1 Operatory & Management',
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
}

const STORAGE_KEY = 'sinna_os_state_v1';

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
  };
};

let currentState: SinnaState = getInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
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
};

export const sinnaStore = {
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

  createAppointment(
    payload: Appointment | (Omit<Appointment, 'id' | 'status' | 'paymentStatus'> & {
      depositPaidETB?: number;
      depositMethod?: 'telebirr' | 'chapa_online' | 'cash';
    }),
    transaction?: Partial<LedgerTransaction>
  ): Appointment {
    const isFullApt = 'id' in payload;
    const aptId = isFullApt ? payload.id : `apt-${Date.now()}`;
    const depositPaid = isFullApt ? (payload.depositPaidETB || 0) : (payload.depositPaidETB || 0);
    const hasDeposit = depositPaid > 0;

    const newAppointment: Appointment = isFullApt
      ? payload
      : {
          ...payload,
          id: aptId,
          status: 'confirmed',
          paymentStatus: hasDeposit ? 'deposit_paid' : 'none',
          depositPaidETB: depositPaid,
          totalDueETB: payload.totalDueETB,
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

  checkInWalkIn(payload: {
    patientName: string;
    patientPhone: string;
    serviceName?: string;
    doctorName?: string;
    totalDueETB?: number;
  }): Appointment {
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
    params: {
      addedProcedures?: { nameEn: string; priceETB: number }[];
      notes?: string;
      recallMonths?: number;
    }
  ) {
    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((apt) => {
        if (apt.id !== appointmentId) return apt;

        const extraCost = (params.addedProcedures || []).reduce((acc, p) => acc + p.priceETB, 0);
        return {
          ...apt,
          status: 'completed' as AppointmentStatus,
          totalDueETB: apt.totalDueETB + extraCost,
          notes: params.notes || apt.notes,
          recallMonths: params.recallMonths || 6,
          completedAt: new Date().toISOString(),
        };
      }),
    };
    emitChange();
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
    const receiptNum = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetApt = currentState.appointments.find((a) => a.id === appointmentId);

    const tx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      appointmentId,
      patientName: targetApt?.patientName || 'Walk-in Patient',
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

    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((apt) =>
        apt.id === appointmentId
          ? {
              ...apt,
              paymentStatus: 'fully_paid' as PaymentStatus,
              receiptNumber: receiptNum,
            }
          : apt
      ),
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
    const apt = currentState.appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    currentState = {
      ...currentState,
      appointments: currentState.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              chairNumber,
              status: 'in_progress' as AppointmentStatus,
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

  addProcedureToPlan(planId: string, procedure: PlanProcedureItem) {
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

  resetDemoData() {
    currentState = {
      activeClinicSlug: 'bole-dental',
      activePersona: 'reception',
      currentUser: DEFAULT_USERS.reception,
      clinics: INITIAL_CLINICS,
      appointments: INITIAL_APPOINTMENTS,
      chairs: INITIAL_OPERATORY_CHAIRS,
      ledger: INITIAL_LEDGER,
      activeNotification: null,
      notificationHistory: [],
      isDayClosed: false,
      dayCloseReport: null,
      treatmentPlans: INITIAL_TREATMENT_PLANS,
      contracts: INITIAL_TREATMENT_CONTRACTS,
      toasts: [],
    };
    emitChange();
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
