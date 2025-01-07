import { inject } from "@angular/core";
import { CanActivateFn, Router, RouteReuseStrategy } from "@angular/router";
import { AuthStateService } from "../services/auth-state.service";
import { sequenceEqual } from "rxjs";

export const privateGuard = (): CanActivateFn => {
    return () => {

        const authService = inject(AuthStateService);
        const router = inject(Router);

        const session = authService.getSession();

        if (session) {
            return true;
        }

        router.navigateByUrl('auth/login');

        return false;
    };
};

export const publicGuard = (): CanActivateFn => {
    return () => {

        const authService = inject(AuthStateService);
        const router = inject(Router);

        const session = authService.getSession();

        if (session) {
            router.navigateByUrl('index/dashboard');
            return false;
        }

        return true;
    };
};