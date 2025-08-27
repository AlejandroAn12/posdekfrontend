import { Component, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { EmployeeService } from '../../data-access/employee.service';
import { IEmployee } from '../../interface/employee.interface';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../../../../core/services/role.service';
import { IRole } from '../../../../../core/models/role.interface';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AlertService } from '../../../../../core/services/alerts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-employees',
  imports: [ReactiveFormsModule, CommonModule, DataTablesModule, ReactiveFormsModule],
  templateUrl: './view-employees.component.html',
  styleUrl: './view-employees.component.css'
})
export default class ViewEmployeesComponent implements OnInit {
  // Inyecciones de servicios
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private renderer = inject(Renderer2);
  private alertsService = inject(AlertService);

  // Configuración de DataTables
  dtOptions: any = {};
  isLoading: boolean = false;

  // Títulos del componente
  titleComponent: string = 'Gestión de colaboradores';
  subtitleComponent: string = 'Listado de colaboradores registrados';

  // Datos
  totalEmployees: number = 0;
  employees: IEmployee[] = [];
  employee: any = [];
  roles: IRole[] = [];
  employeesSignal = signal<IEmployee[]>([]);
  errorMessage: string = '';
  selectedEmployeeId: string | null = null;

  // Formulario
  form: FormGroup;
  isDisabled: boolean = true;

  // Modal
  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing: boolean = false;

  // DataTables
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();
  dataTable: any;

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
    this.initializeDataTable();
    this.loadEmployeesData();
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  // Inicializar configuración de DataTables
  initializeDataTable(): void {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback: any) => {
        this.employeeService.getEmployees().subscribe((resp: any) => {
          this.employees = resp.employees;
          this.totalEmployees = resp.employees.length;
          callback({
            recordsTotal: resp.employees.length,
            recordsFiltered: resp.employees.length,
            data: resp.employees
          });
        });
      },
      scrollX: true,
      responsive: true,
      language: {
        emptyTable: this.errorMessage || "No hay información disponible",
        loadingRecords: "Cargando datos...",
        zeroRecords: "No se encontraron resultados",
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "Mostrando 0 a 0 de 0 registros",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        }
      },
      lengthMenu: [10, 25, 50, 100],
      pageLength: 10,
      columns: [
        { title: 'Cód.', data: 'codeEmployee', className: 'text-sm text-gray-500' },
        { title: 'N°. identificación', data: 'dni', className: 'text-sm text-gray-500' },
        { title: 'Nombres', data: 'name', className: 'text-sm text-gray-500' },
        { title: 'Apellidos', data: 'surname', className: 'text-sm text-gray-500' },
        { title: 'Correo electrónico', data: 'email', className: 'text-sm text-gray-500' },
        { title: 'Teléfono', data: 'tlf', className: 'text-sm text-gray-500' },
        {
          title: 'Fecha de registro',
          data: 'registration_date',
          className: 'text-sm text-gray-500',
          render: (data: any) => {
            return data ? new Date(data).toLocaleDateString() : '';
          }
        },
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
      rowCallback: (row: Node, data: any, index: number) => {
        const rowElement = row as HTMLElement;

        // Método para actualizar el estado del empleado con toggle
        const toggle = rowElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (toggle) {
          this.renderer.listen(toggle, 'change', (event) => {
            this.onStatusChange(event, data);
          });
        }

        // Eliminar
        const btnDelete = rowElement.querySelector('.btn-delete') as HTMLInputElement;
        if (btnDelete) {
          this.renderer.listen(btnDelete, 'click', () => {
            this.deleteEmployee(data.id);
          });
        }

        // Actualizar
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

  // Cargar datos de empleados
  loadEmployeesData(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (resp: any) => {
        this.employees = resp.employees;
        this.totalEmployees = resp.employees.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los empleados';
        this.isLoading = false;
        Swal.fire({
          icon: "error",
          text: err.error.message || 'Error',
          toast: true,
          position: 'top',
          showConfirmButton: false
        });
      }
    });
  }

  // Método para refrescar la tabla
  refreshData(): void {
    this.isLoading = true;

    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        // Destruir la tabla existente
        dtInstance.destroy();

        // Recargar los datos
        this.loadEmployeesData();

        // Volver a inicializar DataTables
        this.dtTrigger.next(null);

        this.isLoading = false;

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          text: 'Datos actualizados correctamente',
          toast: true,
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: 'top'
        });
      }).catch((error: any) => {
        console.error('Error al refrescar la tabla:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          text: error.error.message || 'Error al actualizar los datos',
          toast: true,
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: 'top'
        });
      });
    } else {
      // Si no hay instancia de DataTables, simplemente recargar los datos
      this.loadEmployeesData();
      this.isLoading = false;
    }
  }

  // Método alternativo para refrescar la tabla (más simple)
  refreshTable(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }
  }

  // Cargar roles
  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = data.roles;
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          text: err.error.message || 'Error',
          toast: true,
          position: 'top',
          showConfirmButton: false
        });
      },
    });
  }

  // Editar empleado
  editEmployee(employeeId: string): void {
    this.router.navigate(['/admin/employees/form'], {
      queryParams: { form: 'update', id: employeeId }
    });
  }

  // Eliminar empleado
  deleteEmployee(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(id).subscribe({
          next: (res: any) => {
            Swal.fire({
              position: "top-end",
              icon: "success",
              text: `${res.message}`,
              showConfirmButton: false,
              toast: true,
              timerProgressBar: true,
              timer: 1500
            });
            this.refreshData(); // Usar refreshData en lugar de refreshTable
          },
          error: (err) => {
            Swal.fire({
              icon: "error",
              text: err.error.message || 'Error',
              toast: true,
              position: 'top',
              showConfirmButton: false
            });
          },
        });
      }
    });
  }

  // Cambiar estado del empleado
  onStatusChange(event: Event, employee: any): void {
    const checkbox = event.target as HTMLInputElement;
    employee.status = checkbox.checked;

    this.updateEmployeeStatus(employee);
  }

  // Actualizar estado del empleado
  updateEmployeeStatus(employee: any): void {
    this.employeeService.updateEmployeeStatus(employee.id, employee.status).subscribe({
      next: (resp: any) => {
        if (resp.status) {
          Swal.fire({
            icon: "success",
            text: 'Colaborador habilitado',
            toast: true,
            position: 'top',
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: "warning",
            text: 'Colaborador deshabilitado',
            toast: true,
            position: 'top',
            timer: 4000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }
        this.refreshTable(); // Refrescar solo la tabla sin recargar completamente
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          text: err.error.message || 'Error',
          toast: true,
          position: 'top',
          showConfirmButton: false
        });
        // Revertir el cambio en la UI si hay error
        this.refreshTable();
      }
    });
  }

  // Navegar a formulario de nuevo empleado
  btnNewEmployee(): void {
    this.router.navigate(['admin/employees/form']);
  }
}
