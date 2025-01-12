import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ICredentialsAccess } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);

  //METODOS CREDENCIALES
  getCredendentials(page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get(`${environment.API_URL}/employee/credentials`, {params})
      .pipe(tap((res) => {}));
  }

  getEmployeesWithOutCredendentials(): Observable<any> {
    return this.http.get(`${environment.API_URL}/employee/all-without-credentials`,)
      .pipe(tap((res) => {}));
  }

  getCredentialID(id: string){
    return this.http.get(`${environment.API_URL}/employee/credential/${id}`)
  }

  addCredentials(iCredentials: ICredentialsAccess): Observable<any> {
    return this.http.post(`${environment.API_URL}/employee/credentials/add`,iCredentials)
    .pipe(tap((res) => {
      return;
    }));
  }


  updateCredential(id: string, iCredential: any){
    return this.http.patch(`${environment.API_URL}/employee/credentials/update/${id}`, iCredential)
  }


  deleteCredentials(id: string) {
    return this.http.delete(`${environment.API_URL}/employee/delete/credentials/${id}`)
  }

  updateCredentialsStatus(id: string, status: boolean) {
    return this.http.patch(`${environment.API_URL}/employee/credentials/${id}/status`, { status });
  }

}
