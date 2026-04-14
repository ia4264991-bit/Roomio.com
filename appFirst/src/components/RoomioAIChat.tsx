import { FormEvent, useMemo, useState } from "react";
import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import type { Hostel } from "@/data/hostels";

interface Message {
  role: "assistant" | "user";
  text: string;
}

interface RoomioAIChatProps {
  hostels: Hostel[];
}

const starter: Message[] = [
  {
    role: "assistant",
    text: "Hi, I am Roomio AI. Ask me about hostel prices, locations, or which hostel fits your budget.",
  },
];

const pickRecommendation = (hostels: Hostel[], query: string) => {
  const lower = query.toLowerCase();
  const byPriceAsc = [...hostels].sort((a, b) => {
    const aNum = Number((a.price || "").replace(/[^\d]/g, "")) || 0;
    const bNum = Number((b.price || "").replace(/[^\d]/g, "")) || 0;
    return aNum - bNum;
  });

  if (lower.includes("cheap") || lower.includes("budget") || lower.includes("affordable")) {
    return byPriceAsc.slice(0, 3);
  }
  if (lower.includes("best") || lower.includes("popular") || lower.includes("recommend")) {
    return hostels.slice(0, 3);
  }
  return [];
};

const extractOccupancyHint = (description: string) => {
  const d = description.toLowerCase();
  const patterns = [
    /(\d+)\s*(students?|people|persons?)\s*(per|in)\s*(room|chamber)/i,
    /(single|double|triple|quad)\s*(room|occupancy)/i,
    /(one|two|three|four)\s*(in|per)\s*(room|chamber)/i,
    /(shared|self[-\s]?contained|private room)/i,
  ];

  for (const p of patterns) {
    const m = d.match(p);
    if (m) return m[0];
  }
  return null;
};

const generateReply = (query: string, hostels: Hostel[]) => {
  const q = query.toLowerCase().trim();
  if (!q) return "Please type your question so I can help.";
  if (hostels.length === 0) return "I cannot see hostel data right now. Please refresh and try again.";

  const exact = hostels.find(
    (h) => q.includes(h.name.toLowerCase()) || q.includes(h.location.toLowerCase()),
  );
  if (exact) {
    return `${exact.name} is at ${exact.location}. Price: ${exact.price}. ${exact.description}`;
  }

  if (
    q.includes("how many") ||
    q.includes("number of students") ||
    q.includes("students in a room") ||
    q.includes("occupancy") ||
    q.includes("room type")
  ) {
    const withHints = hostels
      .map((h) => ({ name: h.name, hint: extractOccupancyHint(h.description || "") }))
      .filter((x) => !!x.hint)
      .slice(0, 5);

    if (withHints.length > 0) {
      return `From available descriptions, room occupancy hints include:\n${withHints
        .map((x) => `${x.name}: ${x.hint}`)
        .join("\n")}`;
    }
    return "I could not find explicit student-per-room info in current hostel descriptions. Ask about a specific hostel and I will summarize its description.";
  }

  if (q.includes("price") || q.includes("cost")) {
    const lines = hostels.slice(0, 5).map((h) => `${h.name}: ${h.price}`);
    return `Here are some current prices:\n${lines.join("\n")}`;
  }

  if (q.includes("location") || q.includes("where")) {
    const lines = hostels.slice(0, 5).map((h) => `${h.name}: ${h.location}`);
    return `Here are key hostel locations:\n${lines.join("\n")}`;
  }

  const picks = pickRecommendation(hostels, q);
  if (picks.length > 0) {
    return `You can start with: ${picks.map((h) => `${h.name} (${h.price})`).join(", ")}.`;
  }

  return "I can help with hostel prices, locations, room occupancy hints from descriptions, and recommendations. Try: 'how many students in a room?', 'cheap hostels', or a hostel name.";
};

const RoomioAIChat = ({ hostels }: RoomioAIChatProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>(starter);

  const placeholder = useMemo(
    () => (hostels.length ? "Ask Roomio AI about hostels..." : "Hostels are loading..."),
    [hostels.length],
  );

  const onSend = (e: FormEvent) => {
    e.preventDefault();
    const query = text.trim();
    if (!query) return;

    const userMsg: Message = { role: "user", text: query };
    const assistantMsg: Message = { role: "assistant", text: generateReply(query, hostels) };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setText("");
  };

  return (
    <div className="fixed bottom-20 right-4 z-[70] sm:bottom-5 sm:right-5">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary text-primary-foreground shadow-glow px-4 py-3 inline-flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Ask Roomio AI
        </button>
      )}

      {open && (
        <div className="w-[92vw] max-w-sm rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/60">
            <p className="text-sm font-semibold inline-flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              Roomio AI
            </p>
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-3 space-y-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                  m.role === "assistant"
                    ? "bg-secondary text-foreground"
                    : "bg-primary text-primary-foreground ml-8"
                }`}
              >
                <span className="inline-flex items-center gap-1.5 mr-2 opacity-80">
                  {m.role === "assistant" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </span>
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={onSend} className="border-t border-border p-2 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-primary text-primary-foreground p-2">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomioAIChat;
