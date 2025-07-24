import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../../../core/services/role.service';
import { UserService } from '../../data-access/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-user',
  imports: [ReactiveFormsModule, CommonModule, FormsModule,],
  templateUrl: './form-user.component.html',
  styleUrl: './form-user.component.css'
})
export default class FormUserComponent {

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(UserService);
  private roleService = inject(RoleService);

  form: FormGroup;
  selectedCredentialId: string | null = null;
  roles: any[] = [];
  employees: any[] = [];
  userId: string | null = null;
  isUpdate: boolean = false;

  constructor() {
    this.activatedRoute.queryParams.subscribe(params => {
      const formMode = params['form'];
      this.userId = params['id'] || null;

      if (formMode === 'update' && this.userId) {
        this.isUpdate = true;
        this.loadUser(this.userId);
      }
    });
    this.loadRoles();
    this.loadEmployeesWOutCredentials();
    this.form = this.fb.group({
      employee: [{ value: '', disabled: true }, [Validators.required]],
      username: ['', [Validators.required]],
      employeeId: ['', [Validators.required]],
      password: ['', [Validators.required]],
      roleId: ['', [Validators.required]],
    })
  }

  get f() {
    return this.form.controls;
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = data.roles;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${err.error.mesagge}` || 'No se pudieron cargar los roles. Inténtalo de nuevo más tarde. ',
          position: 'top-end',
          showConfirmButton: false,
        })
      },
    });
  }

  loadUser(id: string){
  this.authService.getCredentialID(id).subscribe({
      next: (data:any) => {
        this.form.patchValue({
          employee: data.employee.name + ' ' + data.employee.surname,
          username: data.username,
          employeeId: data.employee._id,
          password: data.password,
          roleId: data.role.id
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${err.error.mesagge}` || 'No se pudo cargar el usuario. Inténtalo de nuevo más tarde.',
          position: 'top-end',
          showConfirmButton: false,
        })
      }
    });
  }

  loadEmployeesWOutCredentials() {
    this.authService.getEmployeesWithOutCredendentials().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        return false;
      }
    });
  }

  onSubmit() {
    if (this.isUpdate && this.selectedCredentialId) {
      this.updateCredential(this.selectedCredentialId);
    } else {
      this.addCredential();
    }
  }

  //Añadir nueva credencial
  addCredential() {
    const newCredentials = this.form.value;
    if (this.form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor, completa todos los campos requeridos correctamente.',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    this.authService.addCredentials(newCredentials).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: ' Credencial creada',
          text: `${res.message}`,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        })
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${err.error.mesagge}` || 'No se pudo agregar las credenciales. Inténtalo de nuevo más tarde.',
          position: 'top-end',
          showConfirmButton: false,
        })
      },
    });
    this.form.reset();
  }

  //Actualizar categoria
  updateCredential(id: string) {
    const updatedCredential = this.form.value;
    this.authService.updateCredential(id, updatedCredential).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: ' Credencial actualizada',
          text: `${res.message}`,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        });
        // this.loadEmployeesWOutCredentials();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${err.error.mesagge}` || 'No se pudo actualizar las credenciales. Inténtalo de nuevo más tarde.',
          position: 'top-end',
          showConfirmButton: false,
        })
      },
    });
  }

}
