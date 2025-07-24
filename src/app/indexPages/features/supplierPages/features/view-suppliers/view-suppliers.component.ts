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
          title: 'Habilitado',
          data: 'status',
          render: (data: any, type: any, row: any) => {
            return `
              <input type="checkbox" class="status-toggle rounded cursor-pointer" ${data ? 'checked' : ''} />
          `;
          },
          className: 'text-center text-sm text-gray-500' // Centrar la columna
        },
        {
          title: 'Opciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
          <div>

                <button class="btn-update bg-blue-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                        <i class="fa-solid fa-pen-to-square mr-1"></i>
                        Editar
                </button>

                <button class="btn-delete bg-red-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                        <i class="fa-solid fa-trash mr-1"></i>
                        Eliminar
                </button>

          </div>`;
          },
          className: 'action-column text-gray-500 text-sm'
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
