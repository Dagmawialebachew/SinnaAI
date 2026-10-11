'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  PhoneCall,
  Calendar,
  Download,
  Percent,
  FileText,
  CalendarPlus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Check,
  Send,
  X
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';

interface RecallPatient {
  id: string;
  name: string;
  tags: {
    priority: 'Normal' | 'High' | 'Urgent';
    category: 'Hygiene' | 'Post-Op' | 'Ortho' | 'Scaling';
    status: 'Pending' | 'Contacted' | 'Booked' | 'Overdue';
  };
  month: string;
  phone: string;
  description: string;
  isOverdue: boolean;
}

const INITIAL_RECALLS: RecallPatient[] = [
  {
    id: 'rec-001',
    name: 'Francisco García Romero',
    tags: {
      priority: 'Normal',
      category: 'Hygiene',
      status: 'Pending',
    },
    month: 'October 2026',
    phone: '+34 612 345 009',
    description: 'Recordatorio de higiene anual · Annual preventive calculus removal and stain polish.',
    isOverdue: false,
  },
  {
    id: 'rec-002',
    name: 'Pablo Fernández García',
    tags: {
      priority: 'Normal',
      category: 'Hygiene',
      status: 'Pending',
    },
    month: 'October 2026',
    phone: '+34 612 345 001',
    description: 'Recordatorio de higiene anual · Routine recall inspection and fluoride varnish.',
    isOverdue: false,
  },
  {
    id: 'rec-003',
    name: 'Abebe Kebede',
    tags: {
      priority: 'Urgent',
      category: 'Post-Op',
      status: 'Overdue',
    },
    month: 'October 2026',
    phone: '+251 91 122 3344',
    description: 'Post-Op Root Canal check on tooth #36. Verify apex healing and schedule final crown seat.',
    isOverdue: true,
  },
  {
    id: 'rec-004',
    name: 'Tigist Alemu',
    tags: {
      priority: 'High',
      category: 'Scaling',
      status: 'Pending',
    },
    month: 'October 2026',
    phone: '+251 91 144 5566',
    description: 'Periodontal maintenance scaling (Stage 2 gingivitis monitoring).',
    isOverdue: true,
  },
  {
    id: 'rec-005',
    name: 'Sara Mengistu',
    tags: {
      priority: 'Normal',
      category: 'Ortho',
      status: 'Pending',
    },
    month: 'October 2026',
    phone: '+251 94 888 9900',
    description: 'Aligner tray 6 progression check with Dr. Senait Tadesse.',
    isOverdue: false,
  },
];

export default function RecallsPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const [recalls, setRecalls] = useState<RecallPatient[]>(INITIAL_RECALLS);
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedReason, setSelectedReason] = useState('Any');
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [selectedPriority, setSelectedPriority] = useState('Any');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [callNotice, setCallNotice] = useState<string | null>(null);

  // Filter logic
  const filteredRecalls = recalls.filter((item) => {
    if (showOverdueOnly && !item.isOverdue) return false;
    if (selectedReason !== 'Any' && item.tags.category !== selectedReason) return false;
    if (selectedStatus !== 'Any' && item.tags.status !== selectedStatus) return false;
    if (selectedPriority !== 'Any' && item.tags.priority !== selectedPriority) return false;
    return true;
  });

  const handleCallPatient = (patient: RecallPatient) => {
    // Send AfroMessage SMS notification & show feedback
    sinnaStore.sendSms({
      id: `sms-${Date.now()}`,
      recipientName: patient.name,
      recipientPhone: patient.phone,
      templateType: 'reminder',
      contentEn: `Hello ${patient.name}, this is Bole Dental Studio. It is time for your dental recall: ${patient.description}. Please reply or call +251 91 122 3344 to confirm.`,
      contentAm: `ሰላም ${patient.name}፣ ከ ቦሌ ዴንታል ስቱዲዮ ነው። የቀጠሮ ማስታወሻ ደርሶዎታል። እባክዎ በ +251 91 122 3344 ያግኙን።`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setCallNotice(`Calling ${patient.name} (${patient.phone}) & queued recall SMS.`);
    setTimeout(() => setCallNotice(null), 3500);

    // Update status to Contacted
    setRecalls((prev) =>
      prev.map((r) => (r.id === patient.id ? { ...r, tags: { ...r.tags, status: 'Contacted' } } : r))
    );
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,Category,Priority,Status,Phone,Reason\n' +
      recalls.map((r) => `"${r.name}","${r.tags.category}","${r.tags.priority}","${r.tags.status}","${r.phone}","${r.description}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sinna_recalls_october_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER & EXPORT CSV (Exact match to Screenshot 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Call list
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dental Hygiene & Treatment Recall Follow-Up Schedule
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Alert toast when call clicked */}
      {callNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{callNotice}</span>
          </div>
          <button onClick={() => setCallNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. FOUR SUMMARY KPI CARDS (Exact match to Screenshot 1) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: 4 Due this week */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-center shadow-card">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            4
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Due this week
          </p>
        </div>

        {/* Card 2: 2 Overdue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-center shadow-card">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            2
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Overdue
          </p>
        </div>

        {/* Card 3: 2 Scheduled this month */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-center shadow-card">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            2
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scheduled this month
          </p>
        </div>

        {/* Card 4: 100% Conversion */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 text-center shadow-card">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
            100%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conversion
          </p>
        </div>
      </div>

      {/* 3. FILTER BAR (Exact match to Screenshot 1: Month, Reason, Status, Priority, Show Overdue) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Month Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Month
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="October 2026">October 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="December 2026">December 2026</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reason Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Reason
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[100px]"
            >
              <option value="Any">Any</option>
              <option value="Hygiene">Hygiene</option>
              <option value="Scaling">Scaling</option>
              <option value="Post-Op">Post-Op</option>
              <option value="Ortho">Ortho</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[100px]"
            >
              <option value="Any">Any</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Booked">Booked</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[90px]"
            >
              <option value="Any">Any</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Show overdue switch toggle */}
        <div className="flex items-center gap-3 pt-2 sm:pt-0">
          <span className="text-xs font-semibold text-slate-700">Show overdue</span>
          <button
            type="button"
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              showOverdueOnly ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                showOverdueOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. CALL LIST PATIENTS (Exact match to Screenshot 1 layout) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card divide-y divide-slate-100 overflow-hidden">
        {filteredRecalls.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No recall records matching current filter selection.
          </div>
        ) : (
          filteredRecalls.map((patient) => {
            const priorityBadge =
              patient.tags.priority === 'Urgent'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : patient.tags.priority === 'High'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            const categoryBadge = 'bg-sky-50 text-sky-700 border-sky-200';
            const statusBadge =
              patient.tags.status === 'Contacted'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : patient.tags.status === 'Overdue'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <div
                key={patient.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Patient Details, Tags, Phone, and Note */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {patient.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${priorityBadge}`}>
                      {patient.tags.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryBadge}`}>
                      {patient.tags.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusBadge}`}>
                      {patient.tags.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>{patient.month}</span>
                    <span className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{patient.phone}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {patient.description}
                  </p>
                </div>

                {/* Right: Actions row (Call Button, %, Notes, Calendar, More) */}
                <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0">
                  {/* Call Button (Exact match from Screenshot 1) */}
                  <button
                    type="button"
                    onClick={() => handleCallPatient(patient)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 active:scale-95 transition-all border border-sky-200 shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                    <span>Call</span>
                  </button>

                  {/* Quick Discount % Button */}
                  <button
                    type="button"
                    title="Apply promotional recall discount"
                    onClick={() => alert(`Applied 10% loyalty discount for ${patient.name}`)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/70 transition-colors"
                  >
                    <Percent className="w-3.5 h-3.5" />
                  </button>

                  {/* List / Notes Button */}
                  <button
                    type="button"
                    title="View treatment clinical notes"
                    onClick={() => alert(`Clinical history for ${patient.name}: Last cleaning on April 2026. Normal plaque index.`)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/70 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  {/* Calendar / Schedule Appointment Button */}
                  <Link
                    href={`/schedule?patient=${encodeURIComponent(patient.name)}`}
                    title="Book chair appointment"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/70 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                  </Link>

                  {/* More Options */}
                  <button
                    type="button"
                    title="More actions"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/70 transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
