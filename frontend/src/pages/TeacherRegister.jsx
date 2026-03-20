import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserCheck,
  Mail,
  Lock,
  Building2,
  User,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Cpu
} from "lucide-react";

export default function TeacherRegister() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:5000/register", {
        ...form,
        role: "teacher"
      });

      const res = await axios.post("http://127.0.0.1:5000/login", {
        email: form.email,
        password: form.password
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      nav("/teacher");

    } catch (err) {
      setError("Registration failed. Please ensure you are using an authorized institutional email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080b] flex flex-col items-center justify-center p-6 font-sans overflow-hidden relative selection:bg-indigo-500/30 selection:text-white">

      {/* Background Mesh Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* HEADER / NAVIGATION */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl flex justify-between items-center mb-8 relative z-10"
      >
        <button
          onClick={() => nav("/login")}
          className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Login
        </button>
        <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">Faculty Access</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/50 w-full max-w-xl rounded-[32px] overflow-hidden relative z-10"
      >
        <div className="p-10">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black tracking-tight bg-clip-text bg-gradient-to-b from-white to-slate-200 text-transparent mb-2">Faculty Registration</h2>
            <p className="text-slate-400 text-xs font-medium">Create your educator account to manage project workflows.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-8">
              <AlertCircle className="w-4 h-4" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="space-y-5">

            {/* FULL NAME */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition" />
                <input
                  className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all font-medium text-sm text-white placeholder:text-slate-600"
                  placeholder="e.g. Prof. Archana Salaskar"
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Faculty Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition" />
                <input
                  className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all font-medium text-sm text-white placeholder:text-slate-600"
                  placeholder="name@institution.edu"
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition" />
                <input
                  type="password"
                  className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all font-medium text-sm text-white placeholder:text-slate-600"
                  placeholder="••••••••"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {/* DEPARTMENT SELECT */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">Assigned Department</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select
                  className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-indigo-500 focus:bg-[#0b0e14] text-white font-medium text-sm transition-all appearance-none"
                  onChange={e => setForm({ ...form, department: e.target.value })}
                >
                  <option value="" className="bg-[#0b0e14]">Select Department</option>
                  <option className="bg-[#0b0e14]">Information Technology</option>
                  <option className="bg-[#0b0e14]">Computer Science</option>
                  <option className="bg-[#0b0e14]">AI & Machine Learning</option>
                  <option className="bg-[#0b0e14]">Electronics & Computer Science</option>
                  <option className="bg-[#0b0e14]">Mechatronics</option>
                </select>
              </div>
            </div>

          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={register}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-sm disabled:bg-slate-700 disabled:text-slate-400 transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2 mt-8 group"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Register Faculty Account
                <UserCheck className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </div>

        <div className="bg-white/5 p-5 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Accounts are subject to institutional verification guidelines.
          </p>
        </div>
      </motion.div>
    </div>
  );
}