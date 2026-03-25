import { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ExportButton } from '../components/ui/ExportButton';
import { TabBar } from '../components/ui/TabBar';
import { StatCard } from '../components/ui/StatCard';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { exportTableToExcel } from '../utils/exportExcel';
import { exportTableToPDF } from '../utils/exportPDF';
import { Check, X, Users, Clock, UserMinus } from 'lucide-react';

export const Attendance = () => {
  const [activeTab, setActiveTab] = useState('Daily View');
  const [statusFilter, setStatusFilter] = useState<'present' | 'absent' | 'late'>('present');

  const {
    employees,
    attendance,
    selectedEstate,
    selectedDate,
    selectedMonth,
    setSelectedDate,
    updateAttendance
  } = useERPStore();

  const handleExportPDF = () => { exportTableToPDF('Attendance Report', [{ header: 'Code', dataKey: 'id' }], [], 'attendance'); };
  const handleExportExcel = () => { exportTableToExcel('Attendance Report', [{ header: 'Code', dataKey: 'id' }], [], 'attendance'); };

  const estate = ESTATES.find(e => e.id === selectedEstate);
  const estateName = estate ? estate.name : '';

  // Calculate daily totals based on approval logic
  const dailyStats = useMemo(() => {
    const estateAttendance = attendance.filter(a => a.date === selectedDate && a.estate === selectedEstate);

    // Present: marked present OR marked late & approved
    const present = estateAttendance.filter(a => a.status === 'present' || (a.status === 'late' && a.isApproved === true)).length;

    // Absent: marked absent OR marked late & rejected
    const absent = estateAttendance.filter(a => a.status === 'absent' || (a.status === 'late' && a.isApproved === false)).length;

    // Late: marked late and NO decision yet
    const late = estateAttendance.filter(a => a.status === 'late' && a.isApproved === undefined).length;

    return { present, absent, late };
  }, [attendance, selectedDate, selectedEstate]);

  const filteredDailyData = useMemo(() => {
    if (activeTab !== 'Daily View') return [];

    return attendance.filter(a => {
      const matchDate = a.date === selectedDate;
      const matchEstate = a.estate === selectedEstate;
      if (!matchDate || !matchEstate) return false;

      if (statusFilter === 'present') {
        return a.status === 'present' || (a.status === 'late' && a.isApproved === true);
      }
      if (statusFilter === 'absent') {
        return a.status === 'absent' || (a.status === 'late' && a.isApproved === false);
      }
      if (statusFilter === 'late') {
        return a.status === 'late' && a.isApproved === undefined;
      }
      return false;
    }).map(r => {
      const e = employees.find(em => em.id === r.empId);
      const est = ESTATES.find(es => es.id === r.estate);
      return {
        ...r,
        name: e ? e.name : '-',
        estateName: est ? est.name : '-',
        designation: e ? e.designation : '-',
        markedAt: r.status === 'late' ? '08:45 AM' : r.status === 'present' ? '07:30 AM' : '-'
      };
    });
  }, [attendance, selectedDate, selectedEstate, statusFilter, employees, activeTab]);

  const monthlyData = useMemo(() => {
    if (activeTab !== 'Monthly Summary' || !selectedEstate) return [];
    return employees.filter(e => e.estate === selectedEstate).map(emp => {
      const emAtt = attendance.filter(a => a.empId === emp.id && a.date.startsWith(selectedMonth));
      const present = emAtt.filter(a => a.status === 'present').length;
      const approvedLate = emAtt.filter(a => a.status === 'late' && a.isApproved === true).length;
      const absent = emAtt.filter(a => a.status === 'absent' || (a.status === 'late' && a.isApproved === false)).length;
      const total = present + approvedLate + absent;
      return {
        id: emp.id,
        name: emp.name,
        estate: estateName,
        daysPresent: present + approvedLate,
        daysAbsent: absent,
        lateArrivals: emAtt.filter(a => a.status === 'late').length,
        attendancePct: total ? Math.round(((present + approvedLate) / total) * 100) : 0
      };
    });
  }, [activeTab, employees, attendance, selectedEstate, selectedMonth, estateName]);

  const columnsDaily = [
    { header: 'ID', accessorKey: 'empId' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Designation', accessorKey: 'designation' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const row = info.row.original;
        if (row.status === 'late' && row.isApproved === true) return <Badge label="Late (Approved)" variant="success" />;
        if (row.status === 'late' && row.isApproved === false) return <Badge label="Late (Rejected)" variant="danger" />;
        return <Badge label={row.status} variant={row.status === 'present' ? 'success' : row.status === 'absent' ? 'danger' : 'warning'} />;
      }
    },
    { header: 'Marked At', accessorKey: 'markedAt' },
    {
      header: 'Action',
      id: 'actions',
      cell: (info: any) => {
        const row = info.row.original;
        if (row.status === 'late' && row.isApproved === undefined) {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => updateAttendance(selectedDate, row.empId, { isApproved: true })}
                className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-[11px] font-bold transition-all border border-green-100 cursor-pointer"
              >
                <Check size={12} />
                APPROVE
              </button>
              <button
                onClick={() => updateAttendance(selectedDate, row.empId, { isApproved: false })}
                className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-[11px] font-bold transition-all border border-red-100 cursor-pointer"
              >
                <X size={12} />
                REJECT
              </button>
            </div>
          );
        }
        return null;
      }
    }
  ];

  const columnsMonthly = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Estate', accessorKey: 'estate' },
    { header: 'Days Present', accessorKey: 'daysPresent' },
    { header: 'Days Absent', accessorKey: 'daysAbsent' },
    { header: 'Late Arrivals', accessorKey: 'lateArrivals' },
    {
      header: 'Attendance %', accessorKey: 'attendancePct', cell: (i: any) => {
        const pct = i.getValue();
        return <span className={`font-semibold ${pct >= 90 ? 'text-green-700' : pct >= 75 ? 'text-amber-700' : 'text-red-700'}`}>{pct}%</span>;
      }
    }
  ];

  return (
    <div>
      <PageHeader
        title="Attendance Management"
        subtitle={`Estate: ${estateName}`}
        actions={<ExportButton onPDF={handleExportPDF} onExcel={handleExportExcel} />}
      />

      <div className="px-7 pb-7">
        <TabBar
          tabs={['Daily View', 'Monthly Summary']}
          active={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'Daily View' && (
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Daily Production Attendance</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-fit bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => setStatusFilter('present')}
                className="text-left cursor-pointer"
              >
                <StatCard 
                  label="Present Workers" 
                  value={dailyStats.present} 
                  icon={<Users size={16} className="text-green-600" />}
                  className={statusFilter === 'present' ? 'ring-2 ring-primary-500 ring-offset-2 scale-[1.02]' : 'hover:bg-gray-50 opacity-80'}
                />
              </button>
              <button 
                onClick={() => setStatusFilter('absent')}
                className="text-left cursor-pointer"
              >
                <StatCard 
                  label="Absent Workers" 
                  value={dailyStats.absent} 
                  icon={<UserMinus size={16} className="text-red-600" />}
                  className={statusFilter === 'absent' ? 'ring-2 ring-primary-500 ring-offset-2 scale-[1.02]' : 'hover:bg-gray-50 opacity-80'}
                />
              </button>
              <button 
                onClick={() => setStatusFilter('late')}
                className="text-left cursor-pointer"
              >
                <StatCard 
                  label="Pending Late Approval" 
                  value={dailyStats.late} 
                  icon={<Clock size={16} className="text-amber-600" />}
                  className={statusFilter === 'late' ? 'ring-2 ring-primary-500 ring-offset-2 scale-[1.02]' : 'hover:bg-gray-50 opacity-80'}
                />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Showing: {statusFilter.toUpperCase()}
                </span>
                <span className="text-[11px] text-gray-400 font-medium italic">
                  * Late arrivals must be approved to count as present
                </span>
              </div>
              <DataTable
                columns={columnsDaily as any}
                data={filteredDailyData}
                searchable
              />
            </div>
          </div>
        )}

        {activeTab === 'Monthly Summary' && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <DataTable columns={columnsMonthly as any} data={monthlyData} searchable />
          </div>
        )}
      </div>
    </div>
  );
};
