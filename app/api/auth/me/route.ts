import { NextResponse } from 'next/server';
import { getActiveSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getActiveSession();

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.fullName,
        email: session.user.email,
        role: session.user.role,
        title: session.user.titleEn,
        stationName: session.stationName || 'Clinic Workstation',
        clinic: {
          id: session.user.clinic.id,
          name: session.user.clinic.name,
          slug: session.user.clinic.slug,
          tinNumber: session.user.clinic.tinNumber,
        },
      },
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ authenticated: false, error: 'Session check failed' }, { status: 500 });
  }
}
