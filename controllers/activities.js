import { pool } from '../config/db.js';

// Requête de base partagée par getActivities et getActivityById (admin)
const BASE_ACTIVITY_QUERY = `
  SELECT
    a.id,
    a.title,
    a.description,
    a.duration_minutes AS durationminutes,
    a.intensity,
    a.calories,
    a.photo,
    a.activity_type_id AS activitytypeid,
    a.objective_id     AS objectiveid,
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

    query += ' ORDER BY a.id ASC';

    const { rows } = await pool.query(query, params);
    return res.status(200).json({ data: rows, message: 'OK' });
  } catch (error) {
    console.error('Admin getActivities error:', error);
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
    console.error('Admin getActivityById error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createActivity = async (req, res) => {
  try {
    const { title, description, durationminutes, intensity, calories, activitytypeid, objectiveid } = req.body;
    const photo = req.file?.filename ?? null;

    if (!title || !description || !durationminutes || !intensity || !calories || !activitytypeid || !objectiveid) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    const intensityNum = parseInt(intensity, 10);
    if (isNaN(intensityNum) || intensityNum < 1 || intensityNum > 5) {
      return res.status(400).json({ error: "L'intensité doit être un nombre entre 1 et 5" });
    }

    const { rows } = await pool.query(
      `INSERT INTO activities
         (title, description, duration_minutes, intensity, calories, activity_type_id, objective_id, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, durationminutes, intensityNum, calories, activitytypeid, objectiveid, photo]
    );

    return res.status(201).json({ message: 'Activité créée avec succès', data: rows[0] });
  } catch (error) {
    console.error('createActivity error:', error);
    return res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, durationminutes, intensity, calories, activitytypeid, objectiveid } = req.body;
    const photo = req.file?.filename ?? null;

    if (!title || !description || !durationminutes || !intensity || !calories || !activitytypeid || !objectiveid) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    const intensityNum = parseInt(intensity, 10);
    if (isNaN(intensityNum) || intensityNum < 1 || intensityNum > 5) {
      return res.status(400).json({ error: "L'intensité doit être un nombre entre 1 et 5" });
    }

    const check = await pool.query('SELECT id FROM activities WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Activité introuvable' });
    }

    const baseFields = [title, description, durationminutes, intensityNum, calories, activitytypeid, objectiveid];
    const { rows } = photo
      ? await pool.query(
          `UPDATE activities
           SET title = $1, description = $2, duration_minutes = $3, intensity = $4,
               calories = $5, activity_type_id = $6, objective_id = $7, photo = $8
           WHERE id = $9 RETURNING *`,
          [...baseFields, photo, id]
        )
      : await pool.query(
          `UPDATE activities
           SET title = $1, description = $2, duration_minutes = $3, intensity = $4,
               calories = $5, activity_type_id = $6, objective_id = $7
           WHERE id = $8 RETURNING *`,
          [...baseFields, id]
        );

    return res.status(200).json({ message: 'Activité mise à jour avec succès', data: rows[0] });
  } catch (error) {
    console.error('updateActivity error:', error);
    return res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING id', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Activité introuvable' });
    }
    return res.status(200).json({ message: 'Activité supprimée avec succès' });
  } catch (error) {
    console.error('deleteActivity error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
