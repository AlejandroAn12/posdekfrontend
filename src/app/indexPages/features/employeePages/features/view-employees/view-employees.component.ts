import { Component, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { EmployeeService } from '../../data-access/employee.service';
import { IEmployee } from '../../interface/employee.interface';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../../shared/features/components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../../../../core/services/role.service';
import { IRole } from '../../../../../core/models/role.interface';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Config } from 'datatables.net';
import { AlertService } from '../../../../../core/services/alerts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-employees',
  imports: [ReactiveFormsModule, CommonModule, DataTablesModule],
  templateUrl: './view-employees.component.html',
  styleUrl: './view-employees.component.css'
})
export default class ViewEmployeesComponent implements OnInit {

  //Injections
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private renderer = inject(Renderer2);
  private alertsService = inject(AlertService);
  dtOptions: Config = {};

  totalEmployees: number = 0;
  employees: IEmployee[] = [];
  employee: any = [];
  roles: IRole[] = [];
  employeesSignal = signal<IEmployee[]>([]);
  errorMessage: string = '';
  selectedEmployeeId: string | null = null;


  //Formulario
  form: FormGroup;
  isDisabled: boolean = true;


  //Modal
  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing: boolean = false;


  constructor() {
    this.form = this.fb.group({
      codeEmployee: [{ value: '', disabled: this.isDisabled }],
      name: ['', Validators.required],
      role: [{ value: '' }],
      surname: ['', Validators.required],
      dni: [{ value: '', required: true }],
      address: [{ value: '' }],
      email: ['', Validators.required],
      tlf: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadTable();
    this.loadRoles();
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


  //Cargar DataTable
  loadTable() {
    this.dtOptions = {

      ajax: (dataTablesParameters: any, callback) => {
        this.employeeService.getEmployees().subscribe((resp: any) => {
          callback({
            data: resp.employees
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
        { title: 'Cód.', data: 'codeEmployee', className: 'text-sm text-gray-500' },
        { title: 'N°. identificación', data: 'dni', className: 'text-sm text-gray-500' },
        { title: 'Nombres', data: 'name', className: 'text-sm text-gray-500' },
        { title: 'Apellidos', data: 'surname', className: 'text-sm text-gray-500' },
        { title: 'Correo electrónico', data: 'email', className: 'text-sm text-gray-500' },
        { title: 'Teléfono', data: 'tlf', className: 'text-sm text-gray-500' },
        { title: 'Fecha de registro', data: 'registration_date', className: 'text-sm text-gray-500' },
        {
          title: 'Habilitado', data: 'status',
          render: (data: any, type: any, row: any) => {
            return `
                <input type="checkbox" class="status-toggle rounded cursor-pointer" ${data ? 'checked' : ''} />
            `;
          },
          className: 'text-center text-sm text-gray-500' // Centrar la columna
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
          className: 'action-column text-sm text-gray-500'
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
            this.deleteEmployee(data.id);
          });
        }

        //Actualizar
        const btnUpdate = rowElement.querySelector('.btn-update') as HTMLInputElement;
        if (btnUpdate) {
          this.renderer.listen(btnUpdate, 'click', () => {
            this.editEmployee(data.id);
          });
        }
        return row;
      }
    };
  }


  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = data.roles;
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `${err.error.message}`
        });
      },
    });
  }

  editEmployee(employeeId: string) {
    this.router.navigate(['/index/employees/form'], { queryParams: { form: 'update', id: employeeId } });
  }

  deleteEmployee(id: string) {
    this.employeeService.deleteEmployee(id).subscribe({
      next: (res: any) => {
        console.log(res);
        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        });
        this.refreshTable();
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: `Acción no permitida`,
          text: `${err.error.message}`
        });
      },
    });
  }

  onStatusChange(event: Event, employee: any): void {
    const checkbox = event.target as HTMLInputElement;
    employee.status = checkbox.checked;

    this.updateEmployeeStatus(employee);
  }

  updateEmployeeStatus(employee: any): void {
    this.employeeService.updateEmployeeStatus(employee.id, employee.status).subscribe({
      next: (resp: any) => {
        if (resp.status) {
          this.alertsService.showSuccess(`Empleado Habilitado`, '')
        } else if (!resp.status) {
          this.alertsService.showSuccess(`Empleado Deshabilitado`, '')
        }
        else {
          this.alertsService.showError(`Error al habilitar empleado`, 'Error')
        }
      },
      error: (error) => this.alertsService.showError(`${error.error.message}`, 'Error')
    });
  }

  downloadExcel() {
    this.alertsService.showInfo('Metodo aun no implementado', 'Información')
  }

  btnNewEmployee() {
    this.router.navigate(['index/employees/form']);
  }

}
