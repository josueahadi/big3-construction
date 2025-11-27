/**
 * Certification Expiry Checker Job
 *
 * This script runs the certification expiry producer which:
 * 1. Queries the database for certifications expiring within the configured timeframe
 * 2. Enqueues notification messages to the Redis queue for each expiring cert
 * 3. Runs on a daily schedule via node-cron
 *
 * Usage:
 *   npm run cert-checker
 *   - or -
 *   node src/jobs/cert-checker.job.js
 */

require('../jobs/certExpiryProducer');

console.log('[cert-checker.job.js] Producer started and scheduled');
