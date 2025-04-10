import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, Sort } from '@angular/material/sort';
import { HttpClientModule } from '@angular/common/http';

import { UsuarioService, Usuario, PaginatedResponse } from './usuario.service';
import { UsuarioFormComponent } from './usuario-form.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSortModule
  ],
  template: `
    <div class="container">
      <h1>Gestión de Usuarios</h1>

      <div class="status-info" [ngClass]="{'db-connected': connectionStatus, 'db-error': !connectionStatus}">
        <p>
          <mat-icon>{{ connectionStatus ? 'cloud_done' : 'cloud_off' }}</mat-icon>
          <span>Base de datos {{ connectionStatus ? 'conectada' : 'desconectada' }}</span>
          <span class="connection-details">| PostgreSQL | Registros totales: {{ totalItems }}</span>
        </p>
      </div>
      
      <div class="actions">
        <button mat-raised-button color="primary" (click)="loadUsuarios()">
          <mat-icon>refresh</mat-icon> Recargar
        </button>
        <button mat-raised-button color="accent" (click)="openCreateDialog()">
          <mat-icon>person_add</mat-icon> Nuevo Usuario
        </button>
      </div>
      
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Cargando datos...</p>
      </div>
      
      <div *ngIf="errorMessage" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>{{ errorMessage }}</p>
        <button mat-raised-button color="primary" (click)="loadUsuarios()">Reintentar</button>
      </div>
      
      <div *ngIf="!isLoading && !errorMessage" class="table-container">
        <div *ngIf="dataSource.length === 0" class="no-data">
          <mat-icon color="warn" class="no-data-icon">warning</mat-icon>
          <p>No hay datos de usuarios disponibles.</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            Crear Usuario
          </button>
        </div>
        
        <div *ngIf="dataSource.length > 0">
          <p class="records-info">Mostrando {{ dataSource.length }} de {{ totalItems }} registros</p>
          
          <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let row">{{ row.id }}</td>
            </ng-container>
            
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let row">{{ row.name }}</td>
            </ng-container>
            
            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let row">{{ row.email }}</td>
            </ng-container>
            
            <!-- Created At Column -->
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef>Creado</th>
              <td mat-cell *matCellDef="let row">{{ row.created_at | date:'short' }}</td>
            </ng-container>
            
            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button color="primary" (click)="openEditDialog(row)" matTooltip="Editar usuario">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="openDeleteDialog(row)" matTooltip="Eliminar usuario">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <!-- Paginador -->
          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 50, 100]"
            [pageIndex]="currentPage - 1"
            (page)="handlePageEvent($event)"
            aria-label="Seleccionar página">
          </mat-paginator>
        </div>
      </div>
      
      <div *ngIf="showDebug" class="debug-info">
        <h3>Información de depuración</h3>
        <p>Página actual: {{ currentPage }} | Registros por página: {{ pageSize }}</p>
        <p>Total de registros: {{ totalItems }} | Total de páginas: {{ totalPages }}</p>
        <div *ngIf="dataSource.length > 0">
          <p>Primer registro:</p>
          <pre>{{ dataSource[0] | json }}</pre>
        </div>
        <div *ngIf="apiResponse">
          <p>Respuesta completa de API:</p>
          <pre>{{ apiResponse | json }}</pre>
        </div>
      </div>
      
      <div class="debug-toggle">
        <button mat-button color="primary" (click)="toggleDebug()">
          {{ showDebug ? 'Ocultar' : 'Mostrar' }} Depuración
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      color: #3f51b5;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .status-info {
      border-radius: 4px;
      padding: 8px 16px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .status-info p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    
    .connection-details {
      opacity: 0.8;
    }
    
    .db-connected {
      background-color: #e8f5e9;
      border: 1px solid #81c784;
    }
    
    .db-error {
      background-color: #ffebee;
      border: 1px solid #e57373;
    }
    
    .actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
    }
    
    .error-container {
      background-color: #ffebee;
      border: 1px solid #ef9a9a;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .no-data {
      text-align: center;
      padding: 30px;
      background-color: #f5f5f5;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
    
    .no-data-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }
    
    .table-container {
      overflow-x: auto;
      margin-bottom: 30px;
    }
    
    .records-info {
      margin: 10px 0;
      font-weight: bold;
      color: #3f51b5;
    }
    
    table {
      width: 100%;
    }
    
    th.mat-header-cell {
      background-color: #3f51b5;
      color: white;
      font-weight: bold;
      padding: 12px 8px;
    }
    
    td.mat-cell {
      padding: 12px 8px;
    }
    
    .mat-row:hover {
      background-color: #f5f5f5;
    }
    
    .debug-info {
      margin-top: 30px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .debug-info pre {
      background-color: #e8eaf6;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      max-height: 200px;
    }
    
    .debug-toggle {
      text-align: center;
      margin-top: 10px;
    }
  `]
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'created_at', 'actions'];
  dataSource: Usuario[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  connectionStatus: boolean = false;
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Depuración
  showDebug = false;
  apiError: any = null;
  apiResponse: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('AppComponent: Inicializando componente...');
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.apiError = null;
    this.apiResponse = null;
    
    console.log(`Cargando usuarios: página ${this.currentPage}, tamaño ${this.pageSize}`);
    
    this.usuarioService.getUsuarios(this.currentPage, this.pageSize).subscribe({
      next: (response: PaginatedResponse) => {
        console.log('Datos cargados:', response);
        
        // Guardar respuesta completa para depuración
        this.apiResponse = response;
        
        if (response && response.users) {
          this.dataSource = response.users;
          this.totalItems = response.total;
          this.totalPages = response.total_pages;
          
          console.log(`Mostrando ${this.dataSource.length} registros de un total de ${this.totalItems}`);
        } else {
          console.warn('Formato de respuesta inesperado:', response);
          this.dataSource = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
        
        this.isLoading = false;
        this.connectionStatus = true;
        
        if (this.dataSource.length === 0 && this.totalItems > 0) {
          // Si no hay datos en esta página pero hay registros totales,
          // probablemente estamos en una página sin resultados
          this.currentPage = 1;
          this.loadUsuarios();
        }
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.isLoading = false;
        this.connectionStatus = false;
        this.errorMessage = `Error al cargar datos: ${error.message}`;
        this.apiError = error;
        
        this.dataSource = [];
        this.totalItems = 0;
        this.totalPages = 0;
        
        // Mensaje de error más descriptivo
        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar al servidor. Asegúrate de que el backend esté en ejecución.';
        } else if (error.status === 404) {
          this.errorMessage = 'Ruta API no encontrada. Verifica la configuración del servidor.';
        }
      }
    });
  }

  handlePageEvent(event: PageEvent): void {
    console.log('Evento de paginación:', event);
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadUsuarios();
  }

  sortData(sort: Sort): void {
    // Esta función se implementaría si el backend soporta ordenamiento
    console.log('Ordenar por:', sort);
    this.loadUsuarios();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Creando usuario:', result);
        this.usuarioService.createUsuario(result).subscribe({
          next: () => {
            this.showSnackBar('Usuario creado correctamente');
            this.loadUsuarios();
          },
          error: (error) => {
            this.showSnackBar(`Error al crear usuario: ${error.message}`, true);
          }
        });
      }
    });
  }

  openEditDialog(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '500px',
      data: { mode: 'edit', usuario: {...usuario} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && usuario.id) {
        console.log('Actualizando usuario:', result);
        this.usuarioService.updateUsuario(usuario.id, result).subscribe({
          next: () => {
            this.showSnackBar('Usuario actualizado correctamente');
            this.loadUsuarios();
          },
          error: (error) => {
            this.showSnackBar(`Error al actualizar usuario: ${error.message}`, true);
          }
        });
      }
    });
  }

  openDeleteDialog(usuario: Usuario): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar al usuario ${usuario.name}?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && usuario.id) {
        console.log('Eliminando usuario:', usuario.id);
        this.usuarioService.deleteUsuario(usuario.id).subscribe({
          next: () => {
            this.showSnackBar('Usuario eliminado correctamente');
            this.loadUsuarios();
          },
          error: (error) => {
            this.showSnackBar(`Error al eliminar usuario: ${error.message}`, true);
          }
        });
      }
    });
  }

  showSnackBar(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  toggleDebug(): void {
    this.showDebug = !this.showDebug;
    console.log('Modo depuración:', this.showDebug ? 'activado' : 'desactivado');
  }
}
