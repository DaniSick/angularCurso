import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap, throwError, timeout } from 'rxjs';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/users/'; // Ensure this matches the backend

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    console.log('Requesting data from:', this.apiUrl);
    
    return this.http.get<Usuario[]>(this.apiUrl)
      .pipe(
        timeout(10000), // 10 seconds timeout
        tap(response => {
          console.log('API Response Data Type:', typeof response);
          console.log('Is Array?', Array.isArray(response));
          console.log('Response Length:', Array.isArray(response) ? response.length : 'N/A');
          console.log('Sample Data:', response);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error Details:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      console.error('Client-side error:', error.error.message);
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      console.error('Server-side error:', error.status, error.message);
      
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el servidor backend esté corriendo.';
      } else if (error.status === 404) {
        errorMessage = 'Ruta de API no encontrada. Verifica la URL del backend.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
  
  // Método alternativo para obtener datos con un enfoque diferente
  getUsuariosAlternative(): Observable<Usuario[]> {
    return this.http.get(this.apiUrl, { 
      responseType: 'json',
      observe: 'response'
    }).pipe(
      tap(fullResponse => {
        console.log('Full HTTP Response:', fullResponse);
        console.log('Status:', fullResponse.status);
        console.log('Headers:', fullResponse.headers);
      }),
      map(response => response.body as Usuario[]),
      catchError(this.handleError)
    );
  }
}
