import { Libro } from "./Libro";

// ==================== TAREA 2: PRESTAMO CON CÁLCULO DE MULTAS ====================
export class Prestamo {
  constructor(
    public libro: Libro,
    public vencimiento: Date,
    public fechaPrestamo: Date = new Date()
  ) {}

  /**
   * Verifica si el préstamo está vencido
   * @returns true si está vencido, false si no
   */
  estaVencido(): boolean {
    return new Date() > this.vencimiento;
  }

  /**
   * Calcula los días de retraso
   * @returns Número de días vencido (0 si no está vencido)
   */
  diasVencido(): number {
    if (!this.estaVencido()) return 0;
    
    const diferencia = new Date().getTime() - this.vencimiento.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula la multa por días vencidos
   * @param multaPorDia - Monto de multa por día (default: $50)
   * @returns Monto total de la multa
   */
  calcularMulta(multaPorDia: number = 50): number {
    return this.diasVencido() * multaPorDia;
  }

  /**
   * Obtiene el estado del préstamo
   * @returns 'vigente', 'por_vencer' (3 días o menos), o 'vencido'
   */
  getEstado(): 'vigente' | 'por_vencer' | 'vencido' {
    const hoy = new Date();
    const diferenciaDias = Math.ceil((this.vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) {
      return 'vencido';
    } else if (diferenciaDias <= 3) {
      return 'por_vencer';
    } else {
      return 'vigente';
    }
  }

  /**
   * Calcula los días restantes hasta el vencimiento
   * @returns Días restantes (negativo si ya venció)
   */
  diasRestantes(): number {
    const diferencia = this.vencimiento.getTime() - new Date().getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene información completa del préstamo
   * @returns String con detalles del préstamo
   */
  getInformacionCompleta(): string {
    const estado = this.getEstado();
    const dias = estado === 'vencido' ? this.diasVencido() : this.diasRestantes();
    
    let info = `"${this.libro.titulo}" - `;
    
    switch (estado) {
      case 'vencido':
        info += `VENCIDO por ${dias} días. Multa: $${this.calcularMulta()}`;
        break;
      case 'por_vencer':
        info += `Por vencer en ${dias} días`;
        break;
      case 'vigente':
        info += `${dias} días restantes`;
        break;
    }
    
    return info;
  }

  /**
   * Extiende el préstamo por días adicionales
   * @param diasAdicionales - Días a agregar al vencimiento
   */
  extenderPrestamo(diasAdicionales: number): void {
    if (diasAdicionales <= 0) {
      throw new Error("Los días adicionales deben ser positivos");
    }
    
    const nuevaFecha = new Date(this.vencimiento);
    nuevaFecha.setDate(nuevaFecha.getDate() + diasAdicionales);
    this.vencimiento = nuevaFecha;
  }
}