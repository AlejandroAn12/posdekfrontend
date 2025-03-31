import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../data-access/products.service';
import { CategoriesService } from '../../../categoriesPages/data-access/categories.service';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICategory } from '../../../categoriesPages/interface/icategories.interface';
import { ISupplier } from '../../../supplierPages/interface/supplier.interface';
import { AlertService } from '../../../../../shared/services/alerts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitOfMeasurementService } from '../../../../../shared/services/unit-of-measurement.service';

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


  ProductForm: FormGroup;
  categories: ICategory[] = [];
  suppliers: ISupplier[] = [];
  unitsOfMeasurement: any[] = [];

  constructor() {
    this.ProductForm = this.fB.group({
      name: ['', Validators.required],
      barcode: ['', Validators.required],
      code: [{ value: '', disabled: this.isDisabled }],
      stock: [0,Validators.required],
      purchase_price: ['',Validators.required],
      sale_price: ['', Validators.required],
      supplierId: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: ['', Validators.required],
      unitOfmeasurementId: ['', Validators.required]
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
        this.ProductForm.patchValue({
          ...product,
          supplierId: product.supplier.id ? product.supplier.id.toString() : '', 
          categoryId: product.category.id ? product.category.id.toString() : '',
          unitOfmeasurementId: product.unitOfMeasurement.id ? product.unitOfMeasurement.id.toString() : ''
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
    if (this.ProductForm.invalid) {
      this.alertsService.showError('Formulario vacío', '');
      return;
    }

    const productData = this.ProductForm.value;

    if (this.isUpdate && this.productId) {
      // Actualizar producto
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (response: any) => {
          this.alertsService.showSuccess(response.message, '');
          this.router.navigate(['/index/products/view']);
        },
        error: (err) => {
          this.alertsService.showError(err.error.message, err.statusText);
        }
      });
    } else {
      // Crear producto
      this.productService.addProduct(productData).subscribe({
        next: (response) => {
          this.alertsService.showSuccess(response.message, '');
          this.router.navigate(['/index/products/view']);
        },
        error: (err) => {
          this.alertsService.showError(err.error.message, err.statusText);
        }
      });
    }
  }

  btnBack() {
    this.router.navigate(['/index/products/view']);
  }
  // saveProduct() {

  //   if(this.ProductForm.invalid) {
  //     this.alertsService.showError('Error', 'Formulario invalido');
  //   }
  //   const newProduct = this.ProductForm.value;

  //   this.productService.addProduct(newProduct).subscribe({
  //     next: (response) => {
  //       this.alertsService.showSuccess(`${response.message}`, ``)
  //     },
  //     error: (err) => {
  //       this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
  //     },
  //   });
  //   this.ProductForm.reset();
  // }


}
