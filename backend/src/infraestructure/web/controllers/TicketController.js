class TicketController {
  constructor(ticketService) {
    this.ticketService = ticketService;
  }

  async crearTicket(req, res) {
    try {
      const { usuario, descripcion, prioridad } = req.body;
      
      if (!usuario || !descripcion || !prioridad) {
        return res.status(400).json({
          error: 'Campos requeridos: usuario, descripcion, prioridad'
        });
      }

      const ticket = await this.ticketService.registrarTicket(usuario, descripcion, prioridad);
      res.status(201).json(ticket);
      
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async obtenerTicket(req, res) {
    try {
      const { id } = req.params;
      const ticket = await this.ticketService.obtenerTicketPorId(id);
      res.json(ticket);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async listarTickets(req, res) {
    try {
      const tickets = await this.ticketService.listarTodosLosTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async actualizarTicket(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;
      
      const ticket = await this.ticketService.actualizarTicket(id, datosActualizacion);
      res.json(ticket);
      
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async eliminarTicket(req, res) {
    try {
      const { id } = req.params;
      const resultado = await this.ticketService.eliminarTicket(id);
      res.json(resultado);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async asignarTecnico(req, res) {
    try {
      const { id } = req.params;
      const { tecnico } = req.body;
      
      if (!tecnico) {
        return res.status(400).json({ error: 'El campo "tecnico" es requerido' });
      }

      const ticket = await this.ticketService.asignarTecnico(id, tecnico);
      res.json(ticket);
      
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!estado) {
        return res.status(400).json({ error: 'El campo "estado" es requerido' });
      }

      const ticket = await this.ticketService.cambiarEstado(id, estado);
      res.json(ticket);
      
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async buscarPorEstado(req, res) {
    try {
      const { estado } = req.params;
      const tickets = await this.ticketService.buscarTicketsPorEstado(estado);
      res.json(tickets);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async buscarPorPrioridad(req, res) {
    try {
      const { prioridad } = req.params;
      const tickets = await this.ticketService.buscarTicketsPorPrioridad(prioridad);
      res.json(tickets);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async generarReporte(req, res) {
    try {
      const reporte = await this.ticketService.generarReporteEstadisticas();
      res.json(reporte);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TicketController;