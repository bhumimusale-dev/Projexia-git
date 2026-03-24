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
  BookOpen,
  FileText,
  BarChart3,
  Users,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [member1, setMember1] = useState(JSON.parse(localStorage.getItem("user") || "{}").name || "");
  const [member2, setMember2] = useState("");
  const [member3, setMember3] = useState("");
  const [member4, setMember4] = useState("");
  const [batch, setBatch] = useState("");
  const [div, setDiv] = useState("");
  const [year, setYear] = useState("");
  const [projects, setProjects] = useState([]);
  const [calendar, setCalendar] = useState({ synopsis: "", midterm: "", final: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }
    if (user.role !== "student") {
      nav(user.role === "teacher" ? "/teacher" : "/login");
      return;
    }
    fetchProjects();
    fetchCalendar();
  }, [token, nav, user.role]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/student/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const fetchCalendar = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/calendar");
      setCalendar(res.data || { synopsis: "", midterm: "", final: "" });
    } catch (err) { console.error("Fetch calendar error", err); }
  };

  const isGroupValid = member1.trim() && member2.trim() && member3.trim() && member4.trim();
  const isMetaValid = batch.trim() && div.trim() && year.trim();

  const submit = async () => {
    if (!title || !description || !isGroupValid || !isMetaValid) return;
    setIsSubmitting(true);
    try {
      await axios.post(
        "http://127.0.0.1:5000/student/submit",
        { title, description, batch, div, year, group_members: [member1, member2, member3, member4] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDescription("");
      setBatch("");
      setDiv("");
      setYear("");
      setMember2("");
      setMember3("");
      setMember4("");
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.msg || "Submission error");
      console.error("Submission error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTask = async (projectTitle, task) => {
    if (!task.trim()) return;
    try {
      await axios.post("http://127.0.0.1:5000/student/add-task", 
        { title: projectTitle, task: task },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProjects();
    } catch (err) { console.error("Add task error", err); }
  };

  const handleToggleTask = async (projectTitle, task, completed) => {
    try {
      await axios.post("http://127.0.0.1:5000/student/toggle-task", 
        { title: projectTitle, task: task, completed: completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProjects();
    } catch (err) { console.error("Toggle task error", err); }
  };

  const handleFileUpload = async (projectTitle, fileType, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", projectTitle);
    formData.append("type", fileType);

    try {
      await axios.post("http://127.0.0.1:5000/student/upload-document", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        }
      });
      alert(`${fileType.toUpperCase()} Uploaded Successfully`);
      fetchProjects();
    } catch (err) { alert("Upload failed. Verify 5MB PDF format constraints."); }
  };

  const handleLogout = () => {
    localStorage.clear();
    nav("/login");
  };

  const approvedCount = projects.filter(p => (p.status || "").toLowerCase() === "approved").length;
  const pendingCount = projects.filter(p => (p.status || "").toLowerCase() !== "approved").length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#09090b] text-white flex flex-col p-6 hidden lg:flex relative overflow-hidden shrink-0 border-r border-slate-800">
        <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Projexia</span>
        </div>

        <nav className="flex-1 space-y-3 relative z-10">
          <button className="w-full flex items-center gap-3 bg-gradient-to-r from-indigo-500/20 to-transparent p-3.5 rounded-2xl font-bold text-sm transition-all border border-indigo-500/20 text-indigo-400 group">
            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
            <span className="flex-1 text-left">Dashboard</span>
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          </button>
          
          <button 
            onClick={() => nav("/student/recommendations")} 
            className="w-full flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 p-3.5 rounded-2xl font-semibold text-sm transition-all group"
          >
            <Sparkles className="w-5 h-5 group-hover:text-amber-400 transition-colors" /> 
            <span className="flex-1 text-left">AI Recommendations</span>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </button>
        </nav>

        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-4 mt-auto mb-4 backdrop-blur-md hidden xl:block">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Semester Progress</h4>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 w-[65%]" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Final Submissions approaching in 3 weeks.</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-3.5 rounded-2xl font-semibold text-sm transition-all relative z-10 group mt-auto xl:mt-0"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Logout Pipeline
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto w-full relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        {/* TOP BAR */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user.name || "Scholar"}</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Ready to build something amazing today?</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-1.5 rounded-3xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-inner overflow-hidden relative">
               <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
               {user.name?.charAt(0) || "S"}
            </div>
            <div className="flex flex-col items-start pr-4 leading-none justify-center">
              <span className="text-sm font-black text-slate-800">{user.name || "Scholar"}</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{user.branch || "General Engineering"}</span>
            </div>
          </div>
        </header>

        {/* --- METRICS / QUICK STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stat Card 1 */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 right-[-10px] top-[-10px] transition-opacity">
              <FileText className="w-24 h-24 text-indigo-600" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Submissions</p>
            <div className="flex items-end gap-4 relative z-10">
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{projects.length}</h3>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg mb-1">+ Active</span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 right-[-10px] top-[-10px] transition-opacity">
              <CheckCircle2 className="w-24 h-24 text-emerald-600" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Approved Tracks</p>
            <div className="flex items-end gap-4 relative z-10">
              <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">{approvedCount}</h3>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg mb-1">Cleared</span>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 right-[-10px] top-[-10px] transition-opacity">
              <Clock className="w-24 h-24 text-amber-600" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Pending Approval</p>
            <div className="flex items-end gap-4 relative z-10">
              <h3 className="text-5xl font-black text-amber-600 tracking-tighter">{pendingCount}</h3>
              <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-1">In Queue</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: SUBMISSION FORM */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col gap-6 relative overflow-hidden z-10">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Plus className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">New Proposal</h2>
                  <p className="text-xs font-bold text-slate-400">Launch a new project instance</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Group Member 1 (Lead)</label>
                    <input className="w-full bg-slate-50 border border-slate-200/80 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-semibold text-xs text-slate-800" placeholder="Name & Student ID..." value={member1} onChange={e => setMember1(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Group Member 2</label>
                    <input className="w-full bg-slate-50 border border-slate-200/80 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-semibold text-xs text-slate-800" placeholder="Name & Student ID..." value={member2} onChange={e => setMember2(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Group Member 3</label>
                    <input className="w-full bg-slate-50 border border-slate-200/80 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-semibold text-xs text-slate-800" placeholder="Name & Student ID..." value={member3} onChange={e => setMember3(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Group Member 4</label>
                    <input className="w-full bg-slate-50 border border-slate-200/80 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-semibold text-xs text-slate-800" placeholder="Name & Student ID..." value={member4} onChange={e => setMember4(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Year</label>
                    <input className="w-full bg-slate-50 border border-slate-200/80 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-semibold text-xs text-slate-800" placeholder="SE/TE/BE" value={year} onChange={e => setYear(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Div</label>
                    <input className="w-full bg-slate-50 border border-slate-200/80 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-semibold text-xs text-slate-800" placeholder="e.g. A" value={div} onChange={e => setDiv(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block pl-1">Batch</label>
                    <input className="w-full bg-slate-50 border border-slate-200/80 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-semibold text-xs text-slate-800" placeholder="e.g. B1" value={batch} onChange={e => setBatch(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block pl-1">Project Title</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm text-slate-800 placeholder:text-slate-400"
                    placeholder="e.g. ML Based Crop Prediction..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block pl-1">Abstract / Motivation</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200/80 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-semibold text-sm h-36 resize-none text-slate-800 placeholder:text-slate-400"
                    placeholder="Briefly describe your objectives, architecture, and goals..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={submit}
                  disabled={isSubmitting || !isGroupValid || !isMetaValid}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group mt-4 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(!isGroupValid || !isMetaValid) && <div className="absolute top-1 right-2 text-[8px] font-black text-amber-300 uppercase">Wait! Details Missing</div>}
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? "Processing AI Scan..." : "Submit Proposal"}
                    {!isSubmitting && <Search className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>

            {/* DEADLINES CARD */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <h3 className="font-black text-lg border-b border-indigo-800/50 pb-4 mb-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-400" /> Deliverable Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-300 font-semibold text-xs">Synopsis Phase</span>
                  <span className="font-bold text-white tracking-wide">{calendar.synopsis || "Reviewing"}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-300 font-semibold text-xs">Mid-term Evaluation</span>
                  <span className="font-bold text-white tracking-wide">{calendar.midterm || "Reviewing"}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30">
                  <span className="text-indigo-200 font-bold text-xs">Final Submission</span>
                  <span className="font-black text-white tracking-wide">{calendar.final || "Reviewing"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PROJECT LIST */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            <div className="flex justify-between items-end mb-4 px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                My Workspace 
                <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-black mt-1">{projects.length} Nodes</span>
              </h2>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-xl border border-slate-200 border-dashed rounded-[32px] p-20 text-center shadow-sm flex flex-col items-center justify-center">
                <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <FileText className="text-indigo-500 w-8 h-8" />
                </div>
                <p className="text-slate-800 font-bold text-xl mb-2 tracking-tight">Your workspace is empty.</p>
                <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">Use the proposal form on the left to initialize your first project track. It will be sent to your faculty for review.</p>
              </div>
            ) : (
              <div className="grid 2xl:grid-cols-2 gap-6">
                {projects.map((p, i) => (
                  <ProjectCard key={i} project={p} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onUploadFile={handleFileUpload} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProjectCard({ project, onAddTask, onToggleTask, onUploadFile }) {
  const [newTask, setNewTask] = useState(""); 
  const isPending = project.status?.toLowerCase() === "pending_allocation" || project.status?.toLowerCase() === "pending" || project.status?.toLowerCase() === "allocated";
  const isSimilarityHigh = (project.plagiarism_percentage || 0) > 30;

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddTask(project.title, newTask);
      setNewTask("");
    }
  };

  return (
    <div className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* CARD HEADER */}
      <div className="p-6 pb-5 relative">
        <div className="flex justify-between items-start mb-5 relative z-10">
          <div className="flex flex-col gap-2">
            <span className={`w-max px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isPending ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}>
              {project.status === 'pending_allocation' ? 'Pending Allocation' : project.status || "Reviewing"}
            </span>
            {project.group_id && <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Group {project.group_id}</span>}
          </div>
          {isPending ? (
            <div className="p-2 bg-amber-50 rounded-xl"><Clock className="w-5 h-5 text-amber-500" /></div>
          ) : (
            <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
          )}
        </div>

        <h3 className="font-black text-slate-900 text-xl tracking-tight mb-2 leading-tight pr-4">{project.title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
          {project.description}
        </p>
      </div>

      {/* CARD BODY/LOWER */}
      <div className="p-6 pt-0 mt-auto flex flex-col gap-5 bg-slate-50/50">
        
        {/* ML similarity index row */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mt-4">
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
               ML Plagiarism Index {isSimilarityHigh && <AlertTriangle className="w-3 h-3 text-red-500 inline-block" />}
            </p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isSimilarityHigh ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'}`}
                style={{ width: `${project.plagiarism_percentage || 0}%` }}
              />
            </div>
          </div>
          <span className={`text-xl font-black ml-4 ${isSimilarityHigh ? 'text-red-500' : 'text-slate-800'}`}>
            {project.plagiarism_percentage ?? "0"}%
          </span>
        </div>

        {/* SECURE/APPROVED SECTION */}
        {!isPending && (
          <div className="animate-in fade-in zoom-in duration-300 pt-2">
            
            {/* PROGRESS BAR */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Execution Tracking</p>
                <span className="text-sm font-black text-indigo-600">{project.progress || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out relative" 
                  style={{ width: `${project.progress || 0}%` }} 
                >
                  <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
                </div>
              </div>
            </div>

            {/* CHECKLIST */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Milestone Checklist</p>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
                {(project.tasks || []).length === 0 && <p className="text-xs text-slate-400 italic">No tasks added yet.</p>}
                {(project.tasks || []).map((t, index) => (
                  <label key={index} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group/task">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => onToggleTask(project.title, t.task, !t.completed)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span className={`text-sm font-medium transition-all ${t.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover/task:text-indigo-600'}`}>
                      {t.task}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="flex mt-3 gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Add new milestone..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-400 transition-all text-slate-800"
                />
                <button
                  onClick={handleAdd}
                  disabled={!newTask.trim()}
                  className="bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* UPLOADS */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Document Registry</p>
              <div className="grid grid-cols-1 gap-2">
                <UploadRow label="Synopsis Form" type="synopsis" title={project.title} onUpload={onUploadFile} fileUrl={project.documents?.synopsis} />
                <UploadRow label="Mid-term Report" type="midterm" title={project.title} onUpload={onUploadFile} fileUrl={project.documents?.midterm} />
                <UploadRow label="Final PDF" type="final" title={project.title} onUpload={onUploadFile} fileUrl={project.documents?.final} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadRow({ label, type, title, onUpload, fileUrl }) {
  const isUploaded = !!fileUrl;
  return (
    <div className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isUploaded ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${isUploaded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
          <FileText className="w-4 h-4" />
        </div>
        <span className={`font-bold text-xs ${isUploaded ? 'text-indigo-900' : 'text-slate-600'}`}>{label}</span>
      </div>
      
      <div>
        {isUploaded ? (
          <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-black text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors">
            View File
          </a>
        ) : (
          <label className="text-xs font-bold text-slate-500 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer px-3 py-1.5 rounded-lg transition-colors inline-block">
            Upload
            <input type="file" className="hidden" accept=".pdf,.zip,.rar" onChange={(e) => {
              if (e.target.files[0]) onUpload(title, type, e.target.files[0]);
            }} />
          </label>
        )}
      </div>
    </div>
  );
}
