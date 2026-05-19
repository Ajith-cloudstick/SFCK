import React from 'react';
import { useERPStore } from '../../store/useERPStore';
import { ESTATES } from '../../data/constants';
import type { EstateId } from '../../types';

export const EstateSelector: React.FC = () => {
  const { selectedEstate, setSelectedEstate } = useERPStore();

  return (
    <select
      value={selectedEstate ?? 'all'}
      onChange={e => setSelectedEstate(e.target.value === 'all' ? null : Number(e.target.value) as EstateId)}
      style={{
        border: '1px solid var(--gray-300)',
        borderRadius: 'var(--radius-sm)',
        padding: '6px 12px',
        fontSize: '13px',
        backgroundColor: 'var(--white)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--gray-700)',
        cursor: 'pointer'
      }}
    >
      <option value="all">All Estates</option>
      {ESTATES.map(est => (
        <option key={est.id} value={est.id}>{est.name}</option>
      ))}
    </select>
  );
};
