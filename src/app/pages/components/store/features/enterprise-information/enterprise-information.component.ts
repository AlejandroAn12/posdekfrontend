import { Component, inject } from '@angular/core';
import { StoreService } from '../../data-access/enterprise.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { AlertService } from '../../../../../core/services/alerts.service';
import { SriService } from '../../../../../core/services/services.sri.service';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-enterprise-information',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, HeaderComponent],
  templateUrl: './enterprise-information.component.html',
  styleUrl: './enterprise-information.component.css'
})
export default class EnterpriseInformationComponent {

  private storeService = inject(StoreService);
  private alertsService = inject(AlertService);
  private sriService = inject(SriService);
  private fb = inject(FormBuilder);
  private id: string = '';
  ruc: string = '';
  store : any;
  titleComponent : string = 'Información de tienda';

  resultado: any = null;
  cargando: boolean = false;

  //Formulario
  EnterpriseForm: FormGroup;
  isDisabled: boolean = false;
  canEdit: boolean = true;
  isFormChanged = false;
  initialFormValues: any;
  selectedFile!: File | null;
  uploadProgress = 0; // Progreso de la carga (0-100)
  isUploading = false; // Indicador de subida en curso

  constructor() {
    this.EnterpriseForm = this.fb.group({
      numeroRuc: [{ value: '', disabled: this.isDisabled }, [Validators.required, Validators.minLength(13)]],
      razonSocial: [{ value: '', disabled: this.isDisabled }, Validators.required],
      tipoContribuyente: [{ value: '', disabled: this.isDisabled }, Validators.required],
      regimen: [{ value: '', disabled: this.isDisabled }],
      categoria: [{ value: '', disabled: this.isDisabled }],
      obligadoLlevarContabilidad: [{ value: '', disabled: this.isDisabled }],
      agenteRetencion: [{ value: '', disabled: this.isDisabled }],
      contribuyenteEspecial: [{ value: '', disabled: this.isDisabled }],
      representantesLegales: [{ value: '', disabled: this.isDisabled }],
      actividadEconomicaPrincipal: [{ value: '', disabled: this.isDisabled }],
      email: [{ value: '', disabled: this.isDisabled }, [Validators.email]],
      telefono: [{ value: '', disabled: this.isDisabled }],
      address: [{ value: '', disabled: this.isDisabled }],
    });

    //Cargas
    this.getInformationStore();

    // Guardar valores iniciales
    this.initialFormValues = this.EnterpriseForm.value;

    // Detectar cambios
    this.EnterpriseForm.valueChanges.subscribe(() => {
      this.isFormChanged = !this.compareFormValues();
    });
  }


  buscarRuc() {
    this.cargando = true;

    if (!this.ruc || this.ruc.length < 13) {
      Swal.fire({
        icon: "error",
        title: `Error`,
        text: `Debe ingresar un RUC válido.`,
        showConfirmButton: false,
        timer: 8000,
        confirmButtonText: 'Entendido',
        timerProgressBar: true,
      });
      this.cargando = false;
      return;
    }

    this.sriService.consultarRuc(this.ruc).subscribe({
      next: (res) => {
        console.log('✅ Respuesta:', res);
        this.cargarDatosDesdeSri(res.data);
        this.resultado = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error en servicio:', err);
        this.resultado = null;
        this.cargando = false;

        Swal.fire({
          icon: "error",
          title: `Error`,
          text: `${err.error.message}`,
          showConfirmButton: false,
          timer: 8000,
          confirmButtonText: 'Entendido',
          timerProgressBar: true,
        });
      }
    });
  }

  cargarDatosDesdeSri(data: any) {
    if (!data || !Array.isArray(data) || length === 0) return;

    const contribuyente = data[0];

    // ✅ Obtener nombre(s) de representantes legales de forma segura
    const representantesLegales = Array.isArray(contribuyente.representantesLegales)
      ? contribuyente.representantesLegales
        .map((r: any) => `${r.nombre} (${r.identificacion})`)
        .join(' - ')
      : '';

    // ✅ Actualizar los valores del formulario con seguridad
    this.EnterpriseForm.patchValue({
      numeroRuc: contribuyente.numeroRuc || '',
      razonSocial: contribuyente.razonSocial || '',
      actividadEconomicaPrincipal: contribuyente.actividadEconomicaPrincipal || '',
      tipoContribuyente: contribuyente.tipoContribuyente || '',
      regimen: contribuyente.regimen || '',
      categoria: contribuyente.categoria || '',
      obligadoLlevarContabilidad: contribuyente.obligadoLlevarContabilidad || '',
      agenteRetencion: contribuyente.agenteRetencion || '',
      contribuyenteEspecial: contribuyente.contribuyenteEspecial || '',
      representantesLegales: representantesLegales,
    });
  }

  compareFormValues(): boolean {
    return JSON.stringify(this.EnterpriseForm.value) === JSON.stringify(this.initialFormValues);
  }

  getInformationStore() {
    
    this.storeService.getInformationStore().subscribe({
      next: (res: any) => {
        this.store = res;
        this.id = res.id;
        this.EnterpriseForm.patchValue({
          numeroRuc: res.numeroRuc || '',
          razonSocial: res.razonSocial || '',
          actividadEconomicaPrincipal: res.actividadEconomicaPrincipal || '',
          tipoContribuyente: res.tipoContribuyente || '',
          regimen: res.regimen || '',
          categoria: res.categoria || '',
          obligadoLlevarContabilidad: res.obligadoLlevarContabilidad || '',
          agenteRetencion: res.agenteRetencion || '',
          contribuyenteEspecial: res.contribuyenteEspecial || '',
          representantesLegales: res.representantesLegales || '',
          email: res.email || '',
          telefono: res.telefono || '',
          address: res.address || ''
        });
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          title: `Error`,
          text: `${err.error.message}`
        });
      }
    })
  }

  onSubmitUpdate(): void {
    if (this.canEdit) {
      if (this.EnterpriseForm.valid) {
        const formData = this.EnterpriseForm.value;
        this.storeService.updateInformationStore(this.id, formData).subscribe({
          next: (res: any) => {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: `Actualización exitosa`,
              text: `${res.message}`,
              showConfirmButton: false,
              timer: 2000
            });

            // Actualizar valores iniciales
            this.initialFormValues = this.EnterpriseForm.value;
            this.isFormChanged = false;
            this.EnterpriseForm.disable(); // Deshabilitar el formulario después de la actualización
            this.canEdit = false; // Deshabilitar el checkbox de edición
            // this.toggleForm({ target: { checked: false } }); // Desmarcar el checkbox de edición
          },
          error: (err) => {
            console.error('Error al actualizar la información de la empresa', err);
            Swal.fire({
              icon: "error",
              title: `${err.statusText}`,
              text: `${err.error.message}`
            });
          },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: `Error`,
          text: `El formulario es inválido o no se encuentra activo para actualizar`,
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: `Error`,
        text: `El formulario no se encuentra activo para actualizar`,
      });
    }
  }

  onSubmit(): void {
    if (this.EnterpriseForm.valid) {
      const formData = this.EnterpriseForm.getRawValue();
      this.storeService.addStore(formData).subscribe({
        next: (res: any) => {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: `Éxito`,
            text: `${res.message}`,
            showConfirmButton: false,
            timer: 2000
          });
        },
        error: (err) => {
          console.error('Error al registrar la información de la empresa', err);
          Swal.fire({
            icon: "error",
            title: `${err.statusText}`,
            text: `${err.error.message}`
          });
        },
      });
    } else {
      console.log('Formulario inválido', this.EnterpriseForm.errors);
      Swal.fire({
        icon: "error",
        title: `Error`,
        text: `El formulario es inválido`,
      });
    }
  }


  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Vista previa de la imagen seleccionada
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.EnterpriseForm.patchValue({ logoURL: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  uploadLogo() {
    const enterpriseId = this.id;
    if (this.selectedFile) {
      this.isUploading = true;
      this.uploadProgress = 0;

      this.storeService.uploadLogo(enterpriseId, this.selectedFile).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            // Calcular el progreso
            this.uploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
          } else if (event.type === HttpEventType.Response) {
            // La carga finalizó
            this.isUploading = false;
            this.EnterpriseForm.patchValue({ logoURL: event.body.logoURL });
            alert('Logo subido correctamente.');
          }
        },
        error: (err) => {
          console.error('Error al subir el logo:', err);
          this.isUploading = false;
          Swal.fire({
            icon: "error",
            title: `${err.statusText}`,
            text: `${err.error.message}`
          });
        },
      });
    } else {
      Swal.fire({
        position: "top-end",
        icon: "error",
        text: `Por favor selecciona una imagen.`,
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  toggleForm(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.canEdit = isChecked;

    if (this.canEdit) {
      this.EnterpriseForm.enable();
      this.alertsService.showInfo('Formulario habilitado para editar', 'Formulario habilitado');
    } else {
      this.EnterpriseForm.disable();
    }
  }

}
