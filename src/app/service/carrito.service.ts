import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: any[] = [];

  agregarProducto(producto: any): void {
    const carritoActual = this.obtenerCarrito();
    const index = carritoActual.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      carritoActual[index].cantidad += 1;
    } else {
      carritoActual.push({ ...producto, cantidad: 1 });
    }
    this.carrito = carritoActual;
    this.guardarCarrito();
  }

  obtenerCarrito(): any[] {
    const data = localStorage.getItem('carrito');
    this.carrito = data ? JSON.parse(data) : [];
    return this.carrito;
  }

  eliminarProducto(id: number): void {
    this.carrito = this.carrito.filter(p => p.id !== id);
    this.guardarCarrito();
  }

  vaciarCarrito(): void {
    this.carrito = [];
    localStorage.removeItem('carrito');
  }

  private guardarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }
  public constructor() {

  this.vaciarCarrito();

  }
}
