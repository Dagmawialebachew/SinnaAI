'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { printThermalReceipt } from '@/lib/smart-print';

export default function PaymentsPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const ledger = Array.isArray(store.ledger) ? store.ledger : [];
  const totalCollectedETB = ledger.reduce((sum, tx) => sum + (tx.amountETB || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Payments & Cashier Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            CBE Birr POS, Telebirr SuperApp, Physical Cash, and Chapa online settlements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/manager"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
          >
            <span>Close Day Cash Drawer (Z-Report)</span>
          </Link>
        </div>
      </div>

      {/* Payment Ledger Transactions Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-slate-700">Recent Transactions</span>
          <span className="font-mono">{ledger.length} entries recorded</span>
        </div>

        <div className="divide-y divide-slate-100">
          {ledger.map((tx) => {
            const isTelebirr = tx.method.includes('telebirr');
            const isCBE = tx.method.includes('cbe');
            const isCash = tx.method === 'cash';

            return (
              <div key={tx.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isTelebirr
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : isCBE
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isTelebirr ? <Smartphone className="w-4 h-4" /> : isCash ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{tx.patientName}</span>
                      <span className="text-[11px] font-mono text-slate-400">{tx.receiptNumber}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Method: <span className="capitalize font-semibold text-slate-700">{tx.method.replace('_', ' ')}</span> · Recorded by {tx.recordedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900 font-mono">
                      +{tx.amountETB.toLocaleString()} ETB
                    </span>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      printThermalReceipt({
                        receiptNumber: tx.receiptNumber,
                        patientName: tx.patientName,
                        doctorName: 'Dr. Senait Tadesse',
                        serviceName: 'Clinical Dental Treatment Settlement',
                        amountETB: tx.amountETB,
                        paymentMethod: tx.method,
                        tinNumber: '0049283711'
                      }, clinic);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Print Thermal POS Receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

