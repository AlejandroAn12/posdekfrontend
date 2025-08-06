import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';

@Component({
  selector: 'app-purchase-invoice',
  imports: [HeaderComponent, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './purchase-invoice.component.html',
  styleUrl: './purchase-invoice.component.css'
})
export default class PurchaseInvoiceComponent {

  titleComponent: string = 'Gestión de facturas'
  subtitleComponent: string = 'Ingresar factura de compra'

  fb = inject(FormBuilder);
  supplierService = inject(SuppliersService);

  form: FormGroup;
  suppliers: any[] = [];
  selectedSupplierId: string = '';
  selectedProducts: any[] = [];
  products: any[] = [];
  orderItems: any[] = [];



  constructor() {
    this.loadSuppliers();
    this.form = this.fb.group({
      supplierId: ['', [Validators.required]],
      productId: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      noFac: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern(/^\d{3}-\d{3}-\d{9}$/)
          ],
          updateOn: 'change'
        }
      ]
    });

  }

  loadSuppliers() {
    this.supplierService.getAllSuppliersActive().subscribe({
      next: (res) => {
        console.log(res);
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

    // Limpia la lista de productos seleccionados y la tabla
    this.selectedProducts = [];

    // Carga los productos del proveedor seleccionado
    this.supplierService.getProductsBySupplier(supplierId).subscribe({
      next: (response) => {
        this.products = response;
      },
      error: (err) => {
        console.error(err)
      },
    });
  }

  addToTable(selectElement: HTMLSelectElement): void {
    const productId = selectElement.value;

    if (!productId) {
      console.error('El valor del producto es invalido');

      return;
    }

    const product = this.products.find((p) => p.id === productId);

    if (!product) {
      console.error('Producto no encontrado');
      return;
    }

    const existingProduct = this.selectedProducts.find((p) => p.id === productId);
    if (existingProduct) {
      console.error('El producto ya se encuentra en la lista');

      return;
    }

    // Agrega el producto a la tabla
    this.selectedProducts.push({ ...product, quantity: 1 });

    // Resetea el select
    selectElement.value = "";
  }

  onProductSelect(event: any): void {
    const productId = event.target.value;
    const selectedProduct = this.products.find(
      (product) => product.id === productId
    );

    if (selectedProduct && !this.orderItems.find((item) => item.id === productId)) {
      this.orderItems.push({
        id: selectedProduct.id,
        name: selectedProduct.name,
        unitPrice: selectedProduct.purchasePrice,
        quantity: 1,
      });
    }
  }

  get f() {
    return this.form.controls;
  }

   trackByProductId(index: number, product: any): string {
    return product.id;
  }
}
