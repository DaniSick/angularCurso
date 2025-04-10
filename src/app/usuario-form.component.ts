import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { Usuario } from './usuario.service';

interface DialogData {
  mode: 'create' | 'edit';
  usuario?: Usuario;
}

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Crear Usuario' : 'Editar Usuario' }}</h2>
    
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="form.controls['name'].hasError('required')">
            El nombre es obligatorio
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-error *ngIf="form.controls['email'].hasError('required')">
            El email es obligatorio
          </mat-error>
          <mat-error *ngIf="form.controls['email'].hasError('email')">
            Ingrese un email válido
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="password" type="password">
          <mat-error *ngIf="form.controls['password'].hasError('required')">
            La contraseña es obligatoria
          </mat-error>
          <mat-error *ngIf="form.controls['password'].hasError('minlength')">
            La contraseña debe tener al menos 6 caracteres
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          {{ data.mode === 'create' ? 'Crear' : 'Actualizar' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class UsuarioFormComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UsuarioFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.form = this.fb.group({
      name: [this.data.usuario?.name || '', Validators.required],
      email: [this.data.usuario?.email || '', [Validators.required, Validators.email]],
      password: [this.data.usuario?.password || '', [Validators.required, Validators.minLength(6)]]
    });

    // Si estamos editando, la contraseña podría ser opcional
    if (this.data.mode === 'edit') {
      this.form.controls['password'].setValidators([Validators.minLength(6)]);
      this.form.controls['password'].updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Crear un objeto con los datos del formulario
      const usuarioData: Partial<Usuario> = {
        name: this.form.value.name,
        email: this.form.value.email
      };
      
      // Solo añadir la contraseña si tiene valor
      if (this.form.value.password) {
        usuarioData.password = this.form.value.password;
      }
      
      this.dialogRef.close(usuarioData);
    }
  }
}
