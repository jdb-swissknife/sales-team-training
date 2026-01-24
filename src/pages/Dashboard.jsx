import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Clipboard,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  // Get company context
  const companyId = user?.company_id || localStorage.getItem('selected_company_id');

  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const companies = await base44.entities.Company.list();
      return companies.find(c => c.id === companyId);
    },
    enabled: !!companyId
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', user?.id],
    queryFn: () => base44.entities.Assignment.filter({ rep_id: user?.id }, '-due_date'),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: fieldLogs = [] } = useQuery({
    queryKey: ['fieldLogs', user?.id],
    queryFn: () => base44.entities.FieldLog.filter({ rep_id: user?.id }, '-date', 30),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: roleplays = [] } = useQuery({
    queryKey: ['roleplays', user?.id],
    queryFn: () => base44.entities.Roleplay.filter({ rep_id: user?.id }, '-created_date', 10),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: certification } = useQuery({
    queryKey: ['certification', user?.id],
    queryFn: async () => {
      const certs = await base44.entities.Certification.filter({ rep_id: user?.id });
      return certs[0] || null;
    },
    enabled: !!user?.id
  });

  // Calculate stats
  const pendingAssignments = assignments.filter(a => a.status !== 'Completed').length;
  const dueThisWeek = assignments.filter(a => {
    if (a.status === 'Completed') return false;
    const dueDate = new Date(a.due_date);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return dueDate <= weekFromNow;
  }).length;

  const last30DaysLogs = fieldLogs.filter(log => {
    const logDate = new Date(log.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return logDate >= thirtyDaysAgo;
  });

  const totalDoors = last30DaysLogs.reduce((sum, log) => sum + (log.doors_knocked || 0), 0);
  const totalConversations = last30DaysLogs.reduce((sum, log) => sum + (log.conversations || 0), 0);
  const totalAppointments = last30DaysLogs.reduce((sum, log) => sum + (log.appointments_set || 0), 0);
  const totalClosures = last30DaysLogs.reduce((sum, log) => sum + (log.closures || 0), 0);

  const conversionRate = totalDoors > 0 ? ((totalConversations / totalDoors) * 100).toFixed(1) : 0;
  const appointmentRate = totalConversations > 0 ? ((totalAppointments / totalConversations) * 100).toFixed(1) : 0;
  const closeRate = totalAppointments > 0 ? ((totalClosures / totalAppointments) * 100).toFixed(1) : 0;

  const pendingReviews = roleplays.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        {company && (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-sm font-medium text-blue-600 border-blue-200">
              {company.name}
            </Badge>
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Rep'}
        </h1>
        <p className="text-slate-600 text-lg">Track your progress and keep improving your skills</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={createPageUrl("FieldLogs")}>
          <Button className="w-full h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/30 text-white">
            <div className="flex items-center gap-3">
              <Clipboard className="w-6 h-6" />
              <div className="text-left">
                <div className="font-bold text-base">Log Field Activity</div>
                <div className="text-xs text-blue-100">Record today's results</div>
              </div>
            </div>
          </Button>
        </Link>
        <Link to={createPageUrl("PracticeLab")}>
          <Button className="w-full h-20 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 text-white">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <div className="text-left">
                <div className="font-bold text-base">Practice Roleplay</div>
                <div className="text-xs text-orange-100">Submit new practice</div>
              </div>
            </div>
          </Button>
        </Link>
        <Link to={createPageUrl("TrainingModules")}>
          <Button className="w-full h-20 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-600/30 text-white">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <div className="text-left">
                <div className="font-bold text-base">Continue Learning</div>
                <div className="text-xs text-purple-100">Browse modules</div>
              </div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Doors Knocked</span>
                <span className="text-xl font-bold text-slate-900">{totalDoors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Conversations</span>
                <span className="text-lg font-semibold text-blue-600">{totalConversations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Conversion Rate</span>
                <span className="text-lg font-semibold text-green-600">{conversionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Appointments & Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Appointments</span>
                <span className="text-xl font-bold text-blue-600">{totalAppointments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Closures</span>
                <span className="text-lg font-semibold text-green-600">{totalClosures}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Close Rate</span>
                <span className="text-lg font-semibold text-orange-600">{closeRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Pending Tasks</span>
                <span className="text-xl font-bold text-orange-600">{pendingAssignments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Due This Week</span>
                <span className="text-lg font-semibold text-red-600">{dueThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Roleplays</span>
                <span className="text-lg font-semibold text-purple-600">{roleplays.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Current Level</div>
                <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                  {certification?.current_level || 'Not Started'}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Field Logs</span>
                  <span className="font-semibold">{certification?.total_field_logs || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Roleplays</span>
                  <span className="font-semibold">{certification?.total_roleplays || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-bold">Pending Assignments</span>
              <Badge variant="secondary">{pendingAssignments}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {assignments.filter(a => a.status !== 'Completed').slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{assignment.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Due: {format(new Date(assignment.due_date), "MMM d, yyyy")}
                    </div>
                  </div>
                  <Badge variant={
                    assignment.priority === 'High' ? 'destructive' : 
                    assignment.priority === 'Medium' ? 'default' : 
                    'secondary'
                  }>
                    {assignment.priority}
                  </Badge>
                </div>
              ))}
              {pendingAssignments === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All caught up! Great work.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Field Activity */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-bold">Recent Field Activity</span>
              <Link to={createPageUrl("FieldLogs")}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {fieldLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-slate-900">
                      {format(new Date(log.date), "MMM d, yyyy")}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.neighborhood || 'N/A'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">Doors</div>
                      <div className="font-semibold">{log.doors_knocked}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Convos</div>
                      <div className="font-semibold text-blue-600">{log.conversations}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Appts</div>
                      <div className="font-semibold text-green-600">{log.appointments_set}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Closed</div>
                      <div className="font-semibold text-orange-600">{log.closures}</div>
                    </div>
                  </div>
                </div>
              ))}
              {fieldLogs.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Clipboard className="w-12 h-12 mx-auto mb-2" />
                  <p>No field logs yet. Get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}