import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class TypeOfDocumentService {

    private http = inject(HttpClient);

    getTypeOfDocuments(): Observable<any> {
        return this.http.get(`${environment.API_URL}/type-of-document/all`);
    }
    getTypeOfDocumentId(id: string): Observable<any> {
        return this.http.get(`${environment.API_URL}/type-of-document/${id}/detail`);
    }
}