import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatDividerModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Herramienta de Diagnóstico API</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>URL de API: {{ apiUrl }}</p>
        <div *ngIf="testResult">
          <h3>Resultado:</h3>
          <pre>{{ testResult | json }}</pre>
        </div>
        <div *ngIf="errorMessage" class="error-message">
          <h3>Error:</h3>
          <p>{{ errorMessage }}</p>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="testApi()">Probar API</button>
        <button mat-raised-button color="accent" (click)="testWithFetch()">Probar con Fetch</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      max-width: 800px;
      margin: 20px auto;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      max-height: 300px;
    }
    .error-message {
      color: #f44336;
      background-color: #ffebee;
      padding: 10px;
      border-radius: 4px;
    }
    mat-card-actions button {
      margin-right: 8px;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  apiUrl = 'http://localhost:3000/users/';
  testResult: any = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  testApi(): void {
    this.testResult = null;
    this.errorMessage = null;
    
    this.http.get(this.apiUrl).subscribe({
      next: (response) => {
        console.log('API test response:', response);
        this.testResult = response;
      },
      error: (error) => {
        console.error('API test error:', error);
        this.errorMessage = `Error: ${error.message || 'Error desconocido'}`;
        
        if (error.status === 0) {
          this.errorMessage += ' (No se pudo conectar al servidor. Verifica que el servidor backend esté corriendo.)';
        }
      }
    });
  }

  testWithFetch(): void {
    this.testResult = null;
    this.errorMessage = null;
    
    fetch(this.apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetch API response:', data);
        this.testResult = data;
      })
      .catch(error => {
        console.error('Fetch API error:', error);
        this.errorMessage = `Error con Fetch: ${error.message || 'Error desconocido'}`;
      });
  }
}
