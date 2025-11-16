// app.routes.ts
import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { RegistrarseComponent } from './registrarse/registrarse.component';
import { RecuperarContrasenaComponent } from './recuperar-contrasena/recuperar-contrasena.component';
import { HomeComponent } from './home/home.component'; // Asegúrate de que exista este componente
import { CarritoComponent } from './carrito/carrito.component';
import {MetodoPagoComponent} from './metodo-pago/metodo-pago.component';
import { AdminComponent } from './admin/admin.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { ProductoNuevoComponent } from './producto-nuevo/producto-nuevo.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
import { AdminTransaccionesComponent } from './admin-transacciones/admin-transacciones.component';
import { AdminClientesComponent } from './admin-clientes/admin-clientes.component';

export const routes: Routes = [
  {
    path: '',
    component: InicioComponent
  },
    { path: 'recuperar-contrasena', 
        component: RecuperarContrasenaComponent 
    },
        { path: 'mi-perfil', 
        component: MiPerfilComponent 
    },




  {
    path: 'register',
    component: RegistrarseComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'mi-perfil',
    component: MiPerfilComponent
  },
  {
    path: 'carrito',
    component: CarritoComponent
  },
  {
    path:'metodo-pago',
    component: MetodoPagoComponent
  },
  {
    path:'producto-nuevo',
    component: ProductoNuevoComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      { path: '', component: AdminComponent }, // productos por defecto
      { path: 'transacciones', component: AdminTransaccionesComponent },
      { path: 'clientes', component: AdminClientesComponent }
    ]
  },
  {
  path: 'editar-producto',
    component: EditarProductoComponent
  },
  {
    path: '**',
    redirectTo: ''
  },
];
