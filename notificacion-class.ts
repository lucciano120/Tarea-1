// ==================== SISTEMA DE NOTIFICACIONES ====================

export type TipoNotificacion = 
  | 'libro_vencido' 
  | 'reserva_disponible' 
  | 'evento_proximo' 
  | 'multa_pendiente'
  | 'evento_cancelado'
  | 'renovacion_disponible'
  | 'nuevo_libro_autor_favorito';

export type PrioridadNotificacion = 'alta' | 'media' | 'baja';

export class Notificacion {
  private _id: string;
  private _fechaCreacion: Date;

  constructor(
    public tipo: TipoNotificacion,
    public mensaje: string,
    public prioridad: PrioridadNotificacion = 'media',
    public leida: boolean = false,
    public datos?: any // Para almacenar datos adicionales específicos del tipo
  ) {
    this._id = this.generarId();
    this._fechaCreacion = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  /**
   * Marca la notificación como leída
   */
  marcarComoLeida(): void {
    this.leida = true;
  }

  /**
   * Marca la notificación como no leída
   */
  marcarComoNoLeida(): void {
    this.leida = false;
  }

  /**
   * Verifica si la notificación es reciente (menos de 24 horas)
   * @returns true si es reciente, false si no
   */
  esReciente(): boolean {
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);
    return this._fechaCreacion > hace24Horas;
  }

  /**
   * Obtiene la antigüedad de la notificación en días
   * @returns Días desde que se creó la notificación
   */
  getAntiguedadEnDias(): number {
    const diferencia = new Date().getTime() - this._fechaCreacion.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene el icono correspondiente al tipo de notificación
   * @returns String con el icono de la notificación
   */
  getIcono(): string {
    const iconos = {
      'libro_vencido': '⚠️',
      'reserva_disponible': '📚',
      'evento_proximo': '📅',
      'multa_pendiente': '💰',
      'evento_cancelado': '❌',
      'renovacion_disponible': '🔄',
      'nuevo_libro_autor_favorito': '⭐'
    };
    
    return iconos[this.tipo] || '📋';
  }

  /**
   * Obtiene el color de prioridad para UI
   * @returns String con código de color
   */
  getColorPrioridad(): string {
    const colores = {
      'alta': '#ff4757',
      'media': '#ffa502',
      'baja': '#747d8c'
    };
    
    return colores[this.prioridad];
  }

  /**
   * Convierte la notificación a formato JSON
   * @returns Objeto con la información de la notificación
   */
  toJSON(): object {
    return {
      id: this._id,
      tipo: this.tipo,
      mensaje: this.mensaje,
      prioridad: this.prioridad,
      leida: this.leida,
      fechaCreacion: this._fechaCreacion.toISOString(),
      datos: this.datos
    };
  }

  /**
   * Obtiene información completa de la notificación
   * @returns String formateado con todos los detalles
   */
  getInformacionCompleta(): string {
    const estado = this.leida ? '✓ Leída' : '● No leída';
    const antiguedad = this.getAntiguedadEnDias();
    const tiempoTexto = antiguedad === 0 ? 'Hoy' : 
                       antiguedad === 1 ? 'Ayer' : 
                       `Hace ${antiguedad} días`;

    return `${this.getIcono()} ${this.mensaje}
${estado} | Prioridad: ${this.prioridad} | ${tiempoTexto}`;
  }

  /**
   * Verifica si la notificación debe expirar
   * @param diasExpiracion - Días después de los cuales expira
   * @returns true si debe expirar, false si no
   */
  debeExpirar(diasExpiracion: number = 30): boolean {
    return this.getAntiguedadEnDias() > diasExpiracion;
  }

  /**
   * Genera un ID único para la notificación
   * @returns String con ID único
   */
  private generarId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== GESTOR DE NOTIFICACIONES ====================
export class GestorNotificaciones {
  private notificaciones: Notificacion[] = [];

  /**
   * Agrega una nueva notificación
   * @param notificacion - Notificación a agregar
   */
  agregarNotificacion(notificacion: Notificacion): void {
    this.notificaciones.unshift(notificacion); // Agregar al inicio
    this.limpiarNotificacionesExpiradas();
  }

  /**
   * Crea y agrega una notificación
   * @param tipo - Tipo de notificación
   * @param mensaje - Mensaje de la notificación
   * @param prioridad - Prioridad de la notificación
   * @param datos - Datos adicionales
   * @returns La notificación creada
   */
  crearNotificacion(
    tipo: TipoNotificacion, 
    mensaje: string, 
    prioridad: PrioridadNotificacion = 'media',
    datos?: any
  ): Notificacion {
    const notificacion = new Notificacion(tipo, mensaje, prioridad, false, datos);
    this.agregarNotificacion(notificacion);
    return notificacion;
  }

  /**
   * Obtiene todas las notificaciones
   * @returns Array de notificaciones
   */
  getTodasLasNotificaciones(): Notificacion[] {
    return [...this.notificaciones];
  }

  /**
   * Obtiene solo las notificaciones no leídas
   * @returns Array de notificaciones no leídas
   */
  getNotificacionesNoLeidas(): Notificacion[] {
    return this.notificaciones.filter(n => !n.leida);
  }

  /**
   * Obtiene notificaciones por tipo
   * @param tipo - Tipo de notificación a filtrar
   * @returns Array de notificaciones del tipo especificado
   */
  getNotificacionesPorTipo(tipo: TipoNotificacion): Notificacion[] {
    return this.notificaciones.filter(n => n.tipo === tipo);
  }

  /**
   * Obtiene notificaciones por prioridad
   * @param prioridad - Prioridad a filtrar
   * @returns Array de notificaciones con la prioridad especificada
   */
  getNotificacionesPorPrioridad(prioridad: PrioridadNotificacion): Notificacion[] {
    return this.notificaciones.filter(n => n.prioridad === prioridad);
  }

  /**
   * Marca una notificación como leída por ID
   * @param id - ID de la notificación
   * @returns true si se marcó, false si no se encontró
   */
  marcarComoLeida(id: string): boolean {
    const notificacion = this.notificaciones.find(n => n.id === id);
    if (notificacion) {
      notificacion.marcarComoLeida();
      return true;
    }
    return false;
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.marcarComoLeida());
  }

  /**
   * Elimina una notificación por ID
   * @param id - ID de la notificación a eliminar
   * @returns true si se eliminó, false si no se encontró
   */
  eliminarNotificacion(id: string): boolean {
    const index = this.notificaciones.findIndex(n => n.id === id);
    if (index > -1) {
      this.notificaciones.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Elimina todas las notificaciones leídas
   * @returns Cantidad de notificaciones eliminadas
   */
  eliminarNotificacionesLeidas(): number {
    const cantidadInicial = this.notificaciones.length;
    this.notificaciones = this.notificaciones.filter(n => !n.leida);
    return cantidadInicial - this.notificaciones.length;
  }

  /**
   * Limpia notificaciones expiradas automáticamente
   * @param diasExpiracion - Días después de los cuales expiran
   */
  private limpiarNotificacionesExpiradas(diasExpiracion: number = 30): void {
    this.notificaciones = this.notificaciones.filter(n => !n.debeExpirar(diasExpiracion));
  }

  /**
   * Obtiene estadísticas de notificaciones
   * @returns Objeto con estadísticas
   */
  getEstadisticas(): {
    total: number;
    noLeidas: number;
    porTipo: Record<TipoNotificacion, number>;
    porPrioridad: Record<PrioridadNotificacion, number>;
  } {
    const estadisticas = {
      total: this.notificaciones.length,
      noLeidas: this.getNotificacionesNoLeidas().length,
      porTipo: {} as Record<TipoNotificacion, number>,
      porPrioridad: {} as Record<PrioridadNotificacion, number>
    };

    // Contar por tipo
    this.notificaciones.forEach(n => {
      estadisticas.porTipo[n.tipo] = (estadisticas.porTipo[n.tipo] || 0) + 1;
      estadisticas.porPrioridad[n.prioridad] = (estadisticas.porPrioridad[n.prioridad] || 0) + 1;
    });

    return estadisticas;
  }
}