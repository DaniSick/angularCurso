import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { UsuarioService, Usuario } from './usuario.service';

@Component({
  selector: 'app-component',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'password', 'created_at', 'updated_at', 'actions'];
  dataSource: Usuario[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalItems = 0;
  
  constructor(
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('AppComponent initialized');
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    console.log('Loading users from API');
    
    this.usuarioService.getUsuarios(this.currentPage + 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('API response:', response);
        if (response && response.users) {
          this.dataSource = response.users;
          this.totalItems = response.total;
          console.log(`Loaded ${this.dataSource.length} users out of ${this.totalItems}`);
        } else {
          console.warn('Unexpected API response format');
          this.dataSource = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = `Error loading users: ${error.message}`;
        this.isLoading = false;
        this.dataSource = [];
      }
    });
  }
  
  loadMockData(): void {
    this.dataSource = [
      {
        id: 1,
        name: 'Example User',
        email: 'example@test.com',
        password: 'securepassword',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Another User',
        email: 'another@test.com',
        password: 'anotherpassword',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.totalItems = this.dataSource.length;
    this.currentPage = 0;
    this.showMessage('Datos de ejemplo cargados');
  }
  
  handlePageEvent(event: PageEvent): void {
    console.log('Page event:', event);
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
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}
