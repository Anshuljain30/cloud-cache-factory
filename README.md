# Cloud Cache Factory

A unified caching interface for cloud and local cache providers — Redis, Valkey, Memcached, and in-memory — using a factory-based design.

[![npm version](https://badge.fury.io/js/cloud-cache-factory.svg)](https://badge.fury.io/js/cloud-cache-factory)
[![npm downloads](https://img.shields.io/npm/dm/cloud-cache-factory.svg)](https://www.npmjs.com/package/cloud-cache-factory)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)

## 🎯 Purpose

Developers should be able to switch cache providers easily using a single interface. This package provides a consistent API across different caching backends, making it simple to swap between memory, Redis, Valkey, and Memcached without changing your application code.

> **v1.0.0 Stable Release**: This version provides a stable API with comprehensive caching support across four providers. The API is now considered stable and follows semantic versioning.

## ✨ Features

- **Unified Interface**: Single API for all supported cache providers
- **TypeScript Support**: Full type definitions and IntelliSense support
- **Four Cache Providers**: Memory (LRU), Redis, Valkey, and Memcached support
- **Factory Pattern**: Easy provider switching with configuration
- **Safe Serialization**: JSON serialization with comprehensive error handling
- **TTL Support**: Time-to-live for cached values across all providers
- **Connection Management**: Proper connection cleanup and error handling
- **Statistics & Monitoring**: Cache statistics and health monitoring
- **Production Ready**: Comprehensive error handling and logging
- **Zero Dependencies**: Minimal external dependencies for reliability
- **Comprehensive Testing**: 68+ test cases with 100% coverage of core functionality

## 📦 Installation

```bash
npm install cloud-cache-factory
```

## 🚀 Quick Start

```typescript
import { createCache } from "cloud-cache-factory";

// Create a Redis cache
const cache = createCache({
  provider: "redis",
  options: { url: "redis://localhost:6379" },
});

// Use the cache
await cache.set("user:1", { name: "Anshul" }, 3600);
const user = await cache.get("user:1");
console.log(user); // { name: 'Anshul' }
```

## 📚 Usage

### Basic Usage

```typescript
import { createCache } from "cloud-cache-factory";

// Memory cache
const memoryCache = createCache({ provider: "memory" });

// Redis cache
const redisCache = createCache({
  provider: "redis",
  options: { host: "localhost", port: 6379 },
});

// Valkey cache
const valkeyCache = createCache({
  provider: "valkey",
  options: { host: "localhost", port: 6379 },
});

// Memcached cache
const memcachedCache = createCache({
  provider: "memcached",
  options: { host: "localhost", port: 11211 },
});
```

### Cache Operations

All cache adapters implement the same interface:

```typescript
interface CacheAdapter {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
}
```

### Examples

#### Setting and Getting Values

```typescript
// Store a simple value
await cache.set("key1", "Hello World");

// Store with TTL (time to live in seconds)
await cache.set("key2", { data: "important" }, 3600);

// Retrieve values
const value1 = await cache.get("key1"); // 'Hello World'
const value2 = await cache.get("key2"); // { data: 'important' }
```

#### Complex Data Types

```typescript
// Store complex objects
const user = {
  id: 1,
  name: "John Doe",
  preferences: {
    theme: "dark",
    notifications: true,
  },
};

await cache.set("user:1", user, 1800); // 30 minutes TTL
const retrievedUser = await cache.get("user:1");
```

#### Cache Management

```typescript
// Check if key exists
const exists = await cache.has("user:1");

// Delete a specific key
await cache.delete("user:1");

// Clear all keys
await cache.clear();
```

## 🔧 Configuration

### Memory Cache Options

```typescript
const memoryCache = createCache({
  provider: "memory",
  options: {
    maxSize: 1000, // Maximum number of items
    ttl: 0, // Default TTL in seconds (0 = no expiration)
  },
});
```

### Redis/Valkey Options

```typescript
// Using connection URL
const redisCache = createCache({
  provider: "redis",
  options: {
    url: "redis://localhost:6379",
  },
});

// Using individual options
const redisCache = createCache({
  provider: "redis",
  options: {
    host: "localhost",
    port: 6379,
    password: "secret",
    db: 0,
  },
});
```

### Memcached Options

```typescript
// Using single host
const memcachedCache = createCache({
  provider: "memcached",
  options: {
    host: "localhost",
    port: 11211,
  },
});

// Using multiple hosts
const memcachedCache = createCache({
  provider: "memcached",
  options: {
    hosts: ["127.0.0.1:11211", "127.0.0.1:11212"],
    timeout: 5000,
    retries: 5,
    poolSize: 10,
  },
});
```

## 🏗️ Advanced Usage

### Direct Adapter Creation

```typescript
import {
  createMemoryCache,
  createRedisCache,
  createValkeyCache,
  createMemcachedCache,
} from "cloud-cache-factory";

// Create specific adapters directly
const memoryCache = createMemoryCache({ maxSize: 500 });
const redisCache = createRedisCache({ host: "localhost" });
const valkeyCache = createValkeyCache({ host: "localhost" });
const memcachedCache = createMemcachedCache({ host: "localhost" });
```

### Custom Serialization

```typescript
import { serialize, deserialize } from "cloud-cache-factory";

// Custom serialization for special cases
const customValue = { special: "data" };
const serialized = serialize(customValue);
const deserialized = deserialize(serialized);
```

### Redis Client Access

```typescript
import { RedisAdapter } from "cloud-cache-factory";

const redisCache = new RedisAdapter({ host: "localhost" });

// Access the underlying Redis client for advanced operations
const client = redisCache.getClient();
await client.publish("channel", "message");

// Don't forget to disconnect when done
await redisCache.disconnect();
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run dev
```

## 📋 Supported Providers

| Provider    | Description                     | Use Case                                 |
| ----------- | ------------------------------- | ---------------------------------------- |
| `memory`    | In-memory LRU cache             | Development, testing, small applications |
| `redis`     | Redis cache                     | Production, distributed applications     |
| `valkey`    | Valkey cache (Redis-compatible) | Production, Redis alternative            |
| `memcached` | Memcached cache                 | Production, high-performance caching     |

## 🔄 Migration Between Providers

Switching between providers is as simple as changing the configuration:

```typescript
// Development - use memory
const devCache = createCache({ provider: "memory" });

// Production - use Redis
const prodCache = createCache({
  provider: "redis",
  options: { url: process.env.REDIS_URL },
});

// Switch to Valkey
const valkeyCache = createCache({
  provider: "valkey",
  options: { url: process.env.VALKEY_URL },
});

// Switch to Memcached
const memcachedCache = createCache({
  provider: "memcached",
  options: { hosts: process.env.MEMCACHED_HOSTS?.split(",") },
});
```

## 🛠️ Development

### Building

```bash
npm run build
```

### TypeScript

This package is written in TypeScript and provides full type definitions. The compiled JavaScript is output to the `dist/` directory.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 Changelog

### 1.0.0

- **Major Release**: Stable API with comprehensive caching support
- **Four Cache Providers**: Memory (LRU), Redis, Valkey, and Memcached
- **Factory Pattern**: Unified interface for easy provider switching
- **TypeScript Support**: Full type definitions and IntelliSense
- **Comprehensive Testing**: 68+ test cases covering all functionality
- **Production Ready**: Error handling, connection management, and statistics
- **Zero Dependencies**: Minimal external dependencies for reliability

### 0.1.0

- Initial release
- Memory, Redis, Valkey, and Memcached adapters
- Factory pattern implementation
- TypeScript support
- Comprehensive test suite

## 🔗 Related

- [Redis](https://redis.io/) - In-memory data structure store
- [Valkey](https://valkey.io/) - Redis-compatible in-memory data store
- [Memcached](https://memcached.org/) - High-performance distributed memory caching system
- [LRU Cache](https://github.com/isaacs/node-lru-cache) - Fast LRU cache implementation
