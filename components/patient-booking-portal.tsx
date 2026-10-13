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

    let displayDay = `${dayNamesEn[dayOfWeek]}`;
    if (i === 0) {
      labelEn = `Today (${month} ${dayOfMonth})`;
      labelAm = `ዛሬ (${month} ${dayOfMonth})`;
      labelOm = `Har'a (${month} ${dayOfMonth})`;
      displayDay = 'Today';
    } else if (i === 1) {
      labelEn = `Tomorrow (${month} ${dayOfMonth})`;
      labelAm = `ነገ (${month} ${dayOfMonth})`;
      labelOm = `Boru (${month} ${dayOfMonth})`;
      displayDay = 'Tomorrow';
    }

    days.push({
      isoDate,
      labelEn,
      labelAm,
      labelOm,
      displayDay,
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

  // Language & Modal State
  const [lang, setLang] = useState<BookingLang>(initialLang);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(true);
  const t = BOOKING_DICTIONARY[lang];

  // Helper to remove any redundant numeric prefix like "1. " from i18n label
  const cleanStepTitle = (label: string) => label.replace(/^\d+\.\s*/, '');

  // 4 upcoming days list
  const upcomingDays = useMemo(() => getUpcoming4Days(), []);

  // Form State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<LocalizedService>(LOCALIZED_SERVICES[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(clinic.doctors[0]);
  
  // Date State
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
    }, 850);
  };

  const handleSelectLanguage = (selectedLang: BookingLang) => {
    setLang(selectedLang);
    setShowLanguageModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Toast Carrier */}
      <SmsToast />

      {/* ========================================================================= */}
      {/* MINIMALIST LANGUAGE SELECTION MODAL WITH CIRCULATING SINNA BORDER BEAM    */}
      {/* ========================================================================= */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          
          {/* Card Outer Container with Circulating Sinna Palette Border Beam */}
          <div className="relative w-full max-w-sm p-[2px] rounded-3xl overflow-hidden shadow-2xl transition-transform animate-in fade-in zoom-in-95 duration-200">
            
            {/* Luminous Circulating Border Beam Glow (Backdrop ambient trail) */}
            <div className="sinna-border-beam-glow pointer-events-none" />
            
            {/* Crisp Circulating Sinna Border Beam (Traces entire rectangular rounded border) */}
            <div className="sinna-border-beam pointer-events-none" />

            {/* Static Subtle Inner Border Layer */}
            <div className="absolute inset-0 rounded-3xl border border-slate-200/60 pointer-events-none" />

            {/* Minimalist Card Body */}
            <div className="relative bg-white rounded-[calc(1.5rem-2px)] p-6 sm:p-7 z-10 space-y-5">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    <Globe className="w-3.5 h-3.5 text-[#1A4F9E]" />
                    <span>Sinna · Language</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-950 tracking-tight pt-1">
                    Choose Your Language
                  </h2>
                  <p className="text-[11px] text-slate-500 font-amharic">
                    ቋንቋ ይምረጡ · Afaan Filadhaa
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLanguageModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Language Choices (Minimalist, uncluttered rows) */}
              <div className="space-y-2.5 pt-1">
                {/* 1. English */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('en')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                    lang === 'en'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      lang === 'en'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-slate-100 text-slate-800 border border-slate-200/80'
                    }`}>
                      EN
                    </div>
                    <div>
                      <div className="font-bold text-xs tracking-tight">
                        English
                      </div>
                      <div className={`text-[10px] ${lang === 'en' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Standard International
                      </div>
                    </div>
                  </div>
                  {lang === 'en' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  )}
                </button>

                {/* 2. Amharic (አማርኛ) */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('am')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                    lang === 'am'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-[#1A4F9E]/40 hover:bg-[#F0F7FF]/50 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl font-amharic text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      lang === 'am'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-[#F0F7FF] text-[#1A4F9E] border border-blue-200/80'
                    }`}>
                      አማ
                    </div>
                    <div>
                      <div className="font-bold text-xs font-amharic tracking-tight">
                        አማርኛ
                      </div>
                      <div className={`text-[10px] ${lang === 'am' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Amharic (Ethiopia)
                      </div>
                    </div>
                  </div>
                  {lang === 'am' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  )}
                </button>

                {/* 3. Afaan Oromoo */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('om')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                    lang === 'om'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-[#008F7E]/40 hover:bg-[#E8F5F1]/50 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                      lang === 'om'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-[#E8F5F1] text-[#005A3E] border border-emerald-200/80'
                    }`}>
                      OM
                    </div>
                    <div>
                      <div className="font-bold text-xs tracking-tight">
                        Afaan Oromoo
                      </div>
                      <div className={`text-[10px] ${lang === 'om' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Oromiffa (Ethiopia)
                      </div>
                    </div>
                  </div>
                  {lang === 'om' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  )}
                </button>
              </div>

              {/* Minimalist Footnote */}
              <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Bole Dental Studio · Operatory Portal</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Main Mobile-Centric Container */}
      <div className="max-w-lg mx-auto px-4 py-4 sm:py-6 space-y-4">
        
        {/* Top Header Card: Identity & Re-open Language Modal */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                BDS
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-slate-950 text-base leading-tight tracking-tight truncate">
                  {clinic.name}
                </h1>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  Bole Medhanialem, Morning Star Mall 3rd Floor
                </p>
              </div>
            </div>

            {/* Language Switcher Badge with Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-xs font-semibold text-slate-800 transition-all shadow-2xs shrink-0"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#1A4F9E]" />
              <span className="font-bold uppercase tracking-wider text-[11px]">
                {lang}
              </span>
            </button>
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

          {/* Clinic Bio & Clinical Action Rails */}
          <div className="mt-3.5 space-y-2.5">
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.clinicAbout}
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href={`tel:${clinic.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Phone className="w-3 h-3 text-[#1A4F9E]" />
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

        {/* ========================================================================= */}
        {/* 4-STEP INTERACTIVE BOOKING ENGINE (MINIMALIST & WORLD-CLASS)               */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
          
          {/* DECENT & MINIMALIST STEP PROGRESS HEADER */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 flex items-center justify-between">
            
            {/* 3 Step Linear Nodes */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              
              {/* Step 1 Node */}
              <button
                type="button"
                onClick={() => step > 1 && setStep(1)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 1 
                    ? 'text-slate-900 font-bold' 
                    : step > 1 
                    ? 'text-slate-600 hover:text-slate-900 cursor-pointer font-medium' 
                    : 'text-slate-400 font-normal'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono font-bold transition-all ${
                  step === 1 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : step > 1 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > 1 ? <Check className="w-3 h-3 stroke-[2.5]" /> : '1'}
                </span>
                <span className="hidden xs:inline sm:inline">{cleanStepTitle(t.step1Treatment)}</span>
              </button>

              <span className="text-slate-300">/</span>

              {/* Step 2 Node */}
              <button
                type="button"
                onClick={() => step > 2 && setStep(2)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 2 
                    ? 'text-slate-900 font-bold' 
                    : step > 2 
                    ? 'text-slate-600 hover:text-slate-900 cursor-pointer font-medium' 
                    : 'text-slate-400 font-normal'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono font-bold transition-all ${
                  step === 2 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : step > 2 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > 2 ? <Check className="w-3 h-3 stroke-[2.5]" /> : '2'}
                </span>
                <span className="hidden xs:inline sm:inline">{cleanStepTitle(t.step2Time)}</span>
              </button>

              <span className="text-slate-300">/</span>

              {/* Step 3 Node */}
              <button
                type="button"
                onClick={() => step > 3 && setStep(3)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 3 
                    ? 'text-slate-900 font-bold' 
                    : step > 3 
                    ? 'text-slate-600 hover:text-slate-900 cursor-pointer font-medium' 
                    : 'text-slate-400 font-normal'
                }`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono font-bold transition-all ${
                  step === 3 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : step > 3 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step > 3 ? <Check className="w-3 h-3 stroke-[2.5]" /> : '3'}
                </span>
                <span className="hidden xs:inline sm:inline">{cleanStepTitle(t.step3Details)}</span>
              </button>
            </div>

            {/* Step 3 Chair Hold Countdown Pill (Minimalist clinical badge) */}
            {step === 3 && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>{formatTimer(holdTimer)}</span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {/* =================================================================== */}
            {/* STEP 1: SELECT CLINICAL PROCEDURE                                   */}
            {/* =================================================================== */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-950 tracking-tight">
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
                            ? 'bg-[#F0F7FF]/60 border-[#1A4F9E] ring-1 ring-[#1A4F9E]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                              {srv.name[lang] || srv.name.en}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {srv.description[lang] || srv.description.en}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-xs text-slate-950 font-mono">
                              {srv.priceETB.toLocaleString()} ETB
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {srv.durationMinutes} {t.durationMin}
                            </span>
                          </div>
                        </div>

                        {srv.depositRequired && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="text-[#005A3E] font-medium inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {srv.depositAmountETB} ETB Deposit via Telebirr
                            </span>
                            <span className="text-slate-400">
                              Credited toward total bill
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.99]"
                  >
                    <span>{t.continueBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* STEP 2: SELECT DATE, TIME & DOCTOR                                  */}
            {/* =================================================================== */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-950 tracking-tight">
                    {cleanStepTitle(t.step2Time)}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t.dentistsTitle}
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
                              ? 'bg-[#F0F7FF]/60 border-[#1A4F9E] ring-1 ring-[#1A4F9E]/20 shadow-xs'
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {upcomingDays.map((dayObj) => {
                      const isQuickSelected = selectedIsoDate === dayObj.isoDate && !customDateValue;
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
                          <span className="block text-[11px] font-bold">
                            {dayObj.displayDay}
                          </span>
                          <span className={`block text-[10px] ${isQuickSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {dayObj.displayDate}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Date Picker */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {t.selectAnyDate}:
                    </label>
                    <input
                      type="date"
                      min={upcomingDays[0].isoDate}
                      value={customDateValue}
                      onChange={handleCustomDateChange}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Operatory Chair Slots with Real Availability Check */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t.availableSlots}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Chair 1 &amp; Chair 2 Check
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
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
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
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
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
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.99]"
                  >
                    <span>{t.continueBtn}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* STEP 3: PATIENT CONTACT & LUXURY PAYMENT RAILS                      */}
            {/* =================================================================== */}
            {step === 3 && (
              <form onSubmit={handleConfirmReservation} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-950 tracking-tight">
                    {cleanStepTitle(t.step3Details)}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t.holdTimeNotice}
                  </p>
                </div>

                {/* Chair Reservation Summary (Clinical Ledger Card) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-1.5 font-sans">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[11px]">Procedure:</span>
                    <span className="font-bold text-slate-900 text-right">{selectedService.name[lang] || selectedService.name.en}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[11px]">Attending:</span>
                    <span className="font-bold text-slate-900">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[11px]">Reserved Slot:</span>
                    <span className="font-bold text-slate-900">{selectedDateDisplay} · {selectedSlot}</span>
                  </div>
                  {selectedService.depositRequired && (
                    <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-700">Required Deposit:</span>
                      <span className="font-bold text-[#005A3E] font-mono">{selectedService.depositAmountETB} ETB</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Patient Full Name */}
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Patient Phone Number */}
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {t.phoneHelp}
                    </p>
                  </div>

                  {/* DECENT & MINIMALIST PAYMENT RAILS (Telebirr & CBE Birr) */}
                  {selectedService.depositRequired && (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {t.paymentRail}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        
                        {/* Telebirr Rail Card */}
                        <button
                          type="button"
                          onClick={() => setPaymentRail('telebirr')}
                          className={`p-3 rounded-2xl border text-xs transition-all text-left flex items-start gap-3 ${
                            paymentRail === 'telebirr'
                              ? 'bg-[#E8F5F1]/40 border-[#008F7E] ring-1 ring-[#008F7E]/30 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            paymentRail === 'telebirr'
                              ? 'bg-[#008F7E] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 leading-tight">
                              Telebirr
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              SuperApp / USSD *127#
                            </div>
                          </div>
                        </button>

                        {/* CBE Birr Rail Card */}
                        <button
                          type="button"
                          onClick={() => setPaymentRail('cbe_birr')}
                          className={`p-3 rounded-2xl border text-xs transition-all text-left flex items-start gap-3 ${
                            paymentRail === 'cbe_birr'
                              ? 'bg-[#F0F7FF]/50 border-[#1A4F9E] ring-1 ring-[#1A4F9E]/30 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            paymentRail === 'cbe_birr'
                              ? 'bg-[#1A4F9E] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 leading-tight">
                              CBE Birr
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Commercial Bank of Ethiopia
                            </div>
                          </div>
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
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.99]"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t.verifyingPayment}</span>
                      </span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.confirmBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* STEP 4: CONFIRMED RESERVATION (CLINICAL VOUCHER PASS)                */}
            {/* =================================================================== */}
            {step === 4 && confirmedAppointment && (
              <div className="space-y-4 py-2 text-center">
                
                {/* Minimalist Success Icon */}
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold tracking-tight text-slate-950">
                    {t.instantBookingSuccess}
                  </h2>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {t.smsGuarantee}
                  </p>
                </div>

                {/* World-Class Clinical Voucher Pass Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-card text-left space-y-3 text-xs">
                  
                  {/* Top Bar with Reference & Verification Tag */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        {t.reservationId}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {confirmedAppointment.id}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      MoR Pass
                    </span>
                  </div>

                  {/* Two-Column Clinical Data Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Patient</span>
                      <span className="font-semibold text-slate-900 truncate block">
                        {confirmedAppointment.patientName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mobile Phone</span>
                      <span className="font-mono text-slate-900 block">
                        {confirmedAppointment.patientPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Attending Doctor</span>
                      <span className="font-semibold text-slate-900 block truncate">
                        {confirmedAppointment.doctorName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Operatory Slot</span>
                      <span className="font-semibold text-slate-900 block">
                        {selectedDateDisplay} · {selectedSlot}
                      </span>
                    </div>
                  </div>

                  {/* Procedure Details */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Procedure</span>
                      <span className="font-semibold text-slate-900">
                        {confirmedAppointment.serviceName}
                      </span>
                    </div>
                    {confirmedAppointment.depositPaidETB > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Deposit Paid</span>
                        <span className="font-bold text-[#005A3E] font-mono">
                          {confirmedAppointment.depositPaidETB} ETB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Receipt</span>
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <span>{t.returnHome}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Minimalist Clinical MoR Footer */}
        <div className="text-center text-[10px] text-slate-400 font-mono py-2 space-y-0.5">
          <p>Ministry of Revenues (MoR) Registered Clinic · TIN: 0049283711</p>
          <p>Bole Medhanialem, Morning Star Mall 3rd Floor · Addis Ababa, Ethiopia</p>
        </div>

      </div>
    </div>
  );
}
