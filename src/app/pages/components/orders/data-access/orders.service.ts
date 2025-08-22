import { HttpClient, HttpParams } from "@angular/common/http";
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

    getOrders(): Observable<any>{
        return this.http.get(`${environment.API_URL}/orders/all`);
    }

    getTotalOrders() {
        return this.http.get(`${environment.API_URL}/orders/total-orders`);
      }

    getPendingOrders(): Observable<any>{
        return this.http.get(`${environment.API_URL}/orders/pending`);
    }

    getOrderByNumber(orderNumber: string): Observable<any>{
        return this.http.get(`${environment.API_URL}/orders/${orderNumber}/details`);
    }

    getUltimateOrders(): Observable<any>{
        return this.http.get(`${environment.API_URL}/orders/ultimate`);
    }
}