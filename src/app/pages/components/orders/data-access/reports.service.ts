import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class OrderReportService {

    private http = inject(HttpClient);

  //Generar PDF de una orden de compra por ID
  downloadOrderReportPDF(id: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/pdf'
    });

    return this.http.get(`${environment.API_URL}/reports/orders/${id}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  //Imprimir orden de compra por ID
  printOrderPDF(id: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/pdf'
    });

    return this.http.get(`${environment.API_URL}/reports/orders/${id}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  //Imprimir todas las ordenes de compras
  printAllOrders(){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/pdf'
    });

    return this.http.get(`${environment.API_URL}/reports/orders`, {
      headers: headers,
      responseType: 'blob'
    });
  }
}