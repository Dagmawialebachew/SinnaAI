'use client';

import React, { useState, useMemo } from 'react';
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
  Download,
  CalendarDays,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useSinnaStore, getClinicData } from '@/lib/store';
import { ZReportModal } from '@/components/z-report-modal';
import {
  ReportPeriod,
  getComprehensiveReportHTML,
  printComprehensiveReport
} from '@/lib/smart-print';

interface TimeframeData {
  label: string;
  badgeLabel: string;
  subLabel: string;
  collectedETB: number;
  productionETB: number;
  paymentsCount: number;
  treatmentsCount: number;
  patientsCount: number;
  newPatientsCount: number;
  noShowRate: string;
  cbeTotalETB: number;
  telebirrTotalETB: number;
  cashTotalETB: number;
  transferTotalETB: number;
  doc1ProductionETB: number;
  doc1Treatments: number;
  doc2ProductionETB: number;
  doc2Treatments: number;
  receivables0_30: number;
  receivables31_60: number;
  timeAxisLabels: [string, string, string];
  trendPeakLabel: string;
}

const TIMEFRAMES: Record<ReportPeriod, TimeframeData> = {
  daily: {
    label: 'Daily (Today)',
    badgeLabel: '24h Shift',
    subLabel: 'Oct 12, 2026 · Active Operating Shift',
    collectedETB: 18075.0,
    productionETB: 24950.0,
    paymentsCount: 6,
    treatmentsCount: 22,
    patientsCount: 6,
    newPatientsCount: 2,
    noShowRate: '0.0%',
    cbeTotalETB: 7800.0,
    telebirrTotalETB: 5695.0,
    cashTotalETB: 480.0,
    transferTotalETB: 4100.0,
    doc1ProductionETB: 24350.0,
    doc1Treatments: 18,
    doc2ProductionETB: 5160.0,
    doc2Treatments: 4,
    receivables0_30: 6875.0,
    receivables31_60: 0.0,
    timeAxisLabels: ['09:00', '13:00', '17:30'],
    trendPeakLabel: '7,800.00 ETB Peak',
  },
  weekly: {
    label: 'Weekly (7 Days)',
    badgeLabel: 'Week 41',
    subLabel: 'Oct 05 – Oct 11, 2026 · 7-Day Clinical Week',
    collectedETB: 114200.0,
    productionETB: 118450.0,
    paymentsCount: 38,
    treatmentsCount: 81,
    patientsCount: 38,
    newPatientsCount: 11,
    noShowRate: '0.0%',
    cbeTotalETB: 44200.0,
    telebirrTotalETB: 38400.0,
    cashTotalETB: 14800.0,
    transferTotalETB: 16800.0,
    doc1ProductionETB: 82650.0,
    doc1Treatments: 54,
    doc2ProductionETB: 35800.0,
    doc2Treatments: 27,
    receivables0_30: 6875.0,
    receivables31_60: 0.0,
    timeAxisLabels: ['Oct 05', 'Oct 08', 'Oct 11'],
    trendPeakLabel: '24,950.00 ETB Peak',
  },
  monthly: {
    label: 'Monthly (30 Days)',
    badgeLabel: '30 Days',
    subLabel: 'Sep 12 – Oct 12, 2026 · Monthly Rolling Cycle',
    collectedETB: 486500.0,
    productionETB: 512000.0,
    paymentsCount: 164,
    treatmentsCount: 348,
    patientsCount: 164,
    newPatientsCount: 47,
    noShowRate: '0.6%',
    cbeTotalETB: 189000.0,
    telebirrTotalETB: 165500.0,
    cashTotalETB: 62000.0,
    transferTotalETB: 70000.0,
    doc1ProductionETB: 358000.0,
    doc1Treatments: 230,
    doc2ProductionETB: 154000.0,
    doc2Treatments: 118,
    receivables0_30: 18500.0,
    receivables31_60: 4200.0,
    timeAxisLabels: ['Sep 15', 'Sep 30', 'Oct 12'],
    trendPeakLabel: '48,000.00 ETB Peak',
  },
  '3month': {
    label: '3 Months (Quarter)',
    badgeLabel: '90 Days',
    subLabel: 'Jul 01 – Sep 30, 2026 · Quarter 3 Performance',
    collectedETB: 1420800.0,
    productionETB: 1495000.0,
    paymentsCount: 492,
    treatmentsCount: 1040,
    patientsCount: 492,
    newPatientsCount: 142,
    noShowRate: '0.8%',
    cbeTotalETB: 546800.0,
    telebirrTotalETB: 498000.0,
    cashTotalETB: 184000.0,
    transferTotalETB: 192000.0,
    doc1ProductionETB: 1046500.0,
    doc1Treatments: 690,
    doc2ProductionETB: 448500.0,
    doc2Treatments: 350,
    receivables0_30: 34200.0,
    receivables31_60: 11000.0,
    timeAxisLabels: ['July', 'August', 'September'],
    trendPeakLabel: '142,000.00 ETB Peak',
  },
  '6month': {
    label: '6 Months (Half Year)',
    badgeLabel: '180 Days',
    subLabel: 'Apr 01 – Sep 30, 2026 · Semi-Annual Practice Review',
    collectedETB: 2810400.0,
    productionETB: 2960000.0,
    paymentsCount: 980,
    treatmentsCount: 2090,
    patientsCount: 980,
    newPatientsCount: 284,
    noShowRate: '1.1%',
    cbeTotalETB: 1080000.0,
    telebirrTotalETB: 984400.0,
    cashTotalETB: 365000.0,
    transferTotalETB: 381000.0,
    doc1ProductionETB: 2072000.0,
    doc1Treatments: 1380,
    doc2ProductionETB: 888000.0,
    doc2Treatments: 710,
    receivables0_30: 52000.0,
    receivables31_60: 18500.0,
    timeAxisLabels: ['April', 'June', 'September'],
    trendPeakLabel: '290,000.00 ETB Peak',
  },
  year: {
    label: '1 Year (Annual)',
    badgeLabel: '365 Days',
    subLabel: 'Oct 01, 2025 – Sep 30, 2026 · Fiscal Year 2026',
    collectedETB: 5580000.0,
    productionETB: 5840000.0,
    paymentsCount: 1940,
    treatmentsCount: 4120,
    patientsCount: 1940,
    newPatientsCount: 560,
    noShowRate: '1.2%',
    cbeTotalETB: 2150000.0,
    telebirrTotalETB: 1950000.0,
    cashTotalETB: 725000.0,
    transferTotalETB: 755000.0,
    doc1ProductionETB: 4088000.0,
    doc1Treatments: 2750,
    doc2ProductionETB: 1752000.0,
    doc2Treatments: 1370,
    receivables0_30: 78000.0,
    receivables31_60: 24000.0,
    timeAxisLabels: ['Q1 2026', 'Q2 2026', 'Q4 2026'],
    trendPeakLabel: '580,000.00 ETB Peak',
  },
};

export default function ReportsPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Timeframe selector state (Daily, Weekly, Monthly, 3 Months, 6 Months, 1 Year)
  const [selectedTimeframe, setSelectedTimeframe] = useState<ReportPeriod>('daily');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [zModalOpen, setZModalOpen] = useState(false);
  const [activePaymentMethodHover, setActivePaymentMethodHover] = useState<string | null>(null);

  // Current active statistics
  const currentStats = TIMEFRAMES[selectedTimeframe] || TIMEFRAMES.daily;
  const avgCollectedTicketETB = currentStats.collectedETB / Math.max(currentStats.paymentsCount, 1);

  // Prepare synchronized report data matching what is on screen
  const getReportDataForPeriod = (period: ReportPeriod) => {
    const stats = TIMEFRAMES[period] || TIMEFRAMES.daily;
    return {
      timeframe: period,
      totalCollectedETB: stats.collectedETB,
      totalProductionETB: stats.productionETB,
      patientsCount: stats.patientsCount,
      newPatientsCount: stats.newPatientsCount,
      treatmentsCount: stats.treatmentsCount,
      cashTotalETB: stats.cashTotalETB,
      telebirrTotalETB: stats.telebirrTotalETB,
      cbeTotalETB: stats.cbeTotalETB,
      transferTotalETB: stats.transferTotalETB,
      doc1ProductionETB: stats.doc1ProductionETB,
      doc1Treatments: stats.doc1Treatments,
      doc2ProductionETB: stats.doc2ProductionETB,
      doc2Treatments: stats.doc2Treatments,
    };
  };

  // Direct 1-Click Print/Save as PDF using the clean minimalist A4 HTML template
  const handleDirectPrintReport = (period: ReportPeriod = selectedTimeframe) => {
    const data = getReportDataForPeriod(period);
    printComprehensiveReport(period, data, clinic);
  };

  // Standalone HTML Download Handler
  const handleDownloadHTML = (period: ReportPeriod = selectedTimeframe) => {
    const data = getReportDataForPeriod(period);
    const htmlContent = getComprehensiveReportHTML(period, data, clinic);
    const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>BoleDental_Clinical_Audit_${period.toUpperCase()}_${new Date().toISOString().slice(0, 10)}</title>
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
    a.download = `Clinical_Audit_Report_${period.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. TOP CLINICAL HEADER */}
      <header className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-colors">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 truncate">
              Practice Analytics
            </h1>
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {currentStats.badgeLabel}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
            {clinic.name} · {currentStats.subLabel}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Main Download PDF Action (1-click prints what the page says) */}
          <button
            type="button"
            onClick={() => handleDirectPrintReport(selectedTimeframe)}
            className="rounded-xl font-bold inline-flex items-center transition-all px-3.5 py-2 text-xs gap-1.5 text-white bg-slate-900 hover:bg-slate-800 shadow-xs"
            title={`Print or Save ${currentStats.label} as official clean A4 PDF`}
          >
            <Download className="size-3.5" />
            <span>Download Report (PDF)</span>
          </button>

          {/* Preview A4 Sheet Modal */}
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="rounded-xl font-semibold inline-flex items-center transition-colors px-3 py-2 text-xs gap-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs"
            title="Preview full A4 clinical document before printing"
          >
            <FileText className="size-3.5 text-slate-500" />
            <span>Preview Template</span>
          </button>

          {/* Daily Z-Report Cashier Close Trigger */}
          <button
            type="button"
            onClick={() => setZModalOpen(true)}
            className="rounded-xl font-semibold inline-flex items-center transition-colors px-3 py-2 text-xs gap-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs"
            title="Daily Cashier Drawer Close (Z-Report)"
          >
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Daily</span> Z-Report
          </button>
        </div>
      </header>

      {/* 2. SIMPLE, EASY-TO-SELECT TIMEFRAME BAR (Anyone can understand!) */}
      <div className="p-1.5 bg-slate-100/90 border border-slate-200/90 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-thin shadow-2xs">
        {[
          { id: 'daily', label: 'Today (Daily)', icon: Clock },
          { id: 'weekly', label: 'This Week (7 Days)', icon: Calendar },
          { id: 'monthly', label: 'This Month (30 Days)', icon: CalendarDays },
          { id: '3month', label: '3 Months (Quarter)', icon: BarChart3 },
          { id: '6month', label: '6 Months (Half Year)', icon: LineChart },
          { id: 'year', label: '1 Year (Annual)', icon: ShieldCheck },
        ].map((t) => {
          const IconComp = t.icon;
          const isSelected = selectedTimeframe === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTimeframe(t.id as ReportPeriod)}
              className={`flex-1 min-w-[130px] sm:min-w-0 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2.5 ACTIVE AUDIT PERIOD BANNER (Crystal Clear & Simple for Anyone) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
            <Calendar className="size-5 text-sky-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {currentStats.label} Practice Summary
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                Audited
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {currentStats.subLabel} · Total Collected:{' '}
              <strong className="text-slate-900 font-mono">
                {currentStats.collectedETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </strong>{' '}
              ({currentStats.patientsCount} patients · {currentStats.treatmentsCount} treatments)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleDirectPrintReport(selectedTimeframe)}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            title={`Print or Save ${currentStats.label} as official A4 PDF`}
          >
            <Download className="size-3.5" />
            <span>Download {currentStats.label.split(' ')[0]} PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Preview A4 document in full view"
          >
            <FileText className="size-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>

      {/* 3. DRILL DOWN NAVIGATION PILLS */}
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

        {/* Quick Report Launchers */}
        <button
          type="button"
          onClick={() => {
            setSelectedTimeframe('daily');
            handleDirectPrintReport('daily');
          }}
          className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-sky-300 bg-sky-50/70 px-3 py-1.5 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100 shadow-xs"
          title="1-Click Print or Save Daily PDF Report"
        >
          <Download className="h-3.5 w-3.5 text-sky-700" />
          <span>Download Daily PDF</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTimeframe('weekly');
            handleDirectPrintReport('weekly');
          }}
          className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-indigo-300 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition-colors hover:bg-indigo-100 shadow-xs"
          title="1-Click Print or Save Weekly PDF Report"
        >
          <Download className="h-3.5 w-3.5 text-indigo-700" />
          <span>Download Weekly PDF</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTimeframe('monthly');
            handleDirectPrintReport('monthly');
          }}
          className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-emerald-300 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 shadow-xs"
          title="1-Click Print or Save Monthly PDF Report"
        >
          <Download className="h-3.5 w-3.5 text-emerald-700" />
          <span>Download Monthly PDF</span>
        </button>
      </nav>

      {/* 4. FOUR PRIMARY SUMMARY CARDS (Dynamic based on selected timeframe) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Cash Collected */}
        <div
          onClick={() => setIsReportModalOpen(true)}
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
                {currentStats.collectedETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">{currentStats.paymentsCount} payments received</div>
              </div>
              <div className="block w-full mt-2" style={{ height: 32 }}>
                <svg
                  viewBox="0 0 100 32"
                  preserveAspectRatio="none"
                  role="img"
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
        </div>

        {/* Card 2: Patient Credit / Advances */}
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-sky-500">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <PiggyBank className="w-4 h-4 shrink-0 text-sky-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Patient credit
            </span>
            <span className="ms-auto inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3 h-3 text-slate-400" /> Verified
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                0.00 ETB
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">Unallocated advances balance</div>
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
                {currentStats.productionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs text-slate-500 truncate">
                  {currentStats.treatmentsCount.toLocaleString()} treatments completed
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
                <div className="text-xs text-slate-500 truncate">Over {currentStats.paymentsCount} payments</div>
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

      {/* 5. MID SECTION: COLLECTIONS OVER TIME & BY PAYMENT METHOD */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Collections Over Time Chart */}
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <LineChart className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Collections over time ({currentStats.label})
            </span>
          </header>
          <div className="flex-1 px-4 pb-4 min-w-0">
            <div className="w-full">
              <div className="relative w-full select-none" style={{ height: 220 }}>
                <svg
                  viewBox="0 0 800 220"
                  preserveAspectRatio="none"
                  role="img"
                  className="w-full h-full overflow-visible"
                >
                  <path
                    d="M8.00,190.26 L400.00,140.81 L792.00,8.00 L792.00,200 L8.00,200 Z"
                    fill="#10b981"
                    fillOpacity="0.12"
                  />
                  <path
                    d="M8.00,200.00 L400.00,200.00 L792.00,200.00"
                    stroke="#f43f5e"
                    strokeWidth="1.25"
                    strokeDasharray="4 4"
                    fill="none"
                    opacity="0.6"
                  />
                  <path
                    d="M8.00,190.26 L400.00,140.81 L792.00,8.00"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle cx="8" cy="190.26" r="4.5" fill="#10b981" />
                  <circle cx="400" cy="140.81" r="4.5" fill="#10b981" />
                  <circle cx="792" cy="8.00" r="5" fill="#10b981" />
                </svg>

                {/* Date Axis Badges */}
                <div
                  className="absolute text-xs text-slate-400 font-mono -translate-x-1/2 pointer-events-none"
                  style={{ left: '3%', bottom: '0px' }}
                >
                  {currentStats.timeAxisLabels[0]}
                </div>
                <div
                  className="absolute text-xs text-slate-400 font-mono -translate-x-1/2 pointer-events-none"
                  style={{ left: '50%', bottom: '0px' }}
                >
                  {currentStats.timeAxisLabels[1]}
                </div>
                <div
                  className="absolute text-xs text-slate-400 font-mono -translate-x-1/2 pointer-events-none"
                  style={{ left: '96%', bottom: '0px' }}
                >
                  {currentStats.timeAxisLabels[2]}
                </div>

                {/* Peak Label */}
                <div className="absolute top-0 start-0 text-xs text-slate-600 font-mono font-bold pointer-events-none bg-white/90 px-2 py-0.5 rounded border border-slate-200">
                  {currentStats.trendPeakLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* By Payment Method Donut Chart */}
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-transparent">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <CreditCard className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              By payment method ({currentStats.label})
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
                  aria-label="Donut chart"
                >
                  <path
                    d="M 74.000 0.000 A 74 74 0 0 1 104.860 141.258 L 98.188 126.716 A 58 58 0 0 0 74.000 16.000 Z"
                    fill="#64748b"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                  <path
                    d="M 104.860 141.258 A 74 74 0 0 1 0.017 75.575 L 16.013 75.235 A 58 58 0 0 0 98.188 126.716 Z"
                    fill="#0284c7"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                  <path
                    d="M 0.017 75.575 A 74 74 0 0 1 61.710 1.028 L 64.367 16.806 A 58 58 0 0 0 16.013 75.235 Z"
                    fill="#6366f1"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                  <path
                    d="M 61.710 1.028 A 74 74 0 0 1 74.000 0.000 L 74.000 16.000 A 58 58 0 0 0 64.367 16.806 Z"
                    fill="#10b981"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                </svg>

                {/* Donut Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total</div>
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {currentStats.collectedETB >= 1000000
                      ? `${(currentStats.collectedETB / 1000000).toFixed(2)}M ETB`
                      : `${(currentStats.collectedETB / 1000).toFixed(0)}k ETB`}
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <ul className="flex-1 min-w-0 space-y-2">
                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-sky-600" />
                    <span className="text-slate-700">CBE Birr POS / Card</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {currentStats.cbeTotalETB.toLocaleString()} ETB
                  </span>
                </li>

                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-slate-500" />
                    <span className="text-slate-700">Telebirr SuperApp</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {currentStats.telebirrTotalETB.toLocaleString()} ETB
                  </span>
                </li>

                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-indigo-500" />
                    <span className="text-slate-700">Bank Transfer</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {currentStats.transferTotalETB.toLocaleString()} ETB
                  </span>
                </li>

                <li className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-emerald-500" />
                    <span className="text-slate-700">Physical Cash</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {currentStats.cashTotalETB.toLocaleString()} ETB
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRODUCTION BY DOCTOR */}
      <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-sky-500">
        <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
          <Stethoscope className="w-4 h-4 shrink-0 text-sky-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Production by doctor ({currentStats.label})
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
                    <div className="text-xs text-slate-500 truncate">{currentStats.doc1Treatments} treatments completed</div>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 shrink-0">
                    {currentStats.doc1ProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                  </div>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out bg-sky-500"
                    style={{ width: `${((currentStats.doc1ProductionETB / currentStats.productionETB) * 100).toFixed(0)}%` }}
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
                    <div className="text-xs text-slate-500 truncate">{currentStats.doc2Treatments} treatments completed</div>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900 shrink-0">
                    {currentStats.doc2ProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                  </div>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100" aria-hidden="true">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out bg-sky-500"
                    style={{ width: `${((currentStats.doc2ProductionETB / currentStats.productionETB) * 100).toFixed(0)}%` }}
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* 7. NEW PATIENTS & NO-SHOW RATE */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <UserPlus className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              New patients
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                {currentStats.newPatientsCount}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {((currentStats.newPatientsCount / Math.max(currentStats.patientsCount, 1)) * 100).toFixed(1)}% of total appointments
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500">
          <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
            <CalendarX className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              No-show rate
            </span>
          </header>
          <div className="flex-1 px-4 pb-3.5 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono truncate">
                {currentStats.noShowRate}
              </div>
              <div className="text-xs text-slate-500 truncate">
                100% adherence on confirmed reminders
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. AGING RECEIVABLES */}
      <div className="relative flex flex-col rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs before:absolute before:start-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-500">
        <header className="flex items-center gap-2 px-4 pt-3.5 pb-1">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Aging receivables ({currentStats.label})
          </span>
          <span className="ms-auto inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3 h-3 text-slate-400" /> MoR Ledger
          </span>
        </header>
        <div className="flex-1 px-4 pb-4 min-w-0">
          <div className="space-y-3.5">
            <div className="text-xl sm:text-2xl text-slate-900 font-bold font-mono">
              {(currentStats.receivables0_30 + currentStats.receivables31_60).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
            </div>
            <ul className="space-y-3">
              <li>
                <div className="block w-full text-start">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <div className="text-xs font-semibold text-slate-800">0-30 days (Current)</div>
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {currentStats.receivables0_30.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
                  </div>
                </div>
              </li>

              <li>
                <div className="block w-full text-start">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <div className="text-xs font-semibold text-slate-800">31-60 days</div>
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {currentStats.receivables31_60.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: currentStats.receivables31_60 > 0 ? '20%' : '0%' }} />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 9. MODAL FOR DAILY FISCAL Z-REPORT */}
      {zModalOpen && (
        <ZReportModal
          isOpen={zModalOpen}
          onClose={() => setZModalOpen(false)}
        />
      )}

      {/* 10. UNIFIED A4 CLINICAL AUDIT REPORT MODAL (Supports Daily, Weekly, Monthly, 3M, 6M, 1Y) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[94vh] bg-slate-100 rounded-2xl shadow-float border border-slate-300 overflow-hidden flex flex-col">
            {/* Modal Bar with Timeframe Switchers & Action Buttons */}
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                {(['daily', 'weekly', 'monthly', '3month', '6month', 'year'] as ReportPeriod[]).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setSelectedTimeframe(period)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTimeframe === period
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {TIMEFRAMES[period].label.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ms-auto">
                {/* Download Standalone HTML button */}
                <button
                  type="button"
                  onClick={() => handleDownloadHTML(selectedTimeframe)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                  title="Download clean standalone HTML report file"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Download HTML</span>
                </button>

                {/* Print / Save as PDF button */}
                <button
                  type="button"
                  onClick={() => handleDirectPrintReport(selectedTimeframe)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF (A4)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Viewport - Shows the clean, minimalist A4 HTML layout */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/60">
              <div className="w-full max-w-[820px] bg-white rounded-sm shadow-xl border border-slate-300 p-6 sm:p-10 my-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html: getComprehensiveReportHTML(selectedTimeframe, getReportDataForPeriod(selectedTimeframe), clinic)
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
