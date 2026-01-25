import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Copy,
  Edit,
  Trash2,
  ArrowLeft,
  Layers,
  MessageSquare,
  Upload,
  Save
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AIContentGenerator from "../components/training/AIContentGenerator";

export default function TemplateManager() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showObjectionDialog, setShowObjectionDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [sourceCompanyId, setSourceCompanyId] = useState(null);
  const [sourceCompanyIdObjections, setSourceCompanyIdObjections] = useState(null);
  const [industryFilter, setIndustryFilter] = useState("all");
  const [objectionIndustryFilter, setObjectionIndustryFilter] = useState("all");
  const [showCreateObjectionForm, setShowCreateObjectionForm] = useState(false);
  const [newObjection, setNewObjection] = useState({
    industry: "Solar",
    objection_text: "",
    category: "Price",
    stage: "Door Approach",
    rebuttal_script: "",
    best_practices: [],
    example_responses: [],
    related_media_url: "",
    difficulty: "Medium",
    frequency: "Common",
    tags: []
  });
  const [showCreateModuleForm, setShowCreateModuleForm] = useState(false);
  const [newModule, setNewModule] = useState({
    industry: "Solar",
    title: "",
    description: "",
    category: "Core Skills",
    stage: "Prospecting",
    difficulty: "Intro",
    estimated_minutes: 30,
    learning_objectives: [],
    order: 1,
    is_required: false
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [showModuleAI, setShowModuleAI] = useState(false);

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

  const createObjectionMutation = useMutation({
    mutationFn: (objectionData) => base44.entities.Objection.create(objectionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['templateObjections']);
      setShowCreateObjectionForm(false);
      setNewObjection({
        industry: "Solar",
        objection_text: "",
        category: "Price",
        stage: "Door Approach",
        rebuttal_script: "",
        best_practices: [],
        example_responses: [],
        related_media_url: "",
        difficulty: "Medium",
        frequency: "Common",
        tags: []
      });
    }
  });

  const createModuleMutation = useMutation({
    mutationFn: (moduleData) => base44.entities.TrainingModule.create(moduleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['templateModules']);
      setShowCreateModuleForm(false);
      setNewModule({
        industry: "Solar",
        title: "",
        description: "",
        category: "Core Skills",
        stage: "Prospecting",
        difficulty: "Intro",
        estimated_minutes: 30,
        learning_objectives: [],
        order: 1,
        is_required: false
      });
      setUploadedFileUrl(null);
      setShowModuleAI(false);
    }
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(result.file_url);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleModuleAIAccept = (generatedContent) => {
    setNewModule({
      ...newModule,
      description: generatedContent.description || newModule.description,
      learning_objectives: generatedContent.learning_objectives || newModule.learning_objectives,
      estimated_minutes: generatedContent.estimated_minutes || newModule.estimated_minutes
    });
    setShowModuleAI(false);
  };

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

  // Filter modules by industry
  const filteredModules = industryFilter === "all" 
    ? templateModules 
    : templateModules.filter(m => m.industry === industryFilter);

  // Filter objections by industry
  const filteredObjections = objectionIndustryFilter === "all"
    ? templateObjections
    : templateObjections.filter(o => o.industry === objectionIndustryFilter);

  // Group filtered modules by category for display
  const modulesByCategory = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {});

  // Group filtered objections by category
  const objectionsByCategory = filteredObjections.reduce((acc, obj) => {
    if (!acc[obj.category]) acc[obj.category] = [];
    acc[obj.category].push(obj);
    return acc;
  }, {});

  // Get unique industries
  const moduleIndustries = [...new Set(templateModules.map(m => m.industry).filter(Boolean))];
  const objectionIndustries = [...new Set(templateObjections.map(o => o.industry).filter(Boolean))];

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
                <div className="text-2xl font-bold text-blue-600">{filteredModules.length}</div>
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

          <div className="flex justify-between items-center">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {moduleIndustries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
                className="border-blue-200 text-blue-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Clone from Company
              </Button>
              <Button
                onClick={() => setShowCreateModuleForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Module
              </Button>
            </div>
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
                              {module.industry && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">{module.industry}</Badge>
                              )}
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

            {filteredModules.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <Layers className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                  <p className="text-lg font-medium text-slate-900">
                    {industryFilter === "all" ? "No templates yet" : `No ${industryFilter} templates found`}
                  </p>
                  <p className="text-sm text-slate-600">
                    {industryFilter === "all" 
                      ? "Create templates from existing company content or build new ones"
                      : "Try selecting a different industry"}
                  </p>
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
                <div className="text-2xl font-bold text-orange-600">{filteredObjections.length}</div>
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

          <div className="flex justify-between items-center">
            <Select value={objectionIndustryFilter} onValueChange={setObjectionIndustryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {objectionIndustries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowObjectionDialog(true)}
                variant="outline"
                className="border-orange-200 text-orange-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Clone from Company
              </Button>
              <Button
                onClick={() => setShowCreateObjectionForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Objection
              </Button>
            </div>
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
                            {objection.industry && (
                              <Badge className="bg-orange-100 text-orange-700 text-xs">{objection.industry}</Badge>
                            )}
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

            {filteredObjections.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                  <p className="text-lg font-medium text-slate-900">
                    {objectionIndustryFilter === "all" ? "No objection templates yet" : `No ${objectionIndustryFilter} objections found`}
                  </p>
                  <p className="text-sm text-slate-600">
                    {objectionIndustryFilter === "all"
                      ? "Clone objections from existing companies to build your library"
                      : "Try selecting a different industry"}
                  </p>
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

      {/* Create New Module Dialog */}
      <Dialog open={showCreateModuleForm} onOpenChange={setShowCreateModuleForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Training Module Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Upload Knowledge Base / Documentation (Optional)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  className="hidden"
                  id="module-file-upload"
                  disabled={uploadingFile}
                />
                <label htmlFor="module-file-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploadingFile}
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingFile ? "Uploading..." : uploadedFileUrl ? "File Uploaded ✓" : "Upload Documents"}
                    </span>
                  </Button>
                </label>
                {uploadedFileUrl && (
                  <p className="text-sm text-green-600 mt-1">✓ File uploaded successfully</p>
                )}
              </div>
            </div>

            <div>
              <Label>Module Title *</Label>
              <Input
                placeholder="e.g., Introduction to Door Knocking"
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Industry *</Label>
              <Select value={newModule.industry} onValueChange={(v) => setNewModule({ ...newModule, industry: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solar">Solar</SelectItem>
                  <SelectItem value="Service Business General">Service Business General</SelectItem>
                  <SelectItem value="Roofing">Roofing</SelectItem>
                  <SelectItem value="Painting">Painting</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Home Improvement">Home Improvement</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {uploadedFileUrl && !showModuleAI && (
              <Button
                type="button"
                onClick={() => setShowModuleAI(true)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Generate Content from Uploaded File
              </Button>
            )}

            {showModuleAI && (
              <AIContentGenerator
                contentType="module"
                currentData={newModule}
                onAccept={handleModuleAIAccept}
                onCancel={() => setShowModuleAI(false)}
                uploadedFileUrl={uploadedFileUrl}
              />
            )}

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of what this module covers..."
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={newModule.category} onValueChange={(v) => setNewModule({ ...newModule, category: v })}>
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
                <Label>Stage *</Label>
                <Select value={newModule.stage} onValueChange={(v) => setNewModule({ ...newModule, stage: v })}>
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
                <Select value={newModule.difficulty} onValueChange={(v) => setNewModule({ ...newModule, difficulty: v })}>
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
                  value={newModule.estimated_minutes}
                  onChange={(e) => setNewModule({ ...newModule, estimated_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModuleForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createModuleMutation.mutate(newModule)}
              disabled={!newModule.title || createModuleMutation.isPending}
              className="bg-blue-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {createModuleMutation.isPending ? "Creating..." : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Objection Dialog */}
      <Dialog open={showCreateObjectionForm} onOpenChange={setShowCreateObjectionForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Objection Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Industry *</Label>
              <Select value={newObjection.industry} onValueChange={(v) => setNewObjection({ ...newObjection, industry: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solar">Solar</SelectItem>
                  <SelectItem value="Service Business General">Service Business General</SelectItem>
                  <SelectItem value="Roofing">Roofing</SelectItem>
                  <SelectItem value="Painting">Painting</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Home Improvement">Home Improvement</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Objection Text *</Label>
              <Input
                placeholder='"I need to think about it"'
                value={newObjection.objection_text}
                onChange={(e) => setNewObjection({ ...newObjection, objection_text: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={newObjection.category} onValueChange={(v) => setNewObjection({ ...newObjection, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Price">Price</SelectItem>
                    <SelectItem value="Timing">Timing</SelectItem>
                    <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                    <SelectItem value="Competition">Competition</SelectItem>
                    <SelectItem value="Trust">Trust</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stage *</Label>
                <Select value={newObjection.stage} onValueChange={(v) => setNewObjection({ ...newObjection, stage: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Door Approach">Door Approach</SelectItem>
                    <SelectItem value="Qualifying">Qualifying</SelectItem>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                    <SelectItem value="Close">Close</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Rebuttal Script *</Label>
              <Textarea
                placeholder="Your response to this objection..."
                value={newObjection.rebuttal_script}
                onChange={(e) => setNewObjection({ ...newObjection, rebuttal_script: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select value={newObjection.difficulty} onValueChange={(v) => setNewObjection({ ...newObjection, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={newObjection.frequency} onValueChange={(v) => setNewObjection({ ...newObjection, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Very Common">Very Common</SelectItem>
                    <SelectItem value="Common">Common</SelectItem>
                    <SelectItem value="Occasional">Occasional</SelectItem>
                    <SelectItem value="Rare">Rare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Related Media URL (Optional)</Label>
              <Input
                placeholder="https://..."
                value={newObjection.related_media_url}
                onChange={(e) => setNewObjection({ ...newObjection, related_media_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateObjectionForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createObjectionMutation.mutate(newObjection)}
              disabled={!newObjection.objection_text || !newObjection.rebuttal_script || createObjectionMutation.isPending}
              className="bg-orange-600"
            >
              {createObjectionMutation.isPending ? "Creating..." : "Create Objection"}
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