import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);


  // entryProductStock(orderId: string, items: { id: string, quantity: number }[]): Observable<any> {
  //     return this.http.put<any>(`${environment.API_URL}/products/${orderId}/entry-stock`, { items });
  //   }

  // generateInventoryReport(): Observable<any> {
  //     return this.http.get<any>(`${environment.API_URL}/inventory/report`, { responseType: 'blob' as 'json' });
  //   }

  generateInventory(iInventory:any): Observable<any> {
    return this.http.post<any>(`${environment.API_URL}/inventory/generate`, iInventory);
  }

  getAllInventory(): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/inventory/all`);
  }
}