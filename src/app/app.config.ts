import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor, serverInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/errors.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(
      { eventCoalescing: true }),
    provideRouter(routes),
    provideToastr(),
    provideAnimations(),
      provideHttpClient(withInterceptors([authInterceptor, serverInterceptor, /*errorInterceptor*/])),
    ],
};
