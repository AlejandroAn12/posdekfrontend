import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alerts.service';
import { EmployeeService } from '../../data-access/employee.service';
import { CommonModule } from '@angular/common';
import { IRole } from '../../../../../core/models/role.interface';
import { RoleService } from '../../../../../core/services/role.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-form-employee',
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent],
  templateUrl: './form-employee.component.html',
  styleUrl: './form-employee.component.css'
})
export default class FormEmployeeComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private roleService = inject(RoleService);

  employeeId: string | null = null;

  hidden: boolean = false;

  titleComponent: string = 'Gestión de colaboradores';
  subtitleComponent: string = '';


  constructor() {
    this.form = this.fb.group({
      codeEmployee: [{ value: '', disabled: this.isDisabled }],
      name: ['', { validators: [Validators.required], updateOn: 'change' }],
      // role: [{ value: '', hidden: this.hidden }],
      surname: ['', { validators: [Validators.required], updateOn: 'change' }],
      dni: ['', { validators: [Validators.required], updateOn: 'change' }],
      address: ['', { validators: [Validators.required], updateOn: 'change' }],
      email: ['', { validators: [Validators.required], updateOn: 'change' }],
      tlf: ['', { validators: [Validators.required], updateOn: 'change' }],
    });
  }
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const formMode = params['form'];
      this.employeeId = params['id'] || null;

      if (formMode === 'update' && this.employeeId) {
        this.isUpdate = true;
        this.loadEmployeeData(this.employeeId);
      }
    });
    this.loadRoles();
  }

  get f() {
    return this.form.controls;
  }

  //Formulario
  form: FormGroup;
  isDisabled: boolean = true;
  isUpdate: boolean = false;
  isEditing: boolean = false;
  roles: IRole[] = [];

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = data.roles;
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          text: err.error.message || 'Error',
          toast: true,
          timer: 4000,
          position: 'top',
          showConfirmButton: false
        });
      },
    });
  }

  loadEmployeeData(id: string) {
    this.employeeService.getEmployeeId(id).subscribe({
      next: (response: any) => {
        this.form.patchValue({
          codeEmployee: response.data.codeEmployee ?? response.data.codeEmployee, // Asegúrate de asignar solo el ID
          dni: response.data.dni,
          name: response.data.name,
          surname: response.data.surname,
          tlf: response.data.tlf,
          email: response.data.email,
          // role: response.data.credentials.role?.id ?? response.data.credentials.role?.id,
          address: response.data.address
        });
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: err.error.message || 'Error obteniendo los roles',
          toast: true,
          position: 'top',
          showConfirmButton: false
        });
      }
    });
  }

  saveEmployee() {

    if (this.form.invalid) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: 'Existen campos vacíos',
        toast: true,
        position: 'top',
        showConfirmButton: false
      });
      return;
    }

    const employeeData = this.form.value;

    if (this.isUpdate && this.employeeId) {
      // Actualizar empleado
      this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Información actualizada',
            position: 'top',
            showConfirmButton: false,
            toast: true,
            timerProgressBar: true,
            timer: 1500
          })
          this.router.navigate(['/admin/credentials/form']);
        },
        error: (err) => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: err.error.message || 'Error obteniendo los roles',
            toast: true,
            position: 'top',
            showConfirmButton: false
          });
        }
      });
    } else {
      // Registrar empleado
      this.employeeService.registerEmployee(employeeData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: "success",
            title: "Oops...",
            text: response.message || 'Colaborador registrado',
            toast: true,
            position: 'top',
            showConfirmButton: false
          });
          this.form.reset();
        },
        error: (err) => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: err.error.message || 'Error obteniendo los roles',
            toast: true,
            position: 'top',
            showConfirmButton: false
          });
        }
      });
    }

  }

  btnBack() {
    this.router.navigate(['admin/employees']);
  }
}
