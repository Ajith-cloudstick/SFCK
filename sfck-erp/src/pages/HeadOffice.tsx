import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { 
  MapPin, Users, TrendingUp, IndianRupee, TreePine, 
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
                <span className="text-primary-600">SFCK</span> Works
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
              <button
                key={estate.id}
                onClick={() => handleEstateClick(estate.id)}
                className="group bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
                      <TreePine size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {estate.name}
                      </h3>
                      <span className="text-[11px] text-gray-400 font-medium">{estate.code} · {estate.area}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Workers</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5 font-mono">{estate.employeeCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Tappers</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5 font-mono">{estate.tappers}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Production</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5 font-mono">{estate.totalDry.toFixed(0)} kg</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Avg DRC</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5 font-mono">{estate.avgDrc.toFixed(1)}%</div>
                  </div>
                </div>
              </button>
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
