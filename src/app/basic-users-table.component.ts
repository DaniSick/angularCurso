import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UsuarioService, Usuario } from './usuario.service';

@Component({
  selector: 'app-basic-users-table',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div style="padding: 20px; max-width: 1000px; margin: 0 auto;">
      <h2 style="color: #3f51b5; text-align: center;">Tabla Básica de Usuarios</h2>
      
      <div *ngIf="loading" style="text-align: center; padding: 20px;">
        <p>Cargando datos...</p>
      </div>
      
      <div *ngIf="error" style="background-color: #ffebee; padding: 10px; border-radius: 4px; margin-bottom: 20px;">
        <p style="color: #c62828;">{{ error }}</p>
      </div>
      
      <div style="margin-bottom: 10px;">
        <button 
          (click)="loadUsers()" 
          style="background-color: #3f51b5; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Cargar Usuarios
        </button>
        
        <button 
          (click)="loadMockData()" 
          style="background-color: #ff4081; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
          Datos de Prueba
        </button>
      </div>
      
      <p>Total de registros: {{ users.length }}</p>
      
      <table style="width: 100%; border-collapse: collapse; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #3f51b5; color: white;">
            <th style="padding: 12px 15px; text-align: left;">ID</th>
            <th style="padding: 12px 15px; text-align: left;">Nombre</th>
            <th style="padding: 12px 15px; text-align: left;">Email</th>
            <th style="padding: 12px 15px; text-align: left;">Contraseña</th>
            <th style="padding: 12px 15px; text-align: left;">Creado</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users; let i = index" 
              [style.background-color]="i % 2 === 0 ? '#f9f9f9' : 'white'">
            <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">{{ user.id }}</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">{{ user.name }}</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">{{ user.email }}</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">{{ user.password }}</td>
            <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">{{ user.created_at | date:'medium' }}</td>
          </tr>
          <tr *ngIf="users.length === 0">
            <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
              No hay datos disponibles
            </td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 20px; background-color: #e8eaf6; padding: 10px; border-radius: 4px;">
        <h3 style="margin-top: 0;">Información de Depuración</h3>
        <p><strong>Estado de carga:</strong> {{ loading ? 'Cargando...' : 'Completado' }}</p>
        <p><strong>URL de la API:</strong> {{ apiUrl }}</p>
        <p><strong>Tiempo de la última carga:</strong> {{ lastLoadTime | date:'medium' }}</p>
      </div>
    </div>
  `
})
export class BasicUsersTableComponent implements OnInit {
  users: Usuario[] = [];
  loading = false;
  error: string | null = null;
  lastLoadTime: Date | null = null;
  apiUrl = 'http://localhost:3000/users';
  
  constructor(private usuarioService: UsuarioService) {
    console.log('BasicUsersTableComponent inicializado');
  }
  
  ngOnInit(): void {
    console.log('BasicUsersTableComponent: ngOnInit');
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.loading = true;
    this.error = null;
    console.log('Cargando usuarios desde API');
    
    this.usuarioService.getUsuarios(1, 10).subscribe({
      next: (response) => {
        console.log('API respuesta recibida:', response);
        if (response && response.users) {
          this.users = response.users;
          console.log(`${this.users.length} usuarios cargados correctamente`);
        } else if (Array.isArray(response)) {
          this.users = response;
          console.log(`${this.users.length} usuarios cargados (array directo)`);
        } else {
          console.error('Formato de respuesta desconocido:', response);
          this.error = 'Formato de datos inesperado en la respuesta';
          this.users = [];
        }
        
        this.loading = false;
        this.lastLoadTime = new Date();
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = `Error: ${err.message}`;
        this.users = [];
        this.loading = false;
        this.lastLoadTime = new Date();
      }
    });
  }
  
  loadMockData(): void {
    console.log('Cargando datos de prueba');
    this.users = [
      {
        id: 1,
        name: 'Usuario de Prueba 1',
        email: 'test1@example.com',
        password: 'password1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Usuario de Prueba 2',
        email: 'test2@example.com',
        password: 'password2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Usuario de Prueba 3',
        email: 'test3@example.com',
        password: 'password3',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.lastLoadTime = new Date();
    this.error = null;
  }
}