import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router'; 

interface Producto {
  id: number;
  referencia: string;
  descripcion: string;
  precioVentaActual: number;
}

interface Cliente {
  id: number;
  loginUsrio: string;
  correoUsuario: string;
  intentos: number;
  idTipoUsuario: string;
  estado: number;
}

interface Transaccion {
  id: number;
  fechaHora: Date;
  estado: number;
  valorTx: number;
  identificacion: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  productos: Producto[] = [];
  clientes: Cliente[] = [];
  transacciones: Transaccion[] = [];
  nombreUsuario: string = '';
  loading = false;
  error: string | null = null;
  vistaActual: 'productos' | 'transacciones' | 'clientes' = 'productos';

  private baseUrl = 'http://localhost:8181';
  private baseProductoUrl = `${this.baseUrl}/producto`;
  private clientesUrl = `${this.baseUrl}/usuario/all`;
  private transaccionesUrl = `${this.baseUrl}/api/transacciones`;
  private reportsUrl = `${this.baseUrl}/api/reports`;

  constructor(
    private http: HttpClient,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  setVista(vista: 'productos' | 'transacciones' | 'clientes') {
    this.vistaActual = vista;
    if (vista === 'productos') this.cargarProductos();
    if (vista === 'transacciones') this.cargarTransacciones();
    if (vista === 'clientes') this.cargarClientes();
  }

  cargarDatosIniciales(): void {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const userData = JSON.parse(userSession);
      this.nombreUsuario = userData.loginUsrio || 'Admin';
    } catch (error) {
      console.error('Error al parsear datos de sesión:', error);
      this.nombreUsuario = 'Admin';
    }

    this.cargarProductos();
  }

  cargarProductos(): void {
    this.http.get<Producto[]>(`${this.baseProductoUrl}/getAll`).subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (err) => {
        alert('No se pudieron cargar los productos.');
      }
    });
  }

  cargarClientes(): void {
    this.http.get<Cliente[]>(this.clientesUrl).subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (err) => {
        alert('No se pudieron cargar los usuarios.');
      }
    });
  }

  cargarTransacciones(): void {
    this.http.get<any[]>(`${this.transaccionesUrl}/getAll`).subscribe({
      next: (data: any[]) => {
        console.log('Transacciones recibidas:', data);
        this.transacciones = data.map((tx: any) => ({
          id: tx.id ?? tx.idTransaccion ?? '',
          identificacion: tx.identificacion ?? tx.usuario ?? tx.cliente ?? '',
          fechaHora: tx.fechaHora ?? tx.fecha ?? tx.fechaTransaccion ?? '',
          estado: tx.estado ?? tx.status ?? '',
          valorTx: tx.valorTx ?? tx.valor ?? tx.monto ?? 0
        }));
      },
      error: (error: any) => {
        alert('No se pudieron cargar las transacciones.');
      }
    });
  }

  productoNuevo(): void {
    this.router.navigate(['/producto-nuevo']);
  }

  editarProducto(prod: Producto): void {
    this.router.navigate(['/editar-producto', prod.id]);
  }

  eliminarProducto(prod: Producto): void {
    if (!confirm(`¿Eliminar "${prod.referencia}"?`)) return;

    this.http.delete(`${this.baseProductoUrl}/deleteProducto/${prod.id}`).subscribe({
      next: () => {
        alert(`Producto "${prod.referencia}" eliminado correctamente.`);
        this.cargarProductos();
      },
      error: (err) => {
        alert('No se pudo eliminar el producto.');
      }
    });
  }

  descargarReporteVentas(): void {
    this.loading = true;
    this.error = null;

    const headers = new HttpHeaders({
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    this.http.get(`${this.transaccionesUrl}/download`, {
      headers: headers,
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        try {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'reporte_ventas.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.loading = false;
        } catch (error) {
          this.error = 'Error al procesar el archivo descargado.';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Error al descargar el reporte. Por favor, intente nuevamente.';
        this.loading = false;
        if (error.status === 401) {
          this.cerrarSesion();
        }
        if (error.error && error.error.message) {
          this.error = error.error.message;
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getEstadoTransaccion(estado: number): string {
    switch (estado) {
      case 1: return 'Aprobada';
      case 2: return 'Rechazada';
      case 3: return 'Pendiente';
      case 4: return 'Anulada';
      default: return 'Desconocido';
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('userSession');
    this.router.navigate(['/login']);
  }
}
