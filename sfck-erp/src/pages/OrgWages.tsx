import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { ArrowLeft, IndianRupee } from 'lucide-react';

export const OrgWages = () => {
  const navigate = useNavigate();
  const { wages, selectedMonth } = useERPStore();

  const summary = useMemo(() => {
    const monthWages = wages.filter(w => w.month === selectedMonth);
    return ESTATES.map(estate => {
      const estWages = monthWages.filter(w => w.estate === estate.id);
      const gross = estWages.reduce((s, w) => s + w.grossWage, 0);
      const pf = estWages.reduce((s, w) => s + w.epf, 0);
      const esi = estWages.reduce((s, w) => s + w.iwf, 0);
      const net = estWages.reduce((s, w) => s + w.netWage, 0);
      const workers = estWages.length;
      return {
        estate: estate.name,
        workers,
        gross: `₹${(gross / 1000).toFixed(1)}K`,
        pf: `₹${(pf / 1000).toFixed(1)}K`,
        esi: `₹${(esi / 1000).toFixed(1)}K`,
        net: `₹${(net / 1000).toFixed(1)}K`,
        grossRaw: gross,
      };
    });
  }, [wages, selectedMonth]);

  const totalGross = summary.reduce((s, e) => s + e.grossRaw, 0);

  const columns = [
    { header: 'Estate', accessorKey: 'estate' },
    { header: 'Workers Paid', accessorKey: 'workers' },
    { header: 'Gross Wages', accessorKey: 'gross' },
    { header: 'PF Deduction', accessorKey: 'pf' },
    { header: 'ESI Deduction', accessorKey: 'esi' },
    { header: 'Net Wages', accessorKey: 'net' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center gap-4">
          <button onClick={() => navigate('/head-office')} className="text-gray-400 hover:text-primary-600 p-1 cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <IndianRupee size={20} className="text-amber-600" /> Wages Overview
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Period: {selectedMonth}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Gross</div>
            <div className="text-xl font-bold text-gray-900 font-mono">₹{(totalGross / 100000).toFixed(2)} L</div>
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
