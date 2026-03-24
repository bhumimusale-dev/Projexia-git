import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Save, LogOut, LayoutDashboard, Settings, 
  Users, Briefcase, ChevronDown, CheckCircle2, Clock, 
  AlertTriangle, Download 
} from "lucide-react";

export default function AdminDashboard() {
  const [calendar, setCalendar] = useState({ synopsis: "", midterm: "", final: "" });
  const [workloads, setWorkloads] = useState([]);
  const [unallocated, setUnallocated] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("workload"); // 'workload', 'calendar', 'allocations'
  const [expandedTeacher, setExpandedTeacher] = useState(null); // Track which faculty card is open

  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }
    if (user.role !== "admin") {
      nav(user.role === "teacher" ? "/teacher" : "/student");
      return;
    }
    fetchCalendar();
    fetchWorkloads();
    fetchUnallocated();
  }, [token, nav, user.role]);

  const fetchCalendar = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/calendar");
      setCalendar(res.data || { synopsis: "", midterm: "", final: "" });
    } catch (err) {
      console.error("Fetch calendar error", err);
    }
  };

  const fetchWorkloads = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/admin/faculty-workload", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkloads(res.data || []);
    } catch (err) {
      console.error("Fetch workloads error", err);
    }
  }

  const fetchUnallocated = async () => {
    try {
       const res = await axios.get("http://127.0.0.1:5000/admin/unallocated-projects", {
         headers: { Authorization: `Bearer ${token}` }
       });
       setUnallocated(res.data || []);
    } catch (err) {
       console.error("Fetch unallocated error", err);
    }
  }

  const allocateFaculty = async (title, teacherEmail) => {
    if(!teacherEmail) return;
    try {
       await axios.post("http://127.0.0.1:5000/admin/allocate-faculty", {
          title, teacher_email: teacherEmail
       }, { headers: { Authorization: `Bearer ${token}` } });
       alert("Faculty assigned successfully.");
       fetchUnallocated();
       fetchWorkloads();
    } catch (err) {
       alert(err.response?.data?.msg || "Failed to allocate faculty.");
    }
  }

  const downloadInstitutionalReport = () => {
    if (workloads.length === 0) return alert("No workloads available to export.");
    const header = "SR No,Group Number,Student ID,Student Name,Name of Project,Faculty Guide,Faculty Department,Review 1 (25),Review 2 (25),Final (50),Total Score (100)\n";
    let srNo = 1;
    let csvRows = [];
    
    workloads.forEach(faculty => {
       const approved = (faculty.projects || []).filter(p => p.status === 'approved');
       approved.forEach(p => {
         const rev1 = Number(p.evaluations?.review_1) || 0;
         const rev2 = Number(p.evaluations?.review_2) || 0;
         const fin = Number(p.evaluations?.final_review) || 0;
         const total = rev1 + rev2 + fin;
         const members = p.group_members && p.group_members.length > 0 ? p.group_members : [p.student_name || ""];

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
            const fName = `"${faculty.name}"`;
            const fDept = `"${faculty.department}"`;
            const r1 = rev1;
            const r2 = rev2;
            const f = fin;
            const t = total;
  
            csvRows.push(`${srNo},${groupNum},${id},${name},${projTitle},${fName},${fDept},${r1},${r2},${f},${t}`);
            srNo++;
         });
       });
    });

    const csv = header + csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Institutional_Grade_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const updateCalendar = async () => {
    setIsSaving(true);
    try {
      await axios.post(
        "http://127.0.0.1:5000/admin/calendar",
        calendar,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Calendar updated successfully");
    } catch (err) {
      alert("Failed to update calendar");
    } finally {
      setIsSaving(false);
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
            <Settings className="text-white w-5 h-5 fill-white/20" />
          </div>
          <span className="text-xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ProAdmin</span>
        </div>

        <nav className="flex-1 space-y-3 relative z-10 flex flex-col">
          <button 
            onClick={() => setActiveTab("workload")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all border ${activeTab === 'workload' ? 'bg-gradient-to-r from-indigo-500/20 to-transparent border-indigo-500/20 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users className="w-5 h-5" /> 
            <span className="flex-1 text-left">Faculty Workload Matrix</span>
            {activeTab === 'workload' && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
          </button>
          
          <button 
            onClick={() => setActiveTab("calendar")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all border ${activeTab === 'calendar' ? 'bg-gradient-to-r from-indigo-500/20 to-transparent border-indigo-500/20 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Calendar className="w-5 h-5" /> 
            <span className="flex-1 text-left">Institutional Calendar</span>
            {activeTab === 'calendar' && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
          </button>
          <button 
            onClick={() => setActiveTab("allocations")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm transition-all border ${activeTab === 'allocations' ? 'bg-gradient-to-r from-indigo-500/20 to-transparent border-indigo-500/20 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Briefcase className="w-5 h-5" /> 
            <span className="flex-1 text-left">Group Allocations</span>
            {unallocated.length > 0 && <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full">{unallocated.length}</span>}
            {activeTab === 'allocations' && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] ml-2" />}
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-3.5 rounded-2xl font-semibold text-sm transition-all relative z-10 mt-auto"
        >
          <LogOut className="w-5 h-5" /> Terminate Session
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto w-full relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <header className="mb-10 lg:mb-12 flex justify-between items-end gap-4">
          <div>
             <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
               System Administration
             </h1>
             <p className="text-slate-500 font-medium mt-1">Global oversight and institutional configuration active.</p>
          </div>
          <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm text-sm font-black text-indigo-600">
             Admin Privilege Enabled
          </div>
        </header>

        {/* CONDITIONALLY RENDER TABS */}
        {activeTab === "calendar" ? (
           
           /* CALENDAR CONFIGURATION TAB */
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 max-w-3xl shadow-xl shadow-slate-200/20">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  <Calendar className="text-indigo-600 w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Institutional Calendar</h2>
                  <p className="text-sm font-medium text-slate-500">Updates here apply globally to all faculty and students.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Synopsis Submission Deadline</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700"
                    value={calendar.synopsis}
                    onChange={(e) => setCalendar({ ...calendar, synopsis: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Mid-term Evaluation</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700"
                    value={calendar.midterm}
                    onChange={(e) => setCalendar({ ...calendar, midterm: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Final Submission</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700"
                    value={calendar.final}
                    onChange={(e) => setCalendar({ ...calendar, final: e.target.value })}
                  />
                </div>

                <button
                  onClick={updateCalendar}
                  disabled={isSaving}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 mt-8 active:scale-[0.98]"
                >
                  {isSaving ? "Syncing Network..." : "Push Global Calendar Update"}
                  {!isSaving && <Save className="w-5 h-5 ml-1" />}
                </button>
              </div>
            </div>
           </div>

        ) : activeTab === "allocations" ? (

          /* ALLOCATIONS TAB */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Unassigned Groups
                  <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-black mt-1">Pending {unallocated.length}</span>
                </h2>
             </div>

             <div className="grid lg:grid-cols-2 gap-6">
                {unallocated.length === 0 ? (
                  <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">All submitting groups are assigned.</p>
                  </div>
                ) : (
                  unallocated.map((proj, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                       <div>
                         <div className="flex justify-between items-start mb-4">
                           <span className="bg-amber-50 text-amber-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl">Pending Allocation</span>
                           {proj.group_id && <span className="text-[10px] font-black text-slate-400">{proj.group_id}</span>}
                         </div>
                         <h3 className="font-black text-slate-900 text-xl mb-1">{proj.group_id ? `Group ${proj.group_id}` : "Uncategorized Group"}</h3>
                         <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-4">"{proj.title}"</p>
                         
                         <div className="flex flex-wrap gap-4 mb-4 border-l-2 border-slate-100 pl-3">
                            <div className="w-full">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Members</p>
                               <span className="text-xs font-bold text-slate-600">{(proj.group_members||[]).join(', ')}</span>
                            </div>
                            {(proj.year || proj.div || proj.batch) && (
                              <div className="w-full mt-1">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Info</p>
                                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                                   {proj.year && `Year: ${proj.year} `}
                                   {proj.div && `Div: ${proj.div} `}
                                   {proj.batch && `Batch: ${proj.batch}`}
                                 </span>
                              </div>
                            )}
                         </div>
                       </div>
                       
                       <div className="border-t border-slate-100 pt-4 mt-auto">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assign Guide</p>
                          <div className="relative">
                            <select 
                               className="w-full bg-slate-50 border border-slate-200/80 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-400 font-semibold text-xs appearance-none text-slate-800 pr-10"
                               onChange={(e) => allocateFaculty(proj.title, e.target.value)}
                               defaultValue=""
                            >
                               <option value="" disabled>Select Faculty Guide...</option>
                               {workloads.map(t => {
                                  const totalCount = t.approved_count + t.pending_count;
                                  const isFull = totalCount >= 5;
                                  return (
                                    <option key={t.email} value={t.email} disabled={isFull}>
                                      {t.name} ({t.department||'General'}) {isFull ? '(FULL)' : `- ${totalCount}/5 Assigned`}
                                    </option>
                                  )
                               })}
                            </select>
                            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

        ) : (

          /* WORKLOAD MATRIX TAB */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Teacher Allocations
                <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-black mt-1">Total {workloads.length} Faculty</span>
              </h2>
              <button 
                onClick={downloadInstitutionalReport} 
                className="bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-indigo-600 px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" /> 
                Export Grade Audit Matrix
              </button>
            </div>

            <div className="grid gap-6">
              {workloads.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">No faculty data available continuously...</p>
                </div>
              ) : (
                workloads.map((faculty, idx) => {
                  const isExpanded = expandedTeacher === faculty.email;
                  const groupsCount = faculty.approved_count || 0;
                  const studentsCount = groupsCount * 4;
                  const isCapped = groupsCount >= 5;

                  return (
                    <div key={idx} className="bg-white border border-slate-200/80 rounded-[28px] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
                      
                      {/* HEADER ROW */}
                      <div 
                        onClick={() => setExpandedTeacher(isExpanded ? null : faculty.email)}
                        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Faculty Info */}
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl border border-indigo-100/50">
                             {faculty.name.charAt(0)}
                           </div>
                           <div>
                             <h3 className="font-black text-slate-900 text-lg">{faculty.name}</h3>
                             <p className="text-sm font-semibold text-slate-500">{faculty.department} Department</p>
                           </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                             <span className="text-2xl font-black text-emerald-600 tracking-tighter leading-none">{groupsCount}<span className="text-sm text-slate-400">/5</span></span>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Groups</span>
                           </div>
                           <div className="flex flex-col items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl hidden sm:flex">
                             <span className="text-2xl font-black text-indigo-600 tracking-tighter leading-none">{studentsCount}<span className="text-sm text-slate-400">/20</span></span>
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Students</span>
                           </div>
                           
                           {/* Allocation Bar */}
                           <div className="w-32 hidden lg:flex flex-col items-end border-l border-slate-100 pl-6">
                              <span className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isCapped ? 'text-red-500' : 'text-slate-400'}`}>
                                {isCapped ? 'Capacity Reached' : 'Group Slots'}
                              </span>
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${isCapped ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}
                                  style={{ width: `${Math.min((groupsCount / 5) * 100, 100)}%` }}
                                />
                              </div>
                           </div>

                           <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 md:ml-4">
                             <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-500' : ''}`} />
                           </div>
                        </div>
                      </div>

                      {/* EXPANDED PROJECT MATRIX */}
                      <div className={`overflow-hidden transition-all duration-500 bg-slate-50/50 ${isExpanded ? 'max-h-[2500px] border-t border-slate-100' : 'max-h-0'}`}>
                         <div className="p-6">
                           <div className="flex justify-between items-center mb-6">
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Briefcase className="w-4 h-4 text-indigo-400" />
                               Allocated Group Slots ({groupsCount}/5)
                             </p>
                             {faculty.pending_count > 0 && <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-amber-100">{faculty.pending_count} Pending Requests Ignored in Slots</span>}
                           </div>

                           <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                             {Array.from({ length: 5 }).map((_, slotIdx) => {
                                const approvedProjects = (faculty.projects || []).filter(p => p.status === 'approved');
                                const proj = approvedProjects[slotIdx];

                                if (proj) {
                                  // Filled Slot
                                  const isHighSimilarity = (proj.plagiarism_percentage || 0) > 30;
                                  return (
                                    <div key={slotIdx} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm transition-all relative overflow-hidden flex flex-col h-full border-t-4 border-t-emerald-500">
                                      <div className="flex justify-between items-start mb-3">
                                        <span className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                                          Slot {slotIdx + 1}
                                        </span>
                                        <span className={`text-[10px] font-black ${isHighSimilarity ? 'text-red-500' : 'text-indigo-500'}`}>ML: {proj.plagiarism_percentage}%</span>
                                      </div>
                                      <h4 className="font-bold text-slate-900 text-sm leading-tight mb-3" title={proj.title}>{proj.title}</h4>
                                      
                                      <div className="mt-auto border-t border-slate-100 pt-3">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Members</p>
                                        <div className="flex flex-col gap-1">
                                          {(proj.group_members && proj.group_members.length > 0 ? proj.group_members : [proj.student_name]).map((member, mIdx) => (
                                            <span key={mIdx} className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 truncate flex items-center gap-1.5">
                                               <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {member}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  // Empty Slot
                                  return (
                                    <div key={slotIdx} className="bg-slate-50 border-2 border-dashed border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-full min-h-[220px]">
                                       <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-300 flex items-center justify-center font-black mb-3 text-xs">
                                         {slotIdx + 1}
                                       </div>
                                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Empty Slot</p>
                                       <p className="text-[10px] font-bold text-slate-400 mt-2">Available for new group assignment.</p>
                                    </div>
                                  );
                                }
                             })}
                           </div>
                         </div>
                      </div>
                      
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
