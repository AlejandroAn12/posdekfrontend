import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../data-access/user.service';
import { ICredentialsAccess } from '../../interfaces/user.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-users',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.css'
})
export default class ViewUsersComponent {

  userService = inject(UserService);
  private fb = inject(FormBuilder);
  CredentialsForm: FormGroup;

    usersSignal = signal<ICredentialsAccess[]>([]);
    credentials : string = '';
    errorMessage: string = '';
  
  
  constructor(){
    this.viewCredentials();
    this.CredentialsForm = this.fb.group({
          name: ['', Validators.required],
          barcode: ['', Validators.required],
          code: ['', Validators.required],
          stock: [0, Validators.required],
          purchase_price: [0, Validators.required],
          sale_price: [0, Validators.required],
          categoryId: ['', Validators.required],
          description: ['', Validators.required],
        });
    }

  viewCredentials(){
    this.userService.getCredendentials().subscribe({
      next: (data) => {
        this.credentials = data.credentials || [];
        this.usersSignal.set(data.credentials || []);
        this.errorMessage = '';
      },
      error: (err) => {
        if (err.status === 404) {
          this.usersSignal.set([]); // Limpia la lista de productos
          this.errorMessage = err.error.message || 'No hay credenciales registradas.';
        } else {
          console.error('Error al cargar credenciales:', err);
          this.errorMessage = 'Ocurrió un error al cargar las credenciales.';
        }
      }
    })
  }

  deleteCredentials(id: string) {
    this.userService.deleteCredentials(id).subscribe({
      next: (res: any) => {
        this.viewCredentials();
      },
      error: (err) => console.error('Error al eliminar credenciales:', err),
    });
  }

  // Actualiza el estado del producto
    toggleStatus(credential: ICredentialsAccess): void {
      // Alternar el estado
      const updatedStatus = !credential.status;
  
      this.userService.updateCredentialsStatus(credential.id, updatedStatus).subscribe({
        next: () => {
          this.usersSignal.update((credentials) =>
            credentials.map((p) =>
              p.id === credential.id ? { ...p, status: updatedStatus } : p
            )
          );
        },
        error: (err) => {
          console.error('Error al actualizar el estado de la credencial:', err);
        },
      });
    }


}
