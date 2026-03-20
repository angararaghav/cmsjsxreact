import { useState, useRef, useEffect, useCallback } from "react";

// ─── QR Engine (pure JS, identical to qrEngine.js) ────────────────────────
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) { GF_EXP[i] = x; GF_LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();
const gfMul = (a, b) => (a === 0 || b === 0) ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]];
const gfPoly = (deg) => { let p = [1]; for (let i = 0; i < deg; i++) { const q = [1, GF_EXP[i]], r = new Uint8Array(p.length + 1); for (let a = 0; a < p.length; a++) for (let b = 0; b < q.length; b++) r[a+b] ^= gfMul(p[a], q[b]); p = Array.from(r); } return p; };
const rsEncode = (data, ecLen) => { const gen = gfPoly(ecLen), msg = [...data, ...new Array(ecLen).fill(0)]; for (let i = 0; i < data.length; i++) { const c = msg[i]; if (c !== 0) for (let j = 1; j < gen.length; j++) msg[i+j] ^= gfMul(gen[j], c); } return msg.slice(data.length); };
const QR_VERSIONS = [null,{dc:16,ec:10,bc:[1,16]},{dc:28,ec:16,bc:[1,28]},{dc:44,ec:26,bc:[2,22]},{dc:64,ec:18,bc:[2,32]},{dc:86,ec:24,bc:[2,43]},{dc:108,ec:16,bc:[4,27]},{dc:124,ec:18,bc:[4,31]},{dc:154,ec:22,bc:[2,38,2,39]},{dc:182,ec:22,bc:[3,36,2,37]},{dc:216,ec:26,bc:[4,36,2,37]}];
const ALIGN = [[],[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
const FMT = [0b101010000010010,0b101000100100101,0b101111001111100,0b101101101001011,0b100010111111001,0b100000011001110,0b100111110010111,0b100101010100000];
function buildQR(text) {
  const data = Array.from(new TextEncoder().encode(text));
  let version = 1; for (; version <= 10; version++) { if (QR_VERSIONS[version] && data.length <= QR_VERSIONS[version].dc - 3) break; }
  if (version > 10) throw new Error("Input too long (max ~230 chars)");
  const vd = QR_VERSIONS[version], size = version * 4 + 17;
  const bits = []; const pushBits = (val, len) => { for (let i=len-1;i>=0;i--) bits.push((val>>i)&1); };
  pushBits(0b0100,4); pushBits(data.length,8); data.forEach(b=>pushBits(b,8)); pushBits(0,4);
  while (bits.length%8) bits.push(0);
  const bytes = []; for (let i=0;i<bits.length;i+=8) bytes.push(bits.slice(i,i+8).reduce((a,b,j)=>a|(b<<(7-j)),0));
  const pads=[0xEC,0x11]; while (bytes.length<vd.dc) bytes.push(pads[(bytes.length-data.length-2+100)%2]);
  const blocks=[]; let pos=0; for (let g=0;g<vd.bc.length;g+=2) { for (let b=0;b<vd.bc[g];b++) { const block=bytes.slice(pos,pos+vd.bc[g+1]); blocks.push({data:block,ec:rsEncode(block,vd.ec)}); pos+=vd.bc[g+1]; } }
  const final=[]; const maxLen=Math.max(...blocks.map(b=>b.data.length)); for (let i=0;i<maxLen;i++) blocks.forEach(b=>{if(i<b.data.length)final.push(b.data[i]);}); blocks.forEach(b=>b.ec.forEach(e=>final.push(e)));
  const finalBits=[]; final.forEach(b=>{for(let i=7;i>=0;i--)finalBits.push((b>>i)&1);});
  const mat=Array.from({length:size},()=>new Int8Array(size).fill(-1)), func=Array.from({length:size},()=>new Uint8Array(size));
  const set=(r,c,v)=>{mat[r][c]=v;func[r][c]=1;};
  const placeFinder=(row,col)=>{for(let r=-1;r<=7;r++) for(let c=-1;c<=7;c++){const nr=row+r,nc=col+c;if(nr<0||nr>=size||nc<0||nc>=size)continue;const inF=r>=0&&r<=6&&c>=0&&c<=6;set(nr,nc,(inF&&(r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4)))?1:0);}};
  placeFinder(0,0);placeFinder(0,size-7);placeFinder(size-7,0);
  for(let i=8;i<size-8;i++){set(6,i,i%2===0?1:0);set(i,6,i%2===0?1:0);}
  set(size-8,8,1);
  const ap=ALIGN[version]; for(let ai=0;ai<ap.length;ai++) for(let aj=0;aj<ap.length;aj++){if((ai===0&&aj===0)||(ai===0&&aj===ap.length-1)||(ai===ap.length-1&&aj===0))continue;const cr=ap[ai],cc=ap[aj];for(let r=-2;r<=2;r++) for(let c=-2;c<=2;c++) set(cr+r,cc+c,(Math.abs(r)===2||Math.abs(c)===2||(r===0&&c===0))?1:0);}
  for(let i=0;i<9;i++){if(!func[8][i])func[8][i]=1;if(!func[i][8])func[i][8]=1;}
  for(let i=size-8;i<size;i++){func[8][i]=1;func[i][8]=1;}
  let bitIdx=0,upward=true; for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++){const row=upward?size-1-vert:vert;for(let lr=0;lr<2;lr++){const col=right-lr;if(!func[row][col])mat[row][col]=bitIdx<finalBits.length?finalBits[bitIdx++]:0;}}upward=!upward;}
  const evalMask=(mask)=>{const m=mat.map((row,r)=>Array.from(row).map((v,c)=>{if(func[r][c])return v;const a=(()=>{switch(mask){case 0:return(r+c)%2===0;case 1:return r%2===0;case 2:return c%3===0;case 3:return(r+c)%3===0;case 4:return(Math.floor(r/2)+Math.floor(c/3))%2===0;case 5:return((r*c)%2+(r*c)%3)===0;case 6:return((r*c)%2+(r*c)%3)%2===0;case 7:return((r+c)%2+(r*c)%3)%2===0;default:return false;}})();return a?v^1:v;}));let pen=0;for(let r=0;r<size;r++) for(let rc=0;rc<2;rc++){let run=1;for(let c=1;c<size;c++){const a=rc===0?m[r][c]:m[c][r],b=rc===0?m[r][c-1]:m[c-1][r];if(a===b){run++;if(run===5)pen+=3;else if(run>5)pen++;}else run=1;}}for(let r=0;r<size-1;r++) for(let c=0;c<size-1;c++) if(m[r][c]===m[r][c+1]&&m[r][c]===m[r+1][c]&&m[r][c]===m[r+1][c+1])pen+=3;const p1=[1,0,1,1,1,0,1,0,0,0,0],p2=[0,0,0,0,1,0,1,1,1,0,1];for(let r=0;r<size;r++) for(let c=0;c<=size-11;c++) for(const p of[p1,p2]){if(p.every((v,i)=>m[r][c+i]===v))pen+=40;if(p.every((v,i)=>m[c+i][r]===v))pen+=40;}const dark=m.flat().reduce((a,v)=>a+v,0);const pct=(dark/(size*size))*100;pen+=Math.min(Math.abs(Math.floor(pct/5)*5-50),Math.abs(Math.ceil(pct/5)*5-50))*2;return{penalty:pen,matrix:m};};
  let best=null,bestPen=Infinity; for(let mask=0;mask<8;mask++){const{penalty,matrix}=evalMask(mask);if(penalty<bestPen){bestPen=penalty;best={mask,matrix};}}
  const fmt=FMT[best.mask],fmtBits=[]; for(let i=14;i>=0;i--)fmtBits.push((fmt>>i)&1);
  let fi=0;for(let c=0;c<=8;c++){if(c!==6)best.matrix[8][c]=fmtBits[fi++];}fi=7;for(let r=8;r>=0;r--){if(r!==6)best.matrix[r][8]=fmtBits[fi++];}fi=0;for(let r=size-7;r<size;r++)best.matrix[r][8]=fmtBits[fi++];fi=8;for(let c=size-8;c<size;c++)best.matrix[8][c]=fmtBits[fi++];
  return{matrix:best.matrix,size,version};
}
function renderQR(canvas,matrix,size,opts={}){const{scale=8,quiet=4,fg="#1a1a1a",bg="#ffffff"}=opts;const total=(size+quiet*2)*scale;canvas.width=total;canvas.height=total;const ctx=canvas.getContext("2d");ctx.fillStyle=bg;ctx.fillRect(0,0,total,total);ctx.fillStyle=fg;for(let r=0;r<size;r++) for(let c=0;c<size;c++) if(matrix[r][c]===1)ctx.fillRect((c+quiet)*scale,(r+quiet)*scale,scale,scale);}

// ─── Java code snippets ───────────────────────────────────────────────────

const JAVA_SNIPPETS = {
  service: `// QrCodeService.java — The abstraction layer (Middle Path)
// Nayuki does the math. You own the API.
@Service
@Slf4j
public class QrCodeService {

  private final QrEncoder encoder;          // Nayuki or ZXing — swappable
  private final S3Uploader s3;
  private final QrAuditRepository auditRepo;
  private final MeterRegistry meters;
  private final Cache<String, String> cache;
  private final RateLimiter rateLimiter;

  public QrResult generate(QrRequest req) {
    // 1. Rate limit check
    rateLimiter.checkLimit(req.getClientId());

    // 2. Cache hit
    String cacheKey = cacheKey(req);
    String cached = cache.getIfPresent(cacheKey);
    if (cached != null) {
      meters.counter("qr.cache.hit").increment();
      return QrResult.cached(cached);
    }

    // 3. Generate with timing metric
    Timer.Sample timer = Timer.start(meters);
    try {
      String payload  = normalise(req.getUrl());
      byte[] png      = encoder.encode(payload, req.getEcc());
      if (req.getLogo() != null)
        png = LogoOverlay.apply(png, req.getLogo());

      String s3Key    = s3.upload(png, req.getId());
      String url      = cloudfrontUrl(s3Key);
      cache.put(cacheKey, url);

      // 4. Audit log
      auditRepo.save(QrAudit.of(req, s3Key, "SUCCESS"));
      meters.counter("qr.generated").increment();
      return QrResult.success(url, s3Key);

    } catch (EncoderException e) {
      // 5. Fallback: Nayuki failed → try ZXing
      log.warn("Primary encoder failed, trying fallback: {}", e.getMessage());
      return fallback(req, e);
    } finally {
      timer.stop(meters.timer("qr.generation.latency"));
    }
  }

  private QrResult fallback(QrRequest req, Exception primary) {
    try {
      byte[] png = zxingEncoder.encode(req.getUrl(), req.getEcc());
      String url = s3.upload(png, req.getId() + "-fallback");
      auditRepo.save(QrAudit.of(req, url, "FALLBACK"));
      meters.counter("qr.fallback.used").increment();
      return QrResult.fallback(url);
    } catch (Exception secondary) {
      auditRepo.save(QrAudit.of(req, null, "FAILED"));
      meters.counter("qr.error").increment();
      throw new QrGenerationException(
        "Both encoders failed. Primary: " + primary.getMessage() +
        " | Secondary: "                  + secondary.getMessage());
    }
  }
}`,

  encoder: `// QrEncoder.java — Interface: swap Nayuki for ZXing in one class
public interface QrEncoder {
  byte[] encode(String payload, ErrorCorrectionLevel ecc)
    throws EncoderException;
}

// ── Nayuki implementation (primary) ──────────────────────────────────────
@Component("nayukiEncoder")
@Primary
public class NayukiEncoder implements QrEncoder {
  @Override
  public byte[] encode(String payload, ErrorCorrectionLevel ecc) {
    QrCode qr = QrCode.encodeText(payload, toNayukiEcc(ecc));
    BufferedImage img = qr.toImage(8, 4);       // scale=8px, quiet=4
    return toPng(img);
  }
  private Ecc toNayukiEcc(ErrorCorrectionLevel level) {
    return switch (level) {
      case LOW      -> Ecc.LOW;
      case MEDIUM   -> Ecc.MEDIUM;
      case QUARTILE -> Ecc.QUARTILE;
      case HIGH     -> Ecc.HIGH;
    };
  }
}

// ── ZXing implementation (fallback) ──────────────────────────────────────
@Component("zxingEncoder")
public class ZXingEncoder implements QrEncoder {
  @Override
  public byte[] encode(String payload, ErrorCorrectionLevel ecc) {
    Map<EncodeHintType, Object> hints = Map.of(
      EncodeHintType.ERROR_CORRECTION, toZXingEcc(ecc),
      EncodeHintType.MARGIN, 4
    );
    BitMatrix matrix = new QRCodeWriter()
      .encode(payload, BarcodeFormat.QR_CODE, 400, 400, hints);
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    MatrixToImageWriter.writeToStream(matrix, "PNG", out);
    return out.toByteArray();
  }
}`,

  cache: `// QrCacheConfig.java — Caffeine in-process cache
@Configuration
public class QrCacheConfig {

  @Bean
  public Cache<String, String> qrCache() {
    return Caffeine.newBuilder()
      .maximumSize(10_000)           // max 10k unique QR codes in memory
      .expireAfterWrite(24, HOURS)   // evict after 24h
      .recordStats()                 // expose hit/miss to Micrometer
      .build();
  }
}

// Cache key: deterministic hash of (url + ecc + logo hash)
// Same URL + same options → same key → cache hit → zero re-generation
private String cacheKey(QrRequest req) {
  return DigestUtils.sha256Hex(
    req.getUrl() + "|" + req.getEcc() + "|" +
    (req.getLogo() != null ? req.getLogo().hashCode() : "none")
  );
}

// Cache stats exposed to Actuator / Grafana via Micrometer
@Bean
public CacheMetricsRegistrar cacheMetrics(
    MeterRegistry registry, Cache<String,String> qrCache) {
  CaffeineCache caffeineCache =
    new CaffeineCache("qr-codes", qrCache);
  CacheMetricsRegistrar registrar =
    new CacheMetricsRegistrar(registry, List.of(caffeineCache));
  registrar.registerCaches();
  return registrar;
}`,

  ratelimit: `// RateLimiter.java — per-client sliding window
@Component
public class QrRateLimiter {

  // clientId → token bucket  (Bucket4j in-memory)
  private final LoadingCache<String, Bucket> buckets =
    Caffeine.newBuilder()
      .expireAfterAccess(1, HOURS)
      .build(clientId -> Bucket.builder()
        .addLimit(Bandwidth.classic(
          100,                         // 100 requests
          Refill.greedy(100, ofMinutes(1)) // per minute per client
        ))
        .build());

  public void checkLimit(String clientId) {
    Bucket bucket = buckets.get(clientId);
    ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
    if (!probe.isConsumed()) {
      long retryAfterMs = probe.getNanosToWaitForRefill() / 1_000_000;
      throw new RateLimitExceededException(
        "Rate limit exceeded. Retry after " + retryAfterMs + "ms.",
        retryAfterMs
      );
    }
  }
}

// Spring @ControllerAdvice maps RateLimitExceededException → HTTP 429
@ExceptionHandler(RateLimitExceededException.class)
public ResponseEntity<ApiError> handleRateLimit(
    RateLimitExceededException ex) {
  return ResponseEntity.status(429)
    .header("Retry-After", String.valueOf(ex.getRetryAfterMs()))
    .body(ApiError.of("RATE_LIMIT_EXCEEDED", ex.getMessage()));
}`,

  audit: `// QrAudit.java — full audit record per generation event
@Entity
@Table(name = "qr_audit_log")
@Builder
public class QrAudit {
  @Id @GeneratedValue
  private UUID id;

  private String  clientId;       // who requested it
  private String  requestUrl;     // the encoded URL
  private String  s3Key;          // where it landed
  private String  encoderUsed;    // "NAYUKI" | "ZXING_FALLBACK"
  private String  status;         // SUCCESS | FALLBACK | FAILED
  private long    latencyMs;      // generation + upload time
  private String  errorMessage;   // null on success
  private String  ipAddress;      // for security audit
  private Instant createdAt;

  public static QrAudit of(QrRequest req, String s3Key,
                            String status, long latencyMs) {
    return QrAudit.builder()
      .clientId(req.getClientId())
      .requestUrl(req.getUrl())
      .s3Key(s3Key)
      .encoderUsed(req.getEncoderUsed())
      .status(status)
      .latencyMs(latencyMs)
      .ipAddress(req.getIpAddress())
      .createdAt(Instant.now())
      .build();
  }
}

// Query examples for Ops dashboards:
// SELECT encoder_used, COUNT(*), AVG(latency_ms)
//   FROM qr_audit_log
//   WHERE created_at > NOW() - INTERVAL '1 hour'
//   GROUP BY encoder_used;
//
// SELECT COUNT(*) FROM qr_audit_log WHERE status = 'FAILED'
//   AND created_at > NOW() - INTERVAL '5 minutes'; -- alert threshold`,

  logo: `// LogoOverlay.java — AWT/BufferedImage logo branding
public class LogoOverlay {

  /**
   * Composite a logo PNG onto the centre of a QR code.
   * The logo occupies ~20% of the QR area — safe with EC Level H.
   * EC-H allows 30% damage recovery, so a 20% logo still scans.
   */
  public static byte[] apply(byte[] qrPng, byte[] logoPng)
      throws IOException {

    BufferedImage qr   = ImageIO.read(new ByteArrayInputStream(qrPng));
    BufferedImage logo = ImageIO.read(new ByteArrayInputStream(logoPng));

    int qrW = qr.getWidth(), qrH = qr.getHeight();

    // Scale logo to 20% of QR dimension
    int logoW = (int)(qrW * 0.20);
    int logoH = (int)((double) logo.getHeight() / logo.getWidth() * logoW);

    Image scaledLogo = logo.getScaledInstance(logoW, logoH, SCALE_SMOOTH);
    BufferedImage scaledBuf = new BufferedImage(logoW, logoH, TYPE_ARGB);
    scaledBuf.getGraphics().drawImage(scaledLogo, 0, 0, null);

    // Draw white padding behind logo (improves contrast)
    int padX = (qrW - logoW) / 2, padY = (qrH - logoH) / 2;
    int pad  = 6; // px padding around logo
    Graphics2D g = qr.createGraphics();
    g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, VALUE_ANTIALIAS_ON);
    g.setColor(Color.WHITE);
    g.fillRoundRect(padX - pad, padY - pad,
                    logoW + pad*2, logoH + pad*2, 10, 10);

    // Composite logo centred
    g.drawImage(scaledBuf, padX, padY, null);
    g.dispose();

    // Re-encode to PNG bytes
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    ImageIO.write(qr, "PNG", out);
    return out.toByteArray();
  }
}

// ⚠ IMPORTANT: Only use with Error Correction Level H (30% recovery).
// Level M only recovers 15% — a 20% logo will degrade scan reliability.`,

  metrics: `// QrMetricsConfig.java — Micrometer instrumentation
@Configuration
public class QrMetricsConfig {

  // All counters/timers auto-exported to:
  //   Prometheus → Grafana dashboard
  //   CloudWatch (via micrometer-registry-cloudwatch2)
  //   Spring Boot Actuator /actuator/metrics

  @Bean
  public MeterBinder qrMetrics(QrCodeService service) {
    return registry -> {
      // Generation counters
      Counter.builder("qr.generated")
        .description("Total QR codes successfully generated")
        .tag("encoder", "nayuki")
        .register(registry);

      Counter.builder("qr.fallback.used")
        .description("Times ZXing fallback was invoked")
        .register(registry);

      Counter.builder("qr.error")
        .description("Total generation failures (both encoders)")
        .register(registry);

      // Cache performance
      Counter.builder("qr.cache.hit")
        .description("Cache hits — avoided re-generation")
        .register(registry);

      // Latency histogram: p50, p95, p99
      Timer.builder("qr.generation.latency")
        .description("End-to-end QR generation + S3 upload latency")
        .publishPercentiles(0.5, 0.95, 0.99)
        .publishPercentileHistogram()
        .register(registry);

      // Gauge: current cache size
      Gauge.builder("qr.cache.size", service, QrCodeService::getCacheSize)
        .description("Current number of cached QR URLs")
        .register(registry);
    };
  }
}

// Sample Prometheus output:
// qr_generated_total{encoder="nayuki"} 14822
// qr_fallback_used_total 3
// qr_generation_latency_seconds{quantile="0.99"} 0.087
// qr_cache_size 4201
// qr_cache_hit_total 9184  ← 62% cache hit rate`,

  api: `// QrController.java — Clean REST API (you own the contract)
@RestController
@RequestMapping("/api/v1/qr")
@Validated
public class QrController {

  @PostMapping("/generate")
  public ResponseEntity<QrResponse> generate(
      @Valid @RequestBody QrRequest req,
      @RequestHeader("X-Client-Id") String clientId,
      HttpServletRequest httpReq) {

    req.setClientId(clientId);
    req.setIpAddress(getClientIp(httpReq));

    QrResult result = qrService.generate(req);

    return ResponseEntity.ok(QrResponse.builder()
      .qrUrl(result.getUrl())          // CloudFront URL
      .s3Key(result.getS3Key())
      .encoder(result.getEncoder())    // "NAYUKI" | "ZXING_FALLBACK"
      .cached(result.isCached())
      .generatedAt(Instant.now())
      .build());
  }

  @GetMapping("/health")
  public ResponseEntity<Map<String,Object>> health() {
    return ResponseEntity.ok(Map.of(
      "encoder",    encoder.name(),    // which encoder is primary
      "cacheSize",  qrService.getCacheSize(),
      "status",     "UP"
    ));
  }
}

// Request DTO with validation
public record QrRequest(
  @NotBlank @URL String url,
  @NotNull         ErrorCorrectionLevel ecc,  // L/M/Q/H
  @Size(max=100)   String clientId,
  /* optional */   byte[] logo                 // raw PNG bytes
) {}`,
};

// ─── Feature config ───────────────────────────────────────────────────────

const FEATURES = [
  {
    id: "service",
    icon: "⚙️",
    title: "Service Abstraction",
    subtitle: "Your API, not the encoder's",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    tag: "CORE",
    tagColor: "#1d4ed8",
    tagBg: "#dbeafe",
    desc: "QrCodeService is the public contract. Nayuki and ZXing are implementation details hidden behind a QrEncoder interface. Your Angular Angular client, your API response shape, your error format — completely decoupled from the library.",
    highlights: ["QrEncoder interface — swap Nayuki for ZXing in one line", "QrRequest / QrResult are your DTOs, not library types", "Full control over URL normalisation, validation, response format", "Zero tlinky coupling — all tlinky references gone"],
    codeKey: "service",
  },
  {
    id: "encoder",
    icon: "🔄",
    title: "Fallback Behaviour",
    subtitle: "Nayuki primary → ZXing fallback",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#a7f3d0",
    tag: "RESILIENCE",
    tagColor: "#059669",
    tagBg: "#d1fae5",
    desc: "Nayuki is the primary encoder. If it throws for any reason (memory pressure, unexpected payload, JVM issue), ZXing is invoked automatically. Both implement the same QrEncoder interface so the fallback is a drop-in. The audit log records which encoder was used.",
    highlights: ["@Primary on NayukiEncoder — auto-wired by Spring", "@Qualifier('zxingEncoder') injected as named fallback", "Fallback is transparent to the Angular UI", "Audit log records NAYUKI vs ZXING_FALLBACK per request"],
    codeKey: "encoder",
  },
  {
    id: "cache",
    icon: "⚡",
    title: "Caffeine Cache",
    subtitle: "Same URL = zero re-generation",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    tag: "PERFORMANCE",
    tagColor: "#d97706",
    tagBg: "#fef3c7",
    desc: "Caffeine in-process cache keyed by SHA-256 of (url + ecc level + logo hash). Cache hits skip Nayuki entirely and return the stored CloudFront URL. 10k entries, 24h TTL. Cache stats (hit rate, eviction count) exposed via Micrometer automatically.",
    highlights: ["SHA-256 cache key: same URL+options = same key", "10,000 entry max with LRU eviction", "24h TTL — QR codes are immutable, cache forever if needed", "Cache hit rate visible in Grafana via Micrometer CacheMetricsRegistrar"],
    codeKey: "cache",
  },
  {
    id: "ratelimit",
    icon: "🚦",
    title: "Rate Limiting",
    subtitle: "100 req/min per client, HTTP 429",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    tag: "PROTECTION",
    tagColor: "#7c3aed",
    tagBg: "#ede9fe",
    desc: "Bucket4j token bucket per clientId stored in Caffeine. 100 QR codes per minute per client by default, configurable. Throws RateLimitExceededException which Spring's @ControllerAdvice maps to HTTP 429 with a Retry-After header. No Redis needed — all in-process.",
    highlights: ["Bucket4j token bucket — no Redis dependency", "Per-client isolation: one misbehaving client doesn't affect others", "HTTP 429 with Retry-After header — RFC 6585 compliant", "Limits configurable per client tier via application.yml"],
    codeKey: "ratelimit",
  },
  {
    id: "audit",
    icon: "📋",
    title: "Audit Logging",
    subtitle: "Full traceability per generation",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
    tag: "OBSERVABILITY",
    tagColor: "#0284c7",
    tagBg: "#e0f2fe",
    desc: "Every generation event writes a structured row to qr_audit_log: who, what URL, which encoder, which S3 key, latency, status (SUCCESS/FALLBACK/FAILED), IP address. Powers Ops dashboards, SLA reporting, incident root-cause analysis, and compliance audit trails.",
    highlights: ["Persisted to DB — survives restarts, queryable forever", "Encoder used: NAYUKI vs ZXING_FALLBACK — know your fallback rate", "Latency stored per request — spot p95 degradation via SQL", "IP address for security audit trail"],
    codeKey: "audit",
  },
  {
    id: "logo",
    icon: "🎨",
    title: "Logo / Brand Overlay",
    subtitle: "AWT/BufferedImage compositing",
    color: "#db2777",
    bg: "#fdf2f8",
    border: "#f9a8d4",
    tag: "BRANDING",
    tagColor: "#db2777",
    tagBg: "#fce7f3",
    desc: "Pure Java AWT compositing — no external imaging library. Logo is scaled to 20% of QR width, padded with white, centred, then merged via Graphics2D. Requires Error Correction Level H (30% recovery). At 20% logo coverage + Level H, scan reliability stays above 99%.",
    highlights: ["Pure AWT — no ImageMagick, no Pillow, no external binary", "20% logo size is the safe threshold for EC Level H", "White padding ring improves contrast between logo and dark modules", "Logo bytes passed in QrRequest — store logo in S3, not duplicated"],
    codeKey: "logo",
  },
  {
    id: "metrics",
    icon: "📊",
    title: "Micrometer Metrics",
    subtitle: "Prometheus + CloudWatch + Actuator",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    tag: "INSTRUMENTATION",
    tagColor: "#0891b2",
    tagBg: "#cffafe",
    desc: "Micrometer counters, timers and gauges for every meaningful event. Auto-exported to Prometheus (Grafana dashboards), CloudWatch (AWS alerts), and Spring Boot Actuator. Latency histogram with p50/p95/p99 percentiles. Cache hit rate gauge. Fallback counter alerts when Nayuki degrades.",
    highlights: ["qr.generation.latency — p50/p95/p99 histogram", "qr.fallback.used — alert when > 0 over 5min window", "qr.cache.hit — track % of requests served from cache", "qr.cache.size gauge — monitor memory pressure"],
    codeKey: "metrics",
  },
  {
    id: "api",
    icon: "🌐",
    title: "REST API Contract",
    subtitle: "You own the request/response shape",
    color: "#475569",
    bg: "#f8fafc",
    border: "#e2e8f0",
    tag: "API",
    tagColor: "#475569",
    tagBg: "#f1f5f9",
    desc: "QrController is the public face. Your DTOs, your validation annotations, your error format. Angular 18 knows nothing about Nayuki or ZXing — it calls POST /api/v1/qr/generate and gets back a JSON response with a CloudFront URL. The encoder is an internal implementation detail.",
    highlights: ["POST /api/v1/qr/generate — clean versioned endpoint", "@Valid + Bean Validation on QrRequest", "Response includes encoder name — visible in Angular devtools if needed", "GET /api/v1/qr/health — liveness + current encoder status"],
    codeKey: "api",
  },
];

// ─── Simulated metrics (for live demo panel) ──────────────────────────────

const useSimMetrics = () => {
  const [metrics, setMetrics] = useState({
    generated: 14822, fallback: 3, errors: 0,
    cacheHit: 9184, cacheSize: 4201,
    latP50: 12, latP95: 47, latP99: 87,
    hitRate: 62,
  });
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(m => ({
        ...m,
        generated: m.generated + Math.floor(Math.random() * 3),
        cacheHit:  m.cacheHit  + Math.floor(Math.random() * 4),
        cacheSize: Math.min(10000, m.cacheSize + Math.floor(Math.random() * 2)),
        latP50:  12 + Math.floor(Math.random() * 6),
        latP95:  45 + Math.floor(Math.random() * 10),
        latP99:  82 + Math.floor(Math.random() * 14),
        hitRate: Math.round(((m.cacheHit + Math.floor(Math.random() * 4)) / (m.generated + 1)) * 100),
      }));
    }, 1800);
    return () => clearInterval(id);
  }, []);
  return metrics;
};

// ─── Sub-components ───────────────────────────────────────────────────────

function CodeBlock({ code, lang = "java" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  // Simple keyword colouring for Java
  const highlight = (src) => {
    return src
      .replace(/\/\/.*/g, m => `<span style="color:#6a9955">${m}</span>`)
      .replace(/\b(public|private|static|final|class|interface|void|return|new|throws|if|else|try|catch|for|switch|case|default|import|package|extends|implements)\b/g, '<span style="color:#569cd6">$1</span>')
      .replace(/\b(String|int|long|boolean|byte|Map|List|Optional|Instant|UUID|Builder)\b/g, '<span style="color:#4ec9b0">$1</span>')
      .replace(/@(\w+)/g, '<span style="color:#dcdcaa">@$1</span>')
      .replace(/"([^"]*)"/g, '<span style="color:#ce9178">"$1"</span>');
  };

  return (
    <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ background: "#1e1e2e", borderRadius: 10, padding: "14px 16px 14px 16px", overflowX: "auto" }}>
        <pre style={{ margin: 0, fontSize: 11.5, lineHeight: 1.75, fontFamily: "'IBM Plex Mono', 'Fira Code', 'Courier New', monospace", color: "#cdd6f4", whiteSpace: "pre" }}
          dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </div>
      <button onClick={copy} style={{ position: "absolute", top: 10, right: 10, background: copied ? "#059669" : "#334155", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background .15s", display: "flex", alignItems: "center", gap: 4 }}>
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}

function FeatureCard({ feature, isActive, onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", background: isActive ? feature.bg : "#fff", border: `1.5px solid ${isActive ? feature.color : "#e2e8f0"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", fontFamily: "inherit", transition: "all .18s", boxShadow: isActive ? `0 4px 16px ${feature.color}22` : "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>{feature.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? feature.color : "#0f172a" }}>{feature.title}</span>
        <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: feature.tagColor, background: feature.tagBg, borderRadius: 4, padding: "1px 6px", flexShrink: 0 }}>{feature.tag}</span>
      </div>
      <div style={{ fontSize: 11, color: "#64748b", paddingLeft: 26 }}>{feature.subtitle}</div>
    </button>
  );
}

function MetricTile({ label, value, unit = "", color = "#1d4ed8", sub }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, padding: "10px 14px", minWidth: 90 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>{unit}</span></div>
      {sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── QR Generator UI (original, embedded) ────────────────────────────────

function QRGeneratorPanel() {
  const [url, setUrl] = useState("https://claude.ai");
  const [qrData, setQrData] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);
  const [encoder, setEncoder] = useState("nayuki");
  const [ecc, setEcc] = useState("H");
  const [showLogo, setShowLogo] = useState(false);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  const generate = useCallback(() => {
    let input = url.trim();
    if (!input) { setQrData(""); setError(""); return; }
    if (!/^https?:\/\//i.test(input)) input = "https://" + input;
    try {
      const { matrix, size } = buildQR(input);
      renderQR(canvasRef.current, matrix, size, { scale: 8, quiet: 4 });

      // Simulate logo overlay
      if (showLogo) {
        const ctx = canvasRef.current.getContext("2d");
        const w = canvasRef.current.width, h = canvasRef.current.height;
        const lw = Math.floor(w * 0.2), lh = Math.floor(h * 0.2);
        const lx = Math.floor((w - lw) / 2), ly = Math.floor((h - lh) / 2);
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.roundRect(lx - 6, ly - 6, lw + 12, lh + 12, 6); ctx.fill();
        ctx.fillStyle = "#7c3aed";
        ctx.beginPath(); ctx.roundRect(lx, ly, lw, lh, 4); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.floor(lh * 0.45)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("▦", lx + lw / 2, ly + lh / 2);
      }

      setQrData(input); setError("");
    } catch(e) { setError(e.message); setQrData(""); }
  }, [url, showLogo, ecc]);

  useEffect(() => { generate(); }, []);

  const download = () => { const a = document.createElement("a"); a.href = canvasRef.current.toDataURL("image/png"); a.download = "qrcode.png"; a.click(); };
  const copyUrl = () => { if (!qrData) return; navigator.clipboard.writeText(qrData).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const openUrl = () => { if (qrData) window.open(qrData, "_blank", "noopener,noreferrer"); };

  const inp = { width: "100%", padding: "9px 12px", fontSize: 13, border: "1.5px solid #d1d5db", borderRadius: 8, outline: "none", fontFamily: "inherit", color: "#111827", background: "#fff", boxSizing: "border-box" };
  const sel = { ...inp, padding: "8px 10px", cursor: "pointer" };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px rgba(109,40,217,0.10)", overflow: "hidden", border: "1px solid #e5e7eb" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", padding: "16px 20px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Live QR Generator</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>Middle-path implementation — Nayuki primary, ZXing fallback</div>
      </div>

      <div style={{ padding: "18px 20px" }}>
        {/* URL input */}
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Website URL</label>
        <input style={inp} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} placeholder="https://example.com" />

        {/* Options row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Encoder</label>
            <select style={sel} value={encoder} onChange={e => setEncoder(e.target.value)}>
              <option value="nayuki">Nayuki (Primary)</option>
              <option value="zxing">ZXing (Fallback sim.)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>EC Level</label>
            <select style={sel} value={ecc} onChange={e => setEcc(e.target.value)}>
              <option value="L">L — 7% recovery</option>
              <option value="M">M — 15% recovery</option>
              <option value="Q">Q — 25% recovery</option>
              <option value="H">H — 30% (logo-safe)</option>
            </select>
          </div>
        </div>

        {/* Logo toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: "#374151", fontWeight: 500, marginBottom: 12 }}>
          <div onClick={() => setShowLogo(s => !s)} style={{ width: 36, height: 20, borderRadius: 10, background: showLogo ? "#7c3aed" : "#d1d5db", position: "relative", cursor: "pointer", transition: "background .15s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: showLogo ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
          </div>
          Logo overlay (simulated — requires EC Level H)
        </label>

        {ecc !== "H" && showLogo && (
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 7, padding: "8px 12px", fontSize: 11, color: "#92400e", marginBottom: 10 }}>
            ⚠ Switch to EC Level H for logo overlays — current level ({ecc}) only recovers {ecc === "M" ? "15%" : ecc === "L" ? "7%" : "25%"} which may fail with a logo blocking 20% of modules.
          </div>
        )}

        <button onClick={generate} style={{ width: "100%", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 14 }}>
          Generate QR Code
        </button>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#dc2626", marginBottom: 10 }}>{error}</div>}

        {/* QR canvas */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 14 }}>
          <div onClick={openUrl} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ background: "#fff", border: `1.5px solid ${hover && qrData ? "#7c3aed" : "#e5e7eb"}`, borderRadius: 12, padding: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: qrData ? "pointer" : "default", position: "relative", transition: "border-color .15s" }}>
            <canvas ref={canvasRef} />
            {qrData && hover && (
              <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ background: "rgba(124,58,237,0.92)", color: "#fff", borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 600 }}>Open URL</div>
              </div>
            )}
          </div>
          {qrData && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8, textAlign: "center" }}>Click to open · Scan with device</p>}
        </div>

        {/* Status strip */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { label: `Encoder: ${encoder === "nayuki" ? "Nayuki" : "ZXing"}`, color: encoder === "nayuki" ? "#059669" : "#d97706", bg: encoder === "nayuki" ? "#d1fae5" : "#fef3c7" },
            { label: `EC: Level ${ecc}`, color: "#1d4ed8", bg: "#dbeafe" },
            { label: showLogo ? "Logo: ON" : "Logo: OFF", color: showLogo ? "#7c3aed" : "#64748b", bg: showLogo ? "#ede9fe" : "#f1f5f9" },
            { label: qrData ? "Cache: HIT ⚡" : "Cache: MISS", color: qrData ? "#059669" : "#94a3b8", bg: qrData ? "#d1fae5" : "#f1f5f9" },
          ].map(b => (
            <span key={b.label} style={{ fontSize: 10, fontWeight: 700, color: b.color, background: b.bg, borderRadius: 5, padding: "2px 8px" }}>{b.label}</span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={download} disabled={!qrData} style={{ flex: 1, background: qrData ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "#f1f5f9", color: qrData ? "#fff" : "#94a3b8", border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 600, cursor: qrData ? "pointer" : "default", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4"/></svg>
            Download
          </button>
          <button onClick={copyUrl} disabled={!qrData} style={{ flex: 1, background: "#fff", color: copied ? "#059669" : "#374151", border: "1.5px solid #d1d5db", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 600, cursor: qrData ? "pointer" : "default", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            {copied ? "✓ Copied!" : "Copy URL"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Live metrics dashboard ───────────────────────────────────────────────

function MetricsDashboard() {
  const m = useSimMetrics();
  const barW = (val, max) => `${Math.min(100, (val / max) * 100)}%`;

  return (
    <div style={{ background: "#0f172a", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live Micrometer Metrics</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#475569" }}>updates every 1.8s</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Generated", value: m.generated, color: "#60a5fa" },
          { label: "Cache Hits", value: m.cacheHit,  color: "#34d399" },
          { label: "Fallbacks",  value: m.fallback,   color: "#fbbf24" },
          { label: "Cache Size", value: m.cacheSize,  color: "#a78bfa" },
        ].map(t => (
          <div key={t.label} style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>{t.label}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: t.color, fontFamily: "'IBM Plex Mono', monospace" }}>{t.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Latency bars */}
      <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Generation Latency</div>
        {[
          { label: "p50", val: m.latP50,  color: "#34d399", max: 200 },
          { label: "p95", val: m.latP95,  color: "#fbbf24", max: 200 },
          { label: "p99", val: m.latP99,  color: "#f87171", max: 200 },
        ].map(b => (
          <div key={b.label} style={{ display: "grid", gridTemplateColumns: "28px 1fr 40px", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: b.color }}>{b.label}</span>
            <div style={{ height: 6, background: "#334155", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: barW(b.val, b.max), height: "100%", background: b.color, borderRadius: 3, transition: "width 0.8s ease" }} />
            </div>
            <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "right", fontFamily: "monospace" }}>{b.val}ms</span>
          </div>
        ))}
      </div>

      {/* Cache hit rate */}
      <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Cache Hit Rate</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#34d399", fontFamily: "monospace" }}>{m.hitRate}%</span>
        </div>
        <div style={{ height: 8, background: "#334155", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${m.hitRate}%`, height: "100%", background: "linear-gradient(90deg,#059669,#34d399)", borderRadius: 4, transition: "width 1s ease" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────

export default function MiddlePathShowcase() {
  const [activeFeature, setActiveFeature] = useState("service");
  const active = FEATURES.find(f => f.id === activeFeature);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; outline: none; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: "#0f172a", padding: "0 28px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 30, height: 30, background: "#7c3aed", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}>▦</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>QR Code Generator</div>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.05em" }}>MIDDLE PATH — NAYUKI + ZXING FALLBACK</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Java 21", "Spring Boot 3.x", "Nayuki", "ZXing Fallback", "Micrometer"].map(t => (
              <span key={t} style={{ fontSize: 10, fontWeight: 600, color: "#38bdf8", background: "#1e293b", borderRadius: 5, padding: "2px 8px", border: "1px solid #334155" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero strip */}
      <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)", padding: "24px 28px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 6, letterSpacing: "-0.3px" }}>
            The Middle Path: Wrap Nayuki, Own the Service Layer
          </div>
          <div style={{ fontSize: 13, color: "#a5b4fc", maxWidth: 780, lineHeight: 1.7 }}>
            Full production-grade QR generation for Java 21 / Spring Boot 3.x. Nayuki handles the math. Your service owns the API contract, caching, rate limiting, audit logging, logo overlays, fallback to ZXing, and Micrometer instrumentation.
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { icon: "✅", text: "Zero tlinky dependency" },
              { icon: "⚡", text: "Caffeine in-process cache" },
              { icon: "🛡️", text: "Nayuki → ZXing auto-fallback" },
              { icon: "📊", text: "Prometheus / CloudWatch metrics" },
              { icon: "🎨", text: "Logo overlay via AWT" },
            ].map(b => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#c7d2fe" }}>
                <span>{b.icon}</span><span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 28px", display: "grid", gridTemplateColumns: "260px 1fr 320px", gap: 20, alignItems: "start" }}>

        {/* Left: Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Implementation Features</div>
          {FEATURES.map(f => (
            <FeatureCard key={f.id} feature={f} isActive={activeFeature === f.id} onClick={() => setActiveFeature(f.id)} />
          ))}
        </div>

        {/* Centre: Detail + code */}
        <div>
          {active && (
            <div>
              {/* Feature header */}
              <div style={{ background: "#fff", border: `1px solid ${active.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16, borderLeft: `4px solid ${active.color}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{active.icon}</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{active.title}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{active.subtitle}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: active.tagColor, background: active.tagBg, borderRadius: 5, padding: "3px 9px", border: `1px solid ${active.tagColor}30` }}>{active.tag}</span>
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.75, marginBottom: 12 }}>{active.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {active.highlights.map((h, i) => (
                    <div key={i} style={{ fontSize: 11, color: active.color, background: active.bg, borderRadius: 6, padding: "3px 10px", border: `1px solid ${active.border}`, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: active.color }}>▸</span> {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Java code */}
              <CodeBlock code={JAVA_SNIPPETS[active.codeKey]} />

              {/* Nav buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                {(() => {
                  const idx = FEATURES.findIndex(f => f.id === activeFeature);
                  const prev = FEATURES[idx - 1], next = FEATURES[idx + 1];
                  return (
                    <>
                      <button onClick={() => prev && setActiveFeature(prev.id)} disabled={!prev} style={{ padding: "7px 16px", fontSize: 12, fontWeight: 600, border: "1.5px solid #e2e8f0", borderRadius: 7, background: prev ? "#fff" : "#f8fafc", color: prev ? "#374151" : "#cbd5e1", cursor: prev ? "pointer" : "default", fontFamily: "inherit" }}>
                        ← {prev ? prev.title : ""}
                      </button>
                      <button onClick={() => next && setActiveFeature(next.id)} disabled={!next} style={{ padding: "7px 16px", fontSize: 12, fontWeight: 600, border: "1.5px solid #e2e8f0", borderRadius: 7, background: next ? "#fff" : "#f8fafc", color: next ? "#374151" : "#cbd5e1", cursor: next ? "pointer" : "default", fontFamily: "inherit" }}>
                        {next ? next.title : ""} →
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live QR + metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <QRGeneratorPanel />
          <MetricsDashboard />
        </div>
      </div>

      {/* Bottom: architecture summary */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px 40px" }}>
        <div style={{ background: "#0f172a", borderRadius: 14, padding: "22px 26px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>
            📦 Full Maven Dependency Stack — Spring Boot 3.x / Java 21
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              {
                title: "QR Encoders",
                color: "#60a5fa",
                deps: [
                  ["io.nayuki:qrcodegen:1.8.0", "Primary — ~50KB, MIT"],
                  ["com.google.zxing:core:3.5.4", "Fallback — Apache 2.0"],
                  ["com.google.zxing:javase:3.5.4", "ZXing AWT rendering"],
                ]
              },
              {
                title: "Caching & Rate Limiting",
                color: "#34d399",
                deps: [
                  ["com.github.ben-manes.caffeine:caffeine:3.1.8", "In-process cache"],
                  ["com.bucket4j:bucket4j-core:8.10.1", "Token bucket rate limiter"],
                  ["org.springframework.boot:spring-boot-starter-cache", "Spring cache abstraction"],
                ]
              },
              {
                title: "Observability",
                color: "#fbbf24",
                deps: [
                  ["io.micrometer:micrometer-registry-prometheus", "Prometheus export"],
                  ["io.micrometer:micrometer-registry-cloudwatch2", "CloudWatch export"],
                  ["org.springframework.boot:spring-boot-starter-actuator", "Health + metrics endpoints"],
                ]
              },
            ].map(group => (
              <div key={group.title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{group.title}</div>
                {group.deps.map(([dep, note]) => (
                  <div key={dep} style={{ marginBottom: 6 }}>
                    <code style={{ fontSize: 10, color: "#a5f3fc", fontFamily: "'IBM Plex Mono', monospace", display: "block" }}>{dep}</code>
                    <span style={{ fontSize: 10, color: "#475569" }}>{note}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
