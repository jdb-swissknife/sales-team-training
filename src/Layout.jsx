import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Clipboard,
  MessageSquare,
  Award,
  Users,
  BarChart3,
  Library,
  Flame,
  LogOut,
  Menu,
  Zap,
  Trophy,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const ALL_NAV_ITEMS = [
  { title: "Command", url: createPageUrl("Dashboard"), icon: LayoutDashboard, roles: ["rep", "coach", "admin"] },
  { title: "Training", url: createPageUrl("TrainingModules"), icon: BookOpen, roles: ["rep", "coach", "admin"] },
  { title: "Field Logs", url: createPageUrl("FieldLogs"), icon: Clipboard, roles: ["rep", "coach", "admin"] },
  { title: "Practice Lab", url: createPageUrl("PracticeLab"), icon: MessageSquare, roles: ["rep", "coach", "admin"] },
  { title: "Objections", url: createPageUrl("ObjectionLibrary"), icon: Library, roles: ["rep", "coach", "admin"] },
  { title: "Progress", url: createPageUrl("MyProgress"), icon: Award, roles: ["rep"] },
  { title: "Coach Review", url: createPageUrl("CoachReview"), icon: Users, roles: ["coach", "admin"] },
  { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart3, roles: ["coach", "admin"] },
  { title: "Users", url: createPageUrl("AdminUsers"), icon: Users, roles: ["admin"] },
];

function XpBar({ xp, level }) {
  const xpInLevel = xp % 100;
  const xpToNext = 100 - xpInLevel;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 shadow-inner">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
          <Zap className="h-3.5 w-3.5" /> Level {level}
        </span>
        <span className="font-mono text-[11px] text-slate-500">{xpToNext} XP</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 shadow-[0_0_20px_rgba(251,146,60,.45)] transition-all duration-500"
          style={{ width: `${xpInLevel}%` }}
        />
      </div>
    </div>
  );
}

function LayoutContent({ children }) {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();

  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  const userRole = user?.role || "rep";
  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(userRole));
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const streak = user?.streak_days || 0;

  return (
    <div className="mv-shell mv-grid-bg flex w-full" style={{ height: "100dvh", overflow: "hidden" }}>
      <Sidebar className="border-r border-white/10 bg-[#080a0f] text-white">
        <SidebarHeader className="border-b border-white/10 bg-[#080a0f] p-4">
          <Link to={createPageUrl("Dashboard")} className="group mb-5 flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-amber-300 via-orange-500 to-rose-500 shadow-[0_16px_45px_rgba(251,146,60,.25)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.55),transparent_26%)]" />
              <Flame className="relative h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-white">MindVault</h2>
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              </div>
              <p className="text-xs font-medium text-slate-500">Coach · HVAC Sales OS</p>
            </div>
          </Link>

          <XpBar xp={xp} level={level} />

          <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Flame className="h-4 w-4 text-orange-300" /> Streak
            </span>
            <span className="font-mono text-sm font-semibold text-white">{streak}d</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-[#080a0f] p-3">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
              Workspace
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url || (location.pathname === "/" && item.url === "/dashboard");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`group rounded-xl transition-all ${
                          isActive
                            ? "border border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06)]"
                            : "text-slate-400 hover:bg-white/[0.045] hover:text-white"
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-amber-300" : "text-slate-500 group-hover:text-amber-200"}`} />
                          <span className="text-sm font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-white/10 bg-[#080a0f] p-4">
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-white">
                  {user?.full_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{user?.full_name || "Not Set"}</p>
                  <p className="truncate text-xs capitalize text-slate-500">{userRole}{user?.team ? ` · ${user.team}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/[0.035] px-3 py-1.5 text-xs text-slate-400">
                <Trophy className="h-3.5 w-3.5 text-amber-300" /> {xp} career XP
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/[0.045] hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-white/10 bg-[#080a0f]/90 px-5 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="rounded-xl border border-white/10 bg-white/[0.045] p-2 text-white transition-colors hover:bg-white/[0.08]">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold tracking-tight text-white">MindVault Coach</h1>
          </div>
        </header>

        <div className="mv-page flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        :root {
          --primary: 34 95% 55%;
          --primary-foreground: 0 0% 100%;
          --accent: 240 88% 70%;
          --accent-foreground: 0 0% 100%;
        }
        .sidebar-provider-wrapper {
          min-height: 100dvh !important;
          height: 100dvh !important;
          overflow: hidden !important;
          display: flex !important;
          width: 100% !important;
        }
      `}</style>
      <SidebarProvider className="sidebar-provider-wrapper">
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </>
  );
}
