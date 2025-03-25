import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { UsuarioService } from './usuario.service';

export interface IDataTable {
  nombre: string;
  posicion: number;
  peso: number;
  simbolo?: string;
  email?: string;
}

const ELEMENT_DATA: IDataTable[] = [
  {posicion: 1, nombre: 'Hydrogen', peso: 1.0079, email: 'H'},
  {posicion: 2, nombre: 'Helium', peso: 4.0026, email: 'He'},
  {posicion: 3, nombre: 'Lithium', peso: 6.941, email: 'Li'},
  {posicion: 4, nombre: 'Beryllium', peso: 9.0122, simbolo: 'Be'},
  {posicion: 5, nombre: 'Boron', peso: 10.811, simbolo: 'B'},
  {posicion: 6, nombre: 'Carbon', peso: 12.0107, simbolo: 'C'},
  {posicion: 7, nombre: 'Nitrogen', peso: 14.0067, simbolo: 'N'},
  {posicion: 8, nombre: 'Oxygen', peso: 15.9994, simbolo: 'O'},
  {posicion: 9, nombre: 'Fluorine', peso: 18.9984, simbolo: 'F'},
  {posicion: 10, nombre: 'Neon', peso: 20.1797, simbolo: 'Ne'},
];

@Component({
  selector: 'app-root',
  imports: [MatTableModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  usuarios: any[] = [];
  constructor(private usuarioService:UsuarioService){

  }
  ngOnInit(): void{
    //lo que este aqui va ser lo primero en ejecutarse al llamar el componente 
    this.usuarioService.getUsuarios().subscribe(data => {
          this.usuarios = data;
          console.log(this.usuarios);                                                                                                                                            
    })
  }
  displayedColumns: string[] = ['posicion', 'nombre', 'peso', 'simbolo', 'email']
  dataSource = ELEMENT_DATA;
  title = 'angularCurso';
}
