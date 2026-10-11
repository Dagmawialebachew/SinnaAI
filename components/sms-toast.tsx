'use client';

import React, { useEffect } from 'react';
import { MessageSquare, X, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-spring-pop p-2 sm:p-0">
      <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-float border border-slate-800 ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-900/60 text-brand-accent flex items-center justify-center shrink-0 border border-blue-700/50">
            <MessageSquare className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SMS Delivered
              </span>
              <span className="text-[11px] text-slate-400">AfroMessage</span>
            </div>
            
            <p className="text-xs text-slate-400 font-mono mb-1.5 truncate">
              To: {notification.recipientName} ({notification.recipientPhone})
            </p>
            
            {/* Amharic SMS Body */}
            <p className="text-xs sm:text-sm font-amharic text-white font-medium leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800 mb-1.5">
              {notification.contentAm}
            </p>
            
            {/* English Translation */}
            <p className="text-[11px] text-slate-400 italic">
              &quot;{notification.contentEn}&quot;
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
