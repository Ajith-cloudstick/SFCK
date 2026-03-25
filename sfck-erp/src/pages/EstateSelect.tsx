import { useNavigate } from 'react-router-dom';
import { ESTATES } from '../data/constants';
import { useERPStore } from '../store/useERPStore';
import { MapPin, Users, ChevronRight } from 'lucide-react';
import type { EstateId } from '../types';

export const EstateSelect = () => {
  const navigate = useNavigate();
  const setSelectedEstate = useERPStore(s => s.setSelectedEstate);

  const handleSelect = (estateId: EstateId) => {
    setSelectedEstate(estateId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-10">
      {/* Logo & Header */}
      <div className="text-center mb-12">
        <div className="w-14 h-14 rounded-[14px] bg-primary-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(54,152,111,0.25)]">
          <span className="text-2xl font-bold text-white">S</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome to SFCK ERP</h1>
        <p className="text-sm text-gray-400 mt-2 max-w-[360px]">State Farming Corporation of Kerala Limited</p>
        <p className="text-[13px] text-gray-500 mt-4 font-medium">Select your estate to continue</p>
      </div>

      {/* Estate Cards */}
      <div className="grid grid-cols-2 gap-4 max-w-[560px] w-full">
        {ESTATES.map((est) => (
          <button
            key={est.id}
            onClick={() => handleSelect(est.id as EstateId)}
            className="bg-white border border-gray-200 rounded-xl p-5 text-left transition-all duration-200 hover:border-primary-400 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(54,152,111,0.12)] flex flex-col gap-3.5 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div className="w-9 h-9 rounded-[10px] bg-primary-50 flex items-center justify-center">
                <MapPin size={18} className="text-primary-600" />
              </div>
              <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                {est.code}
              </span>
            </div>
            <div>
              <div className="text-[15px] font-semibold text-gray-900">{est.name}</div>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                <Users size={12} />
                {est.idRange[1] - est.idRange[0] + 1} employees
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary-600 font-medium">
              Open Dashboard <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="mt-12 text-[11px] text-gray-400">Government of Kerala · Department of Agriculture</p>
    </div>
  );
};
