import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\frontend\src\pages\StudentRecommendations.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# 1. State hook injection
old_state = "  const [isLoading, setIsLoading] = useState(false);"
new_state = """  const [isLoading, setIsLoading] = useState(false);
  const [localRecs, setLocalRecs] = useState([]);"""

# 2. askAI modification
old_askAI = """  const askAI = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/student/ai-recommend",
        { prompt, mode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponse(res.data.recommendation);
    } catch (err) {"""

new_askAI = """  const askAI = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse("");
    setLocalRecs([]);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/student/ai-recommend",
        { prompt, mode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponse(res.data.recommendation);

      // Parallel call to fetch local BERT recommendations
      try {
        const lres = await axios.post(
          "http://127.0.0.1:5000/student/local-recommend",
          { interest_tags: prompt },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (lres.data.recommendations) {
          setLocalRecs(lres.data.recommendations);
        }
      } catch (l_err) {
        console.error("Local recommendations error:", l_err);
      }

    } catch (err) {"""

# 3. Bottom component insertion
old_bottom = """            {/* Background design */}
            <Zap className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
          </div>
        </div>
      </main>"""

new_bottom = """            {/* Background design */}
            <Zap className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
          </div>
        </div>

        {/* LOCAL RECOMMENDATIONS SECTION */}
        {localRecs.length > 0 && (
          <div className="mt-12 bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Similar Past Projects (BERT Semantic Match)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localRecs.map((title, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-white transition-all cursor-pointer group">
                  <span className="text-xs font-black tracking-widest text-indigo-600 uppercase mb-2 block">Local Match {idx + 1}</span>
                  <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>"""

text_n = text.replace('\r\n', '\n')
old_state_n = old_state.replace('\r\n', '\n')
new_state_n = new_state.replace('\r\n', '\n')
old_ask_n = old_askAI.replace('\r\n', '\n')
new_ask_n = new_askAI.replace('\r\n', '\n')
old_bottom_n = old_bottom.replace('\r\n', '\n')
new_bottom_n = new_bottom.replace('\r\n', '\n')

print("State found:", old_state_n in text_n)
print("AskAI found:", old_ask_n in text_n)
print("Bottom found:", old_bottom_n in text_n)

if old_state_n in text_n and old_ask_n in text_n and old_bottom_n in text_n:
    text_n = text_n.replace(old_state_n, new_state_n)
    text_n = text_n.replace(old_ask_n, new_ask_n)
    text_n = text_n.replace(old_bottom_n, new_bottom_n)
    text_n = text_n.replace('\n', '\r\n')
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(text_n)
    print("UI Upgraded Successfully!")
else:
    print("One or more target structures not found inside file.")
