import { LRUCache } from "lru-cache";
import type { CacheAdapter, MemoryCacheOptions } from "../types/index.js";
import { serialize, deserialize } from "../utils/serialize.js";

/**
 * Memory cache adapter using LRU cache
 */
export class MemoryAdapter implements CacheAdapter {
  private cache: LRUCache<string, string>;
  private defaultTtl: number;

  constructor(options: MemoryCacheOptions = {}) {
    const { maxSize = 1000, ttl = 0 } = options;
    this.defaultTtl = ttl;

    this.cache = new LRUCache<string, string>({
      max: maxSize,
      ttl: ttl > 0 ? ttl * 1000 : undefined, // Convert seconds to milliseconds
    });
  }

  async get(key: string): Promise<any | null> {
    const value = this.cache.get(key);
    if (value === undefined) {
      return null;
    }

    try {
      return deserialize(value);
    } catch (error) {
      // If deserialization fails, remove the corrupted entry
      this.cache.delete(key);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = serialize(value);
    const ttlMs = ttl ? ttl * 1000 : undefined; // Convert seconds to milliseconds

    this.cache.set(key, serializedValue, {
      ttl: ttlMs || this.defaultTtl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.max,
      calculatedSize: this.cache.calculatedSize,
    };
  }
}
