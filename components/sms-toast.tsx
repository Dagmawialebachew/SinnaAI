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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-full animate-spring-pop">
      <div className="bg-slate-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-800/90 ring-1 ring-white/10 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1A4F9E]/30 text-[#00BFFF] flex items-center justify-center shrink-0 border border-[#1A4F9E]/50">
              <MessageSquare className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-semibold text-emerald-400 tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SMS Delivered
                </span>
                <span className="text-[10px] text-slate-400 font-mono">AfroMessage</span>
              </div>
              
              <p className="text-[11px] text-slate-400 font-mono mb-1.5 truncate">
                To: {notification.recipientName} ({notification.recipientPhone})
              </p>
              
              {/* Amharic SMS Body */}
              <p className="text-xs font-amharic text-slate-100 font-medium leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 mb-1">
                {notification.contentAm}
              </p>
              
              {/* English Translation */}
              <p className="text-[11px] text-slate-400 italic line-clamp-2">
                &quot;{notification.contentEn}&quot;
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time right-to-left progress bar */}
        <div className="h-1 bg-slate-900 w-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#1A4F9E] via-[#00BFFF] to-[#4FFFB0] animate-toast-progress" />
        </div>
      </div>
    </div>
  );
}
