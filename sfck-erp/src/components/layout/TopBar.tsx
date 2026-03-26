import React from 'react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useERPStore } from '../../store/useERPStore';
import { Bell, Search } from 'lucide-react';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { selectedMonth, setSelectedMonth } = useERPStore();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Overview';
      case '/attendance': return 'Attendance';
      case '/production': return 'Production';
      case '/stock': return 'Stock';
      case '/wages': return 'Wages';
      case '/employees': return 'Employees';
      case '/assignments': return 'Assignments';
      default: return 'SFCK ERP';
    }
  };

  return (
    <div style={{
      height: 'var(--header-height)',
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      backgroundColor: 'var(--gray-100)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10
    }}>
      {/* Left: Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius-md)', padding: '7px 14px',
        width: '280px'
      }}>
        <Search size={15} style={{ color: 'var(--gray-400)' }} />
        <input
          placeholder="Search..."
          style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px', padding: 0 }}
        />
      </div>

      {/* Right: Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: '13px',
            color: 'var(--gray-600)',
            backgroundColor: 'var(--white)'
          }}
        />
        <div style={{
          position: 'relative', padding: '6px', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)'
        }}>
          <Bell size={16} style={{ color: 'var(--gray-500)' }} />
          <div style={{
            position: 'absolute', top: '3px', right: '3px',
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: 'var(--primary-600)', border: '1.5px solid var(--white)'
          }} />
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
          {format(new Date(), 'dd MMM yyyy')}
        </div>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          backgroundColor: 'var(--primary-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--white)', fontWeight: 600, fontSize: '13px',
          cursor: 'pointer'
        }}>AD</div>
      </div>
    </div>
  );
};
