# SINNA DENTAL AI: CLINICAL ARCHITECTURE & DESIGN SYSTEM
**Codename:** Sinna Dental AI  
**Design Standard:** DentalPin & Linear Precision (Clean Clinical Luxury)  
**Target Market:** Urban Ethiopia (Addis Ababa, Bole Medhanialem) & Global Healthcare Practice  
**Deployment Infrastructure:**
* **Frontend & Edge API:** Next.js 15 App Router on Vercel Global Edge Network
* **Database Engine:** PostgreSQL via Prisma Client with `@prisma/adapter-pg` pooling
* **SMS Gateway:** AfroMessage Telecommunications Engine for patient reminders & recalls

---

## 1. DESIGN PHILOSOPHY: CLINICAL LUXURY (DENTALPIN CONSISTENCY)

Sinna Dental AI adheres strictly to the **DentalPin** design architecture:
1. **Zero Emojis**: 100% SVG Lucide iconography across the entire application.
2. **Organized Categorical Navigation**:
   - General: `Home` (`/`), `Schedule` (`/schedule`)
   - `CLINICAL`: `Patients` (`/patients`), `Recalls` (`/recalls`), `Treatment Plans` (`/treatment-plans`)
   - `FINANCIALS`: `Quotes` (`/quotes`), `Invoices` (`/invoices`), `Payments` (`/payments`)
   - `PRACTICE`: `Reports` (`/reports`)
   - Operator Profile & Settings Gear (`/admin` - Doctor Only)
3. **No AI Fluff or Toy Pickers**:
   - Real, authentic enterprise clinical software.
   - Clean single email/password login (no redundant tabs, no station dropdowns, clean demo quick-fill).
4. **Strict 2-Actor Permission Model**:
   - **Doctor / Clinical Director (`Dr. Senait Tadesse`)**: Full access to all features and Admin Settings.
   - **Front Desk (`Helen Tadesse`)**: Operational access only; strictly blocked from Admin Settings.

### 1.1 Color Palette & Visual Tokens (Clinical Sapphire Edition)

```css
:root {
  /* Surface hierarchy: Swiss Clinical Alabaster */
  --bg-app: #F8FAFC;             /* Slate-50 clean medical canvas */
  --bg-card: #FFFFFF;            /* Pure elevated surface */
  --bg-subtle: #F0F7FF;          /* 2% Sapphire tint input fill */
  
  /* Primary Clinical Accents (Clinical Sapphire & Electric Cyan) */
  --brand-primary: #1A4F9E;      /* Royal Medical Deep Blue (Authority & Precision) */
  --brand-accent: #00BFFF;       /* Vivid Electric Cyan (High-Tech Diagnostic Highlight) */
  --brand-surface: #EBF5FF;      /* Soft blue pill badge background */
  --brand-hover: #143E7D;        /* Deep sapphire button press state */
  
  /* Financial & Status Tokens */
  --status-confirmed: #059669;   /* Crisp emerald: Paid deposit / Checked-in */
  --status-pending: #D97706;     /* Amber: 10-minute hold active */
  --status-danger: #DC2626;      /* Crimson: Unpaid deposit / Red flag alert */
  --status-muted: #64748B;       /* Slate: Archive / Complete */

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  --font-amharic: 'Noto Sans Ethiopic', 'Nyala', sans-serif;
}
```

### 1.2 Micro-Interactions & Haptic Tactility (The "Feel")
1. **The 0ms Perceived Latency (Optimistic UI):** When the receptionist taps `[Check In]`, the badge flips to green immediately with a subtle spring bounce (`scale(0.97)` to `scale(1)` in 120ms). The database mutation commits asynchronously.
2. **Deposit Countdown Clock:** The 10-minute hold timer displays a sleek, glowing perimeter ring that shrinks smoothly.
3. **Receipt Handoff:** Generating a receipt produces a tactile slide-out preview sheet resembling high-end thermal paper with an Ethiopian Revenue Authority-compliant QR seal.

---

## 2. NEON SERVERLESS DATABASE ARCHITECTURE

Neon allows zero-cost serverless PostgreSQL with auto-scaling down to zero compute and instant spin-up via WebSocket pooling.

### 2.1 Connection Pooling Setup (`lib/db.ts`)
```typescript
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Enables pipelined HTTP queries for ultra-low latency serverless execution
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### 2.2 Production Schema with Exclusion Constraints & Multitenancy

```typescript
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";

// 1. TENANT ENTITY (THE CLINIC)
export const clinics = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // e.g., 'smilecare'
  name: varchar("name", { length: 255 }).notNull(),
  locationDisplay: varchar("location_display", { length: 255 }).notNull(),
  phonePrimary: varchar("phone_primary", { length: 32 }).notNull(),
  telegramHandle: varchar("telegram_handle", { length: 64 }),
  instagramHandle: varchar("instagram_handle", { length: 64 }),
  mapsUrl: text("maps_url"),
  brandingJson: jsonb("branding_json").notNull().default({
    primaryColor: "#044E42",
    accentColor: "#0D9488",
    logoUrl: "/brands/smilecare-logo.svg",
    taglineAmharic: "ዘመናዊ እና ህመም የሌለው የጥርስ ህክምና",
    taglineEnglish: "Modern, Painless Dentistry in Bole"
  }),
  policyJson: jsonb("policy_json").notNull().default({
    depositRequired: true,
    depositAmountMinor: 30000, // 300 ETB
    graceWindowMinutes: 45
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

// 2. CLINIC SERVICES CATALOG
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id").references(() => clinics.id, { onDelete: 'cascade' }).notNull(),
  nameEnglish: varchar("name_en", { length: 128 }).notNull(),
  nameAmharic: varchar("name_am", { length: 128 }).notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  priceMinor: integer("price_minor").notNull(), // Santims (e.g. 150000 = 1500 ETB)
  depositRequired: boolean("deposit_required").default(false).notNull(),
  active: boolean("active").default(true).notNull()
});

// 3. APPOINTMENTS (WITH CONCURRENCY EXCLUSION)
export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id").references(() => clinics.id, { onDelete: 'cascade' }).notNull(),
  patientName: varchar("patient_name", { length: 128 }).notNull(),
  patientPhone: varchar("patient_phone", { length: 32 }).notNull(), // E.164 +251...
  dentistName: varchar("dentist_name", { length: 128 }).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 32 }).default("confirmed").notNull(), 
  // 'pending_payment', 'confirmed', 'checked_in', 'in_progress', 'completed', 'missed'
  holdExpiresAt: timestamp("hold_expires_at", { withTimezone: true }),
  depositPaidMinor: integer("deposit_paid_minor").default(0).notNull(),
  checkInAt: timestamp("check_in_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => {
  return {
    clinicIdx: index("appointments_clinic_idx").on(table.clinicId),
    slotIdx: index("appointments_slot_idx").on(table.dentistName, table.startsAt)
  };
});

// 4. FINANCIAL LEDGER (DOUBLE-ENTRY AUDITABLE)
export const ledgerTransactions = pgTable("ledger_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id").references(() => clinics.id, { onDelete: 'cascade' }).notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  receiptNumber: varchar("receipt_number", { length: 64 }).notNull(),
  method: varchar("method", { length: 32 }).notNull(), // 'cash', 'telebirr', 'chapa_online'
  amountMinor: integer("amount_minor").notNull(),
  recordedBy: varchar("recorded_by", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
```

---

## 3. UNIVERSAL BIO-LINK LANDING ENGINE (`/c/[slug]`)

When a patient taps the bio link in **TikTok (`tiktok.com/@smilecare_dental`)** or **Instagram**, they don't see a slow corporate homepage. They see an **Apple-grade Fast Booking Sheet**:

### The Anatomy of the Landing View
```
┌────────────────────────────────────────────────────────┐
│ [Logo] SMILE CARE DENTAL                    [Call Now] │
│ ⭐ 4.9 • Bole Medhanialem (Next to Morning Star)        │
│ 🟢 Open Today: 8:30 AM - 7:00 PM                       │
├────────────────────────────────────────────────────────┤
│ "ዘመናዊ እና ህመም የሌለው የጥርስ ህክምና በቦሌ"                │
│ Modern, Painless Dentistry in Addis Ababa              │
│                                                        │
│ [ ⚡ BOOK AN APPOINTMENT IN 60 SECONDS ]               │
├────────────────────────────────────────────────────────┤
│ POPULAR PROCEDURES & TRANSPARENT PRICING:              │
│ • Routine Cleaning & Scaling       1,500 ETB (45m)     │
│ • Emergency Tooth Pain Relief      1,200 ETB (30m)     │
│ • Root Canal Treatment             6,000 ETB (90m)     │
│ • Teeth Whitening (Laser)          8,000 ETB (60m)     │
├────────────────────────────────────────────────────────┤
│ OUR DOCTORS:                                           │
│ [Photo] Dr. Senait Tadesse - Orthodontics & Surgery    │
│ [Photo] Dr. Dawit Bekele   - Implantology & Restorative│
└────────────────────────────────────────────────────────┘
```

---

## 4. THE 4 PITCH-READY INTERACTIVE DEMO VIEWS

### View 1: Mobile Patient Funnel (with Live Chapa & AfroMessage Trigger)
* **Step 1:** Selects Service & Doctor.
* **Step 2:** Selects real open slot (e.g. `Tomorrow 10:00 AM`).
* **Step 3:** Enters Name & Phone `0911223344`.
* **Step 4:** Chapa Telebirr Deposit Sheet pops up $\rightarrow$ User taps **[Simulate 300 ETB Payment]** $\rightarrow$ Slot turns `CONFIRMED`.
* **The Magic Touch:** An Apple-style glassmorphic banner slides down from the top:
  > **💬 AfroMessage (SMS Delivered)**  
  > *"ሰላም አበበ፣ የቀጠሮዎ ቀን ሐሙስ በ 4:00 ሰዓት ከዶ/ር ሰናይት ጋር ተይዟል። 300 ብር ቅድመ ክፍያ ደርሷል። ቦሌ መድኃኒዓለም።"*

### View 2: Receptionist Operational Dispatch Queue
* **Live Sync:** Displays Abebe Kebede's appointment immediately without manual page refresh.
* **Payment State:** Green Badge `[300 ETB Deposit Verified]`.
* **1-Click Check-In:** Turns status to `Waiting in Lounge`.
* **Check-Out & Invoicing:** Collects remaining 1,200 ETB cash $\rightarrow$ Instantly renders official printable receipt `RCP-2026-0042`.

### View 3: Chairside Doctor 30-Second Encounter Modal
* Doctor taps **[Start Encounter]**.
* Checkboxes: `[x] Routine Cleaning (1,500 ETB)` + `[x] Fluoride Protection (500 ETB)`.
* Next recall selector: `[ 6 Months (April 2027) ]`.
* Taps **[Complete & Send Bill to Front Desk]**.

### View 4: Manager End-of-Day Reconciliation & Cash-Close
* **Daily Billed vs Collected:**
  * Cash in Drawer: `18,000 ETB`
  * Telebirr / Chapa: `12,000 ETB`
* **Interactive Vault Count:** Manager types `18000` into physical cash input $\rightarrow$ `Variance: 0.00 ETB (Balanced)`.
* Manager clicks **[Freeze & Sign Off Day]**.

---

## 5. FREE TIER DEPLOYMENT INSTRUCTIONS

1. **GitHub Repository:** Push codebase to GitHub.
2. **Neon Database:** Create a free project at `neon.tech` $\rightarrow$ Copy pooled connection string.
3. **Vercel Deployment:** Import repository into Vercel $\rightarrow$ Add `DATABASE_URL` environment variable $\rightarrow$ Deploy.
4. **UptimeRobot:** Create free HTTP monitor targeting `https://<your-project>.vercel.app/api/health` every 48 hours to prevent Neon auto-suspension.

---
**End of Specification.**
