import { Component, inject } from '@angular/core';
import { AuthService } from '../../data-access/auth.service.ts.service';
import { FormBuilder, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ILogin } from '../../interfaces/login.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FooterComponent } from "../../../shared/features/footer/footer.component";

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, FooterComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export default class LoginComponent {

  loginForm: FormGroup;

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  _router = inject(Router);

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
          this._router.navigateByUrl('index/dashboard');
        },
        error: (err) => {
          console.error('Error al iniciar sesión', {err});
          Swal.fire({
            icon: "error",
            title: `${err.statusText}`,
            text: `${err.error.message}`
          });
        },
      });
    }
    return;
  }

}
