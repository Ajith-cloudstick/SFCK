import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { TabBar } from '../components/ui/TabBar';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { UserPlus } from 'lucide-react';

export const Employees = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [isAddingEmp, setIsAddingEmp] = useState(false);
  const { employees, selectedEstate } = useERPStore();

  const tabs = ['All', 'Tapper', 'General Worker', 'Supervisor'];

  const estate = ESTATES.find(e => e.id === selectedEstate);
  const estateName = estate ? estate.name : 'All Estates';

  const data = useMemo(() => {
    // Filter by Selected Estate first
    let recs = employees.filter(e => selectedEstate === null || e.estate === selectedEstate);

    // Filter by Designation Tab
    if (activeTab !== 'All') {
      recs = recs.filter(e => e.designation.includes(activeTab));
    }

    return recs.map(r => ({
      ...r,
      estateName: ESTATES.find(e => e.id === r.estate)?.name || '',
      status: 'Active'
    }));
  }, [employees, activeTab, selectedEstate]);

  const columns = [
    { id: 'staffCode', header: 'Code', accessorKey: 'staffCode' },
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'designation', header: 'Designation', accessorKey: 'designation' },
    { id: 'category', header: 'Category', accessorKey: 'category', cell: (i: any) => <span className="capitalize">{i.getValue()}</span> },
    { id: 'joiningDate', header: 'Joined', accessorKey: 'joiningDate' },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: (i: any) => <Badge label={i.getValue()} variant="success" /> },
    {
      id: 'actions',
      header: 'Action',
      accessorKey: 'id',
      cell: (i: any) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/employees/${i.row.original.id}`); }}
          className="text-primary-600 font-medium hover:text-primary-800 transition-colors cursor-pointer text-sm underline"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Employee Directory"
        subtitle={`Estate: ${estateName}`}
        actions={
          <button
            onClick={() => setIsAddingEmp(true)}
            className="bg-primary-600  px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus size={16} />
            Add Employee
          </button>
        }
      />

      <div className="px-7 pb-10 flex flex-col gap-6">
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <DataTable columns={columns as any} data={data} searchable rowPadding="sm" />
        </div>

        {/* Add Employee Drawer */}
        <Drawer
          open={isAddingEmp}
          onClose={() => setIsAddingEmp(false)}
          title="Add New Employee"
        >
          <form className="flex flex-col h-full gap-6 py-2" onSubmit={(e) => { e.preventDefault(); setIsAddingEmp(false); }}>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">Full Name</label>
                <input required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-gray-900" placeholder="Ex: Rajan M." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">Staff Code</label>
                  <input required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-900" placeholder="Ex: KY-201" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">Designation</label>
                  <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-900">
                    <option>Tapper</option>
                    <option>General Worker</option>
                    <option>Supervisor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">Category</label>
                <select className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-900">
                  <option>Permanent</option>
                  <option>Casual</option>
                  <option>Reserved</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">Joining Date</label>
                <input type="date" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-900" />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-10 mt-auto">
              <button
                type="submit"
                className="w-full py-4 bg-primary-600 ring-2 ring-gray-200 font-bold text-[13px] uppercase tracking-widest rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-600/20 cursor-pointer"
              >
                Register Employee
              </button>
              <button
                type="button"
                onClick={() => setIsAddingEmp(false)}
                className="w-full py-4 text-gray-500 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Discard Changes
              </button>
            </div>
          </form>
        </Drawer>
      </div>
    </div>
  );
};
