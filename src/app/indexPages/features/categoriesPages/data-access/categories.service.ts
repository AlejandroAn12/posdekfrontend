import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ICategory } from '../interface/icategories.interface';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private http = inject(HttpClient);

  addCategory(iCategories: ICategory) {
    return this.http.post(`${environment.API_URL}/categories/add`, iCategories)
      .pipe(tap((res) => {
        return;
      }));
  }

  geCategories() {
    return this.http.get(`${environment.API_URL}/categories/all`);
  }

  getCategoryId(id: string){
    return this.http.get(`${environment.API_URL}/categories/id/${id}`)
  }

  updateCategory(id: string, iProduct: any){
    return this.http.put(`${environment.API_URL}/categories/update/${id}`, iProduct)
  }

  updateCategoryStatus(id: string, status: boolean) {
    return this.http.patch(`${environment.API_URL}/categories/${id}/status`, { status });
  }

  deletedCategory(id: string){
    return this.http.delete(`${environment.API_URL}/categories/delete/${id}`)
  }
}
