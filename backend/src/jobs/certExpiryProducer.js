require('dotenv').config();
const pool = require('../config/database'); // expects mysql2/promise pool exported
const { enqueue } = require('../config/queue'); // expects enqueue(msg) exported
const cron = require('node-cron');

const DAYS_AHEAD = Number(process.env.CERT_EXPIRY_WARNING_DAYS || 30);
const CRON_EXPR = process.env.CERT_CHECK_CRON || '10 0 * * *'; // default daily at 00:10

async function findExpiringCerts() {

  const sql = `
    SELECT DISTINCT
      c.cert_id,
      c.cert_name,
      DATE(c.expiry_date) AS expires_at,
      DATEDIFF(DATE(c.expiry_date), CURDATE()) AS days_left,
      w.worker_id,
      COALESCE(w.first_name, '') AS worker_first_name,
      COALESCE(w.last_name, '') AS worker_last_name,
      u.user_id AS pm_user_id,
      u.email AS pm_email,
      COALESCE(w_pm.first_name, '') AS pm_first_name,
      COALESCE(w_pm.last_name, '') AS pm_last_name
    FROM certifications c
    JOIN workers w ON c.worker_id = w.worker_id
    LEFT JOIN project_assignments pa ON pa.worker_id = w.worker_id
    LEFT JOIN users u ON u.role = 'PM' AND u.worker_id IS NOT NULL
    LEFT JOIN workers w_pm ON u.worker_id = w_pm.worker_id
    WHERE DATE(c.expiry_date) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
    ORDER BY DATE(c.expiry_date) ASC;
  `;
  try {
    const [rows] = await pool.query(sql, [DAYS_AHEAD]);
    return rows;
  } catch (err) {
    console.error('[Producer] DB error fetching expiring certs', err);
    throw err;
  }
}

async function enqueueExpiringCerts() {
  try {
    const rows = await findExpiringCerts();
    if (!rows || rows.length === 0) {
      console.log(`[Producer] No certifications expiring within ${DAYS_AHEAD} days (${new Date().toISOString()})`);
      return 0;
    }
    let count = 0;
    for (const r of rows) {
      const worker_name = `${r.worker_first_name} ${r.worker_last_name}`.trim();
      const pm_name = `${r.pm_first_name || ''} ${r.pm_last_name || ''}`.trim();
      const msg = {
        cert_id: r.cert_id,
        cert_name: r.cert_name,
        expires_at: r.expires_at,
        days_left: Number(r.days_left),
        worker_id: r.worker_id,
        worker_name,
        pm_user_id: r.pm_user_id || null,
        pm_name: pm_name || null,
        pm_email: r.pm_email || null,
        enqueued_at: new Date().toISOString()
      };
      await enqueue(msg);
      console.log(`[Producer] Enqueued cert notification for ${worker_name} (${r.cert_name}) -> PM: ${msg.pm_email}`);
      count++;
    }
    return count;
  } catch (err) {
    console.error('[Producer] Error enqueueing messages', err);
    return 0;
  }
}

// run once (useful in dev)
async function runOnce() {
  return await enqueueExpiringCerts();
}

// schedule daily
cron.schedule(CRON_EXPR, () => {
  console.log('[Producer] Scheduled run at', new Date().toISOString());
  enqueueExpiringCerts();
});

module.exports = {
  runOnce,
  enqueueExpiringCerts,
};

// If run directly
if (require.main === module) {
  (async () => {
    await runOnce();
    console.log('[Producer] Done (direct run).');

  })();
}
