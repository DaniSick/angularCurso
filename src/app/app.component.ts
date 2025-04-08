import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz simple para nuestros datos
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Lista de Usuarios</h1>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let usuario of usuarios">
            <td>{{usuario.id}}</td>
            <td>{{usuario.nombre}}</td>
            <td>{{usuario.email}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 20px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    tr:hover {
      background-color: #f1f1f1;
    }
  `]
})
export class AppComponent {
  // Datos de ejemplo
  usuarios: Usuario[] = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
    { id: 2, nombre: 'María García', email: 'maria@example.com' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com' }
  ];
}
