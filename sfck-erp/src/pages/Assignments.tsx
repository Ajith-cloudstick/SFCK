import { useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ExportButton } from '../components/ui/ExportButton';
import { TabBar } from '../components/ui/TabBar';
import { DataTable } from '../components/ui/DataTable';
import { useERPStore } from '../store/useERPStore';
import { ESTATES } from '../data/constants';

export const Assignments = () => {
  const [activeTab, setActiveTab] = useState('Tapping Blocks');
  const { employees, assignments, production, selectedEstate, selectedDate, setSelectedDate } = useERPStore();

  const tappingData = useMemo(() => {
    if (activeTab !== 'Tapping Blocks') return [];
    return assignments.filter(a => a.type === 'tapping' && a.date === selectedDate && (selectedEstate === null || a.estate === selectedEstate)).map(a => {
      const est = ESTATES.find(e => e.id === a.estate);
      const prod = production.filter(p => p.date === a.date && p.workItemId === a.workItemId).reduce((s, p) => s + p.drcKg, 0);
      return { id: a.id, date: a.date, blockId: a.workItemId, blockName: a.workItemName, estateName: est ? est.name : '-', trees: a.assignedEmpIds.length * 300, tappers: a.assignedEmpIds.length, drc: prod.toFixed(2), assignedEmps: a.assignedEmpIds.map(id => employees.find(e => e.id === id)?.name).join(', ') };
    });
  }, [activeTab, assignments, selectedDate, selectedEstate, production, employees]);

  const generalData = useMemo(() => {
    if (activeTab !== 'General Work') return [];
    return assignments.filter(a => a.type !== 'tapping' && a.date === selectedDate && (selectedEstate === null || a.estate === selectedEstate)).map(a => {
      const est = ESTATES.find(e => e.id === a.estate);
      return { id: a.id, date: a.date, workId: a.workItemId, category: a.workItemName, estateName: est ? est.name : '-', workers: a.assignedEmpIds.length, assignedEmps: a.assignedEmpIds.map(id => employees.find(e => e.id === id)?.name).join(', ') };
    });
  }, [activeTab, assignments, selectedDate, selectedEstate, employees]);

  const columnsTapping = [
    { header: 'Date', accessorKey: 'date' }, { header: 'Block ID', accessorKey: 'blockId' }, { header: 'Block Name', accessorKey: 'blockName' },
    { header: 'Estate', accessorKey: 'estateName' }, { header: 'Trees', accessorKey: 'trees' }, { header: 'Tappers', accessorKey: 'tappers' },
    { header: 'DRC (kg)', accessorKey: 'drc' },
    { header: 'Employees', accessorKey: 'assignedEmps', cell: (i: any) => <div className="max-w-[200px] truncate" title={i.getValue()}>{i.getValue()}</div> }
  ];

  const columnsGeneral = [
    { header: 'Date', accessorKey: 'date' }, { header: 'Work ID', accessorKey: 'workId' }, { header: 'Category', accessorKey: 'category' },
    { header: 'Estate', accessorKey: 'estateName' }, { header: 'Workers', accessorKey: 'workers' },
    { header: 'Employees', accessorKey: 'assignedEmps', cell: (i: any) => <div className="max-w-[200px] truncate" title={i.getValue()}>{i.getValue()}</div> }
  ];

  return (
    <div>
      <PageHeader title="Block & Work Assignments" actions={<ExportButton onPDF={() => { }} onExcel={() => { }} />} />
      <div className="px-7 pb-7">
        <TabBar tabs={['Tapping Blocks', 'General Work']} active={activeTab} onChange={setActiveTab} />
        <div className="flex flex-col gap-4">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-fit" />
          {activeTab === 'Tapping Blocks' && <DataTable columns={columnsTapping as any} data={tappingData} searchable />}
          {activeTab === 'General Work' && <DataTable columns={columnsGeneral as any} data={generalData} searchable />}
        </div>
      </div>
    </div>
  );
};
