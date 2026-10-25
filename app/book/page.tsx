'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClinicLandingPage } from '@/components/clinic-landing-page';
import { useSinnaStore } from '@/lib/store';

function BookPageContent() {
  const store = useSinnaStore();
  const searchParams = useSearchParams();
  const clinicParam = searchParams.get('clinic') || searchParams.get('c');
  const langParam = (searchParams.get('lang') as 'en' | 'am' | 'om') || 'en';

  // Dynamically resolve: if an explicit clinic query param is passed and exists, use it.
  // Otherwise, ALWAYS use the active clinic from the live store!
  const targetClinicSlug = (clinicParam && store.clinics[clinicParam])
    ? clinicParam
    : store.activeClinicSlug;

  return <ClinicLandingPage clinicSlug={targetClinicSlug} initialLang={langParam} />;
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono text-sm">Loading Sinna Bio-Link...</div>}>
      <BookPageContent />
    </Suspense>
  );
}
