'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CalendarDays,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Plus,
  Armchair,
  Check,
  Phone,
  CreditCard,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Globe,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Building2,
  DollarSign,
  User,
  Package,
  FileText,
  BarChart2
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { BookingModal } from '@/components/booking-modal';
import { VisualClinicFloor } from '@/components/visual-clinic-floor';
import { Appointment } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug, store);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'waiting' | 'in_chair' | 'completed' | 'online'>('all');
  const [chartTimeframe, setChartTimeframe] = useState<'week' | 'month'>('week');
  const [chartMetric, setChartMetric] = useState<'visits' | 'capacity'>('visits');
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(2);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [upcomingDayTab, setUpcomingDayTab] = useState<'tomorrow' | 'day_after' | 'in_3_days'>('tomorrow');

  const isDoctor = store.currentUser?.role === 'doctor' || store.activePersona === 'doctor';
  const isOwner = store.currentUser?.role === 'admin' || store.activePersona === 'manager';
  const allAppointments = Array.isArray(store.appointments) ? store.appointments : [];
  
  // DR. SENAIT ISOLATION: When doctor is logged in, show ONLY Dr. Senait's patients/appointments
  const safeAppointments = useMemo(() => {
    if (isDoctor) {
      return allAppointments.filter((a) => {
        const doc = (a.doctorName || '').toLowerCase();
        const isSenait = doc.includes('senait') || a.doctorId === 'doc-senait';
        const isDawit = doc.includes('dawit') || a.doctorId === 'doc-dawit' || a.chairNumber === 2;
        return isSenait && !isDawit;
      });
    }
    return allAppointments;
  }, [allAppointments, isDoctor]);

  const safeChairs = Array.isArray(store.chairs) ? store.chairs : [];

  const waitingPatients = safeAppointments.filter((a) => a.status === 'checked_in');
  const inChairPatients = safeAppointments.filter((a) => a.status === 'in_progress');
  const completedPatients = safeAppointments.filter((a) => a.status === 'completed');
  const onlinePatients = safeAppointments.filter((a) =>
    Boolean(a.isOnlineBooking || a.source === 'online' || a.source === 'copilot' || (a.notes && a.notes.includes('Online')) || (a.notes && a.notes.includes('Booked via')))
  );

  const inClinicNowCount = waitingPatients.length + inChairPatients.length;
  const overdueAppointments = safeAppointments.filter((a) => a.paymentStatus === 'none' && a.totalDueETB > 0);

  // Dynamic Financial Collections & Overdue Calculations
  const { todayCollectedETB, overdueBalanceETB, overdueCount } = useMemo(() => {
    const ledgerTotal = (store.ledger || [])
      .filter((tx) => !tx.isRefunded)
      .reduce((sum, tx) => sum + (tx.amountETB || 0), 0);

    let pendingDue = 0;
    let pendingCount = 0;
    safeAppointments.forEach((apt) => {
      if (apt.paymentStatus !== 'fully_paid') {
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
        const bal = Math.max(0, totalDue - (apt.depositPaidETB || 0));
        if (bal > 0) {
          pendingDue += bal;
          pendingCount += 1;
        }
      }
    });

    return {
      todayCollectedETB: ledgerTotal > 0 ? ledgerTotal : 34500,
      overdueBalanceETB: pendingDue,
      overdueCount: pendingCount,
    };
  }, [store.ledger, safeAppointments, store.treatmentPlans]);

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const operatorName = isDoctor ? 'Dr. Senait Tadesse' : (store.currentUser?.name || 'Helen Tadesse');
  const operatorFirst = isDoctor ? 'Dr. Senait' : operatorName;

  const chair1 = safeChairs.find((c) => c.chairNumber === 1);
  const pendingChair1Req =
    store.pendingSeatingRequest?.chairNumber === 1 && store.pendingSeatingRequest?.status === 'pending'
      ? store.pendingSeatingRequest
      : null;

  const chair1Apt = useMemo(() => {
    // 1. Direct match on chairNumber 1 and in_progress
    const matchApt = safeAppointments.find(
      (a) =>
        (chair1?.currentAppointmentId && a.id === chair1.currentAppointmentId) ||
        (a.chairNumber === 1 && a.status === 'in_progress')
    );
    if (matchApt) return matchApt;

    // 2. Fallback to occupied chair1 record in store
    if (chair1?.status === 'occupied' && chair1.currentPatientName) {
      const matchByName = safeAppointments.find(
        (a) => a.patientName.toLowerCase() === chair1.currentPatientName?.toLowerCase()
      );
      if (matchByName) return { ...matchByName, chairNumber: 1, status: 'in_progress' as const };
      return {
        id: chair1.currentAppointmentId || 'apt-chair-1',
        patientName: chair1.currentPatientName,
        doctorName: chair1.currentDoctorName || 'Dr. Senait Tadesse',
        serviceName: 'Clinical Operatory Encounter',
        chairNumber: 1,
        status: 'in_progress' as const,
        patientPhone: '+251 91 122 3344',
      } as unknown as Appointment;
    }
    return undefined;
  }, [safeAppointments, chair1]);

  const chair2 = safeChairs.find((c) => c.chairNumber === 2);
  const pendingChair2Req =
    store.pendingSeatingRequest?.chairNumber === 2 && store.pendingSeatingRequest?.status === 'pending'
      ? store.pendingSeatingRequest
      : null;
  const chair2Apt = safeAppointments.find(
    (a) =>
      (chair2?.currentAppointmentId && a.id === chair2.currentAppointmentId) ||
      (a.chairNumber === 2 && a.status === 'in_progress')
  );

  const isChair1Busy = Boolean(chair1Apt || chair1?.status === 'occupied' || pendingChair1Req);
  const isChair2Busy = Boolean(chair2Apt || chair2?.status === 'occupied' || pendingChair2Req);

  const handleFinishTreatment = (chairNumber: number, aptId?: string) => {
    if (aptId) {
      sinnaStore.completeDoctorEncounter(aptId, {
        notes: 'Procedure completed successfully. Patient guided to reception cashier.',
      });
    } else {
      sinnaStore.releaseChair(chairNumber);
    }
  };

  // Filtered Today's appointments
  const filteredAppointments = useMemo(() => {
    return safeAppointments.filter((apt) => {
      // Tab filter
      if (filterTab === 'waiting' && apt.status !== 'checked_in') return false;
      if (filterTab === 'in_chair' && apt.status !== 'in_progress') return false;
      if (filterTab === 'completed' && apt.status !== 'completed') return false;
      if (filterTab === 'online') {
        const isOnline = Boolean(apt.isOnlineBooking || apt.source === 'online' || apt.source === 'copilot' || (apt.notes && apt.notes.includes('Online')) || (apt.notes && apt.notes.includes('Booked via')));
        if (!isOnline) return false;
      }

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = apt.patientName.toLowerCase().includes(q);
        const matchPhone = (apt.patientPhone || '').includes(q);
        const matchService = (apt.serviceName || '').toLowerCase().includes(q);
        const matchDoc = (apt.doctorName || '').toLowerCase().includes(q);
        const matchMrn = (apt.patientChart?.cardNo || apt.patientChart?.medicalRecordNumber || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchService || matchDoc || matchMrn;
      }

      return true;
    });
  }, [safeAppointments, filterTab, searchTerm]);

  // Dynamic Weekly & Monthly clinical data for Dr. Senait Tadesse (No money/ETB, clinical metrics only)
  const weeklyChartData = useMemo(() => {
    const todayAppointmentsCount = safeAppointments.length;
    const todayChair1Count = safeAppointments.filter((a) => (a.chairNumber === 1 || !a.chairNumber)).length;

    return [
      {
        day: 'Mon',
        dateStr: 'Monday, Oct 20',
        count: 4,
        capacity: 67,
        doctor: 'Dr. Senait Tadesse',
        shift: '08:30 - 17:30',
        focus: 'Hygiene & Prophylaxis',
        chair1: 4,
        onTime: '96%',
        isToday: false,
      },
      {
        day: 'Tue',
        dateStr: 'Tuesday, Oct 21',
        count: 5,
        capacity: 83,
        doctor: 'Dr. Senait Tadesse',
        shift: '08:30 - 17:30',
        focus: 'Restorative Caries & Fillings',
        chair1: 5,
        onTime: '94%',
        isToday: false,
      },
      {
        day: 'Wed',
        dateStr: 'Wednesday, Oct 22 (Today)',
        count: Math.max(todayAppointmentsCount, 4),
        capacity: Math.min(100, Math.round((Math.max(todayAppointmentsCount, 4) / 6) * 100)),
        doctor: 'Dr. Senait Tadesse',
        shift: '08:30 - 17:30',
        focus: 'Crown Fittings & Clinical Triage',
        chair1: Math.max(todayChair1Count, 4),
        onTime: '94%',
        isToday: true,
      },
      {
        day: 'Thu',
        dateStr: 'Thursday, Oct 23',
        count: 5,
        capacity: 83,
        doctor: 'Dr. Senait Tadesse',
        shift: '08:30 - 17:30',
        focus: 'Composite Restorations',
        chair1: 5,
        onTime: '92%',
        isToday: false,
      },
      {
        day: 'Fri',
        dateStr: 'Friday, Oct 24',
        count: 6,
        capacity: 100,
        doctor: 'Dr. Senait Tadesse',
        shift: '08:30 - 18:00',
        focus: 'Operatory Endodontic Procedures',
        chair1: 6,
        onTime: '95%',
        isToday: false,
      },
      {
        day: 'Sat',
        dateStr: 'Saturday, Oct 25',
        count: 3,
        capacity: 50,
        doctor: 'Dr. Senait Tadesse',
        shift: '09:00 - 14:00',
        focus: 'Scaling & Clinical Follow-ups',
        chair1: 3,
        onTime: '100%',
        isToday: false,
      },
    ];
  }, [safeAppointments]);

  const monthlyChartData = useMemo(() => [
    {
      day: 'Wk 1',
      dateStr: 'Oct 1 - Oct 6',
      count: 22,
      capacity: 76,
      doctor: 'Dr. Senait Tadesse',
      shift: 'Operatory 1 Primary Shift',
      focus: 'General Restorative',
      chair1: 22,
      onTime: '95%',
      isToday: false,
    },
    {
      day: 'Wk 2',
      dateStr: 'Oct 8 - Oct 13',
      count: 26,
      capacity: 86,
      doctor: 'Dr. Senait Tadesse',
      shift: 'Full Operatory Shift',
      focus: 'Endo & Crowns',
      chair1: 26,
      onTime: '94%',
      isToday: false,
    },
    {
      day: 'Wk 3',
      dateStr: 'Oct 15 - Oct 20',
      count: 24,
      capacity: 80,
      doctor: 'Dr. Senait Tadesse',
      shift: 'Operatory 1 Primary Shift',
      focus: 'Periodontal Scaling',
      chair1: 24,
      onTime: '96%',
      isToday: false,
    },
    {
      day: 'Wk 4',
      dateStr: 'Oct 22 - Oct 27 (Current)',
      count: 25,
      capacity: 83,
      doctor: 'Dr. Senait Tadesse',
      shift: 'Active Clinical Week',
      focus: 'Operatory 1 Encounters',
      chair1: 25,
      onTime: '94%',
      isToday: true,
    },
  ], []);

  // Dynamic 3-Day Upcoming Clinical Roster for Dr. Senait Tadesse
  const upcomingDaysRoster = useMemo(() => {
    const now = new Date();

    // Day 1: Tomorrow
    const d1 = new Date(now);
    d1.setDate(now.getDate() + 1);
    const d1Name = d1.toLocaleDateString('en-US', { weekday: 'short' });
    const d1DateStr = d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Day 2: Day After Tomorrow
    const d2 = new Date(now);
    d2.setDate(now.getDate() + 2);
    const d2Name = d2.toLocaleDateString('en-US', { weekday: 'short' });
    const d2DateStr = d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Day 3: In 3 Days
    const d3 = new Date(now);
    d3.setDate(now.getDate() + 3);
    const d3Name = d3.toLocaleDateString('en-US', { weekday: 'short' });
    const d3DateStr = d3.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      tomorrow: {
        id: 'tomorrow',
        label: 'Tomorrow',
        shortDate: `${d1Name}, ${d1DateStr}`,
        patients: [
          {
            id: 'apt-001',
            time: '09:30',
            name: 'Tigist Alemu',
            initials: 'TA',
            mrn: 'BDS-00041',
            service: 'Crown Fitting & Occlusal Exam',
            chair: 'Chair 1',
            status: 'Confirmed',
            statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            phone: '+251 91 144 5566',
          },
          {
            id: 'apt-006',
            time: '11:15',
            name: 'Yonas Getachew',
            initials: 'YG',
            mrn: 'BDS-00225',
            service: 'Class II Composite Resin #14',
            chair: 'Chair 1',
            status: 'Online Deposit Paid',
            statusClass: 'bg-sky-50 text-sky-700 border-sky-200',
            phone: '+251 91 555 7788',
          },
          {
            id: 'apt-005',
            time: '14:30',
            name: 'Meron Tesfaye',
            initials: 'MT',
            mrn: 'BDS-00210',
            service: 'Periodontal Scaling & Root Planing',
            chair: 'Chair 1',
            status: 'Confirmed',
            statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            phone: '+251 92 333 4455',
          },
        ],
      },
      day_after: {
        id: 'day_after',
        label: 'Day After',
        shortDate: `${d2Name}, ${d2DateStr}`,
        patients: [
          {
            id: 'apt-002',
            time: '09:00',
            name: 'Abebe Kebede',
            initials: 'AK',
            mrn: 'BDS-00089',
            service: 'Hygiene Post-Op Prophylaxis',
            chair: 'Chair 1',
            status: 'Confirmed',
            statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            phone: '+251 91 122 3344',
          },
          {
            id: 'apt-007',
            time: '11:00',
            name: 'Bethelhem Desta',
            initials: 'BD',
            mrn: 'BDS-00114',
            service: 'Endodontic Obturation #21',
            chair: 'Chair 1',
            status: 'Confirmed',
            statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            phone: '+251 91 888 2233',
          },
          {
            id: 'apt-008',
            time: '14:00',
            name: 'Samuel Tadesse',
            initials: 'ST',
            mrn: 'BDS-00158',
            service: 'Orthodontic Wire Adjustment',
            chair: 'Chair 1',
            status: 'Follow-up',
            statusClass: 'bg-purple-50 text-purple-700 border-purple-200',
            phone: '+251 92 444 7788',
          },
          {
            id: 'apt-009',
            time: '16:30',
            name: 'Almaz Bekele',
            initials: 'AB',
            mrn: 'BDS-00172',
            service: 'Emergency Pulpal Assessment',
            chair: 'Chair 1',
            status: 'Online Deposit Paid',
            statusClass: 'bg-sky-50 text-sky-700 border-sky-200',
            phone: '+251 93 111 6655',
          },
        ],
      },
      in_3_days: {
        id: 'in_3_days',
        label: 'In 3 Days',
        shortDate: `${d3Name}, ${d3DateStr}`,
        patients: [
          {
            id: 'apt-012',
            time: '09:30',
            name: 'Natnael Girma',
            initials: 'NG',
            mrn: 'BDS-00188',
            service: 'Full-Mouth Ultrasonic Scaling',
            chair: 'Chair 1',
            status: 'Confirmed',
            statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            phone: '+251 91 222 9900',
          },
          {
            id: 'apt-011',
            time: '11:30',
            name: 'Rahel Solomon',
            initials: 'RS',
            mrn: 'BDS-00205',
            service: 'Anterior Aesthetic Diagnostic Exam',
            chair: 'Chair 1',
            status: 'Confirmed',
            statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            phone: '+251 94 333 8811',
          },
        ],
      },
    };
  }, []);

  const currentChartItems = chartTimeframe === 'week' ? weeklyChartData : monthlyChartData;
  const activeBarIndex = hoveredBarIndex !== null ? hoveredBarIndex : (selectedBarIndex ?? (chartTimeframe === 'week' ? 2 : 3));
  const activeBarData = currentChartItems[activeBarIndex] || currentChartItems[0];
  const maxChartValue = chartMetric === 'visits' ? (chartTimeframe === 'week' ? 7 : 32) : 100;

  // Recent patients list for quick triage (Strictly Dr. Senait's patients)
  const recentPatients = [
    { id: 'apt-001', name: 'Tigist Alemu', phone: '+251 91 144 5566', initials: 'TA', time: 'Today', status: 'Completed', service: 'Routine Cleaning & Scaling' },
    { id: 'apt-002', name: 'Abebe Kebede', phone: '+251 91 122 3344', initials: 'AK', time: 'Today', status: 'In Chair', service: 'Routine Cleaning & Scaling' },
    { id: 'apt-007', name: 'Kalkidan Bekele', phone: '+251 91 777 8899', initials: 'KB', time: 'Yesterday', status: 'Follow-up', service: 'Crown Delivery (#14)' },
    { id: 'apt-004', name: 'Sara Mengistu', phone: '+251 94 888 9900', initials: 'SM', time: 'Yesterday', status: 'Scheduled', service: 'Emergency Pain Relief' },
    { id: 'apt-005', name: 'Meron Tesfaye', phone: '+251 92 333 4455', initials: 'MT', time: '2 days ago', status: 'Completed', service: 'Orthodontic Adjustment' },
    { id: 'apt-006', name: 'Yonas Getachew', phone: '+251 91 555 7788', initials: 'YG', time: '3 days ago', status: 'Completed', service: 'Consultation & Scaling' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & GREETING BAR (Finexy / SoftFire Luxury Aesthetic)   */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
              {isDoctor ? 'ST' : operatorName.split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || 'HT'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Active on Station" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {greetingTime}, {operatorFirst}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Building2 className="w-3 h-3 text-slate-500" />
                {clinic.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isDoctor
                ? "Overview of today's clinical appointments, active chairs, and treatment pipeline."
                : "Manage patient reception, chair assignments, and fiscal MoR cashier settlements."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200/80">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-card transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MINIMALIST & DAMN PREMIER KPI CARDS (SoftFire / Finexy Style)   */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Scheduled Today */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all group relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 transition-transform group-hover:scale-105">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              {onlinePatients.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  <Globe className="w-2.5 h-2.5 text-sky-600" />
                  <span>+{onlinePatients.length} Online</span>
                </span>
              )}
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {safeAppointments.length}
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">
              Scheduled Appointments
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {completedPatients.length} completed · {safeAppointments.length - completedPatients.length} remaining
            </p>
          </div>
        </div>

        {/* KPI 2: Live Clinic Flow */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all group relative">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 transition-transform group-hover:scale-105">
              <Armchair className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Flow</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
              {inClinicNowCount} <span className="text-xs font-bold text-slate-400 font-sans uppercase">Active</span>
            </div>
            <p className="text-xs font-bold text-slate-700 mt-1">
              Patients Inside Clinic
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {inChairPatients.length} in Chair · {waitingPatients.length} in Lounge
            </p>
          </div>
        </div>

        {/* KPI 3 & 4: Tailored for Doctor vs Reception */}
        {isDoctor ? (
          <>
            {/* Doctor KPI 3: Finished Visits */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all group relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 transition-transform group-hover:scale-105">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    <span>On Schedule</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                  {completedPatients.length} <span className="text-xs font-bold text-slate-400 font-sans uppercase">Done</span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  Completed Today
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Treated &amp; ready for cashier settlement
                </p>
              </div>
            </div>

            {/* Doctor KPI 4: Next in Waiting */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all group relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80 transition-transform group-hover:scale-105">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <span>Waiting</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                  {waitingPatients.length} <span className="text-xs font-bold text-slate-400 font-sans uppercase">In Lounge</span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  Next Up for Doctor
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {waitingPatients.length > 0 ? `${waitingPatients[0].patientName} (${waitingPatients[0].serviceName})` : 'No patients currently in lounge'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Reception KPI 3: Today's Revenue & Collections */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-card transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 transition-transform group-hover:scale-105">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  <span>Reconciled</span>
                </span>
              </div>

              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
                  {todayCollectedETB.toLocaleString()} <span className="text-xs font-bold text-slate-400 font-sans">ETB</span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  Collected Today
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {(store.ledger || []).length} MoR transactions recorded
                </p>
              </div>
            </div>

            {/* Reception KPI 4: Pending Overdue Settlement */}
            <div className="bg-white rounded-2xl border border-rose-200/90 p-5 shadow-xs hover:shadow-card transition-all group bg-gradient-to-br from-white to-rose-50/30">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 transition-transform group-hover:scale-105">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <span>Action Due</span>
                </span>
              </div>

              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-950">
                  {overdueBalanceETB.toLocaleString()} <span className="text-xs font-bold text-rose-700 font-sans">ETB</span>
                </div>
                <p className="text-xs font-bold text-rose-900 mt-1">
                  Overdue Balances ({overdueCount})
                </p>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  {overdueCount > 0 ? `${overdueCount} patient(s) pending invoice settlement` : 'All patient balances settled'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. SHOWCASE: Quixotic / Monetra Flow for Doctor OR Visual Floor for Reception */}
      {/* ------------------------------------------------------------------- */}
      {isDoctor ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left (7 Cols): Patient Visits & Operatory Capacity Interactive Clinical Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group">
            {/* Header: Title, Live Stats, and Interactive Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {chartTimeframe === 'week' ? "DR. SENAIT'S VISITS & OPERATORY LOAD" : 'MONTHLY CLINICAL VOLUME (DR. SENAIT)'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                    {chartTimeframe === 'week' ? `${weeklyChartData.reduce((s, d) => s + d.count, 0)} Visits` : '105 Visits'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {chartTimeframe === 'week'
                    ? 'Dr. Senait Tadesse · 18 scheduled visits · 94% on-time turnaround'
                    : '105 clinical encounters · Operatory 1'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Metric Selector: Visits vs Capacity */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[10px] font-semibold border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setChartMetric('visits')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      chartMetric === 'visits'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Visits
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('capacity')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      chartMetric === 'capacity'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Capacity %
                  </button>
                </div>

                {/* Timeframe Selector: This Week vs Monthly */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[10px] font-semibold border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setChartTimeframe('week');
                      setSelectedBarIndex(2);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      chartTimeframe === 'week'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartTimeframe('month');
                      setSelectedBarIndex(3);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      chartTimeframe === 'month'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                <Link
                  href="/schedule"
                  className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                  title="Open Full Operatory Timeline"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Clinical Chart Area with Guidelines & Precision Columns */}
            <div className="pt-7 pb-2 relative">
              {/* Subtle Horizontal Reference Guidelines */}
              <div className="absolute inset-x-2 sm:inset-x-4 top-8 bottom-8 flex flex-col justify-between pointer-events-none select-none">
                <div className="border-t border-dashed border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-300">
                  <span>{chartMetric === 'visits' ? (chartTimeframe === 'week' ? '7 visits' : '32 visits') : '100%'}</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-300">Peak Capacity</span>
                </div>
                <div className="border-t border-dashed border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-300">
                  <span>{chartMetric === 'visits' ? (chartTimeframe === 'week' ? '5 visits' : '24 visits') : '75%'}</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-300">Optimal Load</span>
                </div>
                <div className="border-t border-dashed border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-300">
                  <span>{chartMetric === 'visits' ? (chartTimeframe === 'week' ? '3 visits' : '16 visits') : '50%'}</span>
                </div>
                <div className="border-t border-dashed border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-300">
                  <span>{chartMetric === 'visits' ? (chartTimeframe === 'week' ? '1 visit' : '8 visits') : '25%'}</span>
                </div>
              </div>

              {/* Interactive Bar Columns */}
              <div className="relative flex items-end justify-between gap-2 sm:gap-4 h-40 px-2 sm:px-6 z-10">
                {currentChartItems.map((item, idx) => {
                  const isActive = activeBarIndex === idx;
                  const isSelected = selectedBarIndex === idx;
                  const val = chartMetric === 'visits' ? item.count : item.capacity;
                  const barHeightPct = Math.min(100, Math.max(16, Math.round((val / maxChartValue) * 100)));

                  return (
                    <div
                      key={item.day}
                      onClick={() => setSelectedBarIndex(idx)}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative cursor-pointer"
                    >
                      {/* Interactive Floating Tooltip Pill (No money, clinical status only) */}
                      {isActive && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-1.5 z-20 pointer-events-none animate-fade-in border border-slate-800">
                          {item.isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          <span>
                            {item.day}: {chartMetric === 'visits' ? `${item.count} Patients` : `${item.capacity}% Chair Load`}
                          </span>
                          <span className="text-slate-400 font-mono">({item.focus})</span>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                        </div>
                      )}

                      {/* Bar Track Channel */}
                      <div
                        className={`w-full max-w-[38px] sm:max-w-[44px] rounded-t-xl h-full flex items-end p-1 transition-all border ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-300/80'
                            : 'bg-slate-100/80 border-slate-200/60 group-hover:bg-slate-200/60 group-hover:border-slate-300'
                        }`}
                      >
                        <div
                          style={{ height: `${barHeightPct}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            item.isToday || isSelected
                              ? 'bg-gradient-to-t from-blue-700 via-blue-600 to-indigo-500 shadow-md shadow-blue-500/25'
                              : 'bg-slate-300 group-hover:bg-blue-400/80'
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="flex flex-col items-center mt-1">
                        <span
                          className={`text-[11px] font-mono transition-colors ${
                            item.isToday
                              ? 'font-bold text-blue-600'
                              : isSelected
                              ? 'font-bold text-slate-800'
                              : 'text-slate-400 group-hover:text-slate-700'
                          }`}
                        >
                          {item.day}
                        </span>
                        {item.isToday && (
                          <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Day Inspection Strip (Clinical details only, no money) */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/60 -mx-6 -mb-6 px-6 py-3.5 rounded-b-3xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                <span className="font-bold text-slate-900">{activeBarData.dateStr}</span>
                {activeBarData.isToday && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    TODAY
                  </span>
                )}
                <span className="text-slate-300">·</span>
                <span className="text-slate-600 font-medium">Dr. Senait Tadesse</span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-mono text-slate-500">{activeBarData.shift}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 font-mono">
                  <strong className="text-slate-800 font-bold">{activeBarData.count}</strong> visits ({activeBarData.capacity}% load)
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-semibold text-blue-700">{activeBarData.focus}</span>
                <span className="text-slate-300">·</span>
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Schedule <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right (5 Cols): Active Patient In Chair (Mint/Sage clinical card with distinct double borders & dynamic states) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#E4F7EE] via-[#ECF9F2] to-[#DCF4E7] text-slate-900 rounded-3xl p-6 shadow-xs border-2 border-emerald-400/80 ring-1 ring-emerald-500/20 flex flex-col justify-between relative overflow-hidden group">
            {/* Geometric Star Motif Watermark (Matching reference image) */}
            <div className="absolute -right-6 -top-6 w-44 h-44 pointer-events-none text-emerald-500/15 select-none">
              <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
                <path d="M100 0 C100 55, 145 100, 200 100 C145 100, 100 145, 100 200 C100 145, 55 100, 0 100 C55 100, 100 55, 100 0 Z" />
              </svg>
            </div>

            <div>
              {/* Top Tag Row (Matching reference pill layout) */}
              <div className="flex items-center justify-between relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-900 text-white shadow-2xs">
                  {chair1Apt ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>IN TREATMENT</span>
                    </>
                  ) : pendingChair1Req ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>INCOMING REQUEST</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>READY FOR PATIENT</span>
                    </>
                  )}
                </span>

                {chair1Apt ? (
                  <span className="text-[11px] font-mono text-emerald-900 bg-white/90 border border-emerald-300/80 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>20m in chair</span>
                  </span>
                ) : pendingChair1Req ? (
                  <span className="text-[11px] font-mono text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
                    Action Needed
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-900 bg-white/90 border border-emerald-300/80 px-2.5 py-0.5 rounded-full font-semibold shadow-2xs">
                    {waitingPatients.length > 0 ? `${waitingPatients.length} in Lounge` : 'Lounge Clear'}
                  </span>
                )}
              </div>

              {/* Dynamic Content */}
              {chair1Apt ? (
                <div className="mt-4 space-y-3 relative z-10">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Current Operatory Patient
                    </p>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                      {chair1Apt.patientName}
                    </h4>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-emerald-900 bg-emerald-200/60 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      {chair1Apt.serviceName}
                    </span>
                  </div>

                  {/* Two Rounded Sub-Cards (Dalibox Points & Voucher Style from Reference) */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-white/90 border border-emerald-300/80 rounded-2xl p-3 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        MRN / Card No
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block truncate">
                        {chair1Apt.patientChart?.cardNo || chair1Apt.patientChart?.medicalRecordNumber || 'BDS-00041'}
                      </span>
                    </div>
                    <div className="bg-white/90 border border-emerald-300/80 rounded-2xl p-3 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Phone / Contact
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 mt-0.5 block truncate">
                        {chair1Apt.patientPhone || '+251 91 122 3344'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : pendingChair1Req ? (
                <div className="mt-4 space-y-3 relative z-10">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Reception Dispatch
                    </p>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                      {pendingChair1Req.patientName}
                    </h4>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {pendingChair1Req.serviceName}
                    </span>
                  </div>

                  {/* Two Rounded Sub-Cards */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-white/90 border border-emerald-300/80 rounded-2xl p-3 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Dispatched By
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                        {pendingChair1Req.requestedBy || 'Helen (Reception)'}
                      </span>
                    </div>
                    <div className="bg-white/90 border border-emerald-300/80 rounded-2xl p-3 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Status
                      </span>
                      <span className="text-xs font-bold text-amber-700 mt-0.5 block truncate">
                        Waiting in Lounge
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 relative z-10">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Operatory 1 Status
                    </p>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                      Waiting for Next Patient
                    </h4>
                    <p className="text-xs text-slate-700 mt-1">
                      {waitingPatients.length > 0
                        ? `Next in line from reception: ${waitingPatients[0].patientName} (${waitingPatients[0].serviceName})`
                        : 'All checked-in patients treated. Lounge is currently clear.'}
                    </p>
                  </div>

                  {/* Two Rounded Sub-Cards (Reference Style) */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-white/90 border border-emerald-300/80 rounded-2xl p-3 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Next in Lounge
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">
                        {waitingPatients.length > 0 ? waitingPatients[0].patientName : 'None Waiting'}
                      </span>
                    </div>
                    <div className="bg-white/90 border border-emerald-300/80 rounded-2xl p-3 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Lounge Queue
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-800 mt-0.5 block">
                        {waitingPatients.length > 0 ? `${waitingPatients.length} Waiting` : 'Empty'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions for Chair 1 */}
            <div className="mt-5 pt-4 border-t border-emerald-300/80 flex flex-col gap-2.5 relative z-10">
              {chair1Apt ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (isDoctor) {
                        router.push(`/patients?patientId=${chair1Apt.id}`);
                      } else {
                        sinnaStore.openPatientDrawer(chair1Apt.id);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors text-center shadow-xs flex items-center justify-center gap-2 active:scale-98"
                  >
                    <User className="w-3.5 h-3.5 text-white" />
                    <span>Clinical Profile &amp; Chart</span>
                  </button>
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) {
                        sinnaStore.toastInfo('Owner Oversight Mode', 'Encounter completion is managed by Dr. Senait Tadesse.');
                        return;
                      }
                      handleFinishTreatment(1, chair1Apt.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors text-center flex items-center justify-center gap-2 shadow-2xs ${
                      isOwner
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'text-emerald-950 hover:bg-emerald-100 bg-white border border-emerald-300 active:scale-98'
                    }`}
                    title={isOwner ? 'Owner Oversight Mode (Read-Only)' : 'Done → Send to Cashier'}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isOwner ? 'text-slate-400' : 'text-emerald-600'}`} />
                    <span>{isOwner ? 'Done → Send to Cashier (Doctor Only)' : 'Done → Send to Cashier'}</span>
                  </button>
                </>
              ) : pendingChair1Req ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) return;
                      sinnaStore.acceptSeatingRequest();
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors text-center shadow-xs flex items-center justify-center gap-2 ${
                      isOwner
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98'
                    }`}
                    title={isOwner ? 'Owner Oversight Mode (Read-Only)' : 'Accept and seat in Chair 1'}
                  >
                    <Check className="w-4 h-4" />
                    <span>{isOwner ? 'Doctor Handshake (Locked)' : 'Accept & Seat in Chair 1'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isOwner}
                    onClick={() => {
                      if (isOwner) return;
                      sinnaStore.declineSeatingRequest();
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors text-center shadow-2xs border ${
                      isOwner
                        ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                        : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-200 active:scale-98'
                    }`}
                    title={isOwner ? 'Owner Oversight Mode (Read-Only)' : 'Decline seating request'}
                  >
                    Decline
                  </button>
                </div>
              ) : waitingPatients.length > 0 ? (
                <button
                  type="button"
                  disabled={isOwner}
                  onClick={() => {
                    if (isOwner) {
                      sinnaStore.toastInfo('Owner Oversight Mode', 'Operatory seating is managed by Reception & Doctor.');
                      return;
                    }
                    sinnaStore.assignPatientToChair(waitingPatients[0].id, 1);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors text-center shadow-xs flex items-center justify-center gap-2 ${
                    isOwner
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'text-white bg-slate-900 hover:bg-slate-800 active:scale-98'
                  }`}
                  title={isOwner ? 'Owner Oversight Mode (Read-Only)' : 'Call & Seat in Chair 1'}
                >
                  <Armchair className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isOwner
                      ? 'Chair 1 Seating (Doctor Only)'
                      : `Call & Seat ${waitingPatients[0].patientName.split(' ')[0]} in Chair 1`}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/schedule')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-colors text-center shadow-xs"
                >
                  View Schedule &amp; Appointments
                </button>
              )}

              {/* Upcoming in Queue (Monetra / Quixotic Avatar Stack) */}
              <div className="pt-2 border-t border-emerald-300/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Next in Lounge
                  </span>
                  <span className="text-[11px] text-slate-800 font-medium">
                    {waitingPatients.length > 0 ? `${waitingPatients.length} awaiting treatment` : 'Lounge empty'}
                  </span>
                </div>

                <div className="flex items-center -space-x-2">
                  {waitingPatients.slice(0, 3).map((wp) => (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => {
                        if (isDoctor) {
                          router.push(`/patients?patientId=${wp.id}`);
                        } else {
                          sinnaStore.openPatientDrawer(wp.id);
                        }
                      }}
                      className="w-7 h-7 rounded-full bg-white border-2 border-emerald-300 text-[10px] font-bold text-slate-700 flex items-center justify-center hover:scale-110 hover:border-emerald-600 hover:z-10 transition-all shadow-xs cursor-pointer"
                      title={`Open profile: ${wp.patientName}`}
                    >
                      {wp.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </button>
                  ))}
                  {waitingPatients.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-white text-[9px] font-black text-white flex items-center justify-center shadow-xs">
                      +{waitingPatients.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <VisualClinicFloor
          onOpenPatientChart={(aptId) =>
            isDoctor ? router.push(`/patients?patientId=${aptId}`) : sinnaStore.openPatientDrawer(aptId)
          }
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. TODAY'S PATIENT SCHEDULE (DentalPin / Linear Clinical Aesthetic) */}
      {/* ------------------------------------------------------------------- */}
      {/* ------------------------------------------------------------------- */}
      {/* 4. TODAY'S PATIENT SCHEDULE (DentalPin / Linear Clinical Aesthetic) */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header: TODAY + Search + Open Schedule */}
        <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  TODAY&apos;S OPERATORY SCHEDULE
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  {safeAppointments.length} Booked
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {completedPatients.length} completed · {inChairPatients.length} in operatory · {waitingPatients.length} in lounge
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Table Quick Search */}
            <div className="relative w-44 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter patient, MRN, phone..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <Link
              href="/schedule"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shrink-0"
            >
              <span>Open schedule</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Filter Tabs Bar (All, In Chair, Waiting, Completed, Online) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            All ({safeAppointments.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('in_chair')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'in_chair'
                ? 'bg-blue-600 text-white shadow-2xs font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterTab === 'in_chair' ? 'bg-white' : 'bg-blue-600'}`} />
            <span>In Operatory ({inChairPatients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('waiting')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'waiting'
                ? 'bg-amber-600 text-white shadow-2xs font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterTab === 'waiting' ? 'bg-white' : 'bg-amber-500'}`} />
            <span>Waiting in Lounge ({waitingPatients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'completed'
                ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filterTab === 'completed' ? 'bg-white' : 'bg-emerald-600'}`} />
            <span>Completed ({completedPatients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('online')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'online'
                ? 'bg-sky-600 text-white shadow-2xs font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Globe className={`w-3 h-3 ${filterTab === 'online' ? 'text-white' : 'text-sky-600'}`} />
            <span>Online Bookings ({onlinePatients.length})</span>
          </button>
        </div>

        {/* Structured Column Headers (Visible on md+ screens) */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
          <div className="col-span-2">TIME &amp; OPERATORY</div>
          <div className="col-span-3">PATIENT &amp; CONTACT</div>
          <div className="col-span-3">PROCEDURE &amp; CLINICIAN</div>
          <div className="col-span-2">STATUS &amp; BILLING</div>
          <div className="col-span-2 text-right">{isDoctor ? '' : 'OPERATORY ACTION'}</div>
        </div>

        {/* Appointment Rows List */}
        <div className="divide-y divide-slate-100">
          {filteredAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No appointments found matching this filter</p>
              <p className="text-[11px] text-slate-400">Try changing the filter tab or clear your search term.</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const isDoctorCancelled = apt.seatingStatus === 'cancelled_by_doctor';
              const isOnline = Boolean(
                apt.isOnlineBooking ||
                apt.source === 'online' ||
                apt.source === 'copilot' ||
                (apt.notes && apt.notes.includes('Online')) ||
                (apt.notes && apt.notes.includes('Booked via'))
              );
              const assignedChair = (apt.doctorName && apt.doctorName.includes('Dawit')) || apt.chairNumber === 2 ? 2 : 1;
              const timeDisplay = apt.startsAt
                ? new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                : '10:00';
              const initials = apt.patientName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
              const mrn =
                apt.patientChart?.cardNo ||
                apt.patientChart?.medicalRecordNumber ||
                (apt.id.startsWith('BDS-')
                  ? apt.id
                  : `BDS-${String(apt.id.replace(/\D/g, '') || '00041').padStart(5, '0')}`);

              // Dynamic Procedure, Amount Due, and Amount Paid Calculation
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
              const depositPaid = apt.depositPaidETB || 0;
              const balanceRemaining = Math.max(0, totalDue - depositPaid);
              const isSettled = apt.paymentStatus === 'fully_paid' || (depositPaid >= totalDue && depositPaid > 0);

              // Status left-border color classes from our established palette
              const borderLeftClass = isDoctorCancelled
                ? 'border-l-rose-500 bg-rose-50/30 hover:bg-rose-50/50'
                : apt.status === 'in_progress'
                ? 'border-l-blue-600 bg-blue-50/15 hover:bg-blue-50/30'
                : apt.status === 'checked_in'
                ? 'border-l-amber-500 bg-amber-50/10 hover:bg-amber-50/25'
                : apt.status === 'completed'
                ? 'border-l-emerald-500 hover:bg-slate-50/80'
                : 'border-l-slate-300 hover:bg-slate-50/80';

              return (
                <div
                  key={apt.id}
                  onClick={() => {
                    if (isDoctor) {
                      router.push(`/patients?patientId=${encodeURIComponent(apt.id)}`);
                    } else {
                      sinnaStore.openPatientDrawer(apt.id);
                    }
                  }}
                  className={`px-4 sm:px-6 py-3.5 transition-all cursor-pointer group border-l-[4px] ${borderLeftClass}`}
                  title={isDoctor ? "Click to view full patient clinical profile & history" : "Click to view patient details & quick actions"}
                >
                  {/* Desktop 12-Column Grid Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                    {/* Col 1 (2 cols): TIME & OPERATORY */}
                    <div className="col-span-2 flex flex-col items-start gap-1">
                      <span className="px-2.5 py-1 text-xs font-bold font-mono text-slate-800 bg-white border border-slate-200/90 rounded-lg shadow-2xs group-hover:border-slate-300 transition-colors">
                        {timeDisplay}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                          assignedChair === 1
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        Chair {assignedChair}
                      </span>
                    </div>

                    {/* Col 2 (3 cols): PATIENT & CONTACT */}
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 group-hover:border-blue-400 group-hover:text-blue-600 transition-colors shadow-2xs">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {apt.patientName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            {apt.patientPhone || '+251 91 123 4567'}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/80">
                            {mrn}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3 (3 cols): PROCEDURE & CLINICIAN */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={apt.serviceName}>
                        {apt.serviceName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 truncate">
                          Doctor: {apt.doctorName}
                        </span>
                        {isOnline && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs font-amharic">
                            <Globe className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                            <span>{isDoctor ? 'በኦንላይን' : 'በኦንላይን · 300 ETB'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 4 (2 cols): STATUS & BILLING (Dynamic Due & Paid Amounts) */}
                    <div className="col-span-2 flex flex-col items-start gap-1">
                      {isDoctorCancelled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          Cancelled · Waiting
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                            apt.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                              : apt.status === 'checked_in'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-2xs'
                              : apt.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {apt.status === 'in_progress' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          )}
                          {apt.status === 'checked_in' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          )}
                          {apt.status === 'completed' && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>
                            {apt.status === 'in_progress'
                              ? 'In Operatory'
                              : apt.status === 'checked_in'
                              ? 'Waiting in Lounge'
                              : apt.status === 'completed'
                              ? 'Completed'
                              : 'Confirmed'}
                          </span>
                        </span>
                      )}

                      {/* Dynamic Amount Due & Paid Breakdown */}
                      {isDoctor ? (
                        <span className="text-[10px] font-mono text-slate-400">
                          {apt.serviceName.includes('Cleaning') ? 'Restorative Operatory' :
                           apt.serviceName.includes('Root') ? 'Endodontic Operatory' :
                           apt.serviceName.includes('Aesthetic') ? 'Cosmetic Operatory' :
                           'Clinical Operatory'}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {isSettled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Settled · Paid {depositPaid.toLocaleString()} ETB</span>
                            </span>
                          ) : depositPaid > 0 ? (
                            <div className="flex items-center gap-1 text-[10px] font-mono">
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                Paid {depositPaid.toLocaleString()}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                Due {balanceRemaining.toLocaleString()} ETB
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              <span>Due: {totalDue.toLocaleString()} ETB</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Col 5 (2 cols): ACTIONS */}
                    <div
                      className="col-span-2 flex items-center justify-end gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isDoctor && (
                        <>
                          {(!apt.status || apt.status === 'confirmed' || apt.status === 'pending_hold') && (
                            <button
                              type="button"
                              disabled={isOwner}
                              onClick={() => {
                                if (isOwner) {
                                  sinnaStore.toastInfo('Owner Oversight Mode', 'Patient check-in is managed by Front Desk (Helen Tadesse).');
                                  return;
                                }
                                sinnaStore.checkInAppointment(apt.id);
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 ml-auto ${
                                isOwner
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                  : 'text-white bg-slate-900 hover:bg-slate-800 active:scale-98'
                              }`}
                              title={isOwner ? 'Owner Oversight Mode (Read-Only)' : 'Check In patient to waiting lounge'}
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{isOwner ? 'Check In (Locked)' : 'Check In'}</span>
                            </button>
                          )}

                          {apt.status === 'checked_in' && (
                            apt.seatingStatus === 'requested' ? (
                              <span className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-1.5 ml-auto animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                                <span>Awaiting Doctor</span>
                              </span>
                            ) : isOwner ? (
                              <button
                                type="button"
                                disabled={true}
                                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none flex items-center gap-1.5 ml-auto"
                                title="Owner Oversight Mode: Patient seating is managed by Reception & Dr. Senait."
                              >
                                <Armchair className="w-3 h-3 text-slate-400" />
                                <span>Seat Chair {assignedChair} (Locked)</span>
                              </button>
                            ) : assignedChair === 1 && isChair1Busy ? (
                              <button
                                type="button"
                                disabled={true}
                                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none flex items-center gap-1.5 ml-auto"
                                title={`Dr. Senait is currently conducting treatment for ${chair1Apt?.patientName || 'a customer'} in Chair 1.`}
                              >
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Dr. Senait Busy</span>
                              </button>
                            ) : assignedChair === 2 && isChair2Busy ? (
                              <button
                                type="button"
                                disabled={true}
                                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none flex items-center gap-1.5 ml-auto"
                                title={`Chair 2 is currently occupied with ${chair2Apt?.patientName || 'a customer'}.`}
                              >
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Chair 2 Busy</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => sinnaStore.requestSeatInChair(apt.id, assignedChair)}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 ml-auto active:scale-98"
                                title={`Request seating in Chair ${assignedChair} (${apt.doctorName || 'Dr. Senait Tadesse'})`}
                              >
                                <Armchair className="w-3 h-3" />
                                <span>Seat Chair {assignedChair}</span>
                              </button>
                            )
                          )}
                        </>
                      )}

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all ml-1 shrink-0" />
                    </div>
                  </div>

                  {/* Mobile Stacked View */}
                  <div className="md:hidden flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-bold font-mono text-slate-800 bg-white border border-slate-200 rounded-lg">
                          {timeDisplay}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          Chair {assignedChair}
                        </span>
                      </div>
                      {isDoctorCancelled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                          Cancelled
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            apt.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : apt.status === 'checked_in'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : apt.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {apt.status === 'in_progress'
                            ? 'In Operatory'
                            : apt.status === 'checked_in'
                            ? 'Waiting'
                            : apt.status === 'completed'
                            ? 'Completed'
                            : 'Confirmed'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{apt.patientName}</p>
                        <p className="text-xs text-slate-600 truncate">{apt.serviceName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>{apt.patientPhone || '+251 91 123 4567'}</span>
                      <span className="font-mono text-slate-500">{mrn}</span>
                    </div>

                    {/* Mobile Dynamic Billing Strip (Reception) */}
                    {!isDoctor && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] font-mono">
                        {isSettled ? (
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Settled · Paid {depositPaid.toLocaleString()} ETB</span>
                          </span>
                        ) : depositPaid > 0 ? (
                          <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                            <span className="text-emerald-700 font-bold">Paid: {depositPaid.toLocaleString()}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-rose-700 font-bold">Due: {balanceRemaining.toLocaleString()} ETB</span>
                          </span>
                        ) : (
                          <span className="font-bold text-slate-700">Due: {totalDue.toLocaleString()} ETB</span>
                        )}
                      </div>
                    )}

                    {/* Mobile Action Bar (Reception Only: Strictly 1 Action at a Time) */}
                    {!isDoctor && (apt.status === 'checked_in' || !apt.status || apt.status === 'confirmed' || apt.status === 'pending_hold') && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                        {(!apt.status || apt.status === 'confirmed' || apt.status === 'pending_hold') && (
                          <button
                            type="button"
                            disabled={isOwner}
                            onClick={() => {
                              if (isOwner) {
                                sinnaStore.toastInfo('Owner Oversight Mode', 'Patient check-in is managed by Front Desk (Helen Tadesse).');
                                return;
                              }
                              sinnaStore.checkInAppointment(apt.id);
                            }}
                            className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                              isOwner
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'text-white bg-slate-900 hover:bg-slate-800 active:scale-98'
                            }`}
                            title={isOwner ? 'Owner Oversight Mode (Read-Only)' : 'Check In patient'}
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isOwner ? 'Check In (Locked)' : 'Check In'}</span>
                          </button>
                        )}

                        {apt.status === 'checked_in' && (
                          apt.seatingStatus === 'requested' ? (
                            <div className="w-full py-1.5 px-2.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-center gap-1.5 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                              <span>Awaiting Doctor</span>
                            </div>
                          ) : isOwner ? (
                            <button
                              type="button"
                              disabled={true}
                              className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none flex items-center justify-center gap-1"
                              title="Owner Oversight Mode: Seating is managed by Reception & Dr. Senait."
                            >
                              <Armchair className="w-3 h-3 text-slate-400" />
                              <span>Seat Chair {assignedChair} (Locked)</span>
                            </button>
                          ) : assignedChair === 1 && isChair1Busy ? (
                            <button
                              type="button"
                              disabled={true}
                              className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none flex items-center justify-center gap-1"
                              title={`Dr. Senait is currently conducting treatment for ${chair1Apt?.patientName || 'a customer'} in Chair 1.`}
                            >
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Dr. Senait Busy</span>
                            </button>
                          ) : assignedChair === 2 && isChair2Busy ? (
                            <button
                              type="button"
                              disabled={true}
                              className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none flex items-center justify-center gap-1"
                              title={`Chair 2 is currently occupied with ${chair2Apt?.patientName || 'a customer'}.`}
                            >
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Chair 2 Busy</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => sinnaStore.requestSeatInChair(apt.id, assignedChair)}
                              className="w-full py-1.5 px-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-1 active:scale-98 shadow-2xs"
                            >
                              <Armchair className="w-3 h-3" />
                              <span>Seat Chair {assignedChair}</span>
                            </button>
                          )
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

      {/* ------------------------------------------------------------------- */}
      {/* 5. LOWER DASHBOARD SECTION (DentalPin Standard & Ethiopian Rails)    */}
      {/* ------------------------------------------------------------------- */}
      {isDoctor ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Doctor Left Column (7 Cols): Dental Lab Orders & Quixotic Treatment Wave Chart */}
          <div className="lg:col-span-7 space-y-5">
            {/* Card 1: Dental Lab Orders */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    DENTAL LAB ORDERS
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    3 active cases
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  {
                    patient: 'Kalkidan Bekele',
                    item: 'Zirconia Crown #14',
                    lab: 'EthioDental CAD/CAM Lab',
                    status: 'Arrived',
                    statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  },
                  {
                    patient: 'Tigist Alemu',
                    item: 'Upper Hawley Retainer',
                    lab: 'Bole Orthodontic Lab',
                    status: 'In Transit',
                    statusClass: 'bg-blue-50 text-blue-700 border-blue-200',
                  },
                  {
                    patient: 'Meron Tesfaye',
                    item: 'Ceramic Aesthetic Hardware',
                    lab: 'Addis Dental Studio Lab',
                    status: 'Ordered',
                    statusClass: 'bg-slate-100 text-slate-700 border-slate-200',
                  },
                ].map((order, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{order.patient}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-600 font-medium">{order.item}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{order.lab}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Dynamic 3-Day Upcoming Patient Roster (Dr. Senait's Next 3 Days) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      UPCOMING PATIENT ROSTER
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Dr. Senait Tadesse · Chair 1
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                    {upcomingDaysRoster[upcomingDayTab].patients.length} Scheduled
                  </span>
                  <Link
                    href="/schedule"
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                    title="View Full Schedule Calendar"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Dynamic 3-Day Filter Tabs (Tomorrow, Day After, In 3 Days) */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70">
                {(['tomorrow', 'day_after', 'in_3_days'] as const).map((tabKey) => {
                  const dayData = upcomingDaysRoster[tabKey];
                  const isActive = upcomingDayTab === tabKey;
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setUpcomingDayTab(tabKey)}
                      className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-2xs font-bold border border-slate-200/80'
                          : 'text-slate-500 hover:text-slate-800 font-semibold'
                      }`}
                    >
                      <span className="text-[11px] block leading-tight">{dayData.label}</span>
                      <span className={`text-[9px] font-mono block ${isActive ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                        {dayData.shortDate}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Client List in Compact Height */}
              <div className="space-y-2 pt-0.5 min-h-[148px]">
                {upcomingDaysRoster[upcomingDayTab].patients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => {
                      if (isDoctor) {
                        router.push(`/patients?patientId=${encodeURIComponent(pat.id)}&name=${encodeURIComponent(pat.name)}`);
                      } else {
                        sinnaStore.openPatientDrawer(pat.id);
                      }
                    }}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/60 hover:bg-white transition-all cursor-pointer group flex items-center justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2 py-1 text-[11px] font-bold font-mono text-slate-800 bg-white border border-slate-200 rounded-lg shrink-0 group-hover:border-blue-300">
                        {pat.time}
                      </span>

                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center font-bold text-[10px] text-blue-700 shrink-0">
                        {pat.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {pat.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                            · {pat.mrn}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {pat.service}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border whitespace-nowrap ${pat.statusClass}`}>
                        {pat.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Operatory 1 Readiness Strip */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-700">Operatory 1 Reserved</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-slate-400">{upcomingDaysRoster[upcomingDayTab].shortDate}</span>
                </div>
                <Link
                  href="/schedule"
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
                >
                  <span>Timeline</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Doctor Right Column (5 Cols): Recent Patients & Clinical Notes */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 3: Recent Patients */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  RECENT PATIENTS
                </h3>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="divide-y divide-slate-100">
                {recentPatients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => {
                      if (isDoctor) {
                        router.push(`/patients?patientId=${pat.id}`);
                      } else {
                        sinnaStore.openPatientDrawer(pat.id);
                      }
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-1.5 rounded-xl transition-colors cursor-pointer group"
                    title={`View profile: ${pat.name}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 group-hover:border-blue-400 group-hover:text-blue-600 transition-colors">
                        {pat.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                          {pat.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {pat.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {pat.time}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Recent Clinical Notes */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    RECENT CLINICAL NOTES
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  {
                    patient: 'Tigist Alemu',
                    date: 'Oct 11',
                    note: 'Upgraded upper archwire to 0.016 NiTi. Ligature ties tightened. No ulceration.',
                  },
                  {
                    patient: 'Abebe Kebede',
                    date: 'Oct 07',
                    note: 'Ultrasonic supra/subgingival scaling completed. 0.2% Chlorhexidine applied.',
                  },
                  {
                    patient: 'Kalkidan Bekele',
                    date: 'Oct 05',
                    note: 'Crown margin verification and subgingival finish line evaluated. Bite adjusted.',
                  },
                ].map((noteItem, idx) => (
                  <div key={idx} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{noteItem.patient}</span>
                      <span className="text-[10px] font-mono text-slate-400">{noteItem.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {noteItem.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Reception Left Column (7 Cols): Unconfirmed Tomorrow, Overdue Payments, Recalls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Card 1: Unconfirmed for Tomorrow */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                UNCONFIRMED FOR TOMORROW
              </h3>
              <div className="flex flex-col items-center justify-center text-center py-5">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-1.5">
                  <Check className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 font-medium">All tomorrow&apos;s appointments confirmed</p>
              </div>
            </div>

            {/* Card 2: Overdue Payments */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    OVERDUE PAYMENTS
                  </h3>
                </div>
                <Link href="/payments" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>View all ({overdueAppointments.length || 1})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div
                onClick={() => {
                  if (isDoctor) {
                    router.push(`/patients?patientId=${encodeURIComponent('apt-003')}`);
                  } else {
                    sinnaStore.openPatientDrawer('apt-003', 'billing');
                  }
                }}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500">INV-2026-0037</span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Dawit Haile</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      15 days overdue
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Single-Visit Root Canal Treatment
                  </p>
                </div>

                <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-slate-900">
                  <span>6,000.00 ETB</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>

            {/* Card 3: Recalls Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  RECALLS
                </h3>
                <Link href="/recalls" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>Call list</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-100">
                <div className="px-2">
                  <span className="text-xl font-bold font-mono text-slate-900 block">4</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Due this week</span>
                </div>
                <div className="px-2">
                  <span className="text-xl font-bold font-mono text-slate-900 block">2</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Overdue</span>
                </div>
                <div className="px-2">
                  <span className="text-xl font-bold font-mono text-slate-900 block">2</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Scheduled month</span>
                </div>
                <div className="px-2">
                  <span className="text-xl font-bold font-mono text-slate-900 block">100%</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">Conversion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reception Right Column (5 Cols): Recent Patients & Week at a Glance */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 4: Recent Patients */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  RECENT PATIENTS
                </h3>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Add New Appointment"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {recentPatients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => {
                      if (isDoctor) {
                        router.push(`/patients?patientId=${encodeURIComponent(pat.id)}`);
                      } else {
                        sinnaStore.openPatientDrawer(pat.id);
                      }
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-1.5 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 group-hover:border-blue-400 group-hover:text-blue-600 transition-colors">
                        {pat.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                          {pat.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {pat.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {pat.time}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 5: Week at a Glance */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  WEEK AT A GLANCE
                </h3>
                <p className="text-[11px] text-slate-400">Last 7 days vs previous 7</p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-end justify-between gap-2 h-20 px-2">
                  {[
                    { day: 'Mon', h: 65, count: 12 },
                    { day: 'Tue', h: 80, count: 16 },
                    { day: 'Wed', h: 45, count: 9 },
                    { day: 'Thu', h: 90, count: 18 },
                    { day: 'Fri', h: 75, count: 14 },
                    { day: 'Sat', h: 100, count: 20 },
                    { day: 'Sun', h: 30, count: 6 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div
                        className={`w-full rounded-md transition-all ${item.day === 'Sat' ? 'bg-blue-600' : 'bg-slate-200 group-hover:bg-blue-400'
                          }`}
                        style={{ height: `${item.h}%` }}
                        title={`${item.day}: ${item.count} patients`}
                      />
                      <span className="text-[9px] font-mono text-slate-400">{item.day}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">Weekly Total: <strong className="text-slate-900 font-bold">95 visits</strong></span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5 font-mono">
                    ↑ 12% vs last week
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
      )}
    </div>
  );
}
