import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-simple-api-check',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div style="padding: 20px; border: 1px solid #ddd; margin: 20px; border-radius: 4px;">
      <h2>Diagnóstico Simple de API</h2>
      <p>URL de la API: {{ apiUrl }}</p>
      
      <button (click)="checkApi()" style="margin-right: 10px;">
        Verificar API
      </button>
      
      <div *ngIf="result" style="margin-top: 20px; background: #f5f5f5; padding: 10px; border-radius: 4px;">
        <h3>Resultado:</h3>
        <pre>{{ result | json }}</pre>
      </div>
      
      <div *ngIf="error" style="margin-top: 20px; background: #ffebee; padding: 10px; border-radius: 4px; color: #c62828;">
        <h3>Error:</h3>
        <p>{{ error }}</p>
      </div>
    </div>
  `
})
export class SimpleApiCheckComponent {
  apiUrl = 'http://localhost:3000/users';
  result: any = null;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  checkApi(): void {
    this.result = null;
    this.error = null;
    
    this.http.get(this.apiUrl).subscribe({
      next: (data) => {
        this.result = data;
        console.log('Datos recibidos de la API:', data);
      },
      error: (err) => {
        this.error = `Error: ${err.message}`;
        console.error('Error al verificar la API:', err);
      }
    });
  }
}
