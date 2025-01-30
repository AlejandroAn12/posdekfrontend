import { Component, effect, EventEmitter, inject, Injector, Input, Output, runInInjectionContext, signal } from '@angular/core';
import { ProductsService } from '../../data-access/products.service';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../interface/product.interface';
import { ModalComponent } from '../../../../../shared/features/components/modal/modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICategory } from '../../../categoriesPages/interface/icategories.interface';
import { CategoriesService } from '../../../categoriesPages/data-access/categories.service';
import { AlertService } from '../../../../../shared/services/alerts.service';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';
import { ISupplier } from '../../../supplierPages/interface/supplier.interface';
import { DownloadPdfComponent } from '../../../../../shared/features/components/download-pdf/download-pdf.component';


@Component({
  selector: 'app-view-products',
  imports: [ModalComponent, CommonModule, ReactiveFormsModule, DownloadPdfComponent],
  templateUrl: './view-products.component.html',
  styleUrl: './view-products.component.css'
})
export default class ViewProductsComponent {

  private productService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private alertsService = inject(AlertService);
  private supplierService = inject(SuppliersService);

  private fb = inject(FormBuilder);
  ProductForm: FormGroup;

  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing = false;
  product: any = [];
  productsSignal = signal<IProduct[]>([]);
  categories: ICategory[] = [];
  selectedProductId: string | null = null;
  suppliers: ISupplier[] = [];

  errorMessage: string = '';

  //PAGINACION
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página
  totalProducts: number = 0; // Total de productos
  pages: number[] = []; // Lista de páginas



  constructor() {
    this.ProductForm = this.fb.group({
      name: ['', Validators.required],
      barcode: ['', Validators.required],
      code: ['', Validators.required],
      stock: [0, Validators.required],
      purchase_price: [0, Validators.required],
      sale_price: [0, Validators.required],
      supplierId: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.viewProducts();
    this.calculatePages();
    this.onCategoryChange();
    this.loadSuppliers();

  }

  loadCategories() {
    this.categoriesService.getCategoriesByStatus().subscribe({
      next: (data: any) => {
        this.categories = data.categories;
      },
      error: (err) => {
        // console.error('Error al cargar categorías:', err);
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      },
    });
  }

  loadSuppliers(){
    this.supplierService.getSuppliers().subscribe({
      next : (data) => {
          this.suppliers = data.suppliers;
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      }
    })
  }

//Ver todos los productos
  viewProducts(categoryId?: string, page: number = 1, limit: number = 10) {
    this.productService.getProducts(categoryId, page, limit).subscribe({
      next: (data: any) => {
        this.totalProducts = data.total || 0;
        const products = data.products || [];
        this.productsSignal.set(products); // Actualiza el Signal de productos
        this.errorMessage = ''; // Limpia cualquier mensaje de error
      },
      error: (err) => {
        console.error({err})
        if (err.status === 404) {
          this.productsSignal.set([]); // Limpia la lista de productos
          this.totalProducts = 0; // Asegúrate de que el total sea 0
          this.errorMessage = err.error.message || 'No hay productos disponibles.';
        } else {
          this.errorMessage = 'Ocurrió un error al cargar los productos.';
          this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
        }
      },
    });
  }



  deleteProduct(id: string) {
    this.productService.deletedProduct(id).subscribe({
      next: (res: any) => {
        this.viewProducts();
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      },
    });
  }

  // Actualiza el estado del producto
  toggleStatus(product: IProduct): void {
    // Alternar el estado
    const updatedStatus = !product.status;

    this.productService.updateProductStatus(product.id, updatedStatus).subscribe({
      next: () => {
        this.productsSignal.update((products) =>
          products.map((p) =>
            p.id === product.id ? { ...p, status: updatedStatus } : p
          )
        );
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
      },
    });
  }

  //Toggle para actualizar el estado del producto (ACTIVO : INACTIVO)
  onStatusChange(event: Event, product: any): void {
    const checkbox = event.target as HTMLInputElement;
    product.status = checkbox.checked;

    // Aquí puedes enviar la actualización al backend si es necesario
    this.updateProductStatus(product);
  }

  updateProductStatus(product: any): void {
    this.productService.updateProductStatus(product.id, product.status).subscribe({
      next: (response: any) => this.alertsService.showSuccess(`${response.message}`, ``),
      error: (err) => this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
    });
  }


  //Metodo para agregar o actualizar
  saveProduct() {
    if (this.isEditing && this.selectedProductId) {
      this.updateProduct(this.selectedProductId);
    } else {
      this.addProduct();
    }
  }

  addProduct() {
    const newProduct = this.ProductForm.value;

    this.productService.addProduct(newProduct).subscribe({
      next: (response) => {
        this.viewProducts();
        this.alertsService.showSuccess(`${response.message}`, ``)

      },
      error: (err) => {
        console.error(err);
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      },
    });
    this.ProductForm.reset();
    // this.showModal = false;
  }

  updateProduct(id: string) {
    const updatedProduct = this.ProductForm.value;

    this.productService.updateProduct(id, updatedProduct).subscribe({
      next: (response:  any) => {
        this.viewProducts();
        this.alertsService.showSuccess(`${response.message}`, ``)
      },
      error: (err) => {
        console.error(err);
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      },
    });
    this.showModal = false;

  }

  toggleModal(product: any = null) {
    this.showModal = !this.showModal;

    if (product) {
      this.isEditing = true;
      this.titleModal = 'Editar producto';
      this.selectedProductId = product.id;

      this.ProductForm.patchValue({
        name: product.name,
        code: product.code,
        barcode: product.barcode,
        stock: product.stock,
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        description: product.description,
        categoryId: product.category.id,
        supplierId: product.supplier.id
      });
    } else {
      this.isEditing = false;
      this.titleModal = 'Añadir nuevo producto';
      this.selectedProductId = null;
      this.ProductForm.reset();
    }
  }
  //Cambio de la categoria
  onCategoryChange() {
    this.ProductForm.get('categoryId')?.valueChanges.subscribe((categoryId) => {
      this.currentPage = 1; // Reiniciar a la primera página al cambiar categoría
      this.viewProducts(categoryId);
    });
  }

  clearCategory() {
    this.ProductForm.get('categoryId')?.setValue(''); // Limpia el valor del formulario
    this.viewProducts(); // Recarga todos los productos
  }

  //Cambio de pagina
  calculatePages() {
    const totalPages = Math.ceil(this.totalProducts / this.itemsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getProductRange() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalProducts);
    return `${start}-${end}`;
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.pages.length) {
      return; // Evita cambiar a páginas no válidas
    }

    this.currentPage = newPage;
    this.viewProducts();
  }

}
