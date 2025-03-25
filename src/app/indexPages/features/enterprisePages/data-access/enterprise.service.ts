import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {

  constructor() { }

   private http = inject(HttpClient);

   addEnterprise(enterpriseForm: any){
    return this.http.post(`${environment.API_URL}/enterprise/add`, enterpriseForm);
   }

//Obtener la informacion de la empresa
   getInformationEnterprise(): Observable<any>{
    return this.http.get(`${environment.API_URL}/enterprise/information`,)
          .pipe(tap((res) => {}));
   }

   //Actualizar informacion de la empresa
   updateInformationEnterprise(id: string, iEnterprise: any){
    return this.http.patch(`${environment.API_URL}/enterprise/update/${id}`, iEnterprise);
   }

   uploadLogo(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
  
    return this.http.post(`${environment.API_URL}/enterprise/upload-logo/${id}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
  
 
}
