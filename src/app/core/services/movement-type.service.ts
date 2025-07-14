import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class MovementTypeService {

    private http = inject(HttpClient);

    getAllMovementType(): Observable<any> {
        return this.http.get(`${environment.API_URL}/movement-type/all`);
    }
    getTypeOfDocumentId(id: string): Observable<any> {
        return this.http.get(`${environment.API_URL}/type-of-document/${id}/detail`);
    }
}