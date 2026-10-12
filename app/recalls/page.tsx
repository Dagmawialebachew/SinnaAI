'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  PhoneOff,
  Calendar,
  CalendarPlus,
  Download,
  ListPlus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Check,
  Send,
  X,
  User,
  ExternalLink,
  FileText,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { BookingModal } from '@/components/booking-modal';

interface RecallPatient {
  id: string;
  name: string;
  nameAmharic: string;
  mrn: string;
  tags: {
    priority: 'Normal' | 'High' | 'Urgent';
    category: 'Hygiene' | 'Post-Op' | 'Ortho' | 'Scaling' | 'Preventive';
    status: 'Pending' | 'Contacted' | 'Booked' | 'Overdue' | 'No Answer';
  };
  month: string;
  phone: string;
  description: string;
  descriptionAmharic: string;
  feeETB: number;
  subcity: string;
  isOverdue: boolean;
  lastAttempt?: string;
}

const INITIAL_RECALLS: RecallPatient[] = [
  {
    id: 'apt-001',
    name: 'Tigist Alemu',
    nameAmharic: 'ትዕግስት አለሙ ደስታ',
    mrn: 'BDS-MRN-2026-0041',
    tags: {
      priority: 'Normal',
      category: 'Hygiene',
      status: 'Pending',
    },
    month: 'October 2026',
    phone: '+251 91 144 5566',
    description: 'Annual ultrasonic scaling & prophylaxis recall. Last calculus debridement 6 months ago.',
    descriptionAmharic: 'የዓመት ጥርስ ማፅዳትና የካልኩለስ ክትትል ቀጠሮ ማስታወሻ።',
    feeETB: 1500,
    subcity: 'Bole Subcity, Woreda 03 (Brass Hospital Area)',
    isOverdue: false,
  },
  {
    id: 'apt-002',
    name: 'Dawit Haile',
    nameAmharic: 'ዳዊት ኃይሌ ገብረ',
    mrn: 'BDS-MRN-2026-0089',
    tags: {
      priority: 'Urgent',
      category: 'Post-Op',
      status: 'Overdue',
    },
    month: 'October 2026',
    phone: '+251 91 133 7788',
    description: 'Post-Op Root Canal check on tooth #36 with Dr. Senait Tadesse. Verify periapical apex healing before permanent crown seat.',
    descriptionAmharic: 'የስር ቦይ ህክምና (RCT) ድህረ-ቀዶ ጥገና ምርመራ እና የክራውን ዝግጅት ክትትል።',
    feeETB: 6000,
    subcity: 'Bole Subcity, Woreda 04 (Rwanda Area)',
    isOverdue: true,
  },
  {
    id: 'apt-003',
    name: 'Sara Mengistu',
    nameAmharic: 'ሳራ መንግስቱ ታደሰ',
    mrn: 'BDS-MRN-2026-0155',
    tags: {
      priority: 'Normal',
      category: 'Ortho',
      status: 'Pending',
    },
    month: 'October 2026',
    phone: '+251 94 888 9900',
    description: 'Orthodontic archwire progression check & elastomeric ring change with Dr. Senait Tadesse.',
    descriptionAmharic: 'የኦርቶዶንቲክስ (የጥርስ ሽቦ) ወርሃዊ ማስተካከያ ክትትል።',
    feeETB: 1200,
    subcity: 'Bole Subcity, Woreda 02 (Olympia Area)',
    isOverdue: false,
  },
  {
    id: 'apt-004',
    name: 'Abebe Kebede',
    nameAmharic: 'አበበ ከበደ ወርቁ',
    mrn: 'BDS-MRN-2026-0012',
    tags: {
      priority: 'High',
      category: 'Scaling',
      status: 'Overdue',
    },
    month: 'October 2026',
    phone: '+251 91 122 3344',
    description: 'Periodontal maintenance scaling & subgingival chlorhexidine irrigation (Stage 2 gingivitis monitoring).',
    descriptionAmharic: 'የድድ ህመም ክትትል ጥልቅ የጥርስ ማፅዳትና የመድኃኒት ማጠብ።',
    feeETB: 2200,
    subcity: 'Bole Subcity, Woreda 05 (Atlas Area)',
    isOverdue: true,
  },
  {
    id: 'apt-010',
    name: 'Almaz Wolde',
    nameAmharic: 'አልማዝ ወልዴ ገብረ',
    mrn: 'BDS-MRN-2026-0312',
    tags: {
      priority: 'Normal',
      category: 'Preventive',
      status: 'Booked',
    },
    month: 'October 2026',
    phone: '+251 91 234 5678',
    description: '6-Month routine oral health checkup & topical fluoride varnish application.',
    descriptionAmharic: 'የ6 ወር መደበኛ የአፍና ጥርስ ጤና ምርመራ እና የፍሎራይድ ቅባት።',
    feeETB: 800,
    subcity: 'Bole Subcity, Woreda 01 (Edna Mall Area)',
    isOverdue: false,
  },
  {
    id: 'apt-006',
    name: 'Yonas Bekele',
    nameAmharic: 'ዮናስ በቀለ ተፈራ',
    mrn: 'BDS-MRN-2026-0244',
    tags: {
      priority: 'High',
      category: 'Hygiene',
      status: 'Pending',
    },
    month: 'October 2026',
    phone: '+251 92 345 6789',
    description: 'Heavy smoker stain removal and air-flow bicarbonate polish prophylaxis.',
    descriptionAmharic: 'የጭስ እድፍ ማፅዳትና የጥርስ ኤናሜል ማከም ክትትል።',
    feeETB: 1800,
    subcity: 'Yeka Subcity, Woreda 08 (Signal Area)',
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
  
  // Feedback & Action states
  const [activeActionsMenuId, setActiveActionsMenuId] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPatientForBooking, setSelectedPatientForBooking] = useState<RecallPatient | null>(null);
  
  // Log attempt modal
  const [logAttemptModalPatient, setLogAttemptModalPatient] = useState<RecallPatient | null>(null);
  const [logAttemptOutcome, setLogAttemptOutcome] = useState('Spoke with Patient - Will Book This Week');
  const [logAttemptNote, setLogAttemptNote] = useState('');

  // AfroMessage SMS Modal
  const [smsModalPatient, setSmsModalPatient] = useState<RecallPatient | null>(null);

  // Filter logic
  const filteredRecalls = recalls.filter((item) => {
    if (showOverdueOnly && !item.isOverdue) return false;
    if (selectedReason !== 'Any' && item.tags.category !== selectedReason) return false;
    if (selectedStatus !== 'Any' && item.tags.status !== selectedStatus) return false;
    if (selectedPriority !== 'Any' && item.tags.priority !== selectedPriority) return false;
    return true;
  });

  // KPI Calculations
  const dueThisWeekCount = recalls.filter((r) => r.tags.status === 'Pending').length;
  const overdueCount = recalls.filter((r) => r.isOverdue || r.tags.status === 'Overdue').length;
  const scheduledCount = recalls.filter((r) => r.tags.status === 'Booked').length;
  const conversionRate = Math.round((scheduledCount / (scheduledCount + dueThisWeekCount || 1)) * 100);

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

    sinnaStore.toastSuccess(
      'Call Logged',
      `Calling ${patient.name} (${patient.phone}). Automated AfroMessage SMS reminder dispatched.`
    );

    // Update status to Contacted
    setRecalls((prev) =>
      prev.map((r) => (r.id === patient.id ? { ...r, tags: { ...r.tags, status: 'Contacted' }, lastAttempt: 'Called just now' } : r))
    );
  };

  const handleNoAnswer = (patient: RecallPatient) => {
    setRecalls((prev) =>
      prev.map((r) =>
        r.id === patient.id
          ? {
              ...r,
              tags: { ...r.tags, status: 'No Answer' },
              lastAttempt: `No answer at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            }
          : r
      )
    );
    sinnaStore.toastInfo(
      'No Answer Logged',
      `${patient.name} marked as No Answer. Follow-up reminder queued for reception.`
    );
  };

  const handleSaveAttempt = () => {
    if (!logAttemptModalPatient) return;
    setRecalls((prev) =>
      prev.map((r) =>
        r.id === logAttemptModalPatient.id
          ? {
              ...r,
              tags: { ...r.tags, status: 'Contacted' },
              lastAttempt: `${logAttemptOutcome}${logAttemptNote ? ` · Note: ${logAttemptNote}` : ''}`,
            }
          : r
      )
    );
    sinnaStore.toastSuccess(
      'Recall Attempt Saved',
      `Attempt logged for ${logAttemptModalPatient.name}: ${logAttemptOutcome}`
    );
    setLogAttemptModalPatient(null);
    setLogAttemptNote('');
  };

  const handleSendAfroMessageSms = () => {
    if (!smsModalPatient) return;
    sinnaStore.sendSms({
      id: `sms-${Date.now()}`,
      recipientName: smsModalPatient.name,
      recipientPhone: smsModalPatient.phone,
      templateType: 'reminder',
      contentEn: `Bole Dental Studio: Dear ${smsModalPatient.name}, your routine clinical recall (${smsModalPatient.tags.category}) is due. Contact +251 91 122 3344 or visit us in Bole to book.`,
      contentAm: `ቦሌ ዴንታል ስቱዲዮ፡ ውድ ${smsModalPatient.name}፣ የጥርስ ምርመራና ክትትል ቀጠሮዎ ደርሷል። በ +251 91 122 3344 ይደውሉልን።`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    sinnaStore.toastSuccess(
      'AfroMessage SMS Sent',
      `Bilingual SMS reminder successfully delivered to ${smsModalPatient.phone}.`
    );
    setRecalls((prev) =>
      prev.map((r) => (r.id === smsModalPatient.id ? { ...r, tags: { ...r.tags, status: 'Contacted' } } : r))
    );
    setSmsModalPatient(null);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Patient Name,Amharic Name,MRN,Subcity,Category,Priority,Status,Phone,Recall Fee (ETB),Clinical Description\n' +
      recalls
        .map(
          (r) =>
            `"${r.name}","${r.nameAmharic}","${r.mrn}","${r.subcity}","${r.tags.category}","${r.tags.priority}","${r.tags.status}","${r.phone}","${r.feeETB} ETB","${r.description}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sinna_dental_recalls_october_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sinnaStore.toastSuccess('CSV Exported', 'Ethiopian recall call list exported successfully.');
  };

  return (
    <div className="container mx-auto p-4 space-y-4 max-w-7xl animate-fade-in pb-16">
      {/* 1. TOP HEADER & EXPORT CSV (Exact DentalPin Standard) */}
      <header className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Call list
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bole Dental Studio · Ethiopian Patient Recall & Hygiene Follow-up
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 shadow-2xs"
        >
          <Download className="shrink-0 w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </header>

      {/* 2. FOUR SUMMARY KPI CARDS (Exact DentalPin Geometry) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="overflow-hidden shadow-2xs rounded-lg bg-white border border-slate-200/90 divide-y divide-slate-100">
          <div className="sm:p-5 p-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {dueThisWeekCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Due this week
            </div>
          </div>
        </div>

        <div className="overflow-hidden shadow-2xs rounded-lg bg-white border border-slate-200/90 divide-y divide-slate-100">
          <div className="sm:p-5 p-3">
            <div className="text-2xl sm:text-3xl font-bold text-rose-600 font-mono tracking-tight">
              {overdueCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Overdue
            </div>
          </div>
        </div>

        <div className="overflow-hidden shadow-2xs rounded-lg bg-white border border-slate-200/90 divide-y divide-slate-100">
          <div className="sm:p-5 p-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight">
              {scheduledCount}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Scheduled this month
            </div>
          </div>
        </div>

        <div className="overflow-hidden shadow-2xs rounded-lg bg-white border border-slate-200/90 divide-y divide-slate-100">
          <div className="sm:p-5 p-3">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono tracking-tight">
              {conversionRate}%
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Conversion
            </div>
          </div>
        </div>
      </section>

      {/* 3. FILTER BAR (Exact DentalPin 5-slot grid: Month, Reason, Status, Priority, Show Overdue) */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs">
        {/* Month Selector */}
        <div className="text-sm">
          <div className="flex content-center items-center justify-between gap-1 mb-1">
            <label className="block text-xs font-medium text-slate-700">Month</label>
          </div>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md font-medium inline-flex items-center text-xs px-2.5 py-1.5 border border-slate-200/90 text-slate-800 bg-white hover:bg-slate-50 w-full justify-between focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
              <option value="December 2026">December 2026</option>
            </select>
          </div>
        </div>

        {/* Reason / Category */}
        <div className="text-sm">
          <div className="flex content-center items-center justify-between gap-1 mb-1">
            <label className="block text-xs font-medium text-slate-700">Reason</label>
          </div>
          <div className="relative">
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="rounded-md font-medium inline-flex items-center text-xs px-2.5 py-1.5 border border-slate-200/90 text-slate-800 bg-white hover:bg-slate-50 w-full justify-between focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="Any">Any</option>
              <option value="Hygiene">Hygiene</option>
              <option value="Scaling">Scaling</option>
              <option value="Post-Op">Post-Op</option>
              <option value="Ortho">Ortho</option>
              <option value="Preventive">Preventive</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div className="text-sm">
          <div className="flex content-center items-center justify-between gap-1 mb-1">
            <label className="block text-xs font-medium text-slate-700">Status</label>
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-md font-medium inline-flex items-center text-xs px-2.5 py-1.5 border border-slate-200/90 text-slate-800 bg-white hover:bg-slate-50 w-full justify-between focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="Any">Any</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Booked">Booked</option>
              <option value="No Answer">No Answer</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Priority */}
        <div className="text-sm">
          <div className="flex content-center items-center justify-between gap-1 mb-1">
            <label className="block text-xs font-medium text-slate-700">Priority</label>
          </div>
          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-md font-medium inline-flex items-center text-xs px-2.5 py-1.5 border border-slate-200/90 text-slate-800 bg-white hover:bg-slate-50 w-full justify-between focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="Any">Any</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Show overdue Toggle */}
        <div className="text-sm flex flex-col justify-between">
          <div className="flex content-center items-center justify-between gap-1 mb-1">
            <label className="block text-xs font-medium text-slate-700">Show overdue</label>
          </div>
          <div className="relative flex items-center h-7">
            <button
              type="button"
              role="switch"
              aria-checked={showOverdueOnly}
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`inline-flex items-center shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 w-9 h-5 ${
                showOverdueOnly ? 'bg-sky-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none rounded-full bg-white shadow-md transform transition-transform duration-200 size-4 ${
                  showOverdueOnly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 4. CALL LIST ENTRIES (Exact DentalPin item styling adapted for Ethiopia) */}
      <div>
        <ul className="space-y-2">
          {filteredRecalls.length === 0 ? (
            <li className="p-8 text-center bg-white border border-slate-200/80 rounded-xl text-slate-400 text-xs">
              No clinical recall records matching current filter selection.
            </li>
          ) : (
            filteredRecalls.map((patient) => {
              const priorityClass =
                patient.tags.priority === 'Urgent'
                  ? 'bg-rose-50 text-rose-700 ring-rose-200'
                  : patient.tags.priority === 'High'
                  ? 'bg-amber-50 text-amber-700 ring-amber-200'
                  : 'bg-sky-50 text-sky-700 ring-sky-200';

              const statusClass =
                patient.tags.status === 'Contacted'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : patient.tags.status === 'Booked'
                  ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                  : patient.tags.status === 'Overdue'
                  ? 'bg-rose-50 text-rose-700 ring-rose-200'
                  : patient.tags.status === 'No Answer'
                  ? 'bg-slate-100 text-slate-600 ring-slate-200'
                  : 'bg-slate-100 text-slate-700 ring-slate-200';

              return (
                <li key={patient.id}>
                  <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 hover:border-slate-300 transition-colors shadow-2xs">
                    {/* Left: Patient Details & Clinical Context */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/patients`}
                          className="font-semibold text-slate-900 hover:text-sky-600 transition-colors text-sm"
                        >
                          {patient.name}
                        </Link>
                        <span className="text-xs text-slate-400 font-amharic hidden sm:inline">
                          ({patient.nameAmharic})
                        </span>
                        
                        {/* Priority Badge */}
                        <span className={`font-semibold inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md ring-1 ring-inset ${priorityClass}`}>
                          {patient.tags.priority}
                        </span>

                        {/* Category Badge */}
                        <span className="font-semibold inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200">
                          {patient.tags.category}
                        </span>

                        {/* Status Badge */}
                        <span className={`font-semibold inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md ring-1 ring-inset ${statusClass}`}>
                          {patient.tags.status}
                        </span>

                        {/* MRN Token */}
                        <span className="font-mono text-[10px] text-slate-400 hidden md:inline">
                          {patient.mrn}
                        </span>
                      </div>

                      {/* Sub-row: Month, Phone, Location & Last Attempt */}
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{patient.month}</span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1 text-slate-700 font-mono font-medium">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span dir="ltr">{patient.phone}</span>
                        </span>
                        <span className="text-slate-300 hidden md:inline">•</span>
                        <span className="text-slate-500 hidden md:inline truncate">{patient.subcity}</span>
                        {patient.lastAttempt && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {patient.lastAttempt}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Description & Clinical Fee */}
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {patient.description}
                        <span className="font-mono font-semibold text-emerald-700 ml-2">
                          [{patient.feeETB.toLocaleString()} ETB]
                        </span>
                      </p>
                    </div>

                    {/* Right: DentalPin Quick Action Buttons */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap self-end sm:self-auto relative">
                      {/* Direct Phone Call Button */}
                      <a
                        href={`tel:${patient.phone}`}
                        onClick={() => handleCallPatient(patient)}
                        className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border border-sky-200 shadow-2xs"
                        title={`Call ${patient.phone}`}
                      >
                        <Phone className="shrink-0 w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>

                      {/* AfroMessage SMS Button */}
                      <button
                        type="button"
                        onClick={() => setSmsModalPatient(patient)}
                        className="rounded-md font-medium inline-flex items-center transition-colors px-2 py-1.5 text-xs gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-2xs"
                        title="Send AfroMessage SMS Reminder (Amharic & English)"
                      >
                        <Send className="shrink-0 w-3.5 h-3.5" />
                        <span className="hidden sm:inline">SMS</span>
                      </button>

                      {/* No Answer Button */}
                      <button
                        type="button"
                        onClick={() => handleNoAnswer(patient)}
                        aria-label="No answer"
                        title="Log: No Answer"
                        className="rounded-md font-medium inline-flex items-center transition-colors text-xs text-slate-600 hover:bg-slate-100 active:bg-slate-200 p-1.5 border border-slate-200"
                      >
                        <PhoneOff className="shrink-0 w-3.5 h-3.5" />
                      </button>

                      {/* Log Attempt Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setLogAttemptModalPatient(patient);
                          setLogAttemptNote('');
                        }}
                        aria-label="Log attempt"
                        title="Log call notes / attempt"
                        className="rounded-md font-medium inline-flex items-center transition-colors text-xs text-slate-600 hover:bg-slate-100 active:bg-slate-200 p-1.5 border border-slate-200"
                      >
                        <ListPlus className="shrink-0 w-3.5 h-3.5" />
                      </button>

                      {/* Book Appointment Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatientForBooking(patient);
                          setBookingModalOpen(true);
                        }}
                        aria-label="Book appointment"
                        title="Book operatory appointment"
                        className="rounded-md font-medium inline-flex items-center transition-colors text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1.5 border border-indigo-200"
                      >
                        <CalendarPlus className="shrink-0 w-3.5 h-3.5" />
                      </button>

                      {/* More Vertical Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveActionsMenuId(activeActionsMenuId === patient.id ? null : patient.id)}
                          aria-label="Actions"
                          title="More actions"
                          className="rounded-md font-medium inline-flex items-center transition-colors text-xs text-slate-600 hover:bg-slate-100 active:bg-slate-200 p-1.5 border border-slate-200"
                        >
                          <MoreVertical className="shrink-0 w-3.5 h-3.5" />
                        </button>

                        {activeActionsMenuId === patient.id && (
                          <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in-50 zoom-in-95">
                            <Link
                              href="/patients"
                              onClick={() => setActiveActionsMenuId(null)}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <User className="w-3.5 h-3.5 text-sky-600" />
                              <span>View Clinical Chart</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveActionsMenuId(null);
                                setRecalls((prev) =>
                                  prev.map((r) => (r.id === patient.id ? { ...r, tags: { ...r.tags, status: 'Booked' } } : r))
                                );
                                sinnaStore.toastSuccess('Marked Scheduled', `${patient.name} marked as Booked for this cycle.`);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mark as Scheduled</span>
                            </button>

                            <Link
                              href="/schedule"
                              onClick={() => setActiveActionsMenuId(null)}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Dispatch to Chair 1/2</span>
                            </Link>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveActionsMenuId(null);
                                navigator.clipboard?.writeText(patient.phone);
                                sinnaStore.toastSuccess('Copied', `Phone ${patient.phone} copied to clipboard.`);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Phone Number</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* 5. LOG ATTEMPT MODAL */}
      {logAttemptModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ListPlus className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Log Call Attempt · {logAttemptModalPatient.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLogAttemptModalPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Call Outcome</label>
                <select
                  value={logAttemptOutcome}
                  onChange={(e) => setLogAttemptOutcome(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="Spoke with Patient - Will Book This Week">Spoke with Patient - Will Book This Week</option>
                  <option value="Left Voicemail / SMS Dispatched">Left Voicemail / SMS Dispatched</option>
                  <option value="Spoke with Family Member">Spoke with Family Member</option>
                  <option value="Requested Callback Next Month">Requested Callback Next Month</option>
                  <option value="Number Busy / No Answer">Number Busy / No Answer</option>
                  <option value="Patient Declined Recall Cycle">Patient Declined Recall Cycle</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical / Receptionist Note</label>
                <textarea
                  rows={3}
                  value={logAttemptNote}
                  onChange={(e) => setLogAttemptNote(e.target.value)}
                  placeholder="Enter details (e.g. Patient is travelling until next Tuesday, will call to schedule Chair 1 morning slot)..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setLogAttemptModalPatient(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAttempt}
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-2xs"
              >
                Save Attempt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. AFROMESSAGE SMS REMINDER MODAL */}
      {smsModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  AfroMessage SMS Recall Gateway · {smsModalPatient.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSmsModalPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Recipient:</span>
                  <span className="font-bold text-slate-800">{smsModalPatient.name} ({smsModalPatient.nameAmharic})</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Destination:</span>
                  <span className="font-mono font-bold text-slate-800">{smsModalPatient.phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Service Recall:</span>
                  <span className="font-semibold text-emerald-700">{smsModalPatient.tags.category} · {smsModalPatient.feeETB.toLocaleString()} ETB</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amharic SMS Payload (ይዘት)</label>
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-slate-800 font-amharic text-xs leading-relaxed">
                  ቦሌ ዴንታል ስቱዲዮ፡ ውድ {smsModalPatient.name}፣ የጥርስ ምርመራና ክትትል ቀጠሮዎ ደርሷል። በ +251 91 122 3344 ይደውሉልን።
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">English Payload</label>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs leading-relaxed">
                  Bole Dental Studio: Dear {smsModalPatient.name}, your routine clinical recall ({smsModalPatient.tags.category}) is due. Contact +251 91 122 3344 to book your slot in Bole.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                AfroMessage API Connected (Bole Dental)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSmsModalPatient(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendAfroMessageSms}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. INTEGRATED OPERATORY BOOKING MODAL */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedPatientForBooking(null);
        }}
        onBookingSuccess={(appt) => {
          setBookingModalOpen(false);
          if (selectedPatientForBooking) {
            setRecalls((prev) =>
              prev.map((r) =>
                r.id === selectedPatientForBooking.id
                  ? {
                      ...r,
                      tags: { ...r.tags, status: 'Booked' },
                      lastAttempt: `Booked for ${new Date(appt.startsAt).toLocaleDateString()} in Chair ${appt.chairNumber || 1}`,
                    }
                  : r
              )
            );
          }
          sinnaStore.toastSuccess(
            'Appointment Booked',
            `Patient scheduled in operatory chair. Recall cycle completed.`
          );
        }}
      />
    </div>
  );
}
