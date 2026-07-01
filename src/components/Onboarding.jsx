import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Zap, Trophy, Users, ArrowRight, Check, Sparkles, Target, MessageSquare } from "lucide-react";

const roleCards = [
  {
    id: "rep",
    title: "Sales Rep",
    desc: "Training, field logs, practice, objections, streaks.",
  },
  {
    id: "coach",
    title: "Coach / Team Lead",
    desc: "Rep tools plus review queues and performance views.",
  },
];

export default function Onboarding() {
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("rep");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const repName = params.get("repName");
    if (repName && !name) setName(repName);
    if (params.get("source") === "route-blitzer" && !team) setTeam("Atlanta HVAC");
  }, []);

  const handleFinish = async () => {
    await login({
      full_name: name.trim() || "New Rep",
      team: team.trim() || "Atlanta HVAC",
      role,
    });
  };

  return (
    <div className="mv-shell mv-grid-bg min-h-screen overflow-hidden px-5 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.04fr_.96fr]">
        <section className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] shadow-[0_18px_45px_rgba(251,146,60,.25)]">
              <img
                src={import.meta.env.BASE_URL + "mindvault-mascot.png"}
                alt="MindVault mascot"
                className="h-12 w-12 object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300/90">MindVault Studio</p>
              <p className="mt-0.5 text-base font-semibold tracking-tight text-white">Coach · HVAC Sales OS</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm text-slate-300 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,.8)]" />
            Built for Erica’s HVAC D2D team
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-white md:text-7xl">
              Train like the best rep on the team.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-400">
              A fast, game-like sales training cockpit for reps moving from solar into HVAC: practice, log, learn, and build momentum every day.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <img
              src={import.meta.env.BASE_URL + "mindvault-logo.png"}
              alt="MindVault Studio"
              className="h-10 w-auto rounded-md bg-slate-900/40 px-1"
            />
            <div className="text-sm leading-tight text-slate-400">
              Built by <span className="font-semibold text-white">Mind<span className="text-[#c2703e]">Vault</span> Studio</span> · Minneapolis, MN
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Custom AI agents · Managed</div>
            </div>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { icon: Zap, label: "Earn XP", value: "+2 per door" },
              { icon: Trophy, label: "Level Up", value: "100 XP tiers" },
              { icon: Flame, label: "Keep Streaks", value: "Daily motion" },
            ].map((item) => (
              <div key={item.label} className="mv-card-soft rounded-2xl p-4">
                <item.icon className="mb-4 h-5 w-5 text-amber-300" />
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10">
          <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-indigo-500/20 blur-3xl" />
          <div className="mv-card relative rounded-[2rem] p-6 md:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={import.meta.env.BASE_URL + "mindvault-mascot.png"}
                  alt=""
                  className="h-11 w-11 rounded-xl object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Mind<span className="text-[#c2703e]">Vault</span> Coach</p>
                  <p className="text-xs text-slate-500">Takes about 20 seconds</p>
                </div>
              </div>
              <div className="font-mono text-xs text-slate-500">0{step + 1}/03</div>
            </div>

            <div className="mb-8 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full transition-all ${i <= step ? "w-full bg-gradient-to-r from-amber-300 to-orange-400" : "w-0"}`} />
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <Sparkles className="mb-4 h-8 w-8 text-amber-300" />
                  <h2 className="text-3xl font-semibold tracking-tight text-white">Welcome in.</h2>
                  <p className="mt-3 text-slate-400">We’ll tune the app around your name, team, and role, then drop you into the command dashboard.</p>
                </div>
                <div className="grid gap-3">
                  {[
                    { icon: Target, text: "Field activity becomes progress, not paperwork." },
                    { icon: MessageSquare, text: "Practice reps get a clean lab for objections and pitch work." },
                    { icon: Trophy, text: "Coaches get a simple way to see effort and skill-building." },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">
                      <item.icon className="h-4 w-4 text-amber-300" />
                      {item.text}
                    </div>
                  ))}
                </div>
                <Button onClick={() => setStep(1)} size="lg" className="mv-button-primary w-full rounded-xl font-semibold">
                  Start Setup <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Users className="mb-4 h-8 w-8 text-amber-300" />
                  <h2 className="text-3xl font-semibold tracking-tight text-white">Who’s training?</h2>
                  <p className="mt-3 text-slate-400">This keeps the experience personal and makes the dashboard feel owned.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-slate-300">Your Name</Label>
                    <Input id="name" placeholder="e.g. Bob Smith" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-12 rounded-xl" autoFocus />
                  </div>
                  <div>
                    <Label htmlFor="team" className="text-sm font-medium text-slate-300">Team Name</Label>
                    <Input id="team" placeholder="e.g. Atlanta HVAC" value={team} onChange={(e) => setTeam(e.target.value)} className="mt-2 h-12 rounded-xl" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(0)} className="mv-button-ghost flex-1 rounded-xl">Back</Button>
                  <Button onClick={() => setStep(2)} className="mv-button-primary flex-1 rounded-xl" disabled={!name.trim()}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Trophy className="mb-4 h-8 w-8 text-amber-300" />
                  <h2 className="text-3xl font-semibold tracking-tight text-white">Choose your mode.</h2>
                  <p className="mt-3 text-slate-400">You can change this later. Reps get game loops; coaches get the team layer.</p>
                </div>
                <div className="space-y-3">
                  {roleCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setRole(card.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${role === card.id ? "border-amber-300/70 bg-amber-300/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{card.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{card.desc}</p>
                        </div>
                        {role === card.id && <Check className="h-5 w-5 text-amber-300" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(1)} className="mv-button-ghost flex-1 rounded-xl">Back</Button>
                  <Button onClick={handleFinish} className="mv-button-primary flex-1 rounded-xl font-semibold">
                    Enter Coach <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
