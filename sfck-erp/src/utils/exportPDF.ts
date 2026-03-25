import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportTableToPDF = (
  title: string,
  columns: { header: string; dataKey: string | number }[],
  rows: any[],
  filename: string
) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'dd MMM yyyy HH:mm');

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('State Farming Corporation of Kerala Limited', 14, 20);
  
  doc.setFontSize(12);
  doc.text(title, 14, 28);
  
  autoTable(doc, {
    startY: 35,
    columns: columns,
    body: rows,
    styles: { fontSize: 10, font: 'helvetica' },
    headStyles: { fillColor: [11, 28, 61], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [243, 244, 246] },
    margin: { top: 35 }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated on ${dateStr} — SFCK ERP System`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`${filename}.pdf`);
};
