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

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      height: element.scrollHeight,
      windowHeight: element.scrollHeight,
    });

    // Restore hidden elements
    elementsToHide.forEach((el) => {
      (el as HTMLElement).style.display = '';
    });

    const imgData = canvas.toDataURL('image/png', quality);
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;

    // Add title page
    pdf.setFontSize(20);
    pdf.text(checklist.title, pdfWidth / 2, 30, { align: 'center' });

    if (checklist.description) {
      pdf.setFontSize(12);
      pdf.text(checklist.description, pdfWidth / 2, 50, { align: 'center' });
    }

    pdf.setFontSize(10);
    pdf.text(
      `Oluşturulma Tarihi: ${checklist.createdAt.toLocaleDateString('tr-TR')}`,
      20,
      pdfHeight - 20
    );
    pdf.text(
      `Güncelleme Tarihi: ${checklist.updatedAt.toLocaleDateString('tr-TR')}`,
      20,
      pdfHeight - 10
    );

    // Check if we need multiple pages
    const totalPDFHeight = imgHeight * ratio;
    if (totalPDFHeight > pdfHeight - 60) {
      // Multiple pages needed
      let position = 60;
      let remainingHeight = totalPDFHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const pageHeight = Math.min(remainingHeight, pdfHeight - position);
        const sourceHeight = pageHeight / ratio;

        // Create canvas for this page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');

        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0,
            sourceY,
            imgWidth,
            sourceHeight,
            0,
            0,
            imgWidth,
            sourceHeight
          );
          const pageImgData = pageCanvas.toDataURL('image/png', quality);

          if (position > 60) {
            pdf.addPage();
            position = 20;
          }

          pdf.addImage(
            pageImgData,
            'PNG',
            imgX,
            position,
            imgWidth * ratio,
            pageHeight
          );
        }

        sourceY += sourceHeight;
        remainingHeight -= pageHeight;
        position = 20; // For subsequent pages
      }
    } else {
      // Single page
      pdf.addImage(imgData, 'PNG', imgX, 60, imgWidth * ratio, totalPDFHeight);
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
    Checklist Özeti
    
    Başlık: ${checklist.title}
    ${checklist.description ? `Açıklama: ${checklist.description}` : ''}
    
    İstatistikler:
    - Toplam Madde: ${checklist.items.length}
    - Tamamlanan: ${completedItems.length}
    - Devam Eden: ${inProgressItems.length}
    - Başlanmamış: ${notStartedItems.length}
    
    Tamamlanan Maddeler:
    ${completedItems.map((item) => `• ${item.title}`).join('\n    ')}
    
    Devam Eden Maddeler:
    ${inProgressItems
      .map(
        (item) =>
          `• ${item.title}${item.reason ? ` (Neden: ${item.reason})` : ''}`
      )
      .join('\n    ')}
    
    Başlanmamış Maddeler:
    ${notStartedItems.map((item) => `• ${item.title}`).join('\n    ')}
    
    Oluşturulma Tarihi: ${checklist.createdAt.toLocaleDateString('tr-TR')}
    Son Güncelleme: ${checklist.updatedAt.toLocaleDateString('tr-TR')}
  `;

  const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${checklist.title}_ozet.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
