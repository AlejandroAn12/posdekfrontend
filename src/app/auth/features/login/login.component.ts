import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../data-access/auth.service.ts.service';
import { FormBuilder, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ILogin } from '../../interfaces/login.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FooterComponent } from "../../../shared/features/footer/footer.component";
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent implements OnInit {
  // Inyecciones de servicios
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Estados del componente
  loginForm: FormGroup;
  isDarkMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor() {
    // Detectar modo oscuro del sistema
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Inicializar formulario
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Verificar si ya está autenticado
    // if (this.storageService.get()) {
    //   this.router.navigate(['/admin/dashboard']);
    // }

    // Escuchar cambios en el modo oscuro
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.isDarkMode = e.matches;
    });
  }

  // Manejar el envío del formulario
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: ILogin = {
      username: this.loginForm.get('username')?.value?.trim(),
      password: this.loginForm.get('password')?.value?.trim()
    };

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Inicio de sesión exitoso',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end'
        });

        // Redirigir al dashboard
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.handleLoginError(err);
      }
    });
  }

  // Manejar errores de login
  private handleLoginError(err: any): void {
    let errorTitle = 'Error de autenticación';
    let errorText = 'Ocurrió un error al intentar iniciar sesión';

    switch (err.error?.errorCode) {
      case 'LOGIN_INACTIVE_USER':
        errorTitle = 'Usuario inactivo';
        errorText = err.error.message || 'Tu cuenta está desactivada. Contacta al administrador.';
        break;

      case 'USER_INVALID':
        errorTitle = 'Credenciales inválidas';
        errorText = err.error.message || 'El usuario o contraseña son incorrectos.';
        break;

      case 'USER_NOT_AUTHORIZED':
        errorTitle = 'Acceso no autorizado';
        errorText = err.error.message || 'No tienes permisos para acceder al sistema.';
        break;

      case 'CREDENTIALS_INCORRECT':
        errorTitle = 'Credenciales incorrectas';
        errorText = err.error.message || 'Verifica tu usuario y contraseña.';
        break;

      case 0:
        errorTitle = 'Error de conexión';
        errorText = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
        break;

      case 500:
        errorTitle = 'Error del servidor';
        errorText = 'El servidor no está disponible en este momento. Intenta más tarde.';
        break;

      default:
        errorText = err.error?.message || errorText;
    }

    // Mostrar error al usuario
    Swal.fire({
      icon: 'error',
      title: errorTitle,
      text: errorText,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6'
    });

    // Limpiar contraseña en caso de error
    this.loginForm.get('password')?.reset();
  }

  // Marcar todos los campos como tocados para mostrar errores
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Método para cambiar entre modo claro/oscuro (opcional)
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  // Getter para acceder fácilmente a los controles del formulario
  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}