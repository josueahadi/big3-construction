/**
 * Notification Consumer Job
 *
 * This script runs the notification consumer which:
 * 1. Connects to the Redis queue
 * 2. Continuously listens for certification expiry notification messages
 * 3. Processes each message by logging the notification to console
 * 4. Runs indefinitely until manually stopped
 *
 * Usage:
 *   npm run consumer
 *   - or -
 *   node src/jobs/notification-consumer.job.js
 *
 * To stop: Ctrl+C
 */

const { runConsumer } = require('../queue/certExpiryConsumer');

console.log('[notification-consumer.job.js] Starting consumer...');
runConsumer().catch((err) => {
  console.error('[notification-consumer.job.js] Fatal error:', err);
  process.exit(1);
});
