import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;
  private readonly logger = new Logger(RedisService.name);
  private handlers = new Map<string, Set<(message: string) => void>>();

  constructor(private config: ConfigService) {
    const url = this.config.get('REDIS_URL', 'redis://localhost:6379');
    this.client = new Redis(url);
    this.subscriber = new Redis(url);
    this.publisher = new Redis(url);
  }

  async onModuleInit() {
    this.subscriber.on('message', (channel, message) => {
      const handlers = this.handlers.get(channel);
      handlers?.forEach((handler) => handler(message));
    });
    this.logger.log('Redis connected');
  }

  async onModuleDestroy() {
    await Promise.all([
      this.client.quit(),
      this.subscriber.quit(),
      this.publisher.quit(),
    ]);
  }

  getClient() {
    return this.client;
  }

  async publish(channel: string, message: string) {
    return this.publisher.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)!.add(handler);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }
}
