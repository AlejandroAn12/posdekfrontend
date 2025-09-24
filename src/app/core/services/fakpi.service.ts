import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { catchError, Observable, tap, throwError } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class FakpiService {

    private http = inject(HttpClient);

    serviceRuc(ruc: string): Observable<any> {
        // Validación del parámetro
        if (!ruc || ruc.trim().length === 0) {
            return throwError(() => new Error('El RUC no puede estar vacío'));
        }

        const headers = new HttpHeaders({
            'x-api-key': environment.KEY,
            'Content-Type': 'application/json',
        });

        // Usando HttpParams para mejor manejo de parámetros
        const params = new HttpParams().set('ruc', ruc.trim());

        return this.http.get(`${environment.API_KEY_URL}/ruc`, {
            headers: headers,
            params: params
        }).pipe(
            catchError((error) => {
                console.error('Error en la consulta del Ruc:', error);
                return throwError(() => error);
            })
        );
    }
}