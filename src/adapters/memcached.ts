import Memcached from "memcached";
import type { CacheAdapter, MemcachedCacheOptions } from "../types/index.js";
import { serialize, deserialize } from "../utils/serialize.js";

/**
 * Memcached cache adapter using memcached
 */
export class MemcachedAdapter implements CacheAdapter {
  private memcached: Memcached;

  constructor(options: MemcachedCacheOptions = {}) {
    const {
      hosts = ["127.0.0.1:11211"],
      host = "127.0.0.1",
      port = 11211,
      timeout = 5000,
      retries = 5,
      retry = 5,
      retry_delay: retryDelay = 0.2,
      failures = 5,
      poolSize = 10,
      reconnect = 18000000,
      idle = 5000,
      namespace = "",
      ...otherOptions
    } = options;

    // Use hosts array if provided, otherwise construct from host/port
    const serverList = hosts.length > 0 ? hosts : [`${host}:${port}`];

    this.memcached = new Memcached(serverList, {
      timeout,
      retries,
      retry,
      failures,
      poolSize,
      reconnect,
      idle,
      namespace,
      ...otherOptions,
    });
  }

  async get(key: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.memcached.get(key, (err: any, data: any) => {
        if (err) {
          reject(
            new Error(
              `Memcached GET operation failed: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            )
          );
          return;
        }

        if (data === undefined || data === null) {
          resolve(null);
          return;
        }

        try {
          const deserialized = deserialize(data);
          resolve(deserialized);
        } catch (deserializeError) {
          // If deserialization fails, remove the corrupted entry
          this.memcached.del(key, () => {});
          resolve(null);
        }
      });
    });
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const serializedValue = serialize(value);
        const ttlSeconds = ttl || 0; // Memcached uses seconds, 0 means no expiration

        this.memcached.set(key, serializedValue, ttlSeconds, (err: any) => {
          if (err) {
            reject(
              new Error(
                `Memcached SET operation failed: ${
                  err instanceof Error ? err.message : "Unknown error"
                }`
              )
            );
            return;
          }
          resolve();
        });
      } catch (error) {
        reject(
          new Error(
            `Memcached SET operation failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        );
      }
    });
  }

  async delete(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.memcached.del(key, (err: any) => {
        if (err) {
          reject(
            new Error(
              `Memcached DEL operation failed: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            )
          );
          return;
        }
        resolve();
      });
    });
  }

  async has(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.memcached.get(key, (err: any, data: any) => {
        if (err) {
          reject(
            new Error(
              `Memcached EXISTS operation failed: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            )
          );
          return;
        }
        resolve(data !== undefined && data !== null);
      });
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.memcached.flush((err: any) => {
        if (err) {
          reject(
            new Error(
              `Memcached FLUSH operation failed: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            )
          );
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Get the underlying Memcached client for advanced operations
   */
  getClient(): Memcached {
    return this.memcached;
  }

  /**
   * Close the Memcached connection
   */
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.memcached.end();
      resolve();
    });
  }

  /**
   * Get server statistics
   */
  async getStats(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.memcached.stats((err: any, stats: any) => {
        if (err) {
          reject(
            new Error(
              `Memcached STATS operation failed: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            )
          );
          return;
        }
        resolve(stats);
      });
    });
  }
}
