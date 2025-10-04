import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MemcachedAdapter } from "../src/adapters/memcached.js";

// Mock memcached for testing
const mockMemcached = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  flush: vi.fn(),
  stats: vi.fn(),
  end: vi.fn(),
};

// Mock the memcached module
vi.mock("memcached", () => ({
  default: vi.fn(() => mockMemcached),
}));

describe("MemcachedAdapter", () => {
  let cache: MemcachedAdapter;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    cache = new MemcachedAdapter({ host: "localhost", port: 11211 });
  });

  afterEach(async () => {
    await cache.disconnect();
  });

  describe("get", () => {
    it("should return null for non-existent key", async () => {
      mockMemcached.get.mockImplementation((key, callback) => {
        callback(null, undefined);
      });

      const result = await cache.get("non-existent");
      expect(result).toBeNull();
      expect(mockMemcached.get).toHaveBeenCalledWith(
        "non-existent",
        expect.any(Function)
      );
    });

    it("should return stored value", async () => {
      mockMemcached.get.mockImplementation((key, callback) => {
        callback(null, '"value1"');
      });

      const result = await cache.get("key1");
      expect(result).toBe("value1");
      expect(mockMemcached.get).toHaveBeenCalledWith(
        "key1",
        expect.any(Function)
      );
    });

    it("should return complex objects", async () => {
      const obj = { name: "test", age: 25 };
      mockMemcached.get.mockImplementation((key, callback) => {
        callback(null, JSON.stringify(obj));
      });

      const result = await cache.get("obj");
      expect(result).toEqual(obj);
    });

    it("should handle deserialization errors", async () => {
      mockMemcached.get.mockImplementation((key, callback) => {
        callback(null, "invalid-json");
      });

      const result = await cache.get("key1");
      expect(result).toBeNull();
    });

    it("should handle memcached errors", async () => {
      mockMemcached.get.mockImplementation((key, callback) => {
        callback(new Error("Memcached connection failed"), null);
      });

      await expect(cache.get("key1")).rejects.toThrow(
        "Memcached GET operation failed"
      );
    });
  });

  describe("set", () => {
    it("should store values without TTL", async () => {
      mockMemcached.set.mockImplementation((key, value, ttl, callback) => {
        callback(null);
      });

      await cache.set("key1", "value1");
      expect(mockMemcached.set).toHaveBeenCalledWith(
        "key1",
        '"value1"',
        0,
        expect.any(Function)
      );
    });

    it("should store values with TTL", async () => {
      mockMemcached.set.mockImplementation((key, value, ttl, callback) => {
        callback(null);
      });

      await cache.set("key1", "value1", 3600);
      expect(mockMemcached.set).toHaveBeenCalledWith(
        "key1",
        '"value1"',
        3600,
        expect.any(Function)
      );
    });

    it("should handle serialization errors", async () => {
      const circularRef = { a: {} };
      circularRef.a = circularRef;

      await expect(cache.set("key1", circularRef)).rejects.toThrow(
        "Failed to serialize value"
      );
    });

    it("should handle memcached errors", async () => {
      mockMemcached.set.mockImplementation((key, value, ttl, callback) => {
        callback(new Error("Memcached connection failed"));
      });

      await expect(cache.set("key1", "value1")).rejects.toThrow(
        "Memcached SET operation failed"
      );
    });
  });

  describe("delete", () => {
    it("should delete existing key", async () => {
      mockMemcached.del.mockImplementation((key, callback) => {
        callback(null);
      });

      await cache.delete("key1");
      expect(mockMemcached.del).toHaveBeenCalledWith(
        "key1",
        expect.any(Function)
      );
    });

    it("should handle memcached errors", async () => {
      mockMemcached.del.mockImplementation((key, callback) => {
        callback(new Error("Memcached connection failed"));
      });

      await expect(cache.delete("key1")).rejects.toThrow(
        "Memcached DEL operation failed"
      );
    });
  });

  describe("has", () => {
    it("should return false for non-existent key", async () => {
      mockMemcached.get.mockImplementation((key, callback) => {
        callback(null, undefined);
      });

      const result = await cache.has("non-existent");
      expect(result).toBe(false);
      expect(mockMemcached.get).toHaveBeenCalledWith(
        "non-existent",
        expect.any(Function)
      );
    });

    it("should return true for existing key", async () => {
      mockMemcached.get.mockImplementation((key, callback) => {
        callback(null, "some-value");
      });

      const result = await cache.has("key1");
      expect(result).toBe(true);
      expect(mockMemcached.get).toHaveBeenCalledWith(
        "key1",
        expect.any(Function)
      );
    });

    it("should handle memcached errors", async () => {
      mockMemcached.get.mockImplementation((key, callback) => {
        callback(new Error("Memcached connection failed"), null);
      });

      await expect(cache.has("key1")).rejects.toThrow(
        "Memcached EXISTS operation failed"
      );
    });
  });

  describe("clear", () => {
    it("should clear all keys", async () => {
      mockMemcached.flush.mockImplementation((callback) => {
        callback(null);
      });

      await cache.clear();
      expect(mockMemcached.flush).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle memcached errors", async () => {
      mockMemcached.flush.mockImplementation((callback) => {
        callback(new Error("Memcached connection failed"));
      });

      await expect(cache.clear()).rejects.toThrow(
        "Memcached FLUSH operation failed"
      );
    });
  });

  describe("connection", () => {
    it("should create Memcached client with hosts array", () => {
      const hostsCache = new MemcachedAdapter({
        hosts: ["127.0.0.1:11211", "127.0.0.1:11212"],
      });
      expect(hostsCache).toBeInstanceOf(MemcachedAdapter);
    });

    it("should create Memcached client with host and port", () => {
      const hostPortCache = new MemcachedAdapter({
        host: "localhost",
        port: 11211,
      });
      expect(hostPortCache).toBeInstanceOf(MemcachedAdapter);
    });

    it("should create Memcached client with custom options", () => {
      const optionsCache = new MemcachedAdapter({
        host: "localhost",
        port: 11211,
        timeout: 10000,
        retries: 3,
        poolSize: 5,
      });
      expect(optionsCache).toBeInstanceOf(MemcachedAdapter);
    });
  });

  describe("stats", () => {
    it("should get server statistics", async () => {
      const mockStats = {
        "127.0.0.1:11211": { uptime: 12345, version: "1.6.9" },
      };
      mockMemcached.stats.mockImplementation((callback) => {
        callback(null, mockStats);
      });

      const stats = await cache.getStats();
      expect(stats).toEqual(mockStats);
      expect(mockMemcached.stats).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle stats errors", async () => {
      mockMemcached.stats.mockImplementation((callback) => {
        callback(new Error("Memcached connection failed"), null);
      });

      await expect(cache.getStats()).rejects.toThrow(
        "Memcached STATS operation failed"
      );
    });
  });

  describe("disconnect", () => {
    it("should close the connection", async () => {
      mockMemcached.end.mockImplementation(() => {});

      await cache.disconnect();
      expect(mockMemcached.end).toHaveBeenCalled();
    });
  });
});
