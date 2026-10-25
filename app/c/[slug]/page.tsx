'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ClinicLandingPage } from '@/components/clinic-landing-page';

export default function ClinicBioLandingPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'smile-dental';

  return <ClinicLandingPage clinicSlug={slug} initialLang="en" />;
}
