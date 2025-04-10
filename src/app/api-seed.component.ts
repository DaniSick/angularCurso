import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ServiceApiService } from './service-api.service';

@Component({
  selector: 'app-api-seed',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Administrador de Base de Datos</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Utiliza esta herramienta para sembrar tu base de datos con datos de ejemplo.</p>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Número de registros</mat-label>
          <input matInput type="number" [(ngModel)]="seedCount" min="1" max="5000">
          <mat-hint>Número de usuarios a crear (máx. 5000)</mat-hint>
        </mat-form-field>
        
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>{{ loadingMessage }}</p>
        </div>
        
        <div *ngIf="successMessage" class="success-message">
          <p>{{ successMessage }}</p>
        </div>
        
        <div *ngIf="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="seedDatabase()" [disabled]="isLoading">
          Sembrar Base de Datos
        </button>
        <button mat-raised-button color="accent" (click)="checkDatabase()" [disabled]="isLoading">
          Verificar Estado
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 600px;
      margin: 20px auto;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding:.20px 0;
    }
    
    .success-message {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }
    
    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }
  `]
})
export class ApiSeedComponent {
  seedCount = 100;
  isLoading = false;
  loadingMessage = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private serviceApiService: ServiceApiService,
    private snackBar: MatSnackBar
  ) {}

  seedDatabase(): void {
    this.clearMessages();
    this.isLoading = true;
    this.loadingMessage = 'Sembrando la base de datos...';
    
    this.serviceApiService.seedDatabase(this.seedCount).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `¡Éxito! Se han creado ${response.count || this.seedCount} registros en la base de datos.`;
        this.snackBar.open(this.successMessage, 'Cerrar', { duration: 5000 });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = `Error al sembrar la base de datos: ${error.message}`;
        this.snackBar.open(this.errorMessage, 'Cerrar', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  checkDatabase(): void {
    this.clearMessages();
    this.isLoading = true;
    this.loadingMessage = 'Verificando la base de datos...';
    
    this.serviceApiService.checkDatabaseStatus().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Base de datos conectada. Estado: ${response.status || 'OK'}`;
        if (response.count !== undefined) {
          this.successMessage += `. Registros: ${response.count}`;
        }
        this.snackBar.open(this.successMessage, 'Cerrar', { duration: 5000 });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = `Error al verificar la base de datos: ${error.message}`;
        this.snackBar.open(this.errorMessage, 'Cerrar', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
