import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:sinna_secret_2026@localhost:5433/sinna_dental_db?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Sinna Dental Clinic OS Database...');

  // 1. Upsert Clinic Profile
  const clinic = await prisma.clinic.upsert({
    where: { slug: 'bole-dental' },
    update: {},
    create: {
      slug: 'bole-dental',
      name: 'Bole Dental Studio',
      taglineEn: 'Modern, Painless Dentistry in Addis Ababa',
      taglineAm: 'ዘመናዊ እና ህመም የሌለው የጥርስ ህክምና በቦሌ',
      location: 'Bole Medhanialem, Morning Star Mall 3rd Floor',
      phone: '+251 91 122 3344',
      tinNumber: '0049283711',
      depositPolicyETB: 300.00,
      openHours: 'Mon - Sat: 8:30 AM - 7:00 PM',
    },
  });

  console.log(`Clinic configured: ${clinic.name} (${clinic.id})`);

  // Salt and hash passwords & station PINs
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password123!', salt);
  const helenPinHash = await bcrypt.hash('1234', salt);
  const senaitPinHash = await bcrypt.hash('5678', salt);
  const yohannesPinHash = await bcrypt.hash('9999', salt);

  // 2. Upsert Clinical Users
  // Front Desk
  const helen = await prisma.user.upsert({
    where: { email: 'helen@boledental.et' },
    update: {},
    create: {
      clinicId: clinic.id,
      email: 'helen@boledental.et',
      phone: '+251 91 100 2233',
      fullName: 'Helen Tadesse',
      role: UserRole.RECEPTIONIST,
      titleEn: 'Front Desk Coordinator & Cashier',
      titleAm: 'የፊት ዴስክ አስተባባሪ እና ገንዘብ ተቀባይ',
      passwordHash: defaultPasswordHash,
      pinHash: helenPinHash,
      isActive: true,
    },
  });

  // Doctor / Surgeon
  const senait = await prisma.user.upsert({
    where: { email: 'senait@boledental.et' },
    update: {},
    create: {
      clinicId: clinic.id,
      email: 'senait@boledental.et',
      phone: '+251 91 144 5566',
      fullName: 'Dr. Senait Tadesse',
      role: UserRole.DENTIST,
      titleEn: 'Lead Specialist & Oral Surgeon',
      titleAm: 'ዋና የጥርስ ህክምና ስፔሻሊስት እና የቀዶ ጥገና ሐኪም',
      passwordHash: defaultPasswordHash,
      pinHash: senaitPinHash,
      isActive: true,
      doctorProfile: {
        create: {
          specialty: 'Oral & Maxillofacial Surgery',
          licenseNumber: 'ETH-MOH-2015-883',
          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        },
      },
    },
  });

  // Practice Director / Admin
  const yohannes = await prisma.user.upsert({
    where: { email: 'yohannes@boledental.et' },
    update: {},
    create: {
      clinicId: clinic.id,
      email: 'yohannes@boledental.et',
      phone: '+251 91 188 9900',
      fullName: 'Dr. Yohannes K.',
      role: UserRole.CLINIC_ADMIN,
      titleEn: 'Practice Director & Owner',
      titleAm: 'የክሊኒኩ ባለቤት እና ዳይሬክተር',
      passwordHash: defaultPasswordHash,
      pinHash: yohannesPinHash,
      isActive: true,
    },
  });

  console.log('Clinical staff seeded: Helen (Reception), Dr. Senait (Dentist), Dr. Yohannes (Admin)');

  // 3. Operatory Chairs
  const chairConfigs = [
    { chairNumber: 1, name: 'Chair 1', roomName: 'Surgical Operatory' },
    { chairNumber: 2, name: 'Chair 2', roomName: 'Hygiene & Scaling Suite' },
    { chairNumber: 3, name: 'Chair 3', roomName: 'Orthodontics & Consult' },
  ];

  for (const c of chairConfigs) {
    await prisma.operatoryChair.upsert({
      where: {
        clinicId_chairNumber: {
          clinicId: clinic.id,
          chairNumber: c.chairNumber,
        },
      },
      update: {},
      create: {
        clinicId: clinic.id,
        chairNumber: c.chairNumber,
        name: c.name,
        roomName: c.roomName,
        status: 'available',
      },
    });
  }

  // 4. Dental Services Catalog (ETB Pricing)
  const servicesData = [
    {
      nameEn: 'Routine Cleaning & Scaling',
      nameAm: 'መደበኛ የጥርስ ማጽዳት እና ፖሊሽ',
      durationMinutes: 45,
      priceETB: 1500.00,
      depositRequired: true,
      depositETB: 300.00,
      description: 'Ultrasonic calculus removal, stain polishing, and gum health inspection.',
    },
    {
      nameEn: 'Emergency Pain Relief & Exam',
      nameAm: 'አስቸኳይ የጥርስ ህመም ማስታገሻ እና ምርመራ',
      durationMinutes: 30,
      priceETB: 1200.00,
      depositRequired: false,
      depositETB: 0.00,
      description: 'Immediate diagnostic assessment and acute pulpal pain management.',
    },
    {
      nameEn: 'Composite Tooth-Colored Filling',
      nameAm: 'የጥርስ ቀለም ያለው ሙሌት',
      durationMinutes: 45,
      priceETB: 1800.00,
      depositRequired: true,
      depositETB: 300.00,
      description: 'Light-cured composite resin for aesthetic anterior or posterior restoration.',
    },
    {
      nameEn: 'Molar Surgical Extraction',
      nameAm: 'የመንጋጋ ጥርስ ቀዶ ጥገና ነቀላ',
      durationMinutes: 60,
      priceETB: 2500.00,
      depositRequired: true,
      depositETB: 500.00,
      description: 'Atraumatic surgical molar removal with local anesthesia and sterile closure.',
    },
    {
      nameEn: 'Root Canal Treatment (Molar)',
      nameAm: 'የጥርስ ስር ህክምና (ነርቭ ማከም)',
      durationMinutes: 90,
      priceETB: 5500.00,
      depositRequired: true,
      depositETB: 1000.00,
      description: 'Complete mechanical instrumentation, disinfection, and warm gutta-percha obturation.',
    },
    {
      nameEn: 'Zirconia / Ceramic Crown',
      nameAm: 'የጥርስ ሸክላ ክዳን',
      durationMinutes: 60,
      priceETB: 7000.00,
      depositRequired: true,
      depositETB: 1500.00,
      description: 'High-strength CAD/CAM monolithic zirconia crown restoration.',
    },
  ];

  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({
      where: { clinicId: clinic.id, nameEn: s.nameEn },
    });
    if (!existing) {
      await prisma.service.create({
        data: {
          clinicId: clinic.id,
          ...s,
        },
      });
    }
  }

  // 5. Sample Patients
  const abe = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      fullName: 'Abebe Kebede',
      phone: '+251 91 122 3344',
      emergencyPhone: '+251 91 199 8877',
      medicalAlerts: [
        { id: 'al-1', type: 'allergy', labelEn: 'Penicillin Allergy', labelAm: 'የፔኒሲሊን አለርጂ', severity: 'high' },
        { id: 'al-2', type: 'medical', labelEn: 'Mild Hypertension', labelAm: 'መለስተኛ የደም ግፊት', severity: 'medium' },
      ],
      toothRecords: {
        create: [
          { toothNumber: 36, status: 'rct', notes: 'Completed RCT with Dr. Senait', recordedById: senait.id },
          { toothNumber: 47, status: 'filled', notes: 'Composite restoration', recordedById: senait.id },
        ],
      },
    },
  });

  const sara = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      fullName: 'Sara Tesfaye',
      phone: '+251 92 345 6789',
      medicalAlerts: [],
      toothRecords: {
        create: [
          { toothNumber: 11, status: 'filled', notes: 'Class IV aesthetic resin', recordedById: senait.id },
        ],
      },
    },
  });

  console.log(`Patients seeded: ${abe.fullName}, ${sara.fullName}`);
  console.log('Sinna Dental OS database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
