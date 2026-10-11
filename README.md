# Sinna Dental AI

> **Clinical Precision & Luxury Practice Management Platform**  
> Tailored for Ethiopian dental clinics with FDI 32-Tooth Odontogram, Operatory Chair Dispatch, Ministry of Revenues (MoR) Fiscal Compliance, and Multichannel POS Rails.

---

## Quick Start (For Any New / "Pure" PC)

No coding tools, terminals, or VS Code required. Everything runs in 1 click.

### Windows (Most Common)
1. Download or clone this project folder to your computer.
2. Double-click **`start.bat`**.
   - If Node.js is missing, the script will automatically download and install it for you.
   - It will install all required packages (`node_modules`) on the first run.
   - It starts the application server and opens `http://localhost:3000` in your default web browser automatically.

### Mac / Linux / Git Bash
1. Open a terminal in the project directory.
2. Run:
   ```bash
   chmod +x start.sh refresh.sh
   ./start.sh
   ```

---

## How to Get New Updates (`Refresh`)

Whenever new features, fixes, or updates are pushed to the GitHub repository:

### Windows:
- Double-click **`refresh.bat`**.
  - It automatically runs `git pull origin main` to download the newest changes.
  - It updates any newly added packages.
  - It restarts the server and opens your browser.

### Mac / Linux:
- Run:
  ```bash
  ./refresh.sh
  ```

---

## Manual Installation Guide (Fallback for Restricted PCs)

If your computer has strict corporate firewalls or administrator policies that block automated script execution, follow these 3 simple manual steps:

1. **Install Node.js**:
   - Download the **LTS (Long Term Support)** installer from [https://nodejs.org/](https://nodejs.org/).
   - Run the installer and click *Next* through the wizard until complete.

2. **Open Terminal / Command Prompt** in this folder:
   - Hold `Shift` and right-click in this folder, then choose **"Open PowerShell window here"** or **"Open in Terminal"**.

3. **Run these two commands**:
   ```bash
   npm install
   npm run dev
   ```
4. Open your browser and go to: **`http://localhost:3000`**

---

## System Architecture & Code Walkthrough (For Non-Coders)

Here is a simple, plain-English explanation of how the code is organized:

```
Sinna/
├── app/                        # The Pages & Screens you see on the website
│   ├── page.tsx                # Clinic Home: Today's agenda, unconfirmed calls, queue
│   ├── schedule/               # Operatory Timeline: Chair 1 & Chair 2 live scheduling
│   ├── patients/               # Patient Directory, Medical Alerts & Clinical Odontogram
│   ├── treatment-plans/        # 32-Tooth FDI Odontogram, Restorative Staging & Quotes
│   ├── recalls/                # Follow-up recall call list & AfroMessage SMS alerts
│   ├── invoices/               # Ministry of Revenues (MoR) fiscal invoices & receipts
│   ├── payments/               # Cashier Ledger: Telebirr, CBE Birr, Cash & Chapa
│   ├── reports/                # Clinical & Financial Analytics (Z-Reports, sparklines)
│   ├── admin/                  # Doctor-only settings (protected by PIN 5678)
│   ├── doctor/                 # 30-Second Chairside operatory interface
│   └── book/                   # Public client booking portal (isolated, no login required)
│
├── components/                 # Reusable Building Blocks
│   ├── app-shell.tsx           # Navigation sidebar & clinical header
│   ├── treatment-odontogram-chart.tsx # Master 32-Tooth anatomical dual-view SVG odontogram
│   ├── treatment-procedure-grid.tsx   # 28+ clinical procedure catalog & staging ledger
│   ├── booking-modal.tsx       # Front-desk intake modal with editable payment rails
│   └── patient-record-drawer.tsx # Ethiopian paper clinical chart drawer (MRN, HPI, Rx)
│
├── lib/                        # The Brain & Storage
│   ├── store.ts                # Live reactive data store (holds appointments, patients, ledger)
│   ├── types.ts                # Clinical definitions (teeth statuses, procedures, payment rails)
│   └── mock-db.ts              # Preloaded clinical demo patients & realistic hospital data
│
├── start.bat                   # 1-Click launcher for Windows
├── refresh.bat                 # 1-Click Git updater & restarter for Windows
├── start.sh                    # 1-Click launcher for Mac/Linux
└── refresh.sh                  # 1-Click Git updater & restarter for Mac/Linux
```

---

## Default Clinical Credentials & Actor Model

There are two authorized actors configured:

### 1. Doctor / Clinical Director
- **Operator**: `Dr. Senait Tadesse`
- **Email**: `doctor@boledental.et`
- **Password**: `Password123!`
- **Station PIN**: `5678`
- **Access**: Full unrestricted access across clinical treatments, odontogram, financials, and Admin Settings (`/admin`).

### 2. Front Desk Staff
- **Operator**: `Helen Tadesse`
- **Email**: `reception@boledental.et`
- **Password**: `Password123!`
- **Station PIN**: `1234`
- **Access**: Operational access (Home, Schedule, Patients, Recalls, Invoices, Payments, Reports). Admin settings are locked.

---

## Ethiopian Regulatory & Financial Compliance
- **Currency**: Ethiopian Birr (`ETB`)
- **Fiscal TIN**: `0049283711` (Ministry of Revenues compliant)
- **Supported Payment Rails**: Telebirr POS, CBE Birr POS, Physical Cash, and Chapa Gateway
- **Odontogram**: FDI World Dental Federation 2-digit notation (11-18, 21-28, 31-38, 41-48)
