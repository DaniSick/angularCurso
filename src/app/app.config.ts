import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Usa withDebugTracing para ver más información sobre la navegación
    provideRouter(routes, ...(isDevMode() ? [withDebugTracing()] : [])),
    
    // Configura HttpClient con interceptores
    provideHttpClient(withInterceptorsFromDi()),
    
    // Animaciones
    provideAnimations()
  ]
};
