import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TestUser {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-simple-data-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2>Test Básico de Renderizado de Datos</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr>
            <th style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;">ID</th>
            <th style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;">Nombre</th>
            <th style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of testUsers">
            <td style="padding: 10px; border: 1px solid #ddd;">{{ user.id }}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ user.name }}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ user.email }}</td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 20px;">
        <p>Total de registros: {{ testUsers.length }}</p>
      </div>
    </div>
  `
})
export class SimpleDataTestComponent {
  testUsers: TestUser[] = [
    { id: 1, name: 'Test User 1', email: 'test1@example.com' },
    { id: 2, name: 'Test User 2', email: 'test2@example.com' },
    { id: 3, name: 'Test User 3', email: 'test3@example.com' }
  ];
}
