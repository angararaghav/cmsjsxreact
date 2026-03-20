import { useState } from "react";

// ── COLOR TOKENS ─────────────────────────────────────────────────
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

// ── SHARED PRIMITIVES (inlined from architecture doc) ────────────

function SectionHeader({ title, subtitle, tag, tagColor }) {
  return (
    <div style={{ marginBottom:28 }}>
      {tag && (
        <div style={{ marginBottom:8 }}>
          <span style={{ display:"inline-block", padding:"2px 10px",
            background:(tagColor||C.accent)+"18", border:"1px solid "+(tagColor||C.accent)+"40",
            borderRadius:4, fontSize:10, color:tagColor||C.accent,
            letterSpacing:"0.07em", textTransform:"uppercase", fontWeight:700 }}>
            {tag}
          </span>
        </div>
      )}
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


// ── Shared mini-UI primitives ─────────────────────────────────────
function MockBadge({ color, children }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4,
      background:color+"18", border:"1px solid "+color+"40",
      color, borderRadius:20, padding:"2px 9px", fontSize:10.5, fontWeight:700 }}>
      {children}
    </span>
  );
}
function MockBtn({ color, children, onClick, style }) {
  return (
    <button onClick={onClick} style={{ background:color, color:"#fff", border:"none",
      borderRadius:5, padding:"6px 14px", fontSize:12, fontWeight:700,
      cursor:"pointer", fontFamily:"inherit", ...(style||{}) }}>
      {children}
    </button>
  );
}
function MockOutlineBtn({ color, children, onClick, style }) {
  return (
    <button onClick={onClick} style={{ background:"transparent",
      border:"1px solid "+color, color, borderRadius:5,
      padding:"5px 13px", fontSize:12, fontWeight:600,
      cursor:"pointer", fontFamily:"inherit", ...(style||{}) }}>
      {children}
    </button>
  );
}
function MockCard({ children, style }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #E2E8F0",
      borderRadius:8, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", ...(style||{}) }}>
      {children}
    </div>
  );
}
function MockBar({ value, max, color, label, sub }) {
  const pct = Math.round((value/max)*100);
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ color:"#334155", fontSize:12.5, fontWeight:600 }}>{label}</span>
        <span style={{ color:sub?"#64748B":"#334155", fontSize:12, fontWeight:sub?400:600 }}>{sub||value+" CC"}</span>
      </div>
      <div style={{ height:7, background:"#F1F5F9", borderRadius:4, overflow:"hidden" }}>
        <div style={{ height:"100%", width:pct+"%", background:color, borderRadius:4,
          transition:"width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ── 1. NL to SQL Mockup ───────────────────────────────────────────
function NLSQLMockup() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | thinking | result
  const [shown, setShown] = useState(0);

  const EXAMPLE_Q = "Why did my bonus drop in March?";
  const RESULT_TEXT = "Your March bonus fell 12% ($847 → $745). The primary cause was a 30% volume drop in downline 2 — John Doe's CC units fell from 284 to 198. Your personal volume and downline 1 remained stable.";

  const handleAsk = () => {
    const q = query.trim() || EXAMPLE_Q;
    setQuery(q);
    setPhase("thinking");
    setShown(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(i);
      if (i >= RESULT_TEXT.length) { clearInterval(interval); setPhase("result"); }
    }, 18);
  };
  const handleReset = () => { setQuery(""); setPhase("idle"); setShown(0); };

  const suggestions = [
    "Why did my bonus drop in March?",
    "Show my downline 2 activity for last 3 months",
    "Which downlines are closest to qualifying for Silver?",
    "Compare my Q1 vs Q2 volume this year",
  ];

  return (
    <div>
      {/* Platform chrome */}
      <div style={{ background:"#1E293B", borderRadius:"10px 10px 0 0",
        padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#EF4444" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#F59E0B" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#10B981" }} />
        <span style={{ color:"#94A3B8", fontSize:11, marginLeft:8 }}>FLP360 — Bonus Summary Report</span>
      </div>

      {/* Top nav bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0",
        padding:"10px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ color:"#0284C7", fontWeight:800, fontSize:13 }}>FLP360</span>
        <span style={{ color:"#CBD5E1", fontSize:14 }}>|</span>
        {["Dashboard","Reports","Downline","Rank Progress"].map((item,i) => (
          <span key={i} style={{ color: i===1?"#0284C7":"#64748B", fontSize:12.5,
            fontWeight: i===1?700:400, cursor:"pointer",
            borderBottom: i===1?"2px solid #0284C7":"none", paddingBottom:2 }}>{item}</span>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center",
          gap:8, background:"#F8FAFC", border:"1px solid #E2E8F0",
          borderRadius:20, padding:"5px 14px", cursor:"text", minWidth:220 }}
          onClick={() => { setQuery(EXAMPLE_Q); }}>
          <span style={{ fontSize:13 }}>🔍</span>
          <span style={{ color:"#94A3B8", fontSize:12 }}>
            {query && phase==="idle" ? query : "Ask anything about your business..."}
          </span>
        </div>
        <MockBtn color="#0284C7" onClick={handleAsk} style={{ borderRadius:20, padding:"5px 14px" }}>Ask AI</MockBtn>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", background:"#F8FAFC", minHeight:460 }}>
        {/* Main report area */}
        <div style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <h3 style={{ margin:"0 0 4px", fontSize:16, fontWeight:800, color:"#0F172A" }}>Bonus Summary</h3>
              <span style={{ color:"#64748B", fontSize:12 }}>March 2024 · Distributor D001</span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <MockOutlineBtn color="#7C3AED">📊 Export</MockOutlineBtn>
              <MockBtn color="#7C3AED">✨ Explain This Report</MockBtn>
            </div>
          </div>

          {/* KPI row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label:"Total Bonus", value:"$745", change:"-12%", up:false },
              { label:"Personal CC", value:"312", change:"+2%", up:true },
              { label:"Active downlines", value:"3 / 3", change:"stable", up:null },
              { label:"Rank", value:"Silver", change:"maintained", up:null },
            ].map((kpi,i) => (
              <MockCard key={i} style={{ padding:"12px 14px" }}>
                <div style={{ color:"#94A3B8", fontSize:10.5, fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{kpi.label}</div>
                <div style={{ fontSize:20, fontWeight:800, color:"#0F172A", marginBottom:3 }}>{kpi.value}</div>
                <div style={{ fontSize:11, color: kpi.up===false?"#DC2626": kpi.up===true?"#059669":"#64748B",
                  fontWeight:600 }}>{kpi.up===false?"↓ ":kpi.up===true?"↑ ":""}{kpi.change}</div>
              </MockCard>
            ))}
          </div>

          {/* downline breakdown */}
          <MockCard style={{ padding:"14px 16px", marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#0284C7",
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Downline downline Performance</div>
            <MockBar value={198} max={300} color="#DC2626" label="downline 2 — John Doe" sub="198 CC  ↓ 30% vs Feb" />
            <MockBar value={142} max={300} color="#059669" label="downline 3 — Carlos Vega" sub="142 CC  stable" />
            <MockBar value={156} max={300} color="#0284C7" label="downline 1 — Maria Santos" sub="156 CC  ↑ 8% vs Feb" />
          </MockCard>

          {/* NL search result area */}
          {phase !== "idle" && (
            <MockCard style={{ padding:"14px 16px", border:"1px solid #7C3AED40",
              background:"#F5F3FF" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <MockBadge color="#7C3AED">✦ AI Answer</MockBadge>
                <span style={{ color:"#64748B", fontSize:11.5, fontStyle:"italic" }}>"{query}"</span>
                {phase==="result" && (
                  <span style={{ marginLeft:"auto", color:"#059669", fontSize:11, fontWeight:700 }}>
                    ✓ Confidence: 97%
                  </span>
                )}
              </div>
              {phase === "thinking" && shown === 0 ? (
                <div style={{ display:"flex", gap:5, padding:"8px 0" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:7, height:7, borderRadius:"50%",
                      background:"#7C3AED", opacity:0.4,
                      animation:"pulse 1s "+i*0.2+"s infinite alternate" }} />
                  ))}
                  <span style={{ color:"#7C3AED", fontSize:12.5, marginLeft:4 }}>Generating SQL and analysing your data...</span>
                </div>
              ) : (
                <div style={{ color:"#334155", fontSize:13.5, lineHeight:1.75 }}>
                  {RESULT_TEXT.slice(0, shown)}
                  {phase !== "result" && <span style={{ borderRight:"2px solid #7C3AED", marginLeft:1 }}>&nbsp;</span>}
                </div>
              )}
              {phase === "result" && (
                <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["Show John Doe's full activity","Compare all downlines last 3 months","What do I need for Gold rank?"].map((q,i) => (
                    <span key={i} style={{ background:"#fff", border:"1px solid #7C3AED40",
                      color:"#7C3AED", borderRadius:20, padding:"3px 12px", fontSize:11.5,
                      cursor:"pointer", fontWeight:500 }}>→ {q}</span>
                  ))}
                  <span onClick={handleReset} style={{ color:"#94A3B8", fontSize:11.5,
                    marginLeft:"auto", cursor:"pointer", alignSelf:"center" }}>✕ clear</span>
                </div>
              )}
            </MockCard>
          )}
        </div>

        {/* Right panel: NL input */}
        <div style={{ borderLeft:"1px solid #E2E8F0", padding:16, background:"#fff" }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#0284C7",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Ask About This Report</div>
          <div style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:8,
            padding:"10px 12px", marginBottom:10 }}>
            <textarea value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="e.g. Why did my bonus drop in March?"
              rows={3} style={{ width:"100%", border:"none", background:"transparent",
                resize:"none", fontSize:13, color:"#0F172A", outline:"none",
                fontFamily:"inherit", lineHeight:1.6 }} />
          </div>
          <MockBtn color="#7C3AED" onClick={handleAsk} style={{ width:"100%", textAlign:"center", padding:"8px" }}>
            Ask AI ↵
          </MockBtn>
          <div style={{ marginTop:14 }}>
            <div style={{ color:"#94A3B8", fontSize:10.5, fontWeight:700,
              textTransform:"uppercase", marginBottom:8 }}>Try these</div>
            {suggestions.map((s,i) => (
              <div key={i} onClick={() => { setQuery(s); }}
                style={{ padding:"7px 10px", marginBottom:5, background:"#F8FAFC",
                  border:"1px solid #E2E8F0", borderRadius:6, cursor:"pointer",
                  color:"#334155", fontSize:12, lineHeight:1.4,
                  transition:"border-color 0.15s" }}>
                "{s}"
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background:"#F1F5F9", borderTop:"1px solid #E2E8F0",
        padding:"8px 16px", borderRadius:"0 0 10px 10px" }}>
        <span style={{ color:"#94A3B8", fontSize:11 }}>
          💡 Tip: The AI search bar in the top nav also works anywhere in FLP360 — not just on report pages.
        </span>
      </div>
    </div>
  );
}

// ── 2. Smart Insights Dashboard Mockup ───────────────────────────
function SmartInsightsMockup() {
  const [dismissed, setDismissed] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const alerts = [
    { id:1, priority:"HIGH", type:"Volume Drop", icon:"📉", color:"#DC2626", bg:"#FEF2F2",
      title:"downline 2 volume dropped 30% this week",
      detail:"John Doe (D004) — 284 CC last week → 198 CC this week. 3 members in downline 2 had no activity in the past 7 days.",
      followUps:["Show downline 2 activity detail","When did John Doe last order?"],
      age:"2 hours ago" },
    { id:2, priority:"HIGH", type:"Rank Risk", icon:"⚠️", color:"#D97706", bg:"#FFFBEB",
      title:"You need 188 CC more to maintain Gold",
      detail:"Current CC: 312. Gold requires 500. At current trajectory you will fall to Silver next month unless volume recovers in downline 2.",
      followUps:["Show my rank trajectory","What does each downline need?"],
      age:"6 hours ago" },
    { id:3, priority:"MEDIUM", type:"Opportunity", icon:"🚀", color:"#059669", bg:"#ECFDF5",
      title:"downline 3 is 42 CC away from Silver qualification",
      detail:"Carlos Vega (D007) — downline 3 currently at 158 CC. Silver downline requirement is 200 CC. 42 CC gap — achievable this month.",
      followUps:["Show downline 3 detail","What does Carlos need?"],
      age:"8 hours ago" },
    { id:4, priority:"MEDIUM", type:"Inactivity", icon:"😴", color:"#7C3AED", bg:"#F5F3FF",
      title:"3 members inactive for 30+ days",
      detail:"Ana Lima (D012) — 35 days. Pedro Costa (D019) — 31 days. Sofia Rocha (D023) — 30 days. All in downline 2.",
      followUps:["Show inactive members detail"],
      age:"1 day ago" },
  ];

  const visible = alerts.filter(a => !dismissed.includes(a.id));

  return (
    <div>
      {/* Chrome */}
      <div style={{ background:"#1E293B", borderRadius:"10px 10px 0 0",
        padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#EF4444" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#F59E0B" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#10B981" }} />
        <span style={{ color:"#94A3B8", fontSize:11, marginLeft:8 }}>FLP360 — Dashboard</span>
      </div>

      {/* Nav */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0",
        padding:"10px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ color:"#0284C7", fontWeight:800, fontSize:13 }}>FLP360</span>
        <span style={{ color:"#CBD5E1" }}>|</span>
        {["Dashboard","Reports","Downline","Rank Progress"].map((item,i) => (
          <span key={i} style={{ color:i===0?"#0284C7":"#64748B", fontSize:12.5,
            fontWeight:i===0?700:400, cursor:"pointer" }}>{item}</span>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <MockBadge color="#DC2626">🔔 {visible.length} AI Alerts</MockBadge>
          <span style={{ color:"#64748B", fontSize:12 }}>Good morning, D001</span>
        </div>
      </div>

      <div style={{ padding:20, background:"#F8FAFC", minHeight:460 }}>
        {/* Smart Insights Banner */}
        <div style={{ background:"#1E293B", borderRadius:10, padding:"14px 18px",
          marginBottom:18, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>✦</span>
          <div>
            <div style={{ color:"#F1F5F9", fontWeight:700, fontSize:13 }}>Smart Insights — {visible.length} alerts need your attention</div>
            <div style={{ color:"#94A3B8", fontSize:12 }}>AI detected these issues overnight. Click each to investigate.</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            {["HIGH","MEDIUM"].map((p,i) => {
              const cnt = visible.filter(a=>a.priority===p).length;
              const col = p==="HIGH"?"#DC2626":"#D97706";
              return cnt > 0 ? (
                <span key={i} style={{ background:col+"20", border:"1px solid "+col+"50",
                  color:col, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
                  {cnt} {p}
                </span>
              ) : null;
            })}
          </div>
        </div>

        {/* Alert cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
          {visible.map(alert => (
            <MockCard key={alert.id} style={{ padding:0, overflow:"hidden",
              border:"1px solid "+alert.color+"40" }}>
              <div style={{ background:alert.bg, padding:"10px 14px",
                borderBottom:"1px solid "+alert.color+"30",
                display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:16 }}>{alert.icon}</span>
                  <div>
                    <span style={{ color:alert.color, fontSize:10, fontWeight:800,
                      textTransform:"uppercase", letterSpacing:"0.06em" }}>{alert.priority} · {alert.type}</span>
                    <div style={{ color:"#0F172A", fontWeight:700, fontSize:12.5, marginTop:1 }}>{alert.title}</div>
                  </div>
                </div>
                <button onClick={() => setDismissed(d=>[...d,alert.id])}
                  style={{ background:"none", border:"none", color:"#94A3B8",
                    cursor:"pointer", fontSize:14, lineHeight:1 }}>✕</button>
              </div>
              <div style={{ padding:"10px 14px" }}>
                <p style={{ color:"#334155", fontSize:12.5, margin:"0 0 10px", lineHeight:1.65 }}>{alert.detail}</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                  {alert.followUps.map((q,i) => (
                    <span key={i} onClick={() => setExpanded(alert.id===expanded?null:alert.id)}
                      style={{ background:"#F8FAFC", border:"1px solid "+alert.color+"40",
                        color:alert.color, borderRadius:20, padding:"3px 10px",
                        fontSize:11, cursor:"pointer", fontWeight:600 }}>
                      → {q}
                    </span>
                  ))}
                  <span style={{ color:"#94A3B8", fontSize:10.5, marginLeft:"auto" }}>{alert.age}</span>
                </div>
                {expanded === alert.id && (
                  <div style={{ marginTop:10, padding:"10px 12px", background:alert.color+"08",
                    border:"1px solid "+alert.color+"30", borderRadius:6 }}>
                    <MockBadge color="#7C3AED">✦ AI</MockBadge>
                    <p style={{ color:"#334155", fontSize:12.5, lineHeight:1.7, marginTop:6, marginBottom:0 }}>
                      {alert.id===1 && "downline 2 volume chart shows a clear decline from week of March 4. John Doe's last order was March 8. Two other members (Ana Lima, Pedro Costa) placed no orders in March."}
                      {alert.id===2 && "At current March pace of 312 CC, you are 188 CC short of Gold. If downline 2 recovers to 250 CC next month and you add 50 personal CC, Gold is achievable in April."}
                      {alert.id===3 && "Carlos Vega currently at 158 CC. He needs 42 more CC this month. His best month was January at 210 CC, so this is realistic. Suggest reaching out directly."}
                      {alert.id===4 && "Ana Lima, Pedro Costa, and Sofia Rocha are all in downline 2. Their combined inactivity is contributing to the volume drop. Targeted re-engagement could recover 60-80 CC."}
                    </p>
                  </div>
                )}
              </div>
            </MockCard>
          ))}
          {visible.length === 0 && (
            <div style={{ gridColumn:"span 2", padding:40, textAlign:"center", color:"#94A3B8" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
              <div style={{ fontSize:14, fontWeight:700 }}>All alerts dismissed</div>
              <div style={{ fontSize:12, marginTop:4 }}>New alerts will appear here after the next nightly scan</div>
            </div>
          )}
        </div>

        {/* Regular dashboard KPIs below */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {[
            { label:"Monthly Bonus", value:"$745", note:"↓ vs $847 Feb" },
            { label:"Personal CC", value:"312", note:"Goal: 500 for Gold" },
            { label:"Active Downline", value:"47", note:"3 inactive (flagged)" },
            { label:"downlines Qualifying", value:"1 / 3", note:"Need 2 for Gold" },
          ].map((k,i) => (
            <MockCard key={i} style={{ padding:"12px 14px" }}>
              <div style={{ color:"#94A3B8", fontSize:10, fontWeight:700,
                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{k.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:"#0F172A" }}>{k.value}</div>
              <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{k.note}</div>
            </MockCard>
          ))}
        </div>
      </div>
      <div style={{ background:"#F1F5F9", borderTop:"1px solid #E2E8F0",
        padding:"8px 16px", borderRadius:"0 0 10px 10px" }}>
        <span style={{ color:"#94A3B8", fontSize:11 }}>
          💡 Alerts are generated nightly by the AI Insights Engine. Click a follow-up to investigate in chat.
        </span>
      </div>
    </div>
  );
}

// ── 3. Explained Reports Mockup ───────────────────────────────────
function ExplainedReportsMockup() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [chars, setChars] = useState(0);

  const EXPLANATION = "Your March bonus came in at $745, a 12% decrease from February's $847. The primary driver was a significant volume reduction in downline 2 — that downline contributed just 198 Case Credits this month versus 284 in February, a 30% drop driven by 3 inactive members.\n\nYour personal CC (312) and downline 1 (156 CC, up 8%) both performed well. The issue is concentrated entirely in downline 2. This is unusual — downline 2 was your strongest downline in January at 284 CC.\n\nRecommendation: Reach out to John Doe (downline 2 sponsor). 3 of his downline members have not placed orders in 30+ days. Additionally, you are currently 188 CC short of Gold rank — if downline 2 returns to February levels, you would be within 90 CC of qualifying.";

  const handleExplain = () => {
    setPanelOpen(true);
    setStreaming(true);
    setChars(0);
    let i = 0;
    const iv = setInterval(() => {
      i += 3;
      setChars(i);
      if (i >= EXPLANATION.length) { clearInterval(iv); setStreaming(false); }
    }, 25);
  };

  return (
    <div>
      {/* Chrome */}
      <div style={{ background:"#1E293B", borderRadius:"10px 10px 0 0",
        padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#EF4444" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#F59E0B" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#10B981" }} />
        <span style={{ color:"#94A3B8", fontSize:11, marginLeft:8 }}>FLP360 — Bonus Summary · March 2024</span>
      </div>

      {/* Nav */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0",
        padding:"10px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ color:"#0284C7", fontWeight:800, fontSize:13 }}>FLP360</span>
        <span style={{ color:"#CBD5E1" }}>|</span>
        {["Dashboard","Reports","Downline","Rank Progress"].map((item,i) => (
          <span key={i} style={{ color:i===1?"#0284C7":"#64748B", fontSize:12.5,
            fontWeight:i===1?700:400, cursor:"pointer" }}>{item}</span>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns: panelOpen?"1fr 360px":"1fr",
        background:"#F8FAFC", minHeight:460, transition:"grid-template-columns 0.3s" }}>

        {/* Report content */}
        <div style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <h3 style={{ margin:"0 0 4px", fontSize:16, fontWeight:800, color:"#0F172A" }}>Bonus Summary</h3>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ color:"#64748B", fontSize:12 }}>March 2024</span>
                <span style={{ color:"#CBD5E1" }}>·</span>
                <span style={{ color:"#64748B", fontSize:12 }}>Distributor D001</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <MockOutlineBtn color="#64748B">📥 Export PDF</MockOutlineBtn>
              <MockBtn color="#7C3AED" onClick={handleExplain}>
                ✨ Explain This Report
              </MockBtn>
            </div>
          </div>

          {/* Stat row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
            {[
              { label:"Total Bonus", value:"$745.00", delta:"-$102 vs Feb", neg:true },
              { label:"Bonus Type Breakdown", value:"Leadership: $320 · Prod: $425", delta:null },
              { label:"Qualifying CC", value:"312 CC", delta:"+6 vs Feb", neg:false },
            ].map((s,i) => (
              <MockCard key={i} style={{ padding:"12px 14px" }}>
                <div style={{ color:"#94A3B8", fontSize:10.5, fontWeight:700,
                  textTransform:"uppercase", marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:14, fontWeight:800, color:"#0F172A", lineHeight:1.3 }}>{s.value}</div>
                {s.delta && <div style={{ fontSize:11, fontWeight:600, marginTop:3,
                  color:s.neg?"#DC2626":"#059669" }}>{s.neg?"↓ ":"↑ "}{s.delta}</div>}
              </MockCard>
            ))}
          </div>

          {/* Table */}
          <MockCard style={{ padding:0, overflow:"hidden", marginBottom:14 }}>
            <div style={{ padding:"10px 14px", borderBottom:"1px solid #E2E8F0",
              fontSize:11, fontWeight:800, color:"#0284C7",
              textTransform:"uppercase", letterSpacing:"0.07em" }}>downline Performance</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
              <thead>
                <tr style={{ background:"#F8FAFC" }}>
                  {["downline","Distributor","CC Units","Bonus Contrib.","vs Feb","Status"].map((h,i) => (
                    <th key={i} style={{ padding:"7px 14px", textAlign:"left",
                      borderBottom:"1px solid #E2E8F0", color:"#64748B",
                      fontWeight:700, fontSize:11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["downline 1","Maria Santos","156 CC","$298","↑ +8%","✅ Active","#059669"],
                  ["downline 2","John Doe","198 CC","$285","↓ -30%","⚠️ Flagged","#DC2626"],
                  ["downline 3","Carlos Vega","142 CC","$162","→ stable","✅ Active","#059669"],
                ].map((row,i) => (
                  <tr key={i} style={{ background: i===1?"#FEF2F2":"#fff" }}>
                    {row.slice(0,6).map((cell,j) => (
                      <td key={j} style={{ padding:"8px 14px",
                        borderBottom:"1px solid #E2E8F040",
                        color: j===4 ? row[6] : "#334155",
                        fontWeight: j===0||j===1 ? 600 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </MockCard>

          {!panelOpen && (
            <div style={{ padding:"10px 14px", background:"#F5F3FF",
              border:"1px solid #7C3AED30", borderRadius:8,
              display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>✨</span>
              <span style={{ color:"#64748B", fontSize:12.5 }}>
                Want AI to explain what happened this month and what to do next?
              </span>
              <MockBtn color="#7C3AED" onClick={handleExplain} style={{ marginLeft:"auto" }}>
                Explain →
              </MockBtn>
            </div>
          )}
        </div>

        {/* AI Explanation Panel */}
        {panelOpen && (
          <div style={{ borderLeft:"1px solid #E2E8F0", background:"#fff",
            display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #E2E8F0",
              display:"flex", alignItems:"center", gap:8 }}>
              <MockBadge color="#7C3AED">✦ AI Explanation</MockBadge>
              <span style={{ color:"#94A3B8", fontSize:11 }}>March 2024 · Confidence 96%</span>
              <button onClick={() => { setPanelOpen(false); setChars(0); setStreaming(false); }}
                style={{ marginLeft:"auto", background:"none", border:"none",
                  color:"#94A3B8", cursor:"pointer", fontSize:14 }}>✕</button>
            </div>
            <div style={{ padding:"16px", flex:1, overflowY:"auto" }}>
              {streaming && chars === 0 ? (
                <div style={{ color:"#7C3AED", fontSize:12.5 }}>
                  Analysing your report data...
                </div>
              ) : (
                <p style={{ color:"#334155", fontSize:13.5, lineHeight:1.85,
                  margin:0, whiteSpace:"pre-line" }}>
                  {EXPLANATION.slice(0, chars)}
                  {streaming && <span style={{ borderRight:"2px solid #7C3AED" }}>&nbsp;</span>}
                </p>
              )}
            </div>
            {!streaming && chars > 0 && (
              <div style={{ padding:"12px 16px", borderTop:"1px solid #E2E8F0" }}>
                <div style={{ color:"#64748B", fontSize:11, fontWeight:700,
                  textTransform:"uppercase", marginBottom:8 }}>Ask a follow-up</div>
                {["Why did John Doe's volume drop?","What do I need for Gold rank?","Compare with same month last year"].map((q,i) => (
                  <div key={i} style={{ padding:"7px 10px", marginBottom:5,
                    background:"#F8FAFC", border:"1px solid #E2E8F0",
                    borderRadius:6, cursor:"pointer", color:"#334155",
                    fontSize:12, lineHeight:1.4 }}>
                    "{q}"
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ background:"#F1F5F9", borderTop:"1px solid #E2E8F0",
        padding:"8px 16px", borderRadius:"0 0 10px 10px" }}>
        <span style={{ color:"#94A3B8", fontSize:11 }}>
          💡 The Explain panel streams in real-time. After reading, follow-up questions stay in context.
        </span>
      </div>
    </div>
  );
}

// ── 4. Conversational Assistant Mockup ───────────────────────────
function ConvAssistMockup() {
  const [chatOpen, setChatOpen] = useState(true);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [turns, setTurns] = useState([
    { role:"ai", text:"Hi! I can see you're on the Bonus Summary for March. Your bonus dropped 12% this month. Would you like me to explain what happened, or do you have a specific question?" },
    { role:"user", text:"Why did my bonus drop?" },
    { role:"ai", text:"Your March bonus fell from $847 to $745 — a 12% drop. The main cause: downline 2 lost 30% of its volume (284 → 198 CC). John Doe's group had 3 members with no orders in March. downline 1 and your personal volume were both fine." },
    { role:"user", text:"When did John Doe last order?" },
    { role:"ai", text:"John Doe last placed an order on March 8th — 23 days ago. His last 3 orders were January, February, and March 8th. That's a notable drop in cadence for him." },
  ]);

  const RESPONSES = {
    "gold": "You need 188 more CC this month for Gold (500 required, you have 312). downline 2 also needs to reach 200 CC — they're at 198, just 2 CC short! Focus there first.",
    "downline": "Your 3 downlines this month: downline 1 (Maria Santos) 156 CC ↑8%, downline 2 (John Doe) 198 CC ↓30%, downline 3 (Carlos Vega) 142 CC stable. downline 2 is the only concern.",
    "default": "Based on your March data, I can help with that. Would you like me to run a detailed query on this? Your scope is set to your distributor D001 subtree."
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setTurns(t => [...t, { role:"user", text:q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const lower = q.toLowerCase();
      const resp = lower.includes("gold") || lower.includes("rank") ? RESPONSES.gold
        : lower.includes("downline") ? RESPONSES.downline : RESPONSES.default;
      setTurns(t => [...t, { role:"ai", text:resp }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div>
      {/* Chrome */}
      <div style={{ background:"#1E293B", borderRadius:"10px 10px 0 0",
        padding:"10px 16px", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#EF4444" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#F59E0B" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#10B981" }} />
        <span style={{ color:"#94A3B8", fontSize:11, marginLeft:8 }}>FLP360 — Downline Network View</span>
      </div>

      {/* Nav */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2E8F0",
        padding:"10px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ color:"#0284C7", fontWeight:800, fontSize:13 }}>FLP360</span>
        <span style={{ color:"#CBD5E1" }}>|</span>
        {["Dashboard","Reports","Downline","Rank Progress"].map((item,i) => (
          <span key={i} style={{ color:i===2?"#0284C7":"#64748B", fontSize:12.5,
            fontWeight:i===2?700:400, cursor:"pointer" }}>{item}</span>
        ))}
        <div style={{ marginLeft:"auto" }}>
          <button onClick={() => setChatOpen(o=>!o)}
            style={{ background: chatOpen?"#7C3AED":"#F5F3FF",
              border:"1px solid #7C3AED40", borderRadius:20,
              padding:"5px 14px", cursor:"pointer", fontFamily:"inherit",
              color:chatOpen?"#fff":"#7C3AED", fontSize:12, fontWeight:700,
              display:"flex", alignItems:"center", gap:6 }}>
            💬 AI Chat {chatOpen?"▾":"▸"}
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: chatOpen?"1fr 340px":"1fr",
        background:"#F8FAFC", minHeight:480 }}>

        {/* Main report */}
        <div style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A" }}>Downline Network</h3>
            <div style={{ display:"flex", gap:8 }}>
              <MockOutlineBtn color="#DC2626">🔍 Find Weak downlines</MockOutlineBtn>
              <MockBtn color="#7C3AED" onClick={() => setChatOpen(true)}>💬 Chat with AI</MockBtn>
            </div>
          </div>

          {/* Tree visualisation */}
          <MockCard style={{ padding:"16px", marginBottom:14 }}>
            {/* Root */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
              <div style={{ padding:"8px 20px", background:"#0284C7", color:"#fff",
                borderRadius:8, fontSize:12.5, fontWeight:700, textAlign:"center" }}>
                You (D001)<br/>
                <span style={{ fontSize:10, fontWeight:400, opacity:0.85 }}>Silver · 312 CC personal</span>
              </div>
            </div>

            {/* Level 1 downlines */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { name:"Maria Santos", id:"D004", downline:"downline 1", cc:156, delta:"+8%", members:12, status:"green", active:11 },
                { name:"John Doe", id:"D007", downline:"downline 2", cc:198, delta:"-30%", members:18, status:"red", active:15, flagged:true },
                { name:"Carlos Vega", id:"D011", downline:"downline 3", cc:142, delta:"stable", members:9, status:"orange", active:9 },
              ].map((downline,i) => (
                <div key={i} style={{ border:"1px solid "+(downline.flagged?"#DC2626":"#E2E8F0"),
                  borderRadius:8, overflow:"hidden",
                  background:downline.flagged?"#FEF2F2":"#fff" }}>
                  <div style={{ padding:"8px 12px", background:downline.status==="green"?"#059669":downline.status==="red"?"#DC2626":"#D97706",
                    display:"flex", justifyContent:"space-between" }}>
                    <span style={{ color:"#fff", fontWeight:700, fontSize:11.5 }}>{downline.downline}</span>
                    {downline.flagged && <span style={{ background:"#fff", color:"#DC2626",
                      borderRadius:10, padding:"0px 7px", fontSize:10, fontWeight:800 }}>⚠ AI Alert</span>}
                  </div>
                  <div style={{ padding:"10px 12px" }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"#0F172A", marginBottom:2 }}>{downline.name}</div>
                    <div style={{ color:"#64748B", fontSize:11, marginBottom:8 }}>{downline.id}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                      <span style={{ color:"#334155", fontWeight:700 }}>{downline.cc} CC</span>
                      <span style={{ color:downline.status==="green"?"#059669":downline.status==="red"?"#DC2626":"#D97706",
                        fontWeight:700 }}>{downline.delta}</span>
                    </div>
                    <div style={{ color:"#64748B", fontSize:11, marginTop:4 }}>
                      {downline.active}/{downline.members} members active
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MockCard>

          {/* Summary bar */}
          <MockCard style={{ padding:"10px 14px", background:"#FFFBEB",
            border:"1px solid #D9770640", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16 }}>⚠️</span>
            <span style={{ color:"#92400E", fontSize:13 }}>
              <strong>downline 2 flagged by AI:</strong> Volume dropped 30% — 3 inactive members detected. Ask the AI chat for details.
            </span>
            <MockBtn color="#D97706" onClick={() => setChatOpen(true)} style={{ marginLeft:"auto", flexShrink:0 }}>
              Investigate →
            </MockBtn>
          </MockCard>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div style={{ borderLeft:"1px solid #E2E8F0", background:"#fff",
            display:"flex", flexDirection:"column", height:480 }}>
            <div style={{ padding:"12px 14px", borderBottom:"1px solid #E2E8F0",
              display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <MockBadge color="#7C3AED">✦ AI Assistant</MockBadge>
              <span style={{ color:"#94A3B8", fontSize:11 }}>Context: Downline Network · D001</span>
              <button onClick={() => setChatOpen(false)}
                style={{ marginLeft:"auto", background:"none", border:"none",
                  color:"#94A3B8", cursor:"pointer", fontSize:14 }}>✕</button>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"12px 14px",
              display:"flex", flexDirection:"column", gap:8 }}>
              {turns.map((turn,i) => (
                <div key={i} style={{ display:"flex",
                  justifyContent:turn.role==="user"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"88%",
                    background:turn.role==="user"?"#7C3AED":"#F8FAFC",
                    border:turn.role==="user"?"none":"1px solid #E2E8F0",
                    color:turn.role==="user"?"#fff":"#334155",
                    borderRadius:turn.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
                    padding:"8px 12px", fontSize:12.5, lineHeight:1.6 }}>
                    {turn.role==="ai" && (
                      <div style={{ fontSize:9.5, color:"#94A3B8", fontWeight:700,
                        marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                        FLP360 AI
                      </div>
                    )}
                    {turn.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display:"flex", gap:4, padding:"4px 0", paddingLeft:4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:7, height:7, borderRadius:"50%",
                      background:"#7C3AED", opacity:0.5 }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding:"10px 12px", borderTop:"1px solid #E2E8F0", flexShrink:0 }}>
              <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
                {["How close am I to Gold?","Show all 3 downlines","Who is inactive in downline 2?"].map((s,i) => (
                  <span key={i} onClick={() => setInput(s)}
                    style={{ background:"#F5F3FF", border:"1px solid #7C3AED30",
                      color:"#7C3AED", borderRadius:20, padding:"2px 10px",
                      fontSize:11, cursor:"pointer" }}>{s}</span>
                ))}
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <input value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter" && handleSend()}
                  placeholder="Ask about your downline..."
                  style={{ flex:1, border:"1px solid #E2E8F0", borderRadius:6,
                    padding:"7px 10px", fontSize:12.5, outline:"none",
                    fontFamily:"inherit", color:"#0F172A" }} />
                <MockBtn color="#7C3AED" onClick={handleSend}>↵</MockBtn>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ background:"#F1F5F9", borderTop:"1px solid #E2E8F0",
        padding:"8px 16px", borderRadius:"0 0 10px 10px" }}>
        <span style={{ color:"#94A3B8", fontSize:11 }}>
          💡 Chat is pre-seeded with the current page context. It knows you are looking at the Downline Network view.
        </span>
      </div>
    </div>
  );
}

// ── Main UIMockupsSection ─────────────────────────────────────────
function UIMockupsSection() {
  const [active, setActive] = useState("nlsql");
  const tabs = [
    { id:"nlsql",    label:"NL to SQL",              icon:"→" },
    { id:"insights", label:"Smart Insights",         icon:"💡" },
    { id:"explain",  label:"Explained Reports",      icon:"✨" },
    { id:"chat",     label:"Conversational Chat",    icon:"💬" },
  ];
  return (
    <div>
      <SectionHeader title="AI Features — UI Mockups" tag="UI Preview" tagColor={C.purple}
        subtitle="Interactive mockups showing how each AI capability embeds into the existing FLP360 reporting interface. Click tabs to switch features, then interact with each mockup." />

      {/* Tab row */}
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActive(tab.id)} style={{
            background:active===tab.id?C.purple:"#fff",
            border:"1px solid "+(active===tab.id?C.purple:C.border),
            borderRadius:8, padding:"9px 18px",
            color:active===tab.id?"#fff":C.muted,
            fontSize:13, cursor:"pointer", fontFamily:"inherit",
            fontWeight:active===tab.id?700:500,
            boxShadow:active===tab.id?"0 2px 8px "+C.purple+"30":"0 1px 3px rgba(0,0,0,0.05)",
            display:"flex", alignItems:"center", gap:7 }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Description cards */}
      {active==="nlsql" && (
        <div style={{ marginBottom:16, padding:"12px 16px", background:C.accentBg,
          border:"1px solid "+C.accent+"30", borderRadius:8,
          display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ color:C.accent, fontWeight:700, fontSize:13, marginBottom:4 }}>What you're seeing</div>
            <div style={{ color:C.textMd, fontSize:13, lineHeight:1.65 }}>
              The Bonus Summary report page with an AI search bar in the top nav and a right-side ask panel. Type a question or click a suggestion, then click <strong>Ask AI</strong> to see the answer stream in below the report data.
            </div>
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ color:C.accent, fontWeight:700, fontSize:13, marginBottom:4 }}>Key UI integration points</div>
            <div style={{ color:C.textMd, fontSize:13, lineHeight:1.65 }}>
              Global NL search bar in top nav · Right-side ask panel (report-specific) · AI answer streams in-page · Follow-up chips appear after answer · Confidence score shown · Clear button to reset
            </div>
          </div>
        </div>
      )}
      {active==="insights" && (
        <div style={{ marginBottom:16, padding:"12px 16px", background:C.goldBg,
          border:"1px solid "+C.gold+"30", borderRadius:8,
          display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ color:C.gold, fontWeight:700, fontSize:13, marginBottom:4 }}>What you're seeing</div>
            <div style={{ color:C.textMd, fontSize:13, lineHeight:1.65 }}>
              The FLP360 Dashboard with Smart Insights alerts surfaced at the top. Click a follow-up chip on any alert to expand an AI explanation inline. Click ✕ to dismiss individual alerts.
            </div>
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ color:C.gold, fontWeight:700, fontSize:13, marginBottom:4 }}>Key UI integration points</div>
            <div style={{ color:C.textMd, fontSize:13, lineHeight:1.65 }}>
              Alert banner with unread count badge in nav · Priority-coded alert cards on dashboard · Inline AI expansion on click · Dismiss individual alerts · Regular KPI cards unchanged below
            </div>
          </div>
        </div>
      )}
      {active==="explain" && (
        <div style={{ marginBottom:16, padding:"12px 16px", background:C.purpleBg,
          border:"1px solid "+C.purple+"30", borderRadius:8,
          display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ color:C.purple, fontWeight:700, fontSize:13, marginBottom:4 }}>What you're seeing</div>
            <div style={{ color:C.textMd, fontSize:13, lineHeight:1.65 }}>
              The Bonus Summary report with an <strong>Explain This Report</strong> button. Click it — a slide-in panel streams a narrative explanation. The report content stays visible; the panel appears alongside it.
            </div>
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ color:C.purple, fontWeight:700, fontSize:13, marginBottom:4 }}>Key UI integration points</div>
            <div style={{ color:C.textMd, fontSize:13, lineHeight:1.65 }}>
              Single button added to every report header · Slide-in panel (doesn't replace report) · Streaming text · Confidence badge · Follow-up questions at bottom of panel · Close button
            </div>
          </div>
        </div>
      )}
      {active==="chat" && (
        <div style={{ marginBottom:16, padding:"12px 16px", background:C.purpleBg,
          border:"1px solid "+C.purple+"30", borderRadius:8,
          display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ color:C.purple, fontWeight:700, fontSize:13, marginBottom:4 }}>What you're seeing</div>
            <div style={{ color:C.textMd, fontSize:13, lineHeight:1.65 }}>
              The Downline Network view with a persistent chat panel on the right. The chat is pre-seeded with context about the current page. Type a message or click a suggestion chip. The chat is already mid-conversation — scroll up to read the history.
            </div>
          </div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ color:C.purple, fontWeight:700, fontSize:13, marginBottom:4 }}>Key UI integration points</div>
            <div style={{ color:C.textMd, fontSize:13, lineHeight:1.65 }}>
              Toggle button in top nav · Right-side sliding panel · Pre-seeded with page context · Suggestion chips above input · Multi-turn history · Typing indicator · Close to dismiss
            </div>
          </div>
        </div>
      )}

      {/* The actual mockup */}
      <div style={{ borderRadius:10, overflow:"hidden",
        boxShadow:"0 4px 24px rgba(0,0,0,0.12)", border:"1px solid "+C.border }}>
        {active==="nlsql"    && <NLSQLMockup />}
        {active==="insights" && <SmartInsightsMockup />}
        {active==="explain"  && <ExplainedReportsMockup />}
        {active==="chat"     && <ConvAssistMockup />}
      </div>

      {/* Integration notes */}
      <Card style={{ marginTop:20 }}>
        <CardTitle color={C.textMd}>Implementation Notes — Minimum Code Changes to Existing Platform</CardTitle>
        <TableView headers={["Feature","What Changes in Existing Java/JSP Pages","New Code Added"]} rows={[
          { cells:["NL to SQL","Add search input to existing nav bar template (1 line JSP). Add AI answer div below report content area.","AIAnswerWidget.js (~120 lines) + /api/ai/query endpoint"] },
          { cells:["Smart Insights","Add alerts div to Dashboard JSP above existing KPI cards. Add badge to nav template.","InsightsWidget.js (~80 lines) + /api/ai/insights endpoint"] },
          { cells:["Explained Reports","Add one button to each report page header template.","ExplainPanel.js (~100 lines) + /api/ai/explain/{id} endpoint"] },
          { cells:["Conversational Chat","Add toggle button to nav template. Chat panel overlays existing content.","ChatPanel.js (~200 lines) + /api/ai/chat SSE endpoint"] },
          { hl:true, cells:["Total existing page changes","~10 lines of JSP changes across 4 templates","4 new JS widgets + 4 new Java endpoints in ai-service"] },
        ]} />
      </Card>
    </div>
  );
}


// ── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background:C.bg, color:C.text,
      fontFamily:"'Inter','Segoe UI',sans-serif",
      minHeight:"100vh", padding:"32px 40px", maxWidth:1100, margin:"0 auto" }}>
      <UIMockupsSection />
    </div>
  );
}
