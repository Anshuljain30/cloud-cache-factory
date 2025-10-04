import { describe, it, expect, vi } from "vitest";
import {
  createCache,
  createMemoryCache,
  createRedisCache,
  createValkeyCache,
} from "../src/createCache.js";

// Mock the adapters
vi.mock("../src/adapters/memory.js", () => ({
  MemoryAdapter: vi.fn().mockImplementation(() => ({ type: "memory" })),
}));

vi.mock("../src/adapters/redis.js", () => ({
  RedisAdapter: vi.fn().mockImplementation(() => ({ type: "redis" })),
}));

vi.mock("../src/adapters/valkey.js", () => ({
  ValkeyAdapter: vi.fn().mockImplementation(() => ({ type: "valkey" })),
}));

describe("createCache factory", () => {
  it("should create memory cache", () => {
    const cache = createCache({ provider: "memory" });
    expect(cache).toHaveProperty("type", "memory");
  });

  it("should create memory cache with options", () => {
    const cache = createCache({
      provider: "memory",
      options: { maxSize: 100 },
    });
    expect(cache).toHaveProperty("type", "memory");
  });

  it("should create Redis cache", () => {
    const cache = createCache({ provider: "redis" });
    expect(cache).toHaveProperty("type", "redis");
  });

  it("should create Redis cache with options", () => {
    const cache = createCache({
      provider: "redis",
      options: { host: "localhost", port: 6379 },
    });
    expect(cache).toHaveProperty("type", "redis");
  });

  it("should create Valkey cache", () => {
    const cache = createCache({ provider: "valkey" });
    expect(cache).toHaveProperty("type", "valkey");
  });

  it("should create Valkey cache with options", () => {
    const cache = createCache({
      provider: "valkey",
      options: { host: "localhost", port: 6379 },
    });
    expect(cache).toHaveProperty("type", "valkey");
  });

  it("should throw error for unsupported provider", () => {
    expect(() => {
      createCache({ provider: "unsupported" as any });
    }).toThrow("Unsupported cache provider: unsupported");
  });
});

describe("individual cache creators", () => {
  it("should create memory cache directly", () => {
    const cache = createMemoryCache();
    expect(cache).toHaveProperty("type", "memory");
  });

  it("should create memory cache with options", () => {
    const cache = createMemoryCache({ maxSize: 50 });
    expect(cache).toHaveProperty("type", "memory");
  });

  it("should create Redis cache directly", () => {
    const cache = createRedisCache();
    expect(cache).toHaveProperty("type", "redis");
  });

  it("should create Redis cache with options", () => {
    const cache = createRedisCache({ host: "localhost" });
    expect(cache).toHaveProperty("type", "redis");
  });

  it("should create Valkey cache directly", () => {
    const cache = createValkeyCache();
    expect(cache).toHaveProperty("type", "valkey");
  });

  it("should create Valkey cache with options", () => {
    const cache = createValkeyCache({ host: "localhost" });
    expect(cache).toHaveProperty("type", "valkey");
  });
});
