'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ClinicLandingPage } from '@/components/clinic-landing-page';
import { useSinnaStore } from '@/lib/store';

export default function ClinicBioLandingPage() {
  const store = useSinnaStore();
  const params = useParams();
  const rawSlug = params?.slug as string;

  // Dynamically resolve: if the URL slug matches a registered clinic, use it.
  // Otherwise, seamlessly fall back to the live active clinic from store!
  const targetSlug = (rawSlug && store.clinics[rawSlug])
    ? rawSlug
    : store.activeClinicSlug;

  return <ClinicLandingPage clinicSlug={targetSlug} initialLang="en" />;
}
