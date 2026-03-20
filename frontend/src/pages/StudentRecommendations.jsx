import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Zap, LayoutDashboard, BookOpen, LogOut, Loader2, Sparkles, Send } from "lucide-react";

export default function StudentRecommendations() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("ideas"); // 'ideas' or 'refine'
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localRecs, setLocalRecs] = useState([]);

  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token) nav("/login");
    if (user.role !== "student") nav("/login");
  }, [token, nav, user.role]);

  const handleLogout = () => {
    localStorage.clear();
    nav("/login");
  };

  const askAI = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse("");
    setLocalRecs([]);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/student/ai-recommend",
        { prompt, mode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponse(res.data.recommendation);

      // Fetch Local BERT recommendations
      try {
        const lres = await axios.post(
          "http://127.0.0.1:5000/student/local-recommend",
          { interest_tags: prompt },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (lres.data.recommendations) {
          setLocalRecs(lres.data.recommendations);
        }
      } catch (l_err) {
        console.error("Local recommendations error:", l_err);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 503) {
        setResponse("AI Features are currently disabled dynamically across the platform. (Missing API Key)");
      } else {
        setResponse("Error: Could not fetch recommendations. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex">
      
      {/* SIDEBAR */}
      <aside className="w-68 bg-[#0b0f19] text-white flex flex-col p-6 hidden lg:flex shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
        
        <div className="flex items-center gap-2 mb-10 relative z-10 border-b border-white/5 pb-6">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-600/20">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-black uppercase tracking-tight">Projexia</span>
        </div>

        <nav className="flex-1 space-y-2 relative z-10">
          <button onClick={() => nav("/student")} className="w-full flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 p-3 rounded-xl font-bold text-sm transition">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button className="w-full flex items-center justify-between bg-indigo-600 p-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/30 text-white">
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4" /> AI Recommendations
            </div>
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 p-3 rounded-xl font-bold text-sm transition mt-auto relative z-10"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full relative">
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              AI Academic Advisor <Sparkles className="w-6 h-6 text-indigo-500" />
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">Get intelligent project suggestions or refine your abstracts.</p>
          </div>
          <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-extrabold text-xs">
              {user.name?.charAt(0) || "S"}
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-black text-slate-800">{user.name || "Scholar"}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.branch || "General"}</span>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* LEFT: INPUT */}
          <div className="bg-white border border-slate-200/80 rounded-[30px] p-8 shadow-sm hover:shadow-md transition-all h-fit">
            <div className="mb-6 flex gap-4 border-b border-slate-100 pb-4">
              <button 
                onClick={() => setMode('ideas')}
                className={`font-black text-sm transition-colors ${mode === 'ideas' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-4 -mb-4' : 'text-slate-400 hover:text-slate-900 pb-4 -mb-4'}`}
              >
                Project Ideas
              </button>
              <button 
                onClick={() => setMode('refine')}
                className={`font-black text-sm transition-colors ${mode === 'refine' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-4 -mb-4' : 'text-slate-400 hover:text-slate-900 pb-4 -mb-4'}`}
              >
                Refine Abstract
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-1">
                {mode === 'ideas' ? 'What topics interest you?' : 'Paste your rough draft here'}
              </label>
              <textarea
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100/50 transition-all font-medium text-sm h-48 resize-none text-slate-800 placeholder:text-slate-400"
                placeholder={mode === 'ideas' ? "e.g. I am interested in Healthcare and IoT devices..." : "e.g. My project is about making an app that tells you when to water plants using an arduino..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <button
                onClick={askAI}
                disabled={isLoading}
                className="w-full bg-[#0b0f19] text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group disabled:bg-slate-400 mt-2"
              >
                {isLoading ? (
                  <>Thinking... <Loader2 className="w-4 h-4 animate-spin" /></>
                ) : (
                  <>Ask AI <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: OUTPUT DISPLAY */}
          <div className="bg-[#0b0f19] text-white rounded-[30px] p-8 shadow-xl relative overflow-hidden min-h-[400px] flex flex-col">
            <div className="absolute top-[-40%] right-[-20%] w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10 h-full flex flex-col flex-1">
              <h3 className="font-bold text-indigo-400 text-xs tracking-widest uppercase mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <Sparkles className="w-4 h-4" /> AI Output
              </h3>

              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p className="font-bold animate-pulse text-xs uppercase tracking-widest text-slate-400">Generating Insights...</p>
                </div>
              ) : response ? (
                <div className="prose prose-invert prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 max-w-none text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto pr-2 scrollbar-thin">
                  {response}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 font-medium italic text-sm text-center px-10">
                  Describe what you're looking for, and Projexia's ML algorithms will generate academic-grade suggestions accurately.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOCAL RECOMMENDATIONS SETUP */}
        {localRecs.length > 0 && (
          <div className="mt-10 bg-white border border-slate-200/80 rounded-[30px] p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Similar Historical Projects (BERT Match)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {localRecs.map((title, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                  <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase mb-2 block">Match {idx + 1}</span>
                  <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors text-xs leading-relaxed">{title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}