'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Globe,
  X,
  Sparkles,
  Award,
  Stethoscope,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Menu
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSinnaStore } from '@/lib/store';
import { PatientBookingPortal } from '@/components/patient-booking-portal';
import { BookingLang } from '@/lib/i18n-booking';
import { SinnaAICopilot } from '@/components/sinna-ai-copilot';
import { ChatLanguage } from '@/lib/clinical-rag-engine';

// Register GSAP plugins safely on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ClinicLandingPageProps {
  clinicSlug?: string;
  initialLang?: BookingLang;
}

// -----------------------------------------------------------------------------
// LOCALIZED STRINGS (EN / AM / OM)
// -----------------------------------------------------------------------------
const LANDING_I18N = {
  en: {
    selectLanguage: 'Select Language',
    selectLanguageSub: 'Choose your preferred language for a personalized clinic experience',
    openToday: 'Open Today',
    bookBtn: 'Book',
    exploreServices: 'Explore Services',
    heroBadge: 'Top Rated Dental Care · 4.9/5 Clinical Rating',
    heroH1Pre: 'Your Best Dental Experience',
    heroH1Highlight: 'Awaits',
    heroSub: 'Experience gentle, modern dentistry with digital 3D precision, anxiety-free protocols, and patient-first comfort.',
    yearsExpBadge: '15+ Years Clinical Practice',
    satisfactionBadge: '99% Patient Satisfaction',
    servicesNav: 'Services',
    howItWorksNav: 'How It Works',
    aboutNav: 'About',
    servicesTitle: 'Clinical Dental Care',
    servicesSub: 'Comprehensive preventative, restorative, and aesthetic dental care for your whole family.',
    bookTreatment: 'Select & Book',
    howItWorksTitle: 'Simple 4-Step Care',
    howItWorksSub: 'Transparent, stress-free clinical dental visits from booking to follow-up.',
    step1Title: 'Book Online',
    step1Desc: 'Reserve your preferred dental treatment and time slot in under 60 seconds.',
    step2Title: 'Clinical Exam',
    step2Desc: 'Gentle digital inspection and 32-tooth odontogram staging.',
    step3Title: 'Personalized Care',
    step3Desc: 'Pain-free, gentle dentistry using modern biocompatible materials.',
    step4Title: 'Ongoing Recall',
    step4Desc: 'Convenient automated SMS reminders and follow-up care.',
    patientJourneysTitle: 'Clinical Outcomes & Smile Wellness',
    patientJourneysSub: 'Real smile transformations achieved through modern restorative dentistry.',
    case1Title: 'Aesthetic Whitening & Realignment',
    case1Quote: '"Extremely gentle, comfortable experience from start to finish. The team explained every step clearly."',
    case2Title: 'Permanent Tooth Replacement & Restoration',
    case2Quote: '"Painless procedure and my restored tooth feels and looks 100% natural. Unmatched clinical quality."',
    specialtiesTitle: 'Specialized Clinical Departments',
    specialtiesSub: 'Expert clinical focus areas designed for every stage of your oral health.',
    faqTitle: 'Frequently Asked Questions',
    faqSub: 'Common patient questions about clinical treatments and appointments.',
    hoursTitle: 'Operating Hours',
    emergencyHotlineTitle: 'Urgent Care Hotline',
    emergencyHotlineSub: 'Experiencing severe toothache or urgent discomfort? Contact our front desk:',
    reserveVisitTitle: 'Ready for Your Healthiest Smile?',
    reserveVisitSub: 'Reserve your appointment online in seconds. Instant SMS confirmation.',
    directReserveBtn: 'Book Online Now',
    aboutClinicTitle: 'Modern Clinical Dental Standards',
    aboutClinicDesc: 'Delivering predictable, hospital-grade dental healthcare in a calm, welcoming environment for every patient.',
    poweredBy: 'Powered by Sinna Dental AI · Clinical System',
  },
  am: {
    selectLanguage: 'ቋንቋ ይምረጡ',
    selectLanguageSub: 'ለተሟላ የክሊኒክ አገልግሎት የሚፈልጉትን ቋንቋ ይምረጡ',
    openToday: 'ዛሬ ክፍት ነው',
    bookBtn: 'ቀጠሮ',
    exploreServices: 'ህክምናዎችን ይመልከቱ',
    heroBadge: 'ከፍተኛ ደረጃ የተሰጠው የጥርስ ህክምና · 4.9/5',
    heroH1Pre: 'ለፈገግታዎ ምርጥ የጥርስ ህክምና',
    heroH1Highlight: 'እዚህ ያገኛሉ',
    heroSub: 'በዘመናዊ ዲጂታል ቴክኖሎጂ የታገዘ፣ ከህመም ነፃ የሆነ ጥራት ያለው የጥርስ ህክምና እና ምቾት።',
    yearsExpBadge: 'ከ15 ዓመት በላይ ልምድ',
    satisfactionBadge: '99% የታካሚ እርካታ',
    servicesNav: 'አገልግሎቶች',
    howItWorksNav: 'የቀጠሮ ሂደት',
    aboutNav: 'ስለ ክሊኒኩ',
    servicesTitle: 'የጥርስ ህክምና አገልግሎቶች',
    servicesSub: 'ለእርስዎ እና ለቤተሰብዎ የተሟላ የመከላከያ፣ የጥገና እና የስነ-ውበት የጥርስ ህክምና።',
    bookTreatment: 'ይህንን ይምረጡ',
    howItWorksTitle: 'ቀላል 4 ደረጃዎች',
    howItWorksSub: 'ቀላል እና ምቹ የቀጠሮ አያያዝ ሂደት ከመጀመሪያው እስከ መጨረሻ።',
    step1Title: 'ኦንላይን ቀጠሮ',
    step1Desc: 'የሚፈልጉትን ህክምና እና ምቹ ሰዓት በደቂቃዎች ውስጥ ይምረጡ።',
    step2Title: 'የመጀመሪያ ምርመራ',
    step2Desc: 'በዘመናዊ መሳሪያዎች የተሟላ የጥርስ ምርመራ ይደረጋል።',
    step3Title: 'ህክምናውን ማከናወን',
    step3Desc: 'በጥንቃቄ እና ከህመም ነፃ በሆነ መንገድ ህክምናው ይሰጣል።',
    step4Title: 'ቀጣይ ክትትል',
    step4Desc: 'ወቅታዊ የኤስኤምኤስ (SMS) ማሳሰቢያዎች እና ክትትል ይደረጋል።',
    patientJourneysTitle: 'የታካሚዎች ፈገግታ ውጤት',
    patientJourneysSub: 'በክሊኒካችን የተገኙ እውነተኛ የጥርስ ጤና እና ውበት ውጤቶች።',
    case1Title: 'የጥርስ ማንጣት እና የውበት ህክምና',
    case1Quote: '"በጣም ምቹ እና ከህመም ነፃ የሆነ ህክምና ነው ያገኘሁት። ሰራተኞቹ እጅግ በጣም ተግባቢ ናቸው።"',
    case2Title: 'የጥርስ ተከላ እና ጥገና',
    case2Quote: '"የተተከለው ጥርስ ከተፈጥሮ ጥርሴ ጋር ፍጹም የተስማማ ነው። በሙሉ እምነት ማኘክ ችያለሁ።"',
    specialtiesTitle: 'ልዩ የህክምና ዘርፎች',
    specialtiesSub: 'የጥርስ ጤናዎን ለመጠበቅ የተደራጁ የህክምና ዘርፎች።',
    faqTitle: 'ተደጋግመው የሚጠየቁ ጥያቄዎች',
    faqSub: 'ስለ ህክምናዎች እና ቀጠሮዎች ጠቃሚ መረጃዎች።',
    hoursTitle: 'የስራ ሰዓት',
    emergencyHotlineTitle: 'አስቸኳይ የጥርስ ህመም ስልክ',
    emergencyHotlineSub: 'ከፍተኛ የጥርስ ህመም ካጋጠመዎት በቀጥታ ይደውሉልን፦',
    reserveVisitTitle: 'ለጤናማ ፈገግታዎ ቀጠሮ ይያዙ',
    reserveVisitSub: 'ኦንላይን ቀጠሮዎን በአጭር ጊዜ ውስጥ ይያዙ። ፈጣን የኤስኤምኤስ ማረጋገጫ ይደርስዎታል።',
    directReserveBtn: 'ኦንላይን ቀጠሮ ይያዙ',
    aboutClinicTitle: 'ዘመናዊ የጥርስ ህክምና ማዕከል',
    aboutClinicDesc: 'ታካሚዎችን በቅድሚያ በማስቀደም፣ ዘመናዊ ቴክኖሎጂን ከሙያዊ ክህሎት ጋር በማጣመር ጥራት ያለው ህክምና እንሰጣለን።',
    poweredBy: 'በ Sinna Dental AI የታገዘ · የክሊኒክ ሲስተም',
  },
  om: {
    selectLanguage: 'Afaan Filadhaa',
    selectLanguageSub: 'Tajaajila yaala ilkaan keenyaaf afaan filadhaa',
    openToday: 'Har\'a Banaadha',
    bookBtn: 'Beellama',
    exploreServices: 'Tajaajila Ilaalaa',
    heroBadge: 'Yaala Ilkaanii Sadarkaa Ol\'aanaa · 4.9/5',
    heroH1Pre: 'Yaala Ilkaan Keessanii Isa Gaarii',
    heroH1Highlight: 'Asitti Argattu',
    heroSub: 'Teknooloojii ammayyaatiin, dhukkubbiin malee yaala ilkaanii qulqullina qabu ogeeyyii beekamoodhaan.',
    yearsExpBadge: 'Muuxannoo Waggaa 15+',
    satisfactionBadge: '99% Itti Quufinsa Dhukkubsattootaa',
    servicesNav: 'Tajaajiloota',
    howItWorksNav: 'Adeemsa Yaalaa',
    aboutNav: 'Waa\'ee Kilinikaa',
    servicesTitle: 'Tajaajiloota Yaala Ilkaanii',
    servicesSub: 'Isinii fi maatii keessaniif tajaajila guutuu ittisaa fi bareedina ilkaanii.',
    bookTreatment: 'Yaala Filadhaa',
    howItWorksTitle: 'Tarkaanfii 4 Salphaa',
    howItWorksSub: 'Adeemsa beellama qabachuu salphaa fi ifa ta\'e.',
    step1Title: 'Toora Interneetii Beellama',
    step1Desc: 'Tajaajila barbaaddanii fi sa\'aatii isiniif ta\'u sekondoota muraasa keessatti filadhaa.',
    step2Title: 'Qorannoo Jalqabaa',
    step2Desc: 'Meeshaalee ammayyaatiin qorannoo ilkaanii guutuu gaggeessuu.',
    step3Title: 'Yaala Keennuu',
    step3Desc: 'Dhukkubbiin malee of-eeggannoodhaan yaala kennuu.',
    step4Title: 'Hordoffii Itti Fufaa',
    step4Desc: 'Ergaa gabaabaa (SMS) fi hordoffii fayyaa ilkaanii.',
    patientJourneysTitle: 'Dhugaa Baatii Dhukkubsattootaa',
    patientJourneysSub: 'Jijjiirama qabatamaa kilinika keenya keessatti mul\'ate.',
    case1Title: 'Ilkaan Addeessuu fi Qulqulleessuu',
    case1Quote: '"Yaalli ani argadhe baay\'ee mijataa fi kan dhukkubbiin hin qabnedha."',
    case2Title: 'Ilkaan Dhaabuu (Implant)',
    case2Quote: '"Ilkaan dhaabbate kun isa uumamaa wajjin tokkodha. Baay\'ee natti toleera."',
    specialtiesTitle: 'Kutaa Yaala Addaa',
    specialtiesSub: 'Fayyaa ilkaan keessaniif tajaajila addaa.',
    faqTitle: 'Gaaffilee Yeroo Baay\'ee Gaafataman',
    faqSub: 'Waa\'ee yaalaa fi beellamaa odeeffannoo barbaachisaa.',
    hoursTitle: 'Sa\'aatii Hojii Kilinikaa',
    emergencyHotlineTitle: 'Bilbila Ariifachiisaa',
    emergencyHotlineSub: 'Dhukkubbiin ilkaanii cimaan yoo isin mudate kallattiin bilbilaa:',
    reserveVisitTitle: 'Seecca\'aa Ta\'uuf Beellama Qabadhaa',
    reserveVisitSub: 'Sekondii muraasa keessatti toora interneetiitiin beellama qabadhaa.',
    directReserveBtn: 'Beellama Qabadhaa',
    aboutClinicTitle: 'Kilinika Yaala Ilkaan Ammayyaa',
    aboutClinicDesc: 'Dhukkubsattoota dursiisuudhaan, teknooloojii ammayyaa fi dandeettii ogeeyyiitiin tajaajila gaarii kennina.',
    poweredBy: 'Sinna Dental AI dhaan deeggarame',
  }
};

export function ClinicLandingPage({
  clinicSlug,
  initialLang = 'en',
}: ClinicLandingPageProps) {
  const store = useSinnaStore();

  // Dynamic clinic resolution from active store:
  // 1. If explicit clinicSlug is provided and matches a key or name, use it.
  // 2. Otherwise, dynamically resolve to the user's active/customized clinic from the store!
  const clinic = React.useMemo(() => {
    if (clinicSlug) {
      if (store.clinics[clinicSlug]) return store.clinics[clinicSlug];
      const cleanTarget = clinicSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = Object.values(store.clinics).find(
        (c) =>
          c.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget ||
          c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget
      );
      if (found) return found;
    }
    return store.clinics[store.activeClinicSlug] || Object.values(store.clinics)[0];
  }, [clinicSlug, store.clinics, store.activeClinicSlug]);

  // 1. Language Gate: Upfront selection before rendering content
  const [lang, setLang] = useState<BookingLang>(initialLang);
  const [hasChosenLang, setHasChosenLang] = useState<boolean>(false);

  // 2. Booking Engine Transition State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);

  // 3. Interactive Before & After Slider State
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef<boolean>(false);

  // 4. Header Language Dropdown Menu State
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // 5. FAQ Accordion State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // 6. Mobile Navigation Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Ref holders for GSAP animations
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const langModalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCtasRef = useRef<HTMLDivElement>(null);
  const heroImageCardRef = useRef<HTMLDivElement>(null);
  const floatingBadge1Ref = useRef<HTMLDivElement>(null);
  const floatingBadge2Ref = useRef<HTMLDivElement>(null);

  const t = LANDING_I18N[lang] || LANDING_I18N.en;

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // GSAP ANIMATION 1: LANGUAGE GATE ENTRANCE (Ultra-Fast 60fps Entrance)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hasChosenLang && langModalRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          langModalRef.current,
          { y: 25, scale: 0.96, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
            clearProps: 'transform,scale',
          }
        );

        gsap.fromTo(
          '.gsap-lang-tile',
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.06,
            duration: 0.35,
            ease: 'power2.out',
            delay: 0.08,
            clearProps: 'transform',
          }
        );
      }, langModalRef);

      return () => ctx.revert();
    }
  }, [hasChosenLang]);

  // Handle language selection with instant responsive transition
  const handleSelectLanguage = (selected: BookingLang) => {
    if (langModalRef.current) {
      gsap.to(langModalRef.current, {
        scale: 0.98,
        y: -10,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setLang(selected);
          setHasChosenLang(true);
        },
      });
    } else {
      setLang(selected);
      setHasChosenLang(true);
    }
  };

  // ---------------------------------------------------------------------------
  // GSAP ANIMATION 2: MAIN PAGE MASTER TIMELINE & 100% RELIABLE REVEALS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!hasChosenLang || isBookingOpen) return;

    const ctx = gsap.context(() => {
      // 1. Header Dropdown Glide - Snappy 0.35s
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: -18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            ease: 'power2.out',
            clearProps: 'all',
          }
        );
      }

      // 2. Coordinated Hero Elements Entrance (No lingering opacity: 0)
      const heroElements = [
        heroBadgeRef.current,
        heroHeadingRef.current,
        heroSubRef.current,
        heroCtasRef.current,
      ].filter(Boolean);

      if (heroElements.length > 0) {
        gsap.fromTo(
          heroElements,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.06,
            duration: 0.45,
            ease: 'power2.out',
            clearProps: 'all',
          }
        );
      }

      if (heroImageCardRef.current) {
        gsap.fromTo(
          heroImageCardRef.current,
          { scale: 0.96, opacity: 0, y: 15 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            delay: 0.1,
            clearProps: 'all',
          }
        );
      }

      // Continuous Subtle Floating Physics for Hero Badges
      if (floatingBadge1Ref.current) {
        gsap.to(floatingBadge1Ref.current, {
          y: -5,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (floatingBadge2Ref.current) {
        gsap.to(floatingBadge2Ref.current, {
          y: -6,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.3,
        });
      }

      // 3. Ultra-Reliable Native IntersectionObserver Reveals with GSAP
      // Never leaves cards hidden at opacity: 0 if triggers miss
      const revealElements = (selector: string, stagger = 0.06) => {
        const elements = gsap.utils.toArray<HTMLElement>(selector);
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                gsap.fromTo(
                  elements,
                  { opacity: 0, y: 20 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.45,
                    stagger,
                    ease: 'power2.out',
                    clearProps: 'all',
                  }
                );
                observer.disconnect();
              }
            });
          },
          { threshold: 0.1 }
        );

        const container = elements[0].closest('section') || elements[0].parentElement;
        if (container) {
          observer.observe(container);
        }
      };

      revealElements('.gsap-service-card', 0.07);
      revealElements('.gsap-step-card', 0.06);
      revealElements('.gsap-outcome-card', 0.08);
      revealElements('.gsap-dept-card', 0.05);
      revealElements('.gsap-faq-item', 0.05);

      const bookActionCard = document.querySelector<HTMLElement>('.gsap-book-card');
      if (bookActionCard) {
        const bookObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              gsap.fromTo(
                bookActionCard,
                { opacity: 0, scale: 0.97, y: 15 },
                {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  duration: 0.5,
                  ease: 'power2.out',
                  clearProps: 'all',
                }
              );
              bookObserver.disconnect();
            }
          },
          { threshold: 0.15 }
        );
        bookObserver.observe(bookActionCard);
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, [hasChosenLang, isBookingOpen]);

  // Before & After Drag Handlers
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = () => {
    isDraggingSlider.current = true;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingSlider.current = false;
    };
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider.current) {
        handleSliderMove(e.clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  // Action: Select service and open booking
  const handleSelectService = (serviceId: string) => {
    setPreselectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 0: SEAMLESS DIRECT TRANSITION TO PATIENT BOOKING PORTAL (NO SCRIM/MODAL)
  // ---------------------------------------------------------------------------
  if (isBookingOpen) {
    return (
      <div className="min-h-screen bg-white animate-in fade-in duration-200">
        <PatientBookingPortal
          clinicSlug={clinic.slug}
          initialLang={lang}
          skipLanguageModal={true}
          initialServiceId={preselectedServiceId}
          onBackToApp={() => {
            setIsBookingOpen(false);
            setPreselectedServiceId(undefined);
          }}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 1: 2027 TOP 0.0001% LUXURY UPFRONT LANGUAGE SELECTION GATE (GSAP Animated)
  // ---------------------------------------------------------------------------
  if (!hasChosenLang) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4 selection:bg-[#1E50FF] selection:text-white relative overflow-hidden">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/8 via-cyan-400/5 to-emerald-400/8 rounded-full blur-3xl pointer-events-none" />

        {/* Luxury Language Card with Enhanced Studio Elevation Shadow */}
        <div
          ref={langModalRef}
          className="relative max-w-md w-full bg-white/98 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-[0_30px_90px_-15px_rgba(15,23,42,0.22),0_0_60px_-10px_rgba(30,80,255,0.20)] p-7 sm:p-9 space-y-6 text-center z-10 transition-transform"
        >
          {/* Top Verification Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span suppressHydrationWarning>{clinic.name} · Verified Practice</span>
          </div>

          {/* Clinic Brand Identity Mark */}
          <div className="space-y-3">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white flex items-center justify-center mx-auto shadow-lg shadow-slate-950/20 ring-4 ring-slate-100">
              <svg className="w-7 h-7 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 5 4.5 5 8c0 3 1.5 6 2 9 .4 2.4 1.5 5 5 5s4.6-2.6 5-5c.5-3 2-6 2-9 0-3.5-3-6-7-6z" />
                <path d="M12 2v7" />
              </svg>
            </div>
            
            <div>
              <h2 suppressHydrationWarning className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                {clinic.name}
              </h2>
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-1">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span suppressHydrationWarning>{clinic.location.split(',')[0]} · Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>

          {/* Section Prompt */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Language · ቋንቋ ይምረጡ · Afaan Filadhaa
            </p>
            <p className="text-[11px] text-slate-400">
              Choose your language to proceed to clinic services and online booking
            </p>
          </div>

          {/* 3 Luxury Sculpted Language Tiles */}
          <div className="space-y-2.5">
            {/* 1. English */}
            <button
              type="button"
              onClick={() => handleSelectLanguage('en')}
              className="gsap-lang-tile w-full p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-[#1E50FF] hover:ring-2 hover:ring-[#1E50FF]/15 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between group cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                  EN
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-950 group-hover:text-[#1E50FF] transition-colors">
                    English
                  </p>
                  <p className="text-[11px] text-slate-400">International Dental Care Standard</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#1E50FF] flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* 2. Amharic */}
            <button
              type="button"
              onClick={() => handleSelectLanguage('am')}
              className="gsap-lang-tile w-full p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-[#1E50FF] hover:ring-2 hover:ring-[#1E50FF]/15 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between group cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E50FF] to-sky-400 text-white font-mono font-bold text-xs flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs font-amharic">
                  አማ
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-950 group-hover:text-[#1E50FF] transition-colors font-amharic">
                    አማርኛ (Amharic)
                  </p>
                  <p className="text-[11px] text-slate-400">የአማርኛ ቋንቋ የክሊኒክ አገልግሎት</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#1E50FF] flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* 3. Afaan Oromoo */}
            <button
              type="button"
              onClick={() => handleSelectLanguage('om')}
              className="gsap-lang-tile w-full p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-[#1E50FF] hover:ring-2 hover:ring-[#1E50FF]/15 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center justify-between group cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-mono font-bold text-xs flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                  OM
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-950 group-hover:text-[#1E50FF] transition-colors">
                    Afaan Oromoo
                  </p>
                  <p className="text-[11px] text-slate-400">Tajaajila yaala ilkaanii afaan oromootiin</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-400 group-hover:text-[#1E50FF] flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          {/* Bottom Trust Assurance */}
          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Direct online chair booking · Instant SMS confirmation · 100% Free</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageContainerRef}
      className="min-h-screen bg-[#F4F5F7] text-slate-900 font-sans antialiased selection:bg-[#1E50FF] selection:text-white relative"
    >

      {/* --------------------------------------------------------------------------- */}
      {/* 1. MINDLY-STYLE FLOATING NAVBAR (GSAP Animated)                             */}
      {/* --------------------------------------------------------------------------- */}
      <header
        ref={headerRef}
        className="sticky top-0 z-40 bg-[#F4F5F7]/90 backdrop-blur-md border-b border-slate-200/70 transition-all"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 5 4.5 5 8c0 3 1.5 6 2 9 .4 2.4 1.5 5 5 5s4.6-2.6 5-5c.5-3 2-6 2-9 0-3.5-3-6-7-6z" />
                <path d="M12 2v7" />
              </svg>
            </div>
            <div className="leading-tight">
              <span suppressHydrationWarning className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate block max-w-[170px] sm:max-w-xs">
                {clinic.name}
              </span>
            </div>
          </div>

          {/* Center: Mindly Floating Pill Nav (Services · How It Works · About) */}
          <nav className="hidden md:flex items-center bg-white/80 backdrop-blur-md border border-slate-200/90 rounded-full p-1 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <button
              onClick={() => scrollToSection('services-section')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {t.servicesNav}
            </button>
            <button
              onClick={() => scrollToSection('process-section')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {t.howItWorksNav}
            </button>
            <button
              onClick={() => scrollToSection('about-section')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {t.aboutNav}
            </button>
          </nav>

          {/* Right: Language Pill Dropdown + "Book" Pill Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Language Switcher Pill */}
            <div ref={langMenuRef} className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-all shadow-2xs cursor-pointer"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-xs font-bold">
                  {lang === 'en' ? 'EN' : lang === 'am' ? 'አማ' : 'ORO'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-1 z-50 text-xs animate-spring-pop">
                  <button
                    onClick={() => {
                      setLang('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl font-semibold flex items-center justify-between ${lang === 'en' ? 'bg-slate-100 text-[#1E50FF]' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>English</span>
                    {lang === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setLang('am');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl font-semibold flex items-center justify-between font-amharic ${lang === 'am' ? 'bg-slate-100 text-[#1E50FF]' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>አማርኛ</span>
                    {lang === 'am' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => {
                      setLang('om');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl font-semibold flex items-center justify-between ${lang === 'om' ? 'bg-slate-100 text-[#1E50FF]' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>Afaan Oromoo</span>
                    {lang === 'om' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Mindly-style High-Contrast "Book" CTA Pill */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="inline-flex items-center justify-center gap-1 px-4 sm:px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{t.bookBtn}</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl text-slate-700 hover:bg-white border border-slate-200"
              aria-label="Toggle Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 text-xs font-bold text-slate-700">
            <button onClick={() => scrollToSection('services-section')} className="block w-full text-left py-1.5 hover:text-[#1E50FF]">
              {t.servicesNav}
            </button>
            <button onClick={() => scrollToSection('process-section')} className="block w-full text-left py-1.5 hover:text-[#1E50FF]">
              {t.howItWorksNav}
            </button>
            <button onClick={() => scrollToSection('about-section')} className="block w-full text-left py-1.5 hover:text-[#1E50FF]">
              {t.aboutNav}
            </button>
          </div>
        )}
      </header>

      {/* --------------------------------------------------------------------------- */}
      {/* 2. HERO SECTION (GSAP Orchestrated Animation)                               */}
      {/* --------------------------------------------------------------------------- */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Trust Badge */}
              <div
                ref={heroBadgeRef}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs"
              >
                <div className="flex items-center text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {t.heroBadge}
                </span>
              </div>

              {/* High-Contrast Bold Headline */}
              <h1
                ref={heroHeadingRef}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]"
              >
                {t.heroH1Pre}{' '}
                <span className="text-[#1E50FF] inline-block">
                  {t.heroH1Highlight}
                </span>
              </h1>

              {/* Subtitle */}
              <p
                ref={heroSubRef}
                className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed"
              >
                {t.heroSub}
              </p>

              {/* Dual Action CTAs */}
              <div
                ref={heroCtasRef}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.bookBtn}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('services-section')}
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  <span>{t.exploreServices}</span>
                </button>
              </div>

              {/* Micro Trust Indicators */}
              <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-slate-500 font-medium border-t border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Instant SMS confirmation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E50FF]" />
                  <span>Telebirr & CBE Cashless POS</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Universal Shared Dental Technology & Care */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                
                {/* Operatory Visual Card */}
                <div
                  ref={heroImageCardRef}
                  className="rounded-3xl overflow-hidden border-4 border-white shadow-xl aspect-[4/3] sm:aspect-[16/12] bg-slate-200"
                >
                  <img
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80"
                    alt="Clinical Operatory Standard"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Experience Chip (Continuous GSAP float) */}
                <div
                  ref={floatingBadge1Ref}
                  className="absolute -top-3 -left-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    15+
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.yearsExpBadge}</p>
                    <p className="text-[10px] text-slate-400">Clinical Standards</p>
                  </div>
                </div>

                {/* Floating Satisfaction Chip (Continuous GSAP float) */}
                <div
                  ref={floatingBadge2Ref}
                  className="absolute -bottom-3 -right-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#1E50FF]/10 text-[#1E50FF] flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.satisfactionBadge}</p>
                    <p className="text-[10px] text-slate-400">Verified Patients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 3. REPEATING ROYAL BLUE RIBBON                                             */}
      {/* --------------------------------------------------------------------------- */}
      <div className="w-full bg-[#1E50FF] text-white py-3 overflow-hidden select-none shadow-xs">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {[1, 2, 3].map((rep) => (
            <React.Fragment key={rep}>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Stethoscope className="w-3.5 h-3.5 text-cyan-200" />
                <span>General Dentistry</span>
              </div>
              <Sparkles className="w-3 h-3 text-white/40" />

              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Teeth Whitening</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-white/40" />

              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-200" />
                <span>Dental Implants</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-white/40" />

              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-cyan-200" />
                <span>Dental Sealants</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-white/40" />

              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <HeartHandshake className="w-3.5 h-3.5 text-cyan-200" />
                <span>Emergency Care</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-white/40" />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* 4. ABOUT SECTION                                                            */}
      {/* --------------------------------------------------------------------------- */}
      <section id="about-section" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden border-4 border-slate-100 shadow-lg aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80"
                  alt="Clinical Consultation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <span suppressHydrationWarning className="text-xs font-bold text-[#1E50FF] uppercase tracking-wider">
                {clinic.name}
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.aboutClinicTitle}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                {t.aboutClinicDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E50FF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Modern Digital 3D Imaging</h4>
                    <p className="text-[11px] text-slate-500">Low-radiation imaging and clear diagnostics.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E50FF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Gentle Chairside Manner</h4>
                    <p className="text-[11px] text-slate-500">Comfortable, anxiety-free appointments.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E50FF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Sterilization Protocols</h4>
                    <p className="text-[11px] text-slate-500">Strict hospital-grade hygiene controls.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1E50FF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Telebirr & CBE Cashless</h4>
                    <p className="text-[11px] text-slate-500">Convenient payment methods at reception.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 5. SERVICES GRID (GSAP Cascading Reveal - Zero Fees Listed)                 */}
      {/* --------------------------------------------------------------------------- */}
      <section id="services-section" className="py-20 bg-[#F4F5F7] border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#1E50FF] uppercase tracking-wider">
              {t.servicesTitle}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Care Tailored to Your Smile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.servicesSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinic.services.map((service, index) => {
              const servicePhotos = [
                'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80',
              ];
              const photo = servicePhotos[index % servicePhotos.length];

              return (
                <div
                  key={service.id}
                  className="gsap-service-card bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-40 overflow-hidden bg-slate-100">
                      <img
                        src={photo}
                        alt={service.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center shadow-xs">
                        <Stethoscope className="w-4 h-4" />
                      </div>

                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-slate-800 shadow-2xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{service.durationMinutes} min</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1E50FF] transition-colors">
                        {lang === 'am' ? service.nameAm : service.nameEn}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleSelectService(service.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-950 hover:text-white text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80"
                    >
                      <span>{t.bookTreatment}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 6. HOW IT WORKS (GSAP Staggered Reveal)                                     */}
      {/* --------------------------------------------------------------------------- */}
      <section id="process-section" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#1E50FF] uppercase tracking-wider">
              {t.howItWorksTitle}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Straightforward Clinical Care
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.howItWorksSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="gsap-step-card bg-[#F4F5F7] p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.step1Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.step1Desc}</p>
            </div>

            <div className="gsap-step-card bg-[#F4F5F7] p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.step2Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.step2Desc}</p>
            </div>

            <div className="gsap-step-card bg-[#F4F5F7] p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.step3Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.step3Desc}</p>
            </div>

            <div className="gsap-step-card bg-[#F4F5F7] p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs">
                04
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t.step4Title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{t.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 7. PATIENT OUTCOMES (Doctor Portal Light Green Card Styling + GSAP)         */}
      {/* --------------------------------------------------------------------------- */}
      <section id="outcomes-section" className="py-20 bg-[#F4F5F7] border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="bg-gradient-to-b from-[#F2FBF6] via-white to-[#F2FBF6] rounded-3xl p-7 sm:p-11 border border-emerald-200/90 shadow-sm relative overflow-hidden">
            
            <div className="max-w-xl mb-9 space-y-2 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.patientJourneysTitle}</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Verified Clinical Outcomes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.patientJourneysSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="gsap-outcome-card bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Aesthetic Whitening
                    </span>
                    <span className="text-xs text-slate-400 font-mono">3 Sessions</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{t.case1Title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed italic">{t.case1Quote}</p>
                  <div className="rounded-xl overflow-hidden aspect-[16/9] border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80"
                      alt="Whitening Outcome"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center cursor-pointer"
                >
                  {t.bookBtn}
                </button>
              </div>

              <div className="gsap-outcome-card bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E50FF] border border-blue-200 text-xs font-bold">
                      Implant & Restoration
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Permanent</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{t.case2Title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed italic">{t.case2Quote}</p>
                  <div className="rounded-xl overflow-hidden aspect-[16/9] border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80"
                      alt="Implant Outcome"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center cursor-pointer"
                >
                  {t.bookBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 8. INTERACTIVE BEFORE & AFTER SLIDER                                        */}
      {/* --------------------------------------------------------------------------- */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <span className="text-xs font-bold text-[#1E50FF] uppercase tracking-wider">
              Visual Results
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Drag to Inspect Smile Alignment
            </h2>
            <p className="text-xs text-slate-400">
              Slide left and right to inspect the clinical difference.
            </p>
          </div>

          <div
            ref={sliderContainerRef}
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
            className="relative max-w-2xl mx-auto aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden shadow-xl border-4 border-slate-100 select-none cursor-ew-resize bg-slate-200"
          >
            <img
              src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1000&auto=format&fit=crop&q=80"
              alt="After Clinical Care"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
              AFTER
            </div>

            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1000&auto=format&fit=crop&q=80"
                alt="Before Clinical Care"
                className="absolute inset-y-0 left-0 max-w-none h-full object-cover filter brightness-90"
                style={{ width: sliderContainerRef.current ? `${sliderContainerRef.current.clientWidth}px` : '100%' }}
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                BEFORE
              </div>
            </div>

            <div
              className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg border border-white text-xs font-bold pointer-events-auto">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 9. SPECIALIZED CLINICAL DEPARTMENTS (GSAP Staggered Reveal)                  */}
      {/* --------------------------------------------------------------------------- */}
      <section id="specialties-section" className="py-20 bg-[#F4F5F7] border-t border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-bold text-[#1E50FF] uppercase tracking-wider">
              {t.specialtiesTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Comprehensive Oral Health
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.specialtiesSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="gsap-dept-card bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E50FF] flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Preventative & Hygiene</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Routine cleanings, fluoride therapy, and calculus prevention.
              </p>
            </div>

            <div className="gsap-dept-card bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Restorative & Endo</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Root canal preservation, composite restorations, and core build-ups.
              </p>
            </div>

            <div className="gsap-dept-card bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Aesthetics & Whitening</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                In-office cold light laser whitening and aesthetic smile makeovers.
              </p>
            </div>

            <div className="gsap-dept-card bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Implants & Surgery</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Titanium fixtures, zirconia crowns, and gentle surgical extractions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 10. DIRECT HIGH-CONVERSION BOOKING ACTION (GSAP Zoom Effect)                */}
      {/* --------------------------------------------------------------------------- */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="gsap-book-card bg-gradient-to-r from-blue-50 via-white to-emerald-50 rounded-3xl p-7 sm:p-11 border border-slate-200 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E50FF]/10 text-[#1E50FF] text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Online Reservation</span>
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.reserveVisitTitle}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
                {t.reserveVisitSub}
              </p>

              <div className="pt-1">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t.directReserveBtn}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.hoursTitle}
                </h4>
                <p className="text-xs font-semibold text-slate-800">{clinic.openHours}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {t.emergencyHotlineTitle}
                </h4>
                <a
                  href={`tel:${clinic.phone.replace(/\s+/g, '')}`}
                  className="font-mono text-sm font-bold text-slate-900 block hover:text-[#1E50FF]"
                >
                  {clinic.phone}
                </a>
                <p className="text-[10px] text-slate-400">Direct clinic reception line</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 11. FAQ ACCORDION (GSAP Staggered Reveal)                                   */}
      {/* --------------------------------------------------------------------------- */}
      <section id="faq-section" className="py-20 bg-[#F4F5F7] border-t border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold text-[#1E50FF] uppercase tracking-wider">
              {t.faqTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Clear Answers Before Your Visit
            </h2>
            <p className="text-xs text-slate-400">
              {t.faqSub}
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                q: 'How quickly will my appointment be confirmed?',
                a: 'Immediately. Once you pick your treatment and time slot, our system sends an instant confirmation SMS directly to your phone number.',
              },
              {
                q: 'What payment options do you support at reception?',
                a: 'We accept Telebirr merchant payments, CBE Birr, local debit cards, and physical cash. You only settle after your clinical procedure is completed.',
              },
              {
                q: 'Is ultrasonic scaling or teeth cleaning painful?',
                a: 'Not at all. We utilize gentle ultrasonic scalers with fine warm-water irrigation that removes plaque without scratching enamel.',
              },
              {
                q: 'Can I reschedule if my schedule changes?',
                a: 'Yes, absolutely. You can reschedule anytime without penalty by calling reception or replying to your booking SMS.',
              },
            ].map((faq, index) => {
              const isExpanded = expandedFaqIndex === index;
              return (
                <div
                  key={index}
                  className="gsap-faq-item border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-[#1E50FF] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------- */}
      {/* 12. CLEAN FOOTER (Subtle Sinna AI Attribution)                             */}
      {/* --------------------------------------------------------------------------- */}
      <footer className="bg-slate-950 text-slate-400 pt-14 pb-10 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="space-y-2.5">
              <span suppressHydrationWarning className="text-sm font-extrabold text-white block">
                {clinic.name}
              </span>
              <p className="text-slate-400 leading-relaxed">
                Hospital-grade clinical dentistry in Addis Ababa. Gentle chairside manner and modern comfort.
              </p>
              <p suppressHydrationWarning className="text-slate-300 font-mono">{clinic.location}</p>
            </div>

            <div className="space-y-2">
              <p className="text-white font-bold text-xs uppercase tracking-wider">Working Hours</p>
              <p suppressHydrationWarning className="text-slate-300">{clinic.openHours}</p>
              <div className="pt-1">
                <p className="text-emerald-400 font-bold">Reception Hotline:</p>
                <p suppressHydrationWarning className="font-mono text-white text-sm">{clinic.phone}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-white font-bold text-xs uppercase tracking-wider">Quick Reservation</p>
              <p className="text-slate-400">
                Book your examination in under a minute with instant SMS confirmation.
              </p>
              <button
                onClick={() => setIsBookingOpen(true)}
                className="px-4 py-2 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                {t.bookBtn}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p suppressHydrationWarning>© 2026 {clinic.name}. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E50FF]" />
              <span>{t.poweredBy}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* --------------------------------------------------------------------------- */}
      {/* 13. MOBILE PERSISTENT BOTTOM CONVERSION DOCK                                */}
      {/* --------------------------------------------------------------------------- */}
      <div className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="text-xs leading-tight">
            <p suppressHydrationWarning className="font-bold text-slate-900 truncate max-w-[170px]">{clinic.name}</p>
            <p className="text-[10px] text-slate-400">{t.openToday}</p>
          </div>
        </div>

        <button
          onClick={() => setIsBookingOpen(true)}
          className="px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-sm whitespace-nowrap flex items-center gap-1 cursor-pointer"
        >
          <span>{t.bookBtn}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* 14. SINNA AI PATIENT COPILOT (Grounded in Clinic Services & Multilingual)   */}
      {/* --------------------------------------------------------------------------- */}
      <SinnaAICopilot
        mode="patient"
        triggerPosition="landing-page"
        currentLang={lang as ChatLanguage}
        onLanguageChange={(newLang) => setLang(newLang as BookingLang)}
      />
    </div>
  );
}
