const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

const QUEUE_NAME = process.env.CERT_QUEUE_NAME || 'cert_notifications';

/**
 * Push a message (JSON serializable) to the end of the list.
 * @param {Object} msg
 */
async function enqueue(msg) {
  await connectRedis();
  const s = JSON.stringify(msg);
  await redisClient.rPush(QUEUE_NAME, s);
}

/**
 * Blocking pop from the queue. Waits until a message is available.
 * Returns parsed JSON or null on error.
 * @param {number} timeoutSeconds - Timeout in seconds. 0 = wait indefinitely (default)
 */
async function blockingPop(timeoutSeconds = 0) {
  await connectRedis();
  // BRPOP returns {key, element} or null
  // In redis v4+, timeout of 0 means wait indefinitely
  const res = await redisClient.brPop(QUEUE_NAME, timeoutSeconds);
  if (!res || !res.element) return null;
  try {
    return JSON.parse(res.element);
  } catch (err) {
    console.error('Invalid JSON in queue message', err);
    return null;
  }
}

module.exports = {
  connectRedis,
  enqueue,
  blockingPop,
  QUEUE_NAME
};
