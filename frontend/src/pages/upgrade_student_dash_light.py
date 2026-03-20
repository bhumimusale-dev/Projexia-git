import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\frontend\src\pages\StudentDashboard.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.splitlines()

# Cleanup just in case
clean_lines = []
i = 0
while i < len(lines):
    clean_lines.append(lines[i])
    if i + 1 < len(lines) and lines[i+1].strip() == "":
        if i + 2 < len(lines) and lines[i+2].strip() != "":
            i += 1 
    i += 1

restored_text = "\n".join(clean_lines)

# Create highly presentable light-mode structures replacements list
replacements = [
    # Revert Top Level Container to high contrast light mode
    ('className="min-h-screen bg-[#06080b] text-white flex relative overflow-hidden"', 'className="min-h-screen bg-[#f4f7f9] flex"'),
    ('className="min-h-screen bg-[#06080b] text-white flex relative"', 'className="min-h-screen bg-[#f4f7f9] flex"'),
    
    # Remove dark Mesh background if present from step 370
    ('{/* Background Mesh Glow */}\n      <div className="absolute inset-0 pointer-events-none">\n        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />\n        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />\n      </div>', ''),

    # Revert Sidebar
    ('className="w-64 bg-[#080b10] border-r border-white/5 text-white flex flex-col p-6 hidden lg:flex relative z-10"', 'className="w-64 bg-slate-900 text-white flex flex-col p-6 hidden lg:flex shadow-2xl"'),

    # Revert Main 
    ('className="flex-1 p-4 md:p-10 overflow-y-auto relative z-10"', 'className="flex-1 p-4 md:p-10 overflow-y-auto"'),
    ('className="text-2xl font-black text-white bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight"', 'className="text-2xl font-black text-slate-900 tracking-tight"'),
    ('className="text-slate-400 font-medium text-sm"', 'className="text-slate-500 font-medium text-sm"'),
    ('className="bg-white/[0.03] backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl"', 'className="bg-white border border-slate-200/80 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-md"'),
    ('className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xs"', 'className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs"'),
    ('className="text-sm font-bold text-slate-300"', 'className="text-sm font-bold text-slate-800"'),

    # Revert Submissions grid titles
    ('className="text-lg font-bold flex items-center gap-2 text-white"', 'className="text-lg font-bold flex items-center gap-2 text-slate-900"'),
    ('className="bg-white/10 text-slate-300 text-[10px] px-2 py-0.5 rounded-full"', 'className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full"'),

    # Revert Left Container (Form and Deadlines) with premium light styling
    ('className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-2xl sticky top-10"', 'className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-xl shadow-slate-200/30 sticky top-10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"'),
    ('className="p-2 bg-indigo-500/10 rounded-lg"', 'className="p-2 bg-indigo-50 rounded-xl"'),
    ('className="text-lg font-bold text-white"', 'className="text-lg font-bold text-slate-900"'),
    ('className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium text-sm text-white placeholder:text-slate-600"', 'className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm text-slate-800"'),
    ('className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-xl outline-none focus:border-indigo-500 text-white font-medium text-sm transition-all appearance-none"', 'className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-indigo-600 appearance-none font-medium transition-all text-slate-800"'),
    ('<option value="" className="bg-[#0b0e14]">Select Faculty Guide...</option>', '<option value="">Select Faculty Guide...</option>'),
    ('className="text-slate-400 font-medium">Description', 'className="text-slate-500 font-medium">Description'),

    # Revert Deadlines Card with high contrast
    ('className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-sm mt-6 flex flex-col gap-4"', 'className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-xl shadow-slate-200/20 mt-6 flex flex-col gap-4 hover:shadow-2xl transition-all duration-300"'),
    ('className="font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2"', 'className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"'),
    ('className="flex justify-between items-center text-sm border-b border-white/5 pb-2"', 'className="flex justify-between items-center text-sm border-b border-slate-100 pb-2"'),
    ('className="font-bold text-slate-200"', 'className="font-bold text-slate-900"'),

    # Revert Project Cards with premium light elevation 
    ('className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-6 rounded-[24px] shadow-sm hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all group"', 'className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-xl shadow-slate-200/20 hover:border-indigo-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"'),
    ('className="font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1"', 'className="font-black text-slate-900 text-base mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1"'),
    ('className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-6"', 'className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-3 mb-6"'),
    ('className="pt-4 border-t border-white/5 flex justify-between items-center"', 'className="pt-4 border-t border-slate-100 flex justify-between items-center"'),
    ('className="text-xs font-bold text-slate-300"', 'className="text-sm font-bold text-slate-800"'),
    ('className="p-2 bg-red-500/10 rounded-lg"', 'className="p-2 bg-red-50 rounded-xl"'),

    # Checklist view
    ('className="pt-4 border-t border-white/5 mt-4"', 'className="pt-4 border-t border-slate-100 mt-4"'),
    ('className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4"', 'className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4"'),
    ('className="flex mt-3 gap-2 border-b border-white/5 pb-4 mb-4"', 'className="flex mt-3 gap-2 border-b border-slate-100 pb-4 mb-4"'),
    ('className="flex-1 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-xs outline-none focus:border-indigo-500 text-white transition-all"', 'className="flex-1 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-600 transition-all"'),

    # Milestone Uploads 
    ('className="flex justify-between items-center text-sm border-b border-white/5 pb-2"', 'className="flex justify-between items-center text-sm border-b border-slate-100 pb-2"'),
    ('className="flex justify-between items-center text-xs p-3 bg-white/5 rounded-2xl border border-white/5"', 'className="flex justify-between items-center text-xs p-3 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-indigo-100 transition-all"')
]

for old_s, new_s in replacements:
    restored_text = restored_text.replace(old_s, new_s)

# Standardize lists layout in ProjectCard checkboxes with high support
restored_text = restored_text.replace('className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"', 'className="rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 transition-all cursor-pointer"')

with open(filepath, "w", encoding="utf-8") as f:
    f.write(restored_text + "\n")

print(f"File restored to Premium High-Contrast Light Mode successfully.")
