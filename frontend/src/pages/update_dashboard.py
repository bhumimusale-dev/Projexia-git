import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update ProjectCard with gradient progress bars
old_card_head = """        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPending ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
          }`}>"""

new_card_head = """        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPending ? "bg-amber-50/80 border border-amber-200/50 text-amber-600" : "bg-emerald-50/80 border border-emerald-200/50 text-emerald-600"
          }`}>"""

old_grad_bar = """            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isSimilarityHigh ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${project.plagiarism_percentage || 0}%` }}
              />
            </div>"""

new_grad_bar = """            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 bg-gradient-to-r ${isSimilarityHigh ? 'from-red-400 to-red-600' : 'from-indigo-400 to-indigo-600'}`}
                style={{ width: `${project.plagiarism_percentage || 0}%` }}
              />
            </div>"""

old_task_bar = """          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${project.progress || 0}%` }} />
          </div>"""

new_task_bar = """          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${project.progress || 0}%` }} />
          </div>"""

text_n = text.replace('\r\n', '\n')
old_head_n = old_card_head.replace('\r\n', '\n')
new_head_n = new_card_head.replace('\r\n', '\n')
old_grad_n = old_grad_bar.replace('\r\n', '\n')
new_grad_n = new_grad_bar.replace('\r\n', '\n')
old_task_n = old_task_bar.replace('\r\n', '\n')
new_task_n = new_task_bar.replace('\r\n', '\n')

print("Card Head found:", old_head_n in text_n)
print("Grad Bar found:", old_grad_n in text_n)
print("Task Bar found:", old_task_n in text_n)

if old_head_n in text_n and old_grad_n in text_n and old_task_n in text_n:
    text_n = text_n.replace(old_head_n, new_head_n)
    text_n = text_n.replace(old_grad_n, new_grad_n)
    text_n = text_n.replace(old_task_n, new_task_n)
    text_n = text_n.replace('\n', '\r\n')
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(text_n)
    print("Dashboard visual gradients added successfully!")
else:
    print("One or more replacements failed.")
