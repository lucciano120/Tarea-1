import { Autor } from "./Autor";

// ==================== LIBRO EXTENDIDO CON SISTEMA DE RESERVAS ====================
export class Libro {
  private reservas: number[] = []; // IDs de socios que reservaron (TAREA 1)

  constructor(
    private _titulo: string,
    private _autor: Autor, // TAREA 3: Ahora usa objeto Autor
    private _isbn: string
  ) {}

  // Getters
  get titulo(): string {
    return this._titulo;
  }

  get autor(): Autor {
    return this._autor;
  }

  get isbn(): string {
    return this._isbn;
  }

  // ==================== TAREA 1: MÉTODOS DE RESERVA ====================
  
  /**
   * Agrega un socio a la cola de reservas
   * @param socioId - ID del socio que quiere reservar
   */
  agregarReserva(socioId: number): void {
    if (!this.reservas.includes(socioId)) {
      this.reservas.push(socioId);
    }
  }

  /**
   * Obtiene el ID del próximo socio en la cola de reservas sin removerlo
   * @returns ID del próximo socio o undefined si no hay reservas
   */
  obtenerProximaReserva(): number | undefined {
    return this.reservas[0];
  }

  /**
   * Remueve y retorna el ID del próximo socio en la cola de reservas
   * @returns ID del próximo socio o undefined si no hay reservas
   */
  quitarProximaReserva(): number | undefined {
    return this.reservas.shift();
  }

  /**
   * Verifica si el libro tiene reservas pendientes
   * @returns true si hay reservas, false si no
   */
  tieneReservas(): boolean {
    return this.reservas.length > 0;
  }

  /**
   * Obtiene una copia de la lista de reservas
   * @returns Array con IDs de socios que reservaron
   */
  getReservas(): number[] {
    return [...this.reservas]; // Copia para no exponer el array interno
  }

  /**
   * Obtiene la cantidad de reservas pendientes
   * @returns Número de reservas
   */
  getCantidadReservas(): number {
    return this.reservas.length;
  }

  /**
   * Verifica si un socio específico tiene una reserva para este libro
   * @param socioId - ID del socio a verificar
   * @returns true si el socio tiene reserva, false si no
   */
  socioTieneReserva(socioId: number): boolean {
    return this.reservas.includes(socioId);
  }

  /**
   * Remueve la reserva de un socio específico (útil si el socio cancela)
   * @param socioId - ID del socio cuya reserva se quiere cancelar
   * @returns true si se removió la reserva, false si no existía
   */
  cancelarReservaSocio(socioId: number): boolean {
    const index = this.reservas.indexOf(socioId);
    if (index > -1) {
      this.reservas.splice(index, 1);
      return true;
    }
    return false;
  }

  // ==================== MÉTODOS ADICIONALES ====================
  
  /**
   * Obtiene información completa del libro
   * @returns String con título, autor e ISBN
   */
  getInformacionCompleta(): string {
    return `"${this._titulo}" por ${this._autor.nombre} (ISBN: ${this._isbn})`;
  }

  /**
   * Verifica si el libro coincide con un término de búsqueda
   * @param termino - Término a buscar en título o autor
   * @returns true si coincide, false si no
   */
  coincideConBusqueda(termino: string): boolean {
    const terminoLower = termino.toLowerCase();
    return (
      this._titulo.toLowerCase().includes(terminoLower) ||
      this._autor.nombre.toLowerCase().includes(terminoLower)
    );
  }
}