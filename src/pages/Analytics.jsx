import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Analytics() {
  const [isExporting, setIsExporting] = useState(false);

  const { data: allFieldLogs = [] } = useQuery({
    queryKey: ['allFieldLogs'],
    queryFn: () => dataStore.entities.FieldLog.list('-date'),
    initialData: []
  });

  const { data: allRoleplays = [] } = useQuery({
    queryKey: ['allRoleplays'],
    queryFn: () => dataStore.entities.Roleplay.list('-created_date'),
    initialData: []
  });

  const { data: allCertifications = [] } = useQuery({
    queryKey: ['allCertifications'],
    queryFn: () => dataStore.entities.Certification.list(),
    initialData: []
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => dataStore.entities.User.list(),
    initialData: []
  });

  // Aggregate Stats
  const totalReps = allUsers.filter(u => u.role === 'rep' || u.role === 'user').length;
  const totalDoors = allFieldLogs.reduce((sum, log) => sum + (log.doors_knocked || 0), 0);
  const totalConversations = allFieldLogs.reduce((sum, log) => sum + (log.conversations || 0), 0);
  const totalAppointments = allFieldLogs.reduce((sum, log) => sum + (log.appointments_set || 0), 0);
  const totalClosures = allFieldLogs.reduce((sum, log) => sum + (log.closures || 0), 0);

  const overallConversionRate = totalDoors > 0 ? ((totalConversations / totalDoors) * 100).toFixed(1) : 0;
  const overallCloseRate = totalAppointments > 0 ? ((totalClosures / totalAppointments) * 100).toFixed(1) : 0;

  // Performance by Rep
  const repPerformance = {};
  allFieldLogs.forEach(log => {
    if (!repPerformance[log.rep_name]) {
      repPerformance[log.rep_name] = {
        doors: 0,
        conversations: 0,
        appointments: 0,
        closures: 0,
        logs: 0
      };
    }
    repPerformance[log.rep_name].doors += log.doors_knocked || 0;
    repPerformance[log.rep_name].conversations += log.conversations || 0;
    repPerformance[log.rep_name].appointments += log.appointments_set || 0;
    repPerformance[log.rep_name].closures += log.closures || 0;
    repPerformance[log.rep_name].logs += 1;
  });

  const topPerformers = Object.entries(repPerformance)
    .map(([name, stats]) => ({
      name,
      ...stats,
      conversionRate: stats.doors > 0 ? ((stats.conversations / stats.doors) * 100).toFixed(1) : 0,
      closeRate: stats.appointments > 0 ? ((stats.closures / stats.appointments) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.closures - a.closures)
    .slice(0, 10);

  // Certification Progress
  const certificationData = [
    { 
      level: "Level 1", 
      count: allCertifications.filter(c => c.level_1_completed).length 
    },
    { 
      level: "Level 2", 
      count: allCertifications.filter(c => c.level_2_completed).length 
    },
    { 
      level: "Level 3", 
      count: allCertifications.filter(c => c.level_3_completed).length 
    },
    { 
      level: "Level 4", 
      count: allCertifications.filter(c => c.level_4_completed).length 
    }
  ];

  // Roleplay Status Distribution
  const roleplayStatusData = [
    { name: "Approved", value: allRoleplays.filter(r => r.status === 'Approved').length, color: "#10b981" },
    { name: "Pending", value: allRoleplays.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length, color: "#f59e0b" },
    { name: "Needs Work", value: allRoleplays.filter(r => r.status === 'Needs Improvement').length, color: "#ef4444" }
  ];

  // Daily Activity Trend (last 30 days)
  const last30Days = [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyActivity = last30Days.map(date => {
    const logsForDay = allFieldLogs.filter(log => log.date === date);
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      doors: logsForDay.reduce((sum, log) => sum + (log.doors_knocked || 0), 0),
      appointments: logsForDay.reduce((sum, log) => sum + (log.appointments_set || 0), 0),
      closures: logsForDay.reduce((sum, log) => sum + (log.closures || 0), 0)
    };
  });

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const csvData = topPerformers.map(rep => ({
        Rep: rep.name,
        'Total Doors': rep.doors,
        'Conversations': rep.conversations,
        'Appointments': rep.appointments,
        'Closures': rep.closures,
        'Conversion Rate': rep.conversionRate + '%',
        'Close Rate': rep.closeRate + '%',
        'Field Logs': rep.logs
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
    setIsExporting(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Team performance and training insights</p>
        </div>
        <Button 
          onClick={exportToCSV}
          disabled={isExporting}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalReps}</div>
            <div className="text-xs text-slate-600">Active Reps</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{totalDoors}</div>
            <div className="text-xs text-slate-600">Total Doors Knocked</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{totalAppointments}</div>
            <div className="text-xs text-slate-600">Total Appointments</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{totalClosures}</div>
            <div className="text-xs text-slate-600">Total Closures</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Rates */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Overall Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Door to Conversation</span>
                <span className="font-semibold text-green-600">{overallConversionRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${overallConversionRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">Appointment to Close</span>
                <span className="font-semibold text-blue-600">{overallCloseRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${overallCloseRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Roleplay Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={roleplayStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleplayStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trend */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>30-Day Activity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="doors" stroke="#3b82f6" name="Doors Knocked" />
              <Line type="monotone" dataKey="appointments" stroke="#10b981" name="Appointments" />
              <Line type="monotone" dataKey="closures" stroke="#f59e0b" name="Closures" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Top Performers (by Closures)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topPerformers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="doors" fill="#3b82f6" name="Doors" />
              <Bar dataKey="appointments" fill="#10b981" name="Appointments" />
              <Bar dataKey="closures" fill="#f59e0b" name="Closures" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Certification Progress */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Certification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={certificationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="level" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="Reps Certified" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Rep Stats Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Detailed Rep Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-semibold">Rep</th>
                  <th className="text-right p-3 font-semibold">Doors</th>
                  <th className="text-right p-3 font-semibold">Convos</th>
                  <th className="text-right p-3 font-semibold">Appts</th>
                  <th className="text-right p-3 font-semibold">Closed</th>
                  <th className="text-right p-3 font-semibold">Conv%</th>
                  <th className="text-right p-3 font-semibold">Close%</th>
                  <th className="text-right p-3 font-semibold">Logs</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((rep, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-medium">{rep.name}</td>
                    <td className="p-3 text-right">{rep.doors}</td>
                    <td className="p-3 text-right text-blue-600">{rep.conversations}</td>
                    <td className="p-3 text-right text-green-600">{rep.appointments}</td>
                    <td className="p-3 text-right text-orange-600 font-semibold">{rep.closures}</td>
                    <td className="p-3 text-right">
                      <Badge variant="outline">{rep.conversionRate}%</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Badge variant="outline">{rep.closeRate}%</Badge>
                    </td>
                    <td className="p-3 text-right text-slate-600">{rep.logs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
