import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, TrendingUp, X, Flame, Zap } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

export default function FieldLogs() {
  const { user, awardXP } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    neighborhood: "",
    hours_in_field: 0,
    doors_knocked: 0,
    conversations: 0,
    appointments_set: 0,
    closures: 0,
    script_used: true,
    coach_present: false,
    top_objections: [],
    what_worked: "",
    what_to_change: "",
    self_rating: 3,
  });
  const [currentObjection, setCurrentObjection] = useState("");

  const queryClient = useQueryClient();

  const { data: fieldLogs = [] } = useQuery({
    queryKey: ["fieldLogs", user?.id],
    queryFn: () =>
      dataStore.entities.FieldLog.filter({ rep_id: user?.id }, "-date"),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      dataStore.entities.FieldLog.create({
        ...data,
        rep_id: user.id,
        rep_name: user.full_name,
      }),
    onSuccess: async (newLog) => {
      queryClient.invalidateQueries(["fieldLogs"]);
      queryClient.invalidateQueries(["certification"]);

      // Award XP based on activity
      const xpGained =
        (newLog.doors_knocked || 0) * 2 +
        (newLog.conversations || 0) * 3 +
        (newLog.appointments_set || 0) * 5 +
        (newLog.closures || 0) * 20;

      const result = await awardXP(xpGained, "field activity");

      // Touch streak
      await dataStore.auth.touchStreak();
      queryClient.invalidateQueries(["fieldLogs"]);

      setShowForm(false);
      resetForm();

      if (result.leveledUp) {
        toast({
          title: `LEVEL UP! You're now Level ${result.newLevel}! `,
          description: `Earned ${xpGained} XP from today's activity. Keep crushing it!`,
        });
      } else {
        toast({
          title: `+${xpGained} XP earned! `,
          description: `${newLog.doors_knocked} doors, ${newLog.closures} closures logged.`,
        });
      }
    },
  });

  const resetForm = () => {
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      neighborhood: "",
      hours_in_field: 0,
      doors_knocked: 0,
      conversations: 0,
      appointments_set: 0,
      closures: 0,
      script_used: true,
      coach_present: false,
      top_objections: [],
      what_worked: "",
      what_to_change: "",
      self_rating: 3,
    });
    setCurrentObjection("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addObjection = () => {
    if (currentObjection.trim() && formData.top_objections.length < 3) {
      setFormData({
        ...formData,
        top_objections: [...formData.top_objections, currentObjection.trim()],
      });
      setCurrentObjection("");
    }
  };

  const removeObjection = (index) => {
    setFormData({
      ...formData,
      top_objections: formData.top_objections.filter((_, i) => i !== index),
    });
  };

  // Calculate stats
  const totalDoors = fieldLogs.reduce((s, l) => s + (l.doors_knocked || 0), 0);
  const totalConversations = fieldLogs.reduce((s, l) => s + (l.conversations || 0), 0);
  const totalAppointments = fieldLogs.reduce((s, l) => s + (l.appointments_set || 0), 0);
  const totalClosures = fieldLogs.reduce((s, l) => s + (l.closures || 0), 0);

  const convRate = totalDoors > 0 ? ((totalConversations / totalDoors) * 100).toFixed(1) : 0;
  const avgRating =
    fieldLogs.length > 0
      ? (fieldLogs.reduce((s, l) => s + (l.self_rating || 0), 0) / fieldLogs.length).toFixed(1)
      : 0;

  // Potential XP preview
  const previewXP =
    formData.doors_knocked * 2 +
    formData.conversations * 3 +
    formData.appointments_set * 5 +
    formData.closures * 20;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Field Activity Logs</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            Track your daily performance and earn XP
            <Zap className="w-4 h-4 text-amber-500" />
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* XP Info Banner */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className="text-sm text-slate-700">
          <span className="font-bold">Earn XP for every activity:</span>
          {" "}2 XP per door, 3 XP per conversation, 5 XP per appointment, 20 XP per closure.
          Log daily to build your streak!
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">{totalDoors}</div>
            <div className="text-xs text-slate-600 mt-1">Total Doors</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{totalConversations}</div>
            <div className="text-xs text-slate-600 mt-1">Conversations</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600">{totalAppointments}</div>
            <div className="text-xs text-slate-600 mt-1">Appointments</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-600">{totalClosures}</div>
            <div className="text-xs text-slate-600 mt-1">Closures</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-1">Conversation Rate</div>
              <div className="text-3xl font-bold text-green-600">{convRate}%</div>
              <div className="text-xs text-slate-500 mt-1">Conversations per door</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Average Self-Rating</div>
              <div className="text-3xl font-bold text-orange-600">{avgRating}/5</div>
              <div className="text-xs text-slate-500 mt-1">Your self-assessment</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Days Tracked</div>
              <div className="text-3xl font-bold text-blue-600">{fieldLogs.length}</div>
              <div className="text-xs text-slate-500 mt-1">Total logs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fieldLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/50 transition-all border border-slate-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-slate-900">
                      {format(new Date(log.date), "MMM d, yyyy")}
                    </div>
                    {log.neighborhood && <Badge variant="outline">{log.neighborhood}</Badge>}
                    {log.coach_present && (
                      <Badge className="bg-green-100 text-green-700">Coach Present</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= log.self_rating ? "text-yellow-400" : "text-slate-300"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-slate-500">Doors</div>
                    <div className="text-lg font-semibold text-slate-900">{log.doors_knocked}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Convos</div>
                    <div className="text-lg font-semibold text-blue-600">{log.conversations}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Appts</div>
                    <div className="text-lg font-semibold text-green-600">{log.appointments_set}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Closed</div>
                    <div className="text-lg font-semibold text-orange-600">{log.closures}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Hours</div>
                    <div className="text-lg font-semibold text-purple-600">{log.hours_in_field}</div>
                  </div>
                </div>

                {(log.what_worked || log.what_to_change) && (
                  <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    {log.what_worked && (
                      <div>
                        <div className="text-xs font-medium text-green-600 mb-1">What Worked</div>
                        <div className="text-sm text-slate-700">{log.what_worked}</div>
                      </div>
                    )}
                    {log.what_to_change && (
                      <div>
                        <div className="text-xs font-medium text-orange-600 mb-1">To Improve</div>
                        <div className="text-sm text-slate-700">{log.what_to_change}</div>
                      </div>
                    )}
                  </div>
                )}

                {log.coach_feedback && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xs font-medium text-blue-700 mb-1">Coach Feedback</div>
                    <div className="text-sm text-blue-900">{log.coach_feedback}</div>
                  </div>
                )}
              </div>
            ))}
            {fieldLogs.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium">No logs yet</p>
                <p className="text-sm">Log your first day in the field to start earning XP!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Field Activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input
                  id="neighborhood"
                  placeholder="Area worked"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hours">Hours in Field</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.hours_in_field}
                  onChange={(e) => setFormData({ ...formData, hours_in_field: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="doors">Doors Knocked</Label>
                <Input
                  id="doors"
                  type="number"
                  min="0"
                  value={formData.doors_knocked}
                  onChange={(e) => setFormData({ ...formData, doors_knocked: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="conversations">Conversations</Label>
                <Input
                  id="conversations"
                  type="number"
                  min="0"
                  value={formData.conversations}
                  onChange={(e) => setFormData({ ...formData, conversations: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="appointments">Appointments Set</Label>
                <Input
                  id="appointments"
                  type="number"
                  min="0"
                  value={formData.appointments_set}
                  onChange={(e) => setFormData({ ...formData, appointments_set: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="closures">Closures</Label>
                <Input
                  id="closures"
                  type="number"
                  min="0"
                  value={formData.closures}
                  onChange={(e) => setFormData({ ...formData, closures: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rating">Self-Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.self_rating}
                  onChange={(e) => setFormData({ ...formData, self_rating: parseInt(e.target.value) || 3 })}
                  required
                />
              </div>
            </div>

            {/* XP Preview */}
            {previewXP > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-800">
                  This log will earn <span className="font-bold">{previewXP} XP</span>
                </span>
              </div>
            )}

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="script"
                  checked={formData.script_used}
                  onCheckedChange={(checked) => setFormData({ ...formData, script_used: checked })}
                />
                <Label htmlFor="script">Used Script</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coach"
                  checked={formData.coach_present}
                  onCheckedChange={(checked) => setFormData({ ...formData, coach_present: checked })}
                />
                <Label htmlFor="coach">Coach Present</Label>
              </div>
            </div>

            <div>
              <Label>Top Objections (up to 3)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Enter objection"
                  value={currentObjection}
                  onChange={(e) => setCurrentObjection(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjection())}
                />
                <Button
                  type="button"
                  onClick={addObjection}
                  disabled={formData.top_objections.length >= 3}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.top_objections.map((obj, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {obj}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-600" onClick={() => removeObjection(idx)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="worked">What Worked</Label>
              <Textarea
                id="worked"
                placeholder="What went well today?"
                value={formData.what_worked}
                onChange={(e) => setFormData({ ...formData, what_worked: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="change">What to Change</Label>
              <Textarea
                id="change"
                placeholder="What will you improve next time?"
                value={formData.what_to_change}
                onChange={(e) => setFormData({ ...formData, what_to_change: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-blue-700"
              >
                {createMutation.isPending ? "Saving..." : "Save & Earn XP"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
