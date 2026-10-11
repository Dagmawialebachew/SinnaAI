'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Calendar,
  Users,
  Bell,
  FileText,
  FileCheck,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  AlertTriangle,
  Search,
  Menu,
  X,
  Plus,
  HelpCircle,
  Sun,
  LayoutGrid,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Phone,
  Globe
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { BookingModal } from '@/components/booking-modal';
import { SmsToast } from '@/components/sms-toast';
import { ClinicalToastContainer } from '@/components/clinical-toast';
import { SmsDrawer } from '@/components/sms-drawer';
import { PatientRecordDrawer } from '@/components/patient-record-drawer';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: string | null;
  badgeColor?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useSinnaStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [smsDrawerOpen, setSmsDrawerOpen] = useState(false);
  const [patientDrawerOpen, setPatientDrawerOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // If patient public booking or dedicated login page, skip internal shell
  if (pathname?.startsWith('/c/') || pathname === '/book' || pathname === '/login') {
    return <>{children}</>;
  }

  const clinic = getClinicData(store.activeClinicSlug);

  const safeAppointments = Array.isArray(store.appointments) ? store.appointments : [];
  const safeChairs = Array.isArray(store.chairs) ? store.chairs : [];
  const waitingCount = safeAppointments.filter((a) => a.status === 'checked_in').length;
  const occupiedChairsCount = safeChairs.filter((c) => c.status === 'occupied').length;

  const isDoctor = store.currentUser?.role === 'doctor' || store.currentUser?.role === 'admin';

  // Organized Categories matching DentalPin Screenshot 1 & 2
  const navSections: NavSection[] = [
    {
      items: [
        {
          name: 'Home',
          href: '/',
          icon: Home,
          active: pathname === '/',
        },
        {
          name: 'Schedule',
          href: '/schedule',
          icon: Calendar,
          active: pathname === '/schedule' || pathname === '/reception',
          badge: waitingCount > 0 ? `${waitingCount} waiting` : null,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        },
      ],
    },
    {
      title: 'CLINICAL',
      items: [
        {
          name: 'Patients',
          href: '/patients',
          icon: Users,
          active: pathname === '/patients',
        },
        {
          name: 'Recalls',
          href: '/recalls',
          icon: Bell,
          active: pathname === '/recalls',
          badge: '4 due',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        },
        ...(isDoctor
          ? [
              {
                name: 'Treatment Plans',
                href: '/treatment-plans',
                icon: FileText,
                active: pathname === '/treatment-plans' || pathname === '/odontogram' || pathname === '/doctor',
                badge: occupiedChairsCount > 0 ? `${occupiedChairsCount} chair` : null,
                badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              },
            ]
          : []),
      ],
    },
    {
      title: 'FINANCIALS',
      items: [
        ...(isDoctor
          ? [
              {
                name: 'Quotes',
                href: '/quotes',
                icon: FileCheck,
                active: pathname === '/quotes',
              },
            ]
          : []),
        {
          name: 'Invoices',
          href: '/invoices',
          icon: Receipt,
          active: pathname === '/invoices',
        },
        {
          name: 'Payments',
          href: '/payments',
          icon: CreditCard,
          active: pathname === '/payments' || pathname === '/manager',
        },
      ],
    },
    {
      title: 'PRACTICE',
      items: [
        {
          name: 'Reports',
          href: '/reports',
          icon: BarChart3,
          active: pathname === '/reports',
          badge: store.isDayClosed ? 'Closed' : null,
          badgeColor: 'bg-slate-200 text-slate-700 border-slate-300',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100">
      <div className="flex-1 flex min-h-0">
        {/* 2. ORGANIZED LEFT SIDEBAR (Matches Screenshot 1 & 2) */}
        <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-slate-200/90 shrink-0 sticky top-0 h-screen z-30">
          {/* Logo Header */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C7.5 2 4 4.5 4 8c0 3.5 1.5 6 3 9 1 2 2 5 5 5s4-3 5-5c1.5-3 3-5.5 3-9 0-3.5-3.5-6-8-6z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">
              Sinna Dental
            </span>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                {section.title && (
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        item.active
                          ? 'bg-blue-50 text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            item.active ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Bottom User Profile Card (Matches Screenshot 1 & 2 bottom left) */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {isDoctor ? 'SD' : 'HT'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {store.currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">
                    {isDoctor ? 'doctor@boledental.et' : 'reception@boledental.et'}
                  </p>
                </div>
              </div>

              {isDoctor && (
                <Link
                  href="/admin"
                  title="Admin Clinic Settings"
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* 3. MAIN WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar (Exact match to Screenshot 1 & 2: Clinic Demo, Help, Logout) */}
          <header className="h-14 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Clinic Name (Matches Screenshot: Clínica Dental Demo / Bole Dental Studio) */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <LayoutGrid className="w-4 h-4 text-slate-400" />
                <span>{clinic.name}</span>
              </div>
            </div>

            {/* Right Action Icons (Help, Theme, Log out) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSmsDrawerOpen(true)}
                className="relative p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                title="AfroMessage SMS Transmissions"
              >
                <Bell className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => alert(`Sinna Dental OS Help: Addis Ababa clinical operations hotline: +251 91 122 3344.`)}
                className="inline-flex items-center gap-1 p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 text-xs transition-colors"
                title="Help & Documentation"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </button>

              <Link
                href="/book"
                target="_blank"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Launch Public Patient Booking Portal (English / Amharic / Afaan Oromoo)"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Patient Site</span>
              </Link>

              <div className="h-4 w-px bg-slate-200" />

              {/* Log out Button (Exact match from Screenshot 1 & 2 top right) */}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Log out from current clinical station"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Log out</span>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Global Drawers & Modals */}
      <SmsToast />
      <ClinicalToastContainer />
      <SmsDrawer isOpen={smsDrawerOpen} onClose={() => setSmsDrawerOpen(false)} />
      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
      )}
      <PatientRecordDrawer
        isOpen={patientDrawerOpen}
        onClose={() => setPatientDrawerOpen(false)}
        appointmentId={selectedPatientId}
      />
    </div>
  );
}
