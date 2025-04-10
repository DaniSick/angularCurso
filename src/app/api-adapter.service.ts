import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Usuario } from './usuario.service';

// Definición local de PaginatedResponse ya que no está exportada en usuario.service.ts
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
export class ApiAdapterService {
  private apiUrl = 'http://localhost:3000';
  
  constructor(private http: HttpClient) {}
  
  // Verifica la estructura de la API
  detectApiStructure(): Observable<{ 
    hasPagination: boolean, 
    userPath: string, 
    userIdProperty: string 
  }> {
    return this.http.get<any>(`${this.apiUrl}/users`).pipe(
      map(response => {
        // Detectar si la respuesta es un array o un objeto con paginación
        const hasPagination = !Array.isArray(response) && 
                             (response && 
                              typeof response === 'object' && 
                              ('users' in response || 
                              'data' in response || 
                              'items' in response));
        
        // Determinar la ruta para acceder a los usuarios
        let userPath = '';
        if (hasPagination) {
          if ('users' in response) userPath = 'users';
          else if ('data' in response) userPath = 'data';
          else if ('items' in response) userPath = 'items';
        }
        
        // Determinar el nombre de la propiedad ID
        let userIdProperty = 'id';
        const sampleUser = hasPagination && userPath
          ? (response as any)[userPath][0] 
          : Array.isArray(response) ? response[0] : null;
          
        if (sampleUser) {
          if ('id' in sampleUser) userIdProperty = 'id';
          else if ('_id' in sampleUser) userIdProperty = '_id';
          else if ('userId' in sampleUser) userIdProperty = 'userId';
        }
        
        return {
          hasPagination,
          userPath,
          userIdProperty
        };
      }),
      catchError(error => {
        console.error('Error detecting API structure:', error);
        return of({
          hasPagination: false,
          userPath: '',
          userIdProperty: 'id'
        });
      })
    );
  }
  
  // Método para ejecutar el seed de la base de datos manualmente
  runSeed(count: number = 100): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, { count }).pipe(
      catchError(error => {
        console.error('Error running seed:', error);
        return throwError(() => new Error('No se pudo ejecutar el seed de la base de datos'));
      })
    );
  }
}
