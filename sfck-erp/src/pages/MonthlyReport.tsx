import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ExportButton } from '../components/ui/ExportButton';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES, COLLECTION_CENTERS } from '../data/constants';
import { exportTableToExcel } from '../utils/exportExcel';
import { exportTableToPDF } from '../utils/exportPDF';
import { Droplets, Users, TrendingUp, Archive, Beaker } from 'lucide-react';

export const MonthlyReport = () => {
  const navigate = useNavigate();
  const { employees, production, attendance, selectedEstate, selectedMonth } = useERPStore();

  useEffect(() => {
    if (!selectedEstate && selectedEstate !== 0) navigate('/');
  }, [selectedEstate, navigate]);

  const estate = ESTATES.find(e => e.id === selectedEstate);
  const estateName = estate?.name || '';

  // Monthly production aggregation
  const monthlyStats = useMemo(() => {
    if (selectedEstate === null) return null;

    const monthProd = production.filter(p => p.estate === selectedEstate && p.date.startsWith(selectedMonth));
    const monthAtt = attendance.filter(a => a.estate === selectedEstate && a.date.startsWith(selectedMonth));

    const totalLatex = monthProd.reduce((s, p) => s + p.latexWeight, 0);
    const totalDrc = monthProd.reduce((s, p) => s + p.drcKg, 0);
    const totalScrap = monthProd.reduce((s, p) => s + p.scrapsKg, 0);
    const totalDry = monthProd.reduce((s, p) => s + p.totalDryKg, 0);
    const avgDrc = monthProd.length > 0
      ? monthProd.reduce((s, p) => s + p.drcPercent, 0) / monthProd.length
      : 0;

    const uniqueWorkers = new Set(monthProd.map(p => p.empId)).size;
    const tappers = employees.filter(e => e.estate === selectedEstate && e.designation === 'Tapper').length;

    // Unique working days
    const workingDays = new Set(monthProd.map(p => p.date)).size;

    // Daily avg
    const dailyAvgProduction = workingDays > 0 ? totalDry / workingDays : 0;

    // Attendance % = avg present days / total working days
    const presentDays = monthAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    const totalAttRecords = monthAtt.length;
    const attendancePct = totalAttRecords > 0 ? Math.round((presentDays / totalAttRecords) * 100) : 0;

    return {
      totalLatex, totalDrc, totalScrap, totalDry, avgDrc,
      uniqueWorkers, tappers, workingDays, dailyAvgProduction, attendancePct
    };
  }, [production, attendance, employees, selectedEstate, selectedMonth]);

  // Division-wise: group by CC
  const ccBreakdown = useMemo(() => {
    if (selectedEstate === null) return [];
    const estateCCs = COLLECTION_CENTERS.filter(cc => cc.estateId === selectedEstate);
    const monthProd = production.filter(p => p.estate === selectedEstate && p.date.startsWith(selectedMonth));

    return estateCCs.map(cc => {
      const ccProd = monthProd.filter(p => p.ccId === cc.id);
      const latex = ccProd.reduce((s, p) => s + p.latexWeight, 0);
      const drc = ccProd.reduce((s, p) => s + p.drcKg, 0);
      const scrap = ccProd.reduce((s, p) => s + p.scrapsKg, 0);
      const totalDry = ccProd.reduce((s, p) => s + p.totalDryKg, 0);
      const tappers = new Set(ccProd.map(p => p.empId)).size;
      const avgDrc = ccProd.length > 0 ? ccProd.reduce((s, p) => s + p.drcPercent, 0) / ccProd.length : 0;

      return {
        ccName: cc.name,
        totalLatex: latex.toFixed(1),
        totalDrc: drc.toFixed(2),
        totalScrap: scrap.toFixed(1),
        totalDry: totalDry.toFixed(2),
        avgDrc: avgDrc.toFixed(1),
        tappers
      };
    });
  }, [production, selectedEstate, selectedMonth]);

  // Block-wise: group by workItemId (Block)
  const blockBreakdown = useMemo(() => {
    if (selectedEstate === null) return [];
    const monthProd = production.filter(p => p.estate === selectedEstate && p.date.startsWith(selectedMonth));
    const blockMap = new Map<string, { latex: number; drc: number; scrap: number; dry: number; count: number; drcPctSum: number }>();

    monthProd.forEach(p => {
      const existing = blockMap.get(p.workItemId) || { latex: 0, drc: 0, scrap: 0, dry: 0, count: 0, drcPctSum: 0 };
      existing.latex += p.latexWeight;
      existing.drc += p.drcKg;
      existing.scrap += p.scrapsKg;
      existing.dry += p.totalDryKg;
      existing.count += 1;
      existing.drcPctSum += p.drcPercent;
      blockMap.set(p.workItemId, existing);
    });

    return Array.from(blockMap.entries()).map(([block, data]) => ({
      block,
      totalLatex: data.latex.toFixed(1),
      totalDrc: data.drc.toFixed(2),
      totalScrap: data.scrap.toFixed(1),
      totalDry: data.dry.toFixed(2),
      avgDrc: (data.drcPctSum / data.count).toFixed(1),
      records: data.count
    }));
  }, [production, selectedEstate, selectedMonth]);

  const ccColumns = [
    { header: 'Collection Centre', accessorKey: 'ccName' },
    { header: 'Total Latex (kg)', accessorKey: 'totalLatex' },
    { header: 'DRC (kg)', accessorKey: 'totalDrc' },
    { header: 'Scrap (kg)', accessorKey: 'totalScrap' },
    { header: 'Total Dry (kg)', accessorKey: 'totalDry' },
    { header: 'Avg DRC %', accessorKey: 'avgDrc' },
    { header: 'Tappers', accessorKey: 'tappers' },
  ];

  const blockColumns = [
    { header: 'Block', accessorKey: 'block' },
    { header: 'Total Latex (kg)', accessorKey: 'totalLatex' },
    { header: 'DRC (kg)', accessorKey: 'totalDrc' },
    { header: 'Scrap (kg)', accessorKey: 'totalScrap' },
    { header: 'Total Dry (kg)', accessorKey: 'totalDry' },
    { header: 'Avg DRC %', accessorKey: 'avgDrc' },
    { header: 'Records', accessorKey: 'records' },
  ];

  const monthLabel = selectedMonth
    ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const handleExportPDF = () => exportTableToPDF('Monthly Report', [], [], 'monthly-report');
  const handleExportExcel = () => exportTableToExcel('Monthly Report', [], [], 'monthly-report');

  return (
    <div>
      <PageHeader
        title="Monthly Production Report"
        subtitle={`${estateName} — ${monthLabel}`}
        actions={<ExportButton onPDF={handleExportPDF} onExcel={handleExportExcel} />}
      />

      <div className="px-7 pb-7 flex flex-col gap-6">
        {/* Summary Cards */}
        {monthlyStats && (
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              label="Total Production"
              value={monthlyStats.totalDry.toFixed(1)}
              unit="kg"
              icon={<TrendingUp size={16} className="text-primary-600" />}
            />
            <StatCard
              label="Total Latex"
              value={monthlyStats.totalLatex.toFixed(1)}
              unit="kg"
              icon={<Droplets size={16} className="text-blue-600" />}
            />
            <StatCard
              label="Total Scrap"
              value={monthlyStats.totalScrap.toFixed(1)}
              unit="kg"
              icon={<Archive size={16} className="text-amber-600" />}
            />
            <StatCard
              label="Average DRC"
              value={`${monthlyStats.avgDrc.toFixed(1)}%`}
              icon={<Beaker size={16} className="text-purple-600" />}
            />
            <StatCard
              label="Workers / Tappers"
              value={`${monthlyStats.uniqueWorkers} / ${monthlyStats.tappers}`}
              icon={<Users size={16} className="text-primary-600" />}
            />
          </div>
        )}

        {/* Quick Stats Row */}
        {monthlyStats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Working Days</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1 font-mono">{monthlyStats.workingDays}</div>
              </div>
              <div className="text-xs text-gray-400">days in {monthLabel}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Daily Avg Production</div>
                <div className="text-2xl font-semibold text-gray-900 mt-1 font-mono">{monthlyStats.dailyAvgProduction.toFixed(1)}</div>
              </div>
              <div className="text-xs text-gray-400">kg / day</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Attendance Rate</div>
                <div className={`text-2xl font-semibold mt-1 font-mono ${monthlyStats.attendancePct >= 90 ? 'text-green-700' : monthlyStats.attendancePct >= 75 ? 'text-amber-700' : 'text-red-700'}`}>
                  {monthlyStats.attendancePct}%
                </div>
              </div>
              <div className="text-xs text-gray-400">present rate</div>
            </div>
          </div>
        )}

        {/* Division-wise Production */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-base">Division-wise Production (by CC)</h3>
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded">
              {monthLabel}
            </span>
          </div>
          <DataTable columns={ccColumns as any} data={ccBreakdown} rowPadding="lg" />
        </div>

        {/* Block-wise Production */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-base">Block-wise Production</h3>
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded">
              {monthLabel}
            </span>
          </div>
          <DataTable columns={blockColumns as any} data={blockBreakdown} searchable rowPadding="sm" />
        </div>
      </div>
    </div>
  );
};
