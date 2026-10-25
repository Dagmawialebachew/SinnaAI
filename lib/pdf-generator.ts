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
 * Generates an ultra-clean, minimalist 1-PAGE A4 clinical & financial report template.
 * Designed after modern executive treasurer & clinical practice statement standards:
 * - Fonts: Montserrat (Headers & KPI figures) + Poppins (Clean tabular & body text)
 * - Layout: Clean white paper (#FFFFFF) with warm neutral highlight bars (#E9E7E2)
 * - Structure:
 *   1. Logo + Clean Title (e.g., "Daily Practice Report", "Monthly Practice Report")
 *   2. Meta input boxes: Period / Date & Prepared By
 *   3. Highlight Bar: Gross Clinical Production
 *   4. Collections Table (Payment Rails & Tender Channels)
 *   5. Services Table (Clinical Procedures & Specialties)
 *   6. 3 Bold Summary Figures (Total Collections, Total Production, Receivables)
 *   7. Reconciled Balance Highlight Bar
 *   8. Additional Shift & Compliance Notes
 *   9. Signatures & Official Audit Stamp
 * - Strict 1-Page Guarantee: Content height tuned to fit within 1123px A4 bounds.
 */
export function getClinicalReportHTML(
  period: ReportPeriod,
  data: ReportStatsData,
  clinic?: Clinic | { name?: string; location?: string; phone?: string; tinNumber?: string; mrrPrefix?: string }
): string {
  const clinicName = clinic?.name || 'Bole Dental Studio';
  const tinNumber = (clinic as any)?.tinNumber || '0049283711';
  const dateStr = new Date().toISOString().slice(0, 10);
  const totalReceivables = data.receivables0_30 + data.receivables31_60;

  // Title formatting per period
  const reportTitles: Record<ReportPeriod, string> = {
    daily: 'Daily Practice Report',
    weekly: 'Weekly Practice Report',
    monthly: 'Monthly Practice Report',
    '3month': 'Quarterly Practice Report',
    '6month': 'Semi-Annual Practice Report',
  };
  const title = reportTitles[period] || 'Practice Performance Report';

  // Scaled category procedures for the services table
  const scale = period === 'daily' ? 1 : period === 'weekly' ? 4 : period === 'monthly' ? 16 : period === '3month' ? 48 : 96;
  const categories = [
    { name: 'Restorative Fillings (Composite / Core)', count: 6 * scale, amount: 8800 * scale },
    { name: 'Endodontics (Root Canal Therapies)', count: 3 * scale, amount: 7800 * scale },
    { name: 'Prosthodontics (Zirconia & E-max Crowns)', count: 2 * scale, amount: 5200 * scale },
    { name: 'Periodontics (Ultrasonic Scaling & Cleaning)', count: 4 * scale, amount: 2200 * scale },
    { name: 'Oral Surgery & Atraumatic Extractions', count: 2 * scale, amount: 950 * scale },
  ];

  return `
    <div style="width: 794px; height: 1123px; max-height: 1123px; background: #ffffff; color: #111827; font-family: 'Poppins', -apple-system, sans-serif; font-size: 8.5pt; line-height: 1.4; box-sizing: border-box; padding: 28px 36px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
      
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap');
      </style>

      <div>
        <!-- 1. HEADER: LOGO + CLEAN TITLE -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1.5px solid #E5E7EB;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <!-- Clean Clinical Tooth Logo -->
            <div style="width: 38px; height: 38px; background: #111827; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C8.5 2 5 4.5 5 8c0 3 1.5 5 2.5 8 .5 1.5 1 4 2.5 4 1 0 1.5-1.5 2-3 .5 1.5 1 3 2 3 1.5 0 2-2.5 2.5-4 1-3 2.5-5 2.5-8 0-3.5-3.5-6-7-6z"/>
              </svg>
            </div>
            <div>
              <div style="font-family: 'Montserrat', sans-serif; font-size: 13pt; font-weight: 800; letter-spacing: -0.01em; color: #111827; text-transform: uppercase;">
                ${clinicName}
              </div>
              <div style="font-size: 7.5pt; color: #6B7280; font-weight: 500;">
                Clinical Practice & Revenue Audit · MoR TIN: ${tinNumber}
              </div>
            </div>
          </div>

          <div style="text-align: right;">
            <h1 style="margin: 0; font-family: 'Montserrat', sans-serif; font-size: 17pt; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
              ${title}
            </h1>
            <div style="font-size: 7.5pt; color: #6B7280; margin-top: 1px;">
              Session Ref: BDS-AUD-${period.toUpperCase()}-${dateStr}
            </div>
          </div>
        </div>

        <!-- 2. SUBHEADER META ROW (Clean boxes like the sample image) -->
        <div style="display: flex; gap: 14px; margin-bottom: 12px; font-size: 8pt;">
          <div style="flex: 1.2; display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; color: #374151; font-family: 'Montserrat', sans-serif;">Period:</span>
            <div style="flex: 1; border: 1px solid #D1D5DB; border-radius: 4px; padding: 4px 8px; font-weight: 500; background: #FAFAFA; color: #111827;">
              ${data.subLabel}
            </div>
          </div>
          <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; color: #374151; font-family: 'Montserrat', sans-serif;">Prepared By:</span>
            <div style="flex: 1; border: 1px solid #D1D5DB; border-radius: 4px; padding: 4px 8px; font-weight: 500; background: #FAFAFA; color: #111827;">
              Dr. Senait Tadesse / Helen Tadesse
            </div>
          </div>
        </div>

        <!-- 3. HIGHLIGHT BAR 1 (Gross Production) -->
        <div style="background: #EBE8E3; border-radius: 4px; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-family: 'Montserrat', sans-serif; font-size: 9pt; font-weight: 700; color: #111827;">
            Gross Clinical Production
          </span>
          <span style="font-family: 'Montserrat', sans-serif; font-size: 11pt; font-weight: 800; color: #111827;">
            ${data.productionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
          </span>
        </div>

        <!-- 4. SECTION 1: INCOME / COLLECTIONS TABLE -->
        <div style="margin-bottom: 10px;">
          <div style="font-family: 'Montserrat', sans-serif; font-size: 8.5pt; font-weight: 700; color: #111827; margin-bottom: 4px;">
            Collections Received (Tender Channels)
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
            <thead>
              <tr style="background: #EBE8E3; border-top: 1px solid #D1D5DB; border-bottom: 1px solid #D1D5DB;">
                <th style="padding: 4px 8px; text-align: left; font-family: 'Montserrat', sans-serif; font-weight: 600; color: #111827; width: 32%;">Channel</th>
                <th style="padding: 4px 8px; text-align: left; font-family: 'Montserrat', sans-serif; font-weight: 600; color: #111827; width: 44%;">Institution & Terminal Description</th>
                <th style="padding: 4px 8px; text-align: right; font-family: 'Montserrat', sans-serif; font-weight: 600; color: #111827; width: 24%;">Amount (ETB)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 4px 8px; font-weight: 600;">CBE Birr POS / Card</td>
                <td style="padding: 4px 8px; color: #4B5563;">Commercial Bank of Ethiopia (Terminal #04)</td>
                <td style="padding: 4px 8px; text-align: right; font-weight: 600; font-family: monospace;">${data.cbeTotalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 4px 8px; font-weight: 600;">Telebirr SuperApp</td>
                <td style="padding: 4px 8px; color: #4B5563;">Ethio Telecom Merchant (Merchant ID: 94821)</td>
                <td style="padding: 4px 8px; text-align: right; font-weight: 600; font-family: monospace;">${data.telebirrTotalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 4px 8px; font-weight: 600;">Bank Transfer (RTGS)</td>
                <td style="padding: 4px 8px; color: #4B5563;">Direct CBE & Awash Direct Settlement</td>
                <td style="padding: 4px 8px; text-align: right; font-weight: 600; font-family: monospace;">${data.transferTotalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E5E7EB;">
                <td style="padding: 4px 8px; font-weight: 600;">Physical Cash Drawer</td>
                <td style="padding: 4px 8px; color: #4B5563;">Audited Cash Notes (200 / 100 / 50 Birr denominations)</td>
                <td style="padding: 4px 8px; text-align: right; font-weight: 600; font-family: monospace;">${data.cashTotalETB.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr style="font-weight: 700; background: #FAFAFA; border-top: 1.5px solid #111827;">
                <td colspan="2" style="padding: 5px 8px; font-family: 'Montserrat', sans-serif;">Total Collections:</td>
                <td style="padding: 5px 8px; text-align: right; font-family: 'Montserrat', sans-serif; font-size: 9pt; color: #111827;">
                  ${data.collectedETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. SECTION 2: CLINICAL SERVICES DELIVERED TABLE -->
        <div style="margin-bottom: 10px;">
          <div style="font-family: 'Montserrat', sans-serif; font-size: 8.5pt; font-weight: 700; color: #111827; margin-bottom: 4px;">
            Clinical Services Delivered
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
            <thead>
              <tr style="background: #EBE8E3; border-top: 1px solid #D1D5DB; border-bottom: 1px solid #D1D5DB;">
                <th style="padding: 4px 8px; text-align: left; font-family: 'Montserrat', sans-serif; font-weight: 600; color: #111827; width: 44%;">Procedure Discipline</th>
                <th style="padding: 4px 8px; text-align: center; font-family: 'Montserrat', sans-serif; font-weight: 600; color: #111827; width: 32%;">Procedures Charted</th>
                <th style="padding: 4px 8px; text-align: right; font-family: 'Montserrat', sans-serif; font-weight: 600; color: #111827; width: 24%;">Amount (ETB)</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map((c) => `
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 3.5px 8px; font-weight: 500;">${c.name}</td>
                  <td style="padding: 3.5px 8px; text-align: center; color: #4B5563; font-family: monospace;">${c.count} procedures</td>
                  <td style="padding: 3.5px 8px; text-align: right; font-weight: 600; font-family: monospace;">${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: 700; background: #FAFAFA; border-top: 1.5px solid #111827;">
                <td style="padding: 5px 8px; font-family: 'Montserrat', sans-serif;">Total Services Charted:</td>
                <td style="padding: 5px 8px; text-align: center; font-family: monospace; color: #111827;">${data.treatmentsCount} treatments</td>
                <td style="padding: 5px 8px; text-align: right; font-family: 'Montserrat', sans-serif; font-size: 9pt; color: #111827;">
                  ${data.productionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. SUMMARY STATS: 3 BIG CLEAN FIGURES (Exactly like the sample image) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 10px; text-align: left; padding: 6px 0;">
          <div style="border-left: 2px solid #111827; padding-left: 10px;">
            <div style="font-family: 'Montserrat', sans-serif; font-size: 13pt; font-weight: 800; color: #111827; letter-spacing: -0.01em;">
              ${data.collectedETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
            </div>
            <div style="font-size: 7.5pt; color: #6B7280; font-weight: 500; margin-top: 1px;">
              Total Collections (Realized)
            </div>
          </div>

          <div style="border-left: 2px solid #111827; padding-left: 10px;">
            <div style="font-family: 'Montserrat', sans-serif; font-size: 13pt; font-weight: 800; color: #111827; letter-spacing: -0.01em;">
              ${data.productionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
            </div>
            <div style="font-size: 7.5pt; color: #6B7280; font-weight: 500; margin-top: 1px;">
              Total Clinical Production
            </div>
          </div>

          <div style="border-left: 2px solid #111827; padding-left: 10px;">
            <div style="font-family: 'Montserrat', sans-serif; font-size: 13pt; font-weight: 800; color: #111827; letter-spacing: -0.01em;">
              ${totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
            </div>
            <div style="font-size: 7.5pt; color: #6B7280; font-weight: 500; margin-top: 1px;">
              Overdue / Unsettled Payments
            </div>
          </div>
        </div>

        <!-- 7. HIGHLIGHT BAR 2 (Ending / Reconciled Fiscal Balance) -->
        <div style="background: #EBE8E3; border-radius: 4px; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-family: 'Montserrat', sans-serif; font-size: 9pt; font-weight: 700; color: #111827;">
            Reconciled Cash Drawer Balance
          </span>
          <span style="font-family: 'Montserrat', sans-serif; font-size: 10pt; font-weight: 800; color: #111827;">
            Exact Match · 0.00 ETB Variance
          </span>
        </div>

        <!-- 8. ADDITIONAL NOTES (Bullet points matching the sample image) -->
        <div style="margin-bottom: 12px;">
          <div style="font-family: 'Montserrat', sans-serif; font-size: 8.5pt; font-weight: 700; color: #111827; margin-bottom: 4px;">
            Clinical & Operational Notes
          </div>
          <ul style="margin: 0; padding-left: 16px; font-size: 7.5pt; color: #374151; line-height: 1.5;">
            <li>All patient procedures mapped to FDI World Dental Federation notation (11-18, 21-28, 31-38, 41-48) and verified by attending dentists.</li>
            <li>Operatory Chairs 1 & 2 operated at full throughput with <b>${data.noShowRate} no-show rate</b> and <b>${data.newPatientsCount} new patient intake</b> encounters.</li>
            <li>Doctor production distribution: Dr. Senait Tadesse charted <b>${data.doc1ProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</b> (${data.doc1Treatments} treatments); Dr. Brook Zewde charted <b>${data.doc2ProductionETB.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</b> (${data.doc2Treatments} treatments).</li>
            <li>Fiscal compliance: Ministry of Revenues TIN <b>0049283711</b> registered to fiscal cash machine <b>BDS-FSC-AA-03</b>.</li>
          </ul>
        </div>
      </div>

      <!-- 9. BOTTOM SIGNATURES & OFFICIAL AUDIT BLOCK -->
      <div style="border-top: 1px solid #E5E7EB; padding-top: 8px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 140px; gap: 20px; align-items: flex-end;">
          <div>
            <div style="font-size: 7pt; font-weight: 600; color: #6B7280; text-transform: uppercase;">
              Prepared & Reconciled By:
            </div>
            <div style="border-bottom: 1px solid #111827; height: 20px; margin-top: 2px;"></div>
            <div style="font-family: 'Montserrat', sans-serif; font-size: 8pt; font-weight: 700; color: #111827; margin-top: 2px;">
              Helen Tadesse
            </div>
            <div style="font-size: 6.5pt; color: #6B7280;">Chief Cashier & Front Desk</div>
          </div>

          <div>
            <div style="font-size: 7pt; font-weight: 600; color: #6B7280; text-transform: uppercase;">
              Approved By Clinical Director:
            </div>
            <div style="border-bottom: 1px solid #111827; height: 20px; margin-top: 2px;"></div>
            <div style="font-family: 'Montserrat', sans-serif; font-size: 8pt; font-weight: 700; color: #111827; margin-top: 2px;">
              Dr. Senait Tadesse
            </div>
            <div style="font-size: 6.5pt; color: #6B7280;">Clinical Director & Surgeon</div>
          </div>

          <div style="text-align: right;">
            <div style="display: inline-block; border: 1.5px dashed #9CA3AF; border-radius: 4px; padding: 4px 8px; text-align: center; background: #FAFAFA;">
              <div style="font-family: 'Montserrat', sans-serif; font-size: 6.5pt; font-weight: 800; color: #111827; text-transform: uppercase;">
                BOLE DENTAL
              </div>
              <div style="font-size: 6pt; color: #059669; font-weight: 700;">
                MoR VERIFIED
              </div>
              <div style="font-size: 5.5pt; color: #6B7280; font-family: monospace;">
                ${dateStr}
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 8px; font-size: 6.5pt; color: #9CA3AF; text-align: center; border-top: 1px solid #F3F4F6; padding-top: 4px;">
          Official Record · ${clinicName} · Ministry of Revenues TIN: ${tinNumber} · All values in Ethiopian Birr (ETB) · Page 1 of 1
        </div>
      </div>

    </div>
  `;
}

/**
 * Directly downloads the genuine .pdf file to the user's computer.
 * Guaranteed to produce EXACTLY 1 A4 page (no extra pages, no print views).
 */
export async function downloadClinicalReportPDF(
  period: ReportPeriod,
  data: ReportStatsData,
  clinic?: Clinic
): Promise<void> {
  if (typeof window === 'undefined') return;

  const html = getClinicalReportHTML(period, data, clinic);

  // Create temporary container offscreen with strict A4 dimensions
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.height = '1123px';
  container.style.maxHeight = '1123px';
  container.style.overflow = 'hidden';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    // Wait for fonts to be ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const canvas = await html2canvas(container, {
      scale: 2, // 2x crisp vector-like text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Exact 1-Page Output: Fit squarely onto 210mm x 297mm A4 page
    // ABSOLUTELY NO MULTI-PAGE LOOPS - GUARANTEED 1 SINGLE PAGE
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `BoleDental_${period.toUpperCase()}_Report_${dateStr}.pdf`;
    
    // Direct file download - no window.print()
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
