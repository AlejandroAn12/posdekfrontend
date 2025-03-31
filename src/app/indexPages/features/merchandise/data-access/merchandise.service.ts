import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class MerchandiseService {
    private http = inject(HttpClient);


    entryProductStock(orderId: string, items: { id: string, quantity: number }[]): Observable<any> {
        return this.http.put<any>(`${environment.API_URL}/products/${orderId}/entry-stock`, { items });
      }
}