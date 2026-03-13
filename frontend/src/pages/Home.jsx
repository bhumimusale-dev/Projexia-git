import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Cpu,
  ShieldCheck,
  BarChart3,
  GraduationCap,
  Globe,
  Zap,
  CheckCircle2
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* ================= NAVIGATION: GLASSMORPHISM ================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
        <div className="w-full max-w-7xl bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl px-6 h-16 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-slate-900 p-1.5 rounded-lg transition-all group-hover:bg-indigo-600">
              <Cpu className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-900 uppercase">
              Projexia
            </span>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
              <a href="#vision" className="hover:text-slate-900 transition">Our Vision</a>
              <a href="#features" className="hover:text-slate-900 transition">Technology</a>
            </nav>
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register/student")}
              className="hidden md:block bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition shadow-lg shadow-slate-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO: MINIMALIST & BOLD ================= */}
      <main className="pt-32">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Institutional Innovation Hub</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95] mb-10 text-slate-900">
            Intelligence for <br />
            <span className="text-slate-400">Academic Research.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed mb-12">
            Projexia streamlines project management through ML-based similarity detection,
            helping institutions foster original innovation and structured evaluation.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={() => navigate("/register/student")}
              className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
            >
              Student Portal <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/register/teacher")}
              className="bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-sm"
            >
              Faculty Access
            </button>
          </div>
        </section>

        {/* ================= BENTO GRID FEATURES ================= */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* LARGE BENTO CARD */}
            <div className="md:col-span-8 bg-slate-50 rounded-[32px] p-10 flex flex-col justify-between border border-slate-100 overflow-hidden relative group">
              <div className="max-w-md relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  <Search className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Similarity Analysis</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Automatically compare project titles against historical records using NLP to ensure
                  uniqueness and reduce manual verification.
                </p>
              </div>
              <div className="absolute top-10 right-[-50px] opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="w-80 h-80 text-indigo-600" />
              </div>
            </div>

            {/* SMALL BENTO CARD */}
            <div className="md:col-span-4 bg-indigo-600 rounded-[32px] p-10 text-white flex flex-col justify-between shadow-xl shadow-indigo-100">
              <Globe className="w-10 h-10 mb-6 opacity-80" />
              <div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight leading-tight">SDG 4 Compliance</h3>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                  Driving quality education through data-driven academic planning and originality.
                </p>
              </div>
            </div>

            {/* BOTTOM CARDS */}
            <div className="md:col-span-4 bg-white border border-slate-200 rounded-[32px] p-8 hover:border-indigo-200 transition-colors">
              <ShieldCheck className="text-slate-900 w-8 h-8 mb-6" />
              <h4 className="text-xl font-bold mb-2">Automated Verification</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Streamlining the approval workflow for faculty members with real-time duplication flags.
              </p>
            </div>

            <div className="md:col-span-4 bg-white border border-slate-200 rounded-[32px] p-8 hover:border-indigo-200 transition-colors">
              <Zap className="text-slate-900 w-8 h-8 mb-6" />
              <h4 className="text-xl font-bold mb-2">Smart Recommender</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Personalized suggestions based on domain trends and past project success metrics.
              </p>
            </div>

            <div className="md:col-span-4 bg-white border border-slate-200 rounded-[32px] p-8 hover:border-indigo-200 transition-colors">
              <GraduationCap className="text-slate-900 w-8 h-8 mb-6" />
              <h4 className="text-xl font-bold mb-2">Domain Analytics</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Classifying projects into technology stacks like AI, IoT, and Web Development.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded-md">
              <Cpu className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-slate-900">Projexia 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-900 transition">GitHub</a>
            <a href="#" className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-900 transition">Documentation</a>
            <a href="#" className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-900 transition">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}