'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Printer,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Banknote,
  Receipt,
  Stethoscope,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { ZReportModal } from '@/components/z-report-modal';
import { LedgerTransaction } from '@/lib/types';

export default function ReportsPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const [datePeriod, setDatePeriod] = useState('Period · 2026-10-01 — 2026-10-10');
  const [zModalOpen, setZModalOpen] = useState(false);

  const safeLedger = Array.isArray(store.ledger) ? store.ledger : [];
  const totalCollectedETB = safeLedger.reduce((sum, tx) => sum + (tx.amountETB || 0), 18075);
  const totalProductionETB = 24950;
  const completedTreatmentsCount = 22;
  const paymentsCount = Math.max(safeLedger.length, 6);
  const avgCollectedTicketETB = Math.round(totalCollectedETB / paymentsCount);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER & QUICK SHORTCUTS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Reports & Practice Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your clinic production, collections, and daily fiscal close · {clinic.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200/90 text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{datePeriod}</span>
            <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
          </div>

          <button
            onClick={() => setZModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Z-Report</span>
          </button>
        </div>
      </div>

      {/* 2. ACTION SHORTCUT PILLS */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 border border-slate-200 transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>Billing</span>
        </Link>
        <Link
          href="/quotes"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 border border-slate-200 transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>Quotes</span>
        </Link>
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 border border-slate-200 transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>Schedule</span>
        </Link>
        <Link
          href="/payments"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 border border-slate-200 transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>Payments</span>
        </Link>
      </div>

      {/* 3. FOUR TOP KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CASH COLLECTED */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cash Collected
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {totalCollectedETB.toLocaleString()} ETB
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {paymentsCount} payments received
            </p>
          </div>
          <div className="mt-4 pt-2">
            <svg className="w-full h-8 text-emerald-500" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path
                d="M0,22 Q25,20 50,14 T100,5 L100,25 L0,25 Z"
                fill="currentColor"
                fillOpacity="0.1"
              />
              <path
                d="M0,22 Q25,20 50,14 T100,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: PATIENT CREDIT */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Patient Credit
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Today
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              0.00 ETB
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unallocated advances
            </p>
          </div>
          <div className="mt-4 pt-2">
            <div className="h-8 flex items-end">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: PRODUCTION */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Production
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {totalProductionETB.toLocaleString()} ETB
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {completedTreatmentsCount} treatments completed
            </p>
          </div>
          <div className="mt-4 pt-2">
            <svg className="w-full h-8 text-blue-500" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path
                d="M0,24 Q30,18 60,10 T100,4 L100,25 L0,25 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
              <path
                d="M0,24 Q30,18 60,10 T100,4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Card 4: AVG COLLECTED TICKET */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Avg Collected Ticket
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {avgCollectedTicketETB.toLocaleString()} ETB
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Over {paymentsCount} payments
            </p>
          </div>
          <div className="mt-4 pt-2">
            <div className="h-8 flex items-end">
              <div className="w-full h-1.5 bg-indigo-50 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CHARTS SECTION: Collections Over Time & By Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Collections Over Time Area Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Collections Over Time
              </span>
              <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">
                13,300.00 ETB
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +18.4% vs last week
            </span>
          </div>

          <div className="h-48 relative pt-4">
            <svg className="w-full h-full text-emerald-500" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradReportEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />

              <polygon
                points="0,130 80,125 160,110 240,90 320,55 400,35 500,20 500,140 0,140"
                fill="url(#gradReportEmerald)"
              />
              <polyline
                points="0,130 80,125 160,110 240,90 320,55 400,35 500,20"
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="80" cy="125" r="3.5" fill="#059669" />
              <circle cx="160" cy="110" r="3.5" fill="#059669" />
              <circle cx="240" cy="90" r="3.5" fill="#059669" />
              <circle cx="320" cy="55" r="3.5" fill="#059669" />
              <circle cx="400" cy="35" r="3.5" fill="#059669" />
              <circle cx="500" cy="20" r="4" fill="#059669" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-slate-100">
            <span>Oct 02</span>
            <span>Oct 04</span>
            <span>Oct 06</span>
            <span>Oct 08</span>
            <span>Oct 10</span>
          </div>
        </div>

        {/* Right: By Payment Method Donut */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              By Payment Method
            </span>
            <div className="text-xs text-slate-400 mt-0.5">
              Ethiopian Financial Rail Settlement
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#0284c7"
                  strokeWidth="12"
                  strokeDasharray="108 251.2"
                  strokeDashoffset="0"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#16a34a"
                  strokeWidth="12"
                  strokeDasharray="78 251.2"
                  strokeDashoffset="-108"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#334155"
                  strokeWidth="12"
                  strokeDasharray="58 251.2"
                  strokeDashoffset="-186"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#d97706"
                  strokeWidth="12"
                  strokeDasharray="8 251.2"
                  strokeDashoffset="-244"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {(totalCollectedETB / 1000).toFixed(1)}k ETB
                </span>
              </div>
            </div>

            <div className="space-y-2 flex-1 text-xs w-full">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
                  <span className="text-slate-600">Telebirr SuperApp</span>
                </div>
                <span className="font-semibold text-slate-900 font-mono">7,800 ETB</span>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span className="text-slate-600">CBE Birr POS</span>
                </div>
                <span className="font-semibold text-slate-900 font-mono">5,695 ETB</span>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0" />
                  <span className="text-slate-600">Physical Cash</span>
                </div>
                <span className="font-semibold text-slate-900 font-mono">4,100 ETB</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
                  <span className="text-slate-600">Chapa Online Gateway</span>
                </div>
                <span className="font-semibold text-slate-900 font-mono">480 ETB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PRODUCTION BY DOCTOR & Z-REPORT CLOSE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Production by Doctor
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Oct 01 — Oct 10</span>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center">
                  ST
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Dr. Senait Tadesse</p>
                  <p className="text-xs text-slate-500">Lead Specialist & Surgeon</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-slate-900 font-mono">24,950.00 ETB</span>
                <p className="text-[11px] text-emerald-600 font-medium">18 Completed Procedures</p>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center">
                  DB
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Dr. Dawit Bekele</p>
                  <p className="text-xs text-slate-500">Oral Surgeon & Endodontist</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-slate-900 font-mono">14,200.00 ETB</span>
                <p className="text-[11px] text-blue-600 font-medium">9 Completed Procedures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Close Audit Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Daily Z-Report & Cash Drawer Close
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                store.isDayClosed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {store.isDayClosed ? 'Shift Sealed' : 'Shift Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify physical 200, 100, and 50 Birr bank notes against system receipts before sealing the cash drawer.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ministry of Revenues TIN:</span>
                <span className="font-mono font-bold text-slate-800">0049283711</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Billed Today:</span>
                <span className="font-mono font-bold text-slate-800">18,075.00 ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cash Discrepancy / Variance:</span>
                <span className="font-mono font-bold text-emerald-600">0.00 ETB (Exact Match)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => setZModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Launch Z-Report Close Modal</span>
            </button>
          </div>
        </div>
      </div>

      {zModalOpen && (
        <ZReportModal
          isOpen={zModalOpen}
          onClose={() => setZModalOpen(false)}
        />
      )}
    </div>
  );
}
