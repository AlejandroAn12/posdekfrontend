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

  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing = false;
  product: any = [];
  categoriesSignal = signal<ICategory[]>([]);
  categories: ICategory[] = [];
  selectedCategoryId: string | null = null;




  viewCategories() {
    this.categoriesService.geCategories().subscribe({
      next: (data: any) => {
        const categories = data.categories || [];
        this.categoriesSignal.set(categories);
      },
      error: (err) => console.error('Error al cargar categorias:', err),
    });
  }


  toggleStatus(category: ICategory): void {
    // Alternar el estado
    const updatedStatus = !category.status;
    console.log('CATE', updatedStatus)

    this.categoriesService.updateCategoryStatus(category.id, updatedStatus).subscribe({
      next: (res: any) => {
        console.log(res)
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


  saveCategory() {
    if (this.isEditing && this.selectedCategoryId) {
      this.updateCategory(this.selectedCategoryId);
    } else {
      this.addCategory();
    }
  }

  addCategory() {
    const newCategory = this.CategoryForm.value;

    this.categoriesService.addCategory(newCategory).subscribe({
      next: (res: any) => {
        console.log(res);
        this.viewCategories();
      },
      error: (err) => {
        console.error(err);
      },
    });
    this.CategoryForm.reset();
    // this.showModal = false;
  }

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

  deleteCategory(id: string) {
    this.categoriesService.deletedCategory(id).subscribe({
      next: (res: any) => {
        this.viewCategories();
        console.log(res)
      },
      error: (err) => console.error('Error al eliminar categoria:', err),
    });
  }

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


}
