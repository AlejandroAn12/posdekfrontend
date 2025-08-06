import { Component, inject } from '@angular/core';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../core/services/alerts.service';
import { OrdersService } from '../../data-access/orders.service';
import Swal from 'sweetalert2';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-view-orders',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, HeaderComponent],
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
  titleComponent : string = 'Gestión de ordenes';
  subtitleComponent: string = 'Generar orden'

  constructor() {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliersActive().subscribe({
      next: (res) => {
        this.suppliers = res;
      },
      error: (err) => {
        this.alertsService.showError(err.error.message, '')
      },
    });
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
        this.alertsService.showError(`${err.statusText}`, 'Error')
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
        unitPrice: selectedProduct.purchasePrice,
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
      supplier: this.selectedSupplierId, // ID del proveedor seleccionado
      orderItems: this.selectedProducts.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
    };


    Swal.fire({
      title: "¿Estás listo para continuar?",
      text: "Estás a punto de generar un nuevo pedido. ¿Deseas continuar con esta acción?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, generar pedido",
      cancelButtonText: "No, volver atrás",
    }).then((result) => {
      if (result.isConfirmed) {
        this.ordersService.generateOrder(order).subscribe({
          next: (response: any) => {
            Swal.fire({
              title: `${response.title}`,
              text: `${response.message}`,
              icon: "success"
            });
            this.resetOrderForm();
          },
          error: (err) => {
            this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
          },
        });
      }
    });
  }

  resetOrderForm(): void {
    this.selectedProducts = [];
    this.products = [];
    this.selectedSupplierId = '';
  }

  addToTable(selectElement: HTMLSelectElement): void {
    const productId = selectElement.value;

    if (!productId) {
      this.alertsService.showError('El valor del producto es inválido.', 'Error');

      return;
    }

    const product = this.products.find((p) => p.id === productId);

    if (!product) {
      this.alertsService.showError('Producto no encontrado.', 'Error');
      return;
    }

    const existingProduct = this.selectedProducts.find((p) => p.id === productId);
    if (existingProduct) {
      this.alertsService.showWarning('El producto ya está en la lista.', 'Aviso');
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
      (sum, product) => sum + product.quantity * product.purchasePrice,
      0
    );
  }

  trackByProductId(index: number, product: any): string {
    return product.id;
  }

  cleanFilters() {
    // this.suppliers = [];
  }

}
