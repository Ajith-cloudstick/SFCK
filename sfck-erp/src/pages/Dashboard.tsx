import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES, COLLECTION_CENTERS } from '../data/constants';
import { format } from 'date-fns';
import { Droplets, Info, Beaker, Archive, TrendingUp, ChevronLeft } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    employees,
    production,
    selectedEstate,
    selectedCC,
    setSelectedCC,
    selectedDate
  } = useERPStore();

  useEffect(() => {
    if (!selectedEstate) {
      navigate('/');
    }
  }, [selectedEstate, navigate]);

  const estate = ESTATES.find(e => e.id === selectedEstate);
  const estateName = estate ? estate.name : '';

  // Current CC if one is selected
  const activeCC = useMemo(() => {
    if (selectedCC === 'all') return null;
    return COLLECTION_CENTERS.find(cc => cc.id === selectedCC);
  }, [selectedCC]);

  // Aggregate data for Consolidated View (Summary per CC)
  const consolidatedData = useMemo(() => {
    if (!selectedEstate) return [];

    const estateCCs = COLLECTION_CENTERS.filter(cc => cc.estateId === selectedEstate);

    return estateCCs.map(cc => {
      const ccProduction = production.filter(p =>
        p.ccId === cc.id &&
        p.date === selectedDate
      );

      const totalLatex = ccProduction.reduce((s, p) => s + p.latexWeight, 0);
      const totalScrap = ccProduction.reduce((s, p) => s + p.scrapsKg, 0);
      const uniqueTappers = new Set(ccProduction.map(p => p.empId)).size;

      return {
        id: cc.id,
        ccName: cc.name,
        latexNormal: totalLatex.toFixed(1),
        latexEmpty: '0.0', // Placeholder as per logic
        totalLatex: totalLatex.toFixed(1),
        scrapNormal: totalScrap.toFixed(1),
        scrapEmpty: '0.0',
        totalScrap: totalScrap.toFixed(1),
        totalTappers: uniqueTappers
      };
    });
  }, [production, selectedDate, selectedEstate]);

  // Filter production data for Detailed View
  const filteredProduction = useMemo(() => {
    return production.filter(p => {
      const matchDate = p.date === selectedDate;
      const matchEstate = p.estate === selectedEstate;
      const matchCC = selectedCC === 'all' || p.ccId === selectedCC;
      return matchDate && matchEstate && matchCC;
    });
  }, [production, selectedDate, selectedEstate, selectedCC]);

  // Totals for summary cards
  const totals = useMemo(() => {
    const latex = filteredProduction.reduce((s, p) => s + p.latexWeight, 0);
    const drc = filteredProduction.reduce((s, p) => s + p.drcKg, 0);
    const scrap = filteredProduction.reduce((s, p) => s + p.scrapsKg, 0);
    const scrapDry = filteredProduction.reduce((s, p) => s + p.scrapDryKg, 0);
    const totalDry = filteredProduction.reduce((s, p) => s + p.totalDryKg, 0);
    return { latex, drc, scrap, scrapDry, totalDry };
  }, [filteredProduction]);

  // Detailed Table Data
  const detailedTableData = useMemo(() => {
    return filteredProduction.map(p => {
      const emp = employees.find(e => e.id === p.empId);
      return {
        ...p,
        workerName: emp?.name || '-',
        latexWeight: p.latexWeight.toFixed(1),
        drcPercent: p.drcPercent.toFixed(1),
        drcKg: p.drcKg.toFixed(2),
        scrapsKg: p.scrapsKg.toFixed(1),
        totalDryKg: p.totalDryKg.toFixed(2)
      };
    });
  }, [filteredProduction, employees]);

  const detailedColumns = [
    { header: 'Block', accessorKey: 'workItemId' },
    { header: 'Variety', accessorKey: 'variety' },
    { header: 'Plant Year', accessorKey: 'plantYear' },
    { header: 'Roll No', accessorKey: 'rollNo' },
    { header: 'Worker Name', accessorKey: 'workerName' },
    { header: 'Latex (Wet)', accessorKey: 'latexWeight' },
    { header: 'DRC %', accessorKey: 'drcPercent' },
    { header: 'DRC (Kg)', accessorKey: 'drcKg' },
    { header: 'Scrap (Kg)', accessorKey: 'scrapsKg' },
    { header: 'Total (Dry)', accessorKey: 'totalDryKg' },
  ];

  const consolidatedColumns = [
    { header: 'Collection Centre', accessorKey: 'ccName' },
    { header: 'Latex (Normal)', accessorKey: 'latexNormal' },
    { header: 'Latex (Empty)', accessorKey: 'latexEmpty' },
    { header: 'Total Latex', accessorKey: 'totalLatex' },
    { header: 'Scrap (Normal)', accessorKey: 'scrapNormal' },
    { header: 'Scrap (Empty)', accessorKey: 'scrapEmpty' },
    { header: 'Total Scrap', accessorKey: 'totalScrap' },
    { header: 'Total Tappers', accessorKey: 'totalTappers' },
  ];

  return (
    <div>
      <PageHeader
        title={`${estateName} Estate`}
        subtitle={`Period: ${format(new Date(selectedDate), 'dd MMMM yyyy')}`}
        actions={
          selectedCC !== 'all' && (
            <button
              onClick={() => setSelectedCC('all')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft size={14} />
              View All CCs
            </button>
          )
        }
      />

      <div className="px-7 pb-7 flex flex-col gap-5">

        {/* Top Summary Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Latex (Wet)"
            value={totals.latex.toFixed(1)}
            unit="kg"
            icon={<Droplets size={16} className="text-primary-600" />}
          />
          <StatCard
            label="Latex Dry (DRC)"
            value={totals.drc.toFixed(2)}
            unit="kg"
            icon={<Archive size={16} className="text-primary-600" />}
          />
          <StatCard
            label="Total Scrap (Wet)"
            value={totals.scrap.toFixed(1)}
            unit="kg"
            icon={<Archive size={16} className="text-primary-600" />}
          />
          <StatCard
            label="Total Dry Rubber"
            value={totals.totalDry.toFixed(2)}
            unit="kg"
            icon={<TrendingUp size={16} className="text-primary-600" />}
          />
        </div>

        <div className="grid grid-cols-[3fr_1fr] gap-5 items-start">
          {/* Main Table Area */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-lg">
                {selectedCC === 'all' ? 'Consolidated Collection Summary' : 'Daily Production Statement'}
              </h3>
              <div className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase tracking-wider">
                {selectedCC === 'all' ? `Estate: ${estateName}` : `CC: ${activeCC?.name}`}
              </div>
            </div>

            {selectedCC === 'all' ? (
              <DataTable
                columns={consolidatedColumns as any}
                data={consolidatedData}
                onRowClick={(row: any) => setSelectedCC(row.id)}
                rowPadding="lg"
              />
            ) : (
              <DataTable
                columns={detailedColumns as any}
                data={detailedTableData}
                rowPadding="sm"
              />
            )}

            <div className="px-5 py-3 bg-gray-50 flex justify-end gap-10 border-t border-gray-100">
              <div className="text-[13px]">
                <span className="text-gray-500 font-medium">
                  {selectedCC === 'all' ? 'Estate Total:' : 'CC Total:'}
                </span>
                <span className="ml-2 font-bold text-gray-900">{totals.totalDry.toFixed(2)} kg (Dry)</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: CC Consumables & Info */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary-600">
                <Beaker size={18} />
                <h3 className="font-bold text-gray-900 text-lg">Consumables</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-[13px] text-gray-500">Ammonia</span>
                  <span className="text-sm font-semibold text-gray-900">1.00 kg</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-[13px] text-gray-500">Chemicals</span>
                  <span className="text-sm font-semibold text-gray-900">1.90 ml</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-[13px] text-gray-500">Acid</span>
                  <span className="text-sm font-semibold text-gray-900">0.45 L</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl border border-primary-100 p-5">
              <div className="flex items-center gap-2 mb-3 text-primary-700">
                <Info size={18} />
                <h3 className="font-bold text-sm">Summary Note</h3>
              </div>
              <p className="text-xs text-primary-800 leading-relaxed opacity-80">
                {selectedCC === 'all'
                  ? "Click on any collection center row above to view the detailed tapper-wise daily production statement for that center."
                  : "Total Dry Rubber is calculated as DRC + 50% of Scrap weight. This matches official production statement standards."
                }
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
