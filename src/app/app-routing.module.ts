import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SimpleDataTestComponent } from './simple-data-test.component';
import { SimpleApiCheckerComponent } from './simple-api-checker.component';
import { TestAppComponent } from './test-app.component';

const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', component: AppComponent },
  { path: 'simple-test', component: SimpleDataTestComponent },
  { path: 'api-checker', component: SimpleApiCheckerComponent },
  { path: 'api-test', component: TestAppComponent },
  { path: '**', redirectTo: 'users' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }