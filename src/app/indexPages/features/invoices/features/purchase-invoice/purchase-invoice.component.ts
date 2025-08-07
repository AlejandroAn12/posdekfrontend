import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';
import { InvoicesService } from '../../data-access/invoices.service';
import Swal from 'sweetalert2';

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
  invoiceService = inject(InvoicesService);

  form: FormGroup;
  suppliers: any[] = [];
  selectedSupplierId: string = '';
  selectedProducts: any[] = [];
  products: any[] = [];
  orderItems: any[] = [];
  invoiceTypes: any[] = [];



  constructor() {
    this.getInvoiceTypes();
    this.loadSuppliers();
    this.form = this.fb.group({
      supplierId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      purchasePrice: [0, [Validators.required]],
      // invoiceTypeId: ['', [Validators.required]],
      productId: ['', [Validators.required]],
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
      // details: this.fb.array([]) // Inicializa el array de detalles
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

  addToTable(select: HTMLSelectElement) {
    const selectedProductId = select.value;
    const product = this.products.find(p => p.id === selectedProductId);
    if (product && !this.selectedProducts.find(p => p.id === product.id)) {
      this.selectedProducts.push({
        ...product,
        quantity: 1,
        purchasePrice: product.purchasePrice || 0
      });
    }
    select.value = '';
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

  getInvoiceTypes() {
    this.invoiceService.getInvoiceTypes().subscribe({
      next: (res: any) => {
        this.invoiceTypes = res
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: err.error.message
        });
      }
    })
  }

  saveInvoice() {
    // Validación general
    if (this.form.invalid) {
      console.log('Formulario inválido', this.form.value, this.selectedProducts);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Completa todos los campos requeridos y agrega al menos un producto.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    // Validar que todos los productos tengan cantidad y precio válidos
    const invalidProducts = this.selectedProducts.filter(p => !p.quantity || !p.purchasePrice);
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

    const invoicePayload = {
      noFac: formValues.noFac,
      // invoiceTypeId: formValues.invoiceTypeId,
      supplierId: formValues.supplierId,
      details: this.selectedProducts.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
        purchasePrice: product.purchasePrice,
      })),
    };

    Swal.fire({
      title: "¿Estás listo para continuar?",
      text: "Estás a punto de guardar una factura. ¿Deseas continuar con esta acción?",
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
              title: 'Éxito',
              text: 'Factura guardada correctamente.',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
            this.form.reset();
            this.selectedProducts = [];
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.message || 'No se pudo guardar la factura.',
              timer: 3000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          }
        });
      }
    });


  }



  get f() {
    return this.form.controls;
  }

  trackByProductId(index: number, product: any): string {
    return product.id;
  }
}
