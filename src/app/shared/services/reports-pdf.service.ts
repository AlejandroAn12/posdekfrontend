import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ReportsPdfService {

  private http = inject(HttpClient);

  downloadProductReportPdf(): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/pdf'
    });

    return this.http.get(`${environment.API_URL}/products/download-pdf/report-product`, {
      headers: headers,
      responseType: 'blob'
    });
  }
}
