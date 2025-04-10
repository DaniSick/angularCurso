import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UsuarioService, Usuario } from './usuario.service';

/**
 * Data source para la tabla de usuarios que implementa paginación básica
 */
class UsersDataSource extends DataSource<Usuario> {
  private _dataStream = new BehaviorSubject<Usuario[]>([]);

  constructor() {
    super();
  }

  connect(): Observable<Usuario[]> {
    return this._dataStream.asObservable();
  }

  disconnect() {
    this._dataStream.complete();
  }

  get data(): Usuario[] {
    return this._dataStream.value;
  }

  set data(data: Usuario[]) {
    this._dataStream.next(data);
  }
}

@Component({
  selector: 'app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppComponent implements OnInit {
  // Estado actual de la aplicación
  loading = false;
  error: string | null = null;
  lastLoadTime = new Date();
  apiUrl = 'http://localhost:3000/api/users';
  
  // Variables para la paginación
  currentPage = 1;
  pageSize = 10;
  totalUsers = 0;
  totalPages = 0;
  
  // Datos y DataSource para la tabla
  dataSource = new UsersDataSource();
  lastApiResponse: any = null;
  
  constructor(private http: HttpClient, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga los usuarios desde la API
   */
  loadUsers(): void {
    this.loading = true;
    this.error = null;
    
    this.usuarioService.getUsuarios(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.lastLoadTime = new Date();
        this.lastApiResponse = response;
        
        try {
          if (response && Array.isArray(response.users)) {
            // Formato paginado esperado desde el backend
            this.dataSource.data = response.users;
            this.totalUsers = response.total || response.users.length;
          } else if (Array.isArray(response)) {
            // Array directo de usuarios
            this.dataSource.data = response;
            this.totalUsers = response.length;
          } else {
            throw new Error('Formato de respuesta inesperado');
          }
          
          // Calcular el total de páginas
          this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
          
          console.log(`Usuarios cargados: ${this.dataSource.data.length}`);
          console.log(`Total de usuarios: ${this.totalUsers}`);
          console.log(`Páginas: ${this.totalPages}`);
          
        } catch (error) {
          const err = error as Error;
          this.error = `Error al procesar los datos: ${err.message}`;
          console.error('Error procesando datos:', err);
          this.dataSource.data = [];
        }
      },
      error: (err) => {
        this.error = `Error al cargar usuarios: ${err.message}`;
        console.error('Error en API:', err);
        this.dataSource.data = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  
  /**
   * Carga datos de ejemplo para la tabla
   */
  loadMockData(): void {
    const mockUsers: Usuario[] = [];
    
    for (let i = 1; i <= 20; i++) {
      const date = new Date();
      mockUsers.push({
        id: i,
        name: `Usuario de Prueba ${i}`,
        email: `usuario${i}@ejemplo.com`,
        password: `clave${i}`,
        created_at: date.toISOString(),
        updated_at: date.toISOString()
      });
    }
    
    this.dataSource.data = mockUsers;
    this.totalUsers = mockUsers.length;
    this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    this.lastLoadTime = new Date();
    this.error = null;
    
    console.log('Datos de ejemplo cargados:', mockUsers.length);
  }
  
  /**
   * Cambia a la página especificada
   */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.loadUsers();
  }
  
  /**
   * Maneja el cambio de tamaño de página
   */
  onPageSizeChange(): void {
    this.currentPage = 1; // Resetear a primera página
    this.loadUsers();
  }
  
  /**
   * Abre el diálogo de creación de usuario
   */
  openCreateDialog(): void {
    // Implementación pendiente - Abrirá un diálogo para crear usuario
    alert('Funcionalidad de crear usuario en desarrollo');
  }
  
  /**
   * Abre el diálogo de edición de usuario
   */
  openEditDialog(usuario: Usuario): void {
    // Implementación pendiente - Abrirá un diálogo para editar usuario
    alert(`Editar usuario: ${usuario.name} (ID: ${usuario.id})`);
  }
  
  /**
   * Abre el diálogo de confirmación de eliminación
   */
  openDeleteDialog(usuario: Usuario): void {
    if (confirm(`¿Está seguro que desea eliminar al usuario: ${usuario.name}?`)) {
      this.eliminarUsuario(usuario.id || 0);
    }
  }
  
  /**
   * Elimina un usuario por su ID
   */
  eliminarUsuario(id: number): void {
    if (id <= 0) return;
    
    this.loading = true;
    this.usuarioService.deleteUsuario(id).subscribe({
      next: () => {
        console.log(`Usuario ${id} eliminado correctamente`);
        this.loadUsers(); // Recargar datos
      },
      error: (err) => {
        this.error = `Error al eliminar usuario: ${err.message}`;
        console.error('Error eliminando usuario:', err);
        this.loading = false;
      }
    });
  }
}
