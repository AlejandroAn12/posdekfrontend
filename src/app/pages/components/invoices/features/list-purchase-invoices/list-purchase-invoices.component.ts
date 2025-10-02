import { Component, EventEmitter, inject, Output } from '@angular/core';
import { InvoicesService } from '../../data-access/invoices.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-purchase-invoices',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-purchase-invoices.component.html',
  styleUrl: './list-purchase-invoices.component.css'
})
export default class ListPurchaseInvoicesComponent {
 isDisabled: boolean = true;

  @Output() close = new EventEmitter<void>();

  invoiceService = inject(InvoicesService);
  private fb = inject(FormBuilder);

  filtroForm = this.fb.group({
    invoiceType: [''],
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
  invoices: any[] = [];
  invoiceTypes: any[] = [];
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
    this.getInvoiceTypes();
    this.searchInvoices();
  }

  searchInvoices() {
    const filtros = {
      invoiceType: this.filtroForm.value.invoiceType || undefined,
      fromDate: this.filtroForm.value.fromDate || undefined,
      toDate: this.filtroForm.value.toDate || undefined,
      page: this.paginaActual,
      limit: this.limitePorPagina,
    };

    this.isLoading = true;

    this.invoiceService.getAllPurchaseInvoices(filtros).subscribe({
      next: (res) => {
        this.invoices = res.data;
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
    this.searchInvoices();
  }

  getInvoiceTypes() {
    this.invoiceService.getInvoiceTypes().subscribe({
      next: (res: any) => {
        this.invoiceTypes = res;
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

  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  createDetailGroup(detail: any): FormGroup {
    const subtotal = (detail.quantity || 0) * (detail.purchasePrice || 0);
    return this.fb.group({
      product: [{ value: detail.product?.name || 'N/A', disabled: true }],
      quantity: [{ value: detail.quantity || 0, disabled: true }],
      purchasePrice: [{ value: detail.purchasePrice || 0, disabled: true }],
      subtotal: [{ value: subtotal, disabled: true }],
    });
  }

  get totalGeneral(): number {
    return this.details.controls.reduce((sum, group) => {
      return sum + (group.get('subtotal')?.value || 0);
    }, 0);
  }

  toggleModal(invoiceId: string | null = null) {
    this.showModal = !this.showModal;
    this.selectedInvoice = null;

    if (invoiceId !== null) {
      this.invoiceService.getInvoiceById(invoiceId).subscribe({
        next: (res: any) => {
          this.titleModal = `DETALLE DE FACTURA - ${res.noFac || ''}`;
          this.selectedInvoice = res;

          this.form.patchValue({
            invoiceType: res.invoiceType?.name || '',
            createdAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString('es-ES') : '',
            noFac: res.noFac || '',
            supplier: res.supplier?.company_name || ''
          });

          this.details.clear();
          res.details.forEach((detail: any) => {
            this.details.push(this.createDetailGroup(detail));
          });
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            icon: 'error',
            text: err.error.message || 'No se pudo cargar la factura.'
          });
        }
      });
    }
  }

  // Métodos de paginación mejorados
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.searchInvoices();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.searchInvoices();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.searchInvoices();
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
      this.details.clear();
      this.form.reset();
    }, 300);
  }

  getLastFacturaIndex(): number {
    if (!this.invoices || this.invoices.length === 0) {
      return 0;
    }
    const lastIndex = this.paginaActual * this.limitePorPagina;
    return lastIndex > this.totalRegistros ? this.totalRegistros : lastIndex;
  }
}
