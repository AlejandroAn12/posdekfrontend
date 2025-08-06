import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../../../../shared/features/header/header.component';
import { InvoicesService } from '../../data-access/invoices.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-invoices',
  imports: [HeaderComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './view-invoices.component.html',
  styleUrl: './view-invoices.component.css'
})
export default class ViewInvoicesComponent {

  titleComponent: string = 'Gestión de facturas';
  subtitleComponent: string = 'Historial de facturas';

  invoiceService = inject(InvoicesService);
  private fb = inject(FormBuilder);

  filtroForm = this.fb.group({
    invoiceType: [''],
    fromDate: [''],
    toDate: ['']
  });

  isLoading: boolean = false;
  invoices: any[] = [];
  invoiceTypes: any[]= [];
  totalRegistros = 0;
  paginaActual = 1;
  limitePorPagina = 10;
  totalPaginas = 1;

  constructor(){
    this.getInvoiceTypes();

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
        console.log(res)
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

  getInvoiceTypes(){
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

}
