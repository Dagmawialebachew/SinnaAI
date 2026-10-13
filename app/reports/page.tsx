'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronDown,
  Receipt,
  FileText,
  CalendarCheck,
  Wallet,
  Banknote,
  PiggyBank,
  Clock,
  Activity,
  LineChart,
  CreditCard,
  Stethoscope,
  UserPlus,
  CalendarX,
  AlertCircle,
  Printer,
  ShieldCheck,
  Check,
  X,
  Download
} from 'lucide-react';
import { useSinnaStore, getClinicData } from '@/lib/store';
import { ZReportModal } from '@/components/z-report-modal';
import {
  printDailyPracticeReport,
  printWeeklyExecutiveReport,
  getDailyReportHTML,
  getWeeklyReportHTML
} from '@/lib/smart-print';

export default function ReportsPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Date Period State
  const [selectedPeriod, setSelectedPeriod] = useState('Period · 2026-10-01 → 2026-10-12');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [zModalOpen, setZModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'daily' | 'weekly' | null>(null);
  const [activePaymentMethodHover, setActivePaymentMethodHover] = useState<string | null>(null);

  // Dynamic Ledger Calculations
  const safeLedger = Array.isArray(store.ledger) ? store.ledger : [];
  const baseCollectedETB = 18075.0;
  const totalCollectedETB = safeLedger.length > 0 
    ? safeLedger.reduce((sum, tx) => sum + (tx.amountETB || 0), 0)
    : baseCollectedETB;

  const totalProductionETB = 24950.0;
  const completedTreatmentsCount = 22;
  const paymentsCount = Math.max(safeLedger.length, 6);
  const avgCollectedTicketETB = (totalCollectedETB / paymentsCount);

  // Standalone HTML Download Handler
  const handleDownloadHTML = (type: 'daily' | 'weekly') => {
    const htmlContent = type === 'daily'
      ? getDailyReportHTML(undefined, clinic)
      : getWeeklyReportHTML(undefined, clinic);

    const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${type === 'daily' ? 'Daily_Practice_Report' : 'Weekly_Executive_Audit'}_${new Date().toISOString().slice(0, 10)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Ethiopic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; padding: 24px; background: #ffffff; margin: 0 auto; max-width: 900px; }
    @page { size: A4 portrait; margin: 12mm 14mm; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type === 'daily' ? 'Daily_Practice_Report' : 'Weekly_Executive_Audit'}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. STICKY DENTALPIN HEADER */}
      <header className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-colors">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 truncate">
            Your clinic at a glance · {clinic.name}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap relative">
          {/* Period Selector */}
          <button
            type="button"
            onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
            className="rounded-lg font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 shadow-xs"
          >
            <Calendar className="shrink-0 size-4 text-sky-600" />
            <span>{selectedPeriod}</span>
            <ChevronDown className="shrink-0 size-3.5 text-sky-500" />
          </button>

          {/* Daily Report Trigger */}
          <button
            type="button"
            onClick={() => setReportModalType('daily')}
            className="rounded-lg font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs"
            title="Preview & print Daily Practice Report"
          >
            <FileText className="size-3.5 text-sky-600" />
            <span>Daily Report</span>
          </button>

          {/* Weekly Audit Trigger */}
          <button
            type="button"
            onClick={() => setReportModalType('weekly')}
            className="rounded-lg font-medium inline-flex items-center transition-colors px-2.5 py-1.5 text-xs gap-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs"
            title="Preview & print Weekly Executive Audit"
          >
            <CalendarCheck className="size-3.5 text-indigo-600" />
            <span>Weekly Audit</span>
          </button>

          {/* Z-Report Thermal Close Trigger */}
          <button
            type="button"
            onClick={() => setZModalOpen(true)}
            className="rounded-lg font-medium inline-flex items-center transition-colors px-3 py-1.5 text-xs gap-1.5 text-white bg-slate-900 hover:bg-slate-800 shadow-xs"
            title="Daily Cashier Drawer Close (Z-Report)"
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">Daily</span> Z-Report
          </button>

          {/* Period Selection Popover */}
          {isPeriodMenuOpen && (
            <div className="absolute top-full end-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Analytics Window
              </div>
              {[
                'Period · 2026-10-01 → 2026-10-12',
                'Today · 2026-10-12',
                'This Week · 2026-10-05 → 2026-10-12',
                'Last 30 Days · Rolling',
                'Quarter 4 · 2026'
              ].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(period);
                    setIsPeriodMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${
                    selectedPeriod === period ? 'font-bold text-sky-700 bg-sky-50/50' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{period}</span>
                  {selectedPeriod === period && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 2. DRILL DOWN NAVIGATION PILLS (DentalPin Standard) */}
      <nav aria-label="Drill down" className="flex gap-2 overflow-x-auto sm:flex-wrap pb-1 scrollbar-thin">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:border-sky-500 shadow-xs"
        >
          <Receipt className="h-4 w-4 text-sky-600" />
          <span className="truncate">Billing</span>
        </Link>
        <Link
          href="/quotes"
          className="inline-flex items-center gap-2 shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:border-sky-500 shadow-xs"
        >
          <FileText className="h-4 w-4 text-sky-600" />
          <span className="truncate">Quotes</span>
        </Link>
        <Link
          href="/schedule"
          className="inline-flex items-center gap-2 shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:border-sky-500 shadow-xs"
        >
          <CalendarCheck className="h-4 w-4 text-sky-600" />
          <span className="truncate">Schedule</span>
        </Link>
        <Link
          href="/payments"
          className="inline-flex items-center gap-2 shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:border-sky-500 shadow-xs"
        >
          <Wallet className="h-4 w-4 text-sky-600" />
          <span className="truncate">Payments</span>
        </Link>
        <button
          type="button"
          onClick={() => setReportModalType('daily')}
          className="inline-flex items-center gap-2 shrink-0 rounded-full border border-sky-300 bg-sky-50/70 px-3 py-1.5 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100 shadow-xs"
        >
          <FileText className="h-4 w-4 text-sky-700" />
          <span className="truncate">Daily Report (A4 PDF)</span>
        </button>
        <button
          type="button"
          onClick={() => setReportModalType('weekly')}
          className="inline-flex items-center gap-2 shrink-0 rounded-full border border-indigo-300 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100 shadow-xs"
        >
          <CalendarCheck className="h-4 w-4 text-indigo-700" />
          <span className="truncate">Weekly Audit (A4 PDF)</span>
        </button>
      </nav>

      {/* 3. FOUR PRIMARY SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Cash Collected */}
        <Link
          href="/invoices"
          className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all hover:bg-slate-50/80 cursor-pointer shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500"
        >
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <Banknote className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cash collected
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                {totalCollectedETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">{paymentsCount} payments</div>
              </div>
              <div className="block w-full mt-2" style={{ height: 32 }}>
                <svg
                  viewBox="0 0 100 32"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Trend 3 points, up 1263"
                  className="w-full h-full overflow-visible"
                >
                  <path
                    d="M0.00,30.00 L50.00,22.40 L100.00,2.00 L100,32 L0,32 Z"
                    fill="#10b981"
                    fillOpacity="0.14"
                  />
                  <path
                    d="M0.00,30.00 L50.00,22.40 L100.00,2.00"
                    stroke="#10b981"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Card 2: Patient Credit */}
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-sky-500">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <PiggyBank className="w-4 h-4 shrink-0 text-sky-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Patient credit
            </span>
            <span
              className="ms-auto inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium"
              title="Today"
            >
              <Clock className="w-3 h-3 text-slate-400" /> Today
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                0.00 ETB
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">Unallocated advances</div>
              </div>
              <div className="block w-full mt-2" style={{ height: 32 }}>
                <div className="h-full flex items-end">
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Production */}
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-sky-500">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <Activity className="w-4 h-4 shrink-0 text-sky-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Production
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                {totalProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">
                  {completedTreatmentsCount} treatments
                </div>
              </div>
              <div className="block w-full mt-2" style={{ height: 32 }}>
                <svg
                  viewBox="0 0 100 32"
                  preserveAspectRatio="none"
                  role="img"
                  className="w-full h-full overflow-visible"
                >
                  <path
                    d="M0.00,28.00 L50.00,16.00 L100.00,4.00 L100,32 L0,32 Z"
                    fill="#0284c7"
                    fillOpacity="0.12"
                  />
                  <path
                    d="M0.00,28.00 L50.00,16.00 L100.00,4.00"
                    stroke="#0284c7"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Avg Collected Ticket */}
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-transparent">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <Receipt className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Avg collected ticket
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                {avgCollectedTicketETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">Over {paymentsCount} payments</div>
              </div>
              <div className="block w-full mt-2" style={{ height: 32 }}>
                <div className="h-full flex items-end">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-slate-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MID SECTION: COLLECTIONS OVER TIME & PAYMENT METHOD DONUT */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Collections Over Time (Matching DentalPin SVG) */}
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <LineChart className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Collections over time
            </span>
          </header>
          <div className="flex-1 px-4 pb-4 min-w-0">
            <div className="w-full">
              <div className="relative w-full select-none" style={{ height: 220 }}>
                <svg
                  viewBox="0 0 800 220"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Trend over 3 points"
                  className="w-full h-full overflow-visible"
                >
                  {/* Fill polygon */}
                  <path
                    d="M8.00,190.26 L400.00,140.81 L792.00,8.00 L792.00,200 L8.00,200 Z"
                    fill="#10b981"
                    fillOpacity="0.12"
                  />
                  {/* Target dashed benchmark line */}
                  <path
                    d="M8.00,200.00 L400.00,200.00 L792.00,200.00"
                    stroke="#f43f5e"
                    strokeWidth="1.25"
                    strokeDasharray="4 4"
                    fill="none"
                    opacity="0.6"
                  />
                  {/* Main spline */}
                  <path
                    d="M8.00,190.26 L400.00,140.81 L792.00,8.00"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {/* Data Point Nodes */}
                  <circle cx="8" cy="190.26" r="4.5" fill="#10b981" />
                  <circle cx="400" cy="140.81" r="4.5" fill="#10b981" />
                  <circle cx="792" cy="8.00" r="5" fill="#10b981" />
                </svg>

                {/* Date Axis Badges */}
                <div
                  className="absolute text-xs text-slate-400 font-mono -translate-x-1/2 pointer-events-none"
                  style={{ left: '2%', bottom: '0px' }}
                >
                  Oct 04
                </div>
                <div
                  className="absolute text-xs text-slate-400 font-mono -translate-x-1/2 pointer-events-none"
                  style={{ left: '50%', bottom: '0px' }}
                >
                  Oct 07
                </div>
                <div
                  className="absolute text-xs text-slate-400 font-mono -translate-x-1/2 pointer-events-none"
                  style={{ left: '98%', bottom: '0px' }}
                >
                  Oct 10
                </div>

                {/* Top Value Indicator */}
                <div className="absolute top-0 start-0 text-xs text-slate-500 font-mono font-bold pointer-events-none bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">
                  13,300.00 ETB
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* By Payment Method (DentalPin Donut SVG) */}
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-transparent">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <CreditCard className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              By payment method
            </span>
          </header>
          <div className="flex-1 px-4 pb-4 min-w-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Donut Chart */}
              <div className="relative shrink-0 self-center" style={{ width: 148, height: 148 }}>
                <svg
                  width="148"
                  height="148"
                  viewBox="0 0 148 148"
                  role="img"
                  aria-label="Donut chart, 4 segments"
                >
                  {/* Segment 1: Direct debit (Slate) */}
                  <path
                    d="M 74.000 0.000 A 74 74 0 0 1 104.860 141.258 L 98.188 126.716 A 58 58 0 0 0 74.000 16.000 Z"
                    fill="#64748b"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setActivePaymentMethodHover('Direct debit')}
                    onMouseLeave={() => setActivePaymentMethodHover(null)}
                  >
                    <title>Direct debit: 7,800.00 ETB</title>
                  </path>
                  {/* Segment 2: Card / CBE Birr (Sky) */}
                  <path
                    d="M 104.860 141.258 A 74 74 0 0 1 0.017 75.575 L 16.013 75.235 A 58 58 0 0 0 98.188 126.716 Z"
                    fill="#0284c7"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setActivePaymentMethodHover('Card')}
                    onMouseLeave={() => setActivePaymentMethodHover(null)}
                  >
                    <title>Card / CBE Birr POS: 5,695.00 ETB</title>
                  </path>
                  {/* Segment 3: Bank transfer (Indigo) */}
                  <path
                    d="M 0.017 75.575 A 74 74 0 0 1 61.710 1.028 L 64.367 16.806 A 58 58 0 0 0 16.013 75.235 Z"
                    fill="#6366f1"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setActivePaymentMethodHover('Bank transfer')}
                    onMouseLeave={() => setActivePaymentMethodHover(null)}
                  >
                    <title>Bank transfer: 4,100.00 ETB</title>
                  </path>
                  {/* Segment 4: Cash (Emerald) */}
                  <path
                    d="M 61.710 1.028 A 74 74 0 0 1 74.000 0.000 L 74.000 16.000 A 58 58 0 0 0 64.367 16.806 Z"
                    fill="#10b981"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setActivePaymentMethodHover('Cash')}
                    onMouseLeave={() => setActivePaymentMethodHover(null)}
                  >
                    <title>Cash: 480.00 ETB</title>
                  </path>
                </svg>

                {/* Donut Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total</div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {totalCollectedETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <ul className="flex-1 min-w-0 space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethodHover('Direct debit')}
                    className={`w-full flex items-center gap-2 text-start group cursor-pointer rounded-lg p-1 transition-colors ${
                      activePaymentMethodHover === 'Direct debit' ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-slate-500" />
                    <span className="text-xs text-slate-700 truncate flex-1 group-hover:text-slate-900">
                      Direct debit
                    </span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">1 payments</span>
                    <span className="text-xs text-slate-900 font-semibold font-mono shrink-0">
                      7,800.00 ETB
                    </span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethodHover('Card')}
                    className={`w-full flex items-center gap-2 text-start group cursor-pointer rounded-lg p-1 transition-colors ${
                      activePaymentMethodHover === 'Card' ? 'bg-sky-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-sky-600" />
                    <span className="text-xs text-slate-700 truncate flex-1 group-hover:text-sky-700">
                      Card / CBE Birr
                    </span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">3 payments</span>
                    <span className="text-xs text-slate-900 font-semibold font-mono shrink-0">
                      5,695.00 ETB
                    </span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethodHover('Bank transfer')}
                    className={`w-full flex items-center gap-2 text-start group cursor-pointer rounded-lg p-1 transition-colors ${
                      activePaymentMethodHover === 'Bank transfer' ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-indigo-500" />
                    <span className="text-xs text-slate-700 truncate flex-1 group-hover:text-indigo-700">
                      Bank transfer
                    </span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">1 payments</span>
                    <span className="text-xs text-slate-900 font-semibold font-mono shrink-0">
                      4,100.00 ETB
                    </span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={() => setActivePaymentMethodHover('Cash')}
                    className={`w-full flex items-center gap-2 text-start group cursor-pointer rounded-lg p-1 transition-colors ${
                      activePaymentMethodHover === 'Cash' ? 'bg-emerald-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
                    <span className="text-xs text-slate-700 truncate flex-1 group-hover:text-emerald-700">
                      Cash
                    </span>
                    <span className="text-xs text-slate-400 font-mono shrink-0">1 payments</span>
                    <span className="text-xs text-slate-900 font-semibold font-mono shrink-0">
                      480.00 ETB
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRODUCTION BY DOCTOR */}
      <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-sky-500">
        <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
          <Stethoscope className="w-4 h-4 shrink-0 text-sky-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Production by doctor
          </span>
        </header>
        <div className="flex-1 px-4 pb-4 min-w-0">
          <ul className="space-y-4">
            {/* Doctor 1: Dr. Senait Tadesse */}
            <li>
              <div className="block w-full text-start group">
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      Dr. Senait Tadesse <span className="text-xs text-slate-400 font-normal">ዶ/ር ሰናይት ታደሰ</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">21 treatments</div>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 shrink-0">
                    24,350.00 ETB
                  </div>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out bg-sky-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </li>

            {/* Doctor 2: Dr. Brook Zewde */}
            <li>
              <div className="block w-full text-start group">
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      Dr. Brook Zewde <span className="text-xs text-slate-400 font-normal">ዶ/ር ብሩክ ዘውዴ</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">1 treatments</div>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 shrink-0">
                    600.00 ETB
                  </div>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out bg-sky-500"
                    style={{ width: '2.5%' }}
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 6. NEW PATIENTS & NO-SHOW RATE CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* New patients */}
        <Link
          href="/schedule"
          className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all hover:bg-slate-50/80 cursor-pointer shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500"
        >
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <UserPlus className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              New patients
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                11
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">
                  68.8% of total appointments
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* No-show rate */}
        <Link
          href="/schedule"
          className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all hover:bg-slate-50/80 cursor-pointer shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500"
        >
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <CalendarX className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              No-show rate
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                0.0%
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">
                  100.0% completed
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* 7. AGING RECEIVABLES CARD */}
      <Link
        href="/invoices"
        className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all hover:bg-slate-50/80 cursor-pointer shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-500"
      >
        <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Aging receivables
          </span>
          <span className="ms-auto inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3 h-3 text-slate-400" /> Today
          </span>
        </header>
        <div className="flex-1 px-4 pb-4 min-w-0">
          <div className="space-y-3.5">
            <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono">
              6,875.00 ETB
            </div>
            <ul className="space-y-3">
              {/* 0-30 days */}
              <li>
                <div className="block w-full text-start group">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">0-30 days</div>
                      <div className="text-[11px] text-slate-500 truncate">6 patients</div>
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-900 shrink-0">
                      6,875.00 ETB
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out bg-emerald-500"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </li>

              {/* 31-60 days */}
              <li>
                <div className="block w-full text-start group">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">31-60 days</div>
                      <div className="text-[11px] text-slate-500 truncate">0 patients</div>
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-900 shrink-0">
                      0.00 ETB
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out bg-amber-500"
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              </li>

              {/* 61-90 days */}
              <li>
                <div className="block w-full text-start group">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">61-90 days</div>
                      <div className="text-[11px] text-slate-500 truncate">0 patients</div>
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-900 shrink-0">
                      0.00 ETB
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out bg-rose-500"
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              </li>

              {/* 90+ days */}
              <li>
                <div className="block w-full text-start group">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">90+ days</div>
                      <div className="text-[11px] text-slate-500 truncate">0 patients</div>
                    </div>
                    <div className="text-xs font-bold font-mono text-slate-900 shrink-0">
                      0.00 ETB
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out bg-rose-500"
                      style={{ width: '0%' }}
                    />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Link>

      {/* 8. MODAL FOR DAILY FISCAL Z-REPORT */}
      {zModalOpen && (
        <ZReportModal
          isOpen={zModalOpen}
          onClose={() => setZModalOpen(false)}
        />
      )}

      {/* 9. REPORT VIEWER MODAL (A4 Clinical Template Preview, Smart Print & Standalone HTML Export) */}
      {reportModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[94vh] bg-slate-100 rounded-2xl shadow-float border border-slate-300 overflow-hidden flex flex-col">
            {/* Modal Bar */}
            <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Tabs */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReportModalType('daily')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      reportModalType === 'daily'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>Daily Practice Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportModalType('weekly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      reportModalType === 'weekly'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Weekly Executive Audit</span>
                  </button>
                </div>

                <span className="hidden md:inline-flex text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  A4 Minimalist Template · MoR Registered
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ms-auto">
                <button
                  type="button"
                  onClick={() => handleDownloadHTML(reportModalType)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                  title="Download standalone HTML document"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Download HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (reportModalType === 'daily') printDailyPracticeReport(undefined, clinic);
                    else printWeeklyExecutiveReport(undefined, clinic);
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportModalType(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Viewport */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/50">
              <div className="w-full max-w-[820px] bg-white rounded-sm shadow-xl border border-slate-300 p-6 sm:p-10 my-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html: reportModalType === 'daily'
                      ? getDailyReportHTML(undefined, clinic)
                      : getWeeklyReportHTML(undefined, clinic)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
