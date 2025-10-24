import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

interface SalesSummary {
  totalVentas: number;
  cantidadVentas: number;
  ticketPromedio: number;
  topVendedor: { nombre: string; total: number };
}

@Component({
  selector: 'app-kpi',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './kpi.component.html',
  styleUrl: './kpi.component.css'
})
export default class KpiComponent {

  summary?: SalesSummary;
  loading = true;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.http
      .get<SalesSummary>('http://localhost:3001/api/v1/sales/kpi/summary')
      .subscribe({
        next: (data) => {
          this.summary = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
  }

}
