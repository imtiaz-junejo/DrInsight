import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'crypto';
import { IceServerConfig } from './types/meeting.types';

@Injectable()
export class WebrtcIceService {
  private readonly logger = new Logger(WebrtcIceService.name);
  private cachedServers: IceServerConfig[] | null = null;
  private cacheExpiresAt = 0;

  constructor(private readonly config: ConfigService) {}

  getIceServers(userId?: string): IceServerConfig[] {
    const now = Date.now();
    if (this.cachedServers && now < this.cacheExpiresAt) {
      return this.applyTurnCredentials(this.cachedServers, userId);
    }

    const servers = this.loadIceServers();
    this.cachedServers = servers;
    this.cacheExpiresAt = now + 60_000;
    return this.applyTurnCredentials(servers, userId);
  }

  async healthCheck(): Promise<{ healthy: boolean; stunCount: number; turnCount: number }> {
    const servers = this.loadIceServers();
    const stunCount = servers.filter((s) => this.isStunOnly(s)).length;
    const turnCount = servers.length - stunCount;
    return { healthy: servers.length > 0, stunCount, turnCount };
  }

  private loadIceServers(): IceServerConfig[] {
    const servers: IceServerConfig[] = [];

    const stunUrls = this.parseUrlList(this.config.get<string>('WEBRTC_STUN_URLS'));
    for (const url of stunUrls) {
      servers.push({ urls: url });
    }

    const turnUrls = this.parseUrlList(this.config.get<string>('WEBRTC_TURN_URLS'));
    const turnUsername = this.config.get<string>('WEBRTC_TURN_USERNAME');
    const turnPassword = this.config.get<string>('WEBRTC_TURN_PASSWORD');

    if (turnUrls.length && turnUsername && turnPassword) {
      for (const url of turnUrls) {
        servers.push({ urls: url, username: turnUsername, credential: turnPassword });
      }
    }

    const fallbackStun = this.parseUrlList(this.config.get<string>('WEBRTC_STUN_FALLBACK_URLS'));
    for (const url of fallbackStun) {
      if (!servers.some((s) => s.urls === url || (Array.isArray(s.urls) && s.urls.includes(url)))) {
        servers.push({ urls: url });
      }
    }

    if (!servers.length) {
      this.logger.warn('No WEBRTC_STUN_URLS or WEBRTC_TURN_URLS configured — WebRTC may fail behind NAT');
    }

    return servers;
  }

  private applyTurnCredentials(servers: IceServerConfig[], userId?: string): IceServerConfig[] {
    const useTimeLimited = this.config.get<string>('WEBRTC_TURN_USE_TIME_LIMITED', 'false') === 'true';
    if (!useTimeLimited || !userId) return servers;

    const secret = this.config.get<string>('WEBRTC_TURN_STATIC_SECRET');
    if (!secret) return servers;

    const ttl = Number(this.config.get<string>('WEBRTC_TURN_CREDENTIAL_TTL_SECONDS', '86400'));
    const expiry = Math.floor(Date.now() / 1000) + ttl;
    const username = `${expiry}:${userId}`;
    const credential = createHmac('sha1', secret).update(username).digest('base64');

    return servers.map((server) => {
      if (this.isStunOnly(server)) return server;
      return { ...server, username, credential };
    });
  }

  generateRoomId(): string {
    return `room_${randomBytes(16).toString('hex')}`;
  }

  private parseUrlList(raw?: string): string[] {
    if (!raw?.trim()) return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private isStunOnly(server: IceServerConfig): boolean {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    return urls.every((u) => u.startsWith('stun:'));
  }
}
