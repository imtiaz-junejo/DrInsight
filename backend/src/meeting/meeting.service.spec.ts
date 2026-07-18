import { classifyNetworkQuality } from './utils/network-quality.util';
import { NetworkQuality } from '@prisma/client';

describe('classifyNetworkQuality', () => {
  it('classifies excellent connection', () => {
    const result = classifyNetworkQuality({ packetLoss: 0.5, roundTripMs: 80 });
    expect(result.quality).toBe(NetworkQuality.EXCELLENT);
  });

  it('classifies poor connection', () => {
    const result = classifyNetworkQuality({ packetLoss: 12, roundTripMs: 700 });
    expect(result.quality).toBe(NetworkQuality.POOR);
  });

  it('classifies fair connection', () => {
    const result = classifyNetworkQuality({ packetLoss: 6, roundTripMs: 400 });
    expect(result.quality).toBe(NetworkQuality.FAIR);
  });
});
