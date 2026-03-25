import { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ExportButton } from '../components/ui/ExportButton';
import { TabBar } from '../components/ui/TabBar';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const CHART_COLORS = ['#36986F', '#F59E0B', '#3B82F6', '#EF4444'];

export const Stock = () => {
  const [activeTab, setActiveTab] = useState('Current Stock');
  const { stock, selectedEstate, selectedDate, setSelectedDate } = useERPStore();

  const currentStock = useMemo(() => ESTATES.map(est => {
    const estStock = stock.filter(s => s.estate === est.id);
    return { ...est, raw: estStock.reduce((a, s) => a + s.rawLatexKg, 0), drc: estStock.reduce((a, s) => a + s.drcKg, 0), sc: estStock.reduce((a, s) => a + s.scrapsKg, 0) };
  }), [stock]);

  const globalTotals = useMemo(() => ({
    raw: currentStock.reduce((a, s) => a + s.raw, 0), drc: currentStock.reduce((a, s) => a + s.drc, 0), sc: currentStock.reduce((a, s) => a + s.sc, 0), estates: 4
  }), [currentStock]);

  const dailyInflow = useMemo(() => {
    if (activeTab !== 'Daily Inflow') return [];
    return stock.filter(s => s.date === selectedDate && (selectedEstate === 'all' || s.estate === selectedEstate)).map(s => ({
      date: s.date, estate: ESTATES.find(e => e.id === s.estate)?.name || '', raw: s.rawLatexKg.toFixed(2), drc: s.drcKg.toFixed(2), scraps: s.scrapsKg.toFixed(2)
    }));
  }, [activeTab, stock, selectedDate, selectedEstate]);

  const chartData = useMemo(() => {
    if (activeTab !== 'Daily Inflow') return [];
    const dates = Array.from(new Set(stock.map(s => s.date))).sort().slice(-30);
    return dates.map(d => {
      const obj: any = { date: format(new Date(d), 'dd MMM') };
      ESTATES.forEach(est => { const estS = stock.find(s => s.date === d && s.estate === est.id); obj[est.name] = estS ? estS.drcKg : 0; });
      return obj;
    });
  }, [activeTab, stock]);

  const chemicalsData = useMemo(() => {
    if (activeTab !== 'Chemicals') return [];
    return stock.filter(s => s.date === selectedDate && (selectedEstate === 'all' || s.estate === selectedEstate))
      .flatMap(s => s.chemicalsUsed.map(c => ({ date: s.date, estate: ESTATES.find(e => e.id === s.estate)?.name || '', name: c.name, qty: c.qty.toFixed(2), unit: c.unit })));
  }, [activeTab, stock, selectedDate, selectedEstate]);

  const borderColors = ['border-t-primary-600', 'border-t-amber-500', 'border-t-blue-500', 'border-t-red-500'];

  return (
    <div>
      <PageHeader title="Stock Management" actions={<ExportButton onPDF={() => {}} onExcel={() => {}} />} />
      <div className="px-7 pb-7">
        <TabBar tabs={['Current Stock', 'Daily Inflow', 'Chemicals']} active={activeTab} onChange={setActiveTab} />
        {activeTab === 'Current Stock' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-4 gap-4">
              {currentStock.map((est, i) => (
                <div key={est.id} className={`bg-white border border-gray-200 rounded-lg border-t-[3px] ${borderColors[i]} p-5`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-gray-800">{est.name}</span>
                    <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{est.code}</span>
                  </div>
                  <div className="flex flex-col gap-2 text-[13px]">
                    <div className="flex justify-between"><span className="text-gray-500">Raw Latex</span><span className="font-semibold">{est.raw.toFixed(1)} kg</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">DRC</span><span className="font-semibold">{est.drc.toFixed(1)} kg</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Scraps</span><span className="font-semibold">{est.sc.toFixed(1)} kg</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Total Raw Latex" value={globalTotals.raw.toFixed(1)} unit="kg" />
              <StatCard label="Total DRC" value={globalTotals.drc.toFixed(1)} unit="kg" />
              <StatCard label="Total Scraps" value={globalTotals.sc.toFixed(1)} unit="kg" />
              <StatCard label="Estates" value={globalTotals.estates} />
            </div>
          </div>
        )}
        {activeTab === 'Daily Inflow' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" fontSize={11} tickMargin={10} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    {ESTATES.map((e, i) => <Line key={e.id} type="monotone" dataKey={e.name} stroke={CHART_COLORS[i]} strokeWidth={2} dot={false} />)}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-fit" />
            <DataTable columns={[{ header: 'Date', accessorKey: 'date' }, { header: 'Estate', accessorKey: 'estate' }, { header: 'Raw Latex (kg)', accessorKey: 'raw' }, { header: 'DRC (kg)', accessorKey: 'drc' }, { header: 'Scraps (kg)', accessorKey: 'scraps' }] as any} data={dailyInflow} searchable />
          </div>
        )}
        {activeTab === 'Chemicals' && (
          <div className="flex flex-col gap-4">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-fit" />
            <DataTable columns={[{ header: 'Date', accessorKey: 'date' }, { header: 'Estate', accessorKey: 'estate' }, { header: 'Chemical', accessorKey: 'name' }, { header: 'Quantity', accessorKey: 'qty' }, { header: 'Unit', accessorKey: 'unit' }] as any} data={chemicalsData} searchable />
          </div>
        )}
      </div>
    </div>
  );
};
