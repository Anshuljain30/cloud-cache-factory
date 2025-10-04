import { describe, it, expect, beforeEach } from "vitest";
import { MemoryAdapter } from "../src/adapters/memory.js";

describe("MemoryAdapter", () => {
  let cache: MemoryAdapter;

  beforeEach(() => {
    cache = new MemoryAdapter({ maxSize: 10, ttl: 0 });
  });

  describe("get", () => {
    it("should return null for non-existent key", async () => {
      const result = await cache.get("non-existent");
      expect(result).toBeNull();
    });

    it("should return stored value", async () => {
      await cache.set("key1", "value1");
      const result = await cache.get("key1");
      expect(result).toBe("value1");
    });

    it("should return complex objects", async () => {
      const obj = { name: "test", age: 25, nested: { value: true } };
      await cache.set("obj", obj);
      const result = await cache.get("obj");
      expect(result).toEqual(obj);
    });
  });

  describe("set", () => {
    it("should store string values", async () => {
      await cache.set("key1", "value1");
      expect(await cache.get("key1")).toBe("value1");
    });

    it("should store number values", async () => {
      await cache.set("num", 42);
      expect(await cache.get("num")).toBe(42);
    });

    it("should store boolean values", async () => {
      await cache.set("bool", true);
      expect(await cache.get("bool")).toBe(true);
    });

    it("should store null values", async () => {
      await cache.set("null", null);
      expect(await cache.get("null")).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete existing key", async () => {
      await cache.set("key1", "value1");
      await cache.delete("key1");
      expect(await cache.get("key1")).toBeNull();
    });

    it("should not throw when deleting non-existent key", async () => {
      await expect(cache.delete("non-existent")).resolves.not.toThrow();
    });
  });

  describe("has", () => {
    it("should return false for non-existent key", async () => {
      expect(await cache.has("non-existent")).toBe(false);
    });

    it("should return true for existing key", async () => {
      await cache.set("key1", "value1");
      expect(await cache.has("key1")).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear all keys", async () => {
      await cache.set("key1", "value1");
      await cache.set("key2", "value2");
      await cache.clear();
      expect(await cache.get("key1")).toBeNull();
      expect(await cache.get("key2")).toBeNull();
    });
  });

  describe("LRU behavior", () => {
    it("should evict least recently used items when max size is reached", async () => {
      const smallCache = new MemoryAdapter({ maxSize: 2 });

      await smallCache.set("key1", "value1");
      await smallCache.set("key2", "value2");
      await smallCache.set("key3", "value3"); // This should evict key1

      expect(await smallCache.get("key1")).toBeNull();
      expect(await smallCache.get("key2")).toBe("value2");
      expect(await smallCache.get("key3")).toBe("value3");
    });
  });

  describe("stats", () => {
    it("should provide cache statistics", () => {
      const stats = cache.getStats();
      expect(stats).toHaveProperty("size");
      expect(stats).toHaveProperty("maxSize");
      expect(stats).toHaveProperty("calculatedSize");
      expect(stats.maxSize).toBe(10);
    });
  });
});
