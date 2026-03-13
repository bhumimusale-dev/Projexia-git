import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  Mail,
  Lock,
  Building2,
  User,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ShieldCheck
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
      // Step 1: Register teacher account with specialized role
      await axios.post("http://127.0.0.1:5000/register", {
        ...form,
        role: "teacher"
      });

      // Step 2: Establish session
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 font-sans">

      {/* HEADER / NAVIGATION */}
      <div className="w-full max-w-xl flex justify-between items-center mb-8">
        <button
          onClick={() => nav("/login")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Login
        </button>
        <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-widest">Faculty Access</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-2xl shadow-slate-200/60 w-full max-w-xl rounded-[32px] overflow-hidden">
        <div className="p-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Faculty Registration</h2>
            <p className="text-slate-500 font-medium">Create your educator account to manage project workflows.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 text-sm p-4 rounded-2xl mb-8">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <div className="space-y-6">

            {/* FULL NAME */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition" />
                <input
                  className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                  placeholder="e.g. Prof. Archana Salaskar"
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">Faculty Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition" />
                <input
                  className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                  placeholder="name@institution.edu"
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition" />
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                  placeholder="••••••••"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {/* DEPARTMENT SELECT */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block ml-1">Assigned Department</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 appearance-none font-medium transition-all"
                  onChange={e => setForm({ ...form, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  <option>Information Technology</option>
                  <option>Computer Science</option>
                  <option>AI & Machine Learning</option>
                  <option>Electronics & Computer Science</option>
                  <option>Mechatronics</option>
                </select>
              </div>
            </div>

          </div>

          <button
            disabled={loading}
            onClick={register}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-600 disabled:bg-slate-300 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 mt-10 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Register Faculty Account
                <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Accounts are subject to institutional verification.
          </p>
        </div>
      </div>
    </div>
  );
}