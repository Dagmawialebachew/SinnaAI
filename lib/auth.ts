import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './db';
export const UserRole = {
  RECEPTIONIST: 'RECEPTIONIST',
  DENTIST: 'DENTIST',
  CLINIC_ADMIN: 'CLINIC_ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SESSION_COOKIE_NAME = 'sinna_session_token';
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 hours

export async function hashSecret(secret: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(secret, salt);
}

export async function verifySecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, stationName?: string) {
  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  // Store in PostgreSQL
  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      stationName,
      expiresAt,
    },
    include: {
      user: {
        include: {
          clinic: true,
          doctorProfile: true,
        },
      },
    },
  });

  // Set HttpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return session;
}

export async function getActiveSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  if (!prisma?.session?.findUnique) {
    return null;
  }

  const tokenHash = hashToken(rawToken);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        include: {
          clinic: true,
          doctorProfile: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return session;
}

export async function terminateSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => null);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
