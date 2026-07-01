import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Zap, Trophy, Users, ArrowRight, Check } from "lucide-react";

export default function Onboarding() {
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("rep");

  const handleFinish = async () => {
    await login({
      full_name: name.trim() || "New Rep",
      team: team.trim() || "Unassigned",
      role,
    });
  };

  const steps = [
    // Step 0: Welcome
    {
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30 mx-auto">
            <Flame className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Welcome to MindVault
            </h1>
            <p className="text-slate-400 text-lg">
              Your sales performance platform.
            </p>
            <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto">
              Train smarter, track your progress, level up your skills, and
              close more deals. Built for door-to-door pros who want to be the best.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto pt-4">
            <div className="text-center">
              <Zap className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Earn XP</p>
            </div>
            <div className="text-center">
              <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Level Up</p>
            </div>
            <div className="text-center">
              <Flame className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Build Streaks</p>
            </div>
          </div>
          <Button
            onClick={() => setStep(1)}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg shadow-orange-500/30"
          >
            Let's Go
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      ),
    },
    // Step 1: Name + Team
    {
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Users className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white">Tell us about you</h2>
            <p className="text-slate-400 mt-1">
              So we can personalize your experience
            </p>
          </div>
          <div className="space-y-4 max-w-sm mx-auto">
            <div>
              <Label htmlFor="name" className="text-slate-300 font-medium">
                Your Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Bob Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="team" className="text-slate-300 font-medium">
                Team Name
              </Label>
              <Input
                id="team"
                placeholder="e.g. WolfPack Atlanta"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => setStep(0)}
              className="text-slate-400 hover:text-white"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep(2)}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              disabled={!name.trim()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ),
    },
    // Step 2: Role + Confirm
    {
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white">Your Role</h2>
            <p className="text-slate-400 mt-1">This unlocks different features</p>
          </div>
          <div className="space-y-3 max-w-sm mx-auto">
            <button
              onClick={() => setRole("rep")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                role === "rep"
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Sales Rep</p>
                  <p className="text-xs text-slate-400">
                    Training, field logs, practice, objections
                  </p>
                </div>
                {role === "rep" && <Check className="w-5 h-5 text-amber-500" />}
              </div>
            </button>
            <button
              onClick={() => setRole("coach")}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                role === "coach"
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Coach / Team Lead</p>
                  <p className="text-xs text-slate-400">
                    Everything reps get + review and analytics
                  </p>
                </div>
                {role === "coach" && <Check className="w-5 h-5 text-amber-500" />}
              </div>
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              className="text-slate-400 hover:text-white"
            >
              Back
            </Button>
            <Button
              onClick={handleFinish}
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold"
            >
              <Check className="w-4 h-4 mr-2" />
              Start Training
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-amber-500"
                  : i < step
                  ? "w-2 bg-amber-700"
                  : "w-2 bg-slate-700"
              }`}
            />
          ))}
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          {steps[step].content}
        </div>
        <p className="text-center text-slate-600 text-xs mt-6">
          MindVault Sales Performance Platform
        </p>
      </div>
    </div>
  );
}
