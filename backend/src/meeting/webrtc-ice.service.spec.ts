import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WebrtcIceService } from './webrtc-ice.service';

describe('WebrtcIceService', () => {
  let service: WebrtcIceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebrtcIceService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: string) => {
              const map: Record<string, string> = {
                WEBRTC_STUN_URLS: 'stun:stun.example.com:3478',
                WEBRTC_TURN_URLS: 'turn:turn.example.com:3478',
                WEBRTC_TURN_USERNAME: 'user',
                WEBRTC_TURN_PASSWORD: 'pass',
              };
              return map[key] ?? defaultValue;
            },
          },
        },
      ],
    }).compile();

    service = module.get(WebrtcIceService);
  });

  it('loads STUN and TURN servers from env', () => {
    const servers = service.getIceServers('user-1');
    expect(servers.length).toBeGreaterThanOrEqual(2);
    expect(servers.some((s) => String(s.urls).startsWith('stun:'))).toBe(true);
    expect(servers.some((s) => String(s.urls).startsWith('turn:'))).toBe(true);
  });

  it('reports health status', async () => {
    const health = await service.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.turnCount).toBeGreaterThan(0);
  });
});
