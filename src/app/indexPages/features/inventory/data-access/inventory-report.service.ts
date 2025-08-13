import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class InventoryReportService {

    private http = inject(HttpClient);

    //Generar PDF de inventorio por ID
    downloadInventoryFinishedReportPDF(id: string): Observable<Blob> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
        });

        return this.http.get(`${environment.API_URL}/reports/inventories/finished/${id}`, {
            headers: headers,
            responseType: 'blob'
        });
    }

    //Imprimir inventorio por ID
    printInventoryFinishedPDF(id: string) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
        });

        return this.http.get(`${environment.API_URL}/reports/inventories/finished/${id}`, {
            headers: headers,
            responseType: 'blob'
        });
    }

    //Imprimir inventorio generado por ID
    printInventoryGeneratedPDF(id: string) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/pdf'
        });

        return this.http.get(`${environment.API_URL}/reports/inventories/generated/${id}`, {
            headers: headers,
            responseType: 'blob'
        });
    }

    getAllInventoriesReportPdf(): Observable<Blob> {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        });
    
        return this.http.get(`${environment.API_URL}/reports/inventories`, {
          headers: headers,
          responseType: 'blob'
        });
      }
}