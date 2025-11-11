import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Checklist } from '../types/checklist';
import { Degerlendirme, ProjeFirmasi } from '../types/evaluation';

async function loadCustomFont(pdf: jsPDF) {
  try {
    const fontUrl = '/fonts/NotoSans-Regular.ttf';
    const response = await fetch(fontUrl);

    if (!response.ok) {
      throw new Error(`Font yüklenemedi: ${response.statusText}`);
    }

    const font = await response.arrayBuffer();

    let binary = '';
    const bytes = new Uint8Array(font);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const fontBase64 = btoa(binary);

    pdf.addFileToVFS('NotoSans-Regular.ttf', fontBase64);

    pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'bold');

    pdf.setFont('NotoSans', 'normal');
  } catch (e) {
    console.error("Özel font yüklenemedi, 'helvetica' kullanılacak:", e);
    pdf.setFont('helvetica', 'normal');
  }
}

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
    throw new Error('PDF olusturulamadi. Lutfen tekrar deneyin.');
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

${
  checklist.notes
    ? `📝 GENEL NOTLAR VE AÇIKLAMALAR
═══════════════════════════════════════
${checklist.notes}

`
    : ''
}📅 TARİH BİLGİLERİ
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

interface YillikOzet {
  firmaId: string;
  firmaName: string;
  ortalamaPuan: number;
  degerlendirmeSayisi: number;
}

interface ReportsPDFData {
  degerlendirmeler: Degerlendirme[];
  yillikOzet?: YillikOzet[] | null;
  yillikGenelOrtalama?: number | null;
  genelOrtalamaPuan?: number | null;
  selectedYil?: number | 'all';
  selectedFirma?: string | 'all';
  selectedFirmaName?: string;
  startDate?: string;
  endDate?: string;
  projeFirmalari?: ProjeFirmasi[];
}

export const generateReportsPDF = async (
  data: ReportsPDFData
): Promise<void> => {
  const {
    degerlendirmeler,
    yillikOzet,
    yillikGenelOrtalama,
    genelOrtalamaPuan,
    selectedYil,
    selectedFirma,
    selectedFirmaName,
    startDate,
    endDate,
  } = data;

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    await loadCustomFont(pdf);

    // jsPDF 3.x supports UTF-8, so Turkish characters should work directly

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pdfWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pdfHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Title - Use direct text as jsPDF 3.x supports UTF-8
    pdf.setFontSize(20);
    pdf.setFont('NotoSans', 'bold');
    pdf.text('DEĞERLENDİRME RAPORLARI', pdfWidth / 2, yPosition, {
      align: 'center',
    });
    yPosition += 10;

    // Date
    pdf.setFontSize(10);
    pdf.setFont('NotoSans', 'normal');
    pdf.setTextColor(100);
    pdf.text(
      `Rapor Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}`,
      pdfWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 8;
    pdf.setTextColor(0);

    // Filter Information
    pdf.setFontSize(12);
    pdf.setFont('NotoSans', 'bold');
    pdf.text('Filtre Bilgileri', margin, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.setFont('NotoSans', 'normal');
    const filters: string[] = [];
    if (selectedYil !== 'all' && selectedYil) {
      filters.push(`Yıl: ${selectedYil}`);
    } else {
      filters.push('Yıl: Tüm Yıllar');
    }
    if (selectedFirma !== 'all' && selectedFirma && selectedFirmaName) {
      filters.push(`Proje Firması: ${selectedFirmaName}`);
    } else {
      filters.push('Proje Firması: Tüm Firmalar');
    }
    if (startDate) {
      filters.push(
        `Başlangıç Tarihi: ${new Date(startDate).toLocaleDateString('tr-TR')}`
      );
    }
    if (endDate) {
      filters.push(
        `Bitiş Tarihi: ${new Date(endDate).toLocaleDateString('tr-TR')}`
      );
    }

    filters.forEach((filter) => {
      pdf.text(filter, margin + 5, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Yıllık Özet (if available)
    if (selectedYil !== 'all' && yillikOzet && yillikOzet.length > 0) {
      checkNewPage(30);
      pdf.setFontSize(12);
      pdf.setFont('NotoSans', 'bold');
      pdf.text(
        `${selectedYil} Yılının Özeti - Proje Firmalarına Verilen Puanlar`,
        margin,
        yPosition
      );
      yPosition += 8;

      // Table header
      pdf.setFontSize(9);
      pdf.setFont('NotoSans', 'bold');
      const colWidths = [
        contentWidth * 0.5,
        contentWidth * 0.25,
        contentWidth * 0.25,
      ];
      pdf.text('Firma Adı', margin, yPosition);
      pdf.text('Değerlendirme Sayısı', margin + colWidths[0], yPosition, {
        align: 'right',
      });
      pdf.text(
        'Ortalama Puan',
        margin + colWidths[0] + colWidths[1],
        yPosition,
        {
          align: 'right',
        }
      );
      yPosition += 5;

      // Draw line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pdfWidth - margin, yPosition);
      yPosition += 3;

      // Table rows
      pdf.setFont('NotoSans', 'normal');
      yillikOzet.forEach((ozet) => {
        checkNewPage(8);
        pdf.text(ozet.firmaName, margin, yPosition);
        pdf.text(
          ozet.degerlendirmeSayisi.toString(),
          margin + colWidths[0],
          yPosition,
          {
            align: 'right',
          }
        );
        pdf.text(
          ozet.ortalamaPuan.toFixed(2),
          margin + colWidths[0] + colWidths[1],
          yPosition,
          {
            align: 'right',
          }
        );
        yPosition += 6;
      });

      // Genel Ortalama
      if (yillikGenelOrtalama !== null && yillikGenelOrtalama !== undefined) {
        checkNewPage(10);
        yPosition += 3;
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pdfWidth - margin, yPosition);
        yPosition += 5;
        pdf.setFont('NotoSans', 'bold');
        pdf.text('Genel Ortalama Puan:', margin, yPosition);
        pdf.text(
          yillikGenelOrtalama.toFixed(2),
          margin + colWidths[0] + colWidths[1],
          yPosition,
          { align: 'right' }
        );
        yPosition += 8;
      }
    }

    // Değerlendirmeler Listesi
    checkNewPage(20);
    pdf.setFontSize(12);
    pdf.setFont('NotoSans', 'bold');
    pdf.text(
      `Değerlendirmeler (${degerlendirmeler.length})`,
      margin,
      yPosition
    );
    yPosition += 8;

    if (degerlendirmeler.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont('NotoSans', 'normal');
      pdf.text(
        'Seçilen kriterlere uygun değerlendirme bulunamadı.',
        margin,
        yPosition
      );
    } else {
      // Table header
      pdf.setFontSize(8);
      pdf.setFont('NotoSans', 'bold');
      const tableColWidths = [
        contentWidth * 0.25,
        contentWidth * 0.25,
        contentWidth * 0.1,
        contentWidth * 0.15,
        contentWidth * 0.15,
      ];
      let xPos = margin;
      pdf.text('İşin Adı', xPos, yPosition);
      xPos += tableColWidths[0];
      pdf.text('Proje Firması', xPos, yPosition);
      xPos += tableColWidths[1];
      pdf.text('Yıl', xPos, yPosition, { align: 'right' });
      xPos += tableColWidths[2];
      pdf.text('Tarih', xPos, yPosition, { align: 'right' });
      xPos += tableColWidths[3];
      pdf.text('Toplam Puan', xPos, yPosition, { align: 'right' });
      yPosition += 5;

      // Draw line
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pdfWidth - margin, yPosition);
      yPosition += 3;

      // Table rows
      pdf.setFont('NotoSans', 'normal');
      pdf.setFontSize(8);
      degerlendirmeler.forEach((degerlendirme, index) => {
        checkNewPage(10); // Check for new page BEFORE drawing

        // === GÜNCELLEME 2: Çizgi Pozisyonu Düzeltmesi ===
        // Draw separator line BEFORE the row (except for first row)
        if (index > 0) {
          yPosition += 2; // Çizgiden ÖNCE boşluk bırak
          pdf.setLineWidth(0.2);
          pdf.line(margin, yPosition, pdfWidth - margin, yPosition);
          yPosition += 3; // Çizgiden SONRA metin için boşluk bırak
        }
        // ============================================

        // İşin Adı (may need to wrap)
        const isAdiLines = pdf.splitTextToSize(
          degerlendirme.isAdi,
          tableColWidths[0] - 2
        );
        const firmaLines = pdf.splitTextToSize(
          degerlendirme.projeFirmasiName,
          tableColWidths[1] - 2
        );
        const maxLines = Math.max(isAdiLines.length, firmaLines.length, 1);
        const rowHeight = maxLines * 4; // 4mm per line

        // Yeni sayfaya geçiş gerekirse, mevcut satırı çizmeden önce yap
        if (checkNewPage(rowHeight)) {
          // Yeni sayfada başlıkları tekrar çizmek isteyebilirsiniz (opsiyonel)
          // Şimdilik sadece yPosition sıfırlandığı için devam ediyoruz.
        }

        xPos = margin;
        // Metni mevcut yPosition'a çiz
        const startY = yPosition;

        isAdiLines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, xPos, startY + lineIndex * 4);
        });

        xPos += tableColWidths[0];
        firmaLines.forEach((line: string, lineIndex: number) => {
          pdf.text(line, xPos, startY + lineIndex * 4);
        });

        xPos += tableColWidths[1];
        pdf.text(degerlendirme.yil.toString(), xPos, startY, {
          align: 'right',
        });

        xPos += tableColWidths[2];
        pdf.text(
          new Date(degerlendirme.createdAt).toLocaleDateString('tr-TR'),
          xPos,
          startY,
          { align: 'right' }
        );

        xPos += tableColWidths[3];
        pdf.text(degerlendirme.toplamPuan.toFixed(2), xPos, startY, {
          align: 'right',
        });

        // Move to next row position (below the content)
        yPosition += rowHeight; // Sadece satır yüksekliği kadar artır
      });

      // Genel Ortalama Puan
      if (genelOrtalamaPuan !== null && genelOrtalamaPuan !== undefined) {
        checkNewPage(10);
        yPosition += 3;
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pdfWidth - margin, yPosition);
        yPosition += 5;
        pdf.setFont('NotoSans', 'bold');
        pdf.setFontSize(10);
        pdf.text('Genel Ortalama Puan:', margin, yPosition);
        pdf.text(genelOrtalamaPuan.toFixed(2), pdfWidth - margin, yPosition, {
          align: 'right',
        });
      }
    }

    // Footer
    const pageCount = (
      pdf.internal as unknown as { getNumberOfPages: () => number }
    ).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(`Sayfa ${i} / ${pageCount}`, pdfWidth / 2, pdfHeight - 10, {
        align: 'center',
      });
    }

    // Generate filename
    const filenameParts: string[] = ['degerlendirme-raporlari'];
    if (selectedYil !== 'all' && selectedYil) {
      filenameParts.push(`${selectedYil}`);
    }
    if (selectedFirma !== 'all' && selectedFirmaName) {
      filenameParts.push(selectedFirmaName.replace(/[^a-zA-Z0-9]/g, '_'));
    }
    const filename = `${filenameParts.join('_')}.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error('PDF oluşturulamadı:', error);
    throw new Error('PDF oluşturulamadı. Lütfen tekrar deneyin.');
  }
};
