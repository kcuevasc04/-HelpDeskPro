const { Pool } = require('pg');
const Ticket = require('../../domain/entities/Ticket');
const TicketRepository = require('../../domain/repositories/TicketRepository');

class PostgresTicketRepository extends TicketRepository {
  constructor() {
    super();
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'helpdesk_db',
      user: process.env.DB_USER || 'helpdesk_user',
      password: process.env.DB_PASSWORD || 'helpdesk123',
    });

    // Verificar conexión al crear la instancia
    this.verificarConexion();
  }

  async verificarConexion() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Conectado a PostgreSQL correctamente');
      client.release();
    } catch (error) {
      console.error('❌ Error conectando a PostgreSQL:', error.message);
      console.log('💡 Asegúrate de que:');
      console.log('1. PostgreSQL esté instalado y corriendo');
      console.log('2. La base de datos "helpdesk_db" exista');
      console.log('3. El usuario "helpdesk_user" exista con password "helpdesk123"');
      process.exit(1);
    }
  }

  async guardar(ticket) {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO tickets (id, usuario, descripcion, prioridad, estado, tecnico_asignado, fecha_creacion, fecha_actualizacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        ticket.id,
        ticket.usuario,
        ticket.descripcion,
        ticket.prioridad,
        ticket.estado,
        ticket.tecnicoAsignado,
        ticket.fechaCreacion,
        ticket.fechaActualizacion
      ];

      const result = await client.query(query, values);
      return Ticket.fromData(result.rows[0]);
      
    } catch (error) {
      console.error('Error al guardar ticket:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async buscarPorId(id) {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tickets WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return Ticket.fromData(result.rows[0]);
      
    } catch (error) {
      console.error('Error al buscar ticket por ID:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async listarTodos() {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tickets ORDER BY fecha_creacion DESC';
      const result = await client.query(query);
      
      return result.rows.map(row => Ticket.fromData(row));
      
    } catch (error) {
      console.error('Error al listar tickets:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async actualizar(ticket) {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE tickets 
        SET usuario = $1, descripcion = $2, prioridad = $3, estado = $4, 
            tecnico_asignado = $5, fecha_actualizacion = $6
        WHERE id = $7
        RETURNING *
      `;
      
      const values = [
        ticket.usuario,
        ticket.descripcion,
        ticket.prioridad,
        ticket.estado,
        ticket.tecnicoAsignado,
        new Date(),
        ticket.id
      ];

      const result = await client.query(query, values);
      return Ticket.fromData(result.rows[0]);
      
    } catch (error) {
      console.error('Error al actualizar ticket:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async eliminar(id) {
    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM tickets WHERE id = $1';
      await client.query(query, [id]);
      return true;
      
    } catch (error) {
      console.error('Error al eliminar ticket:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async buscarPorEstado(estado) {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tickets WHERE estado = $1 ORDER BY fecha_creacion DESC';
      const result = await client.query(query, [estado]);
      
      return result.rows.map(row => Ticket.fromData(row));
      
    } catch (error) {
      console.error('Error al buscar tickets por estado:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async buscarPorPrioridad(prioridad) {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tickets WHERE prioridad = $1 ORDER BY fecha_creacion DESC';
      const result = await client.query(query, [prioridad]);
      
      return result.rows.map(row => Ticket.fromData(row));
      
    } catch (error) {
      console.error('Error al buscar tickets por prioridad:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async buscarPorTecnico(tecnico) {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM tickets WHERE tecnico_asignado = $1 ORDER BY fecha_creacion DESC';
      const result = await client.query(query, [tecnico]);
      
      return result.rows.map(row => Ticket.fromData(row));
      
    } catch (error) {
      console.error('Error al buscar tickets por técnico:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async generarReporteEstadisticas() {
    const client = await this.pool.connect();
    try {
      const estadoQuery = `
        SELECT estado, COUNT(*) as cantidad 
        FROM tickets 
        GROUP BY estado
      `;
      
      const prioridadQuery = `
        SELECT prioridad, COUNT(*) as cantidad 
        FROM tickets 
        GROUP BY prioridad
      `;
      
      const tecnicoQuery = `
        SELECT tecnico_asignado, COUNT(*) as cantidad 
        FROM tickets 
        WHERE tecnico_asignado IS NOT NULL 
        GROUP BY tecnico_asignado
      `;

      const [estadoResult, prioridadResult, tecnicoResult] = await Promise.all([
        client.query(estadoQuery),
        client.query(prioridadQuery),
        client.query(tecnicoQuery)
      ]);

      return {
        porEstado: estadoResult.rows,
        porPrioridad: prioridadResult.rows,
        porTecnico: tecnicoResult.rows,
        total: (await client.query('SELECT COUNT(*) FROM tickets')).rows[0].count
      };
      
    } catch (error) {
      console.error('Error al generar reporte:', error);
      throw new Error(`Error de base de datos: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

module.exports = PostgresTicketRepository;