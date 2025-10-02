import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthStateService } from '../../../../../core/services/auth-state.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { InventoryReportService } from '../../data-access/inventory-report.service';
import { CategoriesService } from '../../../categories/data-access/categories.service';
import { ICategory } from '../../../categories/interface/icategories.interface';
import { InventoryService } from '../../data-access/inventory.service';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export default class InventoryComponent {
  // Inyecciones de servicios
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

  totalRegistros = 0;
  paginaActual = 1;
  limitePorPagina = 10;
  totalPaginas = 1;

  // Formulario
  inventoryForm: FormGroup;

  constructor() {
    this.inventoryForm = this.fB.group({
      categoryId: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.getUserLogged();
    this.loadCategories();
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
          text: `Inventario ${resp.numberInventory} generado`,
          timer: 3000,
          toast: true,
          position: 'top',
          timerProgressBar: true,
          showConfirmButton: false
        });
        // Recargar la tabla
        this.loadData();
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

  loadData() {
    this.inventoryService.getAllInventoryGenerated().subscribe({
      next: (res: any) => {
        this.inventoryData = res.data;
        this.totalRegistros = res.data.length;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `${err.error.message}`,
          toast: true,
          position: 'top-end',
          confirmButtonText: 'Entendido'
        });
      }
    })
  }


  // Métodos de paginación mejorados
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.loadData();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.loadData();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.loadData();
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

  getLastInventoryIndex(): number {
    if (!this.inventoryData || this.inventoryData.length === 0) {
      return 0;
    }
    const lastIndex = this.paginaActual * this.limitePorPagina;
    return lastIndex > this.totalRegistros ? this.totalRegistros : lastIndex;
  }

  entryCount(inventoryId: string) {
    this.router.navigate(['/admin/inventory/entry-inventory', inventoryId]);
  }

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
