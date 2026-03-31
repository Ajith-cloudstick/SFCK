import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Droplets, Package,
  IndianRupee, Users, ClipboardList, ArrowLeftRight, LogOut,
  Search, Bell, X, BarChart3, GitCompareArrows, Layers
} from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { ESTATES } from '../../data/constants';

export const Sidebar = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedEstate = useERPStore(s => s.selectedEstate);
  const { selectedMonth, setSelectedMonth, setSelectedEstate } = useERPStore();

  const estate = ESTATES.find(e => e.id === selectedEstate);
  const estateName = estate?.name || '';
  const estateCode = estate?.code || '';

  const sections = (selectedEstate === null ? [
    {
      label: 'ORGANIZATION',
      items: [
        { name: 'Head Office Overview', path: '/head-office', icon: <LayoutDashboard size={18} /> },
        { name: 'All Employees', path: '/org/employees', icon: <Users size={18} /> },
        // { name: 'Wages Overview', path: '/wages', icon: <IndianRupee size={18} /> },
        { name: 'Production Overview', path: '/org/production', icon: <Droplets size={18} /> },
        { name: 'Stock', path: '/stock', icon: <Package size={18} /> },
      ]
    },

  ] : [
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
        { name: 'Block Register', path: '/blocks', icon: <Layers size={18} /> },
        { name: 'Assignments', path: '/assignments', icon: <ClipboardList size={18} /> },
      ]
    }
  ]) as any[];

  const handleGoToHeadOffice = () => {
    setSelectedEstate(null);
    navigate('/head-office');
  };

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
        </div >

        {/* Action button based on mode */}
        < div className="mx-3 mb-2 mt-2" >
          {selectedEstate !== null ? (
            <button
              onClick={handleGoToHeadOffice}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-all border border-primary-100 cursor-pointer group"
            >
              <ArrowLeftRight size={16} className="text-primary-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Head Office</span>
            </button>
          ) : (
            <div className="px-3 py-2 text-[12px] text-gray-400 font-medium uppercase tracking-wider">
              Head Office Mode
            </div>
          )
          }
        </div >

        {/* Selected Estate Indicator (only in Estate mode) */}
        {
          selectedEstate !== null && (
            <div className="mx-3 mb-2 p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Current Estate</div>
                <div className="text-[14px] font-bold text-gray-900 mt-0.5 flex items-center justify-between">
                  <span>{estateName}</span>
                  <span className="text-[11px] text-gray-400 font-normal ml-1">#{estateCode}</span>
                </div>
              </div>
            </div>
          )
        }

        {/* Month picker */}
        <div className="mx-3 mb-4 mt-2">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold px-2 mb-1.5">Reporting Period</div>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full text-xs py-2 px-3 bg-gray-50 border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none transition-all"
          />
        </div>

        {/* Nav */}
        <nav className="px-3 py-1 flex-1 overflow-y-auto">
          {sections.map(section => (
            <div key={section.label} className="mb-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-2 border-b border-gray-100 mb-2">
                {section.label}
              </div>
              {section.items.map((item: any) => (
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-normal text-gray-600 hover:bg-gray-100 transition-all cursor-pointer mb-0.5"
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] no-underline mb-0.5 transition-all ${isActive
                        ? 'font-semibold text-white! bg-primary-500 border border-primary-50'
                        : 'font-normal text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                )
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-[11px] font-bold text-primary-700">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-gray-800 truncate">Admin User</div>
            <div className="text-[11px] text-gray-400 truncate">HQ Supervisor</div>
          </div>
          <button className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer">
            <LogOut size={16} />
          </button>
        </div>
      </div >

      {/* Search Modal */}
      {
        searchOpen && (
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
        )
      }
    </>
  );
};
