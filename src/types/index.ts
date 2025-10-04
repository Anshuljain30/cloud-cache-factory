/**
 * Cache provider types
 */
export type CacheProvider = "memory" | "redis" | "valkey";

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  provider: CacheProvider;
  options?: any;
}

/**
 * Standard cache adapter interface that all cache implementations must follow
 */
export interface CacheAdapter {
  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or null if not found
   */
  get(key: string): Promise<any | null>;

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Time to live in seconds (optional)
   */
  set(key: string, value: any, ttl?: number): Promise<void>;

  /**
   * Delete a value from the cache
   * @param key - The cache key
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a key exists in the cache
   * @param key - The cache key
   * @returns True if the key exists, false otherwise
   */
  has(key: string): Promise<boolean>;

  /**
   * Clear all values from the cache
   */
  clear(): Promise<void>;
}

/**
 * Memory cache options
 */
export interface MemoryCacheOptions {
  maxSize?: number;
  ttl?: number;
}

/**
 * Redis cache options
 */
export interface RedisCacheOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  url?: string;
  [key: string]: any;
}

/**
 * Valkey cache options (same as Redis)
 */
export type ValkeyCacheOptions = RedisCacheOptions;
