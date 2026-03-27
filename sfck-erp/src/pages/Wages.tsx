import { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ExportButton } from '../components/ui/ExportButton';
import { TabBar } from '../components/ui/TabBar';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';

export const Wages = () => {
  const [activeTab, setActiveTab] = useState('Wage Inputs');
  const { employees, wages, selectedEstate, selectedMonth } = useERPStore();

  const estate = ESTATES.find(e => e.id === selectedEstate);
  const estateName = estate ? estate.name : 'All Estates';

  const wageData = useMemo(() => {
    return wages
      .filter(w => w.month === selectedMonth && (selectedEstate === null || w.estate === selectedEstate))
      .map((r, idx) => {
        const e = employees.find(em => em.id === r.empId);
        const da = (r.oldDa || 0) + (r.newDa || 0);
        const allowances = (r.gwPay || 0) + (r.tpgPay || 0) + (r.hlPay || 0) + (r.sikPay || 0) + (r.cutInc || 0) + (r.wAllo || 0) + (r.ifa || 0) + (r.lcc || 0) + (r.sltr || 0) + (r.extraTree || 0) + (r.interimRelief || 0);
        const bonusEarnings = r.grossWage - allowances;

        return {
          ...r,
          slNo: idx + 1,
          id: r.empId,
          name: e ? e.name : '-',
          estate: ESTATES.find(es => es.id === r.estate)?.name || '',
          staffCode: e?.staffCode || '-',
          da,
          bonusEarnings,
          totPay: r.grossWage,
          totInc: r.incentiveAmount,
          totDeduction: r.totalDeduction,
        };
      });
  }, [wages, selectedMonth, selectedEstate, employees]);

  const fmt = (v: number | undefined | null) =>
    v == null ? '-' : Math.round(v).toLocaleString('en-IN');

  const fmt2 = (v: number | undefined | null) =>
    v == null ? '-' : Number(v).toFixed(2);

  const totals = useMemo(() => {
    const keys = ['grossWage', 'epf', 'lic', 'totalDeduction', 'netWage', 'trwLoan', 'hba', 'medicalLoan', 'penalty', 'kseb', 'achankovil', 'gpais', 'coconut', 'stamp', 'bonusEarnings', 'festAdv'];
    const res: Record<string, number> = {};
    keys.forEach(k => { res[k] = wageData.reduce((s, r: any) => s + (r[k] || 0), 0); });
    return res;
  }, [wageData]);

  // --- Column Definitions ---

  const columnsLine1 = [
    { id: 'slNo', header: 'Sl.No', accessorKey: 'slNo' },
    { id: 'staffCode', header: 'Code', accessorKey: 'staffCode' },
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'pfno', header: 'PFNO', accessorKey: 'id' },
    { id: 'month', header: 'Month', accessorKey: 'month' },
    { id: 'basic', header: 'Basic', accessorKey: 'basic', cell: (i: any) => fmt(i.getValue()) },
    { id: 'oldDa', header: 'Old DA', accessorKey: 'oldDa', cell: (i: any) => fmt(i.getValue()) },
    { id: 'newDa', header: 'New DA', accessorKey: 'newDa', cell: (i: any) => fmt(i.getValue()) },
    { id: 'oldGw', header: 'Old GW', accessorKey: 'oldGw', cell: (i: any) => fmt(i.getValue()) },
    { id: 'newGw', header: 'New GW', accessorKey: 'newGw', cell: (i: any) => fmt(i.getValue()) },
    { id: 'oldTd4', header: 'Old TD4', accessorKey: 'oldTd4', cell: (i: any) => fmt(i.getValue()) },
    { id: 'oldTd2', header: 'Old TD2', accessorKey: 'oldTd2', cell: (i: any) => fmt(i.getValue()) },
    { id: 'newTd4', header: 'New TD4', accessorKey: 'newTd4', cell: (i: any) => fmt(i.getValue()) },
    { id: 'newTd2', header: 'New TD2', accessorKey: 'newTd2', cell: (i: any) => fmt(i.getValue()) },
    { id: 'oldSd', header: 'Old SD', accessorKey: 'oldSd', cell: (i: any) => fmt(i.getValue()) },
    { id: 'newSd', header: 'New SD', accessorKey: 'newSd', cell: (i: any) => fmt(i.getValue()) },
    { id: 'holiday', header: 'Holiday', accessorKey: 'holiday' },
    { id: 'totalAttd', header: 'Total Attd', accessorKey: 'totalAttd' },
  ];

  const columnsLine2 = [
    { header: 'Code', accessorKey: 'staffCode' },
    { header: 'Holiday', accessorKey: 'holiday' },
    { header: 'CLS4', accessorKey: 'cls4', cell: (i: any) => fmt(i.getValue()) },
    { header: 'CLS2', accessorKey: 'cls2', cell: (i: any) => fmt(i.getValue()) },
    { header: 'STD4', accessorKey: 'std4', cell: (i: any) => fmt(i.getValue()) },
    { header: 'STD2', accessorKey: 'std2', cell: (i: any) => fmt(i.getValue()) },
    { header: 'CL4 Rate', accessorKey: 'cl4Rate', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'CL2 Rate', accessorKey: 'cl2Rate', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'Scrap Rate', accessorKey: 'scrapRate', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'DRC%', accessorKey: 'totalDrcKg', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'Latex4', accessorKey: 'latex4', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'Latex2', accessorKey: 'latex2', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'Scrap4', accessorKey: 'scrap4', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'Scrap2', accessorKey: 'scrap2', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'LDRC', accessorKey: 'ldrc', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'SDRC', accessorKey: 'sdrc', cell: (i: any) => fmt2(i.getValue()) },
  ];

  const columnsLine3 = [
    { header: 'Code', accessorKey: 'staffCode' },
    { header: 'TDRC4', accessorKey: 'tdrc4', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'LDRC2', accessorKey: 'ldrc2', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'SDRC2', accessorKey: 'sdrc2', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'TDRC2', accessorKey: 'tdrc2', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'LDRC4%', accessorKey: 'ldrc4Pct', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'LDRC2%', accessorKey: 'ldrc2Pct', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'SDRC4%', accessorKey: 'sdrc4Pct', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'SDRC2%', accessorKey: 'sdrc2Pct', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'TOV4', accessorKey: 'tov4', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'TOV2', accessorKey: 'tov2', cell: (i: any) => fmt2(i.getValue()) },
    { header: 'Tot Inc', accessorKey: 'incentiveAmount', cell: (i: any) => fmt(i.getValue()) },
    { header: 'GW Pay', accessorKey: 'gwPay', cell: (i: any) => fmt(i.getValue()) },
    { header: 'TPG Pay', accessorKey: 'tpgPay', cell: (i: any) => fmt(i.getValue()) },
    { header: 'H/L Pay', accessorKey: 'hlPay', cell: (i: any) => fmt(i.getValue()) },
    { header: 'Sik Pay', accessorKey: 'sikPay', cell: (i: any) => fmt(i.getValue()) },
    { header: 'Cut Inc', accessorKey: 'cutInc', cell: (i: any) => fmt(i.getValue()) },
    { header: 'W.Allo', accessorKey: 'wAllo', cell: (i: any) => fmt(i.getValue()) },
    { header: 'Total Attd', accessorKey: 'totalAttd' },
  ];

  const columnsLine4 = [
    { id: 'staffCode4', header: 'Code', accessorKey: 'staffCode' },
    { id: 'ifa4', header: 'IFA', accessorKey: 'ifa', cell: (i: any) => fmt(i.getValue()) },
    { id: 'lcc4', header: 'LCC', accessorKey: 'lcc', cell: (i: any) => fmt(i.getValue()) },
    { id: 'sltr4', header: 'Sltr', accessorKey: 'sltr', cell: (i: any) => fmt(i.getValue()) },
    { id: 'extraTree4', header: 'Extra Tree', accessorKey: 'extraTree', cell: (i: any) => fmt(i.getValue()) },
    { id: 'interimRelief4', header: 'Interim Relief', accessorKey: 'interimRelief', cell: (i: any) => fmt(i.getValue()) },
    { id: 'grossWage4', header: 'Tot Pay', accessorKey: 'grossWage', cell: (i: any) => <span className="font-bold text-primary-700">₹{fmt(i.getValue())}</span> },
    { id: 'bonusEarnings4', header: 'Bonus Earnings', accessorKey: 'bonusEarnings', cell: (i: any) => fmt(i.getValue()) },
    { id: 'epf4', header: 'CPF', accessorKey: 'epf', cell: (i: any) => <span className="font-bold text-orange-600">₹{fmt(i.getValue())}</span> },
    { id: 'lic4', header: 'LIC', accessorKey: 'lic', cell: (i: any) => fmt(i.getValue()) },
    { id: 'iwf4', header: 'LWF', accessorKey: 'iwf', cell: (i: any) => fmt(i.getValue()) },
    { id: 'wageAdv4', header: 'Wage Adv', accessorKey: 'wageAdv', cell: (i: any) => fmt(i.getValue()) },
    { id: 'pTax4', header: 'P.Tax', accessorKey: 'pTax', cell: (i: any) => fmt(i.getValue()) },
    { id: 'festAdv4', header: 'Fest Adv', accessorKey: 'festAdv', cell: (i: any) => fmt(i.getValue()) },
    { id: 'exRec4', header: 'Ex Rec', accessorKey: 'exRec', cell: (i: any) => fmt(i.getValue()) },
  ];

  const columnsLine5 = [
    { id: 'staffCode5', header: 'Code', accessorKey: 'staffCode' },
    { id: 'name5', header: 'Name', accessorKey: 'name' },
    { id: 'trwLoan5', header: 'TRW Loan', accessorKey: 'trwLoan', cell: (i: any) => fmt(i.getValue()) },
    { id: 'trwSuerty5', header: 'TRW Suerty', accessorKey: 'trwSuerty', cell: (i: any) => fmt(i.getValue()) },
    { id: 'hba5', header: 'HBA', accessorKey: 'hba', cell: (i: any) => fmt(i.getValue()) },
    { id: 'medicalLoan5', header: 'Medical Loan', accessorKey: 'medicalLoan', cell: (i: any) => fmt(i.getValue()) },
    { id: 'medAdv5', header: 'Med Adv', accessorKey: 'medAdv', cell: (i: any) => fmt(i.getValue()) },
    { id: 'penalty5', header: 'F&Penalty', accessorKey: 'penalty', cell: (i: any) => fmt(i.getValue()) },
    { id: 'banana5', header: 'Banana', accessorKey: 'banana', cell: (i: any) => fmt(i.getValue()) },
    { id: 'kseb5', header: 'KSEB', accessorKey: 'kseb', cell: (i: any) => fmt(i.getValue()) },
    { id: 'achankovil5', header: 'Achankovil', accessorKey: 'achankovil', cell: (i: any) => fmt(i.getValue()) },
    { id: 'gpais5', header: 'GPAIS', accessorKey: 'gpais', cell: (i: any) => fmt(i.getValue()) },
    { id: 'amAdv5', header: 'AM Adv', accessorKey: 'amAdv', cell: (i: any) => fmt(i.getValue()) },
    { id: 'coconut5', header: 'Coconut', accessorKey: 'coconut', cell: (i: any) => fmt(i.getValue()) },
    { id: 'stamp5', header: 'Stamp', accessorKey: 'stamp', cell: (i: any) => fmt(i.getValue()) },
    { id: 'excessPaid5', header: 'Excess Paid', accessorKey: 'excessPaid', cell: (i: any) => fmt(i.getValue()) },
    { id: 'totalDeduction5', header: 'Total Deduction', accessorKey: 'totalDeduction', cell: (i: any) => <span className="font-bold text-red-600">₹{fmt(i.getValue())}</span> },
    { id: 'netWage5', header: 'Net Wage', accessorKey: 'netWage', cell: (i: any) => <span className="font-bold text-emerald-700">₹{fmt(i.getValue())}</span> },
  ];

  const columnsPayRoll = [
    { id: 'slNoP', header: 'Sl.No', accessorKey: 'slNo' },
    { id: 'staffCodeP', header: 'Code', accessorKey: 'staffCode' },
    { id: 'nameP', header: 'Name', accessorKey: 'name' },
    { id: 'basicP', header: 'Basic', accessorKey: 'basic', cell: (i: any) => fmt(i.getValue()) },
    { id: 'daP', header: 'DA', accessorKey: 'da', cell: (i: any) => fmt(i.getValue()) },
    { id: 'totalAttdP', header: 'Total Attd', accessorKey: 'totalAttd' },
    { id: 'totalDrcKgP', header: 'Total DRC', accessorKey: 'totalDrcKg', cell: (i: any) => fmt2(i.getValue()) },
    { id: 'pieceRateAmountP', header: 'Piece Rate', accessorKey: 'pieceRateAmount', cell: (i: any) => fmt(i.getValue()) },
    { id: 'incentiveAmountP', header: 'Incentive', accessorKey: 'incentiveAmount', cell: (i: any) => fmt(i.getValue()) },
    { id: 'grossWageP', header: 'Gross Wage', accessorKey: 'grossWage', cell: (i: any) => fmt(i.getValue()) },
    { id: 'epfP', header: 'EPF', accessorKey: 'epf', cell: (i: any) => fmt(i.getValue()) },
    { id: 'licP', header: 'LIC', accessorKey: 'lic', cell: (i: any) => fmt(i.getValue()) },
    { id: 'iwfP', header: 'IWF', accessorKey: 'iwf', cell: (i: any) => fmt(i.getValue()) },
    { id: 'totalDeductionP', header: 'Total Deduction', accessorKey: 'totalDeduction', cell: (i: any) => <span className="font-bold text-red-600">₹{fmt(i.getValue())}</span> },
    { id: 'netWageP', header: 'Net Pay', accessorKey: 'netWage', cell: (i: any) => <span className="font-bold text-emerald-700">₹{fmt(i.getValue())}</span> },
  ];

  const columnsLedger = [
    { id: 'staffCodeL', header: 'Code', accessorKey: 'staffCode' },
    { id: 'nameL', header: 'Name', accessorKey: 'name' },
    { id: 'trwLoanL', header: 'TRW Loan', accessorKey: 'trwLoan', cell: (i: any) => fmt(i.getValue()) },
    { id: 'hbaL', header: 'HBA', accessorKey: 'hba', cell: (i: any) => fmt(i.getValue()) },
    { id: 'medicalLoanL', header: 'Medical Loan', accessorKey: 'medicalLoan', cell: (i: any) => fmt(i.getValue()) },
    { id: 'penaltyL', header: 'Penalty', accessorKey: 'penalty', cell: (i: any) => fmt(i.getValue()) },
    { id: 'bananaL', header: 'Banana', accessorKey: 'banana', cell: (i: any) => fmt(i.getValue()) },
    { id: 'ksebL', header: 'KSEB', accessorKey: 'kseb', cell: (i: any) => fmt(i.getValue()) },
    { id: 'achankovilL', header: 'Achankovil', accessorKey: 'achankovil', cell: (i: any) => fmt(i.getValue()) },
    { id: 'gpaisL', header: 'GPAIS', accessorKey: 'gpais', cell: (i: any) => fmt(i.getValue()) },
    { id: 'coconutL', header: 'Coconut', accessorKey: 'coconut', cell: (i: any) => fmt(i.getValue()) },
    { id: 'stampL', header: 'Stamp', accessorKey: 'stamp', cell: (i: any) => fmt(i.getValue()) },
    { id: 'totalDeductionL', header: 'Total Deduction', accessorKey: 'totalDeduction', cell: (i: any) => <span className="font-bold text-red-600">₹{fmt(i.getValue())}</span> },
  ];

  const columnsEPF = [
    { id: 'slNoE', header: 'Sl.No', accessorKey: 'slNo' },
    { id: 'staffCodeE', header: 'Staff Code', accessorKey: 'staffCode' },
    { id: 'nameE', header: 'Name', accessorKey: 'name' },
    { id: 'wagesE', header: 'Wages', accessorKey: 'bonusEarnings', cell: (i: any) => fmt(i.getValue()) },
    { id: 'epfE', header: 'EPF 12%', accessorKey: 'epf', cell: (i: any) => <span className="font-bold text-orange-600">₹{fmt(i.getValue())}</span> },
  ];

  const columnsFestAdv = [
    { id: 'slNoF', header: 'Sl.No', accessorKey: 'slNo' },
    { id: 'staffCodeF', header: 'Staff Code', accessorKey: 'staffCode' },
    { id: 'nameF', header: 'Name', accessorKey: 'name' },
    { id: 'festAdvF', header: 'Festival Advance Recovery', accessorKey: 'festAdv', cell: (i: any) => <span className="font-bold text-purple-600">₹{fmt(i.getValue())}</span> },
  ];

  const TABS = ['Wage Inputs', 'DRC Data', 'Incentives', 'Statutory', 'Recoveries', 'Pay Roll', 'Ledger', 'EPF', 'Fest Adv'];

  const tabMeta: Record<string, { title: string; sheet: string; columns: any[] }> = {
    'Wage Inputs': { title: 'Basic Wage Inputs', sheet: 'line 1', columns: columnsLine1 },
    'DRC Data': { title: 'DRC / Production Data', sheet: 'line 2', columns: columnsLine2 },
    'Incentives': { title: 'Incentive & Allowance Calculations', sheet: 'line 3', columns: columnsLine3 },
    'Statutory': { title: 'Total Pay & Statutory Deductions', sheet: 'line 4', columns: columnsLine4 },
    'Recoveries': { title: 'External Deductions & Net Pay', sheet: 'line 5', columns: columnsLine5 },
    'Pay Roll': { title: 'Payroll Summary', sheet: 'pay roll', columns: columnsPayRoll },
    'Ledger': { title: 'Deductions Ledger', sheet: 'Ledger', columns: columnsLedger },
    'EPF': { title: 'EPF Recovery Sheet', sheet: 'EPF', columns: columnsEPF },
    'Fest Adv': { title: 'Festival Advance Recovery', sheet: 'FES ADV', columns: columnsFestAdv },
  };

  const current = tabMeta[activeTab];

  return (
    <div className="flex flex-col min-h-screen ">
      <PageHeader
        title="Wage Register"
        subtitle={`Estate: ${estateName} • Period: ${selectedMonth}`}
      />

      <div className="px-7 pb-10 flex flex-col gap-6">

        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{current.title}</h3>
            <div className="flex items-center gap-3">
              <ExportButton onPDF={() => { }} onExcel={() => { }} />
            </div>
          </div>
          <DataTable
            columns={current.columns as any}
            data={wageData}
            searchable
            rowPadding="sm"
          />

          {/* Contextual Summary Bar */}
          {['Pay Roll', 'Ledger', 'EPF', 'Statutory', 'Recoveries'].includes(activeTab) && (
            <div className="px-5 py-4 bg-gray-50 flex justify-end gap-10 border-t border-gray-100">
              {activeTab === 'Pay Roll' && (
                <>
                  <MiniMetric label="Total Gross" value={fmt(totals.grossWage)} color="text-primary-700" />
                  <MiniMetric label="Total CPF" value={fmt(totals.epf)} color="text-orange-700" />
                  <MiniMetric label="Total Ded." value={fmt(totals.totalDeduction)} color="text-red-700" />
                  <MiniMetric label="Total Net Pay" value={fmt(totals.netWage)} color="text-emerald-700" />
                </>
              )}
              {activeTab === 'Ledger' && (
                <>
                  <MiniMetric label="Total Recoveries" value={fmt(totals.totalDeduction)} color="text-red-700" />
                </>
              )}
              {activeTab === 'EPF' && (
                <>
                  <MiniMetric label="Recovery Total" value={fmt(totals.epf)} color="text-orange-700" />
                </>
              )}
              {activeTab === 'Recoveries' && (
                <>
                  <MiniMetric label="Total Deduction" value={fmt(totals.totalDeduction)} color="text-red-700" />
                  <MiniMetric label="Net Payable" value={fmt(totals.netWage)} color="text-emerald-700" />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MiniMetric = ({ label, value, color = "text-gray-700" }: { label: string; value: string; color?: string }) => (
  <div className="flex border-r border-gray-200 last:border-0 pr-10 last:pr-0 items-center gap-3">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
    <span className={`text-md font-bold ${color} font-mono tracking-tight whitespace-nowrap`}>₹{value}</span>
  </div>
);
