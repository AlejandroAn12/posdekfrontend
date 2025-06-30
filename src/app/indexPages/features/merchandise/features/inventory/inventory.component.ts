import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import { AlertService } from '../../../../../shared/services/alerts.service';
import { InventoryService } from '../../data-access/inventory.service';
import { Subject } from 'rxjs';
import { AuthStateService } from '../../../../../shared/services/auth-state.service';
import { CategoriesService } from '../../../categoriesPages/data-access/categories.service';
import { ICategory } from '../../../categoriesPages/interface/icategories.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, DataTablesModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export default class InventoryComponent implements OnInit {

  private renderer = inject(Renderer2);
  private alertsService = inject(AlertService);
  private authStateService = inject(AuthStateService);
  private categoriesService = inject(CategoriesService);
  private inventoryService = inject(InventoryService);
  private fB = inject(FormBuilder);


  userLogged: string = '';
  role: string = '';
  categories: ICategory[] = [];

  inventoryForm: FormGroup;

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

  constructor() {
    this.loadDataTable();
 this.getUserLogged();
    this.loadCategories();
    this.inventoryForm = this.fB.group({
      categoryId: [''],
    });
  }

  ngOnInit(): void {
   
  }

  generateInventory() {
    const inventoryData = this.inventoryForm.value;
    if (!inventoryData.categoryId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, selecciona una categoría para generar el inventario.',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    this.inventoryService.generateInventory(inventoryData).subscribe({
      next: (resp: any) => {
        console.log(resp);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Inventario ${resp.numberInventory} generado con éxito`,
          timer: 5000,
          timerProgressBar: true,
        });

      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${error.error.message}`,
          confirmButtonText: 'Entendido'
        });
      }
    });
        this.loadDataTable();
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

  loadCategories() {
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


  loadDataTable() {
    this.dtOptions = {

      ajax: (dataTablesParameters: any, callback) => {
        this.inventoryService.getAllInventory().subscribe({
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
        search: "Buscar inventario:", // Cambia el texto del buscador
        lengthMenu: "",
        info: "Inventarios totales: _TOTAL_",
        paginate: {
          next: "Siguiente",
          previous: "Anterior"
        },
      },
      lengthMenu: [10],
      columns: [
        { title: 'Código', data: 'numberInventory' },
        { title: 'Categoria', data: 'category.name' },
        { title: 'Fecha', data: 'createdAt' },
        { title: 'Estado', data: 'status.name' },
        { title: 'Generado por', data: 'user' },
        {
          title: '',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
            <div>

                  <button class="btn-print border-green-600 w-10 hover:bg-green-400 text-sm text-green-500 hover:text-white p-2 m-1" data-order-id="${row.id}">
                          <i class="fa-solid fa-pen-to-square"></i>
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
              // this.downloadPdf(data.id);
            });
          }
        }

        // Imprimir
        const printBtn = rowElement.querySelector('.btn-print');
        if (printBtn) {
          this.renderer.listen(printBtn, 'click', () => {
            // this.printOrderPDF(data.id);
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



}
