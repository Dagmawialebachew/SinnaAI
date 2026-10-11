'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { DayCloseReport, Clinic } from '@/lib/types';
import { useSinnaStore } from '@/lib/store';

interface ZReportModalProps {
  report?: DayCloseReport | null;
  clinic?: Clinic;
  isOpen?: boolean;
  onClose: () => void;
}

export function ZReportModal({ report: reportProp, clinic: clinicProp, isOpen, onClose }: ZReportModalProps) {
  const store = useSinnaStore();
  if (isOpen !== undefined && !isOpen) return null;

  const clinic = clinicProp || store.clinics[store.activeClinicSlug] || Object.values(store.clinics)[0];
  const report: DayCloseReport = reportProp || store.dayCloseReport || {
    id: 'z-rep-today',
    zReportNumber: 'Z-2026-1010-001',
    clinicSlug: clinic?.slug || 'bole-dental',
    closedAt: new Date().toISOString(),
    closedBy: store.currentUser.name,
    totalBilledETB: 18075,
    totalCollectedETB: 18075,
    cashExpectedETB: 8500,
    cashCountedETB: 8500,
    cashVarianceETB: 0,
    telebirrTotalETB: 5575,
    cbeTotalETB: 4000,
    chapaTotalETB: 0,
    totalPatientsCount: 6,
    completedEncountersCount: 4,
    tinNumber: '0049283711',
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const isBalanced = Math.abs(report.cashVarianceETB) < 0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Official End-of-Day Z-Report</h3>
              <p className="text-[11px] text-slate-400 font-mono">Fiscal Ref: {report.zReportNumber}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Z-Report Paper */}
        <div className="p-6 overflow-y-auto bg-slate-50 font-mono text-xs text-slate-800 space-y-4 print:p-0 print:bg-white">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            
            {/* Practice Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-brand-primary font-bold text-sm">
                <Building2 className="w-4 h-4" />
                <span>{clinic.name}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-amharic">{clinic.taglineAm}</p>
              <p className="text-[11px] text-slate-600">{clinic.location}</p>
              <p className="text-[11px] text-slate-600">Tel: {clinic.phone}</p>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px] tracking-wider border border-slate-200">
                  TIN: {report.tinNumber}
                </span>
              </div>
            </div>

            {/* Fiscal Meta */}
            <div className="text-[11px] space-y-1 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Z-REPORT NO:</span>
                <span className="font-bold text-slate-900">{report.zReportNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CLOSED AT:</span>
                <span className="font-medium">{new Date(report.closedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MANAGER:</span>
                <span className="font-medium">{report.closedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">REG. MACHINE ID:</span>
                <span className="font-medium">REG-ADDIS-MOR-09</span>
              </div>
            </div>

            {/* Daily Operational Stats */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Volume</div>
              <div className="flex justify-between text-xs">
                <span>Total Patients Seen:</span>
                <span className="font-bold">{report.totalPatientsCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Completed Encounters:</span>
                <span className="font-bold">{report.completedEncountersCount}</span>
              </div>
            </div>

            {/* Revenue & Split Tender Breakdown */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Split-Tender Collections</div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">Physical Cash:</span>
                <span className="font-bold">{report.cashExpectedETB.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Telebirr Merchant:</span>
                <span className="font-bold">{report.telebirrTotalETB.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">CBE Birr Direct:</span>
                <span className="font-bold">{report.cbeTotalETB.toLocaleString()} ETB</span>
              </div>
              {report.chapaTotalETB > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Chapa Online:</span>
                  <span className="font-bold">{report.chapaTotalETB.toLocaleString()} ETB</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-950">
                <span>TOTAL REVENUE:</span>
                <span className="text-brand-primary">{report.totalCollectedETB.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Cash Drawer Audit Verification */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cash Vault Audit</div>
              
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">System Expected Cash:</span>
                <span className="font-bold">{report.cashExpectedETB.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Physical Counted Cash:</span>
                <span className="font-bold">{report.cashCountedETB.toLocaleString()} ETB</span>
              </div>

              <div className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                isBalanced 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : report.cashVarianceETB > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <span className="font-bold">Drawer Variance:</span>
                <span className="font-black text-sm">
                  {report.cashVarianceETB >= 0 ? `+${report.cashVarianceETB.toLocaleString()}` : report.cashVarianceETB.toLocaleString()} ETB
                </span>
              </div>

              {report.varianceReason && (
                <div className="text-[11px] bg-slate-50 p-2 rounded border border-slate-200 text-slate-600">
                  <span className="font-bold">Audit Note: </span>
                  {report.varianceReason}
                </div>
              )}
            </div>

            {/* Certification Block */}
            <div className="pt-2 text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center p-2">
                <div className="w-full h-full border border-dashed border-slate-400 flex items-center justify-center text-[8px] font-mono font-bold text-slate-500 text-center leading-tight">
                  MoR FISCAL QR SEAL
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>LEDGER LOCKED & CERTIFIED</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Irreversible daily fiscal audit record. Produced by Sinna Dental OS.
              </p>
            </div>

            {/* Dual Signatures */}
            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-dashed border-slate-300 text-[10px]">
              <div>
                <p className="text-slate-400 mb-6">Cashier Signature:</p>
                <div className="border-t border-slate-400 pt-1 text-slate-600 font-medium">Front Desk</div>
              </div>
              <div>
                <p className="text-slate-400 mb-6">Manager Signature:</p>
                <div className="border-t border-slate-400 pt-1 text-slate-900 font-bold">{report.closedBy}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Z-Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
