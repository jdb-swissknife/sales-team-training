import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  PlayCircle,
  FileText,
  Sparkles
} from "lucide-react";
import AIContentGenerator from "../components/training/AIContentGenerator";
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

export default function CompanyTraining() {
  const [companyId, setCompanyId] = useState(null);
  const [templateMode, setTemplateMode] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [showModuleAI, setShowModuleAI] = useState(false);
  const [showLessonAI, setShowLessonAI] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('company_id');
    const isTemplateMode = params.get('template_mode') === 'true';
    
    setTemplateMode(isTemplateMode);
    
    if (id) {
      setCompanyId(id);
    } else if (!isTemplateMode) {
      const storedCompanyId = localStorage.getItem('selected_company_id');
      if (storedCompanyId) {
        setCompanyId(storedCompanyId);
      }
    }
  }, []);

  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const companies = await base44.entities.Company.list();
      return companies.find(c => c.id === companyId);
    },
    enabled: !!companyId
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['companyModules', companyId, templateMode],
    queryFn: async () => {
      const allModules = await base44.entities.TrainingModule.list('order');
      return templateMode 
        ? allModules.filter(m => !m.company_id)
        : allModules.filter(m => m.company_id === companyId);
    },
    enabled: templateMode || !!companyId,
    initialData: []
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['companyLessons', companyId, templateMode],
    queryFn: async () => {
      const allLessons = await base44.entities.Lesson.list('order');
      return templateMode
        ? allLessons.filter(l => !l.company_id)
        : allLessons.filter(l => l.company_id === companyId);
    },
    enabled: templateMode || !!companyId,
    initialData: []
  });

  const createModuleMutation = useMutation({
    mutationFn: (data) => {
      const moduleData = templateMode 
        ? data 
        : { ...data, company_id: companyId };
      return base44.entities.TrainingModule.create(moduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companyModules']);
      queryClient.invalidateQueries(['templateModules']);
      setShowModuleDialog(false);
      setEditingModule(null);
    }
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TrainingModule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companyModules']);
      setShowModuleDialog(false);
      setEditingModule(null);
    }
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (id) => base44.entities.TrainingModule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['companyModules']);
    }
  });

  const createLessonMutation = useMutation({
    mutationFn: (data) => {
      const lessonData = templateMode 
        ? data 
        : { ...data, company_id: companyId };
      return base44.entities.Lesson.create(lessonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['companyLessons']);
      queryClient.invalidateQueries(['templateLessons']);
      setShowLessonDialog(false);
      setEditingLesson(null);
    }
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lesson.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companyLessons']);
      setShowLessonDialog(false);
      setEditingLesson(null);
    }
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id) => base44.entities.Lesson.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['companyLessons']);
    }
  });

  const handleSaveModule = () => {
    if (editingModule.id) {
      updateModuleMutation.mutate({ id: editingModule.id, data: editingModule });
    } else {
      createModuleMutation.mutate(editingModule);
    }
  };

  const handleSaveLesson = () => {
    if (editingLesson.id) {
      updateLessonMutation.mutate({ id: editingLesson.id, data: editingLesson });
    } else {
      createLessonMutation.mutate(editingLesson);
    }
  };

  const openModuleDialog = (module = null) => {
    setEditingModule(module || {
      title: "",
      description: "",
      category: "Core Skills",
      stage: "Prospecting",
      difficulty: "Intro",
      estimated_minutes: 30,
      learning_objectives: [],
      order: modules.length + 1,
      is_required: false
    });
    setShowModuleAI(false);
    setShowModuleDialog(true);
  };

  const handleModuleAIAccept = (generatedContent) => {
    setEditingModule({
      ...editingModule,
      description: generatedContent.description || editingModule.description,
      learning_objectives: generatedContent.learning_objectives || editingModule.learning_objectives,
      estimated_minutes: generatedContent.estimated_minutes || editingModule.estimated_minutes
    });
    setShowModuleAI(false);
  };

  const openLessonDialog = (moduleId, lesson = null) => {
    setSelectedModuleId(moduleId);
    setEditingLesson(lesson || {
      module_id: moduleId,
      title: "",
      content_type: "Video",
      content_url: "",
      content_text: "",
      duration_minutes: 10,
      key_takeaways: [],
      order: lessons.filter(l => l.module_id === moduleId).length + 1
    });
    setShowLessonAI(false);
    setShowLessonDialog(true);
  };

  const handleLessonAIAccept = (generatedContent) => {
    setEditingLesson({
      ...editingLesson,
      content_text: generatedContent.content_text || editingLesson.content_text,
      key_takeaways: generatedContent.key_takeaways || editingLesson.key_takeaways,
      practice_task: generatedContent.practice_task || editingLesson.practice_task
    });
    setShowLessonAI(false);
  };

  if (!templateMode && !company) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {templateMode ? "Template Training Content" : "Training Content"}
          </h1>
          <p className="text-slate-600 mt-1">
            {templateMode ? "Master templates for new companies" : company.name}
          </p>
        </div>
        <Button onClick={() => openModuleDialog()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Module
        </Button>
      </div>

      <div className="space-y-6">
        {modules.map((module) => {
          const moduleLessons = lessons.filter(l => l.module_id === module.id);
          
          return (
            <Card key={module.id} className="border-0 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      {module.title}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{module.category}</Badge>
                      <Badge variant="outline">{module.stage}</Badge>
                      <Badge variant="outline">{module.difficulty}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openModuleDialog(module)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Delete this module and all its lessons?')) {
                          deleteModuleMutation.mutate(module.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 mb-4">{module.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Lessons ({moduleLessons.length})</h3>
                  <Button size="sm" variant="outline" onClick={() => openLessonDialog(module.id)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>

                <div className="space-y-2">
                  {moduleLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">{lesson.title}</p>
                          <p className="text-sm text-slate-600">{lesson.content_type} • {lesson.duration_minutes} min</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openLessonDialog(module.id, lesson)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Delete this lesson?')) {
                              deleteLessonMutation.mutate(lesson.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {moduleLessons.length === 0 && (
                    <p className="text-center text-slate-500 py-6 text-sm">No lessons yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {modules.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-lg font-medium text-slate-900">No training modules yet</p>
              <p className="text-sm text-slate-600">Create your first module to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingModule?.id ? 'Edit Module' : 'Create New Module'}</DialogTitle>
          </DialogHeader>
          {editingModule && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                />
              </div>

              {!showModuleAI && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModuleAI(true)}
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content with AI
                </Button>
              )}

              {showModuleAI && (
                <AIContentGenerator
                  contentType="module"
                  currentData={editingModule}
                  onAccept={handleModuleAIAccept}
                  onCancel={() => setShowModuleAI(false)}
                />
              )}

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingModule.description}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={editingModule.category} onValueChange={(v) => setEditingModule({ ...editingModule, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Core Skills">Core Skills</SelectItem>
                      <SelectItem value="Tools & Resources">Tools & Resources</SelectItem>
                      <SelectItem value="Practice Lab">Practice Lab</SelectItem>
                      <SelectItem value="Assessments">Assessments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stage</Label>
                  <Select value={editingModule.stage} onValueChange={(v) => setEditingModule({ ...editingModule, stage: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Orientation">Orientation</SelectItem>
                      <SelectItem value="Prospecting">Prospecting</SelectItem>
                      <SelectItem value="Qualifying">Qualifying</SelectItem>
                      <SelectItem value="Presentation">Presentation</SelectItem>
                      <SelectItem value="Close">Close</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Difficulty</Label>
                  <Select value={editingModule.difficulty} onValueChange={(v) => setEditingModule({ ...editingModule, difficulty: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intro">Intro</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Minutes</Label>
                  <Input
                    type="number"
                    value={editingModule.estimated_minutes}
                    onChange={(e) => setEditingModule({ ...editingModule, estimated_minutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveModule} className="bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Save Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson?.id ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
          </DialogHeader>
          {editingLesson && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                />
              </div>

              {!showLessonAI && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLessonAI(true)}
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content with AI
                </Button>
              )}

              {showLessonAI && (
                <AIContentGenerator
                  contentType="lesson"
                  currentData={editingLesson}
                  onAccept={handleLessonAIAccept}
                  onCancel={() => setShowLessonAI(false)}
                />
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Content Type</Label>
                  <Select value={editingLesson.content_type} onValueChange={(v) => setEditingLesson({ ...editingLesson, content_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Slide Deck">Slide Deck</SelectItem>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="Script">Script</SelectItem>
                      <SelectItem value="Checklist">Checklist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={editingLesson.duration_minutes}
                    onChange={(e) => setEditingLesson({ ...editingLesson, duration_minutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Content URL (YouTube, Slides, etc.)</Label>
                <Input
                  value={editingLesson.content_url}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Content Text</Label>
                <Textarea
                  value={editingLesson.content_text}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content_text: e.target.value })}
                  rows={6}
                  placeholder="Lesson content, transcript, or instructions..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLesson} className="bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Save Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}