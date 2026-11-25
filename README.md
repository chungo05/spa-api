# API Spa & Salón de Belleza: agendamiento de turnos

Proyecto final, **tema 14: Plataforma de Agendamiento de Turnos y Servicios para Salón de Belleza o Spa**.

Es una API REST hecha con **Node.js + Express + PostgreSQL**, documentada con **Swagger (OpenAPI 3.0)**.

## Base de datos

| Tabla | Columnas | Relación |
|---|---|---|
| `tratamientos` | id_tratamiento (PK), nombre, duracion_minutos, costo | 1:N con turnos |
| `especialistas` | id_especialista (PK), nombre, telefono, especialidad | 1:N con turnos |
| `clientes` | id_cliente (PK), nombre, correo, fecha_cumpleanos | 1:N con turnos |
| `turnos` | id_turno (PK), fecha_hora, estado, id_cliente (FK), id_especialista (FK), id_tratamiento (FK) | tabla transaccional |

## Estructura

```
spa-api/
├── index.js            # Servidor Express, Swagger y montaje de rutas
├── db.js               # Pool de conexión a PostgreSQL
├── routes/             # Un archivo CRUD por tabla (express.Router)
│   ├── tratamientos.js
│   ├── especialistas.js
│   ├── clientes.js
│   └── turnos.js
├── utils/errores.js    # Traducción de errores de PostgreSQL a códigos HTTP
├── database/
│   ├── schema.sql      # CREATE TABLE con PK y FK
│   └── seed.sql        # 12 registros por tabla
└── hoppscotch/spa-api.hoppscotch.json   # Colección de pruebas
```

## Instalación

1. Crea la base de datos. En pgAdmin (Query Tool sobre `postgres`) ejecuta `CREATE DATABASE spa_db;`. Después abre el Query Tool sobre `spa_db` y ejecuta `database/schema.sql` y luego `database/seed.sql`.

   Si prefieres la terminal:
   ```bash
   psql -U postgres -c "CREATE DATABASE spa_db;"
   psql -U postgres -d spa_db -f database/schema.sql
   psql -U postgres -d spa_db -f database/seed.sql
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura la conexión. Por defecto `db.js` usa `localhost:5432`, el usuario `postgres`, la contraseña `postgres` y la base `spa_db`. Si tu configuración es otra, cámbiala con variables de entorno:
   ```bash
   DB_PASSWORD=miClave npm start
   ```
   Las variables disponibles son `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `PORT`.
4. Levanta el servidor:
   ```bash
   npm start      # o: npm run dev  (con nodemon)
   ```
   La API queda en http://localhost:3000 y la documentación Swagger en http://localhost:3000/api-docs.

## Endpoints

Cada recurso (`tratamientos`, `especialistas`, `clientes`, `turnos`) tiene estos endpoints:

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/{recurso}` | Lista todos los registros |
| GET | `/api/{recurso}/{id}` | Obtiene un registro |
| POST | `/api/{recurso}` | Crea un registro |
| PUT | `/api/{recurso}/{id}` | Actualiza un registro (basta con enviar los campos que cambian) |
| DELETE | `/api/{recurso}/{id}` | Elimina un registro |

Además, `GET /api/turnos?estado=cancelado` filtra por estado y devuelve los nombres del cliente, el especialista y el tratamiento (JOIN).

### Códigos de respuesta
- `200` / `201`: la operación salió bien.
- `400`: faltan campos o el formato es inválido (fecha, estado, JSON).
- `404`: el registro no existe.
- `409`: la llave foránea no existe, el valor está duplicado (nombre de tratamiento o correo), o se intenta borrar un registro que tiene turnos.
- `500`: error interno.

## Pruebas con Hoppscotch
En https://hoppscotch.io ve a **Collections → Import → Hoppscotch** y elige `hoppscotch/spa-api.hoppscotch.json`.

Si usas la versión web, instala la extensión de navegador de Hoppscotch o activa el *proxy*; si no, no podrá llegar a `localhost`.
