import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatabaseConfigService {
  // Configuración para la base de datos PostgreSQL que se está ejecutando
  // según la información de 'docker ps -a'
  private config = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    apiUrl: 'http://localhost:3000'
  };

  getConfig() {
    return { ...this.config };
  }

  getApiUrl() {
    return this.config.apiUrl;
  }
}
