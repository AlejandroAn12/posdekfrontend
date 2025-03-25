import { Component, inject } from '@angular/core';
import { EnterpriseService } from '../../data-access/enterprise.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-enterprise-information',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './enterprise-information.component.html',
  styleUrl: './enterprise-information.component.css'
})
export default class EnterpriseInformationComponent {

  private enterpriseService = inject(EnterpriseService);
  private fb = inject(FormBuilder);
  private id: string = '';

  //Formulario
  EnterpriseForm: FormGroup;
  isDisabled: boolean = true;
  isFormChanged = false;
  initialFormValues: any;
  selectedFile!: File | null;
  uploadProgress = 0; // Progreso de la carga (0-100)
  isUploading = false; // Indicador de subida en curso

  constructor() {
    this.EnterpriseForm = this.fb.group({
      name: [{ value: '', disabled: this.isDisabled }],
      company_name: [{ value: '', disabled: this.isDisabled }],
      logoURL: [''],
      ruc: [{ value: '', disabled: this.isDisabled }],
      legal_representative: [{ value: '', disabled: this.isDisabled }],
      address: [{ value: '', disabled: this.isDisabled }],
      phone: [{ value: '', disabled: this.isDisabled }],
      email: [{ value: '', disabled: this.isDisabled }],
      country: [{ value: '', disabled: this.isDisabled }],
      city: [{ value: '', disabled: this.isDisabled }],
    });

    //Cargas
    this.getInformationEnterprise();

    // Guardar valores iniciales
    this.initialFormValues = this.EnterpriseForm.value;

    // Detectar cambios
    this.EnterpriseForm.valueChanges.subscribe(() => {
      this.isFormChanged = !this.compareFormValues();
    });
  }

  compareFormValues(): boolean {
    return JSON.stringify(this.EnterpriseForm.value) === JSON.stringify(this.initialFormValues);
  }

  getInformationEnterprise() {
    this.enterpriseService.getInformationEnterprise().subscribe({
      next: (res) => {
        this.id = res.data.id;
        this.EnterpriseForm.patchValue({
          name: res.data.name,
          company_name: res.data.company_name,
          logoURL: res.data.logoURL,
          ruc: res.data.ruc,
          legal_representative: res.data.legal_representative,
          address: res.data.address,
          phone: res.data.phone,
          email: res.data.email,
          country: res.data.country,
          city: res.data.city,
        });
      },
      error: (err) => {
        // console.error('Error al cargar la información de la empresa', err);
        Swal.fire({
          icon: "error",
          title: `${err.statusText}`,
          text: `${err.error.message}`
        });
      }
    })
  }

  onSubmit(): void {
    if (this.EnterpriseForm.valid) {
      const formData = this.EnterpriseForm.value;
      this.enterpriseService.updateInformationEnterprise(this.id, formData).subscribe({
        next: (res: any) => {
          Swal.fire({
            position: "top-end",
            icon: "success",
            text: `${res.message}`,
            showConfirmButton: false,
            timer: 1500
          });

          // Actualizar valores iniciales
          this.initialFormValues = this.EnterpriseForm.value;
          this.isFormChanged = false;
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
        title: `Formulario inválido`,
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

      this.enterpriseService.uploadLogo(enterpriseId, this.selectedFile).subscribe({
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
}
