import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface Usuario {
  id?: number;
  name: string;
  email: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse {
  users: Usuario[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl: string = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // Obtener usuarios con paginación
  getUsuarios(page: number = 1, perPage: number = 10): Observable<PaginatedResponse> {
    console.log(`UsuarioService: Solicitando datos desde: ${this.apiUrl} (página ${page}, ${perPage} por página)`);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('Respuesta original del API:', response);
        
        // Si la respuesta ya tiene el formato esperado
        if (response && typeof response === 'object' && response.users) {
          console.log('Respuesta en formato paginado:', response);
          return response as PaginatedResponse;
        }
        
        // Si la respuesta es un array simple, adaptarlo al formato paginado
        if (Array.isArray(response)) {
          console.log('Respuesta es un array, adaptando a formato paginado');
          return {
            users: response,
            total: response.length,
            page: 1,
            per_page: response.length,
            total_pages: 1
          };
        }
        
        // Fallback para cualquier otro formato
        console.warn('Formato inesperado de respuesta:', response);
        return {
          users: Array.isArray(response) ? response : [response],
          total: Array.isArray(response) ? response.length : 1,
          page: 1,
          per_page: 10,
          total_pages: 1
        };
      }),
      catchError(this.handleError)
    );
  }

  // Obtener un usuario por ID
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo usuario
  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un usuario existente
  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un usuario
  deleteUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error detallado de la API:', error);
    
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el servidor backend esté corriendo.';
      } else if (error.status === 404) {
        errorMessage = 'Ruta de API no encontrada. Verifica la URL del backend.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
