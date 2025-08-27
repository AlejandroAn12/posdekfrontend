import { Component, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { SuppliersService } from '../../data-access/suppliers.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ISupplier } from '../../interface/supplier.interface';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../../shared/features/components/modal/modal.component';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import { Subject } from 'rxjs';
import { AlertService } from '../../../../../core/services/alerts.service';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-view-suppliers',
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],
  templateUrl: './view-suppliers.component.html',
  styleUrl: './view-suppliers.component.css'
})
export default class ViewSuppliersComponent implements OnInit {

  titleComponent: string = 'Gestión de proveedores';
  subtitleComponent: string = 'Listado de proveedores registrados';

  isLoading: boolean = false;

  //Renderizado
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  private renderer = inject(Renderer2);
  private router = inject(Router);

  private fb = inject(FormBuilder);
  private suppliersService = inject(SuppliersService);
  private alertsService = inject(AlertService);

  dtOptions: Config = {};

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

  constructor() {
    this.SupplierForm = this.fb.group({
      ruc: [{ value: '', required: true }],
      company_name: [{ value: '', required: true }],
      legal_representative: [{ value: '', required: true }],
      address: [{ value: '', required: true }],
      phone: [{ value: '', required: true }],
      city: [{ value: '', required: true }],
      country: [{ value: '', required: true }],
      email: [{ value: '', required: true }],
    });
  }
  ngOnInit(): void {
    this.loadTable();
  }



  //Cargar DataTable
  loadTable() {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.suppliersService.getSuppliers().subscribe((resp: any) => {
          callback({
            data: resp.suppliers
          });
        });
      },
      scrollX: true,
      language: {
        emptyTable: this.errorMessage || "No hay información disponible",
        loadingRecords: "Cargando datos...", // Este mensaje desaparece si `data` es vacío
        zeroRecords: "No se encontraron resultados",
        search: "Buscar:",
        lengthMenu: "",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        paginate: {
          next: "Siguiente",
          previous: "Anterior"
        },
      },
      lengthMenu: [10],
      columns: [
        // { title: 'ID', data: 'id' },
        { title: 'N° Ruc', data: 'ruc', className: 'text-gray-500 text-sm' },
        { title: 'Nombre de proveedor', data: 'company_name', className: 'text-gray-500 text-sm' },
        { title: 'Correo electrónico', data: 'email', className: 'text-gray-500 text-sm' },
        { title: 'Teléfono', data: 'phone', className: 'text-gray-500 text-sm' },
        { title: 'Ciudad', data: 'city', className: 'text-gray-500 text-sm' },
        { title: 'Fecha de registro', data: 'registration_date', className: 'text-gray-500 text-sm' },
        { title: 'Fecha de actualización', data: 'lastUpdated_date', className: 'text-gray-500 text-sm' },
        {
          title: 'Estado',
          data: 'status',
          render: (data: any) => {
            return `
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" ${data ? 'checked' : ''}>
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          `;
          },
          className: 'text-center text-sm text-gray-500'
        },
        {
          title: 'Opciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
                    <div class="flex space-x-3">
                      <button 
                        class="btn-update flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-md transition duration-200 ease-in-out text-sm font-medium" 
                        data-order-id="${row.id}">
                        <i class="fa-solid fa-pen-to-square"></i>
                        Editar
                      </button>

                      <button 
                        class="btn-delete flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition duration-200 ease-in-out text-sm font-medium" 
                        data-order-id="${row.id}">
                        <i class="fa-solid fa-trash"></i>
                        Eliminar
                      </button>
                    </div>
                  `;
          },
          className: 'action-column text-gray-500 text-sm'
        }
      ],
      rowCallback: (row: Node, data: any, index: number) => {
        // Cast row to HTMLElement to access querySelector
        const rowElement = row as HTMLElement;
        // Método para actualizar el estado del empleado con toggle
        const toggle = rowElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (toggle) {
          this.renderer.listen(toggle, 'change', (event) => {
            this.onStatusChange(event, data);
          });
        }
        //Eliminar
        const btnDelete = rowElement.querySelector('.btn-delete') as HTMLInputElement;
        if (btnDelete) {
          this.renderer.listen(btnDelete, 'click', () => {
            this.deleteSupplier(data.id);
          });
        }

        //Actualizar
        const btnUpdate = rowElement.querySelector('.btn-update') as HTMLInputElement;
        if (btnUpdate) {
          this.renderer.listen(btnUpdate, 'click', () => {
            this.editSupplier(data.id);
          });
        }
        return row;
      }
    };
  }


  //Metodo para refrescar la tabla
  refreshTable(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }
  }


  editSupplier(supplierId: string) {
    this.router.navigate(['/admin/suppliers/form'], { queryParams: { form: 'update', id: supplierId } });
  }

  //Metodo para eliminar un proveedor
  deleteSupplier(id: string) {
    this.suppliersService.deleteSupplier(id).subscribe({
      next: (res: any) => {
        this.alertsService.showSuccess(``, `${res.message}`);
        this.refreshTable();
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);

      },
    });
  }

  //Toggle para abrir el modal
  onStatusChange(event: Event, supplier: any): void {
    const checkbox = event.target as HTMLInputElement;
    supplier.status = checkbox.checked;
    this.updateSupplierStatus(supplier);
  }

  updateSupplierStatus(supplier: any): void {
    this.suppliersService.updateSupplierStatus(supplier.id, supplier.status).subscribe({
      next: (resp: any) => {
        if (resp) {
          Swal.fire({
            icon: "success",
            text: 'Proveedor habilitado',
            toast: true,
            position: 'top',
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: "warning",
            text: 'Proveedor deshabilitado',
            toast: true,
            position: 'top',
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        Swal.fire({
          icon: "error",
          text: error.error.message || 'Error',
          toast: true,
          position: 'top',
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    });
  }

  btnFormSupplier() {
    this.router.navigate(['admin/suppliers/form']);
  }
}
