'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
  Check,
  Send,
  MessageSquare,
  User,
  Plus,
  ArrowRight,
  ExternalLink,
  Calendar,
  Sparkles,
  X,
  Printer,
  Search,
  FileText,
  Pill,
  Activity,
  AlertTriangle,
  Layers,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  RotateCcw,
  Info,
  Phone,
  Armchair
} from 'lucide-react';
import { useSinnaStore, sinnaStore, getClinicData } from '@/lib/store';
import { TreatmentOdontogramChart } from '@/components/treatment-odontogram-chart';
import { PatientRecordDrawer } from '@/components/patient-record-drawer';
import {
  Appointment,
  ToothStatus,
  TreatmentPlan,
  PlanProcedureItem,
  EthiopianPrescription
} from '@/lib/types';

// =============================================================================
// CLINICAL CHAIRSIDE ADD-ONS SPECIFICATION (ETHIOPIAN DENTAL PRACTICE STANDARD)
// =============================================================================
export interface ChairsideAddon {
  id: string;
  nameEn: string;
  category: 'Diagnostic & Imaging' | 'Anesthesia & Comfort' | 'Restorative & Endo' | 'Periodontal & Hygiene' | 'Surgical & Emergency';
  priceETB: number;
  description: string;
  contraindicatedForAlerts?: string[];
  safeAlternativeForAlerts?: string[];
}

const CHAIRSIDE_ADDONS: ChairsideAddon[] = [
  // 1. Diagnostic & Imaging
  {
    id: 'add-iopa',
    nameEn: 'Digital Periapical X-Ray (IOPA)',
    category: 'Diagnostic & Imaging',
    priceETB: 400,
    description: 'High-definition digital periapical sensor radiograph of root apex and bone.',
  },
  {
    id: 'add-bitewing',
    nameEn: 'Bitewing Radiograph (Bite-Wing)',
    category: 'Diagnostic & Imaging',
    priceETB: 450,
    description: 'Bilateral interproximal imaging detecting hidden posterior caries & alveolar crest.',
  },
  {
    id: 'add-opg',
    nameEn: 'Panoramic OPG Radiograph',
    category: 'Diagnostic & Imaging',
    priceETB: 800,
    description: 'Full-mouth orthopantomogram evaluating impactions and maxillofacial pathology.',
  },
  {
    id: 'add-vitality',
    nameEn: 'Thermal Cold & Electric Pulp Test',
    category: 'Diagnostic & Imaging',
    priceETB: 200,
    description: 'Endodontic diagnostic vitality assessment of nerve response.',
  },
  {
    id: 'add-intraoral-photo',
    nameEn: 'Intraoral Diagnostic Photography',
    category: 'Diagnostic & Imaging',
    priceETB: 250,
    description: 'High-res macro photography before and after restorative treatment.',
  },

  // 2. Anesthesia & Comfort
  {
    id: 'add-lido-epi',
    nameEn: 'Infiltration Lidocaine 2% + 1:100k Epinephrine',
    category: 'Anesthesia & Comfort',
    priceETB: 300,
    description: 'Standard local anesthetic cartridge with vasoconstrictor.',
    contraindicatedForAlerts: ['Hypertension', 'Epinephrine'],
  },
  {
    id: 'add-mepiv-plain',
    nameEn: 'Mepivacaine 3% Plain (Epinephrine-Free)',
    category: 'Anesthesia & Comfort',
    priceETB: 350,
    description: 'Cardiovascular-safe vasoconstrictor-free local anesthetic (Indicated for Hypertensive Patients).',
    safeAlternativeForAlerts: ['Hypertension', 'Epinephrine'],
  },
  {
    id: 'add-articaine',
    nameEn: 'Articaine 4% Mandibular Nerve Block',
    category: 'Anesthesia & Comfort',
    priceETB: 450,
    description: 'Superior deep diffusion anesthetic for difficult lower molar anesthesia.',
  },
  {
    id: 'add-topical-gel',
    nameEn: 'Topical Benzocaine 20% Pre-Numb Gel',
    category: 'Anesthesia & Comfort',
    priceETB: 150,
    description: 'Mucosal topical desensitizing gel prior to needle insertion.',
  },

  // 3. Restorative & Endo Add-Ons
  {
    id: 'add-rubber-dam',
    nameEn: 'Rubber Dam Quadrant Isolation',
    category: 'Restorative & Endo',
    priceETB: 400,
    description: 'Strict sterile moisture isolation critical for adhesive dentistry and endodontics.',
  },
  {
    id: 'add-dycal',
    nameEn: 'Calcium Hydroxide Pulp Cap (Dycal)',
    category: 'Restorative & Endo',
    priceETB: 500,
    description: 'Biocompatible sedative liner promoting tertiary dentin bridge formation.',
  },
  {
    id: 'add-gic-liner',
    nameEn: 'Glass Ionomer (GIC) Base & Pulp Liner',
    category: 'Restorative & Endo',
    priceETB: 600,
    description: 'Fluoride-releasing chemical bond liner protecting deep pulpal floor.',
  },
  {
    id: 'add-retraction-cord',
    nameEn: 'Gingival Retraction Cord Placement',
    category: 'Restorative & Endo',
    priceETB: 250,
    description: 'Sulcular displacement cord ensuring subgingival margin isolation.',
  },
  {
    id: 'add-fiber-post',
    nameEn: 'Fiber-Reinforced Glass Post Placement',
    category: 'Restorative & Endo',
    priceETB: 1200,
    description: 'Intraradicular core retention anchor for heavily damaged endodontic teeth.',
  },

  // 4. Periodontal & Hygiene
  {
    id: 'add-fluoride-varnish',
    nameEn: 'Fluoride Enamel Varnish (Bifluorid)',
    category: 'Periodontal & Hygiene',
    priceETB: 500,
    description: 'High-potency 5% sodium fluoride enamel remineralization varnish.',
  },
  {
    id: 'add-scaling-polish',
    nameEn: 'Ultrasonic Supra/Subgingival Scaling & Polish',
    category: 'Periodontal & Hygiene',
    priceETB: 1200,
    description: 'Complete ultrasonic calculus debridement and prophy paste polishing.',
  },
  {
    id: 'add-chx-irrig',
    nameEn: 'Subgingival Chlorhexidine 0.2% Irrigation',
    category: 'Periodontal & Hygiene',
    priceETB: 300,
    description: 'Deep antimicrobial pocket flush reducing virulent periodontal pathogens.',
  },
  {
    id: 'add-desensitize',
    nameEn: 'Dentin Desensitizing Gluma Treatment',
    category: 'Periodontal & Hygiene',
    priceETB: 400,
    description: 'Tubule-blocking glutaraldehyde agent for acute cervical sensitivity.',
  },

  // 5. Surgical & Emergency
  {
    id: 'add-surgicel',
    nameEn: 'Hemostatic Gelatin Sponge / Surgicel Pack',
    category: 'Surgical & Emergency',
    priceETB: 350,
    description: 'Resorbable intra-alveolar hemostatic plug promoting rapid clot stabilization.',
  },
  {
    id: 'add-alvogyl',
    nameEn: 'Alvogyl Dry Socket Antiseptic Paste',
    category: 'Surgical & Emergency',
    priceETB: 600,
    description: 'Eugenol and penghawar analgesic dressing for painful fibrinolytic alveolitis.',
  },
  {
    id: 'add-vicryl-suture',
    nameEn: 'Resorbable Vicryl Surgical Suture (3-0)',
    category: 'Surgical & Emergency',
    priceETB: 450,
    description: 'High-tensile synthetic braided suture for flap closure and extraction sockets.',
  },
  {
    id: 'add-abscess-drain',
    nameEn: 'Intraoral Abscess Incision & Drainage',
    category: 'Surgical & Emergency',
    priceETB: 1500,
    description: 'Surgical decompression and rubber drain placement for acute submucosal swelling.',
  },
];

// =============================================================================
// QUICK ETHIOPIAN FORMULARY DRUG TEMPLATES (RX PAD)
// =============================================================================
interface DentalRxTemplate {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  indication: string;
  allergyFlag?: string;
  safeAlternative?: boolean;
}

const RX_TEMPLATES: DentalRxTemplate[] = [
  {
    id: 'rx-amox',
    drugName: 'Amoxicillin Capsules',
    dosage: '500mg PO',
    frequency: 'Every 8 hours (TID)',
    duration: '5 days',
    indication: 'Standard oral bacterial infection & odontogenic cellulitis',
    allergyFlag: 'Penicillin',
  },
  {
    id: 'rx-clinda',
    drugName: 'Clindamycin Capsules',
    dosage: '300mg PO',
    frequency: 'Every 8 hours (TID)',
    duration: '5 days',
    indication: 'First-line antibiotic for Penicillin-Allergic patients',
    safeAlternative: true,
  },
  {
    id: 'rx-augmentin',
    drugName: 'Augmentin (Amoxicillin + Clavulanate)',
    dosage: '625mg PO',
    frequency: 'Every 12 hours (BID)',
    duration: '5 days',
    indication: 'Beta-lactamase resistant severe facial infections',
    allergyFlag: 'Penicillin',
  },
  {
    id: 'rx-metro',
    drugName: 'Metronidazole Tablets',
    dosage: '400mg PO',
    frequency: 'Every 8 hours (TID)',
    duration: '5 days',
    indication: 'Anaerobic coverage in acute pericoronitis & necrotizing gingivitis',
  },
  {
    id: 'rx-ibup',
    drugName: 'Ibuprofen Tablets',
    dosage: '400mg PO',
    frequency: 'Every 8 hours (TID) after food',
    duration: '3 days PRN',
    indication: 'Non-steroidal anti-inflammatory analgesic for postoperative pain',
  },
  {
    id: 'rx-para',
    drugName: 'Paracetamol Tablets',
    dosage: '1000mg PO',
    frequency: 'Every 6-8 hours (QDS)',
    duration: '3 days PRN',
    indication: 'Mild-to-moderate dental pain & fever',
  },
  {
    id: 'rx-chx-rinse',
    drugName: 'Chlorhexidine Gluconate 0.2% Rinse',
    dosage: '15ml undiluted',
    frequency: 'Twice daily (BID) 30s rinse',
    duration: '14 days',
    indication: 'Broad-spectrum antimicrobial oral prophylaxis',
  },
  {
    id: 'rx-tramadol',
    drugName: 'Tramadol Capsules',
    dosage: '50mg PO',
    frequency: 'Every 8-12 hours PRN',
    duration: '2 days max',
    indication: 'Severe surgical pain refractory to NSAIDs',
  },
];

// =============================================================================
// RAPID TOOTH PROCEDURES (FOR SELECTED FDI TOOTH)
// =============================================================================
interface ToothQuickProcedure {
  id: string;
  name: string;
  feeETB: number;
  status: ToothStatus;
}

const TOOTH_QUICK_PROCEDURES: ToothQuickProcedure[] = [
  { id: 'tq-comp', name: 'Composite Resin Restoration', feeETB: 1800, status: 'filled' },
  { id: 'tq-amal', name: 'Amalgam Restoration', feeETB: 1500, status: 'filled' },
  { id: 'tq-rct', name: 'Single-Visit Rotary Root Canal', feeETB: 6000, status: 'rct' },
  { id: 'tq-crown', name: 'Monolithic Zirconia Crown', feeETB: 7500, status: 'crown' },
  { id: 'tq-pfm', name: 'Porcelain-Fused-to-Metal Crown', feeETB: 5000, status: 'crown' },
  { id: 'tq-ext', name: 'Surgical Tooth Extraction', feeETB: 2000, status: 'missing' },
  { id: 'tq-pulp', name: 'Emergency Pulpotomy & Dressing', feeETB: 1200, status: 'rct' },
];

export default function DoctorChairsidePage() {
  const router = useRouter();
  const store = useSinnaStore();
  const clinic = getClinicData(store.activeClinicSlug);

  // Safe collections
  const appointments = Array.isArray(store.appointments) ? store.appointments : [];
  const chairs = Array.isArray(store.chairs) ? store.chairs : [];
  const treatmentPlans = Array.isArray(store.treatmentPlans) ? store.treatmentPlans : [];
  const contracts = Array.isArray(store.contracts) ? store.contracts : [];

  // Active Doctor selector
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    clinic.doctors[0]?.id || 'doc-senait'
  );
  const activeDoctor =
    clinic.doctors.find((d) => d.id === selectedDoctorId) || clinic.doctors[0];

  // Active Patient in Chair state
  const inProgressApt =
    appointments.find((a) => a.clinicId === clinic.id && a.status === 'in_progress') ||
    appointments.find((a) => a.status === 'in_progress') ||
    null;

  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  // Effective current appointment
  const currentApt = useMemo(() => {
    if (activePatientId) {
      return appointments.find((a) => a.id === activePatientId) || null;
    }
    return inProgressApt || appointments[0] || null;
  }, [appointments, activePatientId, inProgressApt]);

  // Matching Treatment Plan for current patient
  const matchingPlan = useMemo(() => {
    if (!currentApt) return null;
    return (
      treatmentPlans.find(
        (p) =>
          p.patientId === currentApt.id ||
          p.patientName.toLowerCase() === currentApt.patientName.toLowerCase()
      ) || null
    );
  }, [treatmentPlans, currentApt]);

  // Matching Multi-Visit Treatment Contract (e.g. Braces / Orthodontics)
  const matchingContract = useMemo(() => {
    if (!currentApt) return null;
    return (
      contracts.find(
        (c) =>
          c.patientId === currentApt.id ||
          c.patientName.toLowerCase() === currentApt.patientName.toLowerCase()
      ) || null
    );
  }, [contracts, currentApt]);

  // Orthodontic Chairside specific state
  const [selectedArchwire, setSelectedArchwire] = useState<string>('0.016x0.022 NiTi (Torque Expression)');
  const [selectedLigatureColor, setSelectedLigatureColor] = useState<string>('Cobalt Blue');
  const [bracketRepaired, setBracketRepaired] = useState<boolean>(false);
  const [bracketChargePolicy, setBracketChargePolicy] = useState<'chargeable' | 'complimentary'>('complimentary');
  const [bracketCustomFeeETB, setBracketCustomFeeETB] = useState<number>(400);

  // Chairside Odontogram state
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [archType, setArchType] = useState<'permanent' | 'primary'>('permanent');

  // Chart Notation merges patient appointment chart and matching treatment plan chart
  const activeChartNotation: Record<number, ToothStatus> = useMemo(() => {
    const fromApt = currentApt?.toothChart || {};
    const fromPlan = matchingPlan?.chartNotation || {};
    return { ...fromPlan, ...fromApt };
  }, [currentApt, matchingPlan]);

  // Chairside Encounter State
  const [selectedAddons, setSelectedAddons] = useState<ChairsideAddon[]>([]);
  const [selectedProcedures, setSelectedProcedures] = useState<
    { id: string; name: string; feeETB: number; toothNumber?: number | string | null }[]
  >([]);
  const [activeRxList, setActiveRxList] = useState<EthiopianPrescription[]>(
    currentApt?.patientChart?.prescriptions || []
  );
  const [doctorNotes, setDoctorNotes] = useState<string>(
    currentApt?.notes || currentApt?.patientChart?.chiefComplaint || ''
  );
  const [recallMonths, setRecallMonths] = useState<number>(6);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'addons' | 'rx' | 'staged_plan'>('addons');
  const [addonsCategoryFilter, setAddonsCategoryFilter] = useState<string>('all');

  // Modals & Drawers
  const [patientDrawerOpen, setPatientDrawerOpen] = useState<boolean>(false);
  const [finishSuccess, setFinishSuccess] = useState<boolean>(false);
  const [smsToast, setSmsToast] = useState<{ message: string; subtext: string } | null>(null);
  const smsToastTimer = useRef<NodeJS.Timeout | null>(null);

  const showSmsBanner = (message: string, subtext: string) => {
    if (smsToastTimer.current) clearTimeout(smsToastTimer.current);
    setSmsToast({ message, subtext });
    smsToastTimer.current = setTimeout(() => {
      setSmsToast(null);
    }, 4500);
  };

  // Patients waiting or upcoming
  const waitingPatients = appointments.filter(
    (a) => a.clinicId === clinic.id && a.status === 'checked_in'
  );
  const upcomingPatients = appointments.filter(
    (a) => a.clinicId === clinic.id && a.status === 'confirmed'
  );

  // Toggle Chairside Add-On
  const toggleAddon = (addon: ChairsideAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  // Apply Rapid Tooth Procedure to active tooth
  const handleApplyToothProcedure = (proc: ToothQuickProcedure) => {
    if (!currentApt || !selectedTooth) return;

    // 1. Update odontogram status in store
    sinnaStore.updateToothChart(currentApt.id, selectedTooth, proc.status, proc.feeETB);

    // 2. Also update matching Treatment Plan if one exists
    if (matchingPlan) {
      sinnaStore.updatePlanChart(matchingPlan.id, selectedTooth, proc.status);
      const planItem: PlanProcedureItem = {
        id: `proc-chair-${Date.now()}`,
        name: `${proc.name} (Tooth #${selectedTooth})`,
        category: proc.status === 'rct' ? 'endodontics' : proc.status === 'missing' ? 'surgery' : 'restorative',
        toothNumber: selectedTooth,
        feeETB: proc.feeETB,
        assignedDoctorCode: 'ST',
        status: 'completed',
      };
      sinnaStore.addProcedureToPlan(matchingPlan.id, planItem);
    }

    // 3. Add to today's procedure ledger
    setSelectedProcedures((prev) => [
      ...prev,
      {
        id: `tp-${Date.now()}`,
        name: `${proc.name} (Tooth #${selectedTooth})`,
        feeETB: proc.feeETB,
        toothNumber: selectedTooth,
      },
    ]);

    showSmsBanner(
      `Tooth #${selectedTooth}: ${proc.name} Added`,
      `Fee: ${proc.feeETB.toLocaleString()} ETB · Updated FDI World Dental Chart`
    );
  };

  // Set Tooth Status directly
  const handleSetToothStatus = (status: ToothStatus) => {
    if (!currentApt || !selectedTooth) return;
    sinnaStore.updateToothChart(currentApt.id, selectedTooth, status, 0);
    if (matchingPlan) {
      sinnaStore.updatePlanChart(matchingPlan.id, selectedTooth, status);
    }
  };

  // Quick Cleaning action from Whole Mouth
  const handleQuickCleaning = () => {
    if (!currentApt) return;
    const cleaningAddon = CHAIRSIDE_ADDONS.find((a) => a.id === 'add-scaling-polish');
    if (cleaningAddon && !selectedAddons.some((a) => a.id === cleaningAddon.id)) {
      setSelectedAddons((prev) => [...prev, cleaningAddon]);
    }
    showSmsBanner(
      'Whole Mouth Cleaning & Scaling Queued',
      'Ultrasonic scaling + fluoride polish (+1,200 ETB)'
    );
  };

  // Toggle Rx drug from templates
  const handleToggleRxTemplate = (tmpl: DentalRxTemplate) => {
    const exists = activeRxList.some((rx) => rx.drugName.includes(tmpl.drugName.split(' ')[0]));
    if (exists) {
      setActiveRxList((prev) =>
        prev.filter((rx) => !rx.drugName.includes(tmpl.drugName.split(' ')[0]))
      );
    } else {
      setActiveRxList((prev) => [
        ...prev,
        {
          drugName: tmpl.drugName,
          dosage: tmpl.dosage,
          frequency: tmpl.frequency,
          duration: tmpl.duration,
        },
      ]);
      showSmsBanner(
        `Prescribed: ${tmpl.drugName}`,
        `${tmpl.dosage} · ${tmpl.frequency} for ${tmpl.duration}`
      );
    }
  };

  // Start treatment for waiting patient
  const handleStartPatient = (aptId: string) => {
    const availableChair = chairs.find((c) => c.status === 'available');
    const chairNum = availableChair ? availableChair.chairNumber : 1;
    sinnaStore.assignPatientToChair(aptId, chairNum);
    setActivePatientId(aptId);
    setSelectedAddons([]);
    setSelectedProcedures([]);
    setSelectedTooth(null);
    setDoctorNotes('');
    setFinishSuccess(false);
  };

  // Finish encounter & dispatch to front desk
  const handleFinishEncounter = () => {
    if (!currentApt) return;

    const bracketFee = bracketRepaired && bracketChargePolicy === 'chargeable' ? bracketCustomFeeETB : 0;

    const totalAddedProcedures = [
      ...selectedAddons.map((a) => ({ nameEn: a.nameEn, priceETB: a.priceETB })),
      ...selectedProcedures.map((p) => ({ nameEn: p.name, priceETB: p.feeETB })),
      ...(bracketFee > 0 ? [{ nameEn: `Emergency Bracket Repair (${bracketChargePolicy})`, priceETB: bracketFee }] : []),
    ];

    // If patient has an active Orthodontic / Course of Care Contract
    if (matchingContract) {
      sinnaStore.advanceContractVisit(matchingContract.id, {
        bracketRepaired,
        chargedExtra: bracketChargePolicy === 'chargeable',
        customChargeETB: bracketCustomFeeETB,
        notes: `Archwire: ${selectedArchwire}, Ligatures: ${selectedLigatureColor}`,
      });
    }

    sinnaStore.completeDoctorEncounter(currentApt.id, {
      addedProcedures: totalAddedProcedures,
      notes: doctorNotes.trim() || (matchingContract ? `Ortho adjustment: ${selectedArchwire}, ${selectedLigatureColor} ties.` : 'Chairside examination, procedure, and clinical care delivered.'),
      recallMonths: matchingContract ? 1 : recallMonths, // Braces default to 1 month (4 weeks) cadence
    });

    if (currentApt.chairNumber) {
      sinnaStore.releaseChair(currentApt.chairNumber);
    }

    setFinishSuccess(true);
    showSmsBanner(
      'Encounter Complete & Dispatched to Front Desk',
      matchingContract
        ? `Patient ${currentApt.patientName} Month ${matchingContract.completedVisitsCount + 1} installment ready at Cashier.`
        : `Patient ${currentApt.patientName} bill ready for CBE Birr / Telebirr receipt settlement.`
    );

    setTimeout(() => {
      setFinishSuccess(false);
      setActivePatientId(null);
    }, 2800);
  };

  // Send Post-Op SMS
  const handleSendPostOpSms = () => {
    if (!currentApt) return;
    sinnaStore.sendPostOpSms(currentApt.id);
    showSmsBanner(
      'AfroMessage Post-Op Care SMS Sent',
      `Instructions delivered to ${currentApt.patientName} (${currentApt.patientPhone})`
    );
  };

  // Financial Running Totals
  const baseScheduledFee = currentApt ? currentApt.totalDueETB : 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.priceETB, 0);
  const proceduresTotal = selectedProcedures.reduce((sum, p) => sum + p.feeETB, 0);
  const bracketFee = bracketRepaired && bracketChargePolicy === 'chargeable' ? bracketCustomFeeETB : 0;

  // Contract installment calculation
  let contractInstallmentFee = 0;
  let isCoveredByPrepaidCredit = false;
  if (matchingContract) {
    if (matchingContract.prepaidCreditETB >= matchingContract.installmentPerVisitETB) {
      isCoveredByPrepaidCredit = true;
      contractInstallmentFee = 0;
    } else {
      contractInstallmentFee = matchingContract.installmentPerVisitETB;
    }
  }

  const grandTotalETB = (matchingContract ? contractInstallmentFee : baseScheduledFee) + addonsTotal + proceduresTotal + bracketFee;
  const depositPaidETB = currentApt ? currentApt.depositPaidETB : 0;
  const netDueETB = Math.max(0, grandTotalETB - depositPaidETB);

  // Check if patient has Penicillin allergy
  const hasPenicillinAllergy = useMemo(() => {
    if (!currentApt) return false;
    const fromChart = currentApt.patientChart?.medicalHistory.allergies || [];
    const fromAlerts = currentApt.medicalAlerts || [];
    return (
      fromChart.some((a) => a.toLowerCase().includes('penicillin') || a.toLowerCase().includes('amoxicillin')) ||
      fromAlerts.some((alt) => alt.labelEn.toLowerCase().includes('penicillin'))
    );
  }, [currentApt]);

  // Check if patient has Hypertension alert
  const hasHypertensionAlert = useMemo(() => {
    if (!currentApt) return false;
    const fromChart = currentApt.patientChart?.medicalHistory.systemicDiseases || [];
    const fromAlerts = currentApt.medicalAlerts || [];
    return (
      fromChart.some((d) => d.toLowerCase().includes('hypertension')) ||
      fromAlerts.some((alt) => alt.labelEn.toLowerCase().includes('hypertension'))
    );
  }, [currentApt]);

  // Filtered Add-ons list
  const filteredAddons = useMemo(() => {
    if (addonsCategoryFilter === 'all') return CHAIRSIDE_ADDONS;
    return CHAIRSIDE_ADDONS.filter((a) => a.category === addonsCategoryFilter);
  }, [addonsCategoryFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* =========================================================================
          1. TOP CLINICAL HEADER (Exact match to DentalPin standard)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Operatory Station
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-500">
              {clinic.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2.5">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            <span>Chairside Doctor & FDI Clinical Chart</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time 32-tooth odontogram, chairside clinical add-ons, Ethiopian Rx pad & front desk billing
          </p>
        </div>

        {/* Doctor Switcher & Chair Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/90 text-xs shadow-2xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              aria-label="Select Doctor"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {clinic.doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.specialty || 'Lead Surgeon'}
                </option>
              ))}
            </select>
          </div>

          {currentApt ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Chair #{currentApt.chairNumber || 1}: {currentApt.patientName}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              <span>No Patient in Chair</span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. DYNAMIC NOTIFICATION & AFROMESSAGE SMS TOAST BANNER
         ========================================================================= */}
      {smsToast && (
        <div className="p-3.5 bg-blue-50 border border-blue-200/90 text-blue-900 rounded-2xl flex items-center justify-between gap-3 shadow-card animate-spring-pop text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">{smsToast.message}</span>
              <span className="text-blue-700 ml-2">· {smsToast.subtext}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSmsToast(null)}
            className="text-blue-400 hover:text-blue-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {finishSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between shadow-card animate-spring-pop">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Encounter Finished & Dispatched!</p>
              <p className="text-xs text-emerald-700">
                Total bill of {grandTotalETB.toLocaleString()} ETB sent to Cashier Ledger for official receipt generation.
              </p>
            </div>
          </div>
          <Link
            href="/payments"
            className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 px-3 py-1.5 bg-white rounded-xl border border-emerald-300"
          >
            View Cashier Ledger →
          </Link>
        </div>
      )}

      {/* =========================================================================
          3. MAIN CLINICAL WORKSPACE
         ========================================================================= */}
      {currentApt ? (
        <div className="space-y-6">
          {/* =====================================================================
              A. COMPREHENSIVE PATIENT PROFILE BANNER
              (100% Consistent with Treatment Plan page & Ethiopian Clinical Chart)
             ===================================================================== */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              {/* Patient Identity & MRN */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-2xs shrink-0">
                  {currentApt.patientName.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {currentApt.patientName}
                    </h2>
                    {currentApt.patientChart?.fullNameAmharic && (
                      <span className="text-xs text-slate-500 font-medium">
                        ({currentApt.patientChart.fullNameAmharic})
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                      {currentApt.patientChart?.cardNo || currentApt.patientChart?.medicalRecordNumber || 'BDS-MRN-2026-0042'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      Chair #{currentApt.chairNumber || 1}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="font-mono text-slate-600">{currentApt.patientPhone}</span>
                    <span>·</span>
                    <span>
                      {currentApt.patientChart?.age || 32} yrs · {currentApt.patientChart?.gender || 'Female'}
                    </span>
                    <span>·</span>
                    <span className="text-slate-700 font-medium truncate max-w-xs">
                      {currentApt.patientChart?.subcityWoreda || 'Bole Subcity, Woreda 03 (Brass Hospital Area)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Ethiopian Paper Chart Drawer Trigger */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPatientDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-98"
                  title="Open Complete Ethiopian Paper Clinical Chart"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Clinical Paper Chart</span>
                </button>

                {matchingPlan && (
                  <Link
                    href={`/treatment-plans`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 transition-all shadow-2xs"
                    title="Open Treatment Plan Workspace"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Plan: {matchingPlan.id}</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/90 transition-colors"
                  title="Print Encounter Summary"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Medical Flags / Allergies Alert Strip (Prominent Clinical Safety Warnings) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              {/* Chief Complaint & HPI */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chief Complaint & Clinical Presentation:</span>
                </div>
                <p className="text-slate-800 italic">
                  &ldquo;{currentApt.patientChart?.chiefComplaint || 'Consultation and tooth examination for pain and dental care.'}&rdquo;
                </p>
                {currentApt.patientChart?.definitiveDiagnosis && (
                  <p className="text-[11px] text-slate-500 pt-0.5">
                    <span className="font-semibold text-slate-700">Diagnosis:</span>{' '}
                    {currentApt.patientChart.definitiveDiagnosis}
                  </p>
                )}
              </div>

              {/* Medical Alerts & Allergy Guard */}
              <div className="space-y-1.5">
                {hasPenicillinAllergy && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[11px]">
                        CRITICAL ALLERGY ALERT:
                      </span>{' '}
                      <span>Penicillin / Amoxicillin Allergy. DO NOT administer beta-lactams. Use Clindamycin.</span>
                    </div>
                  </div>
                )}

                {hasHypertensionAlert && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[11px]">
                        CARDIOVASCULAR PRECAUTION:
                      </span>{' '}
                      <span>Hypertension Stage 2. Avoid Epinephrine vasoconstrictors; use Mepivacaine 3% Plain.</span>
                    </div>
                  </div>
                )}

                {!hasPenicillinAllergy && !hasHypertensionAlert && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No active medical contraindications recorded. Routine clinical precautions apply.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================================
              B. TWO-COLUMN OPERATORY WORKSPACE
              Left (Span 8): 32-Tooth FDI Odontogram & Rapid Tooth Staging
              Right (Span 4): Doctor Add-Ons, Rx Pad, Running Bill & Dispatch
             ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: 32-Tooth Anatomic FDI Odontogram & Clinical Notes (Span 8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* ORTHODONTIC COURSE-OF-CARE & BRACES ADJUSTMENT SUITE */}
              {matchingContract && (
                <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-200/90 rounded-2xl p-5 shadow-card space-y-4 animate-spring-pop">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                        <Armchair className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                            {matchingContract.id}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {matchingContract.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {matchingContract.currentStage} · 4-Week Adjustment Cadence
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100/80 text-blue-800 border border-blue-200">
                        Visit {matchingContract.completedVisitsCount + 1} of {matchingContract.estimatedVisits}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {Math.round(((matchingContract.completedVisitsCount + 1) / matchingContract.estimatedVisits) * 100)}% Complete
                      </span>
                    </div>
                  </div>

                  {/* Financial KPI Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Contract</p>
                      <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{matchingContract.totalContractETB.toLocaleString()} ETB</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Collected</p>
                      <p className="text-sm font-extrabold text-emerald-700 font-mono mt-0.5">{matchingContract.totalCollectedETB.toLocaleString()} ETB</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
                      <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{matchingContract.remainingBalanceETB.toLocaleString()} ETB</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Prepaid Credit</p>
                      <p className={`text-sm font-extrabold font-mono mt-0.5 ${matchingContract.prepaidCreditETB > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                        {matchingContract.prepaidCreditETB > 0 ? `${matchingContract.prepaidCreditETB.toLocaleString()} ETB (Credit)` : '0 ETB'}
                      </p>
                    </div>
                  </div>

                  {/* Advance Credit Highlight (Q2 Response: Overpayment & Advance Credit Held) */}
                  {matchingContract.prepaidCreditETB >= matchingContract.installmentPerVisitETB ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">✨ ADVANCE CREDIT ACTIVE:</span>{' '}
                        <span>
                          Patient has {matchingContract.prepaidCreditETB.toLocaleString()} ETB advance credit on file. Today&apos;s regular installment of {matchingContract.installmentPerVisitETB.toLocaleString()} ETB is <strong>100% COVERED</strong> without charging extra. Next {Math.floor(matchingContract.prepaidCreditETB / matchingContract.installmentPerVisitETB)} visits prepaid.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-100/50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                      <span>Standard 1-Month Installment Due Today:</span>
                      <span className="font-mono font-bold text-blue-800">+{matchingContract.installmentPerVisitETB.toLocaleString()} ETB (Visit {matchingContract.completedVisitsCount + 1})</span>
                    </div>
                  )}

                  {/* Ortho Chairside Actions: Wire + Ligature + Broken Bracket Handler */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        Chairside Braces Adjustment:
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">Month {matchingContract.completedVisitsCount + 1} of {matchingContract.estimatedVisits}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Archwire selector */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Archwire Engaged Today:
                        </label>
                        <select
                          value={selectedArchwire}
                          onChange={(e) => setSelectedArchwire(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="0.014 NiTi (Initial Alignment)">0.014 NiTi (Initial Alignment)</option>
                          <option value="0.016 NiTi (Leveling & Rotation)">0.016 NiTi (Leveling & Rotation)</option>
                          <option value="0.016x0.022 NiTi (Torque Expression)">0.016x0.022 NiTi (Torque Expression)</option>
                          <option value="0.019x0.025 SS (Space Closure & Consolidation)">0.019x0.025 SS (Space Closure & Consolidation)</option>
                          <option value="0.021x0.025 TMA (Finishing & Detailing)">0.021x0.025 TMA (Finishing & Detailing)</option>
                        </select>
                      </div>

                      {/* Ligature color */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Elastomeric Ligature Ties:
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[
                            { name: 'Cobalt Blue', bg: 'bg-blue-600 text-white' },
                            { name: 'Silver Titanium', bg: 'bg-slate-400 text-white' },
                            { name: 'Emerald Green', bg: 'bg-emerald-600 text-white' },
                            { name: 'Pearl Clear', bg: 'bg-slate-100 text-slate-800 border border-slate-300' },
                            { name: 'Ruby Red', bg: 'bg-rose-600 text-white' },
                          ].map((col) => (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => setSelectedLigatureColor(col.name)}
                              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                selectedLigatureColor === col.name
                                  ? col.bg + ' ring-2 ring-blue-500 ring-offset-1 font-bold shadow-2xs'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {col.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Emergency Broken Bracket Handler (Q3 Response: Clinic/Doctor Option) */}
                    <div className="pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bracketRepaired}
                          onChange={(e) => setBracketRepaired(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-800">
                          Emergency Bracket Rebond / Repair Today {selectedTooth ? `(Tooth #${selectedTooth})` : ''}
                        </span>
                      </label>

                      {bracketRepaired && (
                        <div className="mt-2.5 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-spring-pop text-xs">
                          <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wider">
                            Bracket Repair Billing Policy (Configurable by Clinic):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              bracketChargePolicy === 'complimentary'
                                ? 'bg-white border-blue-600 font-bold text-blue-900 shadow-2xs'
                                : 'bg-white/60 border-slate-200 text-slate-700'
                            }`}>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="bracketPolicy"
                                  checked={bracketChargePolicy === 'complimentary'}
                                  onChange={() => setBracketChargePolicy('complimentary')}
                                  className="text-blue-600"
                                />
                                <span>Option A: Complimentary</span>
                              </div>
                              <span className="font-mono text-emerald-700 font-bold">0 ETB (Included)</span>
                            </label>

                            <label className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              bracketChargePolicy === 'chargeable'
                                ? 'bg-white border-blue-600 font-bold text-blue-900 shadow-2xs'
                                : 'bg-white/60 border-slate-200 text-slate-700'
                            }`}>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="bracketPolicy"
                                  checked={bracketChargePolicy === 'chargeable'}
                                  onChange={() => setBracketChargePolicy('chargeable')}
                                  className="text-blue-600"
                                />
                                <span>Option B: Extra Fee</span>
                              </div>
                              <span className="font-mono text-blue-700 font-bold">+{bracketCustomFeeETB} ETB</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 1. 32-Tooth FDI Anatomic Odontogram Chart (Exact match to Treatment Plan page) */}
              <div className="space-y-3">
                <TreatmentOdontogramChart
                  chartNotation={activeChartNotation}
                  selectedTooth={selectedTooth}
                  onSelectTooth={(num) => setSelectedTooth(num)}
                  archType={archType}
                  onToggleArchType={(type) => setArchType(type)}
                  onWholeMouthSelect={() => setSelectedTooth(null)}
                  onAddQuickCleaning={handleQuickCleaning}
                  onAddQuickFirstVisit={() => {
                    const firstVisitAddon = CHAIRSIDE_ADDONS.find((a) => a.id === 'add-iopa');
                    if (firstVisitAddon) toggleAddon(firstVisitAddon);
                  }}
                />

                {/* Tooth Context Card (Renders when a tooth is clicked) */}
                {selectedTooth && (
                  <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-4 shadow-card animate-spring-pop space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-100">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-2xs">
                          {selectedTooth}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            FDI Tooth #{selectedTooth} Quick Diagnosis & Restorative Staging
                          </h4>
                          <p className="text-xs text-slate-500">
                            Current Status: <span className="font-bold uppercase text-blue-700">{activeChartNotation[selectedTooth] || 'Healthy'}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedTooth(null)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 self-start sm:self-auto"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    </div>

                    {/* Tooth Status Selector Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mr-1">
                        Status:
                      </span>
                      {[
                        { label: 'Healthy', val: 'healthy' as ToothStatus, color: 'bg-white text-slate-700 border-slate-200' },
                        { label: 'Caries', val: 'caries' as ToothStatus, color: 'bg-amber-100 text-amber-800 border-amber-300' },
                        { label: 'Filled', val: 'filled' as ToothStatus, color: 'bg-blue-100 text-blue-800 border-blue-300' },
                        { label: 'Crown', val: 'crown' as ToothStatus, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                        { label: 'Root Canal', val: 'rct' as ToothStatus, color: 'bg-purple-100 text-purple-800 border-purple-300' },
                        { label: 'Missing', val: 'missing' as ToothStatus, color: 'bg-slate-200 text-slate-800 border-slate-300' },
                      ].map((st) => (
                        <button
                          key={st.val}
                          type="button"
                          onClick={() => handleSetToothStatus(st.val)}
                          className={`px-2.5 py-1 rounded-lg border transition-all text-xs ${
                            activeChartNotation[selectedTooth] === st.val
                              ? 'ring-2 ring-blue-600 font-bold ' + st.color
                              : 'hover:bg-slate-100 ' + st.color
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    {/* Tooth-Level Fast Restorative Procedures */}
                    <div className="pt-1">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                        1-Tap Restorative Procedures for Tooth #{selectedTooth}:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {TOOTH_QUICK_PROCEDURES.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleApplyToothProcedure(p)}
                            className="p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-blue-50 hover:border-blue-300 text-left transition-all group shadow-2xs"
                          >
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                              {p.name}
                            </p>
                            <p className="text-[11px] font-mono font-semibold text-blue-600 mt-0.5">
                              +{p.feeETB.toLocaleString()} ETB
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Doctor Chairside Clinical Notes & HPI Update */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Doctor Clinical Notes & Operatory Record
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    BDS Permanent Chart Entry
                  </span>
                </div>

                <textarea
                  rows={3}
                  placeholder="e.g. Tooth 16 occlusal caries excavated to firm dentin. 37% phosphoric acid etch 15s, single bond adhesive cured, Filtek Z250 composite resin shade A2 restored in 2mm increments. Bite adjusted with articulating paper."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 leading-relaxed"
                />

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Signed by: <strong className="text-slate-800">{activeDoctor.name}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      if (matchingPlan && doctorNotes.trim()) {
                        sinnaStore.addClinicalNoteToPlan(matchingPlan.id, {
                          id: `note-${Date.now()}`,
                          authorCode: 'ST',
                          authorName: activeDoctor.name,
                          type: 'treatment',
                          content: doctorNotes.trim(),
                          createdAt: new Date().toLocaleTimeString(),
                        });
                        showSmsBanner('Clinical Note Saved', 'Appended to patient treatment history');
                      }
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Sync note to Treatment Plan →
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Doctor Add-Ons, Rx Pad, Running Bill & Dispatch (Span 4) */}
            <div className="lg:col-span-4 space-y-5">
              {/* 1. Today's Real-time Running Bill */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Today&apos;s Running Ledger</h3>
                    <p className="text-[11px] text-slate-500">Live chairside settlement</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Live ETB
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Scheduled service or contract installment */}
                  {matchingContract ? (
                    <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200/90 space-y-1">
                      <div className="flex items-center justify-between text-blue-900 font-bold">
                        <span>Month {matchingContract.completedVisitsCount + 1} Braces Installment:</span>
                        <span className="font-mono">
                          {isCoveredByPrepaidCredit ? (
                            <span className="text-emerald-700 font-extrabold">0 ETB (Prepaid)</span>
                          ) : (
                            `${matchingContract.installmentPerVisitETB.toLocaleString()} ETB`
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-blue-700">
                        Contract {matchingContract.id} · Remaining: {matchingContract.remainingBalanceETB.toLocaleString()} ETB
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="truncate pr-2">Scheduled: {currentApt.serviceName}</span>
                      <span className="font-semibold text-slate-900 shrink-0 font-mono">
                        {baseScheduledFee.toLocaleString()} ETB
                      </span>
                    </div>
                  )}

                  {/* Broken bracket emergency fee if chargeable */}
                  {bracketFee > 0 && (
                    <div className="flex items-center justify-between text-blue-700">
                      <span className="truncate pr-2">+ Emergency Bracket Repair:</span>
                      <span className="font-bold shrink-0 font-mono">
                        +{bracketFee.toLocaleString()} ETB
                      </span>
                    </div>
                  )}

                  {/* Procedures added in chair */}
                  {selectedProcedures.map((proc) => (
                    <div key={proc.id} className="flex items-center justify-between text-blue-700">
                      <span className="truncate pr-2">+ {proc.name}</span>
                      <span className="font-bold shrink-0 font-mono">
                        +{proc.feeETB.toLocaleString()} ETB
                      </span>
                    </div>
                  ))}

                  {/* Add-ons added */}
                  {selectedAddons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between text-blue-700">
                      <span className="truncate pr-2">+ {addon.nameEn}</span>
                      <span className="font-bold shrink-0 font-mono">
                        +{addon.priceETB.toLocaleString()} ETB
                      </span>
                    </div>
                  ))}

                  {/* Deposit Paid deduction */}
                  {depositPaidETB > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 pt-1 border-t border-dashed border-slate-200">
                      <span>Less Deposit Paid (Chapa / Telebirr):</span>
                      <span className="font-semibold font-mono">
                        -{depositPaidETB.toLocaleString()} ETB
                      </span>
                    </div>
                  )}

                  {/* Net Total Due */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Balance Due at Checkout:</p>
                      <p className="text-[10px] text-slate-500">Ministry of Revenues Compliant</p>
                    </div>
                    <span className="text-xl font-extrabold text-blue-700 font-mono">
                      {netDueETB.toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                {/* Recall Months Selection */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Next Preventative Recall:
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRecallMonths(m)}
                        className={`py-1.5 rounded-xl border transition-all ${
                          recallMonths === m
                            ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {m} Months
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dispatch & SMS Actions */}
                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={handleFinishEncounter}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Finish Visit & Dispatch to Checkout</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendPostOpSms}
                    className="w-full py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Send AfroMessage Post-Op Care SMS</span>
                  </button>
                </div>
              </div>

              {/* 2. CHAIRSIDE WORKSPACE TABS: Add-Ons | Rx Pad | Staged Treatment Plan */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
                <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceTab('addons')}
                    className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
                      activeWorkspaceTab === 'addons'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Clinical Add-Ons ({selectedAddons.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceTab('rx')}
                    className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
                      activeWorkspaceTab === 'rx'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Rx Pad ({activeRxList.length})
                  </button>

                  {matchingPlan && (
                    <button
                      type="button"
                      onClick={() => setActiveWorkspaceTab('staged_plan')}
                      className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
                        activeWorkspaceTab === 'staged_plan'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Plan Items
                    </button>
                  )}
                </div>

                {/* TAB 1: CLINICAL ADD-ONS LIST */}
                {activeWorkspaceTab === 'addons' && (
                  <div className="p-4 space-y-3">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
                      {[
                        { label: 'All', id: 'all' },
                        { label: 'Diagnostic', id: 'Diagnostic & Imaging' },
                        { label: 'Anesthesia', id: 'Anesthesia & Comfort' },
                        { label: 'Restorative', id: 'Restorative & Endo' },
                        { label: 'Hygiene', id: 'Periodontal & Hygiene' },
                        { label: 'Surgical', id: 'Surgical & Emergency' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAddonsCategoryFilter(cat.id)}
                          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                            addonsCategoryFilter === cat.id
                              ? 'bg-blue-600 text-white font-bold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      {filteredAddons.map((addon) => {
                        const isSelected = selectedAddons.some((a) => a.id === addon.id);
                        const isContraindicated =
                          hasHypertensionAlert &&
                          addon.contraindicatedForAlerts?.includes('Hypertension');
                        const isSafeAlternative =
                          hasHypertensionAlert &&
                          addon.safeAlternativeForAlerts?.includes('Hypertension');

                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => toggleAddon(addon)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-start justify-between transition-all text-xs ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-slate-900 truncate">
                                  {addon.nameEn}
                                </p>
                                {isContraindicated && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    Avoid (Epi Alert)
                                  </span>
                                )}
                                {isSafeAlternative && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Cardio Safe
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                {addon.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pt-0.5">
                              <span className="font-mono font-bold text-blue-700">
                                +{addon.priceETB} ETB
                              </span>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: RX PAD (ETHIOPIAN DENTAL DRUGS) */}
                {activeWorkspaceTab === 'rx' && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-800">Dental Formulary Templates:</span>
                      <span className="text-[11px] text-slate-500">1-Tap Prescription</span>
                    </div>

                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      {RX_TEMPLATES.map((tmpl) => {
                        const isPrescribed = activeRxList.some((rx) =>
                          rx.drugName.includes(tmpl.drugName.split(' ')[0])
                        );
                        const isAllergyConflict =
                          hasPenicillinAllergy && tmpl.allergyFlag === 'Penicillin';

                        return (
                          <div
                            key={tmpl.id}
                            className={`p-2.5 rounded-xl border transition-all text-xs ${
                              isAllergyConflict
                                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                                : isPrescribed
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : 'bg-white border-slate-200/90 text-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold">{tmpl.drugName}</span>
                                  {isAllergyConflict && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-200 text-rose-900 border border-rose-300">
                                      CONTRAINDICATED: Penicillin Allergy
                                    </span>
                                  )}
                                  {tmpl.safeAlternative && hasPenicillinAllergy && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      RECOMMENDED NON-PENICILLIN
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  {tmpl.dosage} · {tmpl.frequency} · {tmpl.duration}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={isAllergyConflict}
                                onClick={() => handleToggleRxTemplate(tmpl)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                                  isAllergyConflict
                                    ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                                    : isPrescribed
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {isPrescribed ? 'Prescribed ✓' : '+ Add Rx'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Prescription Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{activeRxList.length} drugs active in Rx</span>
                      <button
                        type="button"
                        onClick={() => {
                          showSmsBanner(
                            'Rx Dispatched via AfroMessage SMS',
                            `Prescription sent to ${currentApt.patientName}'s phone`
                          );
                        }}
                        className="font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Rx via SMS</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: STAGED TREATMENT PLAN ITEMS */}
                {activeWorkspaceTab === 'staged_plan' && matchingPlan && (
                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{matchingPlan.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{matchingPlan.id}</p>
                      </div>
                      <Link
                        href="/treatment-plans"
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        Open Workspace →
                      </Link>
                    </div>

                    <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                      {matchingPlan.procedures.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl border border-slate-200/90 bg-white flex items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">
                              Category: {item.category.replace('_', ' ')}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-slate-800">
                            {item.feeETB.toLocaleString()} ETB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NO ACTIVE PATIENT IN CHAIR: SHOW WAITING & UPCOMING QUEUE */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-card text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <Armchair className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              No Patient Currently Seated in Operatory
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a patient from the waiting room to begin chairside examination and 32-tooth odontogram charting.
            </p>
          </div>

          {waitingPatients.length > 0 ? (
            <div className="space-y-2 text-left pt-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Patients Waiting in Lounge ({waitingPatients.length}):
              </p>
              {waitingPatients.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/90 flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {apt.patientName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {apt.serviceName} · <span className="font-mono">{apt.patientPhone}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartPatient(apt.id)}
                    className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs transition-all active:scale-98 shrink-0"
                  >
                    Start Visit in Chair 1 →
                  </button>
                </div>
              ))}
            </div>
          ) : upcomingPatients.length > 0 ? (
            <div className="text-left pt-2 space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Upcoming Appointments Today ({upcomingPatients.length}):
              </p>
              {upcomingPatients.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{apt.patientName}</p>
                    <p className="text-slate-500">
                      Scheduled: {new Date(apt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sinnaStore.checkInPatient(apt.id);
                      handleStartPatient(apt.id);
                    }}
                    className="px-3 py-1 font-bold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    Check In & Seat →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">
              All appointments for today have been treated and completed.
            </p>
          )}

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Return to Clinic Home
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. FULL ETHIOPIAN PAPER CLINICAL CHART DRAWER (PATIENT RECORD DRAWER)
         ========================================================================= */}
      <PatientRecordDrawer
        appointmentId={currentApt?.id || null}
        isOpen={patientDrawerOpen}
        onClose={() => setPatientDrawerOpen(false)}
      />
    </div>
  );
}
