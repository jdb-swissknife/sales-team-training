import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  Target, 
  PlayCircle,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TrainingModules() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: modules = [] } = useQuery({
    queryKey: ['trainingModules'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const allModules = await base44.entities.TrainingModule.list('order');
      // Filter by company_id and exclude welcome module
      return allModules.filter(m => 
        m.company_id === user.company_id && 
        m.title !== "Welcome to Solar Door-to-Door"
      );
    },
    initialData: []
  });

  const categories = ["all", "Onboarding", "Core Skills", "Tools & Resources", "Practice Lab", "Assessments"];

  const filteredModules = selectedCategory === "all" 
    ? modules 
    : modules.filter(m => m.category === selectedCategory);

  const difficultyColors = {
    "Intro": "bg-green-100 text-green-700 border-green-200",
    "Intermediate": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Master": "bg-red-100 text-red-700 border-red-200"
  };

  const stageColors = {
    "Orientation": "bg-purple-100 text-purple-700",
    "Prospecting": "bg-blue-100 text-blue-700",
    "Qualifying": "bg-cyan-100 text-cyan-700",
    "Presentation": "bg-green-100 text-green-700",
    "Close": "bg-orange-100 text-orange-700",
    "Follow-up": "bg-pink-100 text-pink-700"
  };

  const handleStartModule = (moduleId) => {
    navigate(createPageUrl("ModuleDetail") + `?id=${moduleId}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Training Modules</h1>
        <p className="text-slate-600">Master the skills needed to excel in solar door-to-door sales</p>
      </div>

      {/* Category Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-slate-100">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat === "all" ? "All Modules" : cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Module Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <Card 
            key={module.id} 
            className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 overflow-hidden group"
          >
            <div className={`h-2 w-full bg-gradient-to-r ${
              module.difficulty === 'Intro' ? 'from-green-500 to-green-600' :
              module.difficulty === 'Intermediate' ? 'from-yellow-500 to-yellow-600' :
              'from-red-500 to-red-600'
            }`} />
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <Badge className={stageColors[module.stage]}>
                  {module.stage}
                </Badge>
                {module.is_required && (
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    Required
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                {module.title}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {module.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{module.estimated_minutes || 0} min</span>
                </div>
                <Badge variant="outline" className={difficultyColors[module.difficulty]}>
                  {module.difficulty}
                </Badge>
              </div>

              {module.learning_objectives && module.learning_objectives.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <Target className="w-3 h-3" />
                    Learning Objectives
                  </div>
                  <ul className="space-y-1">
                    {module.learning_objectives.slice(0, 2).map((obj, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                        <span className="line-clamp-1">{obj}</span>
                      </li>
                    ))}
                    {module.learning_objectives.length > 2 && (
                      <li className="text-xs text-slate-500 italic">
                        +{module.learning_objectives.length - 2} more objectives
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {module.certification_level && (
                <div className="flex items-center gap-2 text-xs">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                  <span className="text-slate-700">
                    Required for <span className="font-semibold text-purple-600">{module.certification_level}</span>
                  </span>
                </div>
              )}

              <Button 
                onClick={() => handleStartModule(module.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 group-hover:shadow-lg transition-all"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Module
              </Button>
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
              {selectedCategory === "all" 
                ? "No training modules have been created yet." 
                : `No modules in the ${selectedCategory} category yet.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}