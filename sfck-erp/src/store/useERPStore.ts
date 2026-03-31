import { create } from 'zustand';
import { format } from 'date-fns';
import type { 
  Employee, AttendanceRecord, ProductionRecord, StockRecord, 
  WageRecord, WorkAssignment, EstateId, Block, TreeMovement 
} from '../types';
import { generateAllData } from '../data/generateData';

interface ERPState {
  employees: Employee[];
  attendance: AttendanceRecord[];
  production: ProductionRecord[];
  stock: StockRecord[];
  wages: WageRecord[];
  assignments: WorkAssignment[];
  blocks: Block[];
  treeMovements: TreeMovement[];
  selectedEstate: EstateId | null;
  selectedCC: number | 'all';
  selectedMonth: string;
  selectedDate: string;
  initData: () => void;
  setSelectedEstate: (e: EstateId | null) => void;
  setSelectedCC: (cc: number | 'all') => void;
  setSelectedMonth: (m: string) => void;
  setSelectedDate: (d: string) => void;
  updateAttendance: (date: string, empId: number, updates: Partial<AttendanceRecord>) => void;
  addBlock: (block: Omit<Block, 'id'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  addTreeMovement: (movement: TreeMovement) => void;
}

export const useERPStore = create<ERPState>((set) => ({
  employees: [],
  attendance: [],
  production: [],
  stock: [],
  wages: [],
  assignments: [],
  blocks: [],
  treeMovements: [],
  selectedEstate: null,
  selectedCC: 'all',
  selectedMonth: format(new Date(), 'yyyy-MM'),
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  
  initData: () => {
    const data = generateAllData();
    set({ ...data });
  },
  setSelectedEstate: (selectedEstate) => set({ selectedEstate, selectedCC: 'all' }),
  setSelectedCC: (selectedCC) => set({ selectedCC }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  updateAttendance: (date, empId, updates) => set((state) => ({
    attendance: state.attendance.map((rec) => 
      (rec.date === date && rec.empId === empId) 
        ? { ...rec, ...updates } 
        : rec
    )
  })),
  addBlock: (block) => set((state) => ({
    blocks: [{ ...block, id: `BLK-${Date.now()}` }, ...state.blocks]
  })),
  updateBlock: (id, updates) => set((state) => ({
    blocks: state.blocks.map((b) => b.id === id ? { ...b, ...updates } : b)
  })),
  addTreeMovement: (movement) => set((state) => ({
    treeMovements: [movement, ...state.treeMovements],
    // Also update the block's currentTreeCount if needed
    blocks: state.blocks.map((b) => 
      b.id === movement.blockId 
        ? { ...b, currentTreeCount: movement.closingCount } 
        : b
    )
  }))
}));
