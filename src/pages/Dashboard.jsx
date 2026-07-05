import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import {
  Target,
  Calendar,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Flame,
  Zap,
  Trophy,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Activity,
  DoorOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRouteBlitzerContext, fetchRouteBlitzerXpSummary } from "@/lib/routeBlitzerXp";
import { format } from "date-fns";

function StatTile({ icon: Icon, label, value, sub, accent = "amber" }) {
  const accentMap = {
    amber: "text-amber-300 bg-amber-300/10 border-amber-300/15",
    blue: "text-sky-300 bg-sky-300/10 border-sky-300/15",
    green: "text-emerald-300 bg-emerald-300/10 border-emerald-300/15",
    violet: "text-violet-300 bg-violet-300/10 border-violet-300/15",
    rose: "text-rose-300 bg-rose-300/10 border-rose-300/15",
  };

  return (
    <div className="mv-card rounded-3xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-600">30d</span>
      </div>
      <div className="text-4xl font-semibold tracking-[-0.06em] text-white">{value}</div>
      <div className="mt-2 text-sm font-medium text-slate-300">{label}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, desc, tone }) {
  const tones = {
    amber: "from-amber-300/22 via-orange-500/10 to-transparent text-amber-200",
    blue: "from-sky-300/18 via-indigo-500/10 to-transparent text-sky-200",
    violet: "from-violet-300/18 via-fuchsia-500/10 to-transparent text-violet-200",
    rose: "from-rose-300/18 via-orange-500/10 to-transparent text-rose-200",
  };

  return (
    <Link to={to} className="group block">
      <div className="mv-card relative h-full overflow-hidden rounded-3xl p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-white/15">
        <div className={`absolute inset-0 bg-gradient-to-br ${tones[tone]} opacity-70`} />
        <div className="relative flex h-full min-h-32 flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-white shadow-inner">
              <Icon className="h-5 w-5" />
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">{desc}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();

  const { data: roleplays = [] } = useQuery({
    queryKey: ["roleplays", user?.id],
    queryFn: () => dataStore.entities.Roleplay.filter({ rep_id: user?.id }, "-created_date", 10),
    enabled: !!user?.id,
  });

  const routeBlitzer = getRouteBlitzerContext(user);
  const { data: rbXp, isError: rbError } = useQuery({
    queryKey: ["routeBlitzerXp", routeBlitzer.apiBase, routeBlitzer.repName],
    queryFn: () => fetchRouteBlitzerXpSummary(routeBlitzer),
    enabled: !!routeBlitzer.enabled,
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (!rbXp) return;
    if (user?.xp === rbXp.xp && user?.level === rbXp.level && user?.streak_days === rbXp.streakDays) return;
    updateUser({ xp: rbXp.xp, level: rbXp.level, streak_days: rbXp.streakDays });
  }, [rbXp?.xp, rbXp?.level, rbXp?.streakDays]);

  const totalDoors = rbXp?.stats?.totalVisits ?? 0;
  const totalConversations = rbXp?.stats?.conversations ?? 0;
  const totalAppointments = rbXp?.stats?.callbacks ?? 0;
  const totalClosures = rbXp?.stats?.books ?? 0;
  const convRate = rbXp?.stats?.contactRate?.toFixed?.(1) ?? "0.0";
  const closeRate = rbXp?.stats?.bookRate?.toFixed?.(1) ?? "0.0";

  // Doors since last booking -- training metric
  const doorsSinceBooking = totalClosures > 0 ? Math.max(0, totalDoors - totalClosures) : totalDoors;

  const xp = rbXp?.xp ?? user?.xp ?? 0;
  const level = rbXp?.level ?? user?.level ?? 1;
  const xpInLevel = xp % 100;
  const streak = rbXp?.streakDays ?? user?.streak_days ?? 0;
  const firstName = user?.full_name?.split(" ")[0] || "Rep";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  const achievements = [
    { icon: Flame, label: `${streak} day streak`, unlocked: streak > 0 },
    { icon: Trophy, label: `Level ${level}`, unlocked: true },
    { icon: Target, label: `${totalClosures} booked`, unlocked: totalClosures > 0 },
    { icon: Star, label: `${roleplays.length} practices`, unlocked: roleplays.length > 0 },
  ];

  return (
    <div className="relative mx-auto max-w-7xl space-y-7 p-4 pb-12 md:p-8">
      <section className="mv-card relative overflow-hidden rounded-[2rem] p-6 md:p-8 lg:p-10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,.8)]" />
              {rbXp ? `Synced from Route Blitzer · ${rbXp.repName}` : rbError ? "Route Blitzer sync unavailable · using local Coach data" : "Team cockpit active"}
            </div>
            <div>
              <p className="mv-kicker mb-3 text-xs">{greeting}, {firstName}</p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-white md:text-6xl">
                Sharpen the edge between doors.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                Every door is a rep. Review your visits, practice the tough objections, and track the
                metrics that actually predict bookings.
              </p>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 shadow-inner">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Level Progress</p>
                <p className="text-xs text-slate-500">{rbXp ? "Real field activity from Route Blitzer" : "Gamified daily execution"}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_12px_35px_rgba(251,146,60,.25)]">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.16em] text-amber-200">Level {level}</div>
                <div className="mt-1 text-4xl font-semibold tracking-[-0.06em] text-white">{xp} XP</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-white">{100 - xpInLevel}</div>
                <div className="text-xs text-slate-500">XP to next</div>
              </div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 shadow-[0_0_24px_rgba(251,146,60,.48)]"
                style={{ width: `${xpInLevel}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Action cards -- Debrief replaces Field Logs */}
      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard to={createPageUrl("VisitDebrief")} icon={ClipboardList} title="Debrief Your Visits" desc="Review every door from today. Capture what worked, what to fix, and spot patterns." tone="rose" />
        <ActionCard to={createPageUrl("PracticeLab")} icon={MessageSquare} title="Practice Lab" desc="Run the hard objections before they happen in the neighborhood." tone="amber" />
        <ActionCard to={createPageUrl("TrainingModules")} icon={BookOpen} title="Training Modules" desc="Short lessons, proven patterns, and scripts reps can actually use." tone="violet" />
      </section>

      {/* Training-oriented stat tiles */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={DoorOpen} label="Doors knocked" value={totalDoors} sub={`${convRate}% contact rate`} accent="blue" />
        <StatTile icon={MessageSquare} label="Conversations" value={totalConversations} sub="Quality contacts that build pipeline" accent="amber" />
        <StatTile icon={Target} label="Booked" value={totalClosures} sub={`${closeRate}% booking rate`} accent="green" />
        <StatTile icon={Flame} label="Doors since booking" value={doorsSinceBooking} sub="Lower is better -- stay sharp" accent={doorsSinceBooking > 20 ? "rose" : "violet"} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        {/* Recent XP events from RB */}
        <div className="mv-card rounded-[2rem] p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Recent Activity</h2>
              <p className="mt-1 text-sm text-slate-500">
                {rbXp ? "Automatically synced from Route Blitzer." : "Connect Route Blitzer to see live field activity."}
              </p>
            </div>
            <Link to={createPageUrl("VisitDebrief")}>
              <Button variant="ghost" size="sm" className="mv-button-ghost rounded-xl">Debrief</Button>
            </Link>
          </div>

          <div className="space-y-3">
            {rbXp?.recentEvents?.length > 0 ? (
              rbXp.recentEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-colors hover:bg-white/[0.055]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white">{event.label}</div>
                      <div className="mt-1 text-xs text-slate-500">{format(new Date(event.occurredAt), "MMM d · h:mm a")}</div>
                    </div>
                    <div className="rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1.5 font-mono text-sm text-amber-200">
                      +{event.xp} XP
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-10 text-center">
                <DoorOpen className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                <p className="font-semibold text-white">No activity yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  {rbXp ? "Route Blitzer is connected, but no recent visits found." : "Log visits in Route Blitzer to populate your training dashboard."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Today's Focus */}
          <div className="mv-card rounded-[2rem] p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-3 text-amber-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">Today's Focus</h2>
                <p className="text-sm text-slate-500">One simple principle.</p>
              </div>
            </div>
            <blockquote className="text-xl leading-8 tracking-[-0.02em] text-slate-200">
              "The inspection sells. The kitchen table only confirms what the homeowner already saw."
            </blockquote>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">
              Slow down at the unit. Document visible problems. Make the issue real before talking about payment.
            </div>
          </div>

          {/* Badges */}
          <div className="mv-card rounded-[2rem] p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-white">Badges</h2>
              <Activity className="h-5 w-5 text-slate-600" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((a) => (
                <div key={a.label} className={`rounded-2xl border p-4 ${a.unlocked ? "border-white/10 bg-white/[0.045]" : "border-white/5 bg-white/[0.018] opacity-45"}`}>
                  <a.icon className="mb-3 h-5 w-5 text-amber-300" />
                  <p className="text-sm font-medium text-white">{a.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
