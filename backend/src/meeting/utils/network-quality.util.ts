import { NetworkQuality } from '@prisma/client';
import { NetworkQualityMetrics } from '../types/meeting.types';

export function classifyNetworkQuality(metrics: {
  packetLoss?: number;
  roundTripMs?: number;
  latencyMs?: number;
  bitrateKbps?: number;
}): NetworkQualityMetrics {
  const packetLoss = metrics.packetLoss ?? 0;
  const rtt = metrics.roundTripMs ?? metrics.latencyMs ?? 0;

  if (packetLoss >= 10 || rtt >= 600) {
    return { quality: NetworkQuality.POOR, ...metrics };
  }
  if (packetLoss >= 5 || rtt >= 350) {
    return { quality: NetworkQuality.FAIR, ...metrics };
  }
  if (packetLoss >= 2 || rtt >= 200) {
    return { quality: NetworkQuality.GOOD, ...metrics };
  }
  return { quality: NetworkQuality.EXCELLENT, ...metrics };
}
