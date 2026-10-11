'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Plus,
  QrCode,
  Armchair,
  Check,
  X,
  Phone,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { BookingModal } from '@/components/booking-modal';
import { PatientRecordDrawer } from '@/components/patient-record-drawer';
import { Appointment } from '@/lib/types';

export default function HomePage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const safeAppointments = Array.isArray(store.appointments) ? store.appointments : [];
  const safeChairs = Array.isArray(store.chairs) ? store.chairs : [];

  const waitingPatients = safeAppointments.filter((a) => a.status === 'checked_in');
  const inChairPatients = safeAppointments.filter((a) => a.status === 'in_progress');
  const inClinicNowCount = waitingPatients.length + inChairPatients.length;

  const todayAppointments = safeAppointments;
  const overdueAppointments = safeAppointments.filter((a) => a.paymentStatus === 'none' && a.totalDueETB > 0);

  // Time of day greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const operatorGreeting = store.currentUser?.name ? `${greetingTime}, ${store.currentUser.name.split(' ')[0]}` : `${greetingTime}, Admin`;

  const recentPatients = [
    { id: 'apt-001', name: 'Tigist Alemu', phone: '+251 91 144 5566', initials: 'TA', time: 'Today' },
    { id: 'apt-002', name: 'Abebe Kebede', phone: '+251 91 122 3344', initials: 'AK', time: 'Today' },
    { id: 'apt-003', name: 'Dawit Haile', phone: '+251 93 455 6677', initials: 'DH', time: 'Yesterday' },
    { id: 'apt-004', name: 'Sara Mengistu', phone: '+251 94 888 9900', initials: 'SM', time: 'Yesterday' },
    { id: 'apt-005', name: 'Meron Tesfaye', phone: '+251 92 333 4455', initials: 'MT', time: '2 days ago' },
    { id: 'apt-006', name: 'Yonas Getachew', phone: '+251 91 555 7788', initials: 'YG', time: '3 days ago' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER & PRIMARY ACTIONS (Exact match to DentalPin Home) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {operatorGreeting}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Saturday, October 10, 2026 · {clinic.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/book"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs transition-all active:scale-98 group"
            title="Open Public Patient Booking Link"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Patient Booking Link</span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600 ml-0.5" />
          </Link>

          <button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New appointment</span>
          </button>
        </div>
      </div>

      {/* 3. TOP 3 KPI STATUS CARDS (Appointments today, In clinic now, Overdue payments) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Appointments today */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {todayAppointments.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Appointments scheduled today
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: In clinic now */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {inClinicNowCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {inClinicNowCount > 0 ? 'Patients active in clinic' : 'No patients in clinic'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
            <Armchair className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Overdue payments (Red Warning Card from Screenshot) */}
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 shadow-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-900 font-mono">
                {overdueAppointments.length || 1}
              </span>
              <span className="text-xs font-bold text-rose-700 font-mono">
                · 6,000.00 ETB
              </span>
            </div>
            <p className="text-xs text-rose-700 mt-1">
              Overdue treatment payments
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4. TODAY SECTION (Timeline & Operatory Schedule) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Today
            </h2>
          </div>
          <Link
            href="/schedule"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>Open schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {todayAppointments.map((apt) => (
            <div
              key={apt.id}
              onClick={() => {
                setSelectedPatientId(apt.id);
                setDrawerOpen(true);
              }}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-xs text-slate-800 flex items-center justify-center shrink-0 group-hover:border-blue-400 group-hover:text-blue-600 transition-colors">
                  {new Date(apt.startsAt).getHours() || '10'}:00
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {apt.patientName}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600">{apt.serviceName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      apt.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : apt.status === 'checked_in'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : apt.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {apt.status === 'in_progress' ? 'In Chair' : apt.status === 'checked_in' ? 'Waiting' : apt.status === 'completed' ? 'Completed' : 'Confirmed'}
                    </span>
                    {(apt.patientChart?.cardNo || apt.patientChart?.medicalRecordNumber) && (
                      <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        {apt.patientChart.cardNo || apt.patientChart.medicalRecordNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Phone className="w-3 h-3" />
                      <span>{apt.patientPhone}</span>
                    </span>
                    <span>·</span>
                    <span>Doctor: {apt.doctorName}</span>
                    {apt.chairNumber && (
                      <>
                        <span>·</span>
                        <span className="text-blue-600 font-semibold">Chair {apt.chairNumber}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => sinnaStore.checkInAppointment(apt.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    Check In
                  </button>
                )}
                {apt.status === 'checked_in' && (
                  <button
                    onClick={() => sinnaStore.occupyChair(1, apt.id, apt.doctorName, apt.patientName)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                  >
                    Seat Chair 1
                  </button>
                )}
                {apt.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      setSelectedPatientId(apt.id);
                      setDrawerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    Clinical Chart
                  </button>
                )}
                {apt.status === 'completed' && (
                  <button
                    onClick={() => {
                      setSelectedPatientId(apt.id);
                      setDrawerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                  >
                    View Record
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedPatientId(apt.id);
                    setDrawerOpen(true);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Open Clinical Paper Chart"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. TWO-COLUMN LOWER SECTION (Exact match to DentalPin Home screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Block 1: Unconfirmed for tomorrow */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-6">
              Unconfirmed for tomorrow
            </h3>
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center mb-2">
                <Check className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-medium text-slate-500">
                All tomorrow's appointments confirmed
              </p>
            </div>
          </div>

          {/* Block 2: Overdue payments list */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Overdue payments
                </h3>
              </div>
              <Link
                href="/invoices"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <span>View all (1)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              <div
                onClick={() => {
                  setSelectedPatientId('apt-003');
                  setDrawerOpen(true);
                }}
                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">INV-2026-0037</span>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Dawit Haile</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      15 days overdue
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Single-Visit Root Canal Treatment
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    6,000.00 ETB
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Block 3: Recalls Summary Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recalls
              </h3>
              <Link
                href="/recalls"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Call list</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 grid grid-cols-4 divide-x divide-slate-100 text-center">
              <div>
                <div className="text-lg font-bold text-slate-900 font-mono">4</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Due this week</p>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 font-mono">2</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Overdue</p>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 font-mono">2</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Scheduled month</p>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900 font-mono">100%</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Conversion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Block 1: Recent patients */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent patients
              </h3>
              <Link
                href="/patients"
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
                title="View patient directory"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentPatients.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => {
                    setSelectedPatientId(pat.id);
                    setDrawerOpen(true);
                  }}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {pat.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {pat.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {pat.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400">{pat.time}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block 2: Week at a glance */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card">
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Week at a glance
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Last 7 days vs previous 7
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Appointments
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono block">
                  4
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">
                  +75%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Completed
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono block">
                  2 (50%)
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">
                  +100%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Invoiced
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono block truncate">
                  18,075 ETB
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">
                  +20%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
      )}

      <PatientRecordDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        appointmentId={selectedPatientId}
      />
    </div>
  );
}
