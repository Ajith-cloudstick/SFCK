import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import {
  Users, TrendingUp, IndianRupee,
  ChevronRight, Droplets, Archive
} from 'lucide-react';
import type { EstateId } from '../types';

export const HeadOffice = () => {
  const navigate = useNavigate();
  const { employees, production, wages, setSelectedEstate, selectedMonth } = useERPStore();

  const orgStats = useMemo(() => {
    const totalEmployees = employees.length;
    const tappers = employees.filter(e => e.designation === 'Tapper').length;
    const permanent = employees.filter(e => e.category === 'permanent').length;
    const casual = employees.filter(e => e.category === 'casual').length;

    const monthProd = production.filter(p => p.date.startsWith(selectedMonth));
    const totalDry = monthProd.reduce((s, p) => s + p.totalDryKg, 0);
    const totalLatex = monthProd.reduce((s, p) => s + p.latexWeight, 0);
    const totalScrap = monthProd.reduce((s, p) => s + p.scrapsKg, 0);

    const monthWages = wages.filter(w => w.month === selectedMonth);
    const totalGross = monthWages.reduce((s, w) => s + w.grossWage, 0);

    return { totalEmployees, tappers, permanent, casual, totalDry, totalLatex, totalScrap, totalGross };
  }, [employees, production, wages, selectedMonth]);

  const estateCards = useMemo(() => {
    return ESTATES.map(estate => {
      const estEmployees = employees.filter(e => e.estate === estate.id);
      const estProd = production.filter(p => p.estate === estate.id && p.date.startsWith(selectedMonth));
      const totalDry = estProd.reduce((s, p) => s + p.totalDryKg, 0);
      const totalLatex = estProd.reduce((s, p) => s + p.latexWeight, 0);
      const tappers = estEmployees.filter(e => e.designation === 'Tapper').length;
      const avgDrc = estProd.length > 0 ? estProd.reduce((s, p) => s + p.drcPercent, 0) / estProd.length : 0;

      return { ...estate, employeeCount: estEmployees.length, tappers, totalDry, totalLatex, avgDrc };
    });
  }, [employees, production, selectedMonth]);

  const handleEstateClick = (estateId: EstateId) => {
    setSelectedEstate(estateId);
    navigate('/dashboard');
  };

  const monthLabel = selectedMonth
    ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-primary-600">SFCK</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">State Farming Corporation of Kerala — Head Office Dashboard</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">Current Period</div>
              <div className="text-lg font-semibold text-gray-800">{monthLabel}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-8 flex flex-col gap-8">

        {/* Organization KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Workforce</span>
              <Users size={16} className="text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 font-mono">{orgStats.totalEmployees.toLocaleString()}</div>
            <div className="flex gap-3 mt-2 text-[11px] text-gray-400">
              <span>{orgStats.tappers} Tappers</span>
              <span>·</span>
              <span>{orgStats.permanent} Permanent</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Production</span>
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 font-mono">{orgStats.totalDry.toFixed(0)}<span className="text-sm text-gray-400 ml-1 font-sans font-normal">kg</span></div>
            <div className="flex gap-3 mt-2 text-[11px] text-gray-400">
              <span>Dry Rubber — {monthLabel}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Latex</span>
              <Droplets size={16} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 font-mono">{orgStats.totalLatex.toFixed(0)}<span className="text-sm text-gray-400 ml-1 font-sans font-normal">kg</span></div>
            <div className="flex gap-3 mt-2 text-[11px] text-gray-400">
              <span>Scrap: {orgStats.totalScrap.toFixed(0)} kg</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Wages</span>
              <IndianRupee size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 font-mono">₹{(orgStats.totalGross / 100000).toFixed(1)}<span className="text-sm text-gray-400 ml-1 font-sans font-normal">L</span></div>
            <div className="flex gap-3 mt-2 text-[11px] text-gray-400">
              <span>Gross wages — {monthLabel}</span>
            </div>
          </div>
        </div>

        {/* Estates Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Estates</h2>
            <span className="text-xs text-gray-400">{ESTATES.length} estates under management</span>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {estateCards.map(estate => (
              <div
                key={estate.id}
                onClick={() => handleEstateClick(estate.id)}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 text-left shadow-sm hover:shadow-2xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary-500 to-primary-300 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {estate.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-500 font-bold uppercase tracking-tight">{estate.code}</span>
                      <span className="text-sm text-gray-400 font-medium">{estate.area}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all duration-300 border border-gray-100 group-hover:border-primary-100">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                  <div className="bg-gray-50/50 rounded-xl p-3 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Workforce</div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-lg font-bold text-gray-900 font-mono">{estate.employeeCount}</span>
                      <span className="text-[10px] text-gray-400 font-medium">({estate.tappers} tap)</span>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 rounded-xl p-3 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Production</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-gray-900 font-mono">{estate.totalDry.toFixed(0)}</span>
                      <span className="text-[10px] text-gray-500 font-bold">KG</span>
                    </div>
                  </div>
                  <div className="col-span-2 bg-primary-50/30 rounded-xl p-3 border border-primary-100/20 group-hover:bg-primary-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-primary-600/70 uppercase tracking-wider font-bold">Average DRC</div>
                        <div className="text-xl font-bold text-primary-700 font-mono mt-0.5">{estate.avgDrc.toFixed(1)}%</div>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary-500">
                        <Droplets size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/org/employees')}
            className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <Users size={20} className="text-primary-600 mb-2" />
            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">All Employees</h3>
            <p className="text-xs text-gray-400 mt-1">View workforce across all estates</p>
          </button>
          <button
            onClick={() => navigate('/org/wages')}
            className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <IndianRupee size={20} className="text-amber-600 mb-2" />
            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">Wages Overview</h3>
            <p className="text-xs text-gray-400 mt-1">Salary, PF, ESI across all estates</p>
          </button>
          <button
            onClick={() => navigate('/org/production')}
            className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <Archive size={20} className="text-green-600 mb-2" />
            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-700">Production Overview</h3>
            <p className="text-xs text-gray-400 mt-1">Org-wide production analytics</p>
          </button>
        </div>

      </div>
    </div>
  );
};
