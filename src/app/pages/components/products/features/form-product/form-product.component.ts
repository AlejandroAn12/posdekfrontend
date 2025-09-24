import { Component, inject, OnInit } from '@angular/core';
import { ProductsService } from '../../data-access/products.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../core/services/alerts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitOfMeasurementService } from '../../../../../core/services/unit-of-measurement.service';
import Swal from 'sweetalert2';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import { CategoriesService } from '../../../categories/data-access/categories.service';
import { ICategory } from '../../../categories/interface/icategories.interface';
import { SuppliersService } from '../../../suppliers/data-access/suppliers.service';
import { ISupplier } from '../../../suppliers/interface/supplier.interface';

@Component({
  selector: 'app-form-product',
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
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

  titleComponent: string = 'Gestion de productos';
  subtitleComponent: string = 'Listado de productos registrados';


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
        Swal.fire({
          icon: "error",
          text: err.error.message || 'Error',
          toast: true,
          timer: 4000,
          position: 'top',
          showConfirmButton: false
        });
      },
    });
  }

  loadUnitOfMeasurement() {
    this.unitOfMeasurementService.getUnits().subscribe({
      next: (resp) => {
        this.unitsOfMeasurement = resp.data;
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          text: err.error.message || 'Error',
          toast: true,
          timer: 4000,
          position: 'top',
          showConfirmButton: false
        });
      }
    });
  }

  loadProductData(id: string) {
    this.productService.getProductId(id).subscribe({
      next: (product: any) => {

        this.form.patchValue({
          ...product,
          supplierId: product.supplier.id ? product.supplier.id.toString() : '',
          categoryId: product.category.id ? product.category.id.toString() : '',
          unitOfMeasurementId: product.unitOfMeasurement.id ? product.unitOfMeasurement.id.toString() : ''
        });
      },
      error: (err) => {
        Swal.fire({
          icon: "error",
          text: err.error.message || 'Error',
          toast: true,
          timer: 4000,
          position: 'top',
          showConfirmButton: false
        });
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
        Swal.fire({
          icon: "error",
          text: err.error.message || 'Error',
          toast: true,
          timer: 4000,
          position: 'top',
          showConfirmButton: false
        });
      }
    })
  }

  saveProduct() {
    if (this.form.invalid) {
      Swal.fire({
        icon: "warning",
        text: 'Formulario incompleto',
        toast: true,
        timer: 4000,
        position: 'top',
        showConfirmButton: false
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
            icon: "success",
            text: response.message || 'Información actualizada',
            toast: true,
            timer: 4000,
            timerProgressBar: true,
            position: 'top',
            showConfirmButton: false
          });
          this.router.navigate(['/admin/products/view']);
        },
        error: (err) => {
          Swal.fire({
            icon: "error",
            text: err.error.message || 'Error',
            toast: true,
            timer: 4000,
            timerProgressBar: true,
            position: 'top',
            showConfirmButton: false
          });
        }
      });
    } else {
      // Crear producto
      this.productService.addProduct(productData).subscribe({
        next: () => {
          Swal.fire({
            icon: "success",
            text: 'Producto ingresado correctamente',
            toast: true,
            timer: 4000,
            timerProgressBar: true,
            position: 'top',
            showConfirmButton: false
          });
          this.router.navigate(['/admin/products/view']);
        },
        error: (err) => {
          Swal.fire({
            icon: "error",
            text: err.error.message || 'Error al ingresar el producto',
            toast: true,
            timer: 4000,
            timerProgressBar: true,
            position: 'top',
            showConfirmButton: false
          });
        }
      });
    }
  }

  btnBack() {
    this.router.navigate(['/admin/products/view']);
  }

  get f() {
    return this.form.controls;
  }
}
