'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  ArrowRight,
  Users,
  Stethoscope,
  Receipt,
  FileSpreadsheet,
  Settings,
  CheckCircle2,
  RotateCcw,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { sinnaStore } from '@/lib/store';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoGuideModal({ isOpen, onClose }: DemoGuideModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Workstation Station Auth',
      route: '/login',
      role: 'Helen (Reception) or Dr. Senait',
      icon: Users,
      pitch: 'Demonstrate station separation tailored for Addis operatory workflows. Use 1-tap Fast Pass or 4-digit PIN.',
      accent: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      num: '02',
      title: 'Queue & 1-Tap Intake',
      route: '/reception',
      role: 'Front Desk Dispatcher',
      icon: Receipt,
      pitch: 'Show patient check-in, 3-chair dispatcher, cash change calculator (200/100/50 notes), and MoR thermal receipt.',
      accent: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      num: '03',
      title: '30-Sec Chairside Charting',
      route: '/doctor',
      role: 'Dr. Senait Tadesse',
      icon: Stethoscope,
      pitch: 'Interactive 32-tooth FDI odontogram, live running bill in ETB, and automated AfroMessage post-op SMS dispatch.',
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      num: '04',
      title: 'Day Close & MoR Z-Report',
      route: '/manager',
      role: 'Practice Director & Audit',
      icon: FileSpreadsheet,
      pitch: 'Reconcile 4 tender buckets (Cash, Telebirr, CBE, Chapa), resolve cash drawer variance, and print official MoR Z-Report.',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      num: '05',
      title: 'Live Practice Customizer',
      route: '/admin',
      role: 'Clinic Configuration',
      icon: Settings,
      pitch: 'Prove to clinic owners that clinic name, doctors, MoR TIN (0049283711), and ETB prices can be customized in real time.',
      accent: 'text-slate-700 bg-slate-100 border-slate-300',
    },
  ];

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Sinna OS · 3-Minute Demo Script
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Presenter Cheatsheet
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Recommended walkthrough for clinic directors and head dentists in Addis Ababa. Click any step to jump straight into that workstation.
            </p>
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-3">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                onClick={() => handleNavigate(st.route)}
                className="group p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-mono font-bold text-xs shrink-0 ${st.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold font-mono text-slate-400">
                        STEP {st.num}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {st.title}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                        {st.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {st.pitch}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                    Launch
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & Reset */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 text-[11px]">
            Designed for Bole Medhanialem & Addis Ababa Private Clinics
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sinnaStore.resetDemoData();
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
