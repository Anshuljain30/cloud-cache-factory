import { RedisAdapter } from "./redis.js";
import type { ValkeyCacheOptions } from "../types/index.js";

/**
 * Valkey cache adapter - alias to Redis adapter since Valkey is Redis-compatible
 * Valkey is a Redis fork that maintains API compatibility
 */
export class ValkeyAdapter extends RedisAdapter {
  constructor(options: ValkeyCacheOptions = {}) {
    // Valkey uses the same connection options as Redis
    super(options);
  }
}

// Export the same class as both ValkeyAdapter and RedisAdapter for convenience
export { ValkeyAdapter as ValkeyCacheAdapter };
