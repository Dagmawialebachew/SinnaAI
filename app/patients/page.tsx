'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  User,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Edit,
  Pencil,
  Activity,
  FileText,
  Pill,
  HeartPulse,
  Copy,
  Trash2,
  Archive,
  Compass,
  LayoutDashboard,
  Wallet,
  Stethoscope,
  BellOff,
  Bell,
  Image as ImageIcon,
  Images,
  Receipt,
  Printer,
  Building2,
  Briefcase,
  Clock,
  ArrowUpDown,
  Check,
  X,
  FileCheck,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  History as HistoryIcon
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { BookingModal } from '@/components/booking-modal';
import { TreatmentOdontogramChart } from '@/components/treatment-odontogram-chart';
import { ToothStatus } from '@/lib/types';

export interface PatientActivityNote {
  id: string;
  authorName: string;
  authorInitials: string;
  category: 'administrative' | 'diagnosis' | 'treatment' | 'plan' | 'clinical';
  procedureTag?: string;
  date: string;
  content: string;
}

export interface FullPatientProfile {
  id: string;
  mrn: string;
  name: string;
  nameAmharic: string;
  phone: string;
  email: string;
  age: number;
  gender: 'Female' | 'Male';
  dob: string;
  status: 'active' | 'archived';
  doNotContact: boolean;
  subcity: string;
  notes: string;
  // Medical
  allergies: string[];
  systemicDiseases: string[];
  currentMedications: string[];
  specialConditions: string[];
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  // Administrative
  billingName: string;
  tin: string;
  billingEmail: string;
  billingAddress: string;
  // Clinical / Financial Summary
  activePlanTitle?: string;
  activePlanProgress?: { completed: number; total: number; percent: number };
  nextAppointment?: { date: string; time: string; doctor: string; service: string };
  lastVisit?: { date: string; doctor: string; procedure: string };
  balanceETB: number;
  totalPaidETB: number;
  diagnosesUntreated: string[];
  chartNotation?: Record<number, ToothStatus>;
  // Activity Feed
  activityNotes: PatientActivityNote[];
}

const INITIAL_PATIENTS: FullPatientProfile[] = [
  {
    id: 'apt-001',
    mrn: 'BDS-MRN-2026-0041',
    name: 'Tigist Alemu',
    nameAmharic: 'ትዕግስት አለሙ ደስታ',
    phone: '+251 91 144 5566',
    email: 'tigist.alemu@gmail.com',
    age: 32,
    gender: 'Female',
    dob: '05/14/1994 (32 years)',
    status: 'active',
    doNotContact: false,
    subcity: 'Bole Subcity, Woreda 03, House #142 (Brass Hospital Area)',
    notes: 'Orthodontic client on 18-month fixed metallic appliance. Compliant with hygiene instructions.',
    allergies: ['No known drug allergies (NKDA)'],
    systemicDiseases: ['Hypertension Stage 2 (Current BP 145/95 mmHg) — Epinephrine restriction in LA'],
    currentMedications: ['Amlodipine 5mg PO daily'],
    specialConditions: ['Regular oral hygiene recalls every 4 weeks'],
    emergencyContact: {
      name: 'Ato Alemu Desta',
      relationship: 'Father',
      phone: '+251 91 133 9988',
      email: 'alemu.desta@email.com',
    },
    billingName: 'Tigist Alemu Desta',
    tin: '0049283711',
    billingEmail: 'tigist.alemu@gmail.com',
    billingAddress: 'Bole Subcity, Woreda 03, House #142, Addis Ababa',
    activePlanTitle: 'Comprehensive Fixed Metallic Braces (Dual Arch)',
    activePlanProgress: { completed: 5, total: 18, percent: 28 },
    nextAppointment: {
      date: 'Sun, Oct 11, 2026',
      time: '11:00 AM',
      doctor: 'Dr. Senait Tadesse',
      service: 'Fixed Metallic Braces Adjustment (Visit 5)',
    },
    lastVisit: {
      date: 'Oct 07, 2026 11:30 AM',
      doctor: 'Dr. Senait Tadesse',
      procedure: 'Routine Cleaning & Periodontal Scaling',
    },
    balanceETB: 27500,
    totalPaidETB: 17500,
    diagnosesUntreated: ['Generalized Plaque-Induced Gingivitis', 'Angle Class I Malocclusion'],
    chartNotation: { 11: 'crown', 21: 'crown', 26: 'rct', 46: 'filled', 47: 'filled' },
    activityNotes: [
      {
        id: 'act-1',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'treatment',
        procedureTag: 'ortho_wire_progression (upper arch)',
        date: '10/11/2026',
        content: 'Upgraded upper archwire to 0.016 NiTi. Tightened ligature brackets. Patient reported comfortable adaptation with no soft tissue ulceration.',
      },
      {
        id: 'act-2',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'treatment',
        procedureTag: 'scaling_prophylaxis (whole mouth)',
        date: '10/07/2026',
        content: 'Ultrasonic supra/subgingival scaling completed. 0.2% Chlorhexidine irrigation applied. Bleeding on probing reduced.',
      },
      {
        id: 'act-3',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'plan',
        procedureTag: 'contract_established',
        date: '9/15/2026',
        content: 'Formal 18-month orthodontic course-of-care contract ORT-2026-0001 confirmed. 2,500 ETB monthly installment schedule agreed.',
      },
      {
        id: 'act-4',
        authorName: 'Helen Tadesse',
        authorInitials: 'HT',
        category: 'administrative',
        date: '9/01/2026',
        content: 'Patient requested bilingual AfroMessage SMS appointment alerts 24 hours prior to scheduled chair visits.',
      },
    ],
  },
  {
    id: 'apt-002',
    mrn: 'BDS-MRN-2026-0089',
    name: 'Abebe Kebede',
    nameAmharic: 'አበበ ከበደ ወልደማሪያም',
    phone: '+251 91 122 3344',
    email: 'abebe.kebede@yahoo.com',
    age: 41,
    gender: 'Male',
    dob: '08/21/1985 (41 years)',
    status: 'active',
    doNotContact: false,
    subcity: 'Kirkos Subcity, Woreda 02, House #884 (Kazanchis)',
    notes: 'Severe Penicillin allergy on file. Undergoing single-visit rotary endodontic therapy on Tooth #36.',
    allergies: ['Penicillin / Amoxicillin Allergy (Severe anaphylactoid rash and facial edema in 2021) — STRICT CONTRAINDICATION'],
    systemicDiseases: ['None reported'],
    currentMedications: ['Clindamycin 300mg PO TID (Non-penicillin alternative)', 'Ibuprofen 400mg PO PRN'],
    specialConditions: ['Avoid all Beta-lactam and Cephalosporin antibiotics'],
    emergencyContact: {
      name: 'W/ro Selamawit Hailu',
      relationship: 'Spouse',
      phone: '+251 91 166 4433',
      email: 'selam.hailu@email.com',
    },
    billingName: 'Abebe Kebede Woldemariam',
    tin: '0049283711',
    billingEmail: 'abebe.kebede@yahoo.com',
    billingAddress: 'Kirkos Subcity, Woreda 02, Kazanchis, Addis Ababa',
    activePlanTitle: 'Endodontic Pulpectomy & Zirconia Crown (#36)',
    activePlanProgress: { completed: 1, total: 3, percent: 33 },
    nextAppointment: {
      date: 'Sun, Oct 11, 2026',
      time: '09:30 AM',
      doctor: 'Dr. Senait Tadesse',
      service: 'Single-Visit Rotary Root Canal Therapy (#36)',
    },
    lastVisit: {
      date: 'Oct 08, 2026 10:00 AM',
      doctor: 'Dr. Senait Tadesse',
      procedure: 'Emergency Pulpectomy & Canal Debridement',
    },
    balanceETB: 6000,
    totalPaidETB: 1500,
    diagnosesUntreated: ['Pulpal Necrosis with Symptomatic Apical Periodontitis on #36'],
    chartNotation: { 16: 'caries', 36: 'rct', 14: 'missing', 21: 'filled' },
    activityNotes: [
      {
        id: 'act-201',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'treatment',
        procedureTag: 'root_canal_full (tooth 36)',
        date: '10/08/2026',
        content: 'Emergency pulpectomy performed under 2% Lidocaine without epinephrine. Canals located, rotary cleaning with NaOCl, Cavit temporary seal placed.',
      },
      {
        id: 'act-202',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'diagnosis',
        procedureTag: 'Tooth 36',
        date: '10/08/2026',
        content: 'Deep disto-occlusal carious cavitation into pulp chamber. Vitality negative. Vertical percussion positive.',
      },
      {
        id: 'act-203',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'clinical',
        date: '10/08/2026',
        content: 'Penicillin allergy red flag verified with patient. Clindamycin 300mg prescribed as safe alternative.',
      },
    ],
  },
  {
    id: 'apt-003',
    mrn: 'BDS-MRN-2026-0037',
    name: 'Dawit Haile',
    nameAmharic: 'ዳዊት ኃይሌ ገብረሚካኤል',
    phone: '+251 93 455 6677',
    email: 'dawit.haile@tech.et',
    age: 28,
    gender: 'Male',
    dob: '11/04/1998 (28 years)',
    status: 'active',
    doNotContact: false,
    subcity: 'Yeka Subcity, Woreda 07, House #312 (Megenagna)',
    notes: 'Type 2 Diabetic with well-controlled HbA1c (6.8%). Discolored non-vital central incisor #11.',
    allergies: ['No known allergies'],
    systemicDiseases: ['Type 2 Diabetes Mellitus (Controlled on Metformin)'],
    currentMedications: ['Metformin 500mg PO BID'],
    specialConditions: ['Morning appointment preference; monitor fasting blood glucose before surgical procedures'],
    emergencyContact: {
      name: 'W/ro Rahel Haile',
      relationship: 'Sister',
      phone: '+251 92 888 1122',
      email: 'rahel.haile@email.com',
    },
    billingName: 'Dawit Haile',
    tin: '0049283711',
    billingEmail: 'dawit.haile@tech.et',
    billingAddress: 'Yeka Subcity, Megenagna, Addis Ababa',
    activePlanTitle: 'Aesthetic Restoration & Internal Bleaching (#11)',
    activePlanProgress: { completed: 2, total: 3, percent: 67 },
    nextAppointment: undefined,
    lastVisit: {
      date: 'Oct 09, 2026 01:00 PM',
      doctor: 'Dr. Senait Tadesse',
      procedure: 'Warm Gutta-Percha Vertical Condensation Obturation',
    },
    balanceETB: 0,
    totalPaidETB: 6000,
    diagnosesUntreated: ['Class II Enamel Caries on #46'],
    chartNotation: { 11: 'rct', 46: 'caries', 16: 'caries', 26: 'filled' },
    activityNotes: [
      {
        id: 'act-301',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'treatment',
        procedureTag: 'obturation_vertical (tooth 11)',
        date: '10/09/2026',
        content: 'Warm vertical condensation obturation with bioceramic sealer completed. Radiograph confirms dense 3D apical seal.',
      },
      {
        id: 'act-302',
        authorName: 'Dr. Dawit Bekele',
        authorInitials: 'DB',
        category: 'diagnosis',
        procedureTag: 'Tooth 11 trauma',
        date: '9/22/2026',
        content: 'Traumatic non-vital pulp necrosis secondary to football injury 1 year ago. Discoloration noted.',
      },
    ],
  },
  {
    id: 'apt-004',
    mrn: 'BDS-MRN-2026-0155',
    name: 'Sara Mengistu',
    nameAmharic: 'ሳራ መንግስቱ ታከለ',
    phone: '+251 94 888 9900',
    email: 'sara.mengistu@school.edu.et',
    age: 29,
    gender: 'Female',
    dob: '02/18/1997 (29 years)',
    status: 'active',
    doNotContact: false,
    subcity: 'Bole Subcity, Woreda 05, House #902',
    notes: 'Pregnant (22 weeks gestation — 2nd Trimester). Localized reversible pulpitis on tooth #26.',
    allergies: ['No known allergies'],
    systemicDiseases: ['Pregnancy (22 weeks gestation — 2nd Trimester safe period)'],
    currentMedications: ['Prenatal vitamins & Iron/Folic acid'],
    specialConditions: ['Double lead thyroid apron required for all digital radiographs'],
    emergencyContact: {
      name: 'Ato Yohannes Bekele',
      relationship: 'Spouse',
      phone: '+251 91 777 3344',
      email: 'yohannes.bekele@email.com',
    },
    billingName: 'Sara Mengistu Takele',
    tin: '0049283711',
    billingEmail: 'sara.mengistu@school.edu.et',
    billingAddress: 'Bole Subcity, Woreda 05, Addis Ababa',
    activePlanTitle: 'Biomimetic Resin Restoration & Prophylaxis',
    activePlanProgress: { completed: 1, total: 2, percent: 50 },
    nextAppointment: {
      date: 'Sun, Oct 11, 2026',
      time: '02:00 PM',
      doctor: 'Dr. Dawit Bekele',
      service: 'Routine Cleaning & Periodontal Scaling',
    },
    lastVisit: {
      date: 'Oct 08, 2026 12:30 PM',
      doctor: 'Dr. Senait Tadesse',
      procedure: 'Clinical Consultation & Reversible Pulpitis Diagnostic Exam',
    },
    balanceETB: 1500,
    totalPaidETB: 1200,
    diagnosesUntreated: ['Mesio-occlusal dentin caries on #26', 'Pregnancy-associated gingivitis'],
    chartNotation: { 26: 'filled', 15: 'healthy', 36: 'healthy' },
    activityNotes: [
      {
        id: 'act-401',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'treatment',
        procedureTag: 'filling_composite (tooth 26)',
        date: '10/08/2026',
        content: 'Caries excavated. Resin-modified glass ionomer protective liner placed followed by nano-hybrid composite restoration. Occlusion verified.',
      },
      {
        id: 'act-402',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'clinical',
        date: '10/08/2026',
        content: '2nd trimester safe dental guidelines reviewed. Confirmed patient blood pressure normal at 115/75 mmHg.',
      },
    ],
  },
  {
    id: 'apt-005',
    mrn: 'BDS-MRN-2026-0210',
    name: 'Meron Tesfaye',
    nameAmharic: 'ሜሮን ተስፋዬ ገብሬ',
    phone: '+251 92 333 4455',
    email: 'meron.tesfaye@design.et',
    age: 26,
    gender: 'Female',
    dob: '07/12/2000 (26 years)',
    status: 'active',
    doNotContact: false,
    subcity: 'Bole Subcity, Woreda 04, House #512',
    notes: 'Nickel allergy on file. Ceramic and titanium aesthetic brackets required.',
    allergies: ['Nickel / Base Metal Sensitivity (contact dermatitis) — Strict ceramic/titanium hardware requirement'],
    systemicDiseases: ['None reported'],
    currentMedications: ['None'],
    specialConditions: ['Hypoallergenic orthodontic materials only'],
    emergencyContact: {
      name: 'W/ro Genet Assefa',
      relationship: 'Mother',
      phone: '+251 91 199 8877',
      email: 'genet.assefa@email.com',
    },
    billingName: 'Meron Tesfaye Gebre',
    tin: '0049283711',
    billingEmail: 'meron.tesfaye@design.et',
    billingAddress: 'Bole Subcity, Woreda 04, Addis Ababa',
    activePlanTitle: 'Clear Ceramic Aesthetic Orthodontics',
    activePlanProgress: { completed: 1, total: 16, percent: 6 },
    nextAppointment: undefined,
    lastVisit: {
      date: 'Oct 06, 2026 11:00 AM',
      doctor: 'Dr. Senait Tadesse',
      procedure: 'Orthodontic Assessment & Pit Restoration',
    },
    balanceETB: 0,
    totalPaidETB: 1500,
    diagnosesUntreated: ['Angle Class I Malocclusion with Moderate Anterior Crowding'],
    chartNotation: { 14: 'filled', 24: 'filled', 34: 'filled', 44: 'filled' },
    activityNotes: [
      {
        id: 'act-501',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'plan',
        procedureTag: 'aesthetic_orthodontics',
        date: '10/06/2026',
        content: 'Photographic diagnostic series and alginate impressions taken. Nickel-free ceramic brackets ordered.',
      },
    ],
  },
  {
    id: 'apt-006',
    mrn: 'BDS-MRN-2026-0225',
    name: 'Yonas Getachew',
    nameAmharic: 'ዮናስ ጌታቸው ደበበ',
    phone: '+251 91 555 7788',
    email: 'yonas.getachew@logistics.et',
    age: 38,
    gender: 'Male',
    dob: '09/03/1988 (38 years)',
    status: 'active',
    doNotContact: false,
    subcity: 'Bole Subcity, Woreda 02, House #731',
    notes: 'Mild bronchial asthma. Salbutamol inhaler must be verified chairside.',
    allergies: ['No known allergies'],
    systemicDiseases: ['Bronchial Asthma (mild intermittent, triggered by cold air)'],
    currentMedications: ['Salbutamol 100mcg inhaler PRN'],
    specialConditions: ['Inhaler placed on bracket tray prior to surgical extractions'],
    emergencyContact: {
      name: 'Ato Getachew Debebe',
      relationship: 'Father',
      phone: '+251 91 144 2211',
      email: 'getachew.debebe@email.com',
    },
    billingName: 'Yonas Getachew Debebe',
    tin: '0049283711',
    billingEmail: 'yonas.getachew@logistics.et',
    billingAddress: 'Bole Subcity, Woreda 02, Addis Ababa',
    activePlanTitle: 'Surgical Odontectomy of Impacted #48',
    activePlanProgress: { completed: 1, total: 3, percent: 33 },
    nextAppointment: undefined,
    lastVisit: {
      date: 'Oct 05, 2026 03:00 PM',
      doctor: 'Dr. Dawit Bekele',
      procedure: 'Pericoronitis Debridement & Surgical Planning',
    },
    balanceETB: 0,
    totalPaidETB: 1200,
    diagnosesUntreated: ['Mesioangular Impacted Wisdom Tooth #48'],
    activityNotes: [
      {
        id: 'act-601',
        authorName: 'Dr. Dawit Bekele',
        authorInitials: 'DB',
        category: 'treatment',
        procedureTag: 'pericoronitis_debridement',
        date: '10/05/2026',
        content: 'Operculum debrided with warm sterile saline. Amoxicillin 500mg and Ibuprofen prescribed. Scheduled for surgical extraction after acute phase resolves.',
      },
    ],
  },
  {
    id: 'apt-010',
    mrn: 'BDS-MRN-2026-0312',
    name: 'Almaz Wolde',
    nameAmharic: 'አልማዝ ወልዴ ገብረ',
    phone: '+251 91 234 5678',
    email: 'almaz.wolde@finance.et',
    age: 35,
    gender: 'Female',
    dob: '04/19/1991 (35 years)',
    status: 'active',
    doNotContact: true,
    subcity: 'Bole Subcity, Woreda 01, House #204',
    notes: 'Requested do-not-contact flag for phone calls; communicates via email only.',
    allergies: ['No known allergies'],
    systemicDiseases: ['None reported'],
    currentMedications: ['None'],
    specialConditions: ['Email communications only'],
    emergencyContact: {
      name: 'Ato Wolde Gebre',
      relationship: 'Father',
      phone: '+251 91 999 0011',
      email: 'wolde.gebre@email.com',
    },
    billingName: 'Almaz Wolde',
    tin: '0049283711',
    billingEmail: 'almaz.wolde@finance.et',
    billingAddress: 'Bole Subcity, Woreda 01, Addis Ababa',
    activePlanTitle: 'Fixed Orthodontics Maintenance',
    activePlanProgress: { completed: 8, total: 18, percent: 44 },
    nextAppointment: undefined,
    lastVisit: {
      date: 'Oct 10, 2026 10:00 AM',
      doctor: 'Dr. Senait Tadesse',
      procedure: 'Emergency Broken Bracket Re-bonding',
    },
    balanceETB: 400,
    totalPaidETB: 20000,
    diagnosesUntreated: ['Bracket debonding on Tooth #24'],
    activityNotes: [
      {
        id: 'act-701',
        authorName: 'Dr. Senait Tadesse',
        authorInitials: 'ST',
        category: 'treatment',
        procedureTag: 'bracket_rebonding',
        date: '10/10/2026',
        content: 'Tooth #24 etched, bonded with Transbond XT, archwire re-engaged. Option B emergency repair fee applied.',
      },
    ],
  },
];

type ProfileTab = 'summary' | 'info' | 'clinical' | 'administration' | 'gallery' | 'activity';
type ClinicalSubTab = 'diagnosis' | 'treatment_plans' | 'appointments' | 'history';

export default function PatientsPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Patient roster state
  const [patients, setPatients] = useState<FullPatientProfile[]>(INITIAL_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('summary');
  const [clinicalSubTab, setClinicalSubTab] = useState<ClinicalSubTab>('diagnosis');
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [patientTeeth, setPatientTeeth] = useState<Record<number, ToothStatus>>({
    16: 'caries',
    36: 'rct',
    46: 'crown',
    27: 'filled',
  });
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [archType, setArchType] = useState<'permanent' | 'primary'>('permanent');

  // Synchronize 32-tooth FDI odontogram when switching between patient records
  useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(pat => pat.id === selectedPatientId);
      if (p?.chartNotation) {
        setPatientTeeth({ ...p.chartNotation });
      } else {
        setPatientTeeth({});
      }
      setSelectedTooth(null);
    }
  }, [selectedPatientId, patients]);

  const handleUpdateToothStatus = (toothNum: number, status: ToothStatus) => {
    setPatientTeeth(prev => {
      const next = { ...prev };
      if (status === 'healthy') {
        delete next[toothNum];
      } else {
        next[toothNum] = status;
      }
      if (selectedPatientId) {
        setPatients(list =>
          list.map(p => (p.id === selectedPatientId ? { ...p, chartNotation: next } : p))
        );
      }
      return next;
    });
  };

  // Filter Bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [onlyDoNotContact, setOnlyDoNotContact] = useState(false);
  const [withDebtOnly, setWithDebtOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'last_visit' | 'name' | 'debt'>('last_visit');

  // Modals state
  const [newPatientModalOpen, setNewPatientModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [newNoteModalOpen, setNewNoteModalOpen] = useState(false);
  const [newNoteCategory, setNewNoteCategory] = useState<PatientActivityNote['category']>('administrative');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Activity filter inside patient profile
  const [activityFilter, setActivityFilter] = useState<'all' | 'administrative' | 'diagnosis' | 'treatment' | 'plan' | 'clinical'>('all');

  // New Patient Form state (with optional service, blank registration, and editable payment rails)
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    nameAmharic: '',
    phone: '+251 9',
    email: '',
    age: 30,
    gender: 'Female' as 'Female' | 'Male',
    subcity: 'Bole Subcity, Woreda 03',
    allergies: '',
    systemicDiseases: '',
    serviceId: '', // '' means blank / registration only (0 ETB)
    paymentMethod: 'none' as 'none' | 'cash' | 'telebirr' | 'cbe_birr' | 'chapa',
    amountPaidETB: 0,
    notes: '',
  });

  // Selected Patient computation
  const currentPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Filtered directory list
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        // Status filter
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        // Do not contact filter
        if (onlyDoNotContact && !p.doNotContact) return false;
        // Debt filter
        if (withDebtOnly && p.balanceETB <= 0) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q) || p.nameAmharic.includes(q);
          const matchPhone = p.phone.includes(q);
          const matchMrn = p.mrn.toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchMrn) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'debt') return b.balanceETB - a.balanceETB;
        return 0; // default last visit
      });
  }, [patients, statusFilter, onlyDoNotContact, withDebtOnly, searchQuery, sortBy]);

  // Handlers
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) return;

    const newId = `apt-${Date.now()}`;
    const newMrn = `BDS-MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const serviceObj = clinic.services.find((s) => s.id === newPatientForm.serviceId);
    const serviceTitle = serviceObj ? serviceObj.nameEn : 'Registration Only (Triage Pending)';
    const totalServiceFee = serviceObj ? serviceObj.priceETB : 0;
    const paidAmount = Number(newPatientForm.amountPaidETB) || 0;
    const balanceRemaining = Math.max(0, totalServiceFee - paidAmount);

    const newPatient: FullPatientProfile = {
      id: newId,
      mrn: newMrn,
      name: newPatientForm.name.trim(),
      nameAmharic: newPatientForm.nameAmharic.trim() || newPatientForm.name.trim(),
      phone: newPatientForm.phone.trim(),
      email: newPatientForm.email.trim() || `${newPatientForm.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      age: Number(newPatientForm.age) || 30,
      gender: newPatientForm.gender,
      dob: `01/01/${2026 - (Number(newPatientForm.age) || 30)} (${newPatientForm.age} years)`,
      status: 'active',
      doNotContact: false,
      subcity: newPatientForm.subcity,
      notes: newPatientForm.notes.trim() || 'New patient intake registered at front desk.',
      allergies: newPatientForm.allergies ? [newPatientForm.allergies] : ['No known drug allergies (NKDA)'],
      systemicDiseases: newPatientForm.systemicDiseases ? [newPatientForm.systemicDiseases] : ['None reported'],
      currentMedications: ['None'],
      specialConditions: ['None'],
      emergencyContact: {
        name: 'Family Contact',
        relationship: 'Guardian',
        phone: '+251 91 100 0000',
        email: 'contact@email.com',
      },
      billingName: newPatientForm.name.trim(),
      tin: '0049283711',
      billingEmail: newPatientForm.email.trim(),
      billingAddress: newPatientForm.subcity,
      balanceETB: balanceRemaining,
      totalPaidETB: paidAmount,
      diagnosesUntreated: [serviceTitle],
      activityNotes: [
        {
          id: `act-${Date.now()}`,
          authorName: 'Helen Tadesse',
          authorInitials: 'HT',
          category: 'administrative',
          date: new Date().toLocaleDateString(),
          content: `New patient registered with MRN ${newMrn}. Initial service: ${serviceTitle}.${paidAmount > 0 ? ` Received ${paidAmount} ETB via ${newPatientForm.paymentMethod.toUpperCase()}.` : ' Registration completed without upfront fee.'}`,
        },
      ],
    };

    setPatients([newPatient, ...patients]);
    setNewPatientModalOpen(false);
    setSelectedPatientId(newId);
    setActiveProfileTab('summary');

    sinnaStore.toastSuccess(
      'Patient Registered',
      `${newPatient.name} registered with MRN ${newMrn}.${paidAmount > 0 ? ` ${paidAmount} ETB payment recorded.` : ''}`
    );
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient || !newNoteContent.trim()) return;

    const newNote: PatientActivityNote = {
      id: `act-custom-${Date.now()}`,
      authorName: 'Dr. Senait Tadesse',
      authorInitials: 'ST',
      category: newNoteCategory,
      date: new Date().toLocaleDateString(),
      content: newNoteContent.trim(),
    };

    const updated = patients.map((p) => {
      if (p.id !== currentPatient.id) return p;
      return {
        ...p,
        activityNotes: [newNote, ...p.activityNotes],
      };
    });

    setPatients(updated);
    setNewNoteContent('');
    setNewNoteModalOpen(false);
    sinnaStore.toastSuccess('Note Added', 'Clinical entry appended to patient chart feed.');
  };

  const handleArchivePatient = () => {
    if (!currentPatient) return;
    const updated = patients.map((p) =>
      p.id === currentPatient.id ? { ...p, status: 'archived' as const } : p
    );
    setPatients(updated);
    sinnaStore.toastError('Patient Archived', 'Patient moved to archive. Historical records preserved.');
    setSelectedPatientId(null);
  };

  // =========================================================================
  // VIEW A: PATIENT PROFILE VIEW (Screenshots 2, 3, 4, 5)
  // =========================================================================
  if (currentPatient) {
    const initials = currentPatient.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const filteredNotes = currentPatient.activityNotes.filter((note) => {
      if (activityFilter === 'all') return true;
      return note.category === activityFilter;
    });

    return (
      <div className="space-y-5 max-w-7xl mx-auto pb-12 animate-fade-in">
        {/* DentalPin Patient Sticky Header */}
        <header className="patient-sticky-header sticky top-0 z-30 -mx-4 sm:mx-0 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-3 py-2.5 rounded-xl shadow-2xs mb-4" aria-label="Patient header">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              aria-label="Back"
              onClick={() => setSelectedPatientId(null)}
              className="rounded-md font-medium inline-flex items-center transition-colors text-xs gap-1.5 text-slate-700 hover:bg-slate-100 active:bg-slate-200 p-1.5 shrink-0 border border-slate-200/80"
              title="Return to patient directory"
            >
              <ArrowLeft className="shrink-0 w-4 h-4" />
            </button>
            <span className="inline-flex items-center justify-center select-none rounded-full align-middle bg-slate-100 size-9 text-xs shrink-0 ring-2 ring-slate-200 text-slate-700 font-bold">
              {initials}
            </span>
            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-base sm:text-lg text-slate-900 font-semibold truncate">
                  {currentPatient.name}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" aria-label="Active" />
                <span className="text-xs font-semibold text-slate-400 font-amharic hidden sm:inline truncate">
                  ({currentPatient.nameAmharic})
                </span>
              </div>
              <div className="flex items-center gap-x-2.5 gap-y-1 flex-wrap text-xs text-slate-500">
                <span className="font-mono">{currentPatient.age} years</span>
                <span className="text-slate-300">•</span>
                <a
                  href={`tel:${currentPatient.phone}`}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md text-sky-600 hover:bg-slate-100 transition-colors"
                  aria-label={`Phone: ${currentPatient.phone}`}
                  title={currentPatient.phone}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`mailto:${currentPatient.email}`}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md text-sky-600 hover:bg-slate-100 transition-colors"
                  aria-label={`Email: ${currentPatient.email}`}
                  title={currentPatient.email}
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
                <span className="text-slate-300 hidden md:inline">•</span>
                <span className="font-mono text-[11px] text-slate-400 hidden md:inline">{currentPatient.mrn}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                aria-label="Edit patient"
                onClick={() => setActiveProfileTab('info')}
                className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs shrink-0"
              >
                <Pencil className="shrink-0 w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                  className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-150 border border-sky-200 shadow-2xs shrink-0"
                >
                  <Plus className="shrink-0 w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-semibold">Actions</span>
                  <ChevronDown className={`shrink-0 w-3.5 h-3.5 transition-transform ${actionsMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {actionsMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setActionsMenuOpen(false);
                        setBookingModalOpen(true);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      <span>Book Appointment</span>
                    </button>
                    <Link
                      href="/treatment-plans"
                      onClick={() => setActionsMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                      <span>New Treatment Plan</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setActionsMenuOpen(false);
                        sinnaStore.toastInfo('Print Ready', `Clinical chart document generated for ${currentPatient.name}`);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print Paper Chart</span>
                    </button>
                    <Link
                      href="/recalls"
                      onClick={() => setActionsMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>Recall Follow-up</span>
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setActionsMenuOpen(false);
                        handleArchivePatient();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <Archive className="w-3.5 h-3.5 text-rose-500" />
                      <span>Archive Patient</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* DentalPin 6-Tab Navigation (Summary, Info, Clinical, Administration, Gallery, Activity) */}
        <div className="relative flex p-1 group bg-slate-100/90 rounded-xl w-full border border-slate-200/60 overflow-x-auto gap-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeProfileTab === 'summary'}
            onClick={() => setActiveProfileTab('summary')}
            className={`group relative inline-flex items-center min-w-0 font-medium rounded-lg transition-all grow justify-center px-3 py-2 text-xs sm:text-sm gap-2 ${
              activeProfileTab === 'summary'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <LayoutDashboard className="shrink-0 w-4 h-4 text-slate-500" />
            <span className="truncate">Summary</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeProfileTab === 'info'}
            onClick={() => setActiveProfileTab('info')}
            className={`group relative inline-flex items-center min-w-0 font-medium rounded-lg transition-all grow justify-center px-3 py-2 text-xs sm:text-sm gap-2 ${
              activeProfileTab === 'info'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="shrink-0 w-4 h-4 text-slate-500" />
            <span className="truncate">Info</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeProfileTab === 'clinical'}
            onClick={() => setActiveProfileTab('clinical')}
            className={`group relative inline-flex items-center min-w-0 font-medium rounded-lg transition-all grow justify-center px-3 py-2 text-xs sm:text-sm gap-2 ${
              activeProfileTab === 'clinical'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Stethoscope className="shrink-0 w-4 h-4 text-slate-500" />
            <span className="truncate">Clinical</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeProfileTab === 'administration'}
            onClick={() => setActiveProfileTab('administration')}
            className={`group relative inline-flex items-center min-w-0 font-medium rounded-lg transition-all grow justify-center px-3 py-2 text-xs sm:text-sm gap-2 ${
              activeProfileTab === 'administration'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Briefcase className="shrink-0 w-4 h-4 text-slate-500" />
            <span className="truncate">Administration</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeProfileTab === 'gallery'}
            onClick={() => setActiveProfileTab('gallery')}
            className={`group relative inline-flex items-center min-w-0 font-medium rounded-lg transition-all grow justify-center px-3 py-2 text-xs sm:text-sm gap-2 ${
              activeProfileTab === 'gallery'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Images className="shrink-0 w-4 h-4 text-slate-500" />
            <span className="truncate">Gallery</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeProfileTab === 'activity'}
            onClick={() => setActiveProfileTab('activity')}
            className={`group relative inline-flex items-center min-w-0 font-medium rounded-lg transition-all grow justify-center px-3 py-2 text-xs sm:text-sm gap-2 ${
              activeProfileTab === 'activity'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <HistoryIcon className="shrink-0 w-4 h-4 text-slate-500" />
            <span className="truncate">Activity</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB 1: SUMMARY (Screenshot 2) */}
        {/* ------------------------------------------------------------------- */}
        {activeProfileTab === 'summary' && (
          <div className="space-y-4">
            {/* 6-Card Clinical & Financial Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Card 1: ACTIVE PLAN */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Compass className="w-3.5 h-3.5 text-sky-500" />
                    <span>Active Plan</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {currentPatient.activePlanTitle || 'Routine Periodic Care'}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                    <span>
                      {currentPatient.activePlanProgress
                        ? `${currentPatient.activePlanProgress.completed}/${currentPatient.activePlanProgress.total} treatments`
                        : '1/2 treatments'}
                    </span>
                    <span className="font-bold text-sky-600 font-mono">
                      {currentPatient.activePlanProgress ? `${currentPatient.activePlanProgress.percent}%` : '50%'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{
                        width: `${currentPatient.activePlanProgress ? currentPatient.activePlanProgress.percent : 50}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <Link
                    href="/treatment-plans"
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between group"
                  >
                    <span>Open plan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Card 2: NEXT APPOINTMENT */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Next Appointment</span>
                  </div>
                  {currentPatient.nextAppointment ? (
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {currentPatient.nextAppointment.date} · {currentPatient.nextAppointment.time}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {currentPatient.nextAppointment.service}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {currentPatient.nextAppointment.doctor}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No upcoming appointments</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between group"
                  >
                    <span>Schedule appointment</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Card 3: LAST VISIT */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Visit</span>
                  </div>
                  {currentPatient.lastVisit ? (
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {currentPatient.lastVisit.date}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {currentPatient.lastVisit.procedure}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {currentPatient.lastVisit.doctor}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">First-time consultation</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveProfileTab('activity')}
                    className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between group"
                  >
                    <span>Open appointment</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Card 4: BALANCE (ETB Currency with Green accent line) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Balance</span>
                  </div>
                  <p className="text-xs text-slate-500">Total collected / paid</p>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                    {currentPatient.totalPaidETB.toLocaleString()} ETB
                  </p>
                  {currentPatient.balanceETB > 0 && (
                    <p className="text-xs text-amber-700 font-mono mt-1 font-semibold">
                      Outstanding: {currentPatient.balanceETB.toLocaleString()} ETB
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveProfileTab('administration')}
                    className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between group"
                  >
                    <span>Open ledger</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Card 5: DIAGNOSES */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>Diagnoses</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {currentPatient.diagnosesUntreated.length} untreated
                  </p>
                  <div className="space-y-1 mt-2 text-xs text-slate-600">
                    {currentPatient.diagnosesUntreated.map((diag, i) => (
                      <p key={i} className="truncate">
                        · {diag}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveProfileTab('clinical')}
                    className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between group"
                  >
                    <span>Open dental chart</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Card 6: MEDICAL HISTORY */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    <span>Medical History</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {currentPatient.systemicDiseases.map((dis, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-700">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{dis}</span>
                      </div>
                    ))}
                    {currentPatient.allergies.map((all, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-700">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{all}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveProfileTab('info')}
                    className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between group"
                  >
                    <span>Edit medical history</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Quick Actions + Notification Preferences (Matching Screenshot 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-1">
              {/* Card 7: Quick Actions */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quick Actions</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(true)}
                    className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/90 text-sky-900 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Appointment</span>
                  </button>

                  <Link
                    href="/quotes"
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors shadow-2xs text-center"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>Budget / Quote</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      sinnaStore.toastInfo(
                        'Document Generated',
                        `Official clinical record issued for ${currentPatient.name}.`
                      );
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <FileCheck className="w-4 h-4 text-slate-600" />
                    <span>Document / Rx</span>
                  </button>

                  <Link
                    href="/recalls"
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition-colors shadow-2xs text-center"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    <span>Set recall</span>
                  </Link>
                </div>
              </div>

              {/* Card 8: Notification Preferences */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1">
                  Notification preferences
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Which channels may reach this patient. An opt-out blocks that channel even for forced sends.
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-800">Email Alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-800">AfroMessage SMS & WhatsApp</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 2: INFO (Screenshots 4 & 5) */}
        {/* ------------------------------------------------------------------- */}
        {activeProfileTab === 'info' && (
          <div className="space-y-4">
            {/* Section 1: Medical Information */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Medical information</span>
                </h3>
                <button
                  type="button"
                  onClick={() => sinnaStore.toastInfo('Edit Mode', 'Medical alerts editor opened.')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 p-1"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Allergy Banner */}
              {currentPatient.allergies.length > 0 && currentPatient.allergies[0].includes('Allergy') ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-900 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{currentPatient.allergies[0]}</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-900 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No known allergies</span>
                </div>
              )}

              {/* 4 Subcolumns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Systemic Diseases
                  </p>
                  {currentPatient.systemicDiseases.length > 0 ? (
                    currentPatient.systemicDiseases.map((dis, i) => (
                      <span
                        key={i}
                        className="inline-block px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold"
                      >
                        {dis}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Medications
                  </p>
                  {currentPatient.currentMedications.length > 0 ? (
                    currentPatient.currentMedications.map((med, i) => (
                      <p key={i} className="text-slate-700 font-medium">
                        {med}
                      </p>
                    ))
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Special Conditions
                  </p>
                  {currentPatient.specialConditions.length > 0 ? (
                    currentPatient.specialConditions.map((cond, i) => (
                      <p key={i} className="text-slate-700 font-medium">
                        {cond}
                      </p>
                    ))
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Personal Info */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Personal info</span>
                </h3>
                <button
                  type="button"
                  onClick={() => sinnaStore.toastInfo('Edit Mode', 'Personal info editor active.')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 p-1"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">{currentPatient.name}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-amharic">
                    {currentPatient.nameAmharic} · {currentPatient.gender}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Date of birth
                  </p>
                  <p className="font-mono text-slate-800">{currentPatient.dob}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Clinical Notes
                  </p>
                  <p className="text-slate-600">{currentPatient.notes}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Contact */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>Contact</span>
                </h3>
                <button
                  type="button"
                  onClick={() => sinnaStore.toastInfo('Edit Mode', 'Contact info editor active.')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 p-1"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 w-24">Phone</span>
                  <span className="font-mono font-semibold text-slate-800 flex-1">{currentPatient.phone}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(currentPatient.phone);
                      sinnaStore.toastSuccess('Copied', 'Phone copied to clipboard.');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy phone"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 w-24">Email</span>
                  <span className="text-slate-800 flex-1">{currentPatient.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(currentPatient.email);
                      sinnaStore.toastSuccess('Copied', 'Email copied to clipboard.');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Copy email"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>Emergency Contact</span>
                  </p>
                  <p className="font-semibold text-slate-800">
                    {currentPatient.emergencyContact.name} · {currentPatient.emergencyContact.relationship}
                  </p>
                  <p className="font-mono text-slate-600 mt-0.5">{currentPatient.emergencyContact.phone}</p>
                  <p className="text-slate-400 text-[11px]">{currentPatient.emergencyContact.email}</p>
                </div>
              </div>
            </div>

            {/* Section 4: Administrative */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <span>Administrative</span>
                </h3>
                <button
                  type="button"
                  onClick={() => sinnaStore.toastInfo('Edit Mode', 'Administrative editor active.')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 p-1"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </button>
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Verified Patient Record
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Billing Name</p>
                  <p className="font-semibold text-slate-800">{currentPatient.billingName}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Ministry of Revenues TIN</p>
                  <p className="font-mono text-slate-800">{currentPatient.tin}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Billing Email</p>
                  <p className="text-slate-800">{currentPatient.billingEmail}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Billing Address</p>
                  <p className="text-slate-800">{currentPatient.billingAddress}</p>
                </div>
              </div>
            </div>

            {/* Section 5: Danger Zone (Archive Patient - Matching Screenshot 5) */}
            <div className="rounded-2xl p-4 bg-rose-50/50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="border-l-2 border-rose-500 pl-3">
                <p className="font-bold text-rose-900">Danger zone</p>
                <p className="text-rose-700 mt-0.5">
                  Archive the patient to hide them from searches. Appointments and history are preserved.
                </p>
              </div>

              <button
                type="button"
                onClick={handleArchivePatient}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 flex items-center justify-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
              >
                <Archive className="w-4 h-4 text-rose-600" />
                <span>Archive</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 3: CLINICAL (DentalPin Standard: Diagnosis, Treatment Plans, Appointments, History) */}
        {/* ------------------------------------------------------------------- */}
        {activeProfileTab === 'clinical' && (
          <div className="clinical-tab space-y-4">
            {/* Secondary Sub-tabs: Diagnosis, Treatment plans, Appointments, History */}
            <div className="items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto flex w-full border border-slate-200/60" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={clinicalSubTab === 'diagnosis'}
                onClick={() => setClinicalSubTab('diagnosis')}
                className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap px-3.5 py-1.5 flex-1 ${
                  clinicalSubTab === 'diagnosis'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 shrink-0 text-sky-600" />
                <span>Diagnosis</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={clinicalSubTab === 'treatment_plans'}
                onClick={() => setClinicalSubTab('treatment_plans')}
                className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap px-3.5 py-1.5 flex-1 ${
                  clinicalSubTab === 'treatment_plans'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Treatment plans</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={clinicalSubTab === 'appointments'}
                onClick={() => setClinicalSubTab('appointments')}
                className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap px-3.5 py-1.5 flex-1 ${
                  clinicalSubTab === 'appointments'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0 text-indigo-600" />
                <span>Appointments</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={clinicalSubTab === 'history'}
                onClick={() => setClinicalSubTab('history')}
                className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap px-3.5 py-1.5 flex-1 ${
                  clinicalSubTab === 'history'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HistoryIcon className="w-4 h-4 shrink-0 text-amber-600" />
                <span>History</span>
              </button>
            </div>

            {/* Sub-tab 1: Diagnosis (Odontogram + Register Conditions + Sidebar) */}
            {clinicalSubTab === 'diagnosis' && (
              <div className="min-[960px]:flex min-[960px]:gap-4 min-[960px]:items-start">
                {/* Left Column: Register conditions Card */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="overflow-hidden shadow-sm rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100">
                    <div className="p-4 px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-sky-600" />
                        <span className="font-semibold text-slate-900 text-sm">Register conditions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/treatment-plans"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                        >
                          <span>Full Treatment Plan Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5">
                      {/* Permanent / Primary Toggle & Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">Dental Chart</h3>
                          <span className="text-xs text-slate-400 font-mono">FDI World Dental Federation (11-48)</span>
                        </div>
                        <div className="items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg inline-flex border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setArchType('permanent')}
                            className={`inline-flex items-center justify-center text-xs font-semibold rounded-md transition-colors px-3 py-1 ${
                              archType === 'permanent'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            Permanent
                          </button>
                          <button
                            type="button"
                            onClick={() => setArchType('primary')}
                            className={`inline-flex items-center justify-center text-xs font-semibold rounded-md transition-colors px-3 py-1 ${
                              archType === 'primary'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            Primary
                          </button>
                        </div>
                      </div>

                      {/* Odontogram Component */}
                      <TreatmentOdontogramChart
                        chartNotation={patientTeeth}
                        selectedTooth={selectedTooth}
                        onSelectTooth={(num) => setSelectedTooth(selectedTooth === num ? null : num)}
                        archType={archType}
                        onToggleArchType={(type) => setArchType(type)}
                        onWholeMouthSelect={() => setSelectedTooth(null)}
                        onAddQuickCleaning={() => {
                          sinnaStore.toastSuccess('Prophylaxis Added', 'Ultrasonic Scaling & Prophylaxis (1,500 ETB) recorded in chart.');
                        }}
                        onAddQuickFirstVisit={() => {
                          sinnaStore.toastSuccess('Diagnostic Exam Added', 'Initial Clinical Consultation & X-Ray recorded in chart.');
                        }}
                      />

                      {/* Selected Tooth Clinical Action Drawer */}
                      {selectedTooth && (
                        <div className="mt-4 p-4 rounded-xl border border-sky-200 bg-sky-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-mono font-bold flex items-center justify-center text-xs shadow-2xs">
                                #{selectedTooth}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900">
                                  Tooth #{selectedTooth} Selected
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Condition: <span className="font-mono font-bold uppercase text-sky-700">{patientTeeth[selectedTooth] || 'SOUND / HEALTHY'}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {[
                              { status: 'healthy' as ToothStatus, label: 'Sound', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' },
                              { status: 'caries' as ToothStatus, label: 'Caries (Decay)', color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' },
                              { status: 'filled' as ToothStatus, label: 'Filled', color: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100' },
                              { status: 'crown' as ToothStatus, label: 'Crown', color: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100' },
                              { status: 'rct' as ToothStatus, label: 'Root Canal', color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100' },
                              { status: 'missing' as ToothStatus, label: 'Extraction', color: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' },
                            ].map((item) => (
                              <button
                                key={item.status}
                                type="button"
                                onClick={() => {
                                  handleUpdateToothStatus(selectedTooth, item.status);
                                  sinnaStore.toastSuccess('Tooth Status Updated', `Tooth #${selectedTooth} marked as ${item.label}.`);
                                }}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${item.color} ${
                                  (patientTeeth[selectedTooth] || 'healthy') === item.status ? 'ring-2 ring-sky-500 font-bold shadow-2xs' : ''
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Active Diagnoses & Chairside Dispatch (>=960px sidebar) */}
                <div className="min-[960px]:w-80 space-y-4 shrink-0 mt-4 min-[960px]:mt-0">
                  {/* Active Diagnoses Card */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Diagnoses & Pathologies</span>
                      </h4>
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                        {Object.values(patientTeeth).filter(s => s === 'caries' || s === 'rct' || s === 'missing').length} active
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {Object.entries(patientTeeth)
                        .filter(([_, status]) => status === 'caries' || status === 'rct' || status === 'missing')
                        .map(([toothNum, status]) => (
                          <div key={toothNum} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">#{toothNum}</span>
                              <span className="text-slate-600 capitalize">
                                {status === 'caries' ? 'Dental Caries' : status === 'rct' ? 'Pulpitis / Endo' : 'Missing / Extraction'}
                              </span>
                            </div>
                            <span className="font-mono font-semibold text-slate-900">
                              {status === 'caries' ? '2,200 ETB' : status === 'rct' ? '6,000 ETB' : '800 ETB'}
                            </span>
                          </div>
                        ))}

                      {Object.values(patientTeeth).filter(s => s === 'caries' || s === 'rct' || s === 'missing').length === 0 && (
                        <div className="text-center py-4 text-slate-400 text-xs">
                          <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                          No active pathological conditions recorded.
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Est. Treatment Total:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {Object.entries(patientTeeth).reduce((sum, [_, status]) => {
                          if (status === 'caries') return sum + 2200;
                          if (status === 'rct') return sum + 6000;
                          if (status === 'crown') return sum + 7500;
                          if (status === 'missing') return sum + 800;
                          return sum;
                        }, 0).toLocaleString()} ETB
                      </span>
                    </div>

                    <Link
                      href="/treatment-plans"
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Stage into Treatment Plan</span>
                    </Link>
                  </div>

                  {/* Operatory Chairside Dispatch */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Chairside Operatory Dispatch</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Dispatch patient to active clinical dental unit:</p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sinnaStore.toastSuccess('Seated in Chair 1', `${currentPatient.name} seated in Chair 1 (Main Operatory).`);
                        }}
                        className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-900 font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-colors shadow-2xs text-center"
                      >
                        <span className="font-bold">Chair 1</span>
                        <span className="text-[10px] text-indigo-700 font-normal">Main Operatory</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sinnaStore.toastSuccess('Seated in Chair 2', `${currentPatient.name} seated in Chair 2 (Hygiene & Endo).`);
                        }}
                        className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/90 text-sky-900 font-semibold text-xs flex flex-col items-center justify-center gap-1 transition-colors shadow-2xs text-center"
                      >
                        <span className="font-bold">Chair 2</span>
                        <span className="text-[10px] text-sky-700 font-normal">Hygiene & Endo</span>
                      </button>
                    </div>

                    <Link
                      href="/schedule"
                      className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Open Schedule Timeline</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Treatment Plans */}
            {clinicalSubTab === 'treatment_plans' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-emerald-600" />
                      <span>{currentPatient.activePlanTitle || 'General Restorative Plan'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Staged Ethiopian Clinical Dental Protocol</p>
                  </div>
                  <Link
                    href="/treatment-plans"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Open Odontogram Workspace</span>
                  </Link>
                </div>

                {/* Progress Bar */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Phase Completion Progress</span>
                    <span className="font-mono text-emerald-700">{currentPatient.activePlanProgress?.percent || 60}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${currentPatient.activePlanProgress?.percent || 60}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{currentPatient.activePlanProgress?.completed || 3} of {currentPatient.activePlanProgress?.total || 5} procedures completed</span>
                    <span className="font-mono font-bold text-slate-900">Total: {currentPatient.balanceETB + currentPatient.totalPaidETB} ETB</span>
                  </div>
                </div>

                {/* Staged Procedure Breakdown */}
                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Staged Clinical Procedures</h5>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-3 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">Stage 1: Comprehensive Periodontal Scaling & Debridement</p>
                          <p className="text-[11px] text-slate-500">Completed on {currentPatient.lastVisit?.date || 'Sep 24, 2026'}</p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">1,500 ETB</span>
                    </div>

                    <div className="p-3 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                          <Clock className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">Stage 2: Composite Resin Restoration (Tooth #16 MO)</p>
                          <p className="text-[11px] text-sky-600 font-medium">In Progress · Scheduled Next Visit</p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">2,200 ETB</span>
                    </div>

                    <div className="p-3 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          3
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">Stage 3: Full Zirconia Crown (Tooth #46)</p>
                          <p className="text-[11px] text-slate-500">Planned · Awaiting Tooth Preparation</p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">7,500 ETB</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Link
                    href="/quotes"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Formal ETB Quote</span>
                  </Link>
                  <Link
                    href="/invoices"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Issue Fiscal MoR Invoice</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Appointments */}
            {clinicalSubTab === 'appointments' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>Appointments & Operatory Visits</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Bole Dental Studio Chair Scheduling Record</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Appointment</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Next appointment */}
                  {currentPatient.nextAppointment && (
                    <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            Upcoming Visit
                          </span>
                          <span className="font-bold text-slate-900">{currentPatient.nextAppointment.date}</span>
                        </div>
                        <p className="text-slate-700 font-medium">{currentPatient.nextAppointment.service}</p>
                        <p className="text-[11px] text-slate-500">Provider: {currentPatient.nextAppointment.doctor}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            sinnaStore.toastSuccess('Checked In', `${currentPatient.name} marked as Arrived & Checked In.`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                        >
                          Check In Patient
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Past Visit history */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pt-2">Past Clinical Encounters</h5>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{currentPatient.lastVisit?.date || 'Oct 02, 2026 09:30 AM'}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Completed
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{currentPatient.lastVisit?.procedure || 'Routine Oral Health Evaluation & Debridement'}</p>
                          <p className="text-[11px] text-slate-400">Chair 1 · Provider: {currentPatient.lastVisit?.doctor || 'Dr. Senait Tadesse'}</p>
                        </div>
                        <span className="font-mono font-semibold text-emerald-700 self-start sm:self-auto">1,500 ETB Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 4: History */}
            {clinicalSubTab === 'history' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4 text-amber-600" />
                      <span>Clinical Dental Chart History & Diagnostic Findings</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Bole Dental Studio Clinical Archive</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                      <span>Medical Alerts & Allergies</span>
                    </p>
                    <div className="space-y-1 text-slate-700">
                      {currentPatient.allergies.map((a, i) => (
                        <p key={i} className="flex items-center gap-1.5 text-rose-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {a}
                        </p>
                      ))}
                      {currentPatient.systemicDiseases.map((d, i) => (
                        <p key={i} className="flex items-center gap-1.5 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          {d}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-600" />
                      <span>Radiographic & Examination Notes</span>
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {currentPatient.notes || 'Full arch panoramic examination conducted. Generalized marginal gingivitis noted. Good bone crest levels observed throughout posterior quadrants.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 4: ADMINISTRATION (Invoices, Receipts, ETB Ledger) */}
        {/* ------------------------------------------------------------------- */}
        {activeProfileTab === 'administration' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Fiscal Transactions & Receipts (MoR Verified)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">TIN: 0049283711 · Ethiopian Birr (ETB)</p>
                </div>
                <Link
                  href="/payments"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-2xs flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cashier Desk</span>
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Receipt Ref: RCP-2026-0041</p>
                    <p className="text-slate-500">Service: Routine Cleaning & Scaling</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-emerald-700">1,500 ETB</p>
                    <p className="text-slate-400 text-[10px]">CBE Birr POS</p>
                  </div>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Treatment Plan Deposit</p>
                    <p className="text-slate-500">Chapa Online Gateway</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-emerald-700">300 ETB</p>
                    <p className="text-slate-400 text-[10px]">Online Card</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 5: GALLERY (X-Rays & Clinical Radiographs) */}
        {/* ------------------------------------------------------------------- */}
        {activeProfileTab === 'gallery' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Diagnostic Radiographs & Imaging</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">Digital Sensor 2.0 (High Resolution)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-950 p-2 text-center text-xs text-slate-300">
                  <div className="h-44 bg-slate-900 rounded-lg flex items-center justify-center font-mono text-slate-500 text-xs border border-slate-800">
                    [Bitewing Posterior X-Ray]
                  </div>
                  <p className="mt-2 font-semibold text-white">Posterior Right Bitewing</p>
                  <p className="text-[10px] text-slate-400">10/08/2026 · Caries check #16</p>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-950 p-2 text-center text-xs text-slate-300">
                  <div className="h-44 bg-slate-900 rounded-lg flex items-center justify-center font-mono text-slate-500 text-xs border border-slate-800">
                    [IOPA Periapical #36]
                  </div>
                  <p className="mt-2 font-semibold text-white">IOPA Tooth #36 (Endo)</p>
                  <p className="text-[10px] text-slate-400">10/08/2026 · Working length</p>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-950 p-2 text-center text-xs text-slate-300">
                  <div className="h-44 bg-slate-900 rounded-lg flex items-center justify-center font-mono text-slate-500 text-xs border border-slate-800">
                    [Orthopantomogram OPG Full Arch]
                  </div>
                  <p className="mt-2 font-semibold text-white">Panoramic Radiograph (OPG)</p>
                  <p className="text-[10px] text-slate-400">09/15/2026 · Full dentition</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB 6: ACTIVITY (Doctor Clinical Notes Feed - Screenshot 3) */}
        {/* ------------------------------------------------------------------- */}
        {activeProfileTab === 'activity' && (
          <div className="space-y-4">
            {/* Filter Bar & Add Note Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivityFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activityFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() => setActivityFilter('administrative')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    activityFilter === 'administrative'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Administrative</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivityFilter('diagnosis')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    activityFilter === 'diagnosis'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Stethoscope className="w-3 h-3" />
                  <span>Diagnosis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivityFilter('treatment')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    activityFilter === 'treatment'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Pill className="w-3 h-3" />
                  <span>Treatment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivityFilter('plan')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    activityFilter === 'plan'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivityFilter('clinical')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                    activityFilter === 'clinical'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <HeartPulse className="w-3 h-3" />
                  <span>Clinical</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setNewNoteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-2xs self-end sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Administrative note</span>
              </button>
            </div>

            {/* Activity Feed Cards (Exact Match to Screenshot 3) */}
            <div className="space-y-3">
              {filteredNotes.map((note) => {
                const isTreatment = note.category === 'treatment';
                const isDiagnosis = note.category === 'diagnosis';
                const isPlan = note.category === 'plan';
                const isClinical = note.category === 'clinical';

                const borderAccent = isTreatment
                  ? 'border-l-4 border-l-emerald-500'
                  : isDiagnosis
                  ? 'border-l-4 border-l-blue-500'
                  : isPlan
                  ? 'border-l-4 border-l-indigo-500'
                  : isClinical
                  ? 'border-l-4 border-l-rose-500'
                  : 'border-l-4 border-l-slate-400';

                return (
                  <div
                    key={note.id}
                    className={`bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-card transition-shadow ${borderAccent}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {note.authorInitials} · {note.authorName}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isTreatment
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isDiagnosis
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isPlan
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {note.category}
                        </span>

                        {note.procedureTag && (
                          <span className="font-mono text-[11px] text-slate-500">
                            · {note.procedureTag}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">{note.date}</span>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Recall History Trigger (Screenshot 3) */}
            <div className="pt-2">
              <Link
                href="/recalls"
                className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider shadow-2xs flex items-center justify-center gap-2 transition-colors"
              >
                <Bell className="w-4 h-4 text-slate-500" />
                <span>Recall History</span>
              </Link>
            </div>
          </div>
        )}

        {/* Global Modals for Profile View */}
        {bookingModalOpen && (
          <BookingModal
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            onBookingSuccess={(newApt) => {
              sinnaStore.toastSuccess('Appointment Booked', `Slotted for ${newApt.patientName}.`);
              setBookingModalOpen(false);
            }}
          />
        )}

        {/* New Administrative Note Modal */}
        {newNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
              <button
                onClick={() => setNewNoteModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-slate-900 text-base mb-1">
                Add Clinical / Administrative Note
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Record chairside observation for {currentPatient.name}.
              </p>

              <form onSubmit={handleAddNote} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                  >
                    <option value="administrative">Administrative</option>
                    <option value="clinical">Clinical Observation</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="treatment">Treatment Completed</option>
                    <option value="plan">Treatment Plan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Note Content</label>
                  <textarea
                    rows={4}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Enter clinical observations, follow-up recommendations, or patient requests..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewNoteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-2xs"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW B: PATIENT DIRECTORY LIST (Screenshot 1)
  // =========================================================================
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. TOP HEADER: Title + New Patient Button (Screenshot 1) */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Patients
        </h1>

        <button
          type="button"
          onClick={() => setNewPatientModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New patient</span>
        </button>
      </div>

      {/* 2. FILTER STRIP (Screenshot 1: Search, Status, Do-not-contact, With debt, Sort) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Name or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
            />
          </div>

          {/* Status Filter Dropdown Pill */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none pl-6 pr-6 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="active">Status · 1 (Active)</option>
              <option value="all">Status · All</option>
              <option value="archived">Status · Archived</option>
            </select>
            <span className="w-2 h-2 rounded-full bg-sky-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Only do-not-contact toggle */}
          <button
            type="button"
            onClick={() => setOnlyDoNotContact(!onlyDoNotContact)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-2xs ${
              onlyDoNotContact
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BellOff className="w-3.5 h-3.5 text-slate-400" />
            <span>Only do-not-contact</span>
          </button>

          {/* With debt toggle */}
          <button
            type="button"
            onClick={() => setWithDebtOnly(!withDebtOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors shadow-2xs ${
              withDebtOnly
                ? 'bg-amber-600 border-amber-600 text-white font-bold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>With debt</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none pl-6 pr-6 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="last_visit">Last visit</option>
            <option value="name">Name</option>
            <option value="debt">Debt / Balance</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 3. PATIENTS DIRECTORY TABLE / LIST (Exact Match to Screenshot 1) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No patients match the selected filters.
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const initials = patient.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();

              // Formatted name: Surname, First (Matching Sánchez Muñoz, Javier)
              const nameParts = patient.name.split(' ');
              const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
              const firstName = nameParts.slice(0, -1).join(' ');
              const displayName = surname ? `${surname}, ${firstName}` : patient.name;

              return (
                <div
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setActiveProfileTab('summary');
                  }}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Left: Avatar Circle + Name + Phone */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:border-sky-300 group-hover:text-sky-700 transition-colors">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-xs group-hover:text-sky-700 transition-colors truncate">
                          {displayName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-amharic hidden sm:inline">
                          ({patient.nameAmharic})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {patient.phone}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status Pill + Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    {patient.balanceETB > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 hidden sm:inline">
                        {patient.balanceETB.toLocaleString()} ETB
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. NEW PATIENT MODAL */}
      {newPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setNewPatientModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-base mb-1">
              Register New Patient
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create official clinical record and assign BDS-MRN.
            </p>

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tigist Alemu"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name (Amharic)</label>
                  <input
                    type="text"
                    placeholder="e.g. ትዕግስት አለሙ ደስታ"
                    value={newPatientForm.nameAmharic}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, nameAmharic: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-amharic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@gmail.com"
                    value={newPatientForm.email}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subcity & Woreda Address</label>
                <input
                  type="text"
                  placeholder="e.g. Bole Subcity, Woreda 03, House #142"
                  value={newPatientForm.subcity}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, subcity: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allergies (or NKDA)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Nickel allergy"
                  value={newPatientForm.allergies}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Service & Fee selection (allows blank 0 ETB) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-semibold text-slate-700">Initial Clinical Service</label>
                <select
                  value={newPatientForm.serviceId}
                  onChange={(e) => {
                    const srvId = e.target.value;
                    const match = clinic.services.find((s) => s.id === srvId);
                    setNewPatientForm({
                      ...newPatientForm,
                      serviceId: srvId,
                      amountPaidETB: match ? match.depositAmountETB || 0 : 0,
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                >
                  <option value="">[ None / Registration Only · 0 ETB ] (No service fee)</option>
                  {clinic.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameEn} — {s.priceETB.toLocaleString()} ETB
                    </option>
                  ))}
                </select>

                {/* Payment Rail (Desk Editable) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={newPatientForm.paymentMethod}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, paymentMethod: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                    >
                      <option value="none">None / 0 ETB</option>
                      <option value="cash">Cash (Physical Birr)</option>
                      <option value="telebirr">Telebirr POS</option>
                      <option value="cbe_birr">CBE Birr POS</option>
                      <option value="chapa">Chapa Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Amount Paid (ETB)</label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={newPatientForm.amountPaidETB}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, amountPaidETB: Number(e.target.value) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewPatientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-2xs"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
