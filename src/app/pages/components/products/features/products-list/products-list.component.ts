import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../../categories/data-access/categories.service';
import { SuppliersService } from '../../../suppliers/data-access/suppliers.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ReportsPdfService } from '../../../../../core/services/reports-pdf.service';
import { ProductReportService } from '../../services/reports.service';

@Component({
  selector: 'app-products-list',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css'
})
export default class ProductsListComponent {


  productService = inject(ProductsService);
  categoryService = inject(CategoriesService);
  supplierService = inject(SuppliersService);
  reportService = inject(ProductReportService);
  router = inject(Router);
  private fb = inject(FormBuilder);

  filtroForm = this.fb.group({
    product: [''],
    supplier: [''],
    category: ['']
  });

  isLoading: boolean = false;
  products: any[] = [];
  categories: any[] = [];
  suppliers: any[] = [];
  totalRegistros = 0;
  paginaActual = 1;
  limitePorPagina = 10;
  totalPaginas = 1;

  titleComponent: string = 'Productos'
  subtitleComponent: string = 'Listado de productos registrados'

  constructor() {
    this.searchProducts();
    this.loadCategories();
    this.loadSuppliers();
  }

   newProduct() {
    this.router.navigateByUrl('admin/products/form');
  }

  searchProducts() {
    const filtros = {
      product: this.filtroForm.value.product || undefined,
      supplier: this.filtroForm.value.supplier || undefined,
      category: this.filtroForm.value.category || undefined,
      page: this.paginaActual,
      limit: this.limitePorPagina,
    };

    this.isLoading = true;
    this.productService.productsFilter(filtros).subscribe({
      next: (res) => {
        this.products = res.data;
        this.totalRegistros = res.total;
        this.totalPaginas = res.totalPages;
        this.isLoading = false;
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: 'Ocurrió un error inesperado',
          toast: true,
          timer: 5000,
          timerProgressBar: true
        });
      }
    })
  }

  delete(id: string) {
    const swalWithTailwind = Swal.mixin({
      customClass: {
        confirmButton: "px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400",
        cancelButton: "px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
      },
      buttonsStyling: false
    });

    swalWithTailwind.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
      reverseButtons: true,
      backdrop: `
      rgba(0,0,0,0.4)
      left top
      no-repeat
    `
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deletedProduct(id).subscribe({
          next: () => {
            swalWithTailwind.fire({
              icon: "success",
              title: "Eliminado",
              text: "El producto ha sido eliminado correctamente",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3500,
              timerProgressBar: true
            });
            this.searchProducts();
          },
          error: (err) => {
            Swal.fire({
              icon: "error",
              title: "Error al eliminar",
              text: err?.error?.message || "Error inesperado",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true
            });
          },
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithTailwind.fire({
          icon: "info",
          title: "Cancelado",
          text: "El producto no fue eliminado",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }


  editProduct(productId: string) {
    this.router.navigate(['/admin/products/form'], { queryParams: { form: 'update', id: productId } });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories;
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: 'Ocurrió un error inesperado',
          toast: true,
          timer: 5000,
          timerProgressBar: true
        });
      }
    })
  }

  loadSuppliers() {
    this.supplierService.getSuppliers().subscribe({
      next: (res) => {
        this.suppliers = res.suppliers;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          text: 'Hubo un error al obtener la lsita de proveedores.',
          toast: true,
          showConfirmButton: false
        })
      }
    })
  }
  //Toggle para actualizar el estado del producto (ACTIVO : INACTIVO)
  onStatusChange(event: Event, product: any): void {
    const checkbox = event.target as HTMLInputElement;
    product.status = checkbox.checked;

    this.updateProductStatus(product);
  }

  updateProductStatus(product: any): void {
    this.productService.updateProductStatus(product.id, product.status).subscribe({
      next: (res) => {
        if (res) {
          Swal.fire({
            position: "top",
            icon: "success",
            title: 'Producto habilitado para venta',
            showConfirmButton: false,
            toast: true,
            timerProgressBar: true,
            timer: 4000
          });
        }
        else {
          Swal.fire({
            position: "top",
            icon: "warning",
            title: 'Producto inhabilitado para venta',
            showConfirmButton: false,
            toast: true,
            timerProgressBar: true,
            timer: 4000
          });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar estado',
          text: `${err.error.message}`,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000
        })
      }
    });
  }

  onItsServiceChange(event: Event, product: any): void {
    const checkboxService = event.target as HTMLInputElement;
    product.itsService = checkboxService.checked;

    this.updateProductServices(product);
  }

  updateProductServices(product: any): void {
    this.productService.updateProductService(product.id, product.itsService).subscribe({
      next: (res) => {
        if (res) {
          Swal.fire({
            position: "top",
            icon: "success",
            title: 'Producto habilitado como servicio',
            showConfirmButton: false,
            toast: true,
            timerProgressBar: true,
            timer: 4000
          });
        }
        else {
          Swal.fire({
            position: "top",
            icon: "warning",
            title: 'Porducto inhabilitado como servicio',
            showConfirmButton: false,
            toast: true,
            timerProgressBar: true,
            timer: 4000
          });
        }
      },
      error: (err) => {

        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar servicio',
          text: `${err.error.message}`,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000
        })
      }
    });
  }

  printPdf() {
          this.reportService.downloadAllProductReportPdf().subscribe({
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

  /**
   * PAGINACION
   */

  getLastMovementIndex(): number {
    if (!this.products || this.products.length === 0) {
      return 0;
    }
    const lastIndex = this.paginaActual * this.limitePorPagina;
    return lastIndex > this.totalRegistros ? this.totalRegistros : lastIndex;
  }


  // Métodos de paginación mejorados
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.searchProducts();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.searchProducts();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.searchProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const start = Math.max(1, this.paginaActual - 2);
    const end = Math.min(this.totalPaginas, start + 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageButtonClass(page: number): string {
    const baseClass = 'px-3 py-1 rounded-lg font-medium cursor-pointer transition-all duration-200';
    return page === this.paginaActual
      ? `${baseClass} bg-blue-600 text-white shadow-md`
      : `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`;
  }


}
