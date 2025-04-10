import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-simple-api-checker',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card class="checker-card">
      <mat-card-header>
        <mat-card-title>Verificador de API</mat-card-title>
        <mat-card-subtitle>Herramienta para probar la API y diagnosticar problemas</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <mat-form-field class="full-width">
          <mat-label>URL de la API</mat-label>
          <input matInput [(ngModel)]="apiUrl" placeholder="http://localhost:3000/users">
        </mat-form-field>
        
        <div class="button-row">
          <button mat-raised-button color="primary" (click)="checkApi()" [disabled]="isLoading">
            Verificar API
          </button>
          <button mat-raised-button color="accent" (click)="openInBrowser()" [disabled]="isLoading">
            Abrir en navegador
          </button>
        </div>
        
        <div *ngIf="isLoading" class="spinner-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Verificando API...</p>
        </div>
        
        <div *ngIf="error" class="error-container">
          <h3>Error:</h3>
          <p>{{ error }}</p>
        </div>
        
        <div *ngIf="result && !isLoading" class="result-container">
          <h3>Información de la respuesta:</h3>
          <div class="info-row">
            <strong>Tipo de datos:</strong> {{ dataType }}
          </div>
          <div class="info-row">
            <strong>¿Es array?</strong> {{ isArray ? 'Sí' : 'No' }}
          </div>
          <div class="info-row" *ngIf="isArray">
            <strong>Cantidad de elementos:</strong> {{ itemCount }}
          </div>
          <div class="info-row" *ngIf="isPaginated">
            <strong>Paginado:</strong> Sí
          </div>
          <div class="info-row" *ngIf="isPaginated">
            <strong>Total de registros:</strong> {{ totalItems }}
          </div>
          
          <h3>Datos recibidos:</h3>
          <pre class="response-data">{{ prettyResult }}</pre>
          
          <div *ngIf="sampleItem">
            <h3>Ejemplo de un registro:</h3>
            <pre class="sample-data">{{ sampleItem }}</pre>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .checker-card {
      max-width: 800px;
      margin: 20px auto;
    }
    
    .full-width {
      width: 100%;
    }
    
    .button-row {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }
    
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 20px 0;
    }
    
    .error-container {
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      padding: 10px 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .result-container {
      margin-top: 20px;
    }
    
    .info-row {
      margin-bottom: 8px;
    }
    
    .response-data, .sample-data {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
      max-height: 300px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    
    .sample-data {
      background-color: #e8f5e9;
      max-height: 200px;
    }
  `]
})
export class SimpleApiCheckerComponent {
  apiUrl = 'http://localhost:3000/users';
  isLoading = false;
  error: string | null = null;
  result: any = null;
  dataType = '';
  isArray = false;
  isPaginated = false;
  itemCount = 0;
  totalItems = 0;
  prettyResult = '';
  sampleItem = '';

  constructor(private http: HttpClient) {}

  checkApi(): void {
    this.resetResults();
    this.isLoading = true;
    
    this.http.get(this.apiUrl).subscribe({
      next: (data) => {
        this.result = data;
        this.dataType = typeof data;
        this.isArray = Array.isArray(data);
        
        if (this.isArray) {
          this.itemCount = (data as any[]).length;
          if (this.itemCount > 0) {
            this.sampleItem = JSON.stringify((data as any[])[0], null, 2);
          }
        } else if (this.dataType === 'object' && data) {
          // Comprobar si es una respuesta paginada
          if ('users' in data && Array.isArray((data as any).users)) {
            this.isPaginated = true;
            this.itemCount = (data as any).users.length;
            this.totalItems = (data as any).total || this.itemCount;
            
            if (this.itemCount > 0) {
              this.sampleItem = JSON.stringify((data as any).users[0], null, 2);
            }
          }
        }
        
        this.prettyResult = JSON.stringify(data, null, 2);
        this.isLoading = false;
        
        console.log('Datos recibidos de la API:', data);
      },
      error: (err) => {
        this.error = `Error al verificar la API: ${err.message}`;
        if (err.status === 0) {
          this.error += ' - No se pudo conectar al servidor. Asegúrate de que el servidor esté en ejecución.';
        } else if (err.status) {
          this.error += ` (Código de estado: ${err.status})`;
        }
        
        this.isLoading = false;
        console.error('Error al verificar la API:', err);
      }
    });
  }

  openInBrowser(): void {
    window.open(this.apiUrl, '_blank');
  }

  resetResults(): void {
    this.error = null;
    this.result = null;
    this.dataType = '';
    this.isArray = false;
    this.isPaginated = false;
    this.itemCount = 0;
    this.totalItems = 0;
    this.prettyResult = '';
    this.sampleItem = '';
  }
}
