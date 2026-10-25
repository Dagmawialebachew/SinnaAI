# Sinna Dental AI — Clinic Showcase & Pitch Playbook

This guide contains everything your friend needs to showcase **Sinna Dental AI** offline on their PC to dental clinic owners, directors, and doctors in Ethiopia.

---

## 1. Setup on Friend's PC (Choose Either Option A or B)

### Option A: Send Just ONE Single Setup File (`Install-Sinna-Dental-AI.bat`)
* If you only want to send **one single file** (via Telegram, WhatsApp, or USB):
  1. Send **`Install-Sinna-Dental-AI.bat`**.
  2. On the new PC (which has Node.js installed), double-click **`Install-Sinna-Dental-AI.bat`**.
  3. The installer will automatically:
     - Detect GitHub Desktop / Git (or download the full repository directly via HTTPS zip if Git isn't found).
     - Install all packages (`npm install`).
     - Generate the production bundle (`npm run build`).
     - Create a **"Sinna Dental AI" shortcut icon directly on the Windows Desktop**.
     - Automatically open the dedicated clinic presentation window!

---

### Option B: 100% Offline Instant USB Copy (No Internet Required)
* **Best for Ethiopian clinics with slow or restricted Wi-Fi**:
  1. Copy your entire `Sinna` folder to a USB drive (make sure `.next` and `node_modules` are included).
  2. Paste it onto your friend's laptop.
  3. Double-click **`Sinna-Dental-AI.bat`**.
  4. It boots in **literally 3 seconds without needing any internet connection**.

---

## 2. The 5-Minute Clinic Showcase Script (Doctor "Wow" Flow)

Follow this exact 5-step sequence when presenting to clinic directors and doctors:

### Minute 1: Reception Desk & Waiting Lounge
* **Where to start**: Open **Schedule** (`/schedule`) or **Clinic Home** (`/`).
* **What to say**:
  > *"Sinna connects the front desk directly to the dental chair in real-time. No paper tickets, no shouted hallway confirmations."*
* **What to show**:
  1. Show **Chair 1** (Dr. Senait) and **Chair 2** (Dr. Dawit) live timeline.
  2. Point out an incoming appointment (e.g. *Tigist Alemu*).
  3. Click **"Check In"** — watch the badge update to *Waiting in Lounge*.
  4. Click **"Seat in Chair 1"** — watch Chair 1 light up as *Active / In-Progress*.

---

### Minute 2: Doctor Station & 32-Tooth FDI Odontogram
* **Action**: In the bottom-left corner, switch the active station from **Reception** to **Doctor** (`Dr. Senait Tadesse`).
* **Where to go**: Click **Patients** (`/patients`) and open *Tigist Alemu*.
* **What to say**:
  > *"When the doctor sits at the chair, their screen is strictly clinical. No cashier distractions, no billing noise — pure clinical precision."*
* **What to show**:
  1. Click the **Odontogram** tab.
  2. Show the anatomic 32-Tooth FDI dental chart (Teeth 11–18, 21–28, 31–38, 41–48) with real root geometry and crown anatomy.
  3. Click on tooth **#16** (Caries) or **#36** (Root Canal Therapy).
  4. Show the **Staged Treatment Plan**: Restorative, Surgery, Endodontics, and Orthodontics with live Ethiopian Birr (ETB) pricing calculations.

---

### Minute 3: Ethiopian Financials & MoR Compliance
* **Action**: Switch station to **Owner** (`Ato Dawit Tadesse`) or **Reception** (`Helen Tadesse`).
* **Where to go**: Click **Invoices** (`/invoices`) and **Payments** (`/payments`).
* **What to say**:
  > *"Sinna is built natively for Ethiopian clinical law. It automates Ministry of Revenues fiscal compliance and modern payment rails."*
* **What to show**:
  1. Point out the clinic's MoR fiscal TIN (`0049283711`).
  2. Open an invoice to show the printable Ethiopian fiscal paper chart with official stamps.
  3. Show the cashier ledger with native **Telebirr SuperApp**, **CBE Birr POS**, and **Physical Cash** breakdowns.

---

### Minute 4: Sinna AI Clinical Copilot
* **Action**: Click the **Sinna AI** beacon at the bottom right.
* **What to say**:
  > *"Doctors and receptionists can query patient history, pricing rules, and scheduling in both English and Amharic."*
* **What to show**:
  1. Ask: *"What is the remaining balance and treatment plan for Tigist Alemu?"*
  2. Ask: *"የስር ህክምና (Root canal) ዋጋ ስንት ነው?"*
  3. The local clinical RAG engine answers with exact clinic pricing and medical records without needing external internet access.

---

### Minute 5: Resetting for the Next Clinic
* When you finish presenting to Clinic A, click the **Reset** button in the top navigation bar (or run **`Reset-Demo-Data.bat`**).
* This immediately clears any test invoices or seated patients you created during the pitch and restores the clinic back to pristine opening-day state for Clinic B!

---

## 3. Keyboard Shortcuts Reference

| Key / Action | Effect |
| :--- | :--- |
| **`F11`** | Toggle True Full-Screen (Hides Windows Taskbar for immersion) |
| **`Alt + Left Arrow`** | Navigate back |
| **Top Bar `Reset`** | Restores demo state to day 1 |
| **Launcher `[O]`** | Re-opens application window if accidentally closed |
| **Launcher `[Q]`** | Cleanly terminates the local server process |
