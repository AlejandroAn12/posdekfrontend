import { HttpClient } from '@angular/common/http';
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

  getEarnings() {
    return this.http.get(`${environment.API_URL}/products/all-earnings`);
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

  adjustProductStock(barcode: string, body: any) {
    return this.http.post(`${environment.API_URL}/products/${barcode}/adjust-stock`, body);
  }

  movementProducts() {
    return this.http.get(`${environment.API_URL}/products/movements-general`);
  }

  movementProductsUp(params: {
    product?: string;
    movementType?: string;
    fromDate?: string;  // formato ISO o 'YYYY-MM-DD'
    toDate?: string;    // formato ISO o 'YYYY-MM-DD'
    page?: number;
    limit?: number;
  }) {
    const queryParams: any = {};

    if (params.product) queryParams.product = params.product;
    if (params.movementType) queryParams.movementType = params.movementType;
    if (params.fromDate) queryParams.fromDate = params.fromDate;
    if (params.toDate) queryParams.toDate = params.toDate;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    return this.http.get<{
      data: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${environment.API_URL}/products/movements`, {
      params: queryParams,
    });
  }
}
