import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../service/carrito.service';

interface Producto {
  id: number;
  referencia: string;
  descripcion: string;
  precioVentaActual: number;
  precioVentaAnterior?: number;
  fotoProducto: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  productos: Producto[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private carritoService: CarritoService
  ) {}

  ngOnInit(): void {
    this.http.get<Producto[]>('http://localhost:8181/producto/getAll')
      .subscribe({
        next: data => this.productos = data,
        error: err => {
          console.error('Error al cargar productos', err);
          alert('Error al cargar productos');
        }
      });
  }

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarProducto(producto);
    console.log('Añadido al carrito:', producto);
    this.router.navigate(['/carrito']);
  }

  trackById(index: number, item: Producto): number {
    return item.id;
  }

  onImgError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/default.png';
  }
}
