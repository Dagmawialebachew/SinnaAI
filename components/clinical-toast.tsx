'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ClinicalToast, ClinicalToastType } from '@/lib/types';
import { useSinnaStore, sinnaStore } from '@/lib/store';

interface ToastItemProps {
  toast: ClinicalToast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const duration = toast.durationMs || 4500;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 30; // 30ms progress tick
    const decrement = (intervalTime / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, intervalTime);

    const dismissTimer = setTimeout(() => {
      onDismissRef.current(toast.id);
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast.id, duration, isPaused]);

  const barColor =
    toast.type === 'error'
      ? 'bg-red-500'
      : toast.type === 'info'
      ? 'bg-blue-600'
      : toast.type === 'warning'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-84 sm:w-92 bg-white rounded-2xl shadow-[0_12px_32px_-6px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(0,0,0,0.04)] border border-slate-200/90 overflow-hidden pointer-events-auto transition-all duration-200 hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-bottom-2"
      role="alert"
    >
      {/* Content Area */}
      <div className="p-4 pb-3.5 pr-9">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
            {toast.title}
          </h4>
        </div>

        <p className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
          {toast.message}
        </p>
      </div>

      {/* Top Right Close Button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        title="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Bottom Accent / Timer Progress Rail */}
      <div className="h-1 w-full bg-slate-100 absolute bottom-0 left-0 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-[width] ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ClinicalToastContainer() {
  const store = useSinnaStore();
  const toasts = Array.isArray(store.toasts) ? store.toasts : [];

  const handleDismiss = React.useCallback((id: string) => {
    setTimeout(() => {
      sinnaStore.dismissToast(id);
    }, 0);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full items-end">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}
