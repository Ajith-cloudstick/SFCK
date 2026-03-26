import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { ArrowLeft, Calendar, TrendingUp, Info, History, CreditCard } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { employees, attendance, production, wages, selectedMonth, setSelectedMonth } = useERPStore();
  const pageSize = 10;

  const employee = useMemo(() => 
    employees.find(e => e.id === Number(id)), 
    [employees, id]
  );

  // Reset pagination on month or employee change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, id]);

  const stats = useMemo(() => {
    if (!employee) return null;
    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const monthAtt = attendance.filter(a => a.empId === employee.id && a.date.startsWith(selectedMonth));
    const presentDays = monthAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    
    const monthProd = production.filter(p => p.empId === employee.id && p.date.startsWith(selectedMonth));
    const totalDrc = monthProd.reduce((sum, p) => sum + p.totalDryKg, 0);
    const totalScrap = monthProd.reduce((sum, p) => sum + p.scrapDryKg, 0);
    
    const employeeWages = wages.filter(w => w.empId === employee.id).sort((a,b) => b.month.localeCompare(a.month));
    const currentMonthWage = employeeWages.find(w => w.month === selectedMonth);

    // Generate daily ledger
    const ledger = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const att = monthAtt.find(a => a.date === dateStr);
      const prod = monthProd.find(p => p.date === dateStr);
      
      return {
        date: dateStr,
        status: att?.status || 'off',
        block: prod?.workItemId || '-',
        latex: prod?.latexWeight || 0,
        scrap: prod?.scrapsKg || 0,
        drc: prod?.totalDryKg || 0,
        dailyWage: att && (att.status === 'present' || att.status === 'late') ? (currentMonthWage?.grossWage || 0) / 26 : 0
      };
    });

    return { presentDays, totalDrc, totalScrap, monthProd, currentMonthWage, employeeWages, monthAtt, ledger };
  }, [employee, attendance, production, wages, selectedMonth]);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-full"><Info size={32} /></div>
        <h3 className="text-xl font-bold text-gray-900">Employee Not Found</h3>
        <button onClick={() => navigate('/employees')} className="text-primary-600 font-medium underline">Back to List</button>
      </div>
    );
  }

  const estateName = ESTATES.find(e => e.id === employee.estate)?.name || 'Unknown';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      {/* Header Sticky Area */}
      <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md px-7 py-4 flex justify-between items-center border-b border-gray-100/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/employees')}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-gray-900 leading-tight uppercase tracking-tight">Worker Profile Dashboard</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{employee.name} — {employee.staffCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col px-3">
             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Audit Month</span>
             <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-[13px] font-black text-primary-700 outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 p-7 pt-8">
        {/* Left Column: Worker Identity & Status (Sticky) */}
        <div className="lg:w-[340px] flex flex-col gap-6">
          <div className="sticky top-28 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center text-center gap-5">
              <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center text-3xl font-black border-4 border-white shadow-md">
                {employee.name.charAt(0)}
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-tight">{employee.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase tracking-widest">{employee.staffCode}</span>
                  <Badge label="ACTIVE" variant="success" />
                </div>
              </div>
              <div className="w-full h-px bg-gray-50 my-2" />
              <div className="grid grid-cols-1 w-full gap-5 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estate & Category</span>
                  <p className="text-[13px] font-extrabold text-gray-800">{estateName} • {employee.category}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Joining Date</span>
                  <p className="text-[13px] font-extrabold text-gray-800">{employee.joiningDate}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Experience Range</span>
                  <p className="text-[13px] font-extrabold text-gray-800">{employee.yearsExperience} Years Service (Grade {employee.experienceWeightage})</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-6">
                <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest border-b border-gray-50 pb-4 flex items-center gap-2">
                  <History size={14} className="text-violet-500" />
                  Leave Balances
                </h4>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Earned Leave</span>
                      <span className="text-[13px] font-black text-emerald-600 leading-none">{(employee.leaveStats?.annualEarned || 0) - (employee.leaveStats?.usedEarned || 0)} / {employee.leaveStats?.annualEarned}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Sick Leave</span>
                      <span className="text-[13px] font-black text-violet-600 leading-none">{(employee.leaveStats?.annualSick || 0) - (employee.leaveStats?.usedSick || 0)} / 14</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Main Column: Scrollable Data Content */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Top KPI Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Attendance %</span>
              <div className="text-2xl font-black text-gray-900 leading-none">{((stats?.presentDays || 0) / 26 * 100).toFixed(0)}% <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Active</span></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Monthly DRC</span>
              <div className="text-2xl font-black text-gray-900 leading-none">{stats?.totalDrc.toFixed(2)} <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Kg</span></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Last Net Pay</span>
              <div className="text-2xl font-black text-gray-900 leading-none">₹{Math.round(stats?.employeeWages[0]?.netWage || 0).toLocaleString()}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-1">
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Block Assignments</span>
              <div className="text-2xl font-black text-gray-900 leading-none">{employee.assignedBlocks?.length || 0} <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Fixed</span></div>
            </div>
          </div>

          {/* Monthly Production Ledger (Condensed) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
              <h3 className="font-black text-gray-900 text-[11px] uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-primary-500" />
                Monthly Yield History (Condensed)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
                    <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Status</th>
                    <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Block</th>
                    <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Latex (kg)</th>
                    <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Scrap (kg)</th>
                    <th className="px-8 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Net DRC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[12px]">
                  {stats?.ledger
                    .filter(l => l.status !== 'off' || l.drc > 0)
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map(row => (
                    <tr key={row.date} className="hover:bg-primary-50/30 transition-colors">
                      <td className="px-8 py-3 font-bold text-gray-900">{format(new Date(row.date), 'dd MMM yyyy')}</td>
                      <td className="px-8 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase ${
                          row.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 
                          row.status === 'late' ? 'bg-amber-100 text-amber-700' : 
                          row.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'text-gray-300'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-8 py-3 text-gray-500 font-extrabold">{row.block}</td>
                      <td className="px-8 py-3 text-right text-gray-500 font-bold">{row.latex > 0 ? row.latex.toFixed(1) : '–'}</td>
                      <td className="px-8 py-3 text-right text-gray-500 font-bold">{row.scrap > 0 ? row.scrap.toFixed(1) : '–'}</td>
                      <td className="px-8 py-3 text-right font-black text-primary-700">{row.drc > 0 ? row.drc.toFixed(2) : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Table Footer with Pagination */}
              <div className="px-8 py-4 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Page {currentPage} of {Math.ceil((stats?.ledger.filter(l => l.status !== 'off' || l.drc > 0).length || 1) / pageSize)}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 disabled:text-gray-300 transition-colors border border-gray-100 bg-white rounded-lg shadow-xs"
                  >
                    Prev
                  </button>
                  <button 
                    disabled={currentPage >= Math.ceil((stats?.ledger.filter(l => l.status !== 'off' || l.drc > 0).length || 1) / pageSize)}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 disabled:text-gray-300 transition-colors border border-gray-100 bg-white rounded-lg shadow-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Attendance Log & Payroll History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-6 p-7">
              <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-orange-500" />
                Attendance Exceptions
              </h4>
              <div className="flex flex-col gap-3">
                 {stats?.ledger.filter(l => l.status === 'late' || l.status === 'absent').length === 0 ? (
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic py-8 text-center bg-gray-50 rounded-2xl">Perfect attendance this month</p>
                 ) : (
                  stats?.ledger.filter(l => l.status === 'late' || l.status === 'absent').map(ex => (
                    <div key={ex.date} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-900 uppercase leading-none">{format(new Date(ex.date), 'dd MMMM yyyy')}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">{ex.status === 'late' ? 'Arrival after 08:30 AM' : 'No record found'}</span>
                      </div>
                      <Badge label={ex.status.toUpperCase()} variant={ex.status === 'late' ? 'warning' : 'danger'} />
                    </div>
                  ))
                 )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col gap-6 p-7">
              <h4 className="font-black text-gray-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} className="text-emerald-500" />
                Recent Payroll History
              </h4>
              <div className="flex flex-col gap-3">
                {stats?.employeeWages.slice(0, 4).map(wage => (
                   <div key={wage.month} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-emerald-50/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-gray-900 uppercase tracking-tighter leading-none">{format(new Date(wage.month), 'MMMM yyyy')}</span>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2">Net Pay Disbursed</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[14px] font-black text-gray-900 leading-none">₹{Math.round(wage.netWage).toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: {wage.month.replace('-', '')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
