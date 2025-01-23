import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../data-access/user.service';
import { ICredentialsAccess } from '../../interfaces/user.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ModalComponent } from '../../../../../shared/features/components/modal/modal.component';
import { RoleService } from '../../../../../shared/services/role.service';
import { IRole } from '../../../../../shared/interfaces/role.interface';

@Component({
  selector: 'app-view-users',
  imports: [ReactiveFormsModule, CommonModule, ModalComponent],
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.css'
})
export default class ViewUsersComponent {

  //Injeccion de Servicios
  userService = inject(UserService);
  private fb = inject(FormBuilder);
  roleService = inject(RoleService);

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
  employees: any[] = [];
  credentials: ICredentialsAccess[] = [];
  selectedCredentialId: string | null = null;

  //PAGINACION
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página
  totalCredentials: number = 0; // Total de productos
  pages: number[] = []; // Lista de páginas


  constructor() {
    this.loadEmployeesWOutCredentials();
    this.loadRoles();
    this.viewCredentials();
    this.CredentialsForm = this.fb.group({
      employee: ['', Validators.required],
      username: ['', Validators.required],
      employeeId: ['', Validators.required],
      password: ['', Validators.required],
      roleId: ['', Validators.required],
    });
  }

  viewCredentials() {
    this.userService.getCredendentials().subscribe({
      next: (data) => {
        this.totalCredentials = data.total;
        this.credentials = data.credentials || [];
        this.usersSignal.set(data.credentials || []);
        this.errorMessage = '';
      },
      error: (err) => {
        if (err.status === 404) {
          this.usersSignal.set([]); // Limpia la lista de productos
          this.errorMessage = err.error.message || 'No hay credenciales registradas.';
        } else {
          // console.error('Error al cargar credenciales:', err);
          this.errorMessage = 'Ocurrió un error al cargar las credenciales.';
          Swal.fire({
            icon: "error",
            title: `${err.statusText}`,
            text: `${err.error.message}`
          });
        }
      }
    })
  }

  deleteCredentials(id: string) {
    this.userService.deleteCredentials(id).subscribe({
      next: (res: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        });
        this.viewCredentials();
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
    this.userService.getEmployeesWithOutCredendentials().subscribe({
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
  
    // Aquí puedes enviar la actualización al backend si es necesario
    this.updateProductStatus(credentials);
  }
  
  updateProductStatus(credentials: any): void {
    this.userService.updateCredentialsStatus(credentials.id, credentials.status).subscribe({
      next: (response) => console.log('Estado actualizado:', response),
      error: (error) => console.error('Error actualizando estado:', error),
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
    this.userService.addCredentials(newCredentials).subscribe({
      next: (res) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        });
        this.viewCredentials();
        this.loadEmployeesWOutCredentials();
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
    this.CredentialsForm.reset();
    this.showModal = false;
  }

  //Actualizar categoria
  updateCredential(id: string) {
    const updatedCredential = this.CredentialsForm.value;
    this.userService.updateCredential(id, updatedCredential).subscribe({
      next: (res: any) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          text: `${res.message}`,
          showConfirmButton: false,
          timer: 1500
        });
        this.viewCredentials();
        this.loadEmployeesWOutCredentials();
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


  //Toggle para abrir el modal
  toggleModal(credential: any = null) {
    this.showModal = !this.showModal;

    if (credential) {
      this.isEditing = true;
      this.titleModal = 'Actualizar Credenciales';
      this.selectedCredentialId = credential.id;

      this.CredentialsForm.patchValue({
        employee: `${credential.employee.name} ${credential.employee.surname}`,
        username: credential.username,
        roleId: credential.role.id
      });
    } else {
      this.isEditing = false;
      this.titleModal = 'Añadir credencial';
      this.selectedCredentialId = null;
      this.CredentialsForm.reset();
    }
  }



  //Paginacion
  calculatePages() {
    const totalPages = Math.ceil(this.totalCredentials / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getProductRange() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalCredentials);
    return `${start}-${end}`;
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.pages.length) {
      return; // Evita cambiar a páginas no válidas
    }

    this.currentPage = newPage;
    this.viewCredentials();
  }


}
