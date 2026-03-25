import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';
import { ArrowLeft, Users, Filter } from 'lucide-react';

export const OrgEmployees = () => {
  const navigate = useNavigate();
  const { employees } = useERPStore();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [designationFilter, setDesignationFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return employees.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (designationFilter !== 'all' && e.designation !== designationFilter) return false;
      return true;
    });
  }, [employees, categoryFilter, designationFilter]);

  const tableData = useMemo(() => {
    return filtered.map(e => {
      const estate = ESTATES.find(est => est.id === e.estate);
      return {
        staffCode: e.staffCode,
        name: e.name,
        estate: estate?.name || '',
        designation: e.designation,
        category: e.category,
        tapperClass: e.tapperClass ? `Class ${e.tapperClass}` : '—',
        experience: `${e.yearsExperience}y (${e.experienceWeightage})`,
        joiningDate: e.joiningDate,
      };
    });
  }, [filtered]);

  const categories = ['all', 'permanent', 'casual', 'dependent', 'reserved'];
  const designations = ['all', ...new Set(employees.map(e => e.designation))];

  const columns = [
    { header: 'Staff Code', accessorKey: 'staffCode' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Estate', accessorKey: 'estate' },
    { header: 'Designation', accessorKey: 'designation' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Tapper Class', accessorKey: 'tapperClass' },
    { header: 'Experience', accessorKey: 'experience' },
    { header: 'Joining Date', accessorKey: 'joiningDate' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center gap-4">
          <button onClick={() => navigate('/head-office')} className="text-gray-400 hover:text-primary-600 p-1 cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-primary-600" /> All Employees
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {employees.length} employees</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-6 flex flex-col gap-5">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <Filter size={16} className="text-gray-400" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Category:</span>
            <div className="flex gap-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    categoryFilter === cat 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Role:</span>
            <select
              value={designationFilter}
              onChange={e => setDesignationFilter(e.target.value)}
              className="text-xs bg-gray-100 border-none rounded-md px-2 py-1 text-gray-700"
            >
              {designations.map(d => (
                <option key={d} value={d}>{d === 'all' ? 'All Roles' : d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Muster Summary */}
        <div className="grid grid-cols-4 gap-4">
          {(['permanent', 'casual', 'dependent', 'reserved'] as const).map(cat => (
            <div key={cat} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">{cat} Workers</div>
              <div className="text-xl font-bold text-gray-900 mt-1 font-mono">{employees.filter(e => e.category === cat).length}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <DataTable columns={columns as any} data={tableData} searchable rowPadding="sm" />
        </div>
      </div>
    </div>
  );
};
