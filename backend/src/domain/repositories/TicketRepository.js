class TicketRepository {
  async guardar(ticket) {
    throw new Error('Método guardar no implementado');
  }

  async buscarPorId(id) {
    throw new Error('Método buscarPorId no implementado');
  }

  async listarTodos() {
    throw new Error('Método listarTodos no implementado');
  }

  async actualizar(ticket) {
    throw new Error('Método actualizar no implementado');
  }

  async eliminar(id) {
    throw new Error('Método eliminar no implementado');
  }

  async buscarPorEstado(estado) {
    throw new Error('Método buscarPorEstado no implementado');
  }

  async buscarPorPrioridad(prioridad) {
    throw new Error('Método buscarPorPrioridad no implementado');
  }

  async buscarPorTecnico(tecnico) {
    throw new Error('Método buscarPorTecnico no implementado');
  }

  async generarReporteEstadisticas() {
    throw new Error('Método generarReporteEstadisticas no implementado');
  }
}

module.exports = TicketRepository;