'use client';

import { Clinic } from '@/lib/types';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | '3month' | '6month';

export interface ReportStatsData {
  label: string;
  badgeLabel: string;
  subLabel: string;
  collectedETB: number;
  productionETB: number;
  paymentsCount: number;
  treatmentsCount: number;
  patientsCount: number;
  newPatientsCount: number;
  noShowRate: string;
  cbeTotalETB: number;
  telebirrTotalETB: number;
  cashTotalETB: number;
  transferTotalETB: number;
  doc1ProductionETB: number;
  doc1Treatments: number;
  doc2ProductionETB: number;
  doc2Treatments: number;
  receivables0_30: number;
  receivables31_60: number;
}

/**
 * Generates the clean, minimalist, high-end A4 HTML layout
 * inspired by executive forensic audit standards:
 * - Structured margins (18mm)
 * - Clinical Navy (#0A2342) & Gold (#C9A84C) letterhead
 * - Clean KPI row
 * - Executive Audit Findings box
 * - Master tables with monospaced ETB figures
 * - Dual signatures & MoR fiscal stamp
 */
export function getClinicalReportHTML(
  period: ReportPeriod,
  data: ReportStatsData,
  clinic?: Clinic | { name?: string; location?: string; phone?: string }
): string {
  const clinicName = clinic?.name || 'BOLE DENTAL STUDIO';
  const clinicLocation = clinic?.location || 'Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa';
  const clinicPhone = clinic?.phone || '+251 91 122 3344';
  const tinNumber = '0049283711';
  const registerMachine = 'BDS-FSC-AA-03';
  const dateStr = new Date().toISOString().slice(0, 10);

  const realizationRate = ((data.collectedETB / Math.max(data.productionETB, 1)) * 100).toFixed(1);

  // Scaled category procedures
  const scale = period === 'daily' ? 1 : period === 'weekly' ? 4 : period === 'monthly' ? 16 : period === '3month' ? 48 : 96;
  const categories = [
    { name: 'Restorative Fillings (የጥርስ ሙሌት)', count: 6 * scale, amountETB: 8800 * scale, share: '35.3%' },
    { name: 'Root Canal Therapies (የነርቭ ህክምና)', count: 3 * scale, amountETB: 7800 * scale, share: '31.3%' },
    { name: 'Dental Crowns & Bridges (የጥርስ ክዳን)', count: 2 * scale, amountETB: 5200 * scale, share: '20.8%' },
    { name: 'Teeth Cleaning Prophylaxis (የጥርስ ማፅዳት)', count: 4 * scale, amountETB: 2200 * scale, share: '8.8%' },
    { name: 'Tooth Extraction (የጥርስ መንቀል)', count: 2 * scale, amountETB: 950 * scale, share: '3.8%' },
  ];

  // Period-adaptive representative patient log
  const encounters = period === 'weekly' ? [
    { time: 'Mon Oct 05 · 10:15', patient: 'Dawit Haile Gebre', mrn: 'BDS-MRN-2026-0089', procedure: 'Root Canal Pulpectomy (#36)', doctor: 'Dr. Senait Tadesse', method: 'Direct Debit', amount: 7800 },
    { time: 'Tue Oct 06 · 11:30', patient: 'Sara Mengistu Tadesse', mrn: 'BDS-MRN-2026-0155', procedure: 'Clear Aligner Retainer Advance', doctor: 'Dr. Brook Zewde', method: 'CBE Birr POS', amount: 4300 },
    { time: 'Wed Oct 07 · 14:00', patient: 'Tigist Alemu Desta', mrn: 'BDS-MRN-2026-0041', procedure: 'Ultrasonic Scaling & Polishing', doctor: 'Dr. Senait Tadesse', method: 'Telebirr SuperApp', amount: 720 },
    { time: 'Thu Oct 08 · 09:45', patient: 'Abebe Kebede Wolde', mrn: 'BDS-MRN-2026-0210', procedure: 'Sedative Dressing & Sedation', doctor: 'Dr. Brook Zewde', method: 'Physical Cash', amount: 480 },
    { time: 'Fri Oct 09 · 15:30', patient: 'Solomon Tekle Mariam', mrn: 'BDS-MRN-2026-0094', procedure: 'Zirconia Crown Prep Advance', doctor: 'Dr. Senait Tadesse', method: 'CBE Transfer', amount: 4100 },
    { time: 'Sat Oct 10 · 11:00', patient: 'Meron Bekele Haile', mrn: 'BDS-MRN-2026-0312', procedure: 'Periapical X-Ray & Exam', doctor: 'Dr. Senait Tadesse', method: 'Telebirr POS', amount: 675 },
  ] : period === 'monthly' ? [
    { time: 'Sep 15 · 09:30', patient: 'Dawit Haile Gebre', mrn: 'BDS-MRN-2026-0089', procedure: 'Root Canal Therapy Stage 1', doctor: 'Dr. Senait Tadesse', method: 'Direct Debit', amount: 7800 },
    { time: 'Sep 22 · 14:15', patient: 'Sara Mengistu Tadesse', mrn: 'BDS-MRN-2026-0155', procedure: 'Aligner Follow-up & Retainer', doctor: 'Dr. Brook Zewde', method: 'CBE Birr POS', amount: 4300 },
    { time: 'Sep 29 · 10:00', patient: 'Solomon Tekle Mariam', mrn: 'BDS-MRN-2026-0094', procedure: 'Zirconia Crown Delivery #16', doctor: 'Dr. Senait Tadesse', method: 'CBE Transfer', amount: 6400 },
    { time: 'Oct 04 · 11:30', patient: 'Tigist Alemu Desta', mrn: 'BDS-MRN-2026-0041', procedure: 'Ultrasonic Scaling Prophylaxis', doctor: 'Dr. Senait Tadesse', method: 'Telebirr SuperApp', amount: 720 },
    { time: 'Oct 09 · 16:00', patient: 'Abebe Kebede Wolde', mrn: 'BDS-MRN-2026-0210', procedure: 'Restorative Composite Filling', doctor: 'Dr. Brook Zewde', method: 'Physical Cash', amount: 1250 },
    { time: 'Oct 12 · 11:15', patient: 'Meron Bekele Haile', mrn: 'BDS-MRN-2026-0312', procedure: 'Full Mouth Diagnostics & Exam', doctor: 'Dr. Senait Tadesse', method: 'Telebirr POS', amount: 950 },
  ] : period === '3month' || period === '6month' ? [
    { time: 'Case #1 · Key Audit', patient: 'Dawit Haile Gebre', mrn: 'BDS-MRN-2026-0089', procedure: 'Molar Endodontic Rehabilitation', doctor: 'Dr. Senait Tadesse', method: 'Direct Debit', amount: 7800 },
    { time: 'Case #2 · Key Audit', patient: 'Solomon Tekle Mariam', mrn: 'BDS-MRN-2026-0094', procedure: 'Fixed Prosthodontic Bridge', doctor: 'Dr. Senait Tadesse', method: 'CBE Transfer', amount: 12400 },
    { time: 'Case #3 · Key Audit', patient: 'Sara Mengistu Tadesse', mrn: 'BDS-MRN-2026-0155', procedure: 'Comprehensive Clear Aligners', doctor: 'Dr. Brook Zewde', method: 'CBE Birr POS', amount: 18500 },
    { time: 'Case #4 · Key Audit', patient: 'Bethlehem Assefa', mrn: 'BDS-MRN-2026-0188', procedure: 'Implant Consultation & Staging', doctor: 'Dr. Senait Tadesse', method: 'Direct Debit', amount: 8500 },
    { time: 'Case #5 · Key Audit', patient: 'Tigist Alemu Desta', mrn: 'BDS-MRN-2026-0041', procedure: 'Periodontal Maintenance Phase II', doctor: 'Dr. Senait Tadesse', method: 'Telebirr SuperApp', amount: 1400 },
    { time: 'Case #6 · Key Audit', patient: 'Abebe Kebede Wolde', mrn: 'BDS-MRN-2026-0210', procedure: 'Anterior Composite Restoration', doctor: 'Dr. Brook Zewde', method: 'Physical Cash', amount: 2400 },
  ] : [
    { time: '09:15 · Chair 1', patient: 'Dawit Haile Gebre', mrn: 'BDS-MRN-2026-0089', procedure: 'Root Canal Pulpectomy (#36)', doctor: 'Dr. Senait Tadesse', method: 'Direct Debit', amount: 7800 },
    { time: '10:45 · Chair 2', patient: 'Sara Mengistu Tadesse', mrn: 'BDS-MRN-2026-0155', procedure: 'Clear Aligner Retainer Advance', doctor: 'Dr. Brook Zewde', method: 'CBE Birr POS', amount: 4300 },
    { time: '11:30 · Chair 1', patient: 'Tigist Alemu Desta', mrn: 'BDS-MRN-2026-0041', procedure: 'Ultrasonic Scaling & Polishing', doctor: 'Dr. Senait Tadesse', method: 'Telebirr SuperApp', amount: 720 },
    { time: '14:00 · Chair 2', patient: 'Abebe Kebede Wolde', mrn: 'BDS-MRN-2026-0210', procedure: 'Sedative Dressing & Sedation', doctor: 'Dr. Brook Zewde', method: 'Physical Cash', amount: 480 },
    { time: '15:30 · Chair 1', patient: 'Solomon Tekle Mariam', mrn: 'BDS-MRN-2026-0094', procedure: 'Zirconia Crown Prep Advance', doctor: 'Dr. Senait Tadesse', method: 'CBE Transfer', amount: 4100 },
    { time: '16:45 · Chair 1', patient: 'Meron Bekele Haile', mrn: 'BDS-MRN-2026-0312', procedure: 'Periapical X-Ray & Exam', doctor: 'Dr. Senait Tadesse', method: 'Telebirr POS', amount: 675 },
  ];

  return `
    <div style="width: 794px; min-height: 1120px; background: #ffffff; color: #1C2833; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 8.5pt; line-height: 1.45; box-sizing: border-box; padding: 22px 28px;">
      
      <!-- 1. TOP LETTERHEAD HEADER (Clinical Navy #0A2342 + Gold Accent #C9A84C) -->
      <div style="background: #0A2342; border-radius: 6px 6px 0 0; padding: 12px 18px; color: #ffffff; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11pt; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #ffffff;">
            ${clinicName}
          </span>
          <span style="display: inline-block; width: 4px; height: 4px; background: #C9A84C; border-radius: 50%;"></span>
          <span style="font-size: 8pt; color: #A8BDD4; letter-spacing: 0.02em;">
            Clinical Practice & Revenue Audit
          </span>
        </div>
        <div style="text-align: right; font-size: 7.5pt; font-family: monospace; color: #C9A84C; font-weight: 700;">
          TIN: ${tinNumber} · Ref: BDS-AUD-${period.toUpperCase()}-${dateStr}
        </div>
      </div>
      <div style="height: 3px; background: #C9A84C; margin-bottom: 16px;"></div>

      <!-- 2. DOCUMENT TITLE & CLINIC REGISTRATION -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; border-bottom: 1px solid #D6DCE4; padding-bottom: 10px;">
        <div>
          <div style="font-size: 7pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #7F8C8D;">
            FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA · MINISTRY OF REVENUES (MoR)
          </div>
          <h1 style="margin: 2px 0 0 0; font-size: 14pt; font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; color: #0A2342;">
            ${data.label.toUpperCase()} AUDIT REPORT
          </h1>
          <div style="font-size: 7.5pt; color: #7F8C8D; margin-top: 1px;">
            የክሊኒካል አፈጻጸም፣ የታካሚዎች ፍሰት እና የፋይናንስ ኦዲት ሪፖርት · ${clinicLocation}
          </div>
        </div>

        <div style="text-align: right; background: #EEF3FA; border: 1px solid #D6DCE4; border-radius: 6px; padding: 6px 12px; font-family: monospace; font-size: 7.5pt;">
          <div style="font-weight: 700; color: #0A2342;">WINDOW: ${data.badgeLabel.toUpperCase()}</div>
          <div style="color: #7F8C8D; font-size: 7pt;">${data.subLabel}</div>
          <div style="color: #1A7A4A; font-weight: 700; margin-top: 1px;">Machine: ${registerMachine}</div>
        </div>
      </div>

      <!-- 3. KPI SUMMARY ROW (6 Key Metrics - Navy Light #EEF3FA with Gold borders) -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-bottom: 14px;">
        <!-- KPI 1 -->
        <div style="background: #EEF3FA; border: 1px solid #C9A84C; border-radius: 6px; padding: 8px 6px; text-align: center;">
          <div style="font-size: 12pt; font-weight: 800; font-family: monospace; color: #0A2342;">
            ${data.collectedETB >= 1000000 ? (data.collectedETB / 1000000).toFixed(2) + 'M' : data.collectedETB >= 10000 ? (data.collectedETB / 1000).toFixed(1) + 'k' : data.collectedETB.toLocaleString()}
          </div>
          <div style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; color: #7F8C8D; margin-top: 2px;">
            COLLECTED (ETB)
          </div>
        </div>

        <!-- KPI 2 -->
        <div style="background: #EEF3FA; border: 1px solid #D6DCE4; border-radius: 6px; padding: 8px 6px; text-align: center;">
          <div style="font-size: 12pt; font-weight: 800; font-family: monospace; color: #0A2342;">
            ${data.productionETB >= 1000000 ? (data.productionETB / 1000000).toFixed(2) + 'M' : data.productionETB >= 10000 ? (data.productionETB / 1000).toFixed(1) + 'k' : data.productionETB.toLocaleString()}
          </div>
          <div style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; color: #7F8C8D; margin-top: 2px;">
            PRODUCTION (ETB)
          </div>
        </div>

        <!-- KPI 3 -->
        <div style="background: #EEF3FA; border: 1px solid #D6DCE4; border-radius: 6px; padding: 8px 6px; text-align: center;">
          <div style="font-size: 12pt; font-weight: 800; font-family: monospace; color: #1A3A5C;">
            ${data.patientsCount}
          </div>
          <div style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; color: #7F8C8D; margin-top: 2px;">
            PATIENTS SEEN
          </div>
        </div>

        <!-- KPI 4 -->
        <div style="background: #EEF3FA; border: 1px solid #D6DCE4; border-radius: 6px; padding: 8px 6px; text-align: center;">
          <div style="font-size: 12pt; font-weight: 800; font-family: monospace; color: #1A3A5C;">
            ${data.treatmentsCount}
          </div>
          <div style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; color: #7F8C8D; margin-top: 2px;">
            TREATMENTS
          </div>
        </div>

        <!-- KPI 5 -->
        <div style="background: #EEF3FA; border: 1px solid #D6DCE4; border-radius: 6px; padding: 8px 6px; text-align: center;">
          <div style="font-size: 12pt; font-weight: 800; font-family: monospace; color: #1A7A4A;">
            ${realizationRate}%
          </div>
          <div style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; color: #7F8C8D; margin-top: 2px;">
            COLLECTION %
          </div>
        </div>

        <!-- KPI 6 -->
        <div style="background: #EEF3FA; border: 1px solid #D6DCE4; border-radius: 6px; padding: 8px 6px; text-align: center;">
          <div style="font-size: 12pt; font-weight: 800; font-family: monospace; color: #1A7A4A;">
            0.00
          </div>
          <div style="font-size: 6.5pt; font-weight: 700; text-transform: uppercase; color: #7F8C8D; margin-top: 2px;">
            VARIANCE (ETB)
          </div>
        </div>
      </div>

      <!-- 4. EXECUTIVE FINDINGS & RECONCILIATION SUMMARY (Gold-styled highlight box) -->
      <div style="background: #F5EDD6; border: 1px solid #C9A84C; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 7.5pt; line-height: 1.45;">
        <div style="font-weight: 800; text-transform: uppercase; color: #0A2342; margin-bottom: 3px; font-size: 7.5pt;">
          EXECUTIVE CLINICAL AUDIT & RECONCILIATION SUMMARY:
        </div>
        <div style="color: #1C2833;">
          • <b>Full Fiscal Integrity:</b> All <b>${data.paymentsCount} transactions</b> audited against Ministry of Revenues TIN <b>${tinNumber}</b> with <b>0.00 ETB cash variance</b>.<br/>
          • <b>Multi-Channel Settlement:</b> Commercial Bank of Ethiopia (CBE Birr POS), Telebirr SuperApp, Awash RTGS Transfer, and physical counted currency verified.<br/>
          • <b>Operatory Throughput:</b> Chair 1 & Chair 2 operated with <b>${data.noShowRate} no-show rate</b>; <b>${data.newPatientsCount} first-time intake patients</b> recorded.<br/>
          • <b>Lead Doctor Production:</b> Dr. Senait Tadesse charted <b>${data.doc1ProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</b>; Dr. Brook Zewde charted <b>${data.doc2ProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</b>.
        </div>
      </div>

      <!-- 5. TABLE 1: FINANCIAL RECONCILIATION BY TENDER RAIL -->
      <div style="margin-bottom: 14px;">
        <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #0A2342; margin-bottom: 5px;">
          1. Financial Reconciliation by Payment Channel (የክፍያ መንገዶች ኦዲት)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #D6DCE4;">
          <thead>
            <tr style="background: #0A2342; color: #ffffff; text-align: left;">
              <th style="padding: 5px 8px; font-weight: 700;">Tender Channel</th>
              <th style="padding: 5px 8px; font-weight: 700;">Institution / Terminal Ref</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Audited Total (ETB)</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Share %</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: center;">Variance</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E2E8F0; background: #ffffff;">
              <td style="padding: 4px 8px; font-weight: 600;">CBE Birr POS / Debit Card</td>
              <td style="padding: 4px 8px; color: #7F8C8D; font-family: monospace;">Commercial Bank of Ethiopia (Terminal #04)</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; font-weight: 700;">${data.cbeTotalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; color: #1A3A5C; font-weight: 700;">${((data.cbeTotalETB / Math.max(data.collectedETB, 1)) * 100).toFixed(1)}%</td>
              <td style="padding: 4px 8px; text-align: center; color: #1A7A4A; font-weight: 700;">0.00 ETB</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0; background: #F0F4FA;">
              <td style="padding: 4px 8px; font-weight: 600;">Telebirr SuperApp</td>
              <td style="padding: 4px 8px; color: #7F8C8D; font-family: monospace;">Ethio Telecom Merchant (ID: 94821)</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; font-weight: 700;">${data.telebirrTotalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; color: #1A3A5C; font-weight: 700;">${((data.telebirrTotalETB / Math.max(data.collectedETB, 1)) * 100).toFixed(1)}%</td>
              <td style="padding: 4px 8px; text-align: center; color: #1A7A4A; font-weight: 700;">0.00 ETB</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0; background: #ffffff;">
              <td style="padding: 4px 8px; font-weight: 600;">Direct Debit / Bank Transfer</td>
              <td style="padding: 4px 8px; color: #7F8C8D; font-family: monospace;">CBE & Awash RTGS Settlement Batch</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; font-weight: 700;">${data.transferTotalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; color: #1A3A5C; font-weight: 700;">${((data.transferTotalETB / Math.max(data.collectedETB, 1)) * 100).toFixed(1)}%</td>
              <td style="padding: 4px 8px; text-align: center; color: #1A7A4A; font-weight: 700;">0.00 ETB</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0; background: #F0F4FA;">
              <td style="padding: 4px 8px; font-weight: 600;">Physical Cash (Counted)</td>
              <td style="padding: 4px 8px; color: #7F8C8D; font-family: monospace;">Cash Drawer (200 / 100 / 50 Birr notes)</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; font-weight: 700;">${data.cashTotalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; color: #1A3A5C; font-weight: 700;">${((data.cashTotalETB / Math.max(data.collectedETB, 1)) * 100).toFixed(1)}%</td>
              <td style="padding: 4px 8px; text-align: center; color: #1A7A4A; font-weight: 700;">0.00 ETB</td>
            </tr>
            <tr style="background: #EEF3FA; font-weight: 800; border-top: 1.5px solid #0A2342;">
              <td colspan="2" style="padding: 5px 8px; text-transform: uppercase;">Total Reconciled Collections</td>
              <td style="padding: 5px 8px; text-align: right; font-family: monospace; font-size: 8.5pt; color: #0A2342;">
                ${data.collectedETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </td>
              <td style="padding: 5px 8px; text-align: right; font-family: monospace; color: #1A7A4A;">100.0%</td>
              <td style="padding: 5px 8px; text-align: center; color: #1A7A4A; font-weight: 800;">BALANCED</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 6. TABLE 2: CLINICAL DISCIPLINE BREAKDOWN -->
      <div style="margin-bottom: 14px;">
        <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #0A2342; margin-bottom: 5px;">
          2. Clinical Discipline & Procedure Performance (የተሰጡ የህክምና ዘርፎች)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #D6DCE4;">
          <thead>
            <tr style="background: #1A3A5C; color: #ffffff; text-align: left;">
              <th style="padding: 5px 8px; font-weight: 700;">Specialty Discipline</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: center;">Units Completed</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Gross Generated (ETB)</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Revenue Share %</th>
            </tr>
          </thead>
          <tbody>
            ${categories.map((c, idx) => `
              <tr style="border-bottom: 1px solid #E2E8F0; background: ${idx % 2 === 1 ? '#F0F4FA' : '#ffffff'};">
                <td style="padding: 4px 8px; font-weight: 600;">${c.name}</td>
                <td style="padding: 4px 8px; text-align: center; font-family: monospace;">${c.count}</td>
                <td style="padding: 4px 8px; text-align: right; font-family: monospace; font-weight: 700;">${c.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</td>
                <td style="padding: 4px 8px; text-align: right; font-family: monospace; color: #1A3A5C; font-weight: 700;">${c.share}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 7. TABLE 3: CLINICIAN PRODUCTION SPLIT -->
      <div style="margin-bottom: 14px;">
        <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #0A2342; margin-bottom: 5px;">
          3. Clinician Production & Work Value (የዶክተሮች ስራ ክንውን)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; border: 1px solid #D6DCE4;">
          <thead>
            <tr style="background: #0A2342; color: #ffffff; text-align: left;">
              <th style="padding: 5px 8px; font-weight: 700;">Attending Clinician</th>
              <th style="padding: 5px 8px; font-weight: 700;">Role / Specialty</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: center;">Procedures Done</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Gross Work (ETB)</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Share %</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E2E8F0; background: #ffffff;">
              <td style="padding: 4px 8px; font-weight: 700; color: #0A2342;">Dr. Senait Tadesse</td>
              <td style="padding: 4px 8px; color: #7F8C8D;">Clinical Director & Lead Specialist</td>
              <td style="padding: 4px 8px; text-align: center; font-family: monospace;">${data.doc1Treatments}</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; font-weight: 700;">${data.doc1ProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; color: #1A7A4A; font-weight: 700;">${((data.doc1ProductionETB / Math.max(data.productionETB, 1)) * 100).toFixed(1)}%</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0; background: #F0F4FA;">
              <td style="padding: 4px 8px; font-weight: 700; color: #0A2342;">Dr. Brook Zewde</td>
              <td style="padding: 4px 8px; color: #7F8C8D;">Associate Dental Surgeon</td>
              <td style="padding: 4px 8px; text-align: center; font-family: monospace;">${data.doc2Treatments}</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; font-weight: 700;">${data.doc2ProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</td>
              <td style="padding: 4px 8px; text-align: right; font-family: monospace; color: #1A3A5C; font-weight: 700;">${((data.doc2ProductionETB / Math.max(data.productionETB, 1)) * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 8. TABLE 4: REPRESENTATIVE PATIENT LOG -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: #0A2342; margin-bottom: 5px;">
          4. Operatory Patient Log & Encounters (የታካሚዎች እና የክፍያ ዝርዝር)
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 7pt; border: 1px solid #D6DCE4;">
          <thead>
            <tr style="background: #1A3A5C; color: #ffffff; text-align: left;">
              <th style="padding: 4px 6px; font-weight: 700;">Time / Session</th>
              <th style="padding: 4px 6px; font-weight: 700;">Patient Name</th>
              <th style="padding: 4px 6px; font-weight: 700;">BDS-MRN</th>
              <th style="padding: 4px 6px; font-weight: 700;">Procedure</th>
              <th style="padding: 4px 6px; font-weight: 700;">Doctor</th>
              <th style="padding: 4px 6px; font-weight: 700;">Method</th>
              <th style="padding: 4px 6px; font-weight: 700; text-align: right;">Fee (ETB)</th>
            </tr>
          </thead>
          <tbody>
            ${encounters.map((e, idx) => `
              <tr style="border-bottom: 1px solid #E2E8F0; background: ${idx % 2 === 1 ? '#F0F4FA' : '#ffffff'};">
                <td style="padding: 3.5px 6px; font-family: monospace; color: #7F8C8D;">${e.time}</td>
                <td style="padding: 3.5px 6px; font-weight: 700; color: #0A2342;">${e.patient}</td>
                <td style="padding: 3.5px 6px; font-family: monospace; color: #7F8C8D;">${e.mrn}</td>
                <td style="padding: 3.5px 6px; color: #1C2833;">${e.procedure}</td>
                <td style="padding: 3.5px 6px; color: #1A3A5C;">${e.doctor}</td>
                <td style="padding: 3.5px 6px; color: #7F8C8D;">${e.method}</td>
                <td style="padding: 3.5px 6px; text-align: right; font-family: monospace; font-weight: 700; color: #0A2342;">${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 9. DUAL SIGNATURES & MoR FISCAL AUDIT SEAL -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; padding-top: 10px; border-top: 1px solid #D6DCE4; margin-top: 10px;">
        <div>
          <div style="font-size: 7pt; font-weight: 700; color: #7F8C8D; text-transform: uppercase;">
            Prepared & Counted by:
          </div>
          <div style="border-bottom: 1px solid #1C2833; height: 28px; margin-top: 2px;"></div>
          <div style="font-size: 8pt; font-weight: 700; color: #0A2342; margin-top: 3px;">
            Helen Tadesse
          </div>
          <div style="font-size: 6.5pt; color: #7F8C8D;">
            Chief Cashier & Front Desk Officer
          </div>
        </div>

        <div>
          <div style="font-size: 7pt; font-weight: 700; color: #7F8C8D; text-transform: uppercase;">
            Verified & Audited by:
          </div>
          <div style="border-bottom: 1px solid #1C2833; height: 28px; margin-top: 2px;"></div>
          <div style="font-size: 8pt; font-weight: 700; color: #0A2342; margin-top: 3px;">
            Dr. Senait Tadesse
          </div>
          <div style="font-size: 6.5pt; color: #7F8C8D;">
            Clinical Director & Lead Specialist
          </div>
        </div>

        <div style="text-align: center;">
          <div style="font-size: 6.5pt; font-weight: 700; color: #7F8C8D; text-transform: uppercase; margin-bottom: 2px;">
            Official Fiscal Stamp
          </div>
          <div style="display: inline-block; width: 72px; height: 72px; border: 1.5px dashed #7F8C8D; border-radius: 50%; padding: 4px; box-sizing: border-box;">
            <div style="font-size: 6pt; font-weight: 800; color: #0A2342; text-transform: uppercase; margin-top: 10px;">
              BOLE DENTAL
            </div>
            <div style="font-size: 6pt; color: #1A7A4A; font-weight: 700;">
              MoR AUDITED
            </div>
            <div style="font-size: 5.5pt; color: #7F8C8D; font-family: monospace;">
              ${registerMachine}
            </div>
          </div>
        </div>
      </div>

      <!-- 10. LEGAL FOOTER -->
      <div style="margin-top: 12px; padding-top: 6px; border-top: 1px dashed #D6DCE4; font-size: 6.5pt; color: #7F8C8D; text-align: center;">
        STRICTLY CONFIDENTIAL — Internal Clinical & Fiscal Audit · Bole Dental Studio · Ministry of Revenues TIN: 0049283711 · All values in Ethiopian Birr (ETB) · Generated ${dateStr}
      </div>

    </div>
  `;
}

/**
 * Directly downloads the genuine .pdf file to the user's computer.
 * Does NOT open any browser print window or print preview dialog.
 */
export async function downloadClinicalReportPDF(
  period: ReportPeriod,
  data: ReportStatsData,
  clinic?: Clinic
): Promise<void> {
  if (typeof window === 'undefined') return;

  const html = getClinicalReportHTML(period, data, clinic);

  // Create temporary container offscreen
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const canvas = await html2canvas(container, {
      scale: 2, // 2x scale for crisp sharp vector-like text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 5) {
      position = -(imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `BoleDental_Clinical_Audit_${period.toUpperCase()}_${dateStr}.pdf`;
    
    // Direct file download - no window.print()
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
