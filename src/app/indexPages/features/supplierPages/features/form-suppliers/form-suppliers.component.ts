import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuppliersService } from '../../data-access/suppliers.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../shared/services/alerts.service';
import { TypeOfDocumentService } from '../../../../../shared/services/type-of-document.service';

@Component({
  selector: 'app-form-suppliers',
  imports: [CommonModule, ReactiveFormsModule],
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
  SupplierForm: FormGroup;
  supplierId: string | null = null;
  tyOfDocuments: any[] = [];


  isUpdate: boolean = false;


  constructor() {
    this.SupplierForm = this.fb.group({
      typeofdocumentId: [null], // Debe ser un ID, no un objeto completo
      ruc: ['', { validators: [Validators.required], updateOn: 'change' }],
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
        this.tyOfDocuments = response.typeOfDocuments;
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
        this.SupplierForm.patchValue({
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
    if (this.SupplierForm.invalid) {
      this.alertsService.showError('Formulario vacío', '');
      return;
    }

    const supplierData = this.SupplierForm.value;

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
}
