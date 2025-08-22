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
  getCredendentials(): Observable<any> {
    return this.http.get(`${environment.API_URL}/credentials/all`)
  }

  getEmployeesWithOutCredendentials(): Observable<any> {
    return this.http.get(`${environment.API_URL}/credentials/all-without-credentials`,)
      .pipe(tap((res) => { }));
  }

  getCredentialID(id: string) {
    return this.http.get(`${environment.API_URL}/credentials/${id}`)
  }

  addCredentials(iCredentials: ICredentialsAccess): Observable<any> {
    return this.http.post(`${environment.API_URL}/credentials/add`, iCredentials)
      .pipe(tap((res) => {
        return;
      }));
  }


  updateCredential(id: string, iCredential: any) {
    return this.http.patch(`${environment.API_URL}/credentials/update/${id}`, iCredential)
  }


  deleteCredentials(id: string) {
    return this.http.delete(`${environment.API_URL}/credentials/delete/credentials/${id}`)
  }

  updateCredentialsStatus(id: string, status: boolean) {
    return this.http.patch(`${environment.API_URL}/credentials/${id}/status`, { status });
  }

}
