const variantClasses: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  info:    'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

export const Badge = ({ label, variant }: { label: string; variant: string }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${variantClasses[variant] || variantClasses.neutral}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {label}
    </span>
  );
};
