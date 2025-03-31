import { Component, inject } from '@angular/core';
import { OrdersService } from '../../../ordersPages/data-access/orders.service';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../shared/services/alerts.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MerchandiseService } from '../../data-access/merchandise.service';

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
      orderNumber: [''],
      supplier: [{ value: '', disabled: this.isDisabled }],
      orderDate: [{ value: '', disabled: this.isDisabled }],
      items: this.fb.array([])

    });
  }

  // searchOrder(): void {

  //   const data = this.form.value.orderNumber;

  //   if (!data) {
  //     this.alertsService.showError('Por favor, introduzca un número de pedido', 'Error');
  //     return;
  //   }

  //   this.ordersService.getOrderByNumber(data).subscribe({
  //     next: (response) => {
  //       //Carga los datos en el formulario
  //       this.form.patchValue({
  //         supplier: response.data.supplier.company_name,
  //         orderDate: response.data.orderDate
  //       });

  //       //Carga los productos en la tabla
  //       if (response?.data) {
  //         this.order = response.data;

  //         // Asegurar que orderItems es un array
  //         this.order.orderItems = Array.isArray(this.order.orderItems) ? this.order.orderItems : [];

  //       } else {
  //         this.alertsService.showError('No se encontró la orden', 'Error');
  //         this.order = {}; // Reinicia la variable en caso de error
  //       }
  //     },
  //     error: (err) => {
  //       this.alertsService.showError(err.error.message, '');
  //     },
  //   });
  // }

  searchOrder(): void {
    const data = this.form.value.orderNumber;
  
    if (!data) {
      this.alertsService.showError('Debe introducir el número del pedido', 'Error');
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
  
  // Getter para acceder fácilmente a los items
  get items() {
    return this.form.get('items') as FormArray;
  }
  
  saveEntry() {
    if (this.items.invalid) {
      this.alertsService.showError('Revise las cantidades ingresadas', 'Error');
      return;
    }
  
    const orderId = this.order.id;
    const items = this.items.value.map((item: any) => ({
      id: item.id,
      quantity: item.quantityReceived
    }));

    console.log(items)


    Swal.fire({
      title: "Guardar pedido",
      text: "Desea guardar el pedido ingresado?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, guardar!",
      cancelButtonText: "No, cancelar!",
    }).then((result) => {
      if (result.isConfirmed) {
        this.merchandiseService.entryProductStock(orderId, items).subscribe({
          next: () => {
            Swal.fire({
              title: "Pedido guardado",
              text: "El pedido ha sido guardado correctamente.",
              icon: "success"
            });
          },
          error: (error) => {
            console.error('Error al actualizar stock:', error);
            this.alertsService.showError('Error al actualizar el stock', 'Error');
          }
        });
        console.log('uno')
        Swal.fire({
          title: "Pedido guardado!",
          text: "El pedido ha sido guardado correctamente.",
          icon: "success"
        });
  
        // ✅ Limpiar el formulario y la tabla después de guardar
        this.form.reset();
        this.form.patchValue({ supplier: '', orderDate: '' });
        this.order = null; // O limpiar orderItems manualmente
        
      }
    });
  }

  getQuantityControl(index: number): FormControl {
    return this.items.at(index).get('quantityReceived') as FormControl;
  }
  
//   saveEntry(){
//     console.log('clik');
//     Swal.fire({
//       title: "Guardar pedido",
//       text: "Desea guardar el pedido ingresado?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Si, guardar!",
//       cancelButtonText: "No, cancelar!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         Swal.fire({
//           title: "Pedido guardado!",
//           text: "El pedido ha sido guardado correctamente.",
//           icon: "success"
//         });
//       }
//     });
// //TODO:IMPLEMENTAR LIMPIAR EL FORMULARIO
//     // this.form.reset();

//   }

  btnResetForm(){
    this.form.reset();
  }

  btnBackDashboard() {
    this.router.navigate(['index/dashboard']);
  }
}
