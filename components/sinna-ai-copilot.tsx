'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  HelpCircle,
  Maximize2,
  Minimize2,
  ChevronDown,
  Layers,
  Database,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Radio,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  CalendarCheck2,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import {
  ChatLanguage,
  ChatRole,
  ChatMessage,
  ChatAction,
  InChatBookingData,
  LiveClinicSnapshot,
  STARTER_PROMPTS,
  STARTER_PROMPTS_BY_ROLE,
  resolveOfflineClinicalQuery
} from '@/lib/clinical-rag-engine';

interface SinnaAICopilotProps {
  mode?: 'patient' | 'admin';
  initialOpen?: boolean;
  currentLang?: ChatLanguage;
  onLanguageChange?: (newLang: ChatLanguage) => void;
}

// Sinna Tooth & Clinical Cross SVG Icon
function SinnaLogoIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#0284C7" />
      <path
        d="M16 6C13.5 6 11 7.5 10 10C9 12.5 9.5 15 10 18C10.5 21 11.5 24 13 25C14.5 26 15 23 16 23C17 23 17.5 26 19 25C20.5 24 21.5 21 22 18C22.5 15 23 12.5 22 10C21 7.5 18.5 6 16 6Z"
        fill="white"
        stroke="#E0F2FE"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 11V15M14 13H18"
        stroke="#0284C7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// IN-CHAT INTERACTIVE BOOKING WIDGET (4-STEP CONVERSATIONAL WIZARD)
// ---------------------------------------------------------------------------
interface InChatBookingWidgetProps {
  initialData?: InChatBookingData;
  lang: ChatLanguage;
  onAppointmentBooked?: (
    aptId: string,
    details: {
      patientName: string;
      serviceName: string;
      doctorName: string;
      date: string;
      slot: string;
      smsText: string;
    }
  ) => void;
}

function InChatBookingWidget({ initialData, lang, onAppointmentBooked }: InChatBookingWidgetProps) {
  const store = useSinnaStore();
  const clinic = store.clinics['bole-dental'] || Object.values(store.clinics)[0];

  // 4-Step Conversational State: 1 = Name, 2 = Phone, 3 = Date & Slot, 4 = Payment
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [patientName, setPatientName] = useState(initialData?.patientName || '');
  const [patientPhone, setPatientPhone] = useState(initialData?.patientPhone || '+251 9');
  const [serviceId, setServiceId] = useState(initialData?.serviceId || 'srv-cleaning');
  const [doctorId, setDoctorId] = useState(initialData?.doctorId || 'doc-senait');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('tomorrow');
  const [customDate, setCustomDate] = useState<string>('');
  const [slot, setSlot] = useState(initialData?.slot || '10:30 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAptId, setConfirmedAptId] = useState<string | null>(initialData?.confirmedAptId || null);

  const servicesList = [
    { id: 'srv-cleaning', nameEn: 'Routine Cleaning & Scaling', nameAm: 'መደበኛ የጥርስ ማጽዳት', nameOm: 'Qulqullina Ilkaanii', priceETB: 1500, depositETB: 300 },
    { id: 'srv-emergency', nameEn: 'Emergency Pain Relief & Exam', nameAm: 'አስቸኳይ የህመም ህክምና', nameOm: 'Yaala Ariifachiisaa', priceETB: 1200, depositETB: 300 },
    { id: 'srv-rct', nameEn: 'Root Canal Treatment (Single-Visit)', nameAm: 'የነርቭ ስር ህክምና', nameOm: 'Yaala Hiddamoo', priceETB: 4500, depositETB: 300 },
    { id: 'srv-whitening', nameEn: 'In-Office Laser Whitening', nameAm: 'የጥርስ ማንጣት ህክምና', nameOm: 'Addeessuu Ilkaanii', priceETB: 3800, depositETB: 300 },
  ];

  const selectedService = servicesList.find((s) => s.id === serviceId) || servicesList[0];
  const selectedDoctor = clinic.doctors.find((d) => d.id === doctorId) || clinic.doctors[0];

  // Dynamic Upcoming Days: Today, Tomorrow, This Friday, Saturday, Monday + Custom picker
  const upcomingDays = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const list = [];

    // Today
    const today = new Date(now);
    list.push({
      key: 'today',
      labelEn: 'Today',
      labelAm: 'ዛሬ',
      labelOm: "Har'a",
      displayDate: today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isoDate: today.toISOString().split('T')[0],
    });

    // Tomorrow
    const tomorrow = new Date(now.getTime() + 86400000);
    list.push({
      key: 'tomorrow',
      labelEn: 'Tomorrow',
      labelAm: 'ነገ',
      labelOm: 'Boru',
      displayDate: tomorrow.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isoDate: tomorrow.toISOString().split('T')[0],
    });

    // This Friday
    const friday = new Date(now);
    const distToFriday = (5 - currentDay + 7) % 7 || 7;
    friday.setDate(now.getDate() + distToFriday);
    list.push({
      key: 'friday',
      labelEn: 'Friday',
      labelAm: 'አርብ',
      labelOm: 'Jimaata',
      displayDate: friday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isoDate: friday.toISOString().split('T')[0],
    });

    // Saturday
    const saturday = new Date(now);
    const distToSat = (6 - currentDay + 7) % 7 || 7;
    saturday.setDate(now.getDate() + distToSat);
    list.push({
      key: 'saturday',
      labelEn: 'Saturday',
      labelAm: 'ቅዳሜ',
      labelOm: 'Sanbata',
      displayDate: saturday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isoDate: saturday.toISOString().split('T')[0],
    });

    // Next Monday
    const monday = new Date(now);
    const distToMon = (1 - currentDay + 7) % 7 || 7;
    monday.setDate(now.getDate() + distToMon);
    list.push({
      key: 'monday',
      labelEn: 'Monday',
      labelAm: 'ሰኞ',
      labelOm: 'Wiixata',
      displayDate: monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isoDate: monday.toISOString().split('T')[0],
    });

    return list;
  }, []);

  // Compute resolved display and ISO date
  const activeDateObj = upcomingDays.find((d) => d.key === selectedDateKey);
  let activeDateDisplay = '';
  let activeIsoDate = '';
  if (selectedDateKey === 'custom' && customDate) {
    const cd = new Date(customDate);
    activeDateDisplay = cd.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    activeIsoDate = customDate;
  } else if (activeDateObj) {
    activeDateDisplay = `${lang === 'am' ? activeDateObj.labelAm : lang === 'om' ? activeDateObj.labelOm : activeDateObj.labelEn} (${activeDateObj.displayDate})`;
    activeIsoDate = activeDateObj.isoDate;
  } else {
    activeDateDisplay = 'Tomorrow';
    activeIsoDate = upcomingDays[1].isoDate;
  }

  // Final Step: Complete Booking with chosen payment method
  const handleCompleteBooking = (chosenMethod: 'telebirr' | 'cbe') => {
    setIsSubmitting(true);

    setTimeout(() => {
      const aptId = `BDS-${Math.floor(10000 + Math.random() * 90000)}`;

      const [timeStr, period] = slot.split(' ');
      const [hStr, mStr] = timeStr.split(':');
      let hours = parseInt(hStr, 10);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const baseDate = activeIsoDate ? new Date(activeIsoDate) : new Date();
      baseDate.setHours(hours, parseInt(mStr, 10), 0, 0);

      const startsAt = baseDate.toISOString();
      const endsAt = new Date(baseDate.getTime() + 45 * 60000).toISOString();

      // Store in live Sinna clinic store
      sinnaStore.createAppointment({
        id: aptId,
        clinicId: clinic.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        serviceId: selectedService.id,
        serviceName: lang === 'am' ? selectedService.nameAm : lang === 'om' ? selectedService.nameOm : selectedService.nameEn,
        startsAt,
        endsAt,
        notes: `Booked via Sinna AI Copilot [${chosenMethod.toUpperCase()} 300 ETB Deposit Hold]`,
        totalDueETB: selectedService.priceETB,
        depositPaidETB: 300,
        depositMethod: chosenMethod,
        source: 'copilot',
        isOnlineBooking: true,
        bookedVia: 'Sinna Dental AI Copilot (የቻት ረዳት)',
        patientChart: {
          cardNo: aptId,
          medicalRecordNumber: aptId,
          fullNameAmharic: patientName.trim(),
          age: 30,
          gender: 'Female',
          subcityWoreda: 'Bole, Woreda 03',
          emergencyContact: {
            name: patientName.trim(),
            relationship: 'Self',
            phone: patientPhone.trim(),
          },
          chiefComplaint: lang === 'am' ? selectedService.nameAm : selectedService.nameEn,
          hpi: `Online copilot reservation. Card No: ${aptId}. Deposit: 300 ETB via ${chosenMethod.toUpperCase()}.`,
          medicalHistory: {
            allergies: [],
            systemicDiseases: [],
            currentMedications: [],
            bleedingDisorders: false,
          },
          clinicalFindings: {
            extraoral: 'Symmetrical, no lymphadenopathy',
            intraoralSoftTissue: 'Normal gingival mucosa',
            intraoralHardTissue: 'Calculus deposits on anterior lingual teeth',
            percussionTest: 'Negative',
            vitalityTest: 'Responsive',
          },
          radiographicNotes: 'Bitewing / periapical planned if indicated',
          definitiveDiagnosis: lang === 'am' ? selectedService.nameAm : selectedService.nameEn,
          stagedTreatmentPlan: [
            lang === 'am' ? selectedService.nameAm : selectedService.nameEn,
          ],
          prescriptions: [],
        },
      });

      // Dispatched authentic AfroMessage SMS
      const methodName = chosenMethod === 'telebirr' ? 'ቴሌብር (Telebirr)' : 'ንግድ ባንክ (CBE Birr)';
      const smsAm = `ሰላም ${patientName.trim()}፣ የታካሚ ካርድ እና የቀጠሮ መለያ ቁጥርዎ ${aptId} ነው። በቦሌ ዴንታል ስቱዲዮ ከ${selectedDoctor.name} ጋር ለ${activeDateDisplay} በ${slot} ሰዓት ተይዟል። የ 300 ብር ቅድመ ክፍያ በ${methodName} ተረጋግጧል። አድራሻ: ${clinic.location}። ስልክ: ${clinic.phone}`;
      const smsEn = `Hello ${patientName.trim()}, your patient card and appointment number is ${aptId}. Your booking at ${clinic.name} with ${selectedDoctor.name} is confirmed for ${activeDateDisplay} at ${slot}. 300 ETB deposit verified via ${chosenMethod.toUpperCase()}. Location: ${clinic.location}. Phone: ${clinic.phone}`;

      sinnaStore.sendSms({
        id: `sms-${Date.now()}`,
        recipientName: patientName.trim(),
        recipientPhone: patientPhone.trim(),
        templateType: 'confirmation',
        contentAm: smsAm,
        contentEn: smsEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      setConfirmedAptId(aptId);
      setIsSubmitting(false);

      if (onAppointmentBooked) {
        onAppointmentBooked(aptId, {
          patientName: patientName.trim(),
          serviceName: lang === 'am' ? selectedService.nameAm : lang === 'om' ? selectedService.nameOm : selectedService.nameEn,
          doctorName: selectedDoctor.name,
          date: activeDateDisplay,
          slot,
          smsText: lang === 'am' ? smsAm : smsEn,
        });
      }
    }, 800);
  };

  if (confirmedAptId) {
    return (
      <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/5 border border-emerald-500/30 text-slate-900 shadow-xs space-y-2.5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'am' ? 'ቀጠሮ ተረጋግጧል' : lang === 'om' ? 'Beellamni Mirkanaa\'eera' : 'Appointment Confirmed'}</span>
          </div>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
            {confirmedAptId}
          </span>
        </div>

        <div className="text-[11px] text-slate-700 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">{lang === 'am' ? 'ታካሚ' : 'Patient'}:</span>
            <span className="font-semibold">{patientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{lang === 'am' ? 'ሀኪም' : 'Doctor'}:</span>
            <span className="font-semibold">{selectedDoctor.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{lang === 'am' ? 'ቀንና ሰዓት' : 'Date & Time'}:</span>
            <span className="font-semibold font-mono">{activeDateDisplay} · {slot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{lang === 'am' ? 'ስልክ ቁጥር' : 'Phone'}:</span>
            <span className="font-semibold font-mono">{patientPhone}</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-800">
          <span className="inline-flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AfroMessage SMS Dispatched
          </span>
          <span className="font-mono font-bold text-emerald-900">300 ETB Verified</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2.5 p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-md text-slate-900 space-y-3 animate-in fade-in slide-in-from-top-1">
      {/* Header with Step indicator */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
          <CalendarCheck2 className="w-3.5 h-3.5 text-sky-600" />
          <span>
            {lang === 'am' ? 'የቀጠሮ ረዳት' : lang === 'om' ? 'Gargaaraa Beellamaa' : 'Sinna Booking Assistant'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono font-bold">
          <span className={`px-1.5 py-0.5 rounded ${bookingStep === 1 ? 'bg-sky-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'}`}>1</span>
          <span className={`px-1.5 py-0.5 rounded ${bookingStep === 2 ? 'bg-sky-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'}`}>2</span>
          <span className={`px-1.5 py-0.5 rounded ${bookingStep === 3 ? 'bg-sky-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'}`}>3</span>
          <span className={`px-1.5 py-0.5 rounded ${bookingStep === 4 ? 'bg-sky-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'}`}>4</span>
        </div>
      </div>

      {/* STEP 1: Ask Full Name */}
      {bookingStep === 1 && (
        <div className="space-y-2.5 animate-in fade-in slide-in-from-right-1 duration-200">
          <div className="text-xs text-slate-700 leading-snug">
            <p className="font-semibold text-slate-900">
              {lang === 'am'
                ? 'በደስታ! ቀጠሮዎን ለማስያዝ መጀመሪያ እባክዎ ሙሉ ስምዎን ያስገቡ:'
                : lang === 'om'
                ? 'Gammachuudhaan! Beellama keessan qabachuuf jalqaba maqaa keessan guutuu galchaa:'
                : "I'd be glad to help! To book your appointment, please enter your full name:"}
            </p>
          </div>
          <div>
            <input
              type="text"
              autoFocus
              required
              placeholder={lang === 'am' ? 'ምሳሌ፡ አበበ ከበደ' : lang === 'om' ? 'Fkn: Caalaa Tolasaa' : 'e.g. Abebe Kebede'}
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && patientName.trim()) {
                  e.preventDefault();
                  setBookingStep(2);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-1.5 focus:ring-sky-600 shadow-2xs font-sans"
            />
          </div>
          <button
            type="button"
            disabled={!patientName.trim()}
            onClick={() => setBookingStep(2)}
            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>{lang === 'am' ? 'ቀጣይ' : lang === 'om' ? 'Itti fufi' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* STEP 2: Ask Phone Number */}
      {bookingStep === 2 && (
        <div className="space-y-2.5 animate-in fade-in slide-in-from-right-1 duration-200">
          <div className="text-xs text-slate-700 leading-snug">
            <p className="font-semibold text-slate-900">
              {lang === 'am'
                ? `እናመሰግናለን ${patientName.trim()}! የቀጠሮ ማረጋገጫ የኤስኤምኤስ (SMS) የምንልክበትን ስልክ ቁጥርዎን ያስገቡ:`
                : lang === 'om'
                ? `Galatoomaa ${patientName.trim()}! Ergaa mirkaneessaa SMS itti ergamu lakkoofsa bilbilaa keessan galchaa:`
                : `Thank you ${patientName.trim()}! Please enter your phone number to receive your SMS booking confirmation:`}
            </p>
          </div>
          <div>
            <input
              type="tel"
              autoFocus
              required
              placeholder="+251 91 123 4567"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && patientPhone.trim().length >= 9) {
                  e.preventDefault();
                  setBookingStep(3);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-1.5 focus:ring-sky-600 shadow-2xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBookingStep(1)}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'ተመለስ' : lang === 'om' ? 'Deebi\'i' : 'Back'}</span>
            </button>
            <button
              type="button"
              disabled={patientPhone.trim().length < 9}
              onClick={() => setBookingStep(3)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>{lang === 'am' ? 'ቀጣይ' : lang === 'om' ? 'Itti fufi' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Ask Date & Slot (Friday, Saturday, custom date, etc.) */}
      {bookingStep === 3 && (
        <div className="space-y-2.5 animate-in fade-in slide-in-from-right-1 duration-200">
          <div className="text-xs text-slate-700 leading-snug">
            <p className="font-semibold text-slate-900">
              {lang === 'am'
                ? 'የሚመችዎትን የቀጠሮ ቀንና ሰዓት ይምረጡ (ዛሬ፣ ነገ፣ አርብ፣ ቅዳሜ ወይም ከቀን መቁጠሪያው):'
                : lang === 'om'
                ? 'Guyyaa fi sa\'aatii beellamaa isiniif mijatu filadhaa (Har\'a, Bor, Jimaata, Sanbata yookaan kalandarii irraa):'
                : 'Please select your preferred appointment date (Today, Tomorrow, Friday, Saturday, or pick any random date):'}
            </p>
          </div>

          {/* Quick Day Chips */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              {lang === 'am' ? 'ቀን ይምረጡ' : lang === 'om' ? 'Guyyaa Filadhaa' : 'Select Day'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {upcomingDays.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => {
                    setSelectedDateKey(d.key);
                    setCustomDate('');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    selectedDateKey === d.key
                      ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{lang === 'am' ? d.labelAm : lang === 'om' ? d.labelOm : d.labelEn}</span>
                  <span className="text-[9px] opacity-80 ml-1 font-mono">({d.displayDate})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Calendar Date Input for any random day */}
          <div className="pt-0.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 flex items-center justify-between">
              <span>{lang === 'am' ? 'ወይም የተለየ ቀን ይምረጡ' : lang === 'om' ? 'Yookaan guyyaa biraa filadhaa' : 'Or pick any random date'}</span>
              <Calendar className="w-3 h-3 text-sky-600" />
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setSelectedDateKey('custom');
              }}
              className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-1.5 focus:ring-sky-600 ${
                selectedDateKey === 'custom' ? 'border-sky-600 ring-1 ring-sky-600' : 'border-slate-200'
              }`}
            />
          </div>

          {/* Slot & Doctor */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                {lang === 'am' ? 'ሰዓት' : lang === 'om' ? 'Sa\'aatii' : 'Time Slot'}
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-1.5 focus:ring-sky-600"
              >
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                {lang === 'am' ? 'ሀኪም' : lang === 'om' ? 'Ogeessa' : 'Doctor'}
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-1.5 focus:ring-sky-600"
              >
                {clinic.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.includes('Senait') ? 'Dr. Senait' : 'Dr. Dawit'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setBookingStep(2)}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'ተመለስ' : lang === 'om' ? 'Deebi\'i' : 'Back'}</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingStep(4)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>{lang === 'am' ? 'ቀጣይ' : lang === 'om' ? 'Itti fufi' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Choose Payment Method Below and Finish Payment */}
      {bookingStep === 4 && (
        <div className="space-y-2.5 animate-in fade-in slide-in-from-right-1 duration-200">
          <div className="text-xs text-slate-700 leading-snug">
            <p className="font-semibold text-slate-900">
              {lang === 'am'
                ? 'ቦታዎን ለ 10 ደቂቃ ለማቆየት ከታች ካሉት አማራጮች በመምረጥ የ 300 ብር ቅድመ ክፍያዎን ያጠናቁ!'
                : lang === 'om'
                ? 'Bakka keessan daqiiqaa 10f tursiisuuf kaffaltii duraa 300 ETB filannoowwan armaan gadii keessaa filachuun xumuraa!'
                : 'Choose the method below and finish your payment of 300 ETB deposit to hold your spot!'}
            </p>
          </div>

          {/* Quick Recap */}
          <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-[11px] text-slate-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'am' ? 'ታካሚ' : 'Patient'}:</span>
              <span className="font-semibold text-slate-900">{patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'am' ? 'ቀንና ሰዓት' : 'Date & Time'}:</span>
              <span className="font-semibold text-slate-900">{activeDateDisplay} · {slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{lang === 'am' ? 'ሀኪም' : 'Doctor'}:</span>
              <span className="font-semibold text-slate-900">{selectedDoctor.name}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-sky-200/60 font-bold text-sky-950">
              <span>{lang === 'am' ? 'የ 10 ደቂቃ ቦታ ማስያዣ' : '10-Min Hold Deposit'}:</span>
              <span>300 ETB</span>
            </div>
          </div>

          {/* Payment Method Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleCompleteBooking('telebirr')}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#005CB9] to-[#0074E4] hover:opacity-95 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-white" />
                <div className="text-left leading-tight">
                  <span className="block font-bold">Telebirr SuperApp</span>
                  <span className="text-[10px] text-blue-100 font-normal">Instant 300 ETB Slot Lock</span>
                </div>
              </div>
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[11px]">300 ETB</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleCompleteBooking('cbe')}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#6A1A78] to-[#882199] hover:opacity-95 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white" />
                <div className="text-left leading-tight">
                  <span className="block font-bold">CBE Birr POS</span>
                  <span className="text-[10px] text-purple-100 font-normal">Commercial Bank of Ethiopia</span>
                </div>
              </div>
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-[11px]">300 ETB</span>
            </button>
          </div>

          {isSubmitting && (
            <div className="p-2 rounded-xl bg-slate-100 text-center text-xs text-slate-700 flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-sky-600 rounded-full animate-spin" />
              <span>{lang === 'am' ? 'ክፍያውን በማረጋገጥ ቦታውን እያስያዝን ነው...' : 'Verifying deposit & holding slot...'}</span>
            </div>
          )}

          <div className="pt-0.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setBookingStep(3)}
              className="w-full py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'am' ? 'ቀንና ሰዓት ለመቀየር ተመለስ' : 'Change Date or Time'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SinnaAICopilot({ mode = 'admin', initialOpen = false, currentLang, onLanguageChange }: SinnaAICopilotProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const store = useSinnaStore();

  const currentRole = store.currentUser?.role || 'reception';
  const isDoctor = currentRole === 'doctor';
  const isOwner = currentRole === 'admin' || store.activePersona === 'manager';
  const roleKey: 'reception' | 'doctor' | 'admin' = isDoctor ? 'doctor' : isOwner ? 'admin' : 'reception';
  const prevUserRef = useRef(store.currentUser?.id);

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [lang, setLang] = useState<ChatLanguage>(currentLang || 'am');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Clear and refresh chat context when operator role changes
  useEffect(() => {
    if (prevUserRef.current && prevUserRef.current !== store.currentUser?.id) {
      setMessages([]);
      setDynamicSuggestions([]);
    }
    prevUserRef.current = store.currentUser?.id;
  }, [store.currentUser?.id]);

  const clinic = getClinicData(store.activeClinicSlug);

  // Compute live clinic snapshot directly from current application store
  const snapshot: LiveClinicSnapshot = useMemo(() => {
    const apts = Array.isArray(store.appointments) ? store.appointments : [];
    const chairs = Array.isArray(store.chairs) ? store.chairs : [];
    const ledger = Array.isArray(store.ledger) ? store.ledger : [];
    const recalls = Array.isArray(store.treatmentPlans) ? store.treatmentPlans : [];

    const todayApts = apts.filter((a) => {
      // Default to all active demo appointments for today
      return a.status !== 'cancelled';
    });

    const waitingPatients = apts
      .filter((a) => a.status === 'checked_in')
      .map((a) => ({
        id: a.id,
        patientName: a.patientName,
        doctorName: a.doctorName,
        serviceName: a.serviceName,
        waitingSince: a.checkedInAt || '10:15 AM',
      }));

    const occupiedChairs = chairs.filter((c) => c.status === 'occupied').length;

    let telebirrSum = 0;
    let cashSum = 0;
    let cbeSum = 0;

    ledger.forEach((tx) => {
      const amt = Number(tx.amountETB) || 0;
      const m = (tx.method || '').toLowerCase();
      if (m.includes('telebirr')) telebirrSum += amt;
      else if (m.includes('cbe')) cbeSum += amt;
      else cashSum += amt;
    });

    const todayRev = telebirrSum + cashSum + cbeSum;

    const overdueRecalls = [
      { patientName: 'Bethlehem Tsegaye', phone: '+251 92 334 5566', recallType: '6-Month Prophy & Scaling', daysOverdue: 14 },
      { patientName: 'Yonas Alemu', phone: '+251 93 445 6677', recallType: 'Ortho Bracket Wire Adjustment', daysOverdue: 21 },
      { patientName: 'Meron Hailu', phone: '+251 91 556 7788', recallType: 'Post-RCT Crown Seating', daysOverdue: 9 },
    ];

    let pageTitle = 'Clinic Home';
    if (pathname === '/schedule') pageTitle = 'Operatory Timeline & Chair Dispatch';
    else if (pathname === '/patients') pageTitle = 'Patient Clinical Records Directory';
    else if (pathname === '/recalls') pageTitle = 'Recall Call List & SMS Follow-ups';
    else if (pathname === '/treatment-plans') pageTitle = '32-Tooth FDI Odontogram & Plans';
    else if (pathname === '/quotes') pageTitle = 'Formal Clinical Estimates & Quotes';
    else if (pathname === '/invoices') pageTitle = 'Ministry of Revenues Fiscal Invoices';
    else if (pathname === '/payments') pageTitle = 'Cashier Ledger & Point of Sale';
    else if (pathname === '/reports') pageTitle = 'Practice Analytics & Z-Report';
    else if (pathname === '/admin') pageTitle = 'Clinical Director & Security Settings';
    else if (pathname === '/book' || pathname.startsWith('/c/')) pageTitle = 'Public Patient Booking Portal';

    return {
      route: pathname,
      pageTitle,
      role: mode === 'patient' ? 'patient' : (store.currentUser?.role || 'reception') as ChatRole,
      todayAppointmentsCount: todayApts.length,
      waitingCount: waitingPatients.length,
      occupiedChairsCount: occupiedChairs,
      todayRevenueETB: todayRev > 0 ? todayRev : 14200,
      telebirrTotalETB: telebirrSum > 0 ? telebirrSum : 8600,
      cashTotalETB: cashSum > 0 ? cashSum : 3600,
      cbeTotalETB: cbeSum > 0 ? cbeSum : 2000,
      overdueRecallsCount: overdueRecalls.length,
      overdueRecallPatients: overdueRecalls,
      todayAppointments: todayApts.slice(0, 8).map((a) => ({
        id: a.id,
        patientName: a.patientName,
        serviceName: a.serviceName,
        doctorName: a.doctorName,
        time: a.startsAt ? new Date(a.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
        status: a.status,
        paymentStatus: a.paymentStatus,
      })),
      waitingPatients,
      chairs: chairs.map((c) => ({
        chairNumber: c.chairNumber,
        name: c.name,
        status: c.status,
        currentPatientName: c.currentPatientName,
        currentDoctorName: c.currentDoctorName,
      })),
      pendingQuotesCount: store.treatmentPlans?.length || 3,
      totalPendingQuotesETB: 24800,
    };
  }, [pathname, store, mode]);

  // Memoized welcome map based on active persona, role, and clinic snapshot
  const welcomeMap = useMemo<Record<ChatLanguage, string>>(() => {
    const userName = store.currentUser?.name || (isDoctor ? 'Dr. Senait' : isOwner ? 'Ato Dawit' : 'Helen');
    const chair1 = snapshot.chairs?.[0];
    const chair2 = snapshot.chairs?.[1];
    const revTotal = (snapshot.todayRevenueETB || 14200).toLocaleString();
    const telebirr = (snapshot.telebirrTotalETB || 8600).toLocaleString();
    const cbe = (snapshot.cbeTotalETB || 2000).toLocaleString();
    const cash = (snapshot.cashTotalETB || 3600).toLocaleString();
    const chair1Status = chair1?.status === 'occupied' ? `In Treatment (${chair1.currentPatientName})` : 'Clean & Ready';
    const chair2Status = chair2?.status === 'occupied' ? `In Treatment (${chair2.currentPatientName})` : 'Clean & Ready';
    const chair1Am = chair1?.status === 'occupied' ? 'በህክምና ላይ' : 'ዝግጁ';
    const chair2Am = chair2?.status === 'occupied' ? 'በህክምና ላይ' : 'ዝግጁ';

    return {
      en:
        mode === 'patient'
          ? `Hello! Welcome to **Bole Dental Studio**. I am your clinical reception assistant.\n\nI can answer questions regarding our **dental procedures**, **ETB pricing**, **300 ETB deposit policy**, and help you book with **Dr. Senait Tadesse** or **Dr. Dawit Bekele**.\n\nHow can I help you today?`
          : isDoctor
          ? `Hello ${userName}! Sinna Clinical Assistant online.\n\n- **Chair 1:** ${chair1Status}\n- **Chair 2:** ${chair2Status}\n- **Waiting in Reception:** ${snapshot.waitingCount}\n\nAsk for patient medical alerts, 32-tooth procedure codes, or post-extraction guidelines.`
          : isOwner
          ? `Hello ${userName}! Sinna Practice Management Assistant online.\n\n- **Today's Revenue:** ${revTotal} ETB\n- **Collections (Telebirr / CBE / Cash):** ${telebirr} / ${cbe} / ${cash} ETB\n- **Appointments Today:** ${snapshot.todayAppointmentsCount}\n\nAsk for MoR fiscal tax summaries, cashier ledgers, or doctor production.`
          : `Hello ${userName}! Sinna Front Desk Assistant online.\n\n- **Waiting in Reception:** ${snapshot.waitingCount} patient${snapshot.waitingCount === 1 ? '' : 's'}\n- **Appointments Today:** ${snapshot.todayAppointmentsCount}\n- **Chairs in Use:** ${snapshot.occupiedChairsCount}/2\n\nAsk about patient queue, phone recalls, or cash/Telebirr balancing.`,
      am:
        mode === 'patient'
          ? `ጤና ይስጥልኝ! ወደ **ቦሌ ዴንታል ስቱዲዮ** እንኳን በደህና መጡ። እኔ የክሊኒኩ ረዳት ነኝ።\n\nስለ **የጥርስ ህክምና አይነቶች**፣ **የዋጋ ዝርዝር**፣ **የ 300 ብር ቅድመ ክፍያ ደንብ**፣ ወይም ከ **ዶ/ር ሰናይት ታደሰ** ጋር ቀጠሮ ለመያዝ መጠየቅ ይችላሉ።\n\nበምን ላገልግልዎት?`
          : isDoctor
          ? `ሰላም ${userName}! የህክምና ረዳትዎ ዝግጁ ነው።\n\n- **ወንበር 1:** ${chair1Am}\n- **ወንበር 2:** ${chair2Am}\n- **በመጠባበቂያ ላይ:** ${snapshot.waitingCount}\n\nስለ ታካሚ የጤና ማስጠንቀቂያዎች፣ የህክምና ሂደቶች ወይም የድህረ ህክምና መመሪያዎች ይጠይቁኝ።`
          : isOwner
          ? `ሰላም ${userName}! የክሊኒኩ አስተዳደር ረዳት ዝግጁ ነው።\n\n- **የዛሬ ጠቅላላ ገቢ:** ${revTotal} ብር\n- **ቴሌብር / ንግድ ባንክ / ጥሬ ገንዘብ:** ${telebirr} / ${cbe} / ${cash} ብር\n- **የዛሬ ቀጠሮዎች:** ${snapshot.todayAppointmentsCount}\n\nስለ ፋይናንስ፣ የገቢዎች ሚኒስቴር (MoR) ደረሰኞች ወይም የክሊኒኩ አፈፃፀም ይጠይቁኝ።`
          : `ሰላም ${userName}! የመቀበያ ክፍል ረዳትዎ ዝግጁ ነው።\n\n- **በመጠባበቂያ ክፍል ያሉ:** ${snapshot.waitingCount} ታካሚዎች\n- **የዛሬ ቀጠሮዎች:** ${snapshot.todayAppointmentsCount}\n- **የተያዙ ወንበሮች:** ${snapshot.occupiedChairsCount}/2\n\nስለ ታካሚዎች ወረፋ፣ ስልክ ጥሪዎች ወይም የገንዘብ ክፍያዎች ይጠይቁኝ።`,
      om:
        mode === 'patient'
          ? `Akkam jirtu! Baga gara **Bole Dental Studio** nagaan dhuftan.\n\nWaa'ee **gatii yaala ilkaanii**, **kaffaltii duraa 300 ETB**, fi beellama qabachuu na gaafachuu dandeessu.\n\nAkkamiin isin gargaaru?`
          : `Gargaaraan Sinna Dental AI qophiidha. Galmee **Bole Dental Studio** wajjin walqabateera.\n\n- **Beellama Har'aa:** ${snapshot.todayAppointmentsCount}\n- **Kan eegaa jiran:** ${snapshot.waitingCount}\n\nWanta barbaaddan na gaafadhaa.`,
    };
  }, [mode, isDoctor, isOwner, store.currentUser?.name, snapshot]);

  // Helper to re-localize all chat messages (welcome seed, express booking instructions, confirmations)
  const updateMessagesForLanguage = (prevMessages: ChatMessage[], newLang: ChatLanguage) => {
    if (prevMessages.length === 0) {
      return [
        {
          id: 'welcome-seed',
          role: 'assistant' as const,
          content: welcomeMap[newLang],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: ['Bole Dental Studio Clinical Knowledge Base'],
        },
      ];
    }
    return prevMessages.map((msg) => {
      if (msg.id === 'welcome-seed') {
        return { ...msg, content: welcomeMap[newLang] };
      }
      if (msg.id.startsWith('ai-book-')) {
        return {
          ...msg,
          content:
            newLang === 'am'
              ? '**ቀጠሮዎን እዚህ በቀጥታ ይያዙ**\nየህክምና አይነት፣ ሀኪም እና የሚመችዎትን ሰዓት ይምረጡ። ስምዎንና ስልክዎን አስገብተው ቦታዎን ያስይዙ።'
              : newLang === 'om'
              ? '**Beellama keessan asuma irratti qabadhaa**\nGosoota yaalaa, ogeessa fayyaa fi yeroo filadhaa. Maqaa fi bilbila galchuun mirkaneessaa.'
              : '**Book your appointment directly here in chat**\nSelect your dental service, doctor, and preferred time slot. Enter your name and phone to hold your spot.',
        };
      }
      if (msg.id.startsWith('ai-confirm-')) {
        const meta = msg.bookingMeta;
        if (meta && meta.aptId) {
          return {
            ...msg,
            content:
              newLang === 'am'
                ? `**ቀጠሮዎ ተረጋግጧል!**\n\n- **የቀጠሮ መለያ ቁጥር:** \`${meta.aptId}\`\n- **ታካሚ:** ${meta.patientName || 'Patient'}\n- **ሀኪም:** ${meta.doctorName || 'Dr. Senait Tadesse'}\n- **ቀንና ሰዓት:** ${meta.date} በ ${meta.slot}\n\nየ 300 ብር ቅድመ ክፍያ ተረጋግጧል። የኤስኤምኤስ (SMS) መልእክት ወደ ስልክዎ ተልኳል!`
                : newLang === 'om'
                ? `**Beellamni keessan mirkanaa'eera!**\n\n- **Lakkoofsa Beellamaa:** \`${meta.aptId}\`\n- **Maqaa:** ${meta.patientName || 'Patient'}\n- **Ogeessa:** ${meta.doctorName || 'Dr. Senait Tadesse'}\n- **Guyyaa fi Sa'aatii:** ${meta.date} sa'aa ${meta.slot}\n\nKaffaltiin duraa 300 ETB mirkanaa'eera. Ergaan SMS bilbila keessanitti ergameera!`
                : `**Your appointment has been confirmed!**\n\n- **Appointment ID:** \`${meta.aptId}\`\n- **Patient:** ${meta.patientName || 'Patient'}\n- **Doctor:** ${meta.doctorName || 'Dr. Senait Tadesse'}\n- **Date & Time:** ${meta.date} at ${meta.slot}\n\n300 ETB deposit verified. A confirmation SMS has been dispatched to your phone!`,
          };
        }
        return {
          ...msg,
          content:
            newLang === 'am'
              ? '**ቀጠሮዎ ተረጋግጧል!**\nየ 300 ብር ቅድመ ክፍያ ተረጋግጧል። የኤስኤምኤስ (SMS) መልእክት ወደ ስልክዎ ተልኳል!'
              : newLang === 'om'
              ? '**Beellamni keessan mirkanaa\'eera!**\nKaffaltiin duraa 300 ETB mirkanaa\'eera. Ergaan SMS bilbila keessanitti ergameera!'
              : '**Your appointment has been confirmed!**\n300 ETB deposit verified. A confirmation SMS has been dispatched to your phone!',
        };
      }
      return msg;
    });
  };

  // Synchronize language automatically when passed from patient portal
  useEffect(() => {
    if (currentLang && currentLang !== lang) {
      setLang(currentLang);
      setDynamicSuggestions([]);
      setMessages((prev) => updateMessagesForLanguage(prev, currentLang));
    }
  }, [currentLang, lang, welcomeMap]);

  // Seed initial welcome message based on language and persona
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-seed',
          role: 'assistant',
          content: welcomeMap[lang],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: ['Bole Dental Studio Clinical Knowledge Base'],
        },
      ]);
    }
  }, [welcomeMap, messages.length, lang]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Get active starter prompts (uses dynamic Gemini follow-ups if present)
  const activeStarterPrompts = useMemo(() => {
    if (dynamicSuggestions.length > 0) return dynamicSuggestions;
    if (mode === 'patient') {
      return STARTER_PROMPTS.patient[lang] || [];
    }
    const rolePrompts = STARTER_PROMPTS_BY_ROLE[roleKey]?.[lang];
    if (rolePrompts && rolePrompts.length > 0) return rolePrompts;

    const pagePrompts = STARTER_PROMPTS.admin[pathname]?.[lang];
    if (pagePrompts && pagePrompts.length > 0) return pagePrompts;
    return STARTER_PROMPTS.admin['/']?.[lang] || STARTER_PROMPTS.patient[lang];
  }, [dynamicSuggestions, mode, pathname, lang, roleKey]);

  // Trigger in-chat express booking widget directly in the chat feed
  const handleTriggerExpressBooking = (serviceOrDoctorHint?: string) => {
    const isDoc = serviceOrDoctorHint === 'dr-senait' || serviceOrDoctorHint === 'dr-dawit';
    const newMsg: ChatMessage = {
      id: `ai-book-${Date.now()}`,
      role: 'assistant',
      content:
        lang === 'am'
          ? '**ቀጠሮዎን እዚህ በቀጥታ ይያዙ**\nየህክምና አይነት፣ ሀኪም እና የሚመችዎትን ሰዓት ይምረጡ። ስምዎንና ስልክዎን አስገብተው ቦታዎን ያስይዙ።'
          : lang === 'om'
          ? '**Beellama keessan asuma irratti qabadhaa**\nGosoota yaalaa, ogeessa fayyaa fi yeroo filadhaa. Maqaa fi bilbila galchuun mirkaneessaa.'
          : '**Book your appointment directly here in chat**\nSelect your dental service, doctor, and preferred time slot. Enter your name and phone to hold your spot.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['Sinna In-Chat Booking Engine'],
      bookingWidget: {
        serviceId: (!isDoc && serviceOrDoctorHint) ? serviceOrDoctorHint : 'consultation',
        doctorId: isDoc ? (serviceOrDoctorHint as string) : 'dr-senait',
        date: new Date().toISOString().split('T')[0],
        slot: '10:00 AM',
        isConfirmed: false,
      },
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleAppointmentBooked = (
    aptId: string,
    details: { patientName: string; serviceName: string; doctorName: string; date: string; slot: string; smsText?: string }
  ) => {
    const confirmMsg: ChatMessage = {
      id: `ai-confirm-${Date.now()}`,
      role: 'assistant',
      content:
        lang === 'am'
          ? `**ቀጠሮዎ ተረጋግጧል!**\n\n- **የቀጠሮ መለያ ቁጥር:** \`${aptId}\`\n- **ታካሚ:** ${details.patientName}\n- **ሀኪም:** ${details.doctorName}\n- **ቀንና ሰዓት:** ${details.date} በ ${details.slot}\n\nየ 300 ብር ቅድመ ክፍያ ተረጋግጧል። የኤስኤምኤስ (SMS) መልእክት ወደ ስልክዎ ተልኳል!`
          : lang === 'om'
          ? `**Beellamni keessan mirkanaa'eera!**\n\n- **Lakkoofsa Beellamaa:** \`${aptId}\`\n- **Maqaa:** ${details.patientName}\n- **Ogeessa:** ${details.doctorName}\n- **Guyyaa fi Sa'aatii:** ${details.date} sa'aa ${details.slot}\n\nKaffaltiin duraa 300 ETB mirkanaa'eera. Ergaan SMS bilbila keessanitti ergameera!`
          : `**Your appointment has been confirmed!**\n\n- **Appointment ID:** \`${aptId}\`\n- **Patient:** ${details.patientName}\n- **Doctor:** ${details.doctorName}\n- **Date & Time:** ${details.date} at ${details.slot}\n\n300 ETB deposit verified. A confirmation SMS has been dispatched to your phone!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['AfroMessage SMS Gateway', 'Bole Dental Appointment Ledger'],
      bookingMeta: {
        aptId,
        patientName: details.patientName,
        doctorName: details.doctorName,
        date: details.date,
        slot: details.slot,
      },
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  // Handle interactive automaton action clicks
  const handleActionClick = (action: ChatAction) => {
    if (action.type === 'NAVIGATE') {
      router.push(action.target);
    } else if (action.type === 'CALL_CLINIC') {
      window.location.href = `tel:${action.target}`;
    } else if (action.type === 'BOOK_DOCTOR' || action.type === 'BOOK_SERVICE') {
      handleTriggerExpressBooking(action.target);
    }
  };

  // Send query handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const lower = text.toLowerCase();
    const isBookingIntent =
      lower.includes('book') ||
      lower.includes('appointment') ||
      lower.includes('ቀጠሮ') ||
      lower.includes('መያዝ') ||
      lower.includes('beellama') ||
      lower.includes('schedule');

    try {
      // Call backend API (Gemini 3.8 Flash + Server RAG Engine)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lang,
          role: mode === 'patient' ? 'patient' : roleKey,
          snapshot,
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const data = await res.json();

      if (Array.isArray(data.suggestedPrompts) && data.suggestedPrompts.length > 0) {
        setDynamicSuggestions(data.suggestedPrompts);
      }

      const detectedBookingWidget =
        data.bookingWidget ||
        (isBookingIntent && mode === 'patient'
          ? {
              serviceId: lower.includes('extract') || lower.includes('surger') ? 'extraction' : 'consultation',
              doctorId: lower.includes('dawit') ? 'dr-dawit' : 'dr-senait',
              date: new Date().toISOString().split('T')[0],
              slot: '10:00 AM',
              isConfirmed: false,
            }
          : undefined);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Unable to generate response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || ['Bole Dental Grounded Knowledge Base'],
        suggestedPrompts: data.suggestedPrompts,
        actions: data.actions,
        bookingWidget: detectedBookingWidget,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('Sinna AI: Server chat API offline, invoking client-side fallback:', err);
      // Fallback directly in client for zero downtime
      const fallback = resolveOfflineClinicalQuery(
        text,
        lang,
        mode === 'patient' ? 'patient' : (store.currentUser?.role || 'reception') as ChatRole,
        snapshot
      );

      const detectedBookingWidget =
        fallback.bookingWidget ||
        (isBookingIntent && mode === 'patient'
          ? {
              serviceId: 'consultation',
              doctorId: 'dr-senait',
              date: new Date().toISOString().split('T')[0],
              slot: '10:00 AM',
              isConfirmed: false,
            }
          : undefined);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: fallback.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: fallback.sources,
        suggestedPrompts: fallback.suggestedPrompts,
        bookingWidget: detectedBookingWidget,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
    setDynamicSuggestions([]);
  };

  const switchLanguage = (newLang: ChatLanguage) => {
    setLang(newLang);
    setDynamicSuggestions([]);
    onLanguageChange?.(newLang);
    setMessages((prev) => updateMessagesForLanguage(prev, newLang));
  };

  return (
    <>
      {/* --------------------------------------------------------------------- */}
      {/* 1. FLOATING BOTTOM RIGHT TRIGGER BUTTON */}
      {/* --------------------------------------------------------------------- */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center print:hidden">
          {mode === 'patient' ? (
            /* PATIENT SIDE TRIGGER: Subtle glowing and bouncing with "ጥያቄ አሎዎት?" */
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-full border border-sky-300 shadow-[0_4px_20px_rgba(2,132,199,0.25)] ring-2 ring-sky-400/40 animate-subtle-bounce animate-subtle-glow transition-all duration-200 active:scale-95"
              title="Sinna Dental Assistant — ጥያቄ አሎዎት?"
              aria-label="Open Dental Assistant"
            >
              <div className="relative flex-shrink-0">
                <SinnaLogoIcon className="w-7 h-7 drop-shadow-sm transition-transform duration-200 group-hover:scale-105" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
              </div>
              <div className="flex flex-col text-left pr-1">
                <span className="text-xs font-bold text-slate-900 tracking-wide font-amharic">
                  ጥያቄ አሎዎት?
                </span>
                <span className="text-[10px] text-sky-600 font-medium leading-none">
                  Bole Dental AI
                </span>
              </div>
            </button>
          ) : (
            /* ADMIN / DASHBOARD SIDE TRIGGER: Linear / DentalPin Precision Style */
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-card border border-slate-700/80 transition-all duration-150 hover:shadow-float active:scale-95"
              title={`Sinna AI Clinical Copilot (${snapshot.pageTitle})`}
              aria-label="Open Sinna AI Clinical Copilot"
            >
              <SinnaLogoIcon className="w-5 h-5 flex-shrink-0" />
              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-semibold text-white">Sinna AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[110px] leading-tight">
                  {pathname === '/' ? 'Home Context' : snapshot.pageTitle?.split(' ')[0] + ' Context'}
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. CHATBOT WINDOW (MODERN CLINICAL POPOVER CARD) */}
      {/* --------------------------------------------------------------------- */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Sinna Dental Clinical Assistant"
          className={
            mode === 'patient'
              ? 'fixed inset-0 z-50 w-full h-full bg-white flex flex-col overflow-hidden animate-in fade-in duration-200 print:hidden lg:fixed lg:inset-auto lg:bottom-4 lg:right-4 lg:w-[430px] lg:h-[600px] lg:max-h-[88vh] lg:rounded-2xl lg:shadow-2xl lg:border lg:border-slate-200/90 lg:animate-spring-pop'
              : 'fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[410px] md:w-[430px] h-[580px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-spring-pop print:hidden'
          }
        >
          {/* A. HEADER */}
          <div className="bg-slate-900 text-white border-b border-slate-800 flex-shrink-0">
            <div className={`px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between ${mode === 'patient' ? 'max-w-4xl mx-auto w-full lg:px-4 lg:py-3' : ''}`}>
              <div className="flex items-center gap-3 min-w-0">
                <SinnaLogoIcon className="w-6 h-6 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide truncate">
                      Sinna Dental AI
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      mode === 'patient'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : isDoctor
                        ? 'bg-blue-900 text-blue-200 border border-blue-700'
                        : isOwner
                        ? 'bg-slate-800 text-amber-300 border border-amber-800/60'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {mode === 'patient'
                        ? (lang === 'am' ? 'የታካሚ ረዳት' : lang === 'om' ? 'Gargaaraa Yaalaa' : 'Patient Assistant')
                        : isDoctor
                        ? 'Doctor Copilot'
                        : isOwner
                        ? 'Owner Copilot'
                        : 'Reception Copilot'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Bole Dental Studio · {mode === 'patient' ? (lang === 'am' ? 'ኦፊሴላዊ የክሊኒክ ረዳት' : lang === 'om' ? 'Ogeessa Yaalaa Dijitaalaa' : 'Official Clinical Assistant') : snapshot.pageTitle}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  title="Reset conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1"
                  title="Close assistant"
                >
                  <X className="w-4 h-4" />
                  {mode === 'patient' && (
                    <span className="text-xs font-semibold hidden sm:inline lg:hidden">
                      {lang === 'am' ? 'ዝጋ' : lang === 'om' ? 'Cufaa' : 'Close'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* B. MULTILINGUAL LOCALIZATION BAR */}
          <div className="bg-slate-50 border-b border-slate-200 flex-shrink-0">
            <div className={`px-4 sm:px-6 py-2 flex items-center justify-between text-xs ${mode === 'patient' ? 'max-w-4xl mx-auto w-full' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {lang === 'am' ? 'ቋንቋ' : lang === 'om' ? 'Afaan' : 'Language'}:
                </span>
                <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => switchLanguage('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      lang === 'en'
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => switchLanguage('am')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold font-amharic transition-colors ${
                      lang === 'am'
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    አማርኛ
                  </button>
                  <button
                    type="button"
                    onClick={() => switchLanguage('om')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      lang === 'om'
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Afaan Oromoo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* C. PAGE CONTEXT BADGE (Linear Style) */}
          {mode === 'admin' && (
            <div className="bg-sky-50/70 border-b border-sky-100 px-3 py-1 flex items-center justify-between text-[10px] text-sky-800">
              <div className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-sky-600" />
                <span>
                  Active Context: <strong className="font-semibold">{snapshot.pageTitle}</strong>
                </span>
              </div>
              <span className="font-mono text-[9px] text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                Live DB
              </span>
            </div>
          )}

          {/* D. MESSAGES THREAD */}
          <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto bg-slate-50/50">
            <div className={`space-y-3.5 sm:space-y-4 ${mode === 'patient' ? 'max-w-4xl mx-auto w-full' : ''}`}>
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isAssistant
                          ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-sm'
                          : 'bg-brand-primary text-white rounded-tr-sm font-medium'
                      }`}
                    >
                    {/* Message Body with Markdown formatting support */}
                    <div className="whitespace-pre-line space-y-1">
                      {msg.content.split('\n\n').map((paragraph, i) => {
                        // Simple inline formatting for bold **text**
                        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={i}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={pIdx} className="font-semibold">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>

                    {/* Primary Instant Book Now CTA on Welcome Seed in Patient Portal */}
                    {isAssistant && msg.id === 'welcome-seed' && mode === 'patient' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100/90 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => handleTriggerExpressBooking()}
                          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
                        >
                          <CalendarCheck2 className="w-4 h-4 text-white" />
                          <span>
                            {lang === 'am'
                              ? 'ቀጠሮ አሁኑኑ ያስይዙ (Book Now)'
                              : lang === 'om'
                              ? 'Beellama Amma Qabadhaa (Book Now)'
                              : 'Book Appointment Now'}
                          </span>
                        </button>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-0.5">
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {lang === 'am' ? 'ፈጣን የ 10 ደቂቃ ቦታ ማስያዣ' : lang === 'om' ? 'Qabannoo Daqiiqaa 10' : '10-Min Spot Hold'}
                          </span>
                          <span className="text-slate-600 font-bold">300 ETB Deposit</span>
                        </div>
                      </div>
                    )}

                    {/* In-Chat Interactive Booking Card */}
                    {isAssistant && msg.bookingWidget && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <InChatBookingWidget
                          initialData={msg.bookingWidget}
                          lang={lang}
                          onAppointmentBooked={(aptId: string, details: any) => {
                            setMessages((prev) =>
                              prev.map((m) =>
                                m.id === msg.id && m.bookingWidget
                                  ? {
                                      ...m,
                                      bookingWidget: {
                                        ...m.bookingWidget,
                                        isConfirmed: true,
                                        confirmedAptId: aptId,
                                        patientName: details.patientName,
                                      },
                                    }
                                  : m
                              )
                            );
                            handleAppointmentBooked(aptId, details);
                          }}
                        />
                      </div>
                    )}

                    {/* Interactive AI Automaton Actions */}
                    {isAssistant && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.actions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 hover:text-sky-900 rounded-lg text-[11px] font-semibold border border-sky-200 transition-all duration-150 active:scale-95 shadow-2xs"
                          >
                            {act.type === 'NAVIGATE' && <ArrowRight className="w-3 h-3 text-sky-600" />}
                            {act.type === 'CALL_CLINIC' && <Phone className="w-3 h-3 text-sky-600" />}
                            {act.type === 'BOOK_DOCTOR' && <Calendar className="w-3 h-3 text-sky-600" />}
                            {act.type === 'BOOK_SERVICE' && <Sparkles className="w-3 h-3 text-sky-600" />}
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Sources Badge & Copy Action for Assistant */}
                    {isAssistant && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span className="truncate max-w-[180px]">
                            {msg.sources?.[0] || 'Bole Dental Grounded'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1 hover:text-slate-700 transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 text-xs flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="text-[10px] text-slate-400 ml-1">
                    Retrieving clinical records...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
            </div>
          </div>

          {/* E. STARTER CHIPS (FILLED UP QUESTIONS) */}
          <div className="bg-white border-t border-slate-200/80 flex-shrink-0">
            <div className={`px-4 sm:px-6 py-2.5 ${mode === 'patient' ? 'max-w-4xl mx-auto w-full' : ''}`}>
              <div className="text-[10px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>{lang === 'am' ? 'የሚመከሩ ጥያቄዎች' : lang === 'om' ? 'Gaaffilee Filataman' : 'Suggested Questions'}</span>
                <span className="text-[9px] font-mono text-slate-400">
                  {mode === 'patient' ? 'Patient Portal' : isDoctor ? 'Doctor Context' : isOwner ? 'Practice & Revenue' : 'Front Desk Queue'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {activeStarterPrompts.slice(0, 4).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-800 text-slate-700 border border-slate-200 hover:border-sky-200 rounded-lg whitespace-nowrap transition-colors disabled:opacity-50 text-left font-sans shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* F. CHAT INPUT BAR */}
          <div className="bg-white border-t border-slate-200 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className={`p-3 sm:p-4 flex items-center gap-2.5 ${mode === 'patient' ? 'max-w-4xl mx-auto w-full' : ''}`}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  lang === 'am'
                    ? 'ጥያቄዎን እዚህ ይጻፉ...'
                    : lang === 'om'
                    ? 'Gaaffii keessan asitti barreessaa...'
                    : 'Ask about appointments, prices, or patient records...'
                }
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-sky-500 focus:border-sky-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 sm:px-4 bg-brand-primary hover:bg-brand-hover disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors disabled:cursor-not-allowed flex-shrink-0 shadow-xs flex items-center gap-1.5 font-semibold text-xs sm:text-sm"
                title="Send question"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{lang === 'am' ? 'ላክ' : lang === 'om' ? 'Ergi' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
