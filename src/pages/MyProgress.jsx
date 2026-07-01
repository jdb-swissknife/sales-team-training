import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, CheckCircle2, Clock, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export default function MyProgress() {
  const { user } = useAuth();

  const { data: certification } = useQuery({
    queryKey: ['certification', user?.id],
    queryFn: async () => {
      const certs = await dataStore.entities.Certification.filter({ rep_id: user?.id });
      return certs[0] || null;
    },
    enabled: !!user?.id
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments', user?.id],
    queryFn: () => dataStore.entities.Assignment.filter({ rep_id: user?.id }),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: fieldLogs = [] } = useQuery({
    queryKey: ['fieldLogs', user?.id],
    queryFn: () => dataStore.entities.FieldLog.filter({ rep_id: user?.id }, '-date'),
    enabled: !!user?.id,
    initialData: []
  });

  const { data: roleplays = [] } = useQuery({
    queryKey: ['roleplays', user?.id],
    queryFn: () => dataStore.entities.Roleplay.filter({ rep_id: user?.id }),
    enabled: !!user?.id,
    initialData: []
  });

  const completedAssignments = assignments.filter(a => a.status === 'Completed').length;
  const assignmentCompletionRate = assignments.length > 0 
    ? (completedAssignments / assignments.length) * 100 
    : 0;

  const approvedRoleplays = roleplays.filter(r => r.status === 'Approved').length;
  const roleplaySuccessRate = roleplays.length > 0 
    ? (approvedRoleplays / roleplays.length) * 100 
    : 0;

  const levels = [
    { name: "Level 1 - Orientation", completed: certification?.level_1_completed, date: certification?.level_1_date },
    { name: "Level 2 - Field Fundamentals", completed: certification?.level_2_completed, date: certification?.level_2_date },
    { name: "Level 3 - Independent", completed: certification?.level_3_completed, date: certification?.level_3_date },
    { name: "Level 4 - Mentor", completed: certification?.level_4_completed, date: certification?.level_4_date }
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">My Progress</h1>
        <p className="text-slate-600">Track your training journey and certification advancement</p>
      </div>

      {/* Current Level Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Current Certification Level</div>
              <div className="text-3xl font-bold">
                {certification?.current_level || 'Level 1 - Orientation'}
              </div>
              {certification?.started_date && (
                <div className="text-sm opacity-75 mt-2">
                  Started: {format(new Date(certification.started_date), "MMM d, yyyy")}
                </div>
              )}
            </div>
            <Award className="w-20 h-20 opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <Badge variant="secondary">{certification?.modules_completed?.length || 0}</Badge>
            </div>
            <div className="text-sm text-slate-600">Modules Completed</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-600" />
              <Badge variant="secondary">{certification?.total_field_logs || 0}</Badge>
            </div>
            <div className="text-sm text-slate-600">Field Logs</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <Badge variant="secondary">{certification?.total_roleplays || 0}</Badge>
            </div>
            <div className="text-sm text-slate-600">Roleplays Completed</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-600" />
              <Badge variant="secondary">{certification?.coach_signoffs?.length || 0}</Badge>
            </div>
            <div className="text-sm text-slate-600">Coach Sign-offs</div>
          </CardContent>
        </Card>
      </div>

      {/* Certification Progress */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certification Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {levels.map((level, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {level.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-400" />
                  )}
                  <span className={`font-medium ${level.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                    {level.name}
                  </span>
                </div>
                {level.completed && level.date && (
                  <span className="text-sm text-slate-600">
                    {format(new Date(level.date), "MMM d, yyyy")}
                  </span>
                )}
              </div>
              <Progress value={level.completed ? 100 : 0} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Assignment Progress */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Assignment Progress
            </span>
            <Badge>{completedAssignments} / {assignments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={assignmentCompletionRate} className="h-3 mb-4" />
          <div className="text-sm text-slate-600 text-center">
            {assignmentCompletionRate.toFixed(0)}% Complete
          </div>
        </CardContent>
      </Card>

      {/* Roleplay Success Rate */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Roleplay Performance
            </span>
            <Badge className="bg-green-100 text-green-700">
              {approvedRoleplays} Approved
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={roleplaySuccessRate} className="h-3 mb-4" />
          <div className="text-sm text-slate-600 text-center">
            {roleplaySuccessRate.toFixed(0)}% Approval Rate
          </div>
        </CardContent>
      </Card>

      {/* Coach Sign-offs */}
      {certification?.coach_signoffs && certification.coach_signoffs.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Coach Sign-offs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certification.coach_signoffs.map((signoff, idx) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-green-600">{signoff.level}</Badge>
                    <span className="text-sm text-slate-600">{signoff.date}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-900 mb-1">
                    Signed by: {signoff.coach_name}
                  </div>
                  {signoff.notes && (
                    <div className="text-sm text-slate-700">{signoff.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
