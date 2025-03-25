import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class ProductReportService {

    private http = inject(HttpClient);
    
      downloadAllProductReportPdf(): Observable<Blob> {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        });
    
        return this.http.get(`${environment.API_URL}/products/reports`, {
          headers: headers,
          responseType: 'blob'
        });
      }
}