'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Check, 
  AlertCircle,
  Stethoscope,
  CreditCard,
  Receipt,
  Armchair,
  FileText
} from 'lucide-react';
import { Clinic, ServiceItem, Doctor, Appointment } from '@/lib/types';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';

interface BookingModalProps {
  clinic?: Clinic;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (appointment: Appointment, smsPayload?: { am: string; en: string }) => void;
  initialServiceId?: string | null;
  initialDate?: string | null;
  initialSlot?: string | null;
  initialChairNumber?: number | null;
}

function generateAvailableDates(): { value: string; label: string }[] {
  const dates = [];
  const base = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const val = `${yyyy}-${mm}-${dd}`;
    const dayName = dayNames[d.getDay()];
    const mon = monthNames[d.getMonth()];
    const label = i === 0 ? `Today (${dayName}, ${mon} ${d.getDate()})` :
                  i === 1 ? `Tomorrow (${dayName}, ${mon} ${d.getDate()})` :
                  `${dayName} (${mon} ${d.getDate()})`;
    dates.push({ value: val, label });
  }
  return dates;
}

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

export function BookingModal({ 
  clinic: clinicProp, 
  isOpen, 
  onClose, 
  onBookingSuccess,
  initialServiceId,
  initialDate,
  initialSlot,
  initialChairNumber
}: BookingModalProps) {
  const store = useSinnaStore();
  const clinic = clinicProp || getClinicData(store.activeClinicSlug) || Object.values(store.clinics)[0];

  const availableDates = useMemo(() => generateAvailableDates(), []);

  // Form State: Patient Information
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('new');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('+251 9');
  const [subcity, setSubcity] = useState<string>('Bole Subcity, Woreda 03');
  const [notes, setNotes] = useState<string>('');

  // Form State: Clinical Service (allows blank for pure registration without fee)
  // serviceId = '' means "No service / Registration only (0 ETB)"
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');

  // Form State: Doctor & Chair Assignment
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-senait');
  const [selectedChairNumber, setSelectedChairNumber] = useState<number>(initialChairNumber || 1);

  // Form State: Date & Time
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || availableDates[0]?.value || new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>(initialSlot || '10:00 AM');

  useEffect(() => {
    if (initialDate) setSelectedDate(initialDate);
    if (initialSlot) setSelectedSlot(initialSlot);
    if (initialChairNumber) setSelectedChairNumber(initialChairNumber);
  }, [initialDate, initialSlot, initialChairNumber, isOpen]);

  // Form State: Financials (Desk Editable)
  const [paymentRail, setPaymentRail] = useState<'none' | 'cash' | 'telebirr' | 'cbe_birr' | 'chapa'>('none');
  const [amountCollectedETB, setAmountCollectedETB] = useState<number>(0);
  const [totalFeeETB, setTotalFeeETB] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'deposit_paid' | 'fully_paid'>('none');

  // Existing registered patients for quick intake
  const existingPatients = [
    { name: 'Tigist Alemu', phone: '+251 91 144 5566', subcity: 'Bole Subcity, Woreda 03' },
    { name: 'Abebe Kebede', phone: '+251 91 122 3344', subcity: 'Kirkos Subcity, Woreda 02' },
    { name: 'Dawit Haile', phone: '+251 93 455 6677', subcity: 'Yeka Subcity, Woreda 05' },
    { name: 'Sara Mengistu', phone: '+251 94 888 9900', subcity: 'Bole Subcity, Woreda 01' },
    { name: 'Meron Tesfaye', phone: '+251 92 333 4455', subcity: 'Bole Subcity, Woreda 04' },
    { name: 'Yonas Getachew', phone: '+251 91 555 7788', subcity: 'Bole Subcity, Woreda 02' },
    { name: 'Almaz Wolde', phone: '+251 91 234 5678', subcity: 'Bole Subcity, Woreda 01' },
  ];

  // When initialServiceId changes
  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
      const srv = clinic.services.find((s) => s.id === initialServiceId);
      if (srv) {
        setTotalFeeETB(srv.priceETB);
        if (srv.depositRequired) {
          setAmountCollectedETB(srv.depositAmountETB);
          setPaymentRail('telebirr');
          setPaymentStatus('deposit_paid');
        } else {
          setAmountCollectedETB(0);
          setPaymentRail('none');
          setPaymentStatus('none');
        }
      }
    }
  }, [initialServiceId, clinic.services]);

  // When selected service changes, update suggested fees but keep editable
  const handleServiceChange = (srvId: string) => {
    setSelectedServiceId(srvId);
    if (!srvId) {
      // Pure registration without fee
      setTotalFeeETB(0);
      setAmountCollectedETB(0);
      setPaymentRail('none');
      setPaymentStatus('none');
    } else {
      const srv = clinic.services.find((s) => s.id === srvId);
      if (srv) {
        setTotalFeeETB(srv.priceETB);
        // Default deposit or 0, but desk can freely edit
        if (srv.depositRequired) {
          setAmountCollectedETB(srv.depositAmountETB);
          setPaymentRail('telebirr');
          setPaymentStatus('deposit_paid');
        } else {
          setAmountCollectedETB(0);
          setPaymentRail('none');
          setPaymentStatus('none');
        }
      }
    }
  };

  const handleSelectExistingPatient = (patient: typeof existingPatients[0]) => {
    setPatientName(patient.name);
    setPatientPhone(patient.phone);
    setSubcity(patient.subcity);
    setPatientMode('existing');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      sinnaStore.toastError('Missing Patient Name', 'Please specify a patient name before scheduling.');
      return;
    }

    const doctor = clinic.doctors.find((d) => d.id === selectedDoctorId) || clinic.doctors[0];
    const service = clinic.services.find((s) => s.id === selectedServiceId);

    // Parse start and end time
    const [timeStr, ampm] = selectedSlot.split(' ');
    const [rawHour, rawMin] = timeStr.split(':').map(Number);
    let hour = rawHour;
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    const startsAt = new Date(`${selectedDate}T${hour.toString().padStart(2, '0')}:${rawMin.toString().padStart(2, '0')}:00Z`).toISOString();
    const durationMins = service ? service.durationMinutes : 30;
    const endsAt = new Date(new Date(startsAt).getTime() + durationMins * 60000).toISOString();

    const fiveDigits = Math.floor(10000 + Math.random() * 90000);
    const appointmentId = `BDS-${fiveDigits}`;
    const receiptNum = amountCollectedETB > 0 ? `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    const newAppointment: Appointment = {
      id: appointmentId,
      clinicId: clinic.id,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      serviceId: service ? service.id : 'srv-registration-only',
      serviceName: service ? service.nameEn : 'Intake Registration (Consultation Pending)',
      startsAt,
      endsAt,
      status: 'confirmed',
      paymentStatus: paymentStatus,
      depositPaidETB: amountCollectedETB,
      totalDueETB: totalFeeETB,
      chairNumber: selectedChairNumber,
      receiptNumber: receiptNum,
      notes: notes.trim() || undefined,
    };

    // If money was collected, record in clinic ledger
    const ledgerTx = amountCollectedETB > 0 ? {
      amountETB: amountCollectedETB,
      method: paymentRail === 'cash' ? 'cash' as const :
              paymentRail === 'telebirr' ? 'telebirr_manual' as const :
              paymentRail === 'cbe_birr' ? 'cbe_manual' as const : 'chapa_online' as const,
    } : undefined;

    sinnaStore.createAppointment(newAppointment, ledgerTx);

    sinnaStore.toastSuccess(
      'Appointment Scheduled',
      `${patientName} scheduled for ${selectedSlot} in Chair ${selectedChairNumber} with ${doctor.name}.`
    );

    onBookingSuccess?.(newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-float border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Clinical Desk Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                Schedule New Appointment & Intake
              </h3>
              <p className="text-[11px] text-slate-400">
                Front Desk Intake · Bole Dental Studio (TIN: 0049283711)
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Section 1: Patient Details */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                1. Patient Identity & Contact
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPatientMode('new')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    patientMode === 'new' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  New Intake
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode('existing')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    patientMode === 'existing' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  From Roster
                </button>
              </div>
            </div>

            {patientMode === 'existing' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Existing Patient
                </label>
                <select
                  value={patientName}
                  onChange={(e) => {
                    const match = existingPatients.find((p) => p.name === e.target.value);
                    if (match) handleSelectExistingPatient(match);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Choose patient from directory --</option>
                  {existingPatients.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+251 91 122 3344"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Subcity / Woreda Residence
                </label>
                <input
                  type="text"
                  value={subcity}
                  onChange={(e) => setSubcity(e.target.value)}
                  placeholder="e.g. Bole Subcity, Woreda 03, House #142"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Service (Allows Blank / Registration Only · 0 ETB) */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              2. Clinical Service / Procedure
            </span>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Requested Procedure
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">[ None / Registration Only · 0 ETB ] (Service TBD by Doctor)</option>
                {clinic.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameEn} — {s.priceETB.toLocaleString()} ETB ({s.durationMinutes} min)
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Tip: Leave blank if patient is registering for initial clinical triage without an upfront procedure fee.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Chief Complaint / Intake Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Mild gingival bleeding on brushing, tooth #36 cold sensitivity..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 3: Chair & Doctor Assignment */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <Armchair className="w-3.5 h-3.5 text-blue-600" />
              3. Operatory Chair & Doctor Assignment
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Operatory Chair
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChairNumber(1)}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      selectedChairNumber === 1
                        ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs">Chair 1</p>
                      <p className="text-[9px] text-slate-400">Main Operatory</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChairNumber(2)}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      selectedChairNumber === 2
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="text-xs">Chair 2</p>
                      <p className="text-[9px] text-slate-400">Hygiene & Endo</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Attending Doctor
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {clinic.doctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    const initials = doc.name.includes('Senait') ? 'ST' : 'DB';
                    const color = initials === 'ST' ? 'bg-blue-600' : 'bg-emerald-600';
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-white text-slate-900 ring-1 ring-slate-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full text-white font-bold text-[9px] flex items-center justify-center shrink-0 ${color}`}>
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs truncate">{doc.name.split(' ')[1] || doc.name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{initials === 'ST' ? 'Lead' : 'Associate'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Schedule Timing */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              4. Date & Appointment Slot
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Appointment Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {availableDates.map((d: { value: string; label: string }) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Time Slot
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Financials & Payment Collection (Desk Editable) */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                5. Desk Financials & Payment Rail (MoR Compliant)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                TIN: 0049283711 · ETB
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentRail('none');
                  setAmountCollectedETB(0);
                  setPaymentStatus('none');
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentRail === 'none'
                    ? 'border-slate-800 bg-white text-slate-900 font-bold shadow-2xs ring-1 ring-slate-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs">No Payment</p>
                <p className="text-[9px] text-slate-400">0 ETB · TBD</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentRail('cash');
                  if (amountCollectedETB === 0 && totalFeeETB > 0) setAmountCollectedETB(totalFeeETB);
                  setPaymentStatus('fully_paid');
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentRail === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs">Cash</p>
                <p className="text-[9px] text-emerald-600 font-mono">Physical Birr</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentRail('telebirr');
                  if (amountCollectedETB === 0 && totalFeeETB > 0) setAmountCollectedETB(totalFeeETB);
                  setPaymentStatus('fully_paid');
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentRail === 'telebirr'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs">Telebirr POS</p>
                <p className="text-[9px] text-blue-600 font-mono">Merchant QR</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentRail('cbe_birr');
                  if (amountCollectedETB === 0 && totalFeeETB > 0) setAmountCollectedETB(totalFeeETB);
                  setPaymentStatus('fully_paid');
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  paymentRail === 'cbe_birr'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold shadow-2xs ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs">CBE Birr</p>
                <p className="text-[9px] text-purple-600 font-mono">Terminal POS</p>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Amount Collected (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={amountCollectedETB}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setAmountCollectedETB(val);
                    if (val === 0) setPaymentStatus('none');
                    else if (val >= totalFeeETB && totalFeeETB > 0) setPaymentStatus('fully_paid');
                    else setPaymentStatus('deposit_paid');
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Total Fee Expected (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={totalFeeETB}
                  onChange={(e) => setTotalFeeETB(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="none">Unpaid / 0 ETB (Later)</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Confirm &amp; Schedule Appointment</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
