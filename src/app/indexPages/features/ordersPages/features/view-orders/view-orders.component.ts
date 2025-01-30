import { Component, inject } from '@angular/core';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../shared/services/alerts.service';
import { OrdersService } from '../../data-access/orders.service';

@Component({
  selector: 'app-view-orders',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './view-orders.component.html',
  styleUrl: './view-orders.component.css'
})
export default class ViewOrdersComponent {

  private supplierService = inject(SuppliersService);
  private ordersService = inject(OrdersService);
  private alertsService = inject(AlertService);

  suppliers: any[] = [];
  products: any[] = [];
  orderItems: any[] = [];
  selectedProducts: any[] = [];
  selectedSupplierId: string = '';

  constructor() {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (response) => {
        this.suppliers = response.suppliers;
      },
      error: (err) => {
        this.alertsService.showError(err.error.message, err.statusText)
      },
    });
  }

  // onSupplierChange(event: any): void {
  //   this.selectedSupplierId = event.target.value;
  //   this.supplierService.getProductsBySupplier(this.selectedSupplierId).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       this.products = response;
  //     },
  //     error: (err) => {
  //       console.error('Error loading products:', err);
  //     },
  //   });
  // }

  onSupplierChange(event: any): void {
    const supplierId = event.target.value;
    this.selectedSupplierId = supplierId;
  
    // Limpia la lista de productos seleccionados y la tabla
    this.selectedProducts = [];
  
    // Carga los productos del proveedor seleccionado
    this.supplierService.getProductsBySupplier(supplierId).subscribe({
      next: (response) => {
        this.products = response; // Asegúrate de que `response` contenga la lista de productos
        console.log('Productos cargados:', this.products);
      },
      error: (err) => {
        console.error('Error al cargar los productos:', err);
      },
    });
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
        unitPrice: selectedProduct.purchase_price,
        quantity: 1,
      });
    }
  }

  removeItem(productId: number): void {
    this.orderItems = this.orderItems.filter((item) => item.id !== productId);
  }

  submitOrder(): void {
    if (this.selectedProducts.length === 0) {
      this.alertsService.showError('No hay productos seleccionados para crear la orden.', '');
      return;
    }

    // Formar el objeto de la orden con los productos seleccionados
    const order = {
      supplier: this.selectedSupplierId, // Asegúrate de almacenar el ID del proveedor seleccionado
      orderItems: this.selectedProducts.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
    };
    

    // Enviar la orden al backend
    this.ordersService.generateOrder(order).subscribe({
      next: (response) => {
        this.alertsService.showSuccess(`${response.message}`, '');
        this.resetOrderForm();
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      },
    });
  }

  resetOrderForm(): void {
    this.selectedProducts = [];
    this.products = [];
    this.selectedSupplierId = ''; // O reinicia según tu lógica
  }

  addToTable(selectElement: HTMLSelectElement): void {
    const productId = selectElement.value;
  
    if (!productId) {
      // console.error('El valor del producto es inválido.');
      this.alertsService.showError('El valor del producto es inválido.', '');

      return;
    }
  
    const product = this.products.find((p) => p.id === productId);
  
    if (!product) {
      this.alertsService.showError('Producto no encontrado.', '');
      return;
    }
  
    const existingProduct = this.selectedProducts.find((p) => p.id === productId);
    if (existingProduct) {
      this.alertsService.showWarning('El producto ya está en la lista.', '');
      return;
    }
  
    // Agrega el producto a la tabla
    this.selectedProducts.push({ ...product, quantity: 1 });
  
    // Resetea el select
    selectElement.value = "";
  }
  
  
  

  removeProduct(productId: string): void {
    this.selectedProducts = this.selectedProducts.filter((p) => p.id !== productId);
  
    // Opcional: resetear el select al eliminar
    const selectElement = document.querySelector('#productSelect') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = "";
    }
  }
  
  

  getTotal(): number {
    return this.selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.purchase_price,
      0
    );
  }

  trackByProductId(index: number, product: any): string {
    return product.id;
  }
  
}
