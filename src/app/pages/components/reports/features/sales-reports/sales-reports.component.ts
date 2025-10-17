import { Component, inject } from '@angular/core';
import { ReportsService } from '../../services/reports.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-reports',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sales-reports.component.html',
  styleUrl: './sales-reports.component.css'
})
export default class SalesReportsComponent {


  reportService = inject(ReportsService);


   private fb = inject(FormBuilder);

  filtroForm = this.fb.group({
    fromDate: [''],
    toDate: ['']
  });

  isLoading: boolean = false;
  data: any[] = [];
  totalRegistros = 0;
  paginaActual = 1;
  limitePorPagina = 10;
  totalPaginas = 1;

  showModal = false;
  titleModal: string = 'Detalle de Factura';
  isEditing = false;
  selectedInvoice: any = null;
  isClosing: boolean = false;

  constructor() {
    this.searchData();
  }

  searchData() {
    const filtros = {
      fromDate: this.filtroForm.value.fromDate || undefined,
      toDate: this.filtroForm.value.toDate || undefined,
      page: this.paginaActual,
      limit: this.limitePorPagina,
    };

    this.isLoading = true;

    this.reportService.getHistoryDailySales(filtros).subscribe({
      next: (res) => {
        this.data = res.data;
        this.totalRegistros = res.total;
        this.totalPaginas = res.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: err.error.message
        });
        this.isLoading = false;
      }
    });
  }

  clearFilters() {
    this.filtroForm.reset();
    this.paginaActual = 1;
    this.searchData();
  }



  // Métodos de paginación mejorados
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.searchData();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.searchData();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.searchData();
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

  getLastDataIndex(): number {
    if (!this.data || this.data.length === 0) {
      return 0;
    }
    const lastIndex = this.paginaActual * this.limitePorPagina;
    return lastIndex
  }

}
