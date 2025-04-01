import { HttpErrorResponse, HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthStateService } from "../services/auth-state.service";
import { jwtDecode } from "jwt-decode";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { catchError, EMPTY, throwError } from "rxjs";
import { environment } from "../../../environments/environment";


let isHandlingSessionExpired = false; // Evita múltiples redirecciones

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);
  const token = authState.getSession()?.access_token;

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && !isHandlingSessionExpired) {
        isHandlingSessionExpired = true;
        authState.logOut();
        router.navigate(['/login']).finally(() => {
          setTimeout(() => {
            isHandlingSessionExpired = false; // Restablecer después de un tiempo seguro
          }, 1000);
        });
      }

      return throwError(() => error);
    })
  );
};


//VERIFCAR CONEXION CON EL SERVIDOR
export const serverInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authState = inject(AuthStateService);

  return next(req).pipe(
    catchError((error) => {
      const errorMessages: Record<number, string> = {
        0: 'No hay conexión con el servidor',
        500: 'Error interno del servidor',
        400: error?.error?.message || 'Acceso denegado',
      };

      if (error.status === 401) {
        if (!isHandlingSessionExpired) {
          isHandlingSessionExpired = true;
          authState.logOut();
          router.navigateByUrl('/auth/login').finally(() => {
            setTimeout(() => {
              isHandlingSessionExpired = false;
            }, 1000);
          });
        }
      }

      return throwError(() => new HttpErrorResponse({ ...error, status: error.status || 500 }));
    })
  );
};
