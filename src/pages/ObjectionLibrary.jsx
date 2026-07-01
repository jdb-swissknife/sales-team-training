import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useState, useMemo } from "react";
import {
  MessageCircle,
  Search,
  ExternalLink,
  Lightbulb,
  Quote,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  Hash,
} from "lucide-react";

// ── Visual tokens (Linear-style dark glass) ───────────────────────────
const T = {
  bg: "rgba(255,255,255,0.025)",
  bgHover: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderSoft: "1px solid rgba(255,255,255,0.05)",
  text: "#f7f8f8",
  textMuted: "#9aa4b2",
  textDim: "#626b78",
  rust: "#c2703e",
  amber: "#fbbf24",
  emerald: "#34d399",
  fontStack:
    "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  monoStack:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

// ── Category meta ─────────────────────────────────────────────────────
// Each category gets its own accent color, used as a left-edge stripe,
// badge tint, and subtle panel glow. Keeps the multi-color card feel
// the user liked but adds proper contrast on the dark surface.
const CATEGORY_META = {
  "Sticker Shock": {
    accent: "#fb7185",
    glow: "rgba(251,113,133,0.18)",
    pillBg: "rgba(251,113,133,0.14)",
    pillBorder: "rgba(251,113,133,0.45)",
    pillText: "#fda4af",
    label: "Sticker Shock",
  },
  Financing: {
    accent: "#fbbf24",
    glow: "rgba(251,191,36,0.18)",
    pillBg: "rgba(251,191,36,0.14)",
    pillBorder: "rgba(251,191,36,0.45)",
    pillText: "#fde68a",
    label: "Financing",
  },
  "Trust & Skepticism": {
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.18)",
    pillBg: "rgba(167,139,250,0.14)",
    pillBorder: "rgba(167,139,250,0.45)",
    pillText: "#c4b5fd",
    label: "Trust & Skepticism",
  },
  Timing: {
    accent: "#22d3ee",
    glow: "rgba(34,211,238,0.18)",
    pillBg: "rgba(34,211,238,0.14)",
    pillBorder: "rgba(34,211,238,0.45)",
    pillText: "#67e8f9",
    label: "Timing",
  },
  "Decision Maker": {
    accent: "#c084fc",
    glow: "rgba(192,132,252,0.18)",
    pillBg: "rgba(192,132,252,0.14)",
    pillBorder: "rgba(192,132,252,0.45)",
    pillText: "#d8b4fe",
    label: "Decision Maker",
  },
  Competition: {
    accent: "#60a5fa",
    glow: "rgba(96,165,250,0.18)",
    pillBg: "rgba(96,165,250,0.14)",
    pillBorder: "rgba(96,165,250,0.45)",
    pillText: "#93c5fd",
    label: "Competition",
  },
  Technical: {
    accent: "#fb923c",
    glow: "rgba(251,146,60,0.18)",
    pillBg: "rgba(251,146,60,0.14)",
    pillBorder: "rgba(251,146,60,0.45)",
    pillText: "#fdba74",
    label: "Technical",
  },
  Other: {
    accent: "#9aa4b2",
    glow: "rgba(154,164,178,0.18)",
    pillBg: "rgba(154,164,178,0.10)",
    pillBorder: "rgba(154,164,178,0.40)",
    pillText: "#cbd5e1",
    label: "Other",
  },
};

const DIFFICULTY_META = {
  Easy: { color: "#34d399", label: "Easy" },
  Medium: { color: "#fbbf24", label: "Medium" },
  Hard: { color: "#fb7185", label: "Hard" },
};

const FREQ_META = {
  "Very Common": { color: "#fb7185", label: "Very Common" },
  Common: { color: "#fbbf24", label: "Common" },
  Occasional: { color: "#9aa4b2", label: "Occasional" },
  Rare: { color: "#626b78", label: "Rare" },
};

function Pill({ children, color, mono, padding = "5px 10px", gap = 6, border, bg }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        padding,
        borderRadius: 9999,
        border: border || T.borderSoft,
        background: bg || "rgba(255,255,255,0.035)",
        color: color || T.textMuted,
        fontSize: 11.5,
        fontWeight: mono ? 500 : 510,
        letterSpacing: mono ? "0.05em" : "-0.005em",
        fontFamily: mono ? T.monoStack : T.fontStack,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function DifficultyBar({ difficulty }) {
  const meta = DIFFICULTY_META[difficulty] || { color: "#9aa4b2", label: difficulty };
  const fill =
    difficulty === "Hard" ? 100 : difficulty === "Medium" ? 60 : 30;
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      title={`Difficulty: ${meta.label}`}
    >
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: 60,
          height: 4,
          borderRadius: 9999,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: `${fill}%`,
            background: meta.color,
            boxShadow: `0 0 8px ${meta.color}88`,
            borderRadius: 9999,
          }}
        />
      </span>
      <span style={{ fontSize: 11, color: meta.color, fontWeight: 510, fontFamily: T.fontStack }}>
        {meta.label}
      </span>
    </span>
  );
}

function ObjectionCard({ obj }) {
  const catMeta = CATEGORY_META[obj.category] || CATEGORY_META.Other;
  const freqMeta = FREQ_META[obj.frequency] || null;
  const displayTitle = obj.title || obj.objection_text;
  return (
    <article
      style={{
        position: "relative",
        borderRadius: 14,
        background: T.bg,
        border: T.border,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 60px rgba(0,0,0,0.22)",
        backdropFilter: "blur(14px)",
        padding: "0",
        overflow: "hidden",
        transition: "all 220ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.bgHover;
        e.currentTarget.style.border = `1px solid ${catMeta.pillBorder}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.bg;
        e.currentTarget.style.border = T.border;
      }}
    >
      {/* Left accent stripe */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${catMeta.accent} 0%, ${catMeta.accent}40 100%)`,
          boxShadow: `0 0 18px ${catMeta.glow}`,
        }}
      />

      <div style={{ padding: "22px 24px 22px 28px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Pill
              color={catMeta.pillText}
              border={`1px solid ${catMeta.pillBorder}`}
              bg={catMeta.pillBg}
              padding="5px 10px"
            >
              <Hash size={11} />
              {catMeta.label}
            </Pill>
            <Pill mono padding="5px 9px" color={T.textMuted}>
              {obj.stage}
            </Pill>
            {freqMeta && (
              <Pill
                padding="5px 10px"
                color={freqMeta.color}
                border={`1px solid ${freqMeta.color}55`}
                bg={`${freqMeta.color}15`}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: freqMeta.color,
                    boxShadow: `0 0 6px ${freqMeta.color}88`,
                  }}
                />
                {freqMeta.label}
              </Pill>
            )}
          </div>
          <DifficultyBar difficulty={obj.difficulty} />
        </div>

        {/* Title — bold homeowner quote */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 10,
              border: `1px solid ${catMeta.pillBorder}`,
              background: catMeta.pillBg,
              flexShrink: 0,
            }}
          >
            <Quote size={15} style={{ color: catMeta.accent }} />
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: T.fontStack,
              fontSize: 21,
              fontWeight: 600,
              letterSpacing: "-0.022em",
              lineHeight: 1.25,
              color: T.text,
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            "{displayTitle}"
          </h3>
        </div>

        {/* Rebuttal script */}
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${catMeta.pillBorder}`,
            background: catMeta.pillBg,
            padding: "16px 18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <MessageCircle size={13} style={{ color: catMeta.accent }} />
            <span
              style={{
                fontFamily: T.monoStack,
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: catMeta.pillText,
              }}
            >
              Rebuttal Script
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: T.fontStack,
              fontSize: 15,
              fontWeight: 400,
              lineHeight: 1.65,
              letterSpacing: "-0.005em",
              color: T.text,
            }}
          >
            {obj.rebuttal_script}
          </p>
        </div>

        {/* Example responses */}
        {obj.example_responses && obj.example_responses.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <Lightbulb size={13} style={{ color: T.amber }} />
              <span
                style={{
                  fontFamily: T.monoStack,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: T.amber,
                }}
              >
                Example Responses
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {obj.example_responses.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    borderLeft: `2px solid rgba(251,191,36,0.55)`,
                    background: "rgba(251,191,36,0.06)",
                    borderRadius: "0 8px 8px 0",
                    padding: "10px 14px",
                    fontFamily: T.fontStack,
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.55,
                    color: T.text,
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best practices */}
        {obj.best_practices && obj.best_practices.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
              }}
            >
              <Target size={13} style={{ color: T.emerald }} />
              <span
                style={{
                  fontFamily: T.monoStack,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: T.emerald,
                }}
              >
                Best Practices
              </span>
            </div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {obj.best_practices.map((p, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontFamily: T.fontStack,
                    fontSize: 13.5,
                    fontWeight: 400,
                    lineHeight: 1.55,
                    color: T.text,
                  }}
                >
                  <CheckCircle2 size={13} style={{ color: T.emerald, marginTop: 3, flexShrink: 0 }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            paddingTop: 14,
            borderTop: T.borderSoft,
          }}
        >
          {obj.tags && obj.tags.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {obj.tags.map((tag, idx) => (
                <Pill key={idx} mono padding="3px 8px" color={T.textDim} gap={0}>
                  {tag}
                </Pill>
              ))}
            </div>
          ) : (
            <span />
          )}
          {obj.related_media_url && (
            <a
              href={obj.related_media_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontFamily: T.fontStack,
                fontSize: 12,
                fontWeight: 510,
                color: T.amber,
                textDecoration: "none",
              }}
            >
              <ExternalLink size={12} /> Watch example
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ObjectionLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStage, setFilterStage] = useState("all");

  const { data: objections = [], isLoading } = useQuery({
    queryKey: ["objections"],
    queryFn: async () => {
      const allObjections = await dataStore.entities.Objection.list();
      return allObjections;
    },
    initialData: [],
  });

  const categories = useMemo(() => {
    const set = new Set(objections.map((o) => o.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [objections]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return objections.filter((obj) => {
      if (filterCategory !== "all" && obj.category !== filterCategory) return false;
      if (filterStage !== "all" && obj.stage !== filterStage) return false;
      if (!q) return true;
      const title = (obj.title || obj.objection_text || "").toLowerCase();
      const text = (obj.objection_text || "").toLowerCase();
      const rebuttal = (obj.rebuttal_script || "").toLowerCase();
      return title.includes(q) || text.includes(q) || rebuttal.includes(q);
    });
  }, [objections, searchTerm, filterCategory, filterStage]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const o of objections) counts[o.category] = (counts[o.category] || 0) + 1;
    return counts;
  }, [objections]);

  return (
    <div
      style={{
        padding: "32px 24px 64px",
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: T.fontStack,
        color: T.text,
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: 0,
            fontFamily: T.monoStack,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: T.amber,
          }}
        >
          Objection Library
        </p>
        <h1
          style={{
            margin: "8px 0 12px",
            fontFamily: T.fontStack,
            fontSize: 40,
            fontWeight: 510,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            color: T.text,
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          What the homeowner really means.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.55,
            color: T.textMuted,
            maxWidth: 680,
          }}
        >
          Every objection, retitled in the homeowner's own words. The rebuttals are
          pulled from Chance's playbook and tuned for Erica's team — say it like a
          contractor, not a salesman.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <Pill padding="8px 12px" gap={8}>
            <MessageCircle size={13} style={{ color: T.amber }} />
            <span style={{ color: T.text, fontWeight: 510 }}>{objections.length}</span>
            <span style={{ color: T.textDim, fontFamily: T.monoStack, fontSize: 11 }}>
              objections
            </span>
          </Pill>
          <Pill padding="8px 12px" gap={8}>
            <ShieldAlert size={13} style={{ color: T.rust }} />
            <span style={{ color: T.text, fontWeight: 510 }}>
              {objections.filter((o) => o.difficulty === "Hard").length}
            </span>
            <span style={{ color: T.textDim, fontFamily: T.monoStack, fontSize: 11 }}>
              hard
            </span>
          </Pill>
          <Pill padding="8px 12px" gap={8}>
            <Sparkles size={13} style={{ color: T.amber }} />
            <span style={{ color: T.text, fontWeight: 510 }}>
              {objections.filter((o) => o.frequency === "Very Common").length}
            </span>
            <span style={{ color: T.textDim, fontFamily: T.monoStack, fontSize: 11 }}>
              very common
            </span>
          </Pill>
        </div>
      </header>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: "12px 14px",
          borderRadius: 12,
          border: T.borderSoft,
          background: "rgba(255,255,255,0.018)",
          backdropFilter: "blur(8px)",
          marginBottom: 18,
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search objections or rebuttals…"
            style={{
              width: "100%",
              padding: "9px 12px 9px 32px",
              borderRadius: 8,
              border: T.border,
              background: "rgba(255,255,255,0.025)",
              color: T.text,
              fontFamily: T.fontStack,
              fontSize: 13,
              outline: "none",
            }}
          />
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: T.textDim,
            }}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "9px 12px",
            borderRadius: 8,
            border: T.border,
            background: "rgba(255,255,255,0.025)",
            color: T.text,
            fontFamily: T.fontStack,
            fontSize: 13,
            outline: "none",
            minWidth: 160,
          }}
        >
          {categories.map((c) => (
            <option key={c} value={c} style={{ background: "#0c0f14" }}>
              {c === "all" ? "All categories" : `${c} (${categoryCounts[c] || 0})`}
            </option>
          ))}
        </select>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          style={{
            padding: "9px 12px",
            borderRadius: 8,
            border: T.border,
            background: "rgba(255,255,255,0.025)",
            color: T.text,
            fontFamily: T.fontStack,
            fontSize: 13,
            outline: "none",
            minWidth: 160,
          }}
        >
          <option value="all" style={{ background: "#0c0f14" }}>
            All stages
          </option>
          {["Door Approach", "Qualifying", "Presentation", "Close", "Follow-up"].map((s) => (
            <option key={s} value={s} style={{ background: "#0c0f14" }}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Active category chips (visual filter strip) */}
      {filterCategory === "all" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {categories
            .filter((c) => c !== "all")
            .map((c) => {
              const meta = CATEGORY_META[c] || CATEGORY_META.Other;
              const active = filterCategory === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilterCategory(c)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 9999,
                    border: `1px solid ${meta.pillBorder}`,
                    background: meta.pillBg,
                    color: meta.pillText,
                    fontFamily: T.fontStack,
                    fontSize: 11.5,
                    fontWeight: 510,
                    letterSpacing: "-0.005em",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: meta.accent,
                      boxShadow: `0 0 6px ${meta.accent}88`,
                    }}
                  />
                  {meta.label}
                  <span style={{ color: T.textDim, fontFamily: T.monoStack, fontSize: 10.5 }}>
                    {categoryCounts[c] || 0}
                  </span>
                </button>
              );
            })}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: T.textDim,
            fontFamily: T.monoStack,
            fontSize: 12,
          }}
        >
          Loading objections…
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            borderRadius: 14,
            border: T.border,
            background: T.bg,
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <MessageCircle size={36} style={{ color: T.textDim, marginBottom: 12 }} />
          <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 510, color: T.text }}>
            No objections match
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: T.textMuted }}>
            Try clearing the filters or searching for a different word.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((obj) => (
            <ObjectionCard key={obj.id} obj={obj} />
          ))}
        </div>
      )}
    </div>
  );
}