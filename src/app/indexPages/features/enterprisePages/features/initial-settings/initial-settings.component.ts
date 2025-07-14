import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { StoreService } from '../../data-access/enterprise.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alerts.service';
import { TaxesService } from '../../../../../core/services/taxes.service';

@Component({
  selector: 'app-initial-settings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './initial-settings.component.html',
  styleUrl: './initial-settings.component.css'
})
export default class InitialSettingsComponent implements OnInit {

  private fb = inject(FormBuilder);
  private enterpriseService = inject(StoreService);
  private taxesService = inject(TaxesService);
  private alertsService = inject(AlertService);


  EnterpriseForm: FormGroup;
  iTaxes: any[] = [];
  work_taxes: boolean = false;
  price_taxes: boolean = false;
  showSelectTypeTaxes: boolean = false;
  
  constructor() {
    this.EnterpriseForm = this.fb.group({
      work_taxes: [false],
      taxId: []
    });
  }
  
  ngOnInit(): void {
    this.loadTaxes();
    this.EnterpriseForm.get('work_taxes')?.valueChanges.subscribe((isChecked: boolean) => {
      this.showSelectTypeTaxes = isChecked;
    });
  }
  

  onWorkTaxesChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.work_taxes = isChecked; // Actualiza el estado
    // this.showSelectTypeTaxes = isChecked;
    console.log('La venta tiene impuestos:', this.work_taxes); // Verifica en consola

  }

  onPriceTaxesChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.price_taxes = isChecked; // Actualiza el estado
    console.log('La venta tiene impuestos:', this.price_taxes); // Verifica en consola
  }

  
  save() {
    if (this.EnterpriseForm.invalid) {
      console.log('Formulario inválido', this.EnterpriseForm.value);
      this.alertsService.showInfo('Por favor, complete los campos requeridos', 'Formulario incompleto');
      return;
    }

    const data = this.EnterpriseForm.value; // Se obtienen los valores actualizados

    this.enterpriseService.addStore(data).subscribe({
      next: (response: any) => {
      },
      error: (err) => {
        this.alertsService.showError(err.error.message, '');
      }
    });

    this.EnterpriseForm.reset(); // Se limpia el formulario
  }

  loadTaxes() {
    this.taxesService.getTaxes().subscribe({
      next: (resp: any) => {
        this.iTaxes = resp.data;
      },
      error: (err) => {
        this.alertsService.showError(err.error.message, '');
      }
    })
  }
}
