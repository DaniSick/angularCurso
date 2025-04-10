import { bootstrapApplication } from '@angular/platform-browser';
import { AppRootComponent } from './app/app-root.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppRootComponent, appConfig)
  .catch(err => console.error('Error initializing app:', err));
