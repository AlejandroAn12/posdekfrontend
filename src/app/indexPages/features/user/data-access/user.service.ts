import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);

  getCredendentials(): Observable<any> {
    return this.http.get(`${environment.API_URL}/employee/credentials`)
      .pipe(tap((res) => {
        return;
        // this._storage.set('session', JSON.stringify(res));
      }));
  }

  deleteCredentials(id: string){
    return this.http.delete(`${environment.API_URL}/employee/delete/credentials/${id}`)
  }

  updateCredentialsStatus(id: string, status: boolean) {
    return this.http.patch(`${environment.API_URL}/employee/credentials/${id}/status`, { status });
  }

}
