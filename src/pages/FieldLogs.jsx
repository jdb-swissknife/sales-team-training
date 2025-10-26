import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, TrendingUp, X } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function FieldLogs() {
  const [user, setUser] = useState(null);
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
    self_rating: 3
  });
  const [currentObjection, setCurrentObjection] = useState("");

  const queryClient = useQueryClient();

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

  const { data: fieldLogs = [] } = useQuery({
    queryKey: ['fieldLogs', user?.id],
    queryFn: () => base44.entities.FieldLog.filter({ rep_id: user?.id }, '-date'),
    enabled: !!user?.id,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FieldLog.create({
      ...data,
      rep_id: user.id,
      rep_name: user.full_name
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['fieldLogs']);
      queryClient.invalidateQueries(['certification']);
      setShowForm(false);
      resetForm();
    }
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
      self_rating: 3
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
        top_objections: [...formData.top_objections, currentObjection.trim()]
      });
      setCurrentObjection("");
    }
  };

  const removeObjection = (index) => {
    setFormData({
      ...formData,
      top_objections: formData.top_objections.filter((_, i) => i !== index)
    });
  };

  // Calculate stats
  const totalDoors = fieldLogs.reduce((sum, log) => sum + (log.doors_knocked || 0), 0);
  const totalConversations = fieldLogs.reduce((sum, log) => sum + (log.conversations || 0), 0);
  const totalAppointments = fieldLogs.reduce((sum, log) => sum + (log.appointments_set || 0), 0);
  const totalClosures = fieldLogs.reduce((sum, log) => sum + (log.closures || 0), 0);

  const conversionRate = totalDoors > 0 ? ((totalConversations / totalDoors) * 100).toFixed(1) : 0;
  const avgRating = fieldLogs.length > 0 
    ? (fieldLogs.reduce((sum, log) => sum + (log.self_rating || 0), 0) / fieldLogs.length).toFixed(1)
    : 0;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Field Activity Logs</h1>
          <p className="text-slate-600 mt-1">Track your daily door-to-door performance</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Field Activity
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalDoors}</div>
            <div className="text-xs text-slate-600 mt-1">Total Doors Knocked</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalConversations}</div>
            <div className="text-xs text-slate-600 mt-1">Conversations</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{totalAppointments}</div>
            <div className="text-xs text-slate-600 mt-1">Appointments Set</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{totalClosures}</div>
            <div className="text-xs text-slate-600 mt-1">Total Closures</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-1">Conversation Rate</div>
              <div className="text-3xl font-bold text-green-600">{conversionRate}%</div>
              <div className="text-xs text-slate-500 mt-1">Conversations per door</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Average Self-Rating</div>
              <div className="text-3xl font-bold text-orange-600">{avgRating}/5</div>
              <div className="text-xs text-slate-500 mt-1">Your self-assessment</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Total Logs</div>
              <div className="text-3xl font-bold text-blue-600">{fieldLogs.length}</div>
              <div className="text-xs text-slate-500 mt-1">Days tracked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log History */}
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
                    {log.neighborhood && (
                      <Badge variant="outline">{log.neighborhood}</Badge>
                    )}
                    {log.coach_present && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Coach Present
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= log.self_rating ? "text-yellow-400" : "text-slate-300"}>
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
                    <div className="text-xs text-slate-500">Conversations</div>
                    <div className="text-lg font-semibold text-blue-600">{log.conversations}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Appointments</div>
                    <div className="text-lg font-semibold text-green-600">{log.appointments_set}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Closures</div>
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
                <p className="text-lg font-medium">No field logs yet</p>
                <p className="text-sm">Start tracking your daily activity to see your progress</p>
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
                  onChange={(e) => setFormData({ ...formData, doors_knocked: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, conversations: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, appointments_set: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, closures: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, self_rating: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjection())}
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
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-600" 
                      onClick={() => removeObjection(idx)}
                    />
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
                {createMutation.isPending ? 'Saving...' : 'Save Log'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}