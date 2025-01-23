import { Component, inject, signal } from '@angular/core';
import { SuppliersService } from '../../data-access/suppliers.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ISupplier } from '../../interface/supplier.interface';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../../shared/features/components/modal/modal.component';

@Component({
  selector: 'app-view-suppliers',
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './view-suppliers.component.html',
  styleUrl: './view-suppliers.component.css'
})
export default class ViewSuppliersComponent {
  private suppliersService = inject(SuppliersService);
  private fb = inject(FormBuilder);


  totalSuppliers: number = 0;
  suppliers: ISupplier[] = [];
  supplier: any = [];
  suppliersSignal = signal<ISupplier[]>([]);
  errorMessage: string = '';
  selectedSupplierId: string | null = null;


  //Formulario
  SupplierForm: FormGroup;
  isDisabled: boolean = true;


  //Modal
  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing: boolean = false;

  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página
  pages: number[] = []; // Lista de páginas

  constructor() {
    this.viewSuppliers();
    this.SupplierForm = this.fb.group({
      ruc: [{value: '', required: true}],
      company_name: [{value: '', required: true}],
      legal_representative: [{value: '', required: true}],
      address: [{value: '', required: true}],
      phone: [{value: '', required: true}],
      city: [{value: '', required: true}],
      country: [{value: '', required: true}],
      email: [{value: '', required: true}],
    });
  }


  viewSuppliers(page: number = 1, limit: number = 10) {
    this.suppliersService.getSuppliers(page, limit).subscribe({
      next: (response) => {
        this.totalSuppliers = response.total;
        this.suppliers = response.suppliers || [];
        this.suppliersSignal.set(response.suppliers || []);
        this.errorMessage = '';
      },
      error: (err) => {
        if (err.status === 404) {
          this.suppliersSignal.set([]);
          this.errorMessage = err.error.message || 'No hay proveedores registrados'
        } else {
          this.errorMessage = err.error.message || 'Ocurrió un error al cargar los proveedores'
          Swal.fire({
            icon: "error",
            title: `${err.statusText}`,
            text: `${err.error.message}`
          });
        }
      }
    })
  }

  saveSupplier() {
    if (this.isEditing && this.selectedSupplierId) {
      this.updateEmployee(this.selectedSupplierId);
    } else {
      this.addSupplier();
    }
  }

  addSupplier() {
      const newSupplier = this.SupplierForm.value;
      this.suppliersService.addSupplier(newSupplier).subscribe({
        next: (res) => {
          Swal.fire({
            position: "top-end",
            icon: "success",
            text: `${res.message}`,
            showConfirmButton: false,
            timer: 1500
          });
          this.viewSuppliers();
        },
        error: (err) => {
          // console.error({err});
          Swal.fire({
            icon: "error",
            title: `${err.statusText}`,
            text: `${err.error.message}`
          });
        },
      });
      this.SupplierForm.reset();
      this.showModal = false;
    }

    //Actualizar categoria
      updateEmployee(id: string) {
        const updatedSupplier = this.SupplierForm.value;
        this.suppliersService.updateSupplier(id, updatedSupplier).subscribe({
          next: (res: any) => {
            Swal.fire({
              position: "top-end",
              icon: "success",
              text: `${res.message}`,
              showConfirmButton: false,
              timer: 1500
            });
            this.viewSuppliers();
          },
          error: (err) => {
            // console.error(err);
            Swal.fire({
              icon: "error",
              title: `${err.statusText}`,
              text: `${err.error.message}`
            });
          },
        });
        this.showModal = false;
      }

  deleteSupplier(id: string) {
      this.suppliersService.deleteSupplier(id).subscribe({
        next: (res: any) => {
          Swal.fire({
            position: "top-end",
            icon: "success",
            text: `${res.message}`,
            showConfirmButton: false,
            timer: 1500
          });
          this.viewSuppliers();
        },
        error: (err) => {
          Swal.fire({
            icon: "error",
            title: `${err.statusText}`,
            text: `${err.error.message}`
          });
        },
      });
    }

    //Toggle para abrir el modal
  toggleModal(supplier: any = null) {
    this.showModal = !this.showModal;

    if (supplier) {
      this.isEditing = true;
      this.titleModal = 'Actualizar datos de Proveedor';
      this.selectedSupplierId = supplier.id;

      this.SupplierForm.patchValue({
        ruc: supplier.ruc,
        company_name: supplier.company_name,
        legal_representative: supplier.legal_representative,
        phone: supplier.phone,
        email: supplier.email,
        city: supplier.city,
        address: supplier.address,
        country: supplier.country,

      });
    } else {
      this.isEditing = false;
      this.titleModal = 'Nuevo proveedor';
      this.selectedSupplierId = null;
      this.SupplierForm.reset();
    }
  }

  onStatusChange(event: Event, supplier: any): void {
    const checkbox = event.target as HTMLInputElement;
    supplier.status = checkbox.checked;
    this.updateSupplierStatus(supplier);
  }

  updateSupplierStatus(supplier: any): void {
    this.suppliersService.updateSupplierStatus(supplier.id, supplier.status).subscribe({
      next: (response) => console.log('Estado actualizado:', response),
      error: (error) => console.error('Error actualizando estado:', error),
    });
  }

   //Paginacion
   calculatePages() {
    const totalPages = Math.ceil(this.totalSuppliers / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getEmployeesRange() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalSuppliers);
    return `${start}-${end}`;
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.pages.length) {
      return;
    }

    this.currentPage = newPage;
    this.viewSuppliers();
  }

}
