export type UserRole = 'reception' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  stationName: string;
}

export type PaymentStatus = 
  | 'none'
  | 'deposit_pending'
  | 'deposit_paid'
  | 'fully_paid'
  | 'refunded';

export type AppointmentStatus = 
  | 'pending_hold'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'potentially_missed'
  | 'missed'
  | 'cancelled';

export interface ServiceItem {
  id: string;
  nameEn: string;
  nameAm: string;
  durationMinutes: number;
  priceETB: number;
  depositRequired: boolean;
  depositAmountETB: number;
  description: string;
}

export interface Doctor {
  id: string;
  name: string;
  titleEn: string;
  titleAm: string;
  photoUrl: string;
  specialty: string;
  availableDays: string[];
}

export interface Clinic {
  id: string;
  slug: string;
  name: string;
  taglineEn: string;
  taglineAm: string;
  location: string;
  phone: string;
  telegramChannel: string;
  instagramHandle: string;
  googleMapsUrl: string;
  rating: number;
  reviewCount: number;
  openHours: string;
  services: ServiceItem[];
  doctors: Doctor[];
  depositPolicyETB: number;
}

export interface MedicalAlert {
  id: string;
  type: 'allergy' | 'medical' | 'precaution';
  labelEn: string;
  labelAm: string;
  severity: 'high' | 'medium';
}

export type ToothStatus = 'healthy' | 'caries' | 'filled' | 'crown' | 'rct' | 'missing';

export interface ToothRecord {
  toothNumber: number;
  status: ToothStatus;
  procedurePriceETB?: number;
  notes?: string;
}

export interface OperatoryChair {
  id: string;
  chairNumber: number;
  name: string;
  roomName: string;
  status: 'available' | 'occupied' | 'sanitizing';
  currentAppointmentId?: string;
  currentDoctorName?: string;
  currentPatientName?: string;
  occupiedSince?: string;
}

export interface EthiopianPrescription {
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface EthiopianPatientChart {
  cardNo: string;
  medicalRecordNumber?: string;
  fullNameAmharic?: string;
  age: number;
  gender: 'Female' | 'Male';
  occupation?: string;
  subcityWoreda?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  chiefComplaint: string;
  hpi: string;
  medicalHistory: {
    allergies: string[];
    systemicDiseases: string[];
    currentMedications: string[];
    bleedingDisorders: boolean;
    pregnancyOrLactation?: string;
  };
  clinicalFindings: {
    extraoral: string;
    intraoralSoftTissue: string;
    intraoralHardTissue: string;
    percussionTest: string;
    vitalityTest: string;
  };
  radiographicNotes: string;
  definitiveDiagnosis: string;
  stagedTreatmentPlan: string[];
  prescriptions: EthiopianPrescription[];
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  startsAt: string; // ISO string
  endsAt: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  depositPaidETB: number;
  totalDueETB: number;
  holdExpiresAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  notes?: string;
  recallMonths?: number;
  receiptNumber?: string;
  chairNumber?: number;
  seatingStatus?: 'none' | 'requested' | 'accepted' | 'cancelled_by_doctor' | 'sent_to_cashier' | 'settled_at_cashier';
  seatingCancelledAt?: string;
  seatingCancelledReason?: string;
  cashierSettled?: boolean;
  cashierSettledAt?: string;
  medicalAlerts?: MedicalAlert[];
  toothChart?: Record<number, ToothStatus>;
  patientChart?: EthiopianPatientChart;
  source?: 'online' | 'walkin' | 'phone' | 'copilot';
  isOnlineBooking?: boolean;
  depositMethod?: 'telebirr' | 'cbe' | 'cash' | 'chapa_online' | string;
  bookedVia?: string;
}

export interface LedgerTransaction {
  id: string;
  appointmentId: string;
  patientName: string;
  patientMrn?: string;
  patientNameAmharic?: string;
  receiptNumber: string;
  amountETB: number;
  method: 'cash' | 'telebirr_manual' | 'cbe_manual' | 'chapa_online' | 'direct_debit' | 'transfer' | string;
  recordedBy: string;
  timestamp: string;
  allocation?: string;
  isRefunded?: boolean;
  refundAmountETB?: number;
  refundReason?: string;
}

export interface SmsToastNotification {
  id: string;
  recipientPhone: string;
  recipientName: string;
  templateType: 'confirmation' | 'reminder' | 'missed_recovery' | 'receipt';
  contentAm: string;
  contentEn: string;
  timestamp: string;
}

export type ClinicalToastType = 'success' | 'error' | 'info' | 'warning';

export interface ClinicalToast {
  id: string;
  title: string;
  message: string;
  type: ClinicalToastType;
  durationMs?: number;
}

export interface DenominationBreakdown {
  notes200: number;
  notes100: number;
  notes50: number;
  coinsAndSmall: number;
}

export interface DayCloseReport {
  id: string;
  zReportNumber: string;
  clinicSlug: string;
  closedAt: string;
  closedBy: string;
  totalBilledETB: number;
  totalCollectedETB: number;
  cashExpectedETB: number;
  cashCountedETB: number;
  cashVarianceETB: number;
  telebirrTotalETB: number;
  cbeTotalETB: number;
  chapaTotalETB: number;
  totalPatientsCount: number;
  completedEncountersCount: number;
  varianceReason?: string;
  tinNumber: string;
}

export type TreatmentPlanStatus =
  | 'to_quote'
  | 'awaiting_patient'
  | 'no_appointment'
  | 'no_next_appointment'
  | 'closed';

export interface PlanProcedureItem {
  id: string;
  name: string;
  category: 'restorative' | 'surgery' | 'endodontics' | 'orthodontics' | 'addons' | 'whole_mouth';
  toothNumber?: number | 'whole_mouth' | string | null;
  feeETB: number;
  assignedDoctorCode: string;
  status: 'pending' | 'completed';
}

export interface PlanClinicalNote {
  id: string;
  authorCode: string;
  authorName: string;
  type: 'plan' | 'treatment' | 'visit';
  content: string;
  createdAt: string;
}

export interface TreatmentPlan {
  id: string; // e.g. 'PLAN-2026-0003'
  title: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  patientPhone: string;
  status: TreatmentPlanStatus;
  currentStep: 1 | 2 | 3; // 1: Plan, 2: Confirm, 3: In progress
  quoteId?: string;
  quoteStatus?: 'draft' | 'sent' | 'accepted';
  quoteAmountETB: number;
  agingDays: number;
  appointmentState: 'no_appointment' | 'scheduled' | 'completed';
  chartNotation: Record<number, ToothStatus>;
  archType: 'permanent' | 'primary';
  procedures: PlanProcedureItem[];
  clinicalNotes: PlanClinicalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractInstallment {
  id: string;
  visitNumber: number;
  dueDate: string;
  amountETB: number;
  paidAmountETB: number;
  paidAt?: string;
  receiptNumber?: string;
  status: 'paid' | 'due' | 'overdue' | 'prepaid_covered';
  notes?: string;
}

export interface TreatmentContract {
  id: string; // e.g. 'ORT-2026-0001'
  patientId: string;
  patientName: string;
  patientPhone: string;
  category: 'orthodontics' | 'implantology' | 'prosthodontics' | 'general';
  title: string;
  doctorName: string;
  totalContractETB: number;
  downPaymentETB: number;
  totalCollectedETB: number;
  prepaidCreditETB: number; // Advance payments held as credit!
  remainingBalanceETB: number;
  installmentPerVisitETB: number;
  intervalWeeks: number; // default: 4 (1 month interval)
  estimatedVisits: number; // default: 18 visits
  completedVisitsCount: number;
  currentStage: string;
  bracketRepairPolicy: 'chargeable' | 'complimentary';
  bracketRepairFeeETB: number;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  nextDueVisitDate?: string;
  installments: ContractInstallment[];
}

export interface ChairSeatingRequest {
  id: string;
  appointmentId: string;
  patientName: string;
  serviceName: string;
  doctorName: string;
  chairNumber: number;
  requestedBy: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}
