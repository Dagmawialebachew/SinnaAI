export type BookingLang = 'en' | 'am' | 'om';

export interface BookingTranslations {
  langCode: BookingLang;
  langLabel: string;
  badgeVerified: string;
  openToday: string;
  depositBadge: string;
  bookIn60Sec: string;
  smsGuarantee: string;
  servicesTitle: string;
  officialRates: string;
  dentistsTitle: string;
  locationHoursTitle: string;
  directionsBtn: string;
  quickBookTitle: string;
  quickBookSubtitle: string;
  step1Treatment: string;
  step2Time: string;
  step3Details: string;
  step4Confirmed: string;
  selectDoctor: string;
  availableDays: string;
  selectDate: string;
  availableSlots: string;
  bookedSlot: string;
  slotDoctorBusy: string;
  slotChairsFull: string;
  selectAnyDate: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneHelp: string;
  paymentRail: string;
  telebirrPay: string;
  cbePay: string;
  holdTimeNotice: string;
  confirmBtn: string;
  continueBtn: string;
  backBtn: string;
  instantBookingSuccess: string;
  reservationId: string;
  appointmentSummary: string;
  addToCalendar: string;
  returnHome: string;
  contactSupport: string;
  durationMin: string;
  ratingLabel: string;
  reviewsLabel: string;
  telebirrDepositNote: string;
  ussdPrompt: string;
  otpPrompt: string;
  verifyingPayment: string;
  depositReceived: string;
  switchLang: string;
  doctorLead: string;
  doctorSurgeon: string;
  clinicAbout: string;
  clinicTagline: string;
}

export const BOOKING_DICTIONARY: Record<BookingLang, BookingTranslations> = {
  en: {
    langCode: 'en',
    langLabel: 'English',
    badgeVerified: 'Verified Clinical Practice',
    openToday: 'Open Today until 7:00 PM',
    depositBadge: '300 ETB Deposit via Telebirr',
    bookIn60Sec: 'Book Appointment in 60s',
    smsGuarantee: 'Instant AfroMessage SMS confirmation sent to your phone',
    servicesTitle: 'Services & Transparent Pricing',
    officialRates: 'Official Ministry-Compliant Rates',
    dentistsTitle: 'Attending Dental Specialists',
    locationHoursTitle: 'Clinic Location & Schedule',
    directionsBtn: 'Open in Google Maps',
    quickBookTitle: 'Schedule Your Appointment',
    quickBookSubtitle: 'Direct chairside booking with instantaneous SMS confirmation',
    step1Treatment: '1. Procedure',
    step2Time: '2. Date & Time',
    step3Details: '3. Patient Details',
    step4Confirmed: '4. Confirmed',
    selectDoctor: 'Select Attending Specialist',
    availableDays: 'Available Days',
    selectDate: 'Select Date',
    availableSlots: 'Available Operatory Slots',
    bookedSlot: 'Booked',
    slotDoctorBusy: 'Doctor Occupied',
    slotChairsFull: 'Chairs Full',
    selectAnyDate: 'Or choose any upcoming date',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g. Abebe Kebede',
    phoneLabel: 'Mobile Phone (Telebirr / CBE)',
    phonePlaceholder: '+251 91 122 3344',
    phoneHelp: 'Confirmation SMS and USSD push will be sent to this number',
    paymentRail: 'Payment Rail for 300 ETB Deposit',
    telebirrPay: 'Telebirr SuperApp / USSD',
    cbePay: 'CBE Birr',
    holdTimeNotice: 'Slot held for 09:59 minutes',
    confirmBtn: 'Confirm Reservation & Pay Deposit',
    continueBtn: 'Continue',
    backBtn: 'Back',
    instantBookingSuccess: 'Appointment Confirmed & Chair Reserved!',
    reservationId: 'Booking Reference',
    appointmentSummary: 'Appointment Summary',
    addToCalendar: 'Add to Calendar',
    returnHome: 'Back to Clinic Portal',
    contactSupport: 'Call Clinic Reception',
    durationMin: 'min',
    ratingLabel: 'Rating',
    reviewsLabel: 'Verified Reviews',
    telebirrDepositNote: 'Deposit will be credited toward your final clinic receipt.',
    ussdPrompt: 'Sending Telebirr USSD prompt to your handset...',
    otpPrompt: 'Authorizing payment via Ethio Telecom rail...',
    verifyingPayment: 'Confirming chair reservation...',
    depositReceived: 'Deposit Verified',
    switchLang: 'Language',
    doctorLead: 'Lead Specialist & Orthodontist (DDS, 11 yrs exp)',
    doctorSurgeon: 'Oral Surgeon & Implantologist (9 yrs exp)',
    clinicAbout: 'Boutique dental surgery & aesthetic practice located at Morning Star Mall, Bole. Equipped with German rotary endodontics, digital intraoral imaging, and Class-B autoclave sterilization.',
    clinicTagline: 'Comprehensive Dental Care & Specialized Oral Surgery in Addis Ababa',
  },
  am: {
    langCode: 'am',
    langLabel: 'አማርኛ',
    badgeVerified: 'የተረጋገጠ የጥርስ ክሊኒክ',
    openToday: 'ዛሬ እስከ ምሽቱ 1፡00 ክፍት ነው',
    depositBadge: '300 ብር ቅድመ ክፍያ በቴሌብር',
    bookIn60Sec: 'ቀጠሮ በ 60 ሰከንድ ይያዙ',
    smsGuarantee: 'ወዲያውኑ በአፍሮሜሴጅ (AfroMessage) የኤስኤምኤስ ማረጋገጫ ይደርስዎታል',
    servicesTitle: 'የህክምና አገልግሎቶች እና ግልጽ ዋጋ',
    officialRates: 'በጤና ጥበቃ የተፈቀደ መደበኛ ዋጋ',
    dentistsTitle: 'ስፔሻሊስት የጥርስ ሀኪሞች',
    locationHoursTitle: 'አድራሻ እና የስራ ሰዓት',
    directionsBtn: 'በጉግል ካርታ (Google Maps) ይመልከቱ',
    quickBookTitle: 'የጥርስ ህክምና ቀጠሮዎን ይያዙ',
    quickBookSubtitle: 'ቀጥታ ወንበር ቦታ ማስያዝ እና ፈጣን የኤስኤምኤስ ማረጋገጫ',
    step1Treatment: '1. የህክምና አይነት',
    step2Time: '2. ቀን እና ሰዓት',
    step3Details: '3. የባለጉዳይ መረጃ',
    step4Confirmed: '4. ተረጋግጧል',
    selectDoctor: 'የሚፈልጉትን ሀኪም ይምረጡ',
    availableDays: 'የስራ ቀናት',
    selectDate: 'ቀን ይምረጡ',
    availableSlots: 'ክፍት የቀጠሮ ሰዓቶች',
    bookedSlot: 'ተይዟል',
    slotDoctorBusy: 'ሀኪሙ ተይዟል',
    slotChairsFull: 'ወንበር ሙሉ ነው',
    selectAnyDate: 'ወይም ሌላ ማንኛውንም ቀን ይምረጡ',
    fullNameLabel: 'ሙሉ ስም',
    fullNamePlaceholder: 'ለምሳሌ፡ አበበ ከበደ',
    phoneLabel: 'ስልክ ቁጥር (ቴሌብር / CBE)',
    phonePlaceholder: '+251 91 122 3344',
    phoneHelp: 'የማረጋገጫ መልእክት እና የክፍያ ጥያቄ ወደዚህ ስልክ ይላካል',
    paymentRail: 'የ 300 ብር ቅድመ ክፍያ አማራጭ',
    telebirrPay: 'ቴሌብር (Telebirr)',
    cbePay: 'ሲቢኢ ብር (CBE Birr)',
    holdTimeNotice: 'ሰዓቱ ለ 10 ደቂቃ ተጠብቆ ይቆያል',
    confirmBtn: 'ቀጠሮውን አረጋግጥ እና ቅድመ ክፍያ ፈጽም',
    continueBtn: 'ቀጥል',
    backBtn: 'ተመለስ',
    instantBookingSuccess: 'ቀጠሮዎ ተረጋግጧል! ወንበር ተይዞልዎታል',
    reservationId: 'የቀጠሮ መለያ ቁጥር',
    appointmentSummary: 'የቀጠሮ ማጠቃለያ',
    addToCalendar: 'ቀን መቁጠሪያ ላይ መዝግብ',
    returnHome: 'ወደ መነሻ ገጽ',
    contactSupport: 'ለክሊኒኩ ይደውሉ',
    durationMin: 'ደቂቃ',
    ratingLabel: 'ደረጃ',
    reviewsLabel: 'የተጠቃሚ ምስክርነቶች',
    telebirrDepositNote: 'ቅድመ ክፍያው ከጠቅላላ የህክምና ሂሳብዎ ላይ ይቀነሳል።',
    ussdPrompt: 'ወደ ስልክዎ የቴሌብር ክፍያ ጥያቄ እየተላከ ነው...',
    otpPrompt: 'በኢትዮ ቴሌኮም በኩል ክፍያው እየተረጋገጠ ነው...',
    verifyingPayment: 'ቀጠሮው እየተመዘገበ ነው...',
    depositReceived: 'ቅድመ ክፍያ ተረጋግጧል',
    switchLang: 'ቋንቋ',
    doctorLead: 'ዋና የጥርስ ህክምና ስፔሻሊስት (11 ዓመት ልምድ)',
    doctorSurgeon: 'የአፍ እና የጥርስ ቀዶ ጥገና ስፔሻሊስት (9 ዓመት ልምድ)',
    clinicAbout: 'ቦሌ ዴንታል ስቱዲዮ በቦሌ መድኃኔዓለም ሞርኒንግ ስታር ሞል 3ኛ ፎቅ ላይ የሚገኝ የተሟላ የጥርስ ህክምና እና የቀዶ ጥገና ማዕከል ነው። በጀርመን ሮተሪ ቴክኖሎጂ፣ ዲጂታል ኤክስሬይ እና ጥብቅ የስታንዳርድ ማምከኛ መሳሪያዎች የተሟላ።',
    clinicTagline: 'ዘመናዊ እና የተሟላ የጥርስ ህክምናና የቀዶ ጥገና ማዕከል — ቦሌ መድኃኔዓለም',
  },
  om: {
    langCode: 'om',
    langLabel: 'Afaan Oromoo',
    badgeVerified: "Kilinika Ilkaanii Mirkanaa'e",
    openToday: "Har'a hanga sa'aatii 1:00 (7:00 PM) banaadha",
    depositBadge: 'Kaffaltii Duraa 300 ETB Telebirriin',
    bookIn60Sec: 'Sekondii 60 Keessatti Yeroo Qabadhaa',
    smsGuarantee: 'Mirkaneessi ergaa gabaabaa (SMS AfroMessage) yeruma san bilbila keessanitti ergama',
    servicesTitle: "Tajaajiloota fi Gatii Ifaa Ta'e",
    officialRates: "Gatii Seera Qabeessa Mirkanaa'e",
    dentistsTitle: 'Ogeessota Ilkaanii Keenya',
    locationHoursTitle: "Teessoo fi Sa'aatii Hojii",
    directionsBtn: 'Kaartaa Google irratti bani',
    quickBookTitle: 'Beellama Yaala Ilkaanii Qabadhaa',
    quickBookSubtitle: "Teessuma ilkaanii qabachuu fi ergaa SMS hatattamaa",
    step1Treatment: '1. Gosa Yaalaa',
    step2Time: "2. Guyyaa fi Sa'aatii",
    step3Details: '3. Odeeffannoo Dhukkubsataa',
    step4Confirmed: "4. Mirkanaa'eera",
    selectDoctor: 'Ogeessa Yaalaa Filadhaa',
    availableDays: 'Guyyoota Hojii',
    selectDate: 'Guyyaa Filadhaa',
    availableSlots: "Sa'aatiiwwan Banaa Jiran",
    bookedSlot: 'Qabameera',
    slotDoctorBusy: 'Ogeessi Hojii Qaba',
    slotChairsFull: 'Teessumni Guuteera',
    selectAnyDate: 'Yookiin guyyaa biraa filadhaa',
    fullNameLabel: 'Maqaa Guutuu',
    fullNamePlaceholder: 'fkn. Tolasaa Raggaasaa',
    phoneLabel: 'Lakkoofsa Bilbilaa (Telebirr / CBE)',
    phonePlaceholder: '+251 91 122 3344',
    phoneHelp: 'Ergaan mirkaneessaa fi kaffaltiin bilbila kanaan ergama',
    paymentRail: 'Filannoo Kaffaltii Duraa 300 ETB',
    telebirrPay: 'Telebirr',
    cbePay: 'CBE Birr',
    holdTimeNotice: "Sa'aatiin daqiiqaa 10f isiniif eegama",
    confirmBtn: 'Beellama Mirkaneessi fi Kaffali',
    continueBtn: 'Itti Fufi',
    backBtn: 'Duubatti',
    instantBookingSuccess: "Beellamni Keessan Mirkanaa'eera! Teessumni Qabameera",
    reservationId: 'Koodii Beellamaa',
    appointmentSummary: 'Cuunfaa Beellamaa',
    addToCalendar: 'Kalaandarii irratti galchi',
    returnHome: 'Gara Fuula Jalqabaatti',
    contactSupport: 'Kilinikatti Bilbilaa',
    durationMin: 'daq',
    ratingLabel: 'Sadarkaa',
    reviewsLabel: 'Yaada Dhukkubsattootaa',
    telebirrDepositNote: "Kaffaltiin duraa gatii walii-galaa keessaa hir'ifama.",
    ussdPrompt: 'Gaaffiin kaffaltii Telebirr bilbila keessanitti ergamaa jira...',
    otpPrompt: "Sarara Itiyootelekoomiin kaffaltiin mirkanaa'aa jira...",
    verifyingPayment: "Beellamni galmaa'aa jira...",
    depositReceived: "Kaffaltiin Mirkanaa'eera",
    switchLang: 'Afaan',
    doctorLead: 'Ogeessa Olaanaa Ilkaanii (DDS, Muuxannoo Waggaa 11)',
    doctorSurgeon: 'Surgeoniifi Ogeessa Qorannoo Ilkaanii (Muuxannoo Waggaa 9)',
    clinicAbout: "Bole Dental Studio giddugala yaala ilkaanii fi baqaqsanii yaaluu Finfinnee, gamoo Morning Star Mall irratti argamudha. Teeknooloojii ammayyaa, raajii dijitaalaa fi qulqullina sadarkaa olaanaatiin tajaajila kenna.",
    clinicTagline: "Giddugala Yaala Ilkaanii Ammayyaa fi Baqaqsanii Yaaluu Finfinneetti",
  },
};

export interface LocalizedService {
  id: string;
  name: Record<BookingLang, string>;
  description: Record<BookingLang, string>;
  durationMinutes: number;
  priceETB: number;
  depositRequired: boolean;
  depositAmountETB: number;
}

export const LOCALIZED_SERVICES: LocalizedService[] = [
  {
    id: 'srv-cleaning',
    name: {
      en: 'Routine Cleaning & Scaling',
      am: 'መደበኛ የጥርስ ማጽዳት እና ፖሊሽ',
      om: 'Qulqulleessuu fi Soofuu Ilkaanii',
    },
    description: {
      en: 'Ultrasonic calculus removal, stain polishing, and full gum health inspection.',
      am: 'በአልትራሶኒክ ድንጋይ ማጽዳት፣ ቆሻሻ ማስወገድ እና የድድ ጤንነት ምርመራ።',
      om: "Dhagaa ilkaanii al giraasoonikiin haxaa'uu fi fayyaa lafee ilkaanii qorachuu.",
    },
    durationMinutes: 45,
    priceETB: 1500,
    depositRequired: true,
    depositAmountETB: 300,
  },
  {
    id: 'srv-emergency',
    name: {
      en: 'Emergency Pain Relief & Exam',
      am: 'አስቸኳይ የጥርስ ህመም ማስታገሻ እና ምርመራ',
      om: "Yaala Ariifachiisaa fi Dhukkubbii Hir'isuu",
    },
    description: {
      en: 'Immediate diagnostic assessment, intraoral digital radiograph, and acute pulpal pain relief.',
      am: 'አፋጣኝ የህመም ምርመራ፣ ዲጂታል ኤክስሬይ እና የጥርስ ነርቭ ህመም ማስታገሻ ህክምና።',
      om: 'Qorannoo ariifachiisaa, raajii dijitaalaa fi dhukkubbii narvii ilkaanii dhaabuu.',
    },
    durationMinutes: 30,
    priceETB: 1200,
    depositRequired: false,
    depositAmountETB: 0,
  },
  {
    id: 'srv-rootcanal',
    name: {
      en: 'Single-Visit Root Canal Treatment',
      am: 'የጥርስ ስር ህክምና (Root Canal)',
      om: 'Yaala Hiddamoo Ilkaanii (Root Canal)',
    },
    description: {
      en: 'Advanced rotary endodontics preserving infected teeth with biocompatible sealing.',
      am: 'የተጎዳን ጥርስ ሳይነቀል በዘመናዊ የሮተሪ ነርቭ ህክምና ማዳን።',
      om: 'Ilkaan miidhame osoo hin buqqisin teeknooloojii ammayyaatiin yaaluun tursiisuu.',
    },
    durationMinutes: 90,
    priceETB: 6000,
    depositRequired: true,
    depositAmountETB: 1000,
  },
  {
    id: 'srv-whitening',
    name: {
      en: 'In-Office Laser Teeth Whitening',
      am: 'በክሊኒክ ውስጥ በሌዘር ጥርስ ማንጣት',
      om: 'Ilkaan Addeessuu Leezariin Kilinikatti',
    },
    description: {
      en: 'Professional medical laser whitening achieving up to 6 shades lighter in a single chair session.',
      am: 'በአንድ ዙር ህክምና እስከ 6 ደረጃ ድረስ የጠቆረ ጥርስን በሌዘር ነጭ ማድረግ።',
      om: "Yeroo tokkoon ilkaan sadarkaa 6n akka ifee addaatu gochuu.",
    },
    durationMinutes: 60,
    priceETB: 8500,
    depositRequired: true,
    depositAmountETB: 1500,
  },
];
