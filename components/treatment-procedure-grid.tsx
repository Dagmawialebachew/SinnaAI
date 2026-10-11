'use client';

import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  HandMetal,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Link as LinkIcon,
  Search,
  X
} from 'lucide-react';
import { ToothStatus } from '@/lib/types';

export interface ProcedureDefinition {
  id: string;
  name: string;
  category: 'restorative' | 'surgery' | 'endodontics' | 'orthodontics' | 'whole_mouth';
  feeETB: number;
  color: string;
  iconSvg: React.ReactNode;
  mapsToStatus?: ToothStatus;
  hasMultiBadge?: 'layers' | 'link' | 'splint';
}

const PROCEDURES_DATA: Record<
  'restorative' | 'surgery' | 'endodontics' | 'orthodontics' | 'whole_mouth',
  ProcedureDefinition[]
> = {
  restorative: [
    {
      id: 'res-comp-fill',
      name: 'Composite filling',
      category: 'restorative',
      feeETB: 1800,
      color: 'rgb(59, 130, 246)',
      mapsToStatus: 'filled',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 3C7 1.5 9.5 0 12 0C14.5 0 17 1.5 17 3V12C17 14 15.5 16 12 16C8.5 16 7 14 7 12V3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" />
          <path d="M10 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'res-amal-fill',
      name: 'Amalgam filling',
      category: 'restorative',
      feeETB: 1500,
      color: 'rgb(107, 114, 128)',
      mapsToStatus: 'filled',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 3C7 1.5 9.5 0 12 0C14.5 0 17 1.5 17 3V12C17 14 15.5 16 12 16C8.5 16 7 14 7 12V3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" fillOpacity="0.7" />
          <line x1="9.5" y1="6" x2="14.5" y2="6" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
          <line x1="9.5" y1="8" x2="14.5" y2="8" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
          <path d="M10 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'res-temp-fill',
      name: 'Temporary filling',
      category: 'restorative',
      feeETB: 800,
      color: 'rgb(34, 197, 94)',
      mapsToStatus: 'caries',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 3C7 1.5 9.5 0 12 0C14.5 0 17 1.5 17 3V12C17 14 15.5 16 12 16C8.5 16 7 14 7 12V3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" fillOpacity="0.6" />
          <circle cx="12" cy="7.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <path d="M12 6.5V7.5L12.75 8" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M10 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'res-comp-inlay',
      name: 'Composite inlay',
      category: 'restorative',
      feeETB: 2800,
      color: 'rgb(59, 130, 246)',
      mapsToStatus: 'filled',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="4" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
          <circle cx="10.5" cy="5.5" r="0.5" fill="currentColor" />
          <circle cx="13.5" cy="5.5" r="0.5" fill="currentColor" />
          <circle cx="12" cy="7" r="0.5" fill="currentColor" />
          <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-ceram-inlay',
      name: 'Ceramic inlay',
      category: 'restorative',
      feeETB: 4200,
      color: 'rgb(59, 130, 246)',
      mapsToStatus: 'filled',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="4" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
          <circle cx="10.5" cy="5.5" r="0.5" fill="currentColor" />
          <circle cx="13.5" cy="5.5" r="0.5" fill="currentColor" />
          <circle cx="12" cy="7" r="0.5" fill="currentColor" />
          <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-comp-overlay',
      name: 'Composite overlay',
      category: 'restorative',
      feeETB: 3200,
      color: 'rgb(59, 130, 246)',
      mapsToStatus: 'filled',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V5C17 6 15 7 12 7C9 7 7 6 7 5V2Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
          <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-ceram-overlay',
      name: 'Ceramic overlay',
      category: 'restorative',
      feeETB: 4800,
      color: 'rgb(59, 130, 246)',
      mapsToStatus: 'filled',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V5C17 6 15 7 12 7C9 7 7 6 7 5V2Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
          <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-comp-veneer',
      name: 'Composite veneer',
      category: 'restorative',
      feeETB: 3500,
      color: 'rgb(236, 72, 153)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V12C16 14 14 16 12 16C10 16 8 14 8 12V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 3C8 2 9.5 1.5 12 1.5C14.5 1.5 16 2 16 3V11C16 12.5 14.5 14 12 14C9.5 14 8 12.5 8 11V3Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M10 17V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 17V21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-porc-veneer',
      name: 'Porcelain veneer',
      category: 'restorative',
      feeETB: 5500,
      color: 'rgb(236, 72, 153)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V12C16 14 14 16 12 16C10 16 8 14 8 12V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 3C8 2 9.5 1.5 12 1.5C14.5 1.5 16 2 16 3V11C16 12.5 14.5 14 12 14C9.5 14 8 12.5 8 11V3Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M10 17V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 17V21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-zirc-veneer',
      name: 'Zirconia veneer',
      category: 'restorative',
      feeETB: 6500,
      color: 'rgb(236, 72, 153)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V12C16 14 14 16 12 16C10 16 8 14 8 12V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 3C8 2 9.5 1.5 12 1.5C14.5 1.5 16 2 16 3V11C16 12.5 14.5 14 12 14C9.5 14 8 12.5 8 11V3Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M10 17V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 17V21" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-mc-crown',
      name: 'Metal-ceramic crown',
      category: 'restorative',
      feeETB: 4500,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 10L6 3H18L20 10L18 11L16 8L14 12L12 7L10 12L8 8L6 11L4 10Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 11V20C6 21 7 22 12 22C17 22 18 21 18 20V11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="12" cy="11" rx="6" ry="2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      ),
    },
    {
      id: 'res-zirc-crown',
      name: 'Zirconia crown',
      category: 'restorative',
      feeETB: 5500,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 10L6 3H18L20 10L18 11L16 8L14 12L12 7L10 12L8 8L6 11L4 10Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 11V20C6 21 7 22 12 22C17 22 18 21 18 20V11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="12" cy="11" rx="6" ry="2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      ),
    },
    {
      id: 'res-lith-crown',
      name: 'Lithium disilicate crown',
      category: 'restorative',
      feeETB: 6000,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 10L6 3H18L20 10L18 11L16 8L14 12L12 7L10 12L8 8L6 11L4 10Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 11V20C6 21 7 22 12 22C17 22 18 21 18 20V11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="12" cy="11" rx="6" ry="2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      ),
    },
    {
      id: 'res-metal-crown',
      name: 'Metal crown',
      category: 'restorative',
      feeETB: 3800,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 10L6 3H18L20 10L18 11L16 8L14 12L12 7L10 12L8 8L6 11L4 10Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 11V20C6 21 7 22 12 22C17 22 18 21 18 20V11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="12" cy="11" rx="6" ry="2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      ),
    },
    {
      id: 'res-prov-crown',
      name: 'Provisional crown',
      category: 'restorative',
      feeETB: 1200,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 10L6 3H18L20 10L18 11L16 8L14 12L12 7L10 12L8 8L6 11L4 10Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 11V20C6 21 7 22 12 22C17 22 18 21 18 20V11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="12" cy="11" rx="6" ry="2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      ),
    },
    {
      id: 'res-mc-crown-imp',
      name: 'Metal-ceramic crown on implant',
      category: 'restorative',
      feeETB: 7500,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M6 2H18L20 7H4Z" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M5 7H19V11C19 12 17 13 12 13C7 13 5 12 5 11Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.25" />
          <rect x="10.5" y="13" width="3" height="2" fill="currentColor" />
          <path d="M9 15H15L14.5 22H9.5Z" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'res-zirc-crown-imp',
      name: 'Zirconia crown on implant',
      category: 'restorative',
      feeETB: 9000,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M6 2H18L20 7H4Z" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M5 7H19V11C19 12 17 13 12 13C7 13 5 12 5 11Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.25" />
          <rect x="10.5" y="13" width="3" height="2" fill="currentColor" />
          <path d="M9 15H15L14.5 22H9.5Z" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'res-prov-crown-imp',
      name: 'Provisional crown on implant',
      category: 'restorative',
      feeETB: 2500,
      color: 'rgb(252, 211, 77)',
      mapsToStatus: 'crown',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M6 2H18L20 7H4Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 1.5" strokeLinejoin="round" />
          <path d="M5 7H19V11C19 12 17 13 12 13C7 13 5 12 5 11Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 1.5" />
          <rect x="10.5" y="13" width="3" height="2" fill="currentColor" fillOpacity="0.6" />
          <path d="M9 15H15L14.5 22H9.5Z" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'res-mc-bridge',
      name: 'Metal-ceramic bridge',
      category: 'restorative',
      feeETB: 12000,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'link',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <line x1="2" y1="5" x2="22" y2="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 7C3 6 4 5.5 5.5 5.5C7 5.5 8 6 8 7V15C8 17 7 19 5.5 19C4 19 3 17 3 15V7Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 8C9.5 7 10.5 6.5 12 6.5C13.5 6.5 14.5 7 14.5 8V15C14.5 16.5 13.5 17.5 12 17.5C10.5 17.5 9.5 16.5 9.5 15V8Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 7C16 6 17 5.5 18.5 5.5C20 5.5 21 6 21 7V15C21 17 20 19 18.5 19C17 19 16 17 16 15V7Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-zirc-bridge',
      name: 'Zirconia bridge',
      category: 'restorative',
      feeETB: 15000,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'link',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <line x1="2" y1="5" x2="22" y2="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 7C3 6 4 5.5 5.5 5.5C7 5.5 8 6 8 7V15C8 17 7 19 5.5 19C4 19 3 17 3 15V7Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 8C9.5 7 10.5 6.5 12 6.5C13.5 6.5 14.5 7 14.5 8V15C14.5 16.5 13.5 17.5 12 17.5C10.5 17.5 9.5 16.5 9.5 15V8Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 7C16 6 17 5.5 18.5 5.5C20 5.5 21 6 21 7V15C21 17 20 19 18.5 19C17 19 16 17 16 15V7Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-mary-bridge',
      name: 'Maryland bridge',
      category: 'restorative',
      feeETB: 8500,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'link',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <line x1="2" y1="5" x2="22" y2="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 8H9V11H2Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M8.5 7C8.5 5.5 10 4.5 12 4.5C14 4.5 15.5 5.5 15.5 7V17C15.5 19 14 21 12 21C10 21 8.5 19 8.5 17V7Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M15 8H22V11H15Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'res-occ-splint',
      name: 'Occlusal splint',
      category: 'restorative',
      feeETB: 3000,
      color: 'rgb(59, 130, 246)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M3 10C3 6 6 3.5 12 3.5C18 3.5 21 6 21 10V14C21 16.5 18 19 12 19C6 19 3 16.5 3 14V10Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.5" />
          <line x1="6" y1="11.5" x2="18" y2="11.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'res-perio-splint',
      name: 'Periodontal retention splint',
      category: 'restorative',
      feeETB: 2800,
      color: 'rgb(59, 130, 246)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M3 3.5C3 2.75 3.75 2 5 2C6.25 2 7 2.75 7 3.5V11C7 12.5 6.25 13.5 5 13.5C3.75 13.5 3 12.5 3 11V3.5Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 3.5C10 2.75 10.75 2 12 2C13.25 2 14 2.75 14 3.5V11C14 12.5 13.25 13.5 12 13.5C10.75 13.5 10 12.5 10 11V3.5Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M17 3.5C17 2.75 17.75 2 19 2C20.25 2 21 2.75 21 3.5V11C21 12.5 20.25 13.5 19 13.5C17.75 13.5 17 12.5 17 11V3.5Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M3 16H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'res-large-recon',
      name: 'Large composite reconstruction',
      category: 'restorative',
      feeETB: 2500,
      color: 'rgb(59, 130, 246)',
      mapsToStatus: 'filled',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 3C7 1.5 9.5 0 12 0C14.5 0 17 1.5 17 3V12C17 14 15.5 16 12 16C8.5 16 7 14 7 12V3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" />
          <path d="M10 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'res-fill-repair',
      name: 'Filling repair',
      category: 'restorative',
      feeETB: 1200,
      color: 'rgb(59, 130, 246)',
      mapsToStatus: 'filled',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 3C7 1.5 9.5 0 12 0C14.5 0 17 1.5 17 3V12C17 14 15.5 16 12 16C8.5 16 7 14 7 12V3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'res-recement',
      name: 'Crown recementation',
      category: 'restorative',
      feeETB: 800,
      color: 'rgb(245, 158, 11)',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 10L6 3H18L20 10L18 11L16 8L14 12L12 7L10 12L8 8L6 11L4 10Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'res-crown-post',
      name: 'Crown over endodontically treated tooth',
      category: 'restorative',
      feeETB: 5800,
      color: 'rgb(245, 158, 11)',
      mapsToStatus: 'crown',
      hasMultiBadge: 'layers',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 10L6 3H18L20 10L18 11L16 8L14 12L12 7L10 12L8 8L6 11L4 10Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 11V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'res-heal-abut',
      name: 'Healing abutment',
      category: 'restorative',
      feeETB: 2200,
      color: 'rgb(16, 185, 129)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect x="10" y="1" width="4" height="4" rx="1" fill="currentColor" />
          <path d="M9 5H15V8H9V5Z" fill="currentColor" fillOpacity="0.5" />
          <path d="M8 8L16 8L15 22L9 22L8 8Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'res-def-abut',
      name: 'Definitive abutment',
      category: 'restorative',
      feeETB: 3500,
      color: 'rgb(16, 185, 129)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect x="10" y="1" width="4" height="4" rx="1" fill="currentColor" />
          <path d="M9 5H15V8H9V5Z" fill="currentColor" fillOpacity="0.5" />
          <path d="M8 8L16 8L15 22L9 22L8 8Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
  ],
  surgery: [
    {
      id: 'surg-simple-ext',
      name: 'Simple tooth extraction',
      category: 'surgery',
      feeETB: 1200,
      color: 'rgb(220, 38, 38)',
      mapsToStatus: 'missing',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M8 4C8 2.5 10 1 12 1C14 1 16 2.5 16 4V10C16 11.5 15 14 12 14C9 14 8 11.5 8 10V4Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 18L19 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 15L17 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 15L7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'surg-implant',
      name: 'Dental implant fixture placement',
      category: 'surgery',
      feeETB: 25000,
      color: 'rgb(16, 185, 129)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect x="10" y="1" width="4" height="4" rx="1" fill="currentColor" />
          <path d="M9 5H15V8H9V5Z" fill="currentColor" fillOpacity="0.5" />
          <path d="M8 8L16 8L15 22L9 22L8 8Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="7" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1" />
          <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="currentColor" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: 'surg-apico',
      name: 'Apicoectomy & Retrograde Filling',
      category: 'surgery',
      feeETB: 6500,
      color: 'rgb(99, 102, 241)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V10C16 12 14 14 12 14C10 14 8 12 8 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="22" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
  ],
  endodontics: [
    {
      id: 'endo-full-rct',
      name: 'Full root canal obturation',
      category: 'endodontics',
      feeETB: 4500,
      color: 'rgb(139, 92, 246)',
      mapsToStatus: 'rct',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 4V21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'endo-rct-23',
      name: 'Root canal 2/3 biomechanical prep',
      category: 'endodontics',
      feeETB: 3200,
      color: 'rgb(139, 92, 246)',
      mapsToStatus: 'rct',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 4V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'endo-post',
      name: 'Prefabricated fiberglass post',
      category: 'endodontics',
      feeETB: 2800,
      color: 'rgb(124, 58, 237)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect x="10" y="8" width="4" height="14" fill="currentColor" />
          <rect x="9" y="6" width="6" height="3" rx="0.5" fill="currentColor" />
        </svg>
      ),
    },
  ],
  orthodontics: [
    {
      id: 'ortho-bracket',
      name: 'Orthodontic bracket placement',
      category: 'orthodontics',
      feeETB: 1200,
      color: 'rgb(99, 102, 241)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
          <line x1="3" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <rect x="10" y="10" width="4" height="4" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'ortho-retainer',
      name: 'Clear thermoformed retainer',
      category: 'orthodontics',
      feeETB: 3500,
      color: 'rgb(20, 184, 166)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M4 14C4 8 8 4 12 4C16 4 20 8 20 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="4" cy="14" r="2" fill="currentColor" />
          <circle cx="20" cy="14" r="2" fill="currentColor" />
        </svg>
      ),
    },
  ],
  whole_mouth: [
    {
      id: 'wm-exam',
      name: 'Comprehensive examination',
      category: 'whole_mouth',
      feeETB: 500,
      color: 'rgb(59, 130, 246)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'wm-scaling',
      name: 'Ultrasonic scaling & prophylaxis',
      category: 'whole_mouth',
      feeETB: 1500,
      color: 'rgb(16, 185, 129)',
      iconSvg: (
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ],
};

export interface TreatmentProcedureGridProps {
  planTitle: string;
  selectedTooth: number | null;
  onApplyProcedure: (proc: ProcedureDefinition) => void;
}

export function TreatmentProcedureGrid({
  planTitle,
  selectedTooth,
  onApplyProcedure,
}: TreatmentProcedureGridProps) {
  const [activeCategory, setActiveCategory] = useState<
    'restorative' | 'surgery' | 'endodontics' | 'orthodontics' | 'whole_mouth'
  >('restorative');
  const [searchQuery, setSearchQuery] = useState('');
  const [legendOpen, setLegendOpen] = useState(true);

  const categories = [
    { key: 'restorative', label: 'Restorative' },
    { key: 'surgery', label: 'Surgery' },
    { key: 'endodontics', label: 'Endodontics' },
    { key: 'orthodontics', label: 'Orthodontics' },
    { key: 'whole_mouth', label: 'Whole mouth' },
  ] as const;

  const allProcedures = useMemo(() => {
    return Object.values(PROCEDURES_DATA).flat();
  }, []);

  const displayedProcedures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return PROCEDURES_DATA[activeCategory];
    }
    return allProcedures.filter(
      (proc) =>
        proc.name.toLowerCase().includes(q) ||
        proc.category.toLowerCase().includes(q)
    );
  }, [searchQuery, activeCategory, allProcedures]);

  return (
    <div className="space-y-4">
      {/* 1. DentalPin Context Banner */}
      <div className="plan-context-banner bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <ClipboardList className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-semibold text-amber-900 shrink-0">Adding to this plan:</span>
          <span className="font-bold text-slate-900 truncate">{planTitle}</span>
        </div>

        {selectedTooth ? (
          <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Tooth #{selectedTooth} Active
          </span>
        ) : (
          <span className="shrink-0 text-[11px] font-medium text-amber-800 hidden sm:inline">
            Select tooth or whole mouth
          </span>
        )}
      </div>

      {/* 2. Top Row with Category Tabs & Fast Procedure Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="category-tabs flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setActiveCategory(cat.key);
                setSearchQuery('');
              }}
              className={`category-tab px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.key && !searchQuery
                  ? 'bg-slate-900 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Live Search Input for Fast Doctor Procedure Lookups */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search treatments (e.g. filling, crown, rct)..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-md"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Search Filter Status Indicator */}
      {searchQuery && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/80 border border-blue-200/60 rounded-xl text-xs text-blue-900">
          <span className="font-medium">
            Found <strong className="font-bold font-mono">{displayedProcedures.length}</strong> matching procedures for &ldquo;{searchQuery}&rdquo;
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-blue-700 hover:underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* 3. Treatment Grid with Exact DentalPin CSS classes & SVG vectors */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-card">
        {displayedProcedures.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-1.5">
            <p className="font-bold text-slate-700">No procedures matched &ldquo;{searchQuery}&rdquo;</p>
            <p>Try searching for &ldquo;filling&rdquo;, &ldquo;crown&rdquo;, &ldquo;extraction&rdquo;, &ldquo;rct&rdquo;, or &ldquo;cleaning&rdquo;.</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="treatment-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {displayedProcedures.map((proc) => (
              <div key={proc.id} className="treatment-cell">
                <button
                  type="button"
                  onClick={() => onApplyProcedure(proc)}
                  className="treatment-btn group relative w-full p-2.5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-500 hover:bg-blue-50/20 shadow-2xs flex flex-col items-center justify-between text-center min-h-[96px] transition-all hover:-translate-y-0.5 active:scale-98"
                  title={`${proc.name} • ${proc.feeETB.toLocaleString()} ETB`}
                >
                  {/* Category Pill when searching across all catalog */}
                  {searchQuery && (
                    <span className="absolute top-1.5 left-2 text-[8px] uppercase font-bold text-slate-400 tracking-wider">
                      {proc.category.replace('_', ' ')}
                    </span>
                  )}

                  {/* Multi-tooth hint badge if present */}
                  {proc.hasMultiBadge === 'layers' && (
                    <span className="absolute top-2 right-2 text-slate-400 group-hover:text-pink-500" title="Supports multiple teeth">
                      <Layers className="w-3 h-3" />
                    </span>
                  )}
                  {proc.hasMultiBadge === 'link' && (
                    <span className="absolute top-2 right-2 text-slate-400 group-hover:text-amber-500" title="Bridge spans multiple teeth">
                      <LinkIcon className="w-3 h-3" />
                    </span>
                  )}

                  {/* Exact DentalPin SVG Icon */}
                  <div className="treatment-icon p-1 transition-transform group-hover:scale-110 mt-1" style={{ color: proc.color }}>
                    {proc.iconSvg}
                  </div>

                  {/* Treatment Label */}
                  <span className="treatment-label text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2 px-0.5 group-hover:text-blue-700">
                    {proc.name}
                  </span>

                  {/* Price */}
                  <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-600">
                    {proc.feeETB.toLocaleString()} ETB
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Exact DentalPin Legend Component (.odontogram-legend) */}
      <div className="odontogram-legend bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setLegendOpen(!legendOpen)}
          className="legend-header w-full p-3.5 px-4 flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <div className="header-content flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="header-title font-bold text-slate-900">Legend</span>
          </div>
          {legendOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {legendOpen && (
          <div className="legend-content p-4 pt-2 border-t border-slate-100 space-y-5">
            {/* Treatment status */}
            <div className="legend-section space-y-2">
              <h4 className="section-title text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Treatment status
              </h4>
              <div className="status-list flex items-center gap-6 text-xs text-slate-700">
                <div className="status-item flex items-center gap-2">
                  <span
                    className="status-indicator w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: 'rgb(148, 163, 184)' }}
                  />
                  <span className="item-label text-xs font-medium text-slate-700">Existing</span>
                </div>
                <div className="status-item flex items-center gap-2">
                  <span
                    className="status-indicator planned w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgb(148, 163, 184)' }}
                  >
                    <span className="planned-p text-[10px] font-black leading-none" style={{ color: 'rgb(239, 68, 68)' }}>
                      P
                    </span>
                  </span>
                  <span className="item-label text-xs font-medium text-slate-700">Planned</span>
                </div>
              </div>
            </div>

            {/* Diagnostic */}
            <div className="legend-section space-y-2">
              <h4 className="section-title text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Diagnostic
              </h4>
              <div className="treatment-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(239, 68, 68)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V10C16 12 14 14 12 14C10 14 8 12 8 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V20" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 14V20" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M11 4C11 4 10 6 10 8C10 10 12 11 12 11C12 11 14 10 14 8C14 6 13 4 13 4" fill="currentColor" fillOpacity="0.6" />
                      <circle cx="12" cy="7" r="2" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Pulpitis</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(239, 68, 68)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="11" cy="5" r="2" fill="currentColor" />
                      <circle cx="13" cy="7" r="1.5" fill="currentColor" />
                      <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Caries</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(249, 115, 22)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V10C16 12 14 14 12 14C10 14 8 12 8 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="5" r="2.5" fill="currentColor" fillOpacity="0.5" />
                      <circle cx="12" cy="5" r="1" fill="currentColor" />
                      <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Incipient caries</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(146, 64, 14)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V10C16 12 14 14 12 14C10 14 8 12 8 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <ellipse cx="12" cy="5" rx="2" ry="1.5" fill="currentColor" fillOpacity="0.6" />
                      <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Pigmentation</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(190, 24, 93)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V12C16 14 14 16 12 16C10 16 8 14 8 12V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 3L11 6L9 9L12 12L10 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 18V22" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 18V22" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Fracture</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(107, 114, 128)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <ellipse cx="12" cy="12" rx="8" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,2" />
                      <line x1="6" y1="8" x2="18" y2="16" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="18" y1="8" x2="6" y2="16" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Missing</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(239, 68, 68)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V10C16 12 14 14 12 14C10 14 8 12 8 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V18" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 14V18" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="20" r="2" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Periapical &lt;2mm</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(220, 38, 38)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V10C16 12 14 14 12 14C10 14 8 12 8 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V17" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 14V17" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="20" r="3.5" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Periapical 2-4mm</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(185, 28, 28)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V10C16 12 14 14 12 14C10 14 8 12 8 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V16" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 14V16" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="19" r="5" fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Periapical &gt;4mm</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(139, 92, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 3v5h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Rotated</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(245, 158, 11)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M12 4V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 4L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 4L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 20L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 20L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4 12L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4 12L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M20 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M20 12L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M20 12L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Displaced</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(156, 163, 175)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <line x1="4" y1="8" x2="20" y2="8" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12C8 10 10 9 12 9C14 9 16 10 16 12V18C16 20 14 22 12 22C10 22 8 20 8 18V12Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2,2" />
                      <line x1="4" y1="10" x2="7" y2="14" stroke="currentColor" strokeWidth="1" />
                      <line x1="20" y1="10" x2="17" y2="14" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Unerupted</span>
                </div>
              </div>
            </div>

            {/* Restorative */}
            <div className="legend-section space-y-2">
              <h4 className="section-title text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Restorative
              </h4>
              <div className="treatment-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(59, 130, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 3C7 1.5 9.5 0 12 0C14.5 0 17 1.5 17 3V12C17 14 15.5 16 12 16C8.5 16 7 14 7 12V3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" />
                      <path d="M10 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M14 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Composite filling</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(107, 114, 128)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 3C7 1.5 9.5 0 12 0C14.5 0 17 1.5 17 3V12C17 14 15.5 16 12 16C8.5 16 7 14 7 12V3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" fillOpacity="0.7" />
                      <line x1="9.5" y1="6" x2="14.5" y2="6" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                      <line x1="9.5" y1="8" x2="14.5" y2="8" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
                      <path d="M10 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M14 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Amalgam filling</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(34, 197, 94)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 3C7 1.5 9.5 0 12 0C14.5 0 17 1.5 17 3V12C17 14 15.5 16 12 16C8.5 16 7 14 7 12V3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="9" y="5" width="6" height="5" rx="1" fill="currentColor" fillOpacity="0.6" />
                      <circle cx="12" cy="7.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.75" />
                      <path d="M12 6.5V7.5L12.75 8" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
                      <path d="M10 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M14 18V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Temporary filling</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(6, 182, 212)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 4C8 3 9.5 2 12 2C14.5 2 16 3 16 4V6C16 7 14.5 8 12 8C9.5 8 8 7 8 6V4Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
                      <path d="M10 16V20" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 16V20" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Sealant</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(236, 72, 153)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V12C16 14 14 16 12 16C10 16 8 14 8 12V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 3C8 2 9.5 1.5 12 1.5C14.5 1.5 16 2 16 3V11C16 12.5 14.5 14 12 14C9.5 14 8 12.5 8 11V3Z" fill="currentColor" fillOpacity="0.3" />
                      <path d="M10 17V21" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 17V21" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Veneer</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(59, 130, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="9" y="4" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
                      <circle cx="10.5" cy="5.5" r="0.5" fill="currentColor" />
                      <circle cx="13.5" cy="5.5" r="0.5" fill="currentColor" />
                      <circle cx="12" cy="7" r="0.5" fill="currentColor" />
                      <circle cx="10.5" cy="8.5" r="0.5" fill="currentColor" />
                      <circle cx="13.5" cy="8.5" r="0.5" fill="currentColor" />
                      <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Inlay</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(59, 130, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V5C17 6 15 7 12 7C9 7 7 6 7 5V2Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
                      <line x1="8" y1="3" x2="16" y2="3" stroke="currentColor" strokeWidth="0.5" />
                      <line x1="8" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="0.5" />
                      <path d="M10 16V21" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 16V21" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Overlay</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(245, 158, 11)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M4 10L6 3H18L20 10L18 11L16 8L14 12L12 7L10 12L8 8L6 11L4 10Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M6 11V20C6 21 7 22 12 22C17 22 18 21 18 20V11" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <ellipse cx="12" cy="11" rx="6" ry="2" fill="currentColor" fillOpacity="0.2" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Crown</span>
                </div>
              </div>
            </div>

            {/* Surgery */}
            <div className="legend-section space-y-2">
              <h4 className="section-title text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Surgery
              </h4>
              <div className="treatment-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(220, 38, 38)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 4C8 2.5 10 1 12 1C14 1 16 2.5 16 4V10C16 11.5 15 14 12 14C9 14 8 11.5 8 10V4Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 18L19 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M7 15L17 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M17 15L7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Extraction</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(16, 185, 129)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <rect x="10" y="1" width="4" height="4" rx="1" fill="currentColor" />
                      <path d="M9 5H15V8H9V5Z" fill="currentColor" fillOpacity="0.5" />
                      <path d="M8 8L16 8L15 22L9 22L8 8Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="7" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1" />
                      <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="currentColor" strokeWidth="1" />
                      <line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="1" />
                      <line x1="8.5" y1="20" x2="15.5" y2="20" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Implant</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(99, 102, 241)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V10C16 12 14 14 12 14C10 14 8 12 8 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V18" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 14V18" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Apicoectomy</span>
                </div>
              </div>
            </div>

            {/* Endodontics */}
            <div className="legend-section space-y-2">
              <h4 className="section-title text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Endodontics
              </h4>
              <div className="treatment-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(139, 92, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V21C10 22.5 11 23 12 23C13 23 14 22.5 14 21V14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 4V21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Full root canal</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(139, 92, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V21C10 22.5 11 23 12 23C13 23 14 22.5 14 21V14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 4V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <text x="18" y="12" fontSize="6" fill="currentColor">⅔</text>
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Root canal 2/3</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(139, 92, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V21C10 22.5 11 23 12 23C13 23 14 22.5 14 21V14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 4V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <text x="18" y="12" fontSize="6" fill="currentColor">½</text>
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Root canal 1/2</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(124, 58, 237)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 2C8 1 10 0 12 0C14 0 16 1 16 2V8H8V2Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="10" y="8" width="4" height="14" fill="currentColor" />
                      <rect x="9" y="6" width="6" height="3" rx="0.5" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Post</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(59, 130, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M7 2C7 1 9 0 12 0C15 0 17 1 17 2V10C17 12 15 14 12 14C9 14 7 12 7 10V2Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 14V20" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 14V20" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M12 20V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1,1" />
                      <circle cx="12" cy="22" r="1" fill="currentColor" fillOpacity="0.6" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Overfilled root canal</span>
                </div>
              </div>
            </div>

            {/* Orthodontics */}
            <div className="legend-section space-y-2">
              <h4 className="section-title text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Orthodontics
              </h4>
              <div className="treatment-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(99, 102, 241)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="3" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="16" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <rect x="10" y="10" width="4" height="4" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Bracket</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(99, 102, 241)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <rect x="6" y="8" width="12" height="8" rx="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
                      <ellipse cx="12" cy="12" rx="3" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Tube</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(139, 92, 246)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <ellipse cx="12" cy="12" rx="8" ry="6" fill="none" stroke="currentColor" strokeWidth="2" />
                      <ellipse cx="12" cy="12" rx="5" ry="3.5" fill="currentColor" fillOpacity="0.2" />
                      <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor" />
                      <line x1="3" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="20" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Band</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(236, 72, 153)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M8 6C8 4 10 2 12 2C14 2 16 4 16 6V14C16 16 14 18 12 18C10 18 8 16 8 14V6Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <ellipse cx="12" cy="10" rx="3" ry="2" fill="currentColor" />
                      <path d="M10 19V22" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M14 19V22" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Attachment</span>
                </div>

                <div className="treatment-item flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="treatment-icon shrink-0" style={{ color: 'rgb(20, 184, 166)' }}>
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M4 14C4 8 8 4 12 4C16 4 20 8 20 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="4" cy="14" r="2" fill="currentColor" />
                      <circle cx="20" cy="14" r="2" fill="currentColor" />
                      <path d="M8 10C8 10 10 8 12 8C14 8 16 10 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="item-label text-[11px] font-medium text-slate-700">Retainer</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
