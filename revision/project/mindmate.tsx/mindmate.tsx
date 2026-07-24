import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  Frown,
  Meh,
  Send,
  Sparkles,
  Heart,
  Activity,
  CalendarDays,
  BarChart as BarChartIcon,
  AlertTriangle,
  ShieldCheck,
  Moon,
  Sun
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/**
 * Mindate – Single-file React component
 * ------------------------------------------------------
 * Features
 * - Mood tracking (with streaks & reminders)
 * - Private journal with optional AI prompts
 * - Mental health chatbot (rule-based fallback + LLM hook)
 * - Simple trend analytics from localStorage
 * - Calming UI with Tailwind + shadcn/ui + Framer Motion
 *
 * Notes
 * - This is client-side only for quick prototyping.
 * - Swap chatbotReply() with a real LLM API call on the server for production.
 */

// ---- Types ----
const MOODS = [
  { key: "happy", label: "Happy", icon: Smile },
  { key: "ok", label: "Okay", icon: Meh },
  { key: "low", label: "Low", icon: Frown }
] as const;

type MoodKey = typeof MOODS[number]["key"];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

type MoodEntry = {
  id: string;
  mood: MoodKey;
  note?: string;
  dateISO: string; // yyyy-mm-dd
};

type JournalEntry = {
  id: string;
  content: string;
  dateISO: string;
};

// ---- Utilities ----
const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);

const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ---- Basic Safety Filter (client-side heuristic; not a substitute for clinical use) ----
const CRISIS_PATTERNS = [
  /suicide|kill myself|end my life|can't go on|harm myself/i,
  /self-harm|cutting|overdose|poison/i,
  /hallucinat(e|ions)|hearing voices telling/i,
];

const crisisResources = [
  {
    name: "India | Suicide & Crisis Helpline (AASRA)",
    number: "+91-9820466726",
    url: "https://www.aasra.info/helpline.html"
  },
  {
    name: "Global | Suicide Stop (directory)",
    url: "https://www.suicidestop.com/online"
  }
];

// ---- Rule-based fallback chatbot ----
async function chatbotReply(userText: string): Promise<string> {
  // Show crisis info immediately if concerning patterns detected
  if (CRISIS_PATTERNS.some((re) => re.test(userText))) {
    return (
      "I'm really sorry you're going through this. You matter. " +
      "If you're in immediate danger, please call local emergency services. " +
      "You can also reach out to AASRA (+91-9820466726) in India or see global resources in the Help tab. " +
      "I'm here to listen. Would grounding or breathing exercises help right now?"
    );
  }

  // Lightweight intent matching
  const text = userText.toLowerCase();
  if (/anxious|anxiety|panic/.test(text)) {
    return (
      "Anxiety often comes in waves. Let's try a 4-7-8 breath: inhale 4s, hold 7s, exhale 8s, repeat x4. " +
      "Would you like a short grounding exercise too (5-4-3-2-1)?"
    );
  }
  if (/sad|down|depressed|low/.test(text)) {
    return (
      "I'm hearing that you're feeling low. That’s tough. A tiny action can help: a short walk, a shower, or texting a friend. " +
      "If this feeling lasts for 2+ weeks, consider talking to a professional. I can also suggest journaling prompts."
    );
  }
  if (/sleep|insomnia|tired/.test(text)) {
    return (
      "Sleep struggles are common. Try a consistent wind-down: dim lights, avoid screens 60 minutes before bed, and a brief body scan. " +
      "Want a 3-minute body-scan script?"
    );
  }
  if (/ground(ing)?/.test(text)) {
    return (
      "Grounding (5-4-3-2-1): Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. " +
      "Take it slow and breathe gently."
    );
  }

  // Default empathetic response
  return (
    "Thanks for sharing that with me. I’m here with you. " +
    "Would you like a quick mood check-in or a journaling prompt?"
  );

  /**
   * REAL LLM (Server-side):
   *
   * Replace this function with a call to your backend API that proxies an LLM (e.g., OpenAI, Vertex, Anthropic).
   * Example (client -> server):
   * const res = await fetch("/api/chat", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ message: userText }) });
   * const data = await res.json(); return data.reply;
   */
}

// ---- Main UI Component ----
export default function MindateApp() {
  const [dark, setDark] = useState(false);
  const [moods, setMoods] = useState<MoodEntry[]>(() => storage.get("mindate.moods", [] as MoodEntry[]));
  const [journal, setJournal] = useState<JournalEntry[]>(() => storage.get("mindate.journal", [] as JournalEntry[]));
  const [messages, setMessages] = useState<ChatMessage[]>(() => storage.get("mindate.chat", [
    { id: uid(), role: "assistant", text: "Hi, I’m Mindate. How are you feeling today?", timestamp: Date.now() }
  ] as ChatMessage[]));
  const [input, setInput] = useState("");
  const [note, setNote] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [saving, setSaving] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => storage.set("mindate.chat", messages), [messages]);
  useEffect(() => storage.set("mindate.moods", moods), [moods]);
  useEffect(() => storage.set("mindate.journal", journal), [journal]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Streak calculation
  const streak = useMemo(() => {
    const days = new Set(moods.map((m) => m.dateISO));
    let s = 0;
    let d = new Date();
    for (;;) {
      const iso = d.toISOString().slice(0, 10);
      if (days.has(iso)) {
        s += 1;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
  }, [moods]);

  // Mood distribution
  const moodCounts = useMemo(() => {
    const base = { happy: 0, ok: 0, low: 0 } as Record<MoodKey, number>;
    for (const m of moods) base[m.mood] += 1;
    const total = moods.length || 1;
    return {
      happy: Math.round((base.happy / total) * 100),
      ok: Math.round((base.ok / total) * 100),
      low: Math.round((base.low / total) * 100)
    };
  }, [moods]);

  // Submit chat
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const replyText = await chatbotReply(text);
    const botMsg: ChatMessage = { id: uid(), role: "assistant", text: replyText, timestamp: Date.now() };
    setMessages((prev) => [...prev, botMsg]);
  };

  // Save mood entry
  const saveMood = () => {
    if (!selectedMood && !note.trim()) return;
    setSaving(true);
    const entry: MoodEntry = {
      id: uid(),
      mood: selectedMood || "ok",
      note: note.trim() || undefined,
      dateISO: todayISO()
    };
    setMoods((prev) => {
      const prevNoDup = prev.filter((e) => !(e.dateISO === entry.dateISO && !e.note));
      return [entry, ...prevNoDup].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
    });
    setSelectedMood(null);
    setNote("");
    setSaving(false);
  };

  // Journal entry
  const addJournal = () => {
    if (!note.trim()) return;
    const entry: JournalEntry = { id: uid(), content: note.trim(), dateISO: todayISO() };
    setJournal((prev) => [entry, ...prev]);
    setNote("");
  };

  const journalingPrompts = [
    "What’s one small win from today?",
    "What emotion is strongest right now, and why?",
    "What would make tomorrow 1% better?",
    "What can I let go of today?",
  ];

  return (
    <div className={`${dark ? "dark" : ""} min-h-screen transition-colors`}>
      <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 shadow">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Mindate</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your private space to track, reflect, and feel supported</p>
              </div>
              <Badge className="ml-2" variant="secondary">Beta</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Badge className="hidden md:inline-flex" variant="outline">
                <ShieldCheck className="w-4 h-4 mr-1" /> Privacy-first: local demo
              </Badge>
            </div>
          </header>

          <Tabs defaultValue="chat" className="grid md:grid-cols-3 gap-4 md:gap-6 items-start">
            <div className="md:col-span-2 order-2 md:order-1">
              <TabsList className="mb-4">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="checkin">Check-in</TabsTrigger>
                <TabsTrigger value="journal">Journal</TabsTrigger>
              </TabsList>

              <TabsContent value="chat">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5" /> Mental Health Chatbot</CardTitle>
                    <CardDescription>Gentle, supportive chat. Not a substitute for professional care.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[50vh] md:h-[60vh] overflow-y-auto p-2 border rounded-xl bg-white/60 dark:bg-slate-900/40">
                      {messages.map((m) => (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`max-w-[85%] md:max-w-[70%] my-2 p-3 rounded-2xl shadow-sm ${
                            m.role === "user"
                              ? "ml-auto bg-blue-50 dark:bg-blue-900/30"
                              : "mr-auto bg-slate-50 dark:bg-slate-800"
                          }`}
                        >
                          <div className="text-xs text-slate-500 mb-1">
                            {m.role === "user" ? "You" : "Mindate"} · {new Date(m.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                        </motion.div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Input
                        placeholder="Share what's on your mind…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button onClick={sendMessage}>
                        <Send className="w-4 h-4 mr-1" /> Send
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Tip: Try phrases like "I'm anxious", "grounding", or "can't sleep".
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="checkin">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Daily Check‑in</CardTitle>
                    <CardDescription>Log your mood and an optional note to build awareness.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {MOODS.map(({ key, label, icon: Icon }) => (
                        <Button
                          key={key}
                          variant={selectedMood === key ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setSelectedMood(key)}
                        >
                          <Icon className="w-4 h-4 mr-2" /> {label}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Textarea
                        placeholder="Add a short note (optional)…"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={saveMood} disabled={saving}>Save Check‑in</Button>
                      <Button variant="secondary" onClick={addJournal}>Save as Journal</Button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Card className="rounded-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Streak</CardTitle>
                          <CardDescription className="text-xs">Consecutive days logged</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-semibold">{streak}️</div>
                          <Progress value={Math.min((streak % 7) * (100 / 7), 100)} className="mt-2" />
                        </CardContent>
                      </Card>
                      <Card className="rounded-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Mood Trends</CardTitle>
                          <CardDescription className="text-xs">Distribution (all time)</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-20">Happy</div>
                              <Progress value={moodCounts.happy} />
                              <div className="w-10 text-right text-sm">{moodCounts.happy}%</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20">Okay</div>
                              <Progress value={moodCounts.ok} />
                              <div className="w-10 text-right text-sm">{moodCounts.ok}%</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20">Low</div>
                              <Progress value={moodCounts.low} />
                              <div className="w-10 text-right text-sm">{moodCounts.low}%</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-xl">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Recent Logs</CardTitle>
                          <CardDescription className="text-xs">Last 5 entries</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                            {moods.slice(0, 5).map((m) => (
                              <li key={m.id} className="flex items-start justify-between gap-2">
                                <span className="text-slate-600 dark:text-slate-300">
                                  {m.dateISO} – {m.mood}{m.note ? ": " + m.note : ""}
                                </span>
                              </li>
                            ))}
                            {moods.length === 0 && <li className="text-slate-400">No entries yet.</li>}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="journal">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Journal</CardTitle>
                    <CardDescription>Write freely. You can also ask for a prompt.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {journalingPrompts.map((p, i) => (
                        <Button key={i} variant="outline" size="sm" onClick={() => setNote(p)}>
                          <Sparkles className="w-4 h-4 mr-1" /> {p}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="What's on your mind?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-32"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={addJournal}>Save Journal</Button>
                      <Button variant="secondary" onClick={() => setNote("")}>Clear</Button>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Recent entries</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {journal.length === 0 && (
                          <div className="text-slate-400 text-sm">No entries yet.</div>
                        )}
                        <AnimatePresence>
                          {journal.map((j) => (
                            <motion.div key={j.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-xl border bg-white/60 dark:bg-slate-900/40">
                              <div className="text-xs text-slate-500 mb-1">{j.dateISO}</div>
                              <div className="whitespace-pre-wrap leading-relaxed">{j.content}</div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {/* Right column: Help & Safety */}
            <div className="order-1 md:order-2 space-y-4 sticky top-4">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Help now</CardTitle>
                  <CardDescription>If you feel unsafe, please seek immediate help.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {crisisResources.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl border">
                      <div className="font-medium">{r.name}</div>
                      {r.number && <div>📞 {r.number}</div>}
                      {r.url && (
                        <a className="underline" href={r.url} target="_blank" rel="noreferrer">Open resource</a>
                      )}
                    </div>
                  ))}
                  <div className="text-xs text-slate-500">
                    This app is not a medical device and does not provide diagnosis.
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChartIcon className="w-5 h-5" /> Assessments</CardTitle>
                  <CardDescription>Screeners to track symptoms over time.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="p-3 rounded-xl border">
                    <div className="font-medium">PHQ‑9 (Depression)</div>
                    <div className="text-xs text-slate-500">Use periodically (e.g., weekly).</div>
                    <a className="underline" href="https://www.phqscreeners.com/images/sites/g/files/g10060481/f/201412/PHQ-9_English.pdf" target="_blank" rel="noreferrer">Open PDF</a>
                  </div>
                  <div className="p-3 rounded-xl border">
                    <div className="font-medium">GAD‑7 (Anxiety)</div>
                    <div className="text-xs text-slate-500">Use periodically (e.g., weekly).</div>
                    <a className="underline" href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6686295/pdf/nihms-1043319.pdf" target="_blank" rel="noreferrer">About GAD‑7</a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Tabs>

          <footer className="mt-8 text-center text-xs text-slate-500">
            Built for demo purposes. © {new Date().getFullYear()} Mindate.
          </footer>
        </div>
      </div>

      <style jsx global>{`
        html, body, #root { height: 100%; }
        .dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}
