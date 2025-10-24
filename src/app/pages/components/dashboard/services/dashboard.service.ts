import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { environment } from "../../../../../environments/environment";


@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    private http = inject(HttpClient);

    earningsSales(): Observable<any> {
        return this.http.get(`${environment.API_URL}/sales/earnings`);
    }

    getSalesRange(start: string, end: string): Observable<any[]> {
        return this.http.get<any[]>(`${environment.API_URL}/sales/range?start=${start}&end=${end}`);
    }

    // KPIs general
    getGlobalKPIs(): Observable<any> {
        let params = new HttpParams();
        return this.http.get(`${environment.API_URL}/sales/kpis`);
    }

    // KPIs por vendedor
    getEmployeeKPIs(credentialId?: string): Observable<any> {
        let params = new HttpParams();
        if (credentialId) params = params.set('credentialId', credentialId);
        return this.http.get(`${environment.API_URL}/sales/kpis`, { params });
    }

    // Ranking de vendedores
    getTopSellers(limit: number = 5): Observable<any> {
        return this.http.get(`${environment.API_URL}/sales/kpis/top-sellers`, { params: { limit } });
    }
}