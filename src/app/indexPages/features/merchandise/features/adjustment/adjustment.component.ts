import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { MovementTypeService } from '../../../../../core/services/movement-type.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../productsPages/data-access/products.service';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-adjustment',
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './adjustment.component.html',
  styleUrl: './adjustment.component.css'
})
export default class AdjustmentComponent {

  private movementTypeService = inject(MovementTypeService);
  private productService = inject(ProductsService);
  private fb = inject(FormBuilder);

  movementTypes: any[] = [];

  titleComponent : string = 'Gestión de inventarios';
  subtitleComponent : string = 'AJUSTE DE STOCK'

  constructor() {
    this.getAllMovementTypes();
  }

  form = this.fb.group({
    movementTypeId: ['', Validators.required],
    barcode: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]], // Assuming EAN-13 format
    quantity: [0, [Validators.required, Validators.min(1)]],
  });

  getAllMovementTypes() {
    this.movementTypeService.getAllMovementType().subscribe({
      next: (response) => {
        this.movementTypes = response.movementTypes;
      },
      error: (error) => {
        console.error('Error al obtener tipos de movimiento:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los tipos de movimiento. Inténtalo de nuevo más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    })
  }

  

  OnSubmit() {
    if (this.form.invalid) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const formValue = this.form.value;

    const payload = {
      movementTypeId: formValue.movementTypeId,
      quantity: formValue.quantity
    }
    const productCode = formValue.barcode;

    Swal.fire({
      title: "¿Estás listo para continuar?",
      text: "La cantidad ingresada se  sumará o restará al stock actual. ¿Deseas continuar?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar ajuste",
      cancelButtonText: "No, volver atrás",
    }).then((result) => {
      if (result.isConfirmed) {
        // Ahora sí hacer la petición al backend
        this.productService.adjustProductStock(productCode ?? '', payload).subscribe({
          next: (resp) => {
            Swal.fire({
              title: "Ajuste realizado",
              text: "El ajuste se ha guardado correctamente.",
              icon: "success",
              showConfirmButton: false,
              timer: 1500
            });
            this.form.reset();
          },
          error: (err) => {
            console.error('Error al ajustar el stock del producto:', err);
            Swal.fire({
              title: 'Error',
              text: err?.error?.message || 'No se pudo ajustar el stock del producto.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }


  get f() {
    return this.form.controls;
  }

}
