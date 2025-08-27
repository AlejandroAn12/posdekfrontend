import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { MovementTypeService } from '../../../../../core/services/movement-type.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { ProductsService } from '../../../products/data-access/products.service';
import { Router } from '@angular/router';


// Interfaces
interface MovementType {
  id: string;
  name: string;
  operation: 'IN' | 'OUT'; // Asumiendo que los tipos tienen una propiedad de operación
}

interface AdjustmentPayload {
  movementTypeId: string;
  quantity: number;
  productCode: string;
}

@Component({
  selector: 'app-adjustment',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HeaderComponent],
  templateUrl: './adjustment.component.html',
  styleUrl: './adjustment.component.css'
})
export default class AdjustmentComponent {

   // Inyecciones de servicios
  private movementTypeService = inject(MovementTypeService);
  private productService = inject(ProductsService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Títulos del componente
  titleComponent: string = 'Gestión de inventarios';
  subtitleComponent: string = '';

  // Datos
  movementTypes: MovementType[] = [];
  isLoading: boolean = false;
  productInfo: any = null;

  isSubmitting: boolean = false;

  // Formulario
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      movementTypeId: ['', [Validators.required]],
      barcode: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      quantity: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.getAllMovementTypes();
    this.setupFormListeners();
  }

  // Getter para acceder fácilmente a los controles del formulario
  get f() {
    return this.form.controls;
  }

  // Configurar listeners para el formulario
  setupFormListeners(): void {
    // Escuchar cambios en el código de barras para buscar el producto
    this.form.get('barcode')?.valueChanges.subscribe((barcode: string) => {
      if (barcode && this.form.get('barcode')?.valid) {
        this.lookupProduct(barcode);
      } else {
        this.productInfo = null;
      }
    });

    // Escuchar cambios en el tipo de movimiento para actualizar validaciones
    this.form.get('movementTypeId')?.valueChanges.subscribe((movementTypeId: string) => {
      this.updateQuantityValidation(movementTypeId);
    });
  }

  // Cargar tipos de movimiento
  getAllMovementTypes(): void {
    this.isLoading = true;
    
    this.movementTypeService.getAllMovementType().subscribe({
      next: (response) => {
        this.movementTypes = response.movementTypes || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener tipos de movimiento:', error);
        this.isLoading = false;
        
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los tipos de movimiento. Inténtalo de nuevo más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }

  // Buscar información del producto
  lookupProduct(barcode: string): void {
    this.productService.getProductByBarcode(barcode).subscribe({
      next: (product) => {
        this.productInfo = product;
      },
      error: (error) => {
        this.productInfo = null;
        // No mostrar error si es un 404 (producto no encontrado)
        if (error.status !== 404) {
          console.error('Error al buscar producto:', error);
        }
      }
    });
  }


  // Actualizar validación de cantidad según el tipo de movimiento
  updateQuantityValidation(movementTypeId: string): void {
    const movementType = this.movementTypes.find(type => type.id === movementTypeId);
    const quantityControl = this.form.get('quantity');
    
    if (movementType && movementType.operation === 'OUT' && this.productInfo) {
      // Para decrementos, la cantidad no puede ser mayor al stock actual
      quantityControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.productInfo.stock || 0)
      ]);
    } else {
      // Para incrementos, solo validaciones básicas
      quantityControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
    }
    
    quantityControl?.updateValueAndValidity();
  }

  // Obtener el tipo de movimiento seleccionado
  getSelectedMovementType(): MovementType | undefined {
    const movementTypeId = this.form.get('movementTypeId')?.value;
    return this.movementTypes.find(type => type.id === movementTypeId);
  }

  // Obtener mensaje de confirmación según el tipo de operación
  getConfirmationMessage(): string {
    const movementType = this.getSelectedMovementType();
    const quantity = this.form.get('quantity')?.value;
    
    if (!movementType || !this.productInfo) {
      return 'La cantidad ingresada se sumará o restará al stock actual. ¿Deseas continuar?';
    }

    const operation = movementType.operation === 'IN' ? 'sumará' : 'restará';
    const newStock = movementType.operation === 'IN' 
      ? (this.productInfo.stock + quantity) 
      : (this.productInfo.stock - quantity);

    return `Se ${operation} ${quantity} unidades al producto "${this.productInfo.name}". 
            Stock actual: ${this.productInfo.stock} → Nuevo stock: ${newStock}. 
            ¿Deseas continuar?`;
  }

  // Enviar formulario
  OnSubmit(): void {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      this.markFormGroupTouched(this.form);
      
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos correctamente.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const formValue = this.form.value;
    const payload = {
      movementTypeId: formValue.movementTypeId,
      quantity: formValue.quantity
    };
    const productCode = formValue.barcode;

    // Mostrar confirmación
    Swal.fire({
      title: "¿Confirmar ajuste de stock?",
      html: this.getConfirmationMessage(),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar ajuste",
      cancelButtonText: "No, cancelar",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return this.productService.adjustProductStock(productCode, payload).toPromise()
          .catch(error => {
            Swal.showValidationMessage(`
              Error: ${error.error?.message || 'No se pudo completar la operación'}
            `);
          });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Ajuste realizado!",
          text: "El ajuste se ha guardado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.form.reset();
          this.productInfo = null;
          // Opcional: redirigir o realizar otra acción
          // this.router.navigate(['/inventory']);
        });
      }
    });
  }

  // Método para marcar todos los campos del formulario como touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Método para reiniciar el formulario
  resetForm(): void {
    this.form.reset({
      movementTypeId: '',
      barcode: '',
      quantity: 0
    });
    this.productInfo = null;
  }

  // Método para obtener el stock máximo permitido para decrementos
  getMaxQuantity(): number {
    const movementType = this.getSelectedMovementType();
    if (movementType?.operation === 'OUT' && this.productInfo) {
      return this.productInfo.stock;
    }
    return 9999; // Un número alto para incrementos
  }

  scanBarcode(){}
  // private movementTypeService = inject(MovementTypeService);
  // private productService = inject(ProductsService);
  // private fb = inject(FormBuilder);

  // movementTypes: any[] = [];

  // titleComponent : string = 'Gestión de inventarios';
  // subtitleComponent : string = 'AJUSTE DE STOCK'

  // constructor() {
  //   this.getAllMovementTypes();
  // }

  // form = this.fb.group({
  //   movementTypeId: ['', Validators.required],
  //   barcode: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]], // Assuming EAN-13 format
  //   quantity: [0, [Validators.required, Validators.min(1)]],
  // });

  // getAllMovementTypes() {
  //   this.movementTypeService.getAllMovementType().subscribe({
  //     next: (response) => {
  //       this.movementTypes = response.movementTypes;
  //     },
  //     error: (error) => {
  //       console.error('Error al obtener tipos de movimiento:', error);
  //       Swal.fire({
  //         title: 'Error',
  //         text: 'No se pudieron cargar los tipos de movimiento. Inténtalo de nuevo más tarde.',
  //         icon: 'error',
  //         confirmButtonText: 'Aceptar'
  //       });
  //     }
  //   })
  // }

  

  // OnSubmit() {
  //   if (this.form.invalid) {
  //     Swal.fire({
  //       title: 'Error',
  //       text: 'Por favor, completa todos los campos correctamente.',
  //       icon: 'error',
  //       confirmButtonText: 'Aceptar'
  //     });
  //     return;
  //   }

  //   const formValue = this.form.value;

  //   const payload = {
  //     movementTypeId: formValue.movementTypeId,
  //     quantity: formValue.quantity
  //   }
  //   const productCode = formValue.barcode;

  //   Swal.fire({
  //     title: "¿Estás listo para continuar?",
  //     text: "La cantidad ingresada se  sumará o restará al stock actual. ¿Deseas continuar?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Sí, guardar ajuste",
  //     cancelButtonText: "No, volver atrás",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       // Ahora sí hacer la petición al backend
  //       this.productService.adjustProductStock(productCode ?? '', payload).subscribe({
  //         next: (resp) => {
  //           Swal.fire({
  //             title: "Ajuste realizado",
  //             text: "El ajuste se ha guardado correctamente.",
  //             icon: "success",
  //             showConfirmButton: false,
  //             timer: 1500
  //           });
  //           this.form.reset();
  //         },
  //         error: (err) => {
  //           console.error('Error al ajustar el stock del producto:', err);
  //           Swal.fire({
  //             title: 'Error',
  //             text: err?.error?.message || 'No se pudo ajustar el stock del producto.',
  //             icon: 'error',
  //             confirmButtonText: 'Aceptar'
  //           });
  //         }
  //       });
  //     }
  //   });
  // }


  // get f() {
  //   return this.form.controls;
  // }

}
