'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { ReceiptModal } from '@/components/receipt-modal';
import { Appointment } from '@/lib/types';

export default function InvoicesPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const [receiptApt, setReceiptApt] = useState<Appointment | null>(null);

  const appointments = Array.isArray(store.appointments) ? store.appointments : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Invoices & Tax Receipts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ministry of Revenues (MoR) TIN 0049283711 Electronic Fiscal Invoices
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card divide-y divide-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-slate-700">Fiscal Receipt Number</span>
          <span>Settlement & Print</span>
        </div>

        {appointments.map((apt) => (
          <div key={apt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-slate-900">
                  {apt.receiptNumber || 'RCP-2026-0041'}
                </span>
                <span className="text-sm font-bold text-slate-900">{apt.patientName}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  apt.paymentStatus === 'fully_paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {apt.paymentStatus === 'fully_paid' ? 'Paid In Full' : 'Deposit Settled'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {apt.serviceName} · Doctor: {apt.doctorName}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                MoR TIN: 0049283711 · Addis Ababa
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-base font-bold text-slate-900 font-mono">
                  {apt.totalDueETB.toLocaleString()} ETB
                </span>
                <p className="text-[11px] text-slate-500 font-mono">
                  Deposit: {apt.depositPaidETB} ETB
                </p>
              </div>

              <button
                onClick={() => setReceiptApt(apt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print MoR Receipt</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {receiptApt && (
        <ReceiptModal
          isOpen={!!receiptApt}
          onClose={() => setReceiptApt(null)}
          appointment={receiptApt}
        />
      )}
    </div>
  );
}
