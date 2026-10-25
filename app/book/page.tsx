'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClinicLandingPage } from '@/components/clinic-landing-page';

function BookPageContent() {
  const searchParams = useSearchParams();
  const clinicParam = searchParams.get('clinic') || searchParams.get('c') || 'smile-dental';
  const langParam = (searchParams.get('lang') as 'en' | 'am' | 'om') || 'en';

  return <ClinicLandingPage clinicSlug={clinicParam} initialLang={langParam} />;
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono text-sm">Loading Sinna Bio-Link...</div>}>
      <BookPageContent />
    </Suspense>
  );
}
