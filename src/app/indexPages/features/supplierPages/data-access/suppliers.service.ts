import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { ISupplier } from "../interface/supplier.interface";

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  private http = inject(HttpClient);

  addSupplier(iSupplier: ISupplier): Observable<any> {
      return this.http.post(`${environment.API_URL}/suppliers/add`,iSupplier)
      .pipe(tap((res) => {
        return true;
      }));
    }

  getSuppliers(page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${environment.API_URL}/suppliers/all?`, { params })
      .pipe(tap((res) => { return true }));
  }

  updateSupplier(id: string, iSupplier: any){
    return this.http.patch(`${environment.API_URL}/suppliers/update/${id}`, iSupplier)
  }

  updateSupplierStatus(id: string, status: boolean) {
    return this.http.patch(`${environment.API_URL}/suppliers/${id}/status`, { status });
  }

  deleteSupplier(id: string) {
    return this.http.delete(`${environment.API_URL}/suppliers/delete/${id}`)
  }

  getProductsBySupplier(id: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/suppliers/${id}/products`);
  }
}