import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import 'datatables.net'; // Import DataTables types for TypeScript
import { AlertService } from '../../../../../core/services/alerts.service';
import { InventoryService } from '../../data-access/inventory.service';
import { Subject } from 'rxjs';
import { AuthStateService } from '../../../../../core/services/auth-state.service';
import { CategoriesService } from '../../../categoriesPages/data-access/categories.service';
import { ICategory } from '../../../categoriesPages/interface/icategories.interface';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, DataTablesModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export default class InventoryComponent {

  private renderer = inject(Renderer2);
  private alertsService = inject(AlertService);
  private authStateService = inject(AuthStateService);
  private categoriesService = inject(CategoriesService);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
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
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Inventario ${resp.numberInventory} generado con éxito`,
          timer: 3000,
          timerProgressBar: true,
        });
        $('#inventoryTable').DataTable().ajax.reload(undefined, false);
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
        this.inventoryService.getAllInventoryGenerated().subscribe({
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
        loadingRecords: "Cargando datos...",
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
        { title: 'Código', data: 'numberInventory', className: 'text-sm text-gray-500' },
        { title: 'Categoria', data: 'category.name', className: 'text-sm text-gray-500' },
        { title: 'Fecha', data: 'createdAt', className: 'text-sm text-gray-500' },
        { title: 'Estado', data: 'status.name', className: 'text-sm text-gray-500' },
        { title: 'Generado por', data: 'user', className: 'text-sm text-gray-500' },
        {
          title: 'Acciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
            <div>

                  <button class="btn-entry-inventory bg-green-500 hover:bg-green-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                          <i class="fa-solid fa-pen-to-square mr-1"></i>
                          Ingresar
                  </button>
            </div>`;
          },
          className: 'action-column text-gray-500 text-sm'
        }
      ],
      rowCallback: (row: Node, data: any, index: number) => {
        const rowElement = row as HTMLElement;

        const actionCell = rowElement.querySelector('td:last-child');
        if (actionCell) {
          actionCell.setAttribute(
            'style',
            'display: flex; justify-content: center; '
          );
        }

        // Ingresar
        const entryBtn = rowElement.querySelector('.btn-entry-inventory');
        if (entryBtn) {
          this.renderer.listen(entryBtn, 'click', () => {
            const inventoryId = entryBtn.getAttribute('data-order-id');
            this.router.navigate(['/index/merchandise/entry-inventory', inventoryId]); // ruta que te lleve al otro componente
          });
        }

        const actionButton = rowElement.querySelector('.action-btn');
        if (actionButton) {
          this.renderer.listen(actionButton, 'click', () => {
            console.log('Row data:', data);
          });
        }
        return row;
      }
    };
  }
}
