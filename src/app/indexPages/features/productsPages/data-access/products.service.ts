import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { IProduct } from '../interface/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private http = inject(HttpClient);

  addProduct(iProduct: IProduct): Observable<any> {
    return this.http.post(`${environment.API_URL}/products/add`, iProduct)
      .pipe(tap((res) => {
        return;
      }));
  }

  getProducts() {
    return this.http.get(`${environment.API_URL}/products/all`);
  }

  getTotalProducts() {
    return this.http.get(`${environment.API_URL}/products/total-products`);
  }

  getProductId(id: string) {
    return this.http.get(`${environment.API_URL}/products/id/${id}`)
  }

  updateProductStatus(id: string, status: boolean) {
    return this.http.patch(`${environment.API_URL}/products/${id}/status`, { status });
  }

  updateProduct(id: string, iProduct: any) {
    return this.http.patch(`${environment.API_URL}/products/update/${id}`, iProduct)
  }

  updateProductService(id: string, its_service: boolean) {
    return this.http.patch(`${environment.API_URL}/products/${id}/its-service`, { its_service });
  }

  deletedProduct(id: string) {
    return this.http.delete(`${environment.API_URL}/products/delete/${id}`)
  }
}
