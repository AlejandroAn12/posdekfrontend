import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

export interface InventoryItem {
  id: string;
  name: string;
  barcode: string;
  stock: number;
  physicalQuantity?: number;
}

export interface Inventory {
  id: string;
  createdAt: Date;
  categoryId: string;
  finished: boolean;
  items: InventoryItem[];
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_URL}/inventory`;

  getInventoryItems(id: string) {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/${id}/items`);
  }

  getInventoryId(id: string) {
    return this.http.get<Inventory>(`${this.baseUrl}/${id}`);
  }

  finalizeInventory(id: string, items: { id: string; physicalQuantity: number }[]) {
    return this.http.patch(`${this.baseUrl}/finalize/${id}`, { items });
  }

  generateInventory(iInventory: Partial<Inventory>): Observable<Inventory> {
    return this.http.post<Inventory>(`${this.baseUrl}/generate`, iInventory);
  }

  getAllInventoryGenerated(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(`${this.baseUrl}/all/generated`);
  }

  getAllInventoryFinished(params: {
    page?: number;
    limit?: number;
  }): Observable<Inventory[]> {
    const queryParams: any = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    return this.http.get<Inventory[]>(`${this.baseUrl}/all/finalized`, {
      params: queryParams,
    });
  }
  // private http = inject(HttpClient);

  // getInventoryItems(id: string) {
  //   return this.http.get<any[]>(`${environment.API_URL}/inventory/${id}/items`);
  // }

  // getInventoryId(id: string) {
  //   return this.http.get<any>(`${environment.API_URL}/inventory/${id}`);
  // }

  // finalizeInventory(id: string, items: { id: string; physicalQuantity: number }[]) {
  //   return this.http.patch(`${environment.API_URL}/inventory/finalize/${id}`, { items });
  // }

  // generateInventory(iInventory: any): Observable<any> {
  //   return this.http.post<any>(`${environment.API_URL}/inventory/generate`, iInventory);
  // }

  // getAllInventoryGenerated(): Observable<any> {
  //   return this.http.get<any>(`${environment.API_URL}/inventory/all/generated`);
  // }

  // getAllInventoryFinished(): Observable<any> {
  //   return this.http.get<any>(`${environment.API_URL}/inventory/all/finished`);
  // }
}