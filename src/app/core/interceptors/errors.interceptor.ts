import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if ([401, 403, 404].includes(error.status)) {
                    console.warn('Interceptado error', error.status);
                    // aquí decides qué hacer (redirigir, mostrar alerta, ignorar, etc.)
                    // Por ejemplo, podrías redirigir o mostrar una alerta aquí
                }
                return throwError(() => error);
            })
        );
    }
}
