import { inject, Injectable } from "@angular/core";
import { StorageService } from "./storage.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../auth/data-access/auth.service.ts.service";

interface Session {
    access_token: string;
}
@Injectable({
    providedIn: 'root'
})

export class AuthStateService {

    private _storageService = inject(StorageService);
    private http = inject(HttpClient);
    //   private authenticationService = inject(AuthService);

    _router = inject(Router);

    logOut() {
        localStorage.removeItem('session');
        this._router.navigate(['/auth/login']);
    }

    userAuth(): Observable<any> {
        return this.http.get(`${environment.API_URL}/employee/user-session`);
    }

    getSession(): Session | null {

        let currentSession: Session | null = null;

        const maybeSession = this._storageService.get<Session>('session');

        if (maybeSession !== null) {
            if (this._isValidSession(maybeSession)) {
                currentSession = maybeSession;
            } else {
                this.logOut();
            }
        }

        return currentSession;
    }

    private _isValidSession(maybeSession: unknown): boolean {

        return (
            typeof maybeSession === 'object' && maybeSession !== null && 'access_token' in maybeSession
        );
    }
}