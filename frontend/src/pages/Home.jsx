import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  Cpu,
  ShieldCheck,
  BarChart3,
  GraduationCap,
  Globe,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Target,
  BookOpen,
  FileText,
  Code,
  Users,
  Award,
  AlertCircle,
  Clock
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06080b] text-white font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      
      {/* Background Mesh Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px]" />
        {/* Dot Grid Layer */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      {/* ================= NAVIGATION: GLOW GLASS ================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-7xl bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-2xl px-6 h-16 flex justify-between items-center shadow-2xl shadow-black/40"
        >
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-indigo-600 p-1.5 rounded-lg transition-all group-hover:scale-110 duration-200">
              <Cpu className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase flex items-center gap-1">
              Projexia <span className="text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-bold tracking-normal lowercase">v2</span>
            </span>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-400">
              <a href="#vision" className="hover:text-white transition">Vision</a>
              <a href="#features" className="hover:text-white transition">Technology</a>
              <a href="#ai-nodes" className="hover:text-white transition">Analytics</a>
            </nav>
            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-bold text-slate-300 hover:text-white transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register/student")}
              className="hidden md:block bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </button>
          </div>
        </motion.div>
      </nav>

      {/* ================= HERO: DYNAMIC & GRAPHIC ================= */}
      <main className="pt-32 relative">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center lg:text-left grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 mx-auto lg:mx-0 h-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
              </span>
              <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                Institutional Innovation Hub <Sparkles className="w-3 h-3 text-indigo-400" />
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8 bg-clip-text bg-gradient-to-b from-white to-slate-400 text-transparent">
              Intelligence for <br />
              <span className="bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 text-transparent">Academic <br className="hidden sm:block"/>Research.</span>
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-lg text-slate-400 font-medium leading-relaxed mb-12">
              A centralized platform that streamlines academic project submissions, enables flawless faculty collaboration, and tracks group progress from inception to final evaluation.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/register/student")}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 group"
              >
                Student Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/register/teacher")}
                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                Faculty Access <ArrowUpRight className="w-4 h-4 " />
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT: MOCKUP AI PANEL */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="hidden lg:block relative"
          >
            <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/10 p-[1px] rounded-3xl backdrop-blur-3xl">
              <div className="bg-[#0b0e14]/90 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Header of Info Card */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="text-indigo-400 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Platform Capabilities</h4>
                      <p className="text-xs text-slate-500 font-medium text-indigo-300/80">Why use Projexia?</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Built for Universities</span>
                  </div>
                </div>

                {/* Info Content - Clean Cards without arbitrary numbers */}
                <div className="space-y-4">
                  {/* Info Block 1 */}
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer group">
                    <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                      <Target className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1">Centralized Project Hub</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        No more scattered emails. Submit documents, track deadlines, and communicate directly in one unified space.
                      </p>
                    </div>
                  </div>

                  {/* Info Block 2 */}
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:bg-white/[0.06] hover:border-green-500/30 transition-all cursor-pointer group">
                    <div className="p-2 bg-green-500/10 rounded-lg shrink-0 group-hover:scale-110 group-hover:bg-green-500/20 transition-all">
                      <ShieldCheck className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1">Authenticity Guaranteed</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Built-in semantic checks ensure that your project topics and code remain unique without historical overlaps.
                      </p>
                    </div>
                  </div>

                  {/* Info Block 3 */}
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all cursor-pointer group">
                    <div className="p-2 bg-blue-500/10 rounded-lg shrink-0 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                      <Award className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1">Confidential Grading</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Faculty review projects across multiple stages securely, keeping preliminary mid-term feedback strictly private.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Ambient Background Glow of Card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 filter blur-3xl -z-10 rounded-full animte-pulse" />
          </motion.div>
        </section>

        {/* ================= BENTO GRID FEATURES ================= */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* LARGE BENTO CARD */}
            <div className="md:col-span-8 bg-gradient-to-br from-white/[0.03] to-transparent rounded-[32px] p-10 flex flex-col justify-between border border-white/5 overflow-hidden relative group backdrop-blur-3xl">
              <div className="max-w-md relative z-10">
                <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/20 rounded-2xl flex items-center justify-center shadow-md mb-6">
                  <Globe className="text-indigo-400 w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Centralized Management</h3>
                <p className="text-slate-400 font-medium leading-relaxed text-base">
                  A unified dashboard for students to submit projects, track their progress, and for faculty to oversee multiple groups seamlessly from one place.
                </p>
              </div>
              <div className="absolute top-10 right-[-50px] opacity-5 group-hover:opacity-10 group-hover:scale-105 transition-all duration-500">
                <BarChart3 className="w-80 h-80 text-white" />
              </div>
            </div>

            {/* SMALL BENTO CARD */}
            <div className="md:col-span-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-10 text-white flex flex-col justify-between shadow-2xl shadow-indigo-600/20 relative group overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />
              <ShieldCheck className="w-10 h-10 mb-6 opacity-80 group-hover:scale-110 transition-transform duration-300 relative z-10" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 tracking-tight leading-tight">Confidential Grading</h3>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                  Secure, multi-stage evaluation matrices ensuring privacy between faculty reviews and final student grades.
                </p>
              </div>
            </div>

            {/* BOTTOM CARDS */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-white/[0.02] border border-white/5 rounded-[32px] p-8 hover:border-indigo-500/40 transition-all backdrop-blur-xl group"
            >
              <CheckCircle2 className="text-indigo-400 w-8 h-8 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold mb-2">Real-time Task Tracking</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Stay on top of project deadlines with built-in task management and dynamic progress bars for every group.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-white/[0.02] border border-white/5 rounded-[32px] p-8 hover:border-indigo-500/40 transition-all backdrop-blur-xl group"
            >
              <Zap className="text-indigo-400 w-8 h-8 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold mb-2">AI Project Ideas</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Stuck brainstorming? Use our built-in AI assistant to generate innovative topics and structure your abstracts.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 bg-white/[0.02] border border-white/5 rounded-[32px] p-8 hover:border-indigo-500/40 transition-all backdrop-blur-xl group"
            >
              <GraduationCap className="text-indigo-400 w-8 h-8 mb-6 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold mb-2">Easy Document Uploads</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Effortlessly upload and manage all required reports, synopses, and presentations organized by review stages.
              </p>
            </motion.div>

          </motion.div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#040608] py-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1 rounded-md">
              <Cpu className="text-white w-4 h-4" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-white">Projexia 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition">GitHub</a>
            <a href="#" className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition">Documentation</a>
            <a href="#" className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}