'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PatientBookingPortal } from '@/components/patient-booking-portal';

export default function ClinicLandingPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'bole-dental';

  return <PatientBookingPortal clinicSlug={slug} initialLang="en" />;
}
