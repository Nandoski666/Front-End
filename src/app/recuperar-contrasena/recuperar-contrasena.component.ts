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
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.css']
})
export class RecuperarContrasenaComponent implements OnInit {
  recuperarForm!: FormGroup;
  mensaje: string = '';
  error: boolean = false;
  enviando: boolean = false;

  private apiUrl = 'http://localhost:8181/usuario';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recuperarForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email(): AbstractControl {
    return this.recuperarForm.get('email')!;
  }

  onSubmit(): void {
    this.recuperarForm.markAllAsTouched();
    if (this.recuperarForm.invalid) return;

    const correo = this.email.value;
    this.enviando = true;
    this.mensaje = '';
    this.error = false;

    const url = `${this.apiUrl}/recuperar-contrasena?correo=${encodeURIComponent(correo)}`;

    this.http.post(url, null).subscribe({
      next: () => {
        this.mensaje = 'Se envió una contraseña temporal a tu correo.';
        this.enviando = false;
        this.error = false;
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        if (err.status === 404) {
          this.mensaje = 'El correo no está registrado.';
        } else {
          this.mensaje = 'Hubo un error al intentar recuperar la contraseña.';
        }
        this.error = true;
        this.enviando = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/inicio']);
  }
}
