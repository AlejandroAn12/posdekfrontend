import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ILogin } from '../interfaces/login.interface';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  login(iLogin: ILogin): Observable<any>{
    return this.http.post(`${environment.API_URL}/authentication/login`, iLogin);
  }

}
