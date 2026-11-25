// db.js
// Configuración del Pool de conexiones a PostgreSQL.
// Un Pool mantiene varias conexiones abiertas y las reutiliza entre peticiones,
// lo que es más eficiente que abrir/cerrar una conexión por cada consulta.

const { Pool, types } = require('pg');

// Conversión de tipos al leer resultados:
//  - DATE (1082) y TIMESTAMP (1114) se devuelven tal cual como texto,
//    para evitar desfases de zona horaria al convertirlos a JSON.
//  - NUMERIC (1700) se convierte a número (por defecto pg lo devuelve como texto).
types.setTypeParser(1082, (valor) => valor);
types.setTypeParser(1114, (valor) => valor);
types.setTypeParser(1700, (valor) => parseFloat(valor));

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'spa_db',
});

// Si una conexión inactiva del pool falla, se registra el error sin tumbar el servidor
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

module.exports = pool;
