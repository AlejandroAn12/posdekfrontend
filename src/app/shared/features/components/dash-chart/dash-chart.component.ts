import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DashboardService } from '../../../../pages/components/dashboard/services/dashboard.service';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

Chart.register(...registerables);
@Component({
  selector: 'app-dash-chart',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dash-chart.component.html',
  styleUrl: './dash-chart.component.css'
})
export class DashChartComponent implements OnInit, OnChanges {
  kpis: any;
  topSellers: any;
  loading = true;
  error = '';

  constructor(private dashboardService: DashboardService) { }
  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  salesChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { label: 'Ventas', data: [], borderColor: '#2563eb', fill: true, tension: 0.4 },
    ],
  };

  ngOnInit() {
    this.loadDashboard();
    this.dashboardService.getGlobalKPIs().subscribe(kpi => {
      this.kpis = kpi;
      this.salesChartData.labels = kpi.salesByDay.map((s: any) => s.date);
      this.salesChartData.datasets[0].data = kpi.salesByDay.map((s: any) => s.total);
    });
  }

  loadDashboard() {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.dashboardService.getGlobalKPIs().toPromise(),
      this.dashboardService.getTopSellers(5).toPromise(),
    ])
      .then(([kpiData, topSellersData]) => {
        this.kpis = kpiData;
        this.topSellers = topSellersData;
        this.loading = false;
      })
      .catch((err) => {
        console.error('Error cargando dashboard', err);
        this.error = 'No se pudo cargar la información del dashboard';
        this.loading = false;
      });
  }
}
