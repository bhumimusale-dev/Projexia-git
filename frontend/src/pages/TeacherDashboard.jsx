import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckCircle,
  XCircle,
  Search,
  LogOut,
  User,
  ShieldAlert,
  FileText,
  RefreshCw,
  Layout
} from "lucide-react";

export default function TeacherDashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, domains: {} });
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [view, setView] = useState("submissions");

  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [projRes, statsRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/teacher/projects", config),
        axios.get("http://127.0.0.1:5000/teacher/analytics", config)
      ]);
      setProjects(projRes.data || []);
      setStats(statsRes.data || { total: 0, approved: 0, pending: 0, rejected: 0, domains: {} });
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      nav("/login");
    } else {
      fetchData();
    }
  }, [token, nav, fetchData]);

  const updateStatus = async (title, status) => {
    try {
      await axios.post(
        "http://127.0.0.1:5000/teacher/update-status",
        { title, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (status === "rejected") {
        setProjects(prev => prev.filter(p => p.title !== title));
        alert("Project Rejected: Removed from institutional records.");
      } else {
        alert(`Project ${status} successfully.`);
      }

      fetchData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const analyze = async (title) => {
    setAnalyzingId(title);
    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/teacher/analyze-plagiarism",
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`ML Analysis Complete: ${res.data.similarity}% Similarity detected.`);
      fetchData();
    } catch (err) {
      alert("ML Analysis engine error");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <aside className="w-72 bg-slate-900 text-white p-8 hidden lg:flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">Projexia</span>
        </div>

        <nav className="space-y-4 flex-1">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Management</div>
          <SidebarButton active={view === 'submissions'} onClick={() => setView("submissions")} icon={<FileText />} label="Submissions" />
          <SidebarButton active={view === 'analytics'} onClick={() => setView("analytics")} icon={<Layout />} label="Domain Trends" />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-4 text-slate-500 hover:text-red-400 p-4 font-bold text-sm transition mt-auto border-t border-white/5 pt-8">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {view === "submissions" ? "Faculty Evaluation Portal" : "Institutional Analytics"}
            </h1>
            <p className="text-slate-500 font-medium italic">Streamlining academic integrity via Machine Learning.</p>
          </div>
          <div className="bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold uppercase">
              {user.name?.charAt(0) || "P"}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">{user.name || "Professor"}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.department || "Faculty"}</p>
            </div>
          </div>
        </header>

        {view === "submissions" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <MetricCard label="Total Submissions" value={stats.total} icon={<FileText />} color="text-indigo-600" />
              <MetricCard label="Pending Review" value={stats.pending} icon={<RefreshCw />} color="text-amber-500" />
              <MetricCard label="Integrity Flags" value={projects.filter(p => p.plagiarism_percentage > 30).length} icon={<ShieldAlert />} color="text-red-500" />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Applications</h2>
                <button onClick={fetchData} className="text-indigo-600 font-bold text-xs flex items-center gap-2 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Sync Data
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-20 text-center">
                  <p className="text-slate-400 font-medium italic">No pending project applications found.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {projects.map((p, i) => (
                    <ProjectRow
                      key={i}
                      project={p}
                      onApprove={() => updateStatus(p.title, "approved")}
                      onReject={() => updateStatus(p.title, "rejected")}
                      onAnalyze={() => analyze(p.title)}
                      isAnalyzing={analyzingId === p.title}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <AnalyticsView stats={stats} />
        )}
      </main>
    </div>
  );
}

function SidebarButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      {icon} {label}
    </button>
  );
}

function MetricCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
      <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center ${color} shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function ProjectRow({ project, onApprove, onReject, onAnalyze, isAnalyzing }) {
  const isHighSimilarity = project.plagiarism_percentage > 30;
  return (
    <div className="bg-white border border-slate-200 p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
      <div className="flex flex-col lg:flex-row justify-between gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${project.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              {project.status || "Pending Review"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Student: {project.student_name}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
          <p className="text-slate-500 text-sm italic">"{project.description}"</p>
        </div>
        <div className="flex flex-row lg:flex-col justify-between items-end lg:pl-10 min-w-[200px]">
          <div className="text-right mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Similarity Index</p>
            <p className={`text-3xl font-black ${isHighSimilarity ? 'text-red-600' : 'text-slate-900'}`}>
              {project.plagiarism_percentage ?? "--"}%
            </p>
          </div>
          <div className="flex gap-2">
            <ActionButton onClick={onApprove} color="bg-emerald-50 text-emerald-600 hover:bg-emerald-600" icon={<CheckCircle />} />
            <ActionButton onClick={onReject} color="bg-red-50 text-red-600 hover:bg-red-600" icon={<XCircle />} />
            <button onClick={onAnalyze} disabled={isAnalyzing} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg">
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isAnalyzing ? "Processing" : "ML Analyze"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, color, icon }) {
  return (
    <button onClick={onClick} className={`p-3 ${color} rounded-xl hover:text-white transition-all shadow-sm`}>
      {icon}
    </button>
  );
}

function AnalyticsView({ stats }) {
  const domains = stats.domains || {};
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-sm">
        <h3 className="text-lg font-bold mb-8">Project Domain Distribution</h3>
        <div className="space-y-4">
          {Object.entries(domains).map(([domain, count]) => (
            <div key={domain}>
              <div className="flex justify-between text-sm font-bold mb-2"><span>{domain}</span><span>{count}</span></div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / (stats.total || 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-indigo-900 text-white p-10 rounded-[40px] shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-4">Innovation Insights</h3>
          <p className="text-indigo-200 text-sm mb-6 font-medium leading-relaxed">Projexia encourages high-quality, non-repetitive topics.</p>
          <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2 font-mono tracking-tighter">SDG 4 Contribution</p>
            <p className="text-xl font-black italic">Quality Education</p>
          </div>
        </div>
        <BarChart3 className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
      </div>
    </div>
  );
}