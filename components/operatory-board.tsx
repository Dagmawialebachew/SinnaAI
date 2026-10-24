'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  CheckCircle2, 
  Clock, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { OperatoryChair, Appointment } from '@/lib/types';
import { sinnaStore } from '@/lib/store';

interface OperatoryBoardProps {
  chairs: OperatoryChair[];
  waitingAppointments: Appointment[];
  onSeatPatient?: (appointmentId: string, chairNumber: number) => void;
}

export function OperatoryBoard({ 
  chairs = [], 
  waitingAppointments = [], 
  onSeatPatient 
}: OperatoryBoardProps) {
  const safeChairs = Array.isArray(chairs) ? chairs : [];
  const safeWaiting = Array.isArray(waitingAppointments) ? waitingAppointments : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-950 tracking-tight">Operatory Chair Dispatch</h3>
            <span className="text-[10px] bg-brand-soft text-brand-primary font-bold px-2 py-0.5 rounded-full border border-brand-light">
              3 Active Units
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time physical dental chair occupancy and doctor assignment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {safeChairs.filter((c) => c.status === 'occupied').length} Chairs in Use
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
            {safeChairs.filter((c) => c.status === 'available').length} Available
          </span>
        </div>
      </div>

      {/* 3-Chair Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {safeChairs.map((chair) => {
          const isOccupied = chair.status === 'occupied';
          const isSanitizing = chair.status === 'sanitizing';
          const isAvailable = chair.status === 'available';

          return (
            <div 
              key={chair.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                isOccupied 
                  ? 'bg-blue-50/40 border-blue-200 shadow-xs' 
                  : isSanitizing
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                
                {/* Chair Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isOccupied 
                        ? 'bg-brand-primary text-white shadow-xs' 
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}>
                      #{chair.chairNumber}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {chair.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {chair.roomName}
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  {isOccupied && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      IN CHAIR
                    </span>
                  )}
                  {isAvailable && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      STERILIZED
                    </span>
                  )}
                  {isSanitizing && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      CLEANING
                    </span>
                  )}
                </div>

                {/* Chair Center Patient Info */}
                {isOccupied ? (
                  <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Patient
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Since {chair.occupiedSince || '10:00 AM'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-950">
                      {chair.currentPatientName || 'Tigist Alemu'}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-brand-primary" />
                      <span>{chair.currentDoctorName || 'Dr. Senait Tadesse'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/80 p-3 rounded-xl border border-dashed border-slate-200 space-y-1 text-center py-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Ready for Next Patient</p>
                    <p className="text-[10px] text-slate-400">Autoclaved instruments prepped</p>
                  </div>
                )}

              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-200/60 mt-3">
                {isOccupied ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/doctor"
                      className="flex-1 py-1.5 px-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-xs font-bold text-center transition-colors shadow-2xs"
                    >
                      Open Chart
                    </Link>
                    <button
                      onClick={() => sinnaStore.releaseChair(chair.chairNumber)}
                      className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                      title="Release & Sanitize Chair"
                    >
                      Release
                    </button>
                  </div>
                ) : safeWaiting.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-medium text-slate-500">Seat waiting patient:</div>
                    <div className="flex items-center gap-1">
                      <select
                        aria-label="Select waiting patient"
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        onChange={(e) => {
                          const aptId = e.target.value;
                          if (aptId) {
                            if (onSeatPatient) {
                              onSeatPatient(aptId, chair.chairNumber);
                            } else {
                              sinnaStore.requestSeatInChair(aptId, chair.chairNumber);
                            }
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select patient...</option>
                        {safeWaiting.map((apt) => {
                          const isCancelled = apt.seatingStatus === 'cancelled_by_doctor';
                          return (
                            <option key={apt.id} value={apt.id}>
                              {isCancelled ? `[Cancelled · Waiting] ` : ''}{apt.patientName} ({apt.doctorName.split(' ')[1] || 'Doctor'})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 text-center py-1">
                    No patients waiting in lounge
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
