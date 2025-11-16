import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  id: number;
  correoUsuario: string;
  idTipoUsuario: string;
  estado?: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  usuario?: UserProfile;
}

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit {
  userProfile: UserProfile = {
    id: 0,
    correoUsuario: '',
    idTipoUsuario: ''
  };

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  isError: boolean = false;
  isSubmitting: boolean = false;

  private apiUrl = 'http://localhost:8181/usuario';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      this.router.navigate(['/inicio']);
      return;
    }

    try {
      const sessionData = JSON.parse(userSession);
      if (!sessionData.id) {
        this.router.navigate(['/inicio']);
        return;
      }

      this.userProfile = {
        id: sessionData.id,
        correoUsuario: sessionData.correoUsuario || '',
        idTipoUsuario: sessionData.idTipoUsuario || '',
        estado: sessionData.estado
      };

      this.loadUserProfile();
    } catch (error) {
      console.error('Error parsing user session:', error);
      this.router.navigate(['/inicio']);
    }
  }

  private getHttpOptions() {
    return { withCredentials: true };
  }

  loadUserProfile(): void {
    this.http.get<ApiResponse>(`${this.apiUrl}/profile/${this.userProfile.id}`, this.getHttpOptions())
      .subscribe({
        next: (response) => {
          if (response.success && response.usuario) {
            this.userProfile = { ...response.usuario };
            localStorage.setItem('userSession', JSON.stringify(this.userProfile));
          }
        },
        error: (error: HttpErrorResponse) => this.handleError(error)
      });
  }

  showMessage(msg: string, isError: boolean) {
    this.message = msg;
    this.isError = isError;
    setTimeout(() => {
      this.message = '';
      this.isError = false;
    }, 5000);
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      localStorage.removeItem('userSession');
      this.router.navigate(['/inicio']);
      return;
    }
    const message = error.error?.message || 'Ha ocurrido un error';
    this.showMessage(message, true);
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    if (!this.validateForm()) {
      this.isSubmitting = false;
      return;
    }

    this.updateProfile().then(() => {
      // ✅ AQUÍ SE LLAMA AL MÉTODO DEL BACKEND PARA CAMBIAR CONTRASEÑA
      if (this.shouldUpdatePassword()) {
        console.log("Llamando al backend para cambiar contraseña...");
        this.updatePassword();
      } else {
        this.isSubmitting = false;
      }
    }).catch(() => this.isSubmitting = false);
  }

  private validateForm(): boolean {
    if (!this.userProfile.correoUsuario?.trim()) {
      this.showMessage('El correo electrónico es requerido', true);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userProfile.correoUsuario.trim())) {
      this.showMessage('Por favor, ingresa un correo electrónico válido', true);
      return false;
    }
    if (this.shouldUpdatePassword()) {
      if (!this.currentPassword) {
        this.showMessage('Debes ingresar tu contraseña actual', true);
        return false;
      }
      if (!this.newPassword) {
        this.showMessage('Debes ingresar una nueva contraseña', true);
        return false;
      }
      if (!this.confirmPassword) {
        this.showMessage('Debes confirmar la nueva contraseña', true);
        return false;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.showMessage('Las contraseñas nuevas no coinciden', true);
        return false;
      }
      if (this.newPassword.length < 8) {
        this.showMessage('La nueva contraseña debe tener al menos 8 caracteres', true);
        return false;
      }
    }
    return true;
  }

  private shouldUpdatePassword(): boolean {
    return !!(this.newPassword && this.currentPassword && this.confirmPassword);
  }

  private async updateProfile(): Promise<void> {
    try {
      const updateData = { correoUsuario: this.userProfile.correoUsuario.trim() };
      const response = await this.http.put<ApiResponse>(
        `${this.apiUrl}/${this.userProfile.id}`,
        updateData,
        this.getHttpOptions()
      ).toPromise();

      if (response && response.success) {
        this.showMessage('Perfil actualizado correctamente', false);
        this.loadUserProfile();
      } else {
        throw new Error(response?.message || 'No se recibió respuesta del servidor');
      }
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  private async updatePassword(): Promise<void> {
    try {
      const passwordData = {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      };

      // ✅ AQUÍ SE HACE LA LLAMADA AL BACKEND PARA CAMBIAR CONTRASEÑA
      const response = await this.http.put<ApiResponse>(
        `${this.apiUrl}/${this.userProfile.id}/password`,
        passwordData,
        this.getHttpOptions()
      ).toPromise();

      if (response && response.success) {
        this.showMessage(response.message || 'Contraseña actualizada correctamente', false);
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.loadUserProfile();
      } else {
        throw new Error(response?.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      if (httpError.status === 401) {
        this.showMessage('La contraseña actual es incorrecta', true);
      } else {
        this.handleError(httpError);
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  logout(): void {
    localStorage.removeItem('userSession');
    this.router.navigate(['/inicio']);
  }
}