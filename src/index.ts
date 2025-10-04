/**
 * Cloud Cache Factory - A unified caching interface for cloud and local cache providers
 *
 * This package provides a factory-based design for creating cache instances
 * that work with Redis, Valkey, and in-memory stores using a single interface.
 */

// Main factory function
export { createCache } from "./createCache.js";

// Individual cache creators
export {
  createMemoryCache,
  createRedisCache,
  createValkeyCache,
} from "./createCache.js";

// Cache adapters
export { MemoryAdapter } from "./adapters/memory.js";
export { RedisAdapter } from "./adapters/redis.js";
export { ValkeyAdapter } from "./adapters/valkey.js";

// Types and interfaces
export type {
  CacheProvider,
  CacheConfig,
  CacheAdapter,
  MemoryCacheOptions,
  RedisCacheOptions,
  ValkeyCacheOptions,
} from "./types/index.js";

// Utilities
export { serialize, deserialize, isSerializable } from "./utils/serialize.js";

// Default export
export { createCache as default } from "./createCache.js";
