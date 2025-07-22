import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Checklist } from '../types/checklist';

export interface PDFOptions {
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  filename?: string;
}

export const generateChecklistPDF = async (
  checklist: Checklist,
  elementId: string,
  options: PDFOptions = {}
): Promise<void> => {
  const {
    orientation = 'portrait',
    quality = 0.95,
    filename = `${checklist.title}_checklist.pdf`,
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Hide any buttons or interactive elements that shouldn't appear in PDF
    const elementsToHide = element.querySelectorAll('[data-pdf-hide]');
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    // Create a copy of the element with better styling for PDF
    const clonedElement = element.cloneNode(true) as HTMLElement;
    clonedElement.style.width = '210mm'; // A4 width
    clonedElement.style.maxWidth = '210mm';
    clonedElement.style.backgroundColor = '#ffffff';
    clonedElement.style.padding = '20px';
    clonedElement.style.fontFamily = 'Arial, sans-serif';

    // Temporarily add to DOM for canvas generation
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    document.body.appendChild(clonedElement);

    const canvas = await html2canvas(clonedElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      windowWidth: 794,
      logging: false,
    });

    // Remove cloned element
    document.body.removeChild(clonedElement);

    // Restore hidden elements
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = '';
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate scaling to fit width with margins
    const maxWidth = pdfWidth - 20; // 10mm margins on each side
    const scale = maxWidth / (imgWidth * 0.264583); // Convert pixels to mm
    const scaledHeight = imgHeight * 0.264583 * scale;

    // Create cover page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');

    // Title
    const titleLines = pdf.splitTextToSize(checklist.title, pdfWidth - 40);
    let yPosition = 40;
    titleLines.forEach((line: string) => {
      pdf.text(line, pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;
    });

    // Description
    if (checklist.description) {
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(
        checklist.description,
        pdfWidth - 40
      );
      descLines.forEach((line: string) => {
        pdf.text(line, pdfWidth / 2, yPosition, { align: 'center' });
        yPosition += 6;
      });
    }

    // Statistics
    yPosition += 20;
    const completedItems = checklist.items.filter(
      (item) => item.status === 'completed'
    ).length;
    const inProgressItems = checklist.items.filter(
      (item) => item.status === 'in-progress'
    ).length;
    const notStartedItems = checklist.items.filter(
      (item) => item.status === 'not-started'
    ).length;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ISTATISTIKLER', pdfWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const stats = [
      `Toplam Madde: ${checklist.items.length}`,
      `Tamamlanan: ${completedItems}`,
      `Devam Eden: ${inProgressItems}`,
      `Baslanmamis: ${notStartedItems}`,
      `Tamamlanma Orani: %${
        Math.round((completedItems / checklist.items.length) * 100) || 0
      }`,
    ];

    stats.forEach((stat) => {
      pdf.text(stat, pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    });

    // Dates
    yPosition = pdfHeight - 30;
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    pdf.text(
      `Olusturulma: ${checklist.createdAt.toLocaleDateString('tr-TR')}`,
      10,
      yPosition
    );
    pdf.text(
      `Son Guncelleme: ${checklist.updatedAt.toLocaleDateString('tr-TR')}`,
      10,
      yPosition + 5
    );

    // Add generation timestamp
    pdf.text(
      `PDF Olusturulma: ${new Date().toLocaleString('tr-TR')}`,
      10,
      yPosition + 10
    );

    // Add new page for content
    pdf.addPage();
    pdf.setTextColor(0); // Reset text color

    // Add content with proper page breaks
    const pageHeight = pdfHeight - 30; // Leave margin at bottom
    const contentStartY = 10;

    if (scaledHeight <= pageHeight) {
      // Single page content
      const imgData = canvas.toDataURL('image/png', quality);
      pdf.addImage(imgData, 'PNG', 10, contentStartY, maxWidth, scaledHeight);
    } else {
      // Multi-page content
      const pixelsPerMM = imgHeight / scaledHeight;
      const pageHeightInPixels = pageHeight * pixelsPerMM;
      let sourceY = 0;
      let currentPageY = contentStartY;

      while (sourceY < imgHeight) {
        const remainingHeight = imgHeight - sourceY;
        const currentPageHeight = Math.min(pageHeightInPixels, remainingHeight);

        // Create canvas for current page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = currentPageHeight;
        const ctx = pageCanvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            sourceY, // Source
            imgWidth,
            currentPageHeight,
            0,
            0, // Destination
            imgWidth,
            currentPageHeight
          );

          const pageImgData = pageCanvas.toDataURL('image/png', quality);
          const pageHeightMM = currentPageHeight / pixelsPerMM;

          pdf.addImage(
            pageImgData,
            'PNG',
            10,
            currentPageY,
            maxWidth,
            pageHeightMM
          );

          sourceY += currentPageHeight;

          // Add new page if there's more content
          if (sourceY < imgHeight) {
            pdf.addPage();
            currentPageY = contentStartY;
          }
        }
      }
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('PDF oluşturulamadı. Lütfen tekrar deneyin.');
  }
};

export const downloadPDFSummary = (checklist: Checklist): void => {
  const completedItems = checklist.items.filter(
    (item) => item.status === 'completed'
  );
  const inProgressItems = checklist.items.filter(
    (item) => item.status === 'in-progress'
  );
  const notStartedItems = checklist.items.filter(
    (item) => item.status === 'not-started'
  );

  const summary = `
📋 CHECKLIST ÖZETİ
═══════════════════════════════════════

📝 Başlık: ${checklist.title}
${checklist.description ? `📄 Açıklama: ${checklist.description}\n` : ''}
📊 İSTATİSTİKLER
═══════════════════════════════════════
📋 Toplam Madde: ${checklist.items.length}
✅ Tamamlanan: ${completedItems.length}
🔄 Devam Eden: ${inProgressItems.length}
⏳ Başlanmamış: ${notStartedItems.length}
📈 Tamamlanma Oranı: %${
    Math.round((completedItems.length / checklist.items.length) * 100) || 0
  }

✅ TAMAMLANAN MADDELER
═══════════════════════════════════════
${
  completedItems.length > 0
    ? completedItems
        .map((item, index) => `${index + 1}. ✅ ${item.title}`)
        .join('\n')
    : 'Henüz tamamlanan madde yok.'
}

🔄 DEVAM EDEN MADDELER
═══════════════════════════════════════
${
  inProgressItems.length > 0
    ? inProgressItems
        .map(
          (item, index) =>
            `${index + 1}. 🔄 ${item.title}${
              item.reason ? `\n   💬 Neden: ${item.reason}` : ''
            }`
        )
        .join('\n')
    : 'Devam eden madde yok.'
}

⏳ BAŞLANMAMIŞ MADDELER
═══════════════════════════════════════
${
  notStartedItems.length > 0
    ? notStartedItems
        .map((item, index) => `${index + 1}. ⏳ ${item.title}`)
        .join('\n')
    : 'Başlanmamış madde yok.'
}

📅 TARİH BİLGİLERİ
═══════════════════════════════════════
🗓️ Oluşturulma: ${checklist.createdAt.toLocaleString('tr-TR')}
🔄 Son Güncelleme: ${checklist.updatedAt.toLocaleString('tr-TR')}
📄 Özet Oluşturulma: ${new Date().toLocaleString('tr-TR')}

═══════════════════════════════════════
  `;

  const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${checklist.title.replace(/[^a-zA-Z0-9]/g, '_')}_ozet.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
