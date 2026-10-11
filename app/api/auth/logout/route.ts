import { NextResponse } from 'next/server';
import { terminateSession } from '@/lib/auth';

export async function POST() {
  try {
    await terminateSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to terminate session' }, { status: 500 });
  }
}
