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
    this.aperturas$;
  }
  data_cajas: any[] = [];
  data_aperturas: any[] = [];
  totalRegistros: number = 0;
  totalRegistrosAsig: number = 0;
  isLoading : boolean = false;


  cajas$ = this.service.getAllCajas().subscribe({
    next: (res: any) => {
      this.data_cajas = res;
      this.totalRegistros = res.length;
    },
    error: (err) => {
      console.error('Error fetching cajas', err);
    }
  })

  aperturas$ = this.service.obtenerAsignaciones().subscribe({
    next: (res: any) => {
      console.log(res)
      this.isLoading = true;
      this.data_aperturas = res;
      this.totalRegistrosAsig = res.length;
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error fetching asignaciones', err);
    }
  })
}
