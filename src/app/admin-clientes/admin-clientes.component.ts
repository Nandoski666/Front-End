import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Cliente {
  id: number;
  loginUsrio: string;
  correoUsuario: string;
  intentos: number;
  idTipoUsuario: string;
  estado: number;
}

@Component({
  selector: 'shp-admin-clientes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin-clientes.component.html',
  styleUrl: './admin-clientes.component.css'
})
export class AdminClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = false;
  error: string | null = null;

  private clientesUrl = 'http://localhost:8181/usuario/all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.http.get<any[]>(this.clientesUrl).subscribe({
      next: (data: any[]) => {
        this.clientes = data.map((cli: any) => ({
          id: cli.id ?? cli.idUsuario ?? '',
          loginUsrio: cli.loginUsrio ?? cli.usuario ?? '',
          correoUsuario: cli.correoUsuario ?? cli.email ?? '',
          intentos: cli.intentos ?? cli.intentosLogin ?? cli.loginAttempts ?? 0,
          idTipoUsuario: cli.idTipoUsuario ?? '',
          estado: cli.estado ?? ''
        }));
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.loading = false;
      }
    });
  }
}
