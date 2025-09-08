// ==================== TAREA 4: EVENTOS Y NOTIFICACIONES ====================

export type TipoEvento = 'club_lectura' | 'charla_autor' | 'taller' | 'presentacion_libro' | 'otro';

export class EventoBiblioteca {
  private participantes: number[] = [];
  private capacidadMaxima?: number;

  constructor(
    private _id: number,
    private _titulo: string,
    private _descripcion: string,
    private _fecha: Date,
    private _tipo: TipoEvento,
    private _ubicacion?: string,
    capacidadMaxima?: number
  ) {
    this.capacidadMaxima = capacidadMaxima;
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get titulo(): string {
    return this._titulo;
  }

  get descripcion(): string {
    return this._descripcion;
  }

  get fecha(): Date {
    return this._fecha;
  }

  get tipo(): TipoEvento {
    return this._tipo;
  }

  get ubicacion(): string | undefined {
    return this._ubicacion;
  }

  // ==================== GESTIÓN DE PARTICIPANTES ====================

  /**
   * Agrega un participante al evento
   * @param socioId - ID del socio a inscribir
   * @throws Error si el evento está lleno o el socio ya está inscrito
   */
  agregarParticipante(socioId: number): void {
    if (this.participantes.includes(socioId)) {
      throw new Error("El socio ya está inscrito en este evento");
    }

    if (this.capacidadMaxima && this.participantes.length >= this.capacidadMaxima) {
      throw new Error("El evento ha alcanzado su capacidad máxima");
    }

    this.participantes.push(socioId);
  }

  /**
   * Remueve un participante del evento
   * @param socioId - ID del socio a desinscribir
   * @returns true si se removió, false si no estaba inscrito
   */
  quitarParticipante(socioId: number): boolean {
    const index = this.participantes.indexOf(socioId);
    if (index > -1) {
      this.participantes.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Obtiene la lista de participantes
   * @returns Array con IDs de socios participantes
   */
  getParticipantes(): number[] {
    return [...this.participantes];
  }

  /**
   * Obtiene la cantidad de participantes
   * @returns Número de participantes
   */
  getCantidadParticipantes(): number {
    return this.participantes.length;
  }

  /**
   * Verifica si un socio está inscrito
   * @param socioId - ID del socio a verificar
   * @returns true si está inscrito, false si no
   */
  estaInscrito(socioId: number): boolean {
    return this.participantes.includes(socioId);
  }

  /**
   * Verifica si el evento tiene cupos disponibles
   * @returns true si hay cupos, false si no
   */
  tieneCuposDisponibles(): boolean {
    if (!this.capacidadMaxima) return true;
    return this.participantes.length < this.capacidadMaxima;
  }

  /**
   * Obtiene los cupos disponibles
   * @returns Número de cupos disponibles o undefined si no hay límite
   */
  getCuposDisponibles(): number | undefined {
    if (!this.capacidadMaxima) return undefined;
    return Math.max(0, this.capacidadMaxima - this.participantes.length);
  }

  // ==================== GESTIÓN DE FECHAS Y ESTADOS ====================

  /**
   * Verifica si el evento está próximo
   * @param diasAnticipacion - Días de anticipación para considerar "próximo"
   * @returns true si el evento está próximo, false si no
   */
  estaProximo(diasAnticipacion: number = 3): boolean {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAnticipacion);
    return this._fecha <= fechaLimite && this._fecha >= new Date();
  }

  /**
   * Verifica si el evento ya ocurrió
   * @returns true si ya pasó, false si no
   */
  yaOcurrio(): boolean {
    return this._fecha < new Date();
  }

  /**
   * Verifica si el evento es hoy
   * @returns true si es hoy, false si no
   */
  esHoy(): boolean {
    const hoy = new Date();
    return (
      this._fecha.getDate() === hoy.getDate() &&
      this._fecha.getMonth() === hoy.getMonth() &&
      this._fecha.getFullYear() === hoy.getFullYear()
    );
  }

  /**
   * Calcula los días restantes hasta el evento
   * @returns Días restantes (negativo si ya pasó)
   */
  diasRestantes(): number {
    const diferencia = this._fecha.getTime() - new Date().getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  // ==================== MÉTODOS DE INFORMACIÓN ====================

  /**
   * Obtiene el estado del evento
   * @returns Estado actual del evento
   */
  getEstado(): 'finalizado' | 'hoy' | 'proximo' | 'programado' {
    if (this.yaOcurrio()) return 'finalizado';
    if (this.esHoy()) return 'hoy';
    if (this.estaProximo()) return 'proximo';
    return 'programado';
  }

  /**
   * Obtiene información completa del evento
   * @returns String con todos los detalles del evento
   */
  getInformacionCompleta(): string {
    const estado = this.getEstado();
    const ubicacionInfo = this._ubicacion ? ` en ${this._ubicacion}` : '';
    const capacidadInfo = this.capacidadMaxima ? 
      ` (${this.participantes.length}/${this.capacidadMaxima} participantes)` : 
      ` (${this.participantes.length} participantes)`;

    return `${this._titulo} - ${this._tipo.replace('_', ' ').toUpperCase()}
${this._descripcion}
Fecha: ${this._fecha.toLocaleDateString()}${ubicacionInfo}
Estado: ${estado}${capacidadInfo}`;
  }

  /**
   * Modifica la fecha del evento
   * @param nuevaFecha - Nueva fecha para el evento
   */
  reprogramar(nuevaFecha: Date): void {
    if (nuevaFecha <= new Date()) {
      throw new Error("No se puede reprogramar a una fecha pasada");
    }
    this._fecha = nuevaFecha;
  }

  /**
   * Modifica la descripción del evento
   * @param nuevaDescripcion - Nueva descripción
   */
  actualizarDescripcion(nuevaDescripcion: string): void {
    this._descripcion = nuevaDescripcion;
  }
}