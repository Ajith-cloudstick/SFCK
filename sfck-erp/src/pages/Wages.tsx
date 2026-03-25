import { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ExportButton } from '../components/ui/ExportButton';
import { TabBar } from '../components/ui/TabBar';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES, DAILY_TARGET_KG } from '../data/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Wages = () => {
  const [activeTab, setActiveTab] = useState('Wage Register');
  const { employees, wages, selectedEstate, selectedMonth } = useERPStore();

  const wageData = useMemo(() => {
    return wages.filter(w => w.month === selectedMonth && (selectedEstate === 'all' || w.estate === selectedEstate)).map(r => {
      const e = employees.find(em => em.id === r.empId);
      return { id: r.empId, name: e ? e.name : '-', estate: ESTATES.find(es => es.id === r.estate)?.name || '', drc: r.totalDrcKg.toFixed(2), pieceRate: r.pieceRateAmount, inc: r.incentiveAmount, gross: r.grossWage, pf: r.pfDeduction, esi: r.esiDeduction, adv: r.advanceDeduction, net: r.netWage };
    });
  }, [wages, selectedMonth, selectedEstate, employees]);

  const stats = useMemo(() => ({
    pieceRate: wageData.reduce((s, w) => s + w.pieceRate, 0), inc: wageData.reduce((s, w) => s + w.inc, 0),
    deductions: wageData.reduce((s, w) => s + w.pf + w.esi + w.adv, 0), net: wageData.reduce((s, w) => s + w.net, 0),
    pf: wageData.reduce((s, w) => s + w.pf, 0), esi: wageData.reduce((s, w) => s + w.esi, 0), adv: wageData.reduce((s, w) => s + w.adv, 0)
  }), [wageData]);

  const incentiveData = useMemo(() => {
    if (activeTab !== 'Incentive Summary') return [];
    return wageData.filter(w => w.inc > 0).map(w => ({
      ...w, target: (w.gross > 0 ? DAILY_TARGET_KG * 24 : 0).toFixed(2), achieved: w.drc, excess: (parseFloat(w.drc) - (w.gross > 0 ? DAILY_TARGET_KG * 24 : 0)).toFixed(2)
    })).sort((a, b) => b.inc - a.inc);
  }, [activeTab, wageData]);

  const top10 = useMemo(() => incentiveData.slice(0, 10), [incentiveData]);
  const fmt = (v: number) => Math.round(v).toLocaleString('en-IN');

  const columnsReg = [
    { header: 'Emp ID', accessorKey: 'id' }, { header: 'Name', accessorKey: 'name' }, { header: 'Estate', accessorKey: 'estate' },
    { header: 'DRC (kg)', accessorKey: 'drc' },
    { header: 'Piece Rate (₹)', accessorKey: 'pieceRate', cell: (i:any) => fmt(i.getValue()) },
    { header: 'Incentive (₹)', accessorKey: 'inc', cell: (i:any) => fmt(i.getValue()) },
    { header: 'Gross (₹)', accessorKey: 'gross', cell: (i:any) => fmt(i.getValue()) },
    { header: 'PF (₹)', accessorKey: 'pf', cell: (i:any) => fmt(i.getValue()) },
    { header: 'ESI (₹)', accessorKey: 'esi', cell: (i:any) => fmt(i.getValue()) },
    { header: 'Advance (₹)', accessorKey: 'adv', cell: (i:any) => fmt(i.getValue()) },
    { header: 'Net Wage (₹)', accessorKey: 'net', cell: (i:any) => <span className="font-semibold">₹{fmt(i.getValue())}</span> }
  ];

  const columnsInc = [
    { header: 'Emp ID', accessorKey: 'id' }, { header: 'Name', accessorKey: 'name' }, { header: 'Estate', accessorKey: 'estate' },
    { header: 'Target (kg)', accessorKey: 'target' }, { header: 'Achieved (kg)', accessorKey: 'achieved' }, { header: 'Excess (kg)', accessorKey: 'excess' },
    { header: 'Incentive (₹)', accessorKey: 'inc', cell: (i:any) => fmt(i.getValue()) }
  ];

  const columnsDed = [
    { header: 'Emp ID', accessorKey: 'id' }, { header: 'Name', accessorKey: 'name' },
    { header: 'PF (₹)', accessorKey: 'pf', cell: (i:any) => fmt(i.getValue()) },
    { header: 'ESI (₹)', accessorKey: 'esi', cell: (i:any) => fmt(i.getValue()) },
    { header: 'Advance (₹)', accessorKey: 'adv', cell: (i:any) => fmt(i.getValue()) },
    { header: 'Total Ded. (₹)', accessorKey: 'id', cell: (i:any) => { const row = i.row.original; return fmt(row.pf + row.esi + row.adv); }}
  ];

  return (
    <div>
      <PageHeader title="Wage & Incentive Distribution" actions={<ExportButton onPDF={() => {}} onExcel={() => {}} />} />
      <div className="px-7 pb-7">
        <TabBar tabs={['Wage Register', 'Incentive Summary', 'Deductions']} active={activeTab} onChange={setActiveTab} />
        {activeTab === 'Wage Register' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Total Piece Rate" value={`₹${fmt(stats.pieceRate)}`} />
              <StatCard label="Total Incentive" value={`₹${fmt(stats.inc)}`} />
              <StatCard label="Total Deductions" value={`₹${fmt(stats.deductions)}`} />
              <StatCard label="Net Payable" value={`₹${fmt(stats.net)}`} />
            </div>
            <DataTable columns={columnsReg as any} data={wageData} searchable />
            <p className="text-xs text-gray-400 -mt-2">Note: Piece rate: ₹12/kg DRC · PF: 12% · ESI: 0.75%</p>
          </div>
        )}
        {activeTab === 'Incentive Summary' && (
          <div className="flex flex-col gap-6">
            {top10.length > 0 && (
              <div className="bg-white p-5 rounded-lg border border-gray-200">
                <div className="text-sm font-semibold mb-4">Top 10 Incentive Earners</div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top10}><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} /><Bar dataKey="inc" fill="#36986F" radius={[4,4,0,0]} /></BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            <DataTable columns={columnsInc as any} data={incentiveData} searchable />
          </div>
        )}
        {activeTab === 'Deductions' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Total PF" value={`₹${fmt(stats.pf)}`} />
              <StatCard label="Total ESI" value={`₹${fmt(stats.esi)}`} />
              <StatCard label="Total Advances" value={`₹${fmt(stats.adv)}`} />
            </div>
            <DataTable columns={columnsDed as any} data={wageData} searchable />
          </div>
        )}
      </div>
    </div>
  );
};
