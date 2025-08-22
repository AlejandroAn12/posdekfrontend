import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { InventoryItem } from "../../../../core/models/inventory.interface";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);

  getInventoryItems(id: string) {
    return this.http.get<any[]>(`${environment.API_URL}/inventory/${id}/items`);
  }

  getInventoryId(id: string) {
    return this.http.get<any>(`${environment.API_URL}/inventory/${id}`);
  }

  finalizeInventory(id: string, items: { id: string; physicalQuantity: number }[]) {
    return this.http.patch(`${environment.API_URL}/inventory/update-quantity/${id}`, { items });
  }

  generateInventory(iInventory: any): Observable<any> {
    return this.http.post<any>(`${environment.API_URL}/inventory/generate`, iInventory);
  }

  getAllInventoryGenerated(): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/inventory/all/generated`);
  }

  getAllInventoryFinished(): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/inventory/all/finished`);
  }
}