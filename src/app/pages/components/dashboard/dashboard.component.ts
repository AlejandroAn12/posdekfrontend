import { AfterViewInit, Component, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { Router } from '@angular/router';
import { Config } from 'datatables.net';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { EMPTY, Subject } from 'rxjs';
import { CountUpDirective } from '../../../shared/directives/count-up.directive';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../orders/data-access/orders.service';
import { ProductsService } from '../products/data-access/products.service';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [DataTablesModule, CountUpDirective, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  // ==============================
  // 📌 Dependencias inyectadas
  // ==============================
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private authStateService = inject(AuthStateService);
  private productsService = inject(ProductsService);
  private orderService = inject(OrdersService);
  private dashboardService = inject(DashboardService);

  // ==============================
  //  Variables de estado
  // ==============================
  userLogged: string = '';
  role: string = '';
  products: any[] = [];

  isLoading: boolean = false;

  TotalProducts: number = 0;
  TotalOrders: number = 0;
  TotalEarnings: number = 0;
  earningssales : number = 0;

  // ==============================
  //  Configuración DataTable
  // ==============================
  dtOptions: Config = {};
  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();

  // ==============================
  //  Ciclo de vida
  // ==============================
  ngOnInit(): void {
    this.getEarnings();
    this.earningsSales();
    this.getUserLogged();
    this.loadTable();
    this.loadTotalProducts();
    this.productsOutStock();
    this.loadTotalOrders();

    this.renderer.setAttribute(document.body, 'class', 'hold-transition sidebar-mini layout-fixed');
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  // ==============================
  //  Métodos de carga de datos
  // ==============================
  private productsOutStock(): void {
    this.isLoading = true;
    this.productsService.productsOutStock().subscribe({
      next: (res: any) => {
        this.products = res;
        this.isLoading = false;
      },
      error: (err) => console.error(err),
    });
  }

  private loadTotalProducts(): void {
    this.productsService.getTotalProducts().subscribe({
      next: (resp: any) => (this.TotalProducts = resp),
      error: () => EMPTY,
    });
  }

  private loadTotalOrders(): void {
    this.orderService.getTotalOrders().subscribe({
      next: (resp: any) => (this.TotalOrders = resp.total),
      error: () => EMPTY,
    });
  }

  private getEarnings(): void {
    this.productsService.getEarnings().subscribe({
      next: (resp: any) => (this.TotalEarnings = resp),
      error: () => {},
    });
  }

  private earningsSales(): void{
    this.dashboardService.earningsSales().subscribe({
      next: (res) => {
        this.earningssales = res;
      },
      error: (err) => {
        return;
      }
    })
  }

  private getUserLogged(): void {
    this.authStateService.userAuth().subscribe({
      next: (user) => {
        this.userLogged = user.data.employee.name;
        this.role = user.data.role.name;
      },
      error: (error) => console.error(error),
    });
  }

  // ==============================
  //  Métodos DataTable
  // ==============================
  private loadTable(): void {
    this.dtOptions = {
      paging: false,
      searching: false,
      info: false,
      lengthChange: false,
      scrollX: true,
      ajax: (_dataTablesParameters: any, callback) => {
        this.orderService.getUltimateOrders().subscribe((resp: any) => {
          callback({ data: resp.orders });
        });
      },
      columns: [
        { title: 'Número de Orden', data: 'numberOrder' },
        { title: 'Proveedor', data: 'supplier.company_name' },
        {
          title: 'Monto total',
          data: 'totalAmount',
          render: (data: any) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(data),
        },
        { title: 'Fecha de Generación', data: 'orderDate' },
        { title: 'Estado del pedido', data: 'typeofstatus.name' },
      ],
    };
  }

  refreshTable(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }
  }

  // ==============================
  //  Navegación
  // ==============================
  navigateToOrders(): void {
    this.router.navigate(['/admin/orders/history']);
  }
}
