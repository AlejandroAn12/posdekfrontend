import { Component, inject } from '@angular/core';
import { ProductsService } from '../../data-access/products.service';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, FormControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import pdfMake, { tableLayouts } from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { HeaderComponent } from "../../../../../shared/features/header/header.component";
import Swal from 'sweetalert2';
import { MovementTypeService } from '../../../../../core/services/movement-type.service';
(pdfMake as any).vfs = pdfFonts.vfs;

@Component({
  selector: 'app-movements-products',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './movements-products.component.html',
  styleUrl: './movements-products.component.css'
})

export default class MovementsProductsComponent {

  titleComponent = 'Gestión de productos';
  subtitleComponent = 'Movimientos de productos';

  productService = inject(ProductsService);
  movementTypeService = inject(MovementTypeService);
  private fb = inject(FormBuilder);

  filtroForm = this.fb.group({
    product: [''],
    movementType: [''],
    fromDate: [''],
    toDate: ['']
  });

  isLoading: boolean = false;
  movimientos: any[] = [];
  movementTypes: any[] = [];
  totalRegistros = 0;
  paginaActual = 1;
  limitePorPagina = 10;
  totalPaginas = 1;

  constructor(){
    this.getAllMovementTypes();
    this.buscarMovimientos();
  }

  buscarMovimientos() {
    const filtros = {
      product: this.filtroForm.value.product || undefined,
      movementType: this.filtroForm.value.movementType || undefined,
      fromDate: this.filtroForm.value.fromDate || undefined,
      toDate: this.filtroForm.value.toDate || undefined,
      page: this.paginaActual,
      limit: this.limitePorPagina,
    };
    this.isLoading = true;
    this.productService.movementProductsUp(filtros).subscribe({
      next: (res) => {
        this.movimientos = res.data;
        this.totalRegistros = res.total;
        this.totalPaginas = res.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: err.error.message
        });
        this.movimientos = [];
        this.isLoading = false;
      }
    })
  }

  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.buscarMovimientos();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.buscarMovimientos();
    }
  }

  getAllMovementTypes() {
      this.movementTypeService.getAllMovementType().subscribe({
        next: (response) => {
          this.movementTypes = response.movementTypes;
        },
        error: (error) => {
          console.error('Error al obtener tipos de movimiento:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los tipos de movimiento. Inténtalo de nuevo más tarde.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      })
    }


  exportToPDF() {
    const body = [
      [
        'Código de barra',
        'Producto',
        'Cantidad',
        'Tipo',
        'Fecha',
        'Generado por',
      ],
      ...this.movimientos.map((item) => [
        item.product?.barcode,
        item.product?.name,
        item.quantity,
        item.Movement_type?.name,
        new Date(item.createdAt).toLocaleString(),
        `${item.user?.employee?.name} ${item.user?.employee?.surname}`,
      ]),
    ];

    const docDefinition = {
      content: [
        { text: 'Reporte de Movimientos', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body,
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number],
        },
      },
    };

    pdfMake.createPdf(docDefinition).open(); // o .download('reporte.pdf');
  }


  exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(
      this.movimientos.map((item) => ({
        'Código de barra': item.product?.barcode,
        Producto: item.product?.name,
        Cantidad: item.quantity,
        Tipo: item.Movement_type?.name,
        Fecha: new Date(item.createdAt).toLocaleString(),
        'Generado por': `${item.user?.employee?.name} ${item.user?.employee?.surname}`,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'reporte_movimientos.xlsx');
  }

}
