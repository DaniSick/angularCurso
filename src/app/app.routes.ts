import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ApiTestComponent } from './api-test.component';
import { ApiSeedComponent } from './api-seed.component';
import { TestAppComponent } from './test-app.component';
import { SimpleApiCheckerComponent } from './simple-api-checker.component';
import { SimpleDataTestComponent } from './simple-data-test.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'api-test', component: ApiTestComponent },
  { path: 'api-checker', component: SimpleApiCheckerComponent },
  { path: 'api-seed', component: ApiSeedComponent },
  { path: 'test', component: TestAppComponent },
  { path: 'simple-test', component: SimpleDataTestComponent }
];
