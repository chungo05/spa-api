// utils/errores.js
// Traduce los errores de PostgreSQL a respuestas HTTP claras,
// para que la API nunca se caiga ante datos inválidos.

function manejarError(res, error) {
  switch (error.code) {
    case '23503': // foreign_key_violation (ej. id_cliente que no existe)
      return res.status(409).json({
        error: 'Violación de llave foránea: el registro relacionado no existe.',
        detalle: error.detail,
      });
    case '23001': // restrict_violation (ON DELETE RESTRICT)
      return res.status(409).json({
        error: 'No se puede eliminar: el registro está siendo usado en la tabla turnos.',
        detalle: error.detail,
      });
    case '23505': // unique_violation
      return res.status(409).json({ error: 'Registro duplicado.', detalle: error.detail });
    case '23514': // check_violation
      return res.status(400).json({ error: 'Un valor no cumple las reglas de la tabla (CHECK).', detalle: error.constraint });
    case '23502': // not_null_violation
      return res.status(400).json({ error: `El campo "${error.column}" es obligatorio.` });
    case '22P02': // invalid_text_representation (ej. texto donde va un número)
    case '22007': // invalid_datetime_format
    case '22008': // datetime_field_overflow
    case '22003': // numeric_value_out_of_range
    case '22001': // string_data_right_truncation
      return res.status(400).json({ error: 'Formato o tipo de dato inválido.', detalle: error.message });
    default:
      console.error(error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// Devuelve la lista de campos obligatorios que no vienen en el body
function camposFaltantes(body, campos) {
  return campos.filter((c) => body[c] === undefined || body[c] === null || body[c] === '');
}

module.exports = { manejarError, camposFaltantes };
