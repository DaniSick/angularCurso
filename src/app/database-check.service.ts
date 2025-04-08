import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatabaseCheckService {
  private backendUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  checkDatabaseConnection(): Observable<boolean> {
    return this.http.get(`${this.backendUrl}/health`).pipe(
      timeout(5000), // 5 second timeout
      map(() => true),
      catchError(error => {
        console.error('Database connection check failed', error);
        return of(false);
      })
    );
  }

  getDatabaseStatus(): Observable<any> {
    return this.http.get(`${this.backendUrl}/status`).pipe(
      catchError(error => {
        console.error('Failed to get database status', error);
        return throwError(() => new Error('No se pudo obtener el estado de la base de datos'));
      })
    );
  }
}
