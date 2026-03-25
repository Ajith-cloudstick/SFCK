export type EstateId = 0 | 1 | 2 | 3;

// ─── Worker Categories ──────────────────────────────────────────────
export type WorkerCategory = 'permanent' | 'casual' | 'dependent' | 'reserved';
export type TapperClass = 1 | 2 | 3;
export type Designation = 'Tapper' | 'General Worker' | 'Supervisor' | 'Field Supervisor' | 'Tapping Supervisor' | 'Assistant Manager' | 'Estate Manager';

export type Employee = {
  id: number;
  staffCode: string;         // e.g. KY-001 (Estate code + number)
  cardNumber?: string;       // For temporary/casual workers
  name: string;
  nameML?: string;           // Malayalam name
  estate: EstateId;
  designation: Designation;
  category: WorkerCategory;
  tapperClass?: TapperClass; // Only for tappers
  assignedBlocks?: number[]; // Fixed block assignments for permanent tappers
  ccId?: number;             // Assigned collection center
  joiningDate: string;
  yearsExperience: number;
  experienceWeightage: 'A' | 'B' | 'C'; // A: 0-5yr, B: 5-10yr, C: 10+yr
  advance: number;
}

// ─── Attendance ─────────────────────────────────────────────────────
export type AttendanceRecord = {
  date: string;
  empId: number;
  estate: EstateId;
  ccId?: number;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;      // HH:mm
  isApproved?: boolean;      // For late arrivals — needs manager approval
  isDoubleDuty?: boolean;
}

// ─── Production ─────────────────────────────────────────────────────
export type ProductionRecord = {
  id: string;
  date: string;
  empId: number;
  estate: EstateId;
  ccId: number;
  divisionId?: number;
  workItemId: string;        // Block No
  variety: string;
  plantYear: number;
  rollNo: string;
  latexWeight: number;       // Wet Wt. (kg)
  metrolacDrc: number;       // Metrolac DRC reading
  drcPercent: number;
  drcKg: number;
  scrapsKg: number;
  scrapDryKg: number;
  totalDryKg: number;
  incentiveKg: number;
  incentiveAmount: number;
  lccCharge?: number;        // Latex Collection Charge (Chumattu Kooli)
}

// ─── Work Classification ────────────────────────────────────────────
export type WorkType = 'tapping' | 'latex_collection' | 'scrap_collection' | 'field_cleaning' | 'fertilizing' | 'planting' | 'other';

export type WorkAssignment = {
  id: string;
  date: string;
  estate: EstateId;
  ccId?: number;
  divisionId?: number;
  workItemId: string;
  workItemName: string;
  type: WorkType;
  assignedEmpIds: number[];
  isDoubleDuty?: boolean;
}

// ─── Stock ──────────────────────────────────────────────────────────
export type StockRecord = {
  id: string;
  date: string;
  estate: EstateId;
  rawLatexKg: number;
  drcKg: number;
  scrapsKg: number;
  chemicalsUsed: { name: string; qty: number; unit: string }[];
}

// ─── Wages ──────────────────────────────────────────────────────────
export type SalaryPeriod = {
  label: string;     // e.g. "Mar 21 – Apr 20"
  startDate: string;
  endDate: string;
  wageRateMonth1: string; // Rate period 1
  wageRateMonth2: string; // Rate period 2
}

export type WageRecord = {
  id: string;
  month: string;           // YYYY-MM
  empId: number;
  estate: EstateId;
  daysPresent: number;
  totalDrcKg: number;
  pieceRateAmount: number;
  incentiveAmount: number;
  grossWage: number;
  pfDeduction: number;
  esiDeduction: number;
  advanceDeduction: number;
  netWage: number;
  isExtraVoucher?: boolean; // Extra days beyond max → separate voucher, no PF/ESI
}

// ─── Leave ──────────────────────────────────────────────────────────
export type LeaveType = 'medical' | 'annual';

export type LeaveRecord = {
  id: string;
  empId: number;
  estate: EstateId;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  paidRate?: number;       // e.g. 0.67 for medical (2/3)
}

// ─── Monthly Target ─────────────────────────────────────────────────
export type MonthlyTarget = {
  estate: EstateId;
  month: string;           // YYYY-MM
  latexTarget: number;     // kg
  scrapTarget: number;     // kg
  totalTarget: number;     // Total = Latex + Scrap
}

// ─── Division ───────────────────────────────────────────────────────
export type Division = {
  id: number;
  name: string;
  estateId: EstateId;
  supervisorId?: number;
}
