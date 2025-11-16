import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css']
})
export class EditarProductoComponent implements OnInit {
  id!: number;
  producto: any = {};

  private apiUrl = 'http://localhost:8181/SHOPYSHOP/producto';

  @ViewChild('referenciaInput') referenciaInput!: ElementRef;
  @ViewChild('descripcionInput') descripcionInput!: ElementRef;
  @ViewChild('precioInput') precioInput!: ElementRef;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.cargarProducto();
  }

  cargarProducto(): void {
    this.http.get<any>(`${this.apiUrl}/findRecord/${this.id}`).subscribe({
      next: (prod) => {
        this.producto = prod;
        setTimeout(() => {
          this.referenciaInput.nativeElement.value = prod.referencia;
          this.descripcionInput.nativeElement.value = prod.descripcion;
          this.precioInput.nativeElement.value = prod.precioVentaActual;
        });
      },
      error: () => {
        alert('Error cargando el producto.');
        this.router.navigate(['/admin']);
      }
    });
  }

  onSubmit(): void {
    const productoActualizado = {
      id: this.id,
      referencia: this.referenciaInput.nativeElement.value,
      descripcion: this.descripcionInput.nativeElement.value,
      precioVentaActual: parseFloat(this.precioInput.nativeElement.value)
    };

    this.http.put(`${this.apiUrl}/update`, productoActualizado).subscribe({
      next: () => {
        alert('Producto actualizado correctamente.');
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar el producto.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin']);
  }
}
