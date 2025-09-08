import { Libro } from "./Libro";
import { Prestamo } from "./Prestamo";
import { Autor } from "./Autor";
import { GestorNotificaciones, TipoNotificacion, PrioridadNotificacion } from "./Notificacion";

/** Duración en días de un préstamo */
type Duracion = number;

// ==================== SOCIO EXTENDIDO CON TODAS LAS FUNCIONALIDADES ====================
export class Socio {
  private prestamos: Prestamo[] = [];
  private historialLectura: Libro[] = []; // TAREA 5: Historial de lectura
  private gestorNotificaciones: GestorNotificaciones = new GestorNotificaciones();
  private multasPendientes: number = 0; // TAREA 2: Multas
  private fechaRegistro: Date = new Date();

  constructor(
    private _id: number,
    private _nombre: string,
    private _apellido: string,
    private _email?: string,
    private _telefono?: string
  ) {}

  // ==================== GETTERS BÁSICOS ====================
  get id(): number {
    return this._id;
  }

  get nombre(): string {
    return this._nombre;
  }

  get apellido(): string {
    return this._apellido;
  }

  get nombreCompleto(): string {
    return `${this._nombre} ${this._apellido}`;
  }

  get email(): string | undefined {
    return this._email;
  }

  get telefono(): string | undefined {
    return this._telefono;
  }

  get fechaRegistro(): Date {
    return this.fechaRegistro;
  }

  // ==================== GESTIÓN DE PRÉSTAMOS ====================

  /**
   * Retira un libro de la biblioteca
   * @param libro - Libro a retirar
   * @param duracion - Días de duración del préstamo
   * @throws Error si tiene multas pendientes
   */
  retirar(libro: Libro, duracion: Duracion): void {
    // TAREA 2: Verificar multas pendientes
    if (this.multasPendientes > 0) {
      throw new Error(`No puede retirar libros. Multas pendientes: ${this.multasPendientes}`);
    }

    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + duracion);
    const prestamo = new Prestamo(libro, vencimiento);
    this.prestamos.push(prestamo);

    // Notificar sobre el nuevo préstamo
    this.gestorNotificaciones.crearNotificacion(
      'renovacion_disponible',
      `Has retirado "${libro.titulo}". Vence el ${vencimiento.toLocaleDateString()}`,
      'baja'
    );
  }

  /**
   * Devuelve un libro a la biblioteca
   * @param libro - Libro a devolver
   * @returns El préstamo devuelto
   * @throws Error si el libro no está prestado
   */
  devolver(libro: Libro): Prestamo {
    const prestamo = this.tienePrestadoLibro(libro);
    if (!prestamo) {
      throw new Error("No tienes este libro prestado");
    }

    const indice = this.prestamos.indexOf(prestamo);
    this.prestamos.splice(indice, 1);

    // TAREA 5: Agregar al historial de lectura
    if (!this.historialLectura.some(l => l.isbn === libro.isbn)) {
      this.historialLectura.push(libro);
    }

    // TAREA 2: Calcular multa si está vencido
    if (prestamo.estaVencido()) {
      const multa = prestamo.calcularMulta();
      this.multasPendientes += multa;
      this.gestorNotificaciones.crearNotificacion(
        'multa_pendiente',
        `Multa generada por "${libro.titulo}": ${multa}. Total pendiente: ${this.multasPendientes}`,
        'alta'
      );
    }

    return prestamo;
  }

  /**
   * Verifica si tiene prestado un libro específico
   * @param libro - Libro a verificar
   * @returns El préstamo si lo tiene, null si no
   */
  tienePrestadoLibro(libro: Libro): Prestamo | null {
    return this.prestamos.find(p => p.libro === libro) ?? null;
  }

  /**
   * Obtiene todos los préstamos activos
   * @returns Array de préstamos
   */
  getLibrosPrestados(): Prestamo[] {
    return [...this.prestamos];
  }

  /**
   * Obtiene préstamos vencidos
   * @returns Array de préstamos vencidos
   */
  getLibrosVencidos(): Prestamo[] {
    return this.prestamos.filter(p => p.estaVencido());
  }

  /**
   * Obtiene préstamos que vencen pronto
   * @param dias - Días de anticipación
   * @returns Array de préstamos por vencer
   */
  getLibrosPorVencer(dias: number = 3): Prestamo[] {
    return this.prestamos.filter(p => {
      const diasRestantes = p.diasRestantes();
      return diasRestantes > 0 && diasRestantes <= dias;
    });
  }

  // ==================== TAREA 2: GESTIÓN DE MULTAS ====================

  /**
   * Calcula el total de multas pendientes incluyendo préstamos vencidos actuales
   * @returns Monto total de multas
   */
  calcularMultasPendientes(): number {
    let multas = this.multasPendientes;
    
    // Sumar multas de préstamos actualmente vencidos
    for (const prestamo of this.prestamos) {
      if (prestamo.estaVencido()) {
        multas += prestamo.calcularMulta();
      }
    }
    
    return multas;
  }

  /**
   * Paga una multa
   * @param monto - Monto a pagar
   * @throws Error si el monto es inválido
   */
  pagarMulta(monto: number): void {
    if (monto <= 0) {
      throw new Error("El monto debe ser positivo");
    }
    
    const multasAnteriores = this.multasPendientes;
    this.multasPendientes = Math.max(0, this.multasPendientes - monto);
    
    if (this.multasPendientes === 0 && multasAnteriores > 0) {
      this.gestorNotificaciones.crearNotificacion(
        'multa_pendiente',
        'Todas las multas han sido pagadas. Ya puedes retirar libros nuevamente',
        'media'
      );
    }
  }

  /**
   * Verifica si puede retirar libros (no tiene multas pendientes)
   * @returns true si puede retirar, false si no
   */
  puedeRetirarLibros(): boolean {
    return this.calcularMultasPendientes() === 0;
  }

  // ==================== TAREA 4: GESTIÓN DE NOTIFICACIONES ====================

  /**
   * Agrega una notificación manual
   * @param tipo - Tipo de notificación
   * @param mensaje - Mensaje
   * @param prioridad - Prioridad
   */
  agregarNotificacion(tipo: TipoNotificacion, mensaje: string, prioridad: PrioridadNotificacion = 'media'): void {
    this.gestorNotificaciones.crearNotificacion(tipo, mensaje, prioridad);
  }

  /**
   * Obtiene todas las notificaciones
   * @returns Array de notificaciones
   */
  getNotificaciones() {
    return this.gestorNotificaciones.getTodasLasNotificaciones();
  }

  /**
   * Obtiene notificaciones no leídas
   * @returns Array de notificaciones no leídas
   */
  getNotificacionesNoLeidas() {
    return this.gestorNotificaciones.getNotificacionesNoLeidas();
  }

  /**
   * Marca una notificación como leída
   * @param id - ID de la notificación
   */
  marcarNotificacionComoLeida(id: string): void {
    this.gestorNotificaciones.marcarComoLeida(id);
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasNotificacionesComoLeidas(): void {
    this.gestorNotificaciones.marcarTodasComoLeidas();
  }

  /**
   * Procesa notificaciones automáticas (libros vencidos, por vencer)
   */
  procesarNotificacionesAutomaticas(): void {
    // Notificar libros vencidos
    const vencidos = this.getLibrosVencidos();
    for (const prestamo of vencidos) {
      const diasVencido = prestamo.diasVencido();
      this.gestorNotificaciones.crearNotificacion(
        'libro_vencido',
        `"${prestamo.libro.titulo}" está vencido por ${diasVencido} días. Multa actual: ${prestamo.calcularMulta()}`,
        'alta'
      );
    }

    // Notificar libros por vencer
    const porVencer = this.getLibrosPorVencer();
    for (const prestamo of porVencer) {
      const diasRestantes = prestamo.diasRestantes();
      this.gestorNotificaciones.crearNotificacion(
        'renovacion_disponible',
        `"${prestamo.libro.titulo}" vence en ${diasRestantes} días`,
        'media'
      );
    }
  }

  // ==================== TAREA 5: HISTORIAL Y RECOMENDACIONES ====================

  /**
   * Obtiene el historial completo de lectura
   * @returns Array de libros leídos
   */
  getHistorialLectura(): Libro[] {
    return [...this.historialLectura];
  }

  /**
   * Obtiene los autores favoritos basado en cantidad de libros leídos
   * @returns Map con autores y cantidad de libros leídos
   */
  getAutoresFavoritos(): Map<Autor, number> {
    const autores = new Map<Autor, number>();
    
    for (const libro of this.historialLectura) {
      const count = autores.get(libro.autor) || 0;
      autores.set(libro.autor, count + 1);
    }
    
    // Ordenar por cantidad (más leídos primero)
    return new Map([...autores.entries()].sort((a, b) => b[1] - a[1]));
  }

  /**
   * Obtiene estadísticas de lectura
   * @returns Objeto con estadísticas
   */
  getEstadisticasLectura(): {
    librosLeidos: number;
    autoresUnicos: number;
    autorFavorito?: Autor;
    promedioLibrosPorMes: number;
  } {
    const autoresFavoritos = this.getAutoresFavoritos();
    const mesesActivo = this.getMesesDesdeRegistro();
    
    return {
      librosLeidos: this.historialLectura.length,
      autoresUnicos: autoresFavoritos.size,
      autorFavorito: autoresFavoritos.size > 0 ? Array.from(autoresFavoritos.keys())[0] : undefined,
      promedioLibrosPorMes: mesesActivo > 0 ? this.historialLectura.length / mesesActivo : 0
    };
  }

  /**
   * Obtiene géneros favoritos basado en palabras clave en títulos
   * @returns Map con palabras clave y frecuencia
   */
  getPalabrasClaveHistorial(): Map<string, number> {
    const palabrasClave = new Map<string, number>();
    
    for (const libro of this.historialLectura) {
      const palabras = libro.titulo.toLowerCase()
        .split(' ')
        .filter(palabra => palabra.length > 3); // Solo palabras de más de 3 caracteres
      
      for (const palabra of palabras) {
        const count = palabrasClave.get(palabra) || 0;
        palabrasClave.set(palabra, count + 1);
      }
    }
    
    return new Map([...palabrasClave.entries()].sort((a, b) => b[1] - a[1]));
  }

  /**
   * Verifica si ya leyó un libro
   * @param libro - Libro a verificar
   * @returns true si ya lo leyó, false si no
   */
  yaLeyoLibro(libro: Libro): boolean {
    return this.historialLectura.some(l => l.isbn === libro.isbn);
  }

  /**
   * Agrega un libro al historial manualmente (para casos especiales)
   * @param libro - Libro a agregar
   */
  agregarAlHistorial(libro: Libro): void {
    if (!this.yaLeyoLibro(libro)) {
      this.historialLectura.push(libro);
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Calcula meses desde el registro
   * @returns Número de meses
   */
  private getMesesDesdeRegistro(): number {
    const ahora = new Date();
    const meses = (ahora.getFullYear() - this.fechaRegistro.getFullYear()) * 12;
    return meses + (ahora.getMonth() - this.fechaRegistro.getMonth());
  }

  /**
   * Actualiza información de contacto
   * @param email - Nuevo email
   * @param telefono - Nuevo teléfono
   */
  actualizarContacto(email?: string, telefono?: string): void {
    if (email) this._email = email;
    if (telefono) this._telefono = telefono;
  }

  /**
   * Obtiene información completa del socio
   * @returns String con toda la información
   */
  getInformacionCompleta(): string {
    const estadisticas = this.getEstadisticasLectura();
    const multas = this.calcularMultasPendientes();
    
    return `${this.nombreCompleto} (ID: ${this._id})
Registro: ${this.fechaRegistro.toLocaleDateString()}
Contacto: ${this._email || 'No disponible'} | ${this._telefono || 'No disponible'}
Libros prestados: ${this.prestamos.length}
Libros leídos: ${estadisticas.librosLeidos}
Multas pendientes: ${multas}
Puede retirar libros: ${this.puedeRetirarLibros() ? 'Sí' : 'No'}
Notificaciones no leídas: ${this.getNotificacionesNoLeidas().length}`;
  }

  /**
   * Renueva un préstamo existente
   * @param libro - Libro a renovar
   * @param diasAdicionales - Días adicionales para el préstamo
   * @throws Error si no tiene el libro prestado o tiene multas
   */
  renovarPrestamo(libro: Libro, diasAdicionales: number = 14): void {
    if (!this.puedeRetirarLibros()) {
      throw new Error("No puede renovar préstamos con multas pendientes");
    }

    const prestamo = this.tienePrestadoLibro(libro);
    if (!prestamo) {
      throw new Error("No tienes este libro prestado");
    }

    if (prestamo.estaVencido()) {
      throw new Error("No se puede renovar un libro vencido. Debe devolverlo y pagar la multa");
    }

    prestamo.extenderPrestamo(diasAdicionales);
    
    this.gestorNotificaciones.crearNotificacion(
      'renovacion_disponible',
      `Has renovado "${libro.titulo}". Nueva fecha de vencimiento: ${prestamo.vencimiento.toLocaleDateString()}`,
      'baja'
    );
  }
}