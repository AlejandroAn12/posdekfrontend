import { inject } from "@angular/core";
import { CanActivateFn, Router, RouteReuseStrategy } from "@angular/router";
import { AuthStateService } from "../services/auth-state.service";
import { sequenceEqual } from "rxjs";
import { jwtDecode } from "jwt-decode";

export const privateGuard = (): CanActivateFn => {
    return () => {
        const authService = inject(AuthStateService);
        const router = inject(Router);
        const session = authService.getSession();
        const token = session?.access_token;

        if (!token) {
            router.navigateByUrl('/auth/login');
            return false;
        }

        try {
            const decoded: any = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);

            if (decoded.exp < currentTime) {
                authService.logOut();
                router.navigateByUrl('/auth/login');
                return false;
            }

            return true;
        } catch (err) {
            authService.logOut();
            router.navigateByUrl('/auth/login');
            return false;
        }
    };
};

export const publicGuard = (): CanActivateFn => {
    return () => {
        const authService = inject(AuthStateService);
        const router = inject(Router);
        const session = authService.getSession();
        const token = session?.access_token;

        if (!token) {
            return true;
        }

        try {
            const decoded: any = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);

            if (decoded.exp >= currentTime) {
                router.navigateByUrl('/admin/dashboard');
                return false;
            }

            authService.logOut();
            return true;
        } catch {
            authService.logOut();
            return true;
        }
    };
};