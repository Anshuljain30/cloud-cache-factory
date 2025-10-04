import Redis from "ioredis";
import type { CacheAdapter, RedisCacheOptions } from "../types/index.js";
import { serialize, deserialize } from "../utils/serialize.js";

/**
 * Redis cache adapter using ioredis
 */
export class RedisAdapter implements CacheAdapter {
  private redis: Redis;

  constructor(options: RedisCacheOptions = {}) {
    if (options.url) {
      this.redis = new Redis(options.url);
    } else {
      this.redis = new Redis({
        host: options.host || "localhost",
        port: options.port || 6379,
        password: options.password,
        db: options.db || 0,
        ...options,
      });
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }
      return deserialize(value);
    } catch (error) {
      throw new Error(
        `Redis GET operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = serialize(value);
      if (ttl && ttl > 0) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      throw new Error(
        `Redis SET operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      throw new Error(
        `Redis DEL operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      throw new Error(
        `Redis EXISTS operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      throw new Error(
        `Redis FLUSHDB operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get the underlying Redis client for advanced operations
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * Close the Redis connection
   */
  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }
}
