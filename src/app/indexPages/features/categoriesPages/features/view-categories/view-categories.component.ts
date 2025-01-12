import Swal from 'sweetalert2'
import { Component, inject, signal } from '@angular/core';
import { CategoriesService } from '../../data-access/categories.service';
import { ICategory } from '../../interface/icategories.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../../shared/features/components/modal/modal.component';

@Component({
  selector: 'app-view-categories',
  imports: [ModalComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './view-categories.component.html',
  styleUrl: './view-categories.component.css'
})
export default class ViewCategoriesComponent {

  private categoriesService = inject(CategoriesService);
  private fb = inject(FormBuilder);
  CategoryForm: FormGroup;

  constructor() {
    this.CategoryForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.viewCategories();
  }

  //Modal
  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing = false;

  product: any = [];
  categoriesSignal = signal<ICategory[]>([]);
  categories: ICategory[] = [];
  selectedCategoryId: string | null = null;

  //PAGINACION
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página
  totalCategories: number = 0; // Total de productos
  pages: number[] = []; // Lista de páginas



  //Ver todas las categorias
  viewCategories(page: number = 1, limit: number = 10) {
    this.categoriesService.getAllCategories(page, limit).subscribe({
      next: (data: any) => {
        this.totalCategories = data.total;
        const categories = data.categories || [];
        this.categoriesSignal.set(categories);
      },
      error: (err) => console.error('Error al cargar categorias:', err),
    });
  }


  //Toggle para actualizar el estado de la categoria (ACTIVO : INACTIVO)
  toggleStatus(category: ICategory): void {
    const updatedStatus = !category.status;
    this.categoriesService.updateCategoryStatus(category.id, updatedStatus).subscribe({
      next: (res: any) => {
        this.categoriesSignal.update((categories) =>
          categories.map((p) =>
            p.id === category.id ? { ...p, status: updatedStatus } : p
          )
        );
      },
      error: (err) => {
        console.error('Error al actualizar el estado del producto:', err);
      },
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
    const newCategory = this.CategoryForm.value;
    this.categoriesService.addCategory(newCategory).subscribe({
      next: (res) => {
        this.viewCategories();
      },
      error: (err) => {
        console.error(err);
      },
    });
    this.CategoryForm.reset();
    // this.showModal = false;
  }

  //Actualizar categoria
  updateCategory(id: string) {
    const updatedCategory = this.CategoryForm.value;
    this.categoriesService.updateCategory(id, updatedCategory).subscribe({
      next: (res: any) => {
        this.viewCategories();
      },
      error: (err) => {
        console.error(err);
      },
    });
    this.showModal = false;

  }

  //Eliminar categoria
  deleteCategory(id: string) {
    this.categoriesService.deletedCategory(id).subscribe({
      next: (res: any) => {
        this.viewCategories();
        console.log(res)
      },
      error: (err) => {
        console.error('Error al eliminar categoria:', err)
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `${err.error.message}`
        });
      },
    });
  }

  //Toggle para abrir el modal
  toggleModal(category: any = null) {
    this.showModal = !this.showModal;

    if (category) {
      this.isEditing = true;
      this.titleModal = 'Editar categoria';
      this.selectedCategoryId = category.id;

      this.CategoryForm.patchValue({
        name: category.name,
      });
    } else {
      this.isEditing = false;
      this.titleModal = 'Añadir categoria';
      this.selectedCategoryId = null;
      this.CategoryForm.reset();
    }
  }


  //Paginacion
  calculatePages() {
    const totalPages = Math.ceil(this.totalCategories / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getProductRange() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalCategories);
    return `${start}-${end}`;
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.pages.length) {
      return; // Evita cambiar a páginas no válidas
    }

    this.currentPage = newPage;
    this.viewCategories();
  }


}
