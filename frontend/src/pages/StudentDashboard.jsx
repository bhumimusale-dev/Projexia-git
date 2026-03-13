import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  LayoutDashboard,
  Zap,
  BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token) nav("/login");
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/student/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const submit = async () => {
    if (!title || !description) return;
    setIsSubmitting(true);
    try {
      await axios.post(
        "http://127.0.0.1:5000/student/submit",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDescription("");
      fetchProjects();
    } catch (err) {
      console.error("Submission error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6 hidden lg:flex">
        <div className="flex items-center gap-2 mb-10">
          <Zap className="text-indigo-400 w-6 h-6 fill-indigo-400" />
          <span className="text-xl font-black uppercase tracking-tighter">Projexia</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 bg-indigo-600 p-3 rounded-xl font-bold text-sm transition">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 text-slate-400 hover:text-white p-3 rounded-xl font-bold text-sm transition">
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
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">

        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Dashboard</h1>
            <p className="text-slate-500 font-medium text-sm">Welcome back, {user.name || "Scholar"}</p>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
              {user.name?.charAt(0) || "S"}
            </div>
            <span className="text-sm font-bold text-slate-700">{user.branch || "General"}</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT: SUBMISSION FORM */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm sticky top-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Plus className="text-indigo-600 w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold">New Proposal</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Project Title</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm"
                    placeholder="e.g. ML Based Crop Prediction"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Abstract / Description</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm h-40 resize-none"
                    placeholder="Briefly describe your objectives..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={submit}
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Analyzing..." : "Submit for Verification"}
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: PROJECT LIST */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              My Submissions <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{projects.length}</span>
            </h2>

            {projects.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] p-12 text-center">
                <p className="text-slate-400 font-medium text-sm italic">No projects submitted yet. Use the form to begin.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((p, i) => (
                  <ProjectCard key={i} project={p} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function ProjectCard({ project }) {
  const isPending = project.status?.toLowerCase() === "pending";
  const isSimilarityHigh = (project.plagiarism_percentage || 0) > 30;

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm hover:border-indigo-200 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPending ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
          }`}>
          {project.status || "Reviewing"}
        </span>
        {isPending ? <Clock className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      </div>

      <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-6">
        {project.description}
      </p>

      <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Similarity</p>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isSimilarityHigh ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${project.plagiarism_percentage || 0}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${isSimilarityHigh ? 'text-red-500' : 'text-slate-700'}`}>
              {project.plagiarism_percentage ?? "0"}%
            </span>
          </div>
        </div>

        {isSimilarityHigh && (
          <div className="p-2 bg-red-50 rounded-lg" title="High similarity detected">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}