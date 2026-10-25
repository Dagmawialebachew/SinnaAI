'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  Plus,
  Search,
  CircleDot,
  Clock,
  Calendar,
  AlertCircle,
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  Trash2,
  Printer,
  ChevronRight,
  ChevronDown,
  Building2,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Wallet
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printFiscalInvoice } from '@/lib/smart-print';

export type InvoiceStatus = 'Issued' | 'Paid' | 'Partially paid' | 'Draft';

export interface FiscalInvoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientNameAmharic: string;
  patientMrn: string;
  status: InvoiceStatus;
  isOverdue: boolean;
  overdueDays?: number;
  issueDate: string;
  dueDate: string;
  totalETB: number;
  balanceETB: number;
  paymentMethod: 'Telebirr' | 'CBE Birr' | 'Cash' | 'Chapa' | 'Pending';
  serviceDescription: string;
  doctorName: string;
  tin: string;
}

const INITIAL_INVOICES: FiscalInvoice[] = [
  {
    id: 'inv-000',
    invoiceNumber: 'BDS-INV-2026-0008',
    patientName: 'Kalkidan Yohannes',
    patientNameAmharic: 'ቃልኪዳን ዮሐንስ',
    patientMrn: 'BDS-00482',
    status: 'Paid',
    isOverdue: false,
    issueDate: '10/22/2026',
    dueDate: '10/22/2026',
    totalETB: 300.0,
    balanceETB: 0.0,
    paymentMethod: 'Telebirr',
    serviceDescription: 'New Patient Card Opening & Diagnostic Clinical Examination',
    doctorName: 'Dr. Senait Tadesse',
    tin: '0049283711',
  },
  {
    id: 'inv-001',
    invoiceNumber: 'BDS-INV-2026-0007',
    patientName: 'Dawit Haile Gebre',
    patientNameAmharic: 'ዳዊት ኃይሌ ገብረ',
    patientMrn: 'BDS-00089',
    status: 'Issued',
    isOverdue: true,
    overdueDays: 15,
    issueDate: '8/28/2026',
    dueDate: '9/27/2026',
    totalETB: 4100.0,
    balanceETB: 4100.0,
    paymentMethod: 'CBE Birr',
    serviceDescription: 'Endodontic Pulpectomy & Canals Instrumentation (Tooth #36)',
    doctorName: 'Dr. Senait Tadesse',
    tin: '0049283711',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'BDS-INV-2026-0006',
    patientName: 'Tigist Alemu Desta',
    patientNameAmharic: 'ትዕግስት አለሙ ደስታ',
    patientMrn: 'BDS-00041',
    status: 'Paid',
    isOverdue: false,
    issueDate: '10/7/2026',
    dueDate: '11/6/2026',
    totalETB: 7800.0,
    balanceETB: 0.0,
    paymentMethod: 'Telebirr',
    serviceDescription: 'Full Zirconia Crown Placement & Occlusal Adjustment',
    doctorName: 'Dr. Senait Tadesse',
    tin: '0049283711',
  },
  {
    id: 'inv-003',
    invoiceNumber: 'BDS-INV-2026-0005',
    patientName: 'Sara Mengistu Tadesse',
    patientNameAmharic: 'ሳራ መንግስቱ ታደሰ',
    patientMrn: 'BDS-00155',
    status: 'Paid',
    isOverdue: false,
    issueDate: '10/7/2026',
    dueDate: '11/6/2026',
    totalETB: 4300.0,
    balanceETB: 0.0,
    paymentMethod: 'Telebirr',
    serviceDescription: 'Orthodontic Archwire Progression & Brackets Check',
    doctorName: 'Dr. Brook Zewde',
    tin: '0049283711',
  },
  {
    id: 'inv-004',
    invoiceNumber: 'BDS-INV-2026-0004',
    patientName: 'Abebe Kebede Worku',
    patientNameAmharic: 'አበበ ከበደ ወርቁ',
    patientMrn: 'BDS-00012',
    status: 'Paid',
    isOverdue: false,
    issueDate: '10/7/2026',
    dueDate: '11/6/2026',
    totalETB: 1200.0,
    balanceETB: 0.0,
    paymentMethod: 'Cash',
    serviceDescription: 'Comprehensive Ultrasonic Scaling & Polishing',
    doctorName: 'Dr. Meron Getachew',
    tin: '0049283711',
  },
  {
    id: 'inv-005',
    invoiceNumber: 'BDS-INV-2026-0003',
    patientName: 'Yonas Bekele Tefera',
    patientNameAmharic: 'ዮናስ በቀለ ተፈራ',
    patientMrn: 'BDS-00244',
    status: 'Paid',
    isOverdue: false,
    issueDate: '10/4/2026',
    dueDate: '11/3/2026',
    totalETB: 4100.0,
    balanceETB: 0.0,
    paymentMethod: 'CBE Birr',
    serviceDescription: 'Ceramic Composite Restoration & Gingivectomy',
    doctorName: 'Dr. Senait Tadesse',
    tin: '0049283711',
  },
  {
    id: 'inv-006',
    invoiceNumber: 'BDS-INV-2026-0002',
    patientName: 'Almaz Wolde Gebre',
    patientNameAmharic: 'አልማዝ ወልዴ ገብረ',
    patientMrn: 'BDS-00312',
    status: 'Partially paid',
    isOverdue: false,
    issueDate: '10/1/2026',
    dueDate: '10/31/2026',
    totalETB: 1350.0,
    balanceETB: 675.0,
    paymentMethod: 'Chapa',
    serviceDescription: 'Preventive Pit & Fissure Sealants + Fluoride',
    doctorName: 'Dr. Senait Tadesse',
    tin: '0049283711',
  },
  {
    id: 'inv-007',
    invoiceNumber: 'BDS-INV-2026-0001',
    patientName: 'Binyam Girma Tsegaye',
    patientNameAmharic: 'ቢንያም ግርማ ፀጋዬ',
    patientMrn: 'BDS-00701',
    status: 'Draft',
    isOverdue: false,
    issueDate: '—',
    dueDate: '—',
    totalETB: 900.0,
    balanceETB: 900.0,
    paymentMethod: 'Pending',
    serviceDescription: 'Emergency Sedative Dressing & OPG X-Ray',
    doctorName: 'Dr. Senait Tadesse',
    tin: '0049283711',
  },
];

export default function InvoicesPage() {
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

  const [invoices, setInvoices] = useState<FiscalInvoice[]>(INITIAL_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modals
  const [newInvoiceModalOpen, setNewInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<FiscalInvoice | null>(null);

  // New Invoice form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientMrn, setNewPatientMrn] = useState('BDS-');
  const [newDoctor, setNewDoctor] = useState('Dr. Senait Tadesse');
  const [newService, setNewService] = useState('Dental Consultation & Restoration');
  const [newTotal, setNewTotal] = useState('2500');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'Telebirr' | 'CBE Birr' | 'Cash' | 'Chapa'>('Telebirr');

  // Filtered & Sorted list
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        if (overdueOnly && !inv.isOverdue) return false;
        if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const qLower = searchQuery.toLowerCase();
          return (
            inv.invoiceNumber.toLowerCase().includes(qLower) ||
            inv.patientName.toLowerCase().includes(qLower) ||
            inv.patientMrn.toLowerCase().includes(qLower) ||
            inv.patientNameAmharic.includes(searchQuery)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.totalETB - a.totalETB;
        }
        return a.totalETB - b.totalETB;
      });
  }, [invoices, statusFilter, overdueOnly, searchQuery, sortOrder]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      sinnaStore.toastError('Patient Required', 'Please enter a patient name.');
      return;
    }

    const total = parseFloat(newTotal) || 2000;
    const newInv: FiscalInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `BDS-INV-2026-00${invoices.length + 8}`,
      patientName: newPatientName,
      patientNameAmharic: 'ደንበኛ',
      patientMrn: newPatientMrn.trim() || `BDS-0${Math.floor(100 + Math.random() * 900)}`,
      status: 'Paid',
      isOverdue: false,
      issueDate: '10/12/2026',
      dueDate: '11/11/2026',
      totalETB: total,
      balanceETB: 0,
      paymentMethod: newPaymentMethod,
      serviceDescription: newService,
      doctorName: newDoctor,
      tin: '0049283711',
    };

    setInvoices([newInv, ...invoices]);
    setNewInvoiceModalOpen(false);
    setNewPatientName('');
    sinnaStore.toastSuccess(
      'Invoice Issued',
      `MoR Fiscal Invoice ${newInv.invoiceNumber} recorded (${newInv.totalETB.toLocaleString()} ETB via ${newInv.paymentMethod}).`
    );
  };

  const handleDeleteInvoice = (id: string, invNum: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    sinnaStore.toastInfo('Invoice Deleted', `Fiscal record ${invNum} removed.`);
  };

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 overflow-x-hidden animate-fade-in pb-16">
      {/* 1. Header (Exact DentalPin Standard) */}
      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Invoices
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {clinic.name} · Ministry of Revenues (MoR) TIN {clinic.tinNumber || '0049283711'} Fiscal Tax Invoices
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setNewInvoiceModalOpen(true)}
              className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-2xs"
            >
              <Plus className="shrink-0 size-4 stroke-[2.5]" />
              <span>New invoice</span>
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
                <option value="Paid">Paid</option>
                <option value="Partially paid">Partially paid</option>
                <option value="Issued">Issued</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Overdue Quick Toggle Button */}
            <button
              type="button"
              onClick={() => setOverdueOnly(!overdueOnly)}
              className={`rounded-md font-medium inline-flex items-center text-xs px-2.5 py-1.5 gap-1.5 border transition-colors ${
                overdueOnly
                  ? 'border-rose-300 bg-rose-50 text-rose-700 font-semibold'
                  : 'border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Clock className="shrink-0 size-3.5 text-rose-500" />
              <span>Overdue Only</span>
            </button>

            {/* Fiscal TIN Badge */}
            <div className="rounded-md inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border border-slate-200/90 text-slate-600 bg-white">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span className="font-mono">MoR TIN: 0049283711</span>
            </div>
          </div>

          {/* Sort Control */}
          <div className="shrink-0 ms-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="rounded-md font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 border border-slate-200/90 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
              title="Toggle sort order"
            >
              <ArrowUpDown className="shrink-0 size-3.5 text-slate-500" />
              <span>Amount ({sortOrder === 'desc' ? 'High to Low' : 'Low to High'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Invoices List Table / Cards (Exact DentalPin UI) */}
      <div className="overflow-hidden shadow-2xs rounded-xl bg-white border border-slate-200/90 divide-y divide-slate-100">
        <div className="p-4 sm:p-5">
          <div className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No invoices found matching current search.
              </div>
            ) : (
              filteredInvoices.map((invoice) => {
                const statusBadgeClass =
                  invoice.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : invoice.status === 'Partially paid'
                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                    : invoice.status === 'Issued'
                    ? 'bg-sky-50 text-sky-700 ring-sky-200'
                    : 'bg-slate-100 text-slate-700 ring-slate-200';

                return (
                  <div
                    key={invoice.id}
                    className="block focus-visible:outline-none rounded-lg group"
                  >
                    {/* Desktop Row */}
                    <div className="hidden md:flex items-center gap-3 px-3 py-2.5 -mx-2 rounded-lg transition-colors min-h-[44px] hover:bg-slate-50/80">
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-slate-900 flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sky-700">{invoice.invoiceNumber}</span>
                            <span className={`font-semibold inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm ring-1 ring-inset ${statusBadgeClass}`}>
                              {invoice.status}
                            </span>
                            {invoice.isOverdue && (
                              <span className="font-semibold inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                Overdue
                              </span>
                            )}
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-medium">via {invoice.paymentMethod}</span>
                          </div>
                          <div className="text-xs text-slate-600 truncate mt-0.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatient(invoice.patientMrn || invoice.patientName);
                              }}
                              className="font-medium text-slate-900 hover:text-sky-600 hover:underline text-left cursor-pointer transition-colors"
                            >
                              {invoice.patientName}
                            </button>
                            <span className="text-slate-400 font-amharic">({invoice.patientNameAmharic})</span>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatient(invoice.patientMrn);
                              }}
                              className="text-[11px] text-slate-400 hover:text-sky-600 font-mono hover:underline cursor-pointer transition-colors"
                            >
                              {invoice.patientMrn}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3 text-end">
                        <span className="hidden lg:inline text-xs text-slate-400 font-mono">{invoice.issueDate}</span>
                        <span className={`hidden md:inline text-xs font-mono font-medium ${invoice.isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                          {invoice.dueDate}
                        </span>
                        <div className="text-end min-w-[110px]">
                          <span className="font-mono font-bold text-slate-900 text-sm block">
                            {invoice.totalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                          </span>
                          {invoice.balanceETB > 0 ? (
                            <span className="text-[11px] font-mono text-amber-600 block">
                              Balance: {invoice.balanceETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-600 block">
                              Paid in Full
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Download Fiscal Receipt"
                          title="Print / Download official MoR fiscal receipt"
                          onClick={(e) => {
                            e.stopPropagation();
                            printFiscalInvoice(invoice, clinic);
                          }}
                          className="rounded-md font-medium inline-flex items-center transition-colors text-xs text-slate-600 hover:bg-slate-100 p-1.5 border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-700"
                        >
                          <Download className="shrink-0 size-4 text-slate-500" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete invoice"
                          title="Delete invoice"
                          onClick={() => handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                          className="rounded-md font-medium inline-flex items-center transition-colors text-xs text-rose-600 hover:bg-rose-50 p-1.5 border border-rose-200/80"
                        >
                          <Trash2 className="shrink-0 size-4 text-rose-500" />
                        </button>
                        <ChevronRight 
                          className="size-4 text-slate-300 cursor-pointer hover:text-slate-600" 
                          onClick={() => setSelectedInvoiceForPrint(invoice)}
                        />
                      </div>
                    </div>

                    {/* Mobile Row */}
                    <div className="md:hidden flex flex-col gap-2 px-3 py-3 rounded-lg transition-colors hover:bg-slate-50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 text-xs truncate flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sky-700">{invoice.invoiceNumber}</span>
                            <span className={`font-semibold inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm ring-1 ring-inset ${statusBadgeClass}`}>
                              {invoice.status}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPatient(invoice.patientMrn || invoice.patientName);
                            }}
                            className="text-xs text-slate-700 truncate mt-0.5 font-medium hover:text-sky-600 text-left cursor-pointer"
                          >
                            {invoice.patientName}
                          </button>
                        </div>
                        <div className="text-end shrink-0">
                          <span className="font-mono font-bold text-slate-900 text-xs block">
                            {invoice.totalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                          </span>
                          {invoice.balanceETB > 0 && (
                            <span className="text-[10px] font-mono text-amber-600">
                              Bal: {invoice.balanceETB.toLocaleString()} ETB
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Issued: {invoice.issueDate}</span>
                        <button
                          type="button"
                          onClick={() => printFiscalInvoice(invoice, clinic)}
                          className="text-emerald-700 font-semibold inline-flex items-center gap-1"
                        >
                          <Download className="size-3" />
                          <span>Download Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-400 font-mono">
            <span>{filteredInvoices.length} of {invoices.length} fiscal invoices</span>
            <span>Ministry of Revenues TIN: 0049283711</span>
          </div>
        </div>
      </div>

      {/* 4. NEW INVOICE MODAL */}
      {newInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Issue MoR Electronic Fiscal Invoice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
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
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="Telebirr">Telebirr SuperApp</option>
                    <option value="CBE Birr">CBE Birr POS</option>
                    <option value="Cash">Physical Cash</option>
                    <option value="Chapa">Chapa Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Procedure / Service</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Zirconia Crown Placement"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Fee (ETB)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2500"
                    value={newTotal}
                    onChange={(e) => setNewTotal(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attending Provider</label>
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

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span>Ministry of Revenues:</span>
                  <span className="font-mono text-slate-800 font-bold">TIN 0049283711</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax Invoice Format:</span>
                  <span className="font-medium text-slate-700">Official {clinic.name} Receipt</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewInvoiceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-2xs"
                >
                  Generate MoR Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. OFFICIAL MINISTRY OF REVENUES (MoR) FISCAL RECEIPT MODAL */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="size-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {clinic.name} · Official MoR Tax Receipt
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">TIN: {clinic.tinNumber || '0049283711'} · {clinic.location}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Patient / Customer</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoiceForPrint.patientName}</p>
                <p className="text-slate-500 font-amharic text-xs">{selectedInvoiceForPrint.patientNameAmharic}</p>
                <p className="font-mono text-slate-500 text-[11px] mt-0.5">{selectedInvoiceForPrint.patientMrn}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Fiscal Invoice Number</p>
                <p className="font-mono font-bold text-sky-700 text-sm mt-0.5">{selectedInvoiceForPrint.invoiceNumber}</p>
                <p className="text-slate-500 text-xs">Date: {selectedInvoiceForPrint.issueDate}</p>
                <p className="text-emerald-700 text-xs font-semibold">Payment Rail: {selectedInvoiceForPrint.paymentMethod}</p>
              </div>
            </div>

            {/* Service & Items Table */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <span>Description of Services Rendered</span>
                <span>Amount (ETB)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-800 font-medium">{selectedInvoiceForPrint.serviceDescription}</span>
                <span className="font-mono font-bold text-slate-900">{selectedInvoiceForPrint.totalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{selectedInvoiceForPrint.totalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Healthcare Exemption (VAT 0%):</span>
                <span className="font-mono">0.00 ETB</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Settled:</span>
                <span className="font-mono text-emerald-700 text-base">{selectedInvoiceForPrint.totalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
              </div>
            </div>

            {/* Fiscal Footer */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span>Fiscal Register: Bole Woreda 03</span>
                <span>MoR TIN: 0049283711</span>
              </div>
              <p className="text-slate-400 text-[10px]">Electronic Fiscal Receipt generated under Ethiopian Ministry of Revenues Guidelines.</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Provider: {selectedInvoiceForPrint.doctorName}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    printFiscalInvoice(selectedInvoiceForPrint, clinic);
                    sinnaStore.toastSuccess('Receipt Printed', `Official MoR fiscal tax invoice sent to printer.`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="size-3.5" />
                  <span>Print Fiscal Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
