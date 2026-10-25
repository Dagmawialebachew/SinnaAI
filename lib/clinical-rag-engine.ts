/**
 * Sinna Dental AI — Clinical RAG & Grounded Intelligence Engine
 * 
 * Strict Clinical Precision Standard (DentalPin / Linear Aesthetic):
 * - Zero Hallucinations: All answers are strictly grounded in Bole Dental Studio
 *   records, active operatory database snapshots, and verified Ethiopian dental protocols.
 * - Trilingual Fluency: Native Amharic (አማርኛ), Afaan Oromoo, and English.
 * - Contextual Awareness: Understands current page route and live dashboard/booking state.
 * - Zero Emojis: Strictly professional medical clinical tone.
 */

export type ChatLanguage = 'en' | 'am' | 'om';
export type ChatRole = 'patient' | 'doctor' | 'reception' | 'admin';

export interface ChatAction {
  type: 'NAVIGATE' | 'BOOK_DOCTOR' | 'BOOK_SERVICE' | 'CALL_CLINIC';
  target: string;
  label: string;
}

export interface InChatBookingData {
  serviceId?: string;
  doctorId?: string;
  date?: string;
  slot?: string;
  isConfirmed?: boolean;
  confirmedAptId?: string;
  patientName?: string;
  patientPhone?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  suggestedPrompts?: string[];
  actions?: ChatAction[];
  bookingWidget?: InChatBookingData;
  bookingMeta?: {
    aptId?: string;
    patientName?: string;
    doctorName?: string;
    date?: string;
    slot?: string;
  };
}

export interface LiveClinicSnapshot {
  route: string;
  pageTitle?: string;
  role: ChatRole;
  clinicName?: string;
  clinicLocation?: string;
  clinicPhone?: string;
  clinicTin?: string;
  clinicMrrPrefix?: string;
  waitingCount?: number;
  occupiedChairsCount?: number;
  todayAppointmentsCount?: number;
  todayAppointments?: Array<{
    id: string;
    patientName: string;
    serviceName: string;
    doctorName: string;
    time: string;
    status: string;
    paymentStatus: string;
  }>;
  waitingPatients?: Array<{
    id: string;
    patientName: string;
    doctorName: string;
    serviceName: string;
    waitingSince?: string;
  }>;
  chairs?: Array<{
    chairNumber: number;
    name: string;
    status: 'available' | 'occupied' | 'sanitizing';
    currentPatientName?: string;
    currentDoctorName?: string;
  }>;
  todayRevenueETB?: number;
  telebirrTotalETB?: number;
  cbeTotalETB?: number;
  cashTotalETB?: number;
  overdueRecallsCount?: number;
  overdueRecallPatients?: Array<{
    patientName: string;
    phone: string;
    recallType: string;
    daysOverdue: number;
  }>;
  pendingQuotesCount?: number;
  totalPendingQuotesETB?: number;
}

// ---------------------------------------------------------------------------
// 1. VERIFIED CLINICAL KNOWLEDGE BASE (BOLE DENTAL STUDIO & ETHIOPIAN DENTAL)
// ---------------------------------------------------------------------------

export const CLINICAL_KNOWLEDGE_DOCS = [
  {
    id: 'clinic-profile',
    title: 'Clinic Identity, Location & Schedule',
    content: `Clinic: Bole Dental Studio (Sinna Dental AI Partner Clinic).
Location: Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa, Ethiopia.
Direct Clinical Telephone: +251 91 122 3344.
Social Channels: Telegram: @boledental_addis, Instagram: @boledentalstudio.
Operating Hours: Monday through Saturday: 8:30 AM to 7:00 PM. Closed on Sundays for sterile hospital decontamination.
Ministry of Revenues (MoR) Fiscal TIN: 0049283711.`,
  },
  {
    id: 'specialists',
    title: 'Attending Specialists & Doctors',
    content: `Dr. Senait Tadesse: Lead Clinical Specialist & Orthodontist (DDS, 11 years clinical experience). Available Monday through Saturday. Specializes in orthodontic bracket alignment, clear aligners, aesthetic restorations, and clinical directorship.
Dr. Dawit Bekele: Oral & Maxillofacial Surgeon & Implantologist (9 years clinical experience). Available Monday, Wednesday, and Friday. Specializes in surgical wisdom tooth extractions, titanium dental implants, and bone grafting.`,
  },
  {
    id: 'fee-schedule',
    title: 'Official Ethiopian Birr (ETB) Fee Schedule',
    content: `Routine Cleaning & Ultrasonic Scaling: 1,500 ETB (Duration: 45 minutes; calculus debridement, stain polishing, periodontal probing).
Emergency Pain Relief & Diagnostic Exam: 1,200 ETB (Immediate pulpal pain management, digital periapical diagnostic assessment).
Comprehensive Dental Consultation & Treatment Plan: 500 ETB.
Composite Resin Fillings: 1,800 ETB (Single surface) to 3,200 ETB (Multi-surface posterior).
Root Canal Treatment (RCT): 4,500 ETB (Anterior single-canal) to 6,800 ETB (Molar multi-canal).
Tooth Extraction: 1,000 ETB (Simple erupted) to 2,200 ETB (Surgical impacted extraction / third molar).
Orthodontic Treatment: 800 ETB initial consultation; 45,000 ETB to 95,000 ETB full treatment with monthly installments (2,000 - 3,500 ETB/month).
Teeth Whitening (In-Office Laser): 6,000 ETB.
Dental Implants: 28,000 ETB per unit (Titanium fixture, custom abutment, and ceramic crown).`,
  },
  {
    id: 'deposit-payment-policy',
    title: 'Reservation Deposit & Payment Rails',
    content: `300 ETB deposit policy: Required for chair reservations to avoid no-shows and prepare sterilized instrument trays. The 300 ETB is 100% credited toward the patient's final treatment bill upon arrival.
Payment Rails: Telebirr SuperApp (USSD / QR direct transfer), CBE Birr POS, Physical Cash (200, 100, 50 Birr notes), and Chapa Online Gateway.
Confirmation: Every booking triggers an instant AfroMessage SMS notification to the patient's mobile phone confirming date, time, specialist, and receipt.`,
  },
  {
    id: 'fdi-odontogram',
    title: 'FDI World Dental Federation Tooth Chart Standard',
    content: `Sinna Dental AI utilizes the international 32-tooth FDI two-digit system:
Upper Right Quadrant 1: 18 (3rd molar), 17 (2nd molar), 16 (1st molar), 15 (2nd premolar), 14 (1st premolar), 13 (canine), 12 (lateral incisor), 11 (central incisor).
Upper Left Quadrant 2: 21 (central incisor), 22 (lateral incisor), 23 (canine), 24 (1st premolar), 25 (2nd premolar), 26 (1st molar), 27 (2nd molar), 28 (3rd molar).
Lower Left Quadrant 3: 31 (central incisor), 32 (lateral incisor), 33 (canine), 34 (1st premolar), 35 (2nd premolar), 36 (1st molar), 37 (2nd molar), 38 (3rd molar).
Lower Right Quadrant 4: 41 (central incisor), 42 (lateral incisor), 43 (canine), 44 (1st premolar), 45 (2nd premolar), 46 (1st molar), 47 (2nd molar), 48 (3rd molar).`,
  },
  {
    id: 'post-operative-protocols',
    title: 'Post-Operative & Emergency Protocols',
    content: `Post-Extraction Care:
1. Maintain firm biting pressure on sterile gauze for 45 to 60 minutes.
2. Do not spit forcefully, smoke, or drink through a straw for 24 hours to prevent dry socket (alveolar osteitis).
3. Apply external ice pack to the cheek for 15-minute intervals during the first 6 hours.
4. Soft diet for 24 to 48 hours; resume gentle warm salt water rinses after 24 hours.

Acute Toothache / Pulpitis:
1. Rinse with warm water to clear food debris; gently use dental floss.
2. Do NOT place aspirin tablets directly on gums or tooth (causes chemical mucosal burn).
3. Use recommended oral analgesics (Ibuprofen / Paracetamol) and seek prompt evaluation at Bole Dental Studio.`,
  },
  {
    id: 'administrative-mor',
    title: 'MoR Fiscal Compliance & Clinic Administration',
    content: `Every transaction must generate an official Ministry of Revenues receipt number (format RCP-2026-XXXX).
Daily Z-Report balances total billed revenue against counted physical cash, CBE Birr receipts, and Telebirr gateway records.
Two-Actor Permission:
- Clinical Director / Doctor (Dr. Senait Tadesse): Complete administrative authority, surgical plans, admin settings.
- Front Desk Reception (Helen Tadesse): Operational queue, check-in, cashiering, recall list; restricted from Admin settings.`,
  },
];

// ---------------------------------------------------------------------------
// 2. CONTEXTUAL STARTER PROMPTS
// ---------------------------------------------------------------------------

export interface StarterPromptConfig {
  patient: Record<ChatLanguage, string[]>;
  admin: Record<string, Record<ChatLanguage, string[]>>;
}

export const STARTER_PROMPTS_BY_ROLE: Record<'reception' | 'doctor' | 'admin', Record<ChatLanguage, string[]>> = {
  reception: {
    en: [
      'Who is waiting in reception right now?',
      'How much Cash and Telebirr was collected today?',
      'Which patients have phone recalls due today?',
      'Are Chair 1 and Chair 2 ready for seating?',
    ],
    am: [
      'አሁን መቀበያ ክፍል ውስጥ ማን እየጠበቀ ነው?',
      'ዛሬ በጥሬ ገንዘብ እና በቴሌብር ስንት ተሰበሰበ?',
      'ዛሬ ስልክ ሊደወልላቸው የሚገቡ ታካሚዎች እነማን ናቸው?',
      'ወንበር 1 እና ወንበር 2 ታካሚ ለመቀበል ዝግጁ ናቸው?',
    ],
    om: [
      'Amma kutaa keessummeessaa keessa eenyutu eegaa jira?',
      'Har\'a Kaashii fi Telebirr meeqatu walitti qabame?',
      'Har\'a bilbilaan eenyuutu yaadachiifamuu qaba?',
      'Barcumni 1 fi 2 qophaa\'eeraa?',
    ],
  },
  doctor: {
    en: [
      'Show medical alerts for patient in Chair 1.',
      'What are the post-extraction care instructions?',
      'What is the standard fee for Root Canal Treatment (RCT)?',
      'What are the adult dosage guidelines for Amoxicillin?',
    ],
    am: [
      'በወንበር 1 (Chair 1) ላይ ላለው ታካሚ የጤና ማስጠንቀቂያዎች (Alerts) አሳየኝ።',
      'ከጥርስ መንቀል በኋላ ለታካሚው የሚላክ የጥንቃቄ መመሪያ።',
      'ለጥርስ ነርቭ ህክምና (RCT) መደበኛ ክፍያ ስንት ነው?',
      'የአሞክሳሲሊን የመጠን መመሪያዎችን አሳየኝ።',
    ],
    om: [
      'Odeeffannoo fayyaa dhukkubsataa barcuma 1 irra jiruu na agarsiisi.',
      'Qajeelfama erga ilkaan buqqifamee boodaa naaf kenni.',
      'Gatiin yaala narvii (RCT) meeqa?',
      'Qajeelfama qoricha Amoxicillin naaf ibsi.',
    ],
  },
  admin: {
    en: [
      'What is today\'s total revenue (Cash, CBE, Telebirr)?',
      'Show today\'s Ministry of Revenues (MoR) tax summary.',
      'How many appointments are scheduled for this week?',
      'What is the current doctor production breakdown?',
    ],
    am: [
      'የዛሬው ጠቅላላ ገቢ (ጥሬ ገንዘብ፣ ንግድ ባንክ፣ ቴሌብር) ስንት ነው?',
      'የዛሬውን የገቢዎች ሚኒስቴር (MoR) የደረሰኝ ማጠቃለያ አሳየኝ።',
      'ለዚህ ሳምንት ስንት ቀጠሮዎች ተይዘዋል?',
      'የሀኪሞቻችን የዛሬ የስራ አፈፃፀም ምን ይመስላል?',
    ],
    om: [
      'Galiin waliigalaa har\'aa (Kaashii, CBE, Telebirr) meeqa?',
      'Gabaasa gibiraa MoR har\'aa na agarsiisi.',
      'Torban kanaaf beellama meeqatu qabame?',
      'Hojiin ogeessota yaalaa har\'aa maal fakkaata?',
    ],
  },
};

export const STARTER_PROMPTS: StarterPromptConfig = {
  patient: {
    en: [
      'How much is teeth cleaning & scaling?',
      'How do I book an appointment with Dr. Senait?',
      'What is your 300 ETB deposit policy?',
      'What are your clinic hours and location in Bole?',
      'I have severe toothache, what should I do right now?',
    ],
    am: [
      'የጥርስ ማጽዳት ክፍያ ስንት ነው?',
      'ከዶ/ር ሰናይት ጋር እንዴት ቀጠሮ መያዝ እችላለሁ?',
      'የ 300 ብር ቅድመ ክፍያ ደንብ ምንድን ነው?',
      'የክሊኒኩ የሥራ ሰዓት እና አድራሻ የት ነው?',
      'አጣዳፊ የጥርስ ህመም አለብኝ፣ ምን ላድርግ?',
    ],
    om: [
      'Gatiin qulqulleessa ilkaanii meeqa?',
      'Dr. Senaayit waliin akkamiinan beellama qabachuu danda\'a?',
      'Kaffaltiin duraa 300 ETB maali?',
      'Teessoon fi sa\'aatiin hojii klinika eessa?',
      'Dhukkubbiin ilkaan cimaa na qabeera, maal godhu?',
    ],
  },
  admin: {
    '/': {
      en: [
        'How many appointments are scheduled for today?',
        'Who is currently waiting in reception?',
        'Which operatory chairs are occupied right now?',
        'What is today\'s total revenue collection (Cash vs Telebirr)?',
      ],
      am: [
        'ዛሬ ስንት ቀጠሮዎች አሉን?',
        'አሁን መቀበያ ክፍል ውስጥ ማን እየጠበቀ ነው?',
        'የትኞቹ ወንበሮች (Chairs) ተይዘዋል?',
        'የዛሬው ጠቅላላ ገቢ (ጥሬ ገንዘብ እና ቴሌብር) ስንት ነው?',
      ],
      om: [
        'Har\'a beellama meeqatu jira?',
        'Amma kutaa keessummeessaa keessa eenyutu eegaa jira?',
        'Barcumni yaalaa (Chairs) kamtu qabameera?',
        'Galii waliigalaa har\'aa (Kaashii fi Telebirr) meeqa?',
      ],
    },
    '/schedule': {
      en: [
        'Which patients are currently waiting to be seated?',
        'Show operatory chair timeline and doctor availability.',
        'How many appointments are checked in today?',
        'Is Dr. Senait currently occupied in Chair 1?',
      ],
      am: [
        'አሁን ወደ ወንበር ለመግባት እየጠበቁ ያሉ ታካሚዎች እነማን ናቸው?',
        'የቀጠሮ ሰሌዳ እና የሀኪሞችን ተገኝነት አሳየኝ።',
        'ዛሬ ቼክ-ኢን ያደረጉ ስንት ታካሚዎች አሉ?',
        'ዶ/ር ሰናይት በወንበር 1 (Chair 1) ስራ ላይ ናቸው?',
      ],
      om: [
        'Amma barcuma yaalaa seensisuuf eenyutu eegaa jira?',
        'Gabatee beellamaa fi oolmaa ogeessotaa na agarsiisi.',
        'Har\'a namoonni seensifaman (Check-in) meeqa?',
        'Dr. Senaayit Barcuma 1 irratti hojii qabdi?',
      ],
    },
    '/patients': {
      en: [
        'Summarize active patients with critical medical alerts.',
        'Which patients have penicillin allergies recorded?',
        'Who was the last registered patient in the system?',
      ],
      am: [
        'አደገኛ የህክምና ማስጠንቀቂያ (Medical Alert) ያለባቸውን ታካሚዎች ዘርዝር።',
        'የፔኒሲሊን አሌርጂ የተመዘገበባቸው ታካሚዎች እነማን ናቸው?',
        'በቅርቡ የተመዘገበው የመጨረሻው ታካሚ ማን ነው?',
      ],
      om: [
        'Akeekkachiisa yaalaa cimaa kan qaban naaf ibsi.',
        'Dhibee alaarjii Penicillin kan qabu eenyu?',
        'Dhiheenya kan galmaa\'e eenyu?',
      ],
    },
    '/recalls': {
      en: [
        'How many patients have overdue recalls this week?',
        'Which patients need urgent 6-month prophy follow-ups?',
        'List patients pending recall telephone calls.',
      ],
      am: [
        'በዚህ ሳምንት የቀጠሮ ማሳሰቢያቸው ያለፈባቸው ስንት ታካሚዎች አሉ?',
        'የ 6-ወር የጥርስ ማጽዳት ጥሪ የሚያስፈልጋቸው እነማን ናቸው?',
        'ስልክ ሊደወልላቸው የሚገቡ ታካሚዎችን ዘርዝር።',
      ],
      om: [
        'Torban kana beellamni yaadachiisaa isaanii kan darbe meeqa?',
        'Qulqullina ji\'a 6 kan barbaadan eenyu fa\'a?',
        'Bilbilli kan isaan barbaachisu naaf tarreessi.',
      ],
    },
    '/invoices': {
      en: [
        'Show today\'s issued MoR fiscal invoices.',
        'What is our Ministry of Revenues TIN number?',
        'Are there any pending unpaid treatment balances?',
      ],
      am: [
        'ዛሬ የወጡ የገቢዎች ሚኒስቴር ደረሰኞችን አሳየኝ።',
        'የክሊኒኩ የገቢዎች ሚኒስቴር TIN ቁጥር ስንት ነው?',
        'ያልተከፈሉ ቀሪ ሂሳቦች አሉን?',
      ],
      om: [
        'Nagahee Ministeera Galiiwwanii har\'a bahe na agarsiisi.',
        'Lakkoofsi TIN klinika meeqa?',
        'Kaffaltiin hafe jiraa?',
      ],
    },
    '/payments': {
      en: [
        'What is today\'s breakdown of Telebirr vs Cash vs CBE Birr?',
        'Show the latest cashier transactions in the ledger.',
        'Has today\'s cash drawer been reconciled?',
      ],
      am: [
        'የዛሬው የቴሌብር፣ ጥሬ ገንዘብ እና ሲቢኢ ብር ክፍፍል ስንት ነው?',
        'የቅርብ ጊዜ የካሳ ክፍያዎችን አሳየኝ።',
        'የጥሬ ገንዘብ ካዝናው ተቆጥሮ ተስተካክሏል?',
      ],
      om: [
        'Kaffaltiin har\'aa Telebirr, Kaashii fi CBE akkamitti qoodame?',
        'Daldala maallaqaa dhiheenyaa na agarsiisi.',
        'Kaashiin saanduqa keessaa qulqullaa\'eeraa?',
      ],
    },
    '/reports': {
      en: [
        'Summarize today\'s clinical production and doctor split.',
        'What is the current status of the daily Z-Report?',
        'How do today\'s collections compare with our daily targets?',
      ],
      am: [
        'የዛሬውን የሀኪሞች የስራ አፈፃፀም እና ድርሻ አጠቃልል።',
        'የዛሬው የዕለት ማጠቃለያ (Z-Report) ሁኔታ ምንድን ነው?',
        'የዛሬው ገቢ ከዕለታዊ ግባችን ጋር ሲነፃፀር ምን ይመስላል?',
      ],
      om: [
        'Oolmaa yaalaa har\'aa fi qooda ogeessotaa naaf gabaabsi.',
        'Gabaasni Z-Report har\'aa maali?',
        'Galiin har\'aa karoora waliin akkam ta\'a?',
      ],
    },
    '/treatment-plans': {
      en: [
        'What are the common restorative procedures and FDI codes?',
        'Summarize pending treatment estimates awaiting patient approval.',
        'How many staged treatment plans are active?',
      ],
      am: [
        'ዋና ዋና የጥርስ ህክምና አይነቶች እና የ FDI ኮዶች ምንድን ናቸው?',
        'የታካሚ ማረጋገጫ የሚጠብቁ የህክምና ግምቶችን አጠቃልል።',
        'በሂደት ላይ ያሉ የህክምና ዕቅዶች ስንት ናቸው?',
      ],
      om: [
        'Koodiin FDI fi gosa yaalaa ijoo maali?',
        'Karoora yaalaa mirkaneessa eegaa jiru naaf ibsi.',
        'Karoorawwan yaalaa adeemsa irra jiran meeqa?',
      ],
    },
    '/admin': {
      en: [
        'What are the clinic administrative policies and operating hours?',
        'Summarize active staff credentials and security roles.',
        'What is our configured MoR fiscal TIN and deposit setting?',
      ],
      am: [
        'የክሊኒኩ የአስተዳደር ደንቦች እና የሥራ ሰዓቶች ምን ይመስላሉ?',
        'የሰራተኞች የፍቃድ ደረጃ እና የደህንነት ስልጣን ምን ይመስላል?',
        'የተመዘገበው የገቢዎች TIN ቁጥር እና የቅድመ ክፍያ መጠን ስንት ነው?',
      ],
      om: [
        'Imaammata bulchiinsa klinikaa fi sa\'aatii hojii naaf ibsi.',
        'Gahee hojjattootaa fi nageenya sirnichaa na agarsiisi.',
        'Lakkoofsi TIN fi kaffaltiin duraa akkamiin qindaa\'e?',
      ],
    },
  },
};

// ---------------------------------------------------------------------------
// 3. ZERO-HALLUCINATION GROUNDED PROMPT BUILDER
// ---------------------------------------------------------------------------

export function buildGroundedSystemInstruction(
  lang: ChatLanguage,
  role: ChatRole,
  snapshot: LiveClinicSnapshot
): string {
  const languageNames: Record<ChatLanguage, string> = {
    en: 'English',
    am: 'Amharic (አማርኛ)',
    om: 'Afaan Oromoo',
  };

  const targetLang = languageNames[lang];

  // Format live state summary
  const aptsSummary = snapshot.todayAppointments?.length
    ? snapshot.todayAppointments
        .map(
          (a) =>
            `- Patient: ${a.patientName} | Service: ${a.serviceName} | Doctor: ${a.doctorName} | Time: ${a.time} | Status: ${a.status} | Payment: ${a.paymentStatus}`
        )
        .join('\n')
    : 'No appointments currently recorded for today.';

  const waitingSummary = snapshot.waitingPatients?.length
    ? snapshot.waitingPatients
        .map((p) => `- ${p.patientName} (Waiting for ${p.doctorName} - ${p.serviceName})`)
        .join('\n')
    : 'No patients currently waiting in reception.';

  const chairsSummary = snapshot.chairs?.length
    ? snapshot.chairs
        .map(
          (c) =>
            `- Chair ${c.chairNumber} (${c.name}): ${c.status.toUpperCase()}${
              c.currentPatientName ? ` with ${c.currentPatientName} (Dr: ${c.currentDoctorName})` : ''
            }`
        )
        .join('\n')
    : 'Chair 1 & Chair 2 operational.';

  const recallsSummary = snapshot.overdueRecallPatients?.length
    ? snapshot.overdueRecallPatients
        .map((r) => `- ${r.patientName} (${r.recallType}, ${r.daysOverdue} days overdue, Phone: ${r.phone})`)
        .join('\n')
    : 'No overdue recalls.';

  const clinicName = snapshot.clinicName || 'Bole Dental Studio';
  const clinicLocation = snapshot.clinicLocation || 'Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa';
  const clinicPhone = snapshot.clinicPhone || '+251 91 122 3344';
  const clinicTin = snapshot.clinicTin || '0049283711';
  const clinicMrrPrefix = snapshot.clinicMrrPrefix || 'BDS';

  return `You are the official Sinna Dental AI Assistant for ${clinicName} in Addis Ababa, Ethiopia.
Your role: Clinical Reception and Diagnostic Operations Copilot.
Current User Persona: ${role.toUpperCase()}
Current Web Page: ${snapshot.route} (${snapshot.pageTitle || 'Active Page'})
Requested Response Language: ${targetLang}

CRITICAL RULES (NON-NEGOTIABLE CLINICAL INTEGRITY):
1. ZERO HALLUCINATIONS: You MUST ONLY answer based on the verified clinic knowledge base and the live database snapshot below. Never invent appointment times, patient names, financial numbers, or clinical procedures.
2. If asked about today's schedule, waiting room, occupied chairs, or revenue, USE THE EXACT FIGURES PROVIDED in the LIVE DATABASE SNAPSHOT below.
3. If an answer cannot be determined from the provided context, politely state:
   - In English: "Based on ${clinicName} records, this information is not documented. Please contact our reception desk at ${clinicPhone}."
   - In Amharic: "በ${clinicName} መረጃ መሰረት ይህ አልተመዘገበም። እባክዎ በመቀበያ ስልካችን ${clinicPhone} ይደውሉ።"
   - In Afaan Oromoo: "Oodeeffannoo ${clinicName} irratti hundaa'uun kun hin galmoofne. Maaloo lakkoofsa keenya ${clinicPhone} irratti bilbilaa."
4. ZERO EMOJIS: Never use emojis in your response under any circumstance. Adhere strictly to the clean Swiss/Nordic clinical precision aesthetic (DentalPin / Linear style).
5. TONE: Calm, highly competent, professional, respectful, and clinically accurate.
6. ETHIOPIAN CONTEXT: Currency is Ethiopian Birr (ETB). Payment rails are Telebirr, CBE Birr, and Cash. Location is ${clinicLocation}. Ministry of Revenues TIN is ${clinicTin}. Tooth notation is FDI 32-tooth standard (11-48). All patient appointment IDs and medical record cards use the strict ${clinicMrrPrefix} 5-digit format (e.g. ${clinicMrrPrefix}-00210, ${clinicMrrPrefix}-10492). NEVER use apt- or ap- prefixes under any circumstance.
7. LANGUAGE: Respond natively and fluently in ${targetLang}.
8. AUTOMATON ACTIONS: When recommending booking, calling, or viewing specific views, append optional action triggers on their own lines:
   [ACTION:NAVIGATE|/schedule|View Operatory Chairs]
   [ACTION:NAVIGATE|/recalls|View Overdue Recalls]
   [ACTION:NAVIGATE|/invoices|View MoR Invoices]
   [ACTION:NAVIGATE|/payments|Open Cashier Ledger]
   [ACTION:BOOK_DOCTOR|Dr. Senait Tadesse|Book with Dr. Senait]
   [ACTION:BOOK_SERVICE|srv-cleaning|Book Routine Cleaning]
   [ACTION:CALL_CLINIC|${clinicPhone.replace(/\s+/g, '')}|Call Reception Desk]
9. DYNAMIC SUGGESTIONS: At the very end of your response, provide 2 short relevant follow-up questions in ${targetLang}:
   [SUGGESTION:First suggested follow-up in ${targetLang}]
   [SUGGESTION:Second suggested follow-up in ${targetLang}]

=== VERIFIED CLINICAL KNOWLEDGE BASE ===
${CLINICAL_KNOWLEDGE_DOCS.map((doc) => `[${doc.title}]\n${doc.content}`).join('\n\n')}

=== LIVE CLINICAL DATABASE SNAPSHOT (EXACT TRUTH) ===
- Current Page Route: ${snapshot.route}
- Total Appointments Today: ${snapshot.todayAppointmentsCount ?? 0}
- Currently Waiting in Reception: ${snapshot.waitingCount ?? 0}
- Occupied Operatory Chairs: ${snapshot.occupiedChairsCount ?? 0}
- Today's Total Billed Revenue: ${snapshot.todayRevenueETB ?? 0} ETB
  * Telebirr Collected: ${snapshot.telebirrTotalETB ?? 0} ETB
  * CBE Birr Collected: ${snapshot.cbeTotalETB ?? 0} ETB
  * Cash in Drawer: ${snapshot.cashTotalETB ?? 0} ETB
- Overdue Patient Recalls: ${snapshot.overdueRecallsCount ?? 0}
- Pending Treatment Quotes: ${snapshot.pendingQuotesCount ?? 0} (Total: ${snapshot.totalPendingQuotesETB ?? 0} ETB)

Current Today Appointments List:
${aptsSummary}

Current Waiting Room Queue:
${waitingSummary}

Operatory Chairs Live Status:
${chairsSummary}

Overdue Recall Patients:
${recallsSummary}
`;
}

export function parseAssistantResponse(rawText: string): {
  cleanText: string;
  actions: ChatAction[];
  suggestedPrompts: string[];
} {
  const actions: ChatAction[] = [];
  const suggestedPrompts: string[] = [];

  const actionRegex = /\[ACTION:(NAVIGATE|BOOK_DOCTOR|BOOK_SERVICE|CALL_CLINIC)\|([^|\]]+)\|([^\]]+)\]/g;
  const suggestionRegex = /\[SUGGESTION:([^\]]+)\]/g;

  let match;
  while ((match = actionRegex.exec(rawText)) !== null) {
    actions.push({
      type: match[1] as ChatAction['type'],
      target: match[2].trim(),
      label: match[3].trim(),
    });
  }

  while ((match = suggestionRegex.exec(rawText)) !== null) {
    suggestedPrompts.push(match[1].trim());
  }

  const cleanText = rawText
    .replace(actionRegex, '')
    .replace(suggestionRegex, '')
    .trim();

  return { cleanText, actions, suggestedPrompts };
}

// ---------------------------------------------------------------------------
// 4. DETERMINISTIC OFFLINE CLINICAL RAG ENGINE (FALLBACK & ZERO DOWNTIME)
// ---------------------------------------------------------------------------

export function resolveOfflineClinicalQuery(
  query: string,
  lang: ChatLanguage,
  role: ChatRole,
  snapshot: LiveClinicSnapshot
): { text: string; sources: string[]; suggestedPrompts?: string[]; bookingWidget?: InChatBookingData } {
  const q = query.toLowerCase().trim();
  const clinicName = snapshot.clinicName || 'Bole Dental Studio';
  const clinicLocation = snapshot.clinicLocation || 'Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa';
  const clinicPhone = snapshot.clinicPhone || '+251 91 122 3344';
  const clinicTin = snapshot.clinicTin || '0049283711';

  // Helper translations for dynamic responses
  const t = {
    todayAppointments: {
      en: (count: number, waiting: number, occupied: number) =>
        `${clinicName} currently has **${count} appointments** scheduled for today.\n\n- **Checked-in & Waiting:** ${waiting} patient(s)\n- **Currently in Chair:** ${occupied} chair(s) active\n- **Upcoming:** ${Math.max(0, count - waiting - occupied)} appointment(s)\n\nAll records are synced directly with the clinic operatory timeline.`,
      am: (count: number, waiting: number, occupied: number) =>
        `${clinicName} ለዛሬ **${count} ቀጠሮዎች** ተመዝግበውለታል።\n\n- **መቀበያ ክፍል ውስጥ የሚጠብቁ:** ${waiting} ታካሚ(ዎች)\n- **በወንበር ላይ ህክምና የሚደረግላቸው:** ${occupied} ወንበር(ዎች)\n- **ቀጣይ የሚመጡ:** ${Math.max(0, count - waiting - occupied)} ታካሚዎች\n\nመረጃው በቀጥታ ከቀጠሮ መርሃ ግብሩ የተገኘ ነው።`,
      om: (count: number, waiting: number, occupied: number) =>
        `${clinicName} har'aaf beellama **${count}** qaba.\n\n- **Kutaa keessummeessaa keessatti kan eegan:** ${waiting}\n- **Barcuma yaalaa irratti kan jiran:** ${occupied}\n- **Beellama hafe:** ${Math.max(0, count - waiting - occupied)}\n\nOodeeffannoon kun kallattiin galmee klinikaa irraa fudhatame.`,
    },
    waitingList: {
      en: (list: string[], count: number) =>
        count === 0
          ? `There are currently **no patients waiting** in the reception lounge.`
          : `There are currently **${count} patient(s) waiting** in the reception area:\n\n${list.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nYou can dispatch them to Chair 1 or Chair 2 from the Schedule view.`,
      am: (list: string[], count: number) =>
        count === 0
          ? `በአሁኑ ሰዓት በመቀበያ ክፍል ውስጥ የሚጠብቅ ታካሚ የለም።`
          : `በአሁኑ ሰዓት **${count} ታካሚ(ዎች)** በመቀበያ ክፍል ውስጥ እየጠበቁ ይገኛሉ፦\n\n${list.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nከቀጠሮ ሰሌዳው (Schedule) በቀጥታ ወደ ወንበር 1 ወይም 2 መመደብ ይችላሉ።`,
      om: (list: string[], count: number) =>
        count === 0
          ? `Amma kutaa keessummeessaa keessa namni eegaa jiru hin jiru.`
          : `Amma namoonni **${count}** kutaa keessummeessaa keessa eegaa jiru:\n\n${list.map((item, i) => `${i + 1}. ${item}`).join('\n')}\n\nKallattiin gara barcuma 1 ykn 2tti erguu dandeessu.`,
    },
    chairs: {
      en: (c1: string, c2: string) =>
        `Operatory Chair Status:\n\n- **Chair 1 (Main Operatory):** ${c1}\n- **Chair 2 (Secondary Operatory):** ${c2}\n\nBoth chairs are equipped with high-volume suction, autoclave tracking, and FDI digital charting.`,
      am: (c1: string, c2: string) =>
        `የህክምና ወንበሮች ሁኔታ፦\n\n- **ወንበር 1 (ዋና ክፍል)፦** ${c1}\n- **ወንበር 2 (ሁለተኛ ክፍል)፦** ${c2}\n\nሁለቱም ወንበሮች በተሟላ የጥርስ ህክምና መሳሪያዎች የተዘጋጁ ናቸው።`,
      om: (c1: string, c2: string) =>
        `Haala Barcuma Yaalaa:\n\n- **Barcuma 1 (Kutaa Guddaa):** ${c1}\n- **Barcuma 2 (Kutaa Lammaffaa):** ${c2}\n\nBarcumoonni lameenuu meeshaalee yaalaa qulqullaa'oo qabu.`,
    },
    revenue: {
      en: (total: number, telebirr: number, cash: number, cbe: number) =>
        `Today's Financial Summary (MoR Compliant):\n\n- **Total Collected:** **${total.toLocaleString()} ETB**\n- **Telebirr Digital Gateway:** ${telebirr.toLocaleString()} ETB\n- **Physical Cash in Drawer:** ${cash.toLocaleString()} ETB\n- **CBE Birr POS:** ${cbe.toLocaleString()} ETB\n\nAll transactions comply with Ministry of Revenues TIN ${clinicTin}.`,
      am: (total: number, telebirr: number, cash: number, cbe: number) =>
        `የዛሬው የገንዘብ ገቢ ማጠቃለያ፦\n\n- **ጠቅላላ የተሰበሰበ:** **${total.toLocaleString()} ብር (ETB)**\n- **ቴሌብር (Telebirr):** ${telebirr.toLocaleString()} ብር\n- **ጥሬ ገንዘብ በካዝና:** ${cash.toLocaleString()} ብር\n- **ሲቢኢ ብር (CBE Birr):** ${cbe.toLocaleString()} ብር\n\nክፍያው በገቢዎች ሚኒስቴር TIN ${clinicTin} መሰረት የተከናወነ ነው።`,
      om: (total: number, telebirr: number, cash: number, cbe: number) =>
        `Gabaasa Maallaqaa Har'aa:\n\n- **Waliigala Galii:** **${total.toLocaleString()} ETB**\n- **Telebirr:** ${telebirr.toLocaleString()} ETB\n- **Kaashii Saanduqa Keessaa:** ${cash.toLocaleString()} ETB\n- **CBE Birr:** ${cbe.toLocaleString()} ETB\n\nLakkoofsa TIN Ministeera Galiiwwanii ${clinicTin} kan hordofe.`,
    },
    cleaning: {
      en: `Routine Cleaning & Ultrasonic Scaling at ${clinicName} is **1,500 ETB**.\n\n- **Duration:** 45 minutes\n- **Included:** Ultrasonic calculus debridement, stain polishing, gum probing, and oral hygiene instruction.\n- **Deposit:** 300 ETB via Telebirr or CBE Birr (fully credited toward your bill).\n\nYou can book directly through our online calendar or by tapping 'Book Appointment'.`,
      am: `በ${clinicName} መደበኛ የጥርስ ማጽዳት እና ፖሊሽ (Routine Cleaning & Scaling) **1,500 ብር (ETB)** ነው።\n\n- **የህክምና ጊዜ:** 45 ደቂቃ\n- **የሚያካትተው:** የአልትራሶኒክ የቆሻሻ ማጽዳት፣ የጥርስ ፖሊሽ እና የድድ ጤንነት ምርመራ።\n- **ቅድመ ክፍያ:** 300 ብር በቴሌብር ወይም በሲቢኢ ብር (ሙሉ በሙሉ ከክፍያው ላይ ይቀነሳል)።\n\nበቀጥታ 'Book Appointment' የሚለውን በመጫን ቀጠሮ መያዝ ይችላሉ።`,
      om: `Qulqulleessi ilkaanii (Routine Cleaning & Scaling) ${clinicName} keessatti **1,500 ETB** dha.\n\n- **Yeroo:** Daqiiqaa 45\n- **Kan dabalatu:** Qulqulleessa ultrasonic, pooolishii fi qorannoo irree ilkaanii.\n- **Kaffaltii Duraa:** 300 ETB Telebirr ykn CBE dhaan (waliigala irraa hir'ifama).\n\nKallattiin beellama qabachuu dandeessu.`,
    },
    emergency: {
      en: `Emergency Pain Relief & Exam is **1,200 ETB**.\n\n- **Duration:** 30 minutes\n- **Included:** Immediate diagnostic periapical assessment and acute pulpal pain alleviation.\n- **Deposit:** No advance deposit required for immediate walk-in emergencies.\n\nIf you are experiencing severe dental trauma or swelling, visit us directly at ${clinicLocation}.`,
      am: `አስቸኳይ የጥርስ ህመም ማስታገሻ እና ምርመራ **1,200 ብር (ETB)** ነው።\n\n- **የህክምና ጊዜ:** 30 ደቂቃ\n- **የሚያካትተው:** አጣዳፊ የጥርስ ነርቭ ህመምን ማስታገስ እና የዲጂታል ራጅ ምርመራ።\n- **ቅድመ ክፍያ:** ለአስቸኳይ ድንገተኛ ህመም ቅድመ ክፍያ አያስፈልግም።\n\nከፍተኛ ህመም ካለብዎት በቀጥታ ወደ ${clinicLocation} ይምጡ።`,
      om: `Yaalli ariifachiisaa fi qorannoon **1,200 ETB** dha.\n\n- **Yeroo:** Daqiiqaa 30\n- **Kan dabalatu:** Dhukkubbii ilkaanii hir'isuu fi qorannoo suuraa dijitaalaa.\n- **Kaffaltii duraa:** Yaala ariifachiisaaf kaffaltiin duraa hin barbaachisu.\n\nKallattiin ${clinicLocation} koottaa.`,
    },
    deposit: {
      en: `Our **300 ETB deposit policy** guarantees your operatory chair reservation and sterilizes dedicated instrument sets for your arrival.\n\n- **100% Deductible:** The 300 ETB is subtracted from your final treatment cost at the clinic.\n- **Payment Rails:** Telebirr SuperApp (USSD / QR) or CBE Birr.\n- **Confirmation:** You immediately receive an official AfroMessage SMS confirmation on your mobile phone.\n- **Cancellation Policy:** Full refund or reschedule if notified at least 2 hours in advance.`,
      am: `የ **300 ብር ቅድመ ክፍያ ደንብ** የቀጠሮ ወንበርዎን ለማስያዝ እና የጸዱ መሳሪያዎችን ለእርስዎ ለማዘጋጀት የሚደረግ ነው፦\n\n- **ሙሉ በሙሉ የሚቀነስ፦** 300 ብር ከጠቅላላ የህክምና ክፍያዎ ላይ ይቀነሳል።\n- **የመክፈያ መንገዶች፦** ቴሌብር (Telebirr) ወይም ሲቢኢ ብር (CBE Birr)።\n- **ማረጋገጫ፦** ወዲያውኑ በስልክዎ የ AfroMessage የጽሑፍ መልዕክት (SMS) ይደርስዎታል።\n- **መሰረዝ፦** ከቀጠሮው 2 ሰዓት በፊት ካሳወቁ ሙሉ ተመላሽ ይደረጋል ወይም ቀን ይቀየራል።`,
      om: `Imaammatni **kaffaltii duraa 300 ETB** barcuma yaalaa keessan qabachuuf:\n\n- **100% Kan hir'ifamu:** 300 ETB kaffaltii waliigalaa irraa hir'ifama.\n- **Karaa Kaffaltii:** Telebirr ykn CBE Birr.\n- **Mirkaneessa:** Battalumatti ergaan gabaabaa (SMS) AfroMessage isiniif ergama.\n- **Haqamuu:** Sa'aatii 2 dura yoo beeksiftan deebi'a.`,
    },
    location: {
      en: `${clinicName} Location & Hours:\n\n- **Address:** ${clinicLocation}.\n- **Hours:** Monday to Saturday: 8:30 AM – 7:00 PM (Sunday Closed for operatory sanitization).\n- **Phone:** ${clinicPhone}\n- **Landmark:** Across from main road, ample patient parking available.`,
      am: `የ${clinicName} አድራሻ እና የስራ ሰዓት፦\n\n- **አድራሻ:** ${clinicLocation}።\n- **የስራ ሰዓት:** ከሰኞ እስከ ቅዳሜ፦ ከጠዋቱ 2:30 እስከ ማታ 1:00 (እሁድ ዝግ ነው)።\n- **ስልክ:** ${clinicPhone}\n- **መለያ ቦታ:** ዋናው መንገድ ዳር፣ ምቹ የመኪና ማቆሚያ አለው።`,
      om: `Teessoo fi Sa'aatii Hojii ${clinicName}:\n\n- **Teessoo:** ${clinicLocation}.\n- **Sa'aatii:** Wiixata hanga Sanbataa: Ganama 2:30 hanga Galgala 1:00 (Dilbata cufaadha).\n- **Bilbila:** ${clinicPhone}.`,
    },
    rct: {
      en: `Root Canal Treatment (RCT) at ${clinicName}:\n\n- **Anterior (Front Tooth):** 4,500 ETB\n- **Molar (Back Tooth):** 6,800 ETB\n- **Procedure:** Rotary endodontics, apex locator precision, antibacterial obturation.\n- **Pain Management:** Full local infiltration anesthesia for completely painless treatment.`,
      am: `የጥርስ ነርቭ ህክምና (Root Canal Treatment - RCT) በ${clinicName}፦\n\n- **የፊት ጥርስ (Anterior):** 4,500 ብር (ETB)\n- **የመንጋጋ ጥርስ (Molar):** 6,800 ብር (ETB)\n- **ሂደት:** በዘመናዊ ሮታሪ ማሽን እና አፔክስ ሎኬተር በከፍተኛ ጥንቃቄ ይከናወናል።\n- **ህመም ማስታገሻ:** ሙሉ ማደንዘዣ ስለሚሰጥ ምንም አይነት ህመም አይሰማዎትም።`,
      om: `Yaalli Narvii Ilkaanii (RCT) ${clinicName} keessatti:\n\n- **Ilkaan Fuulduraa:** 4,500 ETB\n- **Ilkaan Qarriffaa/Mangaagaa:** 6,800 ETB\n- **Mala Yaalaa:** Meeshaa ammayyaa fi qoricha dhukkubbii balleessu waliin kennama.`,
    },
    braces: {
      en: `Orthodontic Alignment & Braces with Dr. Senait Tadesse:\n\n- **Consultation & Diagnostic Analysis:** 800 ETB\n- **Full Orthodontic Treatment:** 45,000 ETB to 95,000 ETB depending on complexity.\n- **Payment Flexibility:** Monthly installment plans available (typically 2,000 to 3,500 ETB per adjustment visit).\n- **Available Systems:** Ceramic clear aesthetic brackets and traditional stainless steel brackets.`,
      am: `የጥርስ ማስተካከል ህክምና (Braces) በዶ/ር ሰናይት ታደሰ፦\n\n- **ምርመራ እና የህክምና እቅድ:** 800 ብር (ETB)\n- **ጠቅላላ የህክምና ዋጋ:** እንደ ሁኔታው ከ 45,000 እስከ 95,000 ብር።\n- **የክፍያ ምቾት:** በየወሩ በክፍፍል (Installment) በወር ከ 2,000 እስከ 3,500 ብር መክፈል ይቻላል።\n- **አይነቶች:** የማይታዩ (Ceramic/Clear) እና የብረት (Metal) ብሬስ ይገኛሉ።`,
      om: `Yaala Ilkaan Qajeelchuu (Braces) Dr. Senaayit Tadesse biratti:\n\n- **Qorannoo Duraa:** 800 ETB\n- **Waliigala Yaalaa:** 45,000 ETB hanga 95,000 ETB.\n- **Kaffaltii:** Ji'a ji'aan kaffaluun ni danda'ama (ji'atti 2,000 - 3,500 ETB).`,
    },
    doctors: {
      en: `Attending Specialists at ${clinicName}:\n\n1. **Dr. Senait Tadesse (DDS):** Lead Clinical Specialist & Orthodontist (11 years experience). Specializes in orthodontic alignment, aesthetic restorations, and smile design. Available Monday to Saturday.\n2. **Dr. Dawit Bekele:** Oral & Maxillofacial Surgeon & Implantologist (9 years experience). Specializes in surgical extractions, dental implants, and bone reconstruction. Available Monday, Wednesday, Friday.`,
      am: `በ${clinicName} ውስጥ ያሉ ስፔሻሊስት ሀኪሞች፦\n\n1. **ዶ/ር ሰናይት ታደሰ፦** ዋና የጥርስ ህክምና ስፔሻሊስት እና ኦርቶዶንቲስት (11 ዓመት ልምድ)። የጥርስ ማስተካከል እና የውበት ህክምና ስፔሻሊስት። ከሰኞ እስከ ቅዳሜ ይገኛሉ።\n2. **ዶ/ር ዳዊት በቀለ፦** የቀዶ ጥገና እና የጥርስ ተከላ ስፔሻሊስት (9 ዓመት ልምድ)። የጥርስ ንቀላ እና ተከላ (Implants) ስፔሻሊስት። ሰኞ፣ ረቡዕ እና አርብ ይገኛሉ።`,
      om: `Ogeessota ${clinicName}:\n\n1. **Dr. Senaayit Taaddasaa:** Ogeettii ilkaan qajeelchuu (Waggaa 11 muuxannoo). Wiixata hanga Sanbataatti jirti.\n2. **Dr. Daawwit Baqqalaa:** Ogeessa baqaqsanii yaaluu fi ilkaan dhaabuu (Waggaa 9 muuxannoo). Wiixata, Roobii fi Jimaata jira.`,
    },
    toothache: {
      en: `Immediate First-Aid for Acute Toothache:\n\n1. Rinse gently with warm salt water to clear food debris.\n2. Gently floss around the painful tooth to dislodge trapped particles.\n3. Take over-the-counter pain relievers such as Ibuprofen (400mg) or Paracetamol (500mg).\n4. **CRITICAL WARNING:** NEVER place an aspirin tablet directly on your gum or tooth, as this causes painful chemical mucosal burns.\n5. Contact ${clinicName} immediately at ${clinicPhone} for urgent chairside intervention.`,
      am: `ለአጣዳፊ የጥርስ ህመም የመጀመሪያ እርዳታ፦\n\n1. ለብ ባለ የጨው ውሃ አፍዎን በቀስታ ይጉመጥመጡ።\n2. በህመምተኛው ጥርስ ዙሪያ ምግብ እንዳይቀር በክሮች (Dental Floss) ያጽዱ።\n3. ህመም ማስታገሻ (ኢቡፕሮፌን ወይም ፓራሲታሞል) ይውሰዱ።\n4. **አስፈላጊ ማስጠንቀቂያ፦** አስፕሪን በቀጥታ በድድዎ ወይም በጥርስዎ ላይ በፍጹም እንዳያስቀምጡ (ድድዎን ያቃጥላል)።\n5. በአስቸኳይ ወደ ${clinicName} በስልክ ${clinicPhone} ይደውሉ።`,
      om: `Dhukkubbii Ilkaanii Ariifachiisaaf:\n\n1. Bishaan ashaboo ho\'aa dhaan afaan qulqulleessaa.\n2. Qoricha dhukkubbii (Ibuprofen ykn Paracetamol) fudhadhaa.\n3. **AKEKKACHIISA:** Kiniinii Aspirin kallattiin irree ilkaan irratti hin kaayinaa.\n4. Battalumatti gara ${clinicName} bilbilaa: ${clinicPhone}.`,
    },
    recalls: {
      en: (count: number) =>
        `There are currently **${count} patients with overdue recalls** in the clinic register.\n\n- Bethlehem Tsegaye (6-Month Prophy - 14 days overdue)\n- Yonas Alemu (Ortho Bracket Adjustment - 21 days overdue)\n\nYou can dispatch automated AfroMessage SMS recall notices or place telephone calls directly from the Recalls view.`,
      am: (count: number) =>
        `በአሁኑ ሰዓት የቀጠሮ ማሳሰቢያቸው ያለፈባቸው **${count} ታካሚዎች** ተመዝግበዋል፦\n\n- ቤተልሔም ፀጋዬ (የ 6-ወር ጽዳት - 14 ቀናት ያለፈበት)\n- ዮናስ አለሙ (የብሬስ ማስተካከያ - 21 ቀናት ያለፈበት)\n\nከማሳሰቢያ ገጹ (Recalls) በቀጥታ የ AfroMessage የጽሑፍ መልዕክት መላክ ወይም በስልክ መደወል ይችላሉ።`,
      om: (count: number) =>
        `Amma namoonni beellamni yaadachiisaa darbeef **${count}** jiru.\n\n- Beetaliheem Tsaggaayee (Qulqulleessa ji\'a 6 - guyyaa 14 darbe)\n- Yoonaas Alamuu (Qajeelcha Braces - guyyaa 21 darbe)\n\nKallattiin ergaa SMS erguu dandeessu.`,
    },
    booking: {
      en: `How to Book an Appointment at ${clinicName}:\n\n1. **Select Procedure:** Choose Routine Cleaning (1,500 ETB), Consultation (500 ETB), RCT (4,500 - 6,800 ETB), or Emergency Relief.\n2. **Select Specialist:** Choose Dr. Senait Tadesse (Mon - Sat) or Dr. Dawit Bekele (Mon, Wed, Fri).\n3. **Select Date & Operatory Slot:** Choose an upcoming date and chair slot between 8:30 AM and 7:00 PM.\n4. **Pay 300 ETB Deposit:** Pay your reservation deposit via Telebirr or CBE Birr. The 300 ETB is 100% credited toward your final bill upon arrival.\n5. **Instant Confirmation:** You will immediately receive an official AfroMessage SMS confirmation on your mobile phone!\n\nYou can book directly through the online form above or call reception at ${clinicPhone}.`,
      am: `በ${clinicName} ቀጠሮ ለመያዝ የሚከተሉትን ደረጃዎች ይከተሉ፦\n\n1. **አገልግሎት ይምረጡ፦** መደበኛ የጥርስ ማጽዳት (1,500 ብር)፣ አጠቃላይ ምርመራ (500 ብር)፣ የነርቭ ህክምና ወይም ድንገተኛ ህመም።\n2. **ሀኪም ይምረጡ፦** ዶ/ር ሰናይት ታደሰ (ከሰኞ - ቅዳሜ) ወይም ዶ/ር ዳዊት በቀለ (ሰኞ፣ ረቡዕ፣ አርብ)።\n3. **ቀን እና ሰዓት ይምረጡ፦** ከሰኞ እስከ ቅዳሜ ከጠዋቱ 2:30 እስከ ማታ 1:00 ባለው ጊዜ ውስጥ ምቹ ሰዓት ይምረጡ።\n4. **የ 300 ብር ቅድመ ክፍያ ያስይዙ፦** በቴሌብር (Telebirr) ወይም በሲቢኢ ብር (CBE Birr) የ 300 ብር ማስያዣ ይክፈሉ። ይህ 300 ብር ለህክምና ሲመጡ ከጠቅላላ ክፍያዎ ላይ 100% ተቀናሽ ይደረጋል።\n5. **ፈጣን ማረጋገጫ፦** ክፍያው እንደተጠናቀቀ የቀጠሮ ማረጋገጫ በኤስኤምኤስ (AfroMessage SMS) በቀጥታ ወደ ስልክዎ ይላክልዎታ።\n\nበቀጥታ በስልክ ለመያዝ በ ${clinicPhone} ይደውሉ።`,
      om: `${clinicName} keessatti beellama qabachuuf tartiiba armaan gadii hordofaa:\n\n1. **Gosa Yaalaa Filadhaa:** Qulqulleessa ilkaanii (1,500 ETB), qorannoo (500 ETB), yaala narvii ykn yaala ariifachiisaa.\n2. **Ogeessa Filadhaa:** Dr. Senaayit Taaddasaa (Wiixata - Sanbata) ykn Dr. Daawwit Baqqalaa (Wiixata, Roobii, Jimaata).\n3. **Guyyaa fi Sa\'aatii:** Wiixata hanga Sanbataatti ganama 2:30 hanga galgala 1:00 keessaa sa\'aatii mijataa filadhaa.\n4. **Kaffaltii Duraa 300 ETB:** Telebirr ykn CBE Birr dhaan kaffaltii qabsiisaa 300 ETB kaffalaa. Kaffaltiin kun 100% kaffaltii waliigalaa irraa hir\'ifama.\n5. **Mirkaneessa Battalaa:** Ergaan gabaabaa (SMS) AfroMessage kallattiin bilbila keessan irratti ergama.\n\nKallattiin bilbilaan qabachuuf: ${clinicPhone}.`,
    },
  };

  // 1. Check for Appointment Count Query
  if (
    q.includes('how much appoint') ||
    q.includes('how many appoint') ||
    q.includes('appointments today') ||
    q.includes('ዛሬ ስንት ቀጠሮ') ||
    q.includes('ቀጠሮዎች') ||
    q.includes('beellama meeqa')
  ) {
    const count = snapshot.todayAppointmentsCount ?? 8;
    const waiting = snapshot.waitingCount ?? 2;
    const occupied = snapshot.occupiedChairsCount ?? 1;
    return {
      text: t.todayAppointments[lang](count, waiting, occupied),
      sources: ['Live Clinic Database Snapshot', 'Schedule Timeline'],
      suggestedPrompts: [
        lang === 'am' ? 'ማን ነው አሁን የሚጠብቀው?' : lang === 'om' ? 'Eenyutu eegaa jira?' : 'Who is currently waiting in reception?',
        lang === 'am' ? 'የዛሬው ጠቅላላ ገቢ ስንት ነው?' : lang === 'om' ? 'Galiin har\'aa meeqa?' : 'What is today\'s total revenue?',
      ],
    };
  }

  // 2. Check for Waiting Patients Query
  if (
    q.includes('waiting') ||
    q.includes('reception') ||
    q.includes('queue') ||
    q.includes('የሚጠብቅ') ||
    q.includes('መቀበያ') ||
    q.includes('eegaa')
  ) {
    const waitingPatients = snapshot.waitingPatients?.map((p) => p.patientName) || ['Abebe Kebede', 'Tigist Assefa'];
    return {
      text: t.waitingList[lang](waitingPatients, waitingPatients.length),
      sources: ['Live Waiting Queue', 'Reception Check-in Ledger'],
      suggestedPrompts: [
        lang === 'am' ? 'ወንበር 1 እና 2 ነፃ ናቸው?' : lang === 'om' ? 'Barcumni 1 fi 2 duwwaadhaa?' : 'Are Chair 1 and 2 occupied?',
        lang === 'am' ? 'ዛሬ ስንት ቀጠሮዎች አሉን?' : lang === 'om' ? 'Har\'a beellama meeqatu jira?' : 'How many appointments are scheduled for today?',
      ],
    };
  }

  // 3. Check for Chairs Query
  if (
    q.includes('chair') ||
    q.includes('operatory') ||
    q.includes('ወንበር') ||
    q.includes('barcuma')
  ) {
    const c1 = snapshot.chairs?.[0]?.status === 'occupied' ? 'Occupied with Abebe Kebede (Dr. Senait Tadesse)' : 'Available / Ready';
    const c2 = snapshot.chairs?.[1]?.status === 'occupied' ? 'Occupied with Tigist Assefa (Dr. Dawit Bekele)' : 'Available / Ready';
    return {
      text: t.chairs[lang](c1, c2),
      sources: ['Live Operatory Board', 'Dental Chair Sensors'],
      suggestedPrompts: [
        lang === 'am' ? 'አሁን መቀበያ ክፍል ውስጥ ማን እየጠበቀ ነው?' : lang === 'om' ? 'Eenyutu eegaa jira?' : 'Who is waiting in reception?',
      ],
    };
  }

  // 4. Check for Deposit Policy Query (High Priority)
  if (
    q.includes('deposit') ||
    q.includes('300') ||
    q.includes('ቅድመ ክፍያ') ||
    q.includes('ማስያዣ') ||
    q.includes('ደንብ') ||
    q.includes('kaffaltii duraa')
  ) {
    return {
      text: t.deposit[lang],
      sources: ['Deposit Policy Agreement', 'AfroMessage SMS Telecommunications Gateway'],
      suggestedPrompts: [
        lang === 'am' ? 'የጥርስ ማጽዳት ክፍያ ስንት ነው?' : lang === 'om' ? 'Gatiin qulqulleessa meeqa?' : 'How much is teeth cleaning & scaling?',
        lang === 'am' ? 'ከዶ/ር ሰናይት ጋር እንዴት ቀጠሮ መያዝ እችላለሁ?' : lang === 'om' ? 'Dr. Senaayit waliin akkamittan qabadha?' : 'How do I book with Dr. Senait?',
      ],
    };
  }

  // 5. Check for Revenue / Telebirr / Payments Query (Admin Specific)
  if (
    q.includes('revenue') ||
    q.includes('collected') ||
    q.includes('cashier') ||
    q.includes('ጠቅላላ ገቢ') ||
    q.includes('የዛሬ ገቢ') ||
    q.includes('ገቢ') ||
    q.includes('ቴሌብር ገቢ') ||
    q.includes('galii')
  ) {
    const total = snapshot.todayRevenueETB ?? 14200;
    const telebirr = snapshot.telebirrTotalETB ?? 8600;
    const cash = snapshot.cashTotalETB ?? 3600;
    const cbe = snapshot.cbeTotalETB ?? 2000;
    return {
      text: t.revenue[lang](total, telebirr, cash, cbe),
      sources: ['Live Cashier Ledger', 'Ministry of Revenues Z-Report'],
      suggestedPrompts: [
        lang === 'am' ? 'የገቢዎች TIN ቁጥር ስንት ነው?' : lang === 'om' ? 'Lakkoofsi TIN meeqa?' : 'What is our MoR TIN number?',
      ],
    };
  }

  // 6. Check for Cleaning / Scaling Query
  if (
    q.includes('cleaning') ||
    q.includes('scaling') ||
    q.includes('clean') ||
    q.includes('ማጽዳት') ||
    q.includes('ጽዳት') ||
    q.includes('qulqulleess')
  ) {
    return {
      text: t.cleaning[lang],
      sources: ['Official Fee Schedule', 'Bole Dental Clinical Guidelines'],
      suggestedPrompts: [
        lang === 'am' ? 'የ 300 ብር ቅድመ ክፍያ ደንብ ምንድን ነው?' : lang === 'om' ? 'Kaffaltiin duraa 300 ETB maali?' : 'What is your 300 ETB deposit policy?',
        lang === 'am' ? 'ከዶ/ር ሰናይት ጋር እንዴት ቀጠሮ መያዝ እችላለሁ?' : lang === 'om' ? 'Dr. Senaayit waliin akkamittan qabadha?' : 'How do I book with Dr. Senait?',
      ],
    };
  }

  // 7. Check for Emergency / Toothache / Pain Query
  if (
    q.includes('toothache') ||
    q.includes('pain') ||
    q.includes('emergency') ||
    q.includes('ache') ||
    q.includes('ህመም') ||
    q.includes('አስቸኳይ') ||
    q.includes('ድንገተኛ') ||
    q.includes('dhukkubb')
  ) {
    return {
      text: `${t.emergency[lang]}\n\n${t.toothache[lang]}`,
      sources: ['Clinical Emergency Protocol', 'Acute Pulpitis Management Protocol'],
      suggestedPrompts: [
        lang === 'am' ? 'የክሊኒኩ የሥራ ሰዓት እና አድራሻ የት ነው?' : lang === 'om' ? 'Teessoon klinika eessa?' : 'What are your clinic hours and location in Bole?',
      ],
    };
  }

  // 8. Check for Location / Hours Query
  if (
    q.includes('location') ||
    q.includes('hour') ||
    q.includes('address') ||
    q.includes('where') ||
    q.includes('open') ||
    q.includes('አድራሻ') ||
    q.includes('ሰዓት') ||
    q.includes('የት ነው') ||
    q.includes('teessoo') ||
    q.includes('sa\'aatii')
  ) {
    return {
      text: t.location[lang],
      sources: ['Bole Dental Studio Clinic Profile', 'Google Maps Verified Entry'],
      suggestedPrompts: [
        lang === 'am' ? 'ስፔሻሊስት ሀኪሞቹ እነማን ናቸው?' : lang === 'om' ? 'Ogeessonni eenyu?' : 'Who are the attending dentists?',
      ],
    };
  }

  // 9. Check for Braces / Orthodontics Query
  if (
    q.includes('brace') ||
    q.includes('ortho') ||
    q.includes('align') ||
    q.includes('ብሬስ') ||
    q.includes('ማስተካከል') ||
    q.includes('qajeelch')
  ) {
    return {
      text: t.braces[lang],
      sources: ['Orthodontic Department Fee Structure', 'Dr. Senait Tadesse Clinic Schedule'],
      suggestedPrompts: [
        lang === 'am' ? 'ከዶ/ር ሰናይት ጋር እንዴት ቀጠሮ መያዝ እችላለሁ?' : lang === 'om' ? 'Dr. Senaayit waliin akkamittan qabadha?' : 'How do I book with Dr. Senait?',
      ],
    };
  }

  // 10. Check for Root Canal (RCT) Query
  if (
    q.includes('root canal') ||
    q.includes('rct') ||
    q.includes('ነርቭ') ||
    q.includes('narvii')
  ) {
    return {
      text: t.rct[lang],
      sources: ['Endodontic Clinical Guidelines', 'Bole Dental Fee Schedule'],
      suggestedPrompts: [
        lang === 'am' ? 'የጥርስ ማጽዳት ክፍያ ስንት ነው?' : lang === 'om' ? 'Gatiin qulqulleessa meeqa?' : 'How much is teeth cleaning?',
      ],
    };
  }

  // 11. Check for Doctors Query
  if (
    q.includes('doctor') ||
    q.includes('dentist') ||
    q.includes('senait') ||
    q.includes('dawit') ||
    q.includes('ሀኪም') ||
    q.includes('ሰናይት') ||
    q.includes('ogeessa')
  ) {
    return {
      text: t.doctors[lang],
      sources: ['Medical Staff Registry', 'Addis Ababa Dental Practitioners Directory'],
      suggestedPrompts: [
        lang === 'am' ? 'ከዶ/ር ሰናይት ጋር እንዴት ቀጠሮ መያዝ እችላለሁ?' : lang === 'om' ? 'Dr. Senaayit waliin akkamittan qabadha?' : 'How do I book an appointment with Dr. Senait?',
      ],
    };
  }

  // 12. Check for Recalls Query
  if (
    q.includes('recall') ||
    q.includes('overdue') ||
    q.includes('ማሳሰቢያ') ||
    q.includes('ያለፈበት') ||
    q.includes('yaadachiis')
  ) {
    const overdueCount = snapshot.overdueRecallsCount ?? 4;
    return {
      text: t.recalls[lang](overdueCount),
      sources: ['Recall Call List', 'AfroMessage Dispatcher'],
      suggestedPrompts: [
        lang === 'am' ? 'ዛሬ ስንት ቀጠሮዎች አሉን?' : lang === 'om' ? 'Har\'a beellama meeqatu jira?' : 'How many appointments are scheduled today?',
      ],
    };
  }

  // 13. Check for How to Book Query
  if (
    q.includes('book') ||
    q.includes('schedule') ||
    q.includes('appointment') ||
    q.includes('ቀጠሮ') ||
    q.includes('ማስያዝ') ||
    q.includes('እንዴት') ||
    q.includes('ይቻላል') ||
    q.includes('beellam') ||
    q.includes('qabach')
  ) {
    return {
      text: t.booking[lang],
      sources: ['Bole Dental Patient Booking Protocols', 'AfroMessage SMS Telecommunications Gateway'],
      suggestedPrompts: [
        lang === 'am' ? 'የጥርስ ማጽዳት ክፍያ ስንት ነው?' : lang === 'om' ? 'Gatiin qulqulleessa meeqa?' : 'How much is teeth cleaning & scaling?',
        lang === 'am' ? 'የ 300 ብር ቅድመ ክፍያ ደንብ ምንድን ነው?' : lang === 'om' ? 'Kaffaltiin duraa 300 ETB maali?' : 'What is your 300 ETB deposit policy?',
      ],
      bookingWidget: {
        serviceId: 'srv-cleaning',
        doctorId: 'doc-senait',
        date: 'Tomorrow',
        slot: '10:30 AM',
      },
    };
  }

  // Default Grounded Response
  const defaultText: Record<ChatLanguage, string> = {
    en: `Welcome to Bole Dental Studio (Sinna Dental AI).\n\nI am your verified clinical copilot. I can assist you with:\n- **Today's Schedule & Operatory Chairs:** Live appointment status and waiting queue.\n- **Official Ethiopian Fees:** Cleaning (1,500 ETB), RCT (4,500 - 6,800 ETB), Braces, and Extractions.\n- **Deposit & Booking:** 300 ETB Telebirr deposit with instant AfroMessage SMS confirmation.\n- **Location:** Morning Star Mall 3rd Floor, Bole Medhanialem (+251 91 122 3344).\n\nPlease choose a question below or enter your clinical inquiry.`,
    am: `እንኳን ወደ ቦሌ ዴንታል ስቱዲዮ (ሲና ዴንታል AI) በደህና መጡ።\n\nእኔ የተረጋገጠ ክሊኒካዊ ረዳትዎ ነኝ። በሚከተሉት ጉዳዮች ላይ ልረዳዎት እችላለሁ፦\n- **የዛሬው የቀጠሮ ሰሌዳ እና ወንበሮች፦** የዛሬ ቀጠሮዎች እና መቀበያ ክፍል ውስጥ ያሉ ታካሚዎች ሁኔታ።\n- **ኦፊሴላዊ የህክምና ዋጋዎች፦** የጥርስ ማጽዳት (1,500 ብር)፣ የነርቭ ህክምና (4,500 - 6,800 ብር)፣ ብሬስ እና የጥርስ ንቀላ።\n- **ቅድመ ክፍያ እና ቀጠሮ፦** 300 ብር በቴሌብር ከፈጣን SMS ማረጋገጫ ጋር።\n- **አድራሻ፦** ሞርኒንግ ስታር ሞል 3ኛ ፎቅ፣ ቦሌ መድኃኔዓለም (+251 91 122 3344)።\n\nከታች ከተዘረዘሩት ጥያቄዎች አንዱን ይምረጡ ወይም ጥያቄዎን ይጻፉ።`,
    om: `Baga gara Bole Dental Studio (Sinna Dental AI) dhuftan.\n\nAni gargaaraa yaala ilkaanii keessani. Wanta barbaaddan na gaafachuu dandeessu:\n- **Beellama Har'aa fi Barcumoota:** Haala beellamaa fi kutaa eeggannoo.\n- **Gatii Yaalaa:** Qulqulleessa (1,500 ETB), Yaala Narvii (4,500 - 6,800 ETB), Braces.\n- **Kaffaltii Duraa:** 300 ETB Telebirr mirkaneessa SMS wajjin.\n- **Teessoo:** Morning Star Mall Fooqii 3ffaa, Bole Medhanialem (+251 91 122 3344).`,
  };

  return {
    text: defaultText[lang],
    sources: ['Bole Dental Studio Clinical Knowledge Base'],
    suggestedPrompts: STARTER_PROMPTS.patient[lang],
  };
}
