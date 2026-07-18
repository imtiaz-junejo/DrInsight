# Coturn TURN/STUN Server — Production Deployment

DrInsight requires a Coturn server for WebRTC NAT traversal in production. Do not rely on public STUN servers alone.

## Environment Variables (Backend)

```env
WEBRTC_STUN_URLS="stun:turn.yourdomain.com:3478"
WEBRTC_TURN_URLS="turn:turn.yourdomain.com:3478?transport=udp,turn:turn.yourdomain.com:3478?transport=tcp,turns:turn.yourdomain.com:5349?transport=tcp"
WEBRTC_TURN_USERNAME="drinsight-turn-user"
WEBRTC_TURN_PASSWORD="your-strong-secret"
WEBRTC_TURN_USE_TIME_LIMITED="true"
WEBRTC_TURN_STATIC_SECRET="your-coturn-static-auth-secret"
WEBRTC_TURN_CREDENTIAL_TTL_SECONDS="86400"
```

## Docker Deployment

```yaml
# docker-compose.coturn.yml
services:
  coturn:
    image: coturn/coturn:4.6.2
    network_mode: host
    volumes:
      - ./coturn/turnserver.conf:/etc/coturn/turnserver.conf:ro
    restart: unless-stopped
```

### turnserver.conf

```ini
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0
relay-ip=YOUR_SERVER_PUBLIC_IP
external-ip=YOUR_SERVER_PUBLIC_IP
realm=drinsight.local
server-name=turn.drinsight.local

fingerprint
lt-cred-mech
use-auth-secret
static-auth-secret=your-coturn-static-auth-secret

min-port=49152
max-port=65535

no-loopback-peers
no-multicast-peers
stale-nonce=600

cert=/etc/ssl/certs/turn.crt
pkey=/etc/ssl/private/turn.key

log-file=/var/log/turnserver.log
verbose
```

## Ubuntu Installation

```bash
sudo apt update && sudo apt install -y coturn
sudo cp /etc/turnserver.conf /etc/turnserver.conf.bak
# Edit /etc/turnserver.conf with settings above
sudo sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn
sudo systemctl enable coturn
sudo systemctl restart coturn
```

## Firewall

```bash
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 5349/tcp
sudo ufw allow 49152:65535/udp
```

## Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 3478 | UDP/TCP | STUN/TURN |
| 5349 | TCP | TURNS (TLS) |
| 49152-65535 | UDP | Media relay |

## Connection Testing

```bash
# Install trickle-ice tester or use browser at https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
turnutils_uclient -v -u drinsight-turn-user -w your-strong-secret turn.yourdomain.com
```

## Health Monitoring

- Monitor Coturn logs: `journalctl -u coturn -f`
- Backend health: `GET /api/v1/meetings/ice-config` returns `health.stunCount` and `health.turnCount`
- Alert if `turnCount === 0` in production

## Security Best Practices

1. Use long-term credentials or time-limited HMAC credentials (`use-auth-secret`)
2. Enable TLS on port 5349 for corporate networks
3. Restrict relay IP to your server's public IP
4. Rotate `WEBRTC_TURN_PASSWORD` and `static-auth-secret` regularly
5. Never expose Coturn admin interface publicly

## Failover

Configure multiple TURN URLs in `WEBRTC_TURN_URLS` (comma-separated). The ICE agent will try servers in order.

```env
WEBRTC_TURN_URLS="turn:turn1.example.com:3478,turn:turn2.example.com:3478"
WEBRTC_STUN_FALLBACK_URLS="stun:stun1.example.com:3478"
```
