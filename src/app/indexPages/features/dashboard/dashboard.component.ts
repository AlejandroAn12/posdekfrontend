import { Component, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { Router } from '@angular/router';
import { OrdersService } from '../ordersPages/data-access/orders.service';
import { Config } from 'datatables.net';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { EMPTY, Subject } from 'rxjs';
import { ProductsService } from '../productsPages/data-access/products.service';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';

@Component({
  selector: 'app-dashboard',
  imports: [DataTablesModule, CountUpDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit {

  ngOnInit(): void {
    this.getEarnings();
    this.getUserLogged()
    this.loadTable();
    this.loadTotalProducts();
    this.loadTotalOrders();
    this.renderer.setAttribute(document.body, 'class', 'hold-transition sidebar-mini layout-fixed');
  }

  private router = inject(Router);
  private authStateService = inject(AuthStateService);
  private productsService = inject(ProductsService);
  private orderService = inject(OrdersService);
  private renderer = inject(Renderer2);
  dtOptions: Config = {};

  userLogged: string = '';
  role: string = '';

  TotalProducts: number = 0;
  TotalOrders: number = 0;
  TotalEarnings: number = 0;


  loadTotalProducts() {
    this.productsService.getTotalProducts().subscribe({
      next: (resp: any) => {
        this.TotalProducts = resp;
      },
      error: (error) => {
        return EMPTY;
      }

    });
  }

  loadTotalOrders() {
    this.orderService.getTotalOrders().subscribe({
      next: (resp: any) => {
        this.TotalOrders = resp.total;
      },
      error: (error) => {
        return EMPTY;
      }

    });
  }

  //Cargar DataTable
  loadTable() {
    this.dtOptions = {
      paging: false,       // 🔹 Oculta la paginación
      searching: false,    // 🔹 Oculta el input de búsqueda
      info: false,         // 🔹 Oculta el texto "Mostrando X de Y entradas"
      lengthChange: false,
      scrollX: true,

      ajax: (dataTablesParameters: any, callback) => {
        this.orderService.getUltimateOrders().subscribe((resp: any) => {
          callback({
            data: resp.orders
          });
        });
      },
      // lengthMenu: [5, 10, 20, 50],
      columns: [
        { title: 'Numero de Orden', data: 'numberOrder' },
        { title: 'Proveedor', data: 'supplier.company_name' },
        { 
          title: 'Monto total', 
          data: 'totalAmount',
          render: (data: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(data);
          } 
        },
        { title: 'Fecha de Generacion', data: 'orderDate' },
        { title: 'Estado del pedido', data: 'typeofstatus.name' }

      ]
    };
  }

  //Renderizado del datatables
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();


  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  //Metodo para refrescar la tabla
  refreshTable(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }
  }

  //Metodo para obtener el usuario logueado
  getUserLogged() {
    this.authStateService.userAuth().subscribe({
      next: (user) => {
        this.userLogged = user.data.employee.name;
        this.role = user.data.role.name;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  getEarnings() {
    this.productsService.getEarnings().subscribe({
      next: (resp: any) => {
        this.TotalEarnings = resp.totalEarnings;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  //Metodo para ir a la vista de historial de ordenes
  navigateToOrders() {
    this.router.navigate(['/index/orders/history']);
  }

}
