import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ChartComponent
} from "ng-apexcharts";
import { DashboardService } from '../../../../pages/components/dashboard/services/dashboard.service';
import { CommonModule } from '@angular/common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-dashboard-chart',
  imports: [ChartComponent, CommonModule],
  templateUrl: './dashboard-chart.component.html',
  styleUrl: './dashboard-chart.component.css'
})


export class DashboardChartComponent implements OnInit {
  public chartOptions: ChartOptions = {
    series: [],
    chart: { height: 350, type: 'line' },
    xaxis: { categories: [] },
    title: { text: '', align: 'left' },
    stroke: { curve: 'smooth' },
    dataLabels: { enabled: false }
  };

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadSalesChart();
  }

  loadSalesChart() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7); // últimos 7 días

    // Formatear fechas como YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const startStr = formatDate(start);
    const endStr = formatDate(end);

    this.dashboardService.getSalesRange(startStr, endStr).subscribe({
      next: (sales: any[]) => {

        // Ordenar por fecha
        sales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const categories = sales.map(s => new Date(s.date).toLocaleDateString());
        const totals = sales.map(s => s.total);

        this.chartOptions = {
          series: [{ name: 'Ventas', data: totals }],
          chart: {
            height: 350,
            type: 'line',
            zoom: { enabled: false },
            width: '100%'
          },
          dataLabels: { enabled: true },
          stroke: { curve: 'smooth' },
          title: { text: 'Ventas últimos 7 días', align: 'left' },
          xaxis: { categories }
        };
      },
      error: (err: any) => console.error('Error cargando ventas:', err)
    });
  }
}
