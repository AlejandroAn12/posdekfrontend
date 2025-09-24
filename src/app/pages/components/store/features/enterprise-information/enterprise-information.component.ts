import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { StoreService } from '../../data-access/enterprise.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { FakpiService } from '../../../../../core/services/fakpi.service';

// Interfaces
interface Store {
  id: string;
  razonSocial: string;
  numeroRuc: string;
  email: string;
  telefono: string;
  address: string;
  tipoContribuyente: string;
  regimen: string;
  categoria: string;
  obligadoLlevarContabilidad: string;
  agenteRetencion: string;
  contribuyenteEspecial: string;
  representantesLegales: string;
  actividadEconomicaPrincipal: string;
  avatarUrl?: string;
}
@Component({
  selector: 'app-enterprise-information',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './enterprise-information.component.html',
  styleUrl: './enterprise-information.component.css'
})
export default class EnterpriseInformationComponent {
  // Inyecciones de servicios
  private storeService = inject(StoreService);
  private fakpiService = inject(FakpiService);
  private fb = inject(FormBuilder);

  // Referencias del template
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Variables del componente
  store: Store | null = null;
  titleComponent: string = 'Información de tienda';
  canEdit: boolean = false;
  isFormChanged: boolean = false;
  isUploading: boolean = false;
  uploadProgress: number = 0;
  selectedFile: File | null = null;
  initialFormValues: any;

  // Formulario
  enterpriseForm: FormGroup;

  constructor() {
    this.enterpriseForm = this.fb.group({
      numeroRuc: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(13)]],
      razonSocial: [{ value: '', disabled: true }, Validators.required],
      tipoContribuyente: [{ value: '', disabled: true }],
      regimen: [{ value: '', disabled: true }],
      categoria: [{ value: '', disabled: true }],
      obligadoLlevarContabilidad: [{ value: '', disabled: true }],
      agenteRetencion: [{ value: '', disabled: true }],
      contribuyenteEspecial: [{ value: '', disabled: true }],
      representantesLegales: [{ value: '', disabled: true }],
      actividadEconomicaPrincipal: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, [Validators.email]],
      telefono: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.getInformationStore();
    this.setupFormListeners();
  }

  // Configurar listeners del formulario
  setupFormListeners(): void {
    this.enterpriseForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
  }

  // Obtener información de la tienda
  getInformationStore(): void {
    this.storeService.getInformationStore().subscribe({
      next: (res: any) => {
        this.store = res;
        this.patchFormValues(res);
        this.initialFormValues = this.enterpriseForm.value;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error.message || 'Error al obtener la información',
          showConfirmButton: false,
          timer: 4000,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });
      }
    });
  }

  // Poblar el formulario con valores
  patchFormValues(data: Store): void {
    this.enterpriseForm.patchValue({
      numeroRuc: data.numeroRuc || '',
      razonSocial: data.razonSocial || '',
      tipoContribuyente: data.tipoContribuyente || '',
      regimen: data.regimen || '',
      categoria: data.categoria || '',
      obligadoLlevarContabilidad: data.obligadoLlevarContabilidad || '',
      agenteRetencion: data.agenteRetencion || '',
      contribuyenteEspecial: data.contribuyenteEspecial || '',
      representantesLegales: data.representantesLegales || '',
      actividadEconomicaPrincipal: data.actividadEconomicaPrincipal || '',
      email: data.email || '',
      telefono: data.telefono || '',
      address: data.address || ''
    });
  }

  // Habilitar edición
  enableEditing(): void {
    this.canEdit = true;
    this.enterpriseForm.enable();
    Swal.fire({
      icon: 'info',
      title: 'Modo edición',
      text: 'Puedes editar la información de la tienda',
      showConfirmButton: false,
      timer: 4000,
      toast: true,
      position: 'top-end',
      timerProgressBar: true
    });
  }

  // Cancelar edición
  cancelEditing(): void {
    this.canEdit = false;
    this.enterpriseForm.disable();
    this.enterpriseForm.patchValue(this.initialFormValues);
    this.isFormChanged = false;
    this.selectedFile = null;
  }

  // Verificar cambios en el formulario
  checkFormChanges(): void {
    this.isFormChanged = JSON.stringify(this.enterpriseForm.value) !== JSON.stringify(this.initialFormValues);
  }

  // Buscar información por RUC
  buscarRuc(): void {
    const ruc = this.enterpriseForm.get('numeroRuc')?.value;

    if (!ruc || ruc.length < 13) {
      Swal.fire({
        icon: 'warning',
        title: 'RUC inválido',
        text: 'Debe ingresar un RUC válido de 13 dígitos',
        showConfirmButton: false,
        timer: 4000,
        toast: true,
        position: 'top-end',
        timerProgressBar: true
      });
      return;
    }

    Swal.fire({
      title: 'Buscando información',
      text: 'Consultando información del RUC en el SRI...',
      allowOutsideClick: false,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.fakpiService.serviceRuc(ruc).subscribe({
      next: (res) => {
        Swal.close();
        this.cargarDatosDesdeSri(res.data);
        Swal.fire({
          icon: 'success',
          text: 'Datos del RUC cargados correctamente',
          showConfirmButton: false,
          timer: 4000,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });
      },
      error: (err) => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          text: err.error.message || 'Error consultando el RUC',
          showConfirmButton: false,
          timer: 4000,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });
      }
    });
  }

  // Cargar datos desde el SRI
  cargarDatosDesdeSri(data: any): void {
    if (!data || !Array.isArray(data) || data.length === 0) return;

    const contribuyente = data[0];
    const representantesLegales = Array.isArray(contribuyente.representantesLegales)
      ? contribuyente.representantesLegales
        .map((r: any) => `${r.nombre} (${r.identificacion})`)
        .join(' - ')
      : '';

    this.enterpriseForm.patchValue({
      razonSocial: contribuyente.razonSocial || '',
      actividadEconomicaPrincipal: contribuyente.actividadEconomicaPrincipal || '',
      tipoContribuyente: contribuyente.tipoContribuyente || '',
      regimen: contribuyente.regimen || '',
      categoria: contribuyente.categoria || '',
      obligadoLlevarContabilidad: contribuyente.obligadoLlevarContabilidad || '',
      agenteRetencion: contribuyente.agenteRetencion || '',
      contribuyenteEspecial: contribuyente.contribuyenteEspecial || '',
      representantesLegales: representantesLegales
    });
  }

  // Actualizar información
  onSubmitUpdate(): void {
    if (this.enterpriseForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor complete todos los campos requeridos',
        showConfirmButton: false,
        timer: 4000,
        toast: true,
        position: 'top-end',
        timerProgressBar: true
      });
      return;
    }

    Swal.fire({
      title: '¿Actualizar información?',
      text: 'Se actualizará la información de la tienda',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateStoreInformation();
      }
    });
  }

  // Actualizar información de la tienda
  updateStoreInformation(): void {
    const formData = this.enterpriseForm.value;

    this.storeService.updateInformationStore(this.store!.id, formData).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Información actualizada',
          text: res.message || 'Actualización de información exitosa',
          showConfirmButton: false,
          timer: 4000,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });
        this.initialFormValues = this.enterpriseForm.value;
        this.isFormChanged = false;
        this.canEdit = false;
        this.enterpriseForm.disable();

        // Actualizar la información local
        this.store = { ...this.store!, ...formData };
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          text: err.error.message || 'Error actualizando información',
          showConfirmButton: false,
          timer: 4000,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });
      }
    });
  }

  // Manejar cambio de archivo
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo inválido',
          text: 'Solo se permiten imágenes',
          showConfirmButton: false,
          timer: 4000,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo muy grande',
          text: 'El tamaño máximo permitido es 5MB',
          showConfirmButton: false,
          timer: 4000,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });
        return;
      }

      this.selectedFile = file;
      this.uploadLogo();
    }
  }

  // Disparar input de archivo
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Subir logo
  uploadLogo(): void {
    if (!this.selectedFile || !this.store) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.storeService.uploadLogo(this.store.id, this.selectedFile).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((100 * event.loaded) / (event.total || 1));
        } else if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          this.store!.avatarUrl = event.body.logoURL;
          Swal.fire({
            icon: 'success',
            title: 'Logo actualizado',
            text: 'El logo se ha subido correctamente',
            showConfirmButton: false,
            timer: 4000,
            toast: true,
            position: 'top-end',
            timerProgressBar: true
          });
        }
      },
      error: (err) => {
        this.isUploading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al subir logo',
          text: err.error?.message || 'El logo se no ha subido',
          showConfirmButton: false,
          timer: 4000,
          toast: true,
          position: 'top-end',
          timerProgressBar: true
        });
      }
    });
  }

}
