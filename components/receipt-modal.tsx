'use client';

import React from 'react';
import { X, Printer, CheckCircle2, QrCode } from 'lucide-react';
import { Clinic, Appointment, LedgerTransaction } from '@/lib/types';
import { useSinnaStore } from '@/lib/store';
import { printThermalReceipt } from '@/lib/smart-print';

interface ReceiptModalProps {
  clinic?: Clinic;
  appointment: Appointment | null;
  transaction?: LedgerTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ clinic: clinicProp, appointment, transaction, isOpen, onClose }: ReceiptModalProps) {
  const store = useSinnaStore();
  const clinic = clinicProp || store.clinics[store.activeClinicSlug] || Object.values(store.clinics)[0];
  if (!isOpen || !appointment) return null;

  const receiptNumber = transaction?.receiptNumber || appointment.receiptNumber || 'RCP-2026-0089';
  const finalAmount = transaction?.amountETB || (appointment.totalDueETB - appointment.depositPaidETB);

  const handlePrint = () => {
    printThermalReceipt({
      receiptNumber,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      serviceName: appointment.serviceName,
      amountETB: finalAmount,
      paymentMethod: transaction?.method || 'Telebirr / Cash',
      tinNumber: '0049283711'
    }, clinic);
  };

  const contract = store.contracts?.find(
    (c) => c.patientId === appointment.id || c.patientName.toLowerCase() === appointment.patientName.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] bg-white rounded-3xl shadow-float border border-slate-100 flex flex-col overflow-hidden">
        
        {/* Actions Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Receipt Preview ({receiptNumber})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-brand-primary text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-brand-hover transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div className="p-6 sm:p-8 font-mono text-slate-800 text-xs space-y-4 overflow-y-auto flex-1">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold font-sans tracking-tight text-slate-950 uppercase">{clinic.name}</h2>
            <p className="text-[11px] text-slate-500">{clinic.location}</p>
            <p className="text-[11px] text-slate-500">TIN: 0049283711 • Tel: {clinic.phone}</p>
            <div className="border-b-2 border-dashed border-slate-300 my-3"></div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">RECEIPT NO:</span>
              <span className="font-bold text-slate-900">{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DATE & TIME:</span>
              <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PATIENT:</span>
              <span className="font-bold">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DENTIST:</span>
              <span>{appointment.doctorName}</span>
            </div>
            {contract && (
              <div className="flex justify-between text-blue-700 font-semibold">
                <span>PLAN CODE:</span>
                <span>{contract.id} (Visit {contract.completedVisitsCount}/{contract.estimatedVisits})</span>
              </div>
            )}
            <div className="border-b-2 border-dashed border-slate-300 my-2"></div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-bold text-slate-900 text-xs">
              <span>DESCRIPTION</span>
              <span>AMOUNT</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>{contract ? `${contract.title} (Installment)` : `1x ${appointment.serviceName}`}</span>
              <span>{finalAmount.toLocaleString()} ETB</span>
            </div>
            {appointment.depositPaidETB > 0 && !contract && (
              <div className="flex justify-between text-[11px] text-emerald-600 font-semibold">
                <span>Less: Deposit (Chapa Online)</span>
                <span>-{appointment.depositPaidETB.toLocaleString()} ETB</span>
              </div>
            )}
            <div className="border-b-2 border-dashed border-slate-300 my-2"></div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-sm font-bold text-slate-950">
              <span>AMOUNT PAID NOW:</span>
              <span>{finalAmount.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>PAYMENT METHOD:</span>
              <span className="uppercase font-semibold text-slate-700">
                {transaction?.method.replace('_', ' ') || 'CASH IN CLINIC'}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>BALANCE OUTSTANDING:</span>
              <span className={`font-bold ${contract ? (contract.remainingBalanceETB === 0 ? 'text-emerald-700' : 'text-amber-700') : 'text-emerald-700'}`}>
                {contract
                  ? `${contract.remainingBalanceETB.toLocaleString()} ETB ${contract.remainingBalanceETB === 0 ? '(PAID IN FULL)' : '(COURSE BALANCE)'}`
                  : '0.00 ETB (PAID IN FULL)'}
              </span>
            </div>
            {contract && contract.prepaidCreditETB > 0 && (
              <div className="flex justify-between text-[11px] text-blue-700 font-bold">
                <span>PREPAID CREDIT RESERVE:</span>
                <span>{contract.prepaidCreditETB.toLocaleString()} ETB</span>
              </div>
            )}
          </div>

          <div className="border-b-2 border-dashed border-slate-300 my-3"></div>

          <div className="text-center space-y-2 pt-1">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="w-10 h-10 text-slate-800" />
              <div className="text-left text-[9px] text-slate-500 leading-tight">
                <p className="font-bold text-slate-700">SINNA OS VERIFIED</p>
                <p>Tax Authority e-Invoice</p>
                <p>Auth: SHA256-OK-2026</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-amharic">
              ስለጎበኙን እናመሰግናለን! ጤና ይስጥልን።
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
