const NodeCache = require("node-cache");

// Default TTL is 5 minutes (300 seconds) for analytics queries.
// Designed with a generic interface so it can be swapped with Redis later.
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class CacheService {
  /**
   * Get an item from the cache.
   * @param {string} key 
   * @returns {any} The cached value or undefined
   */
  async get(key) {
    // Wrap in promise to simulate async behavior of Redis
    return cache.get(key);
  }

  /**
   * Set an item in the cache.
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttl Time to live in seconds
   */
  async set(key, value, ttl = 300) {
    cache.set(key, value, ttl);
  }

  /**
   * Delete an item from the cache.
   * @param {string} key 
   */
  async del(key) {
    cache.del(key);
  }

  /**
   * Clear all items from the cache.
   */
  async flush() {
    cache.flushAll();
  }
}

module.exports = new CacheService();
