// index.js
// Punto de entrada de la API: configura Express, Swagger y monta las rutas de cada tabla.

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const tratamientosRoutes = require('./routes/tratamientos');
const especialistasRoutes = require('./routes/especialistas');
const clientesRoutes = require('./routes/clientes');
const turnosRoutes = require('./routes/turnos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());          // Permite peticiones desde otros orígenes (Hoppscotch, frontends)
app.use(express.json());  // Interpreta el body de las peticiones como JSON

// ---------------------------------------------------------------------
// Configuración de Swagger (contrato de la API - OpenAPI 3.0)
// ---------------------------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Spa & Salón de Belleza - Agendamiento de Turnos',
      version: '1.0.0',
      description:
        'API REST para la gestión de un Salón de Belleza / Spa. Permite administrar el catálogo de ' +
        'tratamientos, los especialistas, los clientes y el agendamiento de turnos (citas) donde un ' +
        'cliente reserva un tratamiento con un especialista en una fecha y hora determinada.',
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Servidor local de desarrollo' }],
    tags: [
      { name: 'Tratamientos', description: 'Catálogo de servicios del spa' },
      { name: 'Especialistas', description: 'Personal que atiende los turnos' },
      { name: 'Clientes', description: 'Personas que agendan turnos' },
      { name: 'Turnos', description: 'Citas agendadas (cliente + especialista + tratamiento)' },
    ],
    components: {
      schemas: {
        Tratamiento: {
          type: 'object',
          properties: {
            id_tratamiento: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Facial hidratante profundo' },
            duracion_minutos: { type: 'integer', example: 60 },
            costo: { type: 'number', format: 'float', example: 850.0 },
          },
        },
        TratamientoInput: {
          type: 'object',
          required: ['nombre', 'duracion_minutos', 'costo'],
          properties: {
            nombre: { type: 'string', example: 'Masaje descontracturante' },
            duracion_minutos: { type: 'integer', example: 60 },
            costo: { type: 'number', format: 'float', example: 1100.0 },
          },
        },
        Especialista: {
          type: 'object',
          properties: {
            id_especialista: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Mariana López Hernández' },
            telefono: { type: 'string', example: '5512345678' },
            especialidad: { type: 'string', example: 'Cosmetología facial' },
          },
        },
        EspecialistaInput: {
          type: 'object',
          required: ['nombre', 'telefono', 'especialidad'],
          properties: {
            nombre: { type: 'string', example: 'Renata Aguirre Bravo' },
            telefono: { type: 'string', example: '5587654321' },
            especialidad: { type: 'string', example: 'Maquillaje profesional' },
          },
        },
        Cliente: {
          type: 'object',
          properties: {
            id_cliente: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Ana Patricia Romero' },
            correo: { type: 'string', format: 'email', example: 'ana.romero@gmail.com' },
            fecha_cumpleanos: { type: 'string', format: 'date', example: '1992-03-14' },
          },
        },
        ClienteInput: {
          type: 'object',
          required: ['nombre', 'correo'],
          properties: {
            nombre: { type: 'string', example: 'Natalia Bermúdez Lara' },
            correo: { type: 'string', format: 'email', example: 'natalia.bermudez@gmail.com' },
            fecha_cumpleanos: { type: 'string', format: 'date', example: '1997-04-21' },
          },
        },
        Turno: {
          type: 'object',
          properties: {
            id_turno: { type: 'integer', example: 1 },
            fecha_hora: { type: 'string', example: '2026-12-01 10:00:00' },
            estado: { type: 'string', enum: ['confirmado', 'cancelado'], example: 'confirmado' },
            id_cliente: { type: 'integer', example: 1 },
            id_especialista: { type: 'integer', example: 1 },
            id_tratamiento: { type: 'integer', example: 1 },
          },
        },
        TurnoDetalle: {
          allOf: [
            { $ref: '#/components/schemas/Turno' },
            {
              type: 'object',
              properties: {
                cliente: { type: 'string', example: 'Ana Patricia Romero' },
                especialista: { type: 'string', example: 'Mariana López Hernández' },
                tratamiento: { type: 'string', example: 'Facial hidratante profundo' },
              },
            },
          ],
        },
        TurnoInput: {
          type: 'object',
          required: ['fecha_hora', 'id_cliente', 'id_especialista', 'id_tratamiento'],
          properties: {
            fecha_hora: { type: 'string', example: '2026-12-15 11:30' },
            estado: { type: 'string', enum: ['confirmado', 'cancelado'], example: 'confirmado' },
            id_cliente: { type: 'integer', example: 3 },
            id_especialista: { type: 'integer', example: 9 },
            id_tratamiento: { type: 'integer', example: 1 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Registro no encontrado.' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Archivos donde están los comentarios /** @swagger */
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------------------------------------------------------------------
// Rutas (una por tabla)
// ---------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API del Spa & Salón de Belleza funcionando',
    documentacion: `http://localhost:${PORT}/api-docs`,
    endpoints: ['/api/tratamientos', '/api/especialistas', '/api/clientes', '/api/turnos'],
  });
});

app.use('/api/tratamientos', tratamientosRoutes);
app.use('/api/especialistas', especialistasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/turnos', turnosRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada.` });
});

// Body JSON mal formado u otro error no controlado
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
});
