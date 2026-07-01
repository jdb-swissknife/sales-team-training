import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Send,
  Plus,
  X
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CoachReview() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("roleplays");
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    feedback: "",
    rating: 3,
    status: "Approved"
  });
  const [timestampFeedback, setTimestampFeedback] = useState([]);
  const [newTimestamp, setNewTimestamp] = useState({ timestamp: "", comment: "" });

  const queryClient = useQueryClient();

  const { data: pendingRoleplays = [] } = useQuery({
    queryKey: ['pendingRoleplays'],
    queryFn: async () => {
      const all = await dataStore.entities.Roleplay.list('-created_date');
      return all.filter(r => r.status === 'Submitted' || r.status === 'Under Review');
    },
    initialData: []
  });

  const { data: flaggedLogs = [] } = useQuery({
    queryKey: ['flaggedLogs'],
    queryFn: async () => {
      const all = await dataStore.entities.FieldLog.list('-date');
      return all.filter(log => log.needs_attention);
    },
    initialData: []
  });

  const updateRoleplayMutation = useMutation({
    mutationFn: ({ id, data }) => dataStore.entities.Roleplay.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingRoleplays']);
      setSelectedItem(null);
      resetFeedbackForm();
    }
  });

  const updateFieldLogMutation = useMutation({
    mutationFn: ({ id, data }) => dataStore.entities.FieldLog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['flaggedLogs']);
      setSelectedItem(null);
      resetFeedbackForm();
    }
  });

  const resetFeedbackForm = () => {
    setFeedbackForm({ feedback: "", rating: 3, status: "Approved" });
    setTimestampFeedback([]);
    setNewTimestamp({ timestamp: "", comment: "" });
  };

  const handleReviewRoleplay = () => {
    if (!selectedItem) return;
    
    updateRoleplayMutation.mutate({
      id: selectedItem.id,
      data: {
        coach_feedback: feedbackForm.feedback,
        coach_rating: feedbackForm.rating,
        status: feedbackForm.status,
        timestamp_feedback: timestampFeedback,
        reviewed_by: user?.full_name,
        reviewed_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const handleReviewFieldLog = () => {
    if (!selectedItem) return;

    updateFieldLogMutation.mutate({
      id: selectedItem.id,
      data: {
        coach_feedback: feedbackForm.feedback,
        needs_attention: false
      }
    });
  };

  const addTimestampFeedback = () => {
    if (newTimestamp.timestamp && newTimestamp.comment) {
      setTimestampFeedback([...timestampFeedback, newTimestamp]);
      setNewTimestamp({ timestamp: "", comment: "" });
    }
  };

  const removeTimestampFeedback = (idx) => {
    setTimestampFeedback(timestampFeedback.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Coach Review Queue</h1>
        <p className="text-slate-600">Review rep submissions and provide feedback</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingRoleplays.length}</div>
                <div className="text-sm text-slate-600">Pending Roleplays</div>
              </div>
              <MessageSquare className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{flaggedLogs.length}</div>
                <div className="text-sm text-slate-600">Flagged Field Logs</div>
              </div>
              <AlertCircle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {pendingRoleplays.length + flaggedLogs.length}
                </div>
                <div className="text-sm text-slate-600">Total Items</div>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-100">
          <TabsTrigger value="roleplays">
            Roleplays ({pendingRoleplays.length})
          </TabsTrigger>
          <TabsTrigger value="fieldlogs">
            Field Logs ({flaggedLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roleplays" className="space-y-4 mt-6">
          {pendingRoleplays.map((roleplay) => (
            <Card key={roleplay.id} className="border-0 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{roleplay.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-slate-600">
                      <Badge variant="outline">{roleplay.scenario_type}</Badge>
                      <span>by {roleplay.rep_name}</span>
                      <span>• {format(new Date(roleplay.created_date), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    {roleplay.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {roleplay.script_used && (
                  <div>
                    <span className="text-sm font-medium text-slate-700">Script: </span>
                    <span className="text-sm text-slate-600">{roleplay.script_used}</span>
                  </div>
                )}
                {roleplay.self_notes && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs font-medium text-slate-600 mb-1">Rep's Self-Assessment</div>
                    <div className="text-sm text-slate-700">{roleplay.self_notes}</div>
                  </div>
                )}
                <div className="flex gap-3">
                  {roleplay.recording_url && (
                    <a
                      href={roleplay.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Recording
                    </a>
                  )}
                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedItem(roleplay);
                      setFeedbackForm({ feedback: "", rating: 3, status: "Approved" });
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingRoleplays.length === 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center text-slate-500">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-green-500" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm">No roleplays pending review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fieldlogs" className="space-y-4 mt-6">
          {flaggedLogs.map((log) => (
            <Card key={log.id} className="border-0 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {format(new Date(log.date), "MMM d, yyyy")} - {log.rep_name}
                    </CardTitle>
                    <div className="text-sm text-slate-600 mt-1">
                      {log.neighborhood || 'No neighborhood specified'}
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    Needs Attention
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-500">Doors</div>
                    <div className="font-semibold">{log.doors_knocked}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Convos</div>
                    <div className="font-semibold text-blue-600">{log.conversations}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Appts</div>
                    <div className="font-semibold text-green-600">{log.appointments_set}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Closed</div>
                    <div className="font-semibold text-orange-600">{log.closures}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Rating</div>
                    <div className="font-semibold">{log.self_rating}/5</div>
                  </div>
                </div>

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

                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedItem(log);
                    setFeedbackForm({ feedback: "", rating: 3, status: "Approved" });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Provide Feedback
                </Button>
              </CardContent>
            </Card>
          ))}
          {flaggedLogs.length === 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center text-slate-500">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-green-500" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm">No field logs flagged for review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "roleplays" ? "Review Roleplay" : "Provide Field Log Feedback"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {activeTab === "roleplays" && (
              <>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={feedbackForm.status}
                    onValueChange={(value) => setFeedbackForm({ ...feedbackForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={feedbackForm.rating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}
                  />
                </div>

                {/* Timestamp Feedback */}
                <div>
                  <Label>Timestamped Feedback (optional)</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="00:30"
                        value={newTimestamp.timestamp}
                        onChange={(e) => setNewTimestamp({ ...newTimestamp, timestamp: e.target.value })}
                        className="w-24"
                      />
                      <Input
                        placeholder="Comment at this timestamp"
                        value={newTimestamp.comment}
                        onChange={(e) => setNewTimestamp({ ...newTimestamp, comment: e.target.value })}
                      />
                      <Button type="button" size="icon" onClick={addTimestampFeedback}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {timestampFeedback.map((tf, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <Badge variant="outline">{tf.timestamp}</Badge>
                        <span className="text-sm flex-1">{tf.comment}</span>
                        <X
                          className="w-4 h-4 cursor-pointer text-red-600"
                          onClick={() => removeTimestampFeedback(idx)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide detailed feedback..."
                value={feedbackForm.feedback}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={activeTab === "roleplays" ? handleReviewRoleplay : handleReviewFieldLog}
              disabled={updateRoleplayMutation.isPending || updateFieldLogMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {updateRoleplayMutation.isPending || updateFieldLogMutation.isPending 
                ? 'Submitting...' 
                : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
