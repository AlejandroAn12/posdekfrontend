import { Component, inject } from '@angular/core';
import { ReportsPdfService } from '../../../services/reports-pdf.service';

@Component({
  selector: 'app-download-pdf',
  imports: [],
  templateUrl: './download-pdf.component.html',
  styleUrl: './download-pdf.component.css'
})
export class DownloadPdfComponent {

  private reportsPdfService = inject(ReportsPdfService);

  

  downloadPdf() {
    const date = Date.now();

    this.reportsPdfService.downloadProductReportPdf().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product-report_${date}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando PDF', { err })
      }
    })
  }
}
