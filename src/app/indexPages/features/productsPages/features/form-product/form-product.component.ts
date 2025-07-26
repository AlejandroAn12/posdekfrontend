import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../data-access/products.service';
import { CategoriesService } from '../../../categoriesPages/data-access/categories.service';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICategory } from '../../../categoriesPages/interface/icategories.interface';
import { ISupplier } from '../../../supplierPages/interface/supplier.interface';
import { AlertService } from '../../../../../core/services/alerts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitOfMeasurementService } from '../../../../../core/services/unit-of-measurement.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-product',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-product.component.html',
  styleUrl: './form-product.component.css'
})
export default class FormProductComponent implements OnInit {

  private fB = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private alertsService = inject(AlertService);
  private productService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private supplierService = inject(SuppliersService);
  private unitOfMeasurementService = inject(UnitOfMeasurementService);

  isDisabled: boolean = true;
  isEditing = false;
  isUpdate: boolean = false;
  productId: string | null = null;


  form: FormGroup;
  categories: ICategory[] = [];
  suppliers: ISupplier[] = [];
  unitsOfMeasurement: any[] = [];

  constructor() {
    this.form = this.fB.group({
      name: ['', Validators.required],
      barcode: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      code: [{ value: '', disabled: this.isDisabled }],
      addStock: [0, Validators.required],
      purchasePrice: [0, Validators.required],
      salePrice: [0, Validators.required],
      supplierId: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: ['', Validators.required],
      unitOfMeasurementId: ['', Validators.required],
      itsService: [false, Validators.required], // booleano
      date: [new Date().toISOString(), Validators.required],
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const formMode = params['form'];
      this.productId = params['id'] || null;

      if (formMode === 'update' && this.productId) {
        this.isUpdate = true;
        this.loadProductData(this.productId);
      }
    });
    this.loadCategories();
    this.loadSuppliers();
    this.loadUnitOfMeasurement();
  }

  //Cargar categorias
  loadCategories() {
    this.categoriesService.getCategoriesByStatus().subscribe({
      next: (data: any) => {
        this.categories = data.categories;
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      },
    });
  }

  loadUnitOfMeasurement() {
    this.unitOfMeasurementService.getUnits().subscribe({
      next: (resp) => {
        this.unitsOfMeasurement = resp.data;
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      }
    });
  }

  loadProductData(id: string) {
    this.productService.getProductId(id).subscribe({
      next: (product: any) => {
        console.log(product);
        this.form.patchValue({
          ...product,
          supplierId: product.supplier.id ? product.supplier.id.toString() : '',
          categoryId: product.category.id ? product.category.id.toString() : '',
          unitOfMeasurementId: product.unitOfMeasurement.id ? product.unitOfMeasurement.id.toString() : ''
        });
      },
      error: (err) => {
        this.alertsService.showError('Error', 'No se pudo cargar el producto');
      }
    });
  }

  //Cargar proveedores
  loadSuppliers() {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data.suppliers;
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      }
    })
  }

  saveProduct() {
    if (this.form.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, complete todos los campos requeridos.',
      });
      return;
    }

    const formValue = this.form.value;
    const productData = {
      ...formValue,
      purchasePrice: Number(formValue.purchasePrice),
      salePrice: Number(formValue.salePrice),
      addStock: Number(formValue.addStock),
      itsService: Boolean(formValue.itsService),
      date: String(formValue.date),
    };

    if (this.isUpdate && this.productId) {
      // Actualizar producto
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (response: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Producto actualizado',
            text: response.message,
          });
          this.router.navigate(['/index/products/view']);
        },
        error: (err) => {
          this.alertsService.showError(err.error.message, err.statusText);
        }
      });
    } else {
      // Crear producto
      this.productService.addProduct(productData).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Producto creado',
            timer: 4000,
            showConfirmButton: false
          });
          this.router.navigate(['/index/products/view']);
        },
        error: (err) => {
          console.error(err.error.message);
          // this.alertsService.showError(err.error.message, err.statusText);
          Swal.fire({
            icon: "error",
            title: "Error al crear el producto",
            text:"Por favor, verifique los datos ingresados, si el incoveniente persiste informe a nuestro equipo de soporte.",
            confirmButtonText:"Entendido"
          })
        }
      });
    }
  }

  btnBack() {
    this.router.navigate(['/index/products/view']);
  }

  get f() {
    return this.form.controls;
  }
}
