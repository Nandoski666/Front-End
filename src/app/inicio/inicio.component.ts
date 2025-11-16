import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ApiResponse {
  success: boolean;
  message?: string;
  usuario?: {
    id: number;
    loginUsrio?: string;
    correoUsuario?: string;
    idTipoUsuario?: number;
    estado?: number;
    intentos?: number;
  };
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  email: string = '';
  password: string = '';
  private apiUrl = 'http://localhost:8181/usuario';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const userData = JSON.parse(userSession);
        // Si tu backend no devuelve loginUsrio, ajusta aquí la comprobación
        if (userData && userData.loginUsrio === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      } catch (error) {
        console.error('Error parsing user session:', error);
        this.router.navigate(['/home']);
      }
    }
  }

  onLogin(): void {
    // Bypass local para admin (solo si realmente lo necesitas)
    if (this.email === 'admin@' && this.password === 'admin') {
      localStorage.setItem('userSession', JSON.stringify({ 
        loginUsrio: 'admin',
        correoUsuario: 'admin@'
      }));
      this.router.navigate(['/admin']);
      return;
    }

    const loginPayload = {
      correoUsuario: this.email,
      claveUsrio: this.password
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // petición con credenciales (envía/acepta cookies de sesión)
    this.http.post<ApiResponse>(`${this.apiUrl}/login`, loginPayload, { headers, withCredentials: true })
      .subscribe({
        next: (response) => {
          console.log('Respuesta login:', response);
          if (response && response.success && response.usuario) {
            // Guardar en localStorage la info del usuario para navegación en front
            localStorage.setItem('userSession', JSON.stringify(response.usuario));
            // Redirigir según tipo de usuario (ajusta si tu back devuelve idTipoUsuario)
            if (response.usuario.loginUsrio === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/home']);
            }
          } else {
            // Mensaje de error más claro si el back devuelve success=false
            const msg = response?.message || 'Credenciales inválidas';
            alert(msg);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error en login:', error);
          if (error.status === 401) {
            alert('Credenciales incorrectas.');
          } else if (error.status === 0) {
            alert('No se pudo conectar con el servidor. Revisa que el backend esté levantado.');
          } else {
            alert('Error al iniciar sesión. ' + (error.error?.message || 'Intenta de nuevo.'));
          }
        }
      });
  }

  irARegistro(): void {
    this.router.navigate(['/register']);
  }

  irARecuperarClave(): void {
    this.router.navigate(['/recuperar-contrasena']);
  }
}
