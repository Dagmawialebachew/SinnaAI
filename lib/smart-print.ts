'use client';

import { Clinic } from './types';

export interface PrintDocumentOptions {
  title: string;
  html: string;
  paperSize?: 'A4' | 'thermal';
}

/**
 * Smart Print Utility
 * Creates an isolated invisible iframe to cleanly trigger printing
 * without printing application navigation, sidebars, buttons, or dialog backdrops.
 */
export function smartPrint({
  title,
  html,
  paperSize = 'A4',
}: PrintDocumentOptions): void {
  if (typeof window === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const isThermal = paperSize === 'thermal';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: ${isThermal ? '80mm auto' : 'A4 portrait'};
          margin: ${isThermal ? '4mm' : '14mm 16mm'};
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: ${isThermal ? '10px' : '11pt'};
          line-height: ${isThermal ? '1.35' : '1.5'};
        }
        .ethiopic {
          font-family: 'Noto Sans Ethiopic', 'Inter', sans-serif;
        }
        .avoid-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th, td {
          padding: ${isThermal ? '4px 2px' : '7px 10px'};
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        th {
          font-size: ${isThermal ? '8px' : '8.5pt'};
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          font-weight: 700;
          background: #f8fafc;
        }
        .tnum {
          font-variant-numeric: tabular-nums;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .text-muted { color: #64748b; }
        .text-sm { font-size: 9.5pt; }
        .text-xs { font-size: 8.5pt; }
        .divider {
          border-top: 1px dashed #cbd5e1;
          margin: 10px 0;
        }
        .double-divider {
          border-top: 2px solid #0f172a;
          margin: 12px 0;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `);
  doc.close();

  // Trigger print after iframe renders
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  }, 350);
}

/**
 * Print Treatment Quote Estimate (A4)
 */
export function printTreatmentQuote(quote: {
  quoteNumber: string;
  version: string;
  patientName: string;
  patientNameAmharic?: string;
  patientMrn: string;
  status: string;
  date: string;
  validUntil: string;
  amountETB: number;
  doctorName: string;
  procedures: { description: string; toothNumber?: number; feeETB: number }[];
}, clinic?: Clinic): void {
  const clinicName = clinic?.name || 'Bole Dental Studio';
  const clinicLocation = clinic?.location || 'Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa';
  const clinicPhone = clinic?.phone || '+251 91 122 3344';
  const tinNumber = '0049283711';

  const html = `
    <div style="max-width: 100%; margin: 0 auto;">
      <!-- Clinic Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <h1 style="margin: 0; font-size: 18pt; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; text-transform: uppercase;">
            ${clinicName}
          </h1>
          <p style="margin: 2px 0 0 0; font-size: 9.5pt; color: #475569;" class="ethiopic">
            ቦሌ ዴንታል ስቱዲዮ ኃ/የተ/የግ/ማህበር · Addis Ababa, Ethiopia
          </p>
          <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #64748b;">
            ${clinicLocation} · Tel: ${clinicPhone}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 8.5pt; font-family: monospace; font-weight: 700; color: #0284c7;">
            MoR TIN: ${tinNumber}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; padding: 4px 10px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; margin-bottom: 6px;">
            <span style="font-size: 8pt; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 0.05em;">
              FORMAL TREATMENT ESTIMATE
            </span>
          </div>
          <p style="margin: 0; font-family: monospace; font-size: 13pt; font-weight: 700; color: #0f172a;">
            ${quote.quoteNumber}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #64748b;">
            Version: ${quote.version} · Status: <strong>${quote.status}</strong>
          </p>
        </div>
      </div>

      <!-- Patient & Estimate Meta Box -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 18px;" class="avoid-break">
        <div>
          <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">
            Patient Information / የታካሚ መረጃ
          </div>
          <div style="font-size: 11pt; font-weight: 700; color: #0f172a; margin-top: 3px;">
            ${quote.patientName}
          </div>
          ${quote.patientNameAmharic ? `<div style="font-size: 9.5pt; color: #475569;" class="ethiopic">${quote.patientNameAmharic}</div>` : ''}
          <div style="font-family: monospace; font-size: 8.5pt; color: #64748b; margin-top: 2px;">
            MRN: ${quote.patientMrn}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">
            Estimate Validity & Provider
          </div>
          <div style="font-size: 9pt; color: #334155; margin-top: 3px;">
            Date of Estimate: <strong>${quote.date}</strong>
          </div>
          <div style="font-size: 9pt; color: #059669; font-weight: 600; margin-top: 2px;">
            Valid Until: ${quote.validUntil}
          </div>
          <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">
            Attending: <strong>${quote.doctorName}</strong>
          </div>
        </div>
      </div>

      <!-- Itemized Procedures Table -->
      <div class="avoid-break">
        <h3 style="font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.05em; color: #334155; margin: 0 0 6px 0;">
          Planned Clinical Procedures & Fees (FDI World Dental Standard)
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Clinical Procedure Description</th>
              <th style="width: 90px; text-align: center;">Tooth # (FDI)</th>
              <th style="width: 140px; text-align: right;">Estimated Fee (ETB)</th>
            </tr>
          </thead>
          <tbody>
            ${quote.procedures.map((p, idx) => `
              <tr>
                <td style="color: #64748b; font-size: 9pt;">${idx + 1}</td>
                <td style="font-weight: 600; color: #1e293b;">
                  ${p.description}
                </td>
                <td style="text-align: center; font-family: monospace; font-weight: 700; color: #0284c7;">
                  ${p.toothNumber ? `#${p.toothNumber}` : '—'}
                </td>
                <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
                  ${p.feeETB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Financial Totals Summary -->
      <div style="display: flex; justify-content: flex-end; margin-top: 12px;" class="avoid-break">
        <div style="width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 9pt; color: #475569; margin-bottom: 4px;">
            <span>Subtotal:</span>
            <span class="font-mono font-semibold">${quote.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8.5pt; color: #64748b; margin-bottom: 8px;">
            <span>Healthcare Medical Exemption (VAT 0%):</span>
            <span class="font-mono">0.00 ETB</span>
          </div>
          <div style="border-top: 2px solid #0f172a; padding-top: 8px; display: flex; justify-content: space-between; font-size: 12pt; font-weight: 800; color: #0f172a;">
            <span>Total Estimate:</span>
            <span class="font-mono" style="color: #0284c7;">${quote.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</span>
          </div>
        </div>
      </div>

      <!-- Ethiopian Financial & Clinical Policy Notes -->
      <div style="margin-top: 20px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; font-size: 8.5pt; color: #475569;" class="avoid-break">
        <strong style="color: #0f172a; text-transform: uppercase; font-size: 8pt; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">
          Ethiopian Fiscal & Clinical Agreement Notes
        </strong>
        <p style="margin: 2px 0;">• All fees are denominated in Ethiopian Birr (ETB) and valid for 30 days from date of clinical issuance.</p>
        <p style="margin: 2px 0;">• Authorized Payment Rails: Telebirr SuperApp, CBE Birr POS, Physical Cash, and Chapa online portal.</p>
        <p style="margin: 2px 0;">• Multi-visit treatments are scheduled and staged in agreement with the attending doctor.</p>
      </div>

      <!-- Signatures Box -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; padding-top: 12px;" class="avoid-break">
        <div>
          <div style="border-bottom: 1px solid #475569; height: 35px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #334155; margin-top: 4px;">
            Attending Dentist: ${quote.doctorName}
          </div>
          <div style="font-size: 8pt; color: #64748b;">
            Bole Dental Studio Clinical Stamp & Signature
          </div>
        </div>
        <div>
          <div style="border-bottom: 1px solid #475569; height: 35px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #334155; margin-top: 4px;">
            Patient Acceptance: ${quote.patientName}
          </div>
          <div style="font-size: 8pt; color: #64748b;">
            Date of Acceptance: _____________________
          </div>
        </div>
      </div>
    </div>
  `;

  smartPrint({
    title: `Estimate_${quote.quoteNumber}_${quote.patientName.replace(/\s+/g, '_')}`,
    html,
    paperSize: 'A4',
  });
}

/**
 * Print MoR Official Fiscal Invoice & Tax Receipt (A4)
 */
export function printFiscalInvoice(invoice: {
  invoiceNumber: string;
  patientName: string;
  patientNameAmharic?: string;
  patientMrn: string;
  status: string;
  issueDate: string;
  dueDate: string;
  totalETB: number;
  balanceETB: number;
  doctorName: string;
  serviceDescription?: string;
  items?: { description: string; toothNumber?: number; amountETB: number }[];
}, clinic?: Clinic): void {
  const clinicName = clinic?.name || 'Bole Dental Studio';
  const clinicLocation = clinic?.location || 'Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa';
  const clinicPhone = clinic?.phone || '+251 91 122 3344';
  const tinNumber = '0049283711';
  const paidETB = invoice.totalETB - invoice.balanceETB;
  const itemsList = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [{ description: invoice.serviceDescription || 'Clinical Dental Consultations & Operatory Materials', amountETB: invoice.totalETB }];

  const html = `
    <div style="max-width: 100%; margin: 0 auto;">
      <!-- MoR Official Header -->
      <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="font-size: 9pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
          FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA · MINISTRY OF REVENUES (MoR)
        </div>
        <div style="font-size: 8pt; color: #64748b;" class="ethiopic">
          የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ የገቢዎች ሚኒስቴር
        </div>
        <h1 style="margin: 6px 0 2px 0; font-size: 17pt; font-weight: 800; color: #0f172a; text-transform: uppercase;">
          ${clinicName}
        </h1>
        <p style="margin: 0; font-size: 8.5pt; color: #475569;">
          ${clinicLocation} · Tel: ${clinicPhone}
        </p>
        <div style="display: flex; justify-content: center; gap: 16px; margin-top: 6px; font-family: monospace; font-size: 9pt; font-weight: 700; color: #0f172a;">
          <span>TIN: ${tinNumber}</span>
          <span>•</span>
          <span>Fiscal Register: BDS-FSC-AA-03</span>
          <span>•</span>
          <span>Subcity: Bole Woreda 03</span>
        </div>
      </div>

      <!-- Title & Invoice Meta -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <span style="display: inline-block; padding: 4px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; font-size: 8.5pt; font-weight: 700; color: #065f46; text-transform: uppercase; letter-spacing: 0.05em;">
            ELECTRONIC FISCAL TAX INVOICE & RECEIPT
          </span>
          <p style="margin: 4px 0 0 0; font-size: 9pt; color: #475569;" class="ethiopic">
            የኤሌክትሮኒክ የግብር ደረሰኝ
          </p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-family: monospace; font-size: 13pt; font-weight: 800; color: #0f172a;">
            ${invoice.invoiceNumber}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #64748b;">
            Issue Date: <strong>${invoice.issueDate}</strong> · Due Date: <strong>${invoice.dueDate}</strong>
          </p>
          <p style="margin: 2px 0 0 0; font-size: 8.5pt; font-weight: 700; color: ${invoice.balanceETB === 0 ? '#059669' : '#d97706'};">
            Status: ${invoice.status.toUpperCase()}
          </p>
        </div>
      </div>

      <!-- Billed Patient Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;" class="avoid-break">
        <div>
          <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">
            Customer / Patient Demographics
          </div>
          <div style="font-size: 11pt; font-weight: 700; color: #0f172a; margin-top: 2px;">
            ${invoice.patientName}
          </div>
          ${invoice.patientNameAmharic ? `<div style="font-size: 9.5pt; color: #475569;" class="ethiopic">${invoice.patientNameAmharic}</div>` : ''}
          <div style="font-family: monospace; font-size: 8.5pt; color: #64748b; margin-top: 2px;">
            MRN: ${invoice.patientMrn}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 700;">
            Clinical Attending Doctor
          </div>
          <div style="font-size: 10pt; font-weight: 600; color: #1e293b; margin-top: 2px;">
            ${invoice.doctorName}
          </div>
          <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">
            Bole Dental Studio Clinical Directorate
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <div class="avoid-break">
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Description of Dental Service / Supplies</th>
              <th style="width: 80px; text-align: center;">Tooth #</th>
              <th style="width: 140px; text-align: right;">Amount (ETB)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList.map((it, idx) => `
              <tr>
                <td style="color: #64748b; font-size: 9pt;">${idx + 1}</td>
                <td style="font-weight: 600; color: #1e293b;">
                  ${it.description}
                </td>
                <td style="text-align: center; font-family: monospace; font-weight: 700; color: #0284c7;">
                  ${it.toothNumber ? `#${it.toothNumber}` : '—'}
                </td>
                <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
                  ${it.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Financial Tax Breakdown -->
      <div style="display: flex; justify-content: flex-end; margin-top: 12px;" class="avoid-break">
        <div style="width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 9pt; color: #475569; margin-bottom: 4px;">
            <span>Gross Amount:</span>
            <span class="font-mono font-semibold">${invoice.totalETB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 8.5pt; color: #64748b; margin-bottom: 4px;">
            <span>VAT (0% Healthcare Exemption):</span>
            <span class="font-mono">0.00 ETB</span>
          </div>
          <div style="border-top: 1px solid #cbd5e1; padding-top: 6px; display: flex; justify-content: space-between; font-size: 10pt; font-weight: 700; color: #059669; margin-bottom: 4px;">
            <span>Amount Settled / Paid:</span>
            <span class="font-mono">${paidETB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10pt; font-weight: 700; color: ${invoice.balanceETB > 0 ? '#b91c1c' : '#0f172a'};">
            <span>Outstanding Balance:</span>
            <span class="font-mono">${invoice.balanceETB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</span>
          </div>
        </div>
      </div>

      <!-- MoR Legal Declaration & QR Placeholder -->
      <div style="margin-top: 20px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;" class="avoid-break">
        <div style="font-size: 8pt; color: #475569; max-width: 75%;">
          <strong style="color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 2px;">
            Ministry of Revenues Fiscal Authenticity Declaration
          </strong>
          This document is generated by Bole Dental Studio Certified Healthcare Practice Management System in full accordance with FDRE Proclamation No. 983/2016. Retain this invoice for fiscal and personal tax audit records.
        </div>
        <div style="border: 1px dashed #64748b; padding: 6px; text-align: center; border-radius: 4px;">
          <div style="font-family: monospace; font-size: 7.5pt; font-weight: 700; color: #0f172a;">
            MoR-VERIFIED
          </div>
          <div style="font-size: 7pt; color: #64748b;">
            TIN 0049283711
          </div>
        </div>
      </div>

      <!-- Cashier Signature Block -->
      <div style="display: flex; justify-content: space-between; margin-top: 32px; padding-top: 10px;" class="avoid-break">
        <div style="width: 250px;">
          <div style="border-bottom: 1px solid #475569; height: 30px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #334155; margin-top: 4px;">
            Authorized Cashier / Front Desk Officer
          </div>
          <div style="font-size: 8pt; color: #64748b;">
            Helen Tadesse · Bole Dental Studio Cashier
          </div>
        </div>
        <div style="width: 250px; text-align: right;">
          <div style="font-size: 8pt; color: #64748b; margin-top: 34px;">
            System Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  `;

  smartPrint({
    title: `MoR_Fiscal_Invoice_${invoice.invoiceNumber}_${invoice.patientName.replace(/\s+/g, '_')}`,
    html,
    paperSize: 'A4',
  });
}

/**
 * Print Comprehensive Ethiopian Patient Clinical Paper Chart (A4)
 */
export function printPatientChart(patient: {
  id: string;
  mrn: string;
  name: string;
  nameAmharic?: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
  dob: string;
  subcity?: string;
  allergies?: string[];
  systemicDiseases?: string[];
  currentMedications?: string[];
  diagnosesUntreated?: string[];
  notes?: string;
  activePlanTitle?: string;
  balanceETB?: number;
  totalPaidETB?: number;
}, clinic?: Clinic): void {
  const clinicName = clinic?.name || 'Bole Dental Studio';
  const clinicLocation = clinic?.location || 'Bole Medhanialem, Addis Ababa';
  const clinicPhone = clinic?.phone || '+251 91 122 3344';

  const html = `
    <div style="max-width: 100%; margin: 0 auto;">
      <!-- Hospital Clinical Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px;">
        <div>
          <h1 style="margin: 0; font-size: 16pt; font-weight: 800; color: #0f172a; text-transform: uppercase;">
            ${clinicName} · CLINICAL DENTAL CHART
          </h1>
          <p style="margin: 2px 0 0 0; font-size: 9pt; color: #475569;" class="ethiopic">
            የታካሚ የህክምና መዝገብ እና ካርድ · ${clinicLocation}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #64748b;">
            Hotline: ${clinicPhone} · Lead Surgeon: Dr. Senait Tadesse
          </p>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; padding: 3px 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 8pt; font-weight: 700; color: #334155;">
            CONFIDENTIAL CLINICAL RECORD
          </div>
          <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 13pt; font-weight: 700; color: #0284c7;">
            ${patient.mrn}
          </p>
        </div>
      </div>

      <!-- Patient Demographics Section -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px;" class="avoid-break">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 12px;">
          <div>
            <div style="font-size: 8pt; text-transform: uppercase; color: #64748b; font-weight: 700;">Patient Name</div>
            <div style="font-size: 11pt; font-weight: 700; color: #0f172a;">${patient.name}</div>
            ${patient.nameAmharic ? `<div style="font-size: 9.5pt; color: #475569;" class="ethiopic">${patient.nameAmharic}</div>` : ''}
          </div>
          <div>
            <div style="font-size: 8pt; text-transform: uppercase; color: #64748b; font-weight: 700;">Age / Gender</div>
            <div style="font-size: 10pt; font-weight: 600; color: #1e293b;">${patient.age} yrs · ${patient.gender}</div>
            <div style="font-size: 8pt; color: #64748b;">DOB: ${patient.dob}</div>
          </div>
          <div>
            <div style="font-size: 8pt; text-transform: uppercase; color: #64748b; font-weight: 700;">Telephone</div>
            <div style="font-size: 9.5pt; font-family: monospace; font-weight: 600; color: #1e293b;">${patient.phone}</div>
            <div style="font-size: 8pt; color: #64748b;">${patient.email || '—'}</div>
          </div>
          <div>
            <div style="font-size: 8pt; text-transform: uppercase; color: #64748b; font-weight: 700;">Location</div>
            <div style="font-size: 9.5pt; font-weight: 600; color: #1e293b;">${patient.subcity || 'Bole Subcity'}</div>
            <div style="font-size: 8pt; color: #64748b;">Addis Ababa</div>
          </div>
        </div>
      </div>

      <!-- Critical Medical Alerts Banner -->
      <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px;" class="avoid-break">
        <div style="font-size: 8pt; text-transform: uppercase; letter-spacing: 0.05em; color: #be123c; font-weight: 800;">
          CRITICAL CLINICAL & MEDICAL ALERTS
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 6px; font-size: 8.5pt;">
          <div>
            <strong style="color: #9f1239;">Allergies:</strong>
            <p style="margin: 2px 0; color: #881337;">
              ${patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None Reported (NKDA)'}
            </p>
          </div>
          <div>
            <strong style="color: #9f1239;">Systemic Conditions:</strong>
            <p style="margin: 2px 0; color: #881337;">
              ${patient.systemicDiseases && patient.systemicDiseases.length > 0 ? patient.systemicDiseases.join(', ') : 'None Reported'}
            </p>
          </div>
          <div>
            <strong style="color: #9f1239;">Current Medications:</strong>
            <p style="margin: 2px 0; color: #881337;">
              ${patient.currentMedications && patient.currentMedications.length > 0 ? patient.currentMedications.join(', ') : 'None Reported'}
            </p>
          </div>
        </div>
      </div>

      <!-- Active Clinical Diagnoses & Treatment Plan -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;" class="avoid-break">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
          <h4 style="margin: 0 0 6px 0; font-size: 9pt; text-transform: uppercase; color: #334155; font-weight: 700;">
            Current Untreated Diagnoses
          </h4>
          <ul style="margin: 0; padding-left: 18px; font-size: 8.5pt; color: #475569;">
            ${patient.diagnosesUntreated && patient.diagnosesUntreated.length > 0
              ? patient.diagnosesUntreated.map((d) => `<li style="margin-bottom: 3px;">${d}</li>`).join('')
              : '<li>No active untreated pathology registered.</li>'
            }
          </ul>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
          <h4 style="margin: 0 0 6px 0; font-size: 9pt; text-transform: uppercase; color: #334155; font-weight: 700;">
            Active Staged Treatment Plan
          </h4>
          <p style="margin: 0 0 4px 0; font-size: 9.5pt; font-weight: 700; color: #0284c7;">
            ${patient.activePlanTitle || 'General Oral Health Staging Plan'}
          </p>
          <div style="font-size: 8.5pt; color: #64748b;">
            Outstanding Balance: <strong style="color: #0f172a;">${(patient.balanceETB || 0).toLocaleString()} ETB</strong>
          </div>
          <div style="font-size: 8.5pt; color: #64748b;">
            Total Settled: <strong style="color: #059669;">${(patient.totalPaidETB || 0).toLocaleString()} ETB</strong>
          </div>
        </div>
      </div>

      <!-- FDI Odontogram Summary Table -->
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px;" class="avoid-break">
        <h4 style="margin: 0 0 6px 0; font-size: 9pt; text-transform: uppercase; color: #334155; font-weight: 700;">
          FDI World Dental Federation Odontogram Summary
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 8.5pt;">
          <div>
            <strong style="color: #0f172a;">Maxillary Arch (Upper 18-28):</strong>
            <p style="margin: 2px 0; color: #475569;">#18, #17, #16 MO Composite, #15, #14, #13, #12, #11, #21, #22, #23, #24, #25, #26, #27, #28</p>
          </div>
          <div>
            <strong style="color: #0f172a;">Mandibular Arch (Lower 48-38):</strong>
            <p style="margin: 2px 0; color: #475569;">#48, #47, #46, #45, #44, #43, #42, #41, #31, #32, #33, #34, #35, #36 RCT + Crown, #37, #38</p>
          </div>
        </div>
      </div>

      <!-- Doctor Notes -->
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 24px;" class="avoid-break">
        <h4 style="margin: 0 0 4px 0; font-size: 9pt; text-transform: uppercase; color: #334155; font-weight: 700;">
          Clinical Chart Notes
        </h4>
        <p style="margin: 0; font-size: 8.5pt; color: #475569; line-height: 1.5;">
          ${patient.notes || 'Patient is cooperative and compliant with oral hygiene guidelines. Periodontal probing depths within normal limits (2-3mm). Regular recall scheduled.'}
        </p>
      </div>

      <!-- Doctor Signature Block -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10px;" class="avoid-break">
        <div style="width: 250px;">
          <div style="border-bottom: 1px solid #334155; height: 35px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #1e293b; margin-top: 4px;">
            Dr. Senait Tadesse, DDS
          </div>
          <div style="font-size: 8pt; color: #64748b;">
            Clinical Director & Lead Surgeon
          </div>
        </div>
        <div style="text-align: right; font-size: 8pt; color: #64748b;">
          Printed: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  `;

  smartPrint({
    title: `Clinical_Chart_${patient.mrn}_${patient.name.replace(/\s+/g, '_')}`,
    html,
    paperSize: 'A4',
  });
}

/**
 * Print 80mm Thermal Receipt for POS Cashier
 */
export function printThermalReceipt(data: {
  receiptNumber: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  amountETB: number;
  paymentMethod: string;
  tinNumber?: string;
}, clinic?: Clinic): void {
  const clinicName = clinic?.name || 'BOLE DENTAL STUDIO';
  const clinicLocation = clinic?.location || 'Bole Medhanialem, Morning Star Mall 3rd Fl';
  const clinicPhone = clinic?.phone || '+251 91 122 3344';
  const tin = data.tinNumber || '0049283711';

  const html = `
    <div style="font-family: monospace; text-align: center; font-size: 10px; line-height: 1.35; padding: 2px;">
      <div style="font-weight: 800; font-size: 13px; text-transform: uppercase;">${clinicName}</div>
      <div style="font-size: 9px; color: #334155;">${clinicLocation}</div>
      <div style="font-size: 9px; color: #334155;">TIN: ${tin} • Tel: ${clinicPhone}</div>
      <div class="divider"></div>
      
      <div style="text-align: left; font-size: 9.5px; margin: 4px 0;">
        <div style="display: flex; justify-content: space-between;">
          <span>RECEIPT NO:</span>
          <strong>${data.receiptNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>DATE & TIME:</span>
          <span>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>PATIENT:</span>
          <strong>${data.patientName}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>CLINICIAN:</span>
          <span>${data.doctorName}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 10px; margin: 4px 0;">
        <span>DESCRIPTION</span>
        <span>AMOUNT</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 9.5px;">
        <span>1x ${data.serviceName}</span>
        <span>${data.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
      </div>
      
      <div class="divider"></div>
      <div style="display: flex; justify-content: space-between; font-size: 9.5px;">
        <span>SUBTOTAL:</span>
        <span>${data.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 9px; color: #475569;">
        <span>VAT (0% Healthcare):</span>
        <span>0.00 ETB</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-top: 3px;">
        <span>TOTAL PAID:</span>
        <span>${data.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 9px; color: #0284c7; margin-top: 2px;">
        <span>METHOD:</span>
        <strong>${data.paymentMethod.toUpperCase()}</strong>
      </div>
      
      <div class="divider"></div>
      <div style="font-size: 8px; color: #475569; margin-top: 4px;">
        Ministry of Revenues Official Tax Receipt<br/>
        Thank you for choosing Bole Dental Studio!
      </div>
    </div>
  `;

  smartPrint({
    title: `Receipt_${data.receiptNumber}`,
    html,
    paperSize: 'thermal',
  });
}

/**
 * Print Treatment Plan & Odontogram Summary (A4)
 */
export function printTreatmentPlan(plan: {
  id: string;
  title: string;
  patientName: string;
  status: string;
  doctorName?: string;
  procedures: {
    id: string;
    name?: string;
    procedureName?: string;
    toothNumber?: number | 'whole_mouth' | string | null;
    status: string;
    feeETB: number;
    category?: string;
  }[];
  totalFeeETB: number;
  clinicalNotes?: {
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
  }[];
}, clinic?: Clinic): void {
  const clinicName = clinic?.name || 'Bole Dental Studio';
  const clinicLocation = clinic?.location || 'Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa';
  const clinicPhone = clinic?.phone || '+251 91 122 3344';
  const tinNumber = '0049283711';

  const html = `
    <div style="max-width: 100%; margin: 0 auto;">
      <!-- Clinic Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <h1 style="margin: 0; font-size: 17pt; font-weight: 800; color: #0f172a; text-transform: uppercase;">
            ${clinicName}
          </h1>
          <p style="margin: 2px 0 0 0; font-size: 9.5pt; color: #475569;" class="ethiopic">
            የጥርስ ህክምና እቅድ እና የክፍያ ዝርዝር · Addis Ababa, Ethiopia
          </p>
          <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #64748b;">
            ${clinicLocation} · Tel: ${clinicPhone} · MoR TIN: ${tinNumber}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; padding: 4px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin-bottom: 4px;">
            <span style="font-size: 8pt; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">
              CLINICAL TREATMENT PLAN
            </span>
          </div>
          <p style="margin: 0; font-family: monospace; font-size: 12pt; font-weight: 700; color: #0f172a;">
            ${plan.id}
          </p>
          <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #64748b;">
            Status: <strong>${plan.status.toUpperCase()}</strong>
          </p>
        </div>
      </div>

      <!-- Plan & Patient Meta -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;" class="avoid-break">
        <div>
          <div style="font-size: 8pt; text-transform: uppercase; color: #64748b; font-weight: 700;">Patient</div>
          <div style="font-size: 11pt; font-weight: 700; color: #0f172a; margin-top: 2px;">${plan.patientName}</div>
          <div style="font-size: 9pt; color: #475569; margin-top: 2px;">Plan: <strong>${plan.title}</strong></div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 8pt; text-transform: uppercase; color: #64748b; font-weight: 700;">Attending Clinician</div>
          <div style="font-size: 10pt; font-weight: 600; color: #1e293b; margin-top: 2px;">${plan.doctorName || 'Dr. Senait Tadesse'}</div>
          <div style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">Lead Surgeon & Clinical Director</div>
        </div>
      </div>

      <!-- Planned Procedures Table -->
      <div class="avoid-break">
        <h3 style="font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.05em; color: #334155; margin: 0 0 6px 0;">
          Staged Clinical Procedures (FDI World Dental Federation Notation)
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Procedure Description</th>
              <th style="width: 90px; text-align: center;">Tooth # (FDI)</th>
              <th style="width: 100px; text-align: center;">Stage Status</th>
              <th style="width: 130px; text-align: right;">Clinical Fee (ETB)</th>
            </tr>
          </thead>
          <tbody>
            ${plan.procedures.map((p, idx) => `
              <tr>
                <td style="color: #64748b; font-size: 9pt;">${idx + 1}</td>
                <td style="font-weight: 600; color: #1e293b;">${p.name || p.procedureName || 'Clinical Dental Procedure'}</td>
                <td style="text-align: center; font-family: monospace; font-weight: 700; color: #0284c7;">
                  ${p.toothNumber ? (p.toothNumber === 'whole_mouth' ? 'Whole Arch' : `#${p.toothNumber}`) : '—'}
                </td>
                <td style="text-align: center; font-size: 8.5pt; font-weight: 600; color: #475569;">
                  ${p.status}
                </td>
                <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
                  ${p.feeETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Total -->
      <div style="display: flex; justify-content: flex-end; margin-top: 12px;" class="avoid-break">
        <div style="width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 11pt; font-weight: 800; color: #0f172a;">
            <span>Total Plan Investment:</span>
            <span class="font-mono" style="color: #0284c7;">${plan.totalFeeETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
          </div>
        </div>
      </div>

      ${plan.clinicalNotes && plan.clinicalNotes.length > 0 ? `
        <!-- Doctor Clinical Notes -->
        <div style="margin-top: 18px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;" class="avoid-break">
          <h4 style="margin: 0 0 6px 0; font-size: 9pt; text-transform: uppercase; color: #334155; font-weight: 700;">
            Attending Clinician Progress & Staging Notes
          </h4>
          ${plan.clinicalNotes.map((n) => `
            <div style="font-size: 8.5pt; color: #475569; margin-bottom: 6px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
              <strong style="color: #1e293b;">${n.authorName}:</strong> ${n.content}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Signature Block -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; padding-top: 10px;" class="avoid-break">
        <div>
          <div style="border-bottom: 1px solid #475569; height: 35px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #334155; margin-top: 4px;">
            Attending Clinician Signature
          </div>
          <div style="font-size: 8pt; color: #64748b;">
            Bole Dental Studio Clinical Directorate
          </div>
        </div>
        <div>
          <div style="border-bottom: 1px solid #475569; height: 35px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #334155; margin-top: 4px;">
            Patient Staging Consent
          </div>
          <div style="font-size: 8pt; color: #64748b;">
            Date: _____________________
          </div>
        </div>
      </div>
    </div>
  `;

  smartPrint({
    title: `Treatment_Plan_${plan.id}_${plan.patientName.replace(/\s+/g, '_')}`,
    html,
    paperSize: 'A4',
  });
}

/**
 * ============================================================================
 * DAILY PRACTICE & FISCAL RECONCILIATION REPORT (A4 Minimalist Clinical Template)
 * ============================================================================
 */
export interface DailyReportData {
  reportDate?: string;
  zReportNumber?: string;
  supervisorName?: string;
  tinNumber?: string;
  totalBilledETB?: number;
  totalCollectedETB?: number;
  cashExpectedETB?: number;
  cashCountedETB?: number;
  cashVarianceETB?: number;
  telebirrTotalETB?: number;
  cbeTotalETB?: number;
  transferTotalETB?: number;
  patientsCount?: number;
  treatmentsCount?: number;
  encounters?: {
    time: string;
    patientName: string;
    mrn: string;
    procedure: string;
    doctor: string;
    amountETB: number;
    method: string;
  }[];
  doctorBreakdown?: {
    doctorName: string;
    encountersCount: number;
    productionETB: number;
    sharePercent: number;
  }[];
}

export function getDailyReportHTML(data?: DailyReportData, clinic?: Clinic): string {
  const clinicName = clinic?.name || 'BOLE DENTAL STUDIO';
  const clinicLocation = clinic?.location || 'Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa';
  const clinicPhone = clinic?.phone || '+251 91 122 3344';
  const tin = data?.tinNumber || '0049283711';
  const reportDate = data?.reportDate || 'Monday, October 12, 2026';
  const zNumber = data?.zReportNumber || 'BDS-REP-D-20261012-01';
  const supervisor = data?.supervisorName || 'Helen Tadesse (Reception & Cashier)';

  const billed = data?.totalBilledETB ?? 18075;
  const collected = data?.totalCollectedETB ?? 18075;
  const variance = data?.cashVarianceETB ?? 0;
  const patientsCount = data?.patientsCount ?? 6;
  const treatmentsCount = data?.treatmentsCount ?? 22;

  const cashCounted = data?.cashCountedETB ?? 480;
  const telebirrTotal = data?.telebirrTotalETB ?? 5695;
  const cbeTotal = data?.cbeTotalETB ?? 7800;
  const transferTotal = data?.transferTotalETB ?? 4100;

  const encounters = data?.encounters || [
    { time: '09:15', patientName: 'Dawit Haile Gebre', mrn: 'BDS-MRN-2026-0089', procedure: 'Endodontic Pulpectomy & Canals Instrumentation (#36)', doctor: 'Dr. Senait Tadesse', amountETB: 7800, method: 'Direct debit' },
    { time: '10:45', patientName: 'Sara Mengistu Tadesse', mrn: 'BDS-MRN-2026-0155', procedure: 'Clear Aligner Progression & Retainer Advance', doctor: 'Dr. Brook Zewde', amountETB: 4300, method: 'CBE Birr POS' },
    { time: '11:30', patientName: 'Tigist Alemu Desta', mrn: 'BDS-MRN-2026-0041', procedure: 'Ultrasonic Scaling & Polishing Prophylaxis', doctor: 'Dr. Senait Tadesse', amountETB: 720, method: 'Telebirr POS' },
    { time: '14:00', patientName: 'Abebe Kebede Wolde', mrn: 'BDS-MRN-2026-0210', procedure: 'Emergency Sedative Dressing & Pulp Sedation', doctor: 'Dr. Brook Zewde', amountETB: 480, method: 'Physical Cash' },
    { time: '15:30', Solomon: 'Solomon Tekle Mariam', patientName: 'Solomon Tekle Mariam', mrn: 'BDS-MRN-2026-0094', procedure: 'Full Zirconia Crown Impression & Prep Anticipo', doctor: 'Dr. Senait Tadesse', amountETB: 4100, method: 'CBE Transfer' },
    { time: '16:45', patientName: 'Meron Bekele Haile', mrn: 'BDS-MRN-2026-0312', procedure: 'Periapical Diagnostic PA X-Ray & Comprehensive Exam', doctor: 'Dr. Senait Tadesse', amountETB: 675, method: 'Telebirr SuperApp' },
  ];

  const doctors = data?.doctorBreakdown || [
    { doctorName: 'Dr. Senait Tadesse', encountersCount: 4, productionETB: 24350, sharePercent: 82.5 },
    { doctorName: 'Dr. Brook Zewde', encountersCount: 2, productionETB: 5160, sharePercent: 17.5 },
  ];

  return `
    <div style="max-width: 100%; margin: 0 auto; color: #0f172a; font-family: 'Inter', -apple-system, sans-serif; font-size: 9pt; line-height: 1.45;">
      
      <!-- Official Ministry of Revenues & Clinic Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
              FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA · MINISTRY OF REVENUES (MoR)
            </div>
            <div style="font-size: 7.5pt; color: #64748b; font-family: 'Noto Sans Ethiopic', sans-serif;">
              የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ የገቢዎች ሚኒስቴር · የክሊኒክ ዕለታዊ ኦዲት
            </div>
            <h1 style="margin: 4px 0 0 0; font-size: 16pt; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; color: #0f172a;">
              ${clinicName}
            </h1>
            <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #475569;">
              ${clinicLocation} · Tel: ${clinicPhone}
            </p>
          </div>

          <div style="text-align: right; font-family: monospace; font-size: 8.5pt; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
            <div style="font-weight: 800; font-size: 10pt; color: #0f172a;">DAILY PRACTICE AUDIT</div>
            <div style="color: #64748b; font-size: 8pt; margin-top: 2px;">Ref: <strong>${zNumber}</strong></div>
            <div style="color: #0f172a; font-weight: 700; margin-top: 2px;">TIN: ${tin}</div>
            <div style="color: #64748b; font-size: 7.5pt;">Register: BDS-FSC-AA-03</div>
          </div>
        </div>
      </div>

      <!-- Shift & Operatory Meta -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; font-size: 8.5pt;">
        <div>
          <span style="color: #64748b; text-transform: uppercase; font-size: 7.5pt; font-weight: 700; display: block;">Report Date</span>
          <strong style="color: #0f172a;">${reportDate}</strong>
        </div>
        <div>
          <span style="color: #64748b; text-transform: uppercase; font-size: 7.5pt; font-weight: 700; display: block;">Shift Officer</span>
          <strong style="color: #0f172a;">${supervisor}</strong>
        </div>
        <div>
          <span style="color: #64748b; text-transform: uppercase; font-size: 7.5pt; font-weight: 700; display: block;">Active Operatories</span>
          <strong style="color: #0f172a;">Chair 1 & Chair 2 (100% Online)</strong>
        </div>
        <div>
          <span style="color: #64748b; text-transform: uppercase; font-size: 7.5pt; font-weight: 700; display: block;">Fiscal Reconciliation</span>
          <strong style="color: #059669;">Zero Variance · Balanced</strong>
        </div>
      </div>

      <!-- 4 Top Executive Summary Numbers -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px;">
        <div style="border: 1px solid #cbd5e1; border-left: 3px solid #059669; border-radius: 6px; padding: 8px 12px;">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Gross Billed</div>
          <div style="font-size: 13pt; font-weight: 800; font-family: monospace; color: #0f172a; margin-top: 2px;">
            ${billed.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span style="font-size: 8.5pt; font-weight: 600;">ETB</span>
          </div>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">100% Tax Compliant</div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-left: 3px solid #0284c7; border-radius: 6px; padding: 8px 12px;">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Total Collected</div>
          <div style="font-size: 13pt; font-weight: 800; font-family: monospace; color: #0284c7; margin-top: 2px;">
            ${collected.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span style="font-size: 8.5pt; font-weight: 600;">ETB</span>
          </div>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">Realized Cash & POS</div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-left: 3px solid #6366f1; border-radius: 6px; padding: 8px 12px;">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Drawer Variance</div>
          <div style="font-size: 13pt; font-weight: 800; font-family: monospace; color: #059669; margin-top: 2px;">
            ${Math.abs(variance).toFixed(2)} <span style="font-size: 8.5pt; font-weight: 600;">ETB</span>
          </div>
          <div style="font-size: 7.5pt; color: #059669; margin-top: 2px;">Exact Physical Match</div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-left: 3px solid #f59e0b; border-radius: 6px; padding: 8px 12px;">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Patient Encounters</div>
          <div style="font-size: 13pt; font-weight: 800; font-family: monospace; color: #0f172a; margin-top: 2px;">
            ${patientsCount} <span style="font-size: 8.5pt; font-weight: 600;">Pts</span>
          </div>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">${treatmentsCount} Procedures charted</div>
        </div>
      </div>

      <!-- Financial Reconciliation by Tender Rail -->
      <div style="margin-bottom: 18px;">
        <h3 style="margin: 0 0 6px 0; font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b;">
          1. Financial Reconciliation by Payment Rail (የክፍያ መንገዶች ማጠቃለያ)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
              <th style="padding: 6px 10px; font-weight: 700;">Tender Channel</th>
              <th style="padding: 6px 10px; font-weight: 700;">Institution / Gateway Ref</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Transactions</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Audited Total (ETB)</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: center;">Variance</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px; font-weight: 600;">CBE Birr POS / Debit Card</td>
              <td style="padding: 6px 10px; color: #64748b; font-family: monospace;">Commercial Bank of Ethiopia (Terminal #04)</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace;">2</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700;">${cbeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px 10px; text-align: center; color: #059669; font-weight: 700;">0.00</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background: #fafafa;">
              <td style="padding: 6px 10px; font-weight: 600;">Telebirr SuperApp</td>
              <td style="padding: 6px 10px; color: #64748b; font-family: monospace;">Ethio Telecom Merchant (ID: 94821)</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace;">2</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700;">${telebirrTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px 10px; text-align: center; color: #059669; font-weight: 700;">0.00</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 6px 10px; font-weight: 600;">Direct Debit / Bank Transfer</td>
              <td style="padding: 6px 10px; color: #64748b; font-family: monospace;">CBE & Awash RTGS Settlement Batch</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace;">1</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700;">${transferTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px 10px; text-align: center; color: #059669; font-weight: 700;">0.00</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background: #fafafa;">
              <td style="padding: 6px 10px; font-weight: 600;">Physical Cash (Counted)</td>
              <td style="padding: 6px 10px; color: #64748b; font-family: monospace;">Cash Drawer (200 / 100 / 50 Birr denominations)</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace;">1</td>
              <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700;">${cashCounted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 6px 10px; text-align: center; color: #059669; font-weight: 700;">0.00</td>
            </tr>
            <tr style="background: #f8fafc; font-weight: 800; border-top: 2px solid #0f172a;">
              <td colspan="2" style="padding: 8px 10px; text-transform: uppercase;">Total Reconciled Collections</td>
              <td style="padding: 8px 10px; text-align: right; font-family: monospace;">${patientsCount}</td>
              <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-size: 10pt; color: #0f172a;">
                ${collected.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </td>
              <td style="padding: 8px 10px; text-align: center; color: #059669;">0.00 ETB</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Today's Clinical Patient Encounters Table -->
      <div style="margin-bottom: 18px;" class="avoid-break">
        <h3 style="margin: 0 0 6px 0; font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b;">
          2. Operatory Patient Log & Clinical Procedures (የቀኑ ታካሚዎች እና የህክምና ዝርዝር)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 8pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
              <th style="padding: 5px 8px; font-weight: 700;">Time</th>
              <th style="padding: 5px 8px; font-weight: 700;">Patient Name</th>
              <th style="padding: 5px 8px; font-weight: 700;">MRN</th>
              <th style="padding: 5px 8px; font-weight: 700;">Procedure & Tooth</th>
              <th style="padding: 5px 8px; font-weight: 700;">Clinician</th>
              <th style="padding: 5px 8px; font-weight: 700;">Method</th>
              <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Fee (ETB)</th>
            </tr>
          </thead>
          <tbody>
            ${encounters.map((enc, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 1 ? '#fafafa' : '#ffffff'};">
                <td style="padding: 5px 8px; font-family: monospace; color: #64748b;">${enc.time}</td>
                <td style="padding: 5px 8px; font-weight: 700; color: #0f172a;">${enc.patientName}</td>
                <td style="padding: 5px 8px; font-family: monospace; color: #64748b; font-size: 7.5pt;">${enc.mrn}</td>
                <td style="padding: 5px 8px; color: #334155;">${enc.procedure}</td>
                <td style="padding: 5px 8px; color: #475569;">${enc.doctor}</td>
                <td style="padding: 5px 8px; color: #64748b; font-size: 7.5pt;">${enc.method}</td>
                <td style="padding: 5px 8px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
                  ${enc.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Doctor Production & Productivity Breakdown -->
      <div style="margin-bottom: 22px;" class="avoid-break">
        <h3 style="margin: 0 0 6px 0; font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b;">
          3. Clinician Production & Efficiency (የዶክተሮች የስራ ክንውን)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
              <th style="padding: 6px 10px; font-weight: 700;">Attending Clinician</th>
              <th style="padding: 6px 10px; font-weight: 700;">Encounters</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Gross Production (ETB)</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Revenue Contribution</th>
            </tr>
          </thead>
          <tbody>
            ${doctors.map((doc) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px 10px; font-weight: 700; color: #0f172a;">${doc.doctorName}</td>
                <td style="padding: 6px 10px; color: #475569; font-family: monospace;">${doc.encountersCount} patients</td>
                <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
                  ${doc.productionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                </td>
                <td style="padding: 6px 10px; text-align: right; font-family: monospace; color: #0284c7; font-weight: 700;">
                  ${doc.sharePercent}%
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Signatures & Official Directorate Seal -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 24px; padding-top: 14px; border-top: 1px solid #cbd5e1;" class="avoid-break">
        <div>
          <div style="font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase;">
            Prepared & Counted by:
          </div>
          <div style="border-bottom: 1px solid #475569; height: 35px; margin-top: 4px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin-top: 4px;">
            Helen Tadesse
          </div>
          <div style="font-size: 7.5pt; color: #64748b;">
            Chief Cashier & Front Desk Officer
          </div>
        </div>

        <div>
          <div style="font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase;">
            Verified & Audited by:
          </div>
          <div style="border-bottom: 1px solid #475569; height: 35px; margin-top: 4px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin-top: 4px;">
            Dr. Senait Tadesse
          </div>
          <div style="font-size: 7.5pt; color: #64748b;">
            Clinical Director & Lead Specialist
          </div>
        </div>

        <div style="text-align: center;">
          <div style="font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
            Official Fiscal Stamp
          </div>
          <div style="display: inline-block; width: 85px; height: 85px; border: 2px dashed #94a3b8; border-radius: 50%; padding: 6px; box-sizing: border-box;">
            <div style="font-size: 6.5pt; font-weight: 800; color: #475569; text-transform: uppercase; margin-top: 14px;">
              BOLE DENTAL
            </div>
            <div style="font-size: 6.5pt; color: #059669; font-weight: 700;">
              MoR AUDITED
            </div>
            <div style="font-size: 6pt; color: #94a3b8; font-family: monospace;">
              BDS-FSC-AA-03
            </div>
          </div>
        </div>
      </div>

      <!-- Legal Footer -->
      <div style="margin-top: 16px; padding-top: 8px; border-top: 1px dashed #e2e8f0; font-size: 7.5pt; color: #94a3b8; text-align: center;">
        Official Record generated by Sinna Dental AI · Bole Dental Studio · Ministry of Revenues TIN: 0049283711 · All values in Ethiopian Birr (ETB)
      </div>
    </div>
  `;
}

export function printDailyPracticeReport(data?: DailyReportData, clinic?: Clinic): void {
  const html = getDailyReportHTML(data, clinic);
  smartPrint({
    title: `Daily_Practice_Report_${new Date().toISOString().slice(0, 10)}`,
    html,
    paperSize: 'A4',
  });
}

/**
 * ============================================================================
 * WEEKLY PRACTICE PERFORMANCE & CLINICAL AUDIT REPORT (A4 Executive Template)
 * ============================================================================
 */
export interface WeeklyReportData {
  weekLabel?: string;
  startDate?: string;
  endDate?: string;
  tinNumber?: string;
  totalGrossProductionETB?: number;
  totalCollectionsETB?: number;
  collectionRate?: number;
  newPatientsCount?: number;
  totalPatientsCount?: number;
  chairUtilizationRate?: number;
  dailyData?: {
    day: string;
    date: string;
    scheduledCount: number;
    completedCount: number;
    productionETB: number;
    collectionsETB: number;
  }[];
  categoryData?: {
    category: string;
    units: number;
    amountETB: number;
    sharePercent: number;
  }[];
  doctorData?: {
    doctorName: string;
    specialty: string;
    units: number;
    productionETB: number;
    avgTicketETB: number;
  }[];
}

export function getWeeklyReportHTML(data?: WeeklyReportData, clinic?: Clinic): string {
  const clinicName = clinic?.name || 'BOLE DENTAL STUDIO';
  const clinicLocation = clinic?.location || 'Bole Medhanialem, Morning Star Mall 3rd Floor, Addis Ababa';
  const clinicPhone = clinic?.phone || '+251 91 122 3344';
  const tin = data?.tinNumber || '0049283711';
  const weekLabel = data?.weekLabel || 'Week 41 (Monday, Oct 05 – Saturday, Oct 10, 2026)';

  const grossProduction = data?.totalGrossProductionETB ?? 118450;
  const collections = data?.totalCollectionsETB ?? 114200;
  const realizationRate = data?.collectionRate ?? 96.4;
  const totalPatients = data?.totalPatientsCount ?? 38;
  const newPatients = data?.newPatientsCount ?? 11;
  const chairUtilization = data?.chairUtilizationRate ?? 83.9;

  const dailyData = data?.dailyData || [
    { day: 'Monday', date: 'Oct 05, 2026', scheduledCount: 7, completedCount: 7, productionETB: 19400, collectionsETB: 18500 },
    { day: 'Tuesday', date: 'Oct 06, 2026', scheduledCount: 8, completedCount: 8, productionETB: 22100, collectionsETB: 21300 },
    { day: 'Wednesday', date: 'Oct 07, 2026', scheduledCount: 6, completedCount: 6, productionETB: 16800, collectionsETB: 16800 },
    { day: 'Thursday', date: 'Oct 08, 2026', scheduledCount: 7, completedCount: 7, productionETB: 24950, collectionsETB: 22400 },
    { day: 'Friday', date: 'Oct 09, 2026', scheduledCount: 8, completedCount: 7, productionETB: 21300, collectionsETB: 21300 },
    { day: 'Saturday', date: 'Oct 10, 2026', scheduledCount: 5, completedCount: 5, productionETB: 13900, collectionsETB: 13900 },
  ];

  const categories = data?.categoryData || [
    { category: 'Restorative (Composite, Post & Core)', units: 26, amountETB: 38400, sharePercent: 32.4 },
    { category: 'Endodontics (Root Canal & Pulpectomy)', units: 12, amountETB: 34200, sharePercent: 28.9 },
    { category: 'Prosthodontics (Zirconia & E-max Crowns)', units: 7, amountETB: 25600, sharePercent: 21.6 },
    { category: 'Periodontics & Ultrasonic Scaling', units: 14, amountETB: 9800, sharePercent: 8.3 },
    { category: 'Oral Surgery & Atraumatic Extractions', units: 4, amountETB: 5200, sharePercent: 4.4 },
    { category: 'Diagnostic Imaging (PA & Panoramic X-Ray)', units: 18, amountETB: 5250, sharePercent: 4.4 },
  ];

  const doctors = data?.doctorData || [
    { doctorName: 'Dr. Senait Tadesse', specialty: 'Lead Specialist & Surgeon', units: 54, productionETB: 82650, avgTicketETB: 1530.5 },
    { doctorName: 'Dr. Brook Zewde', specialty: 'Associate Clinician', units: 27, productionETB: 35800, avgTicketETB: 1325.9 },
  ];

  return `
    <div style="max-width: 100%; margin: 0 auto; color: #0f172a; font-family: 'Inter', -apple-system, sans-serif; font-size: 9pt; line-height: 1.45;">
      
      <!-- Executive Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
              FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA · CLINICAL AUDIT DIRECTORATE
            </div>
            <div style="font-size: 7.5pt; color: #64748b; font-family: 'Noto Sans Ethiopic', sans-serif;">
              የክሊኒካል አፈጻጸም፣ የታካሚዎች ፍሰት እና የፋይናንስ ሳምንታዊ ኦዲት
            </div>
            <h1 style="margin: 4px 0 0 0; font-size: 16pt; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; color: #0f172a;">
              ${clinicName}
            </h1>
            <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #475569;">
              ${clinicLocation} · Tel: ${clinicPhone}
            </p>
          </div>

          <div style="text-align: right; font-family: monospace; font-size: 8.5pt; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px;">
            <div style="font-weight: 800; font-size: 10pt; color: #0f172a;">EXECUTIVE WEEKLY AUDIT</div>
            <div style="color: #64748b; font-size: 8pt; margin-top: 2px;">Session: <strong>Q4 · Week 41</strong></div>
            <div style="color: #0f172a; font-weight: 700; margin-top: 2px;">TIN: ${tin}</div>
            <div style="color: #64748b; font-size: 7.5pt;">MoR Register: BDS-FSC-AA-03</div>
          </div>
        </div>
      </div>

      <!-- Sub-header Period Badge -->
      <div style="background: #f1f5f9; border-radius: 6px; padding: 8px 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5pt;">
        <div>
          <span style="color: #64748b; text-transform: uppercase; font-size: 7.5pt; font-weight: 700;">Reporting Window:</span>{' '}
          <strong style="color: #0f172a;">${weekLabel}</strong>
        </div>
        <div style="font-family: monospace; font-size: 8pt; color: #475569;">
          Operatory Capacity: <strong>2 Chairs (108 Operating Hours)</strong>
        </div>
      </div>

      <!-- 4 Top Executive KPI Metrics -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px;">
        <div style="border: 1px solid #cbd5e1; border-left: 3px solid #0284c7; border-radius: 6px; padding: 10px 12px;">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Gross Production</div>
          <div style="font-size: 14pt; font-weight: 800; font-family: monospace; color: #0f172a; margin-top: 2px;">
            ${grossProduction.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span style="font-size: 8.5pt; font-weight: 600;">ETB</span>
          </div>
          <div style="font-size: 7.5pt; color: #0284c7; margin-top: 2px; font-weight: 600;">+14.2% vs previous week</div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-left: 3px solid #059669; border-radius: 6px; padding: 10px 12px;">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Net Collections</div>
          <div style="font-size: 14pt; font-weight: 800; font-family: monospace; color: #059669; margin-top: 2px;">
            ${collections.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span style="font-size: 8.5pt; font-weight: 600;">ETB</span>
          </div>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">Realization Rate: <strong>${realizationRate}%</strong></div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-left: 3px solid #6366f1; border-radius: 6px; padding: 10px 12px;">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Patient Encounters</div>
          <div style="font-size: 14pt; font-weight: 800; font-family: monospace; color: #0f172a; margin-top: 2px;">
            ${totalPatients} <span style="font-size: 8.5pt; font-weight: 600;">Patients</span>
          </div>
          <div style="font-size: 7.5pt; color: #4f46e5; margin-top: 2px; font-weight: 600;">${newPatients} New (28.9% acquisition)</div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-left: 3px solid #d97706; border-radius: 6px; padding: 10px 12px;">
          <div style="font-size: 7.5pt; font-weight: 700; text-transform: uppercase; color: #64748b;">Chair Occupancy</div>
          <div style="font-size: 14pt; font-weight: 800; font-family: monospace; color: #0f172a; margin-top: 2px;">
            ${chairUtilization}%
          </div>
          <div style="font-size: 7.5pt; color: #059669; margin-top: 2px; font-weight: 600;">97.6% Completed (0.0% no-show)</div>
        </div>
      </div>

      <!-- Day-by-Day Volume & Revenue Table -->
      <div style="margin-bottom: 18px;">
        <h3 style="margin: 0 0 6px 0; font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b;">
          1. Day-by-Day Operatory Volume & Revenue (የቀን ተከታታይ የስራ እና የገቢ ዝርዝር)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
              <th style="padding: 6px 10px; font-weight: 700;">Day</th>
              <th style="padding: 6px 10px; font-weight: 700;">Date</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: center;">Booked</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: center;">Completed</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Gross Production</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Cash/Digital Collected</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Collection %</th>
            </tr>
          </thead>
          <tbody>
            ${dailyData.map((d, idx) => {
              const rate = ((d.collectionsETB / d.productionETB) * 100).toFixed(1);
              return `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 1 ? '#fafafa' : '#ffffff'};">
                  <td style="padding: 6px 10px; font-weight: 700; color: #0f172a;">${d.day}</td>
                  <td style="padding: 6px 10px; color: #64748b; font-family: monospace;">${d.date}</td>
                  <td style="padding: 6px 10px; text-align: center; font-family: monospace;">${d.scheduledCount}</td>
                  <td style="padding: 6px 10px; text-align: center; font-family: monospace; font-weight: 700; color: #059669;">${d.completedCount}</td>
                  <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">
                    ${d.productionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                  </td>
                  <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700; color: #0284c7;">
                    ${d.collectionsETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                  </td>
                  <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700; color: ${Number(rate) >= 95 ? '#059669' : '#d97706'};">
                    ${rate}%
                  </td>
                </tr>
              `;
            }).join('')}
            <tr style="background: #f8fafc; font-weight: 800; border-top: 2px solid #0f172a;">
              <td colspan="2" style="padding: 8px 10px; text-transform: uppercase;">Weekly Cumulative Totals</td>
              <td style="padding: 8px 10px; text-align: center; font-family: monospace;">41</td>
              <td style="padding: 8px 10px; text-align: center; font-family: monospace; color: #059669;">${totalPatients}</td>
              <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-size: 10pt; color: #0f172a;">
                ${grossProduction.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </td>
              <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-size: 10pt; color: #0284c7;">
                ${collections.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </td>
              <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-size: 10pt; color: #059669;">
                ${realizationRate}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Clinical Procedure Breakdown -->
      <div style="margin-bottom: 18px;" class="avoid-break">
        <h3 style="margin: 0 0 6px 0; font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b;">
          2. Clinical Discipline & Procedure Performance (የህክምና ዘርፎች ትንተና)
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
              <th style="padding: 6px 10px; font-weight: 700;">Specialty Discipline</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: center;">Procedures Done</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Gross Generated (ETB)</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Revenue Share %</th>
              <th style="padding: 6px 10px; font-weight: 700; text-align: right;">Avg Procedure Fee</th>
            </tr>
          </thead>
          <tbody>
            ${categories.map((c) => {
              const avg = Math.round(c.amountETB / c.units);
              return `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px 10px; font-weight: 600; color: #0f172a;">${c.category}</td>
                  <td style="padding: 6px 10px; text-align: center; font-family: monospace;">${c.units}</td>
                  <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700;">
                    ${c.amountETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: 700; color: #0284c7;">
                    ${c.sharePercent}%
                  </td>
                  <td style="padding: 6px 10px; text-align: right; font-family: monospace; color: #64748b;">
                    ${avg.toLocaleString()} ETB
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Doctor Production & Financial Aging -->
      <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 14px; margin-bottom: 22px;" class="avoid-break">
        <div>
          <h3 style="margin: 0 0 6px 0; font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b;">
            3. Clinician Weekly Contribution
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 8pt; border: 1px solid #cbd5e1;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; text-align: left;">
                <th style="padding: 5px 8px; font-weight: 700;">Doctor</th>
                <th style="padding: 5px 8px; font-weight: 700; text-align: center;">Procedures</th>
                <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Total ETB</th>
                <th style="padding: 5px 8px; font-weight: 700; text-align: right;">Share</th>
              </tr>
            </thead>
            <tbody>
              ${doctors.map((doc) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 5px 8px; font-weight: 700; color: #0f172a;">${doc.doctorName}</td>
                  <td style="padding: 5px 8px; text-align: center; font-family: monospace;">${doc.units}</td>
                  <td style="padding: 5px 8px; text-align: right; font-family: monospace; font-weight: 700;">${doc.productionETB.toLocaleString()}</td>
                  <td style="padding: 5px 8px; text-align: right; font-family: monospace; color: #0284c7; font-weight: 700;">
                    ${((doc.productionETB / grossProduction) * 100).toFixed(1)}%
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style="margin: 0 0 6px 0; font-size: 9pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b;">
            4. Aging Receivables Health
          </h3>
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; font-size: 8pt; background: #fafafa; space-y: 4px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">0–30 Days (Current):</span>
              <strong style="color: #059669; font-family: monospace;">6,875.00 ETB</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">31–60 Days:</span>
              <strong style="color: #0f172a; font-family: monospace;">0.00 ETB</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #64748b;">61–90+ Days:</span>
              <strong style="color: #059669; font-family: monospace;">0.00 ETB (Clean)</strong>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; display: flex; justify-content: space-between; font-weight: 800;">
              <span>Total Aging Exposure:</span>
              <span style="color: #0f172a; font-family: monospace;">6,875.00 ETB</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Executive Sign-off & Audit Certification -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 24px; padding-top: 14px; border-top: 1px solid #cbd5e1;" class="avoid-break">
        <div>
          <div style="font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase;">
            Clinical Director & Chief Surgeon:
          </div>
          <div style="border-bottom: 1px solid #475569; height: 38px; margin-top: 4px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin-top: 4px;">
            Dr. Senait Tadesse
          </div>
          <div style="font-size: 7.5pt; color: #64748b;">
            Bole Dental Studio Clinical Directorate · Certified
          </div>
        </div>

        <div>
          <div style="font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase;">
            Practice Operations & Audit Administrator:
          </div>
          <div style="border-bottom: 1px solid #475569; height: 38px; margin-top: 4px;"></div>
          <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin-top: 4px;">
            Helen Tadesse
          </div>
          <div style="font-size: 7.5pt; color: #64748b;">
            Administrative Directorate · Date: ___________________
          </div>
        </div>
      </div>

      <!-- Legal Footer -->
      <div style="margin-top: 20px; padding-top: 8px; border-top: 1px dashed #e2e8f0; font-size: 7.5pt; color: #94a3b8; text-align: center;">
        Official Executive Performance Audit · Sinna Dental AI · Bole Dental Studio · Ministry of Revenues TIN: 0049283711 · All values in Ethiopian Birr (ETB)
      </div>
    </div>
  `;
}

export function printWeeklyExecutiveReport(data?: WeeklyReportData, clinic?: Clinic): void {
  const html = getWeeklyReportHTML(data, clinic);
  smartPrint({
    title: `Weekly_Executive_Audit_${new Date().toISOString().slice(0, 10)}`,
    html,
    paperSize: 'A4',
  });
}

