import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/usuarios/';

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
