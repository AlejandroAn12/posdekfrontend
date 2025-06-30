import { Component, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../data-access/orders.service';
import { AlertService } from '../../../../../shared/services/alerts.service';
import { Subject } from 'rxjs';
import { OrderReportService } from '../../data-access/reports.service';

@Component({
  selector: 'app-orders-history',
  imports: [CommonModule, FormsModule, DataTablesModule],
  templateUrl: './orders-history.component.html',
  styleUrl: './orders-history.component.css'
})
export default class OrdersHistoryComponent implements OnInit {

  private ordersService = inject(OrdersService);
  private alertsService = inject(AlertService);
  private reportsPdfService = inject(OrderReportService);
  private renderer = inject(Renderer2);

  dtOptions: Config = {};

  ngOnInit(): void {
    this.loadDataTable();
  }
  
  loadDataTable() {
    this.dtOptions = {

      ajax: (dataTablesParameters: any, callback) => {
        this.ordersService.getOrders().subscribe({
          next: (resp) => {
            callback({
              data: resp.data ?? []
            });
          },
          error: (err) => {
            this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
            callback({ data: [] });
          }
        });
      },
      scrollX: true,
      language: {
        emptyTable: "No hay información disponible",
        loadingRecords: "Cargando datos...", // Este mensaje desaparece si `data` es vacío
        zeroRecords: "No se encontraron resultados",
        search: "Buscar pedido:", // Cambia el texto del buscador
        lengthMenu: "",
        info: "Total de registros: _TOTAL_",
        paginate: {
          next: "Siguiente",
          previous: "Anterior"
        },
      },
      lengthMenu: [10],
      columns: [
        { title: 'N°', data: 'numberOrder' },
        { title: 'Proveedor', data: 'supplier.company_name' },
        {
          title: 'Total', data: 'totalAmount',
          render: (data: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(data);
          }
        },
        { title: 'Fecha de generación', data: 'orderDate' },
        {title: 'Estado', data: 'typeofstatus.name'},
        { title: 'Responsable', data: 'user' },



        {
          title: 'Opciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
            <div>

                  <button class="btn-print border border-red-600 w-10 hover:bg-red-600 text-sm text-red-500 hover:text-white p-2 m-1 rounded-md" data-order-id="${row.id}">
                          <i class="fa-solid fa-print"></i>
                  </button>

                  <button class="btn-download border hover:bg-blue-600 w-10 text-sm text-blue-500 hover:text-white p-2 m-1 rounded-md" data-order-id="${row.id}">
                          <i class="fa-solid fa-download"></i>
                  </button>

            </div>`;
          },
          className: 'action-column'
        }
      ],
      rowCallback: (row: Node, data: any, index: number) => {
        // Cast row to HTMLElement to access querySelector
        const rowElement = row as HTMLElement;

        // Ensure the last cell (Actions column) is styled
        const actionCell = rowElement.querySelector('td:last-child');
        if (actionCell) {
          actionCell.setAttribute(
            'style',
            'display: flex; justify-content: center; '
          );

          // Descargar
          const downloadBtn = rowElement.querySelector('.btn-download');
          if (downloadBtn) {
            this.renderer.listen(downloadBtn, 'click', () => {
              this.downloadPdf(data.id);
            });
          }
        }

        // Imprimir
        const printBtn = rowElement.querySelector('.btn-print');
        if (printBtn) {
          this.renderer.listen(printBtn, 'click', () => {
            this.printOrderPDF(data.id);
          });
        }

        // Find the button in the row and attach a click listener using Renderer2
        const actionButton = rowElement.querySelector('.action-btn');
        if (actionButton) {
          this.renderer.listen(actionButton, 'click', () => {
            console.log('Row data:', data); // Log the data for the clicked row
          });
        }
        return row;
      }
    };
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


  downloadPdf(id: string) {
    const date = Date.now();
    this.reportsPdfService.downloadOrderReportPDF(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${date}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `Error`)
      }
    })
  }

  printOrderPDF(id: string) {
    this.reportsPdfService.printOrderPDF(id).subscribe({
      next: (blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');

        if (newWindow) {
          newWindow.onload = () => {
            newWindow.print(); // Abre la ventana de impresión automáticamente
          };
        } else {
          this.alertsService.showError('No se pudo abrir la nueva ventana.', 'Error');
        }
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      }
    })
  }

  downloadAllOrders(){
    const date = Date.now();
    this.reportsPdfService.printAllOrders().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ordenes_${date}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, error: (err) =>{
        console.error({err})
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      } 
    })
  }

  downloadExcel(){
    this.alertsService.showInfo('Metodo aun no implementado', 'Información')
  }

}
