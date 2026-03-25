import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useERPStore } from '../../store/useERPStore';
import { useNavigate } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const selectedEstate = useERPStore(s => s.selectedEstate);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedEstate === null) {
      navigate('/');
    }
  }, [selectedEstate, navigate]);

  if (selectedEstate === null) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-[250px] flex flex-col">
        <main className="flex-1 p-4">
          <div className="bg-white rounded-2xl min-h-[calc(100vh-32px)] shadow-[0_0_0_1px_var(--color-gray-200)] overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-4 py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
