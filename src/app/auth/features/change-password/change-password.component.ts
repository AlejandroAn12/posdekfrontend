import { Component, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth.service.ts.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { HeaderComponent } from "../../../shared/features/header/header.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export default class ChangePasswordComponent {

  // Inyecciones de servicios
  private authService = inject(AuthService);
  private authStateService = inject(AuthStateService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Títulos del componente
  titleComponent = 'Cambio de contraseña';
  subtitleComponent = 'Actualiza tus credenciales de acceso';

  // Formulario y estados
  form: FormGroup;
  isChangingPassword: boolean = false;
  passwordStrength: number = 0;

  constructor() {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit(): void {
    // Escuchar cambios en la nueva contraseña para calcular fortaleza
    this.form.get('newPassword')?.valueChanges.subscribe((password: string) => {
      this.calculatePasswordStrength(password);
    });
  }

  // Validador personalizado para coincidencia de contraseñas
  passwordsMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  // Calcular fortaleza de la contraseña
  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      return;
    }

    let strength = 0;

    // Longitud
    if (password.length >= 8) strength += 25;

    // Mayúsculas
    if (/[A-Z]/.test(password)) strength += 25;

    // Números
    if (/[0-9]/.test(password)) strength += 25;

    // Símbolos
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    this.passwordStrength = strength;
  }

  // Obtener clase CSS para la barra de fortaleza
  getPasswordStrengthClass(): string {
    if (this.passwordStrength >= 75) return 'bg-green-500';
    if (this.passwordStrength >= 50) return 'bg-yellow-500';
    if (this.passwordStrength >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // Obtener texto descriptivo de fortaleza
  getPasswordStrengthText(): string {
    if (this.passwordStrength >= 75) return 'Fuerte - Buena contraseña';
    if (this.passwordStrength >= 50) return 'Media - Podría ser mejor';
    if (this.passwordStrength >= 25) return 'Débil - Considera añadir más caracteres';
    return 'Muy débil - Usa más caracteres y tipos';
  }

  // Obtener porcentaje de fortaleza para la barra de progreso
  getPasswordStrength(): number {
    return this.passwordStrength;
  }

  // Cambiar contraseña
  changePassword(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos correctamente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const data = {
      currentPassword: this.form.get('currentPassword')?.value?.trim(),
      newPassword: this.form.get('newPassword')?.value?.trim(),
      confirmPassword: this.form.get('confirmPassword')?.value?.trim()
    };

    if (data.newPassword !== data.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas nuevas no coinciden',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.isChangingPassword = true;

    this.authService.changePassword(data).subscribe({
      next: (response: any) => {
        this.isChangingPassword = false;

        Swal.fire({
          icon: 'success',
          title: '¡Contraseña cambiada!',
          html: `
            <div class="text-center">
              <p class="mb-3">${response.message || 'Contraseña cambiada exitosamente'}</p>
              <p class="text-sm text-gray-600">Serás redirigido para iniciar sesión con tu nueva contraseña.</p>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3085d6',
          timer: 5000,
          timerProgressBar: true,
          willClose: () => {
            this.authStateService.logOut();
            this.router.navigate(['auth/login']);
          }
        });

        this.form.reset();
      },
      error: (error) => {
        this.isChangingPassword = false;

        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar contraseña',
          text: error.error?.message || 'Ocurrió un error al intentar cambiar la contraseña',
          confirmButtonText: 'Entendido',
          timer: 5000,
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // Marcar todos los campos como tocados
  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  // Navegar hacia atrás
  routerBack(): void {
    this.router.navigate(['admin/dashboard']); // O usar window.history.back() según preferencia
  }

  // Getter para acceder fácilmente a los controles del formulario
  get f() {
    return this.form.controls;
  }
}
