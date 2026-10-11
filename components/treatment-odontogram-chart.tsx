'use client';

import React, { memo } from 'react';
import { ToothStatus } from '@/lib/types';

export interface TreatmentOdontogramChartProps {
  chartNotation: Record<number, ToothStatus>;
  selectedTooth: number | null;
  onSelectTooth: (toothNumber: number) => void;
  archType: 'permanent' | 'primary';
  onToggleArchType: (type: 'permanent' | 'primary') => void;
  onWholeMouthSelect?: () => void;
  onAddQuickCleaning?: () => void;
  onAddQuickFirstVisit?: () => void;
}

// FDI Notation for Arches
const PERMANENT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const PERMANENT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const PERMANENT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const PERMANENT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const PRIMARY_UPPER_RIGHT = [55, 54, 53, 52, 51];
const PRIMARY_UPPER_LEFT = [61, 62, 63, 64, 65];
const PRIMARY_LOWER_RIGHT = [85, 84, 83, 82, 81];
const PRIMARY_LOWER_LEFT = [71, 72, 73, 74, 75];

type ToothAnatomyModel = 'molar' | 'premolar' | 'canine' | 'lateral' | 'central';

function getToothModel(toothNum: number): ToothAnatomyModel {
  const digit = toothNum % 10;
  if (digit === 1) return 'central';
  if (digit === 2) return 'lateral';
  if (digit === 3) return 'canine';
  if (digit === 4 || digit === 5) {
    // In primary dentition, 4 and 5 are primary molars
    if (toothNum >= 51 && toothNum <= 85) {
      return digit === 5 ? 'molar' : 'premolar';
    }
    return 'premolar';
  }
  return 'molar'; // 6, 7, 8
}

function getToothQuadrant(toothNum: number): { isUpper: boolean; isLeft: boolean } {
  const tens = Math.floor(toothNum / 10);
  const isUpper = tens === 1 || tens === 2 || tens === 5 || tens === 6;
  const isLeft = tens === 2 || tens === 3 || tens === 6 || tens === 7;
  return { isUpper, isLeft };
}

function getToothDescription(num: number, status?: ToothStatus): string {
  const statusLabel = status && status !== 'healthy' ? ` • ${status.toUpperCase()}` : '';
  const quad = Math.floor(num / 10);
  const digit = num % 10;
  const names: Record<number, string> = {
    1: 'Central Incisor',
    2: 'Lateral Incisor',
    3: 'Canine',
    4: '1st Premolar',
    5: '2nd Premolar',
    6: '1st Molar',
    7: '2nd Molar',
    8: '3rd Molar (Wisdom)',
  };
  const quadNames: Record<number, string> = {
    1: 'UR',
    2: 'UL',
    3: 'LL',
    4: 'LR',
    5: 'Primary UR',
    6: 'Primary UL',
    7: 'Primary LL',
    8: 'Primary LR',
  };
  return `Tooth #${num} (${quadNames[quad] || ''} ${names[digit] || ''})${statusLabel}`;
}

/**
 * Exact Lateral View SVG Paths extracted directly from DentalPin DOM - Compact Precision Scale
 */
const DentalPinLateralSvg = memo(function DentalPinLateralSvg({
  model,
  status,
  isUpper,
  isLeft,
}: {
  model: ToothAnatomyModel;
  status?: ToothStatus;
  isUpper: boolean;
  isLeft: boolean;
}) {
  // Compute exact CSS transform to mirror quadrants accurately
  const transform = `${isLeft ? 'scaleX(-1) ' : ''}${!isUpper ? 'scaleY(-1)' : ''}`.trim() || 'none';

  const strokeColor = status && status !== 'healthy' ? '#475569' : '#64748B';
  const crownFill =
    status === 'caries'
      ? '#FEF3C7'
      : status === 'filled'
      ? '#E0F2FE'
      : status === 'crown'
      ? '#FEF9C3'
      : status === 'rct'
      ? '#F3E8FF'
      : status === 'missing'
      ? '#FFF1F2'
      : '#FFFFFF';

  if (model === 'molar') {
    return (
      <svg
        width="24"
        height="48"
        viewBox="0 0 66 124"
        className="lateral-view shrink-0"
        style={{ transform, transformOrigin: 'center center' }}
      >
        <g className="roots" opacity="1">
          <path
            d="M23.1237 1.08372C17.9564 4.38375 17.6582 22.6256 18.1551 31.334C20.6394 39.2507 26.8998 54.484 32.0671 52.084C37.2344 49.684 39.1058 39.9172 39.3957 35.3338C34.1787 29.3338 30.2039 17.7089 30.2039 15.3339C30.2039 12.9588 28.2164 -0.166297 23.1237 1.08372Z"
            className="tooth-root"
            fill="#F8FAFC"
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.79 62.9522C11.6845 68.8711 7 78.5 7.31157 78.7704C27.6459 73.526 38.316 73.7571 56.0109 80C58.3299 72.0579 59.4894 47.6533 54.5201 30.8499C48.5135 10.5393 40.5231 6.64772 37.9971 7.02392C34.767 9.65731 40.7302 23.326 39.7363 31.9786C39.2337 36.3543 34.1459 54.2997 31.1643 51.6663C22.468 45.0201 18.6789 33.6715 17.3744 30.8499C16.2812 28.4853 15.3867 18.31 15.014 15.6766C14.6413 13.0432 12.9641 8.27783 10.79 8.65412C8.61602 9.0304 5.86595 15.8311 4.45422 22.3228C3.33612 27.4642 4.45422 40.0042 5.94496 47.6535C7.37238 54.9779 9.79624 56.3761 10.79 62.9522Z"
            className="tooth-root"
            fill="#F8FAFC"
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g className="crown">
          <path
            d="M57.655 80.8343C57.2557 80.5265 56.8413 80.2327 56.4129 79.9525C44.8747 72.4037 23.1621 74.6455 11.3233 76.9591C10.1919 77.2013 8.70714 77.8501 7.72107 78.7268C7.41105 79.0024 7.15033 79.3005 6.96539 79.6156C-7.5536 104.353 8.35603 122.835 13.4349 122.835C18.6519 122.835 21.1362 113.835 28.589 112.835C36.0418 111.834 46.4758 124.585 52.6865 122.835C57.5011 121.478 63.8657 109.459 64.8594 104.709C65.8531 99.9594 61.3815 83.8342 57.655 80.8343Z"
            className="tooth-crown"
            fill={crownFill}
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M37.2839 74.5841C36.8698 73.8758 36.2902 72.1841 37.2839 71.0841C38.526 69.7091 46.9105 56.2089 48.5253 44.4588C51.1959 32.146 44.1778 14.3333 40.1408 10.7085C38.7124 12.271 46.9726 27.3962 45.1094 39.2088C43.9915 47.9589 39.8924 61.5835 31.3216 68.0838C25.7321 65.2713 18.3413 47.9586 14.4286 32.146C11.5574 23.0066 11.3488 14.4022 11.0748 14.3333C10.3295 14.1458 9.28612 26.6834 11.0748 35.5835C13.3106 46.7086 17.7823 56.8962 23.9309 68.0838C24.9246 72.7839 24.3657 73.7714 24.3657 75.0839"
            className="tooth-pulp"
            fill="none"
            stroke={status === 'rct' ? '#9333EA' : '#CBD5E1'}
            strokeWidth={status === 'rct' ? '1.8' : '0.6'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  if (model === 'premolar') {
    return (
      <svg
        width="22"
        height="48"
        viewBox="0 0 64 128"
        className="lateral-view shrink-0"
        style={{ transform, transformOrigin: 'center center' }}
      >
        <g className="roots" opacity="1">
          <path
            d="M31.6876 1C25.1117 1 26.9905 28.8602 19.7883 35.2319C21.1244 45.8096 28.5513 59.3963 32.3139 60.4685C35.8211 61.468 44.0879 37.2308 45.7162 28.8602C41.0818 22.7385 37.1989 1 31.6876 1Z"
            className="tooth-root"
            fill="#F8FAFC"
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M54.537 84.9802C54.537 83.5 52.5329 73.4613 54.537 64.8658C57.0421 54.1215 59.2967 40.8785 59.2967 31.3836C59.2967 22.4209 58.7387 10.8979 52.1445 5.22081C51.5917 4.74482 50.7688 5.08408 50.6455 5.80208C48.2891 19.5153 42.5034 48.131 33.2436 59.8685C30.5486 63.2845 16.6396 32.362 13.0019 10.5877C12.8671 9.78116 11.9139 9.48249 11.4381 10.1484C8.49442 14.2692 4.6997 23.8642 6.43885 39.1295C8.94396 61.1178 9.94601 59.2438 9.94601 68.364C9.94601 72.1459 8.4267 80.7768 7.6531 85.1369"
            className="tooth-root"
            fill="#F8FAFC"
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g className="crown">
          <path
            d="M52.5724 83.8192C38.6457 77.1735 21.2542 79.2177 11.7848 82.6763C9.77918 83.4088 8.23738 84.9707 7.35306 86.9098C5.1137 91.8204 1 101.871 1 109.443C1 114.19 5.86637 124.628 14.0266 126.184C20.4417 127.407 24.7345 122.822 31.8129 122.686C39.6605 122.535 44.3969 129.286 51.6033 126.184C58.803 123.084 64.5464 115.023 62.6258 109.443C60.8828 104.378 59.6213 92.6599 54.5345 85.8667C54.0084 85.1642 53.3957 84.2121 52.5724 83.8192Z"
            className="tooth-crown"
            fill={crownFill}
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M37.1988 80.0831C37.6999 79.4584 46.3425 64.8414 48.7223 53.9721C51.1022 43.1029 55.3609 29.61 51.7285 16.6169C48.0961 3.62377 56.9892 42.1033 32.0634 74.836C28.5169 74.836 11.3588 40.418 11.9479 21.9296C11.9552 21.7004 11.6501 21.6422 11.583 21.8616C6.57857 38.2285 23.1191 71.6539 24.6733 74.8358C25.8632 77.2722 25.5083 79.75 25.4248 80.0831"
            className="tooth-pulp"
            fill="none"
            stroke={status === 'rct' ? '#9333EA' : '#CBD5E1'}
            strokeWidth={status === 'rct' ? '1.8' : '0.6'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  if (model === 'canine') {
    return (
      <svg
        width="16"
        height="48"
        viewBox="0 0 47 146"
        className="lateral-view shrink-0"
        style={{ transform, transformOrigin: 'center center' }}
      >
        <g className="roots" opacity="1">
          <path
            d="M9.09261 76.4153C8.17217 80.9327 7.17502 95.9485 6.7915 102.892C6.7915 102.892 16.3143 107.776 22.907 107.886C29.8761 108.003 40.0297 102.892 40.0297 102.892C38.1121 97.8724 34.7883 71.2707 35.4275 67.1299C36.0667 62.989 34.4048 42.9121 33.5099 38.3948C32.6151 33.8775 30.3139 20.5764 29.9304 15.0552C29.5469 9.53405 25.9674 0.875868 22.3879 1.00135C18.8084 1.12683 19.0641 4.01289 18.1692 5.51866C17.2743 7.02443 17.1465 16.561 16.763 20.5764C16.3795 24.5917 16.3795 25.5956 14.5897 29.36C12.8 33.1244 11.7772 43.7903 11.7772 47.0528C11.7772 50.3153 10.2432 70.7687 9.09261 76.4153Z"
            className="tooth-root"
            fill="#F8FAFC"
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g className="crown">
          <path
            d="M44.5622 115.129C42.5478 107.137 40.7902 95.6772 22.907 95.8989C3.61725 96.1381 1 114.898 1 129.988C1 136.106 7.90619 141.245 12.8348 143.598C17.3509 145.755 30.8565 145.156 34.2382 143.598C37.7635 141.975 41.3094 141.201 44.5622 135.108C46.8285 130.862 46.0953 121.211 44.5622 115.129Z"
            className="tooth-crown"
            fill={crownFill}
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.3901 108.569C20.4638 72.4818 22.0439 6.61914 22.4697 6.61914C26.6797 6.61914 26.8139 49.0405 26.9928 84.7355C27.0356 93.2851 27.8031 101.605 28.0152 108.731C28.0857 111.1 26.141 113.006 23.7516 113.006C21.2913 113.006 19.3176 111.008 19.3901 108.569Z"
            className="tooth-pulp"
            fill="none"
            stroke={status === 'rct' ? '#9333EA' : '#CBD5E1'}
            strokeWidth={status === 'rct' ? '1.8' : '0.6'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  if (model === 'lateral') {
    return (
      <svg
        width="15"
        height="48"
        viewBox="0 0 40 125"
        className="lateral-view shrink-0"
        style={{ transform, transformOrigin: 'center center' }}
      >
        <g className="roots" opacity="1">
          <path
            d="M12.487 53.0815C10.4083 62.2149 9.40701 74.1863 8.61621 83.112C16.2849 89.5132 36.3357 86.7405 36.3357 86.7405C36.3357 86.7405 34.7467 75.1037 35.0871 71.475C37.6081 44.5978 35.3738 25.049 34.213 18.4214C32.6315 12.4571 28.4694 0.328393 22.476 1.0291C14.9842 1.90499 18.3555 19.2973 17.7312 26.8049C17.0027 35.5656 14.1102 45.9493 12.487 53.0815Z"
            className="tooth-root"
            fill="#F8FAFC"
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <g className="crown">
          <path
            d="M36.0861 86.4908C33.7138 80.3598 11.2384 78.6075 6.61846 84.8639C0.82482 92.7098 0.250476 113.268 1.62396 116.146C2.99745 119.024 8.866 122.152 18.6053 123.653C28.3446 125.155 35.7115 121.526 37.959 117.647C40.2066 113.768 38.4585 92.6219 36.0861 86.4908Z"
            className="tooth-crown"
            fill={crownFill}
            stroke={strokeColor}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23.8494 41.5699C24.8167 21.6581 21.6019 4.15698 23.8495 4.15698C28.1612 4.15698 29.9677 35.6889 27.7202 60.2138C26.8687 78.8752 25.6047 94.7422 20.9135 92.2458C17.2318 87.6165 22.6392 66.4831 23.8494 41.5699Z"
            className="tooth-pulp"
            fill="none"
            stroke={status === 'rct' ? '#9333EA' : '#CBD5E1'}
            strokeWidth={status === 'rct' ? '1.8' : '0.6'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  // Central Incisor
  return (
    <svg
      width="16"
      height="48"
      viewBox="0 0 46 134"
      className="lateral-view shrink-0"
      style={{ transform, transformOrigin: 'center center' }}
    >
      <g className="roots" opacity="1">
        <path
          d="M18.1375 13.8391C16.1403 42.3702 9.64956 79.4307 6.65381 94.3946C18.9498 99.8859 26.179 100.443 39.8567 95.5168C40.4808 78.9319 40.0564 39.577 33.3659 14.8367C26.953 -8.87723 18.913 2.76033 18.1375 13.8391Z"
          className="tooth-root"
          fill="#F8FAFC"
          stroke={strokeColor}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g className="crown">
        <path
          d="M39.2326 94.6438C33.1163 85.5409 14.1409 86.0457 6.65385 94.6438C-0.669089 102.084 0.287887 121.08 3.03399 127.814C15.6411 135.545 38.1091 133.675 43.8511 128.437C46.722 121.828 43.8511 103.747 39.2326 94.6438Z"
          className="tooth-crown"
          fill={crownFill}
          stroke={strokeColor}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24.6596 4.92303C30.269 4.6849 31.2334 104.288 22.1317 95.1425C19.5389 92.7118 23.1687 67.5969 24.3785 42.7689C25.3455 22.9252 23.5958 4.9682 24.6596 4.92303Z"
          className="tooth-pulp"
          fill="none"
          stroke={status === 'rct' ? '#9333EA' : '#CBD5E1'}
          strokeWidth={status === 'rct' ? '1.8' : '0.6'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
});

/**
 * Exact Occlusal View 50x50 SVG extracted directly from DentalPin DOM - Compact Precision Scale
 */
const DentalPinOcclusalSvg = memo(function DentalPinOcclusalSvg({
  model,
  status,
  isUpper,
  isLeft,
}: {
  model: ToothAnatomyModel;
  status?: ToothStatus;
  isUpper: boolean;
  isLeft: boolean;
}) {
  const transform = `${isLeft ? 'scaleX(-1) ' : ''}${!isUpper ? 'scaleY(-1)' : ''}`.trim() || 'none';
  const strokeColor = status && status !== 'healthy' ? '#475569' : '#64748B';

  const occlusalFill =
    status === 'caries'
      ? '#FEF3C7'
      : status === 'filled'
      ? '#E0F2FE'
      : status === 'crown'
      ? '#FEF9C3'
      : '#FFFFFF';

  if (model === 'molar' || model === 'premolar') {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 50 50"
        className="occlusal-view shrink-0"
        style={{ transform, transformOrigin: 'center center' }}
      >
        <path
          d="M 14,10 C 18,6 22,7 25,8 C 28,7 32,6 36,10 C 42,14 43,18 42,22 C 43,25 43,28 42,31 C 43,35 42,39 36,42 C 32,45 28,44 25,43 C 22,44 18,45 14,42 C 8,39 7,35 8,31 C 7,28 7,25 8,22 C 7,18 8,14 14,10 Z"
          className="tooth-occlusal"
          fill={occlusalFill}
          stroke={strokeColor}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g pointerEvents="none">
          <path d="M 25,20 L 25,30" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 20,25 L 30,25" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 19,19 L 6,6" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 31,19 L 44,6" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 19,31 L 6,44" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 31,31 L 44,44" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 31,19 L 19,19 L 19,31 L 31,31 Z" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    );
  }

  if (model === 'canine') {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 50 50"
        className="occlusal-view shrink-0"
        style={{ transform, transformOrigin: 'center center' }}
      >
        <path
          d="M 25,5 Q 38,12 42,25 Q 38,37 28,43 Q 25,45 22,43 Q 12,37 8,25 Q 12,12 25,5 Z"
          className="tooth-occlusal"
          fill={occlusalFill}
          stroke={strokeColor}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g pointerEvents="none">
          <path d="M 25,12 L 25,26" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 20,22 L 7,5" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 30,22 L 43,5" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 20,28 L 7,45" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 30,28 L 43,45" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M 30,22 L 20,22 L 20,28 L 30,28 Z" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    );
  }

  // Incisors (Central & Lateral)
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 50 50"
      className="occlusal-view shrink-0"
      style={{ transform, transformOrigin: 'center center' }}
    >
      <path
        d="M 7,17 C 7,12 12,10 18,10 L 32,10 C 38,10 43,12 43,17 L 44,33 C 44,38 39,40 34,40 L 16,40 C 11,40 6,38 6,33 Z"
        className="tooth-occlusal"
        fill={occlusalFill}
        stroke={strokeColor}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g pointerEvents="none">
        <path d="M 14,33 Q 25,36 36,33" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        <path d="M 19,21 L 6,6" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        <path d="M 31,21 L 44,6" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        <path d="M 19,29 L 6,44" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        <path d="M 31,29 L 44,44" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        <path d="M 31,21 L 19,21 L 19,29 L 31,29 Z" stroke="#CBD5E1" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
});

/**
 * Dual-View Tooth Cell (Exact match to DentalPin .tooth-cell-dual) - Compact Scale
 */
const DualViewToothCell = memo(function DualViewToothCell({
  num,
  status,
  isSelected,
  onClick,
}: {
  num: number;
  status?: ToothStatus;
  isSelected: boolean;
  onClick: () => void;
}) {
  const model = getToothModel(num);
  const { isUpper, isLeft } = getToothQuadrant(num);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-between p-1 rounded-xl transition-all select-none min-w-[28px] sm:min-w-[32px] ${
        isSelected
          ? 'bg-blue-50 ring-2 ring-blue-600 shadow-sm'
          : 'hover:bg-slate-100/70'
      }`}
      title={getToothDescription(num, status)}
    >
      {/* Upper Arch layout: Lateral view on top, Occlusal in middle, Number on bottom */}
      {isUpper ? (
        <div className="flex flex-col items-center gap-0.5">
          <div className="lateral-view-container upper h-[50px] flex items-end justify-center">
            <DentalPinLateralSvg model={model} status={status} isUpper={true} isLeft={isLeft} />
          </div>

          <div className="occlusal-view-container w-[24px] h-[24px] flex items-center justify-center">
            <DentalPinOcclusalSvg model={model} status={status} isUpper={true} isLeft={isLeft} />
          </div>

          <span
            className={`tooth-number text-[10px] font-mono font-bold leading-none mt-0.5 px-1 py-0.5 rounded transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white shadow-2xs'
                : status && status !== 'healthy'
                ? 'bg-slate-800 text-white font-extrabold'
                : 'text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-200/60'
            }`}
          >
            {num}
          </span>
        </div>
      ) : (
        /* Lower Arch layout: Number on top, Occlusal in middle, Lateral view on bottom */
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={`tooth-number text-[10px] font-mono font-bold leading-none mb-0.5 px-1 py-0.5 rounded transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white shadow-2xs'
                : status && status !== 'healthy'
                ? 'bg-slate-800 text-white font-extrabold'
                : 'text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-200/60'
            }`}
          >
            {num}
          </span>

          <div className="occlusal-view-container w-[24px] h-[24px] flex items-center justify-center">
            <DentalPinOcclusalSvg model={model} status={status} isUpper={false} isLeft={isLeft} />
          </div>

          <div className="lateral-view-container lower h-[50px] flex items-start justify-center">
            <DentalPinLateralSvg model={model} status={status} isUpper={false} isLeft={isLeft} />
          </div>
        </div>
      )}
    </button>
  );
});

export function TreatmentOdontogramChart({
  chartNotation,
  selectedTooth,
  onSelectTooth,
  archType,
  onToggleArchType,
  onWholeMouthSelect,
  onAddQuickCleaning,
  onAddQuickFirstVisit,
}: TreatmentOdontogramChartProps) {
  const isPermanent = archType === 'permanent';

  const upperRight = isPermanent ? PERMANENT_UPPER_RIGHT : PRIMARY_UPPER_RIGHT;
  const upperLeft = isPermanent ? PERMANENT_UPPER_LEFT : PRIMARY_UPPER_LEFT;
  const lowerRight = isPermanent ? PERMANENT_LOWER_RIGHT : PRIMARY_LOWER_RIGHT;
  const lowerLeft = isPermanent ? PERMANENT_LOWER_LEFT : PRIMARY_LOWER_LEFT;

  return (
    <div className="flex flex-col gap-4">
      {/* SVG Pattern Definitions from DentalPin */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <pattern id="pattern-planned" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#EF4444" strokeWidth="2" />
          </pattern>
          <pattern id="pattern-planned-amber" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#F59E0B" strokeWidth="2" />
          </pattern>
          <pattern id="pattern-planned-blue" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#3B82F6" strokeWidth="2" />
          </pattern>
          <pattern id="pattern-planned-green" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#22C55E" strokeWidth="2" />
          </pattern>
          <pattern id="pattern-crown" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#F59E0B" strokeWidth="1.5" />
          </pattern>
          <pattern id="pattern-inlay" patternUnits="userSpaceOnUse" width="4" height="4">
            <circle cx="2" cy="2" r="1" fill="#3B82F6" />
          </pattern>
        </defs>
      </svg>

      {/* Main Odontogram Card (Matching DentalPin .odontogram-grid) */}
      <div className="odontogram-wrapper bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 sm:p-5">
        {/* Top Header of Odontogram Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h4v4H4z M16 4h4v4h-4z M4 16h4v4H4z M16 16h4v4h-4z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Dental Chart</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  Planning
                </span>
              </div>
              <p className="text-xs text-slate-500">
                FDI World Dental Federation dual-view chart (Roots, Crown, and Occlusal facets)
              </p>
            </div>
          </div>

          {/* Arch Type Toggle: Permanent / Primary */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onToggleArchType('permanent')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isPermanent ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Permanent
            </button>
            <button
              type="button"
              onClick={() => onToggleArchType('primary')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                !isPermanent ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Primary
            </button>
          </div>
        </div>

        {/* 1. UPPER ARCH */}
        <div className="arch-container mb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-1.5">
            Upper Arch
          </div>

          <div className="flex justify-center gap-0.5 sm:gap-1 overflow-x-auto pb-1">
            {/* Quadrant 1 (Upper Right) */}
            <div className="tooth-row flex items-center gap-0.5">
              {upperRight.map((num) => (
                <DualViewToothCell
                  key={num}
                  num={num}
                  status={chartNotation[num]}
                  isSelected={selectedTooth === num}
                  onClick={() => onSelectTooth(num)}
                />
              ))}
            </div>

            {/* Quadrant Central Divider */}
            <div className="w-px bg-slate-200 self-stretch my-0.5 mx-0.5 sm:mx-1 shrink-0" />

            {/* Quadrant 2 (Upper Left) */}
            <div className="tooth-row flex items-center gap-0.5">
              {upperLeft.map((num) => (
                <DualViewToothCell
                  key={num}
                  num={num}
                  status={chartNotation[num]}
                  isSelected={selectedTooth === num}
                  onClick={() => onSelectTooth(num)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2. BITE LINE DIVIDER (Horizontal Sunken Line) */}
        <div className="h-px bg-slate-200 my-2 sm:my-2.5" />

        {/* 3. LOWER ARCH */}
        <div className="arch-container">
          <div className="flex justify-center gap-0.5 sm:gap-1 overflow-x-auto pb-1">
            {/* Quadrant 4 (Lower Right) */}
            <div className="tooth-row flex items-center gap-0.5">
              {lowerRight.map((num) => (
                <DualViewToothCell
                  key={num}
                  num={num}
                  status={chartNotation[num]}
                  isSelected={selectedTooth === num}
                  onClick={() => onSelectTooth(num)}
                />
              ))}
            </div>

            {/* Quadrant Central Divider */}
            <div className="w-px bg-slate-200 self-stretch my-0.5 mx-0.5 sm:mx-1 shrink-0" />

            {/* Quadrant 3 (Lower Left) */}
            <div className="tooth-row flex items-center gap-0.5">
              {lowerLeft.map((num) => (
                <DualViewToothCell
                  key={num}
                  num={num}
                  status={chartNotation[num]}
                  isSelected={selectedTooth === num}
                  onClick={() => onSelectTooth(num)}
                />
              ))}
            </div>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mt-1.5">
            Lower Arch
          </div>
        </div>
      </div>

      {/* 4. WHOLE MOUTH GLOBAL STRIP (Exact match to DentalPin .global-strip) */}
      <div className="global-strip bg-white border border-slate-200/90 rounded-2xl p-2.5 px-4 shadow-2xs flex flex-wrap items-center gap-2.5">
        <span className="global-strip-label inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
          <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
          <span>Whole mouth</span>
        </span>

        {onWholeMouthSelect && (
          <button
            type="button"
            onClick={onWholeMouthSelect}
            className={`global-chip px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedTooth === null
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <span>All Teeth (Arch)</span>
          </button>
        )}

        {onAddQuickCleaning && (
          <button
            type="button"
            onClick={onAddQuickCleaning}
            className="global-chip global-chip-planned inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shadow-2xs active:scale-98"
          >
            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Dental Cleaning</span>
          </button>
        )}

        {onAddQuickFirstVisit && (
          <button
            type="button"
            onClick={onAddQuickFirstVisit}
            className="global-chip global-chip-planned inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shadow-2xs active:scale-98"
          >
            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            <span>First Visit</span>
          </button>
        )}
      </div>
    </div>
  );
}
