import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Copy,
  Edit,
  Trash2,
  ArrowLeft,
  Layers,
  MessageSquare
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function TemplateManager() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showObjectionDialog, setShowObjectionDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [sourceCompanyId, setSourceCompanyId] = useState(null);
  const [sourceCompanyIdObjections, setSourceCompanyIdObjections] = useState(null);

  const navigate = useNavigate();
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

  // Fetch templates (modules with company_id = null)
  const { data: templateModules = [] } = useQuery({
    queryKey: ['templateModules'],
    queryFn: async () => {
      const allModules = await base44.entities.TrainingModule.list('order');
      return allModules.filter(m => !m.company_id);
    },
    initialData: []
  });

  // Fetch template lessons
  const { data: templateLessons = [] } = useQuery({
    queryKey: ['templateLessons'],
    queryFn: async () => {
      const allLessons = await base44.entities.Lesson.list('order');
      return allLessons.filter(l => !l.company_id);
    },
    initialData: []
  });

  // Fetch all companies for cloning existing content
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list(),
    initialData: []
  });

  // Fetch template objections
  const { data: templateObjections = [] } = useQuery({
    queryKey: ['templateObjections'],
    queryFn: async () => {
      const allObjections = await base44.entities.Objection.list();
      return allObjections.filter(o => !o.company_id);
    },
    initialData: []
  });

  const createTemplateFromCompany = useMutation({
    mutationFn: async ({ companyId }) => {
      // Fetch company modules and lessons
      const allModules = await base44.entities.TrainingModule.list();
      const allLessons = await base44.entities.Lesson.list();
      
      const companyModules = allModules.filter(m => m.company_id === companyId);
      const companyLessons = allLessons.filter(l => l.company_id === companyId);

      // Create template modules (without company_id)
      const moduleIdMap = {};
      for (const module of companyModules) {
        const { id, company_id, created_date, updated_date, created_by, ...moduleData } = module;
        const newModule = await base44.entities.TrainingModule.create(moduleData);
        moduleIdMap[id] = newModule.id;
      }

      // Create template lessons (without company_id, update module_id references)
      for (const lesson of companyLessons) {
        const { id, company_id, created_date, updated_date, created_by, module_id, ...lessonData } = lesson;
        await base44.entities.Lesson.create({
          ...lessonData,
          module_id: moduleIdMap[module_id]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templateModules']);
      queryClient.invalidateQueries(['templateLessons']);
      setShowCreateDialog(false);
      setNewTemplateName("");
      setSourceCompanyId(null);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (moduleId) => {
      // Delete associated lessons first
      const moduleLessons = templateLessons.filter(l => l.module_id === moduleId);
      for (const lesson of moduleLessons) {
        await base44.entities.Lesson.delete(lesson.id);
      }
      // Delete module
      await base44.entities.TrainingModule.delete(moduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templateModules']);
      queryClient.invalidateQueries(['templateLessons']);
    }
  });

  const createObjectionTemplateFromCompany = useMutation({
    mutationFn: async ({ companyId }) => {
      const allObjections = await base44.entities.Objection.list();
      const companyObjections = allObjections.filter(o => o.company_id === companyId);

      for (const objection of companyObjections) {
        const { id, company_id, created_date, updated_date, created_by, ...objectionData } = objection;
        await base44.entities.Objection.create(objectionData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templateObjections']);
      setShowObjectionDialog(false);
      setSourceCompanyIdObjections(null);
    }
  });

  const deleteObjectionTemplateMutation = useMutation({
    mutationFn: (objectionId) => base44.entities.Objection.delete(objectionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['templateObjections']);
    }
  });

  const handleCreateFromCompany = () => {
    if (!sourceCompanyId) {
      alert("Please select a company");
      return;
    }
    createTemplateFromCompany.mutate({ companyId: sourceCompanyId });
  };

  const handleCreateObjectionsFromCompany = () => {
    if (!sourceCompanyIdObjections) {
      alert("Please select a company");
      return;
    }
    createObjectionTemplateFromCompany.mutate({ companyId: sourceCompanyIdObjections });
  };

  const handleManageTemplate = (templateModuleId) => {
    // Navigate to CompanyTraining page without company_id to edit templates
    navigate(createPageUrl("CompanyTraining") + "?template_mode=true");
  };

  // Group modules by category for display
  const modulesByCategory = templateModules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {});

  // Group objections by category
  const objectionsByCategory = templateObjections.reduce((acc, obj) => {
    if (!acc[obj.category]) acc[obj.category] = [];
    acc[obj.category].push(obj);
    return acc;
  }, {});

  const totalLessons = templateLessons.length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("PlatformDashboard"))}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Template Library</h1>
        <p className="text-slate-600 mt-1">Manage training and objection templates for new companies</p>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="modules">
            <BookOpen className="w-4 h-4 mr-2" />
            Training Modules
          </TabsTrigger>
          <TabsTrigger value="objections">
            <MessageSquare className="w-4 h-4 mr-2" />
            Objections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          {/* Module Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{templateModules.length}</div>
                <div className="text-xs text-slate-600">Template Modules</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{totalLessons}</div>
                <div className="text-xs text-slate-600">Template Lessons</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(modulesByCategory).length}</div>
                <div className="text-xs text-slate-600">Categories</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowCreateDialog(true)}
              variant="outline"
              className="border-blue-200 text-blue-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone from Company
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("CompanyTraining") + "?template_mode=true")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Module
            </Button>
          </div>

          {/* Template Modules */}
          <div className="space-y-6">
        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <Card key={category} className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
              <CardTitle className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-blue-600" />
                {category}
                <Badge variant="outline">{modules.length} modules</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {modules.map((module) => {
                  const moduleLessons = templateLessons.filter(l => l.module_id === module.id);
                  return (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-slate-900">{module.title}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{module.stage}</Badge>
                              <Badge variant="outline" className="text-xs">{module.difficulty}</Badge>
                              <span className="text-xs text-slate-600">{moduleLessons.length} lessons</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(createPageUrl("CompanyTraining") + "?template_mode=true")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete template module "${module.title}" and all its lessons?`)) {
                              deleteTemplateMutation.mutate(module.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

            {templateModules.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Layers className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                  <p className="text-lg font-medium text-slate-900">No templates yet</p>
                  <p className="text-sm text-slate-600">Create templates from existing company content or build new ones</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="objections" className="space-y-6">
          {/* Objection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{templateObjections.length}</div>
                <div className="text-xs text-slate-600">Template Objections</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(objectionsByCategory).length}</div>
                <div className="text-xs text-slate-600">Categories</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowObjectionDialog(true)}
              variant="outline"
              className="border-orange-200 text-orange-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone from Company
            </Button>
          </div>

          {/* Template Objections */}
          <div className="space-y-6">
            {Object.entries(objectionsByCategory).map(([category, objections]) => (
              <Card key={category} className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-slate-50">
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    {category}
                    <Badge variant="outline">{objections.length} objections</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {objections.map((objection) => (
                      <div key={objection.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 italic">"{objection.objection_text}"</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{objection.stage}</Badge>
                            <Badge variant="outline" className="text-xs">{objection.difficulty}</Badge>
                            {objection.frequency && (
                              <Badge variant="secondary" className="text-xs">{objection.frequency}</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete objection template "${objection.objection_text}"?`)) {
                              deleteObjectionTemplateMutation.mutate(objection.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {templateObjections.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                  <p className="text-lg font-medium text-slate-900">No objection templates yet</p>
                  <p className="text-sm text-slate-600">Clone objections from existing companies to build your library</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Module Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Training Modules from Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Select a company to copy all its training modules and lessons into the template library.
            </p>
            <div>
              <label className="text-sm font-medium">Source Company</label>
              <select
                className="w-full mt-2 p-2 border border-slate-300 rounded-md"
                value={sourceCompanyId || ""}
                onChange={(e) => setSourceCompanyId(e.target.value)}
              >
                <option value="">Select a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFromCompany}
              disabled={!sourceCompanyId || createTemplateFromCompany.isPending}
              className="bg-blue-600"
            >
              {createTemplateFromCompany.isPending ? "Cloning..." : "Clone Templates"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Objection Template Dialog */}
      <Dialog open={showObjectionDialog} onOpenChange={setShowObjectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Objections from Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Select a company to copy all its objections into the template library.
            </p>
            <div>
              <label className="text-sm font-medium">Source Company</label>
              <select
                className="w-full mt-2 p-2 border border-slate-300 rounded-md"
                value={sourceCompanyIdObjections || ""}
                onChange={(e) => setSourceCompanyIdObjections(e.target.value)}
              >
                <option value="">Select a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowObjectionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateObjectionsFromCompany}
              disabled={!sourceCompanyIdObjections || createObjectionTemplateFromCompany.isPending}
              className="bg-orange-600"
            >
              {createObjectionTemplateFromCompany.isPending ? "Cloning..." : "Clone Objections"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}