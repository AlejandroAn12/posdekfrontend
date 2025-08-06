import { Component, inject, Renderer2, ViewChild } from '@angular/core';
import { ProductsService } from '../../../productsPages/data-access/products.service';
import Swal from 'sweetalert2';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import { Subject } from 'rxjs';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-movements-products',
  imports: [DataTablesModule, HeaderComponent],
  templateUrl: './movements-products.component.html',
  styleUrl: './movements-products.component.css'
})
export default class MovementsProductsComponent {

  titleComponent : string = 'Movimientos de producto';
  subtitleComponent : string = ''

  private productService = inject(ProductsService);

  constructor() {
    this.loadDataTable();
  }

  // private renderer = inject(Renderer2);

  dtOptions: Config = {};

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }


  loadDataTable() {
    this.dtOptions = {

      ajax: (dataTablesParameters: any, callback) => {
        this.productService.movementProducts().subscribe({
          next: (resp) => {
            console.log(resp)
            callback({
              data: resp ?? []
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudieron cargar los movimientos de productos. Inténtalo de nuevo más tarde.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
            callback({ data: [] });
          }
        });
      },
      scrollX: true,
      language: {
        emptyTable: "No hay información disponible",
        loadingRecords: "Cargando datos...", // Este mensaje desaparece si `data` es vacío
        zeroRecords: "No se encontraron resultados",
        search: "Buscar:", // Cambia el texto del buscador
        lengthMenu: "",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        paginate: {
          next: "Siguiente",
          previous: "Anterior"
        },
      },
      lengthMenu: [10],
      columns: [
        { title: 'Código de barra', data: 'product.barcode', className: 'text-sm text-gray-500' },
        { title: 'Producto', data: 'product.name', className: 'text-sm text-gray-500' },
        { title: 'Cantidad', data: 'quantity', className: 'text-sm text-gray-500' },
        { title: 'Tipo de movimiento', data: 'Movement_type.name', className: 'text-sm text-gray-500' },
        { title: 'Fecha y hora', data: 'createdAt', className: 'text-sm text-gray-500' },
        { 
          title: 'Generado por', 
          data: {
            _: (row: any) => `${row.user?.employee?.name ?? ''} ${row.user?.employee?.surname ?? ''}`
          }, 
          className: 'text-sm text-gray-500' 
        },
      ]
    };
  }

}
