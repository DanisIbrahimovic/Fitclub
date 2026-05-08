import { pool } from '../config/db.js';

const BASE_ACTIVITY_QUERY = `
  SELECT
    a.id,
    a.title,
    a.description,
    a.duration_minutes AS durationminutes,
    a.intensity,
    a.calories,
    a.photo,
    at.label AS type,
    o.label  AS objective
  FROM activities a
  LEFT JOIN activity_types at ON a.activity_type_id = at.id
  LEFT JOIN objectives      o  ON a.objective_id    = o.id
`;

export const getActivities = async (req, res) => {
  try {
    const { title, type, objective } = req.query;
    const params = [];
    let query = BASE_ACTIVITY_QUERY + ' WHERE 1=1';

    if (title) {
      params.push(`%${title}%`);
      query += ` AND a.title ILIKE $${params.length}`;
    }
    if (type) {
      params.push(`%${type}%`);
      query += ` AND at.label ILIKE $${params.length}`;
    }
    if (objective) {
      params.push(`%${objective}%`);
      query += ` AND o.label ILIKE $${params.length}`;
    }

    const { rows } = await pool.query(query, params);
    return res.status(200).json({ data: rows, message: 'OK' });
  } catch (error) {
    console.error('getActivities error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const { rows } = await pool.query(BASE_ACTIVITY_QUERY + ' WHERE a.id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Activité introuvable' });
    }
    return res.status(200).json({ data: rows[0], message: 'OK' });
  } catch (error) {
    console.error('getActivityById error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getTypes = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, label AS name FROM activity_types ORDER BY label ASC');
    return res.status(200).json({ data: rows, message: 'OK' });
  } catch (error) {
    console.error('getTypes error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getObjectives = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, label AS name FROM objectives ORDER BY label ASC');
    return res.status(200).json({ data: rows, message: 'OK' });
  } catch (error) {
    console.error('getObjectives error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
