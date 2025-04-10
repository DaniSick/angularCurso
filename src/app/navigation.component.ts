import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">Angular Users Admin</div>
      <div class="navbar-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          Usuarios
        </a>
        <a routerLink="/basic-table" routerLinkActive="active" class="nav-link">
          Tabla Básica
        </a>
        <a routerLink="/simple-test" routerLinkActive="active" class="nav-link">
          Test Simple
        </a>
        <a routerLink="/api-checker" routerLinkActive="active" class="nav-link">
          API Checker
        </a>
        <a routerLink="/api-seed" routerLinkActive="active" class="nav-link">
          Admin DB
        </a>
        <a routerLink="/api-test" routerLinkActive="active" class="nav-link">
          Test API
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: #3f51b5;
      color: white;
      padding: 0 16px;
      display: flex;
      align-items: center;
      height: 64px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .navbar-brand {
      font-size: 20px;
      font-weight: 500;
      margin-right: 32px;
    }
    
    .navbar-links {
      display: flex;
      gap: 8px;
    }
    
    .nav-link {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.2s;
      display: block;
    }
    
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .active {
      background-color: rgba(255, 255, 255, 0.15);
    }
    
    /* Responsivo para pantallas pequeñas */
    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        height: auto;
        padding: 16px;
      }
      
      .navbar-brand {
        margin-right: 0;
        margin-bottom: 16px;
      }
      
      .navbar-links {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  `]
})
export class NavigationComponent {}
