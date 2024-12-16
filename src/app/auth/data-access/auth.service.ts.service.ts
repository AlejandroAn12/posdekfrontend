import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ILogin } from '../interfaces/login.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  // constructor() { }

  login(iLogin: ILogin){
    return this.http.post(`${environment}/authentication/login`, iLogin);
  }

}
