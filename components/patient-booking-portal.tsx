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
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Info,
  CalendarCheck2,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle
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
import { SinnaAICopilot } from '@/components/sinna-ai-copilot';
import { ChatLanguage } from '@/lib/clinical-rag-engine';

interface PatientBookingPortalProps {
  clinicSlug?: string;
  initialLang?: BookingLang;
  skipLanguageModal?: boolean;
  initialServiceId?: string;
  onBackToApp?: () => void;
}

// Custom SVG Icons for Social Channels (Strictly 100% SVG, ZERO emojis)
function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.19-.06-.06-.16-.04-.24-.02-.1.02-1.78 1.13-5.02 3.32-.47.33-.9.49-1.29.48-.42-.01-1.23-.24-1.84-.44-.74-.24-1.33-.37-1.28-.79.03-.22.32-.44.89-.68 3.5-1.53 5.84-2.54 7.02-3.04 3.33-1.42 4.02-1.67 4.47-1.67.1 0 .32.02.46.14.12.1.15.24.17.34-.01.07-.01.23-.02.47z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.32a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.58a8.28 8.28 0 0 0 4.84 1.57V6.69h-1.07z" />
    </svg>
  );
}

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// Generate next 4 upcoming days dynamically
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
      dayNum: dayOfMonth,
      dayName: dayNamesEn[dayOfWeek],
      monthName: month,
      displayDate: `${month} ${dayOfMonth}`,
      fullFormatted: `${dayNamesEn[dayOfWeek]}, ${month} ${dayOfMonth}`,
    });
  }
  return days;
}

const MORNING_SLOTS = ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM'];
const AFTERNOON_SLOTS = ['02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM'];

// Service category tags
type ServiceCategory = 'all' | 'consultation' | 'hygiene' | 'emergency' | 'restorative' | 'cosmetic';

const CATEGORIES: { id: ServiceCategory; labelEn: string; labelAm: string; labelOm: string }[] = [
  { id: 'all', labelEn: 'All Services', labelAm: 'ሁሉም ህክምናዎች', labelOm: 'Hunda' },
  { id: 'consultation', labelEn: 'Card & Checkup', labelAm: 'የካርድና ምርመራ', labelOm: 'Kaardii fi Qorannoo' },
  { id: 'hygiene', labelEn: 'Hygiene & Scaling', labelAm: 'ማጽዳት እና ፖሊሽ', labelOm: 'Qulqullina' },
  { id: 'emergency', labelEn: 'Emergency Care', labelAm: 'አስቸኳይ ህክምና', labelOm: 'Ariifachiisaa' },
  { id: 'restorative', labelEn: 'Root Canal & Fillings', labelAm: 'የስር ህክምና', labelOm: 'Hiddamoo' },
  { id: 'cosmetic', labelEn: 'Aesthetic & Whitening', labelAm: 'ማንጣትና ውበት', labelOm: 'Miidhagina' },
];

export function PatientBookingPortal({
  clinicSlug,
  initialLang = 'am',
  skipLanguageModal = false,
  initialServiceId,
  onBackToApp
}: PatientBookingPortalProps) {
  const store = useSinnaStore();
  const targetSlug = clinicSlug || store.activeClinicSlug;
  const clinic = (targetSlug && store.clinics[targetSlug]) || store.clinics[store.activeClinicSlug] || Object.values(store.clinics)[0];

  // Language & Modal State: If language already selected upfront on landing page, skip prompt
  const [lang, setLang] = useState<BookingLang>(initialLang);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(!skipLanguageModal);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(skipLanguageModal);
  const t = BOOKING_DICTIONARY[lang];

  // Social Media Overlay State
  const [showSocialOverlay, setShowSocialOverlay] = useState<boolean>(false);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  // Dynamic Collapsible Clinic Details state (expanded on step 1, collapses dynamically on later steps)
  const [isClinicCollapsed, setIsClinicCollapsed] = useState<boolean>(false);

  // Image load error fallback state
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Helper to remove any redundant numeric prefix like "1. " from i18n label
  const cleanStepTitle = (label: string) => label.replace(/^\d+\.\s*/, '');

  // 4 upcoming days list
  const upcomingDays = useMemo(() => getUpcoming4Days(), []);

  // Wizard Step State (1: Services & Clinic Info, 2: Doctor, 3: Date & Time, 4: Patient Info & Confirmation)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  
  // Find initial service matching initialServiceId if provided
  const initialSrv = useMemo(() => {
    if (initialServiceId) {
      const found = LOCALIZED_SERVICES.find(s => s.id === initialServiceId || s.id?.toLowerCase().includes(initialServiceId.toLowerCase()));
      if (found) return found;
    }
    return LOCALIZED_SERVICES[0];
  }, [initialServiceId]);

  const [selectedService, setSelectedService] = useState<LocalizedService>(initialSrv);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(clinic.doctors[0]);

  // Date State - Default to Amharic display label
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(upcomingDays[1].isoDate);
  const [selectedDateDisplay, setSelectedDateDisplay] = useState<string>(upcomingDays[1].labelAm);
  const [customDateValue, setCustomDateValue] = useState<string>('');

  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('+251 91 ');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [paymentRail, setPaymentRail] = useState<'telebirr' | 'cbe_birr'>('telebirr');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [holdTimer, setHoldTimer] = useState<number>(599); // 09:59 hold countdown
  const [autoMatchedDoctorId, setAutoMatchedDoctorId] = useState<string | null>(null);
  const [autoMatchNotice, setAutoMatchNotice] = useState<string | null>(null);

  // AI Auto-Select Doctor Matching
  const handleAutoSelectDoctor = () => {
    const srvId = (selectedService.id || '').toLowerCase();
    const srvName = (selectedService.name.en || '').toLowerCase();

    let matchedDoc = clinic.doctors[0]; // Dr. Senait default
    let reasonEn = 'Lead specialist for restorative & aesthetic treatments';
    let reasonAm = 'ለስነ-ውበት እና አጠቃላይ ህክምና ተስማሚ ባለሙያ';
    let reasonOm = 'Ogeettii yaala miidhaginaa fi hiddamoo';

    if (
      srvId.includes('extraction') ||
      srvId.includes('emergency') ||
      srvId.includes('surgery') ||
      srvName.includes('emergency') ||
      srvName.includes('pain') ||
      srvName.includes('extraction') ||
      srvName.includes('surgery')
    ) {
      const dawit = clinic.doctors.find((d) => d.id === 'doc-dawit' || d.name.includes('Dawit'));
      if (dawit) {
        matchedDoc = dawit;
        reasonEn = 'Specialist in dental extractions and emergency care';
        reasonAm = 'ለአስቸኳይ እና የጥርስ ቀዶ-ህክምና ልዩ ባለሙያ';
        reasonOm = 'Ogeessa baqaqsanii yaaluu fi ariifachiisaa';
      }
    } else {
      const senait = clinic.doctors.find((d) => d.id === 'doc-senait' || d.name.includes('Senait'));
      if (senait) {
        matchedDoc = senait;
      }
    }

    setSelectedDoctor(matchedDoc);
    setAutoMatchedDoctorId(matchedDoc.id);

    const noticeText = lang === 'am'
      ? `${matchedDoc.name} ተመርጠዋል · ${reasonAm}`
      : lang === 'om'
      ? `${matchedDoc.name} filatameera · ${reasonOm}`
      : `Selected ${matchedDoc.name} · ${reasonEn}`;

    setAutoMatchNotice(noticeText);
  };

  // Scroll to top on every step transition smoothly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, confirmedAppointment]);

  // Automatically collapse clinic details when stepping forward to 2, 3, or 4
  useEffect(() => {
    if (step > 1) {
      setIsClinicCollapsed(true);
    } else {
      setIsClinicCollapsed(false);
    }
  }, [step]);

  // 10-minute chair reservation hold timer on steps 3 and 4
  useEffect(() => {
    if ((step !== 3 && step !== 4) || holdTimer <= 0) return;
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

      // Duplication Prevention: Check if patient phone already has an active appointment for the chosen date
      const cleanPhone = patientPhone.replace(/\D/g, '').slice(-9);
      const existing = store.appointments.find((a) => {
        const aPhone = (a.patientPhone || '').replace(/\D/g, '').slice(-9);
        const aDate = a.startsAt ? a.startsAt.split('T')[0] : '';
        return cleanPhone.length >= 9 && aPhone === cleanPhone && aDate === selectedIsoDate && a.status !== 'cancelled';
      });

      if (existing) {
        setIsProcessing(false);
        setConfirmedAppointment(existing);
        sinnaStore.toastWarning('ቀጠሮ አስቀድሞ ተመዝግቧል', `ለዚህ ስልክ ቁጥር ለተመረጠው ቀን ቀጠሮ አስቀድሞ ተይዟል [${existing.id}]`);
        return;
      }

      const prefix = clinic.mrrPrefix || (clinic.name ? clinic.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase() : 'BDS');
      const bdsCardNo = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
      const createdApt = sinnaStore.createAppointment({
        id: bdsCardNo,
        clinicId: clinic.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name[lang] || selectedService.name.en,
        startsAt,
        endsAt,
        status: 'confirmed',
        paymentStatus: selectedService.depositRequired ? 'deposit_paid' : 'none',
        notes: patientNotes.trim() ? `Patient Note: ${patientNotes.trim()} [Slot: ${selectedSlot}]` : `Slot: ${selectedSlot}`,
        totalDueETB: selectedService.priceETB,
        depositPaidETB: selectedService.depositRequired ? selectedService.depositAmountETB : 0,
        depositMethod: paymentRail === 'telebirr' ? 'telebirr' : 'cbe',
        source: 'online',
        isOnlineBooking: true,
        bookedVia: 'Sinna Web Portal (በኦንላይን የቀጠሮ መመዝገቢያ)',
      });

      // Dispatch real AfroMessage SMS notification explicitly providing the BDS-5 digit patient card number
      const cardNum = createdApt.id;
      const smsAm = `ሰላም ${patientName}፣ የታካሚ ካርድ ቁጥርዎ ${cardNum} ነው። በ ${clinic.name} የቀጠሮዎ ቀን ${selectedDateDisplay} በ ${selectedSlot} ሰዓት ተይዟል። ${selectedService.depositRequired ? `${selectedService.depositAmountETB} ብር ቅድመ ክፍያ በቴሌብር ተቀብለናል።` : ''} አድራሻ: ${clinic.location}። ስልክ: ${clinic.phone}`;
      const smsEn = `Hello ${patientName}, your patient card number is ${cardNum}. Your appointment at ${clinic.name} with ${selectedDoctor.name} is confirmed for ${selectedDateDisplay} at ${selectedSlot}. ${selectedService.depositRequired ? `${selectedService.depositAmountETB} ETB deposit received.` : ''} Location: ${clinic.location}. Phone: ${clinic.phone}`;

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
    }, 850);
  };

  const handleSelectLanguage = (selectedLang: BookingLang) => {
    setLang(selectedLang);
    setShowLanguageModal(false);
    setHasSelectedLanguage(true);
  };

  const handleCopyHandle = (channel: string, handleText: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(handleText);
      setCopiedChannel(channel);
      setTimeout(() => setCopiedChannel(null), 1800);
    }
  };

  const handleBackNavigation = () => {
    if (confirmedAppointment) {
      setConfirmedAppointment(null);
      setStep(1);
      return;
    }
    // Only navigate back if step > 1
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  // Filtered services by category
  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return LOCALIZED_SERVICES;
    if (selectedCategory === 'consultation') return LOCALIZED_SERVICES.filter(s => s.id === 'srv-card-exam');
    if (selectedCategory === 'hygiene') return LOCALIZED_SERVICES.filter(s => s.id === 'srv-cleaning');
    if (selectedCategory === 'emergency') return LOCALIZED_SERVICES.filter(s => s.id === 'srv-emergency');
    if (selectedCategory === 'restorative') return LOCALIZED_SERVICES.filter(s => s.id === 'srv-rootcanal');
    if (selectedCategory === 'cosmetic') return LOCALIZED_SERVICES.filter(s => s.id === 'srv-whitening');
    return LOCALIZED_SERVICES;
  }, [selectedCategory]);

  // Social Channels Directory with verified clinical endpoints & premium subtle gray styling
  const tgHandle = clinic.telegramChannel ? (clinic.telegramChannel.startsWith('@') ? clinic.telegramChannel : `@${clinic.telegramChannel}`) : `@${clinic.slug}`;
  const igHandle = clinic.instagramHandle ? (clinic.instagramHandle.startsWith('@') ? clinic.instagramHandle : `@${clinic.instagramHandle}`) : `@${clinic.slug}`;
  const cleanPhone = clinic.phone ? clinic.phone.replace(/\D/g, '') : '251911223344';

  const SOCIAL_CHANNELS = [
    {
      id: 'telegram',
      title: 'Telegram Channel',
      handle: tgHandle,
      subtext: 'Direct patient liaison & instant updates',
      href: `https://t.me/${tgHandle.replace('@', '')}`,
      icon: TelegramIcon,
      color: 'text-[#229ED9]',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200/80',
      actionText: 'Open',
    },
    {
      id: 'instagram',
      title: 'Instagram Gallery',
      handle: igHandle,
      subtext: 'Smile makeovers & hygiene tips',
      href: `https://instagram.com/${igHandle.replace('@', '')}`,
      icon: InstagramIcon,
      color: 'text-[#E1306C]',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200/80',
      actionText: 'Open',
    },
    {
      id: 'tiktok',
      title: 'TikTok Studio',
      handle: `@${clinic.slug}`,
      subtext: 'Short clinical walkthroughs & doctor Q&A',
      href: `https://tiktok.com/@${clinic.slug}`,
      icon: TikTokIcon,
      color: 'text-slate-900',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200/80',
      actionText: 'Open',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Consultation',
      handle: clinic.phone || '+251 91 122 3344',
      subtext: 'Direct digital desk for questions & records',
      href: `https://wa.me/${cleanPhone}`,
      icon: WhatsAppIcon,
      color: 'text-[#25D366]',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200/80',
      actionText: 'Message',
    },
    {
      id: 'facebook',
      title: 'Facebook Page',
      handle: clinic.name,
      subtext: 'Community updates & patient reviews',
      href: `https://facebook.com/${clinic.slug}`,
      icon: FacebookIcon,
      color: 'text-[#1877F2]',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200/80',
      actionText: 'Open',
    },
    {
      id: 'phone',
      title: 'Direct Front Desk Hotline',
      handle: clinic.phone || '+251 91 122 3344',
      subtext: 'Immediate operatory triage & assistance',
      href: `tel:${(clinic.phone || '+251911223344').replace(/\s+/g, '')}`,
      icon: Phone,
      color: 'text-emerald-600',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200/80',
      actionText: 'Call',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-28 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Toast Carrier */}
      <SmsToast />

      {/* ========================================================================= */}
      {/* MINIMALIST LANGUAGE SELECTION MODAL WITH CIRCULATING SINNA BORDER BEAM    */}
      {/* ========================================================================= */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
          <div className="relative w-full max-w-sm p-[2px] rounded-3xl overflow-hidden shadow-2xl transition-transform animate-in fade-in zoom-in-95 duration-200">
            <div className="sinna-border-beam-glow pointer-events-none" />
            <div className="sinna-border-beam pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border border-slate-200/60 pointer-events-none" />

            <div className="relative bg-white rounded-[calc(1.5rem-2px)] p-6 z-10 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
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
                  onClick={() => {
                    setShowLanguageModal(false);
                    setHasSelectedLanguage(true);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {/* 1. English */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('en')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${lang === 'en'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 ${lang === 'en'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                      EN
                    </div>
                    <div>
                      <div className="font-bold text-xs tracking-tight">English</div>
                      <div className={`text-[10px] ${lang === 'en' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Standard International
                      </div>
                    </div>
                  </div>
                  {lang === 'en' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                {/* 2. Amharic */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('am')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${lang === 'am'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-[#2563EB]/40 hover:bg-blue-50/40 text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-amharic text-xs font-bold flex items-center justify-center shrink-0 ${lang === 'am'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                      }`}>
                      አማ
                    </div>
                    <div>
                      <div className="font-bold text-xs font-amharic tracking-tight">አማርኛ</div>
                      <div className={`text-[10px] ${lang === 'am' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Amharic (Ethiopia)
                      </div>
                    </div>
                  </div>
                  {lang === 'am' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                {/* 3. Afaan Oromoo */}
                <button
                  type="button"
                  onClick={() => handleSelectLanguage('om')}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${lang === 'om'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 ${lang === 'om'
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                      OM
                    </div>
                    <div>
                      <div className="font-bold text-xs tracking-tight">Afaan Oromoo</div>
                      <div className={`text-[10px] ${lang === 'om' ? 'text-slate-300' : 'text-slate-400'}`}>
                        Oromiffa (Ethiopia)
                      </div>
                    </div>
                  </div>
                  {lang === 'om' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{clinic.name} · {clinic.location.split(',')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NON-DISRUPTIVE TOUCHABLE SOCIAL MEDIA OVERLAY SHEET                       */}
      {/* ========================================================================= */}
      {showSocialOverlay && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 animate-in fade-in"
          onClick={() => setShowSocialOverlay(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle for mobile touch */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
                  <Share2 className="w-3 h-3 text-[#2563EB]" />
                  <span>Clinic Channels</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  Connect with {clinic.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Touch any channel to open directly without losing your booking
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSocialOverlay(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                title="Close overlay"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Social List with subtle premium light-gray button styling */}
            <div className="space-y-2">
              {SOCIAL_CHANNELS.map((ch) => {
                const IconComponent = ch.icon;
                const isCopied = copiedChannel === ch.id;
                return (
                  <div
                    key={ch.id}
                    className="p-3 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/70 hover:bg-white transition-all flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl ${ch.bgColor} ${ch.color} border ${ch.borderColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {ch.title}
                        </div>
                        <div className="text-[11px] font-mono font-medium text-slate-700 truncate">
                          {ch.handle}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {ch.subtext}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopyHandle(ch.id, ch.handle)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 hover:text-slate-900 transition-colors text-xs flex items-center gap-1 shadow-2xs"
                        title="Copy handle"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={ch.href}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/90 border border-slate-200/80 text-slate-800 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                      >
                        <span>{ch.actionText}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Helper Footer */}
            <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
              Reception open Mon - Sat (8:30 AM - 7:00 PM) · Addis Ababa, Ethiopia
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE-FIRST APP CONTAINER                                                */}
      {/* ========================================================================= */}
      <div className="max-w-md mx-auto px-3 sm:px-4 pt-3 sm:pt-4 space-y-3">

        {/* MOBILE TOP NAVIGATION BAR */}
        <div className="bg-white border border-slate-200/90 shadow-2xs rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2">

          {/* Back button: on step > 1 goes back in wizard. On step 1, if onBackToApp is provided, returns to clinic overview */}
          {step > 1 && !confirmedAppointment ? (
            <button
              type="button"
              onClick={handleBackNavigation}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-colors shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : onBackToApp && !confirmedAppointment ? (
            <button
              type="button"
              onClick={onBackToApp}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-colors shrink-0"
              title="Return to clinic landing page"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                {clinic.name ? clinic.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3) : 'BDS'}
              </div>
              <span className="font-bold text-xs text-slate-900 tracking-tight whitespace-nowrap">{clinic.name}</span>
            </div>
          )}

          {/* Step Pill: Only shows progress after user selects language and as steps advance */}
          {hasSelectedLanguage && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold tracking-tight shadow-2xs animate-in fade-in duration-200 whitespace-nowrap">
              <span>{confirmedAppointment ? 'Digital Pass' : `Step ${step} of 4`}</span>
            </div>
          )}

          {/* Right Action: Language Badge & Dismiss */}
          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-[11px] font-bold text-slate-800 transition-colors uppercase font-mono"
              title="Change Language"
            >
              <Globe className="w-3 h-3 text-[#2563EB]" />
              <span>{lang}</span>
            </button>
            {onBackToApp ? (
              <button
                type="button"
                onClick={onBackToApp}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                title="Return to clinic landing page"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
                title="Return to clinic home"
              >
                <X className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* PROGRESS BAR TRACK: Only displays after language is selected */}
        {hasSelectedLanguage && (
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden animate-in fade-in duration-300">
            <div
              className="bg-[#2563EB] h-full transition-all duration-300 ease-out rounded-full"
              style={{
                width: confirmedAppointment ? '100%' : `${(step / 4) * 100}%`
              }}
            />
          </div>
        )}

        {/* RED URGENCY WARNING BANNER (TOP OF PAGE · FULL TEXT VISIBLE ACROSS ALL 3 LANGUAGES) */}
        {(step === 3 || step === 4) && !confirmedAppointment && (
          <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white rounded-2xl p-3 sm:p-3.5 shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-top-3 fade-in duration-300">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-pulse" />
              <p className="text-xs font-bold leading-snug break-words">
                {lang === 'am'
                  ? 'ይህ የቀጠሮ ሰዓት ለ 10 ደቂቃ ብቻ ይቆያል · ሌላ ሰው ሳይወስደው አሁኑኑ ያረጋግጡ።'
                  : lang === 'om'
                    ? "Sa'aatiin kun daqiiqaa 10 qofaaf eegama · Namni biraa osoo hin qabatin ammumma mirkaneessaa."
                    : 'Chair reserved for 10 minutes · Complete booking before your spot is released.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold bg-white/20 border border-white/25 px-2.5 py-1.5 rounded-xl shrink-0 whitespace-nowrap ml-1">
              <Clock className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
              <span>{formatTimer(holdTimer)}</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1ST CARD: CLINIC DETAILS (FULL ON STEP 1, COLLAPSED DYNAMICALLY ON NEXT STEPS) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300">

          {/* Main Clinic Header Row */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {clinic.mrrPrefix || (clinic.name ? clinic.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase() : 'BDS')}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-slate-950 text-sm sm:text-base leading-tight tracking-tight truncate">
                  {clinic.name}
                </h1>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  {clinic.location}
                </p>
              </div>
            </div>

            {/* Dynamic collapse/expand toggle on step > 1 */}
            {step > 1 && (
              <button
                type="button"
                onClick={() => setIsClinicCollapsed(!isClinicCollapsed)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[10px] font-semibold flex items-center gap-1 transition-colors shrink-0 border border-slate-200/60 whitespace-nowrap"
              >
                <span>{isClinicCollapsed ? 'Details' : 'Collapse'}</span>
                {isClinicCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* EXPANDABLE BODY: Always visible on Step 1, toggled on next steps */}
          {(!isClinicCollapsed || step === 1) && (
            <div className="mt-3.5 space-y-3.5 pt-3 border-t border-slate-100 animate-in fade-in duration-200">

              {/* Trust Badges - Mobile Responsive, No Word Wrap Breaks */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/70 whitespace-nowrap shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1 shrink-0" />
                  {t.badgeVerified}
                </span>

                <div className="inline-flex items-center text-amber-600 text-[10px] font-semibold gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70 whitespace-nowrap shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-mono">{clinic.rating}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{clinic.reviewCount} {t.reviewsLabel}</span>
                </div>

                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap shrink-0">
                  {t.openToday}
                </span>
              </div>

              {/* Clinic Bio & About */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.clinicAbout}
              </p>

              {/* =================================================================== */}
              {/* GOOGLE MAPS CONTAINER WITH SOCIAL MEDIA OVERLAY ON LEFT CORNER       */}
              {/* =================================================================== */}
              <div className="relative rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs p-2.5 sm:p-3 overflow-hidden group">
                <div className="relative z-10 flex items-center justify-between gap-2">

                  {/* LEFT CORNER: SOCIAL MEDIA ICONS OVERLAY TRIGGER BUTTON (Subtle Gray Premium Style) */}
                  <button
                    type="button"
                    onClick={() => setShowSocialOverlay(true)}
                    className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/80 transition-all shadow-2xs active:scale-95 group/soc shrink-0 whitespace-nowrap"
                    title="Open Clinic Social Media Hub"
                  >
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center border border-slate-200/60 shadow-2xs">
                      <Share2 className="w-3.5 h-3.5 text-[#2563EB] group-hover/soc:rotate-12 transition-transform" />
                    </div>
                    <span className="text-xs font-bold tracking-tight">Socials</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </button>

                  {/* CLINIC ADDRESS TAG */}
                  <div className="min-w-0 flex-1 px-1 text-left">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{clinic.location.split(',')[0]}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate pl-4">
                      {clinic.location}
                    </p>
                  </div>

                  {/* GOOGLE MAPS BUTTON */}
                  <a
                    href={clinic.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition-colors shadow-2xs shrink-0 whitespace-nowrap"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                </div>
              </div>

            </div>
          )}

          {/* COLLAPSED BAR SNIPPET ON NEXT STEPS (With sleek Gray Socials Button) */}
          {isClinicCollapsed && step > 1 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 gap-2">
              <button
                type="button"
                onClick={() => setShowSocialOverlay(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200/80 font-bold text-[10px] shadow-2xs transition-colors shrink-0 whitespace-nowrap"
              >
                <Share2 className="w-3 h-3 text-[#2563EB]" />
                <span>Socials</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
              <span className="truncate text-slate-500 text-[10px] flex-1 text-center">{clinic.location}</span>
              <a
                href={clinic.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-slate-900 text-[10px] font-semibold flex items-center gap-0.5 shrink-0 whitespace-nowrap"
              >
                <span>Maps</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 2ND CARD: GLASSY INTERACTIVE WIZARD CONTAINER (LUXURY GLASSMORPHISM)      */}
        {/* ========================================================================= */}
        {!confirmedAppointment && (
          <div className="relative rounded-3xl glass-panel-luxury p-4 sm:p-5 space-y-4 overflow-hidden transition-all">

            {/* Glowing Sinna Color Palette ambient orbs inside the glass */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-[#0284C7]/30 via-sky-400/25 to-blue-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-cyan-400/25 via-indigo-500/22 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">

              {/* STEP 1: SERVICE SELECTION */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-semibold mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{t.servicesTitle}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-tight">
                      {t.quickBookSubtitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.officialRates}
                    </p>
                  </div>

                  {/* CATEGORY FILTER PILLS */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar whitespace-nowrap">
                    {CATEGORIES.map((cat) => {
                      const isCatActive = selectedCategory === cat.id;
                      const catLabel = lang === 'am' ? cat.labelAm : lang === 'om' ? cat.labelOm : cat.labelEn;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            isCatActive
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'glass-card-luxury text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          {catLabel}
                        </button>
                      );
                    })}
                  </div>

                  {/* SERVICES LIST */}
                  <div className="space-y-2.5">
                    {filteredServices.map((srv) => {
                      const isSelected = selectedService.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv)}
                          className={`p-3.5 rounded-2xl cursor-pointer relative ${
                            isSelected
                              ? 'glass-card-selected'
                              : 'glass-card-luxury'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1 pr-1">
                              {srv.id === 'srv-card-exam' && (
                                <div className="mb-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                                    <Sparkles className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                    <span>
                                      {lang === 'am'
                                        ? 'የመጀመሪያ ጉብኝት · የካርድ መክፈቻ'
                                        : lang === 'om'
                                        ? 'Kaardii Haaraa fi Qorannoo'
                                        : 'First Visit · Diagnostic Card'}
                                    </span>
                                  </span>
                                </div>
                              )}
                              <h3 className="font-bold text-slate-900 text-xs tracking-tight truncate">
                                {srv.name[lang] || srv.name.en}
                              </h3>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {srv.description[lang] || srv.description.en}
                              </p>
                            </div>

                            <div className="text-right shrink-0 whitespace-nowrap pl-2">
                              <div className="font-mono font-bold text-xs text-slate-950">
                                {srv.priceETB.toLocaleString()} ETB
                              </div>
                              <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{srv.durationMinutes} {t.durationMin}</span>
                              </div>
                            </div>
                          </div>

                          {/* Deposit tag if required */}
                          <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] gap-2">
                            {srv.depositRequired ? (
                              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 truncate text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="truncate">
                                  {srv.id === 'srv-card-exam'
                                    ? `${srv.depositAmountETB} ETB Card Fee via Telebirr`
                                    : `${srv.depositAmountETB} ETB Telebirr Deposit`}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] truncate">
                                Zero upfront deposit required
                              </span>
                            )}

                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected
                                ? 'bg-[#2563EB] text-white'
                                : 'border border-slate-300 text-transparent'
                              }`}>
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Continue button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
                    >
                      <span>{t.continueBtn}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SPECIALIST SELECTION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-semibold mb-1">
                      <UserCheck className="w-3 h-3" />
                      <span>{t.dentistsTitle}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-tight">
                      {t.selectDoctor}
                    </h2>
                  </div>

                  {/* AI AUTO-SELECT DOCTOR BUTTON & SIMPLE DESCRIPTION */}
                  <div className="p-3 sm:p-3.5 rounded-2xl glass-card-luxury space-y-2">
                    <button
                      type="button"
                      onClick={handleAutoSelectDoctor}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-200 animate-pulse" />
                      <span>
                        {lang === 'am'
                          ? 'ተስማሚ ሀኪም በራስ-ሰር ምረጥ'
                          : lang === 'om'
                          ? 'Doktora Gaarii Ofumaan Filadhu'
                          : 'Auto-Select Best Doctor'}
                      </span>
                    </button>
                    <p className="text-[11px] text-slate-500 text-center leading-snug">
                      {lang === 'am'
                        ? 'ለህክምናዎ ተስማሚ የሆነውን እና ፈጣን ቀጠሮ ያለውን ሀኪም ይመርጣል::'
                        : lang === 'om'
                        ? 'Yaala keessaniif doktora sirrii fi beellama ariifachiisaa qabu isiniif fila.'
                        : 'Matches the best doctor for your treatment and fastest appointment.'}
                    </p>

                    {autoMatchNotice && (
                      <div className="p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[11px] truncate">{autoMatchNotice}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {clinic.doctors.map((doc) => {
                      const isDocSelected = selectedDoctor.id === doc.id;
                      const hasImageError = imageErrors[doc.id];
                      // Reliable fallback doctor initials
                      const doctorInitials = doc.name.includes('Senait') ? 'ST' : doc.name.includes('Dawit') ? 'DB' : 'DR';
                      // Fallback reliable medical portrait URL for Dr. Senait
                      const activePhotoUrl = doc.id === 'doc-senait'
                        ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
                        : doc.photoUrl;

                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between gap-3 ${
                            isDocSelected
                              ? 'glass-card-selected'
                              : 'glass-card-luxury'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Doctor Avatar with error fallback */}
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 border border-white/80 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden shadow-2xs">
                              {activePhotoUrl && !hasImageError ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={activePhotoUrl}
                                  alt={doc.name}
                                  className="w-full h-full object-cover"
                                  onError={() => setImageErrors((prev) => ({ ...prev, [doc.id]: true }))}
                                />
                              ) : (
                                <span className="text-[#2563EB] font-bold text-sm">{doctorInitials}</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-xs text-slate-900 truncate">
                                {doc.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {doc.specialty}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>4.9</span>
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="text-emerald-700 font-medium">Available</span>
                              </div>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDocSelected
                              ? 'bg-[#2563EB] text-white'
                              : 'border border-slate-300 text-transparent'
                            }`}>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected procedure preview */}
                  <div className="p-3 rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 text-[11px] flex items-center justify-between text-slate-600 gap-2 shadow-2xs">
                    <span className="shrink-0">{t.step1Treatment}:</span>
                    <span className="font-bold text-slate-900 truncate text-right">{selectedService.name[lang] || selectedService.name.en}</span>
                  </div>

                  {/* Step Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-3 rounded-2xl border border-white/80 bg-white/70 hover:bg-white backdrop-blur-md text-slate-700 text-xs font-semibold shadow-2xs transition-all shrink-0"
                    >
                      {t.backBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
                    >
                      <span>{t.continueBtn}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DATE & TIME SELECTION */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-semibold mb-1">
                        <CalendarCheck2 className="w-3 h-3" />
                        <span>{t.step2Time}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-tight truncate">
                        {t.selectDate}
                      </h2>
                    </div>
                  </div>

                  {/* 4 Days in Advance Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-bold text-slate-700">{t.selectDate}</span>
                      <span className="text-[10px] font-mono text-slate-500 truncate">{selectedDateDisplay}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {upcomingDays.map((dayObj) => {
                        const isQuickSelected = selectedIsoDate === dayObj.isoDate && !customDateValue;
                        return (
                          <button
                            key={dayObj.isoDate}
                            type="button"
                            onClick={() => handleSelectQuickDay(dayObj)}
                            className={`p-2 sm:p-2.5 rounded-2xl text-center transition-all ${
                              isQuickSelected
                                ? 'bg-slate-900 text-white shadow-md ring-2 ring-blue-500/30'
                                : 'glass-card-luxury text-slate-800'
                            }`}
                          >
                            <span className="block text-[10px] font-medium opacity-80 uppercase tracking-tight truncate">
                              {dayObj.displayDay === 'Today' || dayObj.displayDay === 'Tomorrow' ? dayObj.displayDay : dayObj.dayName}
                            </span>
                            <span className="block text-sm font-bold font-mono mt-0.5">
                              {dayObj.dayNum}
                            </span>
                            <span className={`block text-[9px] ${isQuickSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                              {dayObj.monthName}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Date Input */}
                    <div className="pt-1">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                        {t.selectAnyDate}:
                      </label>
                      <input
                        type="date"
                        min={upcomingDays[0].isoDate}
                        value={customDateValue}
                        onChange={handleCustomDateChange}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono text-slate-900 glass-card-luxury focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
                      />
                    </div>
                  </div>

                  {/* Slot Selection */}
                  <div className="space-y-3 pt-1">
                    {/* Morning */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Morning
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {MORNING_SLOTS.map((slot) => {
                          const status = checkSlotAvailability(slot);
                          const isSlotSelected = selectedSlot === slot && status.available;

                          if (!status.available) {
                            return (
                              <div
                                key={slot}
                                className="py-2.5 px-2 rounded-xl border border-slate-200/50 bg-slate-100/60 text-slate-400 text-center cursor-not-allowed text-xs font-mono whitespace-nowrap"
                              >
                                <span className="line-through block">{slot}</span>
                                <span className="text-[9px] font-sans block text-slate-400 font-semibold truncate">{status.label}</span>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2.5 px-2 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                                isSlotSelected
                                  ? 'glass-card-selected text-slate-950 font-bold'
                                  : 'glass-card-luxury text-slate-800'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Afternoon */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Afternoon
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {AFTERNOON_SLOTS.map((slot) => {
                          const status = checkSlotAvailability(slot);
                          const isSlotSelected = selectedSlot === slot && status.available;

                          if (!status.available) {
                            return (
                              <div
                                key={slot}
                                className="py-2.5 px-2 rounded-xl border border-slate-200/50 bg-slate-100/60 text-slate-400 text-center cursor-not-allowed text-xs font-mono whitespace-nowrap"
                              >
                                <span className="line-through block">{slot}</span>
                                <span className="text-[9px] font-sans block text-slate-400 font-semibold truncate">{status.label}</span>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2.5 px-2 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                                isSlotSelected
                                  ? 'glass-card-selected text-slate-950 font-bold'
                                  : 'glass-card-luxury text-slate-800'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Step Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-3 rounded-2xl glass-card-luxury text-slate-700 text-xs font-semibold shrink-0"
                    >
                      {t.backBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
                    >
                      <span>{t.continueBtn}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PATIENT DETAILS & ETHIOPIAN PAYMENT CONFIRMATION */}
              {step === 4 && (
                <form onSubmit={handleConfirmReservation} className="space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold mb-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{t.badgeVerified}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-tight">
                      {cleanStepTitle(t.step3Details)}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.smsGuarantee}
                    </p>
                  </div>

                  {/* Reservation Summary Card */}
                  <div className="p-3.5 rounded-2xl glass-card-luxury text-xs space-y-1.5 font-sans">
                    <div className="flex justify-between text-slate-600 gap-2">
                      <span className="text-[11px] shrink-0">{t.step1Treatment}:</span>
                      <span className="font-bold text-slate-900 text-right truncate">{selectedService.name[lang] || selectedService.name.en}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 gap-2">
                      <span className="text-[11px] shrink-0">Doctor:</span>
                      <span className="font-bold text-slate-900 truncate">{selectedDoctor.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 gap-2">
                      <span className="text-[11px] shrink-0">Time:</span>
                      <span className="font-bold text-slate-900 truncate">{selectedDateDisplay} · {selectedSlot}</span>
                    </div>
                    {selectedService.depositRequired && (
                      <div className="flex justify-between text-slate-600 pt-1.5 border-t border-slate-200/50">
                        <span className="text-[11px] font-semibold text-slate-700">Deposit:</span>
                        <span className="font-bold text-emerald-700 font-mono">{selectedService.depositAmountETB} ETB</span>
                      </div>
                    )}
                  </div>

                  {/* Input Fields */}
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
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-900 glass-card-luxury focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
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
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-900 glass-card-luxury focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {t.phoneHelp}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mild sensitivity on upper tooth"
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs text-slate-900 glass-card-luxury focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
                      />
                    </div>

                    {/* Payment Rail Options */}
                    {selectedService.depositRequired && (
                      <div className="space-y-2 pt-1">
                        <label className="block text-xs font-bold text-slate-700">
                          {t.paymentRail}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentRail('telebirr')}
                            className={`p-3 rounded-2xl text-xs text-left transition-all flex items-start gap-2.5 ${
                              paymentRail === 'telebirr'
                                ? 'glass-card-selected'
                                : 'glass-card-luxury'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${paymentRail === 'telebirr' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                              <Smartphone className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 text-xs truncate">Telebirr</div>
                              <div className="text-[10px] text-slate-500 truncate">*127#</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentRail('cbe_birr')}
                            className={`p-3 rounded-2xl text-xs text-left transition-all flex items-start gap-2.5 ${
                              paymentRail === 'cbe_birr'
                                ? 'glass-card-selected'
                                : 'glass-card-luxury'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${paymentRail === 'cbe_birr' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                              <CreditCard className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 text-xs truncate">CBE Birr</div>
                              <div className="text-[10px] text-slate-500 truncate">CBE</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-3 rounded-2xl glass-card-luxury text-slate-700 text-xs font-semibold shrink-0"
                    >
                      {t.backBtn}
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || !patientName.trim()}
                      className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{t.verifyingPayment}</span>
                        </span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{t.confirmBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CONFIRMED CLINICAL DIGITAL PASS (BOARDING PASS FORMAT)                    */}
        {/* ========================================================================= */}
        {confirmedAppointment && (
          <div className="space-y-4 py-1 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                {t.instantBookingSuccess}
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {t.smsGuarantee}
              </p>
            </div>

            {/* CLINICAL DIGITAL BOARDING PASS CARD */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-card text-left space-y-3.5 text-xs">

              {/* Header Reference & Pass Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                    Patient Card No · {t.reservationId}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {confirmedAppointment.id}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Pass Verified
                </span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div>
                  <span className="text-[10px] text-slate-400 block">Patient Name</span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {confirmedAppointment.patientName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone</span>
                  <span className="font-mono text-slate-900 block">
                    {confirmedAppointment.patientPhone}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Doctor</span>
                  <span className="font-semibold text-slate-900 block truncate">
                    {confirmedAppointment.doctorName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Time</span>
                  <span className="font-semibold text-slate-900 block">
                    {selectedDateDisplay} · {selectedSlot}
                  </span>
                </div>
              </div>

              {/* Procedure Details & Deposit */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Treatment</span>
                  <span className="font-semibold text-slate-900">
                    {confirmedAppointment.serviceName}
                  </span>
                </div>
                {confirmedAppointment.depositPaidETB > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Deposit Paid</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {confirmedAppointment.depositPaidETB} ETB
                    </span>
                  </div>
                )}
              </div>

              {/* Clinic Location */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{clinic.location}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Receipt</span>
              </button>
              {onBackToApp ? (
                <button
                  type="button"
                  onClick={onBackToApp}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <span>{t.returnHome}</span>
                </button>
              ) : (
                <Link
                  href="/"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  <span>{t.returnHome}</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Minimalist Clinical Footer */}
        <div className="text-center text-[10px] text-slate-400 font-mono py-2 space-y-0.5">
          <p>{clinic.name} · Addis Ababa, Ethiopia</p>
          <p>{clinic.location}</p>
        </div>

      </div>

      {/* Floating Patient Assistant */}
      <SinnaAICopilot
        mode="patient"
        currentLang={lang as ChatLanguage}
        onLanguageChange={(newLang) => setLang(newLang as BookingLang)}
      />
    </div>
  );
}
