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
      