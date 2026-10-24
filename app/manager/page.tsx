'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Calendar,
  Clock,
  User,
  Unlock,
  Lock,
  Search,
  Check,
  QrCode,
  FileText,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { ZReportModal } from '@/components/z-report-modal';
import { ReceiptModal } from '@/components/receipt-modal';
import { DayCloseReport, LedgerTransaction, Appointment } from '@/lib/types';

export default function DayCloseManagerPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Safe data arrays
  const ledger = Array.isArray(store.ledger) ? store.ledger : [];
  const appointments = Array.isArray(store.appointments) ? store.appointments : [];

  // Filter & Search states
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'telebirr_manual' | 'cbe_manual'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Counted cash in drawer
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('Yohannes K. (Clinic Manager)');
  const [varianceReason, setVarianceReason] = useState<string>('');

  // Modals
  const [zReportOpen, setZReportOpen] = useState(false);
  const [selectedReceiptApt, setSelectedReceiptApt] = useState<Appointment | null>(null);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<LedgerTransaction | null>(null);

  // Revenue totals
  const totalCollectedToday = ledger.reduce((acc, tx) => acc + tx.amountETB, 0);
  const cashTotal = ledger
    .filter((tx) => tx.method === 'cash')
    .reduce((acc, tx) => acc + tx.amountETB, 0);
  const telebirrTotal = ledger
    .filter((tx) => tx.method === 'telebirr_manual')
    .reduce((acc, tx) => acc + tx.amountETB, 0);
  const cbeTotal = ledger
    .filter((tx) => tx.method === 'cbe_manual')
    .reduce((acc, tx) => acc + tx.amountETB, 0);
  const onlineTotal = ledger
    .filter((tx) => tx.method === 'chapa_online')
    .reduce((acc, tx) => acc + tx.amountETB, 0);

  // Patient statistics
  const totalBilled = appointments.reduce((acc, a) => acc + a.totalDueETB, 0);
  const completedCount = appointments.filter((a) => a.status === 'completed' || a.paymentStatus === 'fully_paid').length;

  // Cash variance
  const countedCash = countedCashInput.trim() !== '' ? parseFloat(countedCashInput) || 0 : cashTotal;
  const cashVariance = countedCash - cashTotal;
  const isVarianceZero = Math.abs(cashVariance) < 0.01;

  // Filtered transactions
  const filteredLedger = ledger.filter((tx) => {
    if (methodFilter !== 'all' && tx.method !== methodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.patientName.toLowerCase().includes(q);
      const matchReceipt = tx.receiptNumber.toLowerCase().includes(q);
      if (!matchName && !matchReceipt) return false;
    }
    return true;
  });

  // Handle Day Close
  const handleCloseDay = () => {
    const report: DayCloseReport = {
      id: `z-rep-${Date.now()}`,
      zReportNumber: `Z-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clinicSlug: store.activeClinicSlug,
      closedAt: new Date().toISOString(),
      closedBy: managerName,
      totalBilledETB: totalBilled,
      totalCollectedETB: totalCollectedToday,
      cashExpectedETB: cashTotal,
      cashCountedETB: countedCash,
      cashVarianceETB: cashVariance,
      telebirrTotalETB: telebirrTotal,
      cbeTotalETB: cbeTotal,
      chapaTotalETB: onlineTotal,
      totalPatientsCount: appointments.length,
      completedEncountersCount: completedCount,
      varianceReason: varianceReason.trim() || undefined,
      tinNumber: '0049283711',
    };

    sinnaStore.closeDay(report);
    setZReportOpen(true);
  };

  const handleReopenDay = () => {
    sinnaStore.reopenDay();
  };

  const handleViewReceipt = (tx: LedgerTransaction) => {
    const apt = appointments.find((a) => a.id === tx.appointmentId) || null;
    setSelectedReceiptTx(tx);
    setSelectedReceiptApt(
      apt || {
        id: tx.appointmentId,
        clinicId: clinic.id,
        patientName: tx.patientName,
        patientPhone: '+251 91 000 0000',
        doctorId: 'doc-senait',
        doctorName: 'Dr. Senait Tadesse',
        serviceId: 'srv-cleaning',
        serviceName: 'Dental Care & Treatment',
        startsAt: tx.timestamp,
        endsAt: tx.timestamp,
        status: 'completed',
        paymentStatus: 'fully_paid',
        depositPaidETB: 0,
        totalDueETB: tx.amountETB,
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. HEADER & STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Day Close & Cash Reconciliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verify cash drawer, reconcile Telebirr & CBE, and print official MoR Z-Report
          </p>
        </div>

        <div className="flex items-center gap-2">
          {store.isDayClosed ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Day Closed & Locked
              </span>
              <button
                onClick={handleReopenDay}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Reopen
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Day Open for Settlements
            </span>
          )}
        </div>
      </div>

      {/* 2. THE 4 REVENUE BUCKETS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Cash Drawer */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cash Drawer</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {cashTotal.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">ETB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Physical bills in clinic register</p>
        </div>

        {/* Telebirr */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Telebirr</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {telebirrTotal.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">ETB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Merchant QR & USSD receipts</p>
        </div>

        {/* CBE Birr */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">CBE Birr</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {cbeTotal.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">ETB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Direct bank mobile payments</p>
        </div>

        {/* Grand Total */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Grand Total Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {totalCollectedToday.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">ETB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Total clinic revenue today</p>
        </div>
      </div>

      {/* 3. CASH DRAWER RECONCILIATION & Z-REPORT ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Cash Drawer Physical Count & Reconciliation
            </h2>
            <p className="text-xs text-slate-500">
              Count the physical paper cash in the register to verify zero shortage before closing.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            MoR TIN: 0049283711
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* System Expected */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 font-medium block">System Expected Cash:</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono">
              {cashTotal.toLocaleString()} ETB
            </span>
          </div>

          {/* Physical Count Input */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <label className="text-slate-700 font-bold block">Physical Count in Drawer:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={cashTotal.toString()}
                value={countedCashInput}
                onChange={(e) => setCountedCashInput(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
              <span className="text-xs font-semibold text-slate-500">ETB</span>
            </div>
          </div>

          {/* Variance Status Pill */}
          <div className="p-4 rounded-xl border flex flex-col justify-between text-xs space-y-1">
            <span className="text-slate-500 font-medium block">Drawer Balance Check:</span>
            {isVarianceZero ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>0 ETB Variance (Balanced)</span>
              </div>
            ) : cashVariance < 0 ? (
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{Math.abs(cashVariance).toLocaleString()} ETB Shortage</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-sm">
                <span>+ {cashVariance.toLocaleString()} ETB Overage</span>
              </div>
            )}
          </div>
        </div>

        {/* Manager Signature & Day Close Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Manager Sign-Off: <span className="font-semibold text-slate-800">{managerName}</span>
          </div>

          <div className="flex items-center gap-2">
            {store.isDayClosed && store.dayCloseReport ? (
              <button
                type="button"
                onClick={() => setZReportOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>View / Print MoR Z-Report ({store.dayCloseReport.zReportNumber})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCloseDay}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-xs flex items-center gap-2 active:scale-98 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Close Day & Generate MoR Z-Report</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. AUDIT TRAIL / FISCAL TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filter Tabs & Search */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              Today&apos;s Financial Ledger & Receipts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete audit trail of all receipts issued today
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setMethodFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                methodFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({ledger.length})
            </button>
            <button
              onClick={() => setMethodFilter('cash')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                methodFilter === 'cash'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cash
            </button>
            <button
              onClick={() => setMethodFilter('telebirr_manual')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                methodFilter === 'telebirr_manual'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Telebirr
            </button>
            <button
              onClick={() => setMethodFilter('cbe_manual')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                methodFilter === 'cbe_manual'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CBE Birr
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-100/70 text-slate-500 font-bold text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-4 sm:px-6">RECEIPT &amp; FISCAL TIN</th>
                <th className="py-3 px-4">PATIENT</th>
                <th className="py-3 px-4">PAYMENT METHOD</th>
                <th className="py-3 px-4">COLLECTED AMOUNT</th>
                <th className="py-3 px-4 hidden sm:table-cell">TIME</th>
                <th className="py-3 px-4 sm:px-6 text-right">MoR FISCAL ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No transactions found for this filter</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try selecting another payment rail or clear filters.</p>
                  </td>
                </tr>
              ) : (
                filteredLedger.map((tx) => {
                  const initials = tx.patientName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  const borderClass =
                    tx.method === 'telebirr_manual'
                      ? 'border-l-blue-600 bg-blue-50/15 hover:bg-blue-50/30'
                      : tx.method === 'cbe_manual'
                      ? 'border-l-purple-600 bg-purple-50/15 hover:bg-purple-50/30'
                      : 'border-l-slate-400 hover:bg-slate-50/80';

                  return (
                    <tr key={tx.id} className={`transition-colors border-l-[4px] ${borderClass}`}>
                      {/* Receipt & Fiscal TIN */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 items-start">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200/90 px-2 py-0.5 rounded-lg shadow-2xs">
                            {tx.receiptNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            MoR TIN: 0049283711
                          </span>
                        </div>
                      </td>

                      {/* Patient Monogram & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{tx.patientName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Bole Dental Operatory</p>
                          </div>
                        </div>
                      </td>

                      {/* Payment Method Badge */}
                      <td className="py-3.5 px-4">
                        {tx.method === 'cash' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs">
                            <Banknote className="w-3 h-3 text-slate-600" />
                            <span>Cash Drawer</span>
                          </span>
                        ) : tx.method === 'telebirr_manual' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200 shadow-2xs">
                            <Smartphone className="w-3 h-3 text-blue-600" />
                            <span>Telebirr</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200 shadow-2xs">
                            <Building2 className="w-3 h-3 text-purple-600" />
                            <span>CBE Birr</span>
                          </span>
                        )}
                      </td>

                      {/* Collected Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                        <span className="text-sm font-black">{tx.amountETB.toLocaleString()}</span>
                        <span className="text-xs text-slate-500 font-sans ml-1">ETB</span>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono hidden sm:table-cell">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* MoR Fiscal Receipt Action */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewReceipt(tx)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs active:scale-98"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>MoR Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ETHIOPIAN MoR Z-REPORT MODAL */}
      {zReportOpen && store.dayCloseReport && (
        <ZReportModal
          report={store.dayCloseReport}
          clinic={clinic}
          onClose={() => setZReportOpen(false)}
        />
      )}

      {/* 6. INDIVIDUAL PATIENT THERMAL RECEIPT MODAL */}
      {selectedReceiptApt && (
        <ReceiptModal
          clinic={clinic}
          appointment={selectedReceiptApt}
          transaction={selectedReceiptTx}
          isOpen={!!selectedReceiptApt}
          onClose={() => setSelectedReceiptApt(null)}
        />
      )}
    </div>
  );
}
