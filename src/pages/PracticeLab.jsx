
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Video, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
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
import AIRoleplaySession from "../components/roleplay/AIRoleplaySession";

export default function PracticeLab() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAIRoleplay, setShowAIRoleplay] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    scenario_type: "Door Approach",
    script_used: "",
    recording_url: "",
    partner_name: "",
    self_notes: ""
  });

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

  const { data: roleplays = [] } = useQuery({
    queryKey: ['roleplays', user?.id],
    queryFn: () => base44.entities.Roleplay.filter({ rep_id: user?.id }, '-created_date'),
    enabled: !!user?.id,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Roleplay.create({
      ...data,
      rep_id: user.id,
      rep_name: user.full_name,
      status: "Submitted"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['roleplays']);
      queryClient.invalidateQueries(['certification']);
      setShowForm(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      scenario_type: "Door Approach",
      script_used: "",
      recording_url: "",
      partner_name: "",
      self_notes: ""
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, recording_url: file_url });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const statusColors = {
    "Submitted": "bg-blue-100 text-blue-700 border-blue-200",
    "Under Review": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Approved": "bg-green-100 text-green-700 border-green-200",
    "Needs Improvement": "bg-orange-100 text-orange-700 border-orange-200"
  };

  const scenarioTypes = [
    "Door Approach",
    "Qualifying",
    "Presentation",
    "Objection Handling",
    "Close",
    "Follow-up"
  ];

  if (showAIRoleplay) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowAIRoleplay(false)}
          >
            ← Back to Practice Lab
          </Button>
        </div>
        <AIRoleplaySession onComplete={() => setShowAIRoleplay(false)} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Practice Lab</h1>
          <p className="text-slate-600 mt-1">Practice with AI or submit roleplays for coach feedback</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowAIRoleplay(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Practice
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit Roleplay
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{roleplays.length}</div>
            <div className="text-xs text-slate-600 mt-1">Total Roleplays</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-yellow-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {roleplays.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length}
            </div>
            <div className="text-xs text-slate-600 mt-1">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {roleplays.filter(r => r.status === 'Approved').length}
            </div>
            <div className="text-xs text-slate-600 mt-1">Approved</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {roleplays.length > 0 
                ? (roleplays.reduce((sum, r) => sum + (r.coach_rating || 0), 0) / roleplays.filter(r => r.coach_rating).length || 0).toFixed(1)
                : '0'}/5
            </div>
            <div className="text-xs text-slate-600 mt-1">Avg Coach Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Practice Promo Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white overflow-hidden">
        <CardContent className="pt-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🎯 Practice with AI Homeowners</h3>
              <p className="text-purple-100 text-sm mb-4">
                Have realistic voice conversations with AI-powered homeowners. Get instant feedback on your pitch, objection handling, and closing techniques.
              </p>
              <ul className="space-y-1 text-sm text-purple-100">
                <li>✓ Voice-powered realistic conversations</li>
                <li>✓ Multiple personality types and difficulty levels</li>
                <li>✓ Instant AI feedback on your performance</li>
                <li>✓ Practice anytime, unlimited sessions</li>
              </ul>
            </div>
            <Button
              onClick={() => setShowAIRoleplay(true)}
              size="lg"
              className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl"
            >
              Start AI Practice
            </Button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full opacity-20"></div>
        </CardContent>
      </Card>

      {/* Roleplay History */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Your Submitted Roleplays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleplays.map((roleplay) => (
              <div 
                key={roleplay.id}
                className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{roleplay.title}</h3>
                      <Badge className={statusColors[roleplay.status]}>
                        {roleplay.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {roleplay.scenario_type}
                      </div>
                      {roleplay.partner_name && (
                        <div className="flex items-center gap-1">
                          Partner: {roleplay.partner_name}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(roleplay.created_date), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  {roleplay.coach_rating && (
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= roleplay.coach_rating ? "text-yellow-400 text-lg" : "text-slate-300 text-lg"}>
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {roleplay.self_notes && (
                  <div className="mb-3 p-3 bg-white rounded-lg">
                    <div className="text-xs font-medium text-slate-600 mb-1">Your Notes</div>
                    <div className="text-sm text-slate-700">{roleplay.self_notes}</div>
                  </div>
                )}

                {roleplay.coach_feedback && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <div className="text-xs font-medium text-blue-700">
                        Coach Feedback {roleplay.reviewed_by && `by ${roleplay.reviewed_by}`}
                      </div>
                    </div>
                    <div className="text-sm text-blue-900">{roleplay.coach_feedback}</div>
                    {roleplay.timestamp_feedback && roleplay.timestamp_feedback.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {roleplay.timestamp_feedback.map((tf, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium text-blue-700">{tf.timestamp}:</span>{' '}
                            <span className="text-blue-900">{tf.comment}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {roleplay.status === 'Needs Improvement' && !roleplay.coach_feedback && (
                  <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-900">
                      This roleplay needs improvement. Your coach will provide detailed feedback soon.
                    </div>
                  </div>
                )}

                {roleplay.recording_url && (
                  <div className="mt-3">
                    <a 
                      href={roleplay.recording_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 underline"
                    >
                      View Recording
                    </a>
                  </div>
                )}
              </div>
            ))}

            {roleplays.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium">No roleplays yet</p>
                <p className="text-sm">Submit your first practice session to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Roleplay Practice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Roleplay Title</Label>
              <Input
                id="title"
                placeholder="e.g., Door approach with pricing objection"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="scenario">Scenario Type</Label>
              <Select
                value={formData.scenario_type}
                onValueChange={(value) => setFormData({ ...formData, scenario_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarioTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="script">Script Used</Label>
              <Input
                id="script"
                placeholder="Which script did you practice?"
                value={formData.script_used}
                onChange={(e) => setFormData({ ...formData, script_used: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="partner">Practice Partner (optional)</Label>
              <Input
                id="partner"
                placeholder="Who did you practice with?"
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="recording">Upload Recording</Label>
              <div className="mt-2">
                <Input
                  id="recording"
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-2">Uploading...</p>
                )}
                {formData.recording_url && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Recording uploaded successfully
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Your Self-Assessment</Label>
              <Textarea
                id="notes"
                placeholder="How do you think it went? What did you struggle with?"
                value={formData.self_notes}
                onChange={(e) => setFormData({ ...formData, self_notes: e.target.value })}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || uploading}
                className="bg-gradient-to-r from-orange-500 to-orange-600"
              >
                {createMutation.isPending ? 'Submitting...' : 'Submit Roleplay'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
