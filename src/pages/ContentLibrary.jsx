import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Library, 
  BookOpen, 
  MessageCircle,
  Search,
  Filter,
  Shield
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContentLibrary() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("modules");

  const queryClient = useQueryClient();

  // Fetch master library modules (no company_id)
  const { data: masterModules = [] } = useQuery({
    queryKey: ['masterModules'],
    queryFn: async () => {
      const allModules = await dataStore.entities.TrainingModule.list('-created_date');
      return allModules.filter(m => !m.company_id);
    },
    initialData: []
  });

  // Fetch master library objections (no company_id)
  const { data: masterObjections = [] } = useQuery({
    queryKey: ['masterObjections'],
    queryFn: async () => {
      const allObjections = await dataStore.entities.Objection.list('-created_date');
      return allObjections.filter(o => !o.company_id);
    },
    initialData: []
  });

  // Check if user is platform admin
  if (user && user.role !== 'super_admin' && user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Platform Admin Access Required</h2>
        <p className="text-slate-600">You need platform administrator privileges to access the content library.</p>
      </div>
    );
  }

  const industries = [
    "Solar",
    "Service Business General",
    "Roofer",
    "Painter",
    "Plumber",
    "Home Improvement",
    "HVAC",
    "Windows"
  ];

  // Filter modules
  const filteredModules = masterModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === "all" || 
                           module.industry_tags?.includes(industryFilter);
    return matchesSearch && matchesIndustry;
  });

  // Filter objections
  const filteredObjections = masterObjections.filter(objection => {
    const matchesSearch = objection.objection_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         objection.rebuttal_script.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === "all" || 
                           objection.industry_tags?.includes(industryFilter);
    return matchesSearch && matchesIndustry;
  });

  const difficultyColors = {
    "Intro": "bg-green-100 text-green-700 border-green-200",
    "Intermediate": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Master": "bg-red-100 text-red-700 border-red-200",
    "Easy": "bg-green-500",
    "Medium": "bg-yellow-500",
    "Hard": "bg-red-500"
  };

  const categoryColors = {
    "Price": "bg-red-100 text-red-700 border-red-200",
    "Timing": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Decision Maker": "bg-purple-100 text-purple-700 border-purple-200",
    "Competition": "bg-blue-100 text-blue-700 border-blue-200",
    "Trust": "bg-green-100 text-green-700 border-green-200",
    "Technical": "bg-orange-100 text-orange-700 border-orange-200",
    "Other": "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Library className="w-8 h-8 text-purple-600" />
            Master Content Library
          </h1>
          <p className="text-slate-600 mt-1">Create and manage training content for all companies</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{masterModules.length}</div>
            <div className="text-xs text-slate-600">Training Modules</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{masterObjections.length}</div>
            <div className="text-xs text-slate-600">Objections</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-green-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{industries.length}</div>
            <div className="text-xs text-slate-600">Industries</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {masterModules.filter(m => m.industry_tags?.includes("Solar")).length}
            </div>
            <div className="text-xs text-slate-600">Solar Content</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="modules">
            <BookOpen className="w-4 h-4 mr-2" />
            Training Modules ({filteredModules.length})
          </TabsTrigger>
          <TabsTrigger value="objections">
            <MessageCircle className="w-4 h-4 mr-2" />
            Objections ({filteredObjections.length})
          </TabsTrigger>
        </TabsList>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => (
              <Card key={module.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <p className="text-sm text-slate-600 line-clamp-2">{module.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{module.category}</Badge>
                    <Badge variant="outline">{module.stage}</Badge>
                    <Badge className={difficultyColors[module.difficulty]}>
                      {module.difficulty}
                    </Badge>
                  </div>
                  {module.industry_tags && module.industry_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {module.industry_tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    {module.estimated_minutes || 0} min • Created {new Date(module.created_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredModules.length === 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No modules found</h3>
                <p className="text-slate-600">
                  {searchTerm || industryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first training module to get started"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Objections Tab */}
        <TabsContent value="objections" className="space-y-4">
          <div className="space-y-4">
            {filteredObjections.map((objection) => (
              <Card key={objection.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={categoryColors[objection.category]}>
                      {objection.category}
                    </Badge>
                    <Badge variant="outline">{objection.stage}</Badge>
                    {objection.difficulty && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">Difficulty:</span>
                        <div className={`w-12 h-2 rounded-full ${difficultyColors[objection.difficulty]} opacity-70`} />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg italic">"{objection.objection_text}"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-xs font-semibold text-blue-900 mb-1">Rebuttal Script</div>
                    <div className="text-sm text-blue-800">{objection.rebuttal_script}</div>
                  </div>
                  {objection.industry_tags && objection.industry_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {objection.industry_tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    Created {new Date(objection.created_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredObjections.length === 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No objections found</h3>
                <p className="text-slate-600">
                  {searchTerm || industryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first objection to get started"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
