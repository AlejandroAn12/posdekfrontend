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
import * as DataTables from 'datatables.net';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../../../shared/features/header/header.component';

@Component({
  selector: 'app-view-users',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, DataTablesModule],
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.css'
})
export default class ViewUsersComponent implements OnInit {

  //Renderizado del datatables
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  uniqueRoles: string[] = [];
  allData: any[] = []; // cache para los datos

  isLoading: boolean = false;

  //Injeccion de Servicios
  authService = inject(UserService);
  private router = inject(Router);
  private alertsService = inject(AlertService);
  private renderer = inject(Renderer2);
  // dtOptions: Config = {};



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


  constructor() { }

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

  loadTable() {
    // Verifica si el DataTable ya fue inicializado y destrúyelo
    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy(); //Destruye la tabla actual antes de recargar
        this.initializeTable(); //Cargar nueva configuración
      });
    } else {
      this.initializeTable(); // Primera vez
    }
  }


  initializeTable() {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback: (data: object) => void) => {
        this.authService.getCredendentials().subscribe((resp: any) => {
          this.allData = resp.credentials;

          // Extraer los cargos únicos
          this.uniqueRoles = Array.from(
            new Set(this.allData.map((item) => item.role?.name))
          );

          callback({
            data: this.allData
          });
        });
      },
      columnDefs: [
        { width: '150px', targets: 0 },
        { width: '120px', targets: 1 },
        { width: '100px', targets: 2 },
        { width: '180px', targets: 3 },
        { width: '200px', targets: 4 },
        { width: '100px', targets: 5 },
        { width: '150px', targets: 6 }
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
        }
      },
      lengthMenu: [10],
      columns: [
        { title: 'Cod.', data: 'employee.codeEmployee', className: 'text-center text-sm text-gray-500' },
        { title: 'Usuario', data: 'username', className: 'text-center text-sm text-gray-600' },
        { title: 'Cargo', data: 'role.name', className: 'text-center text-sm text-gray-600' },
        { title: 'Fecha de registro', data: 'createdAt', className: 'text-center text-sm text-gray-500' },
        { title: 'Fecha de actualización', data: 'updatedAt', className: 'text-center text-sm text-gray-500' },
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
          title: 'Acciones',
          data: null,
          render: (row: any) => {
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
          className: 'action-column text-sm text-gray-500'
        }
      ],
      rowCallback: (row: Node, data: any) => {
        const rowElement = row as HTMLElement;

        // Método para actualizar el estado del empleado con toggle
        const toggle = rowElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (toggle) {
          this.renderer.listen(toggle, 'change', (event) => {
            this.onStatusChange(event, data);
          });
        }

        const btnDelete = rowElement.querySelector('.btn-delete') as HTMLInputElement;
        if (btnDelete) {
          this.renderer.listen(btnDelete, 'click', () => {
            this.deleteCredentials(data.id);
          });
        }

        const btnUpdate = rowElement.querySelector('.btn-update') as HTMLInputElement;
        if (btnUpdate) {
          this.renderer.listen(btnUpdate, 'click', () => {
            this.editUser(data.id);
          });
        }

        return row;
      }
    };

    // Inicia DataTable
    this.dtTrigger.next(null);
  }




  filterByRole(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const role = selectElement.value;

    const filteredData = role
      ? this.allData.filter(item => item.role?.name === role)
      : this.allData;

    const table = $('#datatable').DataTable();
    table.clear();
    table.rows.add(filteredData);
    table.draw();
  }

  selectedRole: string = '';

  onRoleChange(role: string) {
    const filteredData = role
      ? this.allData.filter(item => item.role?.name === role)
      : this.allData;

    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.clear();
      dtInstance.rows.add(filteredData);
      dtInstance.draw();
    });
  }


  deleteCredentials(id: string) {
    this.authService.deleteCredentials(id).subscribe({
      next: () => {
        Swal.fire({
          position: "top",
          icon: "success",
          title: `Credencial eliminada`,
          showConfirmButton: false,
          toast: true,
          timerProgressBar: true,
          timer: 4000
        });
        this.refreshTable();
      },
      error: (err) => {
        console.error(err)
        Swal.fire({
          position: "top",
          icon: "error",
          title: err.error.message || 'Error',
          showConfirmButton: false,
          toast: true,
          timerProgressBar: true,
          timer: 4000
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
        if (res) {
          Swal.fire({
            position: "top",
            icon: "success",
            title: 'Credencial Habilitada',
            showConfirmButton: false,
            toast: true,
            timerProgressBar: true,
            timer: 4000
          });
        }
        else {
          Swal.fire({
            position: "top",
            icon: "warning",
            title: 'Credencial Inhabilitada',
            showConfirmButton: false,
            toast: true,
            timerProgressBar: true,
            timer: 4000
          });
        }
      },
      error: (error) => this.alertsService.showError(`${error.error.message}`, `${error.statusText}`),
    });
  }

  editUser(userId: string) {
    this.router.navigate(['/admin/credentials/form'], { queryParams: { form: 'update', id: userId } });
  }

  routeNext() {
    this.router.navigate(['/admin/credentials/form']);
  }
}
