import { Component, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { ProductsService } from '../../data-access/products.service';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../interface/product.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICategory } from '../../../categoriesPages/interface/icategories.interface';
import { CategoriesService } from '../../../categoriesPages/data-access/categories.service';
import { AlertService } from '../../../../../core/services/alerts.service';
import { SuppliersService } from '../../../supplierPages/data-access/suppliers.service';
import { ISupplier } from '../../../supplierPages/interface/supplier.interface';
import { DataTableDirective, DataTablesModule } from 'angular-datatables';
import { Config } from 'datatables.net';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductReportService } from '../../data-access/reports.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-products',
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],
  templateUrl: './view-products.component.html',
  styleUrl: './view-products.component.css'
})

export default class ViewProductsComponent implements OnInit {


  private router = inject(Router);
  private renderer = inject(Renderer2);
  private productService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private supplierService = inject(SuppliersService);
  private alertsService = inject(AlertService);
  private reportProductsPdf = inject(ProductReportService);

  dtOptions: Config = {};
  private fb = inject(FormBuilder);
  ProductForm: FormGroup;

  showModal = false;
  titleModal: string = 'Nuevo Producto';
  isEditing = false;
  isDisabled: boolean = true;
  product: any = [];
  productsSignal = signal<IProduct[]>([]);
  categories: ICategory[] = [];
  suppliers: ISupplier[] = [];
  selectedProductId: string | null = null;

  errorMessage: string = '';



  constructor() {
    this.ProductForm = this.fb.group({
      name: ['', Validators.required],
      barcode: ['', Validators.required],
      code: [{ value: '', disabled: this.isDisabled }],
      stock: [0, Validators.required],
      purchasePrice: [0, Validators.required],
      salePrice: [0, Validators.required],
      supplierId: ['', Validators.required],
      categoryId: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadSuppliers();
    this.loadTable();
  }

  //Cargar DataTable
  loadTable() {
    this.dtOptions = {

      ajax: (dataTablesParameters: any, callback) => {
        this.productService.getProducts().subscribe((resp: any) => {
          callback({
            data: resp.products
          });
        }, (error) => {
          return null;
        });
      },
      scrollX: true,
      language: {
        emptyTable: this.errorMessage || "No hay información disponible",
        loadingRecords: "Cargando datos...", // Este mensaje desaparece si `data` es vacío
        zeroRecords: "No se encontraron resultados",
        search: "Buscar:",
        lengthMenu: "",
        info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
        paginate: {
          next: "Siguiente",
          previous: "Anterior"
        },
      },
      lengthMenu: [10], // Cambia la cantidad de registros por página
      columns: [
        // { title: 'ID', data: 'id' },
        { title: 'Cód. de barra', data: 'barcode', className: 'text-sm text-gray-500' },
        { title: 'Cód. interno', data: 'code', className: 'text-sm text-gray-500' },
        { title: 'Artículo/Servicio', data: 'name', className: 'text-sm text-gray-500' },

        {
          title: 'Precio compra', data: 'purchasePrice', className: 'text-sm text-gray-500',
          render: (data: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(data);
          }
        },
        {
          title: 'Precio venta', data: 'salePrice', className: 'text-sm text-gray-500',
          render: (data: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(data);
          }
        },
        {
          title: 'Precio venta | Impuesto', data: 'priceWithTax', className: 'text-sm text-gray-500',
          render: (data: any) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(data);
          }
        },
        { title: 'Unidad de medida', data: 'unitOfMeasurement.name', className: 'text-sm text-gray-500' },
        { title: 'Stock disponible', data: 'stock', className: 'text-sm text-gray-500' },
        { title: 'Stock mínino', data: 'stockMin', className: 'text-sm text-gray-500' },
        { title: 'Categoria', data: 'category.name', className: 'text-sm text-gray-500' },
        { title: 'Proveedor', data: 'supplier.company_name', className: 'text-sm text-gray-500' },
        {
          title: 'Servicio', data: 'itsService',
          render: (data: any, type: any, row: any) => {
            return `
                <input type="checkbox" class="service-toggle rounded cursor-pointer" ${data ? 'checked' : ''} />
            `;
          },
          className: 'text-center text-sm text-gray-500' // Centrar la columna

        },
        {
          title: 'Habilitado para venta',
          data: 'status',
          render: (data: any, type: any, row: any) => {
            return `
                <input type="checkbox" class="status-toggle rounded cursor-pointer" ${data ? 'checked' : ''} />
            `;
          },
          className: 'text-center text-gray-500 text-sm' // Centrar la columna
        },
        { title: 'Fecha de registro', data: 'createdAt', className: 'text-sm text-gray-500' },
        {
          title: 'Acciones',
          data: null,
          render: (data: any, type: any, row: any) => {
            return `
            <div>

                   <button class="btn-update bg-blue-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                        <i class="fa-solid fa-pen-to-square mr-1"></i>
                        Editar
                </button>

                <button class="btn-delete bg-red-600 text-white pl-2 pr-2 font-semibold text-sm rounded-md pt-1 pb-1" data-order-id="${row.id}">
                        <i class="fa-solid fa-trash mr-1"></i>
                        Eliminar
                </button>

            </div>`;
          },
          className: 'action-column text-sm text-gray-500'
        }
      ],
      rowCallback: (row: Node, data: any, index: number) => {
        // Cast row to HTMLElement to access querySelector
        const rowElement = row as HTMLElement;

        //Metodo para actulizar el estado del producto
        const checkbox = rowElement.querySelector('.status-toggle') as HTMLInputElement;
        if (checkbox) {
          this.renderer.listen(checkbox, 'change', (event) => {
            this.onStatusChange(event, data);
          });
        }

        //Metodo para actualizar el estado del producto
        const checkboxService = rowElement.querySelector('.service-toggle') as HTMLInputElement;
        if (checkboxService) {
          this.renderer.listen(checkboxService, 'change', (event) => {
            this.onItsServiceChange(event, data);
          });
        }

        //Eliminar
        const btnDelete = rowElement.querySelector('.btn-delete') as HTMLInputElement;
        if (btnDelete) {
          this.renderer.listen(btnDelete, 'click', () => {
            this.deleteProduct(data.id);
          });
        }

        //Actualizar
        const btnUpdate = rowElement.querySelector('.btn-update') as HTMLInputElement;
        if (btnUpdate) {
          this.renderer.listen(btnUpdate, 'click', () => {
            this.editProduct(data.id);
          });
        }
        return row;
      }
    };
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

  //Eliminar
  deleteProduct(id: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
      title: "Quieres eliminar este registro?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deletedProduct(id).subscribe({
          next: (res: any) => {
            swalWithBootstrapButtons.fire({
              title: "Eliminado",
              text: "El registro ha sido eliminado",
              icon: "success"
            });
          },
          error: (err) => {
            this.alertsService.showError(`${err.error.message}`, `${err.statusText}`);
          },
        });

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelado",
          icon: "error"
        });
      }
    });


  }

  //Toggle para actualizar el estado del producto (ACTIVO : INACTIVO)
  onStatusChange(event: Event, product: any): void {
    const checkbox = event.target as HTMLInputElement;
    product.status = checkbox.checked;

    this.updateProductStatus(product);
  }

  updateProductStatus(product: any): void {
    this.productService.updateProductStatus(product.id, product.status).subscribe({
      next: (response: any) => this.alertsService.showSuccess(`${response.message}`, ``),
      error: (err) => this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
    });
  }

  onItsServiceChange(event: Event, product: any): void {
    const checkboxService = event.target as HTMLInputElement;
    product.its_service = checkboxService.checked;

    this.updateProductServices(product);
  }

  updateProductServices(product: any): void {
    this.productService.updateProductService(product.id, product.its_service).subscribe({
      next: (response: any) => { this.alertsService.showSuccess(`${response.message}`, ``) },
      error: (err) => this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
    });
  }

  //Metodo para agregar o actualizar
  saveProduct() {
    if (this.isEditing && this.selectedProductId) {
      this.updateProduct(this.selectedProductId);
    } else {
      this.addProduct();
    }
  }

  editProduct(productId: string) {
    this.router.navigate(['/index/products/form'], { queryParams: { form: 'update', id: productId } });
  }

  addProduct() {
    const newProduct = this.ProductForm.value;

    this.productService.addProduct(newProduct).subscribe({
      next: (response) => {
        this.alertsService.showSuccess(`${response.message}`, ``)
        this.refreshTable();
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      },
    });
    this.ProductForm.reset();
  }

  updateProduct(id: string) {
    const updatedProduct = this.ProductForm.value;

    this.productService.updateProduct(id, updatedProduct).subscribe({
      next: (response: any) => {
        this.alertsService.showSuccess(`${response.message}`, ``)
        this.refreshTable();
      },
      error: (err) => {
        console.error(err);
        this.alertsService.showError(`${err.error.message}`, `${err.statusText}`)
      },
    });
    this.showModal = false;

  }

  toggleModal(product: any = null) {
    console.log(product)
    this.showModal = !this.showModal;

    if (product) {
      this.isEditing = true;
      this.titleModal = 'Editar producto';
      this.selectedProductId = product.id;

      this.ProductForm.patchValue({
        name: product.name,
        code: product.code,
        barcode: product.barcode,
        stock: product.stock,
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        description: product.description,
        categoryId: product.category.id,
        supplierId: product.supplier.id
      });
    } else {
      this.isEditing = false;
      this.titleModal = 'Añadir nuevo producto';
      this.selectedProductId = null;
      this.ProductForm.reset();
    }
  }


  downloadAllProductsPdf() {
    const date = Date.now();
    this.reportProductsPdf.downloadAllProductReportPdf().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_productos_${date}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.alertsService.showError(`${err.error.message}`, `Error`)
      }
    })
  }

  downloadExcel() {
    this.alertsService.showInfo('Metodo aun no implementado', 'Información')
  }



  //Renderizado del datatables
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtTrigger: Subject<any> = new Subject<any>();

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  //Metodo para refrescar la tabla
  refreshTable(): void {
    if (this.dtElement) {
      this.dtElement.dtInstance.then((dtInstance: any) => {
        dtInstance.ajax.reload();
      });
    }
  }

  routeToNewProduct() {
    this.router.navigateByUrl('index/products/form');
  }


}
