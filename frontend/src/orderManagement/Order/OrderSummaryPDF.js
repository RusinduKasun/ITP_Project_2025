import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Usage: generateOrderPDF({ products, address })
 */
export function generateOrderPDF({ products, address }) {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- 1) White background ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // --- 2) Green header ---
  const headerHeight = 28;
  doc.setFillColor(76, 175, 80);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Load Logo (convert your .ico to base64 before using OR import it as an image in React)
  // Example: const logoBase64 = "data:image/png;base64,..."; (You must convert the .ico file)
  const logoBase64 = '/mnt/data/e222fbba-c27f-4bdd-9084-8c1cbb17b7c4.ico'; // replace with base64 string
  try {
    doc.addImage(logoBase64, 'ICO', 10, 5, 18, 18); // left corner logo
  } catch (e) {
    console.warn("Logo could not be loaded as image. Please convert .ico to base64 PNG.");
  }

  // Title text next to logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('Order Summary', 35, 18);

  // --- 3) Customer Info Card ---
  const cardX = 15;
  const cardY = 36;
  const cardW = pageWidth - 30;
  const cardH = 36;

  doc.setFillColor(230, 230, 230);
  doc.roundedRect(cardX + 2, cardY + 2, cardW, cardH, 4, 4, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'F');
  doc.setDrawColor(210, 210, 210);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  let cursorY = cardY + 11;
  const textLeft = cardX + 8;

  doc.text(`Name: ${address.name || ''}`, textLeft, cursorY);
  cursorY += 6;
  doc.text(`Phone: ${address.phone || ''}`, textLeft, cursorY);
  cursorY += 6;
  doc.text(`Email: ${address.email || ''}`, textLeft, cursorY);
  cursorY += 6;

  const fullAddress =
    (address.addressLine1 || address.street || '') +
    (address.city ? `, ${address.city}` : '') +
    (address.postalCode || address.zip ? `, ${address.postalCode || address.zip}` : '') +
    (address.country ? `, ${address.country}` : '');

  const splitAddress = doc.splitTextToSize(`Address: ${fullAddress}`, cardW - 16);
  doc.text(splitAddress, textLeft, cursorY);

  // --- 4) Product Table ---
  const tableStartY = cardY + cardH + 12;
  const tableBody = products.map((p, i) => [
    i + 1,
    p.name,
    p.quantity,
    `${Number(p.age).toLocaleString()} LKR`,
  ]);

  autoTable(doc, {
    head: [['#', 'Product', 'Quantity', 'Price']],
    body: tableBody,
    startY: tableStartY,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 11,
      textColor: [44, 62, 80],
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [76, 175, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
    },
    bodyStyles: { fillColor: [245, 250, 245] },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.35,
  });

  // --- 5) Total Price Box ---
  const total = products.reduce((s, p) => s + Number(p.age) * Number(p.quantity), 0);
  const lastY = doc.lastAutoTable ? doc.lastAutoTable.finalY : tableStartY + 10;

  const totalW = 80;
  const totalH = 14;
  const totalX = pageWidth - totalW - 20;
  const totalY = lastY + 12;

  doc.setFillColor(220, 220, 220);
  doc.roundedRect(totalX + 2, totalY + 2, totalW, totalH, 3, 3, 'F');

  doc.setFillColor(76, 175, 80);
  doc.roundedRect(totalX, totalY, totalW, totalH, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Total: ${total.toLocaleString()} LKR`, totalX + 8, totalY + 9);

  // --- 6) Watermark ---
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 220, 220);
  doc.text('CONFIRMED', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45,
  });

  // --- 7) Footer ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Thank you for ordering with us! We appreciate your business.', pageWidth / 2, pageHeight - 12, {
    align: 'center',
  });

  doc.save('order_summary.pdf');
}
