import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { useState } from "react";
import {
  Target,
  Calendar,
  CheckCircle2,
  BookOpen,
  Clipboard,
  MessageSquare,
  Flame,
  Zap,
  Trophy,
  TrendingUp,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, awardXP } = useAuth();

  const { data: fieldLogs = [] } = useQuery({
    queryKey: ["fieldLogs", user?.id],
    queryFn: () => dataStore.entities.FieldLog.filter({ rep_id: user?.id }, "-date", 30),
    enabled: !!user?.id,
  });

  const { data: roleplays = [] } = useQuery({
    queryKey: ["roleplays", user?.id],
    queryFn: () => dataStore.entities.Roleplay.filter({ rep_id: user?.id }, "-created_date", 10),
    enabled: !!user?.id,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["trainingModules"],
    queryFn: () => dataStore.entities.TrainingModule.list("order"),
    enabled: !!user?.id,
  });

  // Calculate stats
  const last30Days = fieldLogs.filter((log) => {
    const d = new Date(log.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  });

  const totalDoors = last30Days.reduce((s, l) => s + (l.doors_knocked || 0), 0);
  const totalConversations = last30Days.reduce((s, l) => s + (l.conversations || 0), 0);
  const totalAppointments = last30Days.reduce((s, l) => s + (l.appointments_set || 0), 0);
  const totalClosures = last30Days.reduce((s, l) => s + (l.closures || 0), 0);

  const convRate = totalDoors > 0 ? ((totalConversations / totalDoors) * 100).toFixed(1) : 0;
  const closeRate = totalAppointments > 0 ? ((totalClosures / totalAppointments) * 100).toFixed(1) : 0;

  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpInLevel = xp % 100;
  const streak = user?.streak_days || 0;

  // Achievements
  const achievements = [
    { icon: Flame, label: `${streak} Day Streak`, color: "text-orange-500", unlocked: streak > 0 },
    { icon: Trophy, label: `Level ${level}`, color: "text-amber-500", unlocked: true },
    { icon: Target, label: `${totalClosures} Closures`, color: "text-green-500", unlocked: totalClosures > 0 },
    { icon: Star, label: `${roleplays.length} Practice Runs`, color: "text-purple-500", unlocked: roleplays.length > 0 },
    { icon: BookOpen, label: `${modules.length} Modules`, color: "text-blue-500", unlocked: modules.length > 0 },
  ];

  const firstName = user?.full_name?.split(" ")[0] || "Rep";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              {greeting}, {firstName}! 
            </h1>
            <p className="text-slate-600 text-lg mt-1">
              {streak > 0
                ? `You're on a ${streak}-day streak. Keep the fire burning! `
                : "Ready to knock some doors and level up?"}
            </p>
          </div>
          {/* XP badge */}
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-amber-300 font-bold">LEVEL {level}</div>
              <div className="text-white font-bold text-lg">{xp} XP</div>
              <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  style={{ width: `${xpInLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={createPageUrl("FieldLogs")}>
          <Button className="w-full h-24 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 text-white rounded-2xl">
            <div className="flex items-center gap-3">
              <Clipboard className="w-7 h-7" />
              <div className="text-left">
                <div className="font-bold text-base">Log Field Activity</div>
                <div className="text-xs text-blue-100">Record today's doors + earn XP</div>
              </div>
            </div>
          </Button>
        </Link>
        <Link to={createPageUrl("PracticeLab")}>
          <Button className="w-full h-24 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 text-white rounded-2xl">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-7 h-7" />
              <div className="text-left">
                <div className="font-bold text-base">Practice Lab</div>
                <div className="text-xs text-orange-100">Sharpen your pitch</div>
              </div>
            </div>
          </Button>
        </Link>
        <Link to={createPageUrl("TrainingModules")}>
          <Button className="w-full h-24 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-600/20 text-white rounded-2xl">
            <div className="flex items-center gap-3">
              <BookOpen className="w-7 h-7" />
              <div className="text-left">
                <div className="font-bold text-base">Training Modules</div>
                <div className="text-xs text-purple-100">Learn the system</div>
              </div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Activity */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Target className="w-4 h-4" /> Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Doors Knocked</span>
                <span className="text-2xl font-bold text-slate-900">{totalDoors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Conversations</span>
                <span className="text-lg font-semibold text-blue-600">{totalConversations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Conv. Rate</span>
                <span className="text-lg font-semibold text-green-600">{convRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Appointments</span>
                <span className="text-2xl font-bold text-blue-600">{totalAppointments}</span>
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

        {/* Achievements */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {achievements.map((a, i) => (
                <div
                  key={i}
                  className={`text-center transition-all ${
                    a.unlocked ? "opacity-100" : "opacity-30 grayscale"
                  }`}
                  title={a.label}
                >
                  <a.icon className={`w-6 h-6 mx-auto ${a.color}`} />
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {achievements.filter((a) => a.unlocked).length} of {achievements.length} unlocked
            </p>
          </CardContent>
        </Card>

        {/* Training */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Available</span>
                <span className="text-2xl font-bold text-purple-600">{modules.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Practice Runs</span>
                <span className="text-lg font-semibold text-orange-600">{roleplays.length}</span>
              </div>
              <Link to={createPageUrl("TrainingModules")}>
                <Button variant="ghost" size="sm" className="w-full mt-1 text-purple-600">
                  Browse Modules
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-bold flex items-center gap-2">
                <Clipboard className="w-5 h-5 text-blue-500" />
                Recent Field Logs
              </span>
              <Link to={createPageUrl("FieldLogs")}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {fieldLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <div className="font-medium text-slate-900">
                      {format(new Date(log.date), "MMM d")}
                    </div>
                    <div className="text-xs text-slate-500">{log.neighborhood || "N/A"}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-slate-900">{log.doors_knocked}</div>
                      <div className="text-slate-400">doors</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{log.closures || 0}</div>
                      <div className="text-slate-400">closed</div>
                    </div>
                  </div>
                </div>
              ))}
              {fieldLogs.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Clipboard className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No logs yet. Time to hit the doors!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Daily Motivation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <blockquote className="text-lg text-slate-700 italic leading-relaxed">
                "You're not selling HVAC equipment. You're selling peace of mind, lower bills, and control. Every door you knock is a family you could help."
              </blockquote>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-700">Pro Tip of the Day</span>
                </div>
                <p className="text-sm text-slate-700">
                  The inspection sells, not the kitchen table. Take your time at the unit.
                  Show the homeowner every rust spot, every water stain. By the time you sit
                  down, the decision is already half-made.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {totalDoors > 0
                    ? `You've knocked ${totalDoors} doors in the last 30 days. That's ${Math.round(totalDoors / 30)} per day. `
                    : "Start logging your field activity to track your progress!"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
