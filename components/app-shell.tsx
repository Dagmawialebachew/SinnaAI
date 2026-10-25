'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Globe,
  RotateCcw
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { BookingModal } from '@/components/booking-modal';
import { SmsToast } from '@/components/sms-toast';
import { ClinicalToastContainer } from '@/components/clinical-toast';
import { SmsDrawer } from '@/components/sms-drawer';
import ReceptionPatientDrawer from '@/components/reception-patient-drawer';
import DoctorSeatRequestModal from '@/components/doctor-seat-request-modal';
import { SinnaAICopilot } from '@/components/sinna-ai-copilot';

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

  const clinic = getClinicData(store.activeClinicSlug);

  const safeAppointments = Array.isArray(store.appointments) ? store.appointments : [];
  const safeChairs = Array.isArray(store.chairs) ? store.chairs : [];
  const waitingCount = safeAppointments.filter((a) => a.status === 'checked_in').length;
  const occupiedChairsCount = safeChairs.filter((c) => c.status === 'occupied').length;

  const currentRole = store.currentUser?.role || 'reception';
  const isDoctor = currentRole === 'doctor';
  const isOwner = currentRole === 'admin' || store.activePersona === 'manager';

  // For Doctor: Direct navigation to the comprehensive Patient Profile (Photo 2)
  // Erase Photo 1 (PatientRecordDrawer) completely from the doctor experience
  useEffect(() => {
    if (isDoctor && (patientDrawerOpen || store.isPatientDrawerOpen)) {
      const pid = store.selectedPatientRecordId || selectedPatientId;
      setPatientDrawerOpen(false);
      setSelectedPatientId(null);
      sinnaStore.closePatientDrawer();
      if (pid) {
        router.push(`/patients?patientId=${pid}`);
      }
    }
  }, [isDoctor, patientDrawerOpen, store.isPatientDrawerOpen, selectedPatientId, store.selectedPatientRecordId, router]);

  // Role Navigation with Plain Simple Words
  const navSections: NavSection[] = useMemo(() => {
    if (isDoctor) {
      // 1. DOCTOR: Focus on Patient Care (Odontogram is inside Patient Profile)
      return [
        {
          items: [
            {
              name: 'Doctor Home',
              href: '/',
              icon: Home,
              active: pathname === '/',
            },
            {
              name: 'Schedule',
              href: '/schedule',
              icon: Calendar,
              active: pathname === '/schedule',
              badge: waitingCount > 0 ? `${waitingCount} waiting` : null,
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
            },
          ],
        },
        {
          title: 'PATIENT CARE',
          items: [
            {
              name: 'Patients & Alerts',
              href: '/patients',
              icon: Users,
              active: pathname === '/patients',
            },
            {
              name: 'Price Quotes',
              href: '/quotes',
              icon: FileCheck,
              active: pathname === '/quotes',
            },
          ],
        },
      ];
    }

    if (isOwner) {
      // 2. OWNER & MANAGER: Focus on Tax Compliance, Earnings & Settings
      return [
        {
          items: [
            {
              name: 'Clinic Overview',
              href: '/',
              icon: Home,
              active: pathname === '/',
            },
            {
              name: 'Schedule',
              href: '/schedule',
              icon: Calendar,
              active: pathname === '/schedule',
              badge: waitingCount > 0 ? `${waitingCount} waiting` : null,
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
            },
          ],
        },
        {
          title: 'MONEY & TAXES',
          items: [
            {
              name: 'MoR Tax Invoices',
              href: '/invoices',
              icon: Receipt,
              active: pathname === '/invoices',
            },
            {
              name: 'Reports & Earnings',
              href: '/reports',
              icon: BarChart3,
              active: pathname === '/reports',
              badge: store.isDayClosed ? 'Closed' : null,
              badgeColor: 'bg-slate-200 text-slate-700 border-slate-300',
            },
          ],
        },
        {
          title: 'CLINIC RECORDS',
          items: [
            {
              name: 'All Patients',
              href: '/patients',
              icon: Users,
              active: pathname === '/patients',
            },
            {
              name: 'Clinic Settings & Fees',
              href: '/admin',
              icon: Settings,
              active: pathname === '/admin',
            },
          ],
        },
      ];
    }

    // 3. RECEPTION: Focus on Waiting Room, Check-in & Cashier
    return [
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
            active: pathname === '/schedule',
            badge: waitingCount > 0 ? `${waitingCount} waiting` : null,
            badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          },
        ],
      },
      {
        title: 'PATIENTS',
        items: [
          {
            name: 'Patients',
            href: '/patients',
            icon: Users,
            active: pathname === '/patients',
          },
          {
            name: 'Phone Calls',
            href: '/recalls',
            icon: Bell,
            active: pathname === '/recalls',
            badge: '4 due',
            badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          },
        ],
      },
      {
        title: 'CASHIER',
        items: [
          {
            name: 'Cashier & Payments',
            href: '/payments',
            icon: CreditCard,
            active: pathname === '/payments',
          },
          {
            name: 'Invoices & Receipts',
            href: '/invoices',
            icon: Receipt,
            active: pathname === '/invoices',
          },
        ],
      },
    ];
  }, [isDoctor, isOwner, pathname, waitingCount, occupiedChairsCount, store.isDayClosed]);

  // If patient public booking or dedicated login page, skip internal shell (called after all hooks)
  if (pathname?.startsWith('/c/') || pathname === '/book' || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100">
      <div className="flex-1 flex min-h-0">
        {/* 2. ORGANIZED LEFT SIDEBAR */}
        <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-slate-200/90 shrink-0 sticky top-0 h-screen z-30">
          {/* Logo Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C7.5 2 4 4.5 4 8c0 3.5 1.5 6 3 9 1 2 2 5 5 5s4-3 5-5c1.5-3 3-5.5 3-9 0-3.5-3.5-6-8-6z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-base tracking-tight">
                Sinna Dental
              </span>
            </div>

            {/* Role Badge */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              isDoctor
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : isOwner
                ? 'bg-slate-900 text-white'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {isDoctor ? 'Doctor' : isOwner ? 'Owner' : 'Reception'}
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

          {/* Bottom User Profile Card */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                  isDoctor
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : isOwner
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}>
                  {isDoctor ? 'SD' : isOwner ? 'DT' : 'HT'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {store.currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">
                    {(() => {
                      const domain = (clinic.slug || 'clinic').replace(/[^a-z0-9]/g, '') + '.et';
                      return isDoctor ? `doctor@${domain}` : isOwner ? `owner@${domain}` : `reception@${domain}`;
                    })()}
                  </p>
                </div>
              </div>

              {isOwner && (
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

            {/* Quick 3-Role Switcher (Simple, Plain Words) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-400 px-2 hidden sm:inline uppercase tracking-wider">
                Role:
              </span>
              <button
                type="button"
                onClick={() => sinnaStore.switchRole('reception')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  !isDoctor && !isOwner
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold border border-emerald-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Receptionist: Waiting room, seating, phone calls, cashier payments"
              >
                <span className={`w-2 h-2 rounded-full ${!isDoctor && !isOwner ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Reception</span>
              </button>

              <button
                type="button"
                onClick={() => sinnaStore.switchRole('doctor')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isDoctor
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-blue-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Doctor: Patient care, 32-tooth dental chart, treatments, quotes"
              >
                <span className={`w-2 h-2 rounded-full ${isDoctor ? 'bg-blue-600' : 'bg-slate-300'}`} />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => sinnaStore.switchRole('admin')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isOwner
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title="Owner & Manager: Clinic overview, cashier ledger, MoR taxes, earnings, settings"
              >
                <span className={`w-2 h-2 rounded-full ${isOwner ? 'bg-amber-400' : 'bg-slate-300'}`} />
                <span>Owner</span>
              </button>
            </div>

            {/* Right Action Icons (Help, Theme, Log out) */}
            <div className="flex items-center gap-2 sm:gap-3">
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
                onClick={() => alert(`Sinna Dental OS Help: ${clinic.name} clinical operations hotline: ${clinic.phone || '+251 91 122 3344'}.`)}
                className="inline-flex items-center gap-1 p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 text-xs transition-colors"
                title="Help & Documentation"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sinnaStore.resetToToday();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/80 shadow-2xs group"
                title="Reset clinic records & anchor all schedules to today's date"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 group-hover:-rotate-90 transition-transform duration-300" />
                <span>Reset</span>
              </button>

              <div className="h-4 w-px bg-slate-200" />

              {/* Log out Button (Exact match from Screenshot 1 & 2 top right) */}
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Log out from current clinical station"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Log out</span>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-10">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C7.5 2 4 4.5 4 8c0 3.5 1.5 6 3 9 1 2 2 5 5 5s4-3 5-5c1.5-3 3-5.5 3-9 0-3.5-3.5-6-8-6z" />
                  </svg>
                </div>
                <span className="font-bold text-slate-900 text-base">Sinna Dental</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Role Switcher */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Switch Station</p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sinnaStore.switchRole('reception');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border ${
                    !isDoctor && !isOwner
                      ? 'bg-white text-emerald-700 border-emerald-300 shadow-2xs font-bold'
                      : 'bg-white/60 text-slate-600 border-slate-200'
                  }`}
                >
                  Reception
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sinnaStore.switchRole('doctor');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border ${
                    isDoctor
                      ? 'bg-white text-blue-700 border-blue-300 shadow-2xs font-bold'
                      : 'bg-white/60 text-slate-600 border-slate-200'
                  }`}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sinnaStore.switchRole('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border ${
                    isOwner
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                      : 'bg-white/60 text-slate-600 border-slate-200'
                  }`}
                >
                  Owner
                </button>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  {section.title && (
                    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </p>
                  )}
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                          item.active
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${item.active ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom info */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-slate-900">{store.currentUser.name}</p>
              <p className="text-[10px] text-slate-500">{store.currentUser.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Drawers & Modals */}
      <SmsToast />
      <ClinicalToastContainer />
      <DoctorSeatRequestModal />
      <SmsDrawer isOpen={smsDrawerOpen} onClose={() => setSmsDrawerOpen(false)} />
      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
      )}

      {/* Role-Based Patient Drawer: Reception-only drawer; Doctor navigates directly to full patient profile */}
      {!isDoctor && (
        <ReceptionPatientDrawer
          isOpen={patientDrawerOpen || store.isPatientDrawerOpen}
          initialTab={store.patientDrawerInitialTab || 'today'}
          onClose={() => {
            setPatientDrawerOpen(false);
            setSelectedPatientId(null);
            sinnaStore.closePatientDrawer();
            if (typeof window !== 'undefined' && window.location.search) {
              const url = new URL(window.location.href);
              url.searchParams.delete('patientId');
              url.searchParams.delete('id');
              const newSearch = url.searchParams.toString();
              const newUrl = url.pathname + (newSearch ? `?${newSearch}` : '');
              window.history.replaceState({}, '', newUrl);
            }
          }}
          appointmentId={selectedPatientId || store.selectedPatientRecordId}
        />
      )}

      {/* Reception Floating Status Pill when waiting for Doctor Chair Confirmation */}
      {!isDoctor && store.pendingSeatingRequest?.status === 'pending' && (
        <div className="fixed bottom-20 right-6 z-40 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-fade-in font-sans">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Awaiting {store.pendingSeatingRequest.doctorName}:</span>{' '}
            <span className="text-slate-300">
              Confirm Chair {store.pendingSeatingRequest.chairNumber} for {store.pendingSeatingRequest.patientName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => sinnaStore.declineSeatingRequest()}
            className="text-[11px] font-semibold text-rose-300 hover:text-rose-100 underline ml-1 shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      <SinnaAICopilot mode="admin" />
    </div>
  );
}
