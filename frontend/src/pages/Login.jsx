import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ChevronRight, Cpu, AlertCircle, ShieldCheck } from "lucide-react";

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

      // System routes based on institutional role defined in DB [cite: 89, 124]
      nav(res.data.user.role === "student" ? "/student" : "/teacher");
    } catch (err) {
      setError("The credentials provided do not match our institutional records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">

      {/* LEFT SIDE: BRANDING & SYSTEM INFO */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />

        <div className="relative z-10 flex items-center gap-2 cursor-pointer" onClick={() => nav("/")}>
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase">Projexia</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tight leading-tight mb-6">
            Advancing Research <br />
            Integrity with ML.
          </h2>
          <p className="text-slate-400 max-w-sm leading-relaxed font-medium">
            Centralized platform for project analytics, similarity detection, and automated faculty workflows[cite: 56, 89].
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">
          <ShieldCheck className="w-4 h-4" />
          Secure Institutional Access
        </div>
      </div>

      {/* RIGHT SIDE: UNIFIED LOGIN FORM */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fafafa]">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Portal Login</h1>
            <p className="text-slate-500 font-medium">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 text-sm p-4 rounded-2xl mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="email"
                className="w-full bg-white border border-slate-200 p-4 pl-12 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                placeholder="Institutional Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="password"
                className="w-full bg-white border border-slate-200 p-4 pl-12 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              onClick={login}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-600 disabled:bg-slate-400 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
            >
              {loading ? "Authenticating..." : "Sign In"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* DUAL REGISTRATION PATHS */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">New to Projexia?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => nav("/register/student")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <span className="text-sm font-bold text-slate-900">Student</span>
                <span className="text-[10px] text-slate-400 uppercase font-black group-hover:text-indigo-600">Register</span>
              </button>
              <button
                onClick={() => nav("/register/teacher")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <span className="text-sm font-bold text-slate-900">Faculty</span>
                <span className="text-[10px] text-slate-400 uppercase font-black group-hover:text-indigo-600">Register</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}