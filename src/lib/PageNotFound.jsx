import { Link } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { Flame } from "lucide-react";

export default function PageNotFound() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-6">
          <Flame className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-slate-400 mb-6">This page doesn't exist... yet.</p>
        <Link
          to={createPageUrl("Dashboard")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
