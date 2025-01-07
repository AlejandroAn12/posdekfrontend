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

  getProducts(categoryId?: string, page: number = 1, limit: number = 10) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
  
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
  
    return this.http.get(`${environment.API_URL}/products/all?`, { params });
  }

  getProductId(id: string){
    return this.http.get(`${environment.API_URL}/products/id/${id}`)
  }

  updateProductStatus(id: string, status: boolean) {
    return this.http.patch(`${environment.API_URL}/products/${id}/status`, { status });
  }

  updateProduct(id: string, iProduct: any){
    return this.http.put(`${environment.API_URL}/products/update/${id}`, iProduct)
  }

  deletedProduct(id: string){
    return this.http.delete(`${environment.API_URL}/products/delete/${id}`)
  }
}
