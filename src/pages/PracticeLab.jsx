import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";
import ExternalAIRoleplayGuide from "../components/roleplay/ExternalAIRoleplayGuide";

export default function PracticeLab() {
  const [user, setUser] = useState(null);
  const [showAIGuide, setShowAIGuide] = useState(false);

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
      setShowAIGuide(false);
    }
  });

  const handleAIRoleplaySubmit = (submissionData) => {
    createMutation.mutate(submissionData);
  };

  const statusColors = {
    "Submitted": "bg-blue-100 text-blue-700 border-blue-200",
    "Under Review": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Approved": "bg-green-100 text-green-700 border-green-200",
    "Needs Improvement": "bg-orange-100 text-orange-700 border-orange-200"
  };

  if (showAIGuide) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Roleplay Practice</h1>
            <p className="text-slate-600 text-sm">Practice with your favorite AI and submit for feedback</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAIGuide(false)}
          >
            ← Back to Practice Lab
          </Button>
        </div>
        <ExternalAIRoleplayGuide 
          onSubmit={handleAIRoleplaySubmit}
          onCancel={() => setShowAIGuide(false)}
          isSubmitting={createMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Practice Lab</h1>
          <p className="text-slate-600 mt-1">Practice with AI and get coach feedback</p>
        </div>
        <Button 
          onClick={() => setShowAIGuide(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          New AI Practice
        </Button>
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
                Use ChatGPT Voice, Claude, or any AI to practice realistic conversations. We provide scenario templates - you practice externally and submit your recordings for coach feedback.
              </p>
              <ul className="space-y-1 text-sm text-purple-100">
                <li>✓ Flexible - use your favorite AI platform</li>
                <li>✓ Realistic voice conversations with customized scenarios</li>
                <li>✓ Submit recordings and get professional coach feedback</li>
                <li>✓ Multiple personality types and difficulty levels</li>
              </ul>
            </div>
            <Button
              onClick={() => setShowAIGuide(true)}
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
            Your Practice Sessions
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
                        <MessageSquare className="w-4 h-4" />
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

                {roleplay.external_transcript && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs font-medium text-slate-600 mb-1">Conversation Transcript</div>
                    <div className="text-sm text-slate-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {roleplay.external_transcript}
                    </div>
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
                <p className="text-lg font-medium">No practice sessions yet</p>
                <p className="text-sm">Start your first AI roleplay practice to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}