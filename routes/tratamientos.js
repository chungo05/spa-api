// routes/tratamientos.js
// CRUD de la tabla "tratamientos" (catálogo de servicios del spa)

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { manejarError, camposFaltantes } = require('../utils/errores');

/**
 * @swagger
 * /api/tratamientos:
 *   get:
 *     summary: Obtiene todos los tratamientos
 *     tags: [Tratamientos]
 *     responses:
 *       200:
 *         description: Lista de tratamientos ordenada por id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tratamiento'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tratamientos ORDER BY id_tratamiento');
    res.json(result.rows);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/tratamientos/{id}:
 *   get:
 *     summary: Obtiene un tratamiento por su id
 *     tags: [Tratamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del tratamiento
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Tratamiento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tratamiento'
 *       404:
 *         description: Tratamiento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tratamientos WHERE id_tratamiento = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tratamiento no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/tratamientos:
 *   post:
 *     summary: Crea un nuevo tratamiento
 *     tags: [Tratamientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TratamientoInput'
 *           example:
 *             nombre: Masaje descontracturante
 *             duracion_minutos: 60
 *             costo: 1100.00
 *     responses:
 *       201:
 *         description: Tratamiento creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tratamiento'
 *       400:
 *         description: Faltan campos obligatorios o los datos son inválidos
 *       409:
 *         description: Ya existe un tratamiento con ese nombre
 */
router.post('/', async (req, res) => {
  const faltan = camposFaltantes(req.body, ['nombre', 'duracion_minutos', 'costo']);
  if (faltan.length > 0) {
    return res.status(400).json({ error: `Faltan campos obligatorios: ${faltan.join(', ')}` });
  }
  const { nombre, duracion_minutos, costo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tratamientos (nombre, duracion_minutos, costo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, duracion_minutos, costo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/tratamientos/{id}:
 *   put:
 *     summary: Actualiza un tratamiento existente
 *     description: Se pueden enviar solo los campos que se desean modificar; los demás conservan su valor.
 *     tags: [Tratamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del tratamiento a actualizar
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TratamientoInput'
 *           example:
 *             costo: 900.00
 *     responses:
 *       200:
 *         description: Tratamiento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tratamiento'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tratamiento no encontrado
 */
router.put('/:id', async (req, res) => {
  const { nombre, duracion_minutos, costo } = req.body;
  if (nombre === undefined && duracion_minutos === undefined && costo === undefined) {
    return res.status(400).json({ error: 'Envía al menos un campo para actualizar.' });
  }
  try {
    const result = await pool.query(
      `UPDATE tratamientos
          SET nombre           = COALESCE($1, nombre),
              duracion_minutos = COALESCE($2, duracion_minutos),
              costo            = COALESCE($3, costo)
        WHERE id_tratamiento = $4
        RETURNING *`,
      [nombre, duracion_minutos, costo, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tratamiento no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/tratamientos/{id}:
 *   delete:
 *     summary: Elimina un tratamiento
 *     tags: [Tratamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del tratamiento a eliminar
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Tratamiento eliminado
 *       404:
 *         description: Tratamiento no encontrado
 *       409:
 *         description: No se puede eliminar porque tiene turnos asociados
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tratamientos WHERE id_tratamiento = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tratamiento no encontrado.' });
    }
    res.json({ mensaje: 'Tratamiento eliminado correctamente.', tratamiento: result.rows[0] });
  } catch (error) {
    manejarError(res, error);
  }
});

module.exports = router;
