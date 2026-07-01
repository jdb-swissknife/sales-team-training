import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Clock,
  Target,
  CheckCircle2,
  GraduationCap,
  Zap,
  Trophy,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

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

const STAGE_DOT = {
  Orientation: "#a78bfa",
  Prospecting: "#60a5fa",
  Qualifying: "#22d3ee",
  Presentation: "#34d399",
  Close: "#fb923c",
  "Follow-up": "#f472b6",
};

function Pill({ children, color, mono, padding = "6px 10px", gap = 6, border }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        padding,
        borderRadius: 9999,
        border: border || T.borderSoft,
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

const mdComponents = {
  h1: ({ children }) => (
    <h1
      style={{
        margin: "0 0 16px",
        fontFamily: T.fontStack,
        fontSize: 28,
        fontWeight: 510,
        letterSpacing: "-0.022em",
        lineHeight: 1.15,
        color: T.text,
        fontFeatureSettings: '"cv01", "ss03"',
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      style={{
        margin: "32px 0 12px",
        fontFamily: T.fontStack,
        fontSize: 20,
        fontWeight: 510,
        letterSpacing: "-0.018em",
        lineHeight: 1.25,
        color: T.text,
        fontFeatureSettings: '"cv01", "ss03"',
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        margin: "24px 0 10px",
        fontFamily: T.fontStack,
        fontSize: 16,
        fontWeight: 510,
        letterSpacing: "-0.012em",
        lineHeight: 1.3,
        color: T.text,
        fontFeatureSettings: '"cv01", "ss03"',
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p
      style={{
        margin: "0 0 16px",
        fontFamily: T.fontStack,
        fontSize: 15.5,
        fontWeight: 400,
        lineHeight: 1.65,
        letterSpacing: "-0.005em",
        color: T.textMuted,
      }}
    >
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul
      style={{
        margin: "0 0 18px",
        paddingLeft: 22,
        fontFamily: T.fontStack,
        fontSize: 15,
        lineHeight: 1.7,
        color: T.textMuted,
        listStyle: "disc outside",
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        margin: "0 0 18px",
        paddingLeft: 22,
        fontFamily: T.fontStack,
        fontSize: 15,
        lineHeight: 1.7,
        color: T.textMuted,
        listStyle: "decimal outside",
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: 6, paddingLeft: 4 }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: T.text, fontWeight: 600 }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: T.text, fontStyle: "italic" }}>{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "20px 0",
        padding: "12px 16px",
        borderLeft: `2px solid ${T.amber}`,
        borderRadius: "0 8px 8px 0",
        background: "rgba(251,191,36,0.06)",
        color: T.text,
        fontStyle: "italic",
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, inline }) =>
    inline ? (
      <code
        style={{
          padding: "2px 6px",
          borderRadius: 4,
          background: "rgba(255,255,255,0.07)",
          border: T.borderSoft,
          fontFamily: T.monoStack,
          fontSize: 13,
          color: "#fde68a",
        }}
      >
        {children}
      </code>
    ) : (
      <code
        style={{
          display: "block",
          padding: 14,
          borderRadius: 10,
          background: "rgba(255,255,255,0.025)",
          border: T.borderSoft,
          fontFamily: T.monoStack,
          fontSize: 13,
          color: T.text,
          overflowX: "auto",
        }}
      >
        {children}
      </code>
    ),
  hr: () => (
    <hr
      style={{
        margin: "32px 0",
        height: 1,
        border: "none",
        background: "rgba(255,255,255,0.06)",
      }}
    />
  ),
  table: ({ children }) => (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: T.fontStack,
          fontSize: 14,
          color: T.textMuted,
        }}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        textAlign: "left",
        padding: "10px 12px",
        borderBottom: T.border,
        color: T.text,
        fontWeight: 510,
        fontSize: 13,
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      style={{
        padding: "10px 12px",
        borderBottom: T.borderSoft,
        color: T.textMuted,
      }}
    >
      {children}
    </td>
  ),
};

export default function ModuleDetail() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id");
  const { user, awardXP } = useAuth();
  const [completed, setCompleted] = useState(false);

  const { data: module, isLoading } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: () => dataStore.entities.TrainingModule.getById(moduleId),
    enabled: !!moduleId,
  });

  if (isLoading) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", color: T.textDim, fontFamily: T.monoStack, fontSize: 12 }}>
        Loading module…
      </div>
    );
  }

  if (!module) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", color: T.textMuted }}>
        Module not found.
      </div>
    );
  }

  const stageColor = STAGE_DOT[module.stage] || "#9aa4b2";
  const objectives = module.learning_objectives || [];

  const handleComplete = async () => {
    const xp = 50;
    const result = await awardXP(xp, "module completion");
    setCompleted(true);
    if (result.leveledUp) {
      toast({
        title: `LEVEL UP! You're now Level ${result.newLevel}!`,
        description: `Completed "${module.title}" and earned ${xp} XP!`,
      });
    } else {
      toast({
        title: `+${xp} XP earned!`,
        description: `"${module.title}" marked as complete.`,
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "28px 24px 80px",
        fontFamily: T.fontStack,
        color: T.text,
      }}
    >
      {/* Top nav */}
      <div style={{ marginBottom: 28 }}>
        <Link
          to={createPageUrl("TrainingModules")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: 8,
            border: T.borderSoft,
            background: "rgba(255,255,255,0.025)",
            color: T.textMuted,
            fontFamily: T.fontStack,
            fontSize: 13,
            fontWeight: 510,
            textDecoration: "none",
            transition: "all 180ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
        >
          <ArrowLeft size={14} /> Back to Training
        </Link>
      </div>

      {/* Header card */}
      <header
        style={{
          position: "relative",
          padding: "28px 28px 24px",
          borderRadius: 16,
          background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
          border: T.border,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 60px rgba(0,0,0,0.22)",
          marginBottom: 24,
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, ${stageColor}, transparent 70%)`,
          }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {module.stage && (
            <Pill padding="5px 10px" gap={6}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: stageColor,
                  boxShadow: `0 0 8px ${stageColor}88`,
                }}
              />
              {module.stage}
            </Pill>
          )}
          {module.difficulty && (
            <Pill padding="5px 10px" color={T.text}>
              {module.difficulty}
            </Pill>
          )}
          {module.estimated_minutes && (
            <Pill mono padding="5px 10px" gap={6}>
              <Clock size={11} /> {module.estimated_minutes} min
            </Pill>
          )}
          {module.is_required && (
            <Pill padding="5px 10px" color={T.rust} border="1px solid rgba(194,112,62,0.4)">
              <Sparkles size={11} style={{ color: T.amber }} /> Required
            </Pill>
          )}
        </div>
        <h1
          style={{
            margin: "0 0 10px",
            fontSize: 36,
            fontWeight: 510,
            letterSpacing: "-0.028em",
            lineHeight: 1.05,
            color: T.text,
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          {module.title}
        </h1>
        {module.description && (
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.55,
              color: T.textMuted,
              letterSpacing: "-0.005em",
            }}
          >
            {module.description}
          </p>
        )}
      </header>

      {/* Learning objectives */}
      {objectives.length > 0 && (
        <section
          style={{
            padding: "20px 22px",
            borderRadius: 14,
            border: T.border,
            background: "rgba(194,112,62,0.06)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Target size={15} style={{ color: T.rust }} />
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 510,
                color: T.text,
                letterSpacing: "-0.005em",
                fontFamily: T.fontStack,
              }}
            >
              What you'll learn
            </h2>
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {objectives.map((obj, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: T.textMuted,
                }}
              >
                <CheckCircle2 size={14} style={{ color: T.emerald, flexShrink: 0, marginTop: 2 }} />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Content */}
      {module.content ? (
        <article
          style={{
            padding: "32px 32px",
            borderRadius: 14,
            border: T.border,
            background: T.bg,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 60px rgba(0,0,0,0.18)",
            backdropFilter: "blur(10px)",
          }}
        >
          <ReactMarkdown components={mdComponents}>{module.content}</ReactMarkdown>
        </article>
      ) : (
        <div
          style={{
            padding: "60px 24px",
            borderRadius: 14,
            border: T.borderSoft,
            background: T.bg,
            textAlign: "center",
            color: T.textMuted,
            fontFamily: T.monoStack,
            fontSize: 12,
          }}
        >
          Content coming soon for this module.
        </div>
      )}

      {/* Certification */}
      {module.certification_level && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 10,
            border: T.borderSoft,
            background: "rgba(255,255,255,0.02)",
            marginTop: 24,
            fontSize: 13,
            color: T.textMuted,
          }}
        >
          <GraduationCap size={15} style={{ color: "#c084fc" }} />
          <span>
            Required for{" "}
            <span style={{ color: T.text, fontWeight: 510 }}>{module.certification_level}</span>{" "}
            certification
          </span>
        </div>
      )}

      {/* Complete button */}
      <div style={{ marginTop: 32 }}>
        {completed ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "20px 22px",
              borderRadius: 14,
              border: "1px solid rgba(52,211,153,0.35)",
              background:
                "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.06))",
            }}
          >
            <Trophy size={28} style={{ color: T.emerald }} />
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 510,
                  color: T.text,
                  letterSpacing: "-0.01em",
                }}
              >
                Module complete!
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: T.textMuted }}>
                You earned 50 XP. Keep the streak going.
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              padding: "16px 24px",
              borderRadius: 12,
              border: "1px solid rgba(251,146,60,0.5)",
              background:
                "linear-gradient(135deg, #fb923c 0%, #ea580c 60%, #c2410c 100%)",
              color: "#fff",
              fontFamily: T.fontStack,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.005em",
              cursor: "pointer",
              boxShadow:
                "0 18px 50px rgba(251,146,60,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
              transition: "transform 160ms ease, box-shadow 160ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 22px 60px rgba(251,146,60,0.40), inset 0 1px 0 rgba(255,255,255,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 18px 50px rgba(251,146,60,0.30), inset 0 1px 0 rgba(255,255,255,0.18)";
            }}
          >
            <Zap size={18} />
            Mark complete & earn 50 XP
          </button>
        )}
      </div>
    </div>
  );
}