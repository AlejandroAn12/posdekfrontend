import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ILogin } from '../interfaces/login.interface';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { StorageService } from '../../shared/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private _storage = inject(StorageService);

  login(iLogin: ILogin): Observable<any> {
    return this.http.post(`${environment.API_URL}/auth/login`, iLogin)
      .pipe(tap((res) => {
        this._storage.set('session', JSON.stringify(res));
      }));
  }

}
