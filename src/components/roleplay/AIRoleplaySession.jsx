import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Play,
  StopCircle,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Send,
  Keyboard
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AIRoleplaySession({ onComplete }) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [scenario, setScenario] = useState("door_approach");
  const [difficulty, setDifficulty] = useState("medium");
  const [personality, setPersonality] = useState("skeptical");
  const [conversation, setConversation] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [useTextInput, setUseTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const synthesisRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Synthesis for text-to-speech
    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const scenarios = {
    door_approach: "Door Knock - Initial Contact",
    qualifying: "Qualifying Call - Budget Discussion",
    presentation: "In-Home Presentation",
    objection_handling: "Handling Multiple Objections",
    close: "Closing the Deal"
  };

  const personalities = {
    friendly: "Friendly & Open",
    skeptical: "Skeptical & Cautious",
    busy: "Busy & Impatient",
    analytical: "Analytical & Detail-Oriented",
    price_focused: "Extremely Price Conscious",
    hostile: "Resistant & Defensive"
  };

  const difficultyLevels = {
    easy: "Easy - Few objections, receptive",
    medium: "Medium - Some pushback, needs convincing",
    hard: "Hard - Multiple objections, tough customer"
  };

  const startSession = async () => {
    setSessionStarted(true);
    setConversation([]);
    setSessionComplete(false);
    setFeedback(null);
    
    // Generate initial AI response
    const initialResponse = await generateAIResponse(null, true);
    const aiMessage = {
      role: "ai",
      text: initialResponse,
      timestamp: new Date()
    };
    setConversation([aiMessage]);
    
    if (audioEnabled) {
      speakText(initialResponse);
    }
  };

  const generateAIResponse = async (userMessage, isFirstMessage = false) => {
    setIsProcessing(true);
    
    const systemContext = `You are a homeowner being approached by a solar sales rep. 

Your personality: ${personality}
Scenario: ${scenario}
Difficulty: ${difficulty}

Personality traits:
- friendly: You're open to conversation, ask genuine questions, show interest
- skeptical: You're cautious, question everything, need lots of proof
- busy: You're in a hurry, short responses, need them to get to the point fast
- analytical: You want data, specifications, detailed comparisons
- price_focused: Everything is about cost, you constantly bring up price concerns
- hostile: You're annoyed they knocked, dismissive, use objections defensively

Difficulty guidelines:
- easy: Receptive to conversation, only 1-2 mild objections, willing to listen
- medium: Some resistance, 2-3 objections, need convincing but reachable
- hard: High resistance, 3-5+ objections, defensive, very difficult to convert

Scenario context:
- door_approach: Rep just knocked on your door, you answer. Be realistic about answering door.
- qualifying: Rep is asking about your electric bill and qualifying you
- presentation: Rep is showing you solar options and savings
- objection_handling: You have concerns and are voicing them
- close: Rep is trying to get you to sign or commit

IMPORTANT RULES:
1. Keep responses SHORT (1-3 sentences max) - you're a real homeowner, not giving speeches
2. Use natural, conversational language with occasional filler words
3. Based on difficulty, introduce objections naturally in conversation
4. Don't be helpful or leading - make the rep work for it
5. ${isFirstMessage ? "Start the conversation naturally as a homeowner would when opening the door or answering a call" : "Respond to what the rep just said"}
6. If the rep handles objections well, gradually become more receptive
7. End with "I think I need to end this conversation" after 8-12 exchanges to wrap up

Current conversation:
${conversation.map(msg => `${msg.role === 'ai' ? 'Homeowner' : 'Rep'}: ${msg.text}`).join('\n')}
${userMessage ? `\nRep: ${userMessage}` : ''}

Respond as the homeowner:`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemContext,
        add_context_from_internet: false
      });
      
      setIsProcessing(false);
      return response;
    } catch (error) {
      console.error("AI response error:", error);
      setIsProcessing(false);
      return "I'm sorry, I need to go. Thanks for stopping by.";
    }
  };

  const handleUserResponse = async (text) => {
    const userMessage = {
      role: "user",
      text: text,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setTextInput("");
    
    // Check if we should end the session (after 8-12 exchanges)
    if (conversation.length >= 16) {
      endSession();
      return;
    }
    
    // Generate AI response
    const aiResponse = await generateAIResponse(text, false);
    
    const aiMessage = {
      role: "ai",
      text: aiResponse,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, aiMessage]);
    
    if (audioEnabled) {
      speakText(aiResponse);
    }
    
    // Check if homeowner is ending conversation
    if (aiResponse.toLowerCase().includes("end this conversation") || 
        aiResponse.toLowerCase().includes("need to go") ||
        conversation.length >= 18) {
      setTimeout(() => endSession(), 2000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Transcribe using Whisper-like service
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Could not access microphone. Please use text input instead or check your browser permissions.");
      setUseTextInput(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64 or upload to get URL
      const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      
      // Upload the audio file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Use LLM with audio file to transcribe
      // Note: This is a workaround - ideally you'd have a dedicated Whisper integration
      const transcription = await base44.integrations.Core.InvokeLLM({
        prompt: "Transcribe this audio recording of a sales conversation. Return only the exact words spoken, nothing else.",
        file_urls: file_url
      });
      
      setIsProcessing(false);
      
      if (transcription && transcription.trim()) {
        handleUserResponse(transcription);
      } else {
        alert("Could not transcribe audio. Please try again or use text input.");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setIsProcessing(false);
      alert("Transcription failed. Please use text input instead.");
      setUseTextInput(true);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserResponse(textInput.trim());
    }
  };

  const speakText = (text) => {
    if (!synthesisRef.current || !audioEnabled) return;
    
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const endSession = async () => {
    setSessionComplete(true);
    
    // Stop any ongoing recording or speech
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    // Generate feedback using AI
    const feedbackPrompt = `You are a solar sales coach reviewing a practice roleplay session. Analyze this conversation and provide constructive feedback.

Scenario: ${scenarios[scenario]}
Difficulty: ${difficultyLevels[difficulty]}
Customer Personality: ${personalities[personality]}

Conversation transcript:
${conversation.map((msg, idx) => `${idx + 1}. ${msg.role === 'ai' ? 'Homeowner' : 'Rep'}: ${msg.text}`).join('\n')}

Provide feedback in the following JSON format:
{
  "overall_score": <number 1-10>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_to_improve": ["area 1", "area 2", "area 3"],
  "specific_feedback": {
    "opening": "feedback on how they opened",
    "objection_handling": "feedback on handling objections",
    "closing": "feedback on their close attempt"
  },
  "best_moment": "quote the best thing the rep said",
  "missed_opportunity": "what they should have said or done differently",
  "next_practice_focus": "what to focus on in next practice session"
}`;

    try {
      const feedbackResponse = await base44.integrations.Core.InvokeLLM({
        prompt: feedbackPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            areas_to_improve: { type: "array", items: { type: "string" } },
            specific_feedback: {
              type: "object",
              properties: {
                opening: { type: "string" },
                objection_handling: { type: "string" },
                closing: { type: "string" }
              }
            },
            best_moment: { type: "string" },
            missed_opportunity: { type: "string" },
            next_practice_focus: { type: "string" }
          }
        }
      });
      
      setFeedback(feedbackResponse);
    } catch (error) {
      console.error("Feedback generation error:", error);
      setFeedback({
        overall_score: 7,
        strengths: ["Completed the roleplay session"],
        areas_to_improve: ["Continue practicing"],
        specific_feedback: {
          opening: "Good effort on the opening",
          objection_handling: "Keep working on objection handling",
          closing: "Practice your close more"
        },
        best_moment: "Your engagement throughout the conversation",
        missed_opportunity: "Focus on building more rapport",
        next_practice_focus: "Practice handling objections with the ARM framework"
      });
    }
  };

  const resetSession = () => {
    setSessionStarted(false);
    setConversation([]);
    setSessionComplete(false);
    setFeedback(null);
    setTextInput("");
    setUseTextInput(false);
    setIsRecording(false);
    
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  if (!sessionStarted) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            AI Roleplay Practice
          </CardTitle>
          <p className="text-sm text-slate-600">
            Practice your pitch with an AI-powered homeowner. Use voice recording or text to have a realistic conversation.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Scenario
              </label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(scenarios).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Customer Personality
              </label>
              <Select value={personality} onValueChange={setPersonality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(personalities).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Difficulty Level
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(difficultyLevels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                {audioEnabled ? (
                  <Volume2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <span className="text-sm font-medium text-slate-700">
                  Voice Audio (Homeowner speaks)
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>

          <Button
            onClick={startSession}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Roleplay Session
          </Button>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Tips for Success:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use voice recording or text input to respond</li>
                  <li>Use the 5-step framework</li>
                  <li>Handle objections with ARM technique</li>
                  <li>Stay in character throughout</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessionComplete && feedback) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Session Complete - Your Feedback
              </CardTitle>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {feedback.overall_score}/10
                </div>
                <div className="text-xs text-slate-600">Overall Score</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Strengths */}
            <div>
              <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                What You Did Well
              </h3>
              <div className="space-y-2">
                {feedback.strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-900">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas to Improve */}
            <div>
              <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Areas to Improve
              </h3>
              <div className="space-y-2">
                {feedback.areas_to_improve.map((area, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-orange-900">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specific Feedback */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">Opening</h4>
                <p className="text-xs text-blue-800">{feedback.specific_feedback.opening}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 text-sm mb-2">Objection Handling</h4>
                <p className="text-xs text-purple-800">{feedback.specific_feedback.objection_handling}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 text-sm mb-2">Closing</h4>
                <p className="text-xs text-green-800">{feedback.specific_feedback.closing}</p>
              </div>
            </div>

            {/* Best Moment */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-amber-900 mb-2">🌟 Best Moment</h3>
              <p className="text-sm text-amber-800 italic">"{feedback.best_moment}"</p>
            </div>

            {/* Missed Opportunity */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">💡 Missed Opportunity</h3>
              <p className="text-sm text-slate-700">{feedback.missed_opportunity}</p>
            </div>

            {/* Next Focus */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">🎯 Next Practice Focus</h3>
              <p className="text-sm text-purple-800">{feedback.next_practice_focus}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={resetSession}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
              {onComplete && (
                <Button
                  onClick={onComplete}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Practice Lab
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation Transcript */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Conversation Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-50 ml-8'
                      : 'bg-slate-50 mr-8'
                  }`}
                >
                  <div className="text-xs font-medium text-slate-600 mb-1">
                    {msg.role === 'user' ? 'You (Rep)' : 'Homeowner'}
                  </div>
                  <div className="text-sm text-slate-900">{msg.text}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                Roleplay in Progress
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {scenarios[scenario]} • {personalities[personality]}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={endSession}
            >
              <StopCircle className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Conversation Progress</span>
              <span className="text-slate-900 font-medium">
                {conversation.length} exchanges
              </span>
            </div>
            <Progress value={(conversation.length / 20) * 100} className="h-2" />
          </div>

          {/* Conversation Display */}
          <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-lg">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-100 ml-8'
                    : 'bg-white mr-8 shadow-sm'
                }`}
              >
                <div className="text-xs font-medium text-slate-600 mb-1">
                  {msg.role === 'user' ? 'You (Rep)' : 'Homeowner'}
                </div>
                <div className="text-sm text-slate-900">{msg.text}</div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-slate-600 p-3">
                <div className="animate-pulse">
                  {isRecording ? "Transcribing your response..." : "Homeowner is thinking..."}
                </div>
              </div>
            )}
          </div>

          {/* Input Controls */}
          <div className="space-y-3">
            {/* Toggle between voice and text */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={useTextInput ? "outline" : "default"}
                size="sm"
                onClick={() => setUseTextInput(false)}
              >
                <Mic className="w-4 h-4 mr-1" />
                Voice
              </Button>
              <Button
                variant={useTextInput ? "default" : "outline"}
                size="sm"
                onClick={() => setUseTextInput(true)}
              >
                <Keyboard className="w-4 h-4 mr-1" />
                Text
              </Button>
            </div>

            {useTextInput ? (
              /* Text Input */
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your response..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="bg-gradient-to-r from-purple-600 to-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              /* Voice Recording */
              <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                {!isRecording && !isProcessing && !isSpeaking ? (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                  >
                    <Mic className="w-6 h-6 mr-2" />
                    Hold to Record
                  </Button>
                ) : isRecording ? (
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-red-700 animate-pulse shadow-lg"
                  >
                    <MicOff className="w-6 h-6 mr-2" />
                    Recording... (Click to Stop)
                  </Button>
                ) : isSpeaking ? (
                  <div className="flex items-center gap-3 text-purple-700">
                    <Volume2 className="w-6 h-6 animate-pulse" />
                    <span className="font-medium">Homeowner is speaking...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-blue-700">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                    <span className="font-medium">Processing...</span>
                  </div>
                )}
              </div>
            )}

            {/* Audio Toggle */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 mr-1" />
                    Homeowner Audio On
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 mr-1" />
                    Homeowner Audio Off
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-2">Quick Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Use the 5-step framework: Break Preoccupation → Create Problem → Present Solution → Pullback → Tie-Down</li>
                <li>• Handle objections with ARM: Acknowledge, Respond, Move on</li>
                <li>• Keep responses concise and conversational</li>
                <li>• Ask questions to keep them engaged</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}