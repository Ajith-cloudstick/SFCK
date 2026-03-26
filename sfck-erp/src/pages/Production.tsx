import { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ExportButton } from '../components/ui/ExportButton';
import { TabBar } from '../components/ui/TabBar';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES, DAILY_TARGET_KG } from '../data/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Production = () => {
  const [activeTab, setActiveTab] = useState('Daily Records');
  const { employees, production, selectedEstate, selectedDate, selectedMonth, setSelectedDate } = useERPStore();

  const dailyData = useMemo(() => {
    return production.filter(p => p.date === selectedDate && (selectedEstate === null || p.estate === selectedEstate)).map(r => {
      const e = employees.find(em => em.id === r.empId);
      return { id: r.empId, name: e ? e.name : '-', block: r.workItemId, latex: r.latexWeight.toFixed(2), drcPct: r.drcPercent.toFixed(1) + '%', drcKg: r.drcKg.toFixed(2), scraps: r.scrapsKg.toFixed(2), target: DAILY_TARGET_KG, incentive: r.incentiveAmount };
    });
  }, [production, selectedDate, selectedEstate, employees]);

  const dStats = useMemo(() => ({
    latex: dailyData.reduce((s, d) => s + parseFloat(d.latex), 0),
    drc: dailyData.reduce((s, d) => s + parseFloat(d.drcKg), 0),
    scraps: dailyData.reduce((s, d) => s + parseFloat(d.scraps), 0),
    inc: dailyData.reduce((s, d) => s + d.incentive, 0)
  }), [dailyData]);

  const monthlyData = useMemo(() => {
    if (activeTab !== 'Monthly Summary') return [];
    return employees.filter(e => e.designation === 'Tapper' && (selectedEstate === null || e.estate === selectedEstate)).map(emp => {
      const mProd = production.filter(p => p.empId === emp.id && p.date.startsWith(selectedMonth));
      return { id: emp.id, name: emp.name, days: mProd.length, tLatex: mProd.reduce((s, p) => s + p.latexWeight, 0).toFixed(2), tDrc: mProd.reduce((s, p) => s + p.drcKg, 0).toFixed(2), tScraps: mProd.reduce((s, p) => s + p.scrapsKg, 0).toFixed(2), incDays: mProd.filter(p => p.incentiveAmount > 0).length, tInc: mProd.reduce((s, p) => s + p.incentiveAmount, 0) };
    }).filter(d => d.days > 0);
  }, [activeTab, employees, production, selectedEstate, selectedMonth]);

  const compData = useMemo(() => {
    if (activeTab !== 'Estate Comparison') return [];
    const tDrc = ESTATES.reduce((acc, est) => { acc[est.id] = production.filter(p => p.estate === est.id && p.date.startsWith(selectedMonth)).reduce((s, p) => s + p.drcKg, 0); return acc; }, {} as Record<number, number>);
    const total = Object.values(tDrc).reduce((s, v) => s + v, 0);
    return ESTATES.map(est => ({ estate: est.name, drc: tDrc[est.id], pct: total ? ((tDrc[est.id] / total) * 100).toFixed(1) + '%' : '0%' }));
  }, [activeTab, production, selectedMonth]);

  const columnsDaily = [
    { header: 'ID', accessorKey: 'id' }, { header: 'Name', accessorKey: 'name' }, { header: 'Block', accessorKey: 'block' }, { header: 'Latex (kg)', accessorKey: 'latex' }, { header: 'DRC %', accessorKey: 'drcPct' },
    { header: 'DRC (kg)', accessorKey: 'drcKg', cell: (i: any) => { const val = parseFloat(i.getValue()); return <span className={`inline-block px-1.5 py-0.5 rounded ${val > DAILY_TARGET_KG ? 'bg-green-50 text-green-700 font-semibold' : ''}`}>{i.getValue()}</span>; } },
    { header: 'Scraps (kg)', accessorKey: 'scraps' }, { header: 'Target', accessorKey: 'target' }, { header: 'Incentive (₹)', accessorKey: 'incentive' }
  ];

  const columnsMonthly = [
    { header: 'ID', accessorKey: 'id' }, { header: 'Name', accessorKey: 'name' }, { header: 'Days', accessorKey: 'days' },
    { header: 'Total Latex', accessorKey: 'tLatex' }, { header: 'Total DRC', accessorKey: 'tDrc' }, { header: 'Total Scraps', accessorKey: 'tScraps' },
    { header: 'Inc. Days', accessorKey: 'incDays' }, { header: 'Total Inc. (₹)', accessorKey: 'tInc' }
  ];

  const columnsComp = [
    { header: 'Estate', accessorKey: 'estate' },
    { header: 'Total DRC (kg)', accessorKey: 'drc', cell: (i: any) => i.getValue().toFixed(2) },
    { header: '% Share', accessorKey: 'pct' }
  ];

  return (
    <div>
      <PageHeader title="Production kkkRecords" actions={<ExportButton onPDF={() => { }} onExcel={() => { }} />} />
      <div className="px-7 pb-7">
        <TabBar tabs={['Daily Records', 'Monthly Summary', 'Estate Comparison']} active={activeTab} onChange={setActiveTab} />
        {activeTab === 'Daily Records' && (
          <div className="flex flex-col gap-5">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-fit" />
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Total Latex" value={dStats.latex.toFixed(2)} unit="kg" />
              <StatCard label="Total DRC" value={dStats.drc.toFixed(2)} unit="kg" />
              <StatCard label="Total Scraps" value={dStats.scraps.toFixed(2)} unit="kg" />
              <StatCard label="Incentive" value={`₹${dStats.inc.toLocaleString('en-IN')}`} />
            </div>
            <DataTable columns={columnsDaily as any} data={dailyData} searchable />
          </div>
        )}
        {activeTab === 'Monthly Summary' && <DataTable columns={columnsMonthly as any} data={monthlyData} searchable />}
        {activeTab === 'Estate Comparison' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compData}>
                    <XAxis dataKey="estate" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    <Bar dataKey="drc" fill="#36986F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <DataTable columns={columnsComp as any} data={compData} />
          </div>
        )}
      </div>
    </div>
  );
};
