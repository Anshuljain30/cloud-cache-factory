import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RedisAdapter } from "../src/adapters/redis.js";

// Mock ioredis for testing
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  flushdb: vi.fn(),
  disconnect: vi.fn(),
};

// Mock the ioredis module
vi.mock("ioredis", () => ({
  default: vi.fn(() => mockRedis),
}));

describe("RedisAdapter", () => {
  let cache: RedisAdapter;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    cache = new RedisAdapter({ host: "localhost", port: 6379 });
  });

  afterEach(async () => {
    await cache.disconnect();
  });

  describe("get", () => {
    it("should return null for non-existent key", async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cache.get("non-existent");
      expect(result).toBeNull();
      expect(mockRedis.get).toHaveBeenCalledWith("non-existent");
    });

    it("should return stored value", async () => {
      mockRedis.get.mockResolvedValue('"value1"');

      const result = await cache.get("key1");
      expect(result).toBe("value1");
      expect(mockRedis.get).toHaveBeenCalledWith("key1");
    });

    it("should return complex objects", async () => {
      const obj = { name: "test", age: 25 };
      mockRedis.get.mockResolvedValue(JSON.stringify(obj));

      const result = await cache.get("obj");
      expect(result).toEqual(obj);
    });

    it("should handle deserialization errors", async () => {
      mockRedis.get.mockResolvedValue("invalid-json");

      await expect(cache.get("key1")).rejects.toThrow(
        "Failed to deserialize value"
      );
    });
  });

  describe("set", () => {
    it("should store values without TTL", async () => {
      mockRedis.set.mockResolvedValue("OK");

      await cache.set("key1", "value1");
      expect(mockRedis.set).toHaveBeenCalledWith("key1", '"value1"');
    });

    it("should store values with TTL", async () => {
      mockRedis.setex.mockResolvedValue("OK");

      await cache.set("key1", "value1", 3600);
      expect(mockRedis.setex).toHaveBeenCalledWith("key1", 3600, '"value1"');
    });

    it("should handle serialization errors", async () => {
      const circularRef = { a: {} };
      circularRef.a = circularRef;

      await expect(cache.set("key1", circularRef)).rejects.toThrow(
        "Failed to serialize value"
      );
    });
  });

  describe("delete", () => {
    it("should delete existing key", async () => {
      mockRedis.del.mockResolvedValue(1);

      await cache.delete("key1");
      expect(mockRedis.del).toHaveBeenCalledWith("key1");
    });

    it("should handle Redis errors", async () => {
      mockRedis.del.mockRejectedValue(new Error("Redis connection failed"));

      await expect(cache.delete("key1")).rejects.toThrow(
        "Redis DEL operation failed"
      );
    });
  });

  describe("has", () => {
    it("should return false for non-existent key", async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await cache.has("non-existent");
      expect(result).toBe(false);
      expect(mockRedis.exists).toHaveBeenCalledWith("non-existent");
    });

    it("should return true for existing key", async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await cache.has("key1");
      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith("key1");
    });
  });

  describe("clear", () => {
    it("should clear all keys", async () => {
      mockRedis.flushdb.mockResolvedValue("OK");

      await cache.clear();
      expect(mockRedis.flushdb).toHaveBeenCalled();
    });

    it("should handle Redis errors", async () => {
      mockRedis.flushdb.mockRejectedValue(new Error("Redis connection failed"));

      await expect(cache.clear()).rejects.toThrow(
        "Redis FLUSHDB operation failed"
      );
    });
  });

  describe("connection", () => {
    it("should create Redis client with URL", () => {
      const urlCache = new RedisAdapter({ url: "redis://localhost:6379" });
      expect(urlCache).toBeInstanceOf(RedisAdapter);
    });

    it("should create Redis client with options", () => {
      const optionsCache = new RedisAdapter({
        host: "localhost",
        port: 6379,
        password: "secret",
        db: 1,
      });
      expect(optionsCache).toBeInstanceOf(RedisAdapter);
    });
  });
});
