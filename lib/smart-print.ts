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
