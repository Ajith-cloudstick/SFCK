import * as XLSX from 'xlsx';

export const exportTableToExcel = (
  title: string,
  columns: { header: string; dataKey: string | number }[],
  rows: any[],
  filename: string
) => {
  const rowData = rows.map(row => columns.map(col => row[col.dataKey]));
  const headers = columns.map(col => col.header);

  const wsData = [
    ['State Farming Corporation of Kerala Limited'],
    [title],
    headers,
    ...rowData
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length > 0 ? columns.length - 1 : 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length > 0 ? columns.length - 1 : 1 } }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data'.substring(0, 31));

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
