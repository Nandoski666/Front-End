// producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id: number;
  referencia: string;
  descripcion: string;
  precioVentaActual: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = 'http://localhost:8181/producto';

  constructor(private http: HttpClient) {}

  getAllProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/getAll`);
  }

  getProductoById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/getById/${id}`);
  }

  updateProducto(producto: Producto): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, producto);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/deleteProducto/${id}`);
  }
}
