-- =====================================================================
--  Proyecto 14: Plataforma de Agendamiento de Turnos y Servicios
--               para Salón de Belleza o Spa
--  Archivo:     schema.sql  (creación de tablas, llaves primarias y foráneas)
--  Motor:       PostgreSQL
-- =====================================================================

-- Paso previo (ejecutar una sola vez, conectado a la BD "postgres"):
--   CREATE DATABASE spa_db;
-- Después, abrir el Query Tool sobre "spa_db" y ejecutar el resto del script.

-- Se eliminan en orden inverso a sus dependencias para poder re-ejecutar el script
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS especialistas;
DROP TABLE IF EXISTS tratamientos;

-- ---------------------------------------------------------------------
-- 1. TRATAMIENTOS: catálogo de servicios que ofrece el spa
-- ---------------------------------------------------------------------
CREATE TABLE tratamientos (
    id_tratamiento    SERIAL         PRIMARY KEY,
    nombre            VARCHAR(100)   NOT NULL UNIQUE,
    duracion_minutos  INTEGER        NOT NULL CHECK (duracion_minutos > 0),
    costo             NUMERIC(10,2)  NOT NULL CHECK (costo >= 0)
);

-- ---------------------------------------------------------------------
-- 2. ESPECIALISTAS: personal que atiende los turnos
-- ---------------------------------------------------------------------
CREATE TABLE especialistas (
    id_especialista   SERIAL         PRIMARY KEY,
    nombre            VARCHAR(100)   NOT NULL,
    telefono          VARCHAR(15)    NOT NULL,
    especialidad      VARCHAR(80)    NOT NULL
);

-- ---------------------------------------------------------------------
-- 3. CLIENTES: personas que agendan turnos
-- ---------------------------------------------------------------------
CREATE TABLE clientes (
    id_cliente        SERIAL         PRIMARY KEY,
    nombre            VARCHAR(100)   NOT NULL,
    correo            VARCHAR(120)   NOT NULL UNIQUE,
    fecha_cumpleanos  DATE
);

-- ---------------------------------------------------------------------
-- 4. TURNOS: tabla transaccional que une a las otras tres
--    Un cliente agenda un turno, con un especialista, para un tratamiento.
-- ---------------------------------------------------------------------
CREATE TABLE turnos (
    id_turno          SERIAL         PRIMARY KEY,
    fecha_hora        TIMESTAMP      NOT NULL,
    estado            VARCHAR(20)    NOT NULL DEFAULT 'confirmado'
                                     CHECK (estado IN ('confirmado', 'cancelado')),
    id_cliente        INTEGER        NOT NULL,
    id_especialista   INTEGER        NOT NULL,
    id_tratamiento    INTEGER        NOT NULL,

    CONSTRAINT fk_turno_cliente
        FOREIGN KEY (id_cliente)      REFERENCES clientes (id_cliente)           ON DELETE RESTRICT,
    CONSTRAINT fk_turno_especialista
        FOREIGN KEY (id_especialista) REFERENCES especialistas (id_especialista) ON DELETE RESTRICT,
    CONSTRAINT fk_turno_tratamiento
        FOREIGN KEY (id_tratamiento)  REFERENCES tratamientos (id_tratamiento)   ON DELETE RESTRICT
);
