'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Radio, Clock, ShieldCheck } from 'lucide-react';
import { SmsToastNotification } from '@/lib/types';
import { useSinnaStore, sinnaStore } from '@/lib/store';

interface SmsToastProps {
  notification?: SmsToastNotification | null;
  onClose?: () => void;
}

export function SmsToast({ notification: propNotification, onClose: propOnClose }: SmsToastProps = {}) {
  const store = useSinnaStore();
  const notification = propNotification !== undefined ? propNotification : store.activeNotification;
  const onClose = propOnClose || (() => sinnaStore.clearNotification());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  // 30-second persistent hold as requested by the user
  useEffect(() => {
    if (!notification) return;
    setSecondsRemaining(30);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <>
      {/* Subtle Ambient Background Blur to lock visual focus without jarring distraction */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2.5px] z-[9998] transition-opacity animate-in fade-in duration-300"
        aria-hidden="true"
      />

      {/* Luxury Clinical AfroMessage SMS Card (Inspired by Operatory Chair Card Aesthetic) */}
      <div className="fixed top-5 right-3 sm:right-6 sm:top-6 z-[9999] max-w-md sm:max-w-lg w-[calc(100%-1.5rem)] animate-in slide-in-from-top-4 zoom-in-95 duration-300">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#E4F7EE] via-[#ECF9F2] to-white border-2 border-emerald-400/90 ring-1 ring-emerald-500/20 shadow-2xl shadow-emerald-950/15 overflow-hidden text-slate-900">
          
          {/* Subtle Geometric Star Accent Watermark (Matching Operatory Chair Card) */}
          <svg
            className="absolute -top-6 -right-6 w-36 h-36 text-emerald-500/15 pointer-events-none select-none"
            viewBox="0 0 100 100"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M50 0 C50 35, 65 50, 100 50 C65 50, 50 65, 50 100 C50 65, 35 50, 0 50 C35 50, 50 35, 50 0 Z" />
          </svg>

          <div className="relative p-5 space-y-3.5 z-10">
            
            {/* 1. Header Bar: Status Badge + Live Timer + Close */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SMS DELIVERED</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-800">
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-emerald-300 text-emerald-900 text-xs font-mono font-bold shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{secondsRemaining}s</span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-800 border border-slate-200 flex items-center justify-center transition-all shadow-2xs"
                  title="Dismiss confirmation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Sender Title */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Official Telecom Confirmation · AfroMessage
              </span>
              <h3 className="font-extrabold text-slate-950 text-base sm:text-lg tracking-tight">
                Bole Dental Studio
              </h3>
            </div>

            {/* 3. Recipient & Phone Sub-Cards (Nested Sub-Card Design from Ref 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  MRN / Patient Name
                </span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block mt-0.5">
                  {notification.recipientName}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Phone / Contact
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm block mt-0.5">
                  {notification.recipientPhone}
                </span>
              </div>
            </div>

            {/* 4. Verified Ethiopian SMS Bubble (Amharic Body) */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-slate-900 text-xs">AfroMessage SMS</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    GATEWAY
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Just now</span>
              </div>

              <p className="text-xs sm:text-sm font-amharic text-slate-800 font-medium leading-relaxed">
                {notification.contentAm}
              </p>
            </div>

            {/* 5. English Translation Preview */}
            {notification.contentEn && (
              <div className="p-2.5 rounded-xl bg-white/70 border border-emerald-200/60 text-[11px] text-slate-600 italic">
                &quot;{notification.contentEn}&quot;
              </div>
            )}

            {/* 6. Live Timer Progress Bar */}
            <div className="h-1.5 bg-emerald-100 rounded-full w-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(secondsRemaining / 30) * 100}%` }}
              />
            </div>

            {/* 7. Action Button (Matching Done -> Send to Cashier White Style) */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl border-2 border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Acknowledge SMS Dispatch ({secondsRemaining}s)</span>
            </button>

          </div>
        </div>
      </div>
    </>
  );
}
