// ==================== TAREA 3: GESTIÓN DE AUTORES ====================
export class Autor {
  constructor(
    private _nombre: string,
    private _biografia: string,
    private _anoNacimiento: number
  ) {}

  get nombre(): string {
    return this._nombre;
  }

  get biografia(): string {
    return this._biografia;
  }

  get anoNacimiento(): number {
    return this._anoNacimiento;
  }

  // Método para obtener información completa del autor
  getInformacionCompleta(): string {
    return `${this._nombre} (${this._anoNacimiento}): ${this._biografia}`;
  }

  // Método para verificar si el autor nació en un siglo específico
  nacioEnSiglo(siglo: number): boolean {
    const anoInicio = (siglo - 1) * 100 + 1;
    const anoFin = siglo * 100;
    return this._anoNacimiento >= anoInicio && this._anoNacimiento <= anoFin;
  }

  // Método para calcular la edad (si aún vive) o edad al momento actual
  calcularEdad(anoActual: number = new Date().getFullYear()): number {
    return anoActual - this._anoNacimiento;
  }
}