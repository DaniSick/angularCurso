import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Usuario {
  id?: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  users: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene usuarios con paginación
   * @param page Número de página (comienza en 1)
   * @param limit Cantidad de elementos por página
   * @returns Observable con la respuesta paginada
   */
  getUsuarios(page = 1, limit = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<PaginatedResponse<Usuario> | Usuario[]>(this.apiUrl, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Observable con el usuario
   */
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Crea un nuevo usuario
   * @param usuario Datos del nuevo usuario
   * @returns Observable con el usuario creado
   */
  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param usuario Datos actualizados
   * @returns Observable con el usuario actualizado
   */
  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un usuario
   * @param id ID del usuario a eliminar
   * @returns Observable con la respuesta de eliminación
   */
  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
      
      // Mensajes personalizados según código de error
      if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado';
      } else if (error.status === 403) {
        errorMessage = 'Acceso prohibido';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
