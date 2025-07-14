import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alerts.service';
import { EmployeeService } from '../../data-access/employee.service';
import { CommonModule } from '@angular/common';
import { IRole } from '../../../../../core/models/role.interface';
import { RoleService } from '../../../../../core/services/role.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-form-employee',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-employee.component.html',
  styleUrl: './form-employee.component.css'
})
export default class FormEmployeeComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private alertsService = inject(AlertService);
  private roleService = inject(RoleService);

  employeeId: string | null = null;

  hidden : boolean = false;


  constructor() {
    this.EmployeesForm = this.fb.group({
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

  //Formulario
  EmployeesForm: FormGroup;
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
        // console.error('Error al cargar roles:', err);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `${err.error.message}`
        });
      },
    });
  }

  loadEmployeeData(id: string) {
    this.employeeService.getEmployeeId(id).subscribe({
      next: (response: any) => {
        this.EmployeesForm.patchValue({
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
        this.alertsService.showError(err.error.message, err.statusText);
      }
    });
  }

  saveEmployee() {

    if (this.EmployeesForm.invalid) {
      this.alertsService.showError('Existen campos vacíos', 'Error');
      return;
    }

    const employeeData = this.EmployeesForm.value;

    if (this.isUpdate && this.employeeId) {
      // Actualizar empleado
      this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
        next: (response: any) => {
          this.alertsService.showSuccess(response.message, '');
          this.router.navigate(['/index/employees/view']);
        },
        error: (err) => {
          this.alertsService.showError(err.error.message, err.statusText);
        }
      });
    } else {
      // Registrar empleado
      this.employeeService.registerEmployee(employeeData).subscribe({
        next: (response) => {
          this.alertsService.showSuccess(response.message, '');
          this.EmployeesForm.reset();
        },
        error: (err) => {
          this.alertsService.showError(err.error.message, err.statusText);
        }
      });
    }

  }

  btnBack() {
    this.router.navigate(['index/employees/view']);
  }
}
