/**
 * Redis connection configuration for BullMQ queues and workers.
 * Exported as a plain connection config object; consumers (Queue, Worker)
 * pass this directly to the `connection` option of BullMQ.
 *
 * For application-level caching (e.g. PolicyEngine) use utils/cache.js,
 * which provides a Redis-compatible interface with an in-process fallback.
 */
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ for blocking commands
};

module.exports = redisConfig;
