import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { CarritoService } from '../service/carrito.service';
import { firstValueFrom } from 'rxjs';

interface CompraRequest {
  idBanco: string;
  idFranquicia: string;
  idMetodoPago: number;
  numTarjeta: string;
  identificacion: string;
  idCliente: number;        // NUEVO
  valorDscto: number;       // NUEVO
  valorIva: number;         // NUEVO
  valorVenta: number;       // NUEVO
  fechaVenta?: string; 
  items: Array<{
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
  }>;
}

@Component({
  selector: 'app-metodo-pago',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './metodo-pago.component.html',
  styleUrls: ['./metodo-pago.component.css']
})
export class MetodoPagoComponent implements OnInit {
  private apiUrl = 'http://localhost:8181/api/transacciones';
  
  selectedMethod: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';

  // Campos comunes
  identificacion: string = '';
  cardNumber: string = '';
  expiry: string = '';
  cvv: string = '';
  cardName: string = '';

  bank: string = '';
  pseEmail: string = '';

  // Datos del carrito
  cartItems: any[] = [];
  total: number = 0;
  subtotal: number = 0;
  iva: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private carritoService: CarritoService
  ) {}

  async ngOnInit() {
    try {
      this.cartItems = this.carritoService.obtenerCarrito();
      if (this.cartItems.length === 0) {
        this.router.navigate(['/carrito']);
        return;
      }
      this.calcularTotales();
    } catch (error) {
      console.error('Error en ngOnInit:', error);
      this.error = error instanceof Error ? error.message : 'Error al inicializar el componente';
    }
  }

  calcularTotales() {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.precioVentaActual * item.cantidad), 0);
    this.iva = this.subtotal * 0.19;
    this.total = this.subtotal + this.iva;
  }

  private resetForm() {
    this.cardNumber = '';
    this.expiry = '';
    this.cvv = '';
    this.cardName = '';
    this.bank = '';
    this.pseEmail = '';
    this.error = '';
    this.loading = false;
    this.selectedMethod = '';
  }

  private validateCardPayment(): boolean {
    if (!this.identificacion.trim()) { this.error = 'La identificación es requerida'; return false; }
    if (!this.cardNumber.trim()) { this.error = 'El número de tarjeta es requerido'; return false; }
    if (!this.expiry.trim()) { this.error = 'La fecha de vencimiento es requerida'; return false; }
    if (!this.cvv.trim()) { this.error = 'El código CVV es requerido'; return false; }
    if (!this.cardName.trim()) { this.error = 'El nombre del titular es requerido'; return false; }

    if (!/^\d{16}$/.test(this.cardNumber.replace(/\s/g, ''))) { this.error = 'El número de tarjeta debe tener 16 dígitos'; return false; }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiry)) { this.error = 'La fecha de vencimiento debe tener el formato MM/YY'; return false; }
    if (!/^\d{3,4}$/.test(this.cvv)) { this.error = 'El CVV debe tener 3 o 4 dígitos'; return false; }

    return true;
  }

  private validatePSEPayment(): boolean {
    if (!this.identificacion.trim()) { this.error = 'La identificación es requerida'; return false; }
    if (!this.bank) { this.error = 'Debe seleccionar un banco'; return false; }
    if (!this.pseEmail) { this.error = 'El correo electrónico es requerido'; return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.pseEmail.trim())) { this.error = 'El correo electrónico no es válido'; return false; }
    return true;
  }

  async payWithCard(): Promise<void> {
    this.selectedMethod = 'card';
    if (this.validateCardPayment()) {
      await this.procesarCompra();
    }
  }

  async payWithPSE(): Promise<void> {
    this.selectedMethod = 'pse';
    if (this.validatePSEPayment()) {
      await this.procesarCompra();
    }
  }

  private resolveMetodoPagoTipoFromResponse(responseObj: any, txObj: any): string {
    // Try explicit metodoPago object in response
    const metodoFromRoot = responseObj?.metodoPago || responseObj?.metodo_pago || null;
    const metodoFromTx = txObj?.metodoPago || txObj?.metodo_pago || null;
    const mp = metodoFromRoot || metodoFromTx;

    const tipo =
      mp?.tipoPago ||
      mp?.tipo ||
      mp?.tipo_pago ||
      mp?.tipoPago ||
      null;

    if (tipo) return tipo;

    // fallback: check ids
    const idFromRoot = responseObj?.idMetodoPago || responseObj?.id_metodo_pago || null;
    const idFromTx = txObj?.idMetodoPago || txObj?.id_metodo_pago || txObj?.id_metodo_pago || null;
    const id = idFromRoot ?? idFromTx;

    if (id !== null && id !== undefined) {
      const nid = Number(id);
      if (!isNaN(nid)) {
        if (nid === 1) return 'Tarjeta';
        if (nid === 2) return 'PSE';
        return `Método ${nid}`;
      }
    }

    // last fallback: use referencia string if available
    const referencia =
      (mp && (mp.referencia || mp.reference)) ||
      txObj?.id_banco ||
      txObj?.idBanco ||
      'Desconocido';

    return referencia;
  }

  private parseFechaFromTx(txObj: any): string {
    return txObj?.fecha_hora || txObj?.fecha || txObj?.fechaHora || new Date().toISOString();
  }

  private parseValorFromTx(txObj: any): number {
    return txObj?.valor_tx || txObj?.valor || txObj?.total || 0;
  }

  private async procesarCompra() {
    if (this.loading) return; // evitar envíos dobles
    if (this.cartItems.length === 0) { this.error = 'No hay productos en el carrito'; return; }
    if (!this.selectedMethod) { this.error = 'Por favor seleccione un método de pago'; return; }
    if (!this.identificacion) { this.error = 'La identificación es requerida'; return; }

    this.loading = true;
    this.error = '';
    this.success = '';

try {
  // TODO: Reemplaza esta forma de obtener el idCliente por tu fuente real (login/sesión/servicio)
  const idCliente = Number(localStorage.getItem('idCliente') ?? 1); // <- ejemplo

  // Si manejas descuentos, cámbialo aquí:
  const valorDscto = 0;

  // Ya los calculas antes con calcularTotales():
  // this.subtotal = Σ(item.precioVentaActual * item.cantidad)
  // this.iva = this.subtotal * 0.19
  // this.total = this.subtotal + this.iva - valorDscto
  const valorIva = Math.round(this.iva);        // o mantén precisión según tu regla
  const valorVenta = Math.round(this.total);    // o precisión exacta si usas decimales

  const compraRequest: CompraRequest = {
    idBanco: this.selectedMethod === 'pse' ? this.bank : '',
    idFranquicia: this.selectedMethod === 'card' ? 'VISA' : '',
    idMetodoPago: this.selectedMethod === 'card' ? 1 : 2,
    numTarjeta: this.selectedMethod === 'card' ? this.cardNumber.replace(/\s/g, '') : '',
    identificacion: this.identificacion,

    // >>> NUEVOS CAMPOS PARA VENTA <<<
    idCliente: idCliente,
    valorDscto: valorDscto,
    valorIva: valorIva,
    valorVenta: valorVenta,
    // fechaVenta: new Date().toISOString().slice(0, 10), // opcional YYYY-MM-DD si el back lo requiere

    // Detalle de los ítems
    items: this.cartItems.map(item => ({
      idProducto: item.id,
      cantidad: item.cantidad,
      precioUnitario: item.precioVentaActual
    }))
  };




      console.log('Enviando datos de compra:', compraRequest);

      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      // Use any for the response to be flexible with backend DTO shape
      const response: any = await firstValueFrom(
        this.http.post<any>(
          `${this.apiUrl}/realizarCompra`,
          compraRequest,
          { headers, withCredentials: true } // envía cookies de sesión
        )
      );

      console.log('Respuesta de la compra:', response);

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // Manejar shapes diferentes: { success, transaccion, metodoPago } o { success, transaccion:{...} }
      if (!response.success) {
        const msg = response.message || 'Error al procesar la compra';
        throw new Error(msg);
      }

      const tx = response.transaccion || response.transaccionVenta || response.data || response; // flexible

      // Determinar metodoPago de forma segura
      const metodoPagoTipo = this.resolveMetodoPagoTipoFromResponse(response, tx);
      const fecha = this.parseFechaFromTx(tx);
      const valor = this.parseValorFromTx(tx);
      const txId = tx?.id ?? tx?.id_transaccion ?? tx?.idTransaccion ?? null;

      // Guardar resumen de transacción en localStorage
      localStorage.setItem('ultimaTransaccion', JSON.stringify({
        id: txId,
        fecha,
        total: valor,
        estado: tx?.estado,
        metodoPago: metodoPagoTipo
      }));

      // Vaciar carrito y reset UI
      this.carritoService.vaciarCarrito();
      this.cartItems = [];
      this.total = 0;
      this.subtotal = 0;
      this.iva = 0;
      this.resetForm();

      alert(`¡Compra realizada con éxito!\nID Transacción: ${txId}\nTotal: $${valor}\nMétodo: ${metodoPagoTipo}`);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error en la transacción:', error);
      const errorMessage = error instanceof HttpErrorResponse
        ? (error.error?.message || `Error del servidor (${error.status})`)
        : error instanceof Error
          ? error.message
          : 'Error desconocido';  
        alert('Error en la transacción: ' + errorMessage);

      this.error = errorMessage;
    } finally {
      this.loading = false;
    }
  }
}
