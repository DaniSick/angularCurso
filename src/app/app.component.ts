import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { UsuarioService, Usuario } from './usuario.service';

@Component({
  selector: 'app-component',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'password', 'created_at', 'updated_at', 'actions'];
  dataSource: Usuario[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  totalItems = 0;
  
  constructor(
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {
    console.log('AppComponent constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('AppComponent ngOnInit ejecutado');
    setTimeout(() => {
      this.loadUsers();
    }, 500);
  }
  
  ngAfterViewInit(): void {
    console.log('AppComponent ngAfterViewInit ejecutado');
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    console.log('Cargando usuarios desde API...');
    
    this.usuarioService.getUsuarios(this.currentPage + 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Respuesta API obtenida:', response);
        if (response && response.users) {
          this.dataSource = response.users;
          this.totalItems = response.total;
          console.log(`Cargados ${this.dataSource.length} usuarios de ${this.totalItems} totales`);
        } else if (Array.isArray(response)) {
          // Si la respuesta es un array simple
          this.dataSource = response;
          this.totalItems = response.length;
          console.log(`Cargados ${this.dataSource.length} usuarios (array directo)`);
        } else {
          console.warn('Formato de respuesta API inesperado:', response);
          this.dataSource = [];
          this.errorMessage = 'Formato de datos inesperado';
        }
        this.isLoading = false;
        
        // Si no hay datos, mostrar mensaje de depuración
        if (this.dataSource.length === 0) {
          console.warn('No se encontraron datos de usuarios en la respuesta');
          this.showMessage('No se encontraron usuarios en la base de datos', false);
        }
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.errorMessage = `Error al cargar usuarios: ${error.message}`;
        this.isLoading = false;
        this.dataSource = [];
      }
    });
  }
  
  loadMockData(): void {
    console.log('Cargando datos de ejemplo...');
    this.dataSource = [
      {
        id: 1,
        name: 'Usuario Ejemplo',
        email: 'ejemplo@test.com',
        password: 'contraseña123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Otro Usuario',
        email: 'otro@test.com',
        password: 'otraclave456',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Tercer Usuario',
        email: 'tercero@test.com',
        password: 'clave789',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.totalItems = this.dataSource.length;
    this.currentPage = 0;
    this.showMessage('Datos de ejemplo cargados correctamente');
  }
  
  testRenderizing(): void {
    console.log('Probando renderizado...');
    this.showMessage('Probando renderizado: ' + (this.dataSource.length > 0 ? 'Hay datos' : 'No hay datos'));
    console.log('Estado actual:');
    console.log('- isLoading:', this.isLoading);
    console.log('- errorMessage:', this.errorMessage);
    console.log('- dataSource.length:', this.dataSource.length);
    console.log('- displayedColumns:', this.displayedColumns);
    
    // Comprobar si hay datos
    if (this.dataSource.length > 0) {
      console.log('Primer registro:', this.dataSource[0]);
    }
    
    // Intentar cargar datos de ejemplo para verificar si el problema es de renderizado
    if (this.dataSource.length === 0) {
      this.loadMockData();
    }
  }
  
  handlePageEvent(event: PageEvent): void {
    console.log('Evento de paginación:', event);
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadUsers();
  }
  
  eliminarUsuario(id: number): void {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.usuarioService.deleteUsuario(id).subscribe({
        next: () => {
          this.showMessage('Usuario eliminado con éxito');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error eliminando usuario:', error);
          this.showMessage(`Error al eliminar: ${error.message}`, true);
        }
      });
    }
  }
  
  showMessage(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}
