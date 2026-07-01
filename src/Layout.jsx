import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
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
  Target,
  Trophy,
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
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    roles: ["rep", "coach", "admin"],
  },
  {
    title: "Training",
    url: createPageUrl("TrainingModules"),
    icon: BookOpen,
    roles: ["rep", "coach", "admin"],
  },
  {
    title: "Field Logs",
    url: createPageUrl("FieldLogs"),
    icon: Clipboard,
    roles: ["rep", "coach", "admin"],
  },
  {
    title: "Practice Lab",
    url: createPageUrl("PracticeLab"),
    icon: MessageSquare,
    roles: ["rep", "coach", "admin"],
  },
  {
    title: "Objection Library",
    url: createPageUrl("ObjectionLibrary"),
    icon: Library,
    roles: ["rep", "coach", "admin"],
  },
  {
    title: "My Progress",
    url: createPageUrl("MyProgress"),
    icon: Award,
    roles: ["rep"],
  },
  {
    title: "Coach Review",
    url: createPageUrl("CoachReview"),
    icon: Users,
    roles: ["coach", "admin"],
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
    roles: ["coach", "admin"],
  },
  {
    title: "User Management",
    url: createPageUrl("AdminUsers"),
    icon: Users,
    roles: ["admin"],
  },
];

function XpBar({ xp, level }) {
  const xpInLevel = xp % 100;
  const pct = xpInLevel;
  const xpToNext = 100 - xpInLevel;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Level {level}
        </span>
        <span className="text-xs text-amber-200/70">{xpToNext} XP to next</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
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
  const navItems = ALL_NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole)
  );

  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const streak = user?.streak_days || 0;

  return (
    <div
      className="flex w-full"
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      <Sidebar className="border-r border-slate-700/40">
        {/* Header with branding + XP */}
        <SidebarHeader className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg leading-tight">
                MindVault
              </h2>
              <p className="text-xs text-amber-300/80 font-medium">
                Sales Performance
              </p>
            </div>
          </div>

          {/* XP + Streak */}
          <div className="space-y-3">
            <XpBar xp={xp} level={level} />
            {streak > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-orange-400">
                  <Flame className="w-4 h-4 inline" />
                </span>
                <span className="text-orange-300 font-bold">{streak} day streak</span>
                <span className="text-slate-500 text-xs">
                  {streak >= 7 ? "On fire!" : streak >= 3 ? "Keep going!" : "Just warming up"}
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="p-3 bg-slate-900/50">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`group rounded-xl mb-1 transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/20"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 px-3 py-2.5"
                        >
                          <item.icon
                            className={`w-5 h-5 ${
                              isActive
                                ? "text-white"
                                : "text-slate-400 group-hover:text-amber-400"
                            }`}
                          />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer with user + logout */}
        <SidebarFooter className="p-4 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.full_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">
                  {user?.full_name || "Not Set"}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {userRole} {user?.team ? `· ${user.team}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 lg:hidden">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-bold text-slate-900">MindVault</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
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
          --primary: 25 95% 53%;
          --primary-foreground: 0 0% 100%;
          --accent: 217 91% 30%;
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
