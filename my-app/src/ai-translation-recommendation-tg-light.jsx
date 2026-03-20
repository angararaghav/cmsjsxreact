import { useState } from "react";

const COLORS = {
  deepl: "#00967A", google: "#1A73E8", claude: "#D4520A", azure: "#0062AD", openai: "#0D8C6A",
  gemma: "#1967D2",
  yellow: "#C48500", purple: "#7B3FA0", red: "#C0392B",
  bg: "#F5F7FA", card: "#FFFFFF", cardDark: "#EDF0F5", border: "#D8DDE8",
  textDim: "#4A5268", textFaint: "#8891AA", textBright: "#1A1F36", textMid: "#2D3452",
};

const providers = [
  { name: "DeepL API", logo: "🔵", color: COLORS.deepl, accuracy: 98, languages: 33, nativeFeel: 99, speed: 85, price: "$$", priceDetail: "$25/M chars", freeTier: "500K chars/mo", badge: "BEST ACCURACY", strengths: ["Best-in-class natural output", "Formal/informal tone control", "Glossary support", "Context-aware translation"], weaknesses: ["Fewer languages than Google", "No audio/image translation"], bestFor: "EU languages, e-commerce" },
  { name: "Google Translate", logo: "🔴", color: COLORS.google, accuracy: 91, languages: 133, nativeFeel: 85, speed: 99, price: "$", priceDetail: "$20/M chars", freeTier: "500K chars/mo", badge: "MOST LANGUAGES", strengths: ["Most languages (133)", "Fastest API", "Cheapest at scale", "AutoML custom models"], weaknesses: ["Less natural for complex content", "Generic phrasing common"], bestFor: "High-volume, wide coverage" },
  { name: "Claude (Anthropic)", logo: "🟠", color: COLORS.claude, accuracy: 96, languages: 95, nativeFeel: 97, speed: 70, price: "$$$", priceDetail: "$3/M tokens", freeTier: "Pay-as-go", badge: "BEST CONTEXT", strengths: ["Context and tone preservation", "Marketing copy nuance", "Custom instructions", "Brand voice quality"], weaknesses: ["Slower than dedicated APIs", "Higher cost for bulk"], bestFor: "Marketing copy, brand voice" },
  { name: "Azure AI Translator", logo: "🔷", color: COLORS.azure, accuracy: 90, languages: 100, nativeFeel: 83, speed: 92, price: "$$", priceDetail: "$10/M chars", freeTier: "2M chars/mo", badge: "BEST FREE TIER", strengths: ["Azure ecosystem integration", "Custom translator", "Document translation", "High free tier"], weaknesses: ["Quality varies by language pair", "Enterprise complexity"], bestFor: "Teams already on Azure" },
  { name: "OpenAI GPT-4o", logo: "⚫", color: COLORS.openai, accuracy: 94, languages: 90, nativeFeel: 93, speed: 68, price: "$$$", priceDetail: "$5/M tokens", freeTier: "Pay-as-go", badge: null, strengths: ["Excellent nuance handling", "Complex instructions", "Cultural adaptation"], weaknesses: ["Expensive for bulk translation", "Overkill for simple strings"], bestFor: "AI-enriched workflows" },
  { name: "TranslateGemma", logo: "💎", color: COLORS.gemma, accuracy: 93, languages: 55, nativeFeel: 91, speed: 55, price: "~", priceDetail: "Compute only", freeTier: "Open weights", badge: "OPEN SOURCE", strengths: ["Free open-weight model (4B/12B/27B)", "Runs fully offline / air-gapped", "Image translation (multimodal)", "Fine-tunable on your domain data", "Zero per-character API fees at scale"], weaknesses: ["You manage GPU infrastructure", "Only 55 evaluated languages", "No native glossary API", "Slower inference than cloud APIs", "New — limited production track record"], bestFor: "Privacy-sensitive, high-volume, offline" },
];

const Bar = ({ value, color }) => (
  <div style={{ background: "#E8EBF2", borderRadius: 4, height: 6, width: "100%", overflow: "hidden" }}>
    <div style={{ width: value + "%", height: "100%", background: color, borderRadius: 4 }} />
  </div>
);

const Label = ({ children, color }) => (
  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: color || COLORS.textFaint, textTransform: "uppercase", marginBottom: 8 }}>{children}</div>
);

const CodeLine = ({ label, labelColor, value, valueColor, indent }) => (
  <div style={{ marginLeft: indent ? 16 : 0 }}>
    {label && <span style={{ fontFamily: "monospace", fontSize: 11, color: labelColor || COLORS.textFaint }}>{label} </span>}
    <span style={{ fontFamily: "monospace", fontSize: 11, color: valueColor || COLORS.textMid }}>{value}</span>
  </div>
);

function ComparisonTab() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px 100px 120px", gap: 12, padding: "6px 14px", fontSize: 10, letterSpacing: "0.12em", color: COLORS.textFaint, textTransform: "uppercase" }}>
        <div>Provider</div><div>Accuracy / Native Feel</div><div>Langs</div><div>Speed</div><div>Cost</div><div>Best For</div>
      </div>
      {providers.map((p) => (
        <div key={p.name} onClick={() => setExpanded(expanded === p.name ? null : p.name)}
          style={{ background: expanded === p.name ? "#EFF6FF" : COLORS.card, border: "1px solid " + (expanded === p.name ? p.color + "50" : COLORS.border), borderRadius: 8, padding: 14, cursor: "pointer" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 80px 100px 120px", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{p.logo}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                {p.badge && <div style={{ fontSize: 9, background: p.color + "22", color: p.color, padding: "2px 5px", borderRadius: 2, display: "inline-block", marginTop: 2 }}>{p.badge}</div>}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: COLORS.textDim }}>Accuracy</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.accuracy}%</span>
              </div>
              <Bar value={p.accuracy} color={p.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: COLORS.textDim }}>Native Feel</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.nativeFeel}%</span>
              </div>
              <Bar value={p.nativeFeel} color={p.color} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: p.color }}>{p.languages}</div>
              <div style={{ fontSize: 10, color: COLORS.textFaint }}>langs</div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: COLORS.textDim }}>Speed</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{p.speed}%</span>
              </div>
              <Bar value={p.speed} color={COLORS.yellow} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{p.price}</div>
              <div style={{ fontSize: 10, color: COLORS.textFaint }}>{p.priceDetail}</div>
              <div style={{ fontSize: 10, color: COLORS.deepl, marginTop: 2 }}>{p.freeTier}</div>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>{p.bestFor}</div>
          </div>
          {expanded === p.name && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid " + p.color + "30", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: COLORS.deepl, letterSpacing: "0.12em", marginBottom: 6 }}>STRENGTHS</div>
                {p.strengths.map(s => <div key={s} style={{ fontSize: 12, color: COLORS.textMid, padding: "2px 0" }}><span style={{ color: COLORS.deepl }}>+ </span>{s}</div>)}
              </div>
              <div>
                <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: "0.12em", marginBottom: 6 }}>WEAKNESSES</div>
                {p.weaknesses.map(s => <div key={s} style={{ fontSize: 12, color: COLORS.textMid, padding: "2px 0" }}><span style={{ color: COLORS.red }}>- </span>{s}</div>)}
              </div>
            </div>
          )}
        </div>
      ))}
      <div style={{ fontSize: 11, color: COLORS.textFaint }}>Click any row to expand details</div>
    </div>
  );
}

function RecommendationTab() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg,#00967A11," + COLORS.card + ")", border: "1px solid #00967A40", borderRadius: 10, padding: 24 }}>
        <Label color={COLORS.deepl}>Primary Recommendation</Label>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>Hybrid Strategy: <span style={{ color: COLORS.deepl }}>DeepL + Google + Claude + TranslateGemma</span></h2>
        <p style={{ color: COLORS.textDim, lineHeight: 1.8, fontSize: 13, margin: "0 0 20px" }}>
          Use DeepL as your primary engine for major market languages. Fall back to Google Cloud Translate for long-tail languages. Route campaign-critical content through Claude for highest nuance. Add TranslateGemma for privacy-sensitive or high-volume workloads where self-hosting eliminates per-character fees entirely.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { engine: "DeepL API", role: "Primary Engine", langs: "33 languages", use: "All product content, descriptions, UI", color: COLORS.deepl },
            { engine: "Google Translate", role: "Fallback Engine", langs: "133 languages", use: "Languages not in DeepL coverage", color: COLORS.google },
            { engine: "Claude API", role: "Premium Layer", langs: "95 languages", use: "Hero banners, campaign copy, brand voice", color: COLORS.claude },
            { engine: "TranslateGemma", role: "Self-Hosted Layer", langs: "55 languages", use: "Privacy-sensitive content, high-volume cost reduction, offline / air-gapped environments", color: COLORS.gemma },
          ].map(e => (
            <div key={e.engine} style={{ background: COLORS.bg, border: "1px solid " + e.color + "40", borderRadius: 8, padding: 14 }}>
              <Label color={e.color}>{e.role}</Label>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{e.engine}</div>
              <div style={{ fontSize: 11, color: COLORS.textFaint, marginBottom: 6 }}>{e.langs}</div>
              <div style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.5 }}>{e.use}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.card, border: "1px solid " + COLORS.border, borderRadius: 10, padding: 20 }}>
        <Label color={COLORS.yellow}>Routing Decision Matrix</Label>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { content: "Product titles and descriptions", lang: "DeepL supported languages", engine: "DeepL", reason: "Highest natural quality" },
            { content: "UI labels, buttons, navigation", lang: "All languages", engine: "Google", reason: "Speed and cost efficiency" },
            { content: "Campaign headlines, hero text", lang: "Major markets", engine: "Claude", reason: "Brand voice preservation" },
            { content: "Legal / T&C text", lang: "All languages", engine: "DeepL + Human", reason: "Accuracy + legal liability" },
            { content: "SEO meta descriptions", lang: "All languages", engine: "DeepL + Claude", reason: "Keyword-aware output" },
            { content: "Rare languages", lang: "DeepL does not support", engine: "Google", reason: "DeepL does not support" },
            { content: "Privacy-sensitive / GDPR-critical", lang: "Any language", engine: "TranslateGemma", reason: "Data never leaves your infrastructure" },
            { content: "Very high-volume batch jobs", lang: "Core 55 languages", engine: "TranslateGemma", reason: "Zero per-char fees; compute cost only" },
          ].map(row => (
            <div key={row.content} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px 1fr", gap: 10, padding: "10px 14px", background: COLORS.bg, borderRadius: 6, fontSize: 12, alignItems: "center" }}>
              <div style={{ color: COLORS.textMid }}>{row.content}</div>
              <div style={{ color: COLORS.textFaint }}>{row.lang}</div>
              <div style={{ fontWeight: 700, color: row.engine.includes("TranslateGemma") ? COLORS.gemma : row.engine.includes("DeepL") ? COLORS.deepl : row.engine.includes("Claude") ? COLORS.claude : COLORS.google }}>{row.engine}</div>
              <div style={{ color: COLORS.textFaint }}>{row.reason}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: COLORS.card, border: "1px solid " + COLORS.border, borderRadius: 10, padding: 20 }}>
        <Label color={COLORS.purple}>Estimated Monthly Cost (Mid-size Store)</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {[
            { label: "DeepL API", volume: "~5M chars/mo", cost: "$125", note: "Core product content" },
            { label: "Google Translate", volume: "~2M chars/mo", cost: "$40", note: "Fallback languages" },
            { label: "Claude API", volume: "~500K tokens/mo", cost: "$1.50-$7.50", note: "Campaign copy only" },
            { label: "TranslateGemma", volume: "GPU compute/mo", cost: "~$50-150", note: "Self-hosted 12B model (replaces API cost at scale)" },
            { label: "Total Estimate", volume: "Hybrid approach", cost: "~$210-$320", note: "Per month, mid-scale", highlight: true },
          ].map(c => (
            <div key={c.label} style={{ background: c.highlight ? "linear-gradient(135deg,#7B3FA018," + COLORS.bg + ")" : COLORS.bg, border: "1px solid " + (c.highlight ? COLORS.purple + "60" : COLORS.border), borderRadius: 8, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: COLORS.textFaint, marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.highlight ? COLORS.purple : COLORS.textBright }}>{c.cost}</div>
              <div style={{ fontSize: 10, color: COLORS.textFaint, marginTop: 4 }}>{c.volume}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>{c.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchitectureTab() {
  const steps = [
    { id: "01", title: "Content Input", icon: "✏️", color: COLORS.claude, desc: "User configures English content in CMS — product names, descriptions, UI labels, marketing copy", details: ["Rich text editor support", "Field-level translation triggers", "Content type classification"] },
    { id: "02", title: "Pre-Processing", icon: "⚙️", color: COLORS.yellow, desc: "Content is classified and prepared — placeholders protected, HTML tags stripped, context injected", details: ["Tag and variable protection", "Content type tagging", "Glossary lookup for brand terms"] },
    { id: "03", title: "Smart Router", icon: "🔀", color: COLORS.deepl, desc: "Router decides which engine to use based on content type, target language, and cost budget", details: ["Marketing copy to Claude or DeepL", "Product specs to DeepL or Google", "UI strings to Google for speed", "Rare languages to Google", "Privacy content to TranslateGemma"] },
    { id: "04", title: "Translation Engine", icon: "🌐", color: COLORS.google, desc: "Hybrid approach: DeepL for primary markets, Google for long-tail, Claude for brand-critical content, TranslateGemma for privacy and high-volume self-hosted workloads", details: ["DeepL: EN to DE FR ES IT NL PL PT JA ZH", "Google: 80+ additional languages", "Claude: Campaign copy and headlines", "TranslateGemma: Privacy-sensitive & offline"] },
    { id: "05", title: "Post-Processing", icon: "🔧", color: COLORS.purple, desc: "Translated content is cleaned, placeholders restored, stored in Translation Memory for reuse", details: ["Placeholder restoration", "Translation Memory caching", "Quality score computation", "Format validation"] },
    { id: "06", title: "Review and Publish", icon: "✅", color: COLORS.red, desc: "Auto-publish high-confidence translations; flag low-confidence for human review before going live", details: ["Confidence threshold gates", "Human review queue", "A/B test translated content", "Publish to CDN and storefront"] },
  ];

  return (
    <div>
      <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 20, letterSpacing: "0.1em" }}>END-TO-END PIPELINE: CMS TO STOREFRONT</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ display: "flex", alignItems: "stretch" }}>
            <div style={{ width: 56, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: step.color + "22", border: "2px solid " + step.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{step.icon}</div>
              {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: step.color + "60", margin: "3px 0" }} />}
            </div>
            <div style={{ flex: 1, background: COLORS.card, border: "1px solid " + step.color + "30", borderRadius: 8, padding: "14px 18px", marginBottom: 6, marginLeft: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: step.color, fontWeight: 700 }}>{step.id}</span>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{step.title}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.textDim, lineHeight: 1.6 }}>{step.desc}</p>
                </div>
                <div style={{ minWidth: 190 }}>
                  {step.details.map(d => (
                    <div key={d} style={{ fontSize: 11, color: COLORS.textMid, padding: "2px 8px", marginBottom: 2, background: step.color + "11", borderLeft: "2px solid " + step.color + "60", borderRadius: "0 3px 3px 0" }}>{d}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28 }}>
        <Label color={COLORS.yellow}>Key Infrastructure Components</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {[
            { title: "Translation Memory (TM)", desc: "Cache translated segments — never pay to translate the same string twice. Use Redis or a dedicated TM DB.", icon: "💾", color: COLORS.deepl },
            { title: "Glossary / Terminology DB", desc: "Brand names and product terms that must never be translated. Injected into DeepL and Claude prompts.", icon: "📖", color: COLORS.google },
            { title: "Quality Scoring Engine", desc: "Auto-score translations using BLEU/COMET metrics. Flag scores below threshold for human review.", icon: "📊", color: COLORS.claude },
            { title: "Confidence-Based Publishing", desc: "Above 95% confidence = auto-publish. 80-95% = notify editor. Below 80% = block until reviewed.", icon: "🚦", color: COLORS.yellow },
            { title: "Webhook / Event System", desc: "CMS fires events on content save triggering translation pipeline asynchronously. Never blocks the editor.", icon: "⚡", color: COLORS.purple },
            { title: "Audit Trail and Versioning", desc: "Every translation stored with model version, timestamp, confidence. Full rollback capability per language.", icon: "🔍", color: COLORS.red },
          ].map(c => (
            <div key={c.title} style={{ background: COLORS.bg, border: "1px solid " + c.color + "30", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 5, color: c.color }}>{c.title}</div>
              <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, background: COLORS.card, border: "1px solid " + COLORS.claude + "40", borderRadius: 10, padding: 20 }}>
        <Label color={COLORS.claude}>Context Injection — Before Every API Call</Label>
        <p style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.7, margin: "0 0 18px" }}>
          Raw text sent to a translation API produces generic output. Injecting structured context before every call is what separates machine-quality from native-quality. Context should be assembled by the Pre-Processing layer and passed into each engine differently.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14, border: "1px solid " + COLORS.deepl + "30" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.deepl }}>DeepL API</div>
              <div style={{ fontSize: 9, color: COLORS.textFaint, letterSpacing: "0.1em" }}>REQUEST PARAMETERS</div>
            </div>
            {[
              { k: "glossary_id", v: "Pre-registered glossary with brand terms, product names, do-not-translate list" },
              { k: "formality", v: "prefer_more or prefer_less — set per target market (formal for DE, informal for NL)" },
              { k: "context", v: "Pass surrounding sentence or paragraph for word-sense disambiguation" },
              { k: "tag_handling", v: "html or xml — protects placeholders like price variables and HTML tags" },
              { k: "split_sentences", v: "nonewlines for UI strings, 1 for long-form content" },
            ].map(f => (
              <div key={f.k} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, marginBottom: 6 }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.deepl }}>{f.k}</div>
                <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>{f.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14, border: "1px solid " + COLORS.claude + "30" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.claude }}>Claude API</div>
              <div style={{ fontSize: 9, color: COLORS.textFaint, letterSpacing: "0.1em" }}>SYSTEM PROMPT ASSEMBLY</div>
            </div>
            {[
              { k: "brand_voice", v: "Inject tone guide: This brand is premium, confident, never uses exclamation marks" },
              { k: "content_type", v: "Tell Claude: product title / hero banner / legal notice — changes output register" },
              { k: "glossary_block", v: "List of terms to preserve verbatim: DO NOT translate: Nike Air Max, FreeShip" },
              { k: "target_audience", v: "e.g. Translate for German-speaking Swiss audience, use Swiss German conventions" },
              { k: "examples", v: "Include 1-2 approved translations as few-shot examples to anchor tone and style" },
            ].map(f => (
              <div key={f.k} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, marginBottom: 6 }}>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.claude }}>{f.k}</div>
                <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: COLORS.cardDark, borderRadius: 8, padding: 16, border: "1px solid " + COLORS.border, marginBottom: 10 }}>
          <Label>Example — Claude System Prompt for a Product Title</Label>
          <div style={{ fontFamily: "monospace", fontSize: 11, lineHeight: 2 }}>
            <CodeLine label="SYSTEM:" labelColor={COLORS.claude} value="You are a professional e-commerce translator for [BrandName]." valueColor={COLORS.textMid} />
            <CodeLine indent value="Brand voice: Premium, confident, concise. Never use exclamation marks." valueColor={COLORS.textFaint} />
            <CodeLine indent value="Target: German (Germany). Formal register (Sie form). Content type: Product title." valueColor={COLORS.textFaint} />
            <CodeLine indent label="DO NOT TRANSLATE:" labelColor={COLORS.deepl} value="AirMax Pro, FreeReturn, ProCard" valueColor={COLORS.textBright} />
            <CodeLine indent label="PRESERVE:" labelColor={COLORS.deepl} value="HTML tags, curly brace variables, %s tokens" valueColor={COLORS.textBright} />
            <CodeLine indent label="EXAMPLE:" labelColor={COLORS.yellow} value="Premium Running Shoe becomes Premium-Laufschuh" valueColor={COLORS.textFaint} />
            <CodeLine indent value="Return ONLY the translated text. No explanations." valueColor={COLORS.textFaint} />
            <CodeLine label="USER:" labelColor={COLORS.claude} value='Translate to German: "Lightweight Trail Runner with AirMax Pro sole"' valueColor={COLORS.textBright} />
          </div>
        </div>

        <div style={{ background: COLORS.cardDark, borderRadius: 8, padding: 16, border: "1px solid " + COLORS.border }}>
          <Label>Google Cloud Translate — Glossary and HTML Tag Strategy</Label>
          <div style={{ fontFamily: "monospace", fontSize: 11, lineHeight: 2 }}>
            <CodeLine label="glossaryConfig:" labelColor={COLORS.google} value="{ glossaryId: 'brand-terms-v3', ignoreCase: true }" valueColor={COLORS.textMid} />
            <CodeLine label="mimeType:" labelColor={COLORS.google} value='"text/html"  -- wrap do-not-translate terms in span translate=no' valueColor={COLORS.textMid} />
            <CodeLine label="contents:" labelColor={COLORS.google} value='"Buy [span translate=no]AirMax Pro[/span] shoes"' valueColor={COLORS.textMid} />
            <CodeLine label="source:" labelColor={COLORS.google} value='"en"  -- always specify, never auto-detect (saves latency and cost)' valueColor={COLORS.textMid} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, background: COLORS.card, border: "1px solid " + COLORS.deepl + "40", borderRadius: 10, padding: 20 }}>
        <Label color={COLORS.deepl}>Translation Memory — Eliminating Redundant API Calls</Label>
        <p style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.7, margin: "0 0 16px" }}>
          Before calling any external API, the pipeline checks the TM cache. A hit means zero API cost and near-instant delivery.
          At scale, TM typically reduces translation API spend by <strong style={{ color: COLORS.deepl }}>40-70%</strong>.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { match: "100% Match", color: COLORS.deepl, action: "Serve from TM instantly", cost: "$0", note: "Exact segment seen before. Zero API call." },
            { match: "Fuzzy Match (75-99%)", color: COLORS.yellow, action: "Serve TM + flag for review", cost: "~10% cost", note: "Slight edit needed. Use TM as base, re-translate only the changed delta." },
            { match: "No Match (below 75%)", color: COLORS.red, action: "Call translation API", cost: "Full cost", note: "New content. Translate then store result in TM for future reuse." },
          ].map(m => (
            <div key={m.match} style={{ background: COLORS.bg, border: "1px solid " + m.color + "40", borderRadius: 8, padding: 14 }}>
              <Label color={m.color}>{m.match}</Label>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{m.action}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.color, marginBottom: 6 }}>{m.cost}</div>
              <div style={{ fontSize: 11, color: COLORS.textFaint, lineHeight: 1.6 }}>{m.note}</div>
            </div>
          ))}
        </div>

        <div style={{ background: COLORS.cardDark, borderRadius: 8, padding: 16, border: "1px solid " + COLORS.border, marginBottom: 14 }}>
          <Label color={COLORS.yellow}>How Fuzzy Matching Works — Mechanisms and Techniques</Label>
          <p style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.7, margin: "0 0 14px" }}>
            A fuzzy match means the new source text is similar — but not identical — to a previously translated segment. The system reuses the existing translation as a starting point, reducing cost and effort. There are three techniques to implement this, each with different tradeoffs.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
            {[
              {
                name: "Token-Based String Similarity", tag: "FASTEST — USE FOR ALL SEGMENTS", color: COLORS.deepl,
                how: "Tokenise both strings, count shared tokens vs total. Levenshtein edit distance gives character-level diff. Libraries: python-Levenshtein, rapidfuzz.",
                score: "Score = (shared tokens / max tokens) * 100",
                pros: ["Microsecond lookup", "No GPU or ML needed", "Works offline, no API", "Easy to tune threshold"],
                cons: ["Word order ignored", "Synonyms not detected", '"fast shoe" vs "quick shoe" = 0% match'],
                use: "Primary fuzzy check — run on every TM lookup before any other method",
                lib: "rapidfuzz (Python) / fuse.js (Node)",
                cost: "Free, self-hosted",
              },
              {
                name: "Semantic Embedding Similarity", tag: "RECOMMENDED — FOR PRODUCT CONTENT", color: COLORS.claude,
                how: "Convert both strings to vector embeddings using a sentence transformer model. Compute cosine similarity between vectors. Catches paraphrases and synonyms token-based methods miss.",
                score: "Score = cosine_similarity(embed(new), embed(stored)) * 100",
                pros: ["Catches synonyms and paraphrases", "Language-aware", '"fast shoe" vs "quick shoe" = ~92% match'],
                cons: ["Needs embedding model (self-hosted or API)", "Higher latency (~50ms)", "Storage: embed all TM entries"],
                use: "Secondary check when token similarity is 50-74%. Can surface fuzzy hits token method misses.",
                lib: "sentence-transformers / OpenAI text-embedding-3-small",
                cost: "$0.02/M tokens (OpenAI) or free self-hosted",
              },
              {
                name: "N-gram Overlap (TF-IDF)", tag: "GOOD FOR LONG DESCRIPTIONS", color: COLORS.google,
                how: "Split strings into n-grams (2-3 word sequences). Compute TF-IDF weighted overlap score. Works well for longer product descriptions with shared sub-phrases.",
                score: "Score = TF-IDF cosine similarity of n-gram vectors",
                pros: ["Good for long-form text", "Handles partial phrase reuse", "No ML model needed", "Fast with sparse vectors"],
                cons: ["Poor on short strings (titles, labels)", "Sensitive to stopwords", "Needs index rebuild on TM growth"],
                use: "Best for product descriptions (100+ words). Combine with token method for short strings.",
                lib: "scikit-learn TfidfVectorizer / Elasticsearch more_like_this",
                cost: "Free, self-hosted",
              },
            ].map(t => (
              <div key={t.name} style={{ background: COLORS.bg, border: "1px solid " + t.color + "40", borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 9, color: t.color, letterSpacing: "0.1em", marginBottom: 6 }}>{t.tag}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: t.color, marginBottom: 8 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.6, marginBottom: 8 }}>{t.how}</div>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.yellow, background: COLORS.cardDark, borderRadius: 4, padding: "6px 8px", marginBottom: 8 }}>{t.score}</div>
                <div style={{ fontSize: 10, color: COLORS.deepl, letterSpacing: "0.1em", marginBottom: 4 }}>PROS</div>
                {t.pros.map(p => <div key={p} style={{ fontSize: 11, color: COLORS.textMid, marginBottom: 2 }}><span style={{ color: COLORS.deepl }}>+ </span>{p}</div>)}
                <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: "0.1em", margin: "8px 0 4px" }}>CONS</div>
                {t.cons.map(c => <div key={c} style={{ fontSize: 11, color: COLORS.textMid, marginBottom: 2 }}><span style={{ color: COLORS.red }}>- </span>{c}</div>)}
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid " + COLORS.border }}>
                  <div style={{ fontSize: 10, color: COLORS.textFaint, marginBottom: 3 }}>USE WHEN</div>
                  <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 6 }}>{t.use}</div>
                  <div style={{ fontSize: 10, color: COLORS.textFaint, marginBottom: 3 }}>LIBRARY</div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: t.color }}>{t.lib}</div>
                  <div style={{ fontSize: 10, color: COLORS.textFaint, marginTop: 6 }}>{t.cost}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14, border: "1px solid " + COLORS.border }}>
            <Label color={COLORS.yellow}>Recommended Fuzzy Match Pipeline (combine all three)</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { step: "1", label: "Token Similarity", detail: "Run rapidfuzz on every lookup. O(1) speed.", result: "Score above 95 = exact hit. Score 75-94 = fuzzy candidate. Below 75 = pass to step 2.", color: COLORS.deepl },
                { step: "2", label: "Embedding Similarity", detail: "Only if token score is 50-74. Catches paraphrases.", result: "Score above 80 = fuzzy hit. Below 80 = no match.", color: COLORS.claude },
                { step: "3", label: "N-gram for Long Text", detail: "For strings over 80 chars only. TF-IDF overlap.", result: "Score above 70 = partial phrase reuse candidate.", color: COLORS.google },
                { step: "4", label: "Composite Decision", detail: "Weighted score from all signals.", result: "Above 95% = 100% match. 75-94% = fuzzy match. Below 75% = new translation.", color: COLORS.yellow },
              ].map(s => (
                <div key={s.step} style={{ background: COLORS.cardDark, borderRadius: 6, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: s.color + "22", border: "1px solid " + s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: s.color }}>{s.step}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</div>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.5, marginBottom: 6 }}>{s.detail}</div>
                  <div style={{ fontSize: 10, color: COLORS.textFaint, lineHeight: 1.5, borderTop: "1px solid " + COLORS.border, paddingTop: 6 }}>{s.result}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: COLORS.cardDark, borderRadius: 8, padding: 14, border: "1px solid " + COLORS.border }}>
            <Label>TM Cache Key Design</Label>
            <div style={{ fontFamily: "monospace", fontSize: 11, lineHeight: 2 }}>
              <CodeLine label="KEY =" labelColor={COLORS.textBright} value="hash(sourceText + targetLang + contentType + glossaryVersion)" />
              <CodeLine value="-- Example" valueColor={COLORS.textFaint} />
              <CodeLine label="sha256(" labelColor={COLORS.deepl} value='"Lightweight Trail Runner"' valueColor={COLORS.yellow} />
              <CodeLine indent label="+" value='"de"' valueColor={COLORS.yellow} />
              <CodeLine indent label="+" value='"product_title"' valueColor={COLORS.yellow} />
              <CodeLine indent label="+" value='"glossary_v3" )' valueColor={COLORS.yellow} />
              <CodeLine value="-- Invalidate TM when glossary version changes" valueColor={COLORS.textFaint} />
              <CodeLine value="-- Use separate keys per formality level" valueColor={COLORS.textFaint} />
            </div>
          </div>
          <div style={{ background: COLORS.cardDark, borderRadius: 8, padding: 14, border: "1px solid " + COLORS.border }}>
            <Label>Real-World Cost Savings Scenarios</Label>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { scenario: "Product catalogue re-import", saving: "~90%", reason: "Descriptions unchanged, only prices and stock updated" },
                { scenario: "Seasonal copy refresh", saving: "~60%", reason: "Most boilerplate reused, only headlines change" },
                { scenario: "UI string releases", saving: "~80%", reason: "Most labels stable across versions" },
                { scenario: "New product added", saving: "~30%", reason: "Shared spec language reused across variants" },
              ].map(s => (
                <div key={s.scenario} style={{ display: "grid", gridTemplateColumns: "1fr 50px", gap: 8, alignItems: "start" }}>
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.textMid }}>{s.scenario}</div>
                    <div style={{ fontSize: 10, color: COLORS.textFaint, marginTop: 1 }}>{s.reason}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepl, textAlign: "right" }}>{s.saving}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: COLORS.textFaint, borderTop: "1px solid " + COLORS.border, paddingTop: 8 }}>
              Expire TM entries on content version change, not on a fixed timer. Tie Redis TTL to the CMS content version hash.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, background: COLORS.card, border: "1px solid " + COLORS.yellow + "40", borderRadius: 10, padding: 20 }}>
        <Label color={COLORS.yellow}>Confidence Gate — Quality Metric Comparison: COMET vs BLEURT vs BLEU</Label>
        <p style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.7, margin: "0 0 16px" }}>
          Translation APIs do not return quality scores — developers must build the scoring layer. These three metrics are the industry standards.
          None of them are APIs you call externally; they are libraries you run inside your own post-processing service.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
          {[
            {
              name: "COMET", tag: "RECOMMENDED", color: COLORS.deepl,
              type: "Neural model (transformer)", year: "2020",
              accuracy: 96, speed: 45, maintenance: 60, costScore: 55,
              accuracyLabel: "96 — Highest correlation with human judgement",
              speedLabel: "Medium — ~50ms per segment on CPU, ~5ms on GPU",
              how: "Passes source, hypothesis and reference through a pre-trained cross-lingual model (XLM-RoBERTa). Outputs a score 0-1 reflecting human-level quality judgement.",
              hosting: "Self-hosted Python library. Requires ~2GB model download. Run on your own server or container.",
              maintenance: "Model updates ~yearly. No vendor dependency. Runs entirely offline.",
              cost: "Free (open source). Infra cost: ~$50-150/mo for a dedicated scoring microservice on small GPU instance.",
              bestFor: "Product descriptions, campaign copy, any content where quality really matters",
              ref: "Reference translation optional but improves accuracy",
              badge: "BEST QUALITY",
            },
            {
              name: "BLEURT", tag: "GOOD ALTERNATIVE", color: COLORS.google,
              type: "Neural model (BERT-based)", year: "2020",
              accuracy: 88, speed: 50, maintenance: 58, costScore: 60,
              accuracyLabel: "88 — Strong correlation, slightly behind COMET",
              speedLabel: "Medium — comparable to COMET, ~40ms per segment",
              how: "Fine-tuned BERT model trained on human quality ratings from WMT competitions. Scores translation quality without needing a reference translation.",
              hosting: "Self-hosted Python library from Google Research. Requires TensorFlow.",
              maintenance: "Less actively maintained than COMET. TensorFlow dependency adds complexity.",
              cost: "Free (open source). Same infra cost as COMET. TensorFlow adds ~500MB overhead.",
              bestFor: "When you cannot provide a reference translation and need good quality signal",
              ref: "Reference-free mode available — useful when no approved translation exists",
              badge: null,
            },
            {
              name: "BLEU", tag: "FAST / LIGHTWEIGHT", color: COLORS.yellow,
              type: "Statistical (n-gram overlap)", year: "2002",
              accuracy: 52, speed: 98, maintenance: 95, costScore: 98,
              accuracyLabel: "52 — Low correlation with human judgement on short text",
              speedLabel: "Fastest — microseconds per segment, pure CPU, no model",
              how: "Counts n-gram overlaps between hypothesis and one or more reference translations. Simple ratio. No ML, no model loading, deterministic.",
              hosting: "Tiny library, runs anywhere. No GPU, no model files, no infra setup.",
              maintenance: "Zero maintenance. No model updates. Works identically forever.",
              cost: "Free. Negligible compute cost. Can run inline in your app process.",
              bestFor: "UI strings, button labels, short metadata — high volume, low stakes content",
              ref: "Requires a reference translation — needs at least one approved translation per string",
              badge: "FASTEST",
            },
          ].map(m => (
            <div key={m.name} style={{ background: COLORS.bg, border: "1px solid " + m.color + "40", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  {m.badge && <div style={{ fontSize: 9, color: m.color, letterSpacing: "0.1em", marginBottom: 4 }}>{m.badge}</div>}
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: COLORS.textFaint, marginTop: 2 }}>{m.type} · {m.year}</div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
                {[
                  { label: "Accuracy", value: m.accuracy, color: m.color },
                  { label: "Speed", value: m.speed, color: COLORS.yellow },
                  { label: "Ease of Maintenance", value: m.maintenance, color: COLORS.google },
                  { label: "Cost Efficiency", value: m.costScore, color: COLORS.deepl },
                ].map(r => (
                  <div key={r.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: COLORS.textFaint }}>{r.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: r.color }}>{r.value}</span>
                    </div>
                    <Bar value={r.value} color={r.color} />
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { k: "How it works", v: m.how },
                  { k: "Hosting", v: m.hosting },
                  { k: "Maintenance", v: m.maintenance_text || m.maintenance + "/100 ease score — " + (m.name === "BLEU" ? "zero effort, no model" : "model updates yearly") },
                  { k: "Cost", v: m.cost },
                  { k: "Best for", v: m.bestFor },
                  { k: "Reference needed", v: m.ref },
                ].map(row => (
                  <div key={row.k}>
                    <div style={{ fontSize: 9, color: m.color, letterSpacing: "0.1em", marginBottom: 2 }}>{row.k.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>{row.v}</div>
                  </div>
                ))}
                <div style={{ fontFamily: "monospace", fontSize: 10, color: m.color, background: COLORS.cardDark, borderRadius: 4, padding: "5px 8px", marginTop: 4 }}>{m.install}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: COLORS.cardDark, borderRadius: 8, padding: 16, border: "1px solid " + COLORS.border, marginBottom: 12 }}>
          <Label color={COLORS.yellow}>Recommended Composite Scoring Formula</Label>
          <p style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.7, margin: "0 0 12px" }}>
            Use all three in combination. COMET is the most accurate but needs a model. BLEU is instant and free. Rule-based checks catch hard failures no metric will catch.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 11, lineHeight: 2, color: COLORS.textDim }}>
                <CodeLine label="composite =" labelColor={COLORS.textBright} value="" />
                <CodeLine indent label="(COMET_score" labelColor={COLORS.deepl} value="* 0.55)" valueColor={COLORS.textMid} />
                <CodeLine indent label="+ (BLEU_score" labelColor={COLORS.yellow} value="* 0.15)" valueColor={COLORS.textMid} />
                <CodeLine indent label="+ (rule_checks" labelColor={COLORS.google} value="* 0.30)" valueColor={COLORS.textMid} />
                <div style={{ marginTop: 8, color: COLORS.textFaint, fontSize: 10 }}>-- rule_checks: placeholders intact + glossary terms preserved + length ratio ok</div>
                <div style={{ marginTop: 8 }}>
                  <CodeLine label="if composite" labelColor={COLORS.textFaint} value="> 0.95  -->  auto-publish" valueColor={COLORS.deepl} />
                  <CodeLine label="if composite" labelColor={COLORS.textFaint} value="> 0.80  -->  editor review" valueColor={COLORS.yellow} />
                  <CodeLine label="if composite" labelColor={COLORS.textFaint} value="< 0.80  -->  block + re-translate" valueColor={COLORS.red} />
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 10, color: COLORS.textFaint, letterSpacing: "0.1em", marginBottom: 2 }}>THRESHOLD TUNING BY CONTENT TYPE</div>
              {[
                { type: "Hero banners / Campaign", pub: "0.97", review: "0.88", color: COLORS.claude },
                { type: "Product descriptions", pub: "0.95", review: "0.82", color: COLORS.deepl },
                { type: "UI labels / Buttons", pub: "0.88", review: "0.75", color: COLORS.google },
                { type: "Legal / T&C text", pub: "0.99", review: "0.92", color: COLORS.red },
                { type: "SEO meta tags", pub: "0.93", review: "0.80", color: COLORS.yellow },
              ].map(r => (
                <div key={r.type} style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px", gap: 8, padding: "6px 10px", background: COLORS.bg, borderRadius: 5, fontSize: 11, alignItems: "center" }}>
                  <div style={{ color: COLORS.textMid }}>{r.type}</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: COLORS.textFaint }}>auto-pub</div>
                    <div style={{ fontWeight: 700, color: COLORS.deepl }}>{r.pub}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: COLORS.textFaint }}>review</div>
                    <div style={{ fontWeight: 700, color: COLORS.yellow }}>{r.review}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: COLORS.cardDark, borderRadius: 8, padding: 14, border: "1px solid " + COLORS.border }}>
          <Label color={COLORS.deepl}>Implementation Phases — Start Simple, Add Complexity</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { phase: "Phase 1", label: "Rule-Based Only", timeline: "Day 1", color: COLORS.google, items: ["Check all placeholders present", "Check glossary terms untranslated", "Length ratio 0.4x to 3x source", "No source-language chars in output", "Zero infra cost, catches worst failures"] },
              { phase: "Phase 2", label: "+ BLEU Scoring", timeline: "Week 1", color: COLORS.yellow, items: ["Add sacrebleu library", "Requires reference translations", "Great for UI strings and titles", "Run inline — no separate service", "Tune thresholds against editor feedback"] },
              { phase: "Phase 3", label: "+ COMET Scoring", timeline: "Month 1", color: COLORS.deepl, items: ["Deploy COMET as microservice", "~2GB model, GPU optional", "Highest accuracy for long content", "Composite score with Phase 1+2", "Retune thresholds with real production data"] },
            ].map(p => (
              <div key={p.phase} style={{ background: COLORS.bg, border: "1px solid " + p.color + "40", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 9, color: p.color, letterSpacing: "0.1em", marginBottom: 4 }}>{p.phase} — {p.timeline}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: p.color, marginBottom: 8 }}>{p.label}</div>
                {p.items.map(i => <div key={i} style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 3 }}><span style={{ color: p.color }}>+ </span>{i}</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelsTab() {
  const claudeModels = [
    { model: "claude-haiku-4-5", tier: "Speed / Budget", input: "$0.80/M", output: "$4/M", use: "Bulk product titles, short strings, UI labels — high volume, cost sensitive", color: COLORS.yellow },
    { model: "claude-sonnet-4-6", tier: "Balanced — Recommended", input: "$3/M", output: "$15/M", use: "Product descriptions, blog content, category pages — best accuracy to cost ratio", color: COLORS.claude, highlight: true },
    { model: "claude-opus-4-6", tier: "Premium Quality", input: "$15/M", output: "$75/M", use: "Campaign copy, brand manifesto, hero banners — where native voice matters most", color: COLORS.red },
  ];
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: COLORS.card, border: "1px solid " + COLORS.deepl + "40", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div><Label color={COLORS.deepl}>DEEPL</Label><h3 style={{ margin: 0, fontSize: 17 }}>DeepL API Pro</h3></div>
            <span style={{ fontSize: 22 }}>🔵</span>
          </div>
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            {[
              { tier: "Free", price: "$0", limit: "500K chars/mo" },
              { tier: "Starter", price: "$8.99/mo", limit: "1M chars included" },
              { tier: "Advanced", price: "$57/mo", limit: "5M chars included" },
              { tier: "Pay-as-you-go", price: "$25/M chars", limit: "No monthly fee", highlight: true },
            ].map(t => (
              <div key={t.tier} style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", gap: 8, padding: "7px 10px", background: t.highlight ? COLORS.deepl + "11" : COLORS.bg, borderRadius: 5, fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: t.highlight ? COLORS.deepl : COLORS.textBright }}>{t.tier}</div>
                <div style={{ color: COLORS.deepl }}>{t.price}</div>
                <div style={{ color: COLORS.textFaint }}>{t.limit}</div>
              </div>
            ))}
          </div>
          <div style={{ background: COLORS.bg, borderRadius: 6, padding: 12 }}>
            <Label color={COLORS.deepl}>Recommended Use</Label>
            <div style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.6 }}>Use DeepL API Pro with glossary support. Enable formality parameter for DE, FR, ES, IT, NL, PL, PT, RU, JA. Cache all responses in TM layer.</div>
          </div>
        </div>

        <div style={{ background: COLORS.card, border: "1px solid " + COLORS.google + "40", borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div><Label color={COLORS.google}>GOOGLE</Label><h3 style={{ margin: 0, fontSize: 17 }}>Cloud Translation API</h3></div>
            <span style={{ fontSize: 22 }}>🔴</span>
          </div>
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            {[
              { tier: "Free Tier", price: "$0", limit: "500K chars/mo" },
              { tier: "Basic API", price: "$20/M chars", limit: "After free tier" },
              { tier: "Advanced API", price: "$80/M chars", limit: "Custom models" },
              { tier: "Basic at scale", price: "$20/M chars", limit: "Pay per use", highlight: true },
            ].map(t => (
              <div key={t.tier} style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", gap: 8, padding: "7px 10px", background: t.highlight ? COLORS.google + "11" : COLORS.bg, borderRadius: 5, fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: t.highlight ? COLORS.google : COLORS.textBright }}>{t.tier}</div>
                <div style={{ color: COLORS.google }}>{t.price}</div>
                <div style={{ color: COLORS.textFaint }}>{t.limit}</div>
              </div>
            ))}
          </div>
          <div style={{ background: COLORS.bg, borderRadius: 6, padding: 12 }}>
            <Label color={COLORS.google}>Recommended Use</Label>
            <div style={{ fontSize: 12, color: COLORS.textDim, lineHeight: 1.6 }}>Use Translation API v3 Basic for fallback. Use the glossaries feature for terminology control. Always specify source language explicitly.</div>
          </div>
        </div>
      </div>

      <div style={{ background: COLORS.card, border: "1px solid " + COLORS.claude + "40", borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><Label color={COLORS.claude}>ANTHROPIC / CLAUDE</Label><h3 style={{ margin: 0, fontSize: 17 }}>Recommended Claude Models for Translation</h3></div>
          <span style={{ fontSize: 22 }}>🟠</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {claudeModels.map(m => (
            <div key={m.model} style={{ background: m.highlight ? COLORS.claude + "11" : COLORS.bg, border: "1px solid " + m.color + "40", borderRadius: 8, padding: 14 }}>
              {m.highlight && <div style={{ fontSize: 9, color: m.color, letterSpacing: "0.12em", marginBottom: 6 }}>RECOMMENDED FOR TRANSLATION</div>}
              <div style={{ fontSize: 10, color: COLORS.textFaint, marginBottom: 3 }}>{m.tier}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: m.color, marginBottom: 8, fontFamily: "monospace" }}>{m.model}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <div style={{ background: COLORS.bg, borderRadius: 3, padding: "3px 7px", fontSize: 10 }}><span style={{ color: COLORS.textFaint }}>in: </span><span style={{ color: COLORS.deepl }}>{m.input}</span></div>
                <div style={{ background: COLORS.bg, borderRadius: 3, padding: "3px 7px", fontSize: 10 }}><span style={{ color: COLORS.textFaint }}>out: </span><span style={{ color: COLORS.deepl }}>{m.output}</span></div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.6 }}>{m.use}</div>
            </div>
          ))}
        </div>
        <div style={{ background: COLORS.bg, borderRadius: 6, padding: 12 }}>
          <Label color={COLORS.claude}>System Prompt Template</Label>
          <div style={{ fontSize: 11, color: COLORS.textDim, fontFamily: "monospace", lineHeight: 1.9 }}>
            You are a professional e-commerce translator for [BRAND]. Translate the following [CONTENT_TYPE] from English to [TARGET_LANG].
            Preserve HTML tags. Do not translate: [GLOSSARY_TERMS]. Match the brand tone: [professional / casual / luxury].
            Return ONLY the translated text.
          </div>
        </div>
      </div>
      <div style={{ background: COLORS.card, border: "1px solid " + COLORS.gemma + "40", borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div><Label color={COLORS.gemma}>GOOGLE (OPEN-WEIGHT)</Label><h3 style={{ margin: 0, fontSize: 17 }}>TranslateGemma — Self-Hosted Translation</h3></div>
          <span style={{ fontSize: 22 }}>💎</span>
        </div>

        <div style={{ background: COLORS.gemma + "0D", border: "1px solid " + COLORS.gemma + "35", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 12, color: COLORS.textDim, lineHeight: 1.7 }}>
          Open-weight translation model built on Gemma 3, released January 2026. Available in 4B, 12B, and 27B parameter sizes. Runs on your own GPU — zero per-character API fees. Trained with RLHF (MetricX-QE reward) on 55 evaluated languages + 500 experimental language pairs.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { size: "4B", vram: "~8–10 GB", hw: "RTX 3080 / 4080", speed: "80–120 tok/s", use: "Mobile, edge, offline apps. Fine-tuning experiments.", badge: "LIGHTEST", badgeColor: COLORS.google },
            { size: "12B", vram: "~24 GB", hw: "RTX 3090 / 4090 / A5000", speed: "35–70 tok/s", use: "Recommended for production CMS. Best accuracy-to-cost ratio.", badge: "RECOMMENDED", badgeColor: COLORS.gemma },
            { size: "27B", vram: "~48–55 GB", hw: "A100 80GB / H100", speed: "15–30 tok/s", use: "Highest quality. Use when 12B falls short on low-resource languages.", badge: "HIGHEST QUALITY", badgeColor: COLORS.purple },
          ].map(m => (
            <div key={m.size} style={{ background: m.badge === "RECOMMENDED" ? COLORS.gemma + "0D" : COLORS.bg, border: "1px solid " + (m.badge === "RECOMMENDED" ? COLORS.gemma : COLORS.border) + "60", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 9, color: m.badgeColor, letterSpacing: "0.12em", marginBottom: 6 }}>{m.badge}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.gemma, marginBottom: 2 }}>{m.size}</div>
              <div style={{ fontSize: 10, color: COLORS.textFaint, marginBottom: 8 }}>parameters</div>
              {[["VRAM Required", m.vram, COLORS.gemma], ["Hardware", m.hw, COLORS.textMid], ["Throughput", m.speed, COLORS.yellow]].map(([k,v,c]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 4, marginBottom: 4 }}>
                  <div style={{ fontSize: 9, color: COLORS.textFaint }}>{k}</div>
                  <div style={{ fontSize: 11, color: c, fontWeight: 600 }}>{v}</div>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid " + COLORS.border, fontSize: 11, color: COLORS.textDim, lineHeight: 1.5 }}>{m.use}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14 }}>
            <Label color={COLORS.gemma}>Cost Breakdown</Label>
            {[
              { tier: "Hugging Face / Local dev", price: "Free", note: "Testing only" },
              { tier: "Vertex AI (managed)", price: "~$0.80–2.50/hr", note: "Google hosted, pay-as-you-go" },
              { tier: "Cloud GPU (12B, A10G)", price: "~$1.10–1.50/hr", note: "AWS / GCP / Azure" },
              { tier: "Cloud GPU (27B, A100)", price: "~$3.50–5.00/hr", note: "Highest quality" },
              { tier: "On-prem RTX 4090 (12B)", price: "~$2,000–2,500", note: "One-time · amortised over years", highlight: true },
            ].map(t => (
              <div key={t.tier} style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8, padding: "6px 0", borderBottom: "1px solid " + COLORS.border, fontSize: 11, alignItems: "start" }}>
                <div>
                  <div style={{ color: t.highlight ? COLORS.gemma : COLORS.textMid, fontWeight: t.highlight ? 700 : 400 }}>{t.tier}</div>
                  <div style={{ fontSize: 10, color: COLORS.textFaint }}>{t.note}</div>
                </div>
                <div style={{ color: t.highlight ? COLORS.gemma : COLORS.deepl, fontWeight: 700, textAlign: "right" }}>{t.price}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11, color: COLORS.textFaint, lineHeight: 1.5 }}>
              Break-even vs DeepL ($25/M chars): ~4–6 months at 200M+ chars/mo on dedicated hardware.
            </div>
          </div>

          <div style={{ background: COLORS.bg, borderRadius: 8, padding: 14 }}>
            <Label color={COLORS.gemma}>When to Use TranslateGemma</Label>
            <div style={{ display: "grid", gap: 6 }}>
              {[
                { use: "GDPR / data sovereignty", note: "Content never leaves your infrastructure", icon: "🔒" },
                { use: "Very high volume (200M+ chars/mo)", note: "API costs exceed self-hosting costs", icon: "📈" },
                { use: "Image translation needed", note: "Built-in multimodal — no extra OCR layer", icon: "🖼️" },
                { use: "Domain fine-tuning", note: "Train on your product catalog or legal corpus", icon: "🎯" },
                { use: "Offline / air-gapped systems", note: "No internet dependency at inference time", icon: "✈️" },
              ].map(r => (
                <div key={r.use} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 8, padding: "6px 0", borderBottom: "1px solid " + COLORS.border }}>
                  <div style={{ fontSize: 14 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.gemma, fontWeight: 700 }}>{r.use}</div>
                    <div style={{ fontSize: 10, color: COLORS.textFaint }}>{r.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: COLORS.bg, borderRadius: 6, padding: 12 }}>
          <Label color={COLORS.gemma}>Deployment Stack</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { label: "Model weights", value: "Hugging Face Hub | google/translate-gemma-*", color: COLORS.gemma },
              { label: "Inference server", value: "vLLM or TGI (OpenAI-compatible API)", color: COLORS.deepl },
              { label: "Glossary control", value: "Prompt engineering or fine-tune on terminology", color: COLORS.yellow },
              { label: "Monitoring", value: "Prometheus + Grafana | GPU util, queue depth", color: COLORS.purple },
            ].map(d => (
              <div key={d.label} style={{ background: COLORS.cardDark, borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 9, color: d.color, letterSpacing: "0.1em", marginBottom: 4 }}>{d.label.toUpperCase()}</div>
                <div style={{ fontSize: 11, color: COLORS.textMid, fontFamily: "monospace", lineHeight: 1.6, whiteSpace: "normal" }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Node detail descriptions shown in the info panel ──────────────────────
const NODE_DETAILS = {
  cms:      { title: "CMS / Content Editor", desc: "The starting point. Editors write English source content here — product titles, descriptions, hero banners, UI labels. Each field save triggers the translation pipeline via a webhook or event.", tags: ["Rich text editor", "Field-level triggers", "Content type tagging", "Webhook on save"] },
  pre:      { title: "Pre-Processing Layer", desc: "Prepares raw text before it reaches any translation API. Protects {placeholders} and HTML tags so they survive translation intact. Looks up glossary terms to flag must-not-translate words. Classifies content type to inform routing.", tags: ["Placeholder protection", "HTML tag handling", "Glossary lookup", "Content classification"] },
  tm:       { title: "Translation Memory", desc: "Redis cache keyed by SHA-256(text + language + contentType + glossaryVersion). An exact hit means zero API cost and near-instant delivery. A fuzzy hit (75–99% similarity) is served as a draft and flagged for review. TM reduces API spend by 40–70% at scale.", tags: ["Exact match → $0 cost", "Fuzzy match → draft + review", "Redis or TM database", "40–70% cost reduction"] },
  router:   { title: "Smart Router", desc: "Picks the best translation engine for each request. Brand-critical copy (hero banners, campaign text) always goes to Claude. UI labels go to Google for speed. Product content for supported languages goes to DeepL. Privacy-sensitive or GDPR-critical content is routed to self-hosted TranslateGemma. Everything else falls back to Google.", tags: ["Claude for brand copy", "DeepL for EU + JA + ZH", "Google for UI + long-tail", "TranslateGemma for privacy", "Cost-aware routing"] },
  glossary: { title: "Glossary Database", desc: "A list of brand terms and product names that must never be translated — e.g. AirMax Pro, FreeReturn, ProCard. Terms are injected into DeepL as a registered glossary and wrapped in <span translate=no> for Google. Claude receives them in the system prompt DO NOT TRANSLATE block.", tags: ["DeepL glossary API", "Google span translate=no", "Claude system prompt block", "Version-controlled"] },
  deepl:    { title: "DeepL API", desc: "Primary translation engine for 33 supported languages including all major EU markets plus JA and ZH. Context injection on every call: glossary_id, formality (formal/informal per market), context paragraph for disambiguation, tag_handling for HTML/placeholder safety.", tags: ["33 languages", "Formality control", "Glossary support", "Context-aware"] },
  google:   { title: "Google Cloud Translate", desc: "Fallback engine covering 133 languages — handles everything DeepL cannot. Also used for high-volume UI strings where speed and cost matter more than nuance. Always specify source language explicitly (never auto-detect) to save latency.", tags: ["133 languages", "Fastest API", "$20/M chars", "UI string optimised"] },
  claudeai: { title: "Claude API", desc: "Premium translation layer for brand-critical content. Receives a full system prompt with brand voice guide, content type context, glossary block, and few-shot examples. Returns native-quality output that matches brand tone. Use claude-sonnet-4-6 for balanced quality/cost.", tags: ["Full brand context prompt", "Hero banners + campaigns", "claude-sonnet-4-6", "Native voice quality"] },
  post:     { title: "Post-Processing", desc: "Runs after the engine returns. Restores all {placeholder} tokens that were protected during pre-processing. Validates that every placeholder and glossary term survived the translation intact. Checks output length ratio is reasonable. Computes rule-based quality score.", tags: ["Placeholder restoration", "Glossary term validation", "Length ratio check", "Rule-based scoring"] },
  gate:     { title: "Confidence Gate", desc: "Scores every translation using a composite formula: (BLEU × 0.40) + (rule checks × 0.60). Based on the score and content type, it decides whether to auto-publish, send to editor review queue, or block the translation entirely. Thresholds are tunable per content type.", tags: [">95% → auto-publish", "80–95% → editor review", "<80% → blocked", "BLEU + rule scoring"] },
  pub:      { title: "Auto Publish", desc: "Translation scored above the auto-publish threshold for its content type. Pushed directly to the storefront CDN and goes live immediately. No human review needed. Cached in Translation Memory for future reuse.", tags: ["Goes live immediately", "Pushed to CDN", "Stored in TM cache", "Zero manual work"] },
  review:   { title: "Human Review Queue", desc: "Translation scored between the review and auto-publish thresholds. Saved as a draft and an editor is notified. The editor can approve (publishes immediately), edit and approve, or reject (triggers re-translation). Useful for campaign copy and legal text.", tags: ["Editor notified", "Approve / edit / reject", "Useful for legal copy", "Audit trail kept"] },
  blocked:  { title: "Blocked — Requires Rework", desc: "Translation scored below the review threshold — quality was too poor to even show a draft to an editor. The system logs the failure, triggers automatic re-translation with a different engine or prompt variation, and notifies the team if repeated failures occur.", tags: ["Not shown to editors", "Auto re-translate triggered", "Failure logged", "Team alerted on repeat failure"] },
  translategemma: { title: "TranslateGemma (Self-Hosted)", desc: "Open-weight translation model from Google (4B/12B/27B parameters), running on your own GPU infrastructure. Translates across 55 languages with quality competitive with cloud APIs. Retains full multimodal support for image translation. Zero per-character API fees — you pay only for compute. Ideal for privacy-sensitive workloads where content must never leave your infrastructure, and for high-volume batches where cloud API costs become prohibitive.", tags: ["Open-weight / Gemma 3", "55 evaluated languages", "Self-hosted GPU", "Image translation (multimodal)", "Zero API fees", "Fine-tunable", "Offline / air-gapped"] },
};

const EDGE_DETAILS = {
  "cms→pre":       { label: "Raw Text", desc: "The English source text is passed to the Pre-Processing layer along with its content type, field ID, and content version." },
  "pre→tm":        { label: "TM Check", desc: "Pre-processed text is hashed and looked up in the Translation Memory cache before any API call is made." },
  "pre→router":    { label: "Classified Content", desc: "If no TM hit, the classified, placeholder-protected content is sent to the Smart Router to pick an engine." },
  "tm→router":     { label: "Cache Miss", desc: "No exact or fuzzy match found in TM. Routing proceeds to select a translation engine." },
  "tm→post":       { label: "Cache Hit — Skip API", desc: "Exact TM match found. Translation served instantly from Redis. Skips router, engine, and post-processing entirely." },
  "glossary→router": { label: "Brand Terms", desc: "Glossary terms detected in the source text are passed to the router so the selected engine can be configured to protect them." },
  "router→deepl":  { label: "Major Languages", desc: "Content destined for DE, FR, ES, IT, NL, PL, PT, JA, ZH — DeepL's supported languages — is routed here for highest natural quality." },
  "router→google": { label: "Long-tail / UI Strings", desc: "Content for languages DeepL doesn't support (TH, MS, SW, etc.) and all UI label strings regardless of language go to Google Translate." },
  "router→claudeai": { label: "Brand-Critical Copy", desc: "Hero banners and campaign copy are always routed to Claude regardless of target language, for maximum brand voice fidelity." },
  "deepl→post":    { label: "Translated Text", desc: "DeepL returns the translated text with HTML tags and placeholder tokens preserved. Passed to Post-Processing." },
  "google→post":   { label: "Translated Text", desc: "Google returns the translated text. Span tags around glossary terms are stripped. Passed to Post-Processing." },
  "claudeai→post": { label: "Translated Text", desc: "Claude returns only the translated text (no preamble). Passed to Post-Processing." },
  "post→gate":     { label: "Scored Translation", desc: "Restored, validated translation with a computed rule-based quality score is passed to the Confidence Gate for the publish decision." },
  "gate→pub":      { label: ">95% Confidence", desc: "Score above the auto-publish threshold for this content type. Translation is immediately live on the storefront." },
  "gate→review":   { label: "80–95% Confidence", desc: "Score is acceptable but not great. Editor is notified and reviews the draft before it goes live." },
  "gate→blocked":  { label: "<80% Confidence", desc: "Score too low to even review. Re-translation is triggered automatically." },
  "router→translategemma": { label: "Privacy / Batch", desc: "Content flagged as GDPR-sensitive or high-volume batch jobs is routed to self-hosted TranslateGemma, ensuring data never leaves your infrastructure." },
  "translategemma→post": { label: "Translated Text", desc: "TranslateGemma returns the translated text from your local GPU. Passed to Post-Processing for placeholder restoration and quality scoring." },
};

function DiagramTab() {
  const [selected, setSelected] = useState(null);       // node id or edge key "from→to"
  const [selType, setSelType] = useState(null);          // "node" or "edge"

  const selectNode = (id) => {
    if (selected === id && selType === "node") { setSelected(null); setSelType(null); }
    else { setSelected(id); setSelType("node"); }
  };
  const selectEdge = (key) => {
    if (selected === key && selType === "edge") { setSelected(null); setSelType(null); }
    else { setSelected(key); setSelType("edge"); }
  };
  const clearSelection = () => { setSelected(null); setSelType(null); };

  const W = 1120;
  const H = 720;

  // ── Nodes ──────────────────────────────────────────────────────────────────
  const nodes = [
    { id: "cms",      x: 440, y: 30,  w: 200, h: 56, label: "CMS / Content Editor", sublabel: "English source content", color: COLORS.claude,  icon: "✏️" },
    { id: "pre",      x: 340, y: 140, w: 400, h: 56, label: "Pre-Processing Layer",  sublabel: "Classify · Protect tags · Inject context · Glossary lookup", color: COLORS.yellow, icon: "⚙️" },
    { id: "tm",       x: 20,  y: 250, w: 180, h: 56, label: "Translation Memory",    sublabel: "Redis cache · TM lookup",   color: COLORS.deepl,  icon: "💾" },
    { id: "router",   x: 440, y: 250, w: 200, h: 56, label: "Smart Router",          sublabel: "Content type · Language · Cost", color: COLORS.textBright, icon: "🔀", dark: true },
    { id: "glossary", x: 860, y: 250, w: 200, h: 56, label: "Glossary DB",           sublabel: "Brand terms · Do-not-translate", color: COLORS.azure, icon: "📖" },
    { id: "deepl",    x: 60,  y: 370, w: 180, h: 72, label: "DeepL API",             sublabel: "DE FR ES IT NL PL PT JA ZH · Formality · Glossary", color: COLORS.deepl,  icon: "🔵" },
    { id: "google",   x: 420, y: 370, w: 170, h: 72, label: "Google Translate",      sublabel: "133 languages · Fallback · UI strings", color: COLORS.google, icon: "🔴" },
    { id: "claudeai",      x: 780, y: 370, w: 160, h: 72, label: "Claude API",            sublabel: "Campaign copy · Brand voice · Nuance", color: COLORS.claude, icon: "🟠" },
    { id: "translategemma", x: 960, y: 370, w: 110, h: 72, label: "TranslateGemma",       sublabel: "Self-hosted · Privacy · Offline", color: COLORS.gemma,  icon: "💎" },
    { id: "post",     x: 340, y: 490, w: 400, h: 56, label: "Post-Processing",       sublabel: "Restore tags · Quality score · Store to TM", color: COLORS.purple, icon: "🔧" },
    { id: "gate",     x: 440, y: 590, w: 200, h: 56, label: "Confidence Gate",       sublabel: ">95% auto-publish · 80-95% review · <80% block", color: COLORS.yellow, icon: "🚦" },
    { id: "pub",      x: 200, y: 680, w: 160, h: 48, label: "Auto Publish",          sublabel: "Storefront CDN",            color: COLORS.deepl,  icon: "✅" },
    { id: "review",   x: 460, y: 680, w: 160, h: 48, label: "Human Review",          sublabel: "Editor queue",              color: COLORS.yellow, icon: "👤" },
    { id: "blocked",  x: 720, y: 680, w: 160, h: 48, label: "Blocked",               sublabel: "Requires rework",           color: COLORS.red,    icon: "🚫" },
  ];

  // ── Edges ──────────────────────────────────────────────────────────────────
  const edges = [
    { from: "cms",      to: "pre",      label: "raw text",         color: COLORS.claude },
    { from: "pre",      to: "tm",       label: "TM check",         color: COLORS.deepl,  dashed: true },
    { from: "tm",       to: "router",   label: "miss",             color: COLORS.textFaint, dashed: true },
    { from: "tm",       to: "post",     label: "hit — skip API",   color: COLORS.deepl,  dashed: true },
    { from: "pre",      to: "router",   label: "classified",       color: COLORS.yellow },
    { from: "glossary", to: "router",   label: "terms",            color: COLORS.azure,  dashed: true },
    { from: "router",   to: "deepl",    label: "major langs",      color: COLORS.deepl },
    { from: "router",   to: "google",   label: "long-tail / UI",   color: COLORS.google },
    { from: "router",   to: "claudeai",      label: "brand copy",   color: COLORS.claude },
    { from: "router",   to: "translategemma", label: "privacy/batch", color: COLORS.gemma },
    { from: "deepl",    to: "post",     label: "",                 color: COLORS.deepl },
    { from: "google",   to: "post",     label: "",                 color: COLORS.google },
    { from: "claudeai",      to: "post",     label: "",             color: COLORS.claude },
    { from: "translategemma", to: "post",     label: "",              color: COLORS.gemma },
    { from: "post",     to: "gate",     label: "scored",           color: COLORS.purple },
    { from: "gate",     to: "pub",      label: ">95%",             color: COLORS.deepl },
    { from: "gate",     to: "review",   label: "80-95%",           color: COLORS.yellow },
    { from: "gate",     to: "blocked",  label: "<80%",             color: COLORS.red },
  ];

  // Helper: centre of a node
  const cx = (id) => { const n = nodes.find(n => n.id === id); return n.x + n.w / 2; };
  const cy = (id) => { const n = nodes.find(n => n.id === id); return n.y + n.h / 2; };
  const bot = (id) => { const n = nodes.find(n => n.id === id); return n.y + n.h; };
  const top = (id) => { const n = nodes.find(n => n.id === id); return n.y; };
  const left = (id) => { const n = nodes.find(n => n.id === id); return n.x; };
  const right = (id) => { const n = nodes.find(n => n.id === id); return n.x + n.w; };

  // Build path for each edge
  function buildPath(e) {
    const fx = cx(e.from), fy = bot(e.from);
    const tx = cx(e.to),   ty = top(e.to);

    // Special horizontal routes
    if (e.from === "pre" && e.to === "tm") {
      return "M " + cx("pre") + " " + bot("pre") + " L " + cx("pre") + " " + (bot("pre") + 20) + " L " + cx("tm") + " " + (bot("pre") + 20) + " L " + cx("tm") + " " + top("tm");
    }
    if (e.from === "tm" && e.to === "router") {
      return "M " + right("tm") + " " + cy("tm") + " L " + left("router") + " " + cy("router");
    }
    if (e.from === "tm" && e.to === "post") {
      return "M " + cx("tm") + " " + bot("tm") + " L " + cx("tm") + " " + (bot("tm") + 40) + " L " + cx("post") + " " + (bot("tm") + 40) + " L " + cx("post") + " " + top("post");
    }
    if (e.from === "glossary" && e.to === "router") {
      return "M " + left("glossary") + " " + cy("glossary") + " L " + right("router") + " " + cy("router");
    }
    // Default straight with slight curve
    const my = (fy + ty) / 2;
    return "M " + fx + " " + fy + " C " + fx + " " + my + " " + tx + " " + my + " " + tx + " " + ty;
  }

  const legendItems = [
    { color: COLORS.deepl,  label: "DeepL route" },
    { color: COLORS.google, label: "Google route" },
    { color: COLORS.claude, label: "Claude route" },
    { color: COLORS.yellow, label: "Internal flow" },
    { color: COLORS.gemma, label: "TranslateGemma route" },
    { color: COLORS.textFaint, label: "Conditional / TM", dashed: true },
  ];

  // Derive active node/edge for highlighting
  const activeNodeId   = selType === "node" ? selected : null;
  const activeEdgeKey  = selType === "edge" ? selected : null;

  // Panel data
  const panelNode = activeNodeId ? nodes.find(n => n.id === activeNodeId) : null;
  const panelEdge = activeEdgeKey ? edges.find(e => (e.from + "→" + e.to) === activeEdgeKey) : null;
  const panelNodeDetail = activeNodeId ? NODE_DETAILS[activeNodeId] : null;
  const panelEdgeDetail = activeEdgeKey ? EDGE_DETAILS[activeEdgeKey] : null;
  const connectedEdges  = activeNodeId ? edges.filter(e => e.from === activeNodeId || e.to === activeNodeId) : [];

  return (
    <div>
      <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 16, letterSpacing: "0.1em" }}>
        INTERACTIVE ARCHITECTURE DIAGRAM — click any node or connection arrow to see details below
      </div>

      <div style={{ background: COLORS.cardDark, border: "1px solid " + COLORS.border, borderRadius: 12, padding: 20, overflowX: "auto" }}>
        <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", minWidth: 700, display: "block" }}>
          <defs>
            {["deepl","google","claude","yellow","purple","red","azure","gemma","textFaint"].map(k => (
              <marker key={k} id={"arrow-" + k} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={COLORS[k] || COLORS.textFaint} opacity="0.9" />
              </marker>
            ))}
          </defs>

          {/* Background layer bands */}
          {[
            { y: 20,  h: 76,  label: "INPUT",               color: COLORS.claude },
            { y: 120, h: 86,  label: "PRE-PROCESSING",       color: COLORS.yellow },
            { y: 228, h: 106, label: "CACHE + ROUTING",      color: COLORS.deepl },
            { y: 356, h: 116, label: "TRANSLATION ENGINES (DeepL · Google · Claude · TranslateGemma)", color: COLORS.google },
            { y: 478, h: 86,  label: "POST-PROCESSING",      color: COLORS.purple },
            { y: 576, h: 86,  label: "CONFIDENCE GATE",      color: COLORS.yellow },
            { y: 668, h: 68,  label: "OUTPUT",               color: COLORS.deepl },
          ].map((band, i) => (
            <g key={i}>
              <rect x={0} y={band.y} width={W} height={band.h} fill={band.color} fillOpacity={0.06} rx={4} />
              <text x={8} y={band.y + 13} fontSize={8} fill={band.color} opacity={0.5} fontFamily="monospace" letterSpacing="0.12em">{band.label}</text>
            </g>
          ))}

          {/* Edges — clickable hit area + visible stroke */}
          {edges.map((e, i) => {
            const edgeKey = e.from + "→" + e.to;
            const isSelEdge = activeEdgeKey === edgeKey;
            const isRelated = activeNodeId === e.from || activeNodeId === e.to;
            const isHighlit = isSelEdge || isRelated;
            const colorKey = e.color === COLORS.deepl ? "deepl" : e.color === COLORS.google ? "google" : e.color === COLORS.claude ? "claude" : e.color === COLORS.yellow ? "yellow" : e.color === COLORS.purple ? "purple" : e.color === COLORS.red ? "red" : e.color === COLORS.azure ? "azure" : "textFaint";
            const pathD = buildPath(e);

            // Midpoint for label
            const parts = pathD.replace(/[MCL]/g, "|").split("|").filter(Boolean);
            const coords = parts.map(p => p.trim().split(/[ ,]+/).map(Number));
            const mid = coords[Math.floor(coords.length / 2)];

            return (
              <g key={i} onClick={() => selectEdge(edgeKey)} style={{ cursor: "pointer" }}>
                {/* Invisible wide hit area so click is easy */}
                <path d={pathD} fill="none" stroke="transparent" strokeWidth={18} />
                {/* Visible stroke */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={isHighlit ? 3 : 1.5}
                  strokeOpacity={isHighlit ? 1 : (selected ? 0.18 : 0.45)}
                  strokeDasharray={e.dashed ? "5,4" : "none"}
                  markerEnd={"url(#arrow-" + colorKey + ")"}
                />
                {/* Edge label */}
                {e.label && mid && mid.length >= 2 && (
                  <g>
                    <rect x={mid[0] - 32} y={mid[1] - 10} width={64} height={16} rx={4}
                      fill={isSelEdge ? e.color : COLORS.bg}
                      fillOpacity={isSelEdge ? 0.92 : 0.9}
                      stroke={e.color} strokeWidth={isSelEdge ? 1.5 : 0.5} strokeOpacity={0.5}
                    />
                    <text x={mid[0]} y={mid[1] + 3} textAnchor="middle" fontSize={8.5}
                      fill={isSelEdge ? "#fff" : e.color}
                      fontFamily="monospace" fontWeight={isSelEdge ? "700" : "400"}>
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes — clickable */}
          {nodes.map(n => {
            const isSel     = activeNodeId === n.id;
            const isRelated = connectedEdges.some(e => e.from === n.id || e.to === n.id) && !isSel;
            const dimmed    = selected && !isSel && !isRelated && selType === "node";
            return (
              <g key={n.id} onClick={() => selectNode(n.id)} style={{ cursor: "pointer" }}>
                {/* Selection ring */}
                {isSel && (
                  <rect x={n.x - 3} y={n.y - 3} width={n.w + 6} height={n.h + 6} rx={10}
                    fill="none" stroke={n.color} strokeWidth={2.5} strokeOpacity={0.9}
                    strokeDasharray="4,3"
                  />
                )}
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={7}
                  fill={isSel ? (n.color + "18") : (n.dark ? "#E8EBF4" : COLORS.bg)}
                  stroke={n.color}
                  strokeWidth={isSel ? 2.5 : 1.5}
                  strokeOpacity={dimmed ? 0.25 : (isSel ? 1 : 0.7)}
                  opacity={dimmed ? 0.45 : 1}
                />
                {/* Colour bar on left */}
                <rect x={n.x} y={n.y} width={4} height={n.h} rx={3} fill={n.color} opacity={dimmed ? 0.3 : 0.9} />
                {/* Icon */}
                <text x={n.x + 16} y={n.y + n.h / 2 + 1} textAnchor="middle" fontSize={14} dominantBaseline="middle" opacity={dimmed ? 0.35 : 1}>{n.icon}</text>
                {/* Label */}
                <text x={n.x + 28} y={n.y + (n.sublabel ? n.h / 2 - 7 : n.h / 2 + 1)} fontSize={11} fontWeight="700" fill={COLORS.textBright} fontFamily="monospace" opacity={dimmed ? 0.35 : 1}>{n.label}</text>
                {n.sublabel && (
                  <text x={n.x + 28} y={n.y + n.h / 2 + 8} fontSize={8.5} fill={COLORS.textDim} fontFamily="monospace" opacity={dimmed ? 0.3 : 1}>{n.sublabel}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend + hint */}
      <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
        {legendItems.map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width={28} height={10}>
              <line x1={0} y1={5} x2={28} y2={5} stroke={l.color} strokeWidth={2} strokeDasharray={l.dashed ? "4,3" : "none"} />
            </svg>
            <span style={{ fontSize: 11, color: COLORS.textDim }}>{l.label}</span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: COLORS.textFaint, marginLeft: "auto" }}>
          Click any node or arrow · click again to deselect
        </div>
      </div>

      {/* ── Detail Panel ─────────────────────────────────────────────────────── */}
      {selected ? (
        <div style={{ marginTop: 16, background: COLORS.card, border: "1px solid " + (panelNode ? panelNode.color : panelEdge ? panelEdge.color : COLORS.border) + "50", borderRadius: 10, overflow: "hidden" }}>

          {/* Panel header */}
          <div style={{ background: (panelNode ? panelNode.color : panelEdge ? panelEdge.color : COLORS.deepl) + "12", borderBottom: "1px solid " + COLORS.border, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {panelNode && <span style={{ fontSize: 18 }}>{panelNode.icon}</span>}
              {panelEdge && <span style={{ fontSize: 14, color: panelEdge.color }}>→</span>}
              <div>
                <div style={{ fontSize: 9, color: panelNode ? panelNode.color : panelEdge ? panelEdge.color : COLORS.deepl, letterSpacing: "0.14em", marginBottom: 2 }}>
                  {selType === "node" ? "NODE" : "CONNECTION"}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.textBright }}>
                  {panelNodeDetail ? panelNodeDetail.title : panelEdgeDetail ? panelEdgeDetail.label : ""}
                </div>
              </div>
            </div>
            <button onClick={clearSelection} style={{
              background: "transparent", border: "1px solid " + COLORS.border, borderRadius: 5,
              color: COLORS.textFaint, fontSize: 11, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit"
            }}>✕ Close</button>
          </div>

          {/* Panel body */}
          <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: panelNode ? "1fr 260px" : "1fr", gap: 20 }}>

            {/* Description */}
            <div>
              <p style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.75, margin: "0 0 14px" }}>
                {panelNodeDetail ? panelNodeDetail.desc : panelEdgeDetail ? panelEdgeDetail.desc : ""}
              </p>
              {/* Tags */}
              {(panelNodeDetail || panelEdgeDetail) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(panelNodeDetail ? panelNodeDetail.tags : panelEdgeDetail.tags || []).map(tag => (
                    <span key={tag} style={{
                      fontSize: 11, padding: "3px 9px", borderRadius: 4,
                      background: (panelNode ? panelNode.color : panelEdge ? panelEdge.color : COLORS.deepl) + "14",
                      color: panelNode ? panelNode.color : panelEdge ? panelEdge.color : COLORS.deepl,
                      border: "1px solid " + (panelNode ? panelNode.color : panelEdge ? panelEdge.color : COLORS.deepl) + "35"
                    }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Connections sidebar — only for node selection */}
            {panelNode && (
              <div style={{ borderLeft: "1px solid " + COLORS.border, paddingLeft: 18 }}>
                <div style={{ fontSize: 10, color: COLORS.textFaint, letterSpacing: "0.12em", marginBottom: 10 }}>CONNECTIONS</div>
                <div style={{ display: "grid", gap: 7 }}>
                  {connectedEdges.map((e, i) => {
                    const isOut = e.from === activeNodeId;
                    const otherNode = nodes.find(n => n.id === (isOut ? e.to : e.from));
                    const edDetail = EDGE_DETAILS[e.from + "→" + e.to];
                    return (
                      <div key={i}
                        onClick={(ev) => { ev.stopPropagation(); selectEdge(e.from + "→" + e.to); }}
                        style={{ padding: "7px 10px", borderRadius: 6, background: COLORS.cardDark, border: "1px solid " + e.color + "30", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: e.color, letterSpacing: "0.1em" }}>
                            {isOut ? "OUT →" : "← IN"}
                          </span>
                          <span style={{ fontSize: 11, color: COLORS.textMid }}>{otherNode ? otherNode.icon : ""} {isOut ? e.to : e.from}</span>
                          {e.label && <span style={{ fontSize: 10, color: e.color, marginLeft: "auto" }}>{e.label}</span>}
                        </div>
                        {edDetail && <div style={{ fontSize: 10, color: COLORS.textFaint, lineHeight: 1.5 }}>{edDetail.desc.substring(0, 70)}…</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Placeholder when nothing selected */
        <div style={{ marginTop: 16, background: COLORS.cardDark, border: "1px dashed " + COLORS.border, borderRadius: 10, padding: "20px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>👆</div>
          <div style={{ fontSize: 13, color: COLORS.textDim }}>Click any node or arrow in the diagram to see a detailed explanation</div>
          <div style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 4 }}>Each box and connection has its own description, tags, and linked connections</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("comparison");
  const tabs = [
    { id: "comparison", label: "Provider Comparison" },
    { id: "recommendation", label: "Recommendation" },
    { id: "architecture", label: "Architecture" },
    { id: "diagram", label: "Architecture Diagram" },
    { id: "models", label: "Models & Pricing" },
  ];
  return (
    <div style={{ fontFamily: "'DM Mono','Courier New',monospace", background: COLORS.bg, color: COLORS.textBright, minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg,#EDF2FF,#F0F5FF 50%,#EBF4FF)", borderBottom: "1px solid " + COLORS.border, padding: "36px 44px 0", position: "relative" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,#00967A18,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: 220, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,#1A73E812,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28, position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: COLORS.deepl, marginBottom: 8 }}>AI TRANSLATION STRATEGY</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,38px)", fontWeight: 700, margin: "0 0 10px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              CMS Translation<br /><span style={{ color: COLORS.deepl }}>Engine Evaluation</span>
            </h1>
            <p style={{ color: COLORS.textDim, fontSize: 13, margin: 0, maxWidth: 460, lineHeight: 1.6 }}>
              Accuracy · Language Coverage · Cost  — full evaluation for AI-powered translation architecture
            </p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[["6","Providers Evaluated"],["133","Max Languages"],["6","Architecture Layers"]].map(([n,l]) => (
              <div key={n} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.deepl, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 9, color: COLORS.textFaint, letterSpacing: "0.1em", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, position: "relative" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? COLORS.deepl : "transparent",
              color: tab === t.id ? "#FFFFFF" : COLORS.textDim,
              border: "none", padding: "9px 16px", fontSize: 11, letterSpacing: "0.08em",
              cursor: "pointer", fontFamily: "inherit", fontWeight: tab === t.id ? 700 : 400,
              borderRadius: "4px 4px 0 0", textTransform: "uppercase", transition: "all 0.15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "28px 44px", maxWidth: 1180, margin: "0 auto" }}>
        {tab === "comparison" && <ComparisonTab />}
        {tab === "recommendation" && <RecommendationTab />}
        {tab === "architecture" && <ArchitectureTab />}
        {tab === "diagram" && <DiagramTab />}
        {tab === "models" && <ModelsTab />}
      </div>
      <div style={{ padding: "14px 44px", borderTop: "1px solid " + COLORS.border, display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.textFaint }}>
        <span>CMS AI Translation Strategy</span>
        <span>Prices are approximate — verify current rates with providers</span>
      </div>
    </div>
  );
}
