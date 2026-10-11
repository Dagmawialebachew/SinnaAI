'use client';

import React from 'react';
import { PatientBookingPortal } from '@/components/patient-booking-portal';

export default function BookPage() {
  return <PatientBookingPortal clinicSlug="bole-dental" initialLang="en" />;
}
