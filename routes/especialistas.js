// routes/especialistas.js
// CRUD de la tabla "especialistas" (personal que atiende los turnos)

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { manejarError, camposFaltantes } = require('../utils/errores');

/**
 * @swagger
 * /api/especialistas:
 *   get:
 *     summary: Obtiene todos los especialistas
 *     tags: [Especialistas]
 *     responses:
 *       200:
 *         description: Lista de especialistas ordenada por id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Especialista'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM especialistas ORDER BY id_especialista');
    res.json(result.rows);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/especialistas/{id}:
 *   get:
 *     summary: Obtiene un especialista por su id
 *     tags: [Especialistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del especialista
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Especialista encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Especialista'
 *       404:
 *         description: Especialista no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM especialistas WHERE id_especialista = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Especialista no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/especialistas:
 *   post:
 *     summary: Registra un nuevo especialista
 *     tags: [Especialistas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EspecialistaInput'
 *           example:
 *             nombre: Renata Aguirre Bravo
 *             telefono: "5587654321"
 *             especialidad: Maquillaje profesional
 *     responses:
 *       201:
 *         description: Especialista creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Especialista'
 *       400:
 *         description: Faltan campos obligatorios o los datos son inválidos
 */
router.post('/', async (req, res) => {
  const faltan = camposFaltantes(req.body, ['nombre', 'telefono', 'especialidad']);
  if (faltan.length > 0) {
    return res.status(400).json({ error: `Faltan campos obligatorios: ${faltan.join(', ')}` });
  }
  const { nombre, telefono, especialidad } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO especialistas (nombre, telefono, especialidad) VALUES ($1, $2, $3) RETURNING *',
      [nombre, telefono, especialidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/especialistas/{id}:
 *   put:
 *     summary: Actualiza un especialista existente
 *     description: Se pueden enviar solo los campos que se desean modificar; los demás conservan su valor.
 *     tags: [Especialistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del especialista a actualizar
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EspecialistaInput'
 *           example:
 *             telefono: "5599887766"
 *     responses:
 *       200:
 *         description: Especialista actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Especialista'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Especialista no encontrado
 */
router.put('/:id', async (req, res) => {
  const { nombre, telefono, especialidad } = req.body;
  if (nombre === undefined && telefono === undefined && especialidad === undefined) {
    return res.status(400).json({ error: 'Envía al menos un campo para actualizar.' });
  }
  try {
    const result = await pool.query(
      `UPDATE especialistas
          SET nombre       = COALESCE($1, nombre),
              telefono     = COALESCE($2, telefono),
              especialidad = COALESCE($3, especialidad)
        WHERE id_especialista = $4
        RETURNING *`,
      [nombre, telefono, especialidad, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Especialista no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/especialistas/{id}:
 *   delete:
 *     summary: Elimina un especialista
 *     tags: [Especialistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del especialista a eliminar
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Especialista eliminado
 *       404:
 *         description: Especialista no encontrado
 *       409:
 *         description: No se puede eliminar porque tiene turnos asignados
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM especialistas WHERE id_especialista = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Especialista no encontrado.' });
    }
    res.json({ mensaje: 'Especialista eliminado correctamente.', especialista: result.rows[0] });
  } catch (error) {
    manejarError(res, error);
  }
});

module.exports = router;
