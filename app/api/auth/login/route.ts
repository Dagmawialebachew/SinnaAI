import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySecret, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, stationName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanInput = (email as string).toLowerCase().trim();

    // 1. Fast path for standard demo credentials (Doctor, Reception, Admin)
    const isAdmin =
      cleanInput === 'admin@gmail.com' ||
      cleanInput === 'admin@boledental.et' ||
      cleanInput === 'admin';

    const isDoctor =
      cleanInput === 'doctor@boledental.et' ||
      cleanInput === 'senait@boledental.et' ||
      cleanInput === 'doctor' ||
      cleanInput === 'senait';

    const isReception =
      cleanInput === 'reception@boledental.et' ||
      cleanInput === 'helen@boledental.et' ||
      cleanInput === 'reception' ||
      cleanInput === 'helen';

    const isValidPassword = password === 'Password123' || password === 'Password123!';

    if (isAdmin && isValidPassword) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'usr-owner-1',
          name: 'Ato Dawit Tadesse',
          email: 'admin@gmail.com',
          role: 'admin',
          title: 'Practice Owner & System Administrator',
          stationName: stationName || 'Executive Suite & Admin Console',
          clinic: {
            id: 'cln-bole-1',
            name: 'Bole Dental Studio',
            slug: 'bole-dental',
            tinNumber: '0049283711',
          },
        },
      });
    }

    if ((isDoctor || isReception) && isValidPassword) {
      return NextResponse.json({
        success: true,
        user: isDoctor
          ? {
              id: 'usr-doctor-1',
              name: 'Dr. Senait Tadesse',
              email: 'doctor@boledental.et',
              role: 'doctor',
              title: 'Clinical Director & Lead Surgeon',
              stationName: stationName || 'Chair 1 Operatory & Management',
              clinic: {
                id: 'cln-bole-1',
                name: 'Bole Dental Studio',
                slug: 'bole-dental',
                tinNumber: '0049283711',
              },
            }
          : {
              id: 'usr-reception-1',
              name: 'Helen Tadesse',
              email: 'reception@boledental.et',
              role: 'reception',
              title: 'Front Desk Coordinator & Cashier',
              stationName: stationName || 'Reception Station #1',
              clinic: {
                id: 'cln-bole-1',
                name: 'Bole Dental Studio',
                slug: 'bole-dental',
                tinNumber: '0049283711',
              },
            },
      });
    }

    // 2. Try PostgreSQL authentication if database is online
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanInput },
            cleanInput.includes('doctor') || cleanInput.includes('senait')
              ? { role: { in: ['DENTIST', 'CLINIC_ADMIN'] } }
              : cleanInput.includes('reception') || cleanInput.includes('helen')
              ? { role: 'RECEPTIONIST' }
              : { email: cleanInput },
          ],
          isActive: true,
        },
        include: {
          clinic: true,
          doctorProfile: true,
        },
      });

      if (user) {
        const isValid = await verifySecret(password, user.passwordHash);
        if (isValid) {
          const session = await createSession(user.id, stationName);
          const mappedRole = (user.role === 'DENTIST' || user.role === 'CLINIC_ADMIN') ? 'doctor' : 'reception';
          return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              name: user.fullName,
              email: user.email,
              role: mappedRole,
              title: user.titleEn,
              stationName: session.stationName || stationName || 'Clinic Workstation',
              clinic: {
                id: user.clinic.id,
                name: user.clinic.name,
                slug: user.clinic.slug,
                tinNumber: user.clinic.tinNumber,
              },
            },
          });
        }
      }
    } catch (dbError) {
      console.warn('PostgreSQL query skipped or unavailable, using local clinical fallback:', dbError);
    }

    return NextResponse.json(
      { error: 'Invalid clinical credentials. Please check your email and password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal clinical authentication failure' },
      { status: 500 }
    );
  }
}
