export const TabBar = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (tab: string) => void }) => {
  return (
    <div className="flex gap-1 mb-2 bg-gray-100 rounded-lg p-1">
      {tabs.map(tab => (
        <span
          key={tab}
          onClick={() => onChange(tab)}
          className={`text-[13px] px-4 py-1.5 rounded-md transition-all cursor-pointer ${tab === active
            ? 'font-medium text-gray-900 bg-white shadow-xs'
            : 'font-normal text-gray-500 hover:text-gray-700'
            }`}
        >
          {tab}
        </span>
      ))}
    </div>
  );
};
