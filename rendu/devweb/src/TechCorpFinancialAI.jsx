import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Mic,
  Send,
  MessageCircle,
  History,
  CalendarDays,
  Plus,
  Settings,
  HelpCircle,
  UserCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";

/**
 * ── Design tokens ────────────────────────────────────────────────
 * Ported 1:1 from design.md ("Obsidian Quantum"). Because this
 * artifact environment only ships Tailwind's core utility classes
 * (no JIT/arbitrary-value compiler), every custom color, font and
 * radius from the design system is applied via inline style / CSS
 * variables instead of custom Tailwind classes like `text-primary`.
 * Layout, spacing and structure still use Tailwind core utilities.
 * ------------------------------------------------------------------
 */
const colors = {
  surface: "#0c160a",
  surfaceDim: "#0c160a",
  surfaceBright: "#313c2e",
  surfaceContainerLowest: "#071106",
  surfaceContainerLow: "#141e12",
  surfaceContainer: "#182216",
  surfaceContainerHigh: "#222d20",
  surfaceContainerHighest: "#2d382a",
  onSurface: "#dae6d2",
  onSurfaceVariant: "#b9ccb2",
  outline: "#84967e",
  outlineVariant: "#3b4b37",
  surfaceTint: "#00e639",
  primary: "#ebffe2",
  onPrimary: "#003907",
  primaryContainer: "#00ff41",
  onPrimaryContainer: "#007117",
  secondary: "#bdf4ff",
  onSecondary: "#00363d",
  secondaryContainer: "#00e3fd",
  onSecondaryContainer: "#00616d",
  tertiary: "#fff8f4",
  tertiaryContainer: "#ffd5ae",
  error: "#ffb4ab",
  primaryFixedDim: "#00e639",
  secondaryFixedDim: "#00daf3",
  tertiaryFixedDim: "#e7bf99",
  background: "#0a0a0a",
};

const font = { fontFamily: "'Inter', system-ui, sans-serif" };

// rgba helpers so opacity utility classes (bg-x/10 etc.) survive the port
const rgba = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const glassPanel = {
  background: "rgba(26, 26, 26, 0.6)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${rgba("#ffffff", 0.1)}`,
  borderTop: `1px solid ${rgba("#ffffff", 0.15)}`,
};

const glowPrimary = { boxShadow: `0 0 15px ${rgba(colors.primaryContainer, 0.2)}` };

/**
 * ── Static data ──────────────────────────────────────────────────
 */
const conversationGroups = [
  {
    label: "Today",
    items: [{ icon: MessageCircle, title: "Market Volatility Analysis", active: true }],
  },
  {
    label: "Yesterday",
    items: [{ icon: History, title: "Portfolio Rebalancing", active: false }],
  },
  {
    label: "Last 7 Days",
    items: [{ icon: CalendarDays, title: "Q2 Earnings Report", active: false }],
  },
];

const sectorRows = [
  {
    dotColor: colors.secondaryFixedDim,
    name: "NASDAQ-100",
    returnValue: "+8.42%",
    returnColor: colors.primaryFixedDim,
    volatility: "14.2",
    signal: "Accumulate",
    signalStyle: "positive",
  },
  {
    dotColor: colors.tertiaryFixedDim,
    name: "S&P 500 Energy",
    returnValue: "-3.15%",
    returnColor: colors.error,
    volatility: "21.8",
    signal: "Neutral",
    signalStyle: "neutral",
  },
];

const initialMessages = [
  {
    id: "u1",
    role: "user",
    text: "Can you show me the Q3 performance for tech stocks vs energy?",
    time: "10:42 AM",
  },
  {
    id: "a1",
    role: "assistant",
    time: "10:42 AM",
    intro: (
      <>
        Comparing{" "}
        <span style={{ color: colors.secondaryFixedDim, fontWeight: 700 }}>
          NASDAQ-100 (Technology Focus)
        </span>{" "}
        against the{" "}
        <span style={{ color: colors.tertiaryFixedDim, fontWeight: 700 }}>
          S&amp;P 500 Energy Sector
        </span>{" "}
        for Q3 reveals a divergent trend-line influenced by macro-economic
        adjustments and crude supply volatility.
      </>
    ),
    table: sectorRows,
    outro:
      "Tech stocks maintained momentum despite rate uncertainty, largely driven by enterprise AI spend. Energy faced headwinds as global demand forecasts softened. Would you like a breakdown of the specific top-performing tickers within the NDX?",
  },
];

/**
 * ── Sub-components ───────────────────────────────────────────────
 */
function TopNavBar({ connected }) {
  return (
    <header
      className="flex justify-between items-center w-full h-16 sticky top-0 z-50 px-6"
      style={{
        ...font,
        background: rgba(colors.surfaceContainer, 0.6),
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${rgba(colors.outlineVariant, 0.3)}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: colors.primaryContainer }}
        >
          <Sparkles size={18} color={colors.onPrimaryContainer} />
        </div>
        <span
          className="uppercase tracking-tighter font-black"
          style={{ color: colors.onSurface, fontSize: 20, letterSpacing: "-0.02em" }}
        >
          TechCorp Financial AI
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        {["Markets", "Signals", "Portfolio"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm px-3 py-1 rounded transition-all"
            style={{ color: colors.onSurfaceVariant }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.primaryFixedDim)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.onSurfaceVariant)}
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-6">
        <div
          className="flex items-center px-3 py-1.5 rounded-full text-xs tracking-wide"
          style={{
            color: colors.primaryFixedDim,
            background: rgba(colors.surfaceContainerHighest, 0.3),
            border: `1px solid ${rgba(colors.outlineVariant, 0.2)}`,
          }}
        >
          <span
            className="inline-block rounded-full mr-2"
            style={{
              width: 8,
              height: 8,
              background: connected ? colors.primaryFixedDim : colors.error,
              boxShadow: `0 0 8px ${connected ? colors.primaryFixedDim : colors.error}`,
            }}
          />
          Server Status: {connected ? "Connected" : "Disconnected"}
        </div>
        <button style={{ color: colors.onSurfaceVariant }} aria-label="Account">
          <UserCircle2 size={24} />
        </button>
      </div>
    </header>
  );
}

function SideNavBar() {
  return (
    <aside
      className="hidden md:flex flex-col h-full w-64 py-4"
      style={{
        background: rgba(colors.surfaceContainerLow, 0.6),
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: `1px solid ${rgba(colors.outlineVariant, 0.2)}`,
      }}
    >
      <div className="px-6 mb-8">
        <h2 className="text-xl font-semibold" style={{ color: colors.primary }}>
          Conversations
        </h2>
        <p className="text-xs opacity-60" style={{ color: colors.onSurfaceVariant }}>
          AI Financial Insights
        </p>
      </div>

      <div className="flex-1 px-3 space-y-4 overflow-y-auto">
        {conversationGroups.map((group) => (
          <div key={group.label}>
            <span
              className="text-[10px] uppercase tracking-widest px-3 block mb-2 opacity-50"
              style={{ color: colors.onSurfaceVariant }}
            >
              {group.label}
            </span>
            {group.items.map((item) => (
              <button
                key={item.title}
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
                style={
                  item.active
                    ? {
                        color: colors.primary,
                        fontWeight: 700,
                        background: rgba(colors.primaryContainer, 0.1),
                        borderRight: `4px solid ${colors.primaryFixedDim}`,
                      }
                    : { color: colors.onSurfaceVariant }
                }
              >
                <item.icon size={18} />
                <span className="text-sm truncate">{item.title}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div
        className="px-3 pt-4 mx-3"
        style={{ borderTop: `1px solid ${rgba(colors.outlineVariant, 0.1)}` }}
      >
        <button
          className="w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-opacity active:opacity-80"
          style={{
            background: colors.primaryContainer,
            color: colors.onPrimaryContainer,
            ...glowPrimary,
          }}
        >
          <Plus size={18} />
          New Chat
        </button>
        <div className="mt-4 space-y-1">
          <button
            className="w-full text-left flex items-center gap-3 px-3 py-2 transition-all"
            style={{ color: colors.onSurfaceVariant }}
          >
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </button>
          <button
            className="w-full text-left flex items-center gap-3 px-3 py-2 transition-all"
            style={{ color: colors.onSurfaceVariant }}
          >
            <HelpCircle size={16} />
            <span className="text-sm">Support</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SectorTable({ rows }) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ ...glassPanel, border: `1px solid ${rgba(colors.outlineVariant, 0.2)}` }}
    >
      <div
        className="grid grid-cols-4 py-3 px-4"
        style={{
          background: rgba(colors.surfaceContainerHighest, 0.4),
          borderBottom: `1px solid ${rgba(colors.outlineVariant, 0.3)}`,
        }}
      >
        {["Index / Sector", "Q3 Return", "Volatility (σ)", "AI Signal"].map((h, i) => (
          <div
            key={h}
            className={`text-[11px] font-bold uppercase tracking-widest ${
              i > 0 ? "text-right" : ""
            }`}
            style={{ color: rgba(colors.onSurfaceVariant, 0.7) }}
          >
            {h}
          </div>
        ))}
      </div>

      <div>
        {rows.map((row, idx) => (
          <div
            key={row.name}
            className="grid grid-cols-4 py-4 px-4 items-center"
            style={
              idx < rows.length - 1
                ? { borderBottom: `1px solid ${rgba(colors.outlineVariant, 0.1)}` }
                : undefined
            }
          >
            <div className="flex items-center gap-2">
              <div
                className="rounded-full"
                style={{ width: 6, height: 6, background: row.dotColor }}
              />
              <span className="text-sm font-semibold" style={{ color: colors.onSurface }}>
                {row.name}
              </span>
            </div>
            <div className="text-right text-xs" style={{ color: row.returnColor }}>
              {row.returnValue}
            </div>
            <div className="text-right text-xs" style={{ color: colors.onSurfaceVariant }}>
              {row.volatility}
            </div>
            <div className="text-right">
              <span
                className="px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                style={
                  row.signalStyle === "positive"
                    ? {
                        background: rgba(colors.primaryContainer, 0.1),
                        color: colors.primaryFixedDim,
                        border: `1px solid ${rgba(colors.primaryFixedDim, 0.2)}`,
                      }
                    : {
                        background: colors.surfaceContainerHighest,
                        color: colors.onSurfaceVariant,
                        border: `1px solid ${colors.outlineVariant}`,
                      }
                }
              >
                {row.signal}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ text, time }) {
  return (
    <div className="flex flex-col items-end">
      <div
        className="max-w-[70%] px-6 py-4"
        style={{
          background: rgba(colors.surfaceContainerHigh, 0.8),
          color: colors.onSurface,
          borderRadius: "24px 24px 4px 24px",
        }}
      >
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
      <span className="text-[10px] mt-2 mr-2 opacity-40" style={{ color: colors.onSurfaceVariant }}>
        {time}
      </span>
    </div>
  );
}

function AssistantBubble({ intro, table, outro, isTyping }) {
  return (
    <div className="flex flex-col items-start">
      <div className="max-w-[85%] w-full">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{
              background: rgba(colors.primaryContainer, 0.2),
              border: `1px solid ${rgba(colors.primaryFixedDim, 0.3)}`,
            }}
          >
            <Sparkles size={16} color={colors.primaryFixedDim} />
          </div>
          <span
            className="font-bold tracking-wide text-sm"
            style={{ color: colors.primary }}
          >
            Terminal Insight Engine
          </span>
        </div>

        <div className="space-y-6 leading-relaxed" style={{ color: colors.onSurface }}>
          {isTyping ? (
            <p className="text-sm opacity-70">Analyse en cours…</p>
          ) : (
            <>
              {intro && <p className="text-sm">{intro}</p>}
              {table && <SectorTable rows={table} />}
              {outro && <p className="text-sm opacity-90">{outro}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ── Main component ───────────────────────────────────────────────
 * Preserves the original page's Ollama integration (localhost:11434)
 * as a best-effort call; since browser sandboxes can't reach
 * localhost servers on the user's machine reliably from every
 * environment, a graceful fallback message is shown on failure.
 */
export default function TechCorpFinancialAI() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const OLLAMA_URL = "http://localhost:11434/api/generate";
  const MODEL_NAME = "phi3.5";

  useEffect(() => {
    let cancelled = false;
    const checkServerStatus = async () => {
      try {
        const response = await fetch("http://localhost:11434/");
        if (!cancelled) setConnected(response.ok);
      } catch (e) {
        if (!cancelled) setConnected(false);
      }
    };
    checkServerStatus();
    const id = setInterval(checkServerStatus, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg = { id: `u-${Date.now()}`, role: "user", text, time };
    const typingMsg = { id: `a-${Date.now()}`, role: "assistant", isTyping: true, time };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL_NAME, prompt: text, stream: false }),
      });
      if (!response.ok) throw new Error("network error");
      const data = await response.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingMsg.id ? { ...m, isTyping: false, outro: data.response } : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingMsg.id
            ? {
                ...m,
                isTyping: false,
                outro: "Erreur de connexion au serveur IA.",
                isError: true,
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ ...font, background: colors.background, color: colors.onSurface }}
    >
      <TopNavBar connected={connected} />

      <div className="flex flex-1 overflow-hidden">
        <SideNavBar />

        <main
          className="flex-1 flex flex-col relative overflow-hidden"
          style={{ background: colors.background }}
        >
          {/* Atmospheric background glows */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div
              className="absolute rounded-full"
              style={{
                top: "-10%",
                right: "-10%",
                width: "50%",
                height: "50%",
                background: rgba(colors.primaryFixedDim, 0.1),
                filter: "blur(120px)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                bottom: "-5%",
                left: "-5%",
                width: "40%",
                height: "40%",
                background: rgba(colors.secondaryFixedDim, 0.1),
                filter: "blur(100px)",
              }}
            />
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-8 space-y-10 relative z-10"
          >
            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} text={m.text} time={m.time} />
              ) : (
                <AssistantBubble
                  key={m.id}
                  intro={m.intro}
                  table={m.table}
                  outro={m.outro}
                  isTyping={m.isTyping}
                />
              )
            )}
          </div>

          {/* Input area */}
          <div className="p-6 pb-8 pt-2 relative z-20">
            <div className="max-w-4xl mx-auto">
              <div
                className="flex items-center px-6 py-2 rounded-full transition-all"
                style={{
                  ...glassPanel,
                  border: `1px solid ${rgba(colors.outlineVariant, 0.3)}`,
                }}
              >
                <button
                  className="p-2 transition-colors"
                  style={{ color: colors.onSurfaceVariant }}
                  aria-label="Attach file"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent border-none outline-none px-4 text-sm"
                  style={{ color: colors.onSurface }}
                  placeholder="Ask about market trends or financial analysis..."
                  type="text"
                />
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 transition-colors"
                    style={{ color: colors.onSurfaceVariant }}
                    aria-label="Voice input"
                  >
                    <Mic size={20} />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={sending}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-60"
                    style={{
                      background: colors.primaryContainer,
                      color: colors.onPrimaryContainer,
                      ...glowPrimary,
                    }}
                    aria-label="Send message"
                  >
                    <Send size={16} fill={colors.onPrimaryContainer} />
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-6 mt-4">
                <button
                  className="text-[10px] uppercase tracking-widest flex items-center gap-1 transition-colors"
                  style={{ color: rgba(colors.onSurfaceVariant, 0.5) }}
                >
                  <Zap size={14} />
                  Real-time Data
                </button>
                <button
                  className="text-[10px] uppercase tracking-widest flex items-center gap-1 transition-colors"
                  style={{ color: rgba(colors.onSurfaceVariant, 0.5) }}
                >
                  <ShieldCheck size={14} />
                  Institutional Grade
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
