import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-producto-nuevo',
  templateUrl: './producto-nuevo.component.html',
  styleUrls: ['./producto-nuevo.component.css']
})
export class ProductoNuevoComponent {

  private apiUrl = 'http://localhost:8181/producto/saveProducto';

  constructor(private http: HttpClient) {}

  guardarProducto(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const producto = {
      idCategoria: Number((form.elements.namedItem('id_categoria') as HTMLInputElement).value),
      referencia: (form.elements.namedItem('referencia') as HTMLInputElement).value,
      descripcion: (form.elements.namedItem('descripcion') as HTMLInputElement).value,
      existencia: Number((form.elements.namedItem('existencia') as HTMLInputElement).value),
      precioVentaActual: Number((form.elements.namedItem('precio_venta_actual') as HTMLInputElement).value),
      precioVentaAnterior: Number((form.elements.namedItem('precio_venta_anterior') as HTMLInputElement).value) || 0,
      costoCompra: Number((form.elements.namedItem('costo_compra') as HTMLInputElement).value),
      tieneIva: (form.elements.namedItem('tiene_iva') as HTMLInputElement).checked ? 1 : 0,
      stockMaximo: Number((form.elements.namedItem('stock_maximo') as HTMLInputElement).value) || 0,
      fotoProducto: (form.elements.namedItem('foto_producto') as HTMLInputElement).value || '',
      estado: Number((form.elements.namedItem('estado') as HTMLInputElement).value),
    };

    this.http.post(this.apiUrl, producto).subscribe({
      next: (response) => {
        console.log('Producto guardado en backend:', response);
        alert('Producto guardado correctamente');
        form.reset();
      },
      error: (err) => {
        console.error('Error al guardar producto:', err);
        alert('Hubo un error al guardar el producto');
      }
    });
  }
}
