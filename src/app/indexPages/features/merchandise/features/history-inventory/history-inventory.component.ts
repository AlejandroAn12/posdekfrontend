import { Component, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import { Subject } from 'rxjs';
import { AlertService } from '../../../../../core/services/alerts.service';
import { InventoryService } from '../../data-access/inventory.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import Swal from 'sweetalert2';
import { InventoryReportService } from '../../../inventory/data-access/inventory-report.service';

@Component({
  selector: 'app-history-inventory',
  imports: [CommonModule, FormsModule, DataTablesModule, HeaderComponent],
  templateUrl: './history-inventory.component.html',
  styleUrl: './history-inventory.component.css'
})
export default class HistoryInventoryComponent implements OnInit {

  ngOnInit(): void {
    this.loadDataTable();
  }

  private alertsService = inject(AlertService);
  private inventoryService = inject(InventoryService);
  private inventoryReportService = inject(InventoryReportService);
  private renderer = inject(Renderer2);

  titleComponent : string = 'Gestión de inventarios';
  subtitleComponent : string = 'Historial de inventarios';

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
        this.inventoryService.getAllInventoryFinished().subscribe({
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
        { title: 'Código', data: 'numberInventory', className: 'text-sm text-gray-500' },
        { title: 'Categoria', data: 'category.name', className: 'text-sm text-gray-500' },
        { title: 'Fecha', data: 'createdAt', className: 'text-sm text-gray-500' },
        { title: 'Estado', data: 'status.name', className: 'text-sm text-gray-500' },
        { title: 'Generado por', data: 'user', className: 'text-sm text-gray-500' },
        {
          title: 'Opciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
            <div>
                  <button class="btn-print bg-red-500 hover:bg-red-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                          <i class="fa-solid fa-print mr-1"></i>
                          Imprimir
                  </button>

                  <button class="btn-download bg-blue-500 hover:bg-blue-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                          <i class="fa-solid fa-download mr-1"></i>
                          Descargar
                  </button>

            </div>`;
          },
          className: 'action-column text-gray-500 text-sm'
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
            this.printPDF(data.id);
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

  downloadPdf(id: string) {
      const date = Date.now();
      this.inventoryReportService.downloadInventoryFinishedReportPDF(id).subscribe({
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
          Swal.fire({
            title: 'Error',
            text: err.error.message || 'Error al descargar el PDF',
            icon: 'error'
          });
        }
      })
    }
  
    printPDF(id: string) {
      this.inventoryReportService.printInventoryFinishedPDF(id).subscribe({
        next: (blob: Blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const newWindow = window.open(blobUrl, '_blank');
  
          if (newWindow) {
            newWindow.onload = () => {
              newWindow.print(); // Abre la ventana de impresión automáticamente
            };
          } else {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo abrir la nueva ventana para imprimir.',
              icon: 'error'
            });
          }
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: err.error.message || 'Error al generar el PDF',
            icon: 'error'
          });
        }
      })
    }


  downloadExcel() {
    this.alertsService.showInfo('Metodo aun no implementado', 'Información')
  }


}
