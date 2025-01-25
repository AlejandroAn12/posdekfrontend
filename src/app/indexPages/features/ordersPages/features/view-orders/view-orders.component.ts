import { Component } from '@angular/core';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../shared/services/alerts.service';

@Component({
  selector: 'app-view-orders',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './view-orders.component.html',
  styleUrl: './view-orders.component.css'
})
export default class ViewOrdersComponent {

  suppliers: any[] = [];
  products: any[] = [];
  orderItems: any[] = [];
  selectedProducts: any[] = []; // Productos seleccionados para la tabla

  constructor(private supplierService: SuppliersService, private alertsService: AlertService) {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (response) => {
        this.suppliers = response.suppliers; // Verifica si 'response.suppliers' es correcto
      },
      error: (err) => {
        console.error('Error loading suppliers:', err);
      },
    });
  }
  
  onSupplierChange(event: any): void {
    const supplierId = event.target.value; // Obtén el ID del proveedor
    this.supplierService.getProductsBySupplier(supplierId).subscribe({
      next: (response) => {
        this.products = response; // Asigna los productos a 'this.products'
      },
      error: (err) => {
        console.error('Error loading products:', err); // Maneja cualquier error
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
    const order = {
      orderItems: this.orderItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    // Llama al servicio para crear la orden (a implementar)
    console.log('Orden creada:', order);
    // this.toastr.info('Orden creada', 'Toastr fun!');
    this.alertsService.showSuccess('Orden generada', '')
  }

  addToTable(target: EventTarget | null): void {

    if (!target) {
      this.alertsService.showError('El evento no tiene un target válido', '');
      return;
    }
  
    const selectElement = target as HTMLSelectElement;
    const productId = selectElement.value;
  
    const selectedProduct = this.products.find((product) => product.id === productId);
  
    if (selectedProduct) {
      const exists = this.selectedProducts.find((item) => item.id === selectedProduct.id);
      if (!exists) {
        this.selectedProducts.push({ ...selectedProduct, quantity: 1 });
        console.log('Producto añadido:', this.selectedProducts);
      } else {
      this.alertsService.showInfo('El producto ya se encuentra añadido', '');
        
      }
    } else {
      console.error('Producto no encontrado:', productId);
    }
  }

  
  removeFromTable(productId: number): void {
    this.selectedProducts = this.selectedProducts.filter(
      (product) => product.id !== productId
    );
  }

  getTotal(): number {
    return this.selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.purchase_price,
      0
    );
  }
}
