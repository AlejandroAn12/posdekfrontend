import { Component, inject, OnInit, signal } from '@angular/core';
import { EmployeeService } from '../../data-access/employee.service';
import { IEmployee } from '../../interface/employee.interface';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../../shared/features/components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../../../../shared/services/role.service';
import { IRole } from '../../../../../shared/interfaces/role.interface';

@Component({
  selector: 'app-view-employees',
  imports: [ModalComponent, ReactiveFormsModule, CommonModule,],
  templateUrl: './view-employees.component.html',
  styleUrl: './view-employees.component.css'
})
export default class ViewEmployeesComponent {

  //Injections
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);

  totalEmployees: number = 0;
  employees: IEmployee[] = [];
  employee: any = [];
  roles: IRole[] = [];
  employeesSignal = signal<IEmployee[]>([]);
  errorMessage: string = '';
  selectedEmployeeId: string | null = null;


  //Formulario
  EmployeesForm: FormGroup;
  isDisabled: boolean = true;


  //Modal
  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing: boolean = false;

  //PAGINACION
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página
  totalCredentials: number = 0; // Total de productos
  pages: number[] = []; // Lista de páginas


  constructor() {
    this.viewEmployees();
    this.loadRoles();
    this.EmployeesForm = this.fb.group({
      codeEmployee: [{ value: '', disabled: this.isDisabled }],
      name: ['', Validators.required],
      role: [{value: ''}],
      surname: ['', Validators.required],
      dni: [{ value: '', required: true}],
      address: [{value: ''}],
      email: ['', Validators.required],
      tlf: ['', Validators.required],
    });
  }

  viewEmployees(page: number = 1, limit: number = 10) {
    this.employeeService.getEmployees(page, limit).subscribe({
      next: (data) => {
        this.totalEmployees = data.total;
        this.employees = data.employees || [];
        this.employeesSignal.set(data.employees || []);
        this.errorMessage = '';
      },
      error: (err) => {
        if (err.status === 404) {
          this.employeesSignal.set([]); // Limpia la lista de productos
          this.errorMessage = err.error.message || 'No hay empleados registrados.';
        } else {
          // console.error('Error al cargar credenciales:', err);
          this.errorMessage = 'Ocurrió un error al cargar información de empleados.';
          Swal.fire({
            icon: "error",
            title: `${err.statusText}`,
            text: `${err.error.message}`
          });
        }
      }
    })
  }


  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = data.roles;
      },
      error: (err) => {
        // console.error('Error al cargar roles:', err);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `${err.error.message}`
        });
      },
    });
  }

  //Guardar
  saveEmployee() {
    if (this.isEditing && this.selectedEmployeeId) {
      this.updateEmployee(this.selectedEmployeeId);
    } else {
      this.registerEmployee();
    }
  }

  //Añadir nueva credencial
  registerEmployee() {
    const newEmployee = this.EmployeesForm.value;
    this.employeeService.registerEmployee(newEmployee).subscribe({
      next: (res) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        });
        this.viewEmployees();
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
    this.EmployeesForm.reset();
    this.showModal = false;
  }

  //Actualizar categoria
  updateEmployee(id: string) {
    const updatedEmployee = this.EmployeesForm.value;
    this.employeeService.updateEmployee(id, updatedEmployee).subscribe({
      next: (res: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        });
        this.viewEmployees();
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

  deleteEmployee(id: string) {
    this.employeeService.deleteEmployee(id).subscribe({
      next: (res: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        });
        this.viewEmployees();
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
  toggleModal(employee: any = null) {
    this.showModal = !this.showModal;

    if (employee) {
      this.isEditing = true;
      this.titleModal = 'Actualizar datos de Empleado';
      this.selectedEmployeeId = employee.id;

      this.EmployeesForm.patchValue({
        codeEmployee: employee.codeEmployee,
        name: employee.name,
        surname: employee.surname,
        dni: employee.dni,
        email: employee.email,
        tlf: employee.tlf,
        address: employee.address
      });
    } else {
      this.isEditing = false;
      this.titleModal = 'Nuevo empleado';
      this.selectedEmployeeId = null;
      this.EmployeesForm.reset();
    }
  }

  onStatusChange(event: Event, employee: any): void {
    const checkbox = event.target as HTMLInputElement;
    employee.status = checkbox.checked;
  
    // Aquí puedes enviar la actualización al backend si es necesario
    this.updateEmployeeStatus(employee);
  }
  
  updateEmployeeStatus(employee: any): void {
    this.employeeService.updateEmployeeStatus(employee.id, employee.status).subscribe({
      next: (response) => console.log('Estado actualizado:', response),
      error: (error) => console.error('Error actualizando estado:', error),
    });
  }


  //Paginacion
  calculatePages() {
    const totalPages = Math.ceil(this.totalEmployees / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getEmployeesRange() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalEmployees);
    return `${start}-${end}`;
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.pages.length) {
      return; // Evita cambiar a páginas no válidas
    }

    this.currentPage = newPage;
    this.viewEmployees();
  }

}
