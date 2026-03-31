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
  leaveStats?: {
    annualEarned: number;
    annualSick: number; // max 14 per year
    usedEarned: number;
    usedSick: number;
  };
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

  // Line 1: Basic Inputs
  basic: number;
  oldDa: number;
  newDa: number;
  oldGw: number;
  newGw: number;
  oldTd4: number;
  oldTd2: number;
  newTd4: number;
  newTd2: number;
  oldSd: number;
  newSd: number;
  holiday: number;
  totalAttd: number;

  // Line 2: Production/DRC
  cls4?: number;
  cls2?: number;
  std4?: number;
  std2?: number;
  oldGwr?: number;
  newGwr?: number;
  cl4Rate?: number;
  cl2Rate?: number;
  scrapRate?: number;
  totalDrcKg: number;
  pieceRateAmount: number;
  latex4?: number;
  latex2?: number;
  scrap4?: number;
  scrap2?: number;
  ldrc?: number;
  sdrc?: number;

  // Line 3: Incentives & Allowances
  tdrc4?: number;
  ldrc2?: number;
  sdrc2?: number;
  tdrc2?: number;
  ldrc4Pct?: number;
  ldrc2Pct?: number;
  sdrc4Pct?: number;
  sdrc2Pct?: number;
  tov4?: number;
  tov2?: number;
  incentiveAmount: number;
  gwPay?: number;
  tpgPay?: number;
  hlPay?: number;
  sikPay?: number;
  cutInc?: number;
  wAllo?: number;

  // Line 4: Statutory Deductions & Totals
  ifa?: number;
  lcc?: number;
  sltr?: number;
  extraTree?: number;
  interimRelief?: number;
  grossWage: number;
  bonusEarnings?: number;
  epf: number;
  lic: number;
  iwf: number;
  wageAdv?: number;
  pTax?: number;
  festAdv?: number;
  exRec?: number;

  // Line 5: External Deductions
  trwLoan: number;
  trwSuerty: number;
  hba: number;
  medicalLoan: number;
  medAdv: number;
  penalty: number;
  banana: number;
  kseb: number;
  achankovil: number;
  gpais: number;
  amAdv: number;
  coconut: number;
  stamp: number;
  excessPaid: number;

  totalDeduction: number;
  netWage: number;
  isExtraVoucher?: boolean;
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

// ─── Blocks & Plantation ──────────────────────────────────────────
export type BlockStatus = 'active' | 'replanting_due' | 'replanting_in_progress' | 'rested';

export interface Block {
  id: string;
  blockNo: number;
  estateId: EstateId;
  division: string;
  areaHa: number;
  variety: string;
  plantingDate: string;       // 'YYYY-MM-DD'
  replantingDate?: string;    // 'YYYY-MM-DD'
  replantingVariety?: string;
  openingTreeCount: number;
  currentTreeCount: number;
  tappingTreeCount: number;
  tappingSystem: string;      // e.g. 'S/2 D/2'
  status: BlockStatus;
  notes?: string;
}

export interface TreeMovement {
  id: string;
  blockId: string;
  year: number;
  openingCount: number;
  treesLost: number;
  lossReason: string;
  treesAdded: number;
  closingCount: number;
  remarks: string;
}
