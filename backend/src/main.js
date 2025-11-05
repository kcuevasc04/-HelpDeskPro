require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importaciones de las capas - DEPENDENCY INJECTION
const PostgresTicketRepository = require('./infrastructure/persistence/PostgresTicketRepository');
const TicketService = require('./application/services/TicketService');
const TicketController = require('./infrastructure/web/controllers/TicketController');
const setupTicketRoutes = require('./infrastructure/web/routes/ticketRoutes');

class Application {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    this.configureMiddleware();
    this.configureDependencies();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  configureMiddleware() {
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
      credentials: true
    }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
    // Logging de requests
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  configureDependencies() {
    console.log(' Configurando dependencias con Dependency Injection...');
    
    // 1. Crear el adaptador de persistencia (PostgreSQL)
    this.ticketRepository = new PostgresTicketRepository();
    
    // 2. Inyectar el repositorio en el servicio (Caso de uso)
    this.ticketService = new TicketService(this.ticketRepository);
    
    // 3. Inyectar el servicio en el controlador (Adaptador web)
    this.ticketController = new TicketController(this.ticketService);
    
    console.log('✅ Dependencias configuradas con Dependency Injection');
  }

  configureRoutes() {
    // Configurar rutas inyectando el controlador
    this.app.use('/api', setupTicketRoutes(this.ticketController));
    
    // Ruta de salud
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'HelpDeskPro API funcionando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      });
    });

    // Ruta de información
    this.app.get('/api/info', (req, res) => {
      res.json({
        name: 'HelpDeskPro API',
        version: '1.0.0',
        description: 'Sistema de gestión de tickets con Arquitectura Hexagonal',
        architecture: 'Hexagonal (Ports & Adapters)',
        database: 'PostgreSQL'
      });
    });
  }

  configureErrorHandling() {
    // Manejo de errores 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Manejo de errores global
    this.app.use((error, req, res, next) => {
      console.error('Error no manejado:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Contacte al administrador'
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log('='.repeat(50));
      console.log(' HelpDeskPro API - Arquitectura Hexagonal');
      console.log('='.repeat(50));
      console.log(` Servidor corriendo en http://localhost:${this.port}`);
      console.log(` API disponible en http://localhost:${this.port}/api`);
      console.log(`  Health check en http://localhost:${this.port}/health`);
      console.log(` Entorno: ${process.env.NODE_ENV}`);
      console.log('='.repeat(50));
    });
  }
}

// Inicializar la aplicación
const application = new Application();
application.start();

// Exportar para testing
module.exports = Application;