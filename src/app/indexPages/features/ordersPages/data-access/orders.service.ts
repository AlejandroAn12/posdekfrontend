import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class OrdersService {

    private http = inject(HttpClient);

    generateOrder(order: any): Observable<any> {
        return this.http.post(`${environment.API_URL}/orders/generate`, order);
    }
}