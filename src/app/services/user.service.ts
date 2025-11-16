import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  loginUsrio: string;
  correoUsuario: string;
  idTipoUsuario: string;
  intentos?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8181/usuario';

  constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile/${userId}`, {
      withCredentials: true
    });
  }

  updateProfile(userId: number, userData: any): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${userId}`, userData, {
      withCredentials: true
    });
  }

  changePassword(userId: number, passwords: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/password`, passwords, {
      withCredentials: true
    });
  }
} 