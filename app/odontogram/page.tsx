import { redirect } from 'next/navigation';

export default function OdontogramRedirectPage() {
  // Sinna Dental AI standard: The official 32-Tooth FDI Odontogram and restorative workspace
  // lives permanently under the Treatment Plans clinical workspace (/treatment-plans).
  redirect('/treatment-plans');
}
