import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    MatTableModule,
    HttpClientModule, // Ensure HttpClientModule is imported
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
