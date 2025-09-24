import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  constructor() { }

  private http = inject(HttpClient);

  addStore(storeForm: any) {
    return this.http.post(`${environment.API_URL}/store/add`, storeForm);
  }

  addTaxesStore(taxesForm: any) {
    return this.http.post(`${environment.API_URL}/store/add-taxes`, taxesForm);
  }

  //Obtener la informacion de la empresa
  getInformationStore(): Observable<any> {
    return this.http.get(`${environment.API_URL}/store/information`)
  }

  getTaxConfiguration(): Observable<any> {
    return this.http.get(`${environment.API_URL}/store/tax`)
  }

  //Actualizar informacion de la empresa
  updateInformationStore(id: string, iStore: any) {
    return this.http.patch(`${environment.API_URL}/store/update/${id}`, iStore);
  }

  uploadLogo(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${environment.API_URL}/store/upload-logo/${id}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }


}
