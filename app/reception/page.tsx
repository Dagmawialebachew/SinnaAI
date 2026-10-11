'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Armchair,
  DollarSign,
  Clock,
  CheckCircle2,
  Phone,
  Printer,
  Check,
  Stethoscope,
  X,
  CreditCard,
  QrCode,
  User,
  AlertCircle,
  Search,
  UserPlus,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { ReceiptModal } from '@/components/receipt-modal';
import { OperatoryBoard } from '@/components/operatory-board';
import { Appointment, LedgerTransaction } from '@/lib/types';

export default function ReceptionDeskPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<
    'all' | 'waiting' | 'in_chair' | 'ready_checkout' | 'settled'
  >('all');

  // Checkout & Settle Modal State
  const [checkoutApt, setCheckoutApt] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'telebirr_manual' | 'cbe_manual'>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [contractCustomAmount, setContractCustomAmount] = useState<string>('');

  // Receipt Modal State
  const [receiptApt, setReceiptApt] = useState<Appointment | null>(null);
  const [receiptTx, setReceiptTx] = useState<LedgerTransaction | null>(null);

  // Safe data arrays
  const appointments = Array.isArray(store.appointments) ? store.appointments : [];
  const chairs = Array.isArray(store.chairs) ? store.chairs : [];
  const ledger = Array.isArray(store.ledger) ? store.ledger : [];
  const contracts = Array.isArray(store.contracts) ? store.contracts : [];

  // Active contract for the patient being checked out
  const checkoutContract = React.useMemo(() => {
    if (!checkoutApt) return null;
    return (
      contracts.find(
        (c) =>
          c.patientId === checkoutApt.id ||
          c.patientName.toLowerCase() === checkoutApt.patientName.toLowerCase()
      ) || null
    );
  }, [contracts, checkoutApt]);

  // Filtered appointments for this clinic
  const clinicAppointments = appointments.filter((a) => a.clinicId === clinic.id);

  const waitingAppointments = clinicAppointments.filter((a) => a.status === 'checked_in');
  const inChairAppointments = clinicAppointments.filter((a) => a.status === 'in_progress');
  const readyCheckoutAppointments = clinicAppointments.filter(
    (a) => a.status === 'completed' && a.paymentStatus !== 'fully_paid'
  );
  const settledAppointments = clinicAppointments.filter((a) => a.paymentStatus === 'fully_paid');

  // Search and Tab filtering
  const filteredAppointments = clinicAppointments.filter((apt) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = apt.patientName.toLowerCase().includes(q);
      const matchPhone = apt.patientPhone.includes(q);
      const matchDoc = apt.doctorName.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchDoc) return false;
    }

    // Tab filter
    if (filterTab === 'waiting') return apt.status === 'checked_in';
    if (filterTab === 'in_chair') return apt.status === 'in_progress';
    if (filterTab === 'ready_checkout') return apt.status === 'completed' && apt.paymentStatus !== 'fully_paid';
    if (filterTab === 'settled') return apt.paymentStatus === 'fully_paid';
    return true;
  });

  // Financial calculations
  const totalCollectedToday = ledger.reduce((acc, tx) => acc + tx.amountETB, 0);
  const cashCollected = ledger
    .filter((tx) => tx.method === 'cash')
    .reduce((acc, tx) => acc + tx.amountETB, 0);
  const digitalCollected = totalCollectedToday - cashCollected;

  // Actions
  const handleCheckIn = (aptId: string) => {
    sinnaStore.checkInPatient(aptId);
  };

  const handleSeatInChair = (aptId: string, chairNumber?: number) => {
    if (chairNumber) {
      sinnaStore.assignPatientToChair(aptId, chairNumber);
      return;
    }
    const available = chairs.find((c) => c.status === 'available');
    sinnaStore.assignPatientToChair(aptId, available ? available.chairNumber : 1);
  };

  const handleOpenCheckout = (apt: Appointment) => {
    setCheckoutApt(apt);
    setPaymentMethod('cash');
    const contract = contracts.find(
      (c) => c.patientId === apt.id || c.patientName.toLowerCase() === apt.patientName.toLowerCase()
    );
    if (contract) {
      if (contract.prepaidCreditETB >= contract.installmentPerVisitETB) {
        setContractCustomAmount('0');
        setCashTendered('0');
      } else {
        setContractCustomAmount(contract.installmentPerVisitETB.toString());
        setCashTendered(contract.installmentPerVisitETB.toString());
      }
    } else {
      const due = apt.totalDueETB - apt.depositPaidETB;
      setCashTendered(due > 0 ? due.toString() : '');
    }
  };

  const handleSettlePayment = () => {
    if (!checkoutApt) return;
    const standardDue = checkoutApt.totalDueETB - checkoutApt.depositPaidETB;

    let amountToSettle = standardDue;
    if (checkoutContract) {
      const customNum = parseFloat(contractCustomAmount);
      amountToSettle = !isNaN(customNum) ? Math.max(0, customNum) : checkoutContract.installmentPerVisitETB;

      // Record contract payment and allocate advance credit if overpaid
      if (amountToSettle > 0) {
        sinnaStore.recordContractPayment(checkoutContract.id, {
          amountETB: amountToSettle,
          method: paymentMethod,
          recordedBy: 'Helen Tadesse (Reception)',
          notes: `Visit ${checkoutContract.completedVisitsCount} installment settlement`,
        });
      }

      sinnaStore.checkOutAndSettle(checkoutApt.id, {
        method: paymentMethod,
        amountPaidETB: amountToSettle,
        recordedBy: 'Reception Desk',
        skipLedger: amountToSettle > 0,
        skipNotification: amountToSettle > 0,
      });
    } else {
      sinnaStore.checkOutAndSettle(checkoutApt.id, {
        method: paymentMethod,
        amountPaidETB: amountToSettle,
        recordedBy: 'Reception Desk',
      });
    }

    if (checkoutApt.chairNumber) {
      sinnaStore.releaseChair(checkoutApt.chairNumber);
    }

    // Open receipt modal immediately
    const aptSnapshot = { ...checkoutApt, paymentStatus: 'fully_paid' as const };
    const latestTx = store.ledger[0] || null;
    setReceiptApt(aptSnapshot);
    setReceiptTx(latestTx);
    setCheckoutApt(null);
  };

  const handleViewReceipt = (apt: Appointment) => {
    const tx = ledger.find((t) => t.appointmentId === apt.id) || null;
    setReceiptApt(apt);
    setReceiptTx(tx);
  };

  // Effective due amount for modal display
  const effectiveDueAmount = React.useMemo(() => {
    if (!checkoutApt) return 0;
    if (checkoutContract) {
      const customNum = parseFloat(contractCustomAmount);
      return !isNaN(customNum) ? customNum : checkoutContract.installmentPerVisitETB;
    }
    return Math.max(0, checkoutApt.totalDueETB - checkoutApt.depositPaidETB);
  }, [checkoutApt, checkoutContract, contractCustomAmount]);

  const dueAmount = effectiveDueAmount;
  const cashGivenNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, cashGivenNum - dueAmount);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. FRONT DESK HEADER & METRIC STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Front Desk, Queue & Cashier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage waiting patients, assign treatment chairs, and collect Ethiopian split payments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            Total Collected Today: {totalCollectedToday.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* 2. 4 POLISHED METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Waiting Lounge */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Waiting Lounge
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{waitingAppointments.length}</span>
            <span className="text-xs text-slate-400">patients waiting</span>
          </div>
        </div>

        {/* In Chair */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              In Treatment
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Armchair className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{inChairAppointments.length}</span>
            <span className="text-xs text-slate-400">in chairs</span>
          </div>
        </div>

        {/* Ready to Pay */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Ready for Checkout
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{readyCheckoutAppointments.length}</span>
            <span className="text-xs text-slate-400">bills pending</span>
          </div>
        </div>

        {/* Cash in Drawer */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Cash Drawer Total
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{cashCollected.toLocaleString()}</span>
            <span className="text-xs text-slate-400">ETB</span>
          </div>
        </div>
      </div>

      {/* 3. PHYSICAL OPERATORY CHAIR BOARD */}
      <OperatoryBoard
        chairs={chairs}
        waitingAppointments={waitingAppointments}
        onSeatPatient={(aptId, chairNum) => handleSeatInChair(aptId, chairNum)}
      />

      {/* 4. PATIENT QUEUE & CHECKOUT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filter Tabs & Search Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({clinicAppointments.length})
            </button>
            <button
              onClick={() => setFilterTab('waiting')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'waiting'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Waiting ({waitingAppointments.length})
            </button>
            <button
              onClick={() => setFilterTab('in_chair')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'in_chair'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Chair ({inChairAppointments.length})
            </button>
            <button
              onClick={() => setFilterTab('ready_checkout')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'ready_checkout'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ready to Pay ({readyCheckoutAppointments.length})
            </button>
            <button
              onClick={() => setFilterTab('settled')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTab === 'settled'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid ({settledAppointments.length})
            </button>
          </div>

          {/* Quick Search in Queue */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter queue by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4 hidden md:table-cell">Doctor & Service</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Front Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No patients match this filter.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const isPaid = apt.paymentStatus === 'fully_paid';
                  const isDone = apt.status === 'completed';
                  const isInChair = apt.status === 'in_progress';
                  const isWaiting = apt.status === 'checked_in';
                  const isConfirmed = apt.status === 'confirmed';

                  const aptContract = contracts.find(
                    (c) =>
                      c.patientId === apt.id ||
                      c.patientName.toLowerCase() === apt.patientName.toLowerCase()
                  );

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Time Slot */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(apt.startsAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Patient Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-900">{apt.patientName}</p>
                          <p className="text-xs text-slate-500 font-mono">{apt.patientPhone}</p>
                        </div>
                      </td>

                      {/* Doctor & Service */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div>
                          <p className="font-medium text-slate-800">{apt.serviceName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-xs text-slate-500">{apt.doctorName}</p>
                            {aptContract && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200">
                                M{aptContract.completedVisitsCount}/{aptContract.estimatedVisits}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Paid & Settled
                          </span>
                        ) : isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                            {aptContract ? (
                              aptContract.prepaidCreditETB >= aptContract.installmentPerVisitETB ? (
                                <>Prepaid Covered (0 ETB)</>
                              ) : (
                                <>Installment Due ({aptContract.installmentPerVisitETB.toLocaleString()} ETB)</>
                              )
                            ) : (
                              <>Ready to Pay ({apt.totalDueETB - apt.depositPaidETB} ETB)</>
                            )}
                          </span>
                        ) : isInChair ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Chair #{apt.chairNumber || 1}
                          </span>
                        ) : isWaiting ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                            In Waiting Lounge
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* 1-Tap Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        {isConfirmed && (
                          <button
                            onClick={() => handleCheckIn(apt.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl"
                          >
                            Check In
                          </button>
                        )}

                        {isWaiting && (
                          <button
                            onClick={() => handleSeatInChair(apt.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-2xs"
                          >
                            Seat in Chair →
                          </button>
                        )}

                        {isInChair && (
                          <Link
                            href="/doctor"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-2xs"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            Open Chart
                          </Link>
                        )}

                        {isDone && !isPaid && (
                          <button
                            onClick={() => handleOpenCheckout(apt)}
                            className="px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-xl shadow-2xs"
                          >
                            {aptContract ? (
                              aptContract.prepaidCreditETB >= aptContract.installmentPerVisitETB
                                ? 'Covered by Credit (0 ETB)'
                                : `Collect ${aptContract.installmentPerVisitETB.toLocaleString()} ETB (M${aptContract.completedVisitsCount})`
                            ) : (
                              `Collect ${apt.totalDueETB - apt.depositPaidETB} ETB`
                            )}
                          </button>
                        )}

                        {isPaid && (
                          <button
                            onClick={() => handleViewReceipt(apt)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 1-TAP CHECKOUT & PAYMENT MODAL */}
      {checkoutApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setCheckoutApt(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">Collect Payment</h3>
                <p className="text-xs text-slate-500">
                  {checkoutApt.patientName} • {checkoutApt.serviceName}
                </p>
              </div>
            </div>

            {/* Bill Summary */}
            {checkoutContract ? (
              <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-200/90 mb-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300">
                    {checkoutContract.id}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-900">
                    Visit {checkoutContract.completedVisitsCount} of {checkoutContract.estimatedVisits} ({checkoutContract.intervalWeeks}-wk interval)
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">{checkoutContract.title}</h4>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-indigo-100 text-center font-mono">
                    <div className="bg-white/90 p-1.5 rounded-lg border border-indigo-100">
                      <p className="text-[10px] text-slate-500 font-sans">Total Plan</p>
                      <p className="font-bold text-slate-900">{checkoutContract.totalContractETB.toLocaleString()} ETB</p>
                    </div>
                    <div className="bg-white/90 p-1.5 rounded-lg border border-indigo-100">
                      <p className="text-[10px] text-slate-500 font-sans">Collected</p>
                      <p className="font-bold text-emerald-700">{checkoutContract.totalCollectedETB.toLocaleString()} ETB</p>
                    </div>
                    <div className="bg-white/90 p-1.5 rounded-lg border border-indigo-100">
                      <p className="text-[10px] text-slate-500 font-sans">Remaining</p>
                      <p className="font-bold text-amber-700">{checkoutContract.remainingBalanceETB.toLocaleString()} ETB</p>
                    </div>
                  </div>
                </div>

                {/* Prepaid Reserve Notice */}
                {checkoutContract.prepaidCreditETB > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800">
                    <div>
                      <p className="font-bold text-[11px]">Prepaid Reserve Available:</p>
                      <p className="text-[10px] text-emerald-700">
                        {checkoutContract.prepaidCreditETB >= checkoutContract.installmentPerVisitETB
                          ? "Sufficient to cover today's visit in full (0 ETB out-of-pocket required)."
                          : "Partial reserve will offset upcoming balance."}
                      </p>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-emerald-800">
                      {checkoutContract.prepaidCreditETB.toLocaleString()} ETB
                    </span>
                  </div>
                )}

                {/* Settlement Amount Controls */}
                <div className="space-y-2 pt-1 border-t border-indigo-200">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span>Payment Selection:</span>
                    <span className="text-[11px] text-indigo-700 font-mono">
                      Standard: {checkoutContract.installmentPerVisitETB.toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (checkoutContract.prepaidCreditETB >= checkoutContract.installmentPerVisitETB) {
                          setContractCustomAmount('0');
                          setCashTendered('0');
                        } else {
                          setContractCustomAmount(checkoutContract.installmentPerVisitETB.toString());
                          setCashTendered(checkoutContract.installmentPerVisitETB.toString());
                        }
                      }}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                        contractCustomAmount ===
                        (checkoutContract.prepaidCreditETB >= checkoutContract.installmentPerVisitETB
                          ? '0'
                          : checkoutContract.installmentPerVisitETB.toString())
                          ? 'border-indigo-600 bg-white font-bold text-indigo-900 shadow-2xs'
                          : 'border-indigo-200 bg-white/60 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <p className="text-[10px] text-slate-500 font-sans">Visit Installment</p>
                      <p className="font-mono font-bold">
                        {checkoutContract.prepaidCreditETB >= checkoutContract.installmentPerVisitETB
                          ? '0 ETB (Prepaid)'
                          : `${checkoutContract.installmentPerVisitETB.toLocaleString()} ETB`}
                      </p>
                    </button>

                    <div className="p-2 rounded-lg border border-indigo-200 bg-white/60">
                      <p className="text-[10px] text-slate-500 font-sans">Custom / Advance ETB</p>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={contractCustomAmount}
                        onChange={(e) => {
                          setContractCustomAmount(e.target.value);
                          setCashTendered(e.target.value);
                        }}
                        className="w-full mt-0.5 px-2 py-0.5 text-xs font-mono border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
                      />
                    </div>
                  </div>

                  {parseFloat(contractCustomAmount) > checkoutContract.installmentPerVisitETB && (
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-center justify-between">
                      <span>Advance Overpayment Credit:</span>
                      <span className="font-mono font-bold">
                        +{(parseFloat(contractCustomAmount) - checkoutContract.installmentPerVisitETB).toLocaleString()} ETB Reserve
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 font-bold text-slate-900 text-sm">
                    <span>Pay Today:</span>
                    <span className="text-base text-indigo-700 font-extrabold font-mono">
                      {dueAmount.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Treatment Total:</span>
                  <span>{checkoutApt.totalDueETB.toLocaleString()} ETB</span>
                </div>
                {checkoutApt.depositPaidETB > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Deposit Paid Earlier:</span>
                    <span>- {checkoutApt.depositPaidETB.toLocaleString()} ETB</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 mt-2 flex items-center justify-between font-bold text-slate-900 text-sm">
                  <span>Amount Due:</span>
                  <span className="text-base text-blue-700 font-extrabold">
                    {dueAmount.toLocaleString()} ETB
                  </span>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Payment Method:
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center ${
                    paymentMethod === 'cash'
                      ? 'border-slate-900 bg-slate-50/80 text-slate-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-xs">Cash Drawer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('telebirr_manual')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center ${
                    paymentMethod === 'telebirr_manual'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-xs">Telebirr QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cbe_manual')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center ${
                    paymentMethod === 'cbe_manual'
                      ? 'border-purple-600 bg-purple-50/70 text-purple-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs">CBE Birr</span>
                </button>
              </div>

              {/* Cash Change Calculator */}
              {paymentMethod === 'cash' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Cash Received from Patient:</span>
                    <input
                      type="number"
                      placeholder={dueAmount.toString()}
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-28 px-2 py-1 text-right text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  {cashGivenNum > dueAmount && (
                    <div className="flex items-center justify-between text-emerald-700 font-bold border-t border-slate-200 pt-1.5">
                      <span>Change to Return:</span>
                      <span className="font-mono">{changeDue.toLocaleString()} ETB</span>
                    </div>
                  )}
                </div>
              )}

              {/* Telebirr QR Preview */}
              {paymentMethod === 'telebirr_manual' && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-center space-y-1.5">
                  <div className="w-24 h-24 bg-white rounded-lg border border-blue-200 mx-auto flex items-center justify-center text-xs text-slate-400 font-mono">
                    <QrCode className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-blue-900">
                    Bole Dental Studio Telebirr: #0911223344
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ask patient to scan QR or pay via Telebirr App
                  </p>
                </div>
              )}

              {/* CBE Birr Account */}
              {paymentMethod === 'cbe_manual' && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs space-y-1">
                  <p className="font-semibold text-purple-900">
                    CBE Account: 1000123456789
                  </p>
                  <p className="text-slate-600">
                    Account Name: Bole Dental Studio PLC
                  </p>
                </div>
              )}

              {/* Complete & Print Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSettlePayment}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {dueAmount === 0
                      ? 'Settle via Prepaid (0 ETB) & Print Receipt'
                      : `Settle ${dueAmount.toLocaleString()} ETB & Print Receipt`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. THERMAL FISCAL RECEIPT MODAL */}
      {receiptApt && (
        <ReceiptModal
          clinic={clinic}
          appointment={receiptApt}
          transaction={receiptTx}
          isOpen={!!receiptApt}
          onClose={() => setReceiptApt(null)}
        />
      )}
    </div>
  );
}
