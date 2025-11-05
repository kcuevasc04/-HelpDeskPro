const express = require('express');
const router = express.Router();

function setupTicketRoutes(ticketController) {
  // CRUD básico
  router.post('/tickets', (req, res) => ticketController.crearTicket(req, res));
  router.get('/tickets', (req, res) => ticketController.listarTickets(req, res));
  router.get('/tickets/:id', (req, res) => ticketController.obtenerTicket(req, res));
  router.put('/tickets/:id', (req, res) => ticketController.actualizarTicket(req, res));
  router.delete('/tickets/:id', (req, res) => ticketController.eliminarTicket(req, res));

  // Operaciones específicas
  router.post('/tickets/:id/asignar-tecnico', (req, res) => ticketController.asignarTecnico(req, res));
  router.post('/tickets/:id/cambiar-estado', (req, res) => ticketController.cambiarEstado(req, res));
  
  // Búsquedas y reportes
  router.get('/tickets/estado/:estado', (req, res) => ticketController.buscarPorEstado(req, res));
  router.get('/tickets/prioridad/:prioridad', (req, res) => ticketController.buscarPorPrioridad(req, res));
  router.get('/reportes/estadisticas', (req, res) => ticketController.generarReporte(req, res));

  return router;
}

module.exports = setupTicketRoutes;