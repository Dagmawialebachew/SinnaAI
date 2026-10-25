'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Calendar,
  Columns3,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Stethoscope,
  Phone,
  User,
  Armchair,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Receipt,
  AlertCircle,
  X,
  Globe,
  Filter,
  Activity,
  Play,
  ShieldCheck
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { BookingModal } from '@/components/booking-modal';
import { Appointment } from '@/lib/types';

// Strictly 3 production-grade clinical schedule modes (Zero 'floor')
type ViewMode = 'week' | 'day' | 'kanban';
type KanbanScope = 'today' | 'week' | 'all';

export default function SchedulePage() {
  const router = useRouter();
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Role and Chair Concurrency Guards
  const isOwner = Boolean(
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

  // View state: defaults to dynamic Week view
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [kanbanScope, setKanbanScope] = useState<KanbanScope>('today');

  // Booking Modal State (with pre-filled slot coordinates)
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingInitialDate, setBookingInitialDate] = useState<string | null>(null);
  const [bookingInitialSlot, setBookingInitialSlot] = useState<string | null>(null);
  const [bookingInitialChair, setBookingInitialChair] = useState<number | null>(null);

  // Operatory Chair & Professional Filters
  const [activeChairs, setActiveChairs] = useState<number[]>([1, 2]);
  const [activeDoctors, setActiveDoctors] = useState<string[]>(['doc-senait', 'doc-dawit']);

  // Dynamic Anchor Date: Initialized to real-time current date (e.g. October 22, 2026)
  const [currentAnchorDate, setCurrentAnchorDate] = useState<Date>(() => new Date());

  // Real-time dynamic clock tracking (updates every 30s)
  const [nowTime, setNowTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const appointments = Array.isArray(store.appointments) ? store.appointments : [];
  const chairs = Array.isArray(store.chairs) ? store.chairs : [];

  // Toggle helpers
  const toggleChair = (chairNum: number) => {
    setActiveChairs((prev) =>
      prev.includes(chairNum)
        ? prev.length > 1
          ? prev.filter((c) => c !== chairNum)
          : prev
        : [...prev, chairNum]
    );
  };

  const toggleDoctor = (docId: string) => {
    setActiveDoctors((prev) =>
      prev.includes(docId)
        ? prev.length > 1
          ? prev.filter((d) => d !== docId)
          : prev
        : [...prev, docId]
    );
  };

  // Helper formatting for ISO dates (YYYY-MM-DD)
  const formatIsoDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayIsoString = useMemo(() => formatIsoDate(nowTime), [nowTime]);
  const selectedAnchorIsoString = useMemo(() => formatIsoDate(currentAnchorDate), [currentAnchorDate]);

  // Week computation (Monday to Sunday) based on currentAnchorDate
  const weekDays = useMemo(() => {
    const anchor = new Date(currentAnchorDate);
    const dayOfWeek = anchor.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() + diffToMonday);

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isoString = formatIsoDate(d);
      const isToday = isoString === todayIsoString;
      const isSaturday = d.getDay() === 6;
      const isSunday = d.getDay() === 0;

      days.push({
        date: d,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        formattedLabel: `${dayNames[d.getDay()]} ${d.getDate()}`,
        isoString,
        isToday,
        isSaturday,
        isSunday,
      });
    }
    return days;
  }, [currentAnchorDate, todayIsoString]);

  // Dynamic Formatted date range: e.g. "Oct 19 - Oct 25, 2026" or "Thu, Oct 22, 2026"
  const dateRangeLabel = useMemo(() => {
    if (viewMode === 'day') {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      return currentAnchorDate.toLocaleDateString('en-US', options);
    }
    const startMonth = weekDays[0].date.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekDays[6].date.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekDays[0].dayNumber;
    const endDay = weekDays[6].dayNumber;
    const year = weekDays[6].date.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }, [weekDays, currentAnchorDate, viewMode]);

  // Navigate functions
  const handlePrev = () => {
    const d = new Date(currentAnchorDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentAnchorDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentAnchorDate);
    if (viewMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentAnchorDate(d);
  };

  const handleToday = () => {
    setCurrentAnchorDate(new Date());
  };

  // Filtered appointments by Chair and Doctor
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Chair filter
      if (apt.chairNumber && !activeChairs.includes(apt.chairNumber)) {
        return false;
      }
      // Doctor filter
      if (apt.doctorId && !activeDoctors.includes(apt.doctorId)) {
        return false;
      }
      return true;
    });
  }, [appointments, activeChairs, activeDoctors]);

  // 11 Hours from 09:00 to 19:00 (matching clinical operatory standard)
  // 4 slots per hour, slot height = 28px -> 112px per hour -> total height = 1232px
  const startHourNum = 9;
  const hoursCount = 11; // 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
  const gridHours = Array.from({ length: hoursCount }, (_, i) => startHourNum + i);

  // Live real-time indicator line position
  const currentHourFraction = nowTime.getHours() + nowTime.getMinutes() / 60;
  const liveIndicatorTopPx = Math.max(0, (currentHourFraction - 9) * 112);
  const isNowInBusinessHours = currentHourFraction >= 9 && currentHourFraction <= 19;

  // Open booking modal for a specific slot coordinate
  const handleOpenSlotBooking = (dateIso: string, hour: number, chairNum: number = 1) => {
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const slotString = `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
    setBookingInitialDate(dateIso);
    setBookingInitialSlot(slotString);
    setBookingInitialChair(chairNum);
    setBookingModalOpen(true);
  };

  // Helper to open patient record (role-segregated)
  const isDoctor = store.currentUser?.role === 'doctor' || store.activePersona === 'doctor';
  const handleOpenPatientChart = (aptId: string) => {
    if (isDoctor) {
      router.push(`/patients?patientId=${encodeURIComponent(aptId)}`);
    } else {
      sinnaStore.openPatientDrawer(aptId);
    }
  };

  // Day View specific appointments for selected anchor date
  const dayAppointments = useMemo(() => {
    return filteredAppointments.filter((apt) => {
      const aptDate = apt.startsAt.split('T')[0];
      return aptDate === selectedAnchorIsoString;
    });
  }, [filteredAppointments, selectedAnchorIsoString]);

  // Kanban view appointments based on scope
  const kanbanAppointments = useMemo(() => {
    if (kanbanScope === 'today') {
      return filteredAppointments.filter((apt) => apt.startsAt.split('T')[0] === selectedAnchorIsoString);
    }
    if (kanbanScope === 'week') {
      const weekIsoSet = new Set(weekDays.map((w) => w.isoString));
      return filteredAppointments.filter((apt) => weekIsoSet.has(apt.startsAt.split('T')[0]));
    }
    return filteredAppointments;
  }, [filteredAppointments, kanbanScope, selectedAnchorIsoString, weekDays]);

  return (
    <div className="h-full flex flex-col w-full min-w-0 overflow-hidden pb-8 animate-fade-in">
      {/* 1. Header (Exact DentalPin Markup with Zero Floor View) */}
      <header className="mb-5 shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Schedule
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Operatory Timeline &amp; Chair Management · {clinic.location.split(',')[0] || clinic.name}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View switcher tablist (Week, Day, Kanban only) */}
            <div className="items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg overflow-x-auto inline-flex border border-slate-200" role="tablist">
              <button
                type="button"
                role="tab"
                onClick={() => setViewMode('week')}
                aria-selected={viewMode === 'week'}
                className={`inline-flex items-center justify-center gap-1.5 text-xs rounded-md transition-all whitespace-nowrap px-3.5 py-1.5 ${
                  viewMode === 'week'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <CalendarDays className="w-4 h-4 shrink-0 text-blue-600" />
                <span>Week</span>
              </button>

              <button
                type="button"
                role="tab"
                onClick={() => setViewMode('day')}
                aria-selected={viewMode === 'day'}
                className={`inline-flex items-center justify-center gap-1.5 text-xs rounded-md transition-all whitespace-nowrap px-3.5 py-1.5 ${
                  viewMode === 'day'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Day</span>
              </button>

              <button
                type="button"
                role="tab"
                onClick={() => setViewMode('kanban')}
                aria-selected={viewMode === 'kanban'}
                className={`inline-flex items-center justify-center gap-1.5 text-xs rounded-md transition-all whitespace-nowrap px-3.5 py-1.5 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <Columns3 className="w-4 h-4 shrink-0 text-indigo-600" />
                <span>Kanban</span>
              </button>
            </div>

            {/* + New appointment button */}
            <button
              type="button"
              disabled={isOwner}
              onClick={() => {
                if (isOwner) return;
                setBookingInitialDate(selectedAnchorIsoString);
                setBookingInitialSlot('10:00 AM');
                setBookingInitialChair(1);
                setBookingModalOpen(true);
              }}
              className={`rounded-lg font-semibold inline-flex items-center transition-colors px-3 py-1.5 text-xs gap-1.5 border shadow-2xs focus:outline-none ${
                isOwner
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200'
              }`}
              title={isOwner ? 'Owner audit mode: Booking restricted' : 'Book new appointment'}
            >
              <Plus className={`shrink-0 w-4 h-4 ${isOwner ? 'text-slate-400' : 'text-blue-600'}`} />
              <span>{isOwner ? 'New appointment (Locked)' : 'New appointment'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Owner Oversight Mode Notice */}
      {isOwner && (
        <div className="mb-4 bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between text-xs shadow-xs border border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">Owner Oversight Mode:</span>
            <span className="text-slate-300">Live operatory timeline is in read-only audit view. Patient check-in, chair seating, and completion are restricted to front desk and doctor stations.</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Audit Active</span>
        </div>
      )}

      {/* 2. Filter Bar: Operatory Chair & Professional */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-4 shrink-0 text-xs">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Chair Filters */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Armchair className="w-3.5 h-3.5 text-slate-400" />
              Chair
            </span>
            <button
              type="button"
              onClick={() => toggleChair(1)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                activeChairs.includes(1)
                  ? 'bg-white text-slate-900 ring-1 ring-slate-300 font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-400 opacity-60 ring-1 ring-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-blue-500" />
              <span>Chair 1 (Main Operatory)</span>
            </button>

            <button
              type="button"
              onClick={() => toggleChair(2)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                activeChairs.includes(2)
                  ? 'bg-white text-slate-900 ring-1 ring-slate-300 font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-400 opacity-60 ring-1 ring-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
              <span>Chair 2 (Hygiene &amp; Endo)</span>
            </button>
          </div>

          {/* Professional Filters */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              Professional
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleDoctor('doc-senait')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  activeDoctors.includes('doc-senait')
                    ? 'bg-white text-slate-900 ring-1 ring-slate-300 font-semibold shadow-2xs'
                    : 'bg-slate-50 text-slate-400 opacity-60 ring-1 ring-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 bg-blue-600">
                  ST
                </span>
                <span>Dr. Senait Tadesse</span>
              </button>

              <button
                type="button"
                onClick={() => toggleDoctor('doc-dawit')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  activeDoctors.includes('doc-dawit')
                    ? 'bg-white text-slate-900 ring-1 ring-slate-300 font-semibold shadow-2xs'
                    : 'bg-slate-50 text-slate-400 opacity-60 ring-1 ring-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 bg-emerald-600">
                  DB
                </span>
                <span>Dr. Dawit Bekele</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live System Time Chip */}
        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-[11px] font-semibold text-slate-700">
            {nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* 3. Date Controls & Range Label (Left buttons, Right title) */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous"
            className="rounded-lg font-medium inline-flex items-center text-xs ring-1 ring-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 p-1.5 transition-colors shadow-2xs"
          >
            <ChevronLeft className="shrink-0 w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg font-semibold inline-flex items-center px-3 py-1.5 text-xs ring-1 ring-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next"
            className="rounded-lg font-medium inline-flex items-center text-xs ring-1 ring-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 p-1.5 transition-colors shadow-2xs"
          >
            <ChevronRight className="shrink-0 w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {dateRangeLabel}
          </h2>
          {selectedAnchorIsoString === todayIsoString && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              TODAY
            </span>
          )}
        </div>
      </div>

      {/* 4. MAIN SCHEDULE VIEW CONTAINER */}

      {/* ============================================================ */}
      {/* A. WEEK VIEW (Dynamic 7-Day Matrix with Live Red Laser Line) */}
      {/* ============================================================ */}
      {viewMode === 'week' && (
        <div className="flex-1 overflow-auto ring-1 ring-slate-200 rounded-xl bg-white shadow-2xs select-none">
          <div className="min-w-[840px]">
            {/* Sticky 8-Column Header Row */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 sticky top-0 z-30 text-xs font-sans">
              <div className="p-2.5 text-center text-slate-400 border-e border-slate-200 font-mono text-[11px] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.isoString}
                  onClick={() => {
                    setCurrentAnchorDate(day.date);
                    setViewMode('day');
                  }}
                  title="Click to view detailed day operatory timeline"
                  className={`p-2 text-center border-e border-slate-200 last:border-e-0 transition-colors cursor-pointer group hover:bg-blue-50/50 ${
                    day.isToday ? 'bg-blue-50/80 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={day.isToday ? 'text-blue-700 font-bold' : 'text-slate-700 font-medium group-hover:text-blue-600'}>
                      {day.formattedLabel}
                    </span>
                    {day.isToday && (
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded">
                        Today
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots Area: 11 Hours, 4 Slots per Hour (each 28px height) */}
            <div className="relative">
              {/* Background Slot Rows */}
              {gridHours.map((hour) => (
                <React.Fragment key={hour}>
                  {/* Slot 00 (:00 min) - shows hour stamp in gutter */}
                  <div className="grid grid-cols-8 border-b border-slate-200/80 h-[28px]">
                    <div className="p-1 text-end border-e border-slate-200 flex items-center justify-end pe-2">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                    {weekDays.map((day) => (
                      <div
                        key={`${day.isoString}-${hour}-00`}
                        onClick={() => handleOpenSlotBooking(day.isoString, hour, 1)}
                        className={`border-e border-slate-100 last:border-e-0 cursor-cell hover:bg-blue-50/60 transition-colors relative group ${
                          day.isToday ? 'bg-blue-50/20' : ''
                        }`}
                        title={`Click to book appointment on ${day.formattedLabel} at ${hour}:00`}
                      />
                    ))}
                  </div>

                  {/* Slot 15 (:15 min) */}
                  <div className="grid grid-cols-8 border-b border-slate-100 h-[28px]">
                    <div className="p-1 text-end border-e border-slate-200 flex items-center justify-end pe-2" />
                    {weekDays.map((day) => (
                      <div
                        key={`${day.isoString}-${hour}-15`}
                        onClick={() => handleOpenSlotBooking(day.isoString, hour, 1)}
                        className={`border-e border-slate-100 last:border-e-0 cursor-cell hover:bg-blue-50/60 transition-colors relative ${
                          day.isToday ? 'bg-blue-50/20' : ''
                        }`}
                        title={`Click to book appointment on ${day.formattedLabel} at ${hour}:15`}
                      />
                    ))}
                  </div>

                  {/* Slot 30 (:30 min) */}
                  <div className="grid grid-cols-8 border-b border-slate-100 h-[28px]">
                    <div className="p-1 text-end border-e border-slate-200 flex items-center justify-end pe-2" />
                    {weekDays.map((day) => (
                      <div
                        key={`${day.isoString}-${hour}-30`}
                        onClick={() => handleOpenSlotBooking(day.isoString, hour, 1)}
                        className={`border-e border-slate-100 last:border-e-0 cursor-cell hover:bg-blue-50/60 transition-colors relative ${
                          day.isToday ? 'bg-blue-50/20' : ''
                        }`}
                        title={`Click to book appointment on ${day.formattedLabel} at ${hour}:30`}
                      />
                    ))}
                  </div>

                  {/* Slot 45 (:45 min) */}
                  <div className="grid grid-cols-8 border-b border-slate-100 h-[28px]">
                    <div className="p-1 text-end border-e border-slate-200 flex items-center justify-end pe-2" />
                    {weekDays.map((day) => (
                      <div
                        key={`${day.isoString}-${hour}-45`}
                        onClick={() => handleOpenSlotBooking(day.isoString, hour, 1)}
                        className={`border-e border-slate-100 last:border-e-0 cursor-cell hover:bg-blue-50/60 transition-colors relative ${
                          day.isToday ? 'bg-blue-50/20' : ''
                        }`}
                        title={`Click to book appointment on ${day.formattedLabel} at ${hour}:45`}
                      />
                    ))}
                  </div>
                </React.Fragment>
              ))}

              {/* Absolute Overlay Layer for Closed Schedules & Appointments */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="grid grid-cols-8 h-full">
                  {/* Column 1: Time Gutter Divider */}
                  <div className="border-e border-slate-200" />

                  {/* Columns 2-8: 7 Day Columns */}
                  {weekDays.map((day) => {
                    // Filter appointments belonging to this day
                    const dayApts = filteredAppointments.filter((apt) => {
                      const aptDateStr = apt.startsAt.split('T')[0];
                      return aptDateStr === day.isoString;
                    });

                    return (
                      <div key={day.isoString} className="relative border-e border-slate-200/60 last:border-e-0">
                        
                        {/* 1. Closed Schedules Blocks */}
                        {day.isSaturday ? (
                          // Saturday: Clinic Closed Full Day
                          <div
                            className="absolute inset-x-0 pointer-events-none z-10"
                            title="Clinic closed (Saturday)"
                            style={{
                              top: '0px',
                              height: '1232px',
                              backgroundImage:
                                'repeating-linear-gradient(-45deg, rgba(241, 245, 249, 0.7), rgba(241, 245, 249, 0.7) 10px, rgba(248, 250, 252, 0.7) 10px, rgba(248, 250, 252, 0.7) 20px)',
                            }}
                          />
                        ) : (
                          // Weekdays: Afternoon Closed Break from 14:00 to 16:00
                          <div
                            className="absolute inset-x-0 pointer-events-none z-10"
                            title="Operatory Sanitization / Lunch Break"
                            style={{
                              top: '560px',
                              height: '224px',
                              backgroundImage:
                                'repeating-linear-gradient(-45deg, rgba(241, 245, 249, 0.4), rgba(241, 245, 249, 0.4) 10px, rgba(248, 250, 252, 0.4) 10px, rgba(248, 250, 252, 0.4) 20px)',
                            }}
                          />
                        )}

                        {/* 2. Today Dynamic Live Time Laser Line */}
                        {day.isToday && isNowInBusinessHours && (
                          <div
                            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                            style={{ top: `${liveIndicatorTopPx}px` }}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm -ml-1 animate-pulse" />
                            <span className="h-0.5 bg-rose-500 flex-1 opacity-90 shadow-2xs" />
                            <span className="text-[9px] font-mono font-bold bg-rose-500 text-white px-1 py-0.2 rounded shadow-2xs ml-0.5">
                              {nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}

                        {/* 3. Appointment Cards */}
                        {dayApts.map((apt) => {
                          const startTime = new Date(apt.startsAt);
                          const endTime = new Date(apt.endsAt);
                          const startHour = startTime.getUTCHours() + startTime.getUTCMinutes() / 60;
                          const endHour = endTime.getUTCHours() + endTime.getUTCMinutes() / 60;
                          const durationHours = Math.max(0.65, endHour - startHour);

                          // Slot height is 28px, 4 slots = 112px/hour
                          const topPx = Math.max(0, (startHour - 9) * 112);
                          const heightPx = Math.max(56, durationHours * 112);

                          const isCancelled = apt.seatingStatus === 'cancelled_by_doctor';
                          const isChair1 = apt.chairNumber === 1;
                          const chairBorderColor = isCancelled
                            ? 'rgb(225, 29, 72)'
                            : isChair1
                            ? 'rgb(59, 130, 246)'
                            : 'rgb(16, 185, 129)';
                          const chairBg = isCancelled
                            ? 'rgba(244, 63, 94, 0.16)'
                            : isChair1
                            ? 'rgba(59, 130, 246, 0.12)'
                            : 'rgba(16, 185, 129, 0.12)';
                          const doctorInitials = apt.doctorName.includes('Senait') ? 'ST' : 'DB';
                          const doctorBg = isCancelled
                            ? 'rgb(225, 29, 72)'
                            : doctorInitials === 'ST'
                            ? 'rgb(59, 130, 246)'
                            : 'rgb(16, 185, 129)';

                          const cleanProcedureName = apt.serviceName || 'Clinical Consultation';

                          return (
                            <div
                              key={apt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatientChart(apt.id);
                              }}
                              className={`group absolute rounded overflow-hidden pointer-events-auto select-none shadow-xs text-slate-900 cursor-pointer transition-all ${
                                isCancelled
                                  ? 'bg-rose-50 ring-2 ring-rose-400 hover:ring-rose-500'
                                  : 'bg-white ring-1 ring-slate-200 hover:ring-2 hover:ring-blue-500'
                              }`}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                minHeight: '36px',
                                backgroundColor: chairBg,
                                borderInlineStartColor: chairBorderColor,
                                borderInlineStartWidth: '3px',
                                left: '2px',
                                right: '2px',
                              }}
                            >
                              <div className="px-1.5 h-full flex flex-col py-0.5 relative">
                                {/* Doctor Circle Badge top-right */}
                                <div
                                  className="absolute top-0.5 end-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-2xs"
                                  title={apt.doctorName}
                                  style={{ backgroundColor: doctorBg }}
                                >
                                  {doctorInitials}
                                </div>

                                {/* Hover action trigger: Quick Check-in or Seat */}
                                <div className="absolute top-0.5 start-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-1">
                                  {apt.status === 'confirmed' && (
                                    <button
                                      type="button"
                                      disabled={isOwner}
                                      aria-label="Quick Check In"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isOwner) return;
                                        sinnaStore.checkInPatient(apt.id);
                                        sinnaStore.toastSuccess('Checked In', `${apt.patientName} is now checked in.`);
                                      }}
                                      title={isOwner ? 'Owner audit mode: Patient check-in restricted' : 'Check In Patient'}
                                      className={`rounded p-0.5 shadow-2xs transition-colors border ${
                                        isOwner
                                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                                          : 'text-slate-700 bg-white/95 hover:bg-emerald-50 hover:text-emerald-700 border-slate-200'
                                      }`}
                                    >
                                      <Check className={`w-3.5 h-3.5 ${isOwner ? 'text-slate-400' : 'text-emerald-600'}`} />
                                    </button>
                                  )}
                                  {apt.status === 'checked_in' && (
                                    <button
                                      type="button"
                                      disabled={isOwner || ((apt.chairNumber || 1) === 1 ? isChair1Busy : isChair2Busy)}
                                      aria-label="Seat in Chair"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isOwner || ((apt.chairNumber || 1) === 1 ? isChair1Busy : isChair2Busy)) return;
                                        sinnaStore.assignPatientToChair(apt.id, apt.chairNumber || 1);
                                      }}
                                      title={
                                        isOwner
                                          ? 'Owner audit mode: Operatory seating restricted'
                                          : (apt.chairNumber || 1) === 1 && isChair1Busy
                                          ? 'Dr. Senait is actively conducting treatment in Chair 1. Cannot seat another patient.'
                                          : (apt.chairNumber || 1) === 2 && isChair2Busy
                                          ? 'Chair 2 is currently occupied.'
                                          : `Seat in Chair ${apt.chairNumber || 1}`
                                      }
                                      className={`rounded p-0.5 shadow-2xs transition-colors border ${
                                        isOwner
                                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                                          : (apt.chairNumber || 1) === 1 && isChair1Busy
                                          ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                                          : (apt.chairNumber || 1) === 2 && isChair2Busy
                                          ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                                          : 'text-slate-700 bg-white/95 hover:bg-blue-50 hover:text-blue-700 border-slate-200'
                                      }`}
                                    >
                                      <Armchair className={`w-3.5 h-3.5 ${isOwner || ((apt.chairNumber || 1) === 1 ? isChair1Busy : isChair2Busy) ? 'text-slate-400' : 'text-blue-600'}`} />
                                    </button>
                                  )}
                                </div>

                                {/* Patient Name row */}
                                <div className="flex items-center gap-1 min-h-[18px] pe-5 ps-4">
                                  <span className={`text-xs font-bold truncate ${isCancelled ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {apt.patientName}
                                  </span>
                                  {Boolean(apt.isOnlineBooking || apt.source === 'online') && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-700 bg-sky-100/90 px-1 py-0.2 rounded font-amharic shrink-0" title="በኦንላይን የተያዘ ቀጠሮ">
                                      <Globe className="w-2.5 h-2.5 text-sky-600" />
                                      <span>ኦንላይን</span>
                                    </span>
                                  )}
                                </div>

                                {/* Subtitle: Chair & Procedure */}
                                <div className={`text-xs truncate mt-0.5 ${isCancelled ? 'text-rose-700 font-bold' : 'text-slate-600 opacity-80'}`}>
                                  {isCancelled ? 'Cancelled Seating · Waiting' : `Chair ${apt.chairNumber || 1} · ${cleanProcedureName}`}
                                </div>

                                {/* ETB fee & time */}
                                {heightPx > 70 && (
                                  <div className="mt-auto flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                                    <span>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {apt.totalDueETB > 0 && (
                                      <span className="font-bold text-slate-700">{apt.totalDueETB.toLocaleString()} ETB</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* B. DAY VIEW: Operatory Side-by-Side (Chair 1 vs Chair 2)      */}
      {/* ============================================================ */}
      {viewMode === 'day' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden flex flex-col flex-1">
          {/* Header Row: Dual Operatory Columns */}
          <div className="grid grid-cols-[80px_1fr_1fr] border-b border-slate-200 text-center font-sans text-xs bg-slate-50/90 sticky top-0 z-20">
            <div className="py-3 border-r border-slate-200 text-slate-400 font-mono text-[11px] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="py-3 border-r border-slate-200 font-bold text-blue-900 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Chair 1 — Main Operatory (Dr. Senait Tadesse)</span>
            </div>

            <div className="py-3 font-bold text-emerald-900 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Chair 2 — Hygiene &amp; Endo (Dr. Dawit Bekele)</span>
            </div>
          </div>

          <div className="relative overflow-y-auto flex-1">
            {/* Live Real-time Indicator Line in Day View */}
            {selectedAnchorIsoString === todayIsoString && isNowInBusinessHours && (
              <div
                className="absolute left-[80px] right-0 z-30 pointer-events-none flex items-center"
                style={{ top: `${liveIndicatorTopPx}px` }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm -ml-1 animate-pulse" />
                <span className="h-0.5 bg-rose-500 flex-1 opacity-90 shadow-2xs" />
                <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded shadow-2xs mr-2">
                  LIVE · {nowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {/* Grid Hours */}
            <div className="divide-y divide-slate-100">
              {gridHours.map((hour) => {
                const hourFormatted = `${hour.toString().padStart(2, '0')}:00`;

                // Appointments for this specific hour
                const chair1Apts = dayAppointments.filter((a) => {
                  const aptHour = new Date(a.startsAt).getUTCHours();
                  return aptHour === hour && a.chairNumber === 1;
                });

                const chair2Apts = dayAppointments.filter((a) => {
                  const aptHour = new Date(a.startsAt).getUTCHours();
                  return aptHour === hour && a.chairNumber === 2;
                });

                return (
                  <div key={hour} className="grid grid-cols-[80px_1fr_1fr] min-h-[96px] group">
                    {/* Time Label */}
                    <div className="border-r border-slate-200 bg-slate-50/50 p-2 text-right font-mono text-[11px] font-semibold text-slate-400 flex items-start justify-end">
                      {hourFormatted}
                    </div>

                    {/* Chair 1 Column */}
                    <div className="border-r border-slate-200 p-2 relative bg-slate-50/10 hover:bg-blue-50/20 transition-colors">
                      {chair1Apts.length > 0 ? (
                        <div className="space-y-2">
                          {chair1Apts.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => handleOpenPatientChart(apt.id)}
                              className="p-3 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100/80 transition-all shadow-2xs cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                                  {apt.status === 'in_progress' && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white animate-pulse">
                                      In Chair 1
                                    </span>
                                  )}
                                  {apt.status === 'completed' && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                      <Check className="w-2.5 h-2.5" /> Done
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                                  {new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 mt-1 font-medium">{apt.serviceName}</p>

                              {/* Interactive Action Buttons */}
                              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-blue-200/60">
                                <span className="font-mono text-[11px] font-bold text-slate-700">{apt.totalDueETB.toLocaleString()} ETB</span>
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  {apt.status === 'confirmed' && (
                                    <button
                                      type="button"
                                      disabled={isOwner}
                                      onClick={() => {
                                        if (isOwner) return;
                                        sinnaStore.checkInPatient(apt.id);
                                        sinnaStore.toastSuccess('Patient Checked In', `${apt.patientName} checked in.`);
                                      }}
                                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors shadow-2xs ${
                                        isOwner
                                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                          : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                      title={isOwner ? 'Owner audit mode: Check-in restricted' : 'Check In'}
                                    >
                                      {isOwner ? 'Check In (Locked)' : 'Check In'}
                                    </button>
                                  )}
                                  {apt.status === 'checked_in' && (
                                    <button
                                      type="button"
                                      disabled={isOwner || isChair1Busy}
                                      onClick={() => {
                                        if (isOwner || isChair1Busy) return;
                                        sinnaStore.assignPatientToChair(apt.id, 1);
                                      }}
                                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors shadow-2xs ${
                                        isOwner
                                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                          : isChair1Busy
                                          ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                                          : 'bg-blue-600 text-white hover:bg-blue-700'
                                      }`}
                                      title={
                                        isOwner
                                          ? 'Owner audit mode: Operatory seating restricted'
                                          : isChair1Busy
                                          ? 'Dr. Senait is actively conducting treatment in Chair 1. Cannot seat another patient.'
                                          : 'Seat in Chair 1'
                                      }
                                    >
                                      {isOwner ? 'Seat Chair 1 (Locked)' : isChair1Busy ? 'Dr. Senait Busy' : 'Seat in Chair 1'}
                                    </button>
                                  )}
                                  {apt.status === 'in_progress' && (
                                    <button
                                      type="button"
                                      disabled={isOwner}
                                      onClick={() => {
                                        if (isOwner) return;
                                        sinnaStore.completeAppointment(apt.id);
                                      }}
                                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors shadow-2xs ${
                                        isOwner
                                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      }`}
                                      title={isOwner ? 'Owner audit mode: Completion restricted' : 'Complete treatment'}
                                    >
                                      {isOwner ? 'Complete (Locked)' : 'Complete'}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPatientChart(apt.id)}
                                    className="px-2 py-1 rounded bg-white text-slate-700 border border-slate-300 text-[10px] font-medium hover:bg-slate-50 transition-colors"
                                  >
                                    Chart
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (isOwner) return;
                            handleOpenSlotBooking(selectedAnchorIsoString, hour, 1);
                          }}
                          className={`h-full min-h-[80px] rounded-lg border border-dashed border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                            isOwner ? 'cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/40'
                          }`}
                          title={isOwner ? 'Owner audit mode: Booking restricted' : `Schedule into Chair 1 at ${hourFormatted}`}
                        >
                          <span className={`text-[11px] font-semibold flex items-center gap-1 ${isOwner ? 'text-slate-400' : 'text-blue-600'}`}>
                            <Plus className="w-3.5 h-3.5" /> {isOwner ? 'Locked Slot' : `Book Chair 1 (${hourFormatted})`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Chair 2 Column */}
                    <div className="p-2 relative bg-slate-50/10 hover:bg-emerald-50/20 transition-colors">
                      {chair2Apts.length > 0 ? (
                        <div className="space-y-2">
                          {chair2Apts.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => handleOpenPatientChart(apt.id)}
                              className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80 transition-all shadow-2xs cursor-pointer"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                                  {apt.status === 'in_progress' && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white animate-pulse">
                                      In Chair 2
                                    </span>
                                  )}
                                  {apt.status === 'completed' && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                      <Check className="w-2.5 h-2.5" /> Done
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                                  {new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 mt-1 font-medium">{apt.serviceName}</p>

                              {/* Interactive Action Buttons */}
                              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-emerald-200/60">
                                <span className="font-mono text-[11px] font-bold text-slate-700">{apt.totalDueETB.toLocaleString()} ETB</span>
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  {apt.status === 'confirmed' && (
                                    <button
                                      type="button"
                                      disabled={isOwner}
                                      onClick={() => {
                                        if (isOwner) return;
                                        sinnaStore.checkInPatient(apt.id);
                                        sinnaStore.toastSuccess('Patient Checked In', `${apt.patientName} checked in.`);
                                      }}
                                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors shadow-2xs ${
                                        isOwner
                                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      }`}
                                      title={isOwner ? 'Owner audit mode: Check-in restricted' : 'Check In'}
                                    >
                                      {isOwner ? 'Check In (Locked)' : 'Check In'}
                                    </button>
                                  )}
                                  {apt.status === 'checked_in' && (
                                    <button
                                      type="button"
                                      disabled={isOwner || isChair2Busy}
                                      onClick={() => {
                                        if (isOwner || isChair2Busy) return;
                                        sinnaStore.assignPatientToChair(apt.id, 2);
                                      }}
                                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors shadow-2xs ${
                                        isOwner
                                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                          : isChair2Busy
                                          ? 'bg-slate-400 text-white cursor-not-allowed opacity-75'
                                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      }`}
                                      title={
                                        isOwner
                                          ? 'Owner audit mode: Operatory seating restricted'
                                          : isChair2Busy
                                          ? 'Chair 2 is currently occupied.'
                                          : 'Seat in Chair 2'
                                      }
                                    >
                                      {isOwner ? 'Seat Chair 2 (Locked)' : isChair2Busy ? 'Chair 2 Busy' : 'Seat in Chair 2'}
                                    </button>
                                  )}
                                  {apt.status === 'in_progress' && (
                                    <button
                                      type="button"
                                      disabled={isOwner}
                                      onClick={() => {
                                        if (isOwner) return;
                                        sinnaStore.completeAppointment(apt.id);
                                      }}
                                      className={`px-2 py-1 rounded text-[10px] font-bold transition-colors shadow-2xs ${
                                        isOwner
                                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      }`}
                                      title={isOwner ? 'Owner audit mode: Completion restricted' : 'Complete treatment'}
                                    >
                                      {isOwner ? 'Complete (Locked)' : 'Complete'}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPatientChart(apt.id)}
                                    className="px-2 py-1 rounded bg-white text-slate-700 border border-slate-300 text-[10px] font-medium hover:bg-slate-50 transition-colors"
                                  >
                                    Chart
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onClick={() => handleOpenSlotBooking(selectedAnchorIsoString, hour, 2)}
                          className="h-full min-h-[80px] rounded-lg border border-dashed border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40"
                          title={`Schedule into Chair 2 at ${hourFormatted}`}
                        >
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Book Chair 2 ({hourFormatted})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* C. KANBAN VIEW: Patient Flow Stages (100% Fully Dynamic)     */}
      {/* ============================================================ */}
      {viewMode === 'kanban' && (
        <div className="flex-1 flex flex-col space-y-4 overflow-y-auto">
          {/* Kanban Scope Toggle Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Pipeline Scope:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setKanbanScope('today')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    kanbanScope === 'today'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today&apos;s Flow ({dateRangeLabel})
                </button>
                <button
                  type="button"
                  onClick={() => setKanbanScope('week')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    kanbanScope === 'week'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entire Week
                </button>
                <button
                  type="button"
                  onClick={() => setKanbanScope('all')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    kanbanScope === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Clinical Cases
                </button>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-500">
              Active Cases: <strong className="text-slate-900">{kanbanAppointments.length}</strong>
            </span>
          </div>

          {/* 4 Stage Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            {[
              {
                key: 'scheduled',
                label: 'Scheduled',
                filter: (a: Appointment) => a.status === 'confirmed',
                badgeStyle: 'border-blue-300 bg-blue-50 text-blue-900',
                borderHeader: 'border-t-4 border-t-blue-500',
              },
              {
                key: 'checked_in',
                label: 'Checked In / Waiting',
                filter: (a: Appointment) => a.status === 'checked_in',
                badgeStyle: 'border-amber-300 bg-amber-50 text-amber-900',
                borderHeader: 'border-t-4 border-t-amber-500',
              },
              {
                key: 'in_progress',
                label: 'Seated in Chair',
                filter: (a: Appointment) => a.status === 'in_progress',
                badgeStyle: 'border-emerald-300 bg-emerald-50 text-emerald-900',
                borderHeader: 'border-t-4 border-t-emerald-500',
              },
              {
                key: 'completed',
                label: 'Completed & Checked Out',
                filter: (a: Appointment) => a.status === 'completed',
                badgeStyle: 'border-slate-300 bg-slate-100 text-slate-800',
                borderHeader: 'border-t-4 border-t-slate-400',
              },
            ].map((col) => {
              const colAppointments = kanbanAppointments.filter(col.filter);

              return (
                <div
                  key={col.key}
                  className={`bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col min-h-[520px] shadow-2xs ${col.borderHeader}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <span className="font-bold text-slate-900 text-xs tracking-tight">{col.label}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${col.badgeStyle}`}>
                      {colAppointments.length}
                    </span>
                  </div>

                  {/* Appointment Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colAppointments.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs text-center border border-dashed border-slate-200 rounded-lg p-3">
                        <span>No cases in this stage</span>
                      </div>
                    ) : (
                      colAppointments.map((apt) => {
                        const isCancelled = apt.seatingStatus === 'cancelled_by_doctor';

                        return (
                          <div
                            key={apt.id}
                            onClick={() => handleOpenPatientChart(apt.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer shadow-2xs transition-all space-y-2 group hover:shadow-card ${
                              isCancelled
                                ? 'border-rose-300 bg-rose-50/70 hover:border-rose-400 ring-1 ring-rose-300/40'
                                : 'border-slate-200 bg-white hover:border-blue-400'
                            }`}
                          >
                            {/* Card Top: Name & Time */}
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isCancelled ? 'text-rose-600' : 'text-slate-900 group-hover:text-blue-600 transition-colors'}`}>
                                {apt.patientName}
                              </span>
                              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Procedure & Chair badge */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                                apt.chairNumber === 1
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                <Armchair className="w-3 h-3" />
                                Chair {apt.chairNumber || 1}
                              </span>
                              <span className="text-[11px] text-slate-600 font-medium truncate max-w-[150px]">
                                {apt.serviceName}
                              </span>
                            </div>

                            {/* Medical Alert Pill if present */}
                            {Array.isArray(apt.medicalAlerts) && apt.medicalAlerts.length > 0 && (
                              <div className="pt-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  {apt.medicalAlerts[0].labelEn}
                                </span>
                              </div>
                            )}

                            {/* Doctor & Fee */}
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                              <span>{apt.doctorName.includes('Senait') ? 'Dr. Senait' : 'Dr. Dawit'}</span>
                              <span className="font-mono text-slate-900 font-bold">{apt.totalDueETB.toLocaleString()} ETB</span>
                            </div>

                            {/* Dynamic Action Buttons per Stage */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {col.key === 'scheduled' && (
                                <button
                                  type="button"
                                  disabled={isOwner}
                                  onClick={() => {
                                    if (isOwner) return;
                                    sinnaStore.checkInPatient(apt.id);
                                    sinnaStore.toastSuccess('Patient Checked In', `${apt.patientName} is now in waiting lounge.`);
                                  }}
                                  className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 ${
                                    isOwner
                                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                  title={isOwner ? 'Owner audit mode: Check-in restricted' : 'Check In Patient'}
                                >
                                  <Check className={`w-3.5 h-3.5 ${isOwner ? 'text-slate-400' : 'text-white'}`} />
                                  <span>{isOwner ? 'Check In (Locked)' : 'Check In Patient'}</span>
                                </button>
                              )}

                              {col.key === 'checked_in' && (
                                <div className="grid grid-cols-2 gap-1.5 w-full">
                                  <button
                                    type="button"
                                    disabled={isOwner || isChair1Busy}
                                    onClick={() => {
                                      if (isOwner || isChair1Busy) return;
                                      sinnaStore.assignPatientToChair(apt.id, 1);
                                    }}
                                    className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold transition-colors ${
                                      isOwner
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                        : isChair1Busy
                                        ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-75'
                                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                    }`}
                                    title={
                                      isOwner
                                        ? 'Owner audit mode: Operatory seating restricted'
                                        : isChair1Busy
                                        ? 'Dr. Senait is actively conducting treatment in Chair 1.'
                                        : 'Seat in Chair 1'
                                    }
                                  >
                                    {isOwner ? 'Chair 1 (Locked)' : isChair1Busy ? 'Dr. Senait Busy' : 'Seat Chair 1'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isOwner || isChair2Busy}
                                    onClick={() => {
                                      if (isOwner || isChair2Busy) return;
                                      sinnaStore.assignPatientToChair(apt.id, 2);
                                    }}
                                    className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold transition-colors ${
                                      isOwner
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                        : isChair2Busy
                                        ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-75'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    }`}
                                    title={
                                      isOwner
                                        ? 'Owner audit mode: Operatory seating restricted'
                                        : isChair2Busy
                                        ? 'Chair 2 is currently occupied.'
                                        : 'Seat in Chair 2'
                                    }
                                  >
                                    {isOwner ? 'Chair 2 (Locked)' : isChair2Busy ? 'Chair 2 Busy' : 'Seat Chair 2'}
                                  </button>
                                </div>
                              )}

                              {col.key === 'in_progress' && (
                                <button
                                  type="button"
                                  disabled={isOwner}
                                  onClick={() => {
                                    if (isOwner) return;
                                    sinnaStore.completeAppointment(apt.id);
                                  }}
                                  className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors shadow-2xs flex items-center justify-center gap-1 ${
                                    isOwner
                                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  }`}
                                  title={isOwner ? 'Owner audit mode: Treatment completion restricted' : 'Complete Treatment'}
                                >
                                  <CheckCircle2 className={`w-3.5 h-3.5 ${isOwner ? 'text-slate-400' : 'text-white'}`} />
                                  <span>{isOwner ? 'Complete (Locked - Doctor Only)' : 'Complete Treatment'}</span>
                                </button>
                              )}

                              {col.key === 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPatientChart(apt.id)}
                                  className="w-full py-1 px-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Receipt className="w-3 h-3 text-slate-500" />
                                  View Receipt &amp; Chart
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Clinical Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDate={bookingInitialDate}
        initialSlot={bookingInitialSlot}
        initialChairNumber={bookingInitialChair}
      />
    </div>
  );
}
