import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent
  ],
  template: `
    <app-navigation></app-navigation>
    <router-outlet></router-outlet>
  `
})
export class AppRootComponent {}