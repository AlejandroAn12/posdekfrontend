import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class SriService {

    private http = inject(HttpClient);

    consultarRuc(ruc: string): Observable<{ existe: boolean, data: [] }> {
        return this.http.get<{ existe: boolean, data: [] }>(`${environment.API_URL}?ruc=${ruc}`);
    }
}