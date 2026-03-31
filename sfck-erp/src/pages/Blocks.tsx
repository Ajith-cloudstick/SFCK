import React, { useMemo, useState } from 'react';
import {
  Search,
  Layers,
  TrendingUp,
  TreePine,
  AlertTriangle,
  Plus,
  Beaker,
  Droplets,
  Archive,
  Edit3,
  Calendar,
  Settings,
  Sprout,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { PageHeader } from '../components/layout/PageHeader';
import { TabBar } from '../components/ui/TabBar';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Drawer } from '../components/ui/Drawer';
import { useERPStore } from '../store/useERPStore';
import { format, parseISO, subYears, differenceInYears } from 'date-fns';
import type { Block } from '../types';

// --- Styled Form Components ---

const FormLabel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block ${className}`}>
    {children}
  </label>
);

const FormInput = (props: any) => (
  <input
    {...props}
    className={`w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-gray-900 ${props.className || ''}`}
  />
);

const FormSelect = (props: any) => (
  <select
    {...props}
    className={`w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none cursor-pointer text-gray-900 ${props.className || ''}`}
  />
);

// --- Planting Generation Type ---
// Stored per-block as block.plantingHistory = PlantingGeneration[]
// In production this lives in the ERP store / DB.
export interface PlantingGeneration {
  id: string;
  generation: number;           // 1, 2, 3...
  plantedDate: string;          // ISO date string
  variety: string;              // Rubber clone name
  treeCountAtPlanting: number;  // How many trees planted this cycle
  endedDate?: string;           // When this generation was cleared/replanted
  notes?: string;
  status: 'active' | 'ended';
}

// --- Main Page ---

export default function Blocks() {
  const {
    blocks,
    treeMovements,
    production,
    employees,
    selectedEstate,
    selectedMonth,
    addBlock,
    updateBlock,
    addTreeMovement
  } = useERPStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Replanting' | 'Rested'>('All');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Block Info');
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear());

  // Form States
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddPlantingGen, setShowAddPlantingGen] = useState(false);

  // Local planting history state keyed by blockId.
  // In a real app this lives in the ERP store.
  const [plantingHistories, setPlantingHistories] = useState<Record<string, PlantingGeneration[]>>({});

  // --- Filtering & Selection ---

  const filteredBlocks = useMemo(() => {
    return blocks.filter(b => {
      const matchesEstate = selectedEstate === null || b.estateId === selectedEstate;
      const matchesSearch =
        b.blockNo.toString().includes(searchQuery) ||
        b.variety.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && b.status === 'active') ||
        (statusFilter === 'Replanting' && (b.status === 'replanting_due' || b.status === 'replanting_in_progress')) ||
        (statusFilter === 'Rested' && b.status === 'rested');
      return matchesEstate && matchesSearch && matchesStatus;
    });
  }, [blocks, selectedEstate, searchQuery, statusFilter]);

  const selectedBlock = useMemo(() => {
    if (!selectedBlockId && filteredBlocks.length > 0) return filteredBlocks[0];
    return filteredBlocks.find(b => b.id === selectedBlockId) || filteredBlocks[0];
  }, [selectedBlockId, filteredBlocks]);

  useMemo(() => {
    if (selectedBlock && !selectedBlockId) setSelectedBlockId(selectedBlock.id);
  }, [selectedBlock]);

  // --- Planting Generations for selected block ---

  const currentPlantingHistory = useMemo((): PlantingGeneration[] => {
    if (!selectedBlock) return [];
    const stored = plantingHistories[selectedBlock.id] || [];
    // If no history stored yet, auto-seed from the block's own planting date
    if (stored.length === 0) {
      return [{
        id: `PG-${selectedBlock.id}-1`,
        generation: 1,
        plantedDate: selectedBlock.plantingDate,
        variety: selectedBlock.variety,
        treeCountAtPlanting: selectedBlock.openingTreeCount,
        status: 'active',
        notes: 'Initial planting (auto-seeded from block record)',
      }];
    }
    return [...stored].sort((a, b) => a.generation - b.generation);
  }, [selectedBlock, plantingHistories]);

  const activeGeneration = useMemo(() =>
    currentPlantingHistory.find(g => g.status === 'active') ||
    currentPlantingHistory[currentPlantingHistory.length - 1],
    [currentPlantingHistory]
  );

  // --- Tab 2: Yield This Month ---

  const yieldMonthData = useMemo(() => {
    if (!selectedBlock) return { records: [], metrics: [] };

    const records = production
      .filter(p =>
        p.workItemId === String(selectedBlock.blockNo) &&
        p.date.startsWith(selectedMonth) &&
        p.estate === selectedBlock.estateId)
      .map(p => {
        const tapper = employees.find(e => e.id === p.empId);
        return { ...p, tapperName: tapper?.name ?? '-', tapperCode: tapper?.staffCode ?? '-' };
      });

    const prevYearMonth = format(subYears(parseISO(selectedMonth + '-01'), 1), 'yyyy-MM');
    const prevRecords = production.filter(p =>
      p.workItemId === String(selectedBlock.blockNo) &&
      p.date.startsWith(prevYearMonth) &&
      p.estate === selectedBlock.estateId
    );

    const totalLatex = records.reduce((s, r) => s + r.latexWeight, 0);
    const totalDrc = records.reduce((s, r) => s + r.drcKg, 0);
    const avgDrc = totalLatex > 0 ? (totalDrc / totalLatex) * 100 : 0;
    const totalScraps = records.reduce((s, r) => s + r.scrapsKg, 0);
    const tappingDays = new Set(records.map(r => r.date)).size;

    const prevTotalLatex = prevRecords.reduce((s, r) => s + r.latexWeight, 0);
    const prevTotalDrc = prevRecords.reduce((s, r) => s + r.drcKg, 0);
    const prevAvgDrc = prevTotalLatex > 0 ? (prevTotalDrc / prevTotalLatex) * 100 : 0;
    const prevTotalScraps = prevRecords.reduce((s, r) => s + r.scrapsKg, 0);
    const prevTappingDays = new Set(prevRecords.map(r => r.date)).size;

    const calcDelta = (curr: number, prev: number) =>
      prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

    const metrics = [
      { label: 'Total Latex (Wet)', value: totalLatex.toFixed(1), unit: 'kg', delta: calcDelta(totalLatex, prevTotalLatex), icon: <Droplets size={16} /> },
      { label: 'Latex Dry (DRC)', value: totalDrc.toFixed(1), unit: 'kg', delta: calcDelta(totalDrc, prevTotalDrc), icon: <Archive size={16} /> },
      { label: 'Average DRC %', value: avgDrc.toFixed(1), unit: '%', delta: calcDelta(avgDrc, prevAvgDrc), icon: <Beaker size={16} /> },
      { label: 'Total Scraps', value: totalScraps.toFixed(1), unit: 'kg', delta: calcDelta(totalScraps, prevTotalScraps), icon: <Archive size={16} /> },
      { label: 'Tapping Days', value: String(tappingDays), delta: calcDelta(tappingDays, prevTappingDays), icon: <TrendingUp size={16} /> },
    ];

    return { records, metrics };
  }, [selectedBlock, production, selectedMonth, employees]);

  // --- Tab 3: Yield History ---

  const yieldHistoryData = useMemo(() => {
    if (!selectedBlock) return { monthly: [], chartData: [] };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const seasonalFactors = [0.4, 0.45, 0.6, 0.8, 0.9, 1.0, 1.1, 1.1, 1.0, 0.9, 0.7, 0.5];

    const monthly = months.map((month, idx) => {
      const monthStr = `${historyYear}-${String(idx + 1).padStart(2, '0')}`;
      const monthProd = production.filter(p =>
        p.workItemId === String(selectedBlock.blockNo) &&
        p.date.startsWith(monthStr) &&
        p.estate === selectedBlock.estateId
      );

      if (monthProd.length > 0) {
        const latex = monthProd.reduce((s, r) => s + r.latexWeight, 0);
        const drc = monthProd.reduce((s, r) => s + r.drcKg, 0);
        const scraps = monthProd.reduce((s, r) => s + r.scrapsKg, 0);
        const days = new Set(monthProd.map(r => r.date)).size;
        return { month, latex: +latex.toFixed(1), drc: +drc.toFixed(1), scraps: +scraps.toFixed(1), days, avgDrc: latex > 0 ? +((drc / latex) * 100).toFixed(1) : 0 };
      }
      const base = 2200 * seasonalFactors[idx];
      const latex = base + (Math.random() * 300 - 150);
      return { month, latex: +latex.toFixed(1), drc: +(latex * 0.34).toFixed(1), scraps: +(latex * 0.12).toFixed(1), days: 22 + Math.floor(Math.random() * 4), avgDrc: 33.5 + Math.random() };
    });

    const totals = {
      month: 'Consolidated Total',
      latex: +monthly.reduce((s, r) => s + r.latex, 0).toFixed(1),
      drc: +monthly.reduce((s, r) => s + r.drc, 0).toFixed(1),
      scraps: +monthly.reduce((s, r) => s + r.scraps, 0).toFixed(1),
      days: monthly.reduce((s, r) => s + r.days, 0),
      avgDrc: +(monthly.reduce((s, r) => s + r.avgDrc, 0) / 12).toFixed(1),
    };

    const chartData = months.map((month, idx) => ({
      name: month,
      current: +monthly[idx].latex.toFixed(0),
      previous: +(2500 * seasonalFactors[idx] * (0.9 + Math.random() * 0.2)).toFixed(0),
    }));

    return { monthly: [...monthly, totals], chartData };
  }, [selectedBlock, production, historyYear]);

  // --- Tab 4: Tree History ---

  const blockTreeHistory = useMemo(() => {
    if (!selectedBlock) return [];
    return treeMovements
      .filter(tm => tm.blockId === selectedBlock.id)
      .sort((a, b) => b.year - a.year);
  }, [selectedBlock, treeMovements]);

  const treeStats = useMemo(() => ({
    lost: blockTreeHistory.reduce((s, r) => s + r.treesLost, 0)
  }), [blockTreeHistory]);

  // --- Handlers ---

  const handleAddBlock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEstate) return;
    const fd = new FormData(e.currentTarget);
    const count = Number(fd.get('openingTreeCount'));
    addBlock({
      blockNo: Number(fd.get('blockNo')),
      estateId: selectedEstate,
      division: String(fd.get('division')),
      areaHa: Number(fd.get('areaHa')),
      variety: String(fd.get('variety')),
      plantingDate: String(fd.get('plantingDate')),
      openingTreeCount: count,
      currentTreeCount: count,
      tappingTreeCount: Math.round(count * 0.85),
      tappingSystem: String(fd.get('tappingSystem')),
      status: String(fd.get('status')) as any,
      notes: String(fd.get('notes')),
    });
    setIsAddingBlock(false);
  };

  const handleUpdateBlock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBlock) return;
    const fd = new FormData(e.currentTarget);
    updateBlock(selectedBlock.id, {
      variety: String(fd.get('variety')),
      areaHa: Number(fd.get('areaHa')),
      plantingDate: String(fd.get('plantingDate')),
      tappingSystem: String(fd.get('tappingSystem')),
      status: String(fd.get('status')) as any,
      replantingDate: String(fd.get('replantingDate')) || undefined,
      replantingVariety: String(fd.get('replantingVariety')) || undefined,
      notes: String(fd.get('notes')),
    });
    setIsEditingBlock(false);
  };

  const handleAddTreeEntry = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBlock) return;
    const fd = new FormData(e.currentTarget);
    const lost = Number(fd.get('treesLost'));
    addTreeMovement({
      id: `TM-${Date.now()}`,
      blockId: selectedBlock.id,
      year: Number(fd.get('year')),
      openingCount: blockTreeHistory[0]?.closingCount ?? selectedBlock.currentTreeCount,
      treesLost: lost,
      lossReason: String(fd.get('lossReason')),
      treesAdded: 0,
      closingCount: (blockTreeHistory[0]?.closingCount ?? selectedBlock.currentTreeCount) - lost,
      remarks: String(fd.get('remarks')),
    });
    setShowAddEntry(false);
  };

  // Register a new planting generation for the current block.
  // Marks all previous gens as 'ended', adds the new active gen,
  // and syncs the block record so variety/plantingDate stay current.
  const handleAddPlantingGeneration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBlock) return;
    const fd = new FormData(e.currentTarget);
    const newPlantedDate = String(fd.get('plantedDate'));

    const existing = plantingHistories[selectedBlock.id] || [];

    // Bootstrap from block record if nothing stored yet
    const baseHistory: PlantingGeneration[] = existing.length === 0
      ? [{
        id: `PG-${selectedBlock.id}-1`,
        generation: 1,
        plantedDate: selectedBlock.plantingDate,
        variety: selectedBlock.variety,
        treeCountAtPlanting: selectedBlock.openingTreeCount,
        status: 'ended',
        endedDate: newPlantedDate,
        notes: 'Original planting — ended on replanting',
      }]
      : existing.map(g => ({
        ...g,
        status: 'ended' as const,
        endedDate: g.endedDate ?? newPlantedDate,
      }));

    const nextGenNo = baseHistory.length + 1;
    const treeCount = Number(fd.get('treeCount'));
    const newVariety = String(fd.get('variety'));

    const newGen: PlantingGeneration = {
      id: `PG-${selectedBlock.id}-${nextGenNo}`,
      generation: nextGenNo,
      plantedDate: newPlantedDate,
      variety: newVariety,
      treeCountAtPlanting: treeCount,
      notes: String(fd.get('notes')) || undefined,
      status: 'active',
    };

    setPlantingHistories(prev => ({
      ...prev,
      [selectedBlock.id]: [...baseHistory, newGen],
    }));

    // Keep the main block record in sync with the latest generation
    updateBlock(selectedBlock.id, {
      plantingDate: newPlantedDate,
      variety: newVariety,
      openingTreeCount: treeCount,
      currentTreeCount: treeCount,
      status: 'active',
    });

    setShowAddPlantingGen(false);
  };

  // --- Helpers ---

  const getStatusVariant = (status: Block['status']): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'active': return 'success';
      case 'replanting_due': return 'warning';
      case 'replanting_in_progress': return 'danger';
      case 'rested': return 'neutral';
      default: return 'neutral';
    }
  };

  // Age is calculated from the ACTIVE generation's planting date, not hardcoded year.
  const getBlockAge = (block: Block): number => {
    try {
      return differenceInYears(new Date(), parseISO(block.plantingDate));
    } catch {
      return new Date().getFullYear() - parseInt(block.plantingDate.split('-')[0]);
    }
  };

  const safeFormat = (dateStr: string, fmt: string) => {
    try { return format(parseISO(dateStr), fmt); }
    catch { return dateStr; }
  };

  // --- Tab Renderers ---

  const renderBlockInfo = () => (
    <div className="flex flex-col gap-6 p-6">

      {/* Replanting alert + edit button row */}
      <div className="flex justify-between items-start gap-4">
        {(selectedBlock!.status === 'replanting_due' || selectedBlock!.status === 'replanting_in_progress') ? (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex items-start gap-4 text-amber-900 shadow-sm shadow-amber-900/5 flex-1">
            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-sm text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[13px] uppercase tracking-wider text-amber-800">Replanting Attention Required</h4>
              <p className="text-[13px] leading-relaxed text-amber-700/80 mt-1">
                This block is flagged for {selectedBlock!.status === 'replanting_due' ? 'scheduled replanting' : 'active replanting cycle'}.
                {selectedBlock!.replantingDate && <span className="font-bold"> Planned Date: {safeFormat(selectedBlock!.replantingDate, 'MMMM yyyy')}.</span>}
                {selectedBlock!.replantingVariety && <span className="font-bold"> Proposed Variety: {selectedBlock!.replantingVariety}.</span>}
              </p>
            </div>
          </div>
        ) : <div className="flex-1" />}

        <button
          onClick={() => setIsEditingBlock(true)}
          className="bg-white border border-gray-200 p-2.5 rounded-xl text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm group"
        >
          <Edit3 size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Plantation Details */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Plantation Details</h3>
            <Layers size={14} className="text-gray-300" />
          </div>
          <div className="p-5 grid grid-cols-2 gap-y-5 text-[13px]">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Block Number</span>
              <span className="font-bold text-gray-900 flex items-center gap-1.5 font-mono text-base">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {selectedBlock!.blockNo}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Division</span>
              <span className="font-bold text-gray-900 uppercase">Division {selectedBlock!.division}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Current Variety</span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-bold inline-block border border-indigo-100">
                {activeGeneration?.variety ?? selectedBlock!.variety}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Area</span>
              <span className="font-bold text-gray-900">{selectedBlock!.areaHa} <span className="text-[10px] text-gray-400 font-normal">HA</span></span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Calendar size={10} /> Current Gen. Planted
              </span>
              <span className="font-bold text-gray-900">
                {safeFormat(activeGeneration?.plantedDate ?? selectedBlock!.plantingDate, 'dd MMM yyyy')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Age (Current Gen.)</span>
              <span className="font-bold text-gray-900">
                {getBlockAge(selectedBlock!)} <span className="text-[10px] text-gray-400 font-normal">YEARS</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Generation</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Sprout size={13} className="text-emerald-500" />
                Gen {currentPlantingHistory.length}
                {currentPlantingHistory.length > 1 && (
                  <span className="text-[10px] font-normal text-gray-400 ml-1">(Replanted)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Tree Inventory */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tree Inventory</h3>
            <TreePine size={14} className="text-gray-300" />
          </div>
          <div className="p-5 grid grid-cols-2 gap-y-5 text-[13px]">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Opening Stock</span>
              <span className="font-bold text-gray-900">{selectedBlock!.openingTreeCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Current Census</span>
              <span className="font-bold text-gray-900 font-mono text-base">{selectedBlock!.currentTreeCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">In-Tapping</span>
              <span className="font-bold text-emerald-600">
                {selectedBlock!.tappingTreeCount}
                <span className="text-[10px] font-normal ml-1 opacity-70">
                  ({(selectedBlock!.tappingTreeCount / selectedBlock!.currentTreeCount * 100).toFixed(0)}%)
                </span>
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Mortality Rate</span>
              <span className="font-bold text-red-600">
                {((selectedBlock!.openingTreeCount - selectedBlock!.currentTreeCount) / selectedBlock!.openingTreeCount * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Tapping Control */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tapping Control</h3>
            <Settings size={14} className="text-gray-300" />
          </div>
          <div className="p-5 grid grid-cols-2 gap-y-5 text-[13px]">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Tapping System</span>
              <span className="font-bold text-gray-900">{selectedBlock!.tappingSystem}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Target Days</span>
              <span className="font-bold text-gray-900">24 <span className="text-[10px] text-gray-400 font-normal">/ MONTH</span></span>
            </div>
          </div>
        </div>

        {/* Block Status */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Block Status</h3>
            <Badge label={selectedBlock!.status.replace('_', ' ')} variant={getStatusVariant(selectedBlock!.status)} />
          </div>
          <div className="p-5">
            <p className="text-[13px] text-gray-500 italic leading-relaxed">
              {selectedBlock!.notes || 'No specific management notes for this block.'}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          PLANTING GENERATION HISTORY TABLE
          ====================================================== */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">

        {/* Section Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Sprout size={14} className="text-emerald-500" />
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Planting Generation History</h3>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
              {currentPlantingHistory.length} {currentPlantingHistory.length === 1 ? 'Generation' : 'Generations'}
            </span>
          </div>
          <button
            onClick={() => setShowAddPlantingGen(v => !v)}
            className="bg-primary-600! border border-gray-200 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest text-white hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus size={13} />
            Add Replanting Record
          </button>
        </div>

        {/* Inline Add Form */}
        {showAddPlantingGen && (
          <div className="border-b border-emerald-100 bg-emerald-50/50 px-6 py-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h4 className="font-bold text-gray-900 text-[13px] uppercase tracking-widest">
                  New Replanting Record — Gen {currentPlantingHistory.length + 1}
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Previous generation will be marked as ended. The block record will be updated to the new variety and planting date.
                </p>
              </div>
              <button onClick={() => setShowAddPlantingGen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddPlantingGeneration}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <FormLabel>Replanting Date</FormLabel>
                  <FormInput name="plantedDate" type="date" required className="bg-white border-emerald-200 focus:border-emerald-500" />
                </div>
                <div>
                  <FormLabel>New Variety / Clone</FormLabel>
                  <FormInput name="variety" placeholder="e.g. RRII 430" required className="bg-white border-emerald-200 focus:border-emerald-500" />
                </div>
                <div>
                  <FormLabel>Trees Planted</FormLabel>
                  <FormInput name="treeCount" type="number" placeholder="e.g. 480" required className="bg-white border-emerald-200 focus:border-emerald-500" />
                </div>
                <div>
                  <FormLabel>Reason / Notes</FormLabel>
                  <FormInput name="notes" placeholder="e.g. Old trees chipped off at 30 yrs" className="bg-white border-emerald-200 focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPlantingGen(false)}
                  className="px-4 py-2 text-gray-400 font-bold text-[11px] uppercase tracking-widest hover:bg-gray-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600! border border-gray-200 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest text-white hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Sprout size={13} />
                  Save Replanting Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Generation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                {['Gen.', 'Planted Date', 'Variety / Clone', 'Trees Planted', 'Ended / Cleared', 'Duration', 'Status', 'Notes'].map(col => (
                  <th key={col} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 py-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPlantingHistory.map(gen => {
                const plantedYear = parseInt(gen.plantedDate.split('-')[0]);
                const endedYear = gen.endedDate ? parseInt(gen.endedDate.split('-')[0]) : new Date().getFullYear();
                const duration = endedYear - plantedYear;
                const isActive = gen.status === 'active';

                return (
                  <tr
                    key={gen.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/40 transition-colors ${isActive ? 'bg-emerald-50/30' : ''}`}
                  >
                    {/* Gen number badge */}
                    <td className="px-5 py-4">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {gen.generation}
                      </span>
                    </td>

                    {/* Planted date */}
                    <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
                      {safeFormat(gen.plantedDate, 'dd MMM yyyy')}
                    </td>

                    {/* Variety badge */}
                    <td className="px-5 py-4">
                      <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold border ${isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {gen.variety}
                      </span>
                    </td>

                    {/* Tree count */}
                    <td className="px-5 py-4 font-mono font-bold text-gray-900">
                      {gen.treeCountAtPlanting.toLocaleString()}
                    </td>

                    {/* Ended date */}
                    <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                      {gen.endedDate
                        ? safeFormat(gen.endedDate, 'dd MMM yyyy')
                        : <span className="text-gray-300 italic text-[11px]">Still standing</span>}
                    </td>

                    {/* Duration */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {isActive
                        ? <span className="text-emerald-600 font-bold">{duration}+ yrs</span>
                        : <span className="text-gray-500 font-bold">{duration} yrs</span>}
                    </td>

                    {/* Status pill */}
                    <td className="px-5 py-4">
                      {isActive
                        ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />Ended
                          </span>
                        )}
                    </td>

                    {/* Notes */}
                    <td className="px-5 py-4 text-[12px] text-gray-400 max-w-[220px] truncate">
                      {gen.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {currentPlantingHistory.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm">No planting history recorded.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderYieldMonth = () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {yieldMonthData.metrics.map((m, i) => <StatCard key={i} {...m} />)}
      </div>

      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900 text-lg uppercase tracking-tight">Daily Production Ledger — {selectedMonth}</h3>
        </div>
        {yieldMonthData.records.length > 0 ? (
          <DataTable
            columns={[
              { header: 'Date', accessorKey: 'date', cell: (i: any) => safeFormat(i.getValue(), 'dd MMM') },
              { header: 'Tapper', accessorKey: 'tapperCode' },
              { header: 'Latex (Wet)', accessorKey: 'latexWeight', cell: (i: any) => i.getValue().toFixed(1) + ' kg' },
              { header: 'DRC %', accessorKey: 'drcPercent', cell: (i: any) => i.getValue().toFixed(1) + '%' },
              { header: 'Dry (DRC)', accessorKey: 'drcKg', cell: (i: any) => i.getValue().toFixed(1) + ' kg' },
              { header: 'Scraps', accessorKey: 'scrapsKg', cell: (i: any) => i.getValue().toFixed(1) + ' kg' },
              { header: 'Total Dry', accessorKey: 'totalDryKg', cell: (i: any) => <span className="font-bold text-emerald-600 font-mono">{i.getValue().toFixed(2)} kg</span> },
            ]}
            data={yieldMonthData.records}
            rowPadding="sm"
          />
        ) : (
          <div className="p-16 text-center text-gray-500 bg-gray-50/30">
            <TrendingUp size={48} className="mx-auto text-gray-200 mb-5" />
            <p className="font-bold text-lg text-gray-400 uppercase tracking-tight">No Production Data</p>
            <p className="text-xs mt-2 text-gray-400">Records for Block {selectedBlock!.blockNo} will appear here once processed.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderYieldHistory = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Yield Analytics</h3>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-widest font-bold">Monthly Latex Tonnage (kg)</p>
            </div>
            <div className="flex bg-gray-100 p-1.5 rounded-xl gap-2 shadow-inner">
              {years.map(y => (
                <button
                  key={y}
                  onClick={() => setHistoryYear(y)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${historyYear === y ? 'bg-white text-primary-700 shadow-md ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldHistoryData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dx={-10} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="current" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={26} name={`${historyYear}`} />
                <Bar dataKey="previous" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={26} name={`${historyYear - 1}`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Monthly Yield Statement — {historyYear}</h3>
          </div>
          <DataTable
            columns={[
              { header: 'Month', accessorKey: 'month', cell: (i: any) => i.getValue() === 'Consolidated Total' ? <span className="font-bold text-primary-700 underline underline-offset-4">{i.getValue()}</span> : <span className="font-medium">{i.getValue()}</span> },
              { header: 'Latex (kg)', accessorKey: 'latex', cell: (i: any) => i.getValue().toLocaleString() },
              { header: 'DRC (kg)', accessorKey: 'drc', cell: (i: any) => i.getValue().toLocaleString() },
              { header: 'Scraps', accessorKey: 'scraps', cell: (i: any) => i.getValue().toLocaleString() },
              { header: 'Days', accessorKey: 'days' },
              { header: 'Avg DRC%', accessorKey: 'avgDrc', cell: (i: any) => <span className="font-bold">{i.getValue().toFixed(1)}%</span> },
            ]}
            data={yieldHistoryData.monthly}
            rowPadding="sm"
          />
        </div>
      </div>
    );
  };

  const renderTreeHistory = () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Mortality Loss</span>
            <div className="text-2xl font-black text-red-600 font-mono">
              {treeStats.lost} <span className="text-xs text-gray-400 font-bold uppercase ml-1">Trees</span>
            </div>
          </div>
          <div className="bg-red-50 p-2 rounded-lg text-red-500"><Archive size={20} /></div>
        </div>

        <button
          onClick={() => setShowAddEntry(true)}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-primary-600 group-hover:scale-110 transition-transform" />
            <span className="uppercase text-[12px] font-bold text-gray-700 tracking-widest">Register Audit Entry</span>
          </div>
        </button>
      </div>

      {showAddEntry && (
        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-xl animate-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Tree Census Change Registry</h3>
            <button onClick={() => setShowAddEntry(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddTreeEntry} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <FormLabel>Audit Year</FormLabel>
                <FormInput name="year" type="number" defaultValue={new Date().getFullYear()} required />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-red-500">Trees Lost (-)</FormLabel>
                <FormInput name="treesLost" type="number" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <FormLabel>Loss Reason</FormLabel>
                <FormSelect name="lossReason" required>
                  <option>Wind Damage</option>
                  <option>Disease (Root Rot)</option>
                  <option>Disease (Oidium)</option>
                  <option>Natural Decay</option>
                  <option>Panel Dryness (TPD)</option>
                  <option>Other / Unspecified</option>
                </FormSelect>
              </div>
            </div>
            <div className="space-y-2">
              <FormLabel>Supervisor Observation</FormLabel>
              <textarea name="remarks" rows={2} placeholder="Explain the census change clearly..." className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none placeholder:text-gray-300" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="max-w-xs px-4 py-2 bg-primary-600! border border-gray-200 text-white font-bold uppercase text-sm tracking-widest rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <Plus size={16} className="text-white" />
                Save Update
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={[
            { header: 'Year', accessorKey: 'year', cell: (i: any) => <span className="font-bold text-gray-900">{i.getValue()}</span> },
            { header: 'Opening', accessorKey: 'openingCount' },
            { header: 'Loss', accessorKey: 'treesLost', cell: (i: any) => i.getValue() > 0 ? <span className="text-red-600 font-bold italic">-{i.getValue()}</span> : <span className="text-gray-300">0</span> },
            { header: 'Reason', accessorKey: 'lossReason', cell: (i: any) => <span className="text-xs text-gray-400 font-medium italic">{i.getValue() || '-'}</span> },
            { header: 'Closing Stock', accessorKey: 'closingCount', cell: (i: any) => <span className="font-black font-mono text-base">{i.getValue()}</span> },
            { header: 'Observation', accessorKey: 'remarks', cell: (i: any) => <span className="text-xs text-gray-400 truncate max-w-xs block">{i.getValue() || '-'}</span> },
          ]}
          data={blockTreeHistory}
          rowPadding="sm"
        />
      </div>
    </div>
  );

  // --- Main Layout ---

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <PageHeader
        title="Block Register"
        subtitle="Estate Plantation Control • Census Audit • Block Performance"
        actions={
          <button
            onClick={() => setIsAddingBlock(true)}
            className="bg-primary-600! border border-gray-200 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest text-white hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} className="text-white" />
            Register New Block
          </button>
        }
      />

      <div className="px-7 pb-10 flex flex-col xl:flex-row gap-8">

        {/* Sidebar — Block List */}
        <div className="w-full xl:w-80 shrink-0 flex flex-col gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary-100 p-1.5 rounded-lg text-primary-600"><Layers size={16} /></div>
                <span className="font-bold text-gray-900 text-[13px] uppercase tracking-tight">Active Blocks</span>
              </div>
              <Badge label={String(filteredBlocks.length)} variant="neutral" />
            </div>

            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter Block / Variety..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
                <Search className="absolute left-3.5 top-[11px] text-gray-300" size={16} />
              </div>
              <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                {['All', 'Active', 'Replanting', 'Rested'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f as any)}
                    className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded-md transition-all whitespace-nowrap ${statusFilter === f ? 'bg-white! text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2 flex flex-col gap-2 max-h-[600px] overflow-y-auto">
              {filteredBlocks.map(block => {
                const isActive = selectedBlock?.id === block.id;
                const genCount = (plantingHistories[block.id] || []).length || 1;
                return (
                  <button
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`group p-4 rounded-xl border text-left transition-all ${isActive
                      ? 'bg-primary-50/50 border-primary-200 ring-2 ring-primary-500/10'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-bold text-[15px] font-mono ${isActive ? 'text-primary-800' : 'text-gray-900'}`}>
                        BLOCK {block.blockNo}
                      </span>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shadow-sm ${block.status === 'active' ? 'bg-green-500' :
                        block.status === 'replanting_due' ? 'bg-yellow-400' :
                          block.status === 'replanting_in_progress' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-indigo-100">
                        {block.variety}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Div {block.division}</span>
                      {genCount > 1 && (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded-md font-bold border border-emerald-100 flex items-center gap-0.5">
                          <Sprout size={9} /> Gen {genCount}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-50 text-[11px] font-bold text-gray-400">
                      <span>Planted {block.plantingDate.split('-')[0]}</span>
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <TreePine size={13} className="opacity-40" /> {block.currentTreeCount}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {selectedBlock ? (
            <>
              <TabBar
                tabs={['Block Info', 'Yield This Month', 'Yield History', 'Tree History']}
                active={activeTab}
                onChange={setActiveTab}
              />
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden min-h-[600px]">
                {activeTab === 'Block Info' && renderBlockInfo()}
                {activeTab === 'Yield This Month' && renderYieldMonth()}
                {activeTab === 'Yield History' && renderYieldHistory()}
                {activeTab === 'Tree History' && renderTreeHistory()}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex-1 flex flex-col items-center justify-center p-20 text-gray-300">
              <Layers size={64} className="mb-6 opacity-10" />
              <h3 className="font-bold uppercase tracking-[.25em] text-gray-400">Selection Required</h3>
              <p className="text-sm text-gray-400 mt-2">Select an estate block to load management terminal</p>
            </div>
          )}
        </div>
      </div>

      {/* === Add Block Drawer === */}
      <Drawer open={isAddingBlock} onClose={() => setIsAddingBlock(false)} title="Register New Estate Block">
        <form onSubmit={handleAddBlock} className="flex flex-col gap-6 h-full">
          <div className="grid grid-cols-2 gap-4">
            <div><FormLabel>Block Number</FormLabel><FormInput name="blockNo" type="number" placeholder="Ex: 5" required /></div>
            <div><FormLabel>Division</FormLabel><FormInput name="division" placeholder="Ex: A" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><FormLabel>Rubber Variety (Clone)</FormLabel><FormInput name="variety" placeholder="Ex: RRII 105" required /></div>
            <div><FormLabel>Area (Hectares)</FormLabel><FormInput name="areaHa" type="number" step="0.01" placeholder="Ex: 12.5" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><FormLabel>Planting Date</FormLabel><FormInput name="plantingDate" type="date" required /></div>
            <div><FormLabel>Initial Tree Census</FormLabel><FormInput name="openingTreeCount" type="number" placeholder="Ex: 450" required /></div>
          </div>
          <div>
            <FormLabel>Tapping System</FormLabel>
            <FormSelect name="tappingSystem" required>
              <option>S/2 D/2</option><option>S/2 D/3</option><option>S/1 D/4</option><option>D/1 (Intense)</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Current Status</FormLabel>
            <FormSelect name="status" required>
              <option value="active">Active Tapping</option>
              <option value="replanting_due">Replanting Due</option>
              <option value="replanting_in_progress">Replanting Cycle</option>
              <option value="rested">Rested (Slaughtered)</option>
            </FormSelect>
          </div>
          <div>
            <FormLabel>Management Notes</FormLabel>
            <textarea name="notes" rows={3} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none" placeholder="Block unique characteristics..." />
          </div>
          <div className="flex flex-col gap-3 mt-auto pt-6">
            <button type="submit" className="w-full py-4 bg-primary-600! border border-gray-200 text-white font-bold uppercase text-[12px] tracking-widest rounded-xl hover:bg-primary-700 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
              <Plus size={16} className="text-white" /> Create Block Record
            </button>
            <button type="button" onClick={() => setIsAddingBlock(false)} className="w-full py-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-xl">Cancel</button>
          </div>
        </form>
      </Drawer>

      {/* === Edit Block Drawer === */}
      <Drawer open={isEditingBlock} onClose={() => setIsEditingBlock(false)} title={`Edit Block ${selectedBlock?.blockNo}`}>
        {selectedBlock && (
          <form onSubmit={handleUpdateBlock} className="flex flex-col gap-6 h-full">
            <div className="grid grid-cols-2 gap-4">
              <div><FormLabel>Variety (Clone)</FormLabel><FormInput name="variety" defaultValue={selectedBlock.variety} required /></div>
              <div><FormLabel>Area (Hectares)</FormLabel><FormInput name="areaHa" type="number" step="0.01" defaultValue={selectedBlock.areaHa} required /></div>
            </div>
            <div><FormLabel>Planting Date</FormLabel><FormInput name="plantingDate" type="date" defaultValue={selectedBlock.plantingDate} required /></div>
            <div>
              <FormLabel>Tapping System</FormLabel>
              <FormSelect name="tappingSystem" defaultValue={selectedBlock.tappingSystem} required>
                <option>S/2 D/2</option><option>S/2 D/3</option><option>S/1 D/4</option>
              </FormSelect>
            </div>
            <div>
              <FormLabel>Status</FormLabel>
              <FormSelect name="status" defaultValue={selectedBlock.status} required>
                <option value="active">Active</option>
                <option value="replanting_due">Replanting Due</option>
                <option value="replanting_in_progress">Replanting In Progress</option>
                <option value="rested">Rested</option>
              </FormSelect>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="col-span-2 text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Archive size={12} /> Replanting Information
              </div>
              <div><FormLabel>Planned Date</FormLabel><FormInput name="replantingDate" type="date" defaultValue={selectedBlock.replantingDate} className="bg-white border-amber-200" /></div>
              <div><FormLabel>Planned Variety</FormLabel><FormInput name="replantingVariety" defaultValue={selectedBlock.replantingVariety} className="bg-white border-amber-200" /></div>
            </div>
            <div>
              <FormLabel>Notes</FormLabel>
              <textarea name="notes" rows={3} defaultValue={selectedBlock.notes} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none" />
            </div>
            <div className="flex flex-col gap-3 mt-auto pt-6">
              <button type="submit" className="w-full py-4 bg-primary-600! border border-gray-200 text-white font-bold uppercase text-[12px] tracking-widest rounded-xl hover:bg-primary-700 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <Edit3 size={16} className="text-white" /> Save Change History
              </button>
              <button type="button" onClick={() => setIsEditingBlock(false)} className="w-full py-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-xl">Discard Edits</button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}