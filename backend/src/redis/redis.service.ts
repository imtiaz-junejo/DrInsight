import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { type RedisOptions } from 'ioredis';
import { InMemoryRedisStore } from './in-memory-redis.store';

type RedisMode = 'redis' | 'memory';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client?: Redis;
  private subscriber?: Redis;
  private publisher?: Redis;
  private readonly memory = new InMemoryRedisStore();
  private mode: RedisMode = 'memory';
  private readonly logger = new Logger(RedisService.name);
  private readonly handlers = new Map<string, Set<(message: string) => void>>();

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const disabled = this.config.get<string>('REDIS_DISABLED') === 'true';
    if (disabled) {
      this.enableMemoryMode('REDIS_DISABLED=true');
      return;
    }

    const url = this.config.get('REDIS_URL', 'redis://localhost:6379');
    const options: RedisOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy: (attempt) => (attempt > 3 ? null : Math.min(attempt * 200, 1000)),
    };

    this.client = new Redis(url, options);
    this.subscriber = new Redis(url, options);
    this.publisher = new Redis(url, options);

    for (const connection of [this.client, this.subscriber, this.publisher]) {
      connection.on('error', (error: Error) => {
        if (this.mode === 'redis') {
          this.logger.warn(`Redis connection error: ${error.message}`);
        }
      });
    }

    this.subscriber.on('message', (channel, message) => {
      const handlers = this.handlers.get(channel);
      handlers?.forEach((handler) => handler(message));
    });

    try {
      await Promise.all([
        this.client.connect(),
        this.subscriber.connect(),
        this.publisher.connect(),
        this.client.ping(),
      ]);
      this.mode = 'redis';
      this.logger.log('Redis connected');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Redis error';
      const isProduction = this.config.get('NODE_ENV') === 'production';

      await this.disconnectRedisClients();

      if (isProduction) {
        throw new Error(`Redis is required in production but unavailable: ${message}`);
      }

      this.enableMemoryMode(`Redis unavailable (${message})`);
    }
  }

  async onModuleDestroy() {
    await this.disconnectRedisClients();
  }

  isMemoryMode() {
    return this.mode === 'memory';
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client is unavailable. In-memory fallback mode is active.');
    }

    return this.client;
  }

  async publish(channel: string, message: string) {
    if (this.mode === 'memory') {
      return this.memory.publish(channel, message);
    }

    return this.publisher!.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void) {
    const handlers = this.handlers.get(channel) ?? new Set<(message: string) => void>();
    const isNewHandler = !handlers.has(handler);

    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, handlers);
      if (this.mode === 'redis') {
        await this.subscriber!.subscribe(channel);
      }
    }

    if (!isNewHandler) return;

    handlers.add(handler);

    if (this.mode === 'memory') {
      await this.memory.subscribe(channel, handler);
    }
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (this.mode === 'memory') {
      await this.memory.set(key, value, ttlSeconds);
      return;
    }

    if (ttlSeconds) {
      await this.client!.setex(key, ttlSeconds, value);
    } else {
      await this.client!.set(key, value);
    }
  }

  async get(key: string) {
    if (this.mode === 'memory') {
      return this.memory.get(key);
    }

    return this.client!.get(key);
  }

  async del(key: string) {
    if (this.mode === 'memory') {
      await this.memory.del(key);
      return;
    }

    return this.client!.del(key);
  }

  private enableMemoryMode(reason: string) {
    this.mode = 'memory';
    this.logger.warn(`Using in-memory Redis fallback (${reason}). Real-time pub/sub is process-local only.`);
  }

  private async disconnectRedisClients() {
    const clients = [this.client, this.subscriber, this.publisher].filter(Boolean) as Redis[];

    await Promise.all(
      clients.map(async (connection) => {
        try {
          if (connection.status !== 'end') {
            await connection.quit();
          }
        } catch {
          connection.disconnect();
        }
      }),
    );

    this.client = undefined;
    this.subscriber = undefined;
    this.publisher = undefined;
  }
}
