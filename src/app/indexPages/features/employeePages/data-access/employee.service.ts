import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IEmployee } from '../interface/employee.interface';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private http = inject(HttpClient);

  getEmployees(): Observable<any> {
    return this.http.get(`${environment.API_URL}/employee/all`)
      .pipe(tap((res) => { }));
  }

  registerEmployee(iEmployee: IEmployee): Observable<any> {
    return this.http.post(`${environment.API_URL}/employee/register`, iEmployee)
      .pipe(tap((res) => {
        return;
      }));
  }

  getEmployeeId(id: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/employee/${id}/detail`)
      .pipe(tap((res) => { return true }));
  }

  updateEmployee(id: string, iEmployee: any) {
    return this.http.patch(`${environment.API_URL}/employee/update/${id}`, iEmployee)
  }

  deleteEmployee(id: string) {
    return this.http.delete(`${environment.API_URL}/employee/delete/${id}`)
  }

  updateEmployeeStatus(id: string, status: boolean) {
    return this.http.patch(`${environment.API_URL}/employee/${id}/status`, { status });
  }

}
