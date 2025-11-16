import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Transaccion {
  id: number;
  fechaHora: string;
  estado: number | string;
  valorTx: number;
  identificacion: string;
}

@Component({
  selector: 'shp-admin-transacciones',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin-transacciones.component.html',
  styleUrl: './admin-transacciones.component.css'
})
export class AdminTransaccionesComponent implements OnInit {
  transacciones: Transaccion[] = [];
  loading = false;
  error: string | null = null;

  private transaccionesUrl = 'http://localhost:8181/pi/transacciones/getAll';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarTransacciones();
  }

  cargarTransacciones(): void {
    this.http.get<any[]>(this.transaccionesUrl).subscribe({
      next: (data: any[]) => {
        this.transacciones = data.map((tx: any) => ({
          id: tx.id ?? tx.idTransaccion ?? '',
          identificacion: tx.identificacion ?? tx.usuario ?? tx.cliente ?? '',
          fechaHora: tx.fechaHora ?? tx.fecha ?? tx.fechaTransaccion ?? '',
          estado: tx.estado ?? tx.status ?? '',
          valorTx: tx.valorTx ?? tx.valor ?? tx.monto ?? 0
        }));
      },
      error: (error: any) => {
        this.error = 'No se pudieron cargar las transacciones.';
      }
    });
  }

  getEstadoTransaccion(estado: number | string): string {
    switch (estado) {
      case 1:
      case '1': return 'Aprobada';
      case 2:
      case '2': return 'Rechazada';
      case 3:
      case '3': return 'Pendiente';
      case 4:
      case '4': return 'Anulada';
      default: return 'Desconocido';
    }
  }
}
