import { Libro } from "./Libro";
import { Socio } from "./Socio";
import { Autor } from "./Autor";
import { EventoBiblioteca, TipoEvento } from "./EventoBiblioteca";

// ==================== BIBLIOTECA EXTENDIDA CON TODAS LAS FUNCIONALIDADES ====================
export class Biblioteca {
  private inventario: Libro[] = [];
  private socios: Socio[] = [];
  private autores: Autor[] = [];
  private eventos: EventoBiblioteca[] = [];
  private readonly DURACION_DEFAULT = 14; // días
  private readonly MULTA_POR_DIA = 50; // pesos

  // ==================== TAREA 3: GESTIÓN DE AUTORES ====================

  /**
   * Agrega un nuevo autor al sistema
   * @param nombre - Nombre del autor
   * @param biografia - Biografía del autor
   * @param anoNacimiento - Año de nacimiento
   * @returns El autor creado
   */
  agregarAutor(nombre: string, biografia: string, anoNacimiento: number): Autor {
    const autor = new Autor(nombre, biografia, anoNacimiento);
    this.autores.push(autor);
    return autor;
  }

  /**
   * Busca un autor por nombre
   * @param nombre - Nombre del autor a buscar
   * @returns El autor encontrado o null
   */
  buscarAutor(nombre: string): Autor | null {
    return this.autores.find(autor => 
      autor.nombre.toLowerCase().includes(nombre.toLowerCase())
    ) ?? null;
  }

  /**
   * Obtiene todos los libros de un autor específico
   * @param autor - Autor del cual buscar libros
   * @returns Array de libros del autor
   */
  getLibrosPorAutor(autor: Autor): Libro[] {
    return this.inventario.filter(libro => libro.autor === autor);
  }

  /**
   * Busca autores por siglo de nacimiento
   * @param siglo - Siglo a buscar
   * @returns Array de autores del siglo especificado
   */
  getAutoresPorSiglo(siglo: number): Autor[] {
    return this.autores.filter(autor => autor.nacioEnSiglo(siglo));
  }

  /**
   * Obtiene todos los autores registrados
   * @returns Array de autores
   */
  getTodosLosAutores(): Autor[] {
    return [...this.autores];
  }

  // ==================== GESTIÓN DE LIBROS ====================

  /**
   * Agrega un libro al inventario
   * @param titulo - Título del libro
   * @param autor - Objeto autor
   * @param isbn - ISBN del libro
   * @returns El libro creado
   */
  agregarLibro(titulo: string, autor: Autor, isbn: string): Libro {
    // Verificar que el ISBN no esté duplicado
    if (this.buscarLibro(isbn)) {
      throw new Error(`Ya existe un libro con ISBN ${isbn}`);
    }

    const libro = new Libro(titulo, autor, isbn);
    this.inventario.push(libro);

    // Notificar a socios que leyeron libros de este autor
    this.notificarNuevoLibroAutor(autor, libro);

    return libro;
  }

  /**
   * Busca un libro por ISBN
   * @param isbn - ISBN del libro
   * @returns El libro encontrado o null
   */
  buscarLibro(isbn: string): Libro | null {
    return this.inventario.find(libro => libro.isbn === isbn) ?? null;
  }

  /**
   * Busca libros por título (búsqueda parcial)
   * @param titulo - Título o parte del título
   * @returns Array de libros encontrados
   */
  buscarLibrosPorTitulo(titulo: string): Libro[] {
    return this.inventario.filter(libro => 
      libro.titulo.toLowerCase().includes(titulo.toLowerCase())
    );
  }

  /**
   * Obtiene libros disponibles (no prestados)
   * @returns Array de libros disponibles
   */
  getLibrosDisponibles(): Libro[] {
    return this.inventario.filter(libro => this.libroEstaDisponible(libro));
  }

  /**
   * Verifica si un libro está disponible
   * @param libro - Libro a verificar
   * @returns true si está disponible, false si no
   */
  private libroEstaDisponible(libro: Libro): boolean {
    return !this.socios.some(socio => socio.tienePrestadoLibro(libro));
  }

  // ==================== GESTIÓN DE SOCIOS ====================

  /**
   * Registra un nuevo socio
   * @param id - ID único del socio
   * @param nombre - Nombre del socio
   * @param apellido - Apellido del socio
   * @param email - Email opcional
   * @param telefono - Teléfono opcional
   * @returns El socio creado
   */
  registrarSocio(
    id: number, 
    nombre: string, 
    apellido: string, 
    email?: string, 
    telefono?: string
  ): Socio {
    // Verificar que el ID no esté duplicado
    if (this.buscarSocio(id)) {
      throw new Error(`Ya existe un socio con ID ${id}`);
    }

    const socio = new Socio(id, nombre, apellido, email, telefono);
    this.socios.push(socio);
    return socio;
  }

  /**
   * Busca un socio por ID
   * @param id - ID del socio
   * @returns El socio encontrado o null
   */
  buscarSocio(id: number): Socio | null {
    return this.socios.find(socio => socio.id === id) ?? null;
  }

  /**
   * Busca socios por nombre
   * @param nombre - Nombre a buscar
   * @returns Array de socios encontrados
   */
  buscarSociosPorNombre(nombre: string): Socio[] {
    return this.socios.filter(socio => 
      socio.nombreCompleto.toLowerCase().includes(nombre.toLowerCase())
    );
  }

  /**
   * Obtiene todos los socios registrados
   * @returns Array de socios
   */
  getTodosLosSocios(): Socio[] {
    return [...this.socios];
  }

  // ==================== TAREA 1: SISTEMA DE RESERVAS ====================

  /**
   * Permite a un socio reservar un libro que está prestado
   * @param socioId - ID del socio
   * @param libroISBN - ISBN del libro
   * @throws Error si el socio/libro no existe o si el libro está disponible
   */
  reservarLibro(socioId: number, libroISBN: string): void {
    const socio = this.buscarSocio(socioId);
    const libro = this.buscarLibro(libroISBN);

    if (!socio) {
      throw new Error("Socio no encontrado");
    }
    if (!libro) {
      throw new Error("Libro no encontrado");
    }

    // Verificar si el libro está disponible
    if (this.libroEstaDisponible(libro)) {
      throw new Error("El libro está disponible, puede retirarlo directamente");
    }

    // Verificar si ya tiene una reserva
    if (libro.socioTieneReserva(socioId)) {
      throw new Error("Ya tienes una reserva para este libro");
    }

    libro.agregarReserva(socioId);
    socio.agregarNotificacion(
      'reserva_disponible', 
      `Has reservado "${libro.titulo}". Posición en cola: ${libro.getCantidadReservas()}`,
      'media'
    );
  }

  /**
   * Cancela una reserva de un socio
   * @param socioId - ID del socio
   * @param libroISBN - ISBN del libro
   */
  cancelarReserva(socioId: number, libroISBN: string): void {
    const libro = this.buscarLibro(libroISBN);
    if (!libro) {
      throw new Error("Libro no encontrado");
    }

    if (libro.cancelarReservaSocio(socioId)) {
      const socio = this.buscarSocio(socioId);
      if (socio) {
        socio.agregarNotificacion(
          'reserva_disponible',
          `Has cancelado tu reserva para "${libro.titulo}"`,
          'baja'
        );
      }
    }
  }

  // ==================== PRÉSTAMOS Y DEVOLUCIONES ====================

  /**
   * Permite a un socio retirar un libro
   * @param socioId - ID del socio
   * @param libroISBN - ISBN del libro
   * @param duracion - Duración del préstamo en días (opcional)
   */
  retirarLibro(socioId: number, libroISBN: string, duracion?: number): void {
    const socio = this.buscarSocio(socioId);
    const libro = this.buscarLibro(libroISBN);

    if (!socio) {
      throw new Error("Socio no encontrado");
    }
    if (!libro) {
      throw new Error("Libro no encontrado");
    }

    // Verificar disponibilidad
    if (!this.libroEstaDisponible(libro)) {
      throw new Error("Libro no está disponible");
    }

    const duracionFinal = duracion ?? this.DURACION_DEFAULT;
    socio.retirar(libro, duracionFinal);

    // Si el socio tenía una reserva, quitarla
    if (libro.socioTieneReserva(socioId)) {
      libro.cancelarReservaSocio(socioId);
    }
  }

  /**
   * Procesa la devolución de un libro
   * @param socioId - ID del socio
   * @param libroISBN - ISBN del libro
   */
  devolverLibro(socioId: number, libroISBN: string): void {
    const socio = this.buscarSocio(socioId);
    const libro = this.buscarLibro(libroISBN);

    if (!socio) {
      throw new Error("Socio no encontrado");
    }
    if (!libro) {
      throw new Error("Libro no encontrado");
    }

    socio.devolver(libro);

    // Notificar al próximo en la cola de reservas
    const proximoSocioId = libro.obtenerProximaReserva();
    if (proximoSocioId) {
      const proximoSocio = this.buscarSocio(proximoSocioId);
      if (proximoSocio) {
        proximoSocio.agregarNotificacion(
          'reserva_disponible',
          `El libro "${libro.titulo}" que reservaste ya está disponible. Tienes 24 horas para retirarlo.`,
          'alta'
        );
        libro.quitarProximaReserva();
      }
    }
  }

  /**
   * Renueva el préstamo de un libro
   * @param socioId - ID del socio
   * @param libroISBN - ISBN del libro
   * @param diasAdicionales - Días adicionales (opcional)
   */
  renovarPrestamo(socioId: number, libroISBN: string, diasAdicionales?: number): void {
    const socio = this.buscarSocio(socioId);
    const libro = this.buscarLibro(libroISBN);

    if (!socio || !libro) {
      throw new Error("Socio o libro no encontrado");
    }

    // Verificar que no haya reservas para el libro
    if (libro.tieneReservas()) {
      throw new Error("No se puede renovar, hay reservas pendientes para este libro");
    }

    const dias = diasAdicionales ?? this.DURACION_DEFAULT;
    socio.renovarPrestamo(libro, dias);
  }

  // ==================== TAREA 4: GESTIÓN DE EVENTOS ====================

  /**
   * Crea un nuevo evento
   * @param id - ID único del evento
   * @param titulo - Título del evento
   * @param descripcion - Descripción del evento
   * @param fecha - Fecha del evento
   * @param tipo - Tipo de evento
   * @param ubicacion - Ubicación opcional
   * @param capacidadMaxima - Capacidad máxima opcional
   * @returns El evento creado
   */
  crearEvento(
    id: number,
    titulo: string,
    descripcion: string,
    fecha: Date,
    tipo: TipoEvento,
    ubicacion?: string,
    capacidadMaxima?: number
  ): EventoBiblioteca {
    // Verificar que el ID no esté duplicado
    if (this.eventos.some(e => e.id === id)) {
      throw new Error(`Ya existe un evento con ID ${id}`);
    }

    const evento = new EventoBiblioteca(id, titulo, descripcion, fecha, tipo, ubicacion, capacidadMaxima);
    this.eventos.push(evento);
    return evento;
  }

  /**
   * Inscribe un socio a un evento
   * @param socioId - ID del socio
   * @param eventoId - ID del evento
   */
  inscribirSocioAEvento(socioId: number, eventoId: number): void {
    const socio = this.buscarSocio(socioId);
    const evento = this.eventos.find(e => e.id === eventoId);

    if (!socio) {
      throw new Error("Socio no encontrado");
    }
    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    evento.agregarParticipante(socioId);
    socio.agregarNotificacion(
      'evento_proximo',
      `Te has inscrito al evento "${evento.titulo}" el ${evento.fecha.toLocaleDateString()}`,
      'media'
    );
  }

  /**
   * Desinscribe un socio de un evento
   * @param socioId - ID del socio
   * @param eventoId - ID del evento
   */
  desinscribirSocioDeEvento(socioId: number, eventoId: number): void {
    const evento = this.eventos.find(e => e.id === eventoId);
    const socio = this.buscarSocio(socioId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    if (evento.quitarParticipante(socioId) && socio) {
      socio.agregarNotificacion(
        'evento_proximo',
        `Te has desinscrito del evento "${evento.titulo}"`,
        'baja'
      );
    }
  }

  /**
   * Obtiene eventos próximos
   * @param dias - Días de anticipación
   * @returns Array de eventos próximos
   */
  getEventosProximos(dias: number = 7): EventoBiblioteca[] {
    return this.eventos.filter(evento => evento.estaProximo(dias));
  }

  /**
   * Obtiene todos los eventos
   * @returns Array de eventos
   */
  getTodosLosEventos(): EventoBiblioteca[] {
    return [...this.eventos];
  }

  /**
   * Cancela un evento
   * @param eventoId - ID del evento a cancelar
   */
  cancelarEvento(eventoId: number): void {
    const evento = this.eventos.find(e => e.id === eventoId);
    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    // Notificar a todos los participantes
    const participantes = evento.getParticipantes();
    for (const socioId of participantes) {
      const socio = this.buscarSocio(socioId);
      if (socio) {
        socio.agregarNotificacion(
          'evento_cancelado',
          `El evento "${evento.titulo}" programado para el ${evento.fecha.toLocaleDateString()} ha sido cancelado`,
          'alta'
        );
      }
    }

    // Remover el evento
    const index = this.eventos.indexOf(evento);
    this.eventos.splice(index, 1);
  }

  // ==================== TAREA 4: SISTEMA DE NOTIFICACIONES AUTOMÁTICAS ====================

  /**
   * Procesa todas las notificaciones automáticas del sistema
   */
  procesarNotificacionesAutomaticas(): void {
    for (const socio of this.socios) {
      // Procesar notificaciones individuales del socio
      socio.procesarNotificacionesAutomaticas();

      // Notificar sobre eventos próximos en los que está inscrito
      for (const evento of this.eventos) {
        if (evento.estaProximo() && evento.estaInscrito(socio.id)) {
          const diasRestantes = evento.diasRestantes();
          socio.agregarNotificacion(
            'evento_proximo',
            `Recordatorio: El evento "${evento.titulo}" es ${diasRestantes === 0 ? 'hoy' : `en ${diasRestantes} días`}`,
            'alta'
          );
        }
      }
    }
  }

  /**
   * Notifica a socios cuando se agrega un libro de un autor que han leído
   * @param autor - Autor del nuevo libro
   * @param libro - Libro agregado
   */
  private notificarNuevoLibroAutor(autor: Autor, libro: Libro): void {
    for (const socio of this.socios) {
      const autoresFavoritos = socio.getAutoresFavoritos();
      if (autoresFavoritos.has(autor)) {
        socio.agregarNotificacion(
          'nuevo_libro_autor_favorito',
          `¡Nuevo libro disponible de ${autor.nombre}: "${libro.titulo}"!`,
          'media'
        );
      }
    }
  }

  // ==================== TAREA 5: SISTEMA DE RECOMENDACIONES ====================

  /**
   * Genera recomendaciones personalizadas para un socio
   * @param socioId - ID del socio
   * @param limite - Número máximo de recomendaciones
   * @returns Array de libros recomendados
   */
  recomendarLibros(socioId: number, limite: number = 5): Libro[] {
    const socio = this.buscarSocio(socioId);
    if (!socio) return [];

    const historial = socio.getHistorialLectura();
    const autoresFavoritos = socio.getAutoresFavoritos();
    const palabrasClaveHistorial = socio.getPalabrasClaveHistorial();
    const recomendaciones: Libro[] = [];

    // 1. Libros de autores favoritos que no haya leído
    for (const [autor] of autoresFavoritos) {
      const librosDelAutor = this.getLibrosPorAutor(autor);
      for (const libro of librosDelAutor) {
        if (!socio.yaLeyoLibro(libro) && 
            !recomendaciones.some(r => r.isbn === libro.isbn)) {
          recomendaciones.push(libro);
        }
      }
    }

    // 2. Libros con títulos similares basados en palabras clave
    const palabrasClaveArray = Array.from(palabrasClaveHistorial.keys()).slice(0, 10);
    for (const libro of this.inventario) {
      if (!socio.yaLeyoLibro(libro) && 
          !recomendaciones.some(r => r.isbn === libro.isbn)) {
        const tituloLibro = libro.titulo.toLowerCase();
        for (const palabra of palabrasClaveArray) {
          if (tituloLibro.includes(palabra)) {
            recomendaciones.push(libro);
            break;
          }
        }
      }
    }

    // 3. Libros populares entre otros socios con gustos similares
    const librosPopulares = this.getLibrosPopulares();
    for (const libro of librosPopulares) {
      if (!socio.yaLeyoLibro(libro) && 
          !recomendaciones.some(r => r.isbn === libro.isbn)) {
        recomendaciones.push(libro);
      }
    }

    return recomendaciones.slice(0, limite);
  }

  /**
   * Obtiene libros más populares basado en historial de todos los socios
   * @returns Array de libros ordenados por popularidad
   */
  private getLibrosPopulares(): Libro[] {
    const popularidad = new Map<Libro, number>();

    for (const socio of this.socios) {
      const historial = socio.getHistorialLectura();
      for (const libro of historial) {
        const count = popularidad.get(libro) || 0;
        popularidad.set(libro, count + 1);
      }
    }

    return Array.from(popularidad.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([libro]) => libro)
      .slice(0, 10);
  }

  // ==================== TAREA 2: GESTIÓN DE MULTAS ====================

  /**
   * Obtiene socios con multas pendientes
   * @returns Array de socios con multas
   */
  getSociosConMultas(): Array<{socio: Socio, multa: number}> {
    return this.socios
      .map(socio => ({socio, multa: socio.calcularMultasPendientes()}))
      .filter(item => item.multa > 0);
  }

  /**
   * Procesa el pago de multas de un socio
   * @param socioId - ID del socio
   * @param monto - Monto a pagar
   */
  procesarPagoMulta(socioId: number, monto: number): void {
    const socio = this.buscarSocio(socioId);
    if (!socio) {
      throw new Error("Socio no encontrado");
    }

    socio.pagarMulta(monto);
  }

  /**
   * Obtiene el total de multas pendientes en el sistema
   * @returns Monto total de multas
   */
  getTotalMultasPendientes(): number {
    return this.socios.reduce((total, socio) => total + socio.calcularMultasPendientes(), 0);
  }

  // ==================== MÉTODOS DE CONSULTA Y ESTADÍSTICAS ====================

  /**
   * Obtiene estadísticas generales de la biblioteca
   * @returns Objeto con estadísticas
   */
  getEstadisticasGenerales(): {
    totalLibros: number;
    librosDisponibles: number;
    librosPrestados: number;
    totalSocios: number;
    sociosActivos: number;
    totalAutores: number;
    totalEventos: number;
    eventosProximos: number;
    multasPendientes: number;
    reservasPendientes: number;
  } {
    const librosPrestados = this.getLibrosPrestados();
    const sociosActivos = this.socios.filter(s => s.getLibrosPrestados().length > 0);
    const eventosProximos = this.getEventosProximos();
    const reservasPendientes = this.inventario.reduce((total, libro) => total + libro.getCantidadReservas(), 0);

    return {
      totalLibros: this.inventario.length,
      librosDisponibles: this.getLibrosDisponibles().length,
      librosPrestados: librosPrestados.length,
      totalSocios: this.socios.length,
      sociosActivos: sociosActivos.length,
      totalAutores: this.autores.length,
      totalEventos: this.eventos.length,
      eventosProximos: eventosProximos.length,
      multasPendientes: this.getTotalMultasPendientes(),
      reservasPendientes: reservasPendientes
    };
  }

  /**
   * Obtiene información de libros prestados
   * @returns Array con información de préstamos
   */
  getLibrosPrestados(): Array<{libro: Libro, socio: Socio, prestamo: any}> {
    const librosEnPrestamo: Array<{libro: Libro, socio: Socio, prestamo: any}> = [];
    
    for (const socio of this.socios) {
      for (const prestamo of socio.getLibrosPrestados()) {
        librosEnPrestamo.push({ libro: prestamo.libro, socio, prestamo });
      }
    }
    
    return librosEnPrestamo;
  }

  /**
   * Obtiene libros vencidos en todo el sistema
   * @returns Array con información de libros vencidos
   */
  getLibrosVencidos(): Array<{libro: Libro, socio: Socio, prestamo: any, multa: number}> {
    const librosVencidos: Array<{libro: Libro, socio: Socio, prestamo: any, multa: number}> = [];
    
    for (const socio of this.socios) {
      for (const prestamo of socio.getLibrosVencidos()) {
        librosVencidos.push({ 
          libro: prestamo.libro, 
          socio, 
          prestamo,
          multa: prestamo.calcularMulta()
        });
      }
    }
    
    return librosVencidos;
  }

  /**
   * Busca en todo el catálogo (libros, autores, socios)
   * @param termino - Término de búsqueda
   * @returns Objeto con resultados de búsqueda
   */
  buscarEnCatalogo(termino: string): {
    libros: Libro[];
    autores: Autor[];
    socios: Socio[];
  } {
    return {
      libros: this.inventario.filter(libro => libro.coincideConBusqueda(termino)),
      autores: this.autores.filter(autor => 
        autor.nombre.toLowerCase().includes(termino.toLowerCase())
      ),
      socios: this.buscarSociosPorNombre(termino)
    };
  }

  /**
   * Genera un reporte completo del estado de la biblioteca
   * @returns String con reporte detallado
   */
  generarReporteCompleto(): string {
    const stats = this.getEstadisticasGenerales();
    const librosVencidos = this.getLibrosVencidos();
    const sociosConMultas = this.getSociosConMultas();

    return `
=== REPORTE DE BIBLIOTECA ===
Fecha: ${new Date().toLocaleString()}

INVENTARIO:
- Total de libros: ${stats.totalLibros}
- Libros disponibles: ${stats.librosDisponibles}
- Libros prestados: ${stats.librosPrestados}
- Reservas pendientes: ${stats.reservasPendientes}

SOCIOS:
- Total de socios: ${stats.totalSocios}
- Socios activos: ${stats.sociosActivos}
- Socios con multas: ${sociosConMultas.length}

EVENTOS:
- Total de eventos: ${stats.totalEventos}
- Eventos próximos: ${stats.eventosProximos}

SITUACIÓN FINANCIERA:
- Multas pendientes: ${stats.multasPendientes}

ALERTAS:
- Libros vencidos: ${librosVencidos.length}
${librosVencidos.length > 0 ? '- Requieren atención inmediata' : '- Situación normal'}

AUTORES REGISTRADOS: ${stats.totalAutores}
    `.trim();
  }
}
      