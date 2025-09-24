import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InvoicesService } from '../../data-access/invoices.service';
import Swal from 'sweetalert2';
import { SuppliersService } from '../../../suppliers/data-access/suppliers.service';

@Component({
  selector: 'app-purchase-invoice',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './purchase-invoice.component.html',
  styleUrl: './purchase-invoice.component.css'
})
export default class PurchaseInvoiceComponent {
  titleComponent: string = 'Gestión de facturas'
  subtitleComponent: string = 'Ingresar factura de compra'

  fb = inject(FormBuilder);
  supplierService = inject(SuppliersService);
  invoiceService = inject(InvoicesService);

  form: FormGroup;
  suppliers: any[] = [];
  selectedSupplierId: string = '';
  selectedProducts: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  orderItems: any[] = [];
  invoiceTypes: any[] = [];
  searchTerm: string = '';

  constructor() {
    this.getInvoiceTypes();
    this.loadSuppliers();
    this.form = this.fb.group({
      supplierId: ['', [Validators.required]],
      noFac: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern(/^\d{3}-\d{3}-\d{9}$/)
          ],
          updateOn: 'change'
        }
      ],
    });
  }

  loadSuppliers() {
    this.supplierService.getAllSuppliersActive().subscribe({
      next: (res) => {
        this.suppliers = res;
      },
      error: (err) => {
        console.error(err)
      }
    })
  }

  onSupplierChange(event: any): void {
    const supplierId = event.target.value;
    this.selectedSupplierId = supplierId;
    this.searchTerm = '';
    this.filteredProducts = [];
    this.selectedProducts = [];

    // Actualizar el valor del formulario
    this.form.patchValue({
      supplierId: supplierId
    });

    this.supplierService.getProductsBySupplier(supplierId).subscribe({
      next: (response) => {
        this.products = response;
      },
      error: (err) => {
        console.error(err)
      },
    });
  }

  onSearchChange(): void {
    if (!this.searchTerm || !this.selectedSupplierId) {
      this.filteredProducts = [];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.barcode.toLowerCase().includes(term)
    ).slice(0, 10);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredProducts = [];
  }

  addProductToTable(product: any): void {
    if (!this.selectedProducts.find(p => p.id === product.id)) {
      this.selectedProducts.push({
        ...product,
        quantity: 1,
        purchasePrice: product.purchasePrice || 0
      });
      this.clearSearch();

      // Limpiar cualquier error previo del formulario
      this.form.setErrors(null);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Producto ya agregado',
        text: 'Este producto ya está en la lista',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top'
      });
    }
  }

  removeProduct(product: any): void {
    this.selectedProducts = this.selectedProducts.filter(p => p.id !== product.id);
  }

  clearAllProducts(): void {
    if (this.selectedProducts.length > 0) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Se eliminarán todos los productos de la lista",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, limpiar todo",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          this.selectedProducts = [];
        }
      });
    }
  }

  increaseQuantity(product: any): void {
    product.quantity++;
    this.updateTotals();
  }

  decreaseQuantity(product: any): void {
    if (product.quantity > 1) {
      product.quantity--;
      this.updateTotals();
    }
  }

  updateTotals(): void {
    this.selectedProducts = [...this.selectedProducts];
  }

  getTotalQuantity(): number {
    return this.selectedProducts.reduce((total, product) => total + product.quantity, 0);
  }

  getTotalAmount(): number {
    return this.selectedProducts.reduce((total, product) =>
      total + (product.purchasePrice * product.quantity), 0
    );
  }

  getInvoiceTypes() {
    this.invoiceService.getInvoiceTypes().subscribe({
      next: (res: any) => {
        this.invoiceTypes = res
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: err.error.message,
          position: 'top',
          toast: true
        });
      }
    })
  }

  saveInvoice() {
    // Validación básica del formulario
    if (this.form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Completa todos los campos requeridos.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top'
      });
      return;
    }

    // Validar que haya productos seleccionados
    if (this.selectedProducts.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes agregar al menos un producto a la factura.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top'
      });
      return;
    }

    // Validar que todos los productos tengan cantidad y precio válidos
    const invalidProducts = this.selectedProducts.filter(p =>
      !p.quantity || p.quantity < 1 || !p.purchasePrice || p.purchasePrice <= 0
    );

    if (invalidProducts.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los productos deben tener cantidad y precio válidos.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    const formValues = this.form.getRawValue();

    // Crear el payload correctamente con los IDs de producto
    const invoicePayload = {
      noFac: formValues.noFac,
      supplierId: formValues.supplierId,
      details: this.selectedProducts.map((product) => ({
        productId: product.id, // ← Aquí está el ID correcto del producto
        quantity: product.quantity,
        purchasePrice: product.purchasePrice,
      })),
    };


    Swal.fire({
      title: "¿Estás listo para continuar?",
      html: `
        <div class="text-left">
          <p>Estás a punto de guardar una factura con:</p>
          <ul class="mt-2 space-y-1">
            <li>• ${this.selectedProducts.length} productos</li>
            <li>• ${this.getTotalQuantity()} unidades totales</li>
            <li>• Total: $${this.getTotalAmount().toFixed(2)}</li>
          </ul>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, guardar factura",
      cancelButtonText: "No, volver atrás",
    }).then((result) => {
      if (result.isConfirmed) {
        this.invoiceService.createInvoice(invoicePayload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Factura guardada!',
              html: `
                <div class="text-center">
                  <p>Factura guardada correctamente</p>
                  <div class="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p class="text-sm">Total: <strong>$${this.getTotalAmount().toFixed(2)}</strong></p>
                  </div>
                </div>
              `,
              timer: 4000,
              timerProgressBar: true,
              showConfirmButton: false,
              toast: false,
              position: 'center'
            });
            this.resetForm();
          },
          error: (err) => {
            console.error('Error al guardar factura:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.message || 'No se pudo guardar la factura.',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
              toast: true,
              position: 'top'
            });
          }
        });
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.selectedProducts = [];
    this.selectedSupplierId = '';
    this.searchTerm = '';
    this.filteredProducts = [];
    this.products = [];
  }

  get f() {
    return this.form.controls;
  }

  trackByProductId(index: number, product: any): string {
    return product.id;
  }
}
