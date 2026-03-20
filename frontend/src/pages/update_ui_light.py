import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\frontend\src\pages\StudentRecommendations.jsx"

content = """import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-[#f4f7f9] flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 hidden lg:flex shadow-2xl">
        <div className="flex items-center gap-2 mb-10">
          <Zap className="text-indigo-400 w-6 h-6 fill-indigo-400" />
          <span className="text-xl font-black uppercase tracking-tighter">Projexia</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => nav("/student")} className="w-full flex items-center gap-3 text-slate-400 hover:text-white p-3 rounded-xl font-bold text-sm transition">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 bg-indigo-600 p-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-4 h-4" /> AI Recommendations
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-400 p-3 font-bold text-sm transition mt-auto"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              AI Academic Advisor <Sparkles className="w-5 h-5 text-indigo-500" />
            </h1>
            <p className="text-slate-500 font-medium text-sm">Get intelligent project suggestions or refine your abstracts.</p>
          </div>
          <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-md">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
              {user.name?.charAt(0) || "S"}
            </div>
            <span className="text-sm font-bold text-slate-700">{user.branch || "General"}</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* LEFT: INPUT */}
          <div className="bg-white border border-slate-100 rounded-[28px] p-8 shadow-xl shadow-slate-200/20 h-fit hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="mb-6 flex gap-4 border-b border-slate-100 pb-4">
              <button 
                onClick={() => setMode('ideas')}
                className={`font-bold text-sm transition-colors ${mode === 'ideas' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}
              >
                Project Ideas
              </button>
              <button 
                onClick={() => setMode('refine')}
                className={`font-bold text-sm transition-colors ${mode === 'refine' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}
              >
                Refine Abstract
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                {mode === 'ideas' ? 'What topics interest you?' : 'Paste your rough draft here'}
              </label>
              <textarea
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm h-48 resize-none text-slate-800"
                placeholder={mode === 'ideas' ? "e.g. I am interested in Healthcare and IoT devices..." : "e.g. My project is about making an app that tells you when to water plants using an arduino..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <button
                onClick={askAI}
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group disabled:bg-slate-400"
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
          <div className="bg-indigo-950 text-white rounded-[28px] p-8 shadow-xl shadow-indigo-600/10 relative overflow-hidden min-h-[400px]">
            <div className="relative z-10 h-full flex flex-col">
              <h3 className="font-bold text-indigo-300 text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Output
              </h3>

              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-indigo-300 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="font-bold animate-pulse text-sm uppercase tracking-widest">Generating Insights...</p>
                </div>
              ) : response ? (
                <div className="prose prose-invert prose-headings:text-white prose-p:text-indigo-100 prose-li:text-indigo-100 max-w-none text-sm leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-indigo-500">
                  {response}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-indigo-300 font-medium italic text-center px-10">
                  Describe what you're looking for, and Projexia's ML algorithms will generate academic-grade suggestions.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOCAL RECOMMENDATIONS SECTION */}
        {localRecs.length > 0 && (
          <div className="mt-12 bg-white border border-slate-100 rounded-[28px] p-8 shadow-xl shadow-slate-200/20 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Similar Past Projects (BERT Semantic Match)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localRecs.map((title, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100/50 p-6 rounded-2xl hover:border-indigo-100 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md">
                  <span className="text-xs font-black tracking-widest text-indigo-600 uppercase mb-2 block">Match {idx + 1}</span>
                  <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}"""

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("StudentRecommendations.jsx rewritten and upgraded beautifully.")
