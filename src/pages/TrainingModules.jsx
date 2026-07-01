import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Clock,
  Target,
  PlayCircle,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

// ── Visual tokens ─────────────────────────────────────────────────────
// Pulled from the Linear.app design language and tuned for the
// MindVault dark shell. Everything is translucent white over the
// near-black background — no solid color fills.
const T = {
  bg: "rgba(255,255,255,0.025)",
  bgHover: "rgba(255,255,255,0.045)",
  bgActive: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderSoft: "1px solid rgba(255,255,255,0.05)",
  borderHover: "1px solid rgba(255,255,255,0.14)",
  text: "#f7f8f8",
  textMuted: "#9aa4b2",
  textDim: "#626b78",
  rust: "#c2703e",
  rustSoft: "rgba(194,112,62,0.16)",
  rustBorder: "rgba(194,112,62,0.42)",
  amber: "#fbbf24",
  fontStack:
    "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  monoStack:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

const STAGE_META = {
  Orientation: { dot: "#a78bfa", label: "Orientation" },
  Prospecting: { dot: "#60a5fa", label: "Prospecting" },
  Qualifying: { dot: "#22d3ee", label: "Qualifying" },
  Presentation: { dot: "#34d399", label: "Presentation" },
  Close: { dot: "#fb923c", label: "Close" },
  "Follow-up": { dot: "#f472b6", label: "Follow-up" },
};

const DIFFICULTY_META = {
  Intro: { color: "#34d399", label: "Intro" },
  Intermediate: { color: "#fde68a", label: "Intermediate" },
  Master: { color: "#fca5a5", label: "Master" },
};

function Pill({ children, color, mono, padding = "6px 10px", gap = 6 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        padding,
        borderRadius: 9999,
        border: T.borderSoft,
        background: "rgba(255,255,255,0.035)",
        color: color || T.textMuted,
        fontSize: 12,
        fontWeight: mono ? 500 : 510,
        letterSpacing: mono ? "0.04em" : "-0.005em",
        fontFamily: mono ? T.monoStack : T.fontStack,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function ModuleCard({ module, onOpen }) {
  const stage = STAGE_META[module.stage] || { dot: "#9aa4b2", label: module.stage };
  const diff = DIFFICULTY_META[module.difficulty] || { color: "#9aa4b2", label: module.difficulty };
  const objectives = module.learning_objectives || [];
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
        padding: "20px 22px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflow: "hidden",
        transition: "all 220ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = T.bgHover;
        e.currentTarget.style.border = T.borderHover;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = T.bg;
        e.currentTarget.style.border = T.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top accent stripe using a dark gradient + thin colored line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${stage.dot}88, transparent 70%)`,
        }}
      />

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Pill color={stage.label !== module.stage ? T.textMuted : T.textMuted} padding="5px 9px" gap={6}>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: stage.dot,
                boxShadow: `0 0 8px ${stage.dot}88`,
              }}
            />
            {stage.label}
          </Pill>
          {module.is_required && (
            <Pill color={T.rust} padding="5px 9px">
              <Sparkles size={11} style={{ color: T.amber }} />
              Required
            </Pill>
          )}
        </div>
        <Pill mono padding="4px 8px" color={T.textDim}>
          <Clock size={11} /> {module.estimated_minutes || 0}m
        </Pill>
      </header>

      <h3
        style={{
          margin: 0,
          fontFamily: T.fontStack,
          fontSize: 19,
          fontWeight: 510,
          letterSpacing: "-0.018em",
          lineHeight: 1.25,
          color: T.text,
          fontFeatureSettings: '"cv01", "ss03"',
        }}
      >
        {module.title}
      </h3>

      {module.description && (
        <p
          style={{
            margin: 0,
            fontFamily: T.fontStack,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.55,
            color: T.textMuted,
            letterSpacing: "-0.005em",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {module.description}
        </p>
      )}

      {objectives.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            marginTop: "auto",
          }}
        >
          <Pill mono padding="3px 7px" color={T.textDim} gap={4}>
            <Target size={10} /> OBJECTIVES
          </Pill>
          {objectives.slice(0, 2).map((obj, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: T.textMuted,
                lineHeight: 1.4,
              }}
            >
              <CheckCircle2 size={11} style={{ color: "#34d399", flexShrink: 0 }} />
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 220,
                }}
              >
                {obj}
              </span>
            </span>
          ))}
          {objectives.length > 2 && (
            <span style={{ fontSize: 11, color: T.textDim, fontFamily: T.monoStack }}>
              +{objectives.length - 2} more
            </span>
          )}
        </div>
      )}

      <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pill color={diff.color} padding="4px 8px">
            {diff.label}
          </Pill>
          {module.certification_level && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: T.textDim }}>
              <GraduationCap size={12} />
              {module.certification_level}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpen(module)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid rgba(194,112,62,0.5)",
            background:
              "linear-gradient(135deg, rgba(194,112,62,0.18), rgba(251,146,60,0.10))",
            color: T.text,
            fontFamily: T.fontStack,
            fontSize: 13,
            fontWeight: 510,
            letterSpacing: "-0.005em",
            cursor: "pointer",
            transition: "all 180ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, rgba(194,112,62,0.30), rgba(251,146,60,0.18))";
            e.currentTarget.style.border = "1px solid rgba(194,112,62,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, rgba(194,112,62,0.18), rgba(251,146,60,0.10))";
            e.currentTarget.style.border = "1px solid rgba(194,112,62,0.5)";
          }}
        >
          <PlayCircle size={14} /> Start module <ArrowUpRight size={12} />
        </button>
      </footer>
    </article>
  );
}

export default function TrainingModules() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [query, setQuery] = useState("");

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["trainingModules"],
    queryFn: async () => {
      const allModules = await dataStore.entities.TrainingModule.list("order");
      return allModules;
    },
    initialData: [],
  });

  const categories = useMemo(() => {
    const set = new Set(modules.map((m) => m.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [modules]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter((m) => {
      if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        (m.title || "").toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        (m.stage || "").toLowerCase().includes(q)
      );
    });
  }, [modules, selectedCategory, query]);

  const handleOpen = (module) => {
    navigate(createPageUrl("ModuleDetail") + `?id=${module.id}`);
  };

  const requiredCount = modules.filter((m) => m.is_required).length;
  const totalMinutes = modules.reduce((acc, m) => acc + (m.estimated_minutes || 0), 0);

  return (
    <div
      style={{
        padding: "32px 24px 64px",
        maxWidth: 1280,
        margin: "0 auto",
        fontFamily: T.fontStack,
        color: T.text,
      }}
    >
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
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
          Training Library
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
          Master HVAC sales, one module at a time.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.55,
            color: T.textMuted,
            maxWidth: 640,
          }}
        >
          Short, field-tested lessons written for{" "}
          <span style={{ color: T.text, fontWeight: 510 }}>Erica's HVAC D2D team</span>.
          Earn XP, level up, and build the muscle memory that closes deals at the door.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <Pill padding="8px 12px" gap={8}>
            <BookOpen size={13} style={{ color: T.amber }} />
            <span style={{ color: T.text, fontWeight: 510 }}>{modules.length}</span>
            <span style={{ color: T.textDim, fontFamily: T.monoStack, fontSize: 11 }}>modules</span>
          </Pill>
          <Pill padding="8px 12px" gap={8}>
            <Sparkles size={13} style={{ color: T.rust }} />
            <span style={{ color: T.text, fontWeight: 510 }}>{requiredCount}</span>
            <span style={{ color: T.textDim, fontFamily: T.monoStack, fontSize: 11 }}>required</span>
          </Pill>
          <Pill padding="8px 12px" gap={8}>
            <Clock size={13} style={{ color: "#9aa4b2" }} />
            <span style={{ color: T.text, fontWeight: 510 }}>{totalMinutes}</span>
            <span style={{ color: T.textDim, fontFamily: T.monoStack, fontSize: 11 }}>min total</span>
          </Pill>
        </div>
      </header>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
          padding: "12px 14px",
          borderRadius: 12,
          border: T.borderSoft,
          background: "rgba(255,255,255,0.018)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", flex: "1 1 auto" }}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 9999,
                  border: active ? "1px solid rgba(251,191,36,0.45)" : "1px solid rgba(255,255,255,0.07)",
                  background: active
                    ? "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,146,60,0.10))"
                    : "rgba(255,255,255,0.025)",
                  color: active ? T.text : T.textMuted,
                  fontFamily: T.fontStack,
                  fontSize: 12,
                  fontWeight: 510,
                  letterSpacing: "-0.005em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 180ms ease",
                }}
              >
                {cat === "all" ? "All Modules" : cat}
              </button>
            );
          })}
        </div>
        <div style={{ position: "relative", flex: "0 0 240px", maxWidth: "100%" }}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules…"
            style={{
              width: "100%",
              padding: "8px 12px 8px 30px",
              borderRadius: 8,
              border: T.border,
              background: "rgba(255,255,255,0.025)",
              color: T.text,
              fontFamily: T.fontStack,
              fontSize: 13,
              outline: "none",
              transition: "border 180ms ease",
            }}
          />
          <svg
            viewBox="0 0 16 16"
            fill="none"
            width={14}
            height={14}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textDim }}
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="m13 13-2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: T.textDim, fontFamily: T.monoStack, fontSize: 12 }}>
          Loading modules…
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
          <BookOpen size={36} style={{ color: T.textDim, marginBottom: 12 }} />
          <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 510, color: T.text }}>
            No modules match
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: T.textMuted }}>
            {selectedCategory === "all"
              ? "No training modules yet. Add some in Content Library."
              : `No ${selectedCategory} modules match "${query}".`}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          {filtered.map((module) => (
            <ModuleCard key={module.id} module={module} onOpen={handleOpen} />
          ))}
        </div>
      )}
    </div>
  );
}