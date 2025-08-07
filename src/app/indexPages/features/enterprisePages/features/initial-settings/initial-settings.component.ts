import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { StoreService } from '../../data-access/enterprise.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alerts.service';
import { TaxesService } from '../../../../../core/services/taxes.service';
import Swal from 'sweetalert2';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-initial-settings',
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './initial-settings.component.html',
  styleUrl: './initial-settings.component.css'
})
export default class InitialSettingsComponent implements OnInit {

  titleComponent: string = 'Configuraciones de la empresa';
  subtitleComponent: string = 'Configura los impuestos y otras opciones iniciales para tu empresa';

  private fb = inject(FormBuilder);
  private enterpriseService = inject(StoreService);
  private taxesService = inject(TaxesService);
  private alertsService = inject(AlertService);


  form: FormGroup;
  iTaxes: any[] = [];
  workTaxes: boolean = false;
  showSelectTypeTaxes: boolean = false;
  
  constructor() {
    this.form = this.fb.group({
      workTaxes: [false, [Validators.required]],
      taxId: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.loadTaxes();
    this.form.get('workTaxes')?.valueChanges.subscribe((isChecked: boolean) => {
      this.showSelectTypeTaxes = isChecked;
    });
  }
  

  onWorkTaxesChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.workTaxes = isChecked; // Actualiza el estado
    // this.showSelectTypeTaxes = isChecked;
    console.log('La venta tiene impuestos:', this.workTaxes); // Verifica en consola

  }
  
  save() {
    if (this.form.invalid) {
      console.log('Formulario inválido', this.form.value);
      this.alertsService.showInfo('Por favor, complete los campos requeridos', 'Formulario incompleto');
      return;
    }

    const data = this.form.value; // Se obtienen los valores actualizados

    this.enterpriseService.addTaxesStore(data).subscribe({
      next: (response: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Impuestos guardados correctamente',
          timer: 3000,
          showConfirmButton: false
        });
        this.loadTaxes(); // Recargar los impuestos después de guardar
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:err.error.message || 'Error al guardar los impuestos',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });

    this.form.reset();
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

  get f() {
    return this.form.controls;
  }
}
