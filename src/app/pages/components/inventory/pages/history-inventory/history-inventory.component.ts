import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { InventoryReportService } from '../../data-access/inventory-report.service';
import { InventoryService } from '../../data-access/inventory.service';

@Component({
  selector: 'app-history-inventory',
  imports: [CommonModule, FormsModule],
  templateUrl: './history-inventory.component.html',
  styleUrl: './history-inventory.component.css'
})
export default class HistoryInventoryComponent implements OnInit {

  ngOnInit(): void {
    this.loadData();
  }

  private inventoryService = inject(InventoryService);
  private inventoryReportService = inject(InventoryReportService);
  private fb = inject(FormBuilder);

  inventoryData: any[] = [];
  totalRegistros = 0;
  paginaActual = 1;
  limitePorPagina = 10;
  totalPaginas = 1;
  isLoading: boolean = false;

  loadData() {
    this.isLoading = true;

    const filtros = {
      page: this.paginaActual,
      limit: this.limitePorPagina,
    };

    this.inventoryService.getAllInventoryFinished(filtros).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        console.log('data', res)

        // Verifica la estructura de la respuesta
        this.inventoryData = res.data?.data || res.data || [];
        this.totalRegistros = res.data?.total || res.total || 0;

        // Calcula correctamente el total de páginas
        if (res.data?.totalPages) {
          this.totalPaginas = res.data.totalPages;
        } else if (res.totalPages) {
          this.totalPaginas = res.totalPages;
        } else {
          // Calcula basado en el total de registros
          this.totalPaginas = Math.ceil(this.totalRegistros / this.limitePorPagina);
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${err.error?.message || 'Error al cargar los datos'}`,
          toast: true,
          position: 'top-end',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  getLastInventoryIndex(): number {
    if (!this.inventoryData || this.inventoryData.length === 0) {
      return 0;
    }
    const lastIndex = this.paginaActual * this.limitePorPagina;
    return lastIndex > this.totalRegistros ? this.totalRegistros : lastIndex;
  }

  // Métodos de paginación mejorados
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.loadData();
      this.scrollToTop();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.loadData();
      this.scrollToTop();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPaginas && page !== this.paginaActual) {
      this.paginaActual = page;
      this.loadData();
      this.scrollToTop();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const start = Math.max(1, this.paginaActual - 2);
    const end = Math.min(this.totalPaginas, start + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageButtonClass(page: number): string {
    const baseClass = 'px-3 py-1 rounded-lg font-medium cursor-pointer transition-all duration-200';
    return page === this.paginaActual
      ? `${baseClass} bg-blue-600 text-white shadow-md`
      : `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }

  // Método auxiliar para hacer scroll al top
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Los métodos downloadPdf, printPDF y printAllPDF se mantienen igual...
  downloadPdf(id: string) {
    const date = Date.now();
    this.inventoryReportService.downloadInventoryFinishedReportPDF(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${date}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.error?.message || 'Error al descargar el PDF',
          icon: 'error'
        });
      }
    });
  }

  printPDF(id: string) {
    this.inventoryReportService.printInventoryFinishedPDF(id).subscribe({
      next: (blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');

        if (newWindow) {
          newWindow.onload = () => {
            newWindow.print();
          };
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo abrir la nueva ventana para imprimir.',
            icon: 'error',
            toast: true,
            position: 'top-end',
            timer: 4000
          });
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.error?.message || 'Error al generar el PDF',
          icon: 'error'
        });
      }
    });
  }

  printAllPDF() {
    this.inventoryReportService.getAllInventoriesReportPdf().subscribe({
      next: (blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');

        if (newWindow) {
          newWindow.onload = () => {
            newWindow.print();
          };
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo abrir la nueva ventana para imprimir.',
            icon: 'error'
          });
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.error?.message || 'Error al generar el PDF',
          icon: 'error'
        });
      }
    });
  }
}