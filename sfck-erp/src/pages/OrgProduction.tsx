import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { ArrowLeft, TrendingUp } from 'lucide-react';

export const OrgProduction = () => {
  const navigate = useNavigate();
  const { production, selectedMonth } = useERPStore();

  const summary = useMemo(() => {
    const monthProd = production.filter(p => p.date.startsWith(selectedMonth));
    return ESTATES.map(estate => {
      const estProd = monthProd.filter(p => p.estate === estate.id);
      const latex = estProd.reduce((s, p) => s + p.latexWeight, 0);
      const scrap = estProd.reduce((s, p) => s + p.scrapsKg, 0);
      const dry = estProd.reduce((s, p) => s + p.totalDryKg, 0);
      const avgDrc = estProd.length > 0 ? estProd.reduce((s, p) => s + p.drcPercent, 0) / estProd.length : 0;
      const tappers = new Set(estProd.map(p => p.empId)).size;
      return {
        estate: estate.name,
        area: estate.area,
        latex: `${latex.toFixed(0)} kg`,
        scrap: `${scrap.toFixed(0)} kg`,
        totalDry: `${dry.toFixed(0)} kg`,
        avgDrc: `${avgDrc.toFixed(1)}%`,
        tappers,
        dryRaw: dry,
      };
    });
  }, [production, selectedMonth]);

  const totalDry = summary.reduce((s, e) => s + e.dryRaw, 0);

  const columns = [
    { header: 'Estate', accessorKey: 'estate' },
    { header: 'Area', accessorKey: 'area' },
    { header: 'Total Latex', accessorKey: 'latex' },
    { header: 'Total Scrap', accessorKey: 'scrap' },
    { header: 'Total Dry Rubber', accessorKey: 'totalDry' },
    { header: 'Avg DRC %', accessorKey: 'avgDrc' },
    { header: 'Active Tappers', accessorKey: 'tappers' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center gap-4">

          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Production Overview
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Period: {selectedMonth}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Org Total Dry Rubber</div>
            <div className="text-xl font-bold text-gray-900 font-mono">{totalDry.toFixed(0)} kg</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <DataTable columns={columns as any} data={summary} rowPadding="lg" />
        </div>
      </div>
    </div>
  );
};
