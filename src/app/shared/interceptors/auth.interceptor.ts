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
    // Si el token es válido, agregarlo a los headers
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && !isHandlingSessionExpired) {
        isHandlingSessionExpired = true; // Marcar que estamos manejando la sesión expirada
        handleSessionExpired(authState, router);
      }
      return throwError(() => error);
    })
  );
};

// Manejo de sesión expirada
function handleSessionExpired(authState: AuthStateService, router: Router) {
  authState.logOut(); // Limpia la sesión

  if (!isHandlingSessionExpired) {
    isHandlingSessionExpired = true;
    router.navigate(['/login']).then(() => {
      isHandlingSessionExpired = false; // Restablecer bandera después de la redirección
    });
  }
}



//VERIFCAR CONEXION CON EL SERVIDOR
export const serverInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authState = inject(AuthStateService);

  return next(req).pipe(
    catchError((error) => {
      // console.error('Error HTTP:', error);

      const errorMessages: Record<number, string> = {
        0: 'No hay conexión con el servidor',
        500: 'Error interno del servidor',
        400: error?.error?.message || 'Acceso denegado',
      };

      // const message = errorMessages[error.status] || 'Error desconocido';
      // console.log({error});

      // Swal.fire('Error', message, 'error');

      if (error.status === 401) {
        authState.logOut();
        router.navigateByUrl('/auth/login');
      }

      return throwError(() => error);
    })
  );
};