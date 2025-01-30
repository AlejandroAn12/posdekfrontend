import { HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthStateService } from "../services/auth-state.service";
import { jwtDecode } from "jwt-decode";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

// export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn) => {

//     const router = inject(Router);
//     const authState = inject(AuthStateService);
//     const token = authState.getSession();

//     if (token) {
//         try {
//             // Decodificar el token
//             const decodedToken: any = jwtDecode(token);

//             // Verificar si el token ha expirado
//             const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
//             if (decodedToken.exp && decodedToken.exp < currentTime) {
//                 console.warn('Token ha expirado');
//                 authState.logOut(); // Método para eliminar el token
//                 router.navigate(['/login']); // Redirigir al login
//                 return next.handle(request); // No se continúa la solicitud
//             }
//         } catch (error) {
//             console.error('Error al decodificar el token:', error);
//             authState.logOut();
//             router.navigate(['/login']);
//             return next(request);
//         }

//         request = request.clone({
//             setHeaders: {
//                 Authorization: `Bearer ${token?.access_token}`
//             }
//         })

//         return next(request);
//     }
// }

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn) => {
    const authState = inject(AuthStateService);
    const router = inject(Router);
    const token = authState.getSession()?.access_token;
  
    if (token) {
      try {
        // Decodificar el token
        const decodedToken: any = jwtDecode(token);
  
        // Verificar si el token ha expirado
        const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
        if (decodedToken.exp && decodedToken.exp < currentTime) {
          // console.warn('La sesion ha expirado');
          Swal.fire({
                    icon: "error",
                    title: "Sesión expirada",
                    text: `Tu sesión ha expirado, vuelva a iniciar sesión`
                  });
          authState.logOut(); // Método para eliminar el token
          router.navigateByUrl('/auth/login'); // Redirigir al login
          return next(request); // Finalizar el interceptor aquí
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        authState.logOut();
        router.navigateByUrl('/auth/login');
        return next(request);
      }

      
      // Si el token es válido, agregarlo al encabezado
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  
    return next(request); // Continuar con la solicitud
  };