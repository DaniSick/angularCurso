import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceApiService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Método para sembrar la base de datos
  seedDatabase(count: number = 100): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, { count });
  }

  // Método para verificar el estado de la base de datos
  checkDatabaseStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
