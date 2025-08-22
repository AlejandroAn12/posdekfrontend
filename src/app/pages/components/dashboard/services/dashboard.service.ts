import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
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
        return this.http.get<any[]>(`${environment.API_URL}/range?start=${start}&end=${end}`);
    }
}