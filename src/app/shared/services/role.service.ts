import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class RoleService {

    private http = inject(HttpClient);

    getRoles(): Observable<any> {
        return this.http.get(`${environment.API_URL}/role/all`)
            .pipe(tap((res) => { }));
    }
}