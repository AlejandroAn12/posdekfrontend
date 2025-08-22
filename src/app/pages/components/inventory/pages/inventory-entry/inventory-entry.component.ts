import { Component, inject } from '@angular/core';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStateService } from '../../../../../core/services/auth-state.service';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { InventoryService } from '../../../merchandise/data-access/inventory.service';

@Component({
  selector: 'app-inventory-entry',
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './inventory-entry.component.html',
  styleUrl: './inventory-entry.component.css'
})
export default class InventoryEntryComponent {

  private inventoryService = inject(InventoryService);
  private authStateService = inject(AuthStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  inventoryItems: any[] = [];
  inventoryId: string = '';
  data: any[] = [];
  date: any = '';
  user: string = '';

  titleComponent : string = 'Gestión de inventarios';
  subtitleComponent : string = 'Ingreso de inventario';


  ngOnInit() {
    this.getUserLogged();
    this.getDate();
    this.inventoryId = this.route.snapshot.paramMap.get('id')!;
    this.loadItems();
  }

  getDate() {
    const now = new Date();
    const formatted = format(now, 'dd-MM-yyyy HH:mm:ss');
    console.log(formatted);
    this.date = formatted;
  }

  getUserLogged() {
    this.authStateService.userAuth().subscribe({
      next: (user) => {
        this.user = `${user.data.employee.name} ${user.data.employee.surname}`;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  loadItems() {
    this.inventoryService.getInventoryItems(this.inventoryId).subscribe((items) => {
      // console.log(items)
      this.inventoryItems = items.map(item => ({
        ...item,
        physicalQuantity: item.physicalQuantity ?? 0
      }));
    });
  }

  saveInventory() {
    const payload = this.inventoryItems.map(item => ({
      id: item.id,
      physicalQuantity: item.physicalQuantity ?? 0
    }));

    this.inventoryService.finalizeInventory(this.inventoryId, payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Inventario finalizado',
          text: 'Las cantidades físicas fueron registradas correctamente.',
        });
        this.router.navigateByUrl('index/merchandise/inventory');

      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo finalizar el inventario.',
        });
      }
    });
  }


}
