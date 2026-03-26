import { subDays, format, getDay } from 'date-fns';
import {
  ESTATES, COLLECTION_CENTERS, RUBBER_VARIETIES, DIVISIONS,
  DAILY_TARGET_KG,
  TAPPER_CLASSES, LCC_RATES, LCC_MINIMUM_KG
} from './constants';
import type {
  Employee, AttendanceRecord, ProductionRecord, StockRecord,
  WageRecord, WorkAssignment, EstateId, WorkerCategory, TapperClass
} from '../types';

// ─── Helpers ────────────────────────────────────────────────────────
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const FIRST_NAMES = ['Rajan', 'Suresh', 'Gopi', 'Balan', 'Vijayan', 'Mohan', 'Soman',
  'Pradeep', 'Anilkumar', 'Shyam', 'Babu', 'Santhosh', 'Rajesh', 'Vinod',
  'Manoj', 'Krishnan', 'Thomas', 'Jose', 'Xavier', 'Saji', 'Binoy', 'Anto',
  'Reji', 'Shibu', 'Lijo', 'Dijo', 'Tijo', 'Sijo', 'Bijo', 'Joji'];
const LAST_NAMES = ['Nair', 'Pillai', 'Menon', 'Das', 'Kumar', 'P.', 'K.', 'M.', 'R.', 'T.'];

// ─── Employees ──────────────────────────────────────────────────────
const generateEmployees = (): Employee[] => {
  const employees: Employee[] = [];
  ESTATES.forEach(estate => {
    const [startId, endId] = estate.idRange;
    const estateCCs = COLLECTION_CENTERS.filter(cc => cc.estateId === estate.id);

    for (let id = startId; id <= endId; id++) {
      const rand = Math.random();
      let designation: Employee['designation'] = 'Tapper';
      let category: WorkerCategory = 'permanent';

      if (rand > 0.97) designation = 'Supervisor';
      else if (rand > 0.93) designation = 'Field Supervisor';
      else if (rand > 0.90) designation = 'Tapping Supervisor';
      else if (rand > 0.78) designation = 'General Worker';

      // Worker category
      if (designation === 'Tapper') {
        const catRand = Math.random();
        if (catRand > 0.92) category = 'reserved';
        else if (catRand > 0.85) category = 'casual';
        else if (catRand > 0.80) category = 'dependent';
      }

      const yearsExperience = randomInt(1, 25);
      const experienceWeightage = yearsExperience <= 5 ? 'A' : yearsExperience <= 10 ? 'B' : 'C';

      const year = randomInt(2010, 2022);
      const month = String(randomInt(1, 12)).padStart(2, '0');
      const day = String(randomInt(1, 28)).padStart(2, '0');

      const cc = randomChoice(estateCCs);
      const tapperClass = designation === 'Tapper' ? randomChoice([1, 2, 3]) as TapperClass : undefined;

      // Permanent tappers get fixed blocks
      const assignedBlocks = (designation === 'Tapper' && category === 'permanent')
        ? Array.from({ length: randomInt(2, 4) }, () => randomInt(1, 64))
        : undefined;

      const staffCode = `${estate.code}-${String(id - startId + 1).padStart(3, '0')}`;

      employees.push({
        id,
        staffCode,
        cardNumber: category !== 'permanent' ? `T${randomInt(1000, 9999)}` : undefined,
        name: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
        estate: estate.id as EstateId,
        designation,
        category,
        tapperClass,
        assignedBlocks,
        ccId: cc.id,
        joiningDate: `${year}-${month}-${day}`,
        yearsExperience,
        experienceWeightage: experienceWeightage as 'A' | 'B' | 'C',
        advance: randomChoice([0, 0, 0, 500, 1000, 2000, 5000])
      });
    }
  });
  return employees;
};

// ─── Attendance ─────────────────────────────────────────────────────
const generateAttendance = (employees: Employee[], dates: Date[]): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  employees.forEach(emp => {
    dates.forEach(date => {
      if (getDay(date) === 0) return;

      const rand = Math.random();
      let status: 'present' | 'absent' | 'late' = 'present';
      if (rand > 0.9) status = 'absent';
      else if (rand > 0.85) status = 'late';

      const isTapper = emp.designation === 'Tapper' || emp.designation === 'Tapping Supervisor';
      const baseTime = isTapper ? '05:30' : '08:00';
      const checkInTime = status === 'late'
        ? (isTapper ? `06:${randomInt(16, 45)}` : `08:${randomInt(31, 59)}`)
        : baseTime;

      records.push({
        date: format(date, 'yyyy-MM-dd'),
        empId: emp.id,
        estate: emp.estate,
        ccId: emp.ccId,
        status,
        checkInTime,
        isApproved: status === 'late' ? undefined : undefined,
      });
    });
  });
  return records;
};

// ─── Production ─────────────────────────────────────────────────────
const generateProduction = (
  employees: Employee[],
  attendance: AttendanceRecord[]
): ProductionRecord[] => {
  const records: ProductionRecord[] = [];
  const tappers = employees.filter(e => e.designation === 'Tapper');

  tappers.forEach(tapper => {
    const tapperAtt = attendance.filter(a => a.empId === tapper.id && a.status !== 'absent');
    const estateCCs = COLLECTION_CENTERS.filter(cc => cc.estateId === tapper.estate);
    const estateDivisions = DIVISIONS.filter(d => d.estateId === tapper.estate);

    tapperAtt.forEach(att => {
      const cc = tapper.ccId ? estateCCs.find(c => c.id === tapper.ccId) || randomChoice(estateCCs) : randomChoice(estateCCs);
      const division = estateDivisions.length > 0 ? randomChoice(estateDivisions) : undefined;

      const latexWeight = randomFloat(15, 35);
      const metrolacDrc = randomFloat(30, 38);
      const drcPercent = randomFloat(32, 36);
      const drcKg = latexWeight * (drcPercent / 100);
      const scrapsKg = randomFloat(2, 5);
      const scrapDryKg = scrapsKg * 0.5;
      const totalDryKg = drcKg + scrapDryKg;

      const incentiveKg = Math.max(0, drcKg - DAILY_TARGET_KG);
      const tapperClassInfo = TAPPER_CLASSES.find(tc => tc.class === tapper.tapperClass);
      const incentiveRate = tapperClassInfo?.incentiveRate || 2;
      const incentiveAmount = Math.round(incentiveKg * incentiveRate);

      // LCC Charge
      let lccCharge = 0;
      if (latexWeight >= LCC_MINIMUM_KG) {
        const lccRate = LCC_RATES.find(r => latexWeight >= r.minKg && latexWeight <= r.maxKg);
        lccCharge = lccRate ? lccRate.rate : 0;
      }

      const blockNo = tapper.assignedBlocks && tapper.assignedBlocks.length > 0
        ? randomChoice(tapper.assignedBlocks)
        : randomInt(1, 64);

      records.push({
        id: `P-${att.date}-${tapper.id}`,
        date: att.date,
        empId: tapper.id,
        estate: tapper.estate,
        ccId: cc.id,
        divisionId: division?.id,
        workItemId: `${blockNo}`,
        variety: randomChoice(RUBBER_VARIETIES),
        plantYear: randomInt(2010, 2020),
        rollNo: tapper.staffCode,
        latexWeight,
        metrolacDrc,
        drcPercent,
        drcKg,
        scrapsKg,
        scrapDryKg,
        totalDryKg,
        incentiveKg,
        incentiveAmount,
        lccCharge,
      });
    });
  });
  return records;
};

// ─── Stock ──────────────────────────────────────────────────────────
const generateStock = (production: ProductionRecord[], dates: Date[]): StockRecord[] => {
  const records: StockRecord[] = [];
  dates.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    ESTATES.forEach(estate => {
      const estateProd = production.filter(p => p.date === dateStr && p.estate === estate.id);
      const rawLatexKg = estateProd.reduce((s, p) => s + p.latexWeight, 0);
      const drcKg = estateProd.reduce((s, p) => s + p.drcKg, 0);
      const scrapsKg = estateProd.reduce((s, p) => s + p.scrapsKg, 0);
      if (rawLatexKg > 0) {
        records.push({
          id: `S-${dateStr}-${estate.id}`,
          date: dateStr,
          estate: estate.id as EstateId,
          rawLatexKg, drcKg, scrapsKg,
          chemicalsUsed: [
            { name: 'Ammonia', qty: Number(randomFloat(2, 5).toFixed(2)), unit: 'L' },
            { name: 'Formic Acid', qty: Number(randomFloat(1, 3).toFixed(2)), unit: 'L' }
          ]
        });
      }
    });
  });
  return records;
};

// ─── Wages ──────────────────────────────────────────────────────────
const generateWages = (
  employees: Employee[],
  attendance: AttendanceRecord[]
): WageRecord[] => {
  const records: WageRecord[] = [];
  const today = new Date();
  const currentMonth = format(today, 'yyyy-MM');
  const months = [currentMonth];

  months.forEach(month => {
    employees.forEach(emp => {
      const empAtt = attendance.filter(a => a.empId === emp.id && a.date.startsWith(month) && a.status !== 'absent');
      if (empAtt.length === 0) return;

      const grossWage = randomInt(18000, 25000);
      const epf = Math.round(grossWage * 0.12);
      const iwf = Math.round(grossWage * 0.0075);
      const lic = randomChoice([0, 150, 300, 500]);
      
      const allowances = randomInt(2000, 5000);
      const bonusEarnings = grossWage - allowances;
      
      const totalDeduction = epf + iwf + lic + randomInt(500, 1500);
      const netWage = grossWage - totalDeduction;

      records.push({
        id: `W-${month}-${emp.id}`,
        month, empId: emp.id, estate: emp.estate,
        daysPresent: empAtt.length,
        
        // Line 1
        basic: 429.43,
        oldDa: 151.39,
        newDa: 151.39,
        oldGw: randomInt(10, 20),
        newGw: randomInt(10, 20),
        oldTd4: randomInt(0, 5),
        oldTd2: randomInt(0, 5),
        newTd4: randomInt(0, 5),
        newTd2: randomInt(0, 5),
        oldSd: randomInt(0, 2),
        newSd: randomInt(0, 2),
        holiday: randomInt(0, 4),
        totalAttd: empAtt.length,

        // Line 2
        cls4: randomInt(10, 30),
        cls2: randomInt(5, 15),
        std4: 25,
        std2: 12,
        oldGwr: 429.43,
        newGwr: 429.43,
        cl4Rate: 15.5,
        cl2Rate: 12.5,
        scrapRate: 8.5,
        totalDrcKg: randomFloat(15, 35),
        pieceRateAmount: Math.round(grossWage * 0.7),
        latex4: randomFloat(10, 20),
        latex2: randomFloat(5, 10),
        scrap4: randomFloat(1, 3),
        scrap2: randomFloat(1, 2),
        ldrc: randomFloat(10, 25),
        sdrc: randomFloat(1, 5),

        // Line 3
        tdrc4: randomFloat(15, 30),
        ldrc2: randomFloat(5, 15),
        sdrc2: randomFloat(1, 3),
        tdrc2: randomFloat(6, 18),
        ldrc4Pct: 34.5,
        ldrc2Pct: 34.0,
        sdrc4Pct: 50.0,
        sdrc2Pct: 50.0,
        tov4: randomInt(0, 10),
        tov2: randomInt(0, 5),
        incentiveAmount: randomInt(500, 2000),
        gwPay: randomInt(0, 500),
        tpgPay: randomInt(0, 1000),
        hlPay: 581,
        sikPay: randomChoice([0, 1935, 5418]),
        cutInc: randomChoice([0, 22]),
        wAllo: 50,

        // Line 4
        ifa: randomInt(0, 50),
        lcc: randomInt(50, 150),
        sltr: 0,
        extraTree: 0,
        interimRelief: 0,
        grossWage,
        bonusEarnings,
        epf,
        lic,
        iwf,
        wageAdv: 0,
        pTax: 0,
        festAdv: randomChoice([0, 1200, 2500]),
        exRec: 0,

        // Line 5
        trwLoan: randomChoice([0, 1500, 3000]),
        trwSuerty: 0,
        hba: 0,
        medicalLoan: 0,
        medAdv: 0,
        penalty: randomChoice([0, 25, 50]),
        banana: randomChoice([0, 10, 20]),
        kseb: randomChoice([0, 150, 450]),
        achankovil: 0,
        gpais: 15,
        amAdv: 0,
        coconut: randomChoice([0, 180, 240]),
        stamp: 1,
        excessPaid: 0,

        totalDeduction,
        netWage,
      });
    });
  });
  return records;
};

// ─── Assignments ────────────────────────────────────────────────────
const generateAssignments = (employees: Employee[], dates: Date[]): WorkAssignment[] => {
  const records: WorkAssignment[] = [];
  dates.forEach(date => {
    if (getDay(date) === 0) return;
    const dateStr = format(date, 'yyyy-MM-dd');

    ESTATES.forEach(estate => {
      const estateTappers = employees.filter(e => e.estate === estate.id && e.designation === 'Tapper');
      const estateWorkers = employees.filter(e => e.estate === estate.id && e.designation === 'General Worker');
      const estateCCs = COLLECTION_CENTERS.filter(cc => cc.estateId === estate.id);

      for (let i = 1; i <= 5; i++) {
        const blockTappers: number[] = [];
        const numTappers = Math.min(randomInt(3, 8), estateTappers.length);
        for (let j = 0; j < numTappers; j++) {
          const tap = randomChoice(estateTappers);
          if (!blockTappers.includes(tap.id)) blockTappers.push(tap.id);
        }
        if (blockTappers.length > 0) {
          const cc = randomChoice(estateCCs);
          records.push({
            id: `A-${dateStr}-${estate.id}-${i}`,
            date: dateStr,
            estate: estate.id as EstateId,
            ccId: cc.id,
            workItemId: `B-${estate.id}-${i}`,
            workItemName: `Block ${i}`,
            type: 'tapping',
            assignedEmpIds: blockTappers
          });
        }
      }

      for (let i = 1; i <= 2; i++) {
        const assignedIds: number[] = [];
        const numWorkers = randomInt(2, Math.min(5, estateWorkers.length));
        for (let j = 0; j < numWorkers; j++) {
          const w = randomChoice(estateWorkers);
          if (!assignedIds.includes(w.id)) assignedIds.push(w.id);
        }
        if (assignedIds.length > 0) {
          records.push({
            id: `G-${dateStr}-${estate.id}-${i}`,
            date: dateStr,
            estate: estate.id as EstateId,
            workItemId: `GW-${estate.id}-${i}`,
            workItemName: randomChoice(['Field Cleaning', 'Fertilizing', 'Planting', 'Scrap Collection']),
            type: randomChoice(['field_cleaning', 'fertilizing', 'planting', 'scrap_collection'] as const),
            assignedEmpIds: assignedIds
          });
        }
      }
    });
  });
  return records;
};

// ─── Main ───────────────────────────────────────────────────────────
export const generateAllData = () => {
  const employees = generateEmployees();
  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => subDays(today, i));

  const attendance = generateAttendance(employees, dates);
  const production = generateProduction(employees, attendance);
  const stock = generateStock(production, dates);
  const wages = generateWages(employees, attendance);
  const assignments = generateAssignments(employees, dates);

  return { employees, attendance, production, stock, wages, assignments };
};
