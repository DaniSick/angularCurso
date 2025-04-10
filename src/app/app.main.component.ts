import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <div class="main-container">
      <app-navigation></app-navigation>
      <div class="content-container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .main-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .content-container {
      padding: 16px;
      flex: 1;
    }
  `]
})
export class AppMainComponent {
  constructor() {
    console.log('AppMainComponent inicializado - Este es el componente raíz que contiene el router-outlet');
  }
}
