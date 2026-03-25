import React, { memo } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = memo(({ label, value, unit, delta, deltaLabel, icon, className = '' }) => {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-3 transition-all ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-gray-500 tracking-wide">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="text-2xl font-semibold text-gray-900 font-mono leading-none">
        {value}
        {unit && <span className="text-xs text-gray-400 ml-1 font-sans font-normal">{unit}</span>}
      </div>
      {delta !== undefined && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium w-fit ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? '↑' : '↓'} {deltaLabel || `${Math.abs(delta)}%`}
        </span>
      )}
    </div>
  );
});
