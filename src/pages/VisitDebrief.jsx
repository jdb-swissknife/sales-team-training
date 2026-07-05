import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { getRouteBlitzerContext, fetchRouteBlitzerVisits } from "@/lib/routeBlitzerXp";
import { createPageUrl } from "@/lib/utils";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  MapPin,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  Calendar,
  Wrench,
  DollarSign,
  Lightbulb,
  RefreshCw,
  Filter,
} from "lucide-react";

const OUTCOME_META = {
  book: {
    label: "Booked",
    icon: CheckCircle2,
    badge: "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
    dot: "bg-emerald-400",
    debrief: false,
  },
  callback: {
    label: "Callback",
    icon: Phone,
    badge: "border-sky-300/20 bg-sky-300/10 text-sky-300",
    dot: "bg-sky-400",
    debrief: false,
  },
  not_interested: {
    label: "Not Interested",
    icon: XCircle,
    badge: "border-rose-300/20 bg-rose-300/10 text-rose-300",
    dot: "bg-rose-400",
    debrief: true,
  },
  not_home: {
    label: "Not Home",
    icon: MapPin,
    badge: "border-slate-400/20 bg-slate-400/10 text-slate-400",
    dot: "bg-slate-500",
    debrief: false,
  },
};

const CONDITION_LABELS = {
  old_needs_replacement: "Old - Needs Replacement",
  aging: "Aging",
  good_recent: "Good / Recent",
};

const REFLECTION_KEY = "mv_coach_reflections";

function loadReflections() {
  try {
    return JSON.parse(localStorage.getItem(REFLECTION_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveReflection(visitId, text) {
  const all = loadReflections();
  if (text.trim()) {
    all[visitId] = text.trim();
  } else {
    delete all[visitId];
  }
  localStorage.setItem(REFLECTION_KEY, JSON.stringify(all));
}

function VisitCard({ visit, index }) {
  const [expanded, setExpanded] = useState(false);
  const [reflection, setReflection] = useState("");
  const [editingReflection, setEditingReflection] = useState(false);

  const meta = OUTCOME_META[visit.outcome] || OUTCOME_META.not_home;
  const OutcomeIcon = meta.icon;

  useEffect(() => {
    const all = loadReflections();
    setReflection(all[visit.id] || "");
  }, [visit.id]);

  const hasDetails =
    visit.hvacAge || visit.hvacBrand || visit.hvacCondition || visit.contactName || visit.notes || visit.financingStatus;
  const showNudge = meta.debrief && !reflection;

  // Auto-expand visits that need debriefing on first render of the worst ones
  const shouldDefaultOpen = index < 3 && (showNudge || hasDetails);

  const isOpen = expanded || shouldDefaultOpen;

  const handleSaveReflection = () => {
    saveReflection(visit.id, reflection);
    setEditingReflection(false);
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        showNudge
          ? "border-rose-300/15 bg-rose-950/[0.06]"
          : "border-white/10 bg-white/[0.035] hover:bg-white/[0.045]"
      }`}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.badge}`}>
          <OutcomeIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{visit.streetAddress || "Unknown address"}</span>
            {showNudge && (
              <span className="flex items-center gap-1 rounded-full border border-rose-300/20 bg-rose-300/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                <AlertCircle className="h-3 w-3" /> Needs debrief
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
            {visit.neighborhoodName && (
              <>
                <span className="text-slate-700">·</span>
                <span>{visit.neighborhoodName}</span>
              </>
            )}
            <span className="text-slate-700">·</span>
            <span>{format(new Date(visit.occurredAt), "MMM d, h:mm a")}</span>
          </div>
        </div>

        {reflection && (
          <div className="hidden items-center gap-1.5 rounded-full border border-amber-300/15 bg-amber-300/10 px-2.5 py-1 text-[11px] text-amber-300 sm:flex">
            <Lightbulb className="h-3 w-3" /> Reflected
          </div>
        )}

        {isOpen ? (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-600" />
        ) : (
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-600" />
        )}
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
          {/* Visit details grid */}
          {hasDetails && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visit.contactName && (
                <DetailChip icon={Phone} label="Contact" value={visit.contactName} />
              )}
              {visit.hvacAge && (
                <DetailChip icon={Wrench} label="HVAC Age" value={visit.hvacAge} />
              )}
              {visit.hvacBrand && (
                <DetailChip icon={Wrench} label="Brand" value={visit.hvacBrand} />
              )}
              {visit.hvacCondition && (
                <DetailChip
                  icon={Wrench}
                  label="Condition"
                  value={CONDITION_LABELS[visit.hvacCondition] || visit.hvacCondition}
                />
              )}
              {visit.hasGas !== null && visit.hasGas !== undefined && (
                <DetailChip icon={Wrench} label="Gas" value={visit.hasGas ? "Yes" : "No"} />
              )}
              {visit.financingStatus && (
                <DetailChip icon={DollarSign} label="Financing" value={visit.financingStatus} />
              )}
              {visit.nextActionDate && (
                <DetailChip
                  icon={Calendar}
                  label="Follow-up"
                  value={format(new Date(visit.nextActionDate), "MMM d")}
                />
              )}
            </div>
          )}

          {/* Notes from RB */}
          {visit.notes && (
            <div className="mb-4 rounded-xl border border-white/[0.06] bg-black/20 p-3">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-600">Visit notes</p>
              <p className="text-sm leading-6 text-slate-300">{visit.notes}</p>
            </div>
          )}

          {/* Self-reflection */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-300/70">
                Self-reflection
              </p>
              {reflection && !editingReflection && (
                <button
                  onClick={() => setEditingReflection(true)}
                  className="text-[11px] text-slate-500 transition-colors hover:text-white"
                >
                  Edit
                </button>
              )}
            </div>

            {showNudge && (
              <p className="mb-2 flex items-start gap-2 text-xs leading-5 text-rose-300/80">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                This visit didn't go as hoped. Take 30 seconds to reflect -- what could you try
                differently next time?
              </p>
            )}

            {reflection && !editingReflection ? (
              <p className="text-sm leading-6 text-slate-300">{reflection}</p>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What went well? What would you change?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-amber-300/30"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveReflection}
                    className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-300/15"
                  >
                    Save reflection
                  </button>
                  {editingReflection && (
                    <button
                      onClick={() => {
                        const all = loadReflections();
                        setReflection(all[visit.id] || "");
                        setEditingReflection(false);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-slate-500 transition-colors hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-600">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

export default function VisitDebrief() {
  const { user } = useAuth();
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [days, setDays] = useState(30);

  const routeBlitzer = getRouteBlitzerContext(user);
  const { data: rbVisits, isLoading, isError, refetch } = useQuery({
    queryKey: ["routeBlitzerVisits", routeBlitzer.apiBase, routeBlitzer.repName, days],
    queryFn: () => fetchRouteBlitzerVisits({ ...routeBlitzer, days }),
    enabled: !!routeBlitzer.enabled,
    staleTime: 60_000,
    retry: 1,
  });

  const visits = rbVisits?.visits || [];

  const filtered = useMemo(() => {
    if (outcomeFilter === "all") return visits;
    if (outcomeFilter === "needs_debrief") {
      const reflections = loadReflections();
      return visits.filter((v) => {
        const meta = OUTCOME_META[v.outcome];
        return meta?.debrief && !reflections[v.id];
      });
    }
    return visits.filter((v) => v.outcome === outcomeFilter);
  }, [visits, outcomeFilter]);

  const stats = useMemo(() => {
    const reflections = loadReflections();
    const needsDebrief = visits.filter((v) => OUTCOME_META[v.outcome]?.debrief).length;
    const reflected = visits.filter((v) => reflections[v.id]).length;
    return { total: visits.length, needsDebrief, reflected };
  }, [visits]);

  return (
    <div className="relative mx-auto max-w-5xl space-y-6 p-4 pb-12 md:p-8">
      {/* Header */}
      <section className="mv-card relative overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-rose-400/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm text-slate-300">
            <ClipboardList className="h-3.5 w-3.5 text-amber-300" />
            Visit Debrief
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-4xl">
            Learn from every door.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-400">
            Your visits from Route Blitzer, pulled in automatically. Review what happened, capture what
            you'd do differently, and turn every knock into a lesson.
          </p>

          {/* Mini stats */}
          {visits.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
                <div className="text-2xl font-semibold text-white">{stats.total}</div>
                <div className="text-[11px] uppercase tracking-wider text-slate-600">Visits ({days}d)</div>
              </div>
              {stats.needsDebrief > 0 && (
                <div className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.06] px-4 py-2.5">
                  <div className="text-2xl font-semibold text-rose-300">{stats.needsDebrief}</div>
                  <div className="text-[11px] uppercase tracking-wider text-rose-400/60">Need debrief</div>
                </div>
              )}
              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-2.5">
                <div className="text-2xl font-semibold text-amber-300">{stats.reflected}</div>
                <div className="text-[11px] uppercase tracking-wider text-amber-400/60">Reflected</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-600" />
        {[
          { key: "all", label: "All" },
          { key: "needs_debrief", label: "Needs debrief" },
          { key: "not_interested", label: "Not interested" },
          { key: "book", label: "Booked" },
          { key: "callback", label: "Callback" },
          { key: "not_home", label: "Not home" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setOutcomeFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              outcomeFilter === f.key
                ? "border-white/15 bg-white/[0.08] text-white"
                : "border-white/[0.06] text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                days === d
                  ? "border-amber-300/20 bg-amber-300/10 text-amber-300"
                  : "border-white/[0.06] text-slate-500 hover:text-slate-300"
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-full border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Visit list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-600" />
        </div>
      ) : isError ? (
        <div className="mv-card rounded-3xl p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-400" />
          <p className="font-semibold text-white">Couldn't load visits</p>
          <p className="mt-1 text-sm text-slate-500">
            Make sure Route Blitzer is running and your rep name is set.
          </p>
          <p className="mt-2 font-mono text-xs text-slate-700">
            repName: {routeBlitzer.repName || "(not set)"}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mv-card rounded-3xl p-10 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          <p className="font-semibold text-white">
            {visits.length === 0 ? "No visits yet" : "No visits match this filter"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {visits.length === 0
              ? "Visits logged in Route Blitzer will appear here for debriefing."
              : "Try a different filter or time range."}
          </p>
          {visits.length === 0 && (
            <Link
              to={createPageUrl("Dashboard")}
              className="mt-4 inline-block rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.08]"
            >
              Back to Command
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((visit, i) => (
            <VisitCard key={visit.id} visit={visit} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
