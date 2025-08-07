import Swal from 'sweetalert2'
import { Component, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { CategoriesService } from '../../data-access/categories.service';
import { ICategory } from '../../interface/icategories.interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Config } from 'datatables.net';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AlertService } from '../../../../../core/services/alerts.service';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { ModalFormComponent } from "../../../../../shared/features/components/modal-form/modalForm.component";

@Component({
  selector: 'app-view-categories',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataTablesModule, HeaderComponent, ModalFormComponent],
  templateUrl: './view-categories.component.html',
  styleUrl: './view-categories.component.css'
})
export default class ViewCategoriesComponent implements OnInit {

  titleComponent: string = 'Gestión de categorías';
  subtitleComponent: string = 'Listado de categorías registradas';

  constructor() {
    this.form = this.fb.group({
      name: ['', { validators: [Validators.required], updateOn: 'change' }],
    });
  }

  private categoriesService = inject(CategoriesService);
  private fb = inject(FormBuilder);
  private alertsService = inject(AlertService);
  private renderer = inject(Renderer2);

  dtOptions: Config = {};
  form: FormGroup;

 
  ngOnInit(): void {
    this.loadTable();
  }

  //Modal
  showModal = false;
  titleModal: string = 'Detalle de la categoria';
  isEditing = false;

  product: any = [];
  categoriesSignal = signal<ICategory[]>([]);
  categories: ICategory[] = [];
  selectedCategoryId: string | null = null;
  errorMessage: string = '';



  //Cargar DataTable
  loadTable() {
    this.dtOptions = {
      ajax: (dataTablesParameters: any, callback) => {
        this.categoriesService.getAllCategories().subscribe((resp: any) => {
          callback({
            data: resp.categories
          });
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
        // { title: 'ID', data: 'id' },
        { title: 'Nombre', data: 'name', className: 'text-sm text-gray-500' },
        {
          title: 'Habilitado',
          data: 'status',
          render: (data: any, type: any, row: any) => {
            return `
              <input type="checkbox" class="status-toggle rounded cursor-pointer" ${data ? 'checked' : ''} />
          `;
          },
          className: 'text-center text-sm text-gray-500' // Centrar la columna
        },
        { title: 'Fecha de registro', data: 'registration_date', className: 'text-sm text-gray-500' },
        {
          title: 'Acciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
          <div>

                <button class="btn-update bg-blue-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                        <i class="fa-solid fa-pen-to-square mr-1"></i>
                        Editar
                </button>

                <button class="btn-delete bg-red-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                        <i class="fa-solid fa-trash mr-1"></i>
                        Eliminar
                </button>

          </div>`;
          },
          className: 'action-column text-gray-500 text-sm'
        }
      ],
      rowCallback: (row: Node, data: any, index: number) => {
        // Cast row to HTMLElement to access querySelector
        const rowElement = row as HTMLElement;

        //Metodo para actulizar el estado del producto
        const checkbox = rowElement.querySelector('.status-toggle') as HTMLInputElement;
        if (checkbox) {
          this.renderer.listen(checkbox, 'change', (event) => {
            this.onStatusChange(event, data);
          });
        }

        //Eliminar
        const btnDelete = rowElement.querySelector('.btn-delete') as HTMLInputElement;
        if (btnDelete) {
          this.renderer.listen(btnDelete, 'click', () => {
            this.deleteCategory(data.id);
          });
        }

        //Actualizar
        const btnUpdate = rowElement.querySelector('.btn-update') as HTMLInputElement;
        if (btnUpdate) {
          this.renderer.listen(btnUpdate, 'click', () => {
            this.toggleModal(data);
          });
        }
        return row;
      }
    };
  }


  //Toggle para actualizar el estado de la categoria (ACTIVO : INACTIVO)
  onStatusChange(event: Event, employee: any): void {
    const checkbox = event.target as HTMLInputElement;
    employee.status = checkbox.checked;

    // Aquí puedes enviar la actualización al backend si es necesario
    this.updateCategorieStatus(employee);
  }

  updateCategorieStatus(categorie: any): void {
    this.categoriesService.updateCategoryStatus(categorie.id, categorie.status).subscribe({
      next: (resp: any) => {
        this.alertsService.showSuccess(`${resp.message}`, `Información`)
      },
      error: (err) => this.alertsService.showError(`${err.error.message}`, `${err.statusText}`),
    });
  }


  //Guardar
  saveCategory() {
    if (this.isEditing && this.selectedCategoryId) {
      this.updateCategory(this.selectedCategoryId);
    } else {
      this.addCategory();
    }
  }

  //Añadir nueva categoria
  addCategory() {
    if (this.form.invalid) {
      this.alertsService.showError('El nombre no puede estar vacío', '');
      return;
    }
    const newCategory = this.form.value;
    this.categoriesService.addCategory(newCategory).subscribe({
      next: (res: any) => {
        this.alertsService.showSuccess(``, `${res.message}`)
        this.refreshTable();
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      },
    });
    this.form.reset();
    // this.showModal = false;
  }

  //Actualizar categoria
  updateCategory(id: string) {
    const updatedCategory = this.form.value;
    this.categoriesService.updateCategory(id, updatedCategory).subscribe({
      next: (res: any) => {
        this.alertsService.showSuccess(`${res.message}`, `Información`)
        this.refreshTable();
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);

      },
    });
    this.showModal = false;

  }

  //Eliminar categoria
  deleteCategory(id: string) {
    this.categoriesService.deletedCategory(id).subscribe({
      next: (res: any) => {
        this.alertsService.showSuccess(``, `${res.message}`)
        this.refreshTable();
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      },
    });
  }

  //Toggle para abrir el modal
  toggleModal(category: any = null) {
    this.showModal = !this.showModal;

    if (category) {
      this.isEditing = true;
      this.titleModal = 'EDITAR CATEGORIA';
      this.selectedCategoryId = category.id;

      this.form.patchValue({
        name: category.name,
      });
    } else {
      this.isEditing = false;
      this.titleModal = 'NUEVA CATEGORIA';
      this.selectedCategoryId = null;
      this.form.reset();
    }
  }

  //Renderizado
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

}
