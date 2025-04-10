import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

interface DirectUser {
  id: number;
  name: string;
  email: string;
  created: string;
}

@Component({
  selector: 'app-direct-test',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  template: `
    <mat-card class="test-card">
      <mat-card-header>
        <mat-card-title>Test Directo de Tabla Material</mat-card-title>
        <mat-card-subtitle>Renderiza datos sin depender de servicios externos</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <table mat-table [dataSource]="directUsers" class="mat-elevation-z8">
          <!-- ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let user">{{ user.id }}</td>
          </ng-container>
          
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let user">{{ user.name }}</td>
          </ng-container>
          
          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>
          
          <!-- Created Column -->
          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Creado</th>
            <td mat-cell *matCellDef="let user">{{ user.created }}</td>
          </ng-container>
          
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .test-card {
      max-width: 800px;
      margin: 20px auto;
    }
    
    table {
      width: 100%;
    }
  `]
})
export class DirectTestComponent {
  displayedColumns: string[] = ['id', 'name', 'email', 'created'];
  
  directUsers: DirectUser[] = [
    { id: 1, name: 'Direct User 1', email: 'direct1@example.com', created: '2023-06-01' },
    { id: 2, name: 'Direct User 2', email: 'direct2@example.com', created: '2023-06-02' },
    { id: 3, name: 'Direct User 3', email: 'direct3@example.com', created: '2023-06-03' },
    { id: 4, name: 'Direct User 4', email: 'direct4@example.com', created: '2023-06-04' },
    { id: 5, name: 'Direct User 5', email: 'direct5@example.com', created: '2023-06-05' }
  ];
}
