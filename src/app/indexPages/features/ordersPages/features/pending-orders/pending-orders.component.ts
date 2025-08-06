import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import { OrdersService } from '../../data-access/orders.service';
import { Subject } from 'rxjs';
import { AlertService } from '../../../../../core/services/alerts.service';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-pending-orders',
  imports: [CommonModule, FormsModule, DataTablesModule, HeaderComponent],
  templateUrl: './pending-orders.component.html',
  styleUrl: './pending-orders.component.css'
})
export default class PendingOrdersComponent implements OnInit {

  ngOnInit(): void {
    this.loadDataTable();
  }

  private ordersService = inject(OrdersService);
  dtOptions: Config = {};
  errorMessage: string = '';
  titleComponent : string = 'Gestión de ordenes'
  subtitleComponent : string = 'Ordenes pendientes';


  loadDataTable() {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.ordersService.getPendingOrders().subscribe({
          next: (resp) => {
            callback({
              data: resp.data ?? [] // Si `resp.data` es null o undefined, usa un array vacío
            });
          },
          error: (err) => {
            this.errorMessage = err.error?.message;
            callback({ data: [] }); // En caso de error, evita que se quede en "Cargando datos..."
          }
        });
      },
      scrollX: true,
      language: {
        emptyTable: this.errorMessage || "No hay información disponible",
        loadingRecords: "Cargando datos...", // Este mensaje desaparece si `data` es vacío
        zeroRecords: "No se encontraron resultados",
        search: "Buscar:",
        lengthMenu: "",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        paginate: {
          next: "Siguiente",
          previous: "Anterior"
        },
      },
      lengthMenu: [10],
      columns: [
        { title: '# Orden', data: 'numberOrder', className: 'text-sm text-gray-500' },
        { title: 'Proveedor', data: 'supplier.company_name', className: 'text-sm text-gray-500' },
        {
          title: 'Valor total', data: 'totalAmount',
          className: 'text-sm text-gray-500',
          render: (data: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(data);
          }
        },
        { title: 'Fecha de generación', data: 'orderDate', className: 'text-sm text-gray-500' },
        { title: 'Estado', data: 'typeofstatus.name', className: 'text-sm text-gray-500' },
        { title: 'Responsable', data: 'user', className: 'text-sm text-gray-500' },
      ],
    };

    // this.dtOptions = {

    //   ajax: (dataTablesParameters: any, callback) => {
    //     this.ordersService.getPendingOrders().subscribe({
    //       next: (resp) => {
    //         callback({
    //           data: resp.data
    //         });
    //       },
    //       error: (err) => {
    //         this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
    //       }
    //     });
    //   },
    //   scrollX: true,
    //   language: {
    //     emptyTable: "No hay información disponible",
    //     loadingRecords: "Cargando datos...",
    //     zeroRecords: "No se encontraron resultados",
    //     search: "Buscar pedido:", // Cambia el texto del buscador
    //     lengthMenu: "Mostrar _MENU_ registros por página",
    //     info: "Hay _TOTAL_ pedidos pendientes",
    //     paginate: {
    //       next: "Siguiente",
    //       previous: "Anterior"
    //     },
    //   },
    //   lengthMenu: [10],
    //   columns: [
    //     { title: 'N° Pedido', data: 'numberOrder' },
    //     { title: 'Proveedor', data: 'supplier.company_name' },
    //     {
    //       title: 'Total', data: 'totalAmount',
    //       render: (data: any) => {
    //         return new Intl.NumberFormat('en-US', {
    //           style: 'currency',
    //           currency: 'USD'
    //         }).format(data);
    //       }
    //     },
    //     { title: 'Fecha de generación', data: 'orderDate' },
    //     {title: 'Estado', data: 'typeofstatus.name'},
    //     { title: 'Responsable', data: 'user' },
    //   ],
    // };
  }

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
