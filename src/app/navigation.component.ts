import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Angular Users Admin</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
        <mat-icon>people</mat-icon> Usuarios
      </a>
      <a mat-button routerLink="/simple-test" routerLinkActive="active">
        <mat-icon>table_chart</mat-icon> Test Simple
      </a>
      <a mat-button routerLink="/api-checker" routerLinkActive="active">
        <mat-icon>search</mat-icon> API Checker
      </a>
      <a mat-button routerLink="/api-seed" routerLinkActive="active">
        <mat-icon>settings</mat-icon> Admin DB
      </a>
      <a mat-button routerLink="/api-test" routerLinkActive="active">
        <mat-icon>bug_report</mat-icon> Test API
      </a>
    </mat-toolbar>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .active {
      background-color: rgba(255, 255, 255, 0.15);
    }
  `]
})
export class NavigationComponent {}
