import { Component, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth.service.ts.service';
import { FormBuilder, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ILogin } from '../../interfaces/login.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent {

  loginForm: FormGroup;

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    })
  }

  onLogin() {
    if (this.loginForm.valid) {
      // Crea un objeto con la interfaz ILogin
      const loginData: ILogin = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Login exitoso', response);
        },
        error: (error) => {
          console.error('Error al iniciar sesión', {error});
        },
      });
    }
    return;
  }

}
