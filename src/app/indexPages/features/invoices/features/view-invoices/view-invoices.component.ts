import { Component, EventEmitter, inject, Output } from '@angular/core';
import { HeaderComponent } from '../../../../../shared/features/header/header.component';
import { InvoicesService } from '../../data-access/invoices.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../../../../../shared/features/components/modal/modal.component";

@Component({
  selector: 'app-view-invoices',
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule, ModalComponent],
  templateUrl: './view-invoices.component.html',
  styleUrl: './view-invoices.component.css'
})
export default class ViewInvoicesComponent {

  titleComponent: string = 'Gestión de facturas';
  subtitleComponent: string = 'Historial de facturas';
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
    details: this.fb.array([]) // ¡Importante!
  });

  isLoading: boolean = false;
  invoices: any[] = [];
  invoiceTypes: any[] = [];
  totalRegistros = 0;
  paginaActual = 1;
  limitePorPagina = 10;
  totalPaginas = 1;

  //Modal
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

    this.invoiceService.getInvoices(filtros).subscribe({
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
      }
    })
  }

  getInvoiceTypes() {
    this.invoiceService.getInvoiceTypes().subscribe({
      next: (res: any) => {
        this.invoiceTypes = res
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: err.error.message
        });
      }
    })
  }

  get details(): FormArray {
    return this.form.get('details') as FormArray;
  }

  createDetailGroup(detail: any): FormGroup {
    return this.fb.group({
      product: [`${detail.product?.name || ''}`],
      quantity: [detail.quantity || 0],
      purchasePrice: [detail.purchasePrice || 0],
      subtotal: [detail.quantity * detail.purchasePrice || 0],
    });
  }

  get totalGeneral(): number {
    return this.details.controls.reduce((sum, group) => {
      const subtotal = group.get('subtotal')?.value || 0;
      return sum + subtotal;
    }, 0);
  }


  toggleModal(invoiceId: string | null = null) {
    this.showModal = !this.showModal;
    this.selectedInvoice = null;

    if (invoiceId !== null) {
      this.invoiceService.getInvoiceById(invoiceId).subscribe({
        next: (res: any) => {
          this.titleModal = 'DETALLE DE FACTURA';
          this.selectedInvoice = res;

          this.form.patchValue({
            invoiceType: res.invoiceType?.name || '',
            createdAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString() : '',
            noFac: res.noFac || '',
            supplier: res.supplier?.company_name || ''
          });

          // Limpiar el FormArray y cargar los detalles
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

  closeModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
      this.isClosing = false;
    }, 300);
  }

}
