import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuppliersService } from '../../data-access/suppliers.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../core/services/alerts.service';
import { TypeOfDocumentService } from '../../../../../core/services/type-of-document.service';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";

@Component({
  selector: 'app-form-suppliers',
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './form-suppliers.component.html',
  styleUrl: './form-suppliers.component.css'
})
export default class FormSuppliersComponent {

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private alertsService = inject(AlertService);
  private supplierService = inject(SuppliersService);
  private typeOfDocumentService = inject(TypeOfDocumentService);

  //Declaración de variables
  form: FormGroup;
  supplierId: string | null = null;
  tyOfDocs: any[] = [];

  titleComponent: string = 'Gestión de Proveedores';


  isUpdate: boolean = false;


  constructor() {
    this.form = this.fb.group({
      typeofdocumentId: ['', [Validators.required]], // Debe ser un ID, no un objeto completo
      ruc: ['', { validators: [Validators.required, Validators.pattern('^[0-9]{13}$')], updateOn: 'change' }],
      company_name: ['', { validators: [Validators.required], updateOn: 'change' }],
      legal_representative: ['', { validators: [Validators.required], updateOn: 'change' }],
      phone: ['', { validators: [Validators.required], updateOn: 'change' }],
      email: ['', { validators: [Validators.required], updateOn: 'change' }],
      country: ['', { validators: [Validators.required], updateOn: 'change' }],
      city: ['', { validators: [Validators.required], updateOn: 'change' }],
      address: ['', { validators: [Validators.required], updateOn: 'change' }]
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const formMode = params['form'];
      this.supplierId = params['id'] || null;

      if (formMode === 'update' && this.supplierId) {
        this.isUpdate = true;
        this.loadSupplierData(this.supplierId);
      }
    });

    this.loadTypeOfDocuments();
  }



  loadTypeOfDocuments() {
    this.typeOfDocumentService.getTypeOfDocuments().subscribe({
      next: (response: any) => {
        this.tyOfDocs = response.typeOfDocuments;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  loadSupplierData(id: string) {
    this.supplierService.getSupplierId(id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.form.patchValue({
          typeofdocumentId: response.supplier.typeofdocumentId?.id ?? response.supplier.typeofdocumentId, // Asegúrate de asignar solo el ID
          ruc: response.supplier.ruc,
          company_name: response.supplier.company_name,
          legal_representative: response.supplier.legal_representative,
          phone: response.supplier.phone,
          email: response.supplier.email,
          country: response.supplier.country,
          city: response.supplier.city,
          address: response.supplier.address
        });
      },
      error: (err) => {
        this.alertsService.showError(err.error.message, err.statusText);
      }
    });
  }


  saveSupplier() {
    if (this.form.invalid) {
      this.alertsService.showError('Formulario vacío', '');
      return;
    }

    const supplierData = this.form.value;

    if (this.isUpdate && this.supplierId) {
      // Actualizar producto
      this.supplierService.updateSupplier(this.supplierId, supplierData).subscribe({
        next: (response: any) => {
          this.alertsService.showSuccess(response.message, '');
          this.router.navigate(['/index/suppliers/view']);
        },
        error: (err) => {
          this.alertsService.showError(err.error.message, err.statusText);
        }
      });
    } else {
      // Crear producto
      this.supplierService.addSupplier(supplierData).subscribe({
        next: (response) => {
          this.alertsService.showSuccess(response.message, '');
          this.router.navigate(['/index/suppliers/view']);
        },
        error: (err) => {
          this.alertsService.showError(err.error.message, err.statusText);
        }
      });
    }
  }

  btnBack() {
    this.router.navigate(['/index/suppliers/view']);
  }

  get f() {
    return this.form.controls;
  }
}
