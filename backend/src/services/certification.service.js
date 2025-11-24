require('dotenv').config();
const pool = require('../config/database');

async function getExpiringCertifications(daysAhead = Number(process.env.CERT_EXPIRY_WARNING_DAYS || 30)) {
  const sql = `
    SELECT
      c.cert_id,
      c.cert_name,
      DATE(c.expires_at) AS expires_at,
      DATEDIFF(DATE(c.expires_at), CURDATE()) AS days_left,
      w.worker_id,
      COALESCE(w.first_name, '') AS worker_first_name,
      COALESCE(w.last_name, '') AS worker_last_name,
      pm.user_id AS pm_user_id,
      pm.email AS pm_email,
      COALESCE(pm.first_name, '') AS pm_first_name,
      COALESCE(pm.last_name, '') AS pm_last_name
    FROM certifications c
    JOIN workers w ON c.worker_id = w.worker_id
    LEFT JOIN project_assignments pa ON pa.worker_id = w.worker_id
    LEFT JOIN users pm ON pa.pm_user_id = pm.user_id OR w.pm_user_id = pm.user_id
    WHERE DATE(c.expires_at) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
    ORDER BY DATE(c.expires_at) ASC;
  `;
  const [rows] = await pool.query(sql, [daysAhead]);
  return rows;
}

module.exports = {
  getExpiringCertifications
};
