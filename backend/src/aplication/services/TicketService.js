class TicketService {
  constructor(ticketRepository) {
    if (!ticketRepository) {
      throw new Error('TicketRepository es requerido');
    }
    this.ticketRepository = ticketRepository;
  }

  async registrarTicket(usuario, descripcion, prioridad) {
    try {
      const Ticket = require('../../domain/entities/Ticket');
      const ticket = new Ticket(null, usuario, descripcion, prioridad);
      
      await this.ticketRepository.guardar(ticket);
      return ticket;
    } catch (error) {
      throw new Error(`Error al registrar ticket: ${error.message}`);
    }
  }

  async obtenerTicketPorId(id) {
    try {
      const ticket = await this.ticketRepository.buscarPorId(id);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }
      return ticket;
    } catch (error) {
      throw new Error(`Error al obtener ticket: ${error.message}`);
    }
  }

  async listarTodosLosTickets() {
    try {
      return await this.ticketRepository.listarTodos();
    } catch (error) {
      throw new Error(`Error al listar tickets: ${error.message}`);
    }
  }

  async actualizarTicket(id, datosActualizacion) {
    try {
      const ticket = await this.ticketRepository.buscarPorId(id);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      if (datosActualizacion.descripcion !== undefined) {
        ticket.actualizarDescripcion(datosActualizacion.descripcion);
      }

      if (datosActualizacion.estado !== undefined) {
        ticket.actualizarEstado(datosActualizacion.estado);
      }

      if (datosActualizacion.prioridad !== undefined) {
        const prioridadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
        if (!prioridadesValidas.includes(datosActualizacion.prioridad)) {
          throw new Error('Prioridad inválida');
        }
        ticket._prioridad = datosActualizacion.prioridad;
      }

      if (datosActualizacion.tecnicoAsignado !== undefined) {
        if (datosActualizacion.tecnicoAsignado) {
          ticket.asignarTecnico(datosActualizacion.tecnicoAsignado);
        } else {
          ticket._tecnicoAsignado = null;
        }
      }

      await this.ticketRepository.actualizar(ticket);
      return ticket;

    } catch (error) {
      throw new Error(`Error al actualizar ticket: ${error.message}`);
    }
  }

  async asignarTecnico(id, tecnico) {
    try {
      const ticket = await this.ticketRepository.buscarPorId(id);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      ticket.asignarTecnico(tecnico);
      await this.ticketRepository.actualizar(ticket);
      return ticket;

    } catch (error) {
      throw new Error(`Error al asignar técnico: ${error.message}`);
    }
  }

  async cambiarEstado(id, nuevoEstado) {
    try {
      const ticket = await this.ticketRepository.buscarPorId(id);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      ticket.actualizarEstado(nuevoEstado);
      await this.ticketRepository.actualizar(ticket);
      return ticket;

    } catch (error) {
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  async eliminarTicket(id) {
    try {
      const ticket = await this.ticketRepository.buscarPorId(id);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      await this.ticketRepository.eliminar(id);
      return { message: 'Ticket eliminado correctamente' };

    } catch (error) {
      throw new Error(`Error al eliminar ticket: ${error.message}`);
    }
  }

  async buscarTicketsPorEstado(estado) {
    try {
      return await this.ticketRepository.buscarPorEstado(estado);
    } catch (error) {
      throw new Error(`Error al buscar tickets por estado: ${error.message}`);
    }
  }

  async buscarTicketsPorPrioridad(prioridad) {
    try {
      return await this.ticketRepository.buscarPorPrioridad(prioridad);
    } catch (error) {
      throw new Error(`Error al buscar tickets por prioridad: ${error.message}`);
    }
  }

  async generarReporteEstadisticas() {
    try {
      return await this.ticketRepository.generarReporteEstadisticas();
    } catch (error) {
      throw new Error(`Error al generar reporte: ${error.message}`);
    }
  }
}

module.exports = TicketService;