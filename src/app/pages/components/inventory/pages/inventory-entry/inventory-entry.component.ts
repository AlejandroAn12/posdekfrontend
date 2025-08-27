import { Component, inject } from '@angular/core';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStateService } from '../../../../../core/services/auth-state.service';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { InventoryService } from '../../../merchandise/data-access/inventory.service';

interface InventoryItem {
  id: string;
  barcode: string;
  code: string;
  name: string;
  quantity: number;
  physicalQuantity: number;
  product?: any;
}

@Component({
  selector: 'app-inventory-entry',
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './inventory-entry.component.html',
  styleUrl: './inventory-entry.component.css'
})
export default class InventoryEntryComponent {

  // Inyecciones de servicios
  private inventoryService = inject(InventoryService);
  private authStateService = inject(AuthStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Datos del inventario
  inventoryItems: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  inventoryId: string = '';
  date: string = '';
  user: string = '';
  role: string = '';

  // Títulos del componente
  titleComponent: string = 'Gestión de inventarios';
  subtitleComponent: string = 'Ingreso de inventario';

  // Totales y cálculos
  totalSystemStock: number = 0;
  totalPhysicalStock: number = 0;
  totalDifference: number = 0;

  // Estados
  isSaving: boolean = false;
  isLoading: boolean = true;

  ngOnInit() {
    this.getUserLogged();
    this.getDate();
    this.inventoryId = this.route.snapshot.paramMap.get('id')!;
    this.loadItems();
  }

  getDate() {
    const now = new Date();
    this.date = format(now, 'dd-MM-yyyy HH:mm:ss');
  }

  getUserLogged() {
    this.authStateService.userAuth().subscribe({
      next: (user) => {
        this.user = `${user.data.employee.name} ${user.data.employee.surname}`;
        this.role = user.data.role.name;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  loadItems() {
    this.isLoading = true;
    this.inventoryService.getInventoryItems(this.inventoryId).subscribe({
      next: (items: any) => {
        console.log(items)
        this.inventoryItems = items.map((item: any) => ({
          id: item.id,
          barcode: item.barcode || 'N/A',
          code: item.code || 'N/A',
          name: item.name || 'Producto sin nombre',
          quantity: item.quantity || 0,
          physicalQuantity: item.physicalQuantity ?? 0
        }));

        this.filteredItems = [...this.inventoryItems];
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading inventory items:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los items del inventario.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  calculateTotals(): void {
    this.totalSystemStock = this.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPhysicalStock = this.inventoryItems.reduce((sum, item) => sum + (item.physicalQuantity || 0), 0);
    this.totalDifference = this.totalPhysicalStock - this.totalSystemStock;
  }

  getDifference(item: InventoryItem): number {
    return (item.physicalQuantity || 0) - item.quantity;
  }

  updateTotals(): void {
    this.calculateTotals();
  }

  filterProducts(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.filteredItems = [...this.inventoryItems];
      return;
    }

    this.filteredItems = this.inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.barcode.toLowerCase().includes(searchTerm) ||
      item.code.toLowerCase().includes(searchTerm)
    );
  }

  resetAllQuantities(): void {
    this.inventoryItems.forEach(item => {
      item.physicalQuantity = item.quantity;
    });
    this.filteredItems = [...this.inventoryItems];
    this.calculateTotals();

    Swal.fire({
      icon: 'success',
      title: 'Valores reiniciados',
      text: 'Todos los valores físicos se han restablecido a los valores del sistema.',
      timer: 2000,
      showConfirmButton: false
    });
  }

  saveInventory() {
    // Validar que todos los campos físicos estén completos
    const incompleteItems = this.inventoryItems.filter(item =>
      item.physicalQuantity === null || item.physicalQuantity === undefined
    );

    if (incompleteItems.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, complete todas las cantidades físicas antes de guardar.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    this.isSaving = true;

    const payload = this.inventoryItems.map(item => ({
      id: item.id,
      physicalQuantity: item.physicalQuantity
    }));

    this.inventoryService.finalizeInventory(this.inventoryId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire({
          icon: 'success',
          title: 'Inventario finalizado',
          text: 'Las cantidades físicas fueron registradas correctamente.',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          this.router.navigateByUrl('admin/inventory/inventory');
        });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo finalizar el inventario.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // Método para navegar hacia atrás
  goBack(): void {
    this.router.navigateByUrl('admin/inventory/inventory');
  }

  // Método para verificar si hay diferencias
  hasDifferences(): boolean {
    return this.inventoryItems.some(item => this.getDifference(item) !== 0);
  }

  // Método para resaltar productos con diferencias
  getRowClass(item: InventoryItem): string {
    const difference = this.getDifference(item);
    if (difference > 0) {
      return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    } else if (difference < 0) {
      return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    }
    return '';
  }
}
