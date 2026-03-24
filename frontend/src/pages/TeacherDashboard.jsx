import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Search,
  LogOut,
  User,
  Users,
  ShieldAlert,
  FileText,
  RefreshCw,
  Layout,
  Clock,
  Briefcase,
  AlertTriangle,
  Download,
  Save,
  PenTool,
  Camera
} from "lucide-react";

export default function TeacherDashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, domains: {} });
  const [calendar, setCalendar] = useState({ synopsis: "", midterm: "", final: "" });
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [view, setView] = useState("submissions"); // 'submissions' or 'analytics'
  const [evaluatingProject, setEvaluatingProject] = useState(null);
  const [reviewPhoto, setReviewPhoto] = useState(null);
  const [marks, setMarks] = useState({ review_1: 0, review_2: 0, final_review: 0 });

  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [projRes, statsRes, calRes] = await Promise.all([
        axios.get("http://127.0.0.1:5000/teacher/projects", config),
        axios.get("http://127.0.0.1:5000/teacher/analytics", config),
        axios.get("http://127.0.0.1:5000/calendar")
      ]);
      setProjects(projRes.data || []);
      setStats(statsRes.data || { total: 0, approved: 0, pending: 0, rejected: 0, domains: {} });
      setCalendar(calRes.data || { synopsis: "", midterm: "", final: "" });
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }
    if (user.role !== "teacher") {
      nav(user.role === "student" ? "/student" : "/login");
      return;
    }
    fetchData();
  }, [token, nav, fetchData, user.role]);

  const updateStatus = async (title, status) => {
    try {
      await axios.post(
        "http://127.0.0.1:5000/teacher/update-status",
        { title, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (status === "rejected") {
        setProjects(prev => prev.filter(p => p.title !== title));
      } else {
        fetchData();
      }
    } catch (err) {
      alert("Failed to update status. Allocation limit might be reached.");
    }
  };

  const downloadReport = () => {
    const allProj = projects.filter(p => p.status === 'approved');
    const header = "SR No,Group Number,Student ID,Student Name,Name of Project,Review 1 (25),Review 2 (25),Final (50),Total Score (100)\n";
    let csvRows = [];
    let srNo = 1;

    allProj.forEach(p => {
       const members = p.group_members && p.group_members.length > 0 ? p.group_members : [p.student_name || ""];
       const rev1 = Number(p.evaluations?.review_1) || 0;
       const rev2 = Number(p.evaluations?.review_2) || 0;
       const fin = Number(p.evaluations?.final_review) || 0;
       const total = rev1 + rev2 + fin;

       members.forEach((memberStr, idx) => {
          let name = memberStr;
          let id = "";
          
          if (memberStr.includes('-')) {
             const parts = memberStr.split('-');
             name = parts[0].trim();
             id = parts.slice(1).join('-').trim();
          } else {
             const words = memberStr.split(' ');
             const potentialId = words[words.length - 1];
             if (/\d/.test(potentialId)) {
                id = potentialId;
                name = words.slice(0, -1).join(' ');
             }
          }

          const groupNum = idx === 0 ? (p.group_id || "N/A") : "";
          const projTitle = idx === 0 ? `"${p.title || ""}"` : '""';
          const r1 = rev1;
          const r2 = rev2;
          const f = fin;
          const t = total;

          csvRows.push(`${srNo},${groupNum},${id},${name},${projTitle},${r1},${r2},${f},${t}`);
          srNo++;
       });
    });

    const csv = header + csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Faculty_Evaluation_Report.csv`;
    a.click();
  };

  const saveEvaluations = async () => {
    try {
      if (reviewPhoto) {
        const formData = new FormData();
        formData.append("title", evaluatingProject.title);
        formData.append("evaluations", JSON.stringify(marks));
        formData.append("reviewPhoto", reviewPhoto);
        await axios.post("http://127.0.0.1:5000/teacher/save-evaluations", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("http://127.0.0.1:5000/teacher/save-evaluations", 
          { title: evaluatingProject.title, evaluations: marks },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setEvaluatingProject(null);
      fetchData();
    } catch (err) {
      alert("Failed to save evaluations.");
    }
  };

  const openEvaluationModal = (proj) => {
    if(!proj) return;
    setMarks({
       review_1: proj.evaluations?.review_1 || 0,
       review_2: proj.evaluations?.review_2 || 0,
       final_review: proj.evaluations?.final_review || 0,
    });
    setReviewPhoto(null);
    setEvaluatingProject(proj);
  };

  const analyze = async (title) => {
    setAnalyzingId(title);
    try {
      await axios.post(
        "http://127.0.0.1:5000/teacher/analyze-plagiarism",
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#09090b] text-white flex flex-col p-6 hidden lg:flex shadow-2xl relative overflow-hidden shrink-0 border-r border-slate-800">
        <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-10 relative z-10">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <Briefcase className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ProFaculty</span>
        </div>

        <nav className="space-y-3 flex-1 relative z-10">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 pl-1 mt-4">Management</div>
          
          <button 
            onClick={() => setView("submissions")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all border ${view === 'submissions' ? 'bg-gradient-to-r from-indigo-500/20 to-transparent border-indigo-500/20 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <FileText className="w-5 h-5" /> 
            <span className="flex-1 text-left">Submissions Engine</span>
            {view === 'submissions' && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
          </button>
          
          <button 
            onClick={() => setView("analytics")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all border ${view === 'analytics' ? 'bg-gradient-to-r from-indigo-500/20 to-transparent border-indigo-500/20 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Layout className="w-5 h-5" /> 
            <span className="flex-1 text-left">Domain Trends</span>
             {view === 'analytics' && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-3.5 rounded-2xl font-semibold text-sm transition-all mt-auto z-10 relative"
        >
          <LogOut className="w-5 h-5" /> Terminate Instance
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto w-full relative">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[140px] pointer-events-none -z-10" />

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
             <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
               {view === "submissions" ? "Faculty Evaluation Portal" : "Institutional Analytics"}
             </h1>
             <p className="text-slate-500 font-medium mt-1 italic opacity-80">Streamlining academic integrity via Machine Learning models.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-2 rounded-3xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-inner overflow-hidden relative">
               <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
               {user.name?.charAt(0) || "P"}
            </div>
            <div className="flex flex-col items-start pr-4 leading-none justify-center">
              <span className="text-sm font-black text-slate-800">{user.name || "Professor"}</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{user.department || "Faculty Engineering"}</span>
            </div>
          </div>
        </header>

        {view === "submissions" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <MetricCard label="Submissions" value={projects.length} icon={<FileText className="w-6 h-6 text-indigo-600" />} color="bg-indigo-50 border-indigo-100" />
              <MetricCard label="Pending" value={projects.filter(p => ['pending', 'allocated', 'pending_allocation'].includes(p.status)).length} icon={<RefreshCw className="w-6 h-6 text-amber-600" />} color="bg-amber-50 border-amber-100" />
              <MetricCard 
                label="Allocated Groups" 
                value={`${projects.filter(p => p.status === 'approved').length}/5`} 
                icon={<Users className="w-6 h-6 text-emerald-600" />} 
                color="bg-emerald-50 border-emerald-100" 
              />
              <MetricCard 
                label="Integrity Flags" 
                value={projects.filter(p => p.plagiarism_percentage > 30).length} 
                icon={<ShieldAlert className="w-6 h-6 text-red-600" />} 
                color="bg-red-50 border-red-100" 
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Recent Applications 
                  <span className="bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">Live Tracking</span>
                </h2>
                <div className="flex gap-3">
                  <button 
                    onClick={downloadReport} 
                    className="bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center gap-2 hover:bg-indigo-600 hover:text-white px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> 
                    Export CSV Matrix
                  </button>
                  <button 
                    onClick={fetchData} 
                    className={`bg-white border border-slate-200 text-slate-600 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 hover:text-indigo-600 px-4 py-2.5 rounded-xl transition-all shadow-sm ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> 
                    {loading ? 'Syncing...' : 'Sync Data'}
                  </button>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-xl border border-slate-200 border-dashed rounded-[32px] p-24 text-center shadow-sm flex flex-col items-center justify-center">
                  <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-indigo-100/50 shadow-inner">
                    <FileText className="text-indigo-400 w-8 h-8" />
                  </div>
                  <p className="text-slate-800 font-black text-xl mb-2 tracking-tight">No submissions detected.</p>
                  <p className="text-slate-500 font-medium text-sm">Waiting for incoming student project proposals to drop in.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {projects.map((p, i) => (
                    <ProjectRow
                      key={i}
                      project={p}
                      onApprove={() => updateStatus(p.title, "approved")}
                      onReject={() => {
                        if(window.confirm(`Are you sure you want to REJECT and DELETE project "${p.title}"?`)) {
                           updateStatus(p.title, "rejected");
                        }
                      }}
                      onAnalyze={() => analyze(p.title)}
                      isAnalyzing={analyzingId === p.title}
                      onEvaluate={() => openEvaluationModal(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <AnalyticsView stats={stats} calendar={calendar} />
        )}

      </main>

      {/* CONFIDENTIAL EVALUATION MODAL */}
      {evaluatingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col pt-8 animate-in zoom-in-95 duration-300">
              <div className="px-8 mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><PenTool className="w-3 h-3 text-emerald-500"/> Private Assessment</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{evaluatingProject.title}</h2>
                <p className="text-xs font-bold text-slate-500 mt-2 truncate max-w-sm border-t border-slate-100 pt-2 border-dashed">Team: {(evaluatingProject.group_members||[]).join(', ')}</p>
              </div>

              <div className="px-8 space-y-5 bg-slate-50/50 pb-8 pt-6 border-t border-slate-100 flex-1">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between mb-2">Review 1 Score <span className="text-indigo-500">Max 25</span></label>
                    <input type="number" max="25" min="0" value={marks.review_1} onChange={(e)=>setMarks({...marks, review_1: e.target.value})} className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-indigo-500 font-bold text-lg text-slate-800" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between mb-2">Review 2 Score <span className="text-indigo-500">Max 25</span></label>
                    <input type="number" max="25" min="0" value={marks.review_2} onChange={(e)=>setMarks({...marks, review_2: e.target.value})} className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-indigo-500 font-bold text-lg text-slate-800" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between mb-2">Final Review Score <span className="text-indigo-500">Max 50</span></label>
                    <input type="number" max="50" min="0" value={marks.final_review} onChange={(e)=>setMarks({...marks, final_review: e.target.value})} className="w-full bg-white border border-slate-200 p-4 rounded-xl outline-none focus:border-indigo-500 font-bold text-lg text-slate-800" />
                 </div>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-2">
                    <span className="text-sm font-black text-slate-500">Total Calculation:</span>
                    <span className="text-2xl font-black text-indigo-600">{Number(marks.review_1) + Number(marks.review_2) + Number(marks.final_review)}/100</span>
                 </div>

                 <div className="pt-2 border-t border-slate-200/60 mt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center mb-2 gap-1.5 cursor-pointer hover:text-indigo-500 transition-colors">
                      <Camera className="w-3.5 h-3.5" /> Attach Review Photo Evidence
                      <input type="file" className="hidden" accept="image/*" onChange={e => setReviewPhoto(e.target.files[0])} />
                    </label>
                    {reviewPhoto && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100/50 truncate">Attached: {reviewPhoto.name}</div>}
                    {!reviewPhoto && evaluatingProject.evaluations?.photo && (
                       <a href={evaluatingProject.evaluations.photo} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-500 underline">View previously uploaded photo</a>
                    )}
                 </div>
              </div>

              <div className="flex border-t border-emerald-100">
                 <button onClick={() => setEvaluatingProject(null)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Abort</button>
                 <button onClick={saveEvaluations} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-inner"><Save className="w-4 h-4" /> Save Record</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-200/80 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className={`absolute top-[-20%] right-[-10%] w-20 h-20 rounded-full blur-[40px] opacity-20 transition-opacity group-hover:opacity-40 pointer-events-none ${color.split(' ')[0]}`} />
      
      <div className="flex items-center gap-4 mb-3">
        <div className={`p-3 rounded-2xl flex items-center justify-center shadow-inner border ${color}`}>
          {icon}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">{label}</p>
      </div>
      <div>
        <p className="text-4xl font-black text-slate-900 tracking-tighter ml-1">{value}</p>
      </div>
    </div>
  );
}

function ProjectRow({ project, onApprove, onReject, onAnalyze, isAnalyzing, onEvaluate }) {
  const isPending = ['pending', 'allocated', 'pending_allocation'].includes(project.status);
  const isHighSimilarity = (project.plagiarism_percentage || 0) > 30;

  return (
    <div className={`bg-white border rounded-[32px] p-6 md:p-8 transition-all duration-300 group shadow-sm hover:shadow-xl ${isPending ? 'border-slate-200/80 hover:border-indigo-300' : 'border-slate-200/50 opacity-90'}`}>
      <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: Data & Details */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${isPending ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'}`}>
              {project.status === 'allocated' ? 'Allocated To You' : project.status || "Pending"}
            </span>
            <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60 flex items-center gap-1.5">
               <Users className="w-3.5 h-3.5 text-slate-400" /> Team: {(project.group_members || []).join(', ') || project.student_name}
            </span>
            {project.domain && (
               <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-1.5">
                 {project.domain} Track
               </span>
            )}
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight leading-tight pr-4">
            {project.title}
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
            "{project.description}"
          </p>

          {/* Execution Progress & Files (Visible if Approved and initialized) */}
          {!isPending && (
            <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100/80 animate-in fade-in zoom-in duration-500">
               <div className="grid md:grid-cols-2 gap-8">
                  {/* Progress Column */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                         <Clock className="w-3 h-3 text-slate-300" /> Timeline Status
                      </p>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{project.progress || 0}% Execution</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden shadow-inner mb-4">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 relative" style={{ width: `${project.progress || 0}%` }}>
                         <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/30 to-transparent" />
                      </div>
                    </div>
                    
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Recent Milestones</p>
                    <div className="flex flex-wrap gap-2">
                      {(project.tasks || []).length === 0 ? (
                         <span className="text-xs text-slate-400 italic font-medium px-2 bg-white border border-slate-200 rounded-lg py-1 shadow-sm">No tasks tracked</span>
                      ) : (
                         (project.tasks || []).slice(-3).map((t, idx) => (
                          <div key={idx} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border max-w-full truncate ${t.completed ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-white text-slate-500 border-slate-200/80 shadow-sm'}`} title={t.task}>
                            {t.completed && <CheckCircle2 className="w-3 h-3 inline-block mr-1 -mt-0.5" />} {t.task}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Documents Column */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                       <FileText className="w-3 h-3 text-slate-300" /> Submissions Ledger
                    </p>
                    <div className="flex flex-col gap-2">
                      <DocLink label="Synopsis Target" url={project.documents?.synopsis} />
                      <DocLink label="Mid-term Package" url={project.documents?.midterm} />
                      <DocLink label="Final PDF" url={project.documents?.final} />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
        
        {/* RIGHT COLUMN: Actions & Similarity */}
        <div className="flex flex-col justify-between items-start lg:items-end lg:w-[280px] bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden shrink-0">
           {isHighSimilarity && (
             <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
           )}
           
           <div className="w-full text-left lg:text-right mb-6 relative z-10">
             <div className="flex items-center lg:justify-end gap-2 mb-2">
                 {isHighSimilarity && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center lg:justify-end gap-1.5">
                    Model Analysis
                 </p>
             </div>
             
             <div className="flex items-end lg:justify-end gap-2">
                <span className={`text-[42px] font-black leading-none tracking-tighter ${isHighSimilarity ? 'text-red-500' : 'text-slate-900'}`}>
                  {project.plagiarism_percentage ?? "--"}
                </span>
                <span className="text-xl font-bold text-slate-300 mb-1">%</span>
             </div>
             <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isHighSimilarity ? 'text-red-400' : 'text-slate-400'}`}>
               Similarity Detected
             </p>
             
             {/* Progress bar visual for similarity */}
             <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div 
                   className={`h-full opacity-80 ${isHighSimilarity ? 'bg-red-500' : 'bg-indigo-400'}`} 
                   style={{ width: `${project.plagiarism_percentage || 0}%` }} 
                />
             </div>
           </div>
           
           <div className="w-full grid gap-2 relative z-10">
              <button 
                 onClick={onAnalyze} 
                 disabled={isAnalyzing} 
                 className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all shadow-sm border ${isAnalyzing ? 'bg-indigo-50 text-indigo-400 border-indigo-100 cursor-wait' : 'bg-slate-900 text-white hover:bg-indigo-600 border-transparent hover:shadow-lg hover:-translate-y-0.5'}`}
              >
                <Search className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? "Processing Index..." : "Run ML Plagiarism Scan"}
              </button>
              
              {isPending && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={onApprove} className="flex flex-col items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white px-2 py-3 rounded-xl transition-all shadow-sm border border-emerald-100/50 group/btn">
                    <CheckCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Accept</span>
                  </button>
                  <button onClick={onReject} className="flex flex-col items-center justify-center gap-1 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-2 py-3 rounded-xl transition-all shadow-sm border border-red-100/50 group/btn">
                    <XCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Reject</span>
                  </button>
                </div>
              )}
              {!isPending && (
                <button 
                  onClick={onEvaluate} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all shadow-sm border bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-transparent hover:shadow-lg hover:-translate-y-0.5 mt-2"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Confidential Grading Matrix
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function DocLink({ label, url }) {
  const isReady = !!url;
  return (
    <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${isReady ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-60'}`}>
       <span className={`text-[11px] font-semibold ${isReady ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
       {isReady ? (
         <a href={url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md transition-colors">
            Access
         </a>
       ) : (
         <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Waiting</span>
       )}
    </div>
  )
}

function AnalyticsView({ stats, calendar }) {
  const domains = stats.domains || {};
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Analytics Main View */}
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-slate-200/80 p-8 md:p-10 rounded-[40px] shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-50 rounded-bl-[100px] pointer-events-none" />
          
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
             <Layout className="w-5 h-5 text-indigo-500" /> Real-time Domain Clustering
          </h3>
          <div className="space-y-5 relative z-10 pr-2">
            {Object.keys(domains).length === 0 && <p className="text-slate-400 text-sm font-medium">No domain clusters formed yet.</p>}
            {Object.entries(domains).map(([domain, count]) => (
              <div key={domain} className="group">
                <div className="flex justify-between items-end text-sm font-bold mb-2">
                   <span className="text-slate-700">{domain === "null" || !domain ? "Unclassified" : domain}</span>
                   <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">{count} Projects</span>
                </div>
                <div className="w-full h-3 bg-slate-100/80 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full group-hover:from-indigo-500 group-hover:to-purple-600 transition-colors" 
                    style={{ width: `${(count / (stats.total || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 text-white p-8 md:p-10 rounded-[40px] shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-4 tracking-tight">SDG Standard Check</h3>
            <p className="text-indigo-200 text-sm mb-8 font-medium leading-relaxed">Projexia encourages high-quality, non-repetitive topics advancing educational impact.</p>
            
            <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-3">Target Contribution</p>
              <p className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">Quality Education</p>
            </div>
          </div>
          
          <BarChart3 className="absolute -bottom-16 -right-16 w-64 h-64 text-white/5 rotate-12 pointer-events-none" />
        </div>
      </div>

       {/* CALENDAR METRICS */}
      <div className="bg-white border border-slate-200/80 rounded-[40px] p-8 md:p-10 shadow-sm relative overflow-hidden">
        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900">
           <Clock className="w-5 h-5 text-amber-500" /> Institutional Deadlines Ledger
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 bg-slate-50/80 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300 group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">Phase I Phase</p>
            <p className="text-xs font-bold text-slate-500 mb-4 border-b border-slate-100 pb-2">Synopsis Target</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{calendar.synopsis || "Reviewing"}</p>
          </div>
          <div className="p-8 bg-slate-50/80 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300 group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">Phase II Phase</p>
            <p className="text-xs font-bold text-slate-500 mb-4 border-b border-slate-100 pb-2">Evaluation Target</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">{calendar.midterm || "Reviewing"}</p>
          </div>
          <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all duration-300 group">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 group-hover:text-indigo-200 transition-colors">Phase III Phase</p>
            <p className="text-xs font-bold text-indigo-800/60 mb-4 border-b border-indigo-200/50 pb-2 group-hover:border-indigo-500 group-hover:text-indigo-300 transition-colors">Final Delivery target</p>
            <p className="text-2xl font-black text-indigo-900 tracking-tighter group-hover:text-white transition-colors">{calendar.final || "Reviewing"}</p>
          </div>
        </div>
      </div>

    </div>
  );
}