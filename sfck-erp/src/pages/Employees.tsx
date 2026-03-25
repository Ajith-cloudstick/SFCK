import { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { TabBar } from '../components/ui/TabBar';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';

export const Employees = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const { employees, attendance, wages, selectedMonth } = useERPStore();

  const tabs = ['All', ...ESTATES.map(e => e.name)];

  const data = useMemo(() => {
    let recs = employees;
    if (activeTab !== 'All') { const estId = ESTATES.find(e => e.name === activeTab)?.id; recs = employees.filter(e => e.estate === estId); }
    return recs.map(r => ({ ...r, estateName: ESTATES.find(e => e.id === r.estate)?.name || '', status: 'Active' }));
  }, [employees, activeTab]);

  const columns = [
    { header: 'Emp ID', accessorKey: 'id' }, { header: 'Name', accessorKey: 'name' }, { header: 'Estate', accessorKey: 'estateName' },
    { header: 'Designation', accessorKey: 'designation' }, { header: 'Joining Date', accessorKey: 'joiningDate' },
    { header: 'Advance (₹)', accessorKey: 'advance', cell: (i:any) => i.getValue().toLocaleString('en-IN') },
    { header: 'Status', accessorKey: 'status', cell: (i:any) => <Badge label={i.getValue()} variant="success" /> },
    { header: 'Action', accessorKey: 'id', cell: (i:any) => (
      <button onClick={(e) => { e.stopPropagation(); setSelectedEmp(i.row.original); }} className="text-primary-600 font-medium underline cursor-pointer">View</button>
    )}
  ];

  return (
    <div>
      <PageHeader 
        title="Employee Master Data" 
        actions={<button className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-primary-700 transition-colors cursor-pointer">+ Add Employee</button>}
      />
      <div className="px-7 pb-7">
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <DataTable columns={columns as any} data={data} searchable />

        <Modal open={!!selectedEmp} onClose={() => setSelectedEmp(null)} title={selectedEmp ? `${selectedEmp.name} (${selectedEmp.id})` : ''}>
          {selectedEmp && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-xs text-gray-500">Estate</div><div className="font-medium">{selectedEmp.estateName}</div></div>
                <div><div className="text-xs text-gray-500">Designation</div><div className="font-medium">{selectedEmp.designation}</div></div>
                <div><div className="text-xs text-gray-500">Joining Date</div><div className="font-medium">{selectedEmp.joiningDate}</div></div>
                <div><div className="text-xs text-gray-500">Advance</div><div className="font-medium">₹{selectedEmp.advance.toLocaleString('en-IN')}</div></div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm font-semibold mb-3">This Month Stats</div>
                {(() => {
                  const mAtt = attendance.filter(a => a.empId === selectedEmp.id && a.date.startsWith(selectedMonth));
                  const mWage = wages.find(w => w.empId === selectedEmp.id && w.month === selectedMonth);
                  const days = mAtt.filter(a => a.status === 'present' || a.status === 'late').length;
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div><div className="text-xs text-gray-500">Days Present</div><div className="font-medium">{days}</div></div>
                      <div><div className="text-xs text-gray-500">DRC (kg)</div><div className="font-medium">{mWage?.totalDrcKg?.toFixed(2) || '0.00'}</div></div>
                      <div><div className="text-xs text-gray-500">Gross Wage</div><div className="font-medium">₹{Math.round(mWage?.grossWage || 0).toLocaleString('en-IN')}</div></div>
                      <div><div className="text-xs text-gray-500">Net Wage</div><div className="font-medium">₹{Math.round(mWage?.netWage || 0).toLocaleString('en-IN')}</div></div>
                    </div>
                  );
                })()}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm font-semibold mb-2">Attendance (Last 30 Days)</div>
                <div className="flex gap-1 flex-wrap">
                  {attendance.filter(a => a.empId === selectedEmp.id).slice(-30).map(a => (
                    <div key={a.date} title={`${a.date}: ${a.status}`}
                      className={`w-1.5 h-4 rounded-sm ${a.status === 'present' ? 'bg-green-500' : a.status === 'absent' ? 'bg-red-500' : 'bg-amber-500'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
