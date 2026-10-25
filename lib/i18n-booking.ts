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
    badgeVerified: 'Verified Dental Clinic',
    openToday: 'Open Today until 7:00 PM',
    depositBadge: '300 ETB Deposit via Telebirr',
    bookIn60Sec: 'Book in 60 seconds',
    smsGuarantee: 'Instant SMS confirmation sent to your phone',
    servicesTitle: 'Dental Services & Pricing',
    officialRates: 'Clear & Transparent Pricing',
    dentistsTitle: 'Attending Dentists',
    locationHoursTitle: 'Location & Working Hours',
    directionsBtn: 'Open in Google Maps',
    quickBookTitle: 'Book an Appointment',
    quickBookSubtitle: 'Choose your treatment and reserve your chair in seconds',
    step1Treatment: '1. Treatment',
    step2Time: '2. Date & Time',
    step3Details: '3. Your Info',
    step4Confirmed: '4. Confirmed',
    selectDoctor: 'Select your preferred doctor',
    availableDays: 'Working Days',
    selectDate: 'Select Date',
    availableSlots: 'Available Time Slots',
    bookedSlot: 'Booked',
    slotDoctorBusy: 'Doctor is busy',
    slotChairsFull: 'Chairs are full',
    selectAnyDate: 'Choose another date',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g. Abebe Kebede',
    phoneLabel: 'Phone Number (Telebirr / CBE)',
    phonePlaceholder: '+251 91 122 3344',
    phoneHelp: 'Confirmation SMS will be sent to this phone number',
    paymentRail: 'Payment Method for 300 ETB Deposit',
    telebirrPay: 'Telebirr (USSD *127#)',
    cbePay: 'CBE Birr',
    holdTimeNotice: 'Your selected slot is reserved for 10 minutes',
    confirmBtn: 'Confirm Appointment',
    continueBtn: 'Continue',
    backBtn: 'Back',
    instantBookingSuccess: 'Your Appointment is Confirmed!',
    reservationId: 'Booking Reference',
    appointmentSummary: 'Appointment Summary',
    addToCalendar: 'Add to Calendar',
    returnHome: 'Back to Home',
    contactSupport: 'Call Clinic Reception',
    durationMin: 'min',
    ratingLabel: 'Rating',
    reviewsLabel: 'Verified Reviews',
    telebirrDepositNote: 'Deposit is credited directly toward your final clinic bill.',
    ussdPrompt: 'Sending Telebirr payment prompt to your phone...',
    otpPrompt: 'Verifying payment with Ethio Telecom...',
    verifyingPayment: 'Confirming your appointment...',
    depositReceived: 'Deposit Confirmed',
    switchLang: 'Language',
    doctorLead: 'Lead Dental Specialist (11 yrs experience)',
    doctorSurgeon: 'Oral Surgeon & Implantologist (9 yrs experience)',
    clinicAbout: 'Boutique modern dental clinic at Morning Star Mall, Bole Medhanialem. Providing gentle, high-precision dental care, digital radiography, and hygienic modern operatories.',
    clinicTagline: 'Modern, gentle dental care in Addis Ababa',
  },
  am: {
    langCode: 'am',
    langLabel: 'አማርኛ',
    badgeVerified: 'የተረጋገጠ የጥርስ ክሊኒክ',
    openToday: 'ዛሬ እስከ ምሽቱ 1፡00 ክፍት ነው',
    depositBadge: '300 ብር ቅድመ ክፍያ በቴሌብር',
    bookIn60Sec: 'ቀጠሮ በ 1 ደቂቃ ውስጥ ይያዙ',
    smsGuarantee: 'የማረጋገጫ አጭር መልእክት (SMS) በስልክዎ ይደርስዎታል',
    servicesTitle: 'የጥርስ ህክምና አገልግሎቶች',
    officialRates: 'ግልጽ እና ተመጣጣኝ ዋጋ',
    dentistsTitle: 'የጥርስ ሀኪሞቻችን',
    locationHoursTitle: 'አድራሻ እና የስራ ሰዓት',
    directionsBtn: 'በጉግል ካርታ ይመልከቱ',
    quickBookTitle: 'የጥርስ ህክምና ቀጠሮ ይያዙ',
    quickBookSubtitle: 'የሚፈልጉትን ህክምና መርጠው በደቂቃዎች ውስጥ ቀጠሮዎን ያስይዙ',
    step1Treatment: '1. የህክምና አይነት',
    step2Time: '2. ቀን እና ሰዓት',
    step3Details: '3. የቀጠሮ መረጃ',
    step4Confirmed: '4. ተረጋግጧል',
    selectDoctor: 'የሚፈልጉትን ሀኪም ይምረጡ',
    availableDays: 'የስራ ቀናት',
    selectDate: 'ቀን ይምረጡ',
    availableSlots: 'ክፍት የቀጠሮ ሰዓቶች',
    bookedSlot: 'ተይዟል',
    slotDoctorBusy: 'ሀኪሙ ስራ ላይ ነው',
    slotChairsFull: 'ወንበር ተይዟል',
    selectAnyDate: 'ሌላ ቀን መምረጥ ከፈለጉ',
    fullNameLabel: 'ሙሉ ስም',
    fullNamePlaceholder: 'ለምሳሌ፡ አበበ ከበደ',
    phoneLabel: 'ስልክ ቁጥር (ቴሌብር / CBE)',
    phonePlaceholder: '+251 91 122 3344',
    phoneHelp: 'የቀጠሮ ማረጋገጫ መልእክት ወደዚህ ስልክ ይላካል',
    paymentRail: 'የ 300 ብር ቅድመ ክፍያ አማራጭ',
    telebirrPay: 'ቴሌብር (Telebirr)',
    cbePay: 'ሲቢኢ ብር (CBE Birr)',
    holdTimeNotice: 'የመረጡት ሰዓት ለ 10 ደቂቃ ተጠብቆ ይቆያል',
    confirmBtn: 'ቀጠሮውን አረጋግጥ',
    continueBtn: 'ቀጥል',
    backBtn: 'ተመለስ',
    instantBookingSuccess: 'ቀጠሮዎ ተረጋግጧል!',
    reservationId: 'የቀጠሮ መለያ',
    appointmentSummary: 'የቀጠሮ ማጠቃለያ',
    addToCalendar: 'ቀን መቁጠሪያ ላይ መዝግብ',
    returnHome: 'ወደ መነሻ ገጽ',
    contactSupport: 'ለክሊኒኩ ይደውሉ',
    durationMin: 'ደቂቃ',
    ratingLabel: 'ደረጃ',
    reviewsLabel: 'አስተያየቶች',
    telebirrDepositNote: 'ቅድመ ክፍያው ከጠቅላላ የህክምና ሂሳብዎ ላይ ይቀነሳል።',
    ussdPrompt: 'ወደ ስልክዎ የቴሌብር ክፍያ ጥያቄ እየተላከ ነው...',
    otpPrompt: 'በኢትዮ ቴሌኮም በኩል ክፍያው እየተረጋገጠ ነው...',
    verifyingPayment: 'ቀጠሮው እየተመዘገበ ነው...',
    depositReceived: 'ቅድመ ክፍያ ተረጋግጧል',
    switchLang: 'ቋንቋ',
    doctorLead: 'ዋና የጥርስ ህክምና ስፔሻሊስት (11 ዓመት ልምድ)',
    doctorSurgeon: 'የአፍ እና የጥርስ ቀዶ ጥገና ስፔሻሊስት (9 ዓመት ልምድ)',
    clinicAbout: 'ቦሌ ዴንታል ስቱዲዮ በቦሌ መድኃኔዓለም ሞርኒንግ ስታር ሞል 3ኛ ፎቅ ላይ የሚገኝ ዘመናዊ የጥርስ ህክምና ማዕከል ነው። በዘመናዊ የጥርስ ህክምና መሳሪያዎች፣ ዲጂታል ኤክስሬይ እና ንጽህናቸው በተጠበቁ ወንበሮች የታመነ ህክምና ይሰጣል።',
    clinicTagline: 'ዘመናዊ እና የተሟላ የጥርስ ህክምና — ቦሌ መድኃኔዓለም',
  },
  om: {
    langCode: 'om',
    langLabel: 'Afaan Oromoo',
    badgeVerified: "Kilinika Ilkaanii Mirkanaa'e",
    openToday: "Har'a hanga sa'aatii 1:00 (7:00 PM) banaadha",
    depositBadge: 'Kaffaltii Duraa 300 ETB Telebirriin',
    bookIn60Sec: 'Daqiiqaa 1 Keessatti Beellama Qabadhaa',
    smsGuarantee: 'Ergaan mirkaneessaa (SMS) yeruma san bilbila keessanitti ergama',
    servicesTitle: 'Tajaajiloota Yaala Ilkaanii',
    officialRates: 'Gatii Ifaa fi Madaalawaa',
    dentistsTitle: 'Ogeessota Ilkaanii Keenya',
    locationHoursTitle: "Teessoo fi Sa'aatii Hojii",
    directionsBtn: 'Kaartaa Google irratti bani',
    quickBookTitle: 'Beellama Yaala Ilkaanii Qabadhaa',
    quickBookSubtitle: 'Yaala barbaaddan filachuun beellama keessan daqiiqaa muraasa keessatti qabadhaa',
    step1Treatment: '1. Gosa Yaalaa',
    step2Time: "2. Guyyaa fi Sa'aatii",
    step3Details: '3. Odeeffannoo Beellamaa',
    step4Confirmed: "4. Mirkanaa'eera",
    selectDoctor: 'Ogeessa yaalaa filadhaa',
    availableDays: 'Guyyoota Hojii',
    selectDate: 'Guyyaa filadhaa',
    availableSlots: "Sa'aatiiwwan banaa jiran",
    bookedSlot: 'Qabameera',
    slotDoctorBusy: 'Ogeessi hojii qaba',
    slotChairsFull: 'Teessumni guuteera',
    selectAnyDate: 'Guyyaa biraa filachuu yoo barbaaddan',
    fullNameLabel: 'Maqaa Guutuu',
    fullNamePlaceholder: 'fkn. Tolasaa Raggaasaa',
    phoneLabel: 'Lakkoofsa Bilbilaa (Telebirr / CBE)',
    phonePlaceholder: '+251 91 122 3344',
    phoneHelp: 'Ergaan mirkaneessaa bilbila kanaan isiniif ergama',
    paymentRail: 'Filannoo Kaffaltii Duraa 300 ETB',
    telebirrPay: 'Telebirr',
    cbePay: 'CBE Birr',
    holdTimeNotice: "Sa'aatiin daqiiqaa 10f isiniif eegama",
    confirmBtn: 'Beellama Mirkaneessi',
    continueBtn: 'Itti Fufi',
    backBtn: 'Duubatti',
    instantBookingSuccess: "Beellamni keessan mirkanaa'eera!",
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
    otpPrompt: "Kaffaltiin mirkanaa'aa jira...",
    verifyingPayment: "Beellamni galmaa'aa jira...",
    depositReceived: "Kaffaltiin Mirkanaa'eera",
    switchLang: 'Afaan',
    doctorLead: 'Ogeessa Olaanaa Ilkaanii (Muuxannoo Waggaa 11)',
    doctorSurgeon: 'Ogeessa Baqaqsanii Yaaluu Ilkaanii (Muuxannoo Waggaa 9)',
    clinicAbout: "Bole Dental Studio giddugala yaala ilkaanii ammayyaa Finfinnee, gamoo Morning Star Mall irratti argamudha. Teeknooloojii ammayyaa, raajii dijitaalaa fi qulqullina olaanaatiin tajaajila gaarii kenna.",
    clinicTagline: "Yaala ilkaanii ammayyaa fi amansiisaa Finfinneetti",
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
    id: 'srv-card-exam',
    name: {
      en: 'New Patient Card & Clinical Examination',
      am: 'አዲስ የታካሚ ካርድ እና የጥርስ ምርመራ',
      om: 'Kaardii Haaraa fi Qorannoo Ilkaanii',
    },
    description: {
      en: 'New clinical card registration, comprehensive oral inspection, and doctor treatment plan diagnosis.',
      am: 'አዲስ የታካሚ ካርድ መክፈቻ፣ አጠቃላይ የአፍ እና የጥርስ ምርመራ እና የህክምና እቅድ ማውጣት።',
      om: 'Galmee kaardii haaraa, qorannoo guutuu afaanii fi ilkaanii, karoora yaala ogeessaa.',
    },
    durationMinutes: 20,
    priceETB: 300,
    depositRequired: true,
    depositAmountETB: 300,
  },
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
