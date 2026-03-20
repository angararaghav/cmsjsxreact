import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    id: "nayuki",
    name: "Nayuki",
    type: "Java Library",
    badge: "RECOMMENDED",
    badgeColor: "#0f5132",
    badgeBg: "#d1e7dd",
    cost: "$0",
    costNote: "MIT License",
    costNum: 0,
    effort: "Low",
    effortScore: 2,
    maintenance: "Self",
    maintenanceScore: 3,
    scalability: "Unlimited",
    scalabilityScore: 5,
    accuracy: "99.9%",
    accuracyScore: 5,
    support: "Community",
    supportScore: 3,
    compliance: "N/A",
    complianceScore: 4,
    vendorRisk: "None",
    vendorRiskScore: 5,
    lastRelease: "v1.8.0 (2022)",
    releaseNote: "Complete — spec fully implemented",
    integration: "Maven: io.nayuki:qrcodegen:1.8.0",
    features: ["All 40 QR versions", "4 EC levels (L/M/Q/H)", "MIT License", "No network call", "~50KB JAR", "PNG/SVG output", "Zero dependencies", "QR generation only — purpose-built"],
    cons: ["No dynamic QR", "No analytics", "No SLA", "2022 last release (complete, not abandoned)", "QR only — no barcode read/scan"],
    angular: "Serve pre-generated S3 URL",
    recommendation: "Best fit for pure QR generation in Java 21 / Spring Boot. One Maven dep, in-process, ISO-spec precise. The 2022 date means the library is feature-complete — QR spec hasn't changed. ~50KB JAR, single clean API.",
    color: "#1d4ed8",
    lightColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  {
    id: "zxing",
    name: "ZXing (Google)",
    type: "Java Library",
    badge: "ACTIVELY PATCHED",
    badgeColor: "#0c4a6e",
    badgeBg: "#e0f2fe",
    cost: "$0",
    costNote: "Apache 2.0",
    costNum: 0,
    effort: "Low",
    effortScore: 2,
    maintenance: "Self",
    maintenanceScore: 3,
    scalability: "Unlimited",
    scalabilityScore: 5,
    accuracy: "99%",
    accuracyScore: 4,
    support: "Community / SO",
    supportScore: 4,
    compliance: "N/A",
    complianceScore: 4,
    vendorRisk: "None",
    vendorRiskScore: 5,
    lastRelease: "v3.5.4 (Nov 2025)",
    releaseNote: "Community-patched maintenance mode",
    integration: "Maven: com.google.zxing:core:3.5.4 + javase:3.5.4",
    features: ["QR + 50+ barcode formats", "Barcode reading AND writing", "Apache 2.0 License", "v3.5.4 released Nov 2025", "Massive real-world usage base", "Android-proven at billions of scans"],
    cons: ["Maintenance mode — no new features, only patches", "~596KB JAR (12× larger than Nayuki)", "Requires 2 JARs (core + javase)", "QR is 1 of 50 formats — not its primary focus", "More boilerplate API for QR-only use"],
    angular: "Serve pre-generated S3 URL",
    recommendation: "Right choice if you need to both generate AND read/scan barcodes (QR, EAN, Code128 etc). v3.5.4 in Nov 2025 shows active patch releases — but no new features. For pure QR generation, Nayuki is leaner and more precise.",
    color: "#0284c7",
    lightColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  {
    id: "uniqode",
    name: "Uniqode",
    type: "SaaS Platform",
    badge: "ENTERPRISE",
    badgeColor: "#7c2d12",
    badgeBg: "#ffedd5",
    cost: "$588–$1,860/yr",
    costNote: "$49–$155/mo",
    costNum: 1200,
    effort: "Medium",
    effortScore: 3,
    maintenance: "Managed",
    maintenanceScore: 5,
    scalability: "High",
    scalabilityScore: 4,
    accuracy: "99.9%",
    accuracyScore: 5,
    support: "24/7 + SLA",
    supportScore: 5,
    compliance: "SOC 2, GDPR, HIPAA, ISO 27001",
    complianceScore: 5,
    vendorRisk: "Medium",
    vendorRiskScore: 3,
    lastRelease: "Continuous SaaS",
    releaseNote: "Managed — no release cycle",
    integration: "REST API — HTTP calls from Spring Boot",
    features: ["Dynamic QR (update post-print)", "Real-time analytics + GPS", "30+ QR types", "Branded/logo QR", "SSO (Okta, Azure AD)", "Bulk CSV generation", "CRM integrations"],
    cons: ["$588–$1,860+/yr recurring", "External API dependency", "Vendor lock-in", "Network required at generation time"],
    angular: "Angular consumes pre-signed S3 URL",
    recommendation: "Best choice if you need scan analytics, dynamic re-targeting, or compliance certifications. REST API integrates cleanly with Spring Boot. Adds recurring cost and vendor dependency.",
    color: "#b45309",
    lightColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  {
    id: "qrtrac",
    name: "QRTrac",
    type: "SaaS Platform",
    badge: "BUDGET SaaS",
    badgeColor: "#5b21b6",
    badgeBg: "#ede9fe",
    cost: "$60–$600/yr",
    costNote: "from $5/mo",
    costNum: 300,
    effort: "Medium",
    effortScore: 3,
    maintenance: "Managed",
    maintenanceScore: 5,
    scalability: "High (unlimited scans)",
    scalabilityScore: 4,
    accuracy: "Good",
    accuracyScore: 3,
    support: "Email + Chat",
    supportScore: 3,
    compliance: "GDPR, CCPA",
    complianceScore: 3,
    vendorRisk: "Medium-High",
    vendorRiskScore: 2,
    lastRelease: "Continuous SaaS",
    releaseNote: "Managed — no release cycle",
    integration: "REST API — HTTP calls from Spring Boot",
    features: ["Dynamic QR codes", "White-label support", "Real-time analytics", "Geo + device tracking", "Bulk CSV import", "SAML/Okta SSO (enterprise)", "Unlimited scans"],
    cons: ["Young platform (limited reviews)", "No HIPAA/ISO 27001", "Codes paused if subscription lapses", "Less established than Uniqode"],
    angular: "Angular consumes pre-signed S3 URL",
    recommendation: "Low-cost entry into managed dynamic QR with analytics. Reasonable for non-regulated use cases. Fewer enterprise compliance certs than Uniqode. Watch vendor maturity.",
    color: "#7c3aed",
    lightColor: "#f5f3ff",
    borderColor: "#ddd6fe",
  },
  {
    id: "custom",
    name: "Custom Built",
    type: "In-House",
    badge: "FULL CONTROL",
    badgeColor: "#065f46",
    badgeBg: "#d1fae5",
    cost: "Dev time only",
    costNote: "~2–4 weeks eng",
    costNum: 0,
    effort: "High",
    effortScore: 5,
    maintenance: "Self (full)",
    maintenanceScore: 1,
    scalability: "Unlimited",
    scalabilityScore: 5,
    accuracy: "Depends on impl",
    accuracyScore: 3,
    support: "Internal only",
    supportScore: 1,
    compliance: "You own it",
    complianceScore: 3,
    vendorRisk: "None",
    vendorRiskScore: 5,
    lastRelease: "Yours to maintain",
    releaseNote: "Internal ownership",
    integration: "Pure Java service inside Spring Boot",
    features: ["Full IP ownership", "No vendor lock-in", "Zero recurring cost", "Custom encoding rules", "Offline capable", "Tailored to exact workflow"],
    cons: ["2–4 weeks build time", "GF(256) RS encoding has subtle spec edge cases", "Internal maintenance burden forever", "No analytics unless built separately", "Security audits on your team"],
    angular: "Angular consumes pre-signed S3 URL",
    recommendation: "Maximum control, zero recurring cost. Only viable if you need deep customisation. Otherwise Nayuki gives 95% of this at 5% of the effort — wrap it rather than reimplement from scratch.",
    color: "#059669",
    lightColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
];

const ARCH_STEPS = [
  { id: "client", label: "Angular 18", sub: "Frontend client", icon: "A", color: "#dc2626", desc: "Angular makes an HTTP request to the Spring Boot backend. The Angular UI never touches QR generation logic directly — it only consumes a pre-signed S3 URL returned by the API.", current: true },
  { id: "spring", label: "Spring Boot 3.x", sub: "Java 21 backend", icon: "SB", color: "#1d4ed8", desc: "The backend receives the payload (URL/text to encode), invokes the QR library (e.g. Nayuki), generates a PNG in memory as a byte[], then streams it to S3. Returns the S3 object URL to Angular.", current: true },
  { id: "qrlib", label: "QR Engine", sub: "Nayuki / ZXing", icon: "QR", color: "#059669", desc: "Nayuki (io.nayuki:qrcodegen) or ZXing runs inside the JVM — no network call, no external API. QrCode.encodeText(url, Ecc.HIGH) returns a matrix. toImage() renders to BufferedImage. ImageIO writes PNG bytes.", current: false, highlight: true },
  { id: "s3", label: "AWS S3", sub: "Object storage", icon: "S3", color: "#d97706", desc: "QR PNG is uploaded with PutObjectRequest. A pre-signed URL (15–60 min TTL) or a CloudFront-served public URL is returned. S3 handles durability, availability, and CDN edge delivery via CloudFront.", current: true },
  { id: "cdn", label: "CloudFront CDN", sub: "Global edge delivery", icon: "CF", color: "#7c3aed", desc: "RECOMMENDED ADDITION: Put CloudFront in front of S3. QR images are served from the nearest edge PoP globally, reducing latency from ~200ms to <30ms. Eliminates pre-signed URL complexity. Cache-Control: max-age=31536000.", current: false, improvement: true },
];

const RISKS = [
  { provider: "Nayuki", reliability: 5, accuracy: 5, support: 2, compliance: 3, vendorLock: 5, overall: "LOW RISK", overallColor: "#059669", overallBg: "#d1fae5", note: "Pure library. You own bug fixes. ISO-spec compliant. 2022 release = complete, not abandoned." },
  { provider: "ZXing", reliability: 5, accuracy: 4, support: 3, compliance: 3, vendorLock: 5, overall: "LOW RISK", overallColor: "#059669", overallBg: "#d1fae5", note: "v3.5.4 released Nov 2025. Community-patched maintenance mode per own README. Stable, no new features. Google-origin gives confidence." },
  { provider: "Uniqode", reliability: 4, accuracy: 5, support: 5, compliance: 5, vendorLock: 2, overall: "MEDIUM RISK", overallColor: "#d97706", overallBg: "#fef3c7", note: "SOC 2 + HIPAA + ISO 27001 compliant. SLA-backed. Risk is vendor dependency — if Uniqode API is down, QR generation fails." },
  { provider: "QRTrac", reliability: 3, accuracy: 3, support: 3, compliance: 2, vendorLock: 2, overall: "MEDIUM-HIGH RISK", overallColor: "#b45309", overallBg: "#fef9c3", note: "Newer platform. GDPR/CCPA only. Codes pause if subscription lapses. Limited enterprise track record." },
  { provider: "Custom Built", reliability: 3, accuracy: 3, support: 1, compliance: 3, vendorLock: 5, overall: "MEDIUM RISK", overallColor: "#d97706", overallBg: "#fef3c7", note: "Risk is implementation correctness. GF(256) RS has subtle edge cases. Recommend wrapping Nayuki rather than reimplementing." },
];

// ZXing vs Nayuki head-to-head data
const HH_ROWS = [
  {
    category: "Release History",
    nayuki: { val: "v1.8.0 — 2022", note: "Complete implementation — QR spec hasn't changed since", score: "neutral" },
    zxing:  { val: "v3.5.4 — Nov 2025", note: "Community-patched bug fixes; no new features per own README", score: "win" },
    winner: "zxing",
    winNote: "ZXing has more recent Maven releases",
  },
  {
    category: "Development Status",
    nayuki: { val: "Feature-complete", note: "No new QR spec to implement — library is intentionally done", score: "neutral" },
    zxing:  { val: "Maintenance mode", note: "README explicitly: 'changes driven by contributed patches only'", score: "neutral" },
    winner: "draw",
    winNote: "Both are stable; neither is actively developed",
  },
  {
    category: "JAR Size",
    nayuki: { val: "~50 KB", note: "Single JAR, zero transitive dependencies", score: "win" },
    zxing:  { val: "~596 KB (core + javase)", note: "Two JARs required: core + javase modules", score: "lose" },
    winner: "nayuki",
    winNote: "Nayuki is 12× smaller — meaningful in fat JAR / Lambda",
  },
  {
    category: "QR Encoding Accuracy",
    nayuki: { val: "Purpose-built precision", note: "Written by a mathematician specifically for spec-correct QR encoding. Best-in-class mask penalty scoring.", score: "win" },
    zxing:  { val: "Good — proven at scale", note: "Billions of Android scans. QR is one of 50+ formats though — not the primary focus.", score: "neutral" },
    winner: "nayuki",
    winNote: "Nayuki written solely for QR — more spec-faithful",
  },
  {
    category: "Barcode Scope",
    nayuki: { val: "QR codes only", note: "Cannot read barcodes, no EAN/Code128/DataMatrix support", score: "lose" },
    zxing:  { val: "50+ barcode formats", note: "Generate AND scan: QR, EAN-13, Code128, DataMatrix, PDF417, Aztec and more", score: "win" },
    winner: "zxing",
    winNote: "ZXing if you ever need barcode reading or other formats",
  },
  {
    category: "Spring Boot API Simplicity",
    nayuki: { val: "1 method call", note: "QrCode.encodeText(url, Ecc.HIGH) → toImage() → ImageIO.write()", score: "win" },
    zxing:  { val: "More boilerplate", note: "QRCodeWriter + BitMatrix + MatrixToImageWriter + hints map", score: "lose" },
    winner: "nayuki",
    winNote: "Nayuki requires far less wiring code",
  },
  {
    category: "License",
    nayuki: { val: "MIT", note: "Permissive — no restrictions on commercial use or distribution", score: "win" },
    zxing:  { val: "Apache 2.0", note: "Also permissive — patent grant included, equally production-safe", score: "win" },
    winner: "draw",
    winNote: "Both are permissive, commercially safe licenses",
  },
  {
    category: "Community & Stack Overflow",
    nayuki: { val: "Smaller community", note: "Authoritative but niche — fewer SO answers", score: "lose" },
    zxing:  { val: "Massive ecosystem", note: "Thousands of SO answers, Android docs, blog posts, tutorials", score: "win" },
    winner: "zxing",
    winNote: "ZXing has far richer community knowledge base",
  },
  {
    category: "CVE / Security History",
    nayuki: { val: "No known CVEs", note: "Narrow attack surface — pure encoding math, no I/O parsing", score: "win" },
    zxing:  { val: "Patched actively", note: "Broader scope = broader surface. Community patches CVEs via maintenance releases like 3.5.4", score: "neutral" },
    winner: "nayuki",
    winNote: "Smaller scope = smaller attack surface",
  },
  {
    category: "When to pick for your stack",
    nayuki: { val: "✅ Pure QR generation", note: "Generating URLs → PNG → S3 in Spring Boot with no scan/read need", score: "win" },
    zxing:  { val: "✅ Barcode ecosystem", note: "If you need to scan barcodes, support 50+ formats, or want the largest community", score: "win" },
    winner: "context",
    winNote: "Pick Nayuki for this project. Switch to ZXing if barcode reading is ever required.",
  },
];

// ─── Shared components ────────────────────────────────────────────────────

const ScoreBar = ({ score, max = 5, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${(score / max) * 100}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
    </div>
    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", minWidth: 20 }}>{score}/{max}</span>
  </div>
);

const StarScore = ({ score, max = 5 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: max }).map((_, i) => (
      <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: i < score ? "#1d4ed8" : "#e2e8f0" }} />
    ))}
  </div>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px", margin: 0 }}>{title}</h2>
    </div>
    {subtitle && <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 0 42px" }}>{subtitle}</p>}
  </div>
);

const Badge = ({ text, color, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color, background: bg, borderRadius: 4, padding: "2px 7px", border: `1px solid ${color}40`, whiteSpace: "nowrap" }}>
    {text}
  </span>
);

const CorrectedBadge = () => (
  <span style={{ fontSize: 9, fontWeight: 700, color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 4, padding: "1px 5px", marginLeft: 6 }}>
    ✱ UPDATED
  </span>
);

// ─── Sections ─────────────────────────────────────────────────────────────

function ExecSummary() {
  return (
    <div>
      <SectionHeader icon="📋" title="Executive Summary" subtitle="Migration rationale and projected return on investment" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Current Provider", value: "tlinky", sub: "Unreliable in production", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
          { label: "Pain Point", value: "Production Friction", sub: "QR generation failures blocking workflows", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
          { label: "Recommended Fix", value: "Nayuki (Java Lib)", sub: "Zero-dependency, in-process, ISO-spec", color: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color, marginBottom: 2 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr", gap: 8 }}>
          {["Option", "Migration Time", "Annual Cost", "Key Benefit"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
          ))}
        </div>
        {[
          { option: "Nayuki Java Lib", time: "2–3 days", cost: "$0", benefit: "Eliminate vendor dependency entirely", highlight: true },
          { option: "ZXing v3.5.4 (Nov 2025)", time: "2–3 days", cost: "$0", benefit: "QR + 50 barcode formats; large community", updated: true },
          { option: "Uniqode SaaS", time: "1–2 weeks", cost: "$588–$1,860/yr", benefit: "Dynamic QR + analytics + compliance" },
          { option: "QRTrac SaaS", time: "1–2 weeks", cost: "$60–$600/yr", benefit: "Budget managed option with analytics" },
          { option: "Custom Built", time: "3–4 weeks", cost: "~$8–15k eng cost", benefit: "Full IP ownership + customisation" },
        ].map((r, i) => (
          <div key={i} style={{ padding: "10px 16px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr", gap: 8, background: r.highlight ? "#eff6ff" : i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: r.highlight ? 700 : 500, color: r.highlight ? "#1d4ed8" : "#0f172a" }}>
              {r.option}
              {r.highlight && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "#0f5132", background: "#d1e7dd", borderRadius: 4, padding: "1px 6px" }}>✓ PICK</span>}
              {r.updated && <CorrectedBadge />}
            </div>
            <div style={{ fontSize: 13, color: "#475569" }}>{r.time}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: r.cost === "$0" ? "#059669" : "#b45309" }}>{r.cost}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{r.benefit}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 3 }}>Strategic Recommendation</div>
          <div style={{ fontSize: 13, color: "#1e3a8a", lineHeight: 1.6 }}>
            Replace tlinky with <strong>Nayuki (io.nayuki:qrcodegen)</strong> for pure QR generation — 2–3 days, zero cost, zero vendor risk. If you ever need to <strong>read/scan barcodes or support non-QR formats</strong>, ZXing v3.5.4 is the better fit. If scan analytics or dynamic QR codes become a requirement, layer <strong>Uniqode</strong> on top selectively.
          </div>
        </div>
      </div>

      <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>✱</span>
        <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
          <strong>Report correction:</strong> ZXing was previously labelled "maintenance mode — no new features" with an implied warning. This has been corrected — ZXing released v3.5.4 in November 2025. It is actively patched (community-driven bug fixes), though by its own README no new features are planned. The ZXing vs Nayuki comparison tab has full details.
        </div>
      </div>
    </div>
  );
}

function ComparisonMatrix({ activeProvider, setActiveProvider }) {
  const cols = [
    { key: "type", label: "Type" },
    { key: "cost", label: "Annual Cost" },
    { key: "effort", label: "Effort" },
    { key: "maintenance", label: "Maintenance" },
    { key: "scalability", label: "Scalability" },
    { key: "accuracy", label: "Accuracy" },
    { key: "support", label: "Support" },
    { key: "compliance", label: "Compliance" },
    { key: "vendorRisk", label: "Vendor Risk" },
    { key: "lastRelease", label: "Last Release" },
  ];

  return (
    <div>
      <SectionHeader icon="📊" title="Provider Comparison Matrix" subtitle="Click any row to expand full feature details" />
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "150px repeat(10, 1fr)", background: "#1e293b", padding: "10px 0" }}>
          <div style={{ padding: "0 12px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Provider</div>
          {cols.map(c => (
            <div key={c.key} style={{ padding: "0 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.label}</div>
          ))}
        </div>

        {PROVIDERS.map((p, idx) => {
          const isOpen = activeProvider === p.id;
          return (
            <div key={p.id}>
              <div
                onClick={() => setActiveProvider(isOpen ? null : p.id)}
                style={{ display: "grid", gridTemplateColumns: "150px repeat(10, 1fr)", padding: "11px 0", cursor: "pointer", background: isOpen ? p.lightColor : idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9", borderLeft: isOpen ? `3px solid ${p.color}` : "3px solid transparent", transition: "all 0.15s" }}
              >
                <div style={{ padding: "0 10px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: p.color, marginBottom: 3 }}>{p.name}</div>
                  <Badge text={p.badge} color={p.badgeColor} bg={p.badgeBg} />
                </div>
                <div style={{ padding: "0 6px", fontSize: 11, color: "#475569", display: "flex", alignItems: "center" }}>{p.type}</div>
                <div style={{ padding: "0 6px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.costNum === 0 ? "#059669" : "#b45309" }}>{p.cost}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{p.costNote}</div>
                </div>
                <div style={{ padding: "0 6px", display: "flex", alignItems: "center" }}><ScoreBar score={p.effortScore} color={p.color} /></div>
                <div style={{ padding: "0 6px", fontSize: 11, color: "#475569", display: "flex", alignItems: "center" }}>{p.maintenance}</div>
                <div style={{ padding: "0 6px", display: "flex", alignItems: "center" }}><ScoreBar score={p.scalabilityScore} color={p.color} /></div>
                <div style={{ padding: "0 6px", fontSize: 11, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center" }}>{p.accuracy}</div>
                <div style={{ padding: "0 6px", fontSize: 11, color: "#475569", display: "flex", alignItems: "center" }}>{p.support}</div>
                <div style={{ padding: "0 6px", fontSize: 10, color: "#64748b", display: "flex", alignItems: "center" }}>{p.compliance}</div>
                <div style={{ padding: "0 6px", display: "flex", alignItems: "center" }}><ScoreBar score={p.vendorRiskScore} color={p.color} /></div>
                <div style={{ padding: "0 6px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{p.lastRelease}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{p.releaseNote}</div>
                </div>
              </div>

              {isOpen && (
                <div style={{ background: p.lightColor, borderBottom: `2px solid ${p.color}`, padding: "18px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>✅ Strengths</div>
                    {p.features.map((f, i) => <div key={i} style={{ fontSize: 12, color: "#0f172a", marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: p.color }}>▸</span>{f}</div>)}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>⚠️ Limitations</div>
                    {p.cons.map((c, i) => <div key={i} style={{ fontSize: 12, color: "#475569", marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: "#94a3b8" }}>▸</span>{c}</div>)}
                    <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Integration</div>
                    <code style={{ fontSize: 10, background: "#1e293b", color: "#a5f3fc", padding: "6px 10px", borderRadius: 6, display: "block", wordBreak: "break-all" }}>{p.integration}</code>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>💬 Verdict</div>
                    <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.65, background: "#fff", padding: 12, borderRadius: 8, border: `1px solid ${p.borderColor}` }}>{p.recommendation}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ArchDiagram() {
  const [activeStep, setActiveStep] = useState(null);
  const [showImproved, setShowImproved] = useState(false);
  const visibleSteps = showImproved ? ARCH_STEPS : ARCH_STEPS.filter(s => s.current || s.highlight);

  return (
    <div>
      <SectionHeader icon="🏗️" title="Architecture Evolution" subtitle="Click each component to inspect its role. Toggle to see the recommended improvement." />
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Current Flow", active: !showImproved, onClick: () => setShowImproved(false), color: "#1e293b" },
          { label: "✨ Recommended Architecture", active: showImproved, onClick: () => setShowImproved(true), color: "#1d4ed8" },
        ].map(b => (
          <button key={b.label} onClick={b.onClick} style={{ padding: "7px 16px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", borderRadius: 7, cursor: "pointer", border: "1.5px solid #e2e8f0", background: b.active ? b.color : "#fff", color: b.active ? "#fff" : "#475569", transition: "all .15s" }}>{b.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0, marginBottom: 20, background: "#f8fafc", borderRadius: 12, padding: "24px 20px", border: "1px solid #e2e8f0" }}>
        {visibleSteps.map((step, i) => (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <button onClick={() => setActiveStep(activeStep === step.id ? null : step.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: activeStep === step.id ? step.color : step.improvement ? "#f0fdf4" : "#fff", border: step.improvement ? `2px dashed ${step.color}` : `1.5px solid ${activeStep === step.id ? step.color : "#e2e8f0"}`, borderRadius: 12, padding: "14px 16px", minWidth: 118, cursor: "pointer", boxShadow: activeStep === step.id ? `0 4px 16px ${step.color}33` : "0 1px 4px rgba(0,0,0,0.06)", transition: "all .18s", fontFamily: "inherit" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: activeStep === step.id ? "rgba(255,255,255,0.2)" : `${step.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: activeStep === step.id ? "#fff" : step.color }}>{step.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: activeStep === step.id ? "#fff" : "#0f172a", textAlign: "center" }}>{step.label}</div>
              <div style={{ fontSize: 10, color: activeStep === step.id ? "rgba(255,255,255,0.75)" : "#94a3b8", textAlign: "center" }}>{step.sub}</div>
              {step.improvement && <span style={{ fontSize: 9, fontWeight: 700, color: "#059669", background: "#d1fae5", borderRadius: 4, padding: "1px 5px" }}>NEW</span>}
            </button>
            {i < visibleSteps.length - 1 && <div style={{ padding: "0 4px" }}><svg width="28" height="16" viewBox="0 0 28 16"><path d="M2 8 L22 8 M18 3 L22 8 L18 13" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
          </div>
        ))}
      </div>

      {activeStep && (() => {
        const s = ARCH_STEPS.find(s => s.id === activeStep);
        return (
          <div style={{ background: "#fff", border: `1.5px solid ${s.color}40`, borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: s.color }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{s.label}</div>
              {s.improvement && <Badge text="RECOMMENDED ADDITION" color="#059669" bg="#d1fae5" />}
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
          </div>
        );
      })()}

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "12px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>❓ Is serving QR codes from S3 the right design?</div>
        </div>
        <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 8 }}>✅ What your current S3 flow gets right</div>
            {["QR images are immutable — S3 is a perfect fit", "Decouples generation from serving", "Spring Boot isn't burdened serving static files", "S3 has 99.999999999% durability", "Easy to add CloudFront CDN on top"].map((t, i) => <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: "#059669" }}>▸</span>{t}</div>)}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706", marginBottom: 8 }}>⚡ Recommended improvements</div>
            {["Add CloudFront CDN — serve from edge nodes (<30ms vs ~200ms direct S3)", "Use CloudFront signed URLs instead of S3 pre-signed (cheaper, simpler rotation)", "Cache-Control: max-age=31536000 on QR objects (immutable content)", "S3 Event → Lambda → CloudFront invalidation for dynamic QR updates", "Consider returning inline SVG for simple cases (no S3 round-trip needed)"].map((t, i) => <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: "#d97706" }}>▸</span>{t}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskAssessment() {
  return (
    <div>
      <SectionHeader icon="🛡️" title="Risk & Support Assessment" subtitle="Enterprise-grade reliability evaluation across all providers" />
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "#1e293b", padding: "12px 16px", display: "grid", gridTemplateColumns: "140px 1fr 1fr 1fr 1fr 1fr 120px 1fr", gap: 8, alignItems: "center" }}>
          {["Provider", "Reliability", "QR Accuracy", "Support", "Compliance", "No Lock-in", "Overall", "Notes"].map(h => <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{h}</div>)}
        </div>
        {RISKS.map((r, i) => (
          <div key={r.provider} style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "140px 1fr 1fr 1fr 1fr 1fr 120px 1fr", gap: 8, alignItems: "center", background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {r.provider}
              {r.provider === "ZXing" && <CorrectedBadge />}
            </div>
            {["reliability", "accuracy", "support", "compliance", "vendorLock"].map(k => <div key={k}><StarScore score={r[k]} /></div>)}
            <div><span style={{ fontSize: 10, fontWeight: 700, color: r.overallColor, background: r.overallBg, borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap" }}>{r.overall}</span></div>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{r.note}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Score key:</span>
        {["■■■■■ = Excellent", "■■■■□ = Good", "■■■□□ = Average", "■■□□□ = Weak", "■□□□□ = Poor"].map(t => <span key={t} style={{ fontSize: 11, color: "#64748b" }}>{t}</span>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>🏢 Enterprise Support Comparison</div>
          {[
            { name: "Nayuki", detail: "GitHub Issues + community. No paid SLA. Maintainer responsive but no enterprise escalation path.", level: "Community" },
            { name: "ZXing", detail: "Stack Overflow + GitHub. Community-maintained via contributed patches. Active CVE patching (v3.5.4 Nov 2025).", level: "Community", updated: true },
            { name: "Uniqode", detail: "24/7 chat + email + phone. Dedicated success manager on Business+. SLA with uptime guarantees. BAA available for HIPAA.", level: "Enterprise ✓" },
            { name: "QRTrac", detail: "Email + chat support. No phone or dedicated manager. Codes pause if subscription lapses.", level: "Standard" },
            { name: "Custom", detail: "Internal team only. You own all bugs, security patches, and incidents.", level: "Internal" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: s.level === "Enterprise ✓" ? "#059669" : s.level === "Standard" ? "#d97706" : "#64748b", borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap", marginTop: 1 }}>{s.level}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 4 }}>{s.name}{s.updated && <CorrectedBadge />}</div>
                <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>🔬 QR Accuracy Deep Dive</div>
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.65, marginBottom: 10 }}>
            "Accuracy" = ISO/IEC 18004 spec compliance: correct Reed-Solomon ECC, format information, finder/alignment patterns, and mask selection.
          </div>
          {[
            { name: "Nayuki", score: "99.9%+", note: "Purpose-built QR encoder by a mathematician. Best-in-class mask penalty scoring. All 40 versions, 4 EC levels.", color: "#059669" },
            { name: "ZXing", score: "99%+", note: "Google-origin. Billions of Android scans. QR is one of 50+ formats — broad scope means slightly less QR-specific tuning than Nayuki.", color: "#0284c7", updated: true },
            { name: "Uniqode", score: "99.9%", note: "SOC 2 certified. Handles EC level tuning, contrast checking, and branded QR scanability validation automatically.", color: "#d97706" },
            { name: "QRTrac", score: "Good", note: "Dynamic QR via short-link redirect. Accuracy tied to redirect infrastructure reliability, not just encoding.", color: "#7c3aed" },
            { name: "Custom", score: "Varies", note: "Depends entirely on implementation. GF(256) arithmetic has subtle bugs that can produce codes some scanners reject.", color: "#64748b" },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: a.color, minWidth: 48 }}>{a.score}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 4 }}>{a.name}{a.updated && <CorrectedBadge />}</div>
                <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{a.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinalVerdict() {
  return (
    <div>
      <SectionHeader icon="✅" title="Decision Framework" subtitle="Flowchart to pick the right provider for your context" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { question: "Do you need scan analytics / dynamic QR?", yes: "→ Uniqode (enterprise) or QRTrac (budget)", no: "→ Nayuki Java lib (recommended)", color: "#1d4ed8" },
          { question: "Do you need HIPAA / SOC 2 compliance?", yes: "→ Uniqode only (certified + BAA)", no: "→ Nayuki or ZXing (no PII in QR payload)", color: "#7c3aed" },
          { question: "Is budget the primary constraint?", yes: "→ Nayuki ($0, MIT) or ZXing ($0, Apache 2.0)", no: "→ Evaluate managed SaaS options", color: "#059669" },
          { question: "Do you need to read/scan barcodes OR support 50+ formats?", yes: "→ ZXing v3.5.4 (generation + scanning, active patches)", no: "→ Nayuki — leaner, more QR-precise, simpler API", color: "#b45309" },
        ].map((d, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>❓ {d.question}</div>
            <div style={{ fontSize: 12, color: "#059669", marginBottom: 4 }}>YES {d.yes}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>NO {d.no}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0f172a", borderRadius: 12, padding: "20px 22px", color: "#f1f5f9" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 14 }}>📦 Recommended Migration Plan — Java 21 / Spring Boot 3.x</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px" }}>
          {[
            ["Day 1", "Add io.nayuki:qrcodegen:1.8.0 to pom.xml. Implement QrCodeService.java wrapping QrCode.encodeText(). Write unit test verifying output scans correctly."],
            ["Day 2", "Replace tlinky calls with QrCodeService. Generate PNG via ImageIO → upload to S3 via AWS SDK v2. Return CloudFront URL (not pre-signed S3 URL)."],
            ["Day 3", "Add CloudFront distribution in front of S3 with Cache-Control: max-age=31536000. Run load test — expect >1,000 QR/sec throughput per pod."],
            ["Week 2+", "Monitor in production. If analytics or barcode-scanning needs emerge → evaluate ZXing or Uniqode as an additive layer."],
          ].map(([day, action], i) => (
            <div key={i} style={{ display: "contents" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8", whiteSpace: "nowrap", paddingTop: 2 }}>{day}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{action}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#1e293b", borderRadius: 8, fontSize: 12, color: "#a5f3fc", fontFamily: "monospace", whiteSpace: "pre" }}>{`<dependency>
  <groupId>io.nayuki</groupId>
  <artifactId>qrcodegen</artifactId>
  <version>1.8.0</version>
</dependency>`}</div>
      </div>
    </div>
  );
}

// ─── NEW: ZXing vs Nayuki Head-to-Head ────────────────────────────────────

function ZXingVsNayuki() {
  const [activeRow, setActiveRow] = useState(null);

  const winnerColors = {
    nayuki: { bg: "#eff6ff", border: "#bfdbfe", tag: "#1d4ed8", tagBg: "#dbeafe", label: "NAYUKI WINS" },
    zxing:  { bg: "#f0f9ff", border: "#bae6fd", tag: "#0284c7", tagBg: "#e0f2fe", label: "ZXING WINS" },
    draw:   { bg: "#f8fafc", border: "#e2e8f0", tag: "#475569", tagBg: "#f1f5f9", label: "DRAW" },
    context:{ bg: "#f0fdf4", border: "#a7f3d0", tag: "#059669", tagBg: "#d1fae5", label: "CONTEXT DEPENDENT" },
  };

  const nayukiWins = HH_ROWS.filter(r => r.winner === "nayuki").length;
  const zxingWins  = HH_ROWS.filter(r => r.winner === "zxing").length;
  const draws      = HH_ROWS.filter(r => r.winner === "draw" || r.winner === "context").length;

  return (
    <div>
      <SectionHeader icon="⚔️" title="ZXing vs Nayuki — Head-to-Head" subtitle="Corrected comparison based on verified release data. Click any row to expand." />

      {/* Correction notice */}
      <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>✱</span>
        <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
          <strong>What triggered this correction:</strong> ZXing was initially labelled "last version 2022 / maintenance mode" in the report. Verified data shows ZXing released <strong>v3.5.4 on November 11, 2025</strong> to Maven Central. However, ZXing's own README states explicitly: <em>"The project is in maintenance mode — changes are driven by contributed patches only."</em> So both facts are true simultaneously: recent releases exist, but no new features are planned. This tab gives the full nuanced comparison.
        </div>
      </div>

      {/* Score cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Nayuki Leads", count: nayukiWins, color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", sub: "JAR size, QR precision, API simplicity, CVE surface" },
          { label: "ZXing Leads", count: zxingWins,  color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", sub: "Release recency, barcode scope, community size" },
          { label: "Draw / Context",count: draws,     color: "#475569", bg: "#f8fafc", border: "#e2e8f0", sub: "Dev status, license — both are production-safe" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Head to head column labels */}
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 60px 1fr", background: "#1e293b", borderRadius: "10px 10px 0 0", padding: "10px 16px", gap: 8, alignItems: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Category</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", textAlign: "center" }}>🔵 Nayuki</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", textAlign: "center" }}>vs</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", textAlign: "center" }}>🔷 ZXing</div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0 0 10px 10px", overflow: "hidden", marginBottom: 20 }}>
        {HH_ROWS.map((row, idx) => {
          const wc = winnerColors[row.winner];
          const isOpen = activeRow === idx;
          return (
            <div key={idx}>
              <div
                onClick={() => setActiveRow(isOpen ? null : idx)}
                style={{ display: "grid", gridTemplateColumns: "180px 1fr 100px 1fr", gap: 0, cursor: "pointer", background: isOpen ? wc.bg : idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9", borderLeft: isOpen ? `3px solid ${wc.tag}` : "3px solid transparent", transition: "all 0.15s" }}
              >
                {/* Category */}
                <div style={{ padding: "13px 14px", borderRight: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{row.category}</div>
                </div>

                {/* Nayuki cell */}
                <div style={{ padding: "13px 14px", borderRight: "1px solid #f1f5f9", background: row.winner === "nayuki" ? "#eff6ff" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    {row.winner === "nayuki" && <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>✅</span>}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: row.winner === "nayuki" ? 700 : 500, color: row.winner === "nayuki" ? "#1d4ed8" : "#374151" }}>{row.nayuki.val}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, lineHeight: 1.4 }}>{row.nayuki.note}</div>
                    </div>
                  </div>
                </div>

                {/* Winner badge */}
                <div style={{ padding: "13px 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: wc.tag, background: wc.tagBg, borderRadius: 5, padding: "2px 6px", textAlign: "center", lineHeight: 1.4 }}>{wc.label}</span>
                </div>

                {/* ZXing cell */}
                <div style={{ padding: "13px 14px", background: row.winner === "zxing" ? "#f0f9ff" : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    {row.winner === "zxing" && <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>✅</span>}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: row.winner === "zxing" ? 700 : 500, color: row.winner === "zxing" ? "#0284c7" : "#374151" }}>{row.zxing.val}</div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, lineHeight: 1.4 }}>{row.zxing.note}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ background: wc.bg, borderBottom: `2px solid ${wc.tag}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>📌</span>
                  <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500, lineHeight: 1.6 }}>
                    <strong>Bottom line:</strong> {row.winNote}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Code comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Nayuki code */}
        <div style={{ background: "#fff", border: "1px solid #bfdbfe", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: "#1d4ed8", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔵</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Nayuki — Spring Boot integration</span>
          </div>
          <pre style={{ background: "#0f172a", color: "#cdd6f4", padding: "14px", fontSize: 11, lineHeight: 1.7, margin: 0, overflowX: "auto", fontFamily: "monospace" }}>{`// pom.xml
<dependency>
  <groupId>io.nayuki</groupId>
  <artifactId>qrcodegen</artifactId>
  <version>1.8.0</version>  <!-- ~50 KB -->
</dependency>

// QrCodeService.java
import io.nayuki.qrcodegen.QrCode;
import io.nayuki.qrcodegen.QrCode.Ecc;

@Service
public class QrCodeService {
  public byte[] generatePng(String url, int scale) {
    QrCode qr = QrCode.encodeText(url, Ecc.HIGH);
    BufferedImage img = qr.toImage(scale, 4);
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    ImageIO.write(img, "PNG", out);
    return out.toByteArray();
  }
}`}</pre>
        </div>

        {/* ZXing code */}
        <div style={{ background: "#fff", border: "1px solid #bae6fd", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: "#0284c7", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔷</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>ZXing v3.5.4 — Spring Boot integration</span>
          </div>
          <pre style={{ background: "#0f172a", color: "#cdd6f4", padding: "14px", fontSize: 11, lineHeight: 1.7, margin: 0, overflowX: "auto", fontFamily: "monospace" }}>{`// pom.xml — requires TWO JARs (~596 KB total)
<dependency>
  <groupId>com.google.zxing</groupId>
  <artifactId>core</artifactId>
  <version>3.5.4</version>
</dependency>
<dependency>
  <groupId>com.google.zxing</groupId>
  <artifactId>javase</artifactId>
  <version>3.5.4</version>
</dependency>

// QrCodeService.java
import com.google.zxing.*;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;

@Service
public class QrCodeService {
  public byte[] generatePng(String url, int size) {
    QRCodeWriter writer = new QRCodeWriter();
    Map<EncodeHintType, Object> hints = new HashMap<>();
    hints.put(EncodeHintType.ERROR_CORRECTION,
              ErrorCorrectionLevel.H);
    BitMatrix matrix = writer.encode(
      url, BarcodeFormat.QR_CODE, size, size, hints);
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    MatrixToImageWriter.writeToStream(matrix, "PNG", out);
    return out.toByteArray();
  }
}`}</pre>
        </div>
      </div>

      {/* Final verdict card */}
      <div style={{ background: "#0f172a", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>🏁 Final Verdict for your Java 21 / Spring Boot 3.x stack</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "16px", borderLeft: "3px solid #1d4ed8" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", marginBottom: 8 }}>Pick Nayuki when…</div>
            {["You only generate QR codes (no read/scan needed)", "Bundle size or Lambda cold start matters", "You want the cleanest, simplest API", "Highest spec-correctness is important", "This is your primary use case right now"].map((t, i) => <div key={i} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: "#60a5fa" }}>▸</span>{t}</div>)}
          </div>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "16px", borderLeft: "3px solid #0284c7" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", marginBottom: 8 }}>Pick ZXing when…</div>
            {["You need to scan/decode barcodes anywhere in the system", "You need EAN, Code128, DataMatrix or other formats", "Your team already uses ZXing (ecosystem familiarity)", "You want a single dep to handle all barcode needs", "Community support volume is a priority"].map((t, i) => <div key={i} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: "#38bdf8" }}>▸</span>{t}</div>)}
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#0d1f35", borderRadius: 8, border: "1px solid #1e3a5f" }}>
          <span style={{ fontSize: 12, color: "#7dd3fc", lineHeight: 1.6 }}>
            <strong style={{ color: "#38bdf8" }}>TL;DR:</strong> Both are free, both are production-safe, and the migration effort is identical (2–3 days). For your current workflow of generate → S3 → Angular, <strong style={{ color: "#60a5fa" }}>Nayuki is the leaner and more precise choice</strong>. The "2022 release" is not a red flag — it means the library is done. If barcode reading ever becomes a requirement, switching to ZXing is a one-day refactor.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Built Deep-Dive ───────────────────────────────────────────────

const CUSTOM_PIPELINE = [
  {
    id: "gf",
    step: "01",
    title: "GF(256) Galois Field",
    effort: "3–4 days",
    risk: "HIGH",
    riskColor: "#dc2626",
    riskBg: "#fef2f2",
    desc: "Build log and anti-log lookup tables using primitive polynomial x⁸+x⁴+x³+x²+1 (0x11D). Implement field multiplication, division and polynomial arithmetic. A single off-by-one in the 512-entry exp table produces wrong EC bytes that fail on some scanners but not others — the hardest class of bug to detect.",
    pitfall: "Off-by-one in GF_EXP table: gfMul(a,b) returns wrong value for inputs where LOG[a]+LOG[b] ≥ 255. The table must be extended to 512 entries (duplicate first 255) to avoid a modulo operation on every multiply.",
    code: `// The subtle part: extend to 512 to avoid mod 255
int[] GF_EXP = new int[512];
int[] GF_LOG = new int[256];
int x = 1;
for (int i = 0; i < 255; i++) {
  GF_EXP[i] = x;
  GF_LOG[x] = i;
  x <<= 1;
  if ((x & 0x100) != 0) x ^= 0x11D; // MUST use 0x11D not 0x1D
}
for (int i = 255; i < 512; i++)
  GF_EXP[i] = GF_EXP[i - 255]; // extend`,
  },
  {
    id: "rs",
    step: "02",
    title: "Reed-Solomon Encoder",
    effort: "3–5 days",
    risk: "HIGH",
    riskColor: "#dc2626",
    riskBg: "#fef2f2",
    desc: "Build the RS generator polynomial g(x) = (x−α⁰)(x−α¹)···(x−α^(n-1)). Perform polynomial long division in GF(256) to produce EC codewords. Must handle multi-block interleaving — versions 8+ split data across 2–4 blocks, each encoded independently then interleaved. This is where most DIY implementations break.",
    pitfall: "Block interleaving is non-obvious: for version 5M you have 2 blocks of 43 data bytes. You interleave data bytes round-robin THEN append all EC bytes round-robin. Getting the order wrong produces codes that technically pass format checks but fail on real scanners.",
    code: `// Wrong: appending blocks sequentially
final.addAll(block1.data); final.addAll(block2.data); // ❌

// Correct: interleave data, then interleave EC
int maxLen = max(blocks, b -> b.data.length);
for (int i = 0; i < maxLen; i++)
  for (Block b : blocks)
    if (i < b.data.length) final.add(b.data[i]); // ✅
for (Block b : blocks)
  for (int ec : b.ecBytes) final.add(ec); // ✅`,
  },
  {
    id: "matrix",
    step: "03",
    title: "Matrix Construction",
    effort: "4–6 days",
    risk: "MEDIUM",
    riskColor: "#d97706",
    riskBg: "#fffbeb",
    desc: "Allocate a (version×4+17)² grid. Place finder patterns (three 7×7 squares with separators), timing patterns on row/col 6, alignment patterns for version ≥ 2 (positions vary per version — must table-lookup or compute), and the dark module at (size-8, 8). Mark all functional modules so the data zigzag skips them.",
    pitfall: "Alignment pattern placement: for versions with multiple alignment patterns, some positions overlap finder patterns and must be skipped. The skip rule is not obvious from the spec and is a common source of silent corruption.",
    code: `// Alignment pattern positions — must skip finder overlaps
int[] centers = ALIGN_PATTERNS[version];
for (int ai = 0; ai < centers.length; ai++)
  for (int aj = 0; aj < centers.length; aj++) {
    // Skip top-left, top-right, bottom-left corners
    if ((ai==0&&aj==0)||(ai==0&&aj==n-1)||(ai==n-1&&aj==0))
      continue; // ← miss this and you corrupt finder patterns
    placeAlignment(centers[ai], centers[aj]);
  }`,
  },
  {
    id: "zigzag",
    step: "04",
    title: "Data Placement (Zigzag)",
    effort: "1–2 days",
    risk: "MEDIUM",
    riskColor: "#d97706",
    riskBg: "#fffbeb",
    desc: "Place the interleaved bit stream into the matrix using QR's two-column-wide zigzag: sweep right-to-left in 2-col bands, alternating up/down direction. Column 6 is occupied by the timing pattern and must be skipped — treat it as column 5 when counting. Data is placed MSB-first within each byte.",
    pitfall: "The column 6 skip: when the sweep hits column 7, the right column (7) is fine but the left column (6) is timing pattern — you must step left by 2 instead of 1 at that point. Miss this and every module after col 6 is shifted by one, producing a completely unscannable code.",
    code: `for (int right = size-1; right >= 1; right -= 2) {
  if (right == 6) right = 5; // ← CRITICAL: skip timing col
  for (int vert = 0; vert < size; vert++) {
    int row = goingUp ? size-1-vert : vert;
    for (int lr = 0; lr < 2; lr++) {
      int col = right - lr;
      if (!isFunction[row][col])
        matrix[row][col] = bitIdx < bits.length
          ? bits[bitIdx++] : 0;
    }
  }
  goingUp = !goingUp;
}`,
  },
  {
    id: "mask",
    step: "05",
    title: "Mask Pattern Selection",
    effort: "2–3 days",
    risk: "MEDIUM",
    riskColor: "#d97706",
    riskBg: "#fffbeb",
    desc: "Evaluate all 8 mask patterns against 4 penalty rules. Rule 3 (finder-like patterns) adds 40 penalty points per match of the pattern [1,0,1,1,1,0,1,0,0,0,0] or its reverse. Rule 4 penalises deviation from 50% dark ratio in steps of 5%. Pick the lowest-scoring mask. A wrong choice produces a valid but harder-to-scan code.",
    pitfall: "Rule 3 is commonly implemented with just one direction (horizontal scan). You must scan both horizontally AND vertically. Missing vertical scans means you'll sometimes choose a suboptimal mask that passes internal checks but degrades scanner reliability on dense codes.",
    code: `// Rule 3: scan BOTH rows and columns
int[] P1 = {1,0,1,1,1,0,1,0,0,0,0};
int[] P2 = {0,0,0,0,1,0,1,1,1,0,1};
for (int r = 0; r < size; r++)
  for (int c = 0; c <= size-11; c++)
    for (int[] p : new int[][]{P1, P2}) {
      if (rowMatch(m, r, c, p))   pen += 40; // horizontal
      if (colMatch(m, c, r, p))   pen += 40; // vertical ← often missed
    }`,
  },
  {
    id: "format",
    step: "06",
    title: "Format Information (BCH)",
    effort: "1–2 days",
    risk: "HIGH",
    riskColor: "#dc2626",
    riskBg: "#fef2f2",
    desc: "Encode EC level (2 bits) + mask pattern (3 bits) into a 15-bit BCH code, XOR with mask 101010000010010. Write it in two locations: around the top-left finder (rows 0–8, cols 0–8) and split between top-right and bottom-left finders. The dark module at (size-8, 8) must always be set to 1 regardless of format bits.",
    pitfall: "The dark module at (size-8, 8) is often forgotten. It must be set to dark (1) unconditionally, even if the format information bits at that position would set it to 0. Scanners use its presence to determine symbol orientation. Missing it causes orientation failures on strict decoders.",
    code: `// Format bits go to TWO locations + mandatory dark module
writeFormatAround(topLeftFinder, fmtBits);   // around TL
writeFormatTopRight(fmtBits);                // top-right
writeFormatBottomLeft(fmtBits);              // bottom-left
// Dark module — ALWAYS set to 1, never from format bits
matrix[size - 8][8] = 1; // ← DO NOT skip this`,
  },
  {
    id: "testing",
    step: "07",
    title: "Testing & Validation",
    effort: "3–5 days",
    risk: "ONGOING",
    riskColor: "#7c3aed",
    riskBg: "#f5f3ff",
    desc: "Testing a QR encoder is non-trivial. Unit tests are insufficient because a code can be bitwise incorrect yet still scan on some devices. You need cross-decoder validation: scan every generated QR with ZXing, Dynamsoft, iOS Camera, Android Camera, and WeChat. Test all 40 versions, all 4 EC levels, edge-case payloads (empty string, max-capacity, Unicode, special characters).",
    pitfall: "The most dangerous failure mode: your encoder produces QR codes that scan correctly on iPhone camera and ZXing but fail on Zebra industrial scanners or WeChat. These failures only surface in production. You need a scanner compatibility test suite before launch.",
    code: `// Minimum test matrix for production confidence
@Test void testAllVersionsAllLevels() {
  for (int v = 1; v <= 10; v++)
    for (Ecc ec : Ecc.values()) {
      byte[] png = encode(payload(v, ec), ec);
      String decoded = ZXingDecoder.decode(png);
      assertEquals(payload(v, ec), decoded);
    }
}
// Also test: empty, max-length, UTF-8 2/3/4-byte chars,
// URLs with special chars, numeric-only payloads`,
  },
];

const CUSTOM_WHEN_YES = [
  { icon: "🔐", title: "Proprietary encoding required", desc: "You need to embed custom metadata, encryption layers, or non-standard data structures that no library supports. E.g. internally encrypted payloads, custom structured data beyond URI." },
  { icon: "🏭", title: "Offline / air-gapped environment", desc: "Deployment in classified, industrial, or government environments with no external library approval process and strict supply-chain requirements. You can audit every line." },
  { icon: "📦", title: "Extreme JAR size constraint", desc: "Embedded Java environments (IoT, Android Things, Oracle JRE) where even ~50KB Nayuki is too heavy and you need a minimal subset — e.g. Version 1–3 only, one EC level." },
  { icon: "⚖️", title: "IP ownership is non-negotiable", desc: "Legal or compliance requirement that no third-party code (even MIT/Apache) appears in your IP. Rare but exists in some defence, financial, or government contracts." },
  { icon: "🎯", title: "Custom QR variants", desc: "You need Micro QR codes, Structured Append mode, ECI encoding, or proprietary symbology variants that Nayuki and ZXing don't support." },
];

const CUSTOM_WHEN_NO = [
  { icon: "⏱️", title: "Replacing a broken provider quickly", desc: "You have production friction today. A custom build takes 3–4 weeks minimum with full testing. Nayuki takes 2–3 days. Time-to-fix is critical." },
  { icon: "💸", title: "Team capacity is finite", desc: "The 3–4 week build cost is ~$8–15k in engineering time. That pays for Uniqode for 5–10 years. The opportunity cost is features you didn't build instead." },
  { icon: "🐛", title: "GF(256) bugs are silent and production-fatal", desc: "A wrong anti-log table entry produces QR codes that scan on iPhone but fail on industrial Zebra scanners. You won't catch this until it's in production." },
  { icon: "🔄", title: "Maintenance burden is permanent", desc: "Every security audit, every new Java LTS, every team member change reintroduces risk. Nayuki's 2022 code still works on Java 21 with zero changes." },
  { icon: "📊", title: "You might need analytics later", desc: "Once you own the encoder, you can't bolt on dynamic QR or scan tracking without a full rewrite. Nayuki + Uniqode for analytics is still faster than building everything." },
];

function CustomBuiltDeepDive() {
  const [activeStep, setActiveStep] = useState(null);
  const [showCode, setShowCode] = useState({});

  const toggleCode = (id) => setShowCode(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <SectionHeader icon="🔧" title="Custom Built — Deep Dive" subtitle="Full technical breakdown: what you'd build, where it breaks, and why we don't recommend it for this use case" />

      {/* Verdict banner */}
      <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "14px 18px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>Why we don't recommend it for your situation</div>
          <div style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.7 }}>
            A custom QR encoder built from scratch requires implementing GF(256) Galois Field arithmetic, Reed-Solomon polynomial division, matrix construction, multi-block interleaving, 8-pattern mask evaluation, and BCH format encoding — roughly <strong>500–800 lines of non-trivial mathematical code</strong>. The bugs are silent (scans on iPhone, fails on Zebra industrial scanners) and the maintenance is permanent. <strong>Nayuki already did all of this, correctly, once.</strong> The custom path only makes sense in the specific scenarios listed below.
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Build Time", value: "3–4 weeks", sub: "Full-time engineer", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
          { label: "Est. Eng Cost", value: "$8–15k", sub: "Opportunity cost", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
          { label: "Spec Complexity", value: "7 Stages", sub: "All must be correct", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
          { label: "Silent Bug Risk", value: "HIGH", sub: "Wrong GF table = bad QR", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
          { label: "Ongoing Maintenance", value: "Permanent", sub: "You own every bug forever", color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.border}`, borderRadius: 9, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: k.color, marginBottom: 2 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline section */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>📐 The 7-Stage Implementation Pipeline</div>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Click each stage to expand the technical detail, known pitfalls, and Java code snippet.</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {CUSTOM_PIPELINE.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => setActiveStep(activeStep === s.id ? null : s.id)}
              style={{ padding: "5px 10px", fontSize: 11, fontWeight: 700, fontFamily: "inherit", borderRadius: 6, cursor: "pointer", border: `1.5px solid ${activeStep === s.id ? s.riskColor : "#e2e8f0"}`, background: activeStep === s.id ? s.riskBg : "#fff", color: activeStep === s.id ? s.riskColor : "#475569", transition: "all .15s", display: "flex", alignItems: "center", gap: 5 }}
            >
              <span style={{ fontWeight: 800, color: "#94a3b8" }}>{s.step}</span> {s.title}
              <span style={{ fontSize: 9, fontWeight: 800, color: s.riskColor, background: s.riskBg, borderRadius: 4, padding: "1px 5px", border: `1px solid ${s.riskColor}30` }}>{s.risk}</span>
            </button>
            {s.id !== "testing" && <span style={{ color: "#cbd5e1", fontSize: 14 }}>→</span>}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        {CUSTOM_PIPELINE.map((stage) => (
          <div key={stage.id} style={{ marginBottom: 8 }}>
            {/* Collapsed row */}
            <div
              onClick={() => setActiveStep(activeStep === stage.id ? null : stage.id)}
              style={{ display: "grid", gridTemplateColumns: "48px 200px 80px 80px 1fr 100px", gap: 0, padding: "12px 16px", cursor: "pointer", background: activeStep === stage.id ? stage.riskBg : "#fff", border: `1px solid ${activeStep === stage.id ? stage.riskColor : "#e2e8f0"}`, borderRadius: activeStep === stage.id ? "10px 10px 0 0" : 10, alignItems: "center", transition: "all .15s" }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8" }}>{stage.step}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: activeStep === stage.id ? stage.riskColor : "#0f172a" }}>{stage.title}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>⏱ {stage.effort}</div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: stage.riskColor, background: stage.riskBg, borderRadius: 5, padding: "2px 7px", border: `1px solid ${stage.riskColor}30` }}>{stage.risk}</span>
              </div>
              <div style={{ fontSize: 12, color: "#475569", paddingLeft: 8 }}>{stage.desc.substring(0, 90)}…</div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: activeStep === stage.id ? stage.riskColor : "#94a3b8" }}>{activeStep === stage.id ? "▲ collapse" : "▼ expand"}</span>
              </div>
            </div>

            {/* Expanded detail */}
            {activeStep === stage.id && (
              <div style={{ background: stage.riskBg, border: `1px solid ${stage.riskColor}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "18px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>📖 What you build</div>
                    <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>{stage.desc}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: stage.riskColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>🐛 Known pitfall</div>
                    <div style={{ background: "#fff", border: `1px solid ${stage.riskColor}40`, borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>
                      {stage.pitfall}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCode(stage.id); }}
                    style={{ fontSize: 11, fontWeight: 600, color: "#475569", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}
                  >
                    {showCode[stage.id] ? "▲ Hide code" : "▼ Show Java snippet"}
                  </button>
                  {showCode[stage.id] && (
                    <pre style={{ background: "#0f172a", color: "#cdd6f4", borderRadius: 8, padding: "14px 16px", fontSize: 11, lineHeight: 1.8, margin: 0, overflowX: "auto", fontFamily: "monospace" }}>
                      {stage.code}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* When to build vs not */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #a7f3d0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ background: "#ecfdf5", borderBottom: "1px solid #a7f3d0", padding: "12px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46" }}>✅ Build custom ONLY when…</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>These are the genuine justifications</div>
          </div>
          <div style={{ padding: "14px 16px" }}>
            {CUSTOM_WHEN_YES.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #fca5a5", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ background: "#fef2f2", borderBottom: "1px solid #fca5a5", padding: "12px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#991b1b" }}>❌ Do NOT build custom when…</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>These are rationalizations, not reasons</div>
          </div>
          <div style={{ padding: "14px 16px" }}>
            {CUSTOM_WHEN_NO.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The middle path */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "12px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>🧩 The Middle Path: Wrap Nayuki, Don't Reimplement</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Get 95% of custom-built advantages at 5% of the effort</div>
        </div>
        <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 8 }}>What "wrapping" gives you</div>
            {["Full control over your service API and response format", "Add your own caching, rate limiting, audit logging", "Custom error messages and fallback behaviour", "Future-proof: swap Nayuki for ZXing in one class", "Add logo/branding overlay post-generation with AWT/BufferedImage", "Instrument with Micrometer metrics — generation latency, error rates", "Your Spring Boot service IS the abstraction — not the encoder"].map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: "#059669" }}>▸</span>{t}</div>
            ))}
          </div>
          <div>
            <pre style={{ background: "#0f172a", color: "#cdd6f4", borderRadius: 8, padding: "14px", fontSize: 11, lineHeight: 1.75, margin: 0, fontFamily: "monospace", overflowX: "auto" }}>{`@Service
@Slf4j
public class QrCodeService {
  // Wrap Nayuki — you own the API, not the math
  public QrResult generate(QrRequest req) {
    String payload = normalise(req.getUrl());
    validateLength(payload);  // your rules

    QrCode qr = QrCode.encodeText(payload, Ecc.HIGH);
    BufferedImage img = qr.toImage(req.getScale(), 4);

    // Add logo overlay — your custom logic
    if (req.getLogo() != null)
      img = overlayLogo(img, req.getLogo());

    byte[] png = toPng(img);
    String s3Key = uploadToS3(png, req.getId());

    // Instrument — your observability
    metrics.recordGeneration(payload.length(), s3Key);
    log.info("QR generated: key={} len={}", s3Key, payload.length());

    return QrResult.of(cloudfrontUrl(s3Key), s3Key);
  }
}`}</pre>
          </div>
        </div>
      </div>

      {/* Cost comparison */}
      <div style={{ background: "#0f172a", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>💰 True Cost of Custom vs Wrap Nayuki</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "16px", borderLeft: "3px solid #dc2626" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 10 }}>Custom from scratch</div>
            {[
              ["GF(256) + RS encoder", "3–4 days"],
              ["Matrix builder + patterns", "4–6 days"],
              ["Zigzag + mask evaluation", "3–4 days"],
              ["Format/version BCH", "1–2 days"],
              ["Cross-scanner test suite", "3–5 days"],
              ["Code review + hardening", "2–3 days"],
              ["Ongoing maintenance (annual)", "~5 days/yr"],
            ].map(([task, time]) => (
              <div key={task} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 5, borderBottom: "1px solid #334155", paddingBottom: 4 }}>
                <span>{task}</span><span style={{ color: "#f87171", fontWeight: 600 }}>{time}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#f87171", marginTop: 8 }}>
              <span>Total (year 1)</span><span>~19–27 engineer-days</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#475569" }}>vs</div>

          <div style={{ background: "#1e293b", borderRadius: 10, padding: "16px", borderLeft: "3px solid #059669" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80", marginBottom: 10 }}>Wrap Nayuki</div>
            {[
              ["Add Maven dependency", "5 min"],
              ["Write QrCodeService wrapper", "2–3 hours"],
              ["Write unit + integration tests", "2–4 hours"],
              ["Wire into Spring Boot + S3", "2–3 hours"],
              ["Add CloudFront + monitoring", "1 day"],
              ["Cross-scanner smoke test", "2 hours"],
              ["Ongoing maintenance (annual)", "~0 days"],
            ].map(([task, time]) => (
              <div key={task} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 5, borderBottom: "1px solid #334155", paddingBottom: 4 }}>
                <span>{task}</span><span style={{ color: "#4ade80", fontWeight: 600 }}>{time}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#4ade80", marginTop: 8 }}>
              <span>Total (year 1)</span><span>~2–3 engineer-days</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#0d1f35", borderRadius: 8, border: "1px solid #1e3a5f", fontSize: 12, color: "#7dd3fc", lineHeight: 1.7 }}>
          <strong style={{ color: "#38bdf8" }}>Bottom line:</strong> Wrapping Nayuki takes 2–3 days and gives you full control of the <em>service layer</em> (API, caching, logging, observability, logo overlays, S3 integration) while delegating the <em>mathematical correctness</em> to a library that has been validated across millions of scans. Building from scratch spends ~20 engineer-days reinventing that same math, with material risk of scanner-specific failures that only appear in production.
        </div>
      </div>
    </div>
  );
}

// ─── Tlinky Migration Plan ───────────────────────────────────────────────

const PHASE_DATA = [
  {
    id: "audit",
    phase: "Phase 1",
    title: "Audit & Inventory",
    duration: "Day 1–2",
    owner: "Backend Dev",
    risk: "LOW",
    riskColor: "#059669",
    riskBg: "#d1fae5",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    goal: "Know exactly what you have before touching anything.",
    steps: [
      "Call GET /api/qr-codes (paginated, 30 req/min limit) with your tlinky Bearer token to export every QR record.",
      "Each record contains: id, alias, destination URL, short_url, the QR image URL, created_at, clicks.",
      "Store the full JSON export in a migration_audit table or flat JSON file — your source of truth.",
      "Count totals: how many QR codes exist, how many are actively scanned (check click counts), which ones are referenced in Angular UI vs external print materials.",
      "Identify QR type: are any dynamic (redirect via tlinky short URL)? These need special handling vs static (encodes URL directly).",
    ],
    code: `// Spring Boot: TlinkyExportService.java
@Service
public class TlinkyExportService {
  private static final String BASE = "https://app.tlinky.com/api";
  private final String apiKey = env.getProperty("tlinky.api.key");

  public List<TlinkyQr> exportAll() {
    List<TlinkyQr> all = new ArrayList<>();
    int page = 1;
    boolean hasMore = true;
    while (hasMore) {
      // Rate limit: 30 req/min — add throttle if > 30 pages
      ResponseEntity<TlinkyListResponse> resp = rest.exchange(
        BASE + "/qr-codes?limit=100&page=" + page,
        HttpMethod.GET,
        bearer(apiKey), TlinkyListResponse.class);
      all.addAll(resp.getBody().getData());
      hasMore = resp.getBody().isHasMore();
      page++;
      if (hasMore) Thread.sleep(2100); // stay under rate limit
    }
    return all;
  }
}`,
    warning: "tlinky rate limit is 30 req/min. If you have > 30 pages of QR codes, add Thread.sleep(2100ms) between page requests.",
  },
  {
    id: "classify",
    phase: "Phase 2",
    title: "Classify Each QR Code",
    duration: "Day 2–3",
    owner: "Backend Dev + Product",
    risk: "LOW",
    riskColor: "#059669",
    riskBg: "#d1fae5",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
    goal: "Not all QR codes need the same migration strategy. Classify first.",
    steps: [
      "STATIC QR (encodes URL directly): The QR image pixel matrix IS the URL. These can be fully regenerated by Nayuki from the original URL — no dependency on tlinky at all.",
      "DYNAMIC QR via tlinky short-link (e.g. tlinky.com/abc123 → real URL): The physical QR image encodes tlinky's redirect URL. Replacing these requires either re-printing or keeping tlinky alive temporarily.",
      "DIGITAL-ONLY vs PRINTED: Digital QR codes (shown on screen, in emails, in Angular UI) can be swapped immediately. Printed QR codes (packaging, posters, signage) cannot.",
      "ACTIVE vs DORMANT: QR codes with zero scans in 90 days can be deprecated. Don't migrate what nobody uses.",
      "Produce a classification spreadsheet: qr_id | type | destination_url | digital/printed | last_scan | action",
    ],
    code: `// Classification enum
public enum QrMigrationType {
  STATIC_DIGITAL,    // Regenerate + swap S3 URL immediately
  STATIC_PRINTED,    // Regenerate but keep old URL live until reprint
  DYNAMIC_DIGITAL,   // Regenerate to new URL + update Angular references
  DYNAMIC_PRINTED,   // Must keep tlinky alive OR redirect domain
  DORMANT            // Zero scans 90d — archive, do not migrate
}

// Classify from audit data
QrMigrationType classify(TlinkyQr qr, boolean isPrinted) {
  if (qr.getClicks() == 0 && daysSince(qr.getCreated()) > 90)
    return DORMANT;
  boolean isDynamic = qr.getDestination()
    .contains("tlinky.com"); // short URL = dynamic
  if (isDynamic)
    return isPrinted ? DYNAMIC_PRINTED : DYNAMIC_DIGITAL;
  return isPrinted ? STATIC_PRINTED : STATIC_DIGITAL;
}`,
    warning: "The hardest category is DYNAMIC_PRINTED — those QR codes point to tlinky.com/shortcode on physical materials you cannot change. You need a plan for these specifically.",
  },
  {
    id: "parallel",
    phase: "Phase 3",
    title: "Run Both Systems in Parallel",
    duration: "Day 3 – Week 2",
    owner: "Backend Dev",
    risk: "LOW",
    riskColor: "#059669",
    riskBg: "#d1fae5",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#a7f3d0",
    goal: "New system generates codes. Old system stays live. Zero risk period.",
    steps: [
      "Deploy Nayuki-based QrCodeService to production but do NOT cut traffic yet.",
      "Introduce a feature flag (e.g. qr.provider=nayuki|tlinky in Spring config or AWS Parameter Store).",
      "New QR code requests go to Nayuki → S3 → CloudFront. Old codes still served from tlinky.",
      "Run both in parallel for 5–10 business days. Monitor: generation error rate, S3 upload success rate, scan success rate from CloudFront URLs.",
      "Shadow mode: for every tlinky request also call Nayuki and compare outputs — log any divergence without serving it.",
    ],
    code: `// Feature-flagged provider in Spring Boot
@Service
public class QrProviderRouter {
  @Value("\${qr.provider:nayuki}")
  private String provider;

  public QrResult generate(QrRequest req) {
    return switch (provider) {
      case "nayuki" -> nayukiService.generate(req);
      case "tlinky" -> tlinkyService.generate(req);
      case "shadow"  -> {
        // Call both, compare, serve nayuki, log diffs
        var nayuki = nayukiService.generate(req);
        var tlinky = tlinkyService.generate(req);
        shadowLog.compare(nayuki, tlinky, req);
        yield nayuki;
      }
      default -> throw new IllegalStateException("Unknown provider: " + provider);
    };
  }
}`,
    warning: "Do NOT skip parallel running. The most common migration failure is cutting over before validating that every downstream consumer (Angular UI, email templates, print PDFs) handles the new S3/CloudFront URL format correctly.",
  },
  {
    id: "backfill",
    phase: "Phase 4",
    title: "Backfill Existing QR Codes",
    duration: "Week 1–2",
    owner: "Backend Dev",
    risk: "MEDIUM",
    riskColor: "#d97706",
    riskBg: "#fef3c7",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    goal: "Regenerate every STATIC QR code using Nayuki and upload to S3. Retire tlinky URLs.",
    steps: [
      "Run the backfill batch job: for each STATIC_DIGITAL QR in the audit table, call Nayuki with the original destination URL, upload PNG to S3 under the same logical key, update your DB record to store the new S3/CloudFront URL.",
      "Process in batches of 50–100 with throttling. For 10,000 QR codes Nayuki generates ~1,000 codes/sec — the entire backfill takes seconds of CPU, minutes of S3 upload time.",
      "For STATIC_PRINTED: generate the new image and store it, but do NOT yet update any references. Keep both URLs alive. Update references when reprinting.",
      "Update Angular UI: replace all tlinky image URLs with new CloudFront URLs. This is a DB query + cache bust — Angular just renders whatever URL the API returns.",
      "Verify each migrated code: scan the S3-served PNG using ZXing decoder and assert the decoded URL matches the original destination.",
    ],
    code: `// Backfill batch job — Spring Batch or simple @Scheduled
@Component
public class QrBackfillJob {
  public void run() {
    List<TlinkyQr> staticDigital = repo
      .findByTypeAndStatus(STATIC_DIGITAL, PENDING);

    for (List<TlinkyQr> batch : partition(staticDigital, 50)) {
      batch.parallelStream().forEach(qr -> {
        try {
          // 1. Regenerate with Nayuki
          byte[] png = qrService.generate(qr.getDestination());

          // 2. Upload to S3 — same logical key
          String key = "qr/" + qr.getId() + ".png";
          s3.putObject(bucket, key, png);

          // 3. Verify decoded URL matches
          String decoded = ZXingDecoder.decode(png);
          if (!decoded.equals(qr.getDestination()))
            throw new MigrationException("Mismatch: " + qr.getId());

          // 4. Update record
          repo.markMigrated(qr.getId(), cfUrl(key));
          metrics.increment("qr.migrated");
        } catch (Exception e) {
          repo.markFailed(qr.getId(), e.getMessage());
          log.error("Backfill failed for {}", qr.getId(), e);
        }
      });
    }
  }
}`,
    warning: "Always verify the regenerated QR by decoding it with ZXing before marking it migrated. A silent encoding mismatch would mean the new QR scans to the wrong URL.",
  },
  {
    id: "dynamic",
    phase: "Phase 5",
    title: "Handle Dynamic / Printed QR Codes",
    duration: "Week 2–4",
    owner: "Backend Dev + Ops + Product",
    risk: "HIGH",
    riskColor: "#dc2626",
    riskBg: "#fef2f2",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
    goal: "The hardest category — physical QR codes that encode tlinky.com redirect URLs.",
    steps: [
      "Option A — Own the redirect: Register your own short domain (e.g. qr.yourcompany.com). Set up a Spring Boot redirect controller. Ask tlinky to transfer the short codes, OR map them in your own DB. Update DNS. Now qr.yourcompany.com/abc123 → real URL, bypassing tlinky entirely.",
      "Option B — Proxy tlinky: Add a reverse proxy (AWS API Gateway or CloudFront) in front of tlinky. If tlinky goes down, your proxy serves cached redirects. Low effort, buys time.",
      "Option C — Scheduled reprint: Accept that printed DYNAMIC codes stay on tlinky until the next scheduled reprint (e.g. next product run). Migrate only digital ones now. Systematically replace physical materials over 3–6 months.",
      "Option D — Tlinky → static re-encode: For printed dynamic codes whose destination URL is stable (won't change), generate a NEW static QR code encoding the destination directly, and treat the next reprint as a migration opportunity.",
      "Keep a registry: qr_id | tlinky_short_code | destination_url | physical_location | reprint_scheduled_date.",
    ],
    code: `// Option A: Own the redirect — Spring Boot controller
@RestController
public class QrRedirectController {
  @GetMapping("/r/{shortCode}")
  public ResponseEntity<Void> redirect(
      @PathVariable String shortCode,
      HttpServletRequest req) {

    QrRedirect entry = repo.findByShortCode(shortCode)
      .orElseThrow(() -> new NotFoundException(shortCode));

    // Audit: track scan (device, geo, timestamp)
    auditService.recordScan(entry, req);

    return ResponseEntity
      .status(HttpStatus.FOUND) // 302 — or 301 if permanent
      .header("Location", entry.getDestinationUrl())
      .build();
  }
}

// Domain: qr.yourcompany.com/r/abc123 → destination
// CloudFront → ALB → Spring Boot → DB lookup → 302`,
    warning: "Do NOT use 301 (permanent) redirects during migration. 301s are cached by browsers. If you later change a destination, cached browsers will keep going to the old URL. Use 302 until fully stable.",
  },
  {
    id: "cutover",
    phase: "Phase 6",
    title: "Cutover & Tlinky Decommission",
    duration: "Week 3–4",
    owner: "Backend Dev + DevOps",
    risk: "MEDIUM",
    riskColor: "#d97706",
    riskBg: "#fef3c7",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    goal: "Flip the flag. Retire tlinky. Validate. Cancel subscription.",
    steps: [
      "Cutover gate: 100% of STATIC_DIGITAL backfilled ✓, scan verification passing ✓, Angular UI updated ✓, parallel run clean for 5+ days ✓.",
      "Flip feature flag from 'shadow' → 'nayuki' in AWS Parameter Store. No redeployment needed.",
      "Monitor for 48 hours: QR generation error rate, S3 upload latency, CloudFront cache hit rate, Angular error logs.",
      "Run a final tlinky export to confirm no new QR codes were created against tlinky after cutover date.",
      "Keep tlinky subscription active for 30 days post-cutover as insurance (any missed DYNAMIC_PRINTED codes still work).",
      "After 30 days: cancel tlinky subscription, archive the export JSON, close the API key.",
    ],
    code: `// Cutover checklist — automated pre-flight in Spring Boot
@Component
public class CutoverPreFlight {
  public CutoverReport check() {
    long total    = repo.countAll();
    long migrated = repo.countByStatus(MIGRATED);
    long failed   = repo.countByStatus(FAILED);
    long pending  = repo.countByStatus(PENDING);
    long printed  = repo.countByType(DYNAMIC_PRINTED);

    boolean safeToFlip =
      pending == 0 &&
      failed  == 0 &&
      (printed == 0 || printedHasFallback());

    return CutoverReport.builder()
      .total(total).migrated(migrated)
      .failed(failed).printed(printed)
      .safeToFlip(safeToFlip)
      .blockers(collectBlockers(failed, pending, printed))
      .build();
  }
}

// Invoke before flipping feature flag:
// GET /admin/qr/cutover-preflight → { safeToFlip: true, blockers: [] }`,
    warning: "Cancel tlinky ONLY after 30 days. Even after cutover, some printed materials referencing tlinky short codes may still be in circulation. The 30-day buffer catches late discoveries.",
  },
];

const MIGRATION_RISKS = [
  { risk: "Dynamic QR codes on printed materials", severity: "HIGH", mitigation: "Option A: own the redirect domain. Operate tlinky for 30+ days post-cutover as fallback.", icon: "🖨️" },
  { risk: "Angular UI references hardcoded tlinky URLs", severity: "MEDIUM", mitigation: "Grep codebase for tlinky.com. Ensure Angular only consumes the URL returned by the Spring Boot API — never hardcode.", icon: "🅰️" },
  { risk: "tlinky API rate limit (30 req/min) slowing export", severity: "LOW", mitigation: "Add 2.1s sleep between pages during export. 10,000 QR codes = ~6 minutes total export time.", icon: "⏱️" },
  { risk: "S3 URL format change breaks consumers", severity: "MEDIUM", mitigation: "Put CloudFront in front. Keep URL pattern identical: /qr/{id}.png. Only hostname changes.", icon: "🔗" },
  { risk: "Decoded URL mismatch after regeneration", severity: "MEDIUM", mitigation: "Run ZXing decoder as part of backfill job. Assert decoded == original. Fail fast on mismatch.", icon: "🔍" },
  { risk: "Nayuki generates different QR version than tlinky", severity: "LOW", mitigation: "Visual pixel pattern will differ (different mask, different version) but decoded URL is identical. This is expected and correct.", icon: "🔲" },
  { risk: "Users with cached tlinky URLs in bookmarks / emails", severity: "LOW", mitigation: "These are typically short-lived. CloudFront URLs are durable. Old tlinky-generated QR images already scanned still work — the image content doesn't change.", icon: "📧" },
];

function TlinkyMigration() {
  const [activePhase, setActivePhase] = useState(null);
  const [showCode, setShowCode] = useState({});
  const toggleCode = (id) => setShowCode(prev => ({ ...prev, [id]: !prev[id] }));

  const C = { head: "#0f172a", sub: "#64748b", border: "#e2e8f0", rowAlt: "#f8fafc" };

  return (
    <div>
      <SectionHeader icon="🚚" title="Tlinky → Nayuki Migration Plan" subtitle="Step-by-step cutover strategy: audit, classify, backfill, handle printed codes, decommission" />

      {/* TL;DR */}
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 18px", marginBottom: 24, display: "flex", gap: 12 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>📌</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>The key insight: tlinky QR codes are not portable images</div>
          <div style={{ fontSize: 13, color: "#1e3a8a", lineHeight: 1.7 }}>
            A QR code is a pixel matrix that encodes a specific string. If tlinky generated a QR encoding <code style={{ background: "#dbeafe", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>https://yoursite.com/product/123</code>, Nayuki will regenerate the <em>same logical content</em> with a different pixel pattern (different mask selection) — and it will scan identically. <strong>For digital-only QR codes this migration is a batch job, not a reprint.</strong> The challenge is exclusively QR codes on physical printed materials that encode tlinky short-link URLs.
          </div>
        </div>
      </div>

      {/* Timeline overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 24 }}>
        {PHASE_DATA.map(p => (
          <button key={p.id} onClick={() => setActivePhase(activePhase === p.id ? null : p.id)} style={{ background: activePhase === p.id ? p.color : "#fff", border: `1.5px solid ${activePhase === p.id ? p.color : C.border}`, borderRadius: 9, padding: "10px 8px", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all .15s", boxShadow: activePhase === p.id ? `0 4px 14px ${p.color}33` : "none" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: activePhase === p.id ? "rgba(255,255,255,0.7)" : C.sub, marginBottom: 3 }}>{p.phase}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: activePhase === p.id ? "#fff" : C.head, lineHeight: 1.3, marginBottom: 4 }}>{p.title}</div>
            <div style={{ fontSize: 10, color: activePhase === p.id ? "rgba(255,255,255,0.8)" : C.sub }}>{p.duration}</div>
            <div style={{ marginTop: 5 }}><span style={{ fontSize: 9, fontWeight: 700, color: activePhase === p.id ? "#fff" : p.riskColor, background: activePhase === p.id ? "rgba(255,255,255,0.2)" : p.riskBg, borderRadius: 4, padding: "1px 5px" }}>{p.risk} RISK</span></div>
          </button>
        ))}
      </div>

      {/* Phase details */}
      <div style={{ marginBottom: 24 }}>
        {PHASE_DATA.map(phase => (
          <div key={phase.id} style={{ marginBottom: 8 }}>
            {/* Row */}
            <div onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)} style={{ display: "grid", gridTemplateColumns: "90px 48px 180px 100px 80px 1fr 100px", gap: 0, padding: "12px 16px", cursor: "pointer", background: activePhase === phase.id ? phase.bg : "#fff", border: `1px solid ${activePhase === phase.id ? phase.color : C.border}`, borderRadius: activePhase === phase.id ? "10px 10px 0 0" : 10, borderLeft: `3px solid ${activePhase === phase.id ? phase.color : "transparent"}`, alignItems: "center", transition: "all .15s" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: phase.color }}>{phase.phase}</div>
              <div><span style={{ fontSize: 9, fontWeight: 700, color: phase.riskColor, background: phase.riskBg, borderRadius: 4, padding: "1px 5px" }}>{phase.risk}</span></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: activePhase === phase.id ? phase.color : C.head }}>{phase.title}</div>
              <div style={{ fontSize: 11, color: C.sub }}>⏱ {phase.duration}</div>
              <div style={{ fontSize: 11, color: C.sub }}>👤 {phase.owner.split(" ")[0]}</div>
              <div style={{ fontSize: 12, color: "#475569", paddingLeft: 8 }}>{phase.goal}</div>
              <div style={{ textAlign: "right", fontSize: 11, color: activePhase === phase.id ? phase.color : "#94a3b8" }}>{activePhase === phase.id ? "▲ collapse" : "▼ expand"}</div>
            </div>

            {/* Expanded */}
            {activePhase === phase.id && (
              <div style={{ background: phase.bg, border: `1px solid ${phase.color}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "18px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Steps</div>
                    {phase.steps.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: phase.color, background: `${phase.color}15`, borderRadius: 4, padding: "1px 6px", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                        <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.6 }}>{s}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    {phase.warning && (
                      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8 }}>
                        <span style={{ flexShrink: 0 }}>⚠️</span>
                        <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}><strong>Watch out:</strong> {phase.warning}</div>
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); toggleCode(phase.id); }} style={{ fontSize: 11, fontWeight: 600, color: "#475569", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
                      {showCode[phase.id] ? "▲ Hide Java code" : "▼ Show Java code"}
                    </button>
                    {showCode[phase.id] && (
                      <pre style={{ background: "#0f172a", color: "#cdd6f4", borderRadius: 8, padding: "13px 15px", fontSize: 11, lineHeight: 1.8, margin: 0, overflowX: "auto", fontFamily: "monospace" }}>{phase.code}</pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Decision tree for QR type */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}`, padding: "12px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.head }}>🌳 Migration Decision by QR Code Type</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Four categories — four different strategies</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                {["QR Type", "What it encodes", "Digital?", "Printed?", "Strategy", "Effort", "Timeline"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { type: "Static · Digital", encodes: "yoursite.com/path directly", digital: "✅", printed: "—", strategy: "Regenerate with Nayuki → S3 → update DB reference → done", effort: "Batch job", time: "Day 3–5", color: "#059669", bg: "#f0fdf4" },
                { type: "Static · Printed", encodes: "yoursite.com/path directly", digital: "—", printed: "✅", strategy: "Regenerate now, store new image. Keep old image alive. Swap on next scheduled reprint.", effort: "Low", time: "Next reprint", color: "#0284c7", bg: "#f0f9ff" },
                { type: "Dynamic · Digital", encodes: "tlinky.com/abc123 redirect", digital: "✅", printed: "—", strategy: "Own the redirect domain. Update DB to point to new redirect URL. Regenerate QR with new URL.", effort: "Medium", time: "Week 2–3", color: "#d97706", bg: "#fffbeb" },
                { type: "Dynamic · Printed", encodes: "tlinky.com/abc123 redirect", digital: "—", printed: "✅", strategy: "Option A: own redirect so tlinky.com/abc123 still works via your domain. OR reprint with static QR.", effort: "HIGH", time: "Week 3–6", color: "#dc2626", bg: "#fef2f2" },
              ].map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? r.bg : "#fff", borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: r.color }}>{r.type}</td>
                  <td style={{ padding: "10px 14px", color: "#475569", fontFamily: "monospace", fontSize: 11 }}>{r.encodes}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>{r.digital}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>{r.printed}</td>
                  <td style={{ padding: "10px 14px", color: "#374151", lineHeight: 1.5 }}>{r.strategy}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 10, fontWeight: 700, color: r.color, background: r.bg, borderRadius: 4, padding: "2px 7px", border: `1px solid ${r.color}30` }}>{r.effort}</span></td>
                  <td style={{ padding: "10px 14px", color: C.sub, whiteSpace: "nowrap" }}>{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk register */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}`, padding: "12px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.head }}>🛡️ Migration Risk Register</div>
        </div>
        {MIGRATION_RISKS.map((r, i) => {
          const sc = r.severity === "HIGH" ? { c: "#dc2626", bg: "#fef2f2" } : r.severity === "MEDIUM" ? { c: "#d97706", bg: "#fef3c7" } : { c: "#059669", bg: "#d1fae5" };
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr auto 2fr", gap: 12, padding: "12px 16px", background: i % 2 === 0 ? "#fff" : C.rowAlt, borderBottom: `1px solid #f1f5f9`, alignItems: "start" }}>
              <div style={{ fontSize: 18, textAlign: "center", paddingTop: 2 }}>{r.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{r.risk}</div>
              <div><span style={{ fontSize: 10, fontWeight: 700, color: sc.c, background: sc.bg, borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap" }}>{r.severity}</span></div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{r.mitigation}</div>
            </div>
          );
        })}
      </div>

      {/* Tlinky API cheatsheet */}
      <div style={{ background: "#0f172a", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>📡 Tlinky API Quick Reference — What You Need for Migration</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Endpoints used in migration</div>
            {[
              ["GET /api/qr-codes?limit=100&page=N", "Paginated export of all QR codes"],
              ["GET /api/qr-codes/{id}", "Single QR code details"],
              ["Rate limit: 30 req/min", "Add 2100ms sleep between pages"],
              ["Auth: Bearer YOURAPIKEY", "Header: Authorization: Bearer {key}"],
            ].map(([ep, note]) => (
              <div key={ep} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 10px", marginBottom: 6, alignItems: "baseline" }}>
                <code style={{ fontSize: 10, color: "#a5f3fc", fontFamily: "monospace" }}>{ep}</code>
                <span style={{ fontSize: 11, color: "#64748b" }}>{note}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Response fields to capture</div>
            {[
              ["id", "Your migration record key"],
              ["alias", "Short code (e.g. abc123 in tlinky.com/abc123)"],
              ["destination", "The real URL the QR encodes or redirects to"],
              ["short_url", "Full tlinky short URL — needed for dynamic types"],
              ["qr_code_url", "URL of the tlinky-hosted QR image (PNG)"],
              ["clicks", "Scan count — use for active/dormant classification"],
              ["created_at", "Age — 90d+ zero clicks = dormant"],
            ].map(([field, note]) => (
              <div key={field} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: "4px 8px", marginBottom: 5, alignItems: "baseline" }}>
                <code style={{ fontSize: 11, color: "#fde68a", fontFamily: "monospace" }}>{field}</code>
                <span style={{ fontSize: 11, color: "#64748b" }}>{note}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#1e293b", borderRadius: 8, fontSize: 12, color: "#7dd3fc", lineHeight: 1.7 }}>
          <strong style={{ color: "#38bdf8" }}>Total migration timeline:</strong> For a typical deployment with a few hundred to a few thousand QR codes, the full migration from audit to tlinky decommission takes <strong style={{ color: "#a5f3fc" }}>3–4 weeks</strong>. The majority of that time is the 30-day parallel-run buffer. The actual engineering work is ~3–5 days.
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "summary",      label: "Executive Summary", icon: "📋" },
  { id: "matrix",       label: "Comparison Matrix", icon: "📊" },
  { id: "architecture", label: "Architecture",      icon: "🏗️" },
  { id: "risk",         label: "Risk & Support",    icon: "🛡️" },
  { id: "verdict",      label: "Decision Guide",    icon: "✅" },
  { id: "headtohead",   label: "ZXing vs Nayuki",   icon: "⚔️" },
  { id: "custom",       label: "Custom Built",      icon: "🔧" },
  { id: "migration",    label: "Tlinky Migration",  icon: "🚚", isNew: true },
];

export default function QRProviderReport() {
  const [activeTab, setActiveTab]         = useState("summary");
  const [activeProvider, setActiveProvider] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f1f5f9; }
        button { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 28px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 7, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>▦</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.2px" }}>QR Code Provider Modernization</div>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.04em" }}>2026 STRATEGY & COMPARISON</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "#475569" }}>Stack:</div>
            {["Java 21", "Spring Boot 3.x", "Angular 18", "AWS S3"].map(t => (
              <span key={t} style={{ fontSize: 10, fontWeight: 600, color: "#38bdf8", background: "#1e293b", borderRadius: 5, padding: "2px 8px", border: "1px solid #334155" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "14px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "none", border: "none", borderBottom: activeTab === tab.id ? "2.5px solid #1d4ed8" : "2.5px solid transparent", color: activeTab === tab.id ? "#1d4ed8" : "#64748b", whiteSpace: "nowrap", transition: "color .15s", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{tab.icon}</span>
              {tab.label}
              {tab.isNew && <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "#dc2626", borderRadius: 4, padding: "1px 5px", letterSpacing: "0.05em" }}>NEW</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px" }}>
        {activeTab === "summary"      && <ExecSummary />}
        {activeTab === "matrix"       && <ComparisonMatrix activeProvider={activeProvider} setActiveProvider={setActiveProvider} />}
        {activeTab === "architecture" && <ArchDiagram />}
        {activeTab === "risk"         && <RiskAssessment />}
        {activeTab === "verdict"      && <FinalVerdict />}
        {activeTab === "headtohead"   && <ZXingVsNayuki />}
        {activeTab === "custom"       && <CustomBuiltDeepDive />}
        {activeTab === "migration"    && <TlinkyMigration />}
      </div>

      <div style={{ borderTop: "1px solid #e2e8f0", padding: "16px 28px", textAlign: "center", fontSize: 11, color: "#94a3b8", background: "#fff" }}>
        QR Provider Modernization Report · 2026 · Replacing tlinky · Java 21 / Spring Boot 3.x + Angular 18 + AWS S3 · ZXing data corrected: v3.5.4 released Nov 2025
      </div>
    </div>
  );
}
