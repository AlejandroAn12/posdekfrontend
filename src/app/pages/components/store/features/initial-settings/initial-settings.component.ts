import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { StoreService } from '../../data-access/enterprise.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../../core/services/alerts.service';
import { TaxesService } from '../../../../../core/services/taxes.service';
import Swal from 'sweetalert2';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { Router } from '@angular/router';
// Interfaces
interface Tax {
  id: string;
  name: string;
  rate: number;
  symbol: string;
  description?: string;
}
@Component({
  selector: 'app-initial-settings',
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './initial-settings.component.html',
  styleUrl: './initial-settings.component.css'
})
export default class InitialSettingsComponent implements OnInit {

  // Inyecciones de servicios
  private fb = inject(FormBuilder);
  private enterpriseService = inject(StoreService);
  private taxesService = inject(TaxesService);
  private alertsService = inject(AlertService);
  private router = inject(Router);

  // Títulos del componente
  titleComponent: string = 'Configuraciones del sistema';
  subtitleComponent: string = 'Configura los impuestos y otras opciones iniciales para tu empresa';

  // Formulario
  form: FormGroup;

  // Datos
  iTaxes: Tax[] = [];
  workTaxes: boolean = false;
  showSelectTypeTaxes: boolean = false;
  isSaving: boolean = false;
  currentConfig: any = null;

  constructor() {
    this.form = this.fb.group({
      workTaxes: [false, [Validators.required]],
      taxId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentConfiguration();
    this.loadTaxes();
    this.setupFormListeners();
  }

  // Configurar listeners del formulario
  setupFormListeners(): void {
    this.form.get('workTaxes')?.valueChanges.subscribe((isChecked: boolean) => {
      this.showSelectTypeTaxes = isChecked;
      this.updateTaxValidation(isChecked);
    });
  }

  // Actualizar validación del campo de impuestos
  updateTaxValidation(workWithTaxes: boolean): void {
    const taxIdControl = this.form.get('taxId');

    if (workWithTaxes) {
      taxIdControl?.setValidators([Validators.required]);
    } else {
      taxIdControl?.clearValidators();
      taxIdControl?.setValue('');
    }

    taxIdControl?.updateValueAndValidity();
  }

  // Cargar configuración actual
  loadCurrentConfiguration(): void {
    console.log('carga')
    // this.enterpriseService.getTaxConfiguration().subscribe({
    //   next: (config: any) => {
    //     this.currentConfig = config;
    //     this.form.patchValue({
    //       workTaxes: config.workWithTaxes || false,
    //       taxId: config.taxId || ''
    //     });
    //     this.showSelectTypeTaxes = config.workWithTaxes || false;
    //   },
    //   error: (err) => {
    //     console.error('Error loading tax configuration:', err);
    //   }
    // });
  }

  // Cargar impuestos disponibles
  loadTaxes(): void {
    this.taxesService.getTaxes().subscribe({
      next: (resp: any) => {
        this.iTaxes = resp.data || [];

        // Si hay impuestos y la configuración actual usa impuestos, seleccionar el primero por defecto
        if (this.iTaxes.length > 0 && this.form.get('workTaxes')?.value && !this.form.get('taxId')?.value) {
          this.form.patchValue({ taxId: this.iTaxes[0].id });
        }
      },
      error: (err) => {
        this.alertsService.showError(err.error?.message || 'Error al cargar los impuestos', '');
      }
    });
  }

  // Manejar cambio en el switch de impuestos
  onWorkTaxesChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.workTaxes = isChecked;

    // Mostrar u ocultar el select de impuestos con animación
    this.showSelectTypeTaxes = isChecked;

    // Log para debugging
    console.log('Trabajar con impuestos:', this.workTaxes);
  }

  // Obtener el impuesto seleccionado
  getSelectedTax(): Tax | null {
    const taxId = this.form.get('taxId')?.value;
    return this.iTaxes.find(tax => tax.id === taxId) || null;
  }

  // Guardar configuración
  save(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      this.alertsService.showWarning('Por favor, complete los campos requeridos', 'Formulario incompleto');
      return;
    }

    this.isSaving = true;
    const formData = this.form.value;

    this.enterpriseService.addTaxesStore(formData).subscribe({
      next: (response: any) => {
        this.isSaving = false;

        Swal.fire({
          icon: 'success',
          title: '¡Configuración guardada!',
          text: response.message || 'Los impuestos se han configurado correctamente',
          timer: 3000,
          showConfirmButton: false,
          position: 'top-end'
        });

        // Actualizar configuración actual
        this.currentConfig = formData;
      },
      error: (err) => {
        this.isSaving = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error al guardar la configuración de impuestos',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  // Marcar todos los campos como tocados
  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  // Getter para acceder a los controles del formulario
  get f() {
    return this.form.controls;
  }
}
