import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ExportButton } from '../components/ui/ExportButton';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { exportTableToExcel } from '../utils/exportExcel';
import { exportTableToPDF } from '../utils/exportPDF';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

type ComparisonMetric = {
  label: string;
  periodA: string;
  periodB: string;
  change: number; // percentage
  unit: string;
};

export const YearlyComparison = () => {
  const navigate = useNavigate();
  const { employees, production, attendance, selectedEstate } = useERPStore();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed

  const [periodA, setPeriodA] = useState(`${currentYear - 1}-${String(currentMonth + 1).padStart(2, '0')}`);
  const [periodB, setPeriodB] = useState(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);

  useEffect(() => {
    if (!selectedEstate && selectedEstate !== 0) navigate('/');
  }, [selectedEstate, navigate]);

  const estate = ESTATES.find(e => e.id === selectedEstate);
  const estateName = estate?.name || '';

  const getMonthLabel = (ym: string) => {
    const [y, m] = ym.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Calculate metrics for a given month
  const calcMetrics = (month: string) => {
    const monthProd = production.filter(p => p.estate === selectedEstate && p.date.startsWith(month));
    const monthAtt = attendance.filter(a => a.estate === selectedEstate && a.date.startsWith(month));

    const totalDry = monthProd.reduce((s, p) => s + p.totalDryKg, 0);
    const totalLatex = monthProd.reduce((s, p) => s + p.latexWeight, 0);
    const totalScrap = monthProd.reduce((s, p) => s + p.scrapsKg, 0);
    const avgDrc = monthProd.length > 0
      ? monthProd.reduce((s, p) => s + p.drcPercent, 0) / monthProd.length
      : 0;
    const workers = new Set(monthProd.map(p => p.empId)).size;
    const tappers = new Set(
      monthProd.filter(p => {
        const emp = employees.find(e => e.id === p.empId);
        return emp?.designation === 'Tapper';
      }).map(p => p.empId)
    ).size;
    const workingDays = new Set(monthProd.map(p => p.date)).size;
    const totalDrc = monthProd.reduce((s, p) => s + p.drcKg, 0);

    const presentDays = monthAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    const totalAttRecords = monthAtt.length;
    const attendancePct = totalAttRecords > 0 ? (presentDays / totalAttRecords) * 100 : 0;

    return { totalDry, totalLatex, totalScrap, avgDrc, workers, tappers, workingDays, totalDrc, attendancePct };
  };

  const comparison: ComparisonMetric[] = useMemo(() => {
    const a = calcMetrics(periodA);
    const b = calcMetrics(periodB);

    const pctChange = (valA: number, valB: number) => {
      if (valA === 0) return valB === 0 ? 0 : 100;
      return ((valB - valA) / valA) * 100;
    };

    return [
      { label: 'Total Production (Dry)', periodA: `${a.totalDry.toFixed(1)} kg`, periodB: `${b.totalDry.toFixed(1)} kg`, change: pctChange(a.totalDry, b.totalDry), unit: 'kg' },
      { label: 'Total Latex (Wet)', periodA: `${a.totalLatex.toFixed(1)} kg`, periodB: `${b.totalLatex.toFixed(1)} kg`, change: pctChange(a.totalLatex, b.totalLatex), unit: 'kg' },
      { label: 'Total Scrap', periodA: `${a.totalScrap.toFixed(1)} kg`, periodB: `${b.totalScrap.toFixed(1)} kg`, change: pctChange(a.totalScrap, b.totalScrap), unit: 'kg' },
      { label: 'Average DRC', periodA: `${a.avgDrc.toFixed(1)}%`, periodB: `${b.avgDrc.toFixed(1)}%`, change: pctChange(a.avgDrc, b.avgDrc), unit: '%' },
      { label: 'Number of Workers', periodA: `${a.workers}`, periodB: `${b.workers}`, change: pctChange(a.workers, b.workers), unit: '' },
      { label: 'Number of Tappers', periodA: `${a.tappers}`, periodB: `${b.tappers}`, change: pctChange(a.tappers, b.tappers), unit: '' },
      { label: 'Working Days', periodA: `${a.workingDays}`, periodB: `${b.workingDays}`, change: pctChange(a.workingDays, b.workingDays), unit: 'days' },
      { label: 'DRC (Total)', periodA: `${a.totalDrc.toFixed(1)} kg`, periodB: `${b.totalDrc.toFixed(1)} kg`, change: pctChange(a.totalDrc, b.totalDrc), unit: 'kg' },
      { label: 'Attendance Rate', periodA: `${a.attendancePct.toFixed(1)}%`, periodB: `${b.attendancePct.toFixed(1)}%`, change: pctChange(a.attendancePct, b.attendancePct), unit: '%' },
    ];
  }, [production, attendance, employees, selectedEstate, periodA, periodB]);

  const handleExportPDF = () => exportTableToPDF('Yearly Comparison', [], [], 'yearly-comparison');
  const handleExportExcel = () => exportTableToExcel('Yearly Comparison', [], [], 'yearly-comparison');

  return (
    <div>
      <PageHeader
        title="Yearly Production Comparison"
        subtitle={`${estateName} Estate`}
        actions={<ExportButton onPDF={handleExportPDF} onExcel={handleExportExcel} />}
      />

      <div className="px-7 pb-7 flex flex-col gap-6">

        {/* Period Selectors */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-6">
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Period A</label>
            <input
              type="month"
              value={periodA}
              onChange={e => setPeriodA(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <div className="text-xs text-gray-400 mt-1">{getMonthLabel(periodA)}</div>
          </div>

          <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-full text-primary-600 shrink-0 mt-2">
            <ArrowRight size={18} />
          </div>

          <div className="flex-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Period B</label>
            <input
              type="month"
              value={periodB}
              onChange={e => setPeriodB(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <div className="text-xs text-gray-400 mt-1">{getMonthLabel(periodB)}</div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-base">
              {getMonthLabel(periodA)} vs {getMonthLabel(periodB)}
            </h3>
          </div>

          <div className="divide-y divide-gray-100">
            {comparison.map((m, idx) => (
              <div key={idx} className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr] px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                <div className="text-sm font-medium text-gray-700">{m.label}</div>

                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-0.5">Period A</div>
                  <div className="text-sm font-semibold text-gray-900 font-mono">{m.periodA}</div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-0.5">Period B</div>
                  <div className="text-sm font-semibold text-gray-900 font-mono">{m.periodB}</div>
                </div>

                <div className="flex justify-end">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    m.change > 0
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : m.change < 0
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {m.change > 0 ? <TrendingUp size={12} /> : m.change < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                    {m.change > 0 ? '+' : ''}{m.change.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-6 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Increase</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Decrease</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> No Change</span>
          </div>
        </div>
      </div>
    </div>
  );
};
