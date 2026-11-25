-- =====================================================================
--  Proyecto 14: Salón de Belleza / Spa
--  Archivo:     seed.sql  (inserción de registros de prueba)
--  Ejecutar sobre la base de datos "spa_db" DESPUÉS de schema.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- TRATAMIENTOS (12 registros) - costos en pesos mexicanos (MXN)
-- ---------------------------------------------------------------------
INSERT INTO tratamientos (nombre, duracion_minutos, costo) VALUES
('Facial hidratante profundo',        60,  850.00),
('Masaje relajante de cuerpo completo', 90, 1200.00),
('Manicure spa',                      45,  350.00),
('Pedicure spa',                      60,  450.00),
('Corte y peinado',                   50,  400.00),
('Tinte de cabello completo',        120, 1500.00),
('Masaje con piedras calientes',      75, 1350.00),
('Depilación con cera (piernas)',     40,  500.00),
('Limpieza facial con extracción',    70,  950.00),
('Uñas acrílicas',                    90,  650.00),
('Tratamiento capilar de keratina',  150, 2200.00),
('Exfoliación corporal',              50,  780.00);

-- ---------------------------------------------------------------------
-- ESPECIALISTAS (12 registros)
-- ---------------------------------------------------------------------
INSERT INTO especialistas (nombre, telefono, especialidad) VALUES
('Mariana López Hernández',     '5512345678', 'Cosmetología facial'),
('Carlos Ramírez Ortega',       '5523456789', 'Masoterapia'),
('Fernanda Gutiérrez Ruiz',     '3312345678', 'Manicure y pedicure'),
('Sofía Martínez Castillo',     '8112345678', 'Estilismo y colorimetría'),
('Alejandro Torres Vega',       '5534567890', 'Masoterapia'),
('Daniela Flores Morales',      '3323456789', 'Uñas acrílicas y gel'),
('Valeria Sánchez Domínguez',   '5545678901', 'Depilación'),
('Ricardo Mendoza Navarro',     '8123456789', 'Estilismo y colorimetría'),
('Paola Jiménez Aguilar',       '2221234567', 'Cosmetología facial'),
('Andrea Cruz Delgado',         '5556789012', 'Tratamientos capilares'),
('Jorge Reyes Salazar',         '4421234567', 'Tratamientos corporales'),
('Lucía Herrera Campos',        '9991234567', 'Manicure y pedicure');

-- ---------------------------------------------------------------------
-- CLIENTES (12 registros)
-- ---------------------------------------------------------------------
INSERT INTO clientes (nombre, correo, fecha_cumpleanos) VALUES
('Ana Patricia Romero',      'ana.romero@gmail.com',        '1992-03-14'),
('Luis Fernando Castro',     'luis.castro@hotmail.com',     '1988-07-22'),
('Gabriela Moreno Ríos',     'gaby.moreno@outlook.com',     '1995-11-05'),
('Diana Laura Vázquez',      'diana.vazquez@gmail.com',     '1990-01-30'),
('Roberto Silva Medina',     'roberto.silva@yahoo.com.mx',  '1985-09-12'),
('Karla Ivonne Peña',        'karla.pena@gmail.com',        '1998-05-18'),
('Mónica Estrada León',      'monica.estrada@hotmail.com',  '1993-12-25'),
('Héctor Ibarra Fuentes',    'hector.ibarra@gmail.com',     '1980-04-08'),
('Ximena Ortiz Cervantes',   'ximena.ortiz@outlook.com',    '2000-08-03'),
('Claudia Rangel Soto',      'claudia.rangel@gmail.com',    '1987-02-17'),
('Itzel Guerrero Pineda',    'itzel.guerrero@yahoo.com.mx', '1996-10-29'),
('Miguel Ángel Ponce',       'miguel.ponce@gmail.com',      '1991-06-11');

-- ---------------------------------------------------------------------
-- TURNOS (12 registros)
-- Cada turno combina un cliente, un especialista acorde al tratamiento
-- y el tratamiento a recibir.
-- ---------------------------------------------------------------------
INSERT INTO turnos (fecha_hora, estado, id_cliente, id_especialista, id_tratamiento) VALUES
('2026-12-01 10:00', 'confirmado',  1,  1,  1),  -- Ana       -> Mariana   -> Facial hidratante
('2026-12-01 12:00', 'confirmado',  2,  2,  2),  -- Luis      -> Carlos    -> Masaje relajante
('2026-12-02 09:30', 'confirmado',  3,  3,  3),  -- Gabriela  -> Fernanda  -> Manicure spa
('2026-12-02 11:00', 'cancelado',   4, 12,  4),  -- Diana     -> Lucía     -> Pedicure spa
('2026-12-03 16:00', 'confirmado',  5,  4,  5),  -- Roberto   -> Sofía     -> Corte y peinado
('2026-12-04 10:00', 'confirmado',  6,  8,  6),  -- Karla     -> Ricardo   -> Tinte completo
('2026-12-04 13:00', 'confirmado',  7,  5,  7),  -- Mónica    -> Alejandro -> Piedras calientes
('2026-12-05 17:30', 'cancelado',   8,  7,  8),  -- Héctor    -> Valeria   -> Depilación
('2026-12-06 11:00', 'confirmado',  9,  9,  9),  -- Ximena    -> Paola     -> Limpieza facial
('2026-12-06 15:00', 'confirmado', 10,  6, 10),  -- Claudia   -> Daniela   -> Uñas acrílicas
('2026-12-08 10:30', 'confirmado', 11, 10, 11),  -- Itzel     -> Andrea    -> Keratina
('2026-12-09 18:00', 'cancelado',  12, 11, 12);  -- Miguel    -> Jorge     -> Exfoliación

-- Verificación rápida
SELECT * FROM tratamientos;
SELECT * FROM especialistas;
SELECT * FROM clientes;
SELECT * FROM turnos;
