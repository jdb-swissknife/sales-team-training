import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Upload, Loader2, Check, X, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIContentGenerator({ 
  contentType, // "module" or "lesson"
  currentData, // current module/lesson data for context
  onAccept, // callback when content is accepted
  onCancel 
}) {
  const [mode, setMode] = useState("prompt"); // "prompt" or "file"
  const [prompt, setPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFile(file);
    setError(null);
  };

  const generateFromPrompt = async () => {
    if (!prompt.trim()) {
      setError("Please provide instructions for the AI");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const contextInfo = contentType === "module" 
        ? `Title: ${currentData.title || 'Not set'}, Category: ${currentData.category}, Stage: ${currentData.stage}, Difficulty: ${currentData.difficulty}`
        : `Title: ${currentData.title || 'Not set'}, Content Type: ${currentData.content_type}`;

      const fullPrompt = contentType === "module"
        ? `You are creating training content for a sales training module. Current context: ${contextInfo}. 

Admin instructions: ${prompt}

Generate comprehensive training content with the following structure:
- description: A detailed 2-3 paragraph description of the module
- learning_objectives: An array of 3-5 specific, measurable learning objectives
- estimated_minutes: Estimated time to complete (number only)

Ensure the content is professional, actionable, and tailored to door-to-door solar sales training.`
        : `You are creating training content for a sales training lesson. Current context: ${contextInfo}.

Admin instructions: ${prompt}

Generate comprehensive lesson content with the following structure:
- content_text: Detailed lesson content (500-1000 words), formatted with clear sections
- key_takeaways: An array of 3-5 key points students should remember
- practice_task: A specific, actionable practice exercise related to this lesson

Ensure the content is professional, actionable, and tailored to door-to-door solar sales training.`;

      const schema = contentType === "module"
        ? {
            type: "object",
            properties: {
              description: { type: "string" },
              learning_objectives: { type: "array", items: { type: "string" } },
              estimated_minutes: { type: "number" }
            },
            required: ["description", "learning_objectives", "estimated_minutes"]
          }
        : {
            type: "object",
            properties: {
              content_text: { type: "string" },
              key_takeaways: { type: "array", items: { type: "string" } },
              practice_task: { type: "string" }
            },
            required: ["content_text", "key_takeaways", "practice_task"]
          };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        response_json_schema: schema,
        file_urls: uploadedFileUrl ? [uploadedFileUrl] : undefined
      });

      setGeneratedContent(result);
    } catch (err) {
      setError(err.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromFile = async () => {
    if (!uploadedFile) {
      setError("Please upload a file first");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Upload file first
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const uploadResult = await base44.integrations.Core.UploadFile({ file: uploadedFile });
      const fileUrl = uploadResult.file_url;

      // Use InvokeLLM with file_urls to extract content
      const contextInfo = contentType === "module" 
        ? `Title: ${currentData.title || 'Not set'}, Category: ${currentData.category}, Stage: ${currentData.stage}`
        : `Title: ${currentData.title || 'Not set'}, Content Type: ${currentData.content_type}`;

      const extractPrompt = contentType === "module"
        ? `Analyze the uploaded file and extract training content for a sales training module. Context: ${contextInfo}.

Extract and generate:
- description: A comprehensive 2-3 paragraph description based on the file content
- learning_objectives: 3-5 specific learning objectives derived from the material
- estimated_minutes: Estimated completion time based on content volume

Format the output as JSON with these exact fields.`
        : `Analyze the uploaded file and extract training content for a sales training lesson. Context: ${contextInfo}.

Extract and generate:
- content_text: Comprehensive lesson content (500-1000 words) based on the file
- key_takeaways: 3-5 key points from the material
- practice_task: A practical exercise based on the content

Format the output as JSON with these exact fields.`;

      const schema = contentType === "module"
        ? {
            type: "object",
            properties: {
              description: { type: "string" },
              learning_objectives: { type: "array", items: { type: "string" } },
              estimated_minutes: { type: "number" }
            },
            required: ["description", "learning_objectives", "estimated_minutes"]
          }
        : {
            type: "object",
            properties: {
              content_text: { type: "string" },
              key_takeaways: { type: "array", items: { type: "string" } },
              practice_task: { type: "string" }
            },
            required: ["content_text", "key_takeaways", "practice_task"]
          };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: extractPrompt,
        file_urls: [fileUrl],
        response_json_schema: schema
      });

      setGeneratedContent(result);
    } catch (err) {
      setError(err.message || "Failed to extract content from file");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (mode === "prompt") {
      generateFromPrompt();
    } else {
      generateFromFile();
    }
  };

  const handleAccept = () => {
    onAccept(generatedContent);
    resetState();
  };

  const handleRegenerate = () => {
    setGeneratedContent(null);
  };

  const resetState = () => {
    setPrompt("");
    setUploadedFile(null);
    setGeneratedContent(null);
    setError(null);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-lg text-purple-900">AI Content Generator</h3>
        </div>

        {!generatedContent ? (
          <>
            <Tabs value={mode} onValueChange={setMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prompt">Generate from Prompt</TabsTrigger>
                <TabsTrigger value="file">Extract from File</TabsTrigger>
              </TabsList>

              <TabsContent value="prompt" className="space-y-4 mt-4">
                <div>
                  <Label>Instructions for AI</Label>
                  <Textarea
                    placeholder={contentType === "module" 
                      ? "Example: Create a comprehensive module about handling price objections in solar sales. Focus on value-based selling techniques and ROI calculations."
                      : "Example: Write detailed lesson content about the 3-step objection handling framework. Include real examples and practice scenarios."}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Be specific about what you want the AI to create. The more detail, the better the results.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4 mt-4">
                <div>
                  <Label>Upload Training Material</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt,.csv"
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      {uploadedFile ? (
                        <div>
                          <p className="text-sm font-medium text-slate-900">{uploadedFile.name}</p>
                          <p className="text-xs text-slate-500 mt-1">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-slate-700">Click to upload</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, DOC, TXT, or CSV</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Upload existing training materials, presentations, or documents. The AI will extract and structure the content.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (mode === "prompt" && !prompt.trim()) || (mode === "file" && !uploadedFile)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
              <Button onClick={onCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-900">Content Generated Successfully</p>
              </div>

              {contentType === "module" ? (
                <>
                  <div>
                    <Label className="text-xs text-slate-600">Description</Label>
                    <p className="text-sm mt-1 text-slate-900">{generatedContent.description}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Learning Objectives</Label>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {generatedContent.learning_objectives?.map((obj, idx) => (
                        <li key={idx} className="text-sm text-slate-900">{obj}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Estimated Minutes</Label>
                    <p className="text-sm mt-1 text-slate-900">{generatedContent.estimated_minutes} minutes</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-xs text-slate-600">Content Text</Label>
                    <p className="text-sm mt-1 text-slate-900 whitespace-pre-wrap">{generatedContent.content_text}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Key Takeaways</Label>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {generatedContent.key_takeaways?.map((takeaway, idx) => (
                        <li key={idx} className="text-sm text-slate-900">{takeaway}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Practice Task</Label>
                    <p className="text-sm mt-1 text-slate-900">{generatedContent.practice_task}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAccept} className="flex-1 bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Accept & Apply
              </Button>
              <Button onClick={handleRegenerate} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={onCancel} variant="outline">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}