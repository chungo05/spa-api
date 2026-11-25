// routes/turnos.js
// CRUD de la tabla "turnos" (tabla principal: relaciona cliente, especialista y tratamiento)

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { manejarError, camposFaltantes } = require('../utils/errores');

// Consulta base con JOIN para mostrar también los nombres de las tablas relacionadas
const SELECT_TURNOS = `
  SELECT t.id_turno, t.fecha_hora, t.estado,
         t.id_cliente,      c.nombre AS cliente,
         t.id_especialista, e.nombre AS especialista,
         t.id_tratamiento,  tr.nombre AS tratamiento
    FROM turnos t
    JOIN clientes      c  ON c.id_cliente       = t.id_cliente
    JOIN especialistas e  ON e.id_especialista  = t.id_especialista
    JOIN tratamientos  tr ON tr.id_tratamiento  = t.id_tratamiento`;

/**
 * @swagger
 * /api/turnos:
 *   get:
 *     summary: Obtiene todos los turnos agendados
 *     description: Devuelve cada turno junto con el nombre del cliente, del especialista y del tratamiento (JOIN).
 *     tags: [Turnos]
 *     parameters:
 *       - in: query
 *         name: estado
 *         required: false
 *         description: Filtra los turnos por estado
 *         schema:
 *           type: string
 *           enum: [confirmado, cancelado]
 *     responses:
 *       200:
 *         description: Lista de turnos ordenada por fecha y hora
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TurnoDetalle'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    const result = estado
      ? await pool.query(`${SELECT_TURNOS} WHERE t.estado = $1 ORDER BY t.fecha_hora`, [estado])
      : await pool.query(`${SELECT_TURNOS} ORDER BY t.fecha_hora`);
    res.json(result.rows);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/turnos/{id}:
 *   get:
 *     summary: Obtiene un turno por su id
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del turno
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Turno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TurnoDetalle'
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`${SELECT_TURNOS} WHERE t.id_turno = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/turnos:
 *   post:
 *     summary: Agenda un nuevo turno
 *     description: El cliente, el especialista y el tratamiento deben existir previamente (llaves foráneas). Si no se envía estado, se guarda como "confirmado".
 *     tags: [Turnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoInput'
 *           example:
 *             fecha_hora: "2026-12-15 11:30"
 *             estado: confirmado
 *             id_cliente: 3
 *             id_especialista: 9
 *             id_tratamiento: 1
 *     responses:
 *       201:
 *         description: Turno agendado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turno'
 *       400:
 *         description: Faltan campos obligatorios, el estado no es válido o la fecha tiene formato incorrecto
 *       409:
 *         description: El cliente, especialista o tratamiento indicado no existe
 */
router.post('/', async (req, res) => {
  const faltan = camposFaltantes(req.body, ['fecha_hora', 'id_cliente', 'id_especialista', 'id_tratamiento']);
  if (faltan.length > 0) {
    return res.status(400).json({ error: `Faltan campos obligatorios: ${faltan.join(', ')}` });
  }
  const { fecha_hora, estado, id_cliente, id_especialista, id_tratamiento } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO turnos (fecha_hora, estado, id_cliente, id_especialista, id_tratamiento)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fecha_hora, estado || 'confirmado', id_cliente, id_especialista, id_tratamiento]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/turnos/{id}:
 *   put:
 *     summary: Actualiza un turno (reprogramar, cambiar especialista o cancelar)
 *     description: Se pueden enviar solo los campos que se desean modificar; los demás conservan su valor.
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del turno a actualizar
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoInput'
 *           example:
 *             fecha_hora: "2026-12-01 13:00"
 *             estado: cancelado
 *     responses:
 *       200:
 *         description: Turno actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Turno'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Turno no encontrado
 *       409:
 *         description: El cliente, especialista o tratamiento indicado no existe
 */
router.put('/:id', async (req, res) => {
  const { fecha_hora, estado, id_cliente, id_especialista, id_tratamiento } = req.body;
  if ([fecha_hora, estado, id_cliente, id_especialista, id_tratamiento].every((v) => v === undefined)) {
    return res.status(400).json({ error: 'Envía al menos un campo para actualizar.' });
  }
  try {
    const result = await pool.query(
      `UPDATE turnos
          SET fecha_hora      = COALESCE($1, fecha_hora),
              estado          = COALESCE($2, estado),
              id_cliente      = COALESCE($3, id_cliente),
              id_especialista = COALESCE($4, id_especialista),
              id_tratamiento  = COALESCE($5, id_tratamiento)
        WHERE id_turno = $6
        RETURNING *`,
      [fecha_hora, estado, id_cliente, id_especialista, id_tratamiento, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/turnos/{id}:
 *   delete:
 *     summary: Elimina un turno
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del turno a eliminar
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Turno eliminado
 *       404:
 *         description: Turno no encontrado
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM turnos WHERE id_turno = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }
    res.json({ mensaje: 'Turno eliminado correctamente.', turno: result.rows[0] });
  } catch (error) {
    manejarError(res, error);
  }
});

module.exports = router;
