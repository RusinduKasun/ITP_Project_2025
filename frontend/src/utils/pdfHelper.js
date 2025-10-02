import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Small helper to safely save a jsPDF document with a blob fallback
const safeSave = (doc, filename) => {
  try {
    doc.save(filename);
  } catch (err) {
    console.warn('doc.save failed, falling back to blob download', err);
    try {
      const blob = doc.output && typeof doc.output === 'function' ? doc.output('blob') : null;
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Unable to generate download in this environment.');
      }
    } catch (blobErr) {
      console.error('Fallback download failed', blobErr);
      alert('Failed to download PDF. See console for details.');
    }
  }
};

export const generateStyledPDF = ({
  title = 'Report',
  columns = [],
  rows = [],
  fileName = 'report.pdf',
  summary = [],
  primaryColor = [16, 185, 129], // Tailwind emerald-500
  logoText = 'SFL',
  pageOrientation = 'portrait'
} = {}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: pageOrientation });

  // Header background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, 'F');

  // Logo circle
  doc.setFillColor(255, 255, 255);
  doc.circle(40, 35, 18, 'F');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(logoText, 33, 41);

  // Title
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 80, 42);

  // Generated on
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const now = new Date();
  doc.text(`Generated on ${now.toLocaleString()}`, doc.internal.pageSize.getWidth() - 200, 42, { align: 'left' });

  // Prepare table
  const startY = 90;
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      halign: 'center'
    },
    styles: {
      fontSize: 10,
      cellPadding: 6,
      textColor: [40, 40, 40]
    },
    alternateRowStyles: { fillColor: [245, 249, 246] },
    margin: { left: 40, right: 40 }
  });

  // Draw summary if provided
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 20;
  if (summary && summary.length) {
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    summary.forEach((line) => {
      doc.text(line, 50, finalY);
      finalY += 14;
    });
  }

  // Footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageSize = doc.internal.pageSize;
    const pageWidth = pageSize.getWidth();
    const pageHeight = pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 80, pageHeight - 20);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40);
  }

  safeSave(doc, fileName);
};

export default generateStyledPDF;
