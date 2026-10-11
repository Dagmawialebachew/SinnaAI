'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Printer,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';

export default function QuotesPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Quotes & Cost Estimates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Formal treatment cost estimates with Ethiopian Ministry of Revenues compliance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('New formal estimate draft created for Bole Dental Studio.')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Treatment Quote</span>
          </button>
        </div>
      </div>

      {/* Quotes List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card divide-y divide-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-slate-700">Estimate Reference</span>
          <span>Status & Amount</span>
        </div>

        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-blue-600">QT-2026-0089</span>
              <span className="text-sm font-bold text-slate-900">Abebe Kebede</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Accepted
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Endodontic Pulpectomy + Ceramic Crown (#36) · Valid until Nov 10, 2026
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-slate-900 font-mono">8,500.00 ETB</span>
            <p className="text-[11px] text-slate-400">Required Deposit: 1,500 ETB</p>
          </div>
        </div>

        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-blue-600">QT-2026-0090</span>
              <span className="text-sm font-bold text-slate-900">Dawit Haile</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Pending Patient Review
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Titanium Implant Fixture + Abutment · Valid until Nov 15, 2026
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-slate-900 font-mono">35,000.00 ETB</span>
            <p className="text-[11px] text-slate-400">Required Deposit: 10,000 ETB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
