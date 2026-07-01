import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useAuth } from "@/lib/AuthContext";
import { useSearchParams, Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Clock,
  Target,
  CheckCircle2,
  GraduationCap,
  Zap,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function ModuleDetail() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id");
  const { user, awardXP } = useAuth();
  const [completed, setCompleted] = useState(false);

  const { data: module } = useQuery({
    queryKey: ["module", moduleId],
    queryFn: () => dataStore.entities.TrainingModule.getById(moduleId),
    enabled: !!moduleId,
  });

  if (!module) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Loading module...</p>
      </div>
    );
  }

  const difficultyColors = {
    Intro: "bg-green-100 text-green-700 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Master: "bg-red-100 text-red-700 border-red-200",
  };

  const handleComplete = async () => {
    const xp = 50;
    const result = await awardXP(xp, "module completion");
    setCompleted(true);

    if (result.leveledUp) {
      toast({
        title: `LEVEL UP! You're now Level ${result.newLevel}! `,
        description: `Completed "${module.title}" and earned ${xp} XP!`,
      });
    } else {
      toast({
        title: `+${xp} XP earned! `,
        description: `"${module.title}" marked as complete.`,
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link to={createPageUrl("TrainingModules")}>
        <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Training
        </Button>
      </Link>

      {/* Module header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {module.difficulty && (
            <Badge className={difficultyColors[module.difficulty]}>
              {module.difficulty}
            </Badge>
          )}
          {module.stage && (
            <Badge variant="outline">{module.stage}</Badge>
          )}
          {module.is_required && (
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              Required
            </Badge>
          )}
          {module.estimated_minutes && (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              {module.estimated_minutes} min
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          {module.title}
        </h1>
        <p className="text-slate-600 text-lg">{module.description}</p>
      </div>

      {/* Learning objectives */}
      {module.learning_objectives && module.learning_objectives.length > 0 && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">What You'll Learn</h3>
            </div>
            <ul className="space-y-2">
              {module.learning_objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {module.content ? (
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-3" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold text-slate-900 mt-5 mb-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-slate-700 leading-relaxed mb-3" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 space-y-1 mb-3 text-slate-700" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-5 space-y-1 mb-3 text-slate-700" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-slate-900" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-amber-400 pl-4 py-2 my-4 bg-amber-50 rounded-r-lg text-slate-700 italic"
                      {...props}
                    />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-slate-200 rounded-lg" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-slate-200 px-3 py-2 bg-slate-50 font-bold text-slate-900 text-sm" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-slate-200 px-3 py-2 text-sm text-slate-700" {...props} />
                  ),
                }}
              >
                {module.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <p className="text-slate-500 text-center py-8">
              Content coming soon for this module.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Certification info */}
      {module.certification_level && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <GraduationCap className="w-4 h-4 text-purple-600" />
          <span>
            Required for{" "}
            <span className="font-semibold text-purple-600">
              {module.certification_level}
            </span>{" "}
            certification
          </span>
        </div>
      )}

      {/* Complete button */}
      <div className="pt-4 pb-8">
        {completed ? (
          <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <Trophy className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-bold text-green-700 text-lg">Module Complete!</p>
              <p className="text-sm text-slate-600">
                You earned 50 XP. Keep up the great work!
              </p>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleComplete}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/20"
          >
            <Zap className="w-5 h-5 mr-2" />
            Mark Complete & Earn 50 XP
          </Button>
        )}
      </div>
    </div>
  );
}
