import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import 'datatables.net'; // Import DataTables types for TypeScript
import { AlertService } from '../../../../../core/services/alerts.service';
import { Subject } from 'rxjs';
import { AuthStateService } from '../../../../../core/services/auth-state.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { InventoryReportService } from '../../../inventory/data-access/inventory-report.service';
import { CategoriesService } from '../../../categories/data-access/categories.service';
import { ICategory } from '../../../categories/interface/icategories.interface';
import { InventoryService } from '../../../merchandise/data-access/inventory.service';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, DataTablesModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export default class InventoryComponent {
  // Inyecciones de servicios
  private renderer = inject(Renderer2);
  private alertsService = inject(AlertService);
  private authStateService = inject(AuthStateService);
  private categoriesService = inject(CategoriesService);
  private inventoryService = inject(InventoryService);
  private inventoryReportService = inject(InventoryReportService);
  private router = inject(Router);
  private fB = inject(FormBuilder);

  // Variables del componente
  userLogged: string = '';
  role: string = '';
  categories: ICategory[] = [];
  inventoryData: any[] = [];
  isLoading: boolean = false;
  totalStock: number = 0;
  totalValue: number = 0;

  // Títulos del componente
  titleComponent: string = 'Gestión de inventarios';
  subtitleComponent: string = '';

  // Formulario
  inventoryForm: FormGroup;

  // Configuración de DataTables
  dtOptions: any = {};

  // DataTables
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();

  constructor() {
    this.inventoryForm = this.fB.group({
      categoryId: ['']
    });
  }

  ngOnInit(): void {
    this.getUserLogged();
    this.loadCategories();
    this.initializeDataTable();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  // Método para generar inventario
  generateInventory(): void {
    const categoryId = this.inventoryForm.get('categoryId')?.value;

    if (!categoryId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, selecciona una categoría para generar el inventario.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.isLoading = true;

    this.inventoryService.generateInventory({ categoryId }).subscribe({
      next: (resp: any) => {
        this.isLoading = false;

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Inventario ${resp.numberInventory} generado con éxito`,
          timer: 3000,
          timerProgressBar: true,
        });

        // Recargar la tabla
        this.refreshTable();

        // También puedes cargar los datos específicos de la categoría seleccionada
        this.loadInventoryData(categoryId);
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${error.error.message}`,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // Método para cargar datos de inventario específicos
  loadInventoryData(categoryId: string): void {
    this.inventoryService.getAllInventoryGenerated().subscribe({
      next: (data: any) => {
        this.inventoryData = data.products || [];
        this.calculateTotals();
      },
      error: (error) => {
        console.error('Error loading inventory data:', error);
        this.inventoryData = [];
      }
    });
  }

  // Calcular totales
  calculateTotals(): void {
    this.totalStock = this.inventoryData.reduce((sum, item) => sum + (item.stock || 0), 0);
    this.totalValue = this.inventoryData.reduce((sum, item) => sum + (item.stock * item.purchasePrice || 0), 0);
  }

  // Método para obtener el usuario logueado
  getUserLogged(): void {
    this.authStateService.userAuth().subscribe({
      next: (user) => {
        this.userLogged = user.data.employee.name;
        this.role = user.data.role.name;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  // Cargar categorías
  loadCategories(): void {
    this.categoriesService.getCategoriesByStatus().subscribe({
      next: (data: any) => {
        this.categories = data.categories;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${err.error.message}`,
          confirmButtonText: 'Entendido'
        });
      },
    });
  }

  // Inicializar DataTable
  initializeDataTable(): void {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback: any) => {
        this.inventoryService.getAllInventoryGenerated().subscribe({
          next: (resp: any) => {
            callback({
              recordsTotal: resp.data?.length || 0,
              recordsFiltered: resp.data?.length || 0,
              data: resp.data ?? []
            });
          },
          error: (err) => {
            this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
            callback({
              recordsTotal: 0,
              recordsFiltered: 0,
              data: []
            });
          }
        });
      },
      scrollX: true,
      responsive: true,
      language: {
        emptyTable: "No hay información disponible",
        loadingRecords: "Cargando datos...",
        zeroRecords: "No se encontraron resultados",
        search: "Buscar:",
        lengthMenu: "Mostrar _MENU_ registros",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        infoEmpty: "Mostrando 0 a 0 de 0 registros",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        }
      },
      lengthMenu: [10, 25, 50, 100],
      pageLength: 10,
      columns: [
        {
          title: 'Código',
          data: 'numberInventory',
          className: 'text-sm text-gray-500 dark:text-gray-300'
        },
        {
          title: 'Categoría',
          data: 'category.name',
          className: 'text-sm text-gray-500 dark:text-gray-300'
        },
        {
          title: 'Fecha',
          data: 'createdAt',
          className: 'text-sm text-gray-500 dark:text-gray-300',
          render: (data: any) => {
            return data ? new Date(data).toLocaleDateString() : 'N/A';
          }
        },
        {
          title: 'Estado',
          data: 'status.name',
          className: 'text-sm text-gray-500 dark:text-gray-300'
        },
        {
          title: 'Generado por',
          data: 'user',
          className: 'text-sm text-gray-500 dark:text-gray-300',
          // render: (data: any, type: any, row: any) => {
          //   return `${row.user?.employee?.name || 'N/A'} ${row.user?.employee?.surname || ''}`;
          // }
        },
        {
          title: 'Acciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
             <div class="flex space-x-3">
                      <button 
                        class="btn-entry-inventory flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-md transition duration-200 ease-in-out text-sm font-medium" 
                        data-order-id="${row.id}">
                        <i class="fa-solid fa-pen-to-square"></i>
                        Ingresar
                      </button>

                      <button 
                        class="btn-print flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg shadow-md transition duration-200 ease-in-out text-sm font-medium" 
                        data-order-id="${row.id}">
                        <i class="fa-solid fa-print"></i>
                        Imprimir
                      </button>
                    </div>`
              ;
          },
          className: 'action-column text-sm'
        }
      ],
      rowCallback: (row: Node, data: any, index: number) => {
        const rowElement = row as HTMLElement;

        // Ingresar
        const entryBtn = rowElement.querySelector('.btn-entry-inventory');
        if (entryBtn) {
          this.renderer.listen(entryBtn, 'click', () => {
            const inventoryId = entryBtn.getAttribute('data-order-id');
            this.router.navigate(['/admin/inventory/entry-inventory', inventoryId]);
          });
        }

        // Imprimir
        const printBtn = rowElement.querySelector('.btn-print');
        if (printBtn) {
          this.renderer.listen(printBtn, 'click', () => {
            this.printPDF(data.id);
          });
        }

        return row;
      }
    };
  }

  // Refrescar tabla
  refreshTable(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }
  }

  // Exportar a Excel
  // exportToExcel(): void {
  //   if (this.inventoryData.length === 0) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Sin datos',
  //       text: 'No hay datos para exportar',
  //       confirmButtonText: 'Entendido'
  //     });
  //     return;
  //   }
  // }
  // Exportar a PDF
  // exportToPDF(): void {
  //   if (this.inventoryData.length === 0) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Sin datos',
  //       text: 'No hay datos para exportar',
  //       confirmButtonText: 'Entendido'
  //     });
  //     return;
  //   }
  // }

  // Imprimir PDF (método existente)
  printPDF(id: string): void {
    this.inventoryReportService.printInventoryGeneratedPDF(id).subscribe({
      next: (blob: Blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');

        if (newWindow) {
          newWindow.onload = () => {
            newWindow.print();
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
    });
  }
}
