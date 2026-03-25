import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="px-7 pt-7 flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-[13px] text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div>{actions}</div>
    </div>
  );
};
