import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class UnitOfMeasurementService {

    private http = inject(HttpClient);

    getUnits(): Observable<any> {
        return this.http.get(`${environment.API_URL}/unit-of-measurement/get/all`);
    }
}