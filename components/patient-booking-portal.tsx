'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Send, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Smartphone,
  Printer,
  Globe,
  Instagram,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  BookingLang, 
  BOOKING_DICTIONARY, 
  LOCALIZED_SERVICES, 
  LocalizedService 
} from '@/lib/i18n-booking';
import { useSinnaStore, sinnaStore } from '@/lib/store';
import { Doctor, Appointment } from '@/lib/types';
import { SmsToast } from '@/components/sms-toast';

interface PatientBookingPortalProps {
  clinicSlug?: string;
  initialLang?: BookingLang;
  onBackToApp?: () => void;
}

// Generate next 4 days dynamically from today
function getUpcoming4Days() {
  const days = [];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesAm = ['እሁድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];
  const dayNamesOm = ['Dilbata', 'Wiixata', 'Kibxata', 'Roobii', 'Kamisa', 'Jimaata', 'Sanbata'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const now = new Date();
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dayOfWeek = d.getDay();
    const dayOfMonth = d.getDate();
    const month = monthNames[d.getMonth()];
    const isoDate = d.toISOString().split('T')[0];

    let labelEn = `${dayNamesEn[dayOfWeek]}, ${month} ${dayOfMonth}`;
    let labelAm = `${dayNamesAm[dayOfWeek]} (${month} ${dayOfMonth})`;
    let labelOm = `${dayNamesOm[dayOfWeek]} (${month} ${dayOfMonth})`;

    if (i === 0) {
      labelEn = `Today (${month} ${dayOfMonth})`;
      labelAm = `ዛሬ (${month} ${dayOfMonth})`;
      labelOm = `Har'a (${month} ${dayOfMonth})`;
    } else if (i === 1) {
      labelEn = `Tomorrow (${month} ${dayOfMonth})`;
      labelAm = `ነገ (${month} ${dayOfMonth})`;
      labelOm = `Boru (${month} ${dayOfMonth})`;
    }

    days.push({
      isoDate,
      labelEn,
      labelAm,
      labelOm,
      displayDate: `${month} ${dayOfMonth}`,
      fullFormatted: `${dayNamesEn[dayOfWeek]}, ${month} ${dayOfMonth}`,
    });
  }
  return days;
}

const MORNING_SLOTS = ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM'];
const AFTERNOON_SLOTS = ['02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM'];

export function PatientBookingPortal({
  clinicSlug = 'bole-dental',
  initialLang = 'en',
  onBackToApp
}: PatientBookingPortalProps) {
  const store = useSinnaStore();
  const clinic = store.clinics[clinicSlug] || Object.values(store.clinics)[0];

  const [lang, setLang] = useState<BookingLang>(initialLang);
  const t = BOOKING_DICTIONARY[lang];

  // 4 upcoming days list
  const upcomingDays = useMemo(() => getUpcoming4Days(), []);

  // Form State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<LocalizedService>(LOCALIZED_SERVICES[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(clinic.doctors[0]);
  
  // Date State: either one of the 4 quick days or custom chosen date
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(upcomingDays[1].isoDate);
  const [selectedDateDisplay, setSelectedDateDisplay] = useState<string>(upcomingDays[1].labelEn);
  const [customDateValue, setCustomDateValue] = useState<string>('');

  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('+251 91 ');
  const [paymentRail, setPaymentRail] = useState<'telebirr' | 'cbe_birr'>('telebirr');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [holdTimer, setHoldTimer] = useState<number>(599); // 09:59 hold countdown

  // 10-minute chair reservation hold timer
  useEffect(() => {
    if (step !== 3 || holdTimer <= 0) return;
    const interval = setInterval(() => {
      setHoldTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, holdTimer]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Chair capacity and conflict-checking logic
  const checkSlotAvailability = (slot: string) => {
    const totalChairs = store.chairs.length || 2;
    
    // Check appointments for the selected date
    const conflictingApts = store.appointments.filter((apt) => {
      if (apt.status === 'cancelled') return false;
      const aptDate = apt.startsAt ? apt.startsAt.split('T')[0] : '';
      if (aptDate !== selectedIsoDate) return false;

      const aptTime = new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return aptTime === slot || (apt.notes && apt.notes.includes(slot));
    });

    const isDoctorBusy = conflictingApts.some((a) => a.doctorId === selectedDoctor.id);
    if (isDoctorBusy) {
      return { available: false, reason: 'doctor_busy', label: t.slotDoctorBusy };
    }

    if (conflictingApts.length >= totalChairs) {
      return { available: false, reason: 'chairs_full', label: t.slotChairsFull };
    }

    return { available: true };
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setCustomDateValue(val);
    setSelectedIsoDate(val);
    const parsed = new Date(val);
    const formatted = parsed.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    setSelectedDateDisplay(formatted);
  };

  const handleSelectQuickDay = (dayObj: typeof upcomingDays[0]) => {
    setCustomDateValue('');
    setSelectedIsoDate(dayObj.isoDate);
    const label = lang === 'am' ? dayObj.labelAm : lang === 'om' ? dayObj.labelOm : dayObj.labelEn;
    setSelectedDateDisplay(label);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || patientPhone.trim().length < 9) return;

    setIsProcessing(true);

    setTimeout(() => {
      // Calculate appointment start/end on selected date & slot
      const [time, period] = selectedSlot.split(' ');
      const [hStr, mStr] = time.split(':');
      let hours = parseInt(hStr, 10);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const startDate = new Date(selectedIsoDate);
      startDate.setHours(hours, parseInt(mStr, 10), 0, 0);

      const startsAt = startDate.toISOString();
      const endsAt = new Date(startDate.getTime() + selectedService.durationMinutes * 60000).toISOString();

      const createdApt = sinnaStore.createAppointment({
        clinicId: clinic.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name[lang] || selectedService.name.en,
        startsAt,
        endsAt,
        totalDueETB: selectedService.priceETB,
        depositPaidETB: selectedService.depositRequired ? selectedService.depositAmountETB : 0,
        depositMethod: paymentRail === 'telebirr' ? 'telebirr' : 'chapa_online',
      });

      // Dispatch real AfroMessage SMS notification
      const smsAm = `ሰላም ${patientName}፣ በ ${clinic.name} የቀጠሮዎ ቀን ${selectedDateDisplay} በ ${selectedSlot} ሰዓት ተይዟል። ${selectedService.depositRequired ? `${selectedService.depositAmountETB} ብር ቅድመ ክፍያ በቴሌብር ተቀብለናል።` : ''} አድራሻ: ${clinic.location}። ስልክ: ${clinic.phone}`;
      const smsEn = `Hello ${patientName}, your appointment at ${clinic.name} with ${selectedDoctor.name} is confirmed for ${selectedDateDisplay} at ${selectedSlot}. ${selectedService.depositRequired ? `${selectedService.depositAmountETB} ETB deposit received.` : ''} Location: ${clinic.location}. Phone: ${clinic.phone}`;

      sinnaStore.sendSms({
        id: `sms-${Date.now()}`,
        recipientName: patientName.trim(),
        recipientPhone: patientPhone.trim(),
        templateType: 'confirmation',
        contentAm: smsAm,
        contentEn: smsEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      setConfirmedAppointment(createdApt);
      setIsProcessing(false);
      setStep(4);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Toast Carrier */}
      <SmsToast />

      {/* Mobile-Centric Container (Instagram / Maps / TikTok Link-in-Bio Standard) */}
      <div className="max-w-lg mx-auto px-4 py-4 sm:py-6 space-y-4">
        
        {/* Top Header Card: Identity & Language Selector */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                BDS
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-bold text-slate-950 text-base leading-tight tracking-tight truncate">
                    {clinic.name}
                  </h1>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  Bole Medhanialem, Morning Star Mall
                </p>
              </div>
            </div>

            {/* Language Switcher Pill: EN | አማ | OM */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('am')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  lang === 'am'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="አማርኛ (Amharic)"
              >
                አማ
              </button>
              <button
                type="button"
                onClick={() => setLang('om')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  lang === 'om'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Afaan Oromoo"
              >
                OM
              </button>
            </div>
          </div>

          {/* Clinical Verification & Trust Badges */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/70">
              <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1" />
              {t.badgeVerified}
            </span>

            <div className="flex items-center text-amber-600 text-xs font-semibold gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-mono">{clinic.rating}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">{clinic.reviewCount} {t.reviewsLabel}</span>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              {t.openToday}
            </span>
          </div>

          {/* Clinic Bio & Social Rails */}
          <div className="mt-3.5 space-y-2.5">
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.clinicAbout}
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href={`tel:${clinic.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Phone className="w-3 h-3 text-blue-600" />
                <span>Call Clinic</span>
              </a>

              <a
                href={`https://t.me/${clinic.telegramChannel}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/20 text-[#229ED9] text-xs font-semibold transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Telegram</span>
              </a>

              <a
                href={clinic.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4-Step Interactive Booking Engine */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          
          {/* Step Progress Bar */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => step > 1 && setStep(1)}
                className={`flex items-center gap-1 ${
                  step === 1 ? 'text-blue-600 font-bold' : step > 1 ? 'text-slate-900 cursor-pointer' : 'text-slate-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  step === 1 ? 'bg-blue-600 text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </span>
                <span>{t.step1Treatment}</span>
              </button>

              <span className="text-slate-300">/</span>

              <button
                type="button"
                onClick={() => step > 2 && setStep(2)}
                className={`flex items-center gap-1 ${
                  step === 2 ? 'text-blue-600 font-bold' : step > 2 ? 'text-slate-900 cursor-pointer' : 'text-slate-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  step === 2 ? 'bg-blue-600 text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </span>
                <span>{t.step2Time}</span>
              </button>

              <span className="text-slate-300">/</span>

              <button
                type="button"
                onClick={() => step > 3 && setStep(3)}
                className={`flex items-center gap-1 ${
                  step === 3 ? 'text-blue-600 font-bold' : step > 3 ? 'text-slate-900 cursor-pointer' : 'text-slate-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  step === 3 ? 'bg-blue-600 text-white' : step > 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > 3 ? '✓' : '3'}
                </span>
                <span>{t.step3Details}</span>
              </button>
            </div>

            {step === 3 && (
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                <Clock className="w-3 h-3" />
                <span>{formatTimer(holdTimer)}</span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {/* STEP 1: SELECT CLINICAL PROCEDURE */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {t.servicesTitle}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t.officialRates}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {LOCALIZED_SERVICES.map((srv) => {
                    const isSelected = selectedService.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-xs">
                              {srv.name[lang] || srv.name.en}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {srv.description[lang] || srv.description.en}
                            </p>
                          </div>
                          {srv.depositRequired && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-100 text-blue-800 shrink-0">
                              {srv.depositAmountETB} ETB Deposit
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100/90 text-xs">
                          <span className="font-mono font-bold text-slate-900">
                            {srv.priceETB.toLocaleString()} ETB
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {srv.durationMinutes} {t.durationMin}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
                  >
                    <span>{t.continueBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT DOCTOR, DATE & TIME (WITH CHAIR CAPACITY CHECK) */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {t.step2Time}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedService.name[lang] || selectedService.name.en} · {selectedService.priceETB.toLocaleString()} ETB
                  </p>
                </div>

                {/* Attending Specialist Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t.selectDoctor}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {clinic.doctors.map((doc) => {
                      const isDocSelected = selectedDoctor.id === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                            isDocSelected
                              ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-700 text-xs flex items-center justify-center shrink-0">
                            {doc.name.split(' ')[1]?.slice(0, 2) || 'DR'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {doc.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              {doc.specialty}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Days in Advance Selector + Custom Date Picker */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t.selectDate}
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Active: {selectedDateDisplay}
                    </span>
                  </div>

                  {/* 4 Days in Advance Quick Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {upcomingDays.map((dayObj) => {
                      const isQuickSelected = selectedIsoDate === dayObj.isoDate && !customDateValue;
                      const quickLabel = lang === 'am' ? dayObj.labelAm : lang === 'om' ? dayObj.labelOm : dayObj.labelEn;
                      return (
                        <button
                          key={dayObj.isoDate}
                          type="button"
                          onClick={() => handleSelectQuickDay(dayObj)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isQuickSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-xs font-bold truncate">
                            {quickLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Upfront Custom Date Picker */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {t.selectAnyDate}:
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={upcomingDays[0].isoDate}
                        value={customDateValue}
                        onChange={handleCustomDateChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Operatory Chair Slots with Real Availability Check */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t.availableSlots}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Chair 1 &amp; Chair 2 check
                    </span>
                  </div>

                  {/* Morning Slots */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Morning
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MORNING_SLOTS.map((slot) => {
                        const status = checkSlotAvailability(slot);
                        const isSlotSelected = selectedSlot === slot && status.available;

                        if (!status.available) {
                          return (
                            <div
                              key={slot}
                              className="py-2 px-2.5 rounded-xl border border-slate-200/80 bg-slate-100/70 text-slate-400 text-center cursor-not-allowed text-[11px] font-mono"
                              title={`${slot} - ${status.label}`}
                            >
                              <span className="line-through block text-slate-400">{slot}</span>
                              <span className="text-[9px] font-sans block text-slate-400 font-semibold">{status.label}</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                              isSlotSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Afternoon
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AFTERNOON_SLOTS.map((slot) => {
                        const status = checkSlotAvailability(slot);
                        const isSlotSelected = selectedSlot === slot && status.available;

                        if (!status.available) {
                          return (
                            <div
                              key={slot}
                              className="py-2 px-2.5 rounded-xl border border-slate-200/80 bg-slate-100/70 text-slate-400 text-center cursor-not-allowed text-[11px] font-mono"
                              title={`${slot} - ${status.label}`}
                            >
                              <span className="line-through block text-slate-400">{slot}</span>
                              <span className="text-[9px] font-sans block text-slate-400 font-semibold">{status.label}</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                              isSlotSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {t.backBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
                  >
                    <span>{t.continueBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PATIENT CONTACT & DEPOSIT */}
            {step === 3 && (
              <form onSubmit={handleConfirmReservation} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {t.step3Details}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t.holdTimeNotice}
                  </p>
                </div>

                {/* Chair Reservation Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Procedure:</span>
                    <span className="font-bold text-slate-900">{selectedService.name[lang] || selectedService.name.en}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Doctor:</span>
                    <span className="font-bold text-slate-900">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Slot:</span>
                    <span className="font-bold text-slate-900">{selectedDateDisplay} · {selectedSlot}</span>
                  </div>
                  {selectedService.depositRequired && (
                    <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                      <span>Deposit:</span>
                      <span className="font-bold text-blue-600">{selectedService.depositAmountETB} ETB (Telebirr)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.fullNameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.fullNamePlaceholder}
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t.phonePlaceholder}
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {t.phoneHelp}
                    </p>
                  </div>

                  {selectedService.depositRequired && (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {t.paymentRail}
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setPaymentRail('telebirr')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                            paymentRail === 'telebirr'
                              ? 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{t.telebirrPay}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentRail('cbe_birr')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                            paymentRail === 'cbe_birr'
                              ? 'bg-purple-50 border-purple-600 text-purple-900 ring-1 ring-purple-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>{t.cbePay}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {t.telebirrDepositNote}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {t.backBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !patientName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
                  >
                    {isProcessing ? (
                      <span>{t.verifyingPayment}</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.confirmBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: CONFIRMED RESERVATION */}
            {step === 4 && confirmedAppointment && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    {t.instantBookingSuccess}
                  </h2>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {t.smsGuarantee}
                  </p>
                </div>

                {/* Printable Digital Receipt Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500">{t.reservationId}:</span>
                    <span className="font-bold text-slate-900">{confirmedAppointment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-bold text-slate-900">{confirmedAppointment.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-bold text-slate-900">{confirmedAppointment.patientPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-bold text-slate-900">{confirmedAppointment.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Procedure:</span>
                    <span className="font-bold text-slate-900">{confirmedAppointment.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Slot:</span>
                    <span className="font-bold text-slate-900">{selectedDateDisplay} · {selectedSlot}</span>
                  </div>
                  {confirmedAppointment.depositPaidETB > 0 && (
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 text-emerald-700">
                      <span>Deposit Paid:</span>
                      <span className="font-bold">{confirmedAppointment.depositPaidETB} ETB</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs"
                  >
                    <span>{t.returnHome}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Minimal Clinical Footer */}
        <div className="text-center text-[10px] text-slate-400 font-mono py-2 space-y-0.5">
          <p>Ministry of Revenues (MoR) Registered Clinic · TIN: 0049283711</p>
          <p>Bole Medhanialem, Morning Star Mall 3rd Floor · Addis Ababa, Ethiopia</p>
        </div>

      </div>
    </div>
  );
}
