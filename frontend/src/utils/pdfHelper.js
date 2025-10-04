import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fallback-safe save: try doc.save, otherwise download blob
const safeSave = (doc, filename) => {
  try {
    doc.save(filename);
  } catch (err) {
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
        // Last resort
        alert('Unable to generate download in this environment.');
      }
    } catch (e) {
      console.error('Fallback download failed', e);
      alert('Failed to download PDF. See console for details.');
    }
  }
};

export default async function generateStyledPDF({
  title = 'Report',
  columns = [],
  rows = [],
  fileName = 'report.pdf',
  summary = [],
  primaryColor = [34, 107, 42],
  logoText = 'TOC',
  companyName = 'Taste of Ceylon',
  logoPath = '/images/Rep1.png',
  pageOrientation = 'portrait',
  autoTableOptions = {},
} = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: pageOrientation });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 70, 'F');

  const tryLoadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed: ' + src));
  });

  let img = null;
  try { img = await tryLoadImage(logoPath); } catch (e) { console.warn('logo load failed', e); }

  if (img) {
    const imgW = 48, imgH = 48;
    const canvas = document.createElement('canvas');
    canvas.width = imgW; canvas.height = imgH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, imgW, imgH);
    const dataUrl = canvas.toDataURL('image/png');
    doc.addImage(dataUrl, 'PNG', 16, 11, imgW, imgH);
  } else {
    // Simple circular fallback logo
    doc.setFillColor(255,255,255);
    doc.circle(40,35,18,'F');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(logoText, 33, 39);
  }

  // Company name and title
  doc.setFontSize(12); doc.setTextColor(255,255,255); doc.text(companyName, 80, 30);
  doc.setFontSize(16); doc.text(title, 80, 50);
  doc.setFontSize(9); doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth - 220, 42, { align: 'left' });

  const startY = 90;
  const defaults = {
    head: [columns], body: rows, startY, theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: [255,255,255], halign: 'center' },
    styles: { fontSize: 10, cellPadding: 6 }, margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(9); doc.setTextColor(120,120,120);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 80, pageHeight - 20);
      doc.setDrawColor(230,230,230); doc.setLineWidth(0.5);
      doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40);
    }
  };

  autoTable(doc, Object.assign({}, defaults, autoTableOptions || {}));

  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : startY + 20;
  if (summary && summary.length) {
    doc.setFontSize(11); doc.setTextColor(60,60,60);
    summary.forEach(line => { doc.text(line, 50, finalY); finalY += 14; });
  }

  safeSave(doc, fileName);
}
