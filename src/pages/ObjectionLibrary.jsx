import { useQuery } from "@tanstack/react-query";
import { dataStore } from "@/lib/dataStore";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, ExternalLink, Lightbulb } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ObjectionLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStage, setFilterStage] = useState("all");

  const { data: objections = [] } = useQuery({
    queryKey: ['objections'],
    queryFn: async () => {
      const allObjections = await dataStore.entities.Objection.list();
      return allObjections;
    },
    initialData: []
  });

  const filteredObjections = objections.filter(obj => {
    const matchesSearch = obj.objection_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obj.rebuttal_script.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || obj.category === filterCategory;
    const matchesStage = filterStage === "all" || obj.stage === filterStage;
    return matchesSearch && matchesCategory && matchesStage;
  });

  const categoryColors = {
    "Price": "bg-red-100 text-red-700 border-red-200",
    "Timing": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Decision Maker": "bg-purple-100 text-purple-700 border-purple-200",
    "Competition": "bg-blue-100 text-blue-700 border-blue-200",
    "Trust": "bg-green-100 text-green-700 border-green-200",
    "Technical": "bg-orange-100 text-orange-700 border-orange-200",
    "Other": "bg-slate-100 text-slate-700 border-slate-200"
  };

  const difficultyColors = {
    "Easy": "bg-green-500",
    "Medium": "bg-yellow-500",
    "Hard": "bg-red-500"
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Objection Library</h1>
        <p className="text-slate-600">Master common objections with proven rebuttals and strategies</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search objections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Price">Price</SelectItem>
                <SelectItem value="Timing">Timing</SelectItem>
                <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                <SelectItem value="Competition">Competition</SelectItem>
                <SelectItem value="Trust">Trust</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="Door Approach">Door Approach</SelectItem>
                <SelectItem value="Qualifying">Qualifying</SelectItem>
                <SelectItem value="Presentation">Presentation</SelectItem>
                <SelectItem value="Close">Close</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Objections Grid */}
      <div className="space-y-4">
        {filteredObjections.map((objection) => (
          <Card 
            key={objection.id}
            className="border-0 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50"
          >
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap gap-2">
                  <Badge className={categoryColors[objection.category]}>
                    {objection.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {objection.stage}
                  </Badge>
                  {objection.frequency && (
                    <Badge variant="secondary" className="text-xs">
                      {objection.frequency}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Difficulty:</span>
                  <div className={`w-16 h-2 rounded-full ${difficultyColors[objection.difficulty]} opacity-70`} />
                </div>
              </div>
              <CardTitle className="text-xl text-slate-900 flex items-start gap-2">
                <MessageCircle className="w-5 h-5 mt-1 text-slate-400 flex-shrink-0" />
                <span className="italic">"{objection.objection_text}"</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Rebuttal Script */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-sm font-semibold text-blue-900 mb-2">💬 Rebuttal Script</div>
                <div className="text-sm text-blue-800 leading-relaxed">
                  {objection.rebuttal_script}
                </div>
              </div>

              {/* Example Responses */}
              {objection.example_responses && objection.example_responses.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Example Responses
                  </div>
                  <div className="space-y-2">
                    {objection.example_responses.map((response, idx) => (
                      <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-900">
                        {response}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Practices */}
              {objection.best_practices && objection.best_practices.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-700">✨ Best Practices</div>
                  <ul className="space-y-1">
                    {objection.best_practices.map((practice, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Media */}
              {objection.related_media_url && (
                <div className="pt-3 border-t border-slate-200">
                  <a 
                    href={objection.related_media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch video example
                  </a>
                </div>
              )}

              {/* Tags */}
              {objection.tags && objection.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {objection.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
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
              {searchTerm || filterCategory !== "all" || filterStage !== "all"
                ? "Try adjusting your filters"
                : "The objection library is being built"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
