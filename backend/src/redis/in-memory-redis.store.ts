type MemoryEntry = {
  value: string;
  expiresAt?: number;
};

export class InMemoryRedisStore {
  private readonly data = new Map<string, MemoryEntry>();
  private readonly channels = new Map<string, Set<(message: string) => void>>();

  async get(key: string): Promise<string | null> {
    const entry = this.data.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() >= entry.expiresAt) {
      this.data.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.data.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    const handlers = this.channels.get(channel);
    if (!handlers?.size) return 0;

    handlers.forEach((handler) => {
      try {
        handler(message);
      } catch {
        // Ignore handler failures in dev fallback mode.
      }
    });

    return handlers.size;
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    this.channels.get(channel)!.add(handler);
  }
}
