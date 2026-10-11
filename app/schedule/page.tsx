'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  X
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { BookingModal } from '@/components/booking-modal';
import { PatientRecordDrawer } from '@/components/patient-record-drawer';
import { Appointment } from '@/lib/types';

type ViewMode = 'week' | 'day' | 'kanban';

export default function SchedulePage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Operatory Chair & Professional Filters (100% Free of 'Gabinete')
  const [activeChairs, setActiveChairs] = useState<number[]>([1, 2]);
  const [activeDoctors, setActiveDoctors] = useState<string[]>(['doc-senait', 'doc-dawit']);

  // Anchor date (simulated current time: Sunday, Oct 11, 2026)
  const [currentAnchorDate, setCurrentAnchorDate] = useState<Date>(
    new Date('2026-10-11T10:00:00Z')
  );

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

  // Week computation (Monday to Sunday)
  const weekDays = useMemo(() => {
    const anchor = new Date(currentAnchorDate);
    const dayOfWeek = anchor.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(anchor);
    monday.setDate(anchor.getDate() + diffToMonday);

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday =
        d.getDate() === 11 && d.getMonth() === 9 && d.getFullYear() === 2026;
      const isSaturday = d.getDay() === 6;

      days.push({
        date: d,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        formattedLabel: `${dayNames[d.getDay()]} ${d.getDate()}`,
        isoString: d.toISOString().split('T')[0],
        isToday,
        isSaturday,
      });
    }
    return days;
  }, [currentAnchorDate]);

  // Formatted date range: "Oct 5 - Oct 11, 2026"
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
    setCurrentAnchorDate(new Date('2026-10-11T10:00:00Z'));
  };

  // Filtered appointments
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

  // 11 Hours from 09:00 to 19:00 (matching DentalPin HTML: 09:00 - 19:00)
  // 4 slots per hour, slot height = 28px -> 112px per hour -> total height = 1232px
  const startHourNum = 9;
  const hoursCount = 11; // 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
  const gridHours = Array.from({ length: hoursCount }, (_, i) => startHourNum + i);

  // Helper to open chart
  const handleOpenPatientChart = (aptId: string) => {
    setSelectedPatientId(aptId);
    setDrawerOpen(true);
  };

  return (
    <div className="h-full flex flex-col w-full min-w-0 overflow-hidden pb-8 animate-fade-in">
      {/* 1. Header (Exact DentalPin Markup) */}
      <header className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Schedule
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View switcher tablist */}
            <div className="items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg overflow-x-auto inline-flex" role="tablist">
              <button
                type="button"
                role="tab"
                onClick={() => setViewMode('week')}
                aria-selected={viewMode === 'week'}
                className={`inline-flex items-center justify-center gap-1.5 text-xs rounded-md transition-colors whitespace-nowrap px-3 py-1.5 ${
                  viewMode === 'week'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>Week</span>
              </button>

              <button
                type="button"
                role="tab"
                onClick={() => setViewMode('day')}
                aria-selected={viewMode === 'day'}
                className={`inline-flex items-center justify-center gap-1.5 text-xs rounded-md transition-colors whitespace-nowrap px-3 py-1.5 ${
                  viewMode === 'day'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Day</span>
              </button>

              <button
                type="button"
                role="tab"
                onClick={() => setViewMode('kanban')}
                aria-selected={viewMode === 'kanban'}
                className={`inline-flex items-center justify-center gap-1.5 text-xs rounded-md transition-colors whitespace-nowrap px-3 py-1.5 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns3 className="w-4 h-4 shrink-0" />
                <span>Kanban</span>
              </button>
            </div>

            {/* + New appointment button (Exact DentalPin primary light button) */}
            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none"
            >
              <Plus className="shrink-0 w-4 h-4" />
              <span>New appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Filter Bar: Operatory Chair & Professional (Zero 'Gabinete') */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4 shrink-0 text-xs">
        {/* Chair Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium">Chair</span>
          <button
            type="button"
            onClick={() => toggleChair(1)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
              activeChairs.includes(1)
                ? 'bg-white text-slate-900 ring-1 ring-slate-300 font-semibold shadow-2xs'
                : 'bg-slate-50 text-slate-400 opacity-60 ring-1 ring-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'rgb(59, 130, 246)' }} />
            <span>Chair 1 (Main Operatory)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleChair(2)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
              activeChairs.includes(2)
                ? 'bg-white text-slate-900 ring-1 ring-slate-300 font-semibold shadow-2xs'
                : 'bg-slate-50 text-slate-400 opacity-60 ring-1 ring-slate-200'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: 'rgb(16, 185, 129)' }} />
            <span>Chair 2 (Hygiene &amp; Endo)</span>
          </button>
        </div>

        {/* Professional Filters */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-slate-400 font-medium shrink-0">Professional</span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar min-w-0">
            <button
              type="button"
              onClick={() => toggleDoctor('doc-senait')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                activeDoctors.includes('doc-senait')
                  ? 'bg-white text-slate-900 ring-1 ring-slate-300 font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-400 opacity-60 ring-1 ring-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: 'rgb(59, 130, 246)' }}>
                ST
              </span>
              <span>Dr. Senait Tadesse</span>
            </button>

            <button
              type="button"
              onClick={() => toggleDoctor('doc-dawit')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                activeDoctors.includes('doc-dawit')
                  ? 'bg-white text-slate-900 ring-1 ring-slate-300 font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-400 opacity-60 ring-1 ring-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: 'rgb(16, 185, 129)' }}>
                DB
              </span>
              <span>Dr. Dawit Bekele</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Date Controls & Range Label (Left buttons, Right title) */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous"
            className="rounded-md font-medium inline-flex items-center text-xs ring-1 ring-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 p-1.5 transition-colors shadow-2xs"
          >
            <ChevronLeft className="shrink-0 w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-md font-medium inline-flex items-center px-2.5 py-1.5 text-xs ring-1 ring-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next"
            className="rounded-md font-medium inline-flex items-center text-xs ring-1 ring-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 p-1.5 transition-colors shadow-2xs"
          >
            <ChevronRight className="shrink-0 w-4 h-4" />
          </button>
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {dateRangeLabel}
        </h2>
      </div>

      {/* 4. MAIN SCHEDULE VIEW CONTAINER */}
      {viewMode === 'week' && (
        <div className="flex-1 overflow-auto ring-1 ring-slate-200 rounded-xl bg-white shadow-2xs select-none">
          <div className="min-w-[800px]">
            {/* Sticky 8-Column Header Row */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 sticky top-0 z-30 text-xs font-sans">
              <div className="p-2 text-center text-slate-400 border-e border-slate-200"></div>
              {weekDays.map((day, idx) => (
                <div
                  key={day.isoString}
                  className={`p-2 text-center border-e border-slate-200 last:border-e-0 transition-colors ${
                    day.isToday ? 'bg-blue-50/80 font-bold' : ''
                  }`}
                >
                  <span className={day.isToday ? 'text-blue-700' : 'text-slate-700 font-medium'}>
                    {day.formattedLabel}
                  </span>
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
                      <span className="text-[11px] font-mono text-slate-400">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                    {weekDays.map((day) => (
                      <div
                        key={`${day.isoString}-${hour}-00`}
                        onClick={() => setBookingModalOpen(true)}
                        className={`border-e border-slate-100 last:border-e-0 cursor-cell hover:bg-blue-50/50 transition-colors relative ${
                          day.isToday ? 'bg-blue-50/40' : ''
                        }`}
                      />
                    ))}
                  </div>

                  {/* Slot 15 (:15 min) */}
                  <div className="grid grid-cols-8 border-b border-slate-100 h-[28px]">
                    <div className="p-1 text-end border-e border-slate-200 flex items-center justify-end pe-2"></div>
                    {weekDays.map((day) => (
                      <div
                        key={`${day.isoString}-${hour}-15`}
                        onClick={() => setBookingModalOpen(true)}
                        className={`border-e border-slate-100 last:border-e-0 cursor-cell hover:bg-blue-50/50 transition-colors relative ${
                          day.isToday ? 'bg-blue-50/40' : ''
                        }`}
                      />
                    ))}
                  </div>

                  {/* Slot 30 (:30 min) */}
                  <div className="grid grid-cols-8 border-b border-slate-100 h-[28px]">
                    <div className="p-1 text-end border-e border-slate-200 flex items-center justify-end pe-2"></div>
                    {weekDays.map((day) => (
                      <div
                        key={`${day.isoString}-${hour}-30`}
                        onClick={() => setBookingModalOpen(true)}
                        className={`border-e border-slate-100 last:border-e-0 cursor-cell hover:bg-blue-50/50 transition-colors relative ${
                          day.isToday ? 'bg-blue-50/40' : ''
                        }`}
                      />
                    ))}
                  </div>

                  {/* Slot 45 (:45 min) */}
                  <div className="grid grid-cols-8 border-b border-slate-100 h-[28px]">
                    <div className="p-1 text-end border-e border-slate-200 flex items-center justify-end pe-2"></div>
                    {weekDays.map((day) => (
                      <div
                        key={`${day.isoString}-${hour}-45`}
                        onClick={() => setBookingModalOpen(true)}
                        className={`border-e border-slate-100 last:border-e-0 cursor-cell hover:bg-blue-50/50 transition-colors relative ${
                          day.isToday ? 'bg-blue-50/40' : ''
                        }`}
                      />
                    ))}
                  </div>
                </React.Fragment>
              ))}

              {/* Absolute Overlay Layer for Closed Schedules & Appointments */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="grid grid-cols-8 h-full">
                  {/* Column 1: Time Gutter Divider */}
                  <div className="border-e border-slate-200"></div>

                  {/* Columns 2-8: 7 Day Columns */}
                  {weekDays.map((day, dayIndex) => {
                    // Filter appointments belonging to this day
                    const dayApts = filteredAppointments.filter((apt) => {
                      const aptDateStr = new Date(apt.startsAt).toISOString().split('T')[0];
                      return aptDateStr === day.isoString;
                    });

                    return (
                      <div key={day.isoString} className="relative border-e border-slate-200/60 last:border-e-0">
                        
                        {/* 1. Closed Schedules Blocks (matching DentalPin HTML) */}
                        {day.isSaturday ? (
                          // Saturday: Clinic Closed Full Day with Authentic Diagonal Stripes
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
                          // Weekdays: Afternoon Closed Break from 14:00 to 16:00 (top: 560px, height: 224px)
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

                        {/* 2. Today Live Time Indicator Line (Sunday 11 at 10:15) */}
                        {day.isToday && (
                          <div
                            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                            style={{ top: '140px' }} // 10:15 = 1 hour 15 min = 112 + 28 = 140px
                          >
                            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-2xs -ml-1" />
                            <span className="h-px bg-rose-500 flex-1 opacity-80" />
                          </div>
                        )}

                        {/* 3. Appointment Cards (Exact DentalPin Card Design with Ethiopian Data & Zero 'Gabinete') */}
                        {dayApts.map((apt) => {
                          const startTime = new Date(apt.startsAt);
                          const endTime = new Date(apt.endsAt);
                          const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                          const endHour = endTime.getHours() + endTime.getMinutes() / 60;
                          const durationHours = Math.max(0.65, endHour - startHour);

                          // Slot height is 28px, 4 slots = 112px/hour
                          const topPx = Math.max(0, (startHour - 9) * 112);
                          const heightPx = Math.max(56, durationHours * 112);

                          const isChair1 = apt.chairNumber === 1;
                          const chairBorderColor = isChair1 ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)';
                          const chairBg = isChair1 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)';
                          const doctorInitials = apt.doctorName.includes('Senait') ? 'ST' : 'DB';
                          const doctorBg = doctorInitials === 'ST' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)';

                          // Professional procedural label
                          const cleanProcedureName = apt.serviceName || 'Clinical Consultation';

                          return (
                            <div
                              key={apt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatientChart(apt.id);
                              }}
                              className="group absolute rounded overflow-hidden pointer-events-auto select-none shadow-xs bg-white ring-1 ring-slate-200 text-slate-900 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                minHeight: '28px',
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

                                {/* Hover action trigger top-left */}
                                <div className="absolute top-0.5 start-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                  <button
                                    type="button"
                                    aria-label="Appointment actions"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      sinnaStore.toastSuccess('Patient Check-In', `${apt.patientName} checked in for Chair ${apt.chairNumber || 1}.`);
                                    }}
                                    className="rounded p-0.5 text-slate-700 bg-white/90 hover:bg-white shadow-2xs transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  </button>
                                </div>

                                {/* Patient Name row */}
                                <div className="flex items-center gap-1 min-h-[18px] pe-5 ps-5">
                                  <Check className="w-3 h-3 flex-shrink-0 text-emerald-600" />
                                  <span className="text-xs font-semibold truncate text-slate-900">
                                    {apt.patientName}
                                  </span>
                                </div>

                                {/* Subtitle: Chair & Procedure (Clean English Clinical Standard) */}
                                <div className="text-xs text-slate-600 truncate opacity-80 mt-0.5">
                                  Chair {apt.chairNumber || 1} · {cleanProcedureName}
                                </div>

                                {/* Optional ETB fee tag if card is tall enough */}
                                {heightPx > 80 && (
                                  <div className="mt-auto flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                                    <span>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {apt.totalDueETB > 0 && (
                                      <span className="font-bold text-slate-700">{apt.totalDueETB.toLocaleString()} ETB</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Resize Handle at bottom with pill thumb */}
                              <div className="absolute bottom-0 start-0 end-0 h-2 cursor-ns-resize hover:bg-black/10 transition-colors">
                                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-current opacity-30 rounded" />
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

      {/* 5. DAY VIEW: Operatory Side-by-Side (Chair 1 & Chair 2) */}
      {viewMode === 'day' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
          <div className="grid grid-cols-[64px_repeat(2,1fr)] border-b border-slate-200 text-center font-sans text-xs bg-slate-50/70">
            <div className="py-2.5 border-r border-slate-200 text-slate-400 font-mono text-[11px] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="py-2.5 border-r border-slate-200 font-bold text-blue-900 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Chair 1 — Main Operatory (Dr. Senait Tadesse)</span>
            </div>

            <div className="py-2.5 font-bold text-emerald-900 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Chair 2 — Hygiene &amp; Endo (Dr. Dawit Bekele)</span>
            </div>
          </div>

          <div className="relative overflow-x-auto min-h-[560px]">
            <div className="grid grid-cols-[64px_repeat(2,1fr)] min-w-[600px]">
              {/* Hour Labels */}
              <div className="border-r border-slate-200 bg-slate-50/40">
                {gridHours.map((hour) => (
                  <div key={hour} className="h-20 border-b border-slate-100 pr-2 pt-1.5 text-right font-mono text-[11px] text-slate-400">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Chair 1 Column */}
              <div className="relative border-r border-slate-200 p-2 space-y-2">
                {filteredAppointments
                  .filter((a) => a.chairNumber === 1)
                  .map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleOpenPatientChart(apt.id)}
                      className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{apt.patientName}</span>
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          {new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">Chair 1 · {apt.serviceName}</p>
                    </div>
                  ))}
              </div>

              {/* Chair 2 Column */}
              <div className="relative p-2 space-y-2">
                {filteredAppointments
                  .filter((a) => a.chairNumber === 2)
                  .map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleOpenPatientChart(apt.id)}
                      className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{apt.patientName}</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">Chair 2 · {apt.serviceName}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. KANBAN VIEW: Patient Flow Stages */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: 'scheduled', label: 'Scheduled', count: filteredAppointments.filter((a) => a.status === 'confirmed').length, color: 'border-blue-400 bg-blue-50 text-blue-900' },
            { key: 'checked_in', label: 'Checked In / Waiting', count: filteredAppointments.filter((a) => a.status === 'checked_in').length, color: 'border-amber-400 bg-amber-50 text-amber-900' },
            { key: 'in_progress', label: 'Seated in Chair', count: filteredAppointments.filter((a) => a.status === 'in_progress').length, color: 'border-emerald-400 bg-emerald-50 text-emerald-900' },
            { key: 'completed', label: 'Completed & Checked Out', count: filteredAppointments.filter((a) => a.status === 'completed').length, color: 'border-slate-300 bg-slate-50 text-slate-800' },
          ].map((col) => (
            <div key={col.key} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col min-h-[500px] shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-bold text-slate-900 text-xs">{col.label}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${col.color}`}>
                  {col.count}
                </span>
              </div>

              <div className="space-y-2.5 flex-1">
                {filteredAppointments
                  .filter((a) => {
                    if (col.key === 'scheduled') return a.status === 'confirmed';
                    return a.status === col.key;
                  })
                  .map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => handleOpenPatientChart(apt.id)}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 cursor-pointer shadow-2xs transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{apt.patientName}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">
                        Chair {apt.chairNumber || 1} · {apt.serviceName}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-500">{apt.doctorName.includes('Senait') ? 'Dr. Senait' : 'Dr. Dawit'}</span>
                        <span className="font-mono text-emerald-700 font-bold">{apt.totalDueETB.toLocaleString()} ETB</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. Clinical Modals & Patient Record Drawer */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      <PatientRecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        appointmentId={selectedPatientId}
      />
    </div>
  );
}
