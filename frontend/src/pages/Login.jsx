import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight, Cpu, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        email,
        password
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      nav(res.data.user.role === "admin" ? "/admin" : res.data.user.role === "student" ? "/student" : "/teacher");
    } catch (err) {
      setError("The credentials provided do not match our institutional records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080b] flex items-center justify-center font-sans p-6 overflow-hidden relative selection:bg-indigo-500/30 selection:text-white">
      
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/5 p-8 rounded-[32px] shadow-2xl shadow-black relative z-10"
      >
        {/* Header LOGO */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => nav("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <Cpu className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">Projexia</span>
          </motion.div>
          <div className="text-center mt-2">
            <h1 className="text-2xl font-black tracking-tight bg-clip-text bg-gradient-to-b from-white to-slate-300 text-transparent">Portal Login</h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Enter your institutional credentials securely.</p>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold">{error}</span>
          </motion.div>
        )}

        {/* INPUTS */}
        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="email"
              className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all font-medium text-sm text-white placeholder:text-slate-600"
              placeholder="Institutional Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="password"
              className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all font-medium text-sm text-white placeholder:text-slate-600"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={login}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm disabled:bg-slate-700 disabled:text-slate-400 transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2 group mt-6"
          >
            {loading ? "Authenticating..." : "Sign In"}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {/* METRICS / FOOTER SUPPORT inside form card */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3 text-indigo-400" /> Secure Institutional Access Node
        </div>

        {/* DUAL REGISTRATION PATHS */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 text-center">New to Projexia?</p>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.06)" }}
              onClick={() => nav("/register/student")}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/40 transition-all group"
            >
              <span className="text-xs font-bold text-slate-200">Student</span>
              <span className="text-[9px] text-slate-500 uppercase font-black group-hover:text-indigo-400">Register</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.06)" }}
              onClick={() => nav("/register/teacher")}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-indigo-500/40 transition-all group"
            >
              <span className="text-xs font-bold text-slate-200">Faculty</span>
              <span className="text-[9px] text-slate-500 uppercase font-black group-hover:text-indigo-400">Register</span>
            </motion.button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}