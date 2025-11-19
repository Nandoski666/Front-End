// registrarse.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-registrarse',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './registrarse.component.html',
  styleUrls: ['./registrarse.component.css']
})
export class RegistrarseComponent implements OnInit {
  regForm!: FormGroup;
  private usuarioUrl = 'http://localhost:8181/usuario';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient, 
  ) {}

  ngOnInit(): void {
    this.regForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      emailConfirm: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      direccion: ['', Validators.required]
    }, {
      validators: [
        this.matchFields('email', 'emailConfirm', 'email')
      ]
    });
  }

  private matchFields(f1: string, f2: string, errorKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const c1 = group.get(f1);
      const c2 = group.get(f2);
      if (!c1 || !c2) return null;
      const mismatch = c1.value !== c2.value;
      if (mismatch) {
        c2.setErrors({ [errorKey + 'Mismatch']: true });
        return { [errorKey + 'Mismatch']: true };
      } else if (c2.hasError(errorKey + 'Mismatch')) {
        delete c2.errors![errorKey + 'Mismatch'];
        if (!Object.keys(c2.errors!).length) {
          c2.setErrors(null);
        }
      }
      return null;
    };
  }

  get nombre() { return this.regForm.get('nombre')!; }
  get email() { return this.regForm.get('email')!; }
  get emailConfirm() { return this.regForm.get('emailConfirm')!; }
  get telefono() { return this.regForm.get('telefono')!; }
  get direccion() { return this.regForm.get('direccion')!; }

  onSubmit(): void {
    this.regForm.markAllAsTouched();
    if (this.regForm.invalid) {
      return;
    }

    const nuevoUsuario = {
      nombreUsuario: this.nombre.value,
      correoUsuario: this.email.value,
      telefonoUsuario: this.telefono.value
    };

    const nuevoCliente = {
      nombreCliente: this.nombre.value,
      correoCliente: this.email.value,
      telefono: this.telefono.value,
      estado: 1,
      direccionCliente: this.direccion.value
    };

    // Guardar en usuario
    this.http.post(`${this.usuarioUrl}/register`, nuevoUsuario).subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: err => {
        console.error('Error al registrar usuario:', err);
        alert('Error al registrar. Verifica los datos o intenta más tarde.');
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/inicio']);
  }
}

interface Usuario {
  nombreUsuario: string;
  correoUsuario: string;
  telefonoUsuario: string;
}

