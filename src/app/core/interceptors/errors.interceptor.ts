import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, EMPTY } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if ([401, 403].includes(error.status)) {
                console.warn('Acceso no autorizado o prohibido', error.status);
                // Aquí puedes redirigir al login si usas Router
                // router.navigate(['/login']);
                return EMPTY; // no deja pasar el error a la app
            }

            if (error.status === 404) {
                console.warn('Recurso no encontrado');
                return EMPTY; // ignora el error
            }

            // otros errores -> sigue lanzando el error
            return throwError(() => error);
        })
    );
};
