import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../core/services/alerts.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MerchandiseService } from '../../data-access/merchandise.service';
import { OrdersService } from '../../../orders/data-access/orders.service';

@Component({
  selector: 'app-income-form',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './entry-form.component.html',
  styleUrl: './entry-form.component.css'
})
export default class IncomeFormComponent {
  private ordersService = inject(OrdersService);
  private merchandiseService = inject(MerchandiseService);
  private alertsService = inject(AlertService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form: FormGroup;
  isDisabled: boolean = true;

  order: any;


  constructor() {
    this.form = this.fb.group({
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
      supplier: [{ value: '', disabled: this.isDisabled }],
      orderDate: [{ value: '', disabled: this.isDisabled }],
      items: this.fb.array([])

    });
  }

  searchOrder(): void {
    const data = this.form.value.orderNumber;

    if (!data) {
      Swal.fire({
        title: 'Error',
        text: 'Debe introducir el número del pedido. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.ordersService.getOrderByNumber(data).subscribe({
      next: (response) => {
        if (response?.data) {
          this.order = response.data;
          this.form.patchValue({
            supplier: response.data.supplier.company_name,
            orderDate: response.data.orderDate
          });

          // Reiniciar items en caso de nueva búsqueda
          this.items.clear();

          // Agregar los productos al FormArray con un campo para la cantidad recibida
          response.data.orderItems.forEach((item: any) => {
            this.items.push(this.fb.group({
              id: [item.product.id],
              quantityReceived: [0, [Validators.required, Validators.min(0)]]
            }));
          });
        } else {
          this.alertsService.showError('No se encontró la orden', 'Error');
          this.order = {};
        }
      },
      error: (err) => {
        this.alertsService.showError(err.error.message, '');
      }
    });
  }

  // Getter para acceder a los items
  get items() {
    return this.form.get('items') as FormArray;
  }

  saveEntry(): void {
    if (this.items.invalid) {
      this.alertsService.showError('Revise las cantidades ingresadas', 'Error');
      return;
    }
    if (this.items.value.quantity <= 0) {
      this.alertsService.showError('La cantidad recibida debe ser mayor a 0', 'Error');
    }

    const orderId = this.order.id;
    const items = this.items.value.map((item: any) => ({
      id: item.id,
      quantity: item.quantityReceived,
    }));

    Swal.fire({
      title: 'Guardar pedido',
      text: '¿Seguro que quiere guardar el pedido?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sendOrderToBackend(orderId, items);
      }
    });
  }

  private sendOrderToBackend(orderId: string, items: any[]): void {
    Swal.fire({
      title: 'Guardando pedido...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.merchandiseService.entryProductStock(orderId, items).subscribe({
      next: () => {
        Swal.close();
        this.showSuccessAlert();
        this.resetFormAfterSave();
      },
      error: (error) => {
        Swal.close();
        console.error('Error al actualizar stock:', error);
        this.alertsService.showError('Error al actualizar el stock', 'Error');
      },
    });
  }

  private showSuccessAlert(): void {
    Swal.fire({
      title: 'Pedido guardado',
      text: 'El stock ha sido actualizado correctamente',
      icon: 'success',
    });
  }

  private resetFormAfterSave(): void {
    this.form.reset();
    this.form.patchValue({ supplier: '', orderDate: '' });
    this.order = null;
  }


  getQuantityControl(index: number): FormControl {
    return this.items.at(index).get('quantityReceived') as FormControl;
  }

  btnResetForm() {
    this.form.reset();
  }

  btnBack() {
    this.router.navigate(['index/dashboard']);
  }
}
