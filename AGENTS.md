# AGENTS.md — Sinna Dental AI Core Architectural & UI Guidelines

This document governs the design, behavior, and technical execution of **Sinna Dental AI**. Every agent working on this repository must strictly adhere to these principles without exception.

---

## 1. Product Identity & Aesthetics

- **Official Name**: `Sinna Dental AI`
- **Design Language**: **Clinical Precision & Luxury (DentalPin / Linear Aesthetic)**
  - Clean, Swiss/Nordic clinical minimalism.
  - Subtle slate surfaces (`#F8FAFC`, `#FFFFFF`), precision borders (`border-slate-200/90`), subtle shadows (`shadow-card`).
  - Professional typography (clean sans-serif, monospaced numeric values).
  - **ZERO EMOJIS**: Strictly 100% SVG Lucide icons across all components, notifications, buttons, and badges. No emojis under any circumstance.
  - **No AI Fluffs**: No fake marketing fluff, no exaggerated AI badges, no toy persona switchers. Everything must look and feel like production-grade clinical hospital software (e.g. Epic Systems, DentalPin, Linear).

---

## 2. Navigation Architecture (DentalPin Standard)

The application navigation is permanently structured into organized categories:

```
Sinna Dental AI
├── Home                (/)                 DentalPin Clinic Home (Greeting, Today, Unconfirmed, Overdue, Recent, Week at a Glance)
└── Schedule            (/schedule)         Operatory Timeline & Chair Management (Chair 1 & 2)

CLINICAL
├── Patients            (/patients)         Patient Directory, Medical Alerts & History
├── Recalls             (/recalls)          Call List & Recall Follow-ups (Due/Overdue/Filters)
└── Treatment Plans     (/treatment-plans)  32-Tooth FDI Odontogram & Restorative Staging

FINANCIALS
├── Quotes              (/quotes)           Formal Treatment Estimates & Ethiopian Fee Quotes
├── Invoices            (/invoices)         Ministry of Revenues (MoR) Fiscal Invoices & Receipts
└── Payments            (/payments)         Cashier Ledger, CBE Birr & Telebirr POS Transactions

PRACTICE
└── Reports             (/reports)          Practice Analytics Dashboard (Collections Sparklines, Donut, Doctor Production, Z-Reports)

[BOTTOM LEFT]
Operator Avatar (SD / HT) · User Name · Email · [Gear] Settings (/admin - Doctor Only)
```

- **Top Bar**:
  - Clean clinical header: Active Clinic Name (*"Bole Dental Studio"*).
  - AfroMessage SMS notification drawer trigger, clinical hotline Help modal, and direct **Log out** button redirecting to `/login`.
  - **NO DEMO BANNERS**: No fake disclaimers (e.g. "Public demo - do not enter real data"). The UI must look 100% production-ready.
  - **NO ONBOARDING TOY WIDGETS**: No "Getting started · 4 of 4 steps done" progress cards or "Scan ticket" buttons.
  - **ALL PATIENT ENTRIES ARE CLICKABLE**: Clicking any patient row, name, or card across the system opens their comprehensive Ethiopian Paper Clinical Chart (BDS-MRN, Subcity/Woreda, Chief Complaint, HPI, Medical Alerts, FDI chart, Staged Plans, Rx, and MoR Receipts).
  - **PURPOSEFUL CHAIR DISPATCH**: Chair actions are contextual and actionable (*Check In*, *Seat in Chair 1/2*, *Clinical Chart*), replacing vague labels.
  - **TREATMENT PLANS & ODONTOGRAM WORKSPACE**: Full pipeline tabs (*To quote*, *Awaiting patient*, *No appointment*, *No next appointment*, *Closed*, *List*), anatomic 32-tooth FDI dental chart (18-28 and 48-38 with real root geometry and crown anatomy), 28+ categorized clinical procedures (*Restorative*, *Surgery*, *Endodontics*, *Orthodontics*, *Whole mouth*), staged treatment ledger with live ETB totals, and doctor clinical notes feed.

---

## 3. Strict 2-Actor Permission Model

There are exactly **two authorized actors** in the system:

### Actor 1: Doctor / Clinical Director
- **Operator**: `Dr. Senait Tadesse` (`doctor@boledental.et`)
- **Default Password**: `Password123!`
- **Station PIN**: `5678`
- **Scope**: **Full unrestricted access**. Can view and manage all clinical treatments, 32-tooth odontogram, schedules, financials, reports, and **Admin Settings (`/admin`)**.

### Actor 2: Front Desk Staff
- **Operator**: `Helen Tadesse` (`reception@boledental.et`)
- **Default Password**: `Password123!`
- **Station PIN**: `1234`
- **Scope**: **Operational access only** (Home, Schedule, Patients, Recalls / Call List, Invoices, Payments, Reports).
- **Strict Lockdown**:
  - `Admin Settings` (`/admin`) is **hidden from the navigation**.
  - Any direct visit to `/admin` must display the **Admin Settings Restricted** security gate.
  - Surgical diagnosis and treatment plan charting are doctor-managed.

---

## 4. Authentication Guidelines

- Single clean form: **Email** + **Password** (with show/hide eye toggle).
- No multiple tabs (no separate PIN tab or mode toggle on the login page).
- No redundant workstation dropdowns.
- Clean branding: **Sinna Dental AI** with simple sign-in context.
- Discreet quick-fill helper chips at the bottom that automatically populate the email and password fields for testing.

---

## 5. Ethiopian Clinical & Financial Context

- **Currency**: Ethiopian Birr (`ETB`).
- **Fiscal Compliance**: Ministry of Revenues (MoR) TIN: `0049283711`.
- **Payment Rails**: CBE Birr POS, Telebirr SuperApp, Physical Cash (200/100/50 Birr denominations), and Chapa Online Gateway.
- **Odontogram**: 32-Tooth FDI World Dental Federation notation (11-18, 21-28, 31-38, 41-48).
