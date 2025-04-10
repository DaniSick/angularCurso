import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

// Componentes de la aplicación (AppComponent ahora es standalone)
import { AppMainComponent } from './app.main.component';
import { NavigationComponent } from './navigation.component';

// Servicios
import { UsuarioService } from './usuario.service';

@NgModule({
  declarations: [
    // AppComponent ya no está aquí porque ahora es standalone
    AppMainComponent
  ],
  imports: [
    // Módulos core de Angular
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    
    // Componentes standalone
    NavigationComponent
  ],
  providers: [UsuarioService],
  bootstrap: [AppMainComponent]
})
export class AppModule { }
