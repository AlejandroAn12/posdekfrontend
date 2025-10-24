import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class CajasService {

    private http = inject(HttpClient);

    getAllCajas(){
        return this.http.get<any[]>(`${environment.API_URL}/cajas/all`)
    }

    obtenerAsignaciones(){
        return this.http.get<any[]>(`${environment.API_URL}/cajas/aperturadas`)
    }
}