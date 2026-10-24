'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { useSinnaStore, sinnaStore, DEFAULT_USERS, getClinicData } from '@/lib/store';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setSuccessMessage(`Welcome back, ${data.user.name}`);
        sinnaStore.loginAs({
          id: data.user.id,
          name: data.user.name,
          role: data.user.role as UserRole,
          title: data.user.title,
          stationName: data.user.stationName || 'Workstation',
        });

        const targetRoute = data.user.role === 'admin' ? '/admin' : '/';
        setTimeout(() => {
          router.push(targetRoute);
        }, 300);
      } else {
        setErrorMessage(data.error || 'Invalid email or password');
      }
    } catch {
      // Local fallback
      const isAdmin = cleanEmail === 'admin@gmail.com' || cleanEmail.includes('admin');
      const isDoc = cleanEmail.includes('doctor') || cleanEmail.includes('senait');
      const isRecep = cleanEmail.includes('reception') || cleanEmail.includes('helen');
      const isValidPassword = password === 'Password123' || password === 'Password123!';

      if ((isAdmin || isDoc || isRecep) && isValidPassword) {
        const user = isAdmin ? DEFAULT_USERS.admin : isDoc ? DEFAULT_USERS.doctor : DEFAULT_USERS.reception;
        setSuccessMessage(`Welcome back, ${user.name}`);
        sinnaStore.loginAs(user);
        const targetRoute = isAdmin ? '/admin' : '/';
        setTimeout(() => {
          router.push(targetRoute);
        }, 300);
      } else {
        setErrorMessage('Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (role: 'doctor' | 'reception' | 'admin') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (role === 'admin') {
      setEmail('admin@gmail.com');
      setPassword('Password123');
    } else if (role === 'doctor') {
      setEmail('doctor@boledental.et');
      setPassword('Password123!');
    } else {
      setEmail('reception@boledental.et');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-100">
      {/* 1. TOP MINIMALIST HEADER */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C7.5 2 4 4.5 4 8c0 3.5 1.5 6 3 9 1 2 2 5 5 5s4-3 5-5c1.5-3 3-5.5 3-9 0-3.5-3.5-6-8-6z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base tracking-tight">
              Sinna Dental AI
            </span>
            <p className="text-[11px] text-slate-500">
              {clinic.name} · {clinic.location}
            </p>
          </div>
        </div>

        <div>
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <span>Public Booking</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. AUTHENTICATION CARD */}
      <main className="w-full max-w-sm mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-card">
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 text-blue-600 mb-3 border border-blue-100">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sinna Dental AI
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to your clinical account
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Single Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@clinic.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Credentials (Fills Email & Password) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Quick Fill Demo Credentials
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('doctor')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 text-left transition-all"
              >
                <span className="font-bold text-slate-800 block text-[11px]">Doctor</span>
                <span className="text-[10px] text-slate-500 block truncate font-mono">doctor@boledental.et</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('reception')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 text-left transition-all"
              >
                <span className="font-bold text-slate-800 block text-[11px]">Front Desk</span>
                <span className="text-[10px] text-slate-500 block truncate font-mono">reception@boledental.et</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('admin')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 text-left transition-all"
              >
                <span className="font-bold text-slate-800 block text-[11px]">Admin / Owner</span>
                <span className="text-[10px] text-slate-500 block truncate font-mono">admin@gmail.com</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
        <span>Sinna Dental AI</span>
        <span>Addis Ababa, Ethiopia</span>
      </footer>
    </div>
  );
}
