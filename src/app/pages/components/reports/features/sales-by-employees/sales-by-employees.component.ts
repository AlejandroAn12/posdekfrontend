import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ReportsService } from '../../services/reports.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../credentials/data-access/user.service';

@Component({
  selector: 'app-sales-by-employees',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sales-by-employees.component.html',
  styleUrl: './sales-by-employees.component.css'
})
export default class SalesByEmployeesComponent {

  isDisabled: boolean = true;


  reportService = inject(ReportsService);
  credentialService = inject(UserService);
  private fb = inject(FormBuilder);

  filtroForm = this.fb.group({
    credentialId: [''],
    fromDate: [''],
    toDate: ['']
  });

  form = this.fb.group({
    invoiceType: [{ value: '', disabled: this.isDisabled }],
    createdAt: [{ value: '', disabled: this.isDisabled }],
    noFac: [{ value: '', disabled: this.isDisabled }],
    supplier: [{ value: '', disabled: this.isDisabled }],
    details: this.fb.array([])
  });

  isLoading: boolean = false;
  reportData: any[] = [];
  credentials: any[] = [];
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
    this.employees();
    this.searchEmployees();
  }

  searchEmployees() {
    const filtros = {
      credentialId: this.filtroForm.value.credentialId || undefined,
      fromDate: this.filtroForm.value.fromDate || undefined,
      toDate: this.filtroForm.value.toDate || undefined,
      page: this.paginaActual,
      limit: this.limitePorPagina,
    };

    this.isLoading = true;

    this.reportService.getSalesByEmployee(filtros).subscribe({
      next: (res) => {
        console.log(res)
        this.reportData = res.data;
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
    this.searchEmployees();
  }

  employees() {
    this.credentialService.getCredendentials().subscribe({
      next: (res: any) => {
        this.credentials = res.credentials;
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: err.error.message
        });
      }
    });
  }

  // get details(): FormArray {
  //   return this.form.get('details') as FormArray;
  // }

  // createDetailGroup(detail: any): FormGroup {
  //   const subtotal = (detail.quantity || 0) * (detail.purchasePrice || 0);
  //   return this.fb.group({
  //     product: [{ value: detail.product?.name || 'N/A', disabled: true }],
  //     quantity: [{ value: detail.quantity || 0, disabled: true }],
  //     purchasePrice: [{ value: detail.purchasePrice || 0, disabled: true }],
  //     subtotal: [{ value: subtotal, disabled: true }],
  //   });
  // }

  // get totalGeneral(): number {
  //   return this.details.controls.reduce((sum, group) => {
  //     return sum + (group.get('subtotal')?.value || 0);
  //   }, 0);
  // }

  // toggleModal(invoiceId: string | null = null) {
  //   this.showModal = !this.showModal;
  //   this.selectedInvoice = null;

  //   if (invoiceId !== null) {
  //     this.invoiceService.getInvoiceById(invoiceId).subscribe({
  //       next: (res: any) => {
  //         this.titleModal = `DETALLE DE FACTURA - ${res.noFac || ''}`;
  //         this.selectedInvoice = res;

  //         this.form.patchValue({
  //           invoiceType: res.invoiceType?.name || '',
  //           createdAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString('es-ES') : '',
  //           noFac: res.noFac || '',
  //           supplier: res.supplier?.company_name || ''
  //         });

  //         this.details.clear();
  //         res.details.forEach((detail: any) => {
  //           this.details.push(this.createDetailGroup(detail));
  //         });
  //       },
  //       error: (err) => {
  //         Swal.fire({
  //           title: 'Error',
  //           icon: 'error',
  //           text: err.error.message || 'No se pudo cargar la factura.'
  //         });
  //       }
  //     });
  //   }
  // }

  // Métodos de paginación mejorados
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.searchEmployees();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.searchEmployees();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.searchEmployees();
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

  closeModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.showModal = false;
      this.isClosing = false;
      // this.details.clear();
      this.form.reset();
    }, 300);
  }

  getLastFacturaIndex(): number {
    if (!this.reportData || this.reportData.length === 0) {
      return 0;
    }
    const lastIndex = this.paginaActual * this.limitePorPagina;
    return lastIndex > this.totalRegistros ? this.totalRegistros : lastIndex;
  }

}
