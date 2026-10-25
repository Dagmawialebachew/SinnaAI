'use client';

import React, { useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  Armchair,
  Clock,
  User,
  ShieldCheck,
  Stethoscope,
  AlertCircle
} from 'lucide-react';
import { useSinnaStore, sinnaStore } from '@/lib/store';

export default function DoctorSeatRequestModal() {
  const store = useSinnaStore();
  const isDoctor = store.currentUser?.role === 'doctor' || store.activePersona === 'doctor';
  const request = store.pendingSeatingRequest;
  const clinic = store.clinics[store.activeClinicSlug] || Object.values(store.clinics)[0];

  // Soft clinical chime sound on arrival
  useEffect(() => {
    if (isDoctor && request && request.status === 'pending') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          // Two-tone chime: 520Hz rising to 660Hz
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5

          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        }
      } catch (err) {
        // AudioContext silent fallback
      }
    }
  }, [isDoctor, request?.id]);

  if (!isDoctor || !request || request.status !== 'pending') {
    return null;
  }

  const handleAccept = () => {
    sinnaStore.acceptSeatingRequest();
  };

  const handleDecline = () => {
    sinnaStore.declineSeatingRequest();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Top Accent Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Patient Seating Request</h3>
              <p className="text-[10px] text-blue-100 font-mono">{clinic.name} Operatory Dispatch</p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
            Chair {request.chairNumber} · {request.doctorName || 'Doctor'}
          </span>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Arrival</p>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {request.patientName}
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                <Armchair className="w-3.5 h-3.5" />
                <span>Chair {request.chairNumber}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 text-slate-600">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Service</span>
                <span className="font-medium text-slate-800">{request.serviceName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Requested By</span>
                <span className="font-medium text-slate-800">{request.requestedBy}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-950 text-xs flex items-start gap-2.5">
            <Stethoscope className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Reception is ready to send <span className="font-bold">{request.patientName}</span> into{' '}
              <span className="font-bold">Chair {request.chairNumber}</span> for{' '}
              <span className="font-bold">{request.doctorName || 'Dr. Senait Tadesse'}</span>. Are you ready to receive the patient?
            </p>
          </div>
        </div>

        {/* Binary Decision Buttons (Accept vs Cancel) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDecline}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>Cancel / Busy</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Accept & Seat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
