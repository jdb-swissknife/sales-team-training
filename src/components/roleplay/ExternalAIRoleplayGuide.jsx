import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Copy,
  CheckCircle2,
  Upload,
  ExternalLink,
  MessageSquare,
  FileAudio,
  FileText,
  ArrowRight,
  Sparkles
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ExternalAIRoleplayGuide({ onSubmit, onCancel, isSubmitting }) {
  const [step, setStep] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState("door_approach");
  const [selectedPersonality, setSelectedPersonality] = useState("skeptical");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [copied, setCopied] = useState(false);
  
  // Submission form data
  const [title, setTitle] = useState("");
  const [recordingFile, setRecordingFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [selfNotes, setSelfNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState("");

  const scenarios = {
    door_approach: {
      name: "Door Knock - Initial Contact",
      focus: "Break preoccupation, create urgency, qualify homeowner"
    },
    qualifying: {
      name: "Qualifying Call - Budget Discussion",
      focus: "Understand their bill, identify decision makers, set appointment"
    },
    presentation: {
      name: "In-Home Presentation",
      focus: "Present savings, handle objections, build trust"
    },
    objection_handling: {
      name: "Handling Multiple Objections",
      focus: "Use ARM framework, stay calm, pivot to value"
    },
    close: {
      name: "Closing the Deal",
      focus: "Pull credit, overcome final resistance, get signature"
    }
  };

  const personalities = {
    friendly: "Friendly & Open - Receptive but needs convincing",
    skeptical: "Skeptical & Cautious - Questions everything",
    busy: "Busy & Impatient - Short responses, hurried",
    analytical: "Analytical & Detail-Oriented - Wants data and specs",
    price_focused: "Extremely Price Conscious - Everything about cost",
    hostile: "Resistant & Defensive - Annoyed, dismissive"
  };

  const difficulties = {
    easy: "Easy - 1-2 mild objections, receptive to conversation",
    medium: "Medium - 2-3 objections, needs convincing but reachable",
    hard: "Hard - 3-5+ objections, defensive, very difficult"
  };

  const generatePrompt = () => {
    const scenario = scenarios[selectedScenario];
    const personality = selectedPersonality;
    const difficulty = selectedDifficulty;

    return `You are a homeowner being approached by a solar sales rep. I will be practicing my solar sales pitch with you.

**YOUR ROLE:**
- Personality: ${personalities[personality]}
- Scenario: ${scenario.name}
- Difficulty Level: ${difficulties[difficulty]}
- Practice Focus: ${scenario.focus}

**PERSONALITY GUIDELINES:**
${personality === 'friendly' ? '- Be open and conversational, ask genuine questions\n- Show interest but still need convincing\n- Willing to listen and engage' : ''}${personality === 'skeptical' ? '- Question everything, need lots of proof\n- Be cautious about solar companies\n- Ask for references and guarantees' : ''}${personality === 'busy' ? '- Keep responses short (1-2 sentences)\n- Act hurried and impatient\n- Need them to get to the point quickly' : ''}${personality === 'analytical' ? '- Ask for detailed data and specifications\n- Want to see calculations and comparisons\n- Focus on technical aspects and ROI' : ''}${personality === 'price_focused' ? '- Constantly bring up cost concerns\n- Compare to other quotes\n- Focus only on price, not value' : ''}${personality === 'hostile' ? '- Be dismissive and annoyed they knocked\n- Use objections defensively\n- Show reluctance to engage' : ''}

**DIFFICULTY RULES:**
${difficulty === 'easy' ? '- Only 1-2 mild objections throughout conversation\n- Be receptive once they explain value\n- Willing to listen and move forward' : ''}${difficulty === 'medium' ? '- Present 2-3 real objections naturally\n- Need convincing but be reasonable\n- Gradually become more receptive if they handle objections well' : ''}${difficulty === 'hard' ? '- Present 3-5+ strong objections\n- Be defensive and difficult\n- Make them work very hard for every inch of progress' : ''}

**SCENARIO CONTEXT:**
${selectedScenario === 'door_approach' ? 'I just knocked on your door and you answered. React naturally as a homeowner would.' : ''}${selectedScenario === 'qualifying' ? 'We are now discussing your electric bill and I am trying to qualify you for solar.' : ''}${selectedScenario === 'presentation' ? 'I am showing you solar options and savings projections for your home.' : ''}${selectedScenario === 'objection_handling' ? 'You have several concerns about solar and are voicing them to me.' : ''}${selectedScenario === 'close' ? 'I am trying to get you to commit and move forward with solar installation.' : ''}

**IMPORTANT INSTRUCTIONS:**
1. Keep ALL responses SHORT (1-3 sentences maximum) - you're a real homeowner, not giving speeches
2. Use natural, conversational language with occasional filler words ("um", "well", "I mean")
3. Introduce objections naturally based on difficulty level
4. Don't be helpful or leading - make me work for it as a sales rep
5. If I handle objections well using proper frameworks (ARM: Acknowledge, Respond, Move on), gradually become more receptive
6. After 8-12 back-and-forth exchanges, naturally end the conversation with something like "I think I need to think about this" or "Let me discuss with my spouse"
7. Stay in character throughout - BE the homeowner, not an AI explaining what a homeowner would say

**READY?** 
Wait for me to start the conversation as the sales rep. React naturally to whatever I say.`;
  };

  const copyPromptToClipboard = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setRecordingFile(file);
    setUploading(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setRecordingUrl(file_url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload recording. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!title || !recordingUrl) {
      alert("Please provide a title and upload your recording.");
      return;
    }

    const submissionData = {
      title: title,
      scenario_type: scenarios[selectedScenario].name,
      recording_url: recordingUrl,
      self_notes: selfNotes,
      script_used: `External AI: ${selectedPersonality} / ${selectedDifficulty}`,
      partner_name: `AI (${personalities[selectedPersonality].split(' - ')[0]})`,
      external_transcript: transcript
    };

    onSubmit(submissionData);
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-200'}`}>
            1
          </div>
          <span className="text-sm font-medium hidden sm:inline">Choose Scenario</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-slate-200'}`}>
            2
          </div>
          <span className="text-sm font-medium hidden sm:inline">Practice with AI</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-slate-200'}`}>
            3
          </div>
          <span className="text-sm font-medium hidden sm:inline">Submit Recording</span>
        </div>
      </div>

      {/* Step 1: Choose Scenario */}
      {step === 1 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Step 1: Choose Your Roleplay Scenario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Scenario Type</Label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(scenarios).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600 mt-1">
                Focus: {scenarios[selectedScenario].focus}
              </p>
            </div>

            <div>
              <Label>Customer Personality</Label>
              <Select value={selectedPersonality} onValueChange={setSelectedPersonality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(personalities).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty Level</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(difficulties).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700"
              size="lg"
            >
              Continue to Prompt
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Get Prompt & Practice */}
      {step === 2 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Step 2: Copy Prompt & Practice with Your Favorite AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Configuration */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {scenarios[selectedScenario].name}
              </Badge>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                {personalities[selectedPersonality].split(' - ')[0]}
              </Badge>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                {difficulties[selectedDifficulty].split(' - ')[0]}
              </Badge>
            </div>

            {/* Prompt Display */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">AI Prompt Template</Label>
                <Button
                  onClick={copyPromptToClipboard}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm font-mono max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{generatePrompt()}</pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                How to Use This Prompt:
              </h4>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Copy the prompt above using the button</li>
                <li>Open your preferred AI (ChatGPT with Voice, Claude, Gemini, etc.)</li>
                <li>Paste the prompt to set up the roleplay</li>
                <li>Start the conversation as if you just knocked on their door</li>
                <li>Practice your pitch for 8-12 exchanges</li>
                <li>Record the audio (use your phone's voice recorder or screen recording)</li>
                <li>Return here to submit your recording</li>
              </ol>
            </div>

            {/* Recommended AI Platforms */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Recommended AI Platforms:</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a 
                  href="https://chat.openai.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">ChatGPT Voice</div>
                    <div className="text-xs text-slate-600">Best voice quality</div>
                  </div>
                </a>
                <a 
                  href="https://claude.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">Claude</div>
                    <div className="text-xs text-slate-600">Great for complex scenarios</div>
                  </div>
                </a>
                <a 
                  href="https://gemini.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">Gemini</div>
                    <div className="text-xs text-slate-600">Good alternative</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(1)} 
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700"
                size="lg"
              >
                I've Practiced - Submit Recording
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Submit Recording */}
      {step === 3 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              Step 3: Submit Your Roleplay Recording
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Roleplay Title</Label>
              <Input
                id="title"
                placeholder="e.g., Skeptical homeowner - Door approach"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="recording">Upload Recording (Required)</Label>
              <div className="mt-2">
                <Input
                  id="recording"
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Uploading...
                  </p>
                )}
                {recordingUrl && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Recording uploaded successfully
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Upload the audio or video recording of your practice session
              </p>
            </div>

            <div>
              <Label htmlFor="transcript">Conversation Transcript (Optional)</Label>
              <Textarea
                id="transcript"
                placeholder="Paste the full conversation transcript from your AI chat..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={8}
              />
              <p className="text-xs text-slate-600 mt-1">
                Copy/paste the conversation from your AI platform for better feedback
              </p>
            </div>

            <div>
              <Label htmlFor="selfNotes">Your Self-Assessment</Label>
              <Textarea
                id="selfNotes"
                placeholder="How do you think it went? What did you struggle with? What felt natural?"
                value={selfNotes}
                onChange={(e) => setSelfNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => setStep(2)} 
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!title || !recordingUrl || isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit for Coach Review
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}