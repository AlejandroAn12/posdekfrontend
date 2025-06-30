import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InventoryService } from '../../data-access/inventory.service';

@Component({
  selector: 'app-save-inventory',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './save-inventory.component.html',
  styleUrl: './save-inventory.component.css'
})
export default class SaveInventoryComponent {

    form: FormGroup;

    private inventoryService = inject(InventoryService);

    constructor() {
        this.form = new FormGroup({
            name: new FormControl(''),
            description: new FormControl(''),
            categoryId: new FormControl(''),
            price: new FormControl(''),
            stock: new FormControl(''),
            imageUrl: new FormControl('')
        });
    }
  

}
