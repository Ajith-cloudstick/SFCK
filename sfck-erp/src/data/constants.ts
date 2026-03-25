import type { EstateId, TapperClass } from '../types';

// ─── Estates ────────────────────────────────────────────────────────
export const ESTATES = [
  { id: 0 as EstateId, name: 'Cherumppittakavu', code: 'CHR', area: '420 ha', idRange: [3201, 3500] as [number, number] },
  { id: 1 as EstateId, name: 'Kumaramkudy',      code: 'KMD', area: '380 ha', idRange: [3501, 3800] as [number, number] },
  { id: 2 as EstateId, name: 'Mullumala',         code: 'MUL', area: '510 ha', idRange: [3801, 4100] as [number, number] },
  { id: 3 as EstateId, name: 'Thekedath',         code: 'THK', area: '460 ha', idRange: [4101, 4400] as [number, number] },
];

// ─── Collection Centers (12+ per estate) ────────────────────────────
export const COLLECTION_CENTERS = [
  // Estate 0: Cherumppittakavu
  ...Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `CC ${String(i + 1).padStart(2, '0')}`, estateId: 0 as EstateId })),
  // Estate 1: Kumaramkudy
  ...Array.from({ length: 12 }, (_, i) => ({ id: 100 + i + 1, name: `CC ${String(i + 1).padStart(2, '0')}`, estateId: 1 as EstateId })),
  // Estate 2: Mullumala
  ...Array.from({ length: 12 }, (_, i) => ({ id: 200 + i + 1, name: `CC ${String(i + 1).padStart(2, '0')}`, estateId: 2 as EstateId })),
  // Estate 3: Thekedath
  ...Array.from({ length: 12 }, (_, i) => ({ id: 300 + i + 1, name: `CC ${String(i + 1).padStart(2, '0')}`, estateId: 3 as EstateId })),
];

// ─── Divisions per Estate ───────────────────────────────────────────
export const DIVISIONS = [
  // Estate 0
  { id: 1, name: 'Division A', estateId: 0 as EstateId },
  { id: 2, name: 'Division B', estateId: 0 as EstateId },
  { id: 3, name: 'Division C', estateId: 0 as EstateId },
  // Estate 1
  { id: 11, name: 'Division A', estateId: 1 as EstateId },
  { id: 12, name: 'Division B', estateId: 1 as EstateId },
  { id: 13, name: 'Division C', estateId: 1 as EstateId },
  // Estate 2
  { id: 21, name: 'Division A', estateId: 2 as EstateId },
  { id: 22, name: 'Division B', estateId: 2 as EstateId },
  { id: 23, name: 'Division C', estateId: 2 as EstateId },
  // Estate 3
  { id: 31, name: 'Division A', estateId: 3 as EstateId },
  { id: 32, name: 'Division B', estateId: 3 as EstateId },
  { id: 33, name: 'Division C', estateId: 3 as EstateId },
];

// ─── Rubber Varieties ───────────────────────────────────────────────
export const RUBBER_VARIETIES = ['RRII 105', 'RRII 417', 'RRII 422', 'PB 217', 'GT 1'];

// ─── Blocks (64 per CC) ────────────────────────────────────────────
export const BLOCKS_PER_CC = 64;

// ─── Tapper Classes ─────────────────────────────────────────────────
export const TAPPER_CLASSES: { class: TapperClass; label: string; minKg: number; maxKg: number; drcRate: number; incentiveRate: number }[] = [
  { class: 1, label: 'Class 1 (High)', minKg: 300, maxKg: 9999, drcRate: 14, incentiveRate: 3.5 },
  { class: 2, label: 'Class 2 (Medium)', minKg: 150, maxKg: 299, drcRate: 12, incentiveRate: 2.5 },
  { class: 3, label: 'Class 3 (Basic)', minKg: 0, maxKg: 149, drcRate: 10, incentiveRate: 1.5 },
];

// ─── Wage Rates ─────────────────────────────────────────────────────
export const PIECE_RATE_PER_KG = 12;
export const DAILY_TARGET_KG = 4.50;
export const TAPPER_DAILY_WAGE = 520;
export const GENERAL_WORKER_DAILY_WAGE = 450;
export const SUPERVISOR_DAILY_WAGE = 600;

// ─── PF / ESI ───────────────────────────────────────────────────────
export const PF_RATE = 0.12;
export const ESI_RATE = 0.0075;
export const MAX_PF_WORKING_DAYS = 26;

// ─── Attendance Cutoffs ─────────────────────────────────────────────
export const TAPPER_ATTENDANCE_TIME = '05:30';
export const TAPPER_LATE_CUTOFF = '06:15';
export const GENERAL_WORKER_ATTENDANCE_TIME = '08:00';
export const GENERAL_WORKER_LATE_CUTOFF = '08:30';

// ─── LCC Rates (Latex Collection Charge - Chumattu Kooli) ──────────
export const LCC_RATES = [
  { minKg: 75, maxKg: 100, rate: 15 },
  { minKg: 100, maxKg: 125, rate: 20 },
  { minKg: 125, maxKg: 150, rate: 25 },
  { minKg: 150, maxKg: 9999, rate: 30 },
];
export const LCC_MINIMUM_KG = 75;

// ─── Experience Weightage ───────────────────────────────────────────
export const EXPERIENCE_WEIGHTAGE = [
  { label: 'A', minYears: 0, maxYears: 5, factor: 1.0 },
  { label: 'B', minYears: 5, maxYears: 10, factor: 1.1 },
  { label: 'C', minYears: 10, maxYears: 99, factor: 1.2 },
];

// ─── Leave Policy ───────────────────────────────────────────────────
export const MEDICAL_LEAVE_MAX_DAYS = 14;
export const MEDICAL_LEAVE_PAY_RATE = 2 / 3;
export const ANNUAL_LEAVE_EARN_RATE = 1 / 20; // 1 day per 20 working days
export const HOLIDAYS_PER_YEAR = 13;

// ─── Work Types ─────────────────────────────────────────────────────
export const WORK_TYPES = [
  { id: 'tapping', label: 'Tapping' },
  { id: 'latex_collection', label: 'Latex Collection' },
  { id: 'scrap_collection', label: 'Scrap Collection' },
  { id: 'field_cleaning', label: 'Field Cleaning' },
  { id: 'fertilizing', label: 'Fertilizing' },
  { id: 'planting', label: 'Planting' },
  { id: 'other', label: 'Other Estate Works' },
];

// ─── Management Hierarchy ───────────────────────────────────────────
export const HIERARCHY = [
  'Managing Director / Head Office',
  'General Manager',
  'Estate Manager',
  'Assistant Manager',
  'Field Supervisor',
  'Tapping Supervisor',
  'Workers'
];
