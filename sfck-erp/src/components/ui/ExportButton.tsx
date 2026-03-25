import { Download } from 'lucide-react';

export const ExportButton = ({ onPDF, onExcel }: { onPDF: () => void; onExcel: () => void }) => {
  return (
    <div className="flex gap-1.5">
      <button onClick={onPDF} className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-md border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
        <Download size={13} /> PDF
      </button>
      <button onClick={onExcel} className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-md border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
        <Download size={13} /> Excel
      </button>
    </div>
  );
};
