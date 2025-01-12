import { Component, inject, OnInit } from '@angular/core';
import { AuthStateService } from '../../../shared/services/auth-state.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export default class DashboardComponent implements OnInit{

ngOnInit(): void {
  this.getUserLogged()
}

private authStateService = inject(AuthStateService);

userLogged: string = '';
role: string = '';




getUserLogged(){
  this.authStateService.userAuth().subscribe({
    next: (user) => {
      this.userLogged = user.data.employee.name;
      this.role = user.data.role.name;
    },
    error: (error) => {
      console.error(error);
    }
  })
}




}
