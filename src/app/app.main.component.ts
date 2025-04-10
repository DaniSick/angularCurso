import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-navigation></app-navigation>
    <router-outlet></router-outlet>
  `
})
export class AppMainComponent {}
