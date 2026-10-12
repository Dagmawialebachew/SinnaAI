'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  User,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  PiggyBank,
  ChevronDown,
  X,
  Building2,
  ShieldCheck,
  Receipt,
  Repeat,
  Landmark,
  Wallet,
  AlertCircle,
  FileText,
  Check
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printThermalReceipt } from '@/lib/smart-print';
import PatientRecordDrawer from '@/components/patient-record-drawer';
import { LedgerTransaction } from '@/lib/types';

export type PaymentMethodType =
  | 'Direct debit'
  | 'Transfer'
  | 'Card'
  | 'Telebirr'
  | 'Cash'
  | 'Chapa';

export interface PaymentItem {
  id: string;
  reference: string;
  patientName: string;
  patientNameAmharic?: string;
  patientMrn: string;
  patientInitial: string;
  date: string;
  rawDate: string;
  method: PaymentMethodType;
  methodLabel: string;
  amountETB: number;
  onAccountETB: number;
  allocationLabel: string;
  isRefunded?: boolean;
  refundAmountETB?: number;
  refundReason?: string;
  notes?: string;
  doctorName?: string;
  recordedBy?: string;
}

const INITIAL_PAYMENTS: PaymentItem[] = [
  {
    id: 'pay-0006',
    reference: 'REF-0006',
    patientName: 'Dawit Haile Gebre',
    patientNameAmharic: 'ዳዊት ኃይሌ ገብረ',
    patientMrn: 'BDS-MRN-2026-0089',
    patientInitial: 'D',
    date: '10/10/2026',
    rawDate: '2026-10-10',
    method: 'Direct debit',
    methodLabel: 'Direct debit',
    amountETB: 7800.0,
    onAccountETB: 7800.0,
    allocationLabel: 'On account',
    doctorName: 'Dr. Senait Tadesse',
    recordedBy: 'Helen Tadesse',
    notes: 'Root canal treatment advance on account'
  },
  {
    id: 'pay-0005',
    reference: 'REF-0005',
    patientName: 'Sara Mengistu Tadesse',
    patientNameAmharic: 'ሳራ መንግስቱ ታደሰ',
    patientMrn: 'BDS-MRN-2026-0155',
    patientInitial: 'S',
    date: '10/10/2026',
    rawDate: '2026-10-10',
    method: 'Card',
    methodLabel: 'CBE Birr POS',
    amountETB: 4300.0,
    onAccountETB: 4300.0,
    allocationLabel: 'On account',
    doctorName: 'Dr. Brook Zewde',
    recordedBy: 'Helen Tadesse',
    notes: 'Clear aligner retainer advance'
  },
  {
    id: 'pay-0004',
    reference: 'REF-0004',
    patientName: 'Tigist Alemu Desta',
    patientNameAmharic: 'ትዕግስት አለሙ ደስታ',
    patientMrn: 'BDS-MRN-2026-0041',
    patientInitial: 'T',
    date: '10/10/2026',
    rawDate: '2026-10-10',
    method: 'Card',
    methodLabel: 'Telebirr POS',
    amountETB: 720.0,
    onAccountETB: 720.0,
    allocationLabel: 'On account',
    doctorName: 'Dr. Senait Tadesse',
    recordedBy: 'Helen Tadesse',
    notes: 'Dental hygiene & periodontal scaling'
  },
  {
    id: 'pay-0003',
    reference: 'REF-0003',
    patientName: 'Abebe Kebede Wolde',
    patientNameAmharic: 'አበበ ከበደ ወልደ',
    patientMrn: 'BDS-MRN-2026-0210',
    patientInitial: 'A',
    date: '10/10/2026',
    rawDate: '2026-10-10',
    method: 'Cash',
    methodLabel: 'Cash',
    amountETB: 480.0,
    onAccountETB: 480.0,
    allocationLabel: 'On account',
    doctorName: 'Dr. Brook Zewde',
    recordedBy: 'Helen Tadesse',
    notes: 'Emergency sedative dressing'
  },
  {
    id: 'pay-0002',
    reference: 'REF-0002',
    patientName: 'Solomon Tekle Mariam',
    patientNameAmharic: 'ሰለሞን ተክሌ ማርያም',
    patientMrn: 'BDS-MRN-2026-0094',
    patientInitial: 'S',
    date: '10/7/2026',
    rawDate: '2026-10-07',
    method: 'Transfer',
    methodLabel: 'Transfer',
    amountETB: 4100.0,
    onAccountETB: 4100.0,
    allocationLabel: 'On account',
    doctorName: 'Dr. Senait Tadesse',
    recordedBy: 'Helen Tadesse',
    notes: 'Zirconia crown prep on-account anticipo'
  },
  {
    id: 'pay-0001',
    reference: 'REF-0001',
    patientName: 'Meron Bekele Haile',
    patientNameAmharic: 'መሮን በቀለ ኃይሌ',
    patientMrn: 'BDS-MRN-2026-0312',
    patientInitial: 'M',
    date: '10/4/2026',
    rawDate: '2026-10-04',
    method: 'Card',
    methodLabel: 'Card',
    amountETB: 675.0,
    onAccountETB: 675.0,
    allocationLabel: 'On account',
    doctorName: 'Dr. Senait Tadesse',
    recordedBy: 'Helen Tadesse',
    notes: 'Periapical diagnostic x-ray settlement'
  }
];

export default function PaymentsPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [filterRefunds, setFilterRefunds] = useState<boolean>(false);
  const [filterUnallocated, setFilterUnallocated] = useState<boolean>(false);

  // Dropdown open states
  const [activeDropdown, setActiveDropdown] = useState<'method' | 'date' | 'patient' | 'sort' | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Active Modals
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<PaymentItem | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('Patient requested schedule alteration');
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<string | null>(null);

  // New Payment Form State
  const [newPatientName, setNewPatientName] = useState('Tigist Alemu Desta');
  const [newPatientMrn, setNewPatientMrn] = useState('BDS-MRN-2026-0041');
  const [newMethod, setNewMethod] = useState<PaymentMethodType>('Telebirr');
  const [newAmountETB, setNewAmountETB] = useState<number>(1500);
  const [newAllocation, setNewAllocation] = useState<'On account' | 'Treatment plan' | 'Consultation'>('On account');
  const [newDoctor, setNewDoctor] = useState('Dr. Senait Tadesse');
  const [newNotes, setNewNotes] = useState('Ultrasonic Scaling and Prophylaxis settlement');
  const [printThermalOnCreate, setPrintThermalOnCreate] = useState(true);

  // Merge store ledger transactions with initial seed
  const paymentsList = useMemo(() => {
    const customPayments = INITIAL_PAYMENTS.map((item) => {
      // Check if store has updated refund for this payment
      const storeMatch = store.ledger.find(
        (tx) => tx.receiptNumber === item.reference || tx.id === item.id
      );
      if (storeMatch && storeMatch.isRefunded) {
        return {
          ...item,
          isRefunded: true,
          refundAmountETB: storeMatch.refundAmountETB || item.amountETB,
          refundReason: storeMatch.refundReason || 'Refund issued'
        };
      }
      return item;
    });

    // Check store ledger for newly added transactions that aren't already in customPayments
    const storeLedgerMapped: PaymentItem[] = store.ledger
      .filter((tx) => !customPayments.some((p) => p.reference === tx.receiptNumber || p.id === tx.id))
      .map((tx) => {
        let mappedMethod: PaymentMethodType = 'Cash';
        let methodLabel = 'Cash';
        if (tx.method.includes('telebirr')) {
          mappedMethod = 'Telebirr';
          methodLabel = 'Telebirr SuperApp';
        } else if (tx.method.includes('cbe')) {
          mappedMethod = 'Card';
          methodLabel = 'CBE Birr POS';
        } else if (tx.method.includes('transfer')) {
          mappedMethod = 'Transfer';
          methodLabel = 'Bank Transfer';
        } else if (tx.method.includes('direct_debit')) {
          mappedMethod = 'Direct debit';
          methodLabel = 'Direct debit';
        } else if (tx.method.includes('chapa')) {
          mappedMethod = 'Chapa';
          methodLabel = 'Chapa Online';
        }

        const dateObj = new Date(tx.timestamp);
        const formattedDate = !isNaN(dateObj.getTime())
          ? `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`
          : '10/12/2026';

        return {
          id: tx.id,
          reference: tx.receiptNumber || `REF-000${Math.floor(100 + Math.random() * 900)}`,
          patientName: tx.patientName,
          patientMrn: tx.patientMrn || 'BDS-MRN-2026-0041',
          patientInitial: tx.patientName.charAt(0).toUpperCase() || 'P',
          date: formattedDate,
          rawDate: tx.timestamp || '2026-10-12',
          method: mappedMethod,
          methodLabel,
          amountETB: tx.amountETB,
          onAccountETB: tx.amountETB,
          allocationLabel: tx.allocation || 'On account',
          isRefunded: tx.isRefunded || false,
          refundAmountETB: tx.refundAmountETB,
          refundReason: tx.refundReason,
          doctorName: 'Dr. Senait Tadesse',
          recordedBy: tx.recordedBy || 'Helen Tadesse',
          notes: 'Cashier entry'
        };
      });

    return [...storeLedgerMapped, ...customPayments];
  }, [store.ledger]);

  // Unique patient names for filter
  const patientOptions = useMemo(() => {
    const set = new Set<string>();
    paymentsList.forEach((p) => set.add(p.patientName));
    return Array.from(set);
  }, [paymentsList]);

  // Filtering Logic
  const filteredPayments = useMemo(() => {
    return paymentsList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.patientName.toLowerCase().includes(query);
        const matchesAmharic = item.patientNameAmharic?.toLowerCase().includes(query);
        const matchesRef = item.reference.toLowerCase().includes(query);
        const matchesMrn = item.patientMrn.toLowerCase().includes(query);
        if (!matchesName && !matchesAmharic && !matchesRef && !matchesMrn) {
          return false;
        }
      }

      // Method
      if (selectedMethod !== 'all') {
        if (selectedMethod === 'Direct debit' && item.method !== 'Direct debit') return false;
        if (selectedMethod === 'Transfer' && item.method !== 'Transfer') return false;
        if (selectedMethod === 'Card' && item.method !== 'Card') return false;
        if (selectedMethod === 'Telebirr' && item.method !== 'Telebirr') return false;
        if (selectedMethod === 'Cash' && item.method !== 'Cash') return false;
      }

      // Dates
      if (selectedDateRange !== 'all') {
        if (selectedDateRange === 'today' && !item.date.includes('10/12/2026')) return false;
        if (selectedDateRange === '10/10' && !item.date.includes('10/10/2026')) return false;
        if (selectedDateRange === '10/7' && !item.date.includes('10/7/2026')) return false;
        if (selectedDateRange === '10/4' && !item.date.includes('10/4/2026')) return false;
      }

      // Patient
      if (selectedPatient !== 'all') {
        if (item.patientName !== selectedPatient) return false;
      }

      // With refunds
      if (filterRefunds && !item.isRefunded) {
        return false;
      }

      // Unallocated
      if (filterUnallocated && item.allocationLabel !== 'On account') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'amount') {
        return sortAsc ? a.amountETB - b.amountETB : b.amountETB - a.amountETB;
      } else {
        // Date sort
        const dateA = new Date(a.rawDate || a.date).getTime();
        const dateB = new Date(b.rawDate || b.date).getTime();
        return sortAsc ? dateA - dateB : dateB - dateA;
      }
    });
  }, [
    paymentsList,
    searchQuery,
    selectedMethod,
    selectedDateRange,
    selectedPatient,
    filterRefunds,
    filterUnallocated,
    sortBy,
    sortAsc
  ]);

  // Aggregate Metrics
  const totalCollectedETB = filteredPayments.reduce((sum, item) => sum + (item.isRefunded ? 0 : item.amountETB), 0);
  const totalOnAccountETB = filteredPayments.reduce((sum, item) => sum + (item.isRefunded ? 0 : item.onAccountETB), 0);

  // Method Icon Helper
  const renderMethodIcon = (method: PaymentMethodType) => {
    switch (method) {
      case 'Direct debit':
        return <Repeat className="w-3.5 h-3.5" />;
      case 'Transfer':
        return <Landmark className="w-3.5 h-3.5" />;
      case 'Card':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'Telebirr':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'Cash':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'Chapa':
        return <Wallet className="w-3.5 h-3.5" />;
      default:
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  // Thermal Print Row Action
  const handlePrintThermalSlip = (item: PaymentItem) => {
    printThermalReceipt({
      receiptNumber: item.reference,
      patientName: item.patientName,
      doctorName: item.doctorName || 'Dr. Senait Tadesse',
      serviceName: item.notes || 'Clinical Dental Settlement',
      amountETB: item.amountETB,
      paymentMethod: item.methodLabel,
      tinNumber: '0049283711'
    }, clinic);
  };

  // Open Refund Modal
  const handleInitiateRefund = (item: PaymentItem) => {
    setSelectedPaymentForRefund(item);
    setRefundAmount(item.amountETB);
    setRefundReason('Patient requested schedule alteration');
  };

  // Submit Refund
  const handleConfirmRefund = () => {
    if (!selectedPaymentForRefund) return;
    sinnaStore.refundPayment(selectedPaymentForRefund.reference, refundAmount, refundReason);
    setSelectedPaymentForRefund(null);
  };

  // Submit New Payment
  const handleCreateNewPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const nextRefNumber = `REF-000${Math.floor(7 + Math.random() * 90)}`;
    
    let methodKey = 'cash';
    if (newMethod === 'Telebirr') methodKey = 'telebirr_manual';
    else if (newMethod === 'Card') methodKey = 'cbe_manual';
    else if (newMethod === 'Transfer') methodKey = 'transfer';
    else if (newMethod === 'Direct debit') methodKey = 'direct_debit';
    else if (newMethod === 'Chapa') methodKey = 'chapa_online';

    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      appointmentId: `apt-pay-${Date.now()}`,
      patientName: newPatientName.trim(),
      patientMrn: newPatientMrn.trim(),
      receiptNumber: nextRefNumber,
      amountETB: Number(newAmountETB) || 0,
      method: methodKey,
      recordedBy: store.currentUser?.name || 'Helen Tadesse',
      timestamp: new Date().toISOString(),
      allocation: newAllocation,
      isRefunded: false
    };

    sinnaStore.addPaymentTransaction(newTx);

    if (printThermalOnCreate) {
      printThermalReceipt({
        receiptNumber: nextRefNumber,
        patientName: newPatientName.trim(),
        doctorName: newDoctor,
        serviceName: newNotes.trim() || 'Clinical Dental Advance',
        amountETB: Number(newAmountETB) || 0,
        paymentMethod: newMethod,
        tinNumber: '0049283711'
      }, clinic);
    }

    setIsNewPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* DentalPin Standard Header */}
      <header className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Payments
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Patient payments, budget anticipos and on-account credit.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewPaymentModalOpen(true)}
              className="rounded-lg font-medium inline-flex items-center disabled:cursor-not-allowed transition-colors px-3 py-1.5 text-xs gap-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New payment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filter and Search Bar (DentalPin Standard) */}
      <div className="mb-4">
        <div className="flex items-center gap-2 w-full flex-wrap sm:flex-nowrap">
          {/* Patient or Reference Input */}
          <div className="shrink-0 w-full sm:w-auto sm:max-w-xs flex-1">
            <div className="relative inline-flex items-center w-full">
              <input
                type="text"
                placeholder="Patient or reference"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 appearance-none placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 px-2.5 py-1.5 text-xs text-slate-900 bg-white ps-9"
                autoComplete="off"
              />
              <span className="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
            </div>
          </div>

          {/* Desktop Popover Filter Triggers */}
          <div className="hidden md:flex items-center gap-2 flex-1 min-w-0">
            {/* Method Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'method' ? null : 'method')}
                className={`rounded-lg font-medium inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border transition-colors ${
                  selectedMethod !== 'all'
                    ? 'border-sky-500 text-sky-700 bg-sky-50'
                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{selectedMethod === 'all' ? 'Method' : selectedMethod}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'method' && (
                <div className="absolute top-full start-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('all'); setActiveDropdown(null); }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${selectedMethod === 'all' ? 'font-bold text-sky-700' : 'text-slate-700'}`}
                  >
                    <span>All Methods</span>
                    {selectedMethod === 'all' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('Card'); setActiveDropdown(null); }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${selectedMethod === 'Card' ? 'font-bold text-sky-700' : 'text-slate-700'}`}
                  >
                    <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> CBE Birr POS / Card</span>
                    {selectedMethod === 'Card' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('Telebirr'); setActiveDropdown(null); }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${selectedMethod === 'Telebirr' ? 'font-bold text-sky-700' : 'text-slate-700'}`}
                  >
                    <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Telebirr SuperApp</span>
                    {selectedMethod === 'Telebirr' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('Cash'); setActiveDropdown(null); }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${selectedMethod === 'Cash' ? 'font-bold text-sky-700' : 'text-slate-700'}`}
                  >
                    <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" /> Physical Cash</span>
                    {selectedMethod === 'Cash' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('Direct debit'); setActiveDropdown(null); }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${selectedMethod === 'Direct debit' ? 'font-bold text-sky-700' : 'text-slate-700'}`}
                  >
                    <span className="flex items-center gap-1.5"><Repeat className="w-3.5 h-3.5" /> Direct debit</span>
                    {selectedMethod === 'Direct debit' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('Transfer'); setActiveDropdown(null); }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${selectedMethod === 'Transfer' ? 'font-bold text-sky-700' : 'text-slate-700'}`}
                  >
                    <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> Bank Transfer</span>
                    {selectedMethod === 'Transfer' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Dates Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
                className={`rounded-lg font-medium inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border transition-colors ${
                  selectedDateRange !== 'all'
                    ? 'border-sky-500 text-sky-700 bg-sky-50'
                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedDateRange === 'all' ? 'Dates' : selectedDateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'date' && (
                <div className="absolute top-full start-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('all'); setActiveDropdown(null); }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
                  >
                    All Dates
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('today'); setActiveDropdown(null); }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
                  >
                    Today (10/12/2026)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('10/10'); setActiveDropdown(null); }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
                  >
                    10/10/2026
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('10/7'); setActiveDropdown(null); }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
                  >
                    10/07/2026
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedDateRange('10/4'); setActiveDropdown(null); }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700"
                  >
                    10/04/2026
                  </button>
                </div>
              )}
            </div>

            {/* Patient Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'patient' ? null : 'patient')}
                className={`rounded-lg font-medium inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border transition-colors ${
                  selectedPatient !== 'all'
                    ? 'border-sky-500 text-sky-700 bg-sky-50'
                    : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[130px]">
                  {selectedPatient === 'all' ? 'Patient' : selectedPatient}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {activeDropdown === 'patient' && (
                <div className="absolute top-full start-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => { setSelectedPatient('all'); setActiveDropdown(null); }}
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    All Patients
                  </button>
                  {patientOptions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { setSelectedPatient(name); setActiveDropdown(null); }}
                      className={`w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 flex items-center justify-between ${
                        selectedPatient === name ? 'font-bold text-sky-700 bg-sky-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{name}</span>
                      {selectedPatient === name && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* With Refunds Filter Toggle */}
            <button
              type="button"
              onClick={() => setFilterRefunds(!filterRefunds)}
              className={`rounded-lg font-medium inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border transition-colors ${
                filterRefunds
                  ? 'border-amber-400 text-amber-700 bg-amber-50 shadow-xs'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>With refunds</span>
            </button>

            {/* Unallocated Filter Toggle */}
            <button
              type="button"
              onClick={() => setFilterUnallocated(!filterUnallocated)}
              className={`rounded-lg font-medium inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border transition-colors ${
                filterUnallocated
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50 shadow-xs'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>Unallocated</span>
            </button>
          </div>

          {/* Mobile Filter Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="md:hidden rounded-lg font-medium inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sorting Controls */}
          <div className="shrink-0 ms-auto md:ms-0 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
              className="rounded-lg font-medium inline-flex items-center px-2.5 py-1.5 text-xs gap-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">{sortBy}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              className="rounded-lg p-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              title={sortAsc ? 'Ascending' : 'Descending'}
            >
              {sortAsc ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Filters Drawer / Accordion */}
        {isMobileFiltersOpen && (
          <div className="md:hidden mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Filters</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFilterRefunds(!filterRefunds)}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  filterRefunds ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>With refunds</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterUnallocated(!filterUnallocated)}
                className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                  filterUnallocated ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Unallocated</span>
              </button>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-medium">Method</label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="all">All Methods</option>
                <option value="Card">CBE Birr POS / Card</option>
                <option value="Telebirr">Telebirr SuperApp</option>
                <option value="Cash">Physical Cash</option>
                <option value="Direct debit">Direct debit</option>
                <option value="Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cashier & Collections Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Filtered Collections</span>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
            {totalCollectedETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">On-Account Credit</span>
          <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
            {totalOnAccountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">MoR TIN Register</span>
          <div className="text-xs font-mono font-bold text-slate-700 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>0049283711</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cashier Drawer</span>
            <div className="text-xs font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Open · Helen T.</span>
            </div>
          </div>
          <Link
            href="/manager"
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
          >
            Z-Report
          </Link>
        </div>
      </div>

      {/* DentalPin Payments Table Container */}
      <div className="overflow-hidden shadow-xs rounded-2xl bg-white border border-slate-200/90 divide-y divide-slate-100">
        <div className="p-4 sm:p-5">
          <div className="divide-y divide-slate-100">
            {filteredPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No payments matching current filters</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMethod('all');
                    setSelectedDateRange('all');
                    setSelectedPatient('all');
                    setFilterRefunds(false);
                    setFilterUnallocated(false);
                  }}
                  className="mt-2 text-xs text-sky-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredPayments.map((item) => (
                <div
                  key={item.id}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
                >
                  {/* Desktop Row (Matches DentalPin HTML hidden md:flex) */}
                  <div className="hidden md:flex items-center gap-3 px-2 py-2.5 -mx-2 rounded-xl transition-colors min-h-[48px] hover:bg-slate-50/80">
                    {/* Patient Initial Avatar */}
                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle bg-slate-100 size-7 text-xs font-semibold text-slate-600">
                        {item.patientInitial}
                      </span>
                    </div>

                    {/* Patient Info & Reference */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900 flex items-center gap-2 flex-wrap font-medium">
                        <button
                          type="button"
                          onClick={() => setSelectedPatientForDrawer(item.patientMrn)}
                          className="hover:text-sky-600 transition-colors text-left"
                          title="View clinical chart"
                        >
                          {item.patientName}
                        </button>
                        {item.patientNameAmharic && (
                          <span className="text-xs text-slate-400 font-normal">
                            {item.patientNameAmharic}
                          </span>
                        )}
                        {item.isRefunded && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/80">
                            <RotateCcw className="w-2.5 h-2.5" />
                            Refunded
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        <span>{item.date}</span>
                        <span className="inline-flex items-center gap-1">
                          {renderMethodIcon(item.method)}
                          <span>{item.methodLabel}</span>
                        </span>
                        <span className="truncate max-w-[160px] font-mono" title={item.reference}>
                          · {item.reference}
                        </span>
                      </div>
                    </div>

                    {/* Allocation Subtext */}
                    <div className="shrink-0 hidden sm:flex flex-col items-end gap-0.5 max-w-[200px]">
                      <span className="text-xs text-slate-500 font-mono">
                        {item.onAccountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB{' '}
                        <span className="opacity-60">· {item.allocationLabel}</span>
                      </span>
                    </div>

                    {/* Formatted Amount */}
                    <div className="shrink-0 text-end min-w-[110px]">
                      <span className={`font-mono font-semibold ${item.isRefunded ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                      </span>
                    </div>

                    {/* Smart Print POS Slip Action */}
                    <button
                      type="button"
                      onClick={() => handlePrintThermalSlip(item)}
                      aria-label="Print Thermal POS Receipt"
                      title="Print 80mm POS Slip"
                      className="rounded-lg font-medium inline-flex items-center text-xs p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Refund Action Button */}
                    <button
                      type="button"
                      onClick={() => handleInitiateRefund(item)}
                      disabled={item.isRefunded}
                      aria-label="Refund"
                      title={item.isRefunded ? 'Already refunded' : 'Issue Refund'}
                      className={`rounded-lg font-medium inline-flex items-center text-xs gap-1 p-1.5 transition-colors ${
                        item.isRefunded
                          ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
                          : 'text-amber-700 bg-amber-50 hover:bg-amber-100 active:bg-amber-150 border border-amber-200/60'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile Row (Matches DentalPin HTML md:hidden) */}
                  <div className="md:hidden flex flex-col gap-2 px-3 py-3 -mx-3 rounded-xl transition-colors min-h-[64px] hover:bg-slate-50 active:bg-slate-50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-900 truncate flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPatientForDrawer(item.patientMrn)}
                            className="hover:text-sky-600 transition-colors text-left truncate"
                          >
                            {item.patientName}
                          </button>
                          {item.isRefunded && (
                            <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-100 text-amber-800">
                              Refunded
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-1 font-mono">
                          {renderMethodIcon(item.method)}
                          <span>{item.date} · {item.methodLabel} · {item.reference}</span>
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <span className={`font-mono font-semibold ${item.isRefunded ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <span className="font-medium inline-flex items-center text-[10px] px-1.5 py-0.5 gap-1 rounded bg-slate-100 text-slate-700">
                        {item.onAccountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB · {item.allocationLabel}
                      </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handlePrintThermalSlip(item)}
                        className="rounded-lg font-medium inline-flex items-center px-2 py-1 text-xs gap-1 text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Slip</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInitiateRefund(item)}
                        disabled={item.isRefunded}
                        className={`rounded-lg font-medium inline-flex items-center px-2 py-1 text-xs gap-1 transition-colors ${
                          item.isRefunded
                            ? 'opacity-50 text-slate-400 bg-slate-50'
                            : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Refund</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DentalPin Footer Count */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500 font-mono">
            <span>
              {filteredPayments.length} of {paymentsList.length} transactions
            </span>
            <span className="text-[11px] text-slate-400">
              Bole Medhanialem Fiscal Register · BDS-FSC-AA-03
            </span>
          </div>
        </div>
      </div>

      {/* NEW PAYMENT MODAL */}
      {isNewPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-float border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-sky-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Patient Payment</h3>
                  <p className="text-[11px] text-slate-500">Ministry of Revenues (MoR) Fiscal POS Settlement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPaymentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewPayment} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Patient Selection */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Patient Name</label>
                <select
                  value={newPatientName}
                  onChange={(e) => {
                    setNewPatientName(e.target.value);
                    if (e.target.value === 'Tigist Alemu Desta') setNewPatientMrn('BDS-MRN-2026-0041');
                    else if (e.target.value === 'Dawit Haile Gebre') setNewPatientMrn('BDS-MRN-2026-0089');
                    else if (e.target.value === 'Sara Mengistu Tadesse') setNewPatientMrn('BDS-MRN-2026-0155');
                    else if (e.target.value === 'Abebe Kebede Wolde') setNewPatientMrn('BDS-MRN-2026-0210');
                    else if (e.target.value === 'Solomon Tekle Mariam') setNewPatientMrn('BDS-MRN-2026-0094');
                    else if (e.target.value === 'Meron Bekele Haile') setNewPatientMrn('BDS-MRN-2026-0312');
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  <option value="Tigist Alemu Desta">Tigist Alemu Desta (BDS-MRN-2026-0041)</option>
                  <option value="Dawit Haile Gebre">Dawit Haile Gebre (BDS-MRN-2026-0089)</option>
                  <option value="Sara Mengistu Tadesse">Sara Mengistu Tadesse (BDS-MRN-2026-0155)</option>
                  <option value="Abebe Kebede Wolde">Abebe Kebede Wolde (BDS-MRN-2026-0210)</option>
                  <option value="Solomon Tekle Mariam">Solomon Tekle Mariam (BDS-MRN-2026-0094)</option>
                  <option value="Meron Bekele Haile">Meron Bekele Haile (BDS-MRN-2026-0312)</option>
                </select>
              </div>

              {/* Amount ETB + Quick Birr Buttons */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount (ETB)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={newAmountETB}
                    onChange={(e) => setNewAmountETB(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                  <span className="absolute end-3 top-2.5 text-xs text-slate-400 font-bold">ETB</span>
                </div>
                {/* Quick Birr Chips */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[500, 1000, 2500, 4100, 7800].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewAmountETB(preset)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-medium transition-colors"
                    >
                      +{preset.toLocaleString()} ETB
                    </button>
                  ))}
                </div>
              </div>

              {/* Tender Method Selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Rail / Tender</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Telebirr', label: 'Telebirr SuperApp', icon: Smartphone },
                    { id: 'Card', label: 'CBE Birr POS', icon: CreditCard },
                    { id: 'Cash', label: 'Cash (Notes)', icon: Banknote },
                    { id: 'Transfer', label: 'Bank Transfer', icon: Landmark },
                    { id: 'Direct debit', label: 'Direct Debit', icon: Repeat },
                    { id: 'Chapa', label: 'Chapa Gateway', icon: Wallet },
                  ].map((m) => {
                    const IconComp = m.icon;
                    const isSelected = newMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setNewMethod(m.id as PaymentMethodType)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0 text-slate-600" />
                        <span className="font-medium truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Allocation Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Allocation</label>
                  <select
                    value={newAllocation}
                    onChange={(e) => setNewAllocation(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="On account">On account (Anticipo / Credit)</option>
                    <option value="Treatment plan">Treatment Plan Staged Balance</option>
                    <option value="Consultation">Clinical Consultation / Exam</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Doctor Attending</label>
                  <select
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Dr. Senait Tadesse">Dr. Senait Tadesse (Lead)</option>
                    <option value="Dr. Brook Zewde">Dr. Brook Zewde (Associate)</option>
                  </select>
                </div>
              </div>

              {/* Clinical Notes / Memo */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Memo / Treatment Service</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Ultrasonic Scaling or Crown prep advance"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Auto Thermal Print Checkbox */}
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printThermalOnCreate}
                  onChange={(e) => setPrintThermalOnCreate(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  Print 80mm thermal cashier receipt immediately
                </span>
              </label>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewPaymentModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Record Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFUND CONFIRMATION MODAL */}
      {selectedPaymentForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-float border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">Issue Payment Refund</h3>
                  <p className="text-[11px] text-amber-700">{selectedPaymentForRefund.reference} · {selectedPaymentForRefund.patientName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPaymentForRefund(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Original Amount:</span>
                  <strong className="text-slate-900">{selectedPaymentForRefund.amountETB.toLocaleString()} ETB</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tender Method:</span>
                  <span>{selectedPaymentForRefund.methodLabel}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Patient MRN:</span>
                  <span>{selectedPaymentForRefund.patientMrn}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Refund Amount (ETB)</label>
                <input
                  type="number"
                  max={selectedPaymentForRefund.amountETB}
                  min="1"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Refund Clinical Reason</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Patient requested schedule alteration">Patient requested schedule alteration</option>
                  <option value="Treatment plan restructured by Doctor">Treatment plan restructured by Doctor</option>
                  <option value="Overpayment cashier reconciliation">Overpayment cashier reconciliation</option>
                  <option value="Procedure cancelled prior to clinical prep">Procedure cancelled prior to clinical prep</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentForRefund(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRefund}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm Refund</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Record Drawer when MRN is clicked */}
      {selectedPatientForDrawer && (
        <PatientRecordDrawer
          appointmentId={
            store.appointments.find((a) => a.patientChart?.cardNo === selectedPatientForDrawer || a.patientChart?.medicalRecordNumber === selectedPatientForDrawer)?.id ||
            store.appointments[0]?.id ||
            'apt-001'
          }
          isOpen={!!selectedPatientForDrawer}
          onClose={() => setSelectedPatientForDrawer(null)}
        />
      )}
    </div>
  );
}
