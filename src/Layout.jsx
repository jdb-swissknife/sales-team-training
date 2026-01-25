import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Clipboard,
  MessageSquare,
  Award,
  Users,
  BarChart3,
  Library,
  Sun,
  LogOut,
  Menu
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
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Platform Dashboard",
    url: createPageUrl("PlatformDashboard"),
    icon: LayoutDashboard,
    roles: ["super_admin"],
    section: "platform"
  },
  {
    title: "Content Library",
    url: createPageUrl("ContentLibrary"),
    icon: Library,
    roles: ["super_admin"],
    section: "platform"
  },
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    roles: ["rep", "user", "coach", "admin"]
  },
  {
    title: "Training Modules",
    url: createPageUrl("TrainingModules"),
    icon: BookOpen,
    roles: ["rep", "user", "coach", "admin"]
  },
  {
    title: "Field Logs",
    url: createPageUrl("FieldLogs"),
    icon: Clipboard,
    roles: ["rep", "user", "coach", "admin"]
  },
  {
    title: "Practice Lab",
    url: createPageUrl("PracticeLab"),
    icon: MessageSquare,
    roles: ["rep", "user", "coach", "admin"]
  },
  {
    title: "Objection Library",
    url: createPageUrl("ObjectionLibrary"),
    icon: Library,
    roles: ["rep", "user", "coach", "admin"]
  },
  {
    title: "My Progress",
    url: createPageUrl("MyProgress"),
    icon: Award,
    roles: ["rep", "user"]
  },
  {
    title: "Coach Review",
    url: createPageUrl("CoachReview"),
    icon: Users,
    roles: ["coach", "admin"]
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
    roles: ["coach", "admin"]
  },
  {
    title: "User Management",
    url: createPageUrl("AdminUsers"),
    icon: Users,
    roles: ["admin"]
  }
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Load company if user has company_id
        if (userData.company_id) {
          const companies = await base44.entities.Company.list();
          const userCompany = companies.find(c => c.id === userData.company_id);
          setCompany(userCompany);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const userRole = user?.role || "user";
  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const platformNavItems = filteredNavItems.filter(item => item.section === "platform");
  const regularNavItems = filteredNavItems.filter(item => !item.section);

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 217 91% 30%;
          --primary-foreground: 210 40% 98%;
          --accent: 25 95% 53%;
          --accent-foreground: 210 40% 98%;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
        <Sidebar className="border-r border-slate-200/60 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">{company?.name || "SolarTraining"}</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {company?.name ? "Training Platform" : "Door-to-Door Excellence"}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            {platformNavItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-purple-600 uppercase tracking-wider px-3 py-2">
                  Platform Admin
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {platformNavItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`group hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 transition-all duration-200 rounded-xl mb-1 ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md shadow-purple-600/20' 
                              : 'text-slate-700'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                            <item.icon className={`w-5 h-5 ${
                              location.pathname === item.url 
                                ? 'text-white' 
                                : 'text-slate-500 group-hover:text-purple-600'
                            }`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {regularNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50/50 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/20' 
                            : 'text-slate-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className={`w-5 h-5 ${
                            location.pathname === item.url 
                              ? 'text-white' 
                              : 'text-slate-500 group-hover:text-blue-600'
                          }`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate capitalize">
                    {userRole}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <h1 className="text-lg font-bold text-slate-900">{company?.name || "SolarTraining"}</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}