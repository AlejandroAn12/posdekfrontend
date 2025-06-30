import { Component, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { UserService } from '../../data-access/user.service';
import { ICredentialsAccess } from '../../interfaces/user.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ModalComponent } from '../../../../../shared/features/components/modal/modal.component';
import { RoleService } from '../../../../../shared/services/role.service';
import { IRole } from '../../../../../shared/interfaces/role.interface';
import { AlertService } from '../../../../../shared/services/alerts.service';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Config } from 'datatables.net';

@Component({
  selector: 'app-view-users',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ModalComponent, DataTablesModule],
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.css'
})
export default class ViewUsersComponent implements OnInit {

  //Injeccion de Servicios
  authService = inject(UserService);
  private fb = inject(FormBuilder);
  roleService = inject(RoleService);
  private alertsService = inject(AlertService);
  private renderer = inject(Renderer2);
  dtOptions: Config = {};

  //Formulario
  CredentialsForm: FormGroup;
  usersSignal = signal<ICredentialsAccess[]>([]);
  errorMessage: string = '';

  //Modal
  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing: boolean = false;

  //
  credential: any = [];
  roles: IRole[] = [];
  employees: any[] = ["s"];
  credentials: ICredentialsAccess[] = [];
  selectedCredentialId: string | null = null;


  constructor() {
    this.loadEmployeesWOutCredentials();
    this.loadRoles();
    this.CredentialsForm = this.fb.group({
      employee: ['', [Validators.required]],
      username: ['', [Validators.required]],
      employeeId: ['', [Validators.required]],
      password: ['', [Validators.required]],
      roleId: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    this.loadTable();
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
        info: "total de registros: _TOTAL_",
        paginate: {
          next: "Siguiente",
          previous: "Anterior"
        },
      },
      lengthMenu: [10],
      columns: [
        { title: 'Cod. Empleado', data: 'employee.codeEmployee', className: 'text-center text-sm text-gray-500' },
        { title: 'Nombre Usuario', data: 'username', className: 'text-center text-sm text-gray-600' },
        { title: 'Cargo Actual', data: 'role.name', className: 'text-center text-sm text-gray-600' },
        { title: 'Fecha de registro', data: 'registration_date', className: 'text-center text-sm text-gray-500' },
        { title: 'Fecha de actualización', data: 'lastUpdated_date', className: 'text-center text-sm text-gray-500' },
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
            this.toggleModal(data);
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
          text: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        });
        this.refreshTable();
        this.loadEmployeesWOutCredentials();
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

  loadEmployeesWOutCredentials() {
    this.authService.getEmployeesWithOutCredendentials().subscribe({
      next: (data) => {
        this.employees = data.employeesFound;
      },
      error: (err) => {
        return false;
      }
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
        console.log(res)
        this.alertsService.showSuccess(`${res.message}`, `Sistema`)
      },
      error: (error) => this.alertsService.showError(`${error.error.message}`, `${error.statusText}`),
    });
  }


  //Guardar
  saveCredential() {
    if (this.isEditing && this.selectedCredentialId) {
      this.updateCredential(this.selectedCredentialId);
    } else {
      this.addCredential();
    }
  }

  //Añadir nueva credencial
  addCredential() {
    const newCredentials = this.CredentialsForm.value;
    this.authService.addCredentials(newCredentials).subscribe({
      next: (res) => {
        this.alertsService.showSuccess(`${res.message}`, `Información`);
        this.refreshTable();
        this.loadEmployeesWOutCredentials();
      },
      error: (err) => {
        // console.error({err});
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      },
    });
    this.CredentialsForm.reset();
    this.showModal = false;
  }

  //Actualizar categoria
  updateCredential(id: string) {
    const updatedCredential = this.CredentialsForm.value;
    this.authService.updateCredential(id, updatedCredential).subscribe({
      next: (res: any) => {
        this.alertsService.showSuccess(`${res.message}`, `Información`);
        this.refreshTable();
        this.loadEmployeesWOutCredentials();
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      },
    });
    this.showModal = false;

  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = data.roles;
      },
      error: (err) => {
        // console.error('Error al cargar roles:', err);
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      },
    });
  }


  //Toggle para abrir el modal
  toggleModal(credential: any = null) {
    this.showModal = !this.showModal;

    if (credential) {
      this.isEditing = true;
      this.titleModal = 'Actualizar credencial';
      this.selectedCredentialId = credential.id;

      this.CredentialsForm.patchValue({
        employee: `${credential.employee.name} ${credential.employee.surname}`,
        username: credential.username,
        roleId: credential.role.id
      });
    } else {
      this.isEditing = false;
      this.titleModal = 'Agregar credencial';
      this.selectedCredentialId = null;
      this.CredentialsForm.reset();
    }
  }


  downloadExcel() {
    this.alertsService.showInfo('Metodo aun no implementado', 'Información')
  }

  //Renderizado del datatables
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();


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

  get f() {
    return this.CredentialsForm.controls;
  }

}
