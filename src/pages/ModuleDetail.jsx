import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  CheckCircle2,
  PlayCircle,
  FileText,
  Video,
  BookOpen,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

export default function ModuleDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Get module ID from URL params
  const urlParams = new URLSearchParams(location.search);
  const moduleId = urlParams.get('id');

  const { data: module } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      const modules = await base44.entities.TrainingModule.filter({ id: moduleId });
      return modules[0] || null;
    },
    enabled: !!moduleId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: () => base44.entities.Lesson.filter({ module_id: moduleId }, 'order'),
    enabled: !!moduleId,
    initialData: []
  });

  if (!moduleId) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">No module ID provided</p>
        <Button onClick={() => navigate(createPageUrl("TrainingModules"))} className="mt-4">
          Back to Modules
        </Button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Loading module...</p>
      </div>
    );
  }

  const contentTypeIcons = {
    "Video": Video,
    "Slide Deck": FileText,
    "Article": BookOpen,
    "Script": FileText,
    "Checklist": CheckCircle2
  };

  const stageColors = {
    "Orientation": "bg-purple-100 text-purple-700",
    "Prospecting": "bg-blue-100 text-blue-700",
    "Qualifying": "bg-cyan-100 text-cyan-700",
    "Presentation": "bg-green-100 text-green-700",
    "Close": "bg-orange-100 text-orange-700",
    "Follow-up": "bg-pink-100 text-pink-700"
  };

  const difficultyColors = {
    "Intro": "from-green-500 to-green-600",
    "Intermediate": "from-yellow-500 to-yellow-600",
    "Master": "from-red-500 to-red-600"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("TrainingModules"))}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={stageColors[module.stage]}>
                {module.stage}
              </Badge>
              {module.is_required && (
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  Required
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {module.title}
            </h1>
          </div>
        </div>

        {/* Module Overview Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <div className={`h-2 w-full bg-gradient-to-r ${difficultyColors[module.difficulty]}`} />
          <CardContent className="pt-6">
            <p className="text-slate-700 text-lg mb-6">{module.description}</p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Duration</div>
                  <div className="font-semibold text-slate-900">{module.estimated_minutes || 0} minutes</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Lessons</div>
                  <div className="font-semibold text-slate-900">{lessons.length}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-600">Difficulty</div>
                  <div className="font-semibold text-slate-900">{module.difficulty}</div>
                </div>
              </div>
            </div>

            {module.learning_objectives && module.learning_objectives.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {module.learning_objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Module Lessons
          </h2>

          {lessons.map((lesson, idx) => {
            const Icon = contentTypeIcons[lesson.content_type] || BookOpen;
            
            return (
              <Card 
                key={lesson.id}
                className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedLesson(lesson)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-lg">
                        {idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {lesson.title}
                        </h3>
                        <Badge variant="outline" className="flex-shrink-0">
                          <Icon className="w-3 h-3 mr-1" />
                          {lesson.content_type}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                        {lesson.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {lesson.duration_minutes} min
                          </div>
                        )}
                        {lesson.key_takeaways && (
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {lesson.key_takeaways.length} key takeaways
                          </div>
                        )}
                      </div>

                      {lesson.practice_task && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 text-sm">
                          <div className="font-medium text-orange-900 mb-1">📝 Practice Task</div>
                          <div className="text-orange-800">{lesson.practice_task}</div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 group-hover:shadow-md transition-all"
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Start Lesson
                        </Button>
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {lessons.length === 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center text-slate-500">
                <BookOpen className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium">No lessons available yet</p>
                <p className="text-sm">Lessons for this module are being created</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Lesson Content Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLesson && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline">
                    {contentTypeIcons[selectedLesson.content_type] && 
                      React.createElement(contentTypeIcons[selectedLesson.content_type], { className: "w-3 h-3 mr-1" })}
                    {selectedLesson.content_type}
                  </Badge>
                  {selectedLesson.duration_minutes && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedLesson.duration_minutes} min
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{selectedLesson.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Content URL */}
                {selectedLesson.content_url && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <a 
                      href={selectedLesson.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open {selectedLesson.content_type}
                    </a>
                  </div>
                )}

                {/* Content Text */}
                {selectedLesson.content_text && (
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{selectedLesson.content_text}</ReactMarkdown>
                  </div>
                )}

                {/* Key Takeaways */}
                {selectedLesson.key_takeaways && selectedLesson.key_takeaways.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2">
                      {selectedLesson.key_takeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-green-800">
                          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timestamps */}
                {selectedLesson.timestamps && selectedLesson.timestamps.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <h3 className="font-semibold text-purple-900 mb-3">Video Timestamps</h3>
                    <div className="space-y-2">
                      {selectedLesson.timestamps.map((ts, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <Badge variant="outline" className="flex-shrink-0">{ts.time}</Badge>
                          <span className="text-purple-800">{ts.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practice Task */}
                {selectedLesson.practice_task && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      📝 Practice Task
                    </h3>
                    <p className="text-orange-800">{selectedLesson.practice_task}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setSelectedLesson(null)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedLesson(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}