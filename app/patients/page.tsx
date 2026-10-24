'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  History as HistoryIcon,
  Globe,
  Armchair
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printPatientChart } from '@/lib/smart-print';
import { BookingModal } from '@/components/booking-modal';
import { TreatmentOdontogramChart } from '@/components/treatment-odontogram-chart';
import { TreatmentPlanWorkspace } from '@/components/treatment-plan-workspace';
import { ToothStatus } from '@/lib/types';
import {
  FullPatientProfile,
  PatientActivityNote,
  INITIAL_PATIENTS,
} from '@/lib/initial-patients';

type ProfileTab = 'summary' | 'info' | 'clinical' | 'administration' | 'gallery' | 'activity';
type ClinicalSubTab = 'diagnosis' | 'treatment_plans' | 'appointments' | 'history';

export default function PatientsPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDoctor = isMounted && (store.currentUser?.role === 'doctor' || store.activePersona === 'doctor');

  // Role and Chair Concurrency Guards
  const isOwner = isMounted && Boolean(
    store.currentUser?.role === 'admin' ||
    store.activePersona === 'manager' ||
    sinnaStore.isOwnerState?.()
  );

  const isChair1Busy = Boolean(
    store.chairs.find((c) => c.chairNumber === 1)?.status === 'occupied' ||
    store.appointments.some((a) => a.chairNumber === 1 && a.status === 'in_progress') ||
    (store.pendingSeatingRequest?.chairNumber === 1 && store.pendingSeatingRequest?.status === 'pending')
  );

  const isChair2Busy = Boolean(
    store.chairs.find((c) => c.chairNumber === 2)?.status === 'occupied' ||
    store.appointments.some((a) => a.chairNumber === 2 && a.status === 'in_progress') ||
    (store.pendingSeatingRequest?.chairNumber === 2 && store.pendingSeatingRequest?.status === 'pending')
  );

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

  // Doctor Personal Information Editing State on Summary Card
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNameAmharic, setEditNameAmharic] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAge, setEditAge] = useState<number>(30);
  const [editGender, setEditGender] = useState<'Female' | 'Male'>('Female');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyRel, setEditEmergencyRel] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');

  const handleStartEditPersonalInfo = (p: FullPatientProfile) => {
    if (isOwner) {
      sinnaStore.toastWarning('Action Restricted', 'Owner audit mode: Editing patient demographics is restricted.');
      return;
    }
    setEditName(p.name || '');
    setEditNameAmharic(p.nameAmharic || '');
    setEditPhone(p.phone || '');
    setEditAge(p.age || 30);
    setEditGender(p.gender || 'Female');
    setEditEmergencyName(p.emergencyContact?.name || '');
    setEditEmergencyRel(p.emergencyContact?.relationship || 'Family');
    setEditEmergencyPhone(p.emergencyContact?.phone || '');
    setIsEditingPersonalInfo(true);
  };

  const handleSavePersonalInfo = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            name: editName.trim() || p.name,
            nameAmharic: editNameAmharic.trim() || p.nameAmharic,
            phone: editPhone.trim() || p.phone,
            age: editAge,
            gender: editGender,
            emergencyContact: {
              ...p.emergencyContact,
              name: editEmergencyName.trim() || p.emergencyContact?.name || '',
              relationship: editEmergencyRel.trim() || p.emergencyContact?.relationship || 'Family',
              phone: editEmergencyPhone.trim() || p.emergencyContact?.phone || '',
            },
          };
        }
        return p;
      })
    );
    setIsEditingPersonalInfo(false);
    sinnaStore.toastSuccess('Demographics Saved', `Updated personal demographics for ${editName.trim()}`);
  };

  // Check URL parameters once on initial mount / navigation to auto-select patient from dashboard navigation
  const processedParamRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlPid = params.get('patientId') || params.get('id');

    if (urlPid && processedParamRef.current !== urlPid) {
      processedParamRef.current = urlPid;
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
      const canonicalPid = UPCOMING_ID_MAP[urlPid.toLowerCase()] || urlPid;
      if (isDoctor) {
        setSelectedPatientId(canonicalPid);
        const tab = params.get('tab') as ProfileTab | null;
        if (tab) setActiveProfileTab(tab);
        const ctab = params.get('clinicalTab') as ClinicalSubTab | null;
        if (ctab) setClinicalSubTab(ctab);
      } else {
        // Reception: Keep on directory list, open slide-over drawer, and clean the URL
        setSelectedPatientId(null);
        sinnaStore.openPatientDrawer(canonicalPid);
        // Clean URL search params so closing the drawer never re-triggers an auto-open loop
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    } else if (isDoctor && store.selectedPatientRecordId && store.selectedPatientRecordId !== selectedPatientId) {
      setSelectedPatientId(store.selectedPatientRecordId);
    }
  }, [isDoctor, store.selectedPatientRecordId, selectedPatientId]);

  // Merge store appointments into patients roster so online reservations immediately appear
  const allPatients = useMemo(() => {
    const list = [...patients];
    const apts = Array.isArray(store.appointments) ? store.appointments : [];

    apts.forEach((apt) => {
      const cleanAptPhone = (apt.patientPhone || '').replace(/\D/g, '').slice(-9);
      const exists = list.some((p) => {
        const cleanPPhone = (p.phone || '').replace(/\D/g, '').slice(-9);
        return p.id === apt.id || (cleanAptPhone && cleanPPhone === cleanAptPhone) || p.name.toLowerCase() === apt.patientName.toLowerCase();
      });

      if (!exists) {
        const isOnline = Boolean(apt.isOnlineBooking || apt.source === 'online' || apt.source === 'copilot' || (apt.notes && apt.notes.includes('Online')) || (apt.notes && apt.notes.includes('Booked via')));
        const newProfile: FullPatientProfile = {
          id: apt.id,
          mrn: apt.patientChart?.medicalRecordNumber || apt.patientChart?.cardNo || `BDS-${Math.floor(1000 + Math.random() * 9000)}`,
          name: apt.patientName,
          nameAmharic: apt.patientChart?.fullNameAmharic || apt.patientName,
          phone: apt.patientPhone,
          email: `${apt.patientName.toLowerCase().replace(/\s+/g, '.')}@patient.et`,
          age: apt.patientChart?.age || 30,
          gender: apt.patientChart?.gender || 'Female',
          dob: '01/01/1996 (30 years)',
          status: 'active',
          doNotContact: false,
          subcity: 'Bole Subcity, Woreda 03 (Morning Star Mall vicinity)',
          notes: apt.notes || 'Booked online via Sinna Dental AI patient portal',
          allergies: apt.patientChart?.medicalHistory?.allergies?.length ? apt.patientChart.medicalHistory.allergies : ['No known drug allergies (NKDA)'],
          systemicDiseases: apt.patientChart?.medicalHistory?.systemicDiseases || [],
          currentMedications: apt.patientChart?.medicalHistory?.currentMedications || [],
          specialConditions: isOnline ? ['Online Self-Service Booking (በኦንላይን የተያዘ)', '300 ETB Deposit Verified'] : [],
          emergencyContact: apt.patientChart?.emergencyContact
            ? {
                name: apt.patientChart.emergencyContact.name,
                relationship: apt.patientChart.emergencyContact.relationship,
                phone: apt.patientChart.emergencyContact.phone,
                email: 'contact@patient.et',
              }
            : {
                name: 'Family Contact',
                relationship: 'Emergency Contact',
                phone: apt.patientPhone,
                email: 'contact@patient.et',
              },
          billingName: apt.patientName,
          tin: '0049283711',
          billingEmail: 'billing@patient.et',
          billingAddress: 'Bole Subcity, Addis Ababa',
          activePlanTitle: apt.serviceName,
          activePlanProgress: { completed: 0, total: 1, percent: 0 },
          nextAppointment: {
            date: apt.startsAt ? new Date(apt.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
            time: apt.startsAt ? new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
            doctor: apt.doctorName,
            service: apt.serviceName,
          },
          balanceETB: Math.max(0, (apt.totalDueETB || 1200) - (apt.depositPaidETB || 0)),
          totalPaidETB: apt.depositPaidETB || 0,
          diagnosesUntreated: [apt.serviceName],
          chartNotation: apt.toothChart || {},
          activityNotes: [
            {
              id: `act-online-${apt.id}`,
              authorName: 'Sinna Dental AI',
              authorInitials: 'AI',
              category: 'administrative',
              procedureTag: apt.serviceName,
              date: new Date().toLocaleDateString('en-US'),
              content: `Patient booked online via ${apt.bookedVia || 'Sinna Dental AI Web Portal'}. 300 ETB deposit held via ${(apt.depositMethod || 'telebirr').toUpperCase()}. Appointment ID: ${apt.id}.`,
            },
          ],
        };
        list.unshift(newProfile);
      }
    });

    return list;
  }, [patients, store.appointments]);

  // Synchronize 32-tooth FDI odontogram when switching between patient records
  useEffect(() => {
    if (selectedPatientId) {
      const p = allPatients.find(pat => pat.id === selectedPatientId);
      if (p?.chartNotation) {
        setPatientTeeth({ ...p.chartNotation });
      } else {
        setPatientTeeth({});
      }
      setSelectedTooth(null);
    }
  }, [selectedPatientId, allPatients]);

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
  const [dateTab, setDateTab] = useState<'all' | 'today' | 'tomorrow' | 'yesterday' | 'upcoming' | 'custom'>('all');
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [doctorFilter, setDoctorFilter] = useState<'all' | 'senait' | 'dawit'>(() => isDoctor ? 'senait' : 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [onlyDoNotContact, setOnlyDoNotContact] = useState(false);
  const [withDebtOnly, setWithDebtOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [medicalAlertsOnly, setMedicalAlertsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'last_visit' | 'name' | 'debt' | 'mrn'>('last_visit');

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

  // Selected Patient computation with exhaustive multi-layer fallback & appointment synthesis
  const currentPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    let cleanId = selectedPatientId.trim().toLowerCase();
    const cleanDigits = selectedPatientId.replace(/\D/g, '').slice(-9);

    // Dynamic alias map for synthetic upcoming and legacy appointment IDs
    const UPCOMING_ID_MAP: Record<string, string> = {
      'apt-up-1': 'apt-001', // Tigist Alemu
      'apt-up-2': 'apt-006', // Yonas Getachew
      'apt-up-3': 'apt-005', // Meron Tesfaye
      'apt-up-4': 'apt-002', // Abebe Kebede
      'apt-up-5': 'apt-007', // Bethelhem Desta
      'apt-up-6': 'apt-008', // Samuel Tadesse
      'apt-up-7': 'apt-009', // Almaz Bekele
      'apt-up-8': 'apt-012', // Natnael Girma
      'apt-up-9': 'apt-011', // Rahel Solomon
    };

    if (UPCOMING_ID_MAP[cleanId]) {
      cleanId = UPCOMING_ID_MAP[cleanId].toLowerCase();
    }

    // Check if a name parameter is in window.location.search for direct fallback
    let urlName = '';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      urlName = (urlParams.get('name') || '').trim().toLowerCase();
    }

    // 1. Direct ID match (canonical or alias)
    let match = allPatients.find(
      (p) =>
        p.id === selectedPatientId ||
        p.id.toLowerCase() === cleanId ||
        (UPCOMING_ID_MAP[selectedPatientId.toLowerCase()] &&
          p.id.toLowerCase() === UPCOMING_ID_MAP[selectedPatientId.toLowerCase()])
    );
    if (match) return match;

    // 2. MRN or card number match
    match = allPatients.find(
      (p) => p.mrn === selectedPatientId || p.mrn.toLowerCase() === cleanId
    );
    if (match) return match;

    // 3. Name match (from URL name query param or cleanId)
    if (urlName) {
      match = allPatients.find(
        (p) =>
          p.name.toLowerCase() === urlName ||
          (p.nameAmharic && p.nameAmharic.toLowerCase() === urlName) ||
          p.name.toLowerCase().includes(urlName) ||
          urlName.includes(p.name.toLowerCase())
      );
      if (match) return match;
    }

    match = allPatients.find(
      (p) =>
        p.name.toLowerCase() === cleanId ||
        (p.nameAmharic && p.nameAmharic.toLowerCase() === cleanId) ||
        p.name.toLowerCase().includes(cleanId) ||
        cleanId.includes(p.name.toLowerCase())
    );
    if (match) return match;

    // 4. Phone number match
    if (cleanDigits.length >= 7) {
      match = allPatients.find(
        (p) => (p.phone || '').replace(/\D/g, '').slice(-9) === cleanDigits
      );
      if (match) return match;
    }

    // 5. Look in store.appointments for an appointment with this ID, MRN, phone or name
    const apt = store.appointments.find((a) => {
      const aId = (a.id || '').toLowerCase();
      const aCardNo = (a.patientChart?.cardNo || '').toLowerCase();
      const aMrn = (a.patientChart?.medicalRecordNumber || '').toLowerCase();
      const aName = (a.patientName || '').toLowerCase();
      const aPhone = (a.patientPhone || '').replace(/\D/g, '').slice(-9);

      return (
        aId === cleanId ||
        aCardNo === cleanId ||
        aMrn === cleanId ||
        aName === cleanId ||
        (urlName && aName === urlName) ||
        (cleanDigits.length >= 7 && aPhone === cleanDigits)
      );
    });

    if (apt) {
      // Find matching patient in allPatients by apt phone or name
      const aptCleanDigits = (apt.patientPhone || '').replace(/\D/g, '').slice(-9);
      const foundInAll = allPatients.find(
        (p) =>
          p.id === apt.id ||
          p.mrn === apt.patientChart?.cardNo ||
          p.mrn === apt.patientChart?.medicalRecordNumber ||
          p.name.toLowerCase() === apt.patientName.toLowerCase() ||
          (aptCleanDigits.length >= 7 && (p.phone || '').replace(/\D/g, '').slice(-9) === aptCleanDigits)
      );
      if (foundInAll) return foundInAll;

      // On-the-fly synthesis from appointment so no patient ever displays a blank page
      const isOnline = Boolean(
        apt.isOnlineBooking ||
        apt.source === 'online' ||
        apt.source === 'copilot' ||
        (apt.notes && apt.notes.includes('Online')) ||
        (apt.notes && apt.notes.includes('Booked via'))
      );

      return {
        id: apt.id,
        mrn: apt.patientChart?.medicalRecordNumber || apt.patientChart?.cardNo || (apt.id.startsWith('BDS-') ? apt.id : `BDS-${Math.floor(1000 + Math.random() * 9000)}`),
        name: apt.patientName,
        nameAmharic: apt.patientChart?.fullNameAmharic || apt.patientName,
        phone: apt.patientPhone,
        email: `${apt.patientName.toLowerCase().replace(/\s+/g, '.')}@patient.et`,
        age: apt.patientChart?.age || 30,
        gender: apt.patientChart?.gender || 'Female',
        dob: '01/01/1996 (30 years)',
        status: 'active' as const,
        doNotContact: false,
        subcity: apt.patientChart?.subcityWoreda || 'Bole Subcity, Woreda 03 (Morning Star Mall vicinity)',
        notes: apt.notes || 'Registered clinical patient at Bole Dental Studio',
        allergies: apt.patientChart?.medicalHistory?.allergies?.length ? apt.patientChart.medicalHistory.allergies : ['No known drug allergies (NKDA)'],
        systemicDiseases: apt.patientChart?.medicalHistory?.systemicDiseases || [],
        currentMedications: apt.patientChart?.medicalHistory?.currentMedications || [],
        specialConditions: isOnline ? ['Online Self-Service Booking (በኦንላይን የተያዘ)', '300 ETB Deposit Verified'] : [],
        emergencyContact: apt.patientChart?.emergencyContact
          ? {
              name: apt.patientChart.emergencyContact.name,
              relationship: apt.patientChart.emergencyContact.relationship,
              phone: apt.patientChart.emergencyContact.phone,
              email: 'contact@patient.et',
            }
          : {
              name: 'Family Contact',
              relationship: 'Emergency Contact',
              phone: apt.patientPhone,
              email: 'contact@patient.et',
            },
        billingName: apt.patientName,
        tin: '0049283711',
        billingEmail: 'billing@patient.et',
        billingAddress: 'Bole Subcity, Addis Ababa',
        activePlanTitle: apt.serviceName,
        activePlanProgress: { completed: 0, total: 1, percent: 0 },
        nextAppointment: {
          date: apt.startsAt ? new Date(apt.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
          time: apt.startsAt ? new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
          doctor: apt.doctorName,
          service: apt.serviceName,
        },
        balanceETB: Math.max(0, (apt.totalDueETB || 1200) - (apt.depositPaidETB || 0)),
        totalPaidETB: apt.depositPaidETB || 0,
        diagnosesUntreated: [apt.serviceName],
        chartNotation: apt.toothChart || {},
        activityNotes: [
          {
            id: `act-dyn-${apt.id}`,
            authorName: apt.doctorName || 'Dr. Senait Tadesse',
            authorInitials: 'ST',
            category: 'administrative' as const,
            procedureTag: apt.serviceName,
            date: new Date().toLocaleDateString('en-US'),
            content: `Clinical intake record for ${apt.patientName}. Appointment ID: ${apt.id}.`,
          },
        ],
      };
    }

    // 6. Final safety fallback: If selectedPatientId was passed, never drop the doctor back to directory!
    const synthName = urlName
      ? urlName.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : `Patient ${selectedPatientId}`;
    return {
      id: selectedPatientId,
      mrn: `BDS-${String(Math.floor(1000 + Math.random() * 9000))}`,
      name: synthName,
      nameAmharic: synthName,
      phone: '+251 91 100 0000',
      email: `${synthName.toLowerCase().replace(/\s+/g, '.')}@patient.et`,
      age: 30,
      gender: 'Female' as const,
      dob: '01/01/1996 (30 years)',
      status: 'active' as const,
      doNotContact: false,
      subcity: 'Bole Subcity, Woreda 03, Addis Ababa',
      notes: 'Clinical patient record at Bole Dental Studio',
      allergies: ['No known drug allergies (NKDA)'],
      systemicDiseases: [],
      currentMedications: [],
      specialConditions: [],
      emergencyContact: {
        name: 'Family Contact',
        relationship: 'Emergency Contact',
        phone: '+251 91 100 0000',
        email: 'contact@patient.et',
      },
      billingName: synthName,
      tin: '0049283711',
      billingEmail: 'billing@patient.et',
      billingAddress: 'Bole Subcity, Addis Ababa',
      activePlanTitle: 'Comprehensive Clinical Consultation',
      activePlanProgress: { completed: 0, total: 1, percent: 0 },
      nextAppointment: {
        date: 'Upcoming',
        time: '10:00 AM',
        doctor: 'Dr. Senait Tadesse',
        service: 'Clinical Consultation',
      },
      balanceETB: 0,
      totalPaidETB: 1500,
      diagnosesUntreated: ['Clinical Examination'],
      chartNotation: {},
      activityNotes: [
        {
          id: `act-fallback-${selectedPatientId}`,
          authorName: 'Dr. Senait Tadesse',
          authorInitials: 'ST',
          category: 'clinical' as const,
          date: new Date().toLocaleDateString('en-US'),
          content: `Patient profile opened for ${synthName}.`,
        },
      ],
    };
  }, [allPatients, selectedPatientId, store.appointments]);

  // Active Appointment for current patient (from live clinic appointments)
  const currentAppointment = useMemo(() => {
    if (!currentPatient) return null;
    return (
      store.appointments.find(
        (a) =>
          a.id === currentPatient.id ||
          (a.patientPhone &&
            currentPatient.phone &&
            a.patientPhone.replace(/\s+/g, '') === currentPatient.phone.replace(/\s+/g, '')) ||
          a.patientName.toLowerCase() === currentPatient.name.toLowerCase()
      ) || null
    );
  }, [currentPatient, store.appointments]);

  const assignedChair = useMemo(() => {
    if (!currentAppointment) return 1;
    return (currentAppointment.doctorName && currentAppointment.doctorName.includes('Dawit')) ||
      currentAppointment.chairNumber === 2
      ? 2
      : 1;
  }, [currentAppointment]);

  const assignedDoctorName = assignedChair === 1 ? 'Dr. Senait Tadesse' : 'Dr. Dawit Bekele';
  const otherChair = assignedChair === 1 ? 2 : 1;
  const otherDoctorName = otherChair === 1 ? 'Dr. Senait Tadesse' : 'Dr. Dawit Bekele';

  const isCurrentOnlineBooking = Boolean(
    currentAppointment?.isOnlineBooking ||
      currentAppointment?.source === 'online' ||
      currentAppointment?.source === 'copilot' ||
      (currentAppointment?.notes &&
        (currentAppointment.notes.includes('Online') || currentAppointment.notes.includes('Booked via'))) ||
      currentPatient?.specialConditions?.some((c) => c.includes('Online')) ||
      currentPatient?.notes?.includes('online') ||
      currentPatient?.notes?.includes('Online')
  );

  const currentPatientPlan = useMemo(() => {
    if (!currentPatient) return null;
    return (
      store.treatmentPlans?.find(
        (p) =>
          p.patientId === currentPatient.id ||
          (currentPatient.mrn && p.patientId === currentPatient.mrn) ||
          (p.patientName && p.patientName.toLowerCase() === currentPatient.name.toLowerCase())
      ) || null
    );
  }, [store.treatmentPlans, currentPatient]);

  const currentPatientPlanMonies = useMemo(() => {
    if (!currentPatientPlan) return 0;
    const procSum = currentPatientPlan.procedures?.reduce((sum, p) => sum + (p.feeETB || 0), 0) || 0;
    return procSum > 0 ? procSum : (currentPatientPlan.quoteAmountETB || 0);
  }, [currentPatientPlan]);

  // Helper to resolve dynamic patient visit, doctor assignment, and online status
  const getPatientVisitInfo = (p: FullPatientProfile) => {
    const pPhone = (p.phone || '').replace(/\D/g, '').slice(-9);
    const apt = store.appointments.find((a) => {
      const aPhone = (a.patientPhone || '').replace(/\D/g, '').slice(-9);
      return (
        a.id === p.id ||
        (pPhone && aPhone && pPhone === aPhone) ||
        a.patientName.toLowerCase() === p.name.toLowerCase()
      );
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
    const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

    const aptDate = apt?.startsAt ? apt.startsAt.split('T')[0] : '';
    const nextDateStr = (p.nextAppointment?.date || '').toLowerCase();

    const isToday = Boolean(
      (aptDate && aptDate === todayStr) ||
      apt?.status === 'in_progress' ||
      apt?.status === 'pending_hold' ||
      nextDateStr.includes('today') ||
      ['apt-001', 'apt-002', 'apt-003', 'apt-004', 'apt-005', 'apt-006'].includes(p.id) ||
      ['apt-001', 'apt-002', 'apt-003', 'apt-004', 'apt-005', 'apt-006'].includes(apt?.id || '')
    );

    const isTomorrow = Boolean(
      (aptDate && aptDate === tomorrowStr) ||
      nextDateStr.includes('tomorrow') ||
      p.id.includes('tomorrow') ||
      apt?.id?.includes('tomorrow')
    );

    const isYesterday = Boolean(
      (aptDate && aptDate === yesterdayStr) ||
      (aptDate && aptDate < todayStr) ||
      p.id.includes('yesterday') ||
      p.id.includes('overdue') ||
      p.id.includes('twodaysago') ||
      Boolean(p.lastVisit?.date)
    );

    const isUpcoming = Boolean(
      isTomorrow ||
      (aptDate && aptDate > todayStr) ||
      Boolean(p.nextAppointment?.date)
    );

    const matchesCustom = (cDate: string) => {
      if (!cDate) return true;
      return Boolean(
        (aptDate && aptDate === cDate) ||
        (p.nextAppointment?.date && p.nextAppointment.date.includes(cDate)) ||
        (p.lastVisit?.date && p.lastVisit.date.includes(cDate))
      );
    };

    const doctorName = apt?.doctorName || p.nextAppointment?.doctor || p.lastVisit?.doctor || 'Dr. Senait Tadesse';
    const isSenait = doctorName.toLowerCase().includes('senait') || apt?.chairNumber === 1;
    const isDawit = doctorName.toLowerCase().includes('dawit') || apt?.chairNumber === 2;

    const isOnline = Boolean(
      apt?.isOnlineBooking ||
      apt?.source === 'online' ||
      apt?.source === 'copilot' ||
      p.specialConditions?.some((c) => c.toLowerCase().includes('online')) ||
      p.notes?.toLowerCase().includes('online') ||
      p.notes?.toLowerCase().includes('booked via')
    );

    const hasMedicalAlert = Boolean(
      (p.allergies && p.allergies.some((a) => !a.toLowerCase().includes('no known') && !a.toLowerCase().includes('nkda'))) ||
      (p.systemicDiseases && p.systemicDiseases.length > 0)
    );

    return {
      apt,
      doctorName,
      isSenait,
      isDawit,
      isToday,
      isTomorrow,
      isYesterday,
      isUpcoming,
      matchesCustom,
      isOnline,
      hasMedicalAlert,
      time: apt?.startsAt ? new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : p.nextAppointment?.time || '10:00 AM',
      service: apt?.serviceName || p.nextAppointment?.service || p.activePlanTitle || 'Consultation',
    };
  };

  // Quick statistics for directory header
  const directoryStats = useMemo(() => {
    let totalCount = 0;
    let todayCount = 0;
    let tomorrowCount = 0;
    let onlineCount = 0;
    let debtCount = 0;
    let totalDebtETB = 0;

    allPatients.forEach((p) => {
      const info = getPatientVisitInfo(p);
      // If doctor is logged in, strictly scope to doctor's patients only
      if (isDoctor && !info.isSenait) return;

      totalCount++;
      if (info.isToday) todayCount++;
      if (info.isTomorrow) tomorrowCount++;
      if (info.isOnline) onlineCount++;
      if (p.balanceETB > 0) {
        debtCount++;
        totalDebtETB += p.balanceETB;
      }
    });

    return {
      total: totalCount,
      todayCount,
      tomorrowCount,
      onlineCount,
      debtCount,
      totalDebtETB,
    };
  }, [allPatients, store.appointments, isDoctor]);

  // Filtered directory list
  const filteredPatients = useMemo(() => {
    return allPatients
      .filter((p) => {
        const info = getPatientVisitInfo(p);

        // Doctor Scoping: Doctor can strictly only see their specific patients!
        if (isDoctor) {
          if (!info.isSenait) return false;
        } else {
          // Reception / Owner filter by specialist if chosen
          if (doctorFilter === 'senait' && !info.isSenait) return false;
          if (doctorFilter === 'dawit' && !info.isDawit) return false;
        }

        // Date Tabs
        if (dateTab === 'today' && !info.isToday) return false;
        if (dateTab === 'tomorrow' && !info.isTomorrow) return false;
        if (dateTab === 'yesterday' && !info.isYesterday) return false;
        if (dateTab === 'upcoming' && !info.isUpcoming) return false;
        if (dateTab === 'custom' && !info.matchesCustom(customDate)) return false;

        // Status filter
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;

        // Do not contact filter
        if (onlyDoNotContact && !p.doNotContact) return false;

        // Debt filter (only relevant for reception / owner)
        if (!isDoctor && withDebtOnly && p.balanceETB <= 0) return false;

        // Online bookings filter
        if (onlineOnly && !info.isOnline) return false;

        // Search query across name, amharic, phone, cardNo/MRN, ID, and service
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const cleanQ = q.replace(/\D/g, '');
          const matchName = p.name.toLowerCase().includes(q) || (p.nameAmharic && p.nameAmharic.toLowerCase().includes(q));
          const matchPhone = (p.phone || '').replace(/\D/g, '').includes(cleanQ) || (p.phone || '').toLowerCase().includes(q);
          const matchMrn = (p.mrn || '').toLowerCase().includes(q) || (info.apt?.patientChart?.cardNo || '').toLowerCase().includes(q);
          const matchId = (p.id || '').toLowerCase().includes(q);
          const matchService = (info.service || '').toLowerCase().includes(q) || (p.activePlanTitle || '').toLowerCase().includes(q);

          if (!matchName && !matchPhone && !matchMrn && !matchId && !matchService) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (!isDoctor && sortBy === 'debt') return b.balanceETB - a.balanceETB;
        if (sortBy === 'mrn') return a.mrn.localeCompare(b.mrn);
        return 0; // default last visit / schedule
      });
  }, [
    allPatients,
    dateTab,
    customDate,
    doctorFilter,
    statusFilter,
    onlyDoNotContact,
    withDebtOnly,
    onlineOnly,
    searchQuery,
    sortBy,
    store.appointments,
    isDoctor,
  ]);

  // Handlers
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) return;

    const newId = `apt-${Date.now()}`;
    const newMrn = `BDS-${Math.floor(1000 + Math.random() * 9000)}`;

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
    if (isDoctor) {
      setSelectedPatientId(newId);
      setActiveProfileTab('summary');
    } else {
      setSelectedPatientId(null);
      sinnaStore.openPatientDrawer(newId);
    }

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
  // VIEW A: PATIENT PROFILE VIEW (Screenshots 2, 3, 4, 5) - STRICTLY DOCTOR ONLY!
  // =========================================================================
  if (isDoctor && currentPatient) {
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
              onClick={() => {
                setSelectedPatientId(null);
                if (typeof window !== 'undefined' && window.location.search) {
                  window.history.replaceState({}, '', window.location.pathname);
                }
              }}
              className="rounded-md font-medium inline-flex items-center transition-colors text-xs gap-1.5 text-slate-700 hover:bg-slate-100 active:bg-slate-200 p-1.5 shrink-0 border border-slate-200/80"
              title="Return to patient directory"
            >
              <ArrowLeft className="shrink-0 w-4 h-4" />
            </button>
            <span className="inline-flex items-center justify-center select-none rounded-full align-middle bg-slate-100 size-9 text-xs shrink-0 ring-2 ring-slate-200 text-slate-700 font-bold">
              {initials}
            </span>
            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <h1 className="text-base sm:text-lg text-slate-900 font-semibold truncate">
                  {currentPatient.name}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" aria-label="Active" />
                <span className="text-xs font-semibold text-slate-400 font-amharic hidden sm:inline truncate">
                  ({currentPatient.nameAmharic})
                </span>
                {isCurrentOnlineBooking && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-900 border border-sky-300 shadow-2xs font-amharic">
                    <Globe className="w-3.5 h-3.5 text-sky-600" />
                    <span>በኦንላይን የተያዘ</span>
                    <span className="text-[10px] font-mono bg-sky-200/80 text-sky-950 px-1.5 py-0.2 rounded font-semibold">
                      300 ETB ተከፍሏል
                    </span>
                  </span>
                )}
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

            {/* Quick Contextual Arrival & Operatory Seating Actions (Strictly 1 Action at a Time for Reception) */}
            {currentAppointment && (
              <div className="flex items-center gap-1.5 shrink-0">
                {!isDoctor && (!currentAppointment.status || currentAppointment.status === 'confirmed' || currentAppointment.status === 'pending_hold') && (
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) return;
                      sinnaStore.checkInAppointment(currentAppointment.id);
                      sinnaStore.toastSuccess('Checked In', `${currentPatient.name} moved to Waiting Lounge`);
                    }}
                    className={`rounded-xl font-bold inline-flex items-center transition-all px-3 py-1.5 text-xs gap-1.5 shadow-2xs ${
                      isOwner
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    title={isOwner ? 'Owner audit mode: Patient check-in restricted' : 'Check in patient to clinic waiting lounge'}
                  >
                    <Check className={`w-3.5 h-3.5 ${isOwner ? 'text-slate-400' : 'text-emerald-400'}`} />
                    <span>{isOwner ? 'Check In (Locked)' : 'Check In'}</span>
                  </button>
                )}

                {!isDoctor && currentAppointment.status === 'checked_in' && (
                  <button
                    type="button"
                    disabled={isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)}
                    onClick={() => {
                      if (isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)) return;
                      sinnaStore.requestSeatInChair(currentAppointment.id, assignedChair);
                      sinnaStore.toastSuccess('Seated', `${currentPatient.name} seated in Chair ${assignedChair}`);
                    }}
                    className={`rounded-xl font-bold inline-flex items-center transition-all px-3 py-1.5 text-xs gap-1.5 shadow-2xs ${
                      isOwner
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : assignedChair === 1 && isChair1Busy
                        ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                        : assignedChair === 2 && isChair2Busy
                        ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                        : assignedChair === 1
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    title={
                      isOwner
                        ? 'Owner audit mode: Operatory seating restricted'
                        : assignedChair === 1 && isChair1Busy
                        ? 'Dr. Senait is actively conducting treatment in Chair 1. Cannot seat another patient.'
                        : assignedChair === 2 && isChair2Busy
                        ? 'Chair 2 is currently occupied.'
                        : `Seat in Chair ${assignedChair} with ${assignedDoctorName}`
                    }
                  >
                    <Armchair className="w-3 h-3" />
                    <span>
                      {isOwner
                        ? `Seat Chair ${assignedChair} (Locked)`
                        : assignedChair === 1 && isChair1Busy
                        ? 'Dr. Senait Busy (Chair 1)'
                        : assignedChair === 2 && isChair2Busy
                        ? 'Chair 2 Busy'
                        : `Seat Chair ${assignedChair}`}
                    </span>
                  </button>
                )}

                {currentAppointment.status === 'in_progress' && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <span>In Chair {currentAppointment.chairNumber || 1}</span>
                    </span>
                    <button
                      type="button"
                      disabled={isOwner}
                      onClick={() => {
                        if (isOwner) return;
                        sinnaStore.completeDoctorEncounter(currentAppointment.id, {
                          finalFeeETB: currentPatientPlanMonies > 0 ? currentPatientPlanMonies : currentAppointment.totalDueETB,
                          notes: currentPatientPlan && currentPatientPlan.procedures.length > 0
                            ? `Staged Treatment Plan: ${currentPatientPlan.procedures.map((p) => p.name).join(', ')}. Transferred to reception for cashier checkout.`
                            : 'Procedure completed in chair. Transferred to reception for cashier checkout.',
                        });
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition-all ${
                        isOwner
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-card active:scale-98'
                      }`}
                      title={isOwner ? 'Owner audit mode: Clinical encounter completion restricted' : 'Finish treatment encounter and send patient to cashier desk'}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isOwner ? 'text-slate-400' : 'text-emerald-400'}`} />
                      <span>{isOwner ? 'Done (Locked - Doctor Only)' : `Done → Send to Cashier ${currentPatientPlanMonies > 0 ? `(${currentPatientPlanMonies.toLocaleString()} ETB)` : ''}`}</span>
                    </button>
                  </div>
                )}

                {currentAppointment.status === 'completed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed · Sent to Cashier</span>
                  </span>
                )}
              </div>
            )}

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
                    <button
                      type="button"
                      onClick={() => {
                        setActionsMenuOpen(false);
                        setActiveProfileTab('clinical');
                        setClinicalSubTab('treatment_plans');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-emerald-600" />
                      <span>New Treatment Plan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionsMenuOpen(false);
                        printPatientChart(currentPatient, clinic);
                        sinnaStore.toastSuccess('Chart Ready', `Printing clinical paper chart for ${currentPatient.name}`);
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

          {store.currentUser?.role === 'doctor' && (
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
          )}

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
            {/* Arrival Dispatch Banner (Confirmed / Online Booking) */}
            {currentAppointment && (!currentAppointment.status || currentAppointment.status === 'confirmed' || currentAppointment.status === 'pending_hold') && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent border border-blue-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm">Today&apos;s Appointment Confirmed</h3>
                      {isCurrentOnlineBooking && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 font-amharic">
                          <Globe className="w-3 h-3 text-sky-600" />
                          <span>በኦንላይን የተያዘ (Online Booking)</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {currentAppointment.serviceName} · Assigned to {assignedDoctorName} (Chair {assignedChair})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) return;
                      sinnaStore.checkInAppointment(currentAppointment.id);
                      sinnaStore.toastSuccess('Checked In', `${currentPatient.name} moved to Waiting Lounge`);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                      isOwner
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    title={isOwner ? 'Owner audit mode: Patient check-in restricted' : 'Check In to Waiting Lounge'}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isOwner ? 'Check In (Locked)' : 'Check In to Waiting Lounge'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)}
                    onClick={() => {
                      if (isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)) return;
                      sinnaStore.requestSeatInChair(currentAppointment.id, assignedChair);
                      sinnaStore.toastSuccess('Seated', `${currentPatient.name} seated in Chair ${assignedChair}`);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                      isOwner
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : assignedChair === 1 && isChair1Busy
                        ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                        : assignedChair === 2 && isChair2Busy
                        ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                        : assignedChair === 1
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    title={
                      isOwner
                        ? 'Owner audit mode: Operatory seating restricted'
                        : assignedChair === 1 && isChair1Busy
                        ? 'Dr. Senait is actively conducting treatment in Chair 1.'
                        : assignedChair === 2 && isChair2Busy
                        ? 'Chair 2 is currently occupied.'
                        : `Seat in Chair ${assignedChair}`
                    }
                  >
                    <span>
                      {isOwner
                        ? `Seat in Chair ${assignedChair} (Locked)`
                        : assignedChair === 1 && isChair1Busy
                        ? 'Dr. Senait Busy (Chair 1)'
                        : assignedChair === 2 && isChair2Busy
                        ? 'Chair 2 Busy'
                        : `Seat in Chair ${assignedChair}`}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) return;
                      sinnaStore.reassignDoctorAndChair(currentAppointment.id, otherDoctorName, otherChair);
                    }}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
                      isOwner
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title={isOwner ? 'Owner audit mode: Operatory reassignment restricted' : `Switch to Chair ${otherChair} (${otherDoctorName})`}
                  >
                    Change to Chair {otherChair}
                  </button>
                </div>
              </div>
            )}

            {/* Waiting Lounge Dispatch Banner */}
            {currentAppointment && currentAppointment.status === 'checked_in' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-300 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Patient Waiting in Reception Lounge</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {currentAppointment.serviceName} · Ready to seat with {assignedDoctorName} in Chair {assignedChair}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)}
                    onClick={() => {
                      if (isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)) return;
                      sinnaStore.requestSeatInChair(currentAppointment.id, assignedChair);
                      sinnaStore.toastSuccess('Seated', `${currentPatient.name} seated in Chair ${assignedChair}`);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
                      isOwner
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : assignedChair === 1 && isChair1Busy
                        ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                        : assignedChair === 2 && isChair2Busy
                        ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                        : assignedChair === 1
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    title={
                      isOwner
                        ? 'Owner audit mode: Operatory seating restricted'
                        : assignedChair === 1 && isChair1Busy
                        ? 'Dr. Senait is actively conducting treatment in Chair 1.'
                        : assignedChair === 2 && isChair2Busy
                        ? 'Chair 2 is currently occupied.'
                        : `Seat in Chair ${assignedChair}`
                    }
                  >
                    <span>
                      {isOwner
                        ? `Seat in Chair ${assignedChair} (Locked)`
                        : assignedChair === 1 && isChair1Busy
                        ? 'Dr. Senait Busy (Chair 1)'
                        : assignedChair === 2 && isChair2Busy
                        ? 'Chair 2 Busy'
                        : `Seat in Chair ${assignedChair} (${assignedChair === 1 ? 'Dr. Senait' : 'Dr. Dawit'})`}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) return;
                      sinnaStore.reassignDoctorAndChair(currentAppointment.id, otherDoctorName, otherChair);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-2xs ${
                      isOwner
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title={isOwner ? 'Owner audit mode: Operatory reassignment restricted' : `Switch to Chair ${otherChair} (${otherDoctorName})`}
                  >
                    Change to Chair {otherChair}
                  </button>
                </div>
              </div>
            )}

            {/* In-Chair Active Session Banner */}
            {currentAppointment && currentAppointment.status === 'in_progress' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-2 border-emerald-400/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Armchair className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">
                        Patient Active in Chair {currentAppointment.chairNumber || 1}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>In Treatment</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {currentAppointment.serviceName} · Lead Doctor: {assignedDoctorName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) return;
                      sinnaStore.completeDoctorEncounter(currentAppointment.id, {
                        finalFeeETB: currentPatientPlanMonies > 0 ? currentPatientPlanMonies : currentAppointment.totalDueETB,
                        notes: currentPatientPlan && currentPatientPlan.procedures.length > 0
                          ? `Staged Treatment Plan: ${currentPatientPlan.procedures.map((p) => p.name).join(', ')}. Transferred to reception for cashier checkout.`
                          : 'Procedure completed in chair. Transferred to reception for cashier checkout.',
                      });
                    }}
                    title={isOwner ? 'Owner audit view: Doctor clinical actions restricted' : 'Complete treatment and send to cashier'}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
                      isOwner
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isOwner ? 'text-slate-400' : 'text-emerald-400'}`} />
                    <span>{isOwner ? 'Done (Locked - Doctor Only)' : `Done → Send to Cashier ${currentPatientPlanMonies > 0 ? `(${currentPatientPlanMonies.toLocaleString()} ETB)` : ''}`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Completed & Sent to Cashier Banner (Hidden for Doctor role - only for Reception/Cashier checkout) */}
            {currentAppointment && (currentAppointment.status === 'completed' || currentAppointment.seatingStatus === 'sent_to_cashier') && store.currentUser.role !== 'doctor' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900">Encounter Completed · Transferred to Cashier Desk</span>
                    <p className="text-[11px] text-emerald-700">Patient account transferred to reception for MoR fiscal invoice &amp; receipt checkout.</p>
                  </div>
                </div>
                <Link
                  href="/invoices"
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs shrink-0"
                >
                  View Invoices
                </Link>
              </div>
            )}

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
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProfileTab('clinical');
                      setClinicalSubTab('treatment_plans');
                    }}
                    className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between group"
                  >
                    <span>Open plan</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Card 2: NEXT APPOINTMENT */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Next Appointment</span>
                    </div>
                    {currentAppointment && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        currentAppointment.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : currentAppointment.status === 'checked_in'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {currentAppointment.status === 'in_progress' ? 'In Chair' : currentAppointment.status === 'checked_in' ? 'Waiting' : 'Confirmed'}
                      </span>
                    )}
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
                        {currentPatient.nextAppointment.doctor} · Chair {assignedChair}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No upcoming appointments</p>
                  )}

                  {/* Inline Quick Action Buttons for Appointment (Reception Only: Strictly 1 Button at a Time) */}
                  {!isDoctor && currentAppointment && (currentAppointment.status === 'confirmed' || currentAppointment.status === 'pending_hold') && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={isOwner}
                        onClick={() => {
                          if (isOwner) return;
                          sinnaStore.checkInAppointment(currentAppointment.id);
                          sinnaStore.toastSuccess('Checked In', `${currentPatient.name} moved to Waiting Lounge`);
                        }}
                        title={isOwner ? 'Owner audit view: Reception actions restricted' : 'Check In patient'}
                        className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition-colors text-center shadow-2xs flex items-center justify-center gap-1.5 ${
                          isOwner
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${isOwner ? 'text-slate-400' : 'text-emerald-400'}`} />
                        <span>{isOwner ? 'Check In (Locked)' : 'Check In'}</span>
                      </button>
                    </div>
                  )}

                  {!isDoctor && currentAppointment && currentAppointment.status === 'checked_in' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)}
                        onClick={() => {
                          if (isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)) return;
                          sinnaStore.requestSeatInChair(currentAppointment.id, assignedChair);
                          sinnaStore.toastSuccess('Seated', `${currentPatient.name} seated in Chair ${assignedChair}`);
                        }}
                        title={
                          isOwner
                            ? 'Owner audit view: Seating dispatch restricted'
                            : (assignedChair === 1 && isChair1Busy)
                            ? 'Dr. Senait is currently conducting another patient in Chair 1'
                            : (assignedChair === 2 && isChair2Busy)
                            ? 'Chair 2 is currently occupied'
                            : `Seat patient in Chair ${assignedChair}`
                        }
                        className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-colors text-center shadow-2xs flex items-center justify-center gap-1.5 ${
                          isOwner || (assignedChair === 1 ? isChair1Busy : isChair2Busy)
                            ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                            : assignedChair === 1
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Armchair className="w-3.5 h-3.5" />
                        <span>
                          {isOwner
                            ? `Seat Chair ${assignedChair} (Locked)`
                            : (assignedChair === 1 && isChair1Busy)
                            ? 'Dr. Senait Busy (Chair 1)'
                            : (assignedChair === 2 && isChair2Busy)
                            ? 'Chair 2 Busy'
                            : `Seat Chair ${assignedChair}`}
                        </span>
                      </button>
                    </div>
                  )}

                  {currentAppointment && currentAppointment.status === 'in_progress' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isOwner}
                        onClick={() => {
                          if (isOwner) return;
                          sinnaStore.completeDoctorEncounter(currentAppointment.id, {
                            notes: 'Treatment finished in chair. Dispatched to reception cashier.',
                          });
                        }}
                        title={isOwner ? 'Owner audit view: Doctor clinical actions restricted' : 'Done → Send to Cashier'}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                          isOwner
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isOwner ? 'text-slate-400' : 'text-emerald-400'}`} />
                        <span>{isOwner ? 'Done (Locked - Doctor Only)' : 'Done → Send to Cashier'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) return;
                      setBookingModalOpen(true);
                    }}
                    title={isOwner ? 'Owner audit view: Appointment booking restricted' : 'Schedule appointment'}
                    className={`w-full text-xs font-semibold flex items-center justify-between group ${
                      isOwner ? 'text-slate-400 cursor-not-allowed' : 'text-sky-600 hover:text-sky-700'
                    }`}
                  >
                    <span>{isOwner ? 'Schedule appointment (Locked)' : 'Schedule appointment'}</span>
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

              {/* Card 4: BALANCE (Reception/Cashier/Owner) OR PERSONAL INFORMATION (Doctor) */}
              {store.currentUser.role === 'doctor' ? (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Personal Information</span>
                      </div>
                      {!isEditingPersonalInfo ? (
                        <button
                          type="button"
                          onClick={() => handleStartEditPersonalInfo(currentPatient)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      ) : null}
                    </div>

                    {!isEditingPersonalInfo ? (
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{currentPatient.name}</p>
                          <p className="text-[11px] text-slate-500 font-amharic mt-0.5">
                            {currentPatient.nameAmharic || '—'}
                          </p>
                        </div>

                        <div className="pt-1.5 space-y-1 border-t border-slate-100 text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Phone:</span>
                            <span className="font-mono font-semibold text-slate-900">{currentPatient.phone}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Age / Gender:</span>
                            <span className="font-medium text-slate-900">{currentPatient.age} yrs · {currentPatient.gender}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Emergency:</span>
                            <span className="font-medium text-slate-900 truncate max-w-[150px]">
                              {currentPatient.emergencyContact?.name ? `${currentPatient.emergencyContact.name} (${currentPatient.emergencyContact.relationship || 'Family'})` : 'None listed'}
                            </span>
                          </div>
                          {currentPatient.emergencyContact?.phone && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Emergency Phone:</span>
                              <span className="font-mono text-slate-700 text-[11px]">{currentPatient.emergencyContact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs animate-fadeIn">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Name (English)</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Name (Amharic)</label>
                          <input
                            type="text"
                            value={editNameAmharic}
                            onChange={(e) => setEditNameAmharic(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-amharic"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Phone</label>
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Age</label>
                              <input
                                type="number"
                                value={editAge}
                                onChange={(e) => setEditAge(parseInt(e.target.value, 10) || 30)}
                                className="w-full px-1.5 py-1 text-xs rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Gen</label>
                              <select
                                value={editGender}
                                onChange={(e) => setEditGender(e.target.value as 'Female' | 'Male')}
                                className="w-full px-1 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                              >
                                <option value="Female">F</option>
                                <option value="Male">M</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="pt-1 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsEditingPersonalInfo(false)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSavePersonalInfo(currentPatient.id)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditingPersonalInfo && (
                    <div className="pt-3 border-t border-slate-100 mt-3">
                      <button
                        type="button"
                        onClick={() => setActiveProfileTab('info')}
                        className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center justify-between group"
                      >
                        <span>Full registration demographics</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
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
              )}

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
                    onClick={() => {
                      setActiveProfileTab('clinical');
                      setClinicalSubTab('diagnosis');
                    }}
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

            {/* Sub-tab 1: Diagnosis (32-Tooth FDI Anatomic Odontogram, Tooth Inspector, Procedure Grid, Clinical Notes) */}
            {clinicalSubTab === 'diagnosis' && (
              <div className="space-y-4">
                {/* Active In-Chair Session Bar */}
                {currentAppointment && currentAppointment.status === 'in_progress' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-2 border-emerald-400/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Armchair className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            Chair {currentAppointment.chairNumber || 1} Active Operatory Session · {currentPatient.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>In Treatment</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Procedure: <strong>{currentAppointment.serviceName}</strong> · Lead Doctor: {assignedDoctorName}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sinnaStore.completeDoctorEncounter(currentAppointment.id, {
                          finalFeeETB: currentPatientPlanMonies > 0 ? currentPatientPlanMonies : currentAppointment.totalDueETB,
                          notes: currentPatientPlan && currentPatientPlan.procedures.length > 0
                            ? `Staged Treatment Plan: ${currentPatientPlan.procedures.map((p) => p.name).join(', ')}. Clinical charting and diagnosis completed. Patient transferred to reception cashier desk.`
                            : 'Clinical charting and diagnosis completed. Patient transferred to reception cashier desk.',
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Done → Send to Cashier {currentPatientPlanMonies > 0 ? `(${currentPatientPlanMonies.toLocaleString()} ETB)` : ''}</span>
                    </button>
                  </div>
                )}

                {/* Completed & Sent to Cashier Banner (Hidden for Doctor role) */}
                {currentAppointment && (currentAppointment.status === 'completed' || currentAppointment.seatingStatus === 'sent_to_cashier') && store.currentUser.role !== 'doctor' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-900">Treatment Completed · Dispatched to Cashier Desk</span>
                        <p className="text-[11px] text-emerald-700">Patient chart archived for this visit. Reception cashier bill is ready.</p>
                      </div>
                    </div>
                    <Link
                      href="/invoices"
                      className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs shrink-0"
                    >
                      View MoR Invoices
                    </Link>
                  </div>
                )}

                <TreatmentPlanWorkspace
                  viewMode="diagnosis"
                  hideHeaderBanner={true}
                  patientId={currentPatient.id}
                  patientName={currentPatient.name}
                  patientMrn={currentPatient.mrn}
                  patientPhone={currentPatient.phone}
                  activePlanTitle={currentPatient.activePlanTitle}
                  activePlanProgress={currentPatient.activePlanProgress}
                  balanceETB={currentPatient.balanceETB}
                  totalPaidETB={currentPatient.totalPaidETB}
                  chartNotation={currentPatient.chartNotation}
                  diagnosesUntreated={currentPatient.diagnosesUntreated}
                  activityNotes={currentPatient.activityNotes}
                />
              </div>
            )}

            {/* Sub-tab 2: Treatment plans (Staged Protocol Roadmap, Procedures Ledger, Live ETB Totals, Quotes & Fiscal Invoices) */}
            {clinicalSubTab === 'treatment_plans' && (
              <div className="space-y-4">
                {/* Active In-Chair Session Bar */}
                {currentAppointment && currentAppointment.status === 'in_progress' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-2 border-emerald-400/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Armchair className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            Chair {currentAppointment.chairNumber || 1} Active Operatory Session · {currentPatient.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>In Treatment</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Procedure: <strong>{currentAppointment.serviceName}</strong> · Lead Doctor: {assignedDoctorName}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sinnaStore.completeDoctorEncounter(currentAppointment.id, {
                          finalFeeETB: currentPatientPlanMonies > 0 ? currentPatientPlanMonies : currentAppointment.totalDueETB,
                          notes: currentPatientPlan && currentPatientPlan.procedures.length > 0
                            ? `Staged Treatment Plan: ${currentPatientPlan.procedures.map((p) => p.name).join(', ')}. Clinical treatment plan completed. Patient transferred to reception cashier desk.`
                            : 'Clinical treatment plan and encounter completed. Patient transferred to reception cashier desk.',
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98 shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Done → Send to Cashier {currentPatientPlanMonies > 0 ? `(${currentPatientPlanMonies.toLocaleString()} ETB)` : ''}</span>
                    </button>
                  </div>
                )}

                {/* Completed & Sent to Cashier Banner (Hidden for Doctor role) */}
                {currentAppointment && (currentAppointment.status === 'completed' || currentAppointment.seatingStatus === 'sent_to_cashier') && store.currentUser.role !== 'doctor' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-emerald-900">Treatment Completed · Dispatched to Cashier Desk</span>
                        <p className="text-[11px] text-emerald-700">Patient chart archived for this visit. Reception cashier bill is ready.</p>
                      </div>
                    </div>
                    <Link
                      href="/invoices"
                      className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs shrink-0"
                    >
                      View MoR Invoices
                    </Link>
                  </div>
                )}

                <TreatmentPlanWorkspace
                  viewMode="treatment_plans"
                  hideHeaderBanner={true}
                  patientId={currentPatient.id}
                  patientName={currentPatient.name}
                  patientMrn={currentPatient.mrn}
                  patientPhone={currentPatient.phone}
                  activePlanTitle={currentPatient.activePlanTitle}
                  activePlanProgress={currentPatient.activePlanProgress}
                  balanceETB={currentPatient.balanceETB}
                  totalPaidETB={currentPatient.totalPaidETB}
                  chartNotation={currentPatient.chartNotation}
                  diagnosesUntreated={currentPatient.diagnosesUntreated}
                  activityNotes={currentPatient.activityNotes}
                />
              </div>
            )}

            {/* Sub-tab 2: Appointments */}
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
                disabled={isOwner}
                onClick={() => {
                  if (isOwner) return;
                  setNewNoteModalOpen(true);
                }}
                title={isOwner ? 'Owner audit view: Adding clinical notes restricted' : 'Add administrative note'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs self-end sm:self-auto transition-colors ${
                  isOwner
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isOwner ? 'Administrative note (Locked)' : 'Administrative note'}</span>
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
      {/* Owner Oversight Mode Banner */}
      {isOwner && (
        <div className="p-3 bg-amber-500/10 border border-amber-300/80 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">Owner Oversight Mode Active</span>
            <span className="text-amber-700">· Read-only directory audit view. Patient registration and chart modifications restricted.</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-bold uppercase tracking-wider text-amber-800 border border-amber-300">
            Audit Only
          </span>
        </div>
      )}

      {/* 1. TOP HEADER: Title + New Patient Button (Reception Only) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Patients
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
          </span>
        </div>

        {/* New patient button: STRICTLY for Reception Desk only! Not shown for Doctors or Owner */}
        {!isDoctor && !isOwner && (
          <button
            type="button"
            onClick={() => setNewPatientModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New patient</span>
          </button>
        )}
      </div>

      {/* 2. DYNAMIC CLINICAL PULSE STAT CARDS (Slick Mint / Teal Operatory Palette) */}
      <div className={`grid gap-3 ${isDoctor ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {/* All Directory */}
        <button
          type="button"
          onClick={() => {
            setDateTab('all');
            setOnlineOnly(false);
            setWithDebtOnly(false);
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            dateTab === 'all' && !onlineOnly && !withDebtOnly
              ? 'bg-gradient-to-br from-[#E6FAF2] via-[#EDFDF7] to-[#F2FCF8] border-[#34D399] ring-2 ring-emerald-400/30 shadow-card'
              : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-semibold ${dateTab === 'all' && !onlineOnly && !withDebtOnly ? 'text-emerald-950 font-bold' : 'text-slate-500'}`}>
              All Directory
            </span>
            {dateTab === 'all' && !onlineOnly && !withDebtOnly ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            ) : (
              <Users className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {directoryStats.total}
          </div>
          <p className={`text-[10px] mt-0.5 truncate ${dateTab === 'all' && !onlineOnly && !withDebtOnly ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
            Master Patient Records
          </p>
        </button>

        {/* Scheduled Today */}
        <button
          type="button"
          onClick={() => setDateTab('today')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            dateTab === 'today'
              ? 'bg-gradient-to-br from-[#E6FAF2] via-[#EDFDF7] to-[#F2FCF8] border-[#34D399] ring-2 ring-emerald-400/30 shadow-card'
              : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-semibold ${dateTab === 'today' ? 'text-emerald-950 font-bold' : 'text-slate-500'}`}>
              Visiting Today
            </span>
            {dateTab === 'today' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            ) : (
              <Calendar className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {directoryStats.todayCount}
          </div>
          <p className={`text-[10px] mt-0.5 truncate ${dateTab === 'today' ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
            Live Chairs & Waiting
          </p>
        </button>

        {/* Scheduled Tomorrow */}
        <button
          type="button"
          onClick={() => setDateTab('tomorrow')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            dateTab === 'tomorrow'
              ? 'bg-gradient-to-br from-[#E6FAF2] via-[#EDFDF7] to-[#F2FCF8] border-[#34D399] ring-2 ring-emerald-400/30 shadow-card'
              : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-semibold ${dateTab === 'tomorrow' ? 'text-emerald-950 font-bold' : 'text-slate-500'}`}>
              Visiting Tomorrow
            </span>
            {dateTab === 'tomorrow' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            ) : (
              <Clock className="w-4 h-4 text-sky-600" />
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {directoryStats.tomorrowCount}
          </div>
          <p className={`text-[10px] mt-0.5 truncate ${dateTab === 'tomorrow' ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
            Upcoming Appointments
          </p>
        </button>

        {/* Online Bookings */}
        <button
          type="button"
          onClick={() => setOnlineOnly(!onlineOnly)}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            onlineOnly
              ? 'bg-gradient-to-br from-[#E6FAF2] via-[#EDFDF7] to-[#F2FCF8] border-[#34D399] ring-2 ring-emerald-400/30 shadow-card'
              : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-semibold ${onlineOnly ? 'text-emerald-950 font-bold' : 'text-slate-500'}`}>
              Online Bookings
            </span>
            {onlineOnly ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            ) : (
              <Globe className="w-4 h-4 text-indigo-600" />
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {directoryStats.onlineCount}
          </div>
          <p className={`text-[10px] mt-0.5 truncate ${onlineOnly ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
            300 ETB Deposit Hold
          </p>
        </button>

        {/* Outstanding Debt: Only shown for Reception and Owner */}
        {!isDoctor && (
          <button
            type="button"
            onClick={() => setWithDebtOnly(!withDebtOnly)}
            className={`p-3.5 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
              withDebtOnly
                ? 'bg-gradient-to-br from-[#E6FAF2] via-[#EDFDF7] to-[#F2FCF8] border-[#34D399] ring-2 ring-emerald-400/30 shadow-card'
                : 'bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-semibold ${withDebtOnly ? 'text-emerald-950 font-bold' : 'text-slate-500'}`}>
                With Balance
              </span>
              {withDebtOnly ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              ) : (
                <Wallet className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {directoryStats.totalDebtETB.toLocaleString()} <span className="text-xs font-sans font-medium text-slate-500">ETB</span>
            </div>
            <p className={`text-[10px] mt-0.5 truncate ${withDebtOnly ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
              {directoryStats.debtCount} Patients with Debt
            </p>
          </button>
        )}
      </div>

      {/* 3. DATE / VISIT FILTER TABS */}
      <div className="bg-white p-1.5 border border-slate-200/90 rounded-2xl shadow-2xs flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            type="button"
            onClick={() => setDateTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              dateTab === 'all'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Patients</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${dateTab === 'all' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {directoryStats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDateTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              dateTab === 'today'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Today</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${dateTab === 'today' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              {directoryStats.todayCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDateTab('tomorrow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              dateTab === 'tomorrow'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tomorrow</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${dateTab === 'tomorrow' ? 'bg-emerald-700 text-white' : 'bg-sky-100 text-sky-800'}`}>
              {directoryStats.tomorrowCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDateTab('yesterday')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              dateTab === 'yesterday'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Yesterday / Past</span>
          </button>

          <button
            type="button"
            onClick={() => setDateTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              dateTab === 'upcoming'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Upcoming</span>
          </button>
        </div>

        {/* Custom Random Day Date Picker */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-all ${
            dateTab === 'custom'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-300'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}>
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateTab('custom');
              }}
              title="Filter by any specific appointment date"
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. MULTI-FILTER STRIP & SEARCH */}
      <div className="bg-white p-3 border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
            {/* Search Input across name, phone, card-number */}
            <div className="relative w-64 sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-sky-500 shadow-2xs transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Doctor Scoping: Reception / Owner filter dropdown only. Doctor is automatically locked to his/her patients */}
            {!isDoctor && (
              <div className="relative">
                <select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value as any)}
                  className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs cursor-pointer focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="all">Specialist: All Doctors</option>
                  <option value="senait">Dr. Senait Tadesse (Chair 1)</option>
                  <option value="dawit">Dr. Dawit Bekele (Chair 2)</option>
                </select>
                <Stethoscope className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="appearance-none pl-6 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs cursor-pointer focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="active">Status · Active</option>
                <option value="all">Status · All</option>
                <option value="archived">Status · Archived</option>
              </select>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none pl-7 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs cursor-pointer focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="last_visit">Sort · Last visit / schedule</option>
              <option value="name">Sort · Patient Name (A-Z)</option>
              <option value="mrn">Sort · Card / BDS MRN</option>
              {!isDoctor && <option value="debt">Sort · Balance / Debt (High to Low)</option>}
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Multi-Filter Fast Toggle Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Filter by:
            </span>

            {/* Online Bookings Filter Toggle */}
            <button
              type="button"
              onClick={() => setOnlineOnly(!onlineOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                onlineOnly
                  ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Globe className={`w-3.5 h-3.5 ${onlineOnly ? 'text-white' : 'text-indigo-600'}`} />
              <span>Online Bookings</span>
            </button>

            {/* With Debt Toggle: Reception & Owner Only */}
            {!isDoctor && (
              <button
                type="button"
                onClick={() => setWithDebtOnly(!withDebtOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                  withDebtOnly
                    ? 'bg-amber-600 border-amber-600 text-white font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Wallet className={`w-3.5 h-3.5 ${withDebtOnly ? 'text-white' : 'text-amber-500'}`} />
                <span>With Debt</span>
              </button>
            )}

            {/* Do-Not-Contact Toggle */}
            <button
              type="button"
              onClick={() => setOnlyDoNotContact(!onlyDoNotContact)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
                onlyDoNotContact
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BellOff className={`w-3.5 h-3.5 ${onlyDoNotContact ? 'text-white' : 'text-slate-400'}`} />
              <span>Only do-not-contact</span>
            </button>
          </div>

          {/* Reset Filters Shortcut */}
          {(searchQuery || dateTab !== 'all' || onlineOnly || (!isDoctor && withDebtOnly) || onlyDoNotContact || statusFilter !== 'active' || (!isDoctor && doctorFilter !== 'all')) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDateTab('all');
                setOnlineOnly(false);
                setWithDebtOnly(false);
                setOnlyDoNotContact(false);
                setStatusFilter('active');
                if (!isDoctor) setDoctorFilter('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. PATIENTS DIRECTORY TABLE / LIST */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredPatients.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                No patients match the selected filters
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try resetting your date tab or clearing search keywords.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDateTab('all');
                  setOnlineOnly(false);
                  setWithDebtOnly(false);
                  setOnlyDoNotContact(false);
                  setStatusFilter('active');
                  if (!isDoctor) setDoctorFilter('all');
                }}
                className="mt-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-2xs transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const initials = patient.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();

              const nameParts = patient.name.split(' ');
              const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
              const firstName = nameParts.slice(0, -1).join(' ');
              const displayName = surname ? `${surname}, ${firstName}` : patient.name;

              const activeApt = store.appointments.find(
                (a) => a.id === patient.id || a.patientName.toLowerCase() === patient.name.toLowerCase()
              );
              const isCancelled = activeApt?.seatingStatus === 'cancelled_by_doctor';
              const isInChair = activeApt?.status === 'in_progress' || (activeApt?.chairNumber && activeApt?.chairNumber > 0);
              const isWaiting = activeApt?.status === 'pending_hold' || activeApt?.seatingStatus === 'requested';

              const info = getPatientVisitInfo(patient);

              return (
                <div
                  key={patient.id}
                  onClick={() => {
                    if (isDoctor) {
                      setSelectedPatientId(patient.id);
                      setActiveProfileTab('summary');
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', `?patientId=${encodeURIComponent(patient.id)}`);
                      }
                    } else {
                      sinnaStore.openPatientDrawer(patient.id);
                    }
                  }}
                  className={`p-4 flex items-center justify-between transition-colors cursor-pointer group ${
                    isCancelled
                      ? 'bg-rose-50/50 hover:bg-rose-50/80 border-l-4 border-l-rose-500'
                      : 'hover:bg-slate-50/70'
                  }`}
                  title={isDoctor ? "Click to view detailed personal profile and clinical chart" : "Click to view patient details & quick actions"}
                >
                  {/* Left: Avatar + Primary Info + BDS MRN */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full border font-bold text-xs flex items-center justify-center transition-colors shadow-2xs ${
                        isCancelled
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : 'bg-slate-100 border-slate-200 text-slate-700 group-hover:border-sky-300 group-hover:text-sky-700'
                      }`}>
                        {initials}
                      </div>

                      {/* Live Chair / Waiting indicator beacon */}
                      {isInChair && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white animate-pulse" title="Currently seated in chair" />
                      )}
                      {!isInChair && isWaiting && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" title="Checked in / Waiting in reception" />
                      )}
                      {!isInChair && !isWaiting && info.isOnline && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-500 rounded-full ring-2 ring-white" title="Online reservation" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-xs transition-colors truncate ${
                          isCancelled ? 'text-rose-600 font-bold group-hover:text-rose-700' : 'text-slate-900 group-hover:text-sky-700'
                        }`}>
                          {displayName}
                        </p>
                        {patient.nameAmharic && (
                          <span className="text-[10px] text-slate-400 font-amharic hidden sm:inline">
                            ({patient.nameAmharic})
                          </span>
                        )}
                        <span className="font-mono text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                          {patient.mrn || 'BDS-00000'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                        <span>{patient.phone}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-sans text-[11px] text-slate-400">{patient.age}y · {patient.gender}</span>
                        {info.service && (
                          <>
                            <span className="text-slate-300 hidden md:inline">·</span>
                            <span className="font-sans text-[11px] text-slate-600 truncate max-w-[160px] hidden md:inline">
                              {info.service}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Clean Essential Badges Only (Schedule & Online, No fluff) + Chevron */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
                    {/* Live Cancelled Notice */}
                    {isCancelled && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        Cancelled Seating
                      </span>
                    )}

                    {/* Schedule / Visit Badge */}
                    {info.isToday ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>Today {info.time}</span>
                      </span>
                    ) : info.isTomorrow ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-300 flex items-center gap-1 shadow-2xs">
                        <Clock className="w-3 h-3 text-sky-600" />
                        <span>Tomorrow {info.time}</span>
                      </span>
                    ) : info.isUpcoming ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 hidden md:flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Upcoming</span>
                      </span>
                    ) : null}

                    {/* Online Reservation Badge */}
                    {info.isOnline && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1 shadow-2xs font-amharic hidden sm:inline-flex">
                        <Globe className="w-3 h-3 text-indigo-600" />
                        <span>በኦንላይን የተያዘ (300 ETB)</span>
                      </span>
                    )}

                    {/* Debt / Balance Badge: ONLY shown for Reception & Owner */}
                    {!isDoctor && patient.balanceETB > 0 && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs">
                        {patient.balanceETB.toLocaleString()} ETB Due
                      </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
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
              Create official clinical record and assign BDS Card No.
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
