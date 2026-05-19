import { pool } from '../config/db.js';

export const getCourses = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id, 
        c.date_time AS datetime, 
        c.nb_places AS nbplaces, 
        (SELECT CAST(COUNT(id) AS INTEGER) FROM bookings b WHERE b.class_id = c.id) AS booked_count,
        a.title AS "activityTitle", 
        a.duration_minutes AS duration,
        a.calories,
        a.intensity,
        at.label AS "activityType", 
        o.label AS objective,
        r.name AS "roomName"
      FROM classes c
      JOIN activities a ON c.activity_id = a.id
      LEFT JOIN activity_types at ON a.activity_type_id = at.id
      LEFT JOIN objectives o ON a.objective_id = o.id
      JOIN rooms r ON c.room_id = r.id
      WHERE c.date_time >= CURRENT_DATE + INTERVAL '1 day'
        AND c.date_time < CURRENT_DATE + INTERVAL '9 days'
      ORDER BY c.date_time ASC
    `;
    const result = await pool.query(query);
    
    return res.status(200).json({ data: result.rows, message: 'OK' });
  } catch (error) {
    console.error("getCourses error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

export const bookCourse = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { classId } = req.body;
    const userId = req.user.id;

    if (!classId) {
      return res.status(400).json({ error: "Le paramètre classId est obligatoire" });
    }

    await client.query('BEGIN');

    // Check if class exists
    const classResult = await client.query("SELECT id FROM classes WHERE id = $1", [classId]);
    if (classResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Cours introuvable" });
    }

    // Check if user has already booked this class
    const bookingCheck = await client.query("SELECT id FROM bookings WHERE class_id = $1 AND user_id = $2", [classId, userId]);
    if (bookingCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Vous êtes déjà inscrit à ce cours" });
    }

    // Insert booking
    await client.query("INSERT INTO bookings (class_id, user_id, booking_date) VALUES ($1, $2, CURRENT_TIMESTAMP)", [classId, userId]);

    await client.query('COMMIT');
    return res.status(201).json({ message: "Réservation confirmée avec succès" });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("bookCourse error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
};
