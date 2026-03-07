import { useState } from "react";

const C = {
  bg:"#F8FAFC", surface:"#FFFFFF", card:"#FFFFFF",
  sidebar:"#1E293B", sideText:"#94A3B8", sideActive:"#38BDF8",
  border:"#E2E8F0", borderMd:"#CBD5E1",
  accent:"#0284C7", accentBg:"#EFF6FF",
  gold:"#D97706",   goldBg:"#FFFBEB",
  green:"#059669",  greenBg:"#ECFDF5",
  red:"#DC2626",    redBg:"#FEF2F2",
  purple:"#7C3AED", purpleBg:"#F5F3FF",
  orange:"#EA580C", orangeBg:"#FFF7ED",
  teal:"#0D9488",   tealBg:"#F0FDFA",
  text:"#0F172A", textMd:"#334155", muted:"#64748B", mutedLt:"#94A3B8",
  codeBg:"#1E293B", codeText:"#7DD3FC",
};

// ── ALL CODE STRINGS DEFINED AS NAMED CONSTANTS ─────────────────
// This avoids nested template literals which break JSX parsing.

const CODE = {
  llmGateway: `primary:   BEDROCK_CLAUDE_SONNET_4
fallback:  [OPENAI_GPT4_1, GEMINI_FLASH]
budgets:
  perUser:  50,000 tokens/day
  perQuery: 4,000 tokens max
routing:
  simple_lookup  -> claude-haiku-3
  text_to_sql    -> claude-sonnet-4
  report_summary -> claude-sonnet-4`,

  sqlValidator: `ValidationResult validate(String llmSQL) {
  AST ast = JSqlParser.parse(llmSQL);
  if (!ast.isSelect())
    throw new SecurityException("DML blocked");
  if (!ALLOWED_TABLES.containsAll(ast.getTableNames()))
    throw new SecurityException("Unauthorized table");
  ast.addWhereClause(
    "distributor_id IN (SELECT id FROM subtree_cache WHERE root=?)"
  );
  return new ValidationResult(ast.toString(), userId);
}`,

  nlStep1: `Input: "Why did my bonus drop in March?"

Resolved:
  distributorId:  "D001"
  subtreeIds:     ["D001","D004","D007",...]
  timeRefs:       { March -> month=2024-03 }
  metricRefs:     { bonus -> bonus_facts.bonus_amount }
  intent:         NL_TO_SQL + EXPLAIN`,

  nlStep2: `{
  "table": "bonus_facts",
  "domain": ["bonus", "commission"],
  "columns": [
    { "name":"distributor_id", "desc":"FLP distributor ID" },
    { "name":"month",          "desc":"Period YYYY-MM",  "example":"2024-03" },
    { "name":"bonus_amount",   "desc":"USD bonus earned" },
    { "name":"cc_units",       "desc":"Case Credits contributing to bonus" }
  ]
}`,

  nlStep3: `SELECT query_text, generated_sql,
       embedding <=> $1 AS distance
FROM query_examples
WHERE domain = $2
  AND verified = true
ORDER BY distance ASC
LIMIT 3;`,

  nlStep4: `{
  "sql": "SELECT month, SUM(bonus_amount) FROM bonus_facts ...",
  "explanation": "Comparing March vs February by downline.",
  "assumptions": ["All bonus types included", "Comparing to Feb 2024"]
}`,

  nlStep5: `-- LLM generated:
SELECT month, SUM(bonus_amount)
FROM bonus_facts
WHERE month IN ('2024-02','2024-03')

-- After RLS injection:
SELECT month, SUM(bonus_amount)
FROM bonus_facts
WHERE month IN ('2024-02','2024-03')
AND distributor_id IN (
  SELECT id FROM distributor_subtree_cache
  WHERE root_id = ?   -- bound: 'D001'
)`,

  nlStep6: `CREATE WLM CONFIGURATION ai_queries (
  query_group        = 'ai_service',
  max_execution_time = 30000,
  memory_percent     = 10,
  concurrency        = 5
);
GRANT SELECT ON SCHEMA ai_views TO ai_service_user;`,

  nlStep7: `{
  "answer": "March bonus fell 12% ($847 to $745). Primary cause: 30% volume drop in downline 2 (John Doe 284 to 198 CC).",
  "chart": {
    "type": "grouped_bar",
    "labels": ["Feb","Mar"],
    "series": [
      {"name":"Bonus $","data":[847,745]},
      {"name":"downline 2 CC","data":[284,198]}
    ]
  },
  "citations": ["bonus_facts: Mar+Feb 2024"],
  "followUp": ["Show John Doe activity","Which other downlines declined?"]
}`,

  flowStep1: `POST /api/ai/query
Authorization: Bearer eyJhbGci...
{
  "question": "Why did my bonus drop in March?",
  "context": { "reportPage": "bonus-summary" }
}`,

  flowStep2: `String distributorId = jwtClaims.get("distributor_id");
List<String> subtreeIds = redisClient.lrange(
  "subtree:" + distributorId, 0, -1
);
RequestContext.set("scope",
  new DistributorScope(distributorId, subtreeIds));`,

  flowStep4: `SELECT query_text, generated_sql
FROM query_examples
WHERE domain = 'bonus' AND verified = true
ORDER BY embedding <=> $1
LIMIT 3;`,

  flowStep5: `{
  "sql": "SELECT month, SUM(bonus_amount) FROM bonus_facts ...",
  "explanation": "Comparing March vs February by downline.",
  "assumptions": ["All bonus types included"]
}`,

  flowStep6: `-- After RLS injection:
SELECT month, SUM(bonus_amount) FROM bonus_facts
WHERE month IN ('2024-02','2024-03')
AND distributor_id IN (
  SELECT id FROM distributor_subtree_cache
  WHERE root_id = ?
)`,

  flowStep7: `CREATE WLM CONFIGURATION ai_queries (
  query_group = 'ai_service',
  max_execution_time = 30000,
  memory_percent = 10, concurrency = 5
);
GRANT SELECT ON SCHEMA ai_views TO ai_service_user;`,

  flowStep8: `{
  "answer": "March bonus fell 12% ($847 to $745). Cause: downline 2 volume dropped 30%.",
  "chart": { "type":"grouped_bar", "labels":["Feb","Mar"] },
  "followUp": ["Show John Doe activity","Which other downlines declined?"]
}`,

  promptNL: `SYSTEM: You are a Redshift SQL expert for FLP360.
Scope: distributor={userId}, subtree=[{subtreeIds}]

Schema:
  bonus_facts(distributor_id, month, bonus_type, amount, cc_units)
  downline_summary(root_id, member_id, level, active_flag)

Rules: CC=Case Credits, PV=Personal Volume
Ranks: Silver=120CC, Gold=500CC

Examples:
Q: "my Q4 bonus total" -> SELECT SUM(amount) FROM bonus_facts WHERE...

USER: Why did my bonus drop in March?`,

  promptExplain: `SYSTEM: You are a performance coach for an FLP distributor.
Explain this data in plain language. Be specific. Max 3 paragraphs.

Report: Bonus Summary March 2024
Data: { total_bonus:745, prev_month:847, change:-12%,
        downlines:[{id:D004, cc:198, prev:284},...] }

USER: Explain this report.`,

  promptRank: `SYSTEM: Rank advancement coach for FLP.
Status: Rank=Silver, CC=312, need 500 for Gold
downline 1 (D004): 198 CC | downline 2 (D007): 114 CC
Gold: 500 personal CC + 2 downlines with 200+ CC each

USER: How do I reach Gold next month?`,

  insightVolumeDrop: `SELECT d.distributor_id, d.member_id,
       curr.cc_units as current_cc,
       prev.cc_units as prev_cc,
       ((curr.cc_units - prev.cc_units) /
        NULLIF(prev.cc_units,0.0)) * 100 as pct_change
FROM downline_summary d
JOIN volume_weekly curr
  ON curr.distributor_id = d.member_id
  AND curr.week = :currentWeek
JOIN volume_weekly prev
  ON prev.distributor_id = d.member_id
  AND prev.week = :prevWeek
WHERE d.root_id IN (:allActiveRoots)
  AND ((curr.cc_units - prev.cc_units) /
       NULLIF(prev.cc_units,0.0)) < -0.15
ORDER BY pct_change ASC;`,

  insightInactivity: `SELECT d.root_id, d.member_id,
       m.display_name,
       DATEDIFF('day', MAX(v.activity_date),
                CURRENT_DATE) as days_inactive
FROM downline_summary d
JOIN members m ON m.distributor_id = d.member_id
LEFT JOIN activity_log v
  ON v.distributor_id = d.member_id
GROUP BY d.root_id, d.member_id, m.display_name
HAVING days_inactive >= 30
ORDER BY days_inactive DESC;`,

  insightRankRisk: `SELECT r.distributor_id,
       r.current_rank, r.current_cc,
       rq.required_cc,
       (r.current_cc / rq.required_cc) * 100 as pct_of_req,
       rq.required_cc - r.current_cc as gap_cc
FROM rank_current r
JOIN rank_requirements rq
  ON rq.rank_code = r.current_rank
WHERE (r.current_cc / rq.required_cc) < 1.1
   OR (r.current_cc / rq.next_rank_cc) > 0.8;`,

  insightGrowth: `SELECT d.root_id, d.member_id as downline_id,
       SUM(v.cc_units) as downline_cc,
       rq.required_cc as threshold,
       rq.required_cc - SUM(v.cc_units) as gap
FROM downline_summary d
JOIN volume_monthly v ON v.distributor_id = d.member_id
  AND d.level = 1
JOIN rank_requirements rq ON rq.rank_code = 'SILVER'
GROUP BY d.root_id, d.member_id, rq.required_cc
HAVING gap BETWEEN 0 AND (rq.required_cc * 0.2)
ORDER BY gap ASC;`,

  insightSchedule: `nightly-insights:
  schedule: cron(0 2 * * ? *)
  target: InsightsLambda
  payload: { "mode": "full" }

hourly-critical:
  schedule: rate(1 hour)
  target: InsightsLambda
  payload: { "mode": "critical_only" }`,

  insightLLMPrompt: `SYSTEM: Convert this anomaly to a 1-2 sentence plain-English
alert for an FLP distributor. Be specific with numbers.

Anomaly: {
  type: "VOLUME_DROP", downline: "D004", pct_change: -28,
  current_cc: 198, prev_cc: 284, inactive_members: 3
}

Output: "Your downline 2 volume dropped 28% this week (284 to 198 CC),
primarily due to 3 members with no activity this month."`,

  insightTable: `CREATE TABLE distributor_insights (
  id             SERIAL PRIMARY KEY,
  distributor_id VARCHAR(20),
  type           VARCHAR(50),
  priority       VARCHAR(10),
  title          VARCHAR(200),
  message        TEXT,
  data_json      JSONB,
  follow_up_queries TEXT[],
  created_at     TIMESTAMP,
  expires_at     TIMESTAMP,
  read_at        TIMESTAMP
);`,

  chatSession: `{
  "sessionId": "sess_abc123",
  "distributorId": "D001",
  "distributorScope": ["D001","D004","D007",...],
  "currentPage": "bonus-summary",
  "currentPageData": { "period":"2024-03", "totalBonus":745 },
  "entities": {
    "people":  { "John Doe":"D004", "Maria Santos":"D007" },
    "metrics": ["bonus_amount","cc_units"],
    "periods": ["2024-03","2024-02"],
    "lastQueryResult": { "summary":"March bonus $745, down 12%" }
  },
  "turns": [
    { "role":"user",      "content":"Why did my bonus drop in March?" },
    { "role":"assistant", "content":"Your March bonus fell 12%..." }
  ],
  "lastActivity": 1704067890
}`,

  chatContext: `function assembleContext(session) {
  const MAX_TOKENS = 3000;
  let context = [];
  let tokenCount = 0;

  context.push(buildSystemPrompt(
    session.distributorId, session.distributorScope
  ));

  for (const turn of [...session.turns].reverse()) {
    const tokens = estimateTokens(turn);
    if (tokenCount + tokens > MAX_TOKENS) break;
    context.unshift(turn);
    tokenCount += tokens;
  }

  context.push({ role:"system",
    content:"Page: "+session.currentPage+
            " | Data: "+JSON.stringify(session.currentPageData)
  });

  return context;
}`,

  chatFrontend: `// Add to any existing report page - minimal change
function ReportPage({ reportId, reportData }) {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div>
      <ExistingReportContent data={reportData} />

      <button onClick={() => setChatOpen(true)}
        style={{ position:'fixed', bottom:24, right:24 }}>
        Ask AI about this report
      </button>

      {chatOpen && (
        <AIChatPanel
          reportContext={{ reportId, data: reportData }}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
// AIChatPanel connects to /api/ai/chat via SSE
// JWT passed automatically from existing auth`,

  expFrontend: `const explainReport = async () => {
  const reportData = extractReportData();
  const res = await fetch('/api/ai/explain/' + reportId, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + jwtToken }
  });
  // SSE stream renders tokens as they arrive
  // reportId used server-side to fetch metadata + data
};`,

  expCompare: `SELECT bonus_type,
       SUM(bonus_amount) as amount,
       SUM(cc_units) as cc
FROM bonus_facts
WHERE distributor_id IN (
  SELECT id FROM subtree_cache WHERE root_id = ?
)
AND month = :prevPeriod
GROUP BY bonus_type;`,

  expPrompt: `SYSTEM: You are a performance coach for FLP360 distributors.
Explain this report data clearly. Be specific about numbers.
Highlight notable changes vs last period.
End with 1-2 specific actionable recommendations.
Max 3 paragraphs.

Report: Bonus Summary - March 2024
Current: { total:745, personal:312CC,
  downlines:[{id:D004,cc:198},{id:D007,cc:114}] }
Previous (Feb): { total:847, personal:318CC,
  downlines:[{id:D004,cc:284},{id:D007,cc:118}] }
Rank: Gold requires 500CC + 2 downlines at 200+ CC each`,

  expCache: `REDIS SET explain:{reportId}:{distributorId}:{period}
      {explanation_json}
      EX 3600

INSERT INTO report_explanations
  (distributor_id, report_id, period, explanation, generated_at)
VALUES (?, ?, ?, ?, NOW());`,

  vectorSetup: `CREATE EXTENSION vector;

CREATE TABLE schema_registry (
  id        SERIAL PRIMARY KEY,
  table_name VARCHAR(100),
  domain    VARCHAR(50),
  content   TEXT,
  embedding vector(1536)
);

CREATE INDEX ON schema_registry
USING hnsw (embedding vector_cosine_ops)
WITH (m=16, ef_construction=64);

-- Retrieval at query time
SELECT content, 1-(embedding <=> $1) AS similarity
FROM schema_registry
WHERE domain = ANY($2)
ORDER BY similarity DESC
LIMIT 3;`,

  vectorEmbed: `BedrockRuntimeClient client = BedrockRuntimeClient.create();
InvokeModelRequest req = InvokeModelRequest.builder()
  .modelId("amazon.titan-embed-text-v2:0")
  .body(SdkBytes.fromUtf8String(
    "{\"inputText\":\"bonus_facts: monthly bonus calculations\"}"
  ))
  .build();
float[] embedding = parseEmbedding(client.invokeModel(req));
// INSERT INTO schema_registry (content, embedding)
// VALUES ($1, $2::vector)`,

  semanticYaml: `metrics:
  cc_units:
    aliases: ["CC","case credits","volume"]
    sql_expression: "SUM(cc_units)"
    table: "bonus_facts"
  bonus_total:
    aliases: ["bonus","earnings","commission"]
    sql_expression: "SUM(bonus_amount)"
    table: "bonus_facts"
    dimensions: ["month","bonus_type"]

ranks:
  - code: SILVER
    requirements:
      personal_cc: 120
      active_downlines: 2
      downline_cc_each: 25
  - code: GOLD
    requirements:
      personal_cc: 500
      active_downlines: 2
      downline_cc_each: 200

time_dimensions:
  this_month:   "month = TO_CHAR(CURRENT_DATE,'YYYY-MM')"
  last_month:   "month = TO_CHAR(ADD_MONTHS(CURRENT_DATE,-1),'YYYY-MM')"`,

  mlmBatch: `WITH RECURSIVE subtree AS (
  SELECT distributor_id AS root_id,
         distributor_id AS member_id, 0 AS depth
  FROM distributors
  UNION ALL
  SELECT s.root_id, d.distributor_id, s.depth + 1
  FROM subtree s
  JOIN distributor_relationships d
    ON d.sponsor_id = s.member_id
  WHERE s.depth < 20
)
INSERT INTO distributor_subtree_cache
  (root_id, member_id, depth)
SELECT root_id, member_id, depth FROM subtree;
-- Redis: KEY "subtree:D001" -> ["D001","D004",...] TTL 86400s`,

  mlmLookup: `// O(1) Redis lookup at query time
List<String> subtreeIds = redisClient.lrange(
  "subtree:" + distributorId, 0, -1
);
// < 1ms -- replaces expensive recursive CTE
// Falls back to Redshift query on cache miss (rare)`,

  rlsLayer1: `// Existing Java auth - no changes needed
String distributorId = jwtClaims.get("distributor_id");
List<String> subtreeIds = redisClient.lrange(
  "subtree:" + distributorId, 0, -1
);`,

  rlsLayer2: `// JSqlParser validates + injects WHERE clause
ast.addWhereClause(
  "distributor_id IN (SELECT id FROM subtree_cache WHERE root=?)"
);
// SELECT-only enforced, table whitelist checked,
// UNION/EXCEPT attacks blocked`,

  rlsLayer3: `CREATE RLS POLICY flp_ai_isolation ON bonus_facts
USING (
  distributor_id IN (
    SELECT member_id FROM distributor_subtree_cache
    WHERE root_id = CURRENT_USER
  )
);
ATTACH RLS POLICY flp_ai_isolation ON bonus_facts
  TO ROLE ai_reader;
ALTER TABLE bonus_facts ROW LEVEL SECURITY ON;`,

  vectorEx1: `{
  "table": "bonus_facts",
  "domain": ["bonus","commission"],
  "columns": [
    { "name":"distributor_id", "type":"VARCHAR(20)" },
    { "name":"month",          "type":"CHAR(7)", "example":"2024-03" },
    { "name":"bonus_amount",   "type":"DECIMAL(10,2)" },
    { "name":"cc_units",       "type":"INTEGER" }
  ],
  "embedding": [0.23, -0.87, 0.44, ...]
}`,

  vectorEx2: `{
  "question": "What was my total bonus last quarter?",
  "sql": "SELECT SUM(bonus_amount) FROM bonus_facts WHERE ...",
  "domain": "bonus",
  "verified": true,
  "embedding": [0.11, 0.93, -0.22, ...]
}`,

  vectorEx3: `{
  "term": "Case Credits",
  "aliases": ["CC","case credits","volume","units"],
  "sql_mapping": "cc_units column in bonus_facts",
  "embedding": [...]
}`,

  vectorEx4: `{
  "rank": "Gold",
  "requirements": {
    "personal_cc": 500,
    "min_downlines": 2,
    "downline_cc_each": 200
  },
  "embedding": [...]
}`,
};

// ── NAV ──────────────────────────────────────────────────────────
const NAV = [
  { id:"overview",      label:"Overview",               icon:"⬡" },
  { id:"arch-diagram",  label:"Architecture Diagram",   icon:"◈" },
  { id:"ai-system",     label:"AI System Components",   icon:"⚙" },
  { id:"nl-sql",        label:"NL to SQL Deep Dive",    icon:"→" },
  { id:"smart-insights",label:"Smart Insights",         icon:"💡" },
  { id:"conv-assist",   label:"Conversational Assistant",icon:"💬" },
  { id:"exp-reports",   label:"Explained Reports",      icon:"📊" },
  { id:"data-arch",     label:"Data Architecture",      icon:"▦" },
  { id:"deployment",    label:"Deployment Options",     icon:"⬗" },
  { id:"cost",          label:"Cost Analysis",          icon:"◎" },
];

// ── PRIMITIVES ───────────────────────────────────────────────────

function Tag({ color, children }) {
  const col = color || C.accent;
  return (
    <span style={{ display:"inline-block", padding:"2px 10px",
      background:col+"18", border:"1px solid "+col+"40",
      borderRadius:4, fontSize:10, color:col,
      letterSpacing:"0.07em", textTransform:"uppercase", fontWeight:700 }}>
      {children}
    </span>
  );
}

function Pill({ color, children }) {
  return (
    <span style={{ display:"inline-block",
      background:color+"15", border:"1px solid "+color+"35",
      color, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600 }}>
      {children}
    </span>
  );
}

function SectionHeader({ title, subtitle, tag, tagColor }) {
  return (
    <div style={{ marginBottom:28 }}>
      {tag && <div style={{ marginBottom:8 }}><Tag color={tagColor||C.accent}>{tag}</Tag></div>}
      <h2 style={{ fontSize:24, fontWeight:800, color:C.text, margin:"0 0 6px",
        fontFamily:"inherit", letterSpacing:"-0.02em" }}>{title}</h2>
      {subtitle && <p style={{ color:C.muted, fontSize:13, margin:0, lineHeight:1.65 }}>{subtitle}</p>}
      <div style={{ height:2, background:"linear-gradient(90deg,"+C.accent+",transparent)",
        marginTop:14, borderRadius:2 }} />
    </div>
  );
}

function Card({ children, style, accent, bg }) {
  return (
    <div style={{ background:bg||C.card, border:"1px solid "+(accent||C.border),
      borderRadius:8, padding:20,
      boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...(style||{}) }}>
      {children}
    </div>
  );
}

function CardTitle({ children, color }) {
  return (
    <div style={{ fontSize:10.5, fontWeight:800, color:color||C.accent,
      letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:12 }}>
      {children}
    </div>
  );
}

function Callout({ type, children }) {
  const map = {
    info:    { c:C.accent,  bg:C.accentBg },
    warn:    { c:C.gold,    bg:C.goldBg },
    success: { c:C.green,   bg:C.greenBg },
    error:   { c:C.red,     bg:C.redBg },
  };
  const { c, bg } = map[type||"info"];
  return (
    <div style={{ background:bg, border:"1px solid "+c+"30",
      borderLeft:"3px solid "+c, borderRadius:6,
      padding:"12px 16px", fontSize:13, color:C.textMd, lineHeight:1.7, marginTop:12 }}>
      {children}
    </div>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position:"relative", marginTop:8 }}>
      <div style={{ background:C.codeBg, borderRadius:8, padding:"16px 20px",
        fontSize:12, color:C.codeText, lineHeight:1.75, overflowX:"auto",
        fontFamily:"'Fira Code','IBM Plex Mono',monospace" }}>
        <div style={{ color:"#475569", fontSize:9.5, marginBottom:8,
          letterSpacing:"0.1em", textTransform:"uppercase" }}>{lang||"code"}</div>
        <pre style={{ margin:0, whiteSpace:"pre-wrap" }}>{code}</pre>
      </div>
      <button onClick={() => {
          navigator.clipboard && navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(()=>setCopied(false),1500);
        }}
        style={{ position:"absolute", top:10, right:10,
          background:"#334155", border:"none", borderRadius:4,
          color:"#94A3B8", fontSize:10, padding:"3px 8px",
          cursor:"pointer", fontFamily:"inherit" }}>
        {copied ? "✓" : "copy"}
      </button>
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:2, marginBottom:24,
      borderBottom:"2px solid "+C.border, flexWrap:"wrap" }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{
          background:"transparent", border:"none",
          borderBottom: active===tab.id ? "2px solid "+C.accent : "2px solid transparent",
          marginBottom:-2,
          color: active===tab.id ? C.accent : C.muted,
          padding:"8px 14px", fontSize:12.5, cursor:"pointer",
          fontFamily:"inherit", fontWeight: active===tab.id ? 700 : 500,
          whiteSpace:"nowrap" }}>{tab.label}</button>
      ))}
    </div>
  );
}

function TableView({ headers, rows }) {
  return (
    <div style={{ overflowX:"auto", borderRadius:6, border:"1px solid "+C.border }}>
      <table style={{ width:"100%", borderCollapse:"collapse",
        fontSize:12.5, fontFamily:"inherit" }}>
        <thead>
          <tr>
            {headers.map((h,i) => (
              <th key={i} style={{ background:"#F1F5F9", color:C.muted, padding:"9px 14px",
                textAlign:"left", borderBottom:"1px solid "+C.border,
                fontWeight:700, letterSpacing:"0.05em", fontSize:11, whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,ri) => (
            <tr key={ri} style={{ background: row.hl ? C.accentBg : (ri%2===0?C.surface:"#F8FAFC") }}>
              {row.cells.map((cell,ci) => (
                <td key={ci} style={{ padding:"9px 14px",
                  borderBottom:"1px solid "+C.border+"40",
                  color: row.hl ? C.accent : (ci===0?C.text:C.textMd),
                  fontWeight: row.hl ? 700 : (ci===0?600:400) }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── EXPANDABLE COMPONENTS (each is a named fn with hook at top) ──

function ExpandCard({ num, color, bg, title, role, details, code, lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom:10, border:"1px solid "+(open?color+"50":C.border),
      borderRadius:8, background:open?(bg||color+"06"):C.surface,
      boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", cursor:"pointer",
        display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}
        onClick={() => setOpen(o=>!o)}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <span style={{ background:color, color:"#fff", borderRadius:5,
            padding:"3px 9px", fontSize:11, fontWeight:800, flexShrink:0 }}>{num}</span>
          <div>
            <div style={{ color:open?color:C.text, fontWeight:700, fontSize:13.5 }}>{title}</div>
            <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{role}</div>
          </div>
        </div>
        <span style={{ color:C.mutedLt, fontSize:11, flexShrink:0 }}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 18px 18px", borderTop:"1px solid "+color+"20" }}>
          {details && details.map((d,i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:7, marginTop:i===0?12:0 }}>
              <span style={{ color, flexShrink:0 }}>▸</span>
              <span style={{ color:C.textMd, fontSize:12.5, lineHeight:1.55 }}>{d}</span>
            </div>
          ))}
          {code && <CodeBlock code={code} lang={lang||"code"} />}
        </div>
      )}
    </div>
  );
}

function ExpandRow({ color, collection, desc, example }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom:8, borderRadius:6,
      border:"1px solid "+(open?color+"50":C.border),
      background:open?color+"05":C.surface, overflow:"hidden" }}>
      <div style={{ padding:"11px 16px", cursor:"pointer",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}
        onClick={() => setOpen(o=>!o)}>
        <div style={{ display:"flex", gap:12 }}>
          <span style={{ color, fontWeight:700, fontSize:12.5 }}>{collection}</span>
          <span style={{ color:C.muted, fontSize:12 }}>{desc}</span>
        </div>
        <span style={{ color:C.mutedLt, fontSize:11 }}>{open?"▲":"▼"}</span>
      </div>
      {open && <div style={{ padding:"0 16px 16px" }}><CodeBlock code={example} lang="json" /></div>}
    </div>
  );
}

function PipelineStep({ num, title, summary, color, bg, detail, code, lang, isLast }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", gap:14, cursor:"pointer" }}
        onClick={() => setOpen(o=>!o)}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:"50%",
            background:open?color:color+"15",
            border:"2px solid "+color, color:open?"#fff":color,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:800 }}>{num}</div>
          {!isLast && <div style={{ width:2, height:20, background:color+"25", marginTop:4 }} />}
        </div>
        <div style={{ flex:1,
          background:open?(bg||color+"08"):C.surface,
          border:"1px solid "+(open?color+"50":C.border),
          borderRadius:8, padding:"12px 16px", marginBottom:open?0:8,
          boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <div>
              <span style={{ color:open?color:C.text, fontWeight:700, fontSize:13 }}>{title}</span>
              <div style={{ color:C.muted, fontSize:12, marginTop:3 }}>{summary}</div>
            </div>
            <span style={{ color:C.mutedLt, fontSize:11, flexShrink:0, marginLeft:8 }}>{open?"▲":"▼"}</span>
          </div>
        </div>
      </div>
      {open && (
        <div style={{ marginLeft:50, marginBottom:16,
          background:bg||color+"06",
          border:"1px solid "+color+"30", borderRadius:8, padding:20 }}>
          <p style={{ color:C.textMd, fontSize:13, lineHeight:1.75,
            marginTop:0, whiteSpace:"pre-line" }}>{detail}</p>
          {code && <CodeBlock code={code} lang={lang||"sql"} />}
        </div>
      )}
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────────

function OverviewSection() {
  const features = [
    { id:"nl-sql",        title:"Natural Language to SQL", icon:"→",
      desc:"Ask plain-English questions. AI generates scoped Redshift SQL and returns cited, explained answers with 3-layer RLS security.",
      color:C.accent },
    { id:"smart-insights",title:"Smart Insights Engine",   icon:"💡",
      desc:"Proactive anomaly detection on a schedule. Volume drops, inactivity, rank risk, growth opportunities — surfaced as dashboard alerts.",
      color:C.gold },
    { id:"conv-assist",   title:"Conversational Assistant",icon:"💬",
      desc:"Persistent multi-turn chat embedded in the platform. Context-aware, resolves references, pre-seeded with the current report.",
      color:C.purple },
    { id:"exp-reports",   title:"Explained Reports",       icon:"📊",
      desc:"Every existing report gets an Explain button. AI reads current data, fetches the comparison period, streams a narrative explanation.",
      color:C.green },
  ];
  const embeds = [
    { page:"All Report Pages",       widget:"Explain This Report button — streaming AI side panel", color:C.purple },
    { page:"Dashboard Home",         widget:"Smart Insights alert banner — proactive anomaly alerts", color:C.gold },
    { page:"Bonus Summary Report",   widget:"Ask about this report inline chat — pre-seeded with data", color:C.green },
    { page:"Downline Network View",  widget:"Find weak downlines button — AI flags underperforming branches", color:C.accent },
    { page:"Nav Bar Search",         widget:"NL search: show my Q1 bonus — navigates to correct report", color:C.orange },
  ];
  return (
    <div>
      <SectionHeader title="FLP360 AI Integration" tag="Overview"
            subtitle="Augmenting existing Java reporting platform with AI. The AI layer slots in as a new Spring Boot microservice." />
      <Callout type="info">
        <strong>Scope:</strong>AI integration with in existing report pages as an embedded widgets.
      </Callout>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:20 }}>
        {features.map((f,i) => (
          <Card key={i} accent={f.color} bg={f.color+"06"}>
            <div style={{ fontSize:24, marginBottom:8 }}>{f.icon}</div>
            <CardTitle color={f.color}>{f.title}</CardTitle>
            <p style={{ color:C.textMd, fontSize:13, margin:"0 0 10px", lineHeight:1.65 }}>{f.desc}</p>
            <span style={{ fontSize:11.5, color:f.color, fontWeight:700 }}>
              See {f.title} section for deep dive
            </span>
          </Card>
        ))}
      </div>
      <Card style={{ marginTop:16 }}>
        <CardTitle>Where AI Embeds in the Existing Platform</CardTitle>
        {embeds.map((e,i) => (
          <div key={i} style={{ display:"flex", gap:12, marginBottom:10,
            padding:"8px 0", borderBottom:"1px solid "+C.border, alignItems:"flex-start" }}>
            <Pill color={e.color}>{e.page}</Pill>
            <span style={{ color:C.textMd, fontSize:12.5, lineHeight:1.5 }}>{e.widget}</span>
          </div> 
        ))}<span style={{ fontSize:10, color:C.textFaint }}>Examples scenarios* </span>
      </Card>
      <Card style={{ marginTop:16 }} accent={C.red} bg={C.redBg}>
        <CardTitle color={C.red}>Core Security Constraint (all 4 capabilities)</CardTitle>
        <p style={{ color:C.textMd, fontSize:13, lineHeight:1.7, margin:0 }}>
          Every AI interaction is bounded by the authenticated distributor's ID and their pre-materialized downline subtree.
          Enforced at three independent layers: JWT extraction &rarr; SQL AST validation + predicate injection &rarr; Redshift native Row-Level Security.
        </p>
      </Card>
    </div>
  );
}

// ── ARCHITECTURE DIAGRAM ─────────────────────────────────────────

const DIAG_NODES = [
  { id:"user",     x:290, y:18,  w:160, h:42, color:C.teal,   bg:C.tealBg,   label:"FLP360 Users",         sub:"Distributors" },
  { id:"ui",       x:160, y:92,  w:160, h:42, color:C.accent,  bg:C.accentBg, label:"Java Web Frontend",    sub:"Existing (unchanged)" },
  { id:"widget",   x:420, y:92,  w:160, h:42, color:C.accent,  bg:C.accentBg, label:"AI UI Widgets",        sub:"Chat, Explain, Insights" },
  { id:"apigw",    x:60,  y:166, w:150, h:42, color:C.purple,  bg:C.purpleBg, label:"API Gateway",          sub:"Rate limit + Auth" },
  { id:"apisvc",   x:240, y:166, w:170, h:42, color:C.purple,  bg:C.purpleBg, label:"AI Service (Java)",    sub:"New Microservice" },
  { id:"security", x:440, y:166, w:140, h:42, color:C.red,     bg:C.redBg,    label:"Security Layer",       sub:"JWT + AST + RLS" },
  { id:"router",   x:20,  y:242, w:135, h:42, color:C.orange,  bg:C.orangeBg, label:"Query Router",         sub:"Intent Classification" },
  { id:"prompt",   x:175, y:242, w:155, h:42, color:C.orange,  bg:C.orangeBg, label:"Prompt Orchestration", sub:"Context + Template" },
  { id:"llm",      x:355, y:242, w:130, h:42, color:C.gold,    bg:C.goldBg,   label:"LLM Gateway",          sub:"Bedrock / OpenAI" },
  { id:"context",  x:510, y:242, w:130, h:42, color:C.orange,  bg:C.orangeBg, label:"Context Manager",      sub:"Session + Memory" },
  { id:"nlsql",    x:20,  y:318, w:135, h:42, color:C.green,   bg:C.greenBg,  label:"Text-to-SQL",          sub:"SQL Gen + Validation" },
  { id:"insight",  x:175, y:318, w:135, h:42, color:C.green,   bg:C.greenBg,  label:"Insights Engine",      sub:"Anomaly Detection" },
  { id:"explain",  x:330, y:318, w:135, h:42, color:C.green,   bg:C.greenBg,  label:"Report Explainer",     sub:"Narrative Gen" },
  { id:"rag",      x:485, y:318, w:155, h:42, color:C.green,   bg:C.greenBg,  label:"RAG Pipeline",         sub:"Retrieval Aug Gen" },
  { id:"vectordb", x:80,  y:394, w:155, h:42, color:C.teal,    bg:C.tealBg,   label:"Vector DB",            sub:"pgvector on RDS" },
  { id:"semantic", x:265, y:394, w:155, h:42, color:C.teal,    bg:C.tealBg,   label:"Semantic Layer",       sub:"Metrics + Rules" },
  { id:"redshift", x:420, y:466, w:175, h:42, color:C.accent,  bg:C.accentBg, label:"Amazon Redshift",      sub:"Data Warehouse (existing)" },
];

const DIAG_DETAIL = {
  user:    "FLP360 subscribers (FBOs). Each user is scoped to their own distributor ID and authorized downline subtree. No cross-tenant access is ever possible.",
  ui:      "Existing Java-based reporting platform. No rebuild required. AI capabilities are added as embedded widgets within existing pages — no changes to current report logic.",
  widget:  "Small JS components embedded into existing pages:\n• Chat panel (Conversational Assistant)\n• Explain this report button + side panel\n• Smart Insights alert banner on dashboard\n• NL search bar in nav",
  apigw:   "AWS API Gateway in front of the AI service. Handles rate limiting per distributor, JWT token validation, request/response logging, CORS and throttling.",
  apisvc:  "New Spring Boot microservice — the only new backend service needed. Receives requests from existing Java backend, orchestrates all AI components, and returns structured responses.",
  security:"Three-layer enforcement:\n1. JWT claim extraction — distributor_id binding\n2. SQL AST parser — validates LLM SQL, injects mandatory WHERE predicates, blocks DML\n3. Redshift native Row-Level Security — database-level backstop",
  router:  "Classifies user intent before touching the LLM:\n• NL to SQL (data query)\n• Report Explanation\n• Rank Advice\n• Trend / Prediction\n• Simple Lookup (answered from cache)\nSaves cost — simple queries never reach frontier LLM.",
  prompt:  "Assembles the full LLM prompt from: query-type template, relevant schema fragments (from Vector DB), business rules (Semantic Layer), 3 few-shot examples (Vector DB), user scope and rank, conversation history.",
  llm:     "Single integration point for all LLM calls. Primary: AWS Bedrock Claude Sonnet 4 (VPC-isolated). Fallback: OpenAI GPT-4.1 or Gemini Flash. Token budget enforcement, retry logic, streaming via SSE.",
  context: "Maintains conversation state per session in Redis. Resolves anaphora ('that', 'last month', 'compare'). Tracks entities mentioned. Injects summarized history into new prompts.",
  nlsql:   "Core query pipeline: schema context selection, LLM SQL generation (JSON mode), AST validation + RLS injection, execute on Redshift via read-only account, result explanation.",
  insight: "Proactive anomaly detection on schedule: volume drop detection (>15% week-over-week), downline inactivity (30+ days), rank qualification risk, growth opportunities. Stores alerts for dashboard.",
  explain: "Generates narrative for any existing report. Receives report data as JSON, fetches previous period for comparison, highlights anomalies, ends with actionable recommendations. Streamed via SSE.",
  rag:     "Retrieval Augmented Generation: embeds user question with Bedrock Titan, queries pgvector for similar past queries and schema docs, returns top-3 context chunks for prompt injection.",
  vectordb:"Stores embeddings of schema registry, query examples, business glossary, rank rules. Used at query time for RAG retrieval. HNSW index for sub-10ms lookup.",
  semantic:"YAML config inside AI service — no new infrastructure. Stores metric definitions (CC, PV, NC), rank thresholds, time dimension mappings. Injected into every LLM prompt.",
  redshift:"Existing Amazon Redshift data warehouse — the single source of truth. AI layer adds: ai_views schema with pre-approved views, dedicated WLM queue for AI queries (isolated from batch), Row-Level Security policies, and a read-only service account with SELECT-only on ai_views.",
};

const DIAG_ARROWS = [
  [370,60,240,92],[370,60,500,92],
  [240,134,135,166],[500,134,325,166],
  [315,166,340,166],[410,166,440,166],
  [325,208,87,242],[325,208,252,242],[325,208,562,242],
  [252,242,420,242],
  [87,242,87,318],[87,242,242,318],
  [252,242,397,318],[420,242,562,318],
  [87,360,157,394],[87,360,342,394],
  [87,360,507,466],
  [562,360,157,394],
];

function ArchDiagramSection() {
  const [selected, setSelected] = useState(null);
  const selNode = selected ? DIAG_NODES.find(n=>n.id===selected) : null;
  return (
    <div>
      <SectionHeader title="AI System Architecture Diagram" tag="Architecture"
        subtitle="Click any component to see its role and responsibilities. Details appear below the diagram." />
      <div style={{ background:C.surface, border:"1px solid "+C.border,
        borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", overflowX:"auto", marginBottom:0 }}>
        <svg width="660" height="530" style={{ fontFamily:"inherit", display:"block", margin:"0 auto" }}>
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={C.borderMd} />
            </marker>
          </defs>
            {[
              { y:10,  h:54,  label:"USER LAYER" },
              { y:82,  h:54,  label:"FRONTEND" },
              { y:155, h:54,  label:"API + SECURITY" },
              { y:232, h:54,  label:"AI ORCHESTRATION" },
              { y:308, h:54,  label:"QUERY ENGINES" },
              { y:384, h:54,  label:"AI DATA LAYER" },
              { y:456, h:54,  label:"DATA WAREHOUSE" },
            ].map((layer,i) => (
              <g key={i}>
                <rect x={0} y={layer.y} width={660} height={layer.h}
                  fill={i%2===0?"#F8FAFC":"#F1F5F9"} rx={4} />
                <text x={8} y={layer.y+12} fontSize={8} fill={C.mutedLt}
                  fontWeight="700" letterSpacing="0.08em">{layer.label}</text>
              </g>
            ))}
            {DIAG_ARROWS.map((a,i) => (
              <line key={i} x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]}
                stroke={C.borderMd} strokeWidth={1.5}
                strokeDasharray="4 3" markerEnd="url(#arr)" opacity={0.6} />
            ))}
            {DIAG_NODES.map(n => (
              <g key={n.id} style={{ cursor:"pointer" }}
                onClick={()=>setSelected(selected===n.id?null:n.id)}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={6}
                  fill={selected===n.id ? n.color : n.bg}
                  stroke={n.color} strokeWidth={selected===n.id?2.5:1.5} />
                <text x={n.x+n.w/2} y={n.y+15} fontSize={10.5} fontWeight="700"
                  fill={selected===n.id?"#fff":n.color} textAnchor="middle">{n.label}</text>
                <text x={n.x+n.w/2} y={n.y+29} fontSize={9}
                  fill={selected===n.id?"rgba(255,255,255,0.8)":C.muted}
                  textAnchor="middle">{n.sub}</text>
              </g>
            ))}
          </svg>
        </div>
      <div style={{ marginTop:0 }}>
        {selNode ? (
          <Card accent={selNode.color} bg={selNode.color+"06"} style={{ marginTop:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:selNode.color }} />
                <span style={{ color:selNode.color, fontWeight:800, fontSize:12,
                  textTransform:"uppercase", letterSpacing:"0.08em" }}>{selNode.label}</span>
                <span style={{ color:C.mutedLt, fontSize:11 }}>{selNode.sub}</span>
              </div>
              <button onClick={()=>setSelected(null)} style={{ background:"none", border:"1px solid "+C.border,
                borderRadius:4, padding:"2px 8px", color:C.muted, cursor:"pointer", fontSize:11 }}>✕ close</button>
            </div>
            <p style={{ color:C.textMd, fontSize:13, lineHeight:1.8,
              margin:0, whiteSpace:"pre-line" }}>{DIAG_DETAIL[selNode.id]}</p>
          </Card>
        ) : (
          <div style={{ marginTop:14, padding:"12px 20px", background:"#F1F5F9",
            borderRadius:8, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:18 }}>👆</span>
            <span style={{ color:C.muted, fontSize:13 }}>Click any component above to see its role and details here.</span>
            <div style={{ display:"flex", gap:12, marginLeft:"auto" }}>
              {[[C.teal,"Data Layer"],[C.accent,"API/Frontend"],[C.red,"Security"],[C.orange,"AI Orch."],[C.green,"Query Engines"],[C.gold,"LLM"]].map(([color,label],i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:color }} />
                  <span style={{ color:C.muted, fontSize:11 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Card style={{ marginTop:20 }}>
        <CardTitle>Key Data Flows</CardTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { flow:"NL Query Flow", color:C.accent,
              steps:"User question → API Gateway → AI Service → Query Router → Prompt Engine → LLM (Bedrock) → SQL Validator → Redshift → Response Composer → User" },
            { flow:"Smart Insights Flow", color:C.green,
              steps:"EventBridge trigger → Insights Engine → Redshift batch queries → Anomaly Detection → LLM explanation → Alert store → Dashboard banner" },
            { flow:"RAG Retrieval Flow", color:C.purple,
              steps:"User question → Embed with Bedrock Titan → pgvector similarity search → Top-3 schema docs + examples → Inject into prompt → LLM" },
            { flow:"Security Flow", color:C.red,
              steps:"JWT → distributor_id → Redis subtree lookup → LLM generates SQL → AST validation → RLS predicate injection → Redshift RLS policy → Execute" },
          ].map((f,i) => (
            <div key={i} style={{ padding:14, background:f.color+"08",
              border:"1px solid "+f.color+"25", borderRadius:6 }}>
              <div style={{ color:f.color, fontWeight:700, fontSize:12, marginBottom:5 }}>{f.flow}</div>
              <div style={{ color:C.textMd, fontSize:11.5, lineHeight:1.65 }}>{f.steps}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── AI SYSTEM SECTION ────────────────────────────────────────────

function AISystemSection() {
  const [tab, setTab] = useState("components");
  const components = [
    { num:"01", title:"LLM Gateway", color:C.accent, bg:C.accentBg,
      role:"Single integration point for all LLM calls. Model selection, failover, rate limiting.",
      details:["Primary: AWS Bedrock Claude Sonnet 4 (VPC-isolated)","Fallback: OpenAI GPT-4.1 or Gemini Flash","Token budget per user per day (configurable)","Streaming via SSE for conversational UI","Smart routing: complex → frontier, simple → cheap model"],
      code:CODE.llmGateway, lang:"yaml" },
    { num:"02", title:"Prompt Orchestration Engine", color:C.purple, bg:C.purpleBg,
      role:"Assembles context-rich prompts from templates, schema metadata, and retrieved examples.",
      details:["Separate templates per query type (NL-SQL, Explain, Insight, Chat)","Schema fragments retrieved from Vector DB (2-3 tables, not entire schema)","Business rules from Semantic Layer injected into every prompt","3 few-shot examples from Vector DB (cosine similarity retrieval)","JSON mode output enforcement for SQL generation"],
      code:null },
    { num:"03", title:"Query Router", color:C.orange, bg:C.orangeBg,
      role:"Classifies user intent and routes to the correct handler before calling the frontier LLM.",
      details:["Intent types: NL-SQL, Report Explanation, Rank Advice, Trend, Simple Lookup","Lightweight classifier runs before expensive LLM call — saves cost","Simple lookups answered from cache with zero LLM cost","Detects multi-step queries and breaks into sub-queries","Resolves follow-up references across conversation turns"],
      code:null },
    { num:"04", title:"Context Manager", color:C.gold, bg:C.goldBg,
      role:"Maintains conversation state, resolves references, manages session sliding window in Redis.",
      details:["Last N turns stored per session in Redis (TTL: 30 min inactivity)","Resolves anaphora: 'that', 'last month', 'compare with before'","Entity registry: distributor names, reports, metrics mentioned in session","Summarizes long history before injecting (token management)"],
      code:null },
    { num:"05", title:"SQL Validator and RLS Injector", color:C.red, bg:C.redBg,
      role:"Critical security: validates all LLM-generated SQL and injects mandatory RLS predicates.",
      details:["JSqlParser builds AST of every LLM-generated SQL","Assert: SELECT only — no INSERT, UPDATE, DELETE, DROP","Table whitelist: only ai_views schema allowed","No UNION / EXCEPT / INTERSECT (cross-tenant attack prevention)","Mandatory WHERE distributor_id IN (subtreeIds) injected on every query","Parameterized binding prevents SQL injection"],
      code:CODE.sqlValidator, lang:"java" },
    { num:"06", title:"Response Composer", color:C.green, bg:C.greenBg,
      role:"Formats SQL results into chart-ready JSON, streams LLM explanation, attaches citations.",
      details:["Auto-detects chart type from result shape (bar/line/table/single value)","Streams explanation text via SSE — fast perceived performance","Attaches data citations with source tables and date range","Generates 2-3 follow-up question suggestions"],
      code:null },
  ];
  const flowSteps = [
    { num:1, color:C.accent, bg:C.accentBg, title:"User submits question", summary:"React widget POSTs to /api/ai/query with JWT", detail:"The existing Java frontend sends the question and page context to the AI endpoint.", code:CODE.flowStep1, lang:"http" },
    { num:2, color:C.purple, bg:C.purpleBg, title:"JWT validated, scope extracted", summary:"Existing auth middleware. Gets distributor_id and subtree from Redis.", detail:"No changes to existing auth layer. AI service receives a pre-validated scope object.", code:CODE.flowStep2, lang:"java" },
    { num:3, color:C.orange, bg:C.orangeBg, title:"Query Router classifies intent", summary:"NL-SQL + Explain needed. Routes to correct pipeline.", detail:"Lightweight classification avoids calling the expensive LLM for simple lookups.", code:null },
    { num:4, color:C.green, bg:C.greenBg, title:"RAG retrieval from Vector DB", summary:"Embeds question, fetches top-3 similar SQL examples and relevant schema.", detail:"Few-shot prompting with real FLP query examples dramatically improves SQL accuracy.", code:CODE.flowStep4, lang:"sql" },
    { num:5, color:C.gold, bg:C.goldBg, title:"Prompt assembled and sent to LLM", summary:"Schema, rules, few-shots, and question sent to Bedrock Claude Sonnet 4.", detail:"Returns structured JSON — never raw SQL. JSON mode blocks prompt injection.", code:CODE.flowStep5, lang:"json" },
    { num:6, color:C.red, bg:C.redBg, title:"SQL validated, RLS injected", summary:"AST parse, table whitelist, mandatory WHERE predicate injected.", detail:"The most important security step. LLM-generated SQL is NEVER executed without validation.", code:CODE.flowStep6, lang:"sql" },
    { num:7, color:C.teal, bg:C.tealBg, title:"Execute on Redshift", summary:"Read-only service account. 30s timeout. Isolated WLM queue.", detail:"AI queries run in a dedicated WLM queue and cannot starve batch reporting jobs.", code:CODE.flowStep7, lang:"sql" },
    { num:8, color:C.accent, bg:C.accentBg, title:"Result explained and streamed", summary:"LLM generates plain-language explanation. Streamed via SSE.", detail:"Raw data is never shown directly — always converted to a narrative with citations.", code:CODE.flowStep8, lang:"json" },
  ];
  const promptCards = [
    { type:"NL to SQL", color:C.accent, bg:C.accentBg,
      context:["Relevant schema fragments (2-3 tables from Vector DB)","Business metric definitions (CC, PV, NC, rank rules)","Top-3 similar queries from Vector DB (few-shot)","User rank and distributor level","Distributor subtree IDs for scope binding"],
      output:"Structured JSON: { sql, explanation, assumptions }",
      code:CODE.promptNL },
    { type:"Report Explanation", color:C.purple, bg:C.purpleBg,
      context:["Report name and metadata","Actual report data (JSON)","Previous period data for comparison","User rank and goals"],
      output:"Streaming plain text narrative, max 200 words",
      code:CODE.promptExplain },
    { type:"Rank Progression Advisor", color:C.green, bg:C.greenBg,
      context:["Current metrics from Semantic Layer (no SQL needed)","Target rank requirements","Gap analysis (current vs required)","Historical 6-month trend"],
      output:"Numbered action steps with specific targets per downline",
      code:CODE.promptRank },
  ];
  return (
    <div>
      <SectionHeader title="AI System Components" tag="AI System"
        subtitle="Deep dive into each of the 6 AI service components and the full request lifecycle." />
      <Tabs tabs={[
        { id:"components",    label:"6 Components" },
        { id:"flow",          label:"Request Lifecycle" },
        { id:"orchestration", label:"Prompt Templates" },
        { id:"integration",   label:"Java Integration" },
      ]} active={tab} onChange={setTab} />
      {tab==="components" && (
        <div>
          <p style={{ color:C.muted, fontSize:13, marginBottom:18, lineHeight:1.6 }}>
            All 6 components live inside a single new <strong style={{ color:C.text }}>ai-service</strong> Spring Boot microservice. Click each to expand.
          </p>
          {components.map(c => <ExpandCard key={c.num} {...c} />)}
        </div>
      )}
      {tab==="flow" && (
        <div>
          <p style={{ color:C.muted, fontSize:13, marginBottom:18 }}>End-to-end lifecycle. Click each step for code examples.</p>
          {flowSteps.map((s,i) => <PipelineStep key={s.num} {...s} isLast={i===flowSteps.length-1} />)}
        </div>
      )}
      {tab==="orchestration" && (
        <div>
          <PromptCardA type={promptCards[0].type} color={promptCards[0].color} bg={promptCards[0].bg} context={promptCards[0].context} output={promptCards[0].output} code={promptCards[0].code} />
          <PromptCardB type={promptCards[1].type} color={promptCards[1].color} bg={promptCards[1].bg} context={promptCards[1].context} output={promptCards[1].output} code={promptCards[1].code} />
          <PromptCardC type={promptCards[2].type} color={promptCards[2].color} bg={promptCards[2].bg} context={promptCards[2].context} output={promptCards[2].output} code={promptCards[2].code} />
        </div>
      )}
      {tab==="integration" && (
        <div>
          <Card style={{ marginBottom:16 }}>
            <CardTitle>New AI Service Endpoints</CardTitle>
            <TableView headers={["Endpoint","Method","Description"]} rows={[
              { cells:["/api/ai/query","POST","NL question to SQL to explained answer"] },
              { cells:["/api/ai/explain/{id}","GET","Explain any existing report page"] },
              { cells:["/api/ai/chat","WS/SSE","Streaming conversational session"] },
              { cells:["/api/ai/insights","GET","Proactive smart alerts for dashboard"] },
            ]} />
          </Card>
        </div>
      )}
    </div>
  );
}

// Prompt cards as separate named components to avoid hooks-in-map
function PromptCardA({ type, color, bg, context, output, code }) {
  const [open, setOpen] = useState(false);
  return <PromptCardUI open={open} setOpen={setOpen} type={type} color={color} bg={bg} context={context} output={output} code={code} />;
}
function PromptCardB({ type, color, bg, context, output, code }) {
  const [open, setOpen] = useState(false);
  return <PromptCardUI open={open} setOpen={setOpen} type={type} color={color} bg={bg} context={context} output={output} code={code} />;
}
function PromptCardC({ type, color, bg, context, output, code }) {
  const [open, setOpen] = useState(false);
  return <PromptCardUI open={open} setOpen={setOpen} type={type} color={color} bg={bg} context={context} output={output} code={code} />;
}
function PromptCardUI({ open, setOpen, type, color, bg, context, output, code }) {
  return (
    <div style={{ marginBottom:10, border:"1px solid "+(open?color+"50":C.border),
      borderRadius:8, background:open?(bg||color+"06"):C.surface,
      boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", cursor:"pointer",
        display:"flex", justifyContent:"space-between" }} onClick={()=>setOpen(o=>!o)}>
        <div>
          <div style={{ color:open?color:C.text, fontWeight:700, fontSize:13.5 }}>{type}</div>
          <div style={{ color:C.muted, fontSize:11.5, marginTop:3 }}>Output: {output}</div>
        </div>
        <span style={{ color:C.mutedLt, fontSize:11 }}>{open?"▲ hide":"▼ show prompt"}</span>
      </div>
      {open && (
        <div style={{ padding:"0 18px 18px", borderTop:"1px solid "+color+"20" }}>
          <div style={{ marginTop:12, marginBottom:12 }}>
            <div style={{ color:C.muted, fontSize:10.5, marginBottom:8,
              textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Context Sources</div>
            {context.map((c,i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:5 }}>
                <span style={{ color, flexShrink:0 }}>▸</span>
                <span style={{ color:C.textMd, fontSize:12.5 }}>{c}</span>
              </div>
            ))}
          </div>
          <CodeBlock code={code} lang="prompt" />
        </div>
      )}
    </div>
  );
}

// ── NL TO SQL SECTION ────────────────────────────────────────────

function NLSQLSection() {
  const steps = [
    { num:1, color:C.accent, bg:C.accentBg, title:"Input Parsing and Scope Resolution",
      summary:"Parse intent and resolve distributor scope before any LLM call",
      detail:"Before touching the LLM:\n1. Extract distributor_id from JWT claims\n2. Look up pre-materialized subtree IDs from Redis (O(1))\n3. Resolve people names to distributor IDs\n4. Resolve time references (March, Q1) to date ranges\n5. Resolve metric references (bonus, CC) to column names via Semantic Layer",
      code:CODE.nlStep1, lang:"text" },
    { num:2, color:C.purple, bg:C.purpleBg, title:"Schema Context Selection",
      summary:"Dynamically select only relevant table docs, not the entire Redshift schema",
      detail:"Full schema inclusion wastes tokens. Domain classifier picks relevant tables, retrieves only those from Vector DB Schema Registry. Typically 2-3 tables per query.",
      code:CODE.nlStep2, lang:"json" },
    { num:3, color:C.green, bg:C.greenBg, title:"Vector DB Few-Shot Retrieval",
      summary:"Find top-3 most similar past verified queries for few-shot examples",
      detail:"Embed user question, cosine similarity search in pgvector, return top-3 verified examples. Teaches the LLM FLP-specific column names, join patterns, and business logic.",
      code:CODE.nlStep3, lang:"sql" },
    { num:4, color:C.gold, bg:C.goldBg, title:"LLM SQL Generation",
      summary:"Full prompt sent to LLM. Returns structured JSON with SQL and reasoning.",
      detail:"Prompt contains: system role, scope constraints, schema fragments (2-3 tables), business rules, 3 few-shot examples, and user question. LLM responds in JSON mode to prevent prompt injection.",
      code:CODE.nlStep4, lang:"json" },
    { num:5, color:C.red, bg:C.redBg, title:"SQL Validation and RLS Injection",
      summary:"CRITICAL: parse SQL, validate scope, inject mandatory WHERE clause",
      detail:"LLM-generated SQL is NEVER executed directly.\n1. Parse into AST with JSqlParser\n2. Assert SELECT only (no DML)\n3. All tables in allowed whitelist\n4. No UNION/EXCEPT/INTERSECT\n5. Inject WHERE distributor_id IN (subtree) on every table\n6. Bind as parameterized query",
      code:CODE.nlStep5, lang:"sql" },
    { num:6, color:C.orange, bg:C.orangeBg, title:"Redshift Execution",
      summary:"Validated parameterized query executed. Read-only account. 30s timeout.",
      detail:"Safeguards: IAM role with SELECT-only on ai_views, 30s timeout, 500-row limit, separate WLM queue, full execution logging.",
      code:CODE.nlStep6, lang:"sql" },
    { num:7, color:C.teal, bg:C.tealBg, title:"Result Explanation and Response",
      summary:"SQL results to LLM for explanation, then structured response streamed to UI",
      detail:"Result goes back through LLM: 'Explain this data in 2-3 sentences.' Response Composer streams via SSE, auto-detects chart type, formats JSON, generates follow-up suggestions.",
      code:CODE.nlStep7, lang:"json" },
  ];
  return (
    <div>
      <SectionHeader title="Natural Language to SQL: Deep Dive" tag="NL to SQL"
        subtitle="7-step breakdown from user question to AI-explained Redshift result. Click any step to expand." />
      <Callout type="info">
        <strong>Example:</strong> "Why did my bonus drop in March?" produces:
        "Your March bonus fell 12% ($847 to $745). Primary cause: 30% volume drop in downline 2 — John Doe CC units fell from 284 to 198."
      </Callout>
      <div style={{ marginTop:20 }}>
        {steps.map((s,i) => <PipelineStep key={s.num} {...s} isLast={i===steps.length-1} />)}
      </div>
    </div>
  );
}

// ── SMART INSIGHTS SECTION ───────────────────────────────────────

function SmartInsightsSection() {
  const [tab, setTab] = useState("overview");
  const detections = [
    { num:"01", title:"Volume Drop Detection", color:C.red, bg:C.redBg,
      role:"Trigger: CC units drop more than 15% week-over-week or 20% month-over-month for any distributor or downline",
      details:["Example alert: Your downline volume dropped 28% this week. John Doe and 2 others had no activity."],
      code:CODE.insightVolumeDrop, lang:"sql" },
    { num:"02", title:"Downline Inactivity Detection", color:C.orange, bg:C.orangeBg,
      role:"Trigger: Downline member has zero CC activity for 30+ days (configurable threshold)",
      details:["Example alert: 3 members in your downline have been inactive for 30+ days. They last ordered in August."],
      code:CODE.insightInactivity, lang:"sql" },
    { num:"03", title:"Rank Qualification Risk", color:C.purple, bg:C.purpleBg,
      role:"Trigger: Distributor is within 10% of losing current rank or within 20% of qualifying for next rank",
      details:["Example alert: You need 188 more CC this month to qualify for Gold rank. You are on track if downline 2 recovers."],
      code:CODE.insightRankRisk, lang:"sql" },
    { num:"04", title:"Growth Opportunity Detection", color:C.green, bg:C.greenBg,
      role:"Trigger: downlines within 20% of a key threshold (rank qualification, bonus tier, activity target)",
      details:["Example alert: downline 3 (Maria Santos) needs only 42 more CC to qualify for Silver rank this month."],
      code:CODE.insightGrowth, lang:"sql" },
  ];
  const pipelineSteps = [
    { num:1, color:C.gold, bg:C.goldBg, title:"EventBridge Triggers Insights Job",
      summary:"AWS EventBridge cron: nightly full scan and hourly critical check",
      detail:"Two schedules: Nightly 2 AM for full anomaly scan, Hourly for critical alerts only (rank drop risk, volume drop >30%).",
      code:CODE.insightSchedule, lang:"yaml" },
    { num:2, color:C.orange, bg:C.orangeBg, title:"Batch Redshift Queries",
      summary:"4 detection queries run in parallel against Redshift WLM queue",
      detail:"Detection queries run in parallel using the AI service read-only Redshift connection. Results collected into an anomaly_candidates list.", code:null },
    { num:3, color:C.purple, bg:C.purpleBg, title:"LLM Explanation Generation",
      summary:"Each raw anomaly row converted to plain-English insight by the LLM",
      detail:"Batch API call (not streaming) converts anomaly data to natural language alerts. Lightweight prompt — no SQL generation needed here.",
      code:CODE.insightLLMPrompt, lang:"prompt" },
    { num:4, color:C.accent, bg:C.accentBg, title:"Store Alerts and Surface on Dashboard",
      summary:"Insights written to DB, surfaced as banner on next user login",
      detail:"Alerts stored in distributor_insights table with priority, read status, and expiry. Dashboard banner shows unread count. Clicking opens detail panel with follow-up queries.",
      code:CODE.insightTable, lang:"sql" },
  ];
  return (
    <div>
      <SectionHeader title="Smart Insights Engine" tag="Smart Insights" tagColor={C.gold}
        subtitle="Proactive AI-powered anomaly detection and alert generation — surfaces issues before distributors notice them." />
      <Tabs tabs={[
        { id:"overview",   label:"How It Works" },
        { id:"detections", label:"Detection Types" },
        { id:"pipeline",   label:"Processing Pipeline" },
        { id:"alerts",     label:"Alert Architecture" },
      ]} active={tab} onChange={setTab} />
      {tab==="overview" && (
        <div>
          <Callout type="warn">
            <strong>Key Difference vs NL-SQL:</strong> Smart Insights is proactive — runs on a schedule and pushes alerts. NL-SQL is reactive — answers questions on demand.
          </Callout>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:20 }}>
            {[
              { title:"Scheduled Execution", color:C.gold, icon:"⏱",
                desc:"Runs nightly (full analysis) and hourly (lightweight checks). AWS EventBridge triggers the Insights Engine. No user interaction needed." },
              { title:"Threshold-Based Detection", color:C.orange, icon:"📉",
                desc:"Configurable rules: volume drops >15%, inactivity >30 days, rank gap <10%. Each distributor compared against their own historical baseline." },
              { title:"LLM-Powered Explanation", color:C.purple, icon:"🧠",
                desc:"Raw anomalies converted to plain-English alerts by the LLM. 'Your downline 2 CC dropped 30% vs last month, driven by 3 inactive members.'" },
              { title:"Dashboard Surfacing", color:C.accent, icon:"🔔",
                desc:"Alerts stored in insights table, surfaced as banner on dashboard next login. Actionable follow-up queries pre-generated for each alert." },
            ].map((card,i) => (
              <Card key={i} accent={card.color} bg={card.color+"06"}>
                <div style={{ fontSize:24, marginBottom:8 }}>{card.icon}</div>
                <CardTitle color={card.color}>{card.title}</CardTitle>
                <p style={{ color:C.textMd, fontSize:13, margin:0, lineHeight:1.65 }}>{card.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
      {tab==="detections" && (
        <div>
          <p style={{ color:C.muted, fontSize:13, marginBottom:18, lineHeight:1.6 }}>
            Four categories of proactive detection. Each runs as a separate Redshift query on a schedule.
          </p>
          {detections.map(d => <ExpandCard key={d.num} {...d} />)}
        </div>
      )}
      {tab==="pipeline" && (
        <div>
          {pipelineSteps.map((s,i) => <PipelineStep key={s.num} {...s} isLast={i===pipelineSteps.length-1} />)}
        </div>
      )}
      {tab==="alerts" && (
        <div>
          <Card style={{ marginBottom:16 }}>
            <CardTitle color={C.gold}>Alert Priority Matrix</CardTitle>
            <TableView headers={["Alert Type","Trigger Threshold","Priority","Timing"]} rows={[
              { cells:["Volume Drop (downline)",">30% week-over-week","HIGH","Hourly check"] },
              { cells:["Volume Drop (personal)",">15% month-over-month","MEDIUM","Nightly"] },
              { cells:["Rank Drop Risk","<10% above minimum CC","HIGH","Hourly check"] },
              { cells:["Rank Opportunity","Within 20% of next rank","MEDIUM","Nightly"] },
              { cells:["Downline Inactivity","30+ days no activity","MEDIUM","Nightly"] },
              { cells:["Critical Inactivity","60+ days no activity","HIGH","Hourly check"] },
              { hl:true, cells:["Growth Opportunity","downline within 15% of qualifying","LOW (positive)","Nightly"] },
            ]} />
          </Card>
          <Card>
            <CardTitle color={C.accent}>Pre-Generated Follow-Up Queries per Alert</CardTitle>
            {[
              { alert:"Volume Drop Alert", color:C.red,
                followUps:["Show me which members in downline  were inactive this week","Compare downline volume for the last 4 weeks","What was downline  best performing month this year?"] },
              { alert:"Rank Risk Alert", color:C.purple,
                followUps:["How many CC do I need in each downline to maintain Gold?","Show my personal volume trend for the last 6 months","Which downlines are closest to hitting their targets?"] },
              { alert:"Growth Opportunity Alert", color:C.green,
                followUps:["What does Maria Santos need to qualify for Silver?","Show downline 3 activity for the past 30 days","What support has worked for other downlines that qualified?"] },
            ].map((a,i) => (
              <div key={i} style={{ marginBottom:14, padding:14, background:a.color+"06",
                border:"1px solid "+a.color+"25", borderRadius:6 }}>
                <div style={{ color:a.color, fontWeight:700, fontSize:12.5, marginBottom:8 }}>{a.alert}</div>
                {a.followUps.map((q,j) => (
                  <div key={j} style={{ display:"flex", gap:8, marginBottom:5 }}>
                    <span style={{ color:a.color, flexShrink:0 }}>→</span>
                    <span style={{ color:C.textMd, fontSize:12.5, fontStyle:"italic" }}>"{q}"</span>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ── CONVERSATIONAL ASSISTANT SECTION ─────────────────────────────

function ConvAssistSection() {
  const [tab, setTab] = useState("overview");
  return (
    <div>
      <SectionHeader title="Conversational Assistant" tag="Chat Assistant" tagColor={C.purple}
        subtitle="Persistent, context-aware chat interface embedded in FLP360 — handles multi-turn conversations about distributor performance." />
      <Tabs tabs={[
        { id:"overview", label:"Architecture" },
        { id:"context",  label:"Context Management" },
        { id:"flows",    label:"Conversation Flows" },
        { id:"embed",    label:"UI Integration" },
      ]} active={tab} onChange={setTab} />
      {tab==="overview" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            {[
              { title:"Persistent Session State", color:C.purple, icon:"💾",
                desc:"Conversation state stored in Redis per session (TTL 30 min). Full history injected into each new prompt. User can continue mid-thought." },
              { title:"Report Page Context", color:C.accent, icon:"📋",
                desc:"When opened from a report page, the assistant is pre-seeded with that report data. User can immediately ask about what they are looking at." },
              { title:"Multi-Turn Reference Resolution", color:C.gold, icon:"🔗",
                desc:"'Compare that with last month' resolves 'that' from conversation history. 'Show me his activity' resolves 'his' from the last mentioned person." },
              { title:"Scope-Locked by Design", color:C.red, icon:"🔒",
                desc:"The assistant cannot discuss other distributors data. System prompt hardcodes this constraint. Every SQL query still goes through the same RLS validation pipeline." },
            ].map((card,i) => (
              <Card key={i} accent={card.color} bg={card.color+"06"}>
                <div style={{ fontSize:22, marginBottom:8 }}>{card.icon}</div>
                <CardTitle color={card.color}>{card.title}</CardTitle>
                <p style={{ color:C.textMd, fontSize:13, margin:0, lineHeight:1.65 }}>{card.desc}</p>
              </Card>
            ))}
          </div>
          <Card>
            <CardTitle color={C.purple}>Chat System Architecture Steps</CardTitle>
            {[
              { step:"1. WebSocket / SSE Connection", detail:"Frontend opens SSE connection to /api/ai/chat on page load. JWT auth on handshake. Session ID assigned.", color:C.accent },
              { step:"2. Session Store (Redis)", detail:"Session object: { sessionId, distributorId, turns:[], currentPage, entities:{} }. TTL refreshed on activity.", color:C.purple },
              { step:"3. Context Assembly", detail:"On each new message: last N turns + entity registry + current page context + distributor scope assembled into prompt.", color:C.gold },
              { step:"4. Streaming Response", detail:"LLM response streamed token-by-token via SSE. Frontend renders as it arrives. Each chunk appended to turn history.", color:C.green },
              { step:"5. Entity Extraction", detail:"Post-response: extract mentioned entities (names, metrics, periods) and add to session entity registry for future reference resolution.", color:C.orange },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:10, padding:"10px 0",
                borderBottom:"1px solid "+C.border, alignItems:"flex-start" }}>
                <span style={{ background:s.color, color:"#fff", borderRadius:4,
                  padding:"2px 8px", fontSize:10.5, fontWeight:800, flexShrink:0 }}>{i+1}</span>
                <div>
                  <div style={{ color:s.color, fontWeight:700, fontSize:13 }}>{s.step}</div>
                  <div style={{ color:C.textMd, fontSize:12.5, marginTop:3, lineHeight:1.5 }}>{s.detail}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab==="context" && (
        <div>
          <Card style={{ marginBottom:16 }}>
            <CardTitle color={C.purple}>Session Context Object (Redis)</CardTitle>
            <CodeBlock code={CODE.chatSession} lang="json" />
          </Card>
          <Card style={{ marginBottom:16 }}>
            <CardTitle color={C.gold}>Reference Resolution Examples</CardTitle>
            {[
              { input:"Compare that with last month", resolution:"'that' resolves to lastQueryResult.summary = March bonus $745", output:"Fetches Feb bonus and compares $847 vs $745" },
              { input:"Show me his activity log", resolution:"'his' resolves via entities.people to most recently mentioned person = John Doe = D004", output:"Queries activity_log WHERE distributor_id = 'D004'" },
              { input:"What about the other downlines?", resolution:"'other downlines' — last query was about downline 2 — implies all direct downline except D004", output:"Queries all direct downline EXCEPT D004" },
            ].map((r,i) => (
              <div key={i} style={{ marginBottom:12, padding:12, background:C.goldBg,
                border:"1px solid "+C.gold+"25", borderRadius:6 }}>
                <div style={{ color:C.text, fontSize:12.5, fontWeight:700, marginBottom:4 }}>User: "{r.input}"</div>
                <div style={{ color:C.muted, fontSize:12, marginBottom:4 }}>Resolved: {r.resolution}</div>
                <div style={{ color:C.green, fontSize:12 }}>Action: {r.output}</div>
              </div>
            ))}
          </Card>
          <Card>
            <CardTitle color={C.accent}>Context Window Management</CardTitle>
            <CodeBlock code={CODE.chatContext} lang="javascript" />
          </Card>
        </div>
      )}
      {tab==="flows" && (
        <div>
          {[
            { title:"Performance Investigation Flow", color:C.accent,
              turns:[
                { role:"user", msg:"Why did my bonus drop in March?" },
                { role:"ai",   msg:"Your March bonus fell 12% ($847 to $745). Primary cause: 30% volume drop in downline 2 — John Doe CC units fell from 284 to 198." },
                { role:"user", msg:"When did John Doe last place an order?" },
                { role:"ai",   msg:"John Doe last ordered on March 8th, 2024 — 23 days ago. His last 3 orders were in Jan, Feb, and March." },
                { role:"user", msg:"What about the other downlines?" },
                { role:"ai",   msg:"Your other downlines performed well: downline 1 (Maria Santos) was up 8%, downline 3 (Carlos Vega) stable at 142 CC." },
              ]},
            { title:"Rank Planning Flow", color:C.green,
              turns:[
                { role:"user", msg:"How close am I to Gold rank?" },
                { role:"ai",   msg:"You need 188 more CC for Gold (500 required, you have 312). downline 2 is only 2 CC away from the 200-downline requirement!" },
                { role:"user", msg:"Which downline should I focus on?" },
                { role:"ai",   msg:"Focus downline 2 first — they only need 2 CC to hit 200. After that, your personal volume gap of 186 CC is the remaining blocker." },
              ]},
          ].map((flow,fi) => (
            <Card key={fi} style={{ marginBottom:16 }} accent={flow.color} bg={flow.color+"04"}>
              <CardTitle color={flow.color}>{flow.title}</CardTitle>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {flow.turns.map((turn,ti) => (
                  <div key={ti} style={{ display:"flex", gap:10,
                    justifyContent:turn.role==="user"?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"80%",
                      background:turn.role==="user"?flow.color:C.surface,
                      border:turn.role==="user"?"none":"1px solid "+C.border,
                      color:turn.role==="user"?"#fff":C.textMd,
                      borderRadius:turn.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
                      padding:"9px 14px", fontSize:13, lineHeight:1.55 }}>
                      <div style={{ fontSize:9, fontWeight:700, marginBottom:4,
                        color:turn.role==="user"?"rgba(255,255,255,0.7)":C.mutedLt,
                        textTransform:"uppercase", letterSpacing:"0.06em" }}>
                        {turn.role==="user"?"Distributor":"FLP360 AI"}
                      </div>
                      {turn.msg}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab==="embed" && (
        <div>
          <Card style={{ marginBottom:16 }}>
            <CardTitle color={C.purple}>3 Embedding Modes in Existing Platform</CardTitle>
            {[
              { mode:"Floating Chat Widget (Global)", color:C.purple,
                desc:"Persistent chat bubble bottom-right of all pages. Opens a slide-in panel. Pre-seeded with current page context on open.",
                trigger:"Click chat bubble anywhere in platform",
                preseeded:"Current page type and visible data filters" },
              { mode:"Report-Specific Chat (Inline)", color:C.accent,
                desc:"'Ask about this report' button on individual report pages. Opens inline below the report. Has full report data as context immediately.",
                trigger:"Ask about this report button on report pages",
                preseeded:"Full report data JSON and comparison period data" },
              { mode:"Search Bar (Navigation)", color:C.green,
                desc:"NL search in nav bar. Handles navigation: 'show my Q1 bonus' navigates to the correct report with pre-applied filters.",
                trigger:"Focus on nav search bar and type",
                preseeded:"None — navigation intent only" },
            ].map((m,i) => (
              <div key={i} style={{ marginBottom:14, padding:16, background:m.color+"06",
                border:"1px solid "+m.color+"25", borderRadius:6 }}>
                <div style={{ color:m.color, fontWeight:700, fontSize:13, marginBottom:8 }}>{m.mode}</div>
                <p style={{ color:C.textMd, fontSize:12.5, margin:"0 0 8px", lineHeight:1.6 }}>{m.desc}</p>
                <div style={{ display:"grid", gridTemplateColumns:"110px 1fr", gap:"4px 12px", fontSize:12 }}>
                  <span style={{ color:C.muted, fontWeight:700 }}>Trigger:</span>
                  <span style={{ color:C.text }}>{m.trigger}</span>
                  <span style={{ color:C.muted, fontWeight:700 }}>Pre-seeded:</span>
                  <span style={{ color:C.text }}>{m.preseeded}</span>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <CardTitle color={C.accent}>Frontend Integration (Minimal Change)</CardTitle>
            <CodeBlock code={CODE.chatFrontend} lang="jsx" />
          </Card>
        </div>
      )}
    </div>
  );
}

// ── EXPLAINED REPORTS SECTION ─────────────────────────────────────

function ExpReportsSection() {
  const [tab, setTab] = useState("overview");
  const pipelineSteps = [
    { num:1, color:C.accent, bg:C.accentBg, title:"User clicks Explain This Report",
      summary:"Button click triggers explanation with current report data serialized",
      detail:"The frontend sends report ID to /api/ai/explain/{reportId}. No new Redshift query — data already loaded on page.",
      code:CODE.expFrontend, lang:"javascript" },
    { num:2, color:C.purple, bg:C.purpleBg, title:"Fetch Previous Period Data",
      summary:"AI service fetches comparison data from Redshift (previous month or quarter)",
      detail:"This is the one Redshift query triggered by Explain. Small, targeted query for previous period metrics. Goes through the same RLS validation pipeline.",
      code:CODE.expCompare, lang:"sql" },
    { num:3, color:C.gold, bg:C.goldBg, title:"Prompt Construction",
      summary:"Report data plus comparison data plus business rules assembled into explanation prompt",
      detail:"Simpler than NL-SQL prompt — data-to-narrative task, no SQL generation. Includes current data, previous period, business context, and instructions to highlight anomalies.",
      code:CODE.expPrompt, lang:"prompt" },
    { num:4, color:C.green, bg:C.greenBg, title:"LLM Generates Narrative (Streaming)",
      summary:"Claude Sonnet 4 generates explanation, streamed token-by-token to UI",
      detail:"Response streamed via SSE. Side panel opens immediately and text appears as generated. Typical latency to first token: under 500ms. Full explanation in 2-3 seconds.",
      code:null },
    { num:5, color:C.orange, bg:C.orangeBg, title:"Post-Process and Cache",
      summary:"Extract follow-up queries, cache explanation for 1 hour",
      detail:"After generation: extract follow-up suggestions, cache for 1 hour (same report + same data = same explanation), store in report_explanations for audit trail.",
      code:CODE.expCache, lang:"sql" },
  ];
  return (
    <div>
      <SectionHeader title="Explained Reports" tag="Explained Reports" tagColor={C.accent}
        subtitle="AI-generated narrative explanations for every existing report in FLP360 — surfaced as a side panel, email digest, or dashboard card." />
      <Tabs tabs={[
        { id:"overview",  label:"How It Works" },
        { id:"pipeline",  label:"Generation Pipeline" },
        { id:"outputs",   label:"Output Formats" },
        { id:"examples",  label:"Example Outputs" },
      ]} active={tab} onChange={setTab} />
      {tab==="overview" && (
        <div>
          <Callout type="info">
            <strong>Design principle:</strong> Explained Reports wraps existing reports — it does not replace them. Every report page gets one Explain button. The AI reads data already loaded on the page. No new SQL queries needed in most cases.
          </Callout>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:20 }}>
            {[
              { title:"Zero New Queries (Usually)", color:C.green, icon:"⚡",
                desc:"Report data is already loaded on the page. The AI reads the existing data structure — no additional Redshift queries. Narrative generated from what is already visible." },
              { title:"Comparison Injection", color:C.accent, icon:"📅",
                desc:"The system automatically fetches the previous period data (last month, last quarter) and injects it into the explanation prompt for comparison context." },
              { title:"Anomaly Highlighting", color:C.orange, icon:"⚠️",
                desc:"The LLM is instructed to proactively highlight notable changes, outliers, and anything deviating from the user historical pattern — not just describe the data." },
              { title:"Actionable Recommendations", color:C.purple, icon:"🎯",
                desc:"Every explanation ends with 1-2 specific recommended actions: 'Contact John Doe about March inactivity' or 'You are 42 CC away from Gold this month.'" },
            ].map((card,i) => (
              <Card key={i} accent={card.color} bg={card.color+"06"}>
                <div style={{ fontSize:22, marginBottom:8 }}>{card.icon}</div>
                <CardTitle color={card.color}>{card.title}</CardTitle>
                <p style={{ color:C.textMd, fontSize:13, margin:0, lineHeight:1.65 }}>{card.desc}</p>
              </Card>
            ))}
          </div>
          <Card style={{ marginTop:16 }}>
            <CardTitle>Reports Supported (All Existing FLP360 Reports)</CardTitle>
            <TableView headers={["Report","Data Passed to AI","Comparison Period","Special Instructions"]} rows={[
              { cells:["Bonus Summary","Total bonus, by type, by downline","Prior month + same month last year","Highlight any downline that dropped more than 15%"] },
              { cells:["Downline Network","Active/inactive counts, CC per downline, depth","Prior month activity","Flag inactive members by name if fewer than 5"] },
              { cells:["Commission Breakdown","Each commission type and amount","Prior month per type","Explain any new commission types appearing"] },
              { cells:["Rank History","Rank per month, CC per month, trajectory","Last 6 months","Predict next month rank based on trend"] },
              { cells:["Volume Summary","PV, CC, NC counts per period","Same period last year","Seasonal context if YoY change more than 20%"] },
              { cells:["New Member Report","New members, sponsor, first order date","Same period last month","Highlight fastest-growing downlines"] },
            ]} />
          </Card>
        </div>
      )}
      {tab==="pipeline" && (
        <div>
          {pipelineSteps.map((s,i) => <PipelineStep key={s.num} {...s} isLast={i===pipelineSteps.length-1} />)}
        </div>
      )}
      {tab==="outputs" && (
        <div>
          <Card>
            <CardTitle>3 Delivery Formats</CardTitle>
            {[
              { format:"Side Panel (On-Demand)", color:C.accent,
                desc:"Primary format. User clicks Explain on any report page. Side panel slides in with streaming explanation. Follow-up chat available at panel bottom.",
                when:"User-triggered, real-time, any report page" },
              { format:"Weekly Email Digest", color:C.purple,
                desc:"Auto-generated weekly email with explanations of the 3 most important reports. Sent every Monday. Uses batch API for cost efficiency.",
                when:"Scheduled, every Monday, all active distributors" },
              { format:"Dashboard Summary Card", color:C.green,
                desc:"A brief 2-3 sentence summary card on dashboard home explaining this week performance vs last week. Always visible without clicking.",
                when:"Auto-generated nightly, shown on dashboard" },
            ].map((f,i) => (
              <div key={i} style={{ marginBottom:14, padding:16, background:f.color+"06",
                border:"1px solid "+f.color+"25", borderRadius:6 }}>
                <div style={{ color:f.color, fontWeight:700, fontSize:13, marginBottom:4 }}>{f.format}</div>
                <p style={{ color:C.textMd, fontSize:12.5, margin:"0 0 6px", lineHeight:1.6 }}>{f.desc}</p>
                <div style={{ color:C.muted, fontSize:11.5 }}>When: {f.when}</div>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab==="examples" && (
        <div>
          {[
            { report:"Bonus Summary — March 2024", color:C.accent,
              explanation:"Your March bonus came in at $745, a 12% decrease from February's $847. The primary driver was a significant volume reduction in your second downline — that downline contributed 198 Case Credits this month versus 284 in February, a drop of 30%.\n\nYour personal volume remained stable at 312 CC, and your first downline performed well, up 8% month-over-month. The issue is concentrated in downline 2.\n\nRecommendation: Reach out to your downline 2 distributor about their March activity. Also, you are currently 188 CC short of Gold rank — if downline 2 returns to February levels, you would be within 90 CC of qualifying.",
              followUps:["Show me downline 2 activity for the past 3 months","What do I need to qualify for Gold this month?"] },
            { report:"Rank History — Last 6 Months", color:C.purple,
              explanation:"Your rank has been stable at Silver for the past 6 months, with personal CC ranging between 290 and 318. This consistency is positive, but your growth trajectory has plateaued since October.\n\nThe good news: your downline network has grown by 3 new members in the past 2 months. Two of those new members have already placed their first orders.\n\nRecommendation: Focus on activating your two newest members with a structured first-90-days plan. If both reach 100 CC per month, combined with your existing volume, Gold rank becomes achievable by Q3.",
              followUps:["Show me my newest members and their activity","What is the fastest path to Gold from my current position?"] },
          ].map((ex,i) => (
            <Card key={i} style={{ marginBottom:16 }} accent={ex.color} bg={ex.color+"04"}>
              <CardTitle color={ex.color}>{ex.report}</CardTitle>
              <div style={{ background:C.surface, border:"1px solid "+C.border, borderRadius:6, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:10, color:C.mutedLt, marginBottom:8, fontWeight:700,
                  letterSpacing:"0.06em", textTransform:"uppercase" }}>AI Generated Explanation</div>
                <p style={{ color:C.textMd, fontSize:13, lineHeight:1.8, margin:0, whiteSpace:"pre-line" }}>{ex.explanation}</p>
              </div>
              <div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:6, fontWeight:700 }}>Suggested follow-ups:</div>
                {ex.followUps.map((q,j) => (
                  <span key={j} style={{ display:"inline-block", margin:"0 6px 6px 0",
                    background:ex.color+"12", border:"1px solid "+ex.color+"30",
                    color:ex.color, borderRadius:20, padding:"4px 12px", fontSize:12 }}>"{q}"</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DATA ARCHITECTURE SECTION ─────────────────────────────────────

function DataArchSection() {
  const [tab, setTab] = useState("overview");
  const rlsLayers = [
    { layer:"Layer 1: JWT Claim Extraction (Application)", color:C.accent, code:CODE.rlsLayer1 },
    { layer:"Layer 2: SQL AST Validation + Predicate Injection (AI Service)", color:C.gold, code:CODE.rlsLayer2 },
    { layer:"Layer 3: Redshift Native Row-Level Security (Database)", color:C.red, code:CODE.rlsLayer3 },
  ];
  return (
    <div>
      <SectionHeader title="Data Architecture for AI" tag="Data"
        subtitle="How to build the Vector DB, Semantic Layer, and Row-Level Security to support the AI layer alongside existing Redshift warehouse." />
      <Tabs tabs={[
        { id:"overview", label:"Data Flow" },
        { id:"vectordb",  label:"Vector DB Setup" },
        { id:"semantic",  label:"Semantic Layer" },
        { id:"rls",       label:"Row-Level Security" },
      ]} active={tab} onChange={setTab} />
      {tab==="overview" && (
        <div>
          <Card style={{ marginBottom:16 }}>
            <CardTitle color={C.accent}>Existing Data Pipeline (unchanged)</CardTitle>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", padding:"10px 0" }}>
              <Pill color={C.muted}>AS400 / IBM DB2</Pill>
              <span style={{ color:C.muted }}>+</span>
              <Pill color={C.muted}>Aurora MySQL</Pill>
              <span style={{ color:C.muted }}>→ Informatica Pipelines →</span>
              <Pill color={C.accent}>Amazon Redshift (Data Warehouse)</Pill>
            </div>
            <p style={{ color:C.muted, fontSize:12.5, margin:"8px 0 0", lineHeight:1.6 }}>
              Source systems and ETL pipelines are <strong style={{ color:C.text }}>unchanged</strong>. The AI layer reads from Redshift only — no changes to AS400, Aurora MySQL, or Informatica.
            </p>
          </Card>
          <Card>
            <CardTitle color={C.green}>2 New AI Data Components</CardTitle>
            {[
              { title:"1. Vector DB (pgvector on RDS PostgreSQL)", color:C.green,
                where:"New RDS instance alongside Redshift",
                stores:"Schema docs, query examples, glossary, rank rules — all as vector embeddings",
                when:"At query time: RAG retrieval for schema context and few-shot examples" },
              { title:"2. Semantic Layer (YAML in AI Service)", color:C.purple,
                where:"Config file inside AI microservice — no new infrastructure",
                stores:"CC/PV/NC metric definitions, rank thresholds, time dimension mappings",
                when:"Every prompt injection. Also serves rank advisor directly with no SQL needed" },

            ].map((item,i) => (
              <div key={i} style={{ marginBottom:14, padding:14, background:item.color+"06",
                border:"1px solid "+item.color+"25", borderRadius:6 }}>
                <div style={{ color:item.color, fontWeight:700, fontSize:13, marginBottom:8 }}>{item.title}</div>
                <div style={{ display:"grid", gridTemplateColumns:"90px 1fr", gap:"4px 12px", fontSize:12.5 }}>
                  <span style={{ color:C.muted, fontWeight:700 }}>Where:</span><span style={{ color:C.text }}>{item.where}</span>
                  <span style={{ color:C.muted, fontWeight:700 }}>Stores:</span><span style={{ color:C.text }}>{item.stores}</span>
                  <span style={{ color:C.muted, fontWeight:700 }}>Used when:</span><span style={{ color:C.text }}>{item.when}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
      {tab==="vectordb" && (
        <div>
          <Callout type="info">
            The Vector DB stores embeddings of schema docs, business rules, and past query examples. When a user asks a question, the system retrieves the most relevant context to inject into the LLM prompt — improving accuracy without including irrelevant schema noise.
          </Callout>
          <Card style={{ marginTop:20, marginBottom:16 }}>
            <CardTitle color={C.green}>4 Collections (click to expand)</CardTitle>
            <ExpandRow color={C.accent}  collection="schema_registry" desc="Table and column docs with business descriptions" example={CODE.vectorEx1} />
            <ExpandRow color={C.purple} collection="query_examples"   desc="Verified NL question to SQL pairs for few-shot prompting" example={CODE.vectorEx2} />
            <ExpandRow color={C.gold}   collection="business_glossary" desc="FLP-specific terms and their technical mappings" example={CODE.vectorEx3} />
            <ExpandRow color={C.green}  collection="rank_rules"        desc="Rank qualification requirements and thresholds" example={CODE.vectorEx4} />
          </Card>
          <Card style={{ marginBottom:16 }}>
            <CardTitle color={C.accent}>Schema and Index Setup</CardTitle>
            <CodeBlock code={CODE.vectorSetup} lang="sql" />
          </Card>
          <Card>
            <CardTitle color={C.purple}>Embedding with Bedrock Titan (stays in VPC)</CardTitle>
            <CodeBlock code={CODE.vectorEmbed} lang="java" />
          </Card>
        </div>
      )}
      {tab==="semantic" && (
        <div>
          <Callout type="info">
            A YAML config inside the AI service — no separate infrastructure. Maps business language to SQL. "My bonus" becomes SUM(bonus_amount). Injected into every LLM prompt.
          </Callout>
          <Card style={{ marginTop:20, marginBottom:16 }}>
            <CardTitle color={C.purple}>YAML Structure</CardTitle>
            <CodeBlock code={CODE.semanticYaml} lang="yaml" />
          </Card>
          <Card>
            <CardTitle>Where Semantic Layer Is Used</CardTitle>
            {[
              { where:"Every LLM Prompt", how:"Metric definitions injected so LLM knows 'bonus' = SUM(bonus_amount) FROM bonus_facts", color:C.accent },
              { where:"Query Router",     how:"Alias matching resolves 'my CC' to cc_units before LLM call", color:C.purple },
              { where:"Rank Advisor",     how:"Rank requirements served directly — no SQL for 'How do I reach Gold?'", color:C.green },
              { where:"Insights Engine",  how:"Detection thresholds defined here, not hardcoded in application logic", color:C.gold },
            ].map((u,i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:10, padding:"9px 0",
                borderBottom:"1px solid "+C.border, alignItems:"flex-start" }}>
                <Pill color={u.color}>{u.where}</Pill>
                <span style={{ color:C.textMd, fontSize:12.5, lineHeight:1.5 }}>{u.how}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="rls" && (
        <div>
          <p style={{ color:C.muted, fontSize:13, marginBottom:18, lineHeight:1.6 }}>
            Three independent layers. All three must pass. Any single layer alone is sufficient to prevent unauthorized access.
          </p>
          {rlsLayers.map((l,i) => (
            <Card key={i} style={{ marginBottom:14 }} accent={l.color} bg={l.color+"04"}>
              <CardTitle color={l.color}>{l.layer}</CardTitle>
              <CodeBlock code={l.code} lang="sql" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DEPLOYMENT SECTION ────────────────────────────────────────────

function DeploymentSection() {
  const [selected, setSelected] = useState(null);
  const options = [
    { id:"bedrock", label:"AWS Bedrock", tag:"Recommended", tagColor:C.accent, color:C.accent,
      model:"Claude Sonnet 4 / Haiku 3.5", privacy:"VPC-isolated, no data egress", latency:"~1.2-1.5s", compliance:"SOC2, HIPAA, ISO 27001",
      pros:["Data never leaves AWS VPC","Native IAM, CloudWatch, VPC endpoints","Enterprise AWS SLA","Best NL-SQL accuracy","Streaming supported","Model versioning — you control upgrades"],
      cons:["Limited to Bedrock catalog","Higher per-token cost vs direct API","Not all AWS regions"],
      steps:["Enable Bedrock and request Claude Sonnet 4 access","Create VPC private endpoint for Bedrock","IAM role with bedrock:InvokeModel permission","Set endpoint URL in AI Service config"] },
    { id:"openai", label:"OpenAI API", tag:"High Accuracy", tagColor:C.purple, color:C.purple,
      model:"GPT-4.1 / GPT-4o-mini", privacy:"Data leaves AWS — requires DPA", latency:"~1.0-1.5s", compliance:"SOC2 Type 2, GDPR (with DPA)",
      pros:["GPT-4.1 best-in-class SQL generation","Zero setup — just API key","GPT-4o-mini for cheap simple queries","Strong structured JSON output"],
      cons:["Financial data leaves AWS","Requires Data Processing Agreement","Compliance risk for MLM financial data","Provider outage equals AI outage"],
      steps:["Create OpenAI org, negotiate DPA","Store API key in AWS Secrets Manager","Configure OpenAI SDK in AI Service","Implement rate limiting and fallback"] },
    { id:"gemini", label:"Gemini / Vertex AI", tag:"Best Value", tagColor:C.gold, color:C.gold,
      model:"Gemini 1.5 Pro / Gemini Flash", privacy:"VPC via Vertex AI", latency:"~1.5-2.5s", compliance:"SOC2, ISO 27001, HIPAA (Vertex)",
      pros:["Gemini Flash: $0.075 per 1M tokens — cheapest","1M context window (fit entire schema)","Vertex AI: data stays in GCP VPC","Competitive pricing at scale"],
      cons:["Requires GCP account — cross-cloud from AWS","Vertex AI setup more complex","Weaker at complex multi-table SQL","Cross-cloud latency AWS to GCP"],
      steps:["Create GCP project, enable Vertex AI","VPC peering or direct Gemini API","Workload Identity Federation or service account","Vertex AI Java SDK in AI Service"] },
    { id:"self", label:"Self-Hosted Llama", tag:"Max Privacy", tagColor:C.red, color:C.red,
      model:"Llama 3.3 70B Instruct (Meta)", privacy:"100% on-premise", latency:"~2-4s", compliance:"Full control",
      pros:["Zero data egress","Fixed GPU cost — no per-token billing","Can fine-tune on FLP patterns","No external rate limits","Breakeven at ~2M queries per month"],
      cons:["p3.2xlarge ~$3.5/hr needed","$50K-100K engineering setup","Needs ML/CUDA expertise","Lower accuracy than Claude/GPT-4 for complex SQL"],
      steps:["Provision p3.2xlarge or p4d on AWS","Deploy vLLM with Llama 3.3 70B","OpenAI-compatible API endpoint","Auto-scaling on query volume"] },
  ];
  const opt = options.find(o=>o.id===selected);
  return (
    <div>
      <SectionHeader title="Deployment Options" tag="Deployment"
        subtitle="4 options: AWS Bedrock, OpenAI, Google Gemini/Vertex AI, Self-Hosted Llama. Click any card to expand full analysis." />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:20 }}>
        {options.map(o => (
          <div key={o.id} onClick={() => setSelected(selected===o.id?null:o.id)}
            style={{ background:selected===o.id?o.color+"08":C.surface,
              border:"1px solid "+(selected===o.id?o.color:C.border),
              borderRadius:8, padding:16, cursor:"pointer",
              boxShadow:selected===o.id?"0 0 0 2px "+o.color+"30":"0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ color:o.color, fontWeight:700, fontSize:13 }}>{o.label}</span>
              <span style={{ background:o.tagColor+"15", color:o.tagColor,
                border:"1px solid "+o.tagColor+"40", borderRadius:10,
                padding:"2px 8px", fontSize:9.5, fontWeight:700 }}>{o.tag}</span>
            </div>
            <div style={{ fontSize:11.5, color:C.muted, lineHeight:1.7 }}>
              <div>Model: <span style={{ color:C.text }}>{o.model}</span></div>
              <div>Privacy: {o.privacy}</div>
              <div>Latency: <span style={{ color:C.text }}>{o.latency}</span></div>
            </div>
          </div>
        ))}
      </div>
      {opt && (
        <Card accent={opt.color} bg={opt.color+"04"}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            <div>
              <CardTitle color={opt.color}>Pros</CardTitle>
              {opt.pros.map((p,i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <span style={{ color:C.green, flexShrink:0, fontWeight:700 }}>+</span>
                  <span style={{ color:C.textMd, fontSize:12.5, lineHeight:1.5 }}>{p}</span>
                </div>
              ))}
            </div>
            <div>
              <CardTitle color={C.red}>Cons</CardTitle>
              {opt.cons.map((c,i) => (
                <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <span style={{ color:C.red, flexShrink:0, fontWeight:700 }}>-</span>
                  <span style={{ color:C.textMd, fontSize:12.5, lineHeight:1.5 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop:18, borderTop:"1px solid "+opt.color+"20", paddingTop:16 }}>
            <CardTitle color={opt.color}>Setup Steps for FLP360</CardTitle>
            {opt.steps.map((s,i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                <span style={{ background:opt.color, color:"#fff", borderRadius:"50%",
                  width:20, height:20, minWidth:20, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:10, fontWeight:800 }}>{i+1}</span>
                <span style={{ color:C.textMd, fontSize:12.5, lineHeight:1.5 }}>{s}</span>
              </div>
            ))}
          </div>
          <Callout type="info">Compliance: {opt.compliance} | Privacy: {opt.privacy}</Callout>
        </Card>
      )}
      <Callout type="warn" style={{ marginTop:14 }}>
        <strong>Recommendation:</strong> Use <strong>AWS Bedrock (Claude Sonnet 4)</strong> as primary.
        Route simple queries to <strong>Gemini Flash</strong> (~70% of traffic, 10x cheaper).
        Avoid direct OpenAI unless you sign a DPA. Self-hosted Llama only beyond 2M queries/month.
      </Callout>
    </div>
  );
}

// ── TOKEN MANAGEMENT TAB ─────────────────────────────────────────

function TokenMgmtTab() {
  return (
    <div>
      <Callout type="info">
        <strong>Why this matters:</strong> At 500K queries/month with Bedrock Claude Sonnet 4, every 100 extra input tokens per query adds ~$225/month. Token discipline is the single highest-leverage cost control lever.
      </Callout>

      <Card style={{ marginTop:20, marginBottom:16 }}>
        <CardTitle color={C.accent}>Token Budget Per Query Type</CardTitle>
        <TableView headers={["Query Type","Input Budget","Output Budget","Rationale"]} rows={[
          { hl:true, cells:["NL to SQL (complex)","3,500 tokens","600 tokens","Schema (800) + rules (400) + few-shots (900) + history (600) + system (400) + question (400)"] },
          { cells:["NL to SQL (simple)","1,200 tokens","300 tokens","Router-classified as simple: minimal schema, no few-shots, short system prompt"] },
          { cells:["Report Explanation","2,500 tokens","500 tokens","Report data JSON (1,200) + prev period (600) + system (400) + instructions (300)"] },
          { cells:["Rank Advisor","800 tokens","400 tokens","Served from Semantic Layer directly — no schema or few-shots needed"] },
          { cells:["Conversational (follow-up)","2,000 tokens","400 tokens","Last 3 turns (600) + entity context (300) + page context (200) + system (500) + question (400)"] },
          { cells:["Insight Explanation (batch)","500 tokens","150 tokens","Lightweight: anomaly JSON only — no schema, no history, no few-shots"] },
        ]} />
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card accent={C.green} bg={C.greenBg}>
          <CardTitle color={C.green}>Prompt Efficiency Techniques</CardTitle>
          {[
            { tip:"Schema Slicing", detail:"Never send the full Redshift schema. Use the Query Router to classify the domain (bonus, volume, rank) then retrieve only the 2-3 relevant tables from Vector DB. Saves 1,500-2,000 tokens per query." },
            { tip:"Few-Shot Capping", detail:"Limit to exactly 3 few-shot examples retrieved from pgvector. Each example averages 300 tokens (question + SQL). 3 examples = 900 tokens. Never use more than 3." },
            { tip:"History Summarisation", detail:"After 5 conversation turns, summarise older turns with a lightweight LLM call (Haiku 3) into a 100-token summary. Prevents unbounded context growth in long sessions." },
            { tip:"JSON Mode Output", detail:"Use structured JSON output mode for SQL generation. Avoids verbose LLM preamble ('Great question, here is the SQL...'). Reduces output tokens by 40-60%." },
            { tip:"Result Truncation", detail:"Pass only the first 20 rows of SQL results back to the LLM for explanation. The LLM does not need the full 500-row result to generate a narrative." },
          ].map((item,i) => (
            <div key={i} style={{ marginBottom:12, paddingBottom:12,
              borderBottom: i<4 ? "1px solid "+C.border : "none" }}>
              <div style={{ color:C.green, fontWeight:700, fontSize:12.5, marginBottom:4 }}>{item.tip}</div>
              <div style={{ color:C.textMd, fontSize:12.5, lineHeight:1.6 }}>{item.detail}</div>
            </div>
          ))}
        </Card>

        <Card accent={C.purple} bg={C.purpleBg}>
          <CardTitle color={C.purple}>User-Level Token Restrictions</CardTitle>
          {[
            { limit:"Daily token budget", value:"50,000 input tokens / user / day", rationale:"Prevents a single power user from driving outsized costs. Roughly 35 complex queries or 100+ simple lookups per day." },
            { limit:"Per-query hard cap", value:"4,000 input tokens max", rationale:"Hard ceiling enforced by the AI Service before the LLM call. Returns an error if prompt assembly exceeds this — forces schema slicing to kick in." },
            { limit:"Output token cap", value:"800 tokens max per response", rationale:"Narratives longer than 800 tokens are rarely useful. Enforces concise, actionable answers. Pass max_tokens=800 to every API call." },
            { limit:"Conversation turn cap", value:"20 turns max per session", rationale:"After 20 turns, session is closed and user must start a new one. Prevents accumulated context from inflating costs." },
            { limit:"Insight batch cap", value:"50 anomaly explanations / run", rationale:"Cap nightly batch explanations at 50 per distributor. Prioritise HIGH alerts. LOW alerts text-templated rather than LLM-generated." },
            { limit:"Rate limit", value:"10 queries / user / minute", rationale:"API Gateway rate limit. Prevents scripted abuse. Most users never exceed 2-3 queries/minute in normal use." },
          ].map((item,i) => (
            <div key={i} style={{ marginBottom:10, paddingBottom:10,
              borderBottom: i<5 ? "1px solid "+C.border+"60" : "none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ color:C.purple, fontWeight:700, fontSize:12 }}>{item.limit}</span>
                <span style={{ background:C.purpleBg, border:"1px solid "+C.purple+"30",
                  color:C.purple, borderRadius:10, padding:"1px 8px", fontSize:10.5, fontWeight:700 }}>{item.value}</span>
              </div>
              <div style={{ color:C.textMd, fontSize:12, lineHeight:1.55 }}>{item.rationale}</div>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ marginBottom:16 }}>
        <CardTitle color={C.orange}>Query Routing to Cheaper Models — Cost-Tiered Routing</CardTitle>
        <p style={{ color:C.muted, fontSize:13, marginBottom:14, lineHeight:1.65 }}>
          Not every query needs Claude Sonnet 4. Route by complexity to dramatically reduce cost with no user-visible quality loss.
        </p>
        <TableView headers={["Query Category","Model","Input $/1M","Example","Saving vs Sonnet 4"]} rows={[
          { cells:["Simple lookup / rank check","Claude Haiku 3.5","$0.80","How do I reach Gold?","73% cheaper"] },
          { cells:["Single-table NL-SQL","Gemini Flash 1.5","$0.075","Show my March bonus","97% cheaper"] },
          { cells:["Multi-table NL-SQL","Claude Sonnet 4","$3.00","Why did my bonus drop in March?","Baseline"] },
          { cells:["Report explanation","Claude Sonnet 4","$3.00","Explain this report","Baseline"] },
          { cells:["Insight batch (nightly)","Claude Haiku 3.5","$0.80","Anomaly to text","73% cheaper"] },
          { hl:true, cells:["Typical traffic mix (70/20/10)","Weighted avg","~$0.45","","~85% saving vs all-Sonnet 4"] },
        ]} />
        <Callout type="success">
          Implementing cost-tiered routing is a one-time engineering effort in the Query Router (1-2 weeks). At 500K queries/month, this alone reduces LLM spend from ~$4,500/mo to ~$700/mo.
        </Callout>
      </Card>

      <Card style={{ marginBottom:16 }} accent={C.gold} bg={C.goldBg}>
        <CardTitle color={C.gold}>Caching Strategy — Avoid LLM Calls Entirely</CardTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          {[
            { type:"Semantic Cache", color:C.gold,
              desc:"Hash the normalised user question + distributor rank tier. Cache LLM response for 1 hour. Same question from same rank = identical response. Est. 15-25% hit rate.",
              saving:"15-25% query cost reduction" },
            { type:"Report Explanation Cache", color:C.accent,
              desc:"Cache the generated explanation per report + distributor + period. TTL 1 hour. Same distributor clicking Explain twice = serve from cache. Hit rate ~60%.",
              saving:"~60% reduction in Explain calls" },
            { type:"Rank Advisor Cache", color:C.green,
              desc:"Rank advice is deterministic given current CC/rank. Cache per distributor rank tier (not individual). All Silver distributors with 300-350 CC get same advice.",
              saving:"Near 100% cache hit rate" },
          ].map((c,i) => (
            <div key={i} style={{ padding:14, background:c.color+"08",
              border:"1px solid "+c.color+"25", borderRadius:6 }}>
              <div style={{ color:c.color, fontWeight:700, fontSize:12.5, marginBottom:6 }}>{c.type}</div>
              <p style={{ color:C.textMd, fontSize:12, lineHeight:1.6, margin:"0 0 8px" }}>{c.desc}</p>
              <div style={{ color:c.color, fontSize:11.5, fontWeight:700 }}>{c.saving}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card accent={C.red}>
        <CardTitle color={C.red}>Token Cost Monitoring — What to Alert On</CardTitle>
        <TableView headers={["Metric","Warning Threshold","Critical Threshold","Action"]} rows={[
          { cells:["Avg input tokens / query",">2,500 tokens",">3,500 tokens","Audit prompt assembly — schema slicing may be failing"] },
          { cells:["Output tokens / query",">600 tokens",">900 tokens","Check max_tokens enforcement — LLM may be ignoring cap"] },
          { cells:["User daily spend",">$0.50/user/day",">$1.00/user/day","Check if daily token budget is enforced correctly"] },
          { cells:["Cache hit rate","<10%","<5%","TTL may be too short, or cache key collision — investigate"] },
          { cells:["Simple query to frontier LLM",">20% of simple Q","N/A","Router mis-classifying simple queries — retrain classifier"] },
          { cells:["Monthly LLM spend",">$6,000/mo at 50K users",">$9,000/mo","Activate hybrid routing if not already, raise cache TTLs"] },
        ]} />
        <Callout type="warn">
          Set up AWS CloudWatch dashboards on Bedrock invocation metrics plus custom metrics from the AI Service on token counts per query type. Review weekly for the first 3 months post-launch.
        </Callout>
      </Card>
    </div>
  );
}

// ── COST SECTION ──────────────────────────────────────────────────

function CostSection() {
  const [costTab, setCostTab] = useState("estimates");
  const [scale, setScale] = useState("50k");
  const labels = { "10k":"10K Users / 100K Q/mo","50k":"50K Users / 500K Q/mo","100k":"100K Users / 1M Q/mo" };
  const mults  = { "10k":0.1,"50k":0.5,"100k":1.0 };
  const prices = {
    bedrock:    { name:"AWS Bedrock (Claude Sonnet 4)",   inp:3.00,  out:15.00 },
    openai:     { name:"OpenAI GPT-4.1",                  inp:2.00,  out:8.00  },
    gemini_pro: { name:"Gemini 1.5 Pro (Vertex AI)",      inp:1.25,  out:5.00  },
    gemini_fl:  { name:"Gemini Flash 1.5",                inp:0.075, out:0.30  },
    gpt4o_mini: { name:"GPT-4o-mini",                     inp:0.15,  out:0.60  },
    llama:      { name:"Self-Hosted Llama 3.3 70B",       fixed:2500            },
  };
  const infra = {
    "10k":  { redshift:130,  vector:80,  api:30,  eng:6000 },
    "50k":  { redshift:450,  vector:200, api:120, eng:6500 },
    "100k": { redshift:900,  vector:400, api:220, eng:10000 },
  };
  const qm = mults[scale];
  const llmCost = key => { const p=prices[key]; return p.fixed?p.fixed:Math.round(qm*(1.5*p.inp+0.5*p.out)); };
  const inf = infra[scale];
  const infTotal = Object.values(inf).reduce((a,b)=>a+b,0);
  return (
    <div>
      <SectionHeader title="Cost Analysis" tag="Cost"
        subtitle="Monthly cost estimates and token management strategies to control LLM spend for FLP360." />
      <Tabs tabs={[
        { id:"estimates",  label:"Cost Estimates" },
        { id:"tokens",     label:"Token Management" },
      ]} active={costTab} onChange={setCostTab} />
      {costTab==="tokens" && <TokenMgmtTab />}
      {costTab==="estimates" && <div>
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {Object.entries(labels).map(([k,v]) => (
          <button key={k} onClick={() => setScale(k)} style={{
            background:scale===k?C.accent:C.surface,
            border:"1px solid "+(scale===k?C.accent:C.border),
            color:scale===k?"#fff":C.muted,
            padding:"8px 16px", borderRadius:6, fontSize:12.5,
            cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>{v}</button>
        ))}
      </div>
      <Card style={{ marginBottom:18 }}>
        <CardTitle color={C.accent}>LLM Inference Cost — {labels[scale]}</CardTitle>
        <TableView headers={["Provider / Model","$/1M input","$/1M output","LLM Cost/mo","Note"]}
          rows={Object.entries(prices).map(([k,p]) => ({
            hl:k==="bedrock",
            cells:[p.name, p.fixed?"N/A (GPU)":"$"+p.inp, p.fixed?"N/A":"$"+p.out,
              "$"+llmCost(k).toLocaleString()+"/mo",
              k==="bedrock"?"Recommended":k==="gemini_fl"?"Cheapest — simple queries":k==="llama"?"Fixed GPU cost":""]
          }))} />
      </Card>
      <Card style={{ marginBottom:18 }}>
        <CardTitle color={C.purple}>Infrastructure Costs (same regardless of LLM) — {labels[scale]}</CardTitle>
        <TableView headers={["Component","AWS Service","Cost/mo","Notes"]}
          rows={[
            { cells:["Redshift overhead","Existing cluster + AI WLM","$"+inf.redshift+"/mo","WLM queue + AI views"] },
            { cells:["Vector DB","RDS PostgreSQL + pgvector","$"+inf.vector+"/mo","r6g.large to xlarge at 100K"] },
            { cells:["AI Service","ECS Fargate + API GW","$"+inf.api+"/mo","2-4 auto-scaled tasks"] },
            { cells:["Engineering","Ongoing team","$"+inf.eng.toLocaleString()+"/mo","Maintenance + features"] },
            { hl:true, cells:["INFRA SUBTOTAL","","$"+infTotal.toLocaleString()+"/mo","Same across all providers"] },
          ]} />
      </Card>
      <Card>
        <CardTitle color={C.gold}>Total Monthly Cost (LLM + Infra) — {labels[scale]}</CardTitle>
        <TableView headers={["LLM Option","LLM Cost","+ Infra","= Total/mo","Per Query"]}
          rows={Object.entries(prices).map(([k,p]) => {
            const llm=llmCost(k), total=llm+infTotal, q=Math.round(qm*1000000);
            return { hl:k==="bedrock",
              cells:[p.name,"$"+llm.toLocaleString(),"$"+infTotal.toLocaleString(),
                     "$"+total.toLocaleString()+"/mo","$"+(total/q).toFixed(4)] };
          })} />
        <Callout type="success">
          <strong>Hybrid strategy:</strong> Route ~70% of traffic (simple lookups) to <strong>Gemini Flash</strong> and 30% (complex NL-SQL) to <strong>Bedrock Claude Sonnet 4</strong>. Typically reduces total LLM cost by 50-60%.
        </Callout>
      </Card>
      </div>}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState("overview");
  const sections = {
    "overview":       <OverviewSection />,
    "arch-diagram":   <ArchDiagramSection />,
    "ai-system":      <AISystemSection />,
    "nl-sql":         <NLSQLSection />,
    "smart-insights": <SmartInsightsSection />,
    "conv-assist":    <ConvAssistSection />,
    "exp-reports":    <ExpReportsSection />,
    "data-arch":      <DataArchSection />,
    "deployment":     <DeploymentSection />,
    "cost":           <CostSection />,
  };
  return (
    <div style={{ background:C.bg, color:C.text,
      fontFamily:"'Inter','Segoe UI',sans-serif",
      minHeight:"100vh", display:"flex", fontSize:14 }}>
      <div style={{ width:230, minWidth:230, background:C.sidebar,
        padding:"0 0 24px", position:"sticky", top:0,
        height:"100vh", overflowY:"auto", flexShrink:0 }}>
        <div style={{ padding:"20px 18px 18px", borderBottom:"1px solid #334155", marginBottom:8 }}>
          <div style={{ fontSize:10, color:C.sideActive, letterSpacing:"0.12em",
            marginBottom:3, fontWeight:800, textTransform:"uppercase" }}>FLP360</div>
          <div style={{ fontSize:13, color:"#F1F5F9", fontWeight:700, lineHeight:1.4 }}>
            AI Integration<br/>Architecture
          </div>
          <div style={{ fontSize:10.5, color:"#64748B", marginTop:4 }}>Deep Dive Reference</div>
        </div>
        {NAV.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)} style={{
            display:"flex", alignItems:"center", gap:10,
            width:"100%", padding:"9px 18px",
            background:active===s.id?"rgba(56,189,248,0.12)":"transparent",
            border:"none",
            borderLeft:"3px solid "+(active===s.id?C.sideActive:"transparent"),
            color:active===s.id?C.sideActive:C.sideText,
            fontSize:12.5, cursor:"pointer", textAlign:"left",
            fontFamily:"inherit", fontWeight:active===s.id?700:400 }}>
            <span style={{ fontSize:13 }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"32px 40px", maxWidth:1060 }}>
        {sections[active]}
      </div>
    </div>
  );
}
