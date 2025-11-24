require('dotenv').config();
const { blockingPop } = require('../config/queue'); // expects blockingPop(timeoutSeconds)
const util = require('util');

async function handleMessage(msg) {
  if (!msg) {
    console.warn('[Consumer] Received empty message');
    return;
  }
  const {
    cert_id, cert_name, expires_at, days_left,
    worker_id, worker_name, pm_user_id, pm_name, pm_email
  } = msg;

  const notificationText = `NOTIFICATION: Sending email to PM ${pm_name || '[unknown]'} <${pm_email || '[no-email]'}> for worker ${worker_name || worker_id} (ID ${worker_id}) - certification "${cert_name}" expires in ${days_left} days on ${expires_at}. (cert_id: ${cert_id})`;
  console.log(notificationText);


}

async function runConsumer() {
  console.log('[Consumer] Starting; waiting for queue messages...');
  while (true) {
    try {
      // 0 = block indefinitely
      const msg = await blockingPop(0);
      if (!msg) {
        // shouldn't happen with 0 timeout, but guard
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      await handleMessage(msg);
    } catch (err) {
      console.error('[Consumer] Error while processing message', err);
      // basic backoff
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

if (require.main === module) {
  runConsumer();
}

module.exports = {
  runConsumer,
  handleMessage
};
