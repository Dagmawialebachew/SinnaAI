'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  CircleDot,
  Wallet,
  Calendar,
  User,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Download,
  Trash2,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  X,
  Printer,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printTreatmentQuote } from '@/lib/smart-print';

export type QuoteStatus = 'Accepted' | 'Completed' | 'Sent' | 'Draft' | 'Rejected';

export interface TreatmentQuote {
  id: string;
  quoteNumber: string;
  version: string;
  patientName: string;
  patientNameAmharic: string;
  patientMrn: string;
  status: QuoteStatus;
  date: string;
  validUntil: string;
  amountETB: number;
  doctorName: string;
  procedures: {
    description: string;
    toothNumber?: number;
    feeETB: number;
  }[];
}

const INITIAL_QUOTES: TreatmentQuote[] = [
  {
    id: 'quo-001',
    quoteNumber: 'BDS-QUO-2026-0013',
    version: 'v1',
    patientName: 'Tigist Alemu Desta',
    patientNameAmharic: 'ትዕግስት አለሙ ደስታ',
    patientMrn: 'BDS-00041',
    status: 'Accepted',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 4100.0,
    doctorName: 'Dr. Senait Tadesse',
    procedures: [
      { description: 'Ultrasonic Scaling & Prophylaxis', feeETB: 1500 },
      { description: 'Composite Resin Restoration (Tooth #16 MO)', toothNumber: 16, feeETB: 2600 },
    ],
  },
  {
    id: 'quo-002',
    quoteNumber: 'BDS-QUO-2026-0011',
    version: 'v1',
    patientName: 'Dawit Haile Gebre',
    patientNameAmharic: 'ዳዊት ኃይሌ ገብረ',
    patientMrn: 'BDS-00089',
    status: 'Completed',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 7800.0,
    doctorName: 'Dr. Senait Tadesse',
    procedures: [
      { description: 'Root Canal Treatment (Tooth #36)', toothNumber: 36, feeETB: 6000 },
      { description: 'Composite Core Build-up & Post', toothNumber: 36, feeETB: 1800 },
    ],
  },
  {
    id: 'quo-003',
    quoteNumber: 'BDS-QUO-2026-0010',
    version: 'v1',
    patientName: 'Sara Mengistu Tadesse',
    patientNameAmharic: 'ሳራ መንግስቱ ታደሰ',
    patientMrn: 'BDS-00155',
    status: 'Accepted',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 10890.0,
    doctorName: 'Dr. Brook Zewde',
    procedures: [
      { description: 'Fixed Orthodontic Metal Bracket Stage 1 (Upper & Lower Arch)', feeETB: 10890 },
    ],
  },
  {
    id: 'quo-004',
    quoteNumber: 'BDS-QUO-2026-0009',
    version: 'v1',
    patientName: 'Abebe Kebede Worku',
    patientNameAmharic: 'አበበ ከበደ ወርቁ',
    patientMrn: 'BDS-00012',
    status: 'Accepted',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 1300.0,
    doctorName: 'Dr. Meron Getachew',
    procedures: [
      { description: 'Deep Periodontal Debridement & Subgingival Irrigation', feeETB: 1300 },
    ],
  },
  {
    id: 'quo-005',
    quoteNumber: 'BDS-QUO-2026-0008',
    version: 'v1',
    patientName: 'Almaz Wolde Gebre',
    patientNameAmharic: 'አልማዝ ወልዴ ገብረ',
    patientMrn: 'BDS-00312',
    status: 'Rejected',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 3700.0,
    doctorName: 'Dr. Senait Tadesse',
    procedures: [
      { description: 'CAD/CAM Ceramic Inlay (Tooth #25)', toothNumber: 25, feeETB: 3700 },
    ],
  },
  {
    id: 'quo-006',
    quoteNumber: 'BDS-QUO-2026-0007',
    version: 'v1',
    patientName: 'Yonas Bekele Tefera',
    patientNameAmharic: 'ዮናስ በቀለ ተፈራ',
    patientMrn: 'BDS-00244',
    status: 'Accepted',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 8100.0,
    doctorName: 'Dr. Senait Tadesse',
    procedures: [
      { description: 'Full Zirconia Monolithic Crown (Tooth #46)', toothNumber: 46, feeETB: 7500 },
      { description: 'Gingival Retraction & Precision Impression', feeETB: 600 },
    ],
  },
  {
    id: 'quo-007',
    quoteNumber: 'BDS-QUO-2026-0006',
    version: 'v1',
    patientName: 'Hanan Mohammed Ali',
    patientNameAmharic: 'ሐናን መሀመድ አሊ',
    patientMrn: 'BDS-00418',
    status: 'Accepted',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 1350.0,
    doctorName: 'Dr. Meron Getachew',
    procedures: [
      { description: 'Preventive Pit & Fissure Sealants (4 Permanent Molars)', feeETB: 1350 },
    ],
  },
  {
    id: 'quo-008',
    quoteNumber: 'BDS-QUO-2026-0005',
    version: 'v1',
    patientName: 'Kiros Tesfaye Berhe',
    patientNameAmharic: 'ኪሮስ ተስፋዬ በርሀ',
    patientMrn: 'BDS-00520',
    status: 'Accepted',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 5495.0,
    doctorName: 'Dr. Senait Tadesse',
    procedures: [
      { description: 'Surgical Extraction of Impacted Wisdom Tooth (#38)', toothNumber: 38, feeETB: 4500 },
      { description: 'Pre-Op Panoramic Radiograph Assessment', feeETB: 995 },
    ],
  },
  {
    id: 'quo-009',
    quoteNumber: 'BDS-QUO-2026-0004',
    version: 'v1',
    patientName: 'Marta Desta Wondimu',
    patientNameAmharic: 'ማርታ ደስታ ወንድሙ',
    patientMrn: 'BDS-00610',
    status: 'Sent',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 1350.0,
    doctorName: 'Dr. Brook Zewde',
    procedures: [
      { description: 'Initial Orthodontic Diagnostic Evaluation + OPG X-Ray', feeETB: 1350 },
    ],
  },
  {
    id: 'quo-010',
    quoteNumber: 'BDS-QUO-2026-0003',
    version: 'v1',
    patientName: 'Binyam Girma Tsegaye',
    patientNameAmharic: 'ቢንያም ግርማ ፀጋዬ',
    patientMrn: 'BDS-00701',
    status: 'Draft',
    date: '10/12/2026',
    validUntil: '11/12/2026',
    amountETB: 900.0,
    doctorName: 'Dr. Senait Tadesse',
    procedures: [
      { description: 'Emergency Temporary Sedative Filling (Tooth #14)', toothNumber: 14, feeETB: 900 },
    ],
  },
];

export default function QuotesPage() {
  const router = useRouter();
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const isDoctor = store.currentUser?.role === 'doctor' || store.activePersona === 'doctor';
  const handleOpenPatient = (mrnOrName: string) => {
    if (isDoctor) {
      router.push(`/patients?patientId=${encodeURIComponent(mrnOrName)}`);
    } else {
      sinnaStore.openPatientDrawer(mrnOrName);
    }
  };

  const [quotes, setQuotes] = useState<TreatmentQuote[]>(INITIAL_QUOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [professionalFilter, setProfessionalFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modals
  const [newQuoteModalOpen, setNewQuoteModalOpen] = useState(false);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<TreatmentQuote | null>(null);

  // New quote form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientMrn, setNewPatientMrn] = useState('BDS-');
  const [newDoctor, setNewDoctor] = useState('Dr. Senait Tadesse');
  const [newProcedure, setNewProcedure] = useState('Comprehensive Restoration & Scaling');
  const [newFee, setNewFee] = useState('3500');

  // Filtered & sorted quotes
  const filteredQuotes = useMemo(() => {
    return quotes
      .filter((q) => {
        if (statusFilter !== 'All' && q.status !== statusFilter) return false;
        if (professionalFilter !== 'All' && q.doctorName !== professionalFilter) return false;
        if (searchQuery.trim()) {
          const qLower = searchQuery.toLowerCase();
          return (
            q.quoteNumber.toLowerCase().includes(qLower) ||
            q.patientName.toLowerCase().includes(qLower) ||
            q.patientMrn.toLowerCase().includes(qLower) ||
            q.patientNameAmharic.includes(searchQuery)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.amountETB - a.amountETB;
        }
        return a.amountETB - b.amountETB;
      });
  }, [quotes, statusFilter, professionalFilter, searchQuery, sortOrder]);

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      sinnaStore.toastError('Name Required', 'Please enter a patient name for the estimate.');
      return;
    }

    const newQuote: TreatmentQuote = {
      id: `quo-${Date.now()}`,
      quoteNumber: `BDS-QUO-2026-00${quotes.length + 14}`,
      version: 'v1',
      patientName: newPatientName,
      patientNameAmharic: 'ደንበኛ',
      patientMrn: newPatientMrn.trim() || `BDS-0${Math.floor(100 + Math.random() * 900)}`,
      status: 'Draft',
      date: '10/12/2026',
      validUntil: '11/12/2026',
      amountETB: parseFloat(newFee) || 2500,
      doctorName: newDoctor,
      procedures: [
        {
          description: newProcedure,
          feeETB: parseFloat(newFee) || 2500,
        },
      ],
    };

    setQuotes([newQuote, ...quotes]);
    setNewQuoteModalOpen(false);
    setNewPatientName('');
    sinnaStore.toastSuccess(
      'Quote Created',
      `Estimate ${newQuote.quoteNumber} issued for ${newQuote.patientName} (${newQuote.amountETB.toLocaleString()} ETB).`
    );
  };

  const handleDeleteQuote = (id: string, quoteNum: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    sinnaStore.toastInfo('Quote Deleted', `Estimate ${quoteNum} removed from clinic records.`);
  };

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 overflow-x-hidden animate-fade-in pb-16">
      {/* 1. Header (Exact DentalPin Standard) */}
      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Quotes
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {clinic.name} · Ethiopian Treatment Cost Estimates & Formal Patient Quotes
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setNewQuoteModalOpen(true)}
              className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border border-sky-200 shadow-2xs"
            >
              <Plus className="shrink-0 size-4 stroke-[2.5]" />
              <span>New quote</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Search & Filter Bar (DentalPin 1-line Grid Standard) */}
      <div className="mb-4">
        <div className="flex items-center gap-2 w-full flex-wrap sm:flex-nowrap">
          {/* Search box */}
          <div className="shrink-0 w-full sm:max-w-xs">
            <div className="relative inline-flex items-center w-full">
              <input
                type="text"
                placeholder="Search by number or patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200/90 appearance-none placeholder:text-slate-400 focus:outline-none transition-colors px-2.5 py-1.5 text-xs text-slate-900 bg-white ring-1 ring-inset ring-slate-200 focus-visible:ring-2 focus-visible:ring-sky-500 ps-9"
              />
              <span className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none text-slate-400">
                <Search className="shrink-0 size-4" />
              </span>
            </div>
          </div>

          {/* Desktop Filter Chips */}
          <div className="hidden md:flex flex-1 min-w-0 items-center gap-2 overflow-x-auto">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md font-medium inline-flex items-center text-xs px-2.5 py-1.5 border border-slate-200/90 text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <option value="All">Status: All</option>
                <option value="Accepted">Accepted</option>
                <option value="Completed">Completed</option>
                <option value="Sent">Sent</option>
                <option value="Draft">Draft</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Professional Filter */}
            <div className="relative">
              <select
                value={professionalFilter}
                onChange={(e) => setProfessionalFilter(e.target.value)}
                className="rounded-md font-medium inline-flex items-center text-xs px-2.5 py-1.5 border border-slate-200/90 text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <option value="All">Professional: All Doctors</option>
                <option value="Dr. Senait Tadesse">Dr. Senait Tadesse</option>
                <option value="Dr. Brook Zewde">Dr. Brook Zewde</option>
                <option value="Dr. Meron Getachew">Dr. Meron Getachew</option>
              </select>
            </div>

            {/* Validity Chip */}
            <div className="rounded-md inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border border-slate-200/90 text-slate-600 bg-white">
              <Calendar className="size-3.5 text-slate-400" />
              <span>30-Day Validity</span>
            </div>
          </div>

          {/* Sort Control */}
          <div className="shrink-0 ms-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 border border-slate-200/90 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
              title="Toggle sort amount"
            >
              <ArrowUpDown className="shrink-0 size-3.5 text-slate-500" />
              <span>Amount ({sortOrder === 'desc' ? 'High to Low' : 'Low to High'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quotes List Table / Cards (Exact DentalPin UI) */}
      <div className="overflow-hidden shadow-2xs rounded-xl bg-white border border-slate-200/90 divide-y divide-slate-100">
        <div className="p-4 sm:p-5">
          <div className="divide-y divide-slate-100">
            {filteredQuotes.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No treatment quotes found matching current search.
              </div>
            ) : (
              filteredQuotes.map((quote) => {
                const statusBadgeClass =
                  quote.status === 'Accepted'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : quote.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : quote.status === 'Sent'
                    ? 'bg-sky-50 text-sky-700 ring-sky-200'
                    : quote.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 ring-rose-200'
                    : 'bg-slate-100 text-slate-700 ring-slate-200';

                return (
                  <div
                    key={quote.id}
                    className="block focus-visible:outline-none rounded-lg group"
                  >
                    {/* Desktop Row */}
                    <div className="hidden md:flex items-center gap-3 px-3 py-2.5 -mx-2 rounded-lg transition-colors min-h-[44px] hover:bg-slate-50/80">
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-slate-900 flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sky-700">{quote.quoteNumber}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{quote.version}</span>
                            <span className={`font-semibold inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm ring-1 ring-inset ${statusBadgeClass}`}>
                              {quote.status}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-medium">{quote.doctorName}</span>
                          </div>
                          <div className="text-xs text-slate-600 truncate mt-0.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatient(quote.patientMrn || quote.patientName);
                              }}
                              className="font-medium text-slate-900 hover:text-sky-600 hover:underline text-left cursor-pointer transition-colors"
                            >
                              {quote.patientName}
                            </button>
                            <span className="text-slate-400 font-amharic">({quote.patientNameAmharic})</span>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatient(quote.patientMrn);
                              }}
                              className="text-[11px] text-slate-400 hover:text-sky-600 font-mono hover:underline cursor-pointer transition-colors"
                            >
                              {quote.patientMrn}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <span className="hidden lg:inline text-xs text-slate-400 font-mono">Valid: {quote.validUntil}</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {quote.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Download PDF"
                          title="Print / Download formal ETB estimate"
                          onClick={(e) => {
                            e.stopPropagation();
                            printTreatmentQuote(quote, clinic);
                          }}
                          className="rounded-md font-medium inline-flex items-center transition-colors text-xs text-slate-600 hover:bg-slate-100 p-1.5 border border-slate-200/80 hover:border-sky-300 hover:text-sky-700"
                        >
                          <Download className="shrink-0 size-4 text-slate-500" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete quote"
                          title="Delete quote"
                          onClick={() => handleDeleteQuote(quote.id, quote.quoteNumber)}
                          className="rounded-md font-medium inline-flex items-center transition-colors text-xs text-rose-600 hover:bg-rose-50 p-1.5 border border-rose-200/80"
                        >
                          <Trash2 className="shrink-0 size-4 text-rose-500" />
                        </button>
                        <ChevronRight 
                          className="size-4 text-slate-300 cursor-pointer hover:text-slate-600" 
                          onClick={() => setSelectedQuoteForPrint(quote)}
                        />
                      </div>
                    </div>

                    {/* Mobile Row */}
                    <div className="md:hidden flex flex-col gap-2 px-3 py-3 rounded-lg transition-colors hover:bg-slate-50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 text-xs truncate flex items-center gap-2">
                            <span className="font-mono text-sky-700">{quote.quoteNumber}</span>
                            <span className={`font-semibold inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm ring-1 ring-inset ${statusBadgeClass}`}>
                              {quote.status}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPatient(quote.patientMrn || quote.patientName);
                            }}
                            className="text-xs text-slate-700 truncate mt-0.5 font-medium hover:text-sky-600 text-left cursor-pointer"
                          >
                            {quote.patientName}
                          </button>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-xs shrink-0">
                          {quote.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>{quote.doctorName}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => printTreatmentQuote(quote, clinic)}
                            className="text-sky-600 font-semibold inline-flex items-center gap-1"
                          >
                            <Download className="size-3" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-400 font-mono">
            <span>{filteredQuotes.length} of {quotes.length} treatment quotes</span>
            <span>{clinic.name} · Addis Ababa</span>
          </div>
        </div>
      </div>

      {/* 4. NEW QUOTE MODAL */}
      {newQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Create Formal Treatment Quote
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewQuoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tigist Alemu Desta"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ethiopian MRN</label>
                  <input
                    type="text"
                    value={newPatientMrn}
                    onChange={(e) => setNewPatientMrn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attending Doctor</label>
                  <select
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="Dr. Senait Tadesse">Dr. Senait Tadesse (Director)</option>
                    <option value="Dr. Brook Zewde">Dr. Brook Zewde (Ortho)</option>
                    <option value="Dr. Meron Getachew">Dr. Meron Getachew (Perio)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Procedure Breakdown</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultrasonic Scaling + Composite Restoration #16 MO"
                  value={newProcedure}
                  onChange={(e) => setNewProcedure(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Estimated Amount (ETB)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3500"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span>Validity Period:</span>
                  <span className="font-semibold text-slate-700">30 Days from Issue</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Clinic Fiscal Registry:</span>
                  <span className="font-mono text-slate-700">MoR TIN: 0049283711</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewQuoteModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-2xs"
                >
                  Generate Estimate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. FORMAL ETHIOPIAN TREATMENT QUOTE DOCUMENT / PRINT MODAL */}
      {selectedQuoteForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-sky-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {clinic.name} · Treatment Estimate
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">TIN: {clinic.tinNumber || '0049283711'} · {clinic.location}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuoteForPrint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Document Header */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Patient Name</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedQuoteForPrint.patientName}</p>
                <p className="text-slate-500 font-amharic text-xs">{selectedQuoteForPrint.patientNameAmharic}</p>
                <p className="font-mono text-slate-500 text-[11px] mt-0.5">{selectedQuoteForPrint.patientMrn}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Estimate Number</p>
                <p className="font-mono font-bold text-sky-700 text-sm mt-0.5">{selectedQuoteForPrint.quoteNumber}</p>
                <p className="text-slate-500 text-xs">Date: {selectedQuoteForPrint.date}</p>
                <p className="text-emerald-700 text-xs font-semibold">Valid until: {selectedQuoteForPrint.validUntil}</p>
              </div>
            </div>

            {/* Procedures Table */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <span>Clinical Procedure</span>
                <span>Estimate (ETB)</span>
              </div>
              {selectedQuoteForPrint.procedures.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-800 font-medium">{p.description}</span>
                  <span className="font-mono font-bold text-slate-900">{p.feeETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 text-sm font-bold text-slate-900">
                <span>Total Treatment Estimate:</span>
                <span className="font-mono text-sky-700 text-base">{selectedQuoteForPrint.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
              </div>
            </div>

            {/* Terms & Payment Rails */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Payment & Fiscal Notes:</p>
              <p>• Accepted payment methods: Telebirr, CBE Birr, Cash, and Chapa gateway.</p>
              <p>• Prices include standard Ministry of Revenues dental consultation and clinical materials.</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Attending: {selectedQuoteForPrint.doctorName}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuoteForPrint(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    printTreatmentQuote(selectedQuoteForPrint, clinic);
                    sinnaStore.toastSuccess('Estimate Printed', `Formal treatment quote document sent to printer.`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="size-3.5" />
                  <span>Print Formal Quote</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
