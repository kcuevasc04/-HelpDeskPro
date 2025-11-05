const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: 'postgres',
    password: 'postgres' // Cambia por tu password de postgres
  });

  try {
    await adminClient.connect();
    console.log(' Conectado a PostgreSQL como administrador');

    // Verificar si la base de datos existe
    const dbCheck = await adminClient.query(`
      SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'
    `);

    if (dbCheck.rows.length === 0) {
      console.log(' Creando base de datos...');
      await adminClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(' Base de datos creada');
    } else {
      console.log(' Base de datos ya existe');
    }

    // Verificar si el usuario existe
    const userCheck = await adminClient.query(`
      SELECT 1 FROM pg_roles WHERE rolname = '${process.env.DB_USER}'
    `);

    if (userCheck.rows.length === 0) {
      console.log(' Creando usuario...');
      await adminClient.query(`CREATE USER ${process.env.DB_USER} WITH PASSWORD '${process.env.DB_PASSWORD}'`);
      console.log(' Usuario creado');
    } else {
      console.log(' Usuario ya existe');
    }

    // Conceder permisos
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${process.env.DB_NAME} TO ${process.env.DB_USER}`);
    console.log('Permisos concedidos');

  } catch (error) {
    console.error(' Error configurando base de datos:', error.message);
    
    // Si falla la conexión como postgres, intentar con el usuario normal
    if (error.message.includes('authentication failed')) {
      console.log('  No se pudo conectar como postgres, intentando configuración alternativa...');
      await setupWithNormalUser();
    }
  } finally {
    await adminClient.end();
  }
}

async function setupWithNormalUser() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    await client.connect();
    console.log(' Conectado directamente a la base de datos');
  } catch (error) {
    console.error(' Error de conexión:', error.message);
    console.log('\n INSTRUCCIONES MANUALES:');
    console.log('1. Accede a PostgreSQL: sudo -u postgres psql');
    console.log('2. Ejecuta: CREATE DATABASE helpdesk_db;');
    console.log('3. Ejecuta: CREATE USER helpdesk_user WITH PASSWORD \"helpdesk123\";');
    console.log('4. Ejecuta: GRANT ALL PRIVILEGES ON DATABASE helpdesk_db TO helpdesk_user;');
  } finally {
    await client.end();
  }
}

setupDatabase();