// routes/clientes.js
// CRUD de la tabla "clientes" (personas que agendan turnos)

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { manejarError, camposFaltantes } = require('../utils/errores');

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtiene todos los clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes ordenada por id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id_cliente');
    res.json(result.rows);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtiene un cliente por su id
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del cliente
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes WHERE id_cliente = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Registra un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *           example:
 *             nombre: Natalia Bermúdez Lara
 *             correo: natalia.bermudez@gmail.com
 *             fecha_cumpleanos: "1997-04-21"
 *     responses:
 *       201:
 *         description: Cliente creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Faltan campos obligatorios o los datos son inválidos
 *       409:
 *         description: Ya existe un cliente con ese correo
 */
router.post('/', async (req, res) => {
  const faltan = camposFaltantes(req.body, ['nombre', 'correo']);
  if (faltan.length > 0) {
    return res.status(400).json({ error: `Faltan campos obligatorios: ${faltan.join(', ')}` });
  }
  const { nombre, correo, fecha_cumpleanos } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nombre, correo, fecha_cumpleanos) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo, fecha_cumpleanos || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualiza un cliente existente
 *     description: Se pueden enviar solo los campos que se desean modificar; los demás conservan su valor.
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del cliente a actualizar
 *         schema:
 *           type: integer
 *           example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteInput'
 *           example:
 *             correo: gabriela.moreno.rios@gmail.com
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Cliente no encontrado
 *       409:
 *         description: El correo ya pertenece a otro cliente
 */
router.put('/:id', async (req, res) => {
  const { nombre, correo, fecha_cumpleanos } = req.body;
  if (nombre === undefined && correo === undefined && fecha_cumpleanos === undefined) {
    return res.status(400).json({ error: 'Envía al menos un campo para actualizar.' });
  }
  try {
    const result = await pool.query(
      `UPDATE clientes
          SET nombre           = COALESCE($1, nombre),
              correo           = COALESCE($2, correo),
              fecha_cumpleanos = COALESCE($3, fecha_cumpleanos)
        WHERE id_cliente = $4
        RETURNING *`,
      [nombre, correo, fecha_cumpleanos, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    manejarError(res, error);
  }
});

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Elimina un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identificador del cliente a eliminar
 *         schema:
 *           type: integer
 *           example: 12
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *       404:
 *         description: Cliente no encontrado
 *       409:
 *         description: No se puede eliminar porque tiene turnos agendados
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clientes WHERE id_cliente = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }
    res.json({ mensaje: 'Cliente eliminado correctamente.', cliente: result.rows[0] });
  } catch (error) {
    manejarError(res, error);
  }
});

module.exports = router;
