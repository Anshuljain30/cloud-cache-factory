import type { CacheConfig, CacheAdapter } from "./types/index.js";
import { MemoryAdapter } from "./adapters/memory.js";
import { RedisAdapter } from "./adapters/redis.js";
import { ValkeyAdapter } from "./adapters/valkey.js";

/**
 * Create a cache instance based on the provided configuration
 * @param config - Cache configuration object
 * @returns Cache adapter instance
 * @throws Error if provider is not supported
 */
export function createCache(config: CacheConfig): CacheAdapter {
  const { provider, options = {} } = config;

  switch (provider) {
    case "memory":
      return new MemoryAdapter(options);

    case "redis":
      return new RedisAdapter(options);

    case "valkey":
      return new ValkeyAdapter(options);

    default:
      throw new Error(
        `Unsupported cache provider: ${provider}. Supported providers are: memory, redis, valkey`
      );
  }
}

/**
 * Create a memory cache instance with default options
 * @param options - Memory cache options
 * @returns Memory cache adapter instance
 */
export function createMemoryCache(options?: any): MemoryAdapter {
  return new MemoryAdapter(options);
}

/**
 * Create a Redis cache instance with default options
 * @param options - Redis cache options
 * @returns Redis cache adapter instance
 */
export function createRedisCache(options?: any): RedisAdapter {
  return new RedisAdapter(options);
}

/**
 * Create a Valkey cache instance with default options
 * @param options - Valkey cache options
 * @returns Valkey cache adapter instance
 */
export function createValkeyCache(options?: any): ValkeyAdapter {
  return new ValkeyAdapter(options);
}
