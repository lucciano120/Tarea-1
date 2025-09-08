import { Libro } from "./Libro";
import { Prestamo } from "./Prestamo";
import { Autor } from "./Autor";
import { GestorNotificaciones, TipoNotificacion, PrioridadNotificacion } from "./Notificacion";

/** Duración en días de un préstamo */
type Duracion = number;

// ==================== SOCIO EXTENDIDO CON TODAS LAS FUNCIONALIDADES ====================
export class Socio {
  private prestamos: