import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Droplets, Package,
  IndianRupee, Users, ClipboardList, ArrowLeftRight, LogOut,
  Search, Bell, X, BarChart3, GitCompareArrows, Building2
} from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { ESTATES } from '../../data/constants';

export const Sidebar = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedEstate = useERPStore(s => s.selectedEstate);
  const { selectedMonth, setSelectedMonth } = useERPStore();
  
  const estate = ESTATES.find(e => e.id === selectedEstate);
  const estateName = estate?.name || '';
  const estateCode = estate?.code || '';

  const sections = [
    {
      label: 'GENERAL',
      items: [
        { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Attendance', path: '/attendance', icon: <CheckSquare size={18} /> },
      ]
    },
    {
      label: 'PRODUCTION',
      items: [
        { name: 'Daily Records', path: '/production', icon: <Droplets size={18} /> },
        { name: 'Stock', path: '/stock', icon: <Package size={18} /> },
      ]
    },
    {
      label: 'REPORTS',
      items: [
        { name: 'Monthly Report', path: '/monthly-report', icon: <BarChart3 size={18} /> },
        { name: 'Yearly Comparison', path: '/yearly-comparison', icon: <GitCompareArrows size={18} /> },
      ]
    },
    {
      label: 'MANAGEMENT',
      items: [
        { name: 'Wages', path: '/wages', icon: <IndianRupee size={18} /> },
        { name: 'Employees', path: '/employees', icon: <Users size={18} /> },
        { name: 'Assignments', path: '/assignments', icon: <ClipboardList size={18} /> },
      ]
    }
  ];

  return (
    <>
      <div className="w-[250px] fixed left-0 top-0 bottom-0 flex flex-col z-20">
        {/* Logo + action icons */}
        <div className="px-4 pt-8 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl font-semibold text-primary-600">SFCK</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              className="text-gray-500 p-1.5 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
            </button>
            <button className="text-gray-500 p-1.5 rounded-md hover:bg-gray-200 transition-colors relative cursor-pointer">
              <Bell size={16} />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-600" />
            </button>
          </div>
        </div>

        {/* Head Office link */}
        <div className="mx-3 mb-2">
          <button
            onClick={() => navigate('/head-office')}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all cursor-pointer"
          >
            <Building2 size={14} />
            <span>SFCK Works — Head Office</span>
          </button>
        </div>

        {/* Estate selector */}
        <div className="mx-3 mb-2 p-2.5 bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Estate</div>
              <div className="text-[13px] font-semibold text-primary-700 mt-0.5">
                {estateName}
                {estateCode && <span className="ml-1.5 text-[11px] text-gray-400 font-normal">({estateCode})</span>}
              </div>
            </div>
            <button
              onClick={() => navigate('/head-office')}
              title="Change Estate"
              className="text-gray-400 p-1 rounded hover:text-primary-600 hover:bg-primary-50 transition-all cursor-pointer"
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>
        </div>

        {/* Month picker */}
        <div className="mx-3 mb-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full text-xs py-1.5 px-2"
          />
        </div>

        {/* Nav */}
        <nav className="px-3 py-1 flex-1 overflow-y-auto">
          {sections.map(section => (
            <div key={section.label} className="mb-1">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 pt-3 pb-1.5">
                {section.label}
              </div>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] no-underline mb-0.5 transition-all ${isActive
                      ? 'font-medium text-primary-700 bg-primary-50'
                      : 'font-normal text-gray-600 hover:bg-gray-200/60'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
            AD
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-medium text-gray-800">Admin</div>
            <div className="text-[11px] text-gray-400">Supervisor</div>
          </div>
          <button className="text-gray-400 p-1 cursor-pointer">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-200 bg-black/25 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[480px] bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <Search size={18} className="text-gray-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search employees, records..."
                className="flex-1 border-none bg-transparent text-[15px] p-0 ring-0 shadow-none text-gray-800 outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-gray-400 p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 text-center text-[13px] text-gray-400">
              {searchQuery ? `No results for "${searchQuery}"` : 'Start typing to search...'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
