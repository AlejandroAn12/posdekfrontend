import { Component, inject } from '@angular/core';
import { CajasService } from '../../services/cajas.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-caja',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-caja.component.html',
  styleUrl: './form-caja.component.css'
})
export default class FormCajaComponent {

  private service = inject(CajasService);
  constructor() {
    this.cajas$;
    this.asignaciones$;
  }
  data: any[] = [];
  dataAsignaciones: any[] = [];
  totalRegistros: number = 0;
  totalRegistrosAsig: number = 0;


  cajas$ = this.service.getAllCajas().subscribe({
    next: (res: any) => {
      this.data = res.results;
      this.totalRegistros = res.count;
    },
    error: (err) => {
      console.error('Error fetching cajas', err);
    }
  })

  asignaciones$ = this.service.obtenerAsignaciones().subscribe({
    next: (res: any) => {
      this.dataAsignaciones = res.results;
      this.totalRegistrosAsig = res.count;
    },
    error: (err) => {
      console.error('Error fetching asignaciones', err);
    }
  })
}
