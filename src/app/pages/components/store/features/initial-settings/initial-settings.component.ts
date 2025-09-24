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
  imports: [CommonModule, ReactiveFormsModule],
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
  private cdRef = inject(ChangeDetectorRef); // Añadir esto

  // Títulos del componente
  titleComponent: string = 'Configuraciones del sistema';
  subtitleComponent: string = 'Configura los impuestos y otras opciones iniciales para tu empresa';

  // Formulario
  form: FormGroup;

  // Datos
  iTaxes: Tax[] = [];
  showSelectTypeTaxes: boolean = false;
  isSaving: boolean = false;
  currentConfig: any = null;

  originalFormValue: any = null;
  hasChanges: boolean = false;

  constructor() {
    this.form = this.fb.group({
      workTaxes: [false, [Validators.required]],
      taxId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  // Cargar datos iniciales en el orden correcto
  async loadInitialData(): Promise<void> {
    try {
      // 1. Primero cargar los impuestos disponibles
      await this.loadTaxes();

      // 2. Luego cargar la configuración guardada
      await this.loadCurrentConfiguration();

      // 3. Finalmente configurar los listeners
      this.setupFormListeners();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  // Configurar listeners del formulario
  setupFormListeners(): void {
    // Listener para cambios en workTaxes
    this.form.get('workTaxes')?.valueChanges.subscribe((isChecked: boolean) => {
      this.showSelectTypeTaxes = isChecked;
      this.updateTaxValidation(isChecked);

      if (!isChecked) {
        this.form.patchValue({ taxId: '' }, { emitEvent: false });
      }
      this.checkForChanges();
    });

    // Listener para cambios en taxId
    this.form.get('taxId')?.valueChanges.subscribe((taxId: string) => {
      if (taxId && !this.form.get('workTaxes')?.value) {
        this.form.get('workTaxes')?.setValue(true, { emitEvent: false });
        this.showSelectTypeTaxes = true;
      }
      this.checkForChanges();
    });

    // Listener general para cambios en el formulario
    this.form.valueChanges.subscribe(() => {
      this.checkForChanges();
    });
  }

  // Verificar cambios en el formulario
  checkForChanges(): void {
    if (this.originalFormValue) {
      this.hasChanges = JSON.stringify(this.form.value) !== JSON.stringify(this.originalFormValue);
    }
  }

  // Actualizar validación del campo de impuestos
  updateTaxValidation(workTaxes: boolean): void {
    const taxIdControl = this.form.get('taxId');

    if (workTaxes) {
      taxIdControl?.setValidators([Validators.required]);
    } else {
      taxIdControl?.clearValidators();
      taxIdControl?.setValue('', { emitEvent: false });
    }
    taxIdControl?.updateValueAndValidity();
  }

  // Cargar impuestos disponibles
  loadTaxes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.taxesService.getTaxes().subscribe({
        next: (resp: any) => {
          this.iTaxes = resp.data || [];
          resolve();
        },
        error: (err) => {
          this.alertsService.showError(err.error?.message || 'Error al cargar los impuestos', '');
          reject(err);
        }
      });
    });
  }

  // Cargar configuración actual
  loadCurrentConfiguration(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.enterpriseService.getTaxConfiguration().subscribe({
        next: (config: any) => {
          this.currentConfig = config;

          // EXTRAER EL TAXID CORRECTAMENTE - ESTA ES LA CLAVE
          let taxId = '';
          let workTaxes = false;

          // Opción 1: Si viene en taxeseEnterprise[0].tax.id
          if (config.taxeseEnterprise && config.taxeseEnterprise.length > 0 && config.taxeseEnterprise[0].tax) {
            taxId = config.taxeseEnterprise[0].tax.id;
            workTaxes = true;
          }
          // Opción 2: Si viene directamente en taxId
          else if (config.taxId) {
            taxId = config.taxId;
            workTaxes = true;
          }
          // Opción 3: Si viene en workTaxes pero sin taxId específico
          else if (config.workTaxes) {
            workTaxes = true;
          }

          workTaxes = config.workTaxes || workTaxes;

          // VERIFICAR QUE EL TAXID EXISTA EN LA LISTA DE IMPUESTOS
          if (taxId) {
            const taxExists = this.iTaxes.some(tax => tax.id === taxId);

            if (!taxExists) {
              taxId = '';
              workTaxes = false;
            }
          }

          // APLICAR LOS VALORES AL FORMULARIO
          setTimeout(() => {
            this.form.patchValue({
              workTaxes: workTaxes,
              taxId: taxId
            }, { emitEvent: false });

            this.showSelectTypeTaxes = workTaxes;

            // Guardar el valor original para comparar cambios
            this.originalFormValue = {
              workTaxes: workTaxes,
              taxId: taxId
            };
            this.hasChanges = false;

            this.cdRef.detectChanges();
            resolve();
          });
        },
        error: (err) => {
          console.error('❌ Error loading tax configuration:', err);
          reject(err);
        }
      });
    });
  }

  // Método para comparar impuestos
  compareTaxes(tax1: any, tax2: any): boolean {
    if (!tax1 || !tax2) return false;

    if (typeof tax1 === 'string' && typeof tax2 === 'string') {
      return tax1 === tax2;
    }

    if (typeof tax1 === 'object' && typeof tax2 === 'object') {
      return tax1.id === tax2.id;
    }

    if (typeof tax1 === 'string' && typeof tax2 === 'object') {
      return tax1 === tax2.id;
    }

    if (typeof tax1 === 'object' && typeof tax2 === 'string') {
      return tax1.id === tax2;
    }

    return false;
  }

  // Verificar si hay configuración existente
  hasExistingConfiguration(): boolean {
    return !!(this.currentConfig?.taxeseEnterprise?.[0]?.tax?.id || this.currentConfig?.taxId);
  }

  // Verificar si el botón debe estar deshabilitado
  isSaveDisabled(): boolean {
    if (this.isSaving) return true;

    if (this.form.invalid) return true;

    if (this.form.get('workTaxes')?.value && !this.form.get('taxId')?.value) return true;

    if (this.hasExistingConfiguration() && !this.hasChanges) return true;

    return false;
  }

  // Obtener el impuesto seleccionado
  getSelectedTax(): Tax | null {
    const taxId = this.form.get('taxId')?.value;
    if (!taxId) return null;

    const foundTax = this.iTaxes.find(tax => tax.id === taxId);

    if (!foundTax && this.currentConfig?.taxeseEnterprise?.[0]?.tax) {
      return this.currentConfig.taxeseEnterprise[0].tax;
    }

    return foundTax || null;
  }

  // Resetear configuración
  resetConfiguration(): void {
    if (confirm('¿Está seguro de que desea eliminar la configuración de impuestos?')) {
      this.form.patchValue({
        workTaxes: false,
        taxId: ''
      }, { emitEvent: false });

      this.showSelectTypeTaxes = false;
      this.hasChanges = true;
      this.cdRef.detectChanges();
    }
  }

  // Guardar configuración
  save(): void {
    if (this.form.invalid || this.isSaveDisabled()) {
      this.markFormGroupTouched();
      this.alertsService.showWarning('Por favor, complete los campos requeridos', 'Formulario incompleto');
      return;
    }

    this.isSaving = true;
    const formData = this.form.value;

    this.enterpriseService.addTaxesStore(formData).subscribe({
      next: (response: any) => {
        this.isSaving = false;

        // Actualizar la configuración actual y el valor original
        this.currentConfig = formData;
        this.originalFormValue = { ...formData };
        this.hasChanges = false;

        Swal.fire({
          icon: 'success',
          title: '¡Configuración guardada!',
          text: response.message || 'Los impuestos se han configurado correctamente',
          timer: 3000,
          showConfirmButton: false,
          position: 'top-end'
        });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error al guardar la configuración',
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
