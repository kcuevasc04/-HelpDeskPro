const { Pool } = require('pg');
require('dotenv').config();

async function createTables() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'helpdesk_db',
    user: process.env.DB_USER || 'helpdesk_user',
    password: process.env.DB_PASSWORD || 'helpdesk123',
  });

  try {
    const client = await pool.connect();
    console.log('🔄 Creando tabla de tickets...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY,
        usuario VARCHAR(100) NOT NULL,
        descripcion TEXT NOT NULL,
        prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Crítica')),
        estado VARCHAR(20) NOT NULL CHECK (estado IN ('Abierto', 'En Progreso', 'En Espera', 'Resuelto', 'Cerrado')),
        tecnico_asignado VARCHAR(100),
        fecha_creacion TIMESTAMP NOT NULL,
        fecha_actualizacion TIMESTAMP NOT NULL
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ Tabla "tickets" creada exitosamente');

    // Crear índices
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets(estado)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_prioridad ON tickets(prioridad)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_tecnico ON tickets(tecnico_asignado)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tickets_fecha_creacion ON tickets(fecha_creacion)');
    
    console.log('✅ Índices creados exitosamente');
    
    // Insertar datos de ejemplo
    const { v4: uuidv4 } = require('uuid');
    const ticketsEjemplo = [
      [uuidv4(), 'Juan Pérez', 'No puedo acceder al correo electrónico', 'Alta', 'Abierto', null, new Date(), new Date()],
      [uuidv4(), 'María García', 'El monitor parpadea constantemente', 'Media', 'En Progreso', 'Carlos López', new Date(), new Date()],
      [uuidv4(), 'Pedro Rodríguez', 'Necesito acceso a la base de datos', 'Baja', 'Resuelto', 'Ana Martínez', new Date(), new Date()]
    ];

    for (const ticket of ticketsEjemplo) {
      await client.query(`
        INSERT INTO tickets (id, usuario, descripcion, prioridad, estado, tecnico_asignado, fecha_creacion, fecha_actualizacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, ticket);
    }

    console.log('✅ Datos de ejemplo insertados');
    
    client.release();
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();