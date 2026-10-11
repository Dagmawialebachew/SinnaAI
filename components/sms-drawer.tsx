'use client';

import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  CheckCircle2,
  Send,
  Clock,
  Sparkles,
  Phone,
  Shield,
  Smartphone
} from 'lucide-react';
import { useSinnaStore, sinnaStore } from '@/lib/store';
import { SmsToastNotification } from '@/lib/types';

interface SmsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmsDrawer({ isOpen, onClose }: SmsDrawerProps) {
  const store = useSinnaStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'confirmation' | 'receipt' | 'reminder'>('all');

  if (!isOpen) return null;

  const history = store.notificationHistory || [];
  const filtered = selectedFilter === 'all' 
    ? history 
    : history.filter((s) => s.templateType === selectedFilter);

  const handleSendQuickTestSms = () => {
    const testNotification: SmsToastNotification = {
      id: `sms-test-${Date.now()}`,
      recipientName: 'Sara Tesfaye',
      recipientPhone: '+251 92 345 6789',
      templateType: 'reminder',
      contentAm: 'ሰላም ሳራ፣ በ Bole Dental Studio ከ ዶ/ር ዳዊት በቀለ ጋር የነበረዎት የቀጠሮ ቀን በ 2:00 ሰዓት መሆኑን እናስታውሳለን። እባክዎ በሰዓቱ ይገኙ። ቦሌ መድኃኒዓለም።',
      contentEn: 'Hello Sara, reminder for your appointment with Dr. Dawit Bekele at Bole Dental Studio at 2:00 PM today. Please arrive 10 mins early.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    sinnaStore.sendSms(testNotification);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  AfroMessage SMS Log
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Gateway Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live Ethio Telecom & Safaricom SMS Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {(['all', 'confirmation', 'receipt', 'reminder'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                  selectedFilter === tab
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'all' ? `All (${history.length})` : tab}
              </button>
            ))}
          </div>

          <button
            onClick={handleSendQuickTestSms}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors shrink-0 shadow-2xs"
            title="Dispatch simulated reminder SMS"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Test SMS</span>
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No SMS transmissions logged yet</p>
            </div>
          ) : (
            filtered.map((msg) => (
              <div
                key={msg.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2.5 hover:border-slate-300 transition-all"
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {msg.recipientName}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {msg.recipientPhone}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Amharic Text Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-800 leading-relaxed font-sans">
                  {msg.contentAm}
                </div>

                {/* English Translation */}
                <p className="text-[11px] text-slate-500 italic">
                  &ldquo;{msg.contentEn}&rdquo;
                </p>

                {/* Footer Status */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Delivered via AfroMessage</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
                    {msg.templateType}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-white text-center text-[11px] text-slate-500">
          AfroMessage SMS Provider · Addis Ababa, Ethiopia
        </div>
      </div>
    </div>
  );
}
