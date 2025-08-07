import { Component, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth.service.ts.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { HeaderComponent } from "../../../shared/features/header/header.component";

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export default class ChangePasswordComponent {

  titleComponent = 'Cambio de contraseña';
  subtitleComponent = '';

  private authService = inject(AuthService);
  private authStateService = inject(AuthStateService);
  private fb = inject(FormBuilder);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      currentPassword: ['', { validators: [Validators.required], updateOn: 'blur' }],
      newPassword: ['', { validators: [Validators.required, Validators.minLength(6), Validators.maxLength(20)], updateOn: 'blur' }],
      confirmPassword: ['', { validators: [Validators.required], updateOn: 'blur' }]
    },
      {
        validators: [this.passwordsMatchValidator]
      })
  }


  passwordsMatchValidator(formGroup: AbstractControl) {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }

    return null;
  }
  changePassword() {

    if (this.form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete todos los campos requeridos.',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true

      });
      return;
    }

    const data = this.form.value;
    if (data.newPassword !== data.confirmPassword) {
      console.error('New password and confirm password do not match');

      return;
    }
    data.currentPassword = data.currentPassword.trim();
    data.newPassword = data.newPassword.trim();

    this.authService.changePassword(data).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: response.message || 'Contraseña cambiada exitosamente',
          text: 'Para guardar los cambios la sesión se cerrará automáticamente, por favor inicie sesión nuevamente.',
          confirmButtonText: 'OK',
          timer: 8000,
          timerProgressBar: true,
          didClose: () => {
            this.authStateService.logOut();
          }
        })
        this.form.reset();
      },
      error: (error) => {
        console.error('Error changing password', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'An error occurred while changing the password',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  routerBack(){
    window.history.back();
  }

}
