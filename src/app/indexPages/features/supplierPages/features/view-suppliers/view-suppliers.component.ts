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
import { AlertService } from '../../../../../shared/services/alerts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-suppliers',
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],
  templateUrl: './view-suppliers.component.html',
  styleUrl: './view-suppliers.component.css'
})
export default class ViewSuppliersComponent implements OnInit {

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
        search: "Buscar:", // Cambia el texto del buscador
        lengthMenu: "",
        info: "Total de proveedores: _TOTAL_",
        paginate: {
          next: "Siguiente",
          previous: "Anterior"
        },
      },
      lengthMenu: [10],
      columns: [
        // { title: 'ID', data: 'id' },
        { title: 'N° RUC', data: 'ruc' },
        { title: 'Nombre de proveedor', data: 'company_name' },
        { title: 'Correo electrónico', data: 'email' },
        { title: 'Teléfono', data: 'phone' },
        { title: 'Ciudad', data: 'city' },
        { title: 'Fecha de registro', data: 'registration_date' },
        { title: 'Fecha de actualización', data: 'lastUpdated_date' },

        {
          title: 'Vigente',
          data: 'status',
          render: (data: any, type: any, row: any) => {
            return `
              <input type="checkbox" class="status-toggle rounded cursor-pointer" ${data ? 'checked' : ''} />
          `;
          },
          className: 'text-center' // Centrar la columna
        },
        {
          title: 'Opciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
          <div>

                <button class="btn-update border hover:bg-blue-600 w-10 text-sm text-blue-500 hover:text-white p-2 m-1 rounded-md" data-order-id="${row.id}">
                        <i class="fa-solid fa-pen-to-square"></i>
                </button>

                <button class="btn-delete border border-red-600 w-10 hover:bg-red-600 text-sm text-red-500 hover:text-white p-2 m-1 rounded-md" data-order-id="${row.id}">
                        <i class="fa-solid fa-trash"></i>
                </button>

          </div>`;
          },
          className: 'action-column'
        }
      ],
      rowCallback: (row: Node, data: any, index: number) => {
        // Cast row to HTMLElement to access querySelector
        const rowElement = row as HTMLElement;

        //Metodo para actulizar el estado del producto
        const checkbox = rowElement.querySelector('.status-toggle') as HTMLInputElement;
        if (checkbox) {
          this.renderer.listen(checkbox, 'change', (event) => {
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
    this.router.navigate(['/index/suppliers/form'], { queryParams: { form: 'update', id: supplierId } });
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
      next: (response: any) => this.alertsService.showSuccess(response.message, ''),
      error: (error) => this.alertsService.showError(error.error.message, error.statusText)
    });
  }

  btnFormSupplier() {
    this.router.navigate(['index/suppliers/form']);
  }
}
