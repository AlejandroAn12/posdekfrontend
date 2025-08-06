import { Component, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { UserService } from '../../data-access/user.service';
import { ICredentialsAccess } from '../../interfaces/user.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { IRole } from '../../../../../core/models/role.interface';
import { AlertService } from '../../../../../core/services/alerts.service';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Config } from 'datatables.net';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../../../shared/features/header/header.component';

@Component({
  selector: 'app-view-users',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, DataTablesModule, HeaderComponent],
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.css'
})
export default class ViewUsersComponent implements OnInit {

  //Renderizado del datatables
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();

  //Injeccion de Servicios
  authService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private alertsService = inject(AlertService);
  private renderer = inject(Renderer2);
  dtOptions: Config = {};

  usersSignal = signal<ICredentialsAccess[]>([]);
  errorMessage: string = '';

  //Modal
  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing: boolean = false;

  titleComponent: string = 'Gestión de credenciales';
  subtitleComponent: string = 'Listado de credenciales';

  //
  credential: any = [];
  roles: IRole[] = [];
  employees: any[] = ["s"];
  credentials: ICredentialsAccess[] = [];
  selectedCredentialId: string | null = null;


  constructor() {}

  ngOnInit(): void {
    this.loadTable();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  //Metodo para refrescar la tabla
  refreshTable(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }
  }

  //Cargar DataTable
  loadTable() {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.authService.getCredendentials().subscribe((resp: any) => {
          callback({
            data: resp.credentials
          });
        });
      },
      columnDefs: [
        { width: '150px', targets: 0 }, // Código de empleado
        { width: '120px', targets: 1 }, // Usuario
        { width: '100px', targets: 2 }, // Rol
        { width: '180px', targets: 3 }, // Fecha de Registro
        { width: '200px', targets: 4 }, // Última Actualización
        { width: '100px', targets: 5 }, // Habilitado
        { width: '150px', targets: 6 }  // Acciones
      ],
      scrollX: true,
      language: {
        emptyTable: this.errorMessage || "No hay información disponible",
        loadingRecords: "Cargando datos...",
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
        { title: 'Cod.', data: 'employee.codeEmployee', className: 'text-center text-sm text-gray-500' },
        { title: 'Usuario', data: 'username', className: 'text-center text-sm text-gray-600' },
        { title: 'Cargo', data: 'role.name', className: 'text-center text-sm text-gray-600' },
        { title: 'Fecha de registro', data: 'createdAt', className: 'text-center text-sm text-gray-500' },
        { title: 'Fecha de actualización', data: 'updatedAt', className: 'text-center text-sm text-gray-500' },
        {
          title: 'Habilitado', data: 'status',
          render: (data: any, type: any, row: any) => {
            return `
              <input type="checkbox" class="status-toggle rounded cursor-pointer" ${data ? 'checked' : ''} />
          `;
          },
          className: 'text-center text-sm text-gray-500'
        },
        {
          title: 'Acciones',
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
          className: 'text-center text-sm text-gray-500'
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
            this.deleteCredentials(data.id);
          });
        }

        //Actualizar
        const btnUpdate = rowElement.querySelector('.btn-update') as HTMLInputElement;
        if (btnUpdate) {
          this.renderer.listen(btnUpdate, 'click', () => {
            this.editUser(data.id);
          });
        }
        return row;
      }
    };
  }

  deleteCredentials(id: string) {
    this.authService.deleteCredentials(id).subscribe({
      next: (res: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `Credencial eliminada`,
          showConfirmButton: false,
          timer: 1500
        });
        this.refreshTable();
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: 'Error',
          text: `${err.error.message}`
        });
      },
    });
  }

  //Toggle para actualizar el estado de la credencial (ACTIVO : INACTIVO)
  onStatusChange(event: Event, credentials: any): void {
    const checkbox = event.target as HTMLInputElement;
    credentials.status = checkbox.checked;
    this.updateProductStatus(credentials);
  }

  updateProductStatus(credentials: any): void {
    this.authService.updateCredentialsStatus(credentials.id, credentials.status).subscribe({
      next: (res: any) => {
        if (credentials.status) {
          this.alertsService.showSuccess(`Credencial activada`, `${res.message}`);
        }
        else {
          this.alertsService.showSuccess(`Credencial inactiva`, `${res.message}`)
        }
      },
      error: (error) => this.alertsService.showError(`${error.error.message}`, `${error.statusText}`),
    });
  }

  downloadExcel() {
    this.alertsService.showInfo('Metodo aun no implementado', 'Información')
  }

  editUser(userId: string) {
    this.router.navigate(['/index/credentials/form'], { queryParams: { form: 'update', id: userId } });
  }

  routeNext() {
    this.router.navigate(['/index/credentials/form']);
  }
}
