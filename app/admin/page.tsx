'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Stethoscope,
  Receipt,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  X,
  Phone,
  Clock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  Sparkles,
  Info,
  Database
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { Doctor, ServiceItem, OperatoryChair } from '@/lib/types';

export default function AdminPage() {
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  const [activeTab, setActiveTab] = useState<'clinic' | 'doctors' | 'services' | 'chairs' | 'ai'>('clinic');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Clinic profile form state
  const [clinicName, setClinicName] = useState(clinic.name);
  const [clinicLocation, setClinicLocation] = useState(clinic.location);
  const [clinicPhone, setClinicPhone] = useState(clinic.phone);
  const [clinicTaglineEn, setClinicTaglineEn] = useState(clinic.taglineEn);
  const [clinicTaglineAm, setClinicTaglineAm] = useState(clinic.taglineAm);
  const [clinicOpenHours, setClinicOpenHours] = useState(clinic.openHours);
  const [depositPolicyETB, setDepositPolicyETB] = useState(clinic.depositPolicyETB);
  const [tinNumber, setTinNumber] = useState('0049283711');

  // Doctor editing / adding modal state
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docTitleEn, setDocTitleEn] = useState('');
  const [docTitleAm, setDocTitleAm] = useState('');
  const [docDays, setDocDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);

  // Service editing / adding modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvNameEn, setSrvNameEn] = useState('');
  const [srvNameAm, setSrvNameAm] = useState('');
  const [srvPriceETB, setSrvPriceETB] = useState<number>(1500);
  const [srvDuration, setSrvDuration] = useState<number>(30);
  const [srvDepositReq, setSrvDepositReq] = useState(true);
  const [srvDepositETB, setSrvDepositETB] = useState<number>(300);
  const [srvDescription, setSrvDescription] = useState('');

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 2800);
  };

  const handleSaveClinicProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sinnaStore.updateClinicProfile(store.activeClinicSlug, {
      name: clinicName,
      location: clinicLocation,
      phone: clinicPhone,
      taglineEn: clinicTaglineEn,
      taglineAm: clinicTaglineAm,
      openHours: clinicOpenHours,
      depositPolicyETB: Number(depositPolicyETB) || 0,
    });
    triggerToast('Clinic profile & Ministry of Revenues details updated');
  };

  const handleOpenDoctorModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctorId(doctor.id);
      setDocName(doctor.name);
      setDocSpecialty(doctor.specialty);
      setDocTitleEn(doctor.titleEn);
      setDocTitleAm(doctor.titleAm);
      setDocDays(doctor.availableDays || ['Mon', 'Tue', 'Wed']);
    } else {
      setEditingDoctorId(null);
      setDocName('');
      setDocSpecialty('General Dentistry');
      setDocTitleEn('Dental Surgeon (DDS, 5 yrs exp)');
      setDocTitleAm('የጥርስ ህክምና ስፔሻሊስት');
      setDocDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    }
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    if (editingDoctorId) {
      sinnaStore.updateDoctor(store.activeClinicSlug, editingDoctorId, {
        name: docName,
        specialty: docSpecialty,
        titleEn: docTitleEn,
        titleAm: docTitleAm,
        availableDays: docDays,
      });
      triggerToast(`Doctor ${docName} profile updated`);
    } else {
      const newDoc: Doctor = {
        id: `doc-${Date.now()}`,
        name: docName,
        specialty: docSpecialty,
        titleEn: docTitleEn,
        titleAm: docTitleAm,
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        availableDays: docDays,
      };
      sinnaStore.addDoctor(store.activeClinicSlug, newDoc);
      triggerToast(`Doctor ${docName} added to roster`);
    }
    setDoctorModalOpen(false);
  };

  const handleDeleteDoctor = (doctorId: string, name: string) => {
    if (clinic.doctors.length <= 1) {
      alert('At least one dentist must remain registered in the clinic roster.');
      return;
    }
    sinnaStore.deleteDoctor(store.activeClinicSlug, doctorId);
    triggerToast(`Doctor ${name} removed`);
  };

  const handleOpenServiceModal = (service?: ServiceItem) => {
    if (service) {
      setEditingServiceId(service.id);
      setSrvNameEn(service.nameEn);
      setSrvNameAm(service.nameAm);
      setSrvPriceETB(service.priceETB);
      setSrvDuration(service.durationMinutes);
      setSrvDepositReq(service.depositRequired);
      setSrvDepositETB(service.depositAmountETB);
      setSrvDescription(service.description);
    } else {
      setEditingServiceId(null);
      setSrvNameEn('');
      setSrvNameAm('');
      setSrvPriceETB(1500);
      setSrvDuration(30);
      setSrvDepositReq(true);
      setSrvDepositETB(300);
      setSrvDescription('');
    }
    setServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvNameEn.trim()) return;

    if (editingServiceId) {
      sinnaStore.updateService(store.activeClinicSlug, editingServiceId, {
        nameEn: srvNameEn,
        nameAm: srvNameAm,
        priceETB: Number(srvPriceETB) || 0,
        durationMinutes: Number(srvDuration) || 30,
        depositRequired: srvDepositReq,
        depositAmountETB: srvDepositReq ? Number(srvDepositETB) || 0 : 0,
        description: srvDescription,
      });
      triggerToast(`Service "${srvNameEn}" updated`);
    } else {
      const newSrv: ServiceItem = {
        id: `srv-${Date.now()}`,
        nameEn: srvNameEn,
        nameAm: srvNameAm || srvNameEn,
        priceETB: Number(srvPriceETB) || 0,
        durationMinutes: Number(srvDuration) || 30,
        depositRequired: srvDepositReq,
        depositAmountETB: srvDepositReq ? Number(srvDepositETB) || 0 : 0,
        description: srvDescription,
      };
      sinnaStore.addService(store.activeClinicSlug, newSrv);
      triggerToast(`Service "${srvNameEn}" added to fee schedule`);
    }
    setServiceModalOpen(false);
  };

  const handleDeleteService = (serviceId: string, name: string) => {
    sinnaStore.deleteService(store.activeClinicSlug, serviceId);
    triggerToast(`Service "${name}" removed`);
  };

  const handleUpdateChair = (chairNumber: number, name: string, roomName: string, status: 'available' | 'occupied' | 'sanitizing') => {
    sinnaStore.updateChair(chairNumber, {
      name,
      roomName,
      status,
    });
    triggerToast(`Chair ${chairNumber} updated`);
  };

  const isAuthorized = store.currentUser?.role === 'doctor' || store.currentUser?.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center mb-5 shadow-2xs">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
            <span>Doctor / Director Authorization Required</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Admin Settings Restricted
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            This configuration console manages clinic tax compliance (MoR TIN), fee schedules, doctor rosters, and operatory chair allocations. Access is restricted exclusively to Clinical Directors and Doctors.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-left max-w-md mx-auto">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Workstation Session</p>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-sm font-bold text-slate-800">{store.currentUser.name}</p>
                <p className="text-xs text-slate-500">{store.currentUser.title}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Front Desk Staff
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-2xs"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In as Doctor / Director</span>
            </Link>
            <Link
              href="/reception"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
            >
              <span>Return to Front Desk Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Management Suite</span>
              <span>/</span>
              <span className="font-semibold text-slate-700">Admin Configuration Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Clinic Administration & Demo Setup
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure clinic profile, MoR TIN, dental specialists, fee schedule, and operatory rooms. Changes propagate immediately across the entire clinic operating system.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/70"
            >
              <span>Switch Station</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => {
                sinnaStore.resetDemoData();
                triggerToast('Sample data reset to default Addis demo baseline');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 transition-colors border border-slate-200 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo Values</span>
            </button>
          </div>
        </div>

        {/* Live Storage Alert Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Live Reactivity Active</span>
            <span className="text-emerald-600">· Edits update Doctor Odontograms, Reception Desk, and MoR Receipts in real time</span>
          </div>
          <div className="text-slate-500 text-[11px] font-mono">
            Active Clinic: <span className="font-semibold text-slate-800">{clinic.name}</span>
          </div>
        </div>
      </div>

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-fade-in border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('clinic')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'clinic'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Clinic Profile & MoR TIN</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'doctors'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Dentists & Specialists ({clinic.doctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Fee Schedule & Services ({clinic.services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chairs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'chairs'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Operatory Chairs ({store.chairs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'ai'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>Sinna AI Copilot (Gemini & RAG)</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB A: CLINIC PROFILE */}
      {activeTab === 'clinic' && (
        <form onSubmit={handleSaveClinicProfile} className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Clinic Identity & Fiscal Details
              </h2>
              <p className="text-xs text-slate-500">
                Shown on patient booking pages, appointment reminder SMS, and printed Ministry of Revenues receipts.
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Clinic Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinic Legal Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official MoR TIN Number
              </label>
              <input
                type="text"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Printed on all POS fiscal thermal receipts and Z-Reports.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Physical Location / Address
              </label>
              <input
                type="text"
                value={clinicLocation}
                onChange={(e) => setClinicLocation(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Phone Number (SMS Caller ID)
              </label>
              <input
                type="text"
                value={clinicPhone}
                onChange={(e) => setClinicPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                English Tagline
              </label>
              <input
                type="text"
                value={clinicTaglineEn}
                onChange={(e) => setClinicTaglineEn(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amharic Tagline
              </label>
              <input
                type="text"
                value={clinicTaglineAm}
                onChange={(e) => setClinicTaglineAm(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Operating Hours
              </label>
              <input
                type="text"
                value={clinicOpenHours}
                onChange={(e) => setClinicOpenHours(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Standard Appointment Deposit Policy (ETB)
              </label>
              <input
                type="number"
                value={depositPolicyETB}
                onChange={(e) => setDepositPolicyETB(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Amount required for online holds via Telebirr or CBE Birr.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* TAB B: DENTISTS & SPECIALISTS */}
      {activeTab === 'doctors' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registered Dental Surgeons & Specialists
              </h2>
              <p className="text-xs text-slate-500">
                These doctors are assigned to appointments, operatory chairs, and chairside documentation.
              </p>
            </div>
            <button
              onClick={() => handleOpenDoctorModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Specialist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinic.doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {doc.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-medium text-blue-600 truncate">
                      {doc.specialty}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {doc.titleEn}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.availableDays.map((d) => (
                        <span
                          key={d}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-slate-600 border border-slate-200"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenDoctorModal(doc)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                    title="Edit Doctor"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Doctor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB C: FEE SCHEDULE & SERVICES */}
      {activeTab === 'services' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dental Service Catalog & Price Schedule (ETB)
              </h2>
              <p className="text-xs text-slate-500">
                Prices automatically calculate during chairside encounters, walk-in checkouts, and MoR thermal receipts.
              </p>
            </div>
            <button
              onClick={() => handleOpenServiceModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dental Service</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px] bg-slate-50/70">
                  <th className="py-3 px-3">Service Name</th>
                  <th className="py-3 px-3">Amharic Label</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Price (ETB)</th>
                  <th className="py-3 px-3">Deposit Required</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinic.services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900">{srv.nameEn}</span>
                      {srv.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">
                          {srv.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-sans">{srv.nameAm}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono">{srv.durationMinutes} min</td>
                    <td className="py-3 px-3 font-semibold font-mono text-slate-900">
                      {srv.priceETB.toLocaleString()} ETB
                    </td>
                    <td className="py-3 px-3">
                      {srv.depositRequired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                          {srv.depositAmountETB} ETB
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No deposit</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenServiceModal(srv)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                          title="Edit Service"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id, srv.nameEn)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB D: OPERATORY CHAIRS */}
      {activeTab === 'chairs' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Operatory Chairs & Suite Allocation
              </h2>
              <p className="text-xs text-slate-500">
                Configure room names, active statuses, and operational chair assignments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {store.chairs.map((chair) => (
              <div
                key={chair.id}
                className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                    #{chair.chairNumber}
                  </span>
                  <select
                    value={chair.status}
                    onChange={(e) =>
                      handleUpdateChair(
                        chair.chairNumber,
                        chair.name,
                        chair.roomName,
                        e.target.value as 'available' | 'occupied' | 'sanitizing'
                      )
                    }
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="sanitizing">Sanitizing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Chair Label
                  </label>
                  <input
                    type="text"
                    defaultValue={chair.name}
                    onBlur={(e) =>
                      handleUpdateChair(
                        chair.chairNumber,
                        e.target.value,
                        chair.roomName,
                        chair.status
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Room / Suite Name
                  </label>
                  <input
                    type="text"
                    defaultValue={chair.roomName}
                    onBlur={(e) =>
                      handleUpdateChair(
                        chair.chairNumber,
                        chair.name,
                        e.target.value,
                        chair.status
                      )
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {chair.currentPatientName && (
                  <div className="pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400">Current Patient: </span>
                    <span className="font-semibold text-slate-800">{chair.currentPatientName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB E: SINNA AI COPILOT & GEMINI RAG SETTINGS */}
      {activeTab === 'ai' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Sinna AI Clinical Copilot & RAG System
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini 3.8 Flash Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Clinical intelligence for patient bookings and front-desk reception, grounded with zero hallucinations in Ethiopian dental records and live database snapshots.
              </p>
            </div>
          </div>

          {/* AI Architecture Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Gemini API Integration</span>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                Powered by official <code className="text-sky-700 font-mono text-[11px] font-semibold">gemini-3.8-flash</code> with temperature locked at <code className="text-sky-700 font-mono text-[11px]">0.15</code> for strict clinical truthfulness.
              </p>
              <div className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-lg border border-slate-200">
                ENV: GEMINI_API_KEY
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Live Database Grounding</span>
              </div>
              <p className="text-xs text-slate-600">
                AI dynamically inspects today's <strong>{store.appointments.length} appointments</strong>, <strong>{store.chairs.filter(c => c.status === 'occupied').length} active chairs</strong>, and current cashier balances to guarantee zero hallucinated numbers.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Trilingual Localization</span>
              </div>
              <p className="text-xs text-slate-600">
                Native clinical fluency in <strong>English</strong>, <strong>አማርኛ (Amharic)</strong>, and <strong>Afaan Oromoo</strong> with contextual starter chips for patients and staff.
              </p>
            </div>
          </div>

          {/* Knowledge Base Document Manifest */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Active Grounding Documents (Clinical Knowledge Base)
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">1. Bole Dental Studio Profile & Hours</span>
                  <p className="text-[11px] text-slate-500">Morning Star Mall 3rd Floor, Bole Medhanialem · Mon-Sat 8:30 AM - 7:00 PM · MoR TIN: 0049283711</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">Indexed</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">2. Official Ethiopian Birr (ETB) Fee Schedule</span>
                  <p className="text-[11px] text-slate-500">Cleaning (1,500 ETB), Emergency (1,200 ETB), RCT (4,500 - 6,800 ETB), Braces (45k - 95k ETB), Implants (28k ETB)</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">Indexed</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">3. 300 ETB Reservation Deposit & AfroMessage SMS Policy</span>
                  <p className="text-[11px] text-slate-500">100% credited toward bill upon arrival · Telebirr SuperApp & CBE Birr verification · Automated SMS confirmations</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">Indexed</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">4. Attending Specialists Register</span>
                  <p className="text-[11px] text-slate-500">Dr. Senait Tadesse (Lead Orthodontist & Director) · Dr. Dawit Bekele (Oral Surgeon & Implantologist)</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">Indexed</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">5. FDI World Dental Federation 32-Tooth Standard</span>
                  <p className="text-[11px] text-slate-500">Full 11-48 two-digit tooth chart mapping with root anatomy & quadrant restorative staging</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">Indexed</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">6. Post-Operative Emergency Care Protocols</span>
                  <p className="text-[11px] text-slate-500">Post-extraction dry socket prevention · Acute pulpal pain management · Chemical burn warnings</p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold">Indexed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DOCTOR MODAL */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setDoctorModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingDoctorId ? 'Edit Dentist Profile' : 'Add New Dental Specialist'}
            </h3>

            <form onSubmit={handleSaveDoctor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Doctor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Senait Tadesse"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Specialty Field
                </label>
                <input
                  type="text"
                  placeholder="e.g. Orthodontics & Aesthetic Dentistry"
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Title / Credentials (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Specialist (DDS, 11 yrs exp)"
                  value={docTitleEn}
                  onChange={(e) => setDocTitleEn(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Title (Amharic)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ዋና የጥርስ ህክምና ስፔሻሊስት"
                  value={docTitleAm}
                  onChange={(e) => setDocTitleAm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Operating Days
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                    const active = docDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setDocDays(docDays.filter((d) => d !== day));
                          } else {
                            setDocDays([...docDays, day]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDoctorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-2xs"
                >
                  {editingDoctorId ? 'Save Changes' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SERVICE MODAL */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setServiceModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingServiceId ? 'Edit Dental Service' : 'Add New Dental Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service Name (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Composite Resin Restoration"
                  value={srvNameEn}
                  onChange={(e) => setSrvNameEn(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amharic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. የጥርስ ሙሌት"
                  value={srvNameAm}
                  onChange={(e) => setSrvNameAm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price (ETB)
                  </label>
                  <input
                    type="number"
                    value={srvPriceETB}
                    onChange={(e) => setSrvPriceETB(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={srvDepositReq}
                    onChange={(e) => setSrvDepositReq(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">Require Pre-Appointment Deposit</span>
                </label>
                {srvDepositReq && (
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Deposit Amount (ETB)
                    </label>
                    <input
                      type="number"
                      value={srvDepositETB}
                      onChange={(e) => setSrvDepositETB(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Procedure Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief clinical description..."
                  value={srvDescription}
                  onChange={(e) => setSrvDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-2xs"
                >
                  {editingServiceId ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
