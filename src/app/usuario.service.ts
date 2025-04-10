import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

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

  constructor(private http: HttpClient) {
    console.log('UsuarioService inicializado - URL API:', this.apiUrl);
  }

  // Obtener usuarios con paginación
  getUsuarios(page: number = 1, perPage: number = 10): Observable<PaginatedResponse> {
    console.log(`UsuarioService: Solicitando datos desde: ${this.apiUrl} (página ${page}, ${perPage} por página)`);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      tap(response => console.log('Respuesta raw de la API:', response)),
      map(response => {
        console.log('Analizando respuesta API:', typeof response);
        
        // Si es un objeto con formato esperado
        if (response && typeof response === 'object' && 'users' in response) {
          console.log('Respuesta tiene formato paginado con propiedad users');
          return response as PaginatedResponse;
        }
        
        // Si es un array directo de usuarios
        if (Array.isArray(response)) {
          console.log('Respuesta es un array de usuarios, convirtiendo a formato paginado');
          const paginatedResponse: PaginatedResponse = {
            users: response,
            total: response.length,
            page: page,
            per_page: perPage,
            total_pages: Math.ceil(response.length / perPage)
          };
          return paginatedResponse;
        }
        
        // Si es un objeto pero no tiene el formato esperado
        if (response && typeof response === 'object') {
          console.warn('Respuesta es un objeto pero sin formato esperado:', response);
          
          // Intentar extraer users si existe como propiedad
          const users = response.users || response.data || response.results || [response];
          const usersArray = Array.isArray(users) ? users : [users];
          
          return {
            users: usersArray,
            total: usersArray.length,
            page: page,
            per_page: perPage,
            total_pages: Math.ceil(usersArray.length / perPage)
          };
        }
        
        // Si no se pudo interpretar
        console.error('No se pudo interpretar la respuesta:', response);
        return {
          users: [],
          total: 0,
          page: page,
          per_page: perPage,
          total_pages: 0
        };
      }),
      tap(processedResponse => {
        console.log('Respuesta procesada:', processedResponse);
        console.log(`Total usuarios: ${processedResponse.users.length}, Página: ${processedResponse.page}/${processedResponse.total_pages}`);
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
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
