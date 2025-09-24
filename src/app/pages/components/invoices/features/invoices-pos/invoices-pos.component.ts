import { Component, EventEmitter, inject, Output } from '@angular/core';
import { InvoicesService } from '../../data-access/invoices.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoices-pos',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './invoices-pos.component.html',
  styleUrl: './invoices-pos.component.css'
})
export default class InvoicesPosComponent {
  isDisabled: boolean = true;

  @Output() close = new EventEmitter<void>();

  invoiceService = inject(InvoicesService);
  private fb = inject(FormBuilder);

  filtroForm = this.fb.group({
    fromDate: [''],
    toDate: ['']
  });

  form = this.fb.group({
    customerDni: [{ value: '', disabled: this.isDisabled }],
    totalAmount: [{ value: 0, disabled: this.isDisabled }],
    subtotal: [{ value: 0, disabled: this.isDisabled }],
    dscto: [{ value: 0, disabled: this.isDisabled }],
    tax: [{ value: 0, disabled: this.isDisabled }],
    amountGiven: [{ value: 0, disabled: this.isDisabled }],
    change: [{ value: 0, disabled: this.isDisabled }],
    createdAt: [{ value: '', disabled: this.isDisabled }],
    noFac: [{ value: '', disabled: this.isDisabled }],
    customerName: [{ value: '', disabled: this.isDisabled }],
    items: this.fb.array([])
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
    // this.getInvoiceTypes();
    this.searchInvoices();
  }

  searchInvoices() {
    const filtros = {
      fromDate: this.filtroForm.value.fromDate || undefined,
      toDate: this.filtroForm.value.toDate || undefined,
      page: this.paginaActual,
      limit: this.limitePorPagina,
    };

    this.isLoading = true;

    this.invoiceService.getInvoicesBilling(filtros).subscribe({
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

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createDetailGroup(item: any): FormGroup {
    return this.fb.group({
      product: [{ value: item.product?.name || 'N/A', disabled: true }],
      quantity: [{ value: item.quantity || 0, disabled: true }],
      price: [{ value: item.price || 0, disabled: true }],
      subtotal: [{ value: item.subtotal, disabled: true }],
    });
  }

  toggleModal(id: number | null = null) {
    this.showModal = !this.showModal;
    this.selectedInvoice = null;

    if (id !== null) {
      this.invoiceService.getInvoiceBillingPosById(id).subscribe({
        next: (res: any) => {
          this.titleModal = `COMPROBANTE - ${res.noFac || ''}`;
          this.selectedInvoice = res;

          this.form.patchValue({
            customerDni: res.customerDni || '',
            createdAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString('es-ES') : '',
            noFac: res.noFac || '',
            customerName: res.customerName || '',
            totalAmount: res.totalAmount || 0,
            subtotal: res.subtotal || 0,
            tax: res.tax || 0,
            amountGiven: res.amountGiven || 0,
            change: res.amountGiven || 0,
            dscto: res.dscto || 0
          });

          this.items.clear();
          res.items.forEach((item: any) => {
            this.items.push(this.createDetailGroup(item));
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
      this.items.clear();
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
