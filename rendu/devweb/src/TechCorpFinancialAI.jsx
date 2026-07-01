import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  MessageCircle,
  Plus,
  Settings,
  HelpCircle,
  UserCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Trash2,
  Bot,
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────
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

// ── Ollama Logo SVG ───────────────────────────────────────────────
function OllamaLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill={rgba(colors.primaryContainer, 0.15)} stroke={colors.primaryFixedDim} strokeWidth="2"/>
      <circle cx="35" cy="42" r="9" fill={colors.primaryFixedDim}/>
      <circle cx="65" cy="42" r="9" fill={colors.primaryFixedDim}/>
      <circle cx="35" cy="42" r="4" fill={colors.onPrimaryContainer}/>
      <circle cx="65" cy="42" r="4" fill={colors.onPrimaryContainer}/>
      <path d="M32 65 Q50 78 68 65" stroke={colors.primaryFixedDim} strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── Welcome screen ────────────────────────────────────────────────
function WelcomeScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center"
      style={{ color: colors.onSurface }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{
          background: rgba(colors.primaryContainer, 0.12),
          border: `1px solid ${rgba(colors.primaryFixedDim, 0.3)}`,
          boxShadow: `0 0 40px ${rgba(colors.primaryFixedDim, 0.1)}`,
        }}
      >
        <OllamaLogo size={48} />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
          Bonjour, comment puis-je vous aider ?
        </h2>
        <p className="text-sm max-w-md" style={{ color: rgba(colors.onSurfaceVariant, 0.8) }}>
          Je suis <strong style={{ color: colors.primaryFixedDim }}>phi3.5-financial</strong>, votre assistant IA
          spécialisé en finance. Posez-moi vos questions sur les marchés, les actions, les obligations ou la gestion des risques.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs px-4 py-2 rounded-full"
        style={{
          background: rgba(colors.surfaceContainerHighest, 0.4),
          border: `1px solid ${rgba(colors.outlineVariant, 0.3)}`,
          color: rgba(colors.onSurfaceVariant, 0.7),
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: colors.primaryFixedDim, boxShadow: `0 0 6px ${colors.primaryFixedDim}` }}
        />
        Propulsé par Ollama · phi3.5-financial
      </div>
    </div>
  );
}

// ── User Bubble ───────────────────────────────────────────────────
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

// ── Assistant Bubble ──────────────────────────────────────────────
function AssistantBubble({ text, isTyping, isError }) {
  return (
    <div className="flex flex-col items-start">
      <div className="max-w-[85%] w-full">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: rgba(colors.primaryContainer, 0.15),
              border: `1px solid ${rgba(colors.primaryFixedDim, 0.3)}`,
            }}
          >
            <OllamaLogo size={20} />
          </div>
          <span className="font-bold tracking-wide text-sm" style={{ color: colors.primary }}>
            phi3.5-financial
          </span>
        </div>

        <div
          className="px-5 py-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
          style={{
            background: rgba(colors.surfaceContainerLow, 0.7),
            color: isError ? colors.error : colors.onSurface,
            border: `1px solid ${rgba(colors.outlineVariant, 0.2)}`,
            whiteSpace: "pre-wrap",
          }}
        >
          {isTyping ? (
            <div className="flex items-center gap-2">
              <span style={{ color: rgba(colors.primaryFixedDim, 0.8) }}>Analyse en cours</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: colors.primaryFixedDim,
                      animation: `bounce 1.2s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </span>
            </div>
          ) : (
            text
          )}
        </div>
      </div>
    </div>
  );
}

// ── Top Navbar ────────────────────────────────────────────────────
function TopNavBar({ connected, activeTitle }) {
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
          style={{ background: rgba(colors.primaryContainer, 0.15), border: `1px solid ${rgba(colors.primaryFixedDim, 0.3)}` }}
        >
          <Sparkles size={18} color={colors.primaryFixedDim} />
        </div>
        <span
          className="uppercase tracking-tighter font-black"
          style={{ color: colors.onSurface, fontSize: 20, letterSpacing: "-0.02em" }}
        >
          TechCorp Financial AI
        </span>
        {activeTitle && (
          <span
            className="hidden md:block text-xs px-3 py-1 rounded-full ml-2"
            style={{
              color: rgba(colors.onSurfaceVariant, 0.7),
              background: rgba(colors.surfaceContainerHighest, 0.4),
              border: `1px solid ${rgba(colors.outlineVariant, 0.2)}`,
            }}
          >
            {activeTitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div
          className="flex items-center px-3 py-1.5 rounded-full text-xs tracking-wide"
          style={{
            color: connected ? colors.primaryFixedDim : colors.error,
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
          {connected ? "Ollama connecté" : "Serveur déconnecté"}
        </div>
        <button style={{ color: colors.onSurfaceVariant }} aria-label="Account">
          <UserCircle2 size={24} />
        </button>
      </div>
    </header>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────
function SideNavBar({ conversations, activeId, onSelect, onNew, onDelete }) {
  const groupByDate = (convs) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = { Today: [], Yesterday: [], "Last 7 Days": [], Older: [] };
    convs.forEach((c) => {
      const d = new Date(c.createdAt);
      if (d.toDateString() === today.toDateString()) groups["Today"].push(c);
      else if (d.toDateString() === yesterday.toDateString()) groups["Yesterday"].push(c);
      else if (d >= lastWeek) groups["Last 7 Days"].push(c);
      else groups["Older"].push(c);
    });
    return groups;
  };

  const groups = groupByDate(conversations);

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
      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <OllamaLogo size={20} />
          <h2 className="text-base font-semibold" style={{ color: colors.primary }}>
            Conversations
          </h2>
        </div>
        <p className="text-xs opacity-60" style={{ color: colors.onSurfaceVariant }}>
          Historique · phi3.5-financial
        </p>
      </div>

      {/* New chat button */}
      <div className="px-3 mb-4">
        <button
          onClick={onNew}
          className="w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: colors.primaryContainer,
            color: colors.onPrimaryContainer,
            ...glowPrimary,
          }}
        >
          <Plus size={18} />
          Nouvelle discussion
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 px-3 space-y-4 overflow-y-auto">
        {Object.entries(groups).map(([label, items]) =>
          items.length === 0 ? null : (
            <div key={label}>
              <span
                className="text-[10px] uppercase tracking-widest px-3 block mb-2 opacity-50"
                style={{ color: colors.onSurfaceVariant }}
              >
                {label}
              </span>
              {items.map((conv) => (
                <div
                  key={conv.id}
                  className="group flex items-center gap-2 rounded-lg transition-all mb-1"
                  style={
                    conv.id === activeId
                      ? {
                          background: rgba(colors.primaryContainer, 0.1),
                          borderRight: `3px solid ${colors.primaryFixedDim}`,
                        }
                      : {}
                  }
                >
                  <button
                    onClick={() => onSelect(conv.id)}
                    className="flex items-center gap-2 px-3 py-2 flex-1 text-left min-w-0"
                    style={{ color: conv.id === activeId ? colors.primary : colors.onSurfaceVariant }}
                  >
                    <MessageCircle size={15} className="flex-shrink-0" />
                    <span className="text-sm truncate">{conv.title}</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1.5 mr-1 rounded transition-all flex-shrink-0"
                    style={{ color: colors.error }}
                    aria-label="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )
        )}
        {conversations.length === 0 && (
          <p className="text-xs px-3 opacity-40 text-center mt-8" style={{ color: colors.onSurfaceVariant }}>
            Aucune conversation.<br />Commencez une nouvelle discussion !
          </p>
        )}
      </div>

      <div
        className="px-3 pt-4 mx-3"
        style={{ borderTop: `1px solid ${rgba(colors.outlineVariant, 0.1)}` }}
      >
        <div className="space-y-1">
          <button
            className="w-full text-left flex items-center gap-3 px-3 py-2 transition-all rounded-lg hover:bg-white/5"
            style={{ color: colors.onSurfaceVariant }}
          >
            <Settings size={16} />
            <span className="text-sm">Paramètres</span>
          </button>
          <button
            className="w-full text-left flex items-center gap-3 px-3 py-2 transition-all rounded-lg hover:bg-white/5"
            style={{ color: colors.onSurfaceVariant }}
          >
            <HelpCircle size={16} />
            <span className="text-sm">Aide</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = "tcorp_conversations";
const WELCOME_MSG = {
  id: "welcome",
  role: "assistant",
  text: "Bonjour ! 👋 Je suis phi3.5-financial, votre assistant spécialisé en finance.\n\nJe peux vous aider sur :\n• Les marchés financiers et indices\n• Les actions et obligations\n• La gestion des risques\n• Les produits dérivés\n\nComment puis-je vous aider aujourd'hui ?",
  isTyping: false,
};

function createConversation(title = "Nouvelle conversation") {
  return {
    id: `conv-${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    messages: [WELCOME_MSG],
  };
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveConversations(convs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch {}
}

// ── Main component ────────────────────────────────────────────────
export default function TechCorpFinancialAI() {
  const [conversations, setConversations] = useState(() => {
    const saved = loadConversations();
    if (saved.length > 0) return saved;
    const initial = createConversation("Discussion de départ");
    return [initial];
  });
  const [activeId, setActiveId] = useState(() => {
    const saved = loadConversations();
    return saved.length > 0 ? saved[0].id : `conv-${Date.now()}`;
  });
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const OLLAMA_URL = "http://localhost:11434/api/generate";
  const MODEL_NAME = "phi3.5-financial";

  // Persist to localStorage whenever conversations change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Sync activeId after new conversation creation
  useEffect(() => {
    if (!conversations.find((c) => c.id === activeId) && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  // Poll server status
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const r = await fetch("http://localhost:11434/");
        if (!cancelled) setConnected(r.ok);
      } catch {
        if (!cancelled) setConnected(false);
      }
    };
    check();
    const id = setInterval(check, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, activeId]);

  const activeConv = conversations.find((c) => c.id === activeId);
  const messages = activeConv?.messages ?? [];

  const updateMessages = useCallback((convId, updater) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, messages: updater(c.messages) } : c))
    );
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending || !activeId) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: `u-${Date.now()}`, role: "user", text, time };
    const typingId = `a-${Date.now()}`;
    const typingMsg = { id: typingId, role: "assistant", isTyping: true, time };

    // Auto-title: use first user message as conversation title
    const isFirstUserMsg = !messages.some((m) => m.role === "user");
    if (isFirstUserMsg) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, title: text.length > 40 ? text.slice(0, 40) + "…" : text }
            : c
        )
      );
    }

    updateMessages(activeId, (prev) => [...prev, userMsg, typingMsg]);
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
      updateMessages(activeId, (prev) =>
        prev.map((m) =>
          m.id === typingId ? { ...m, isTyping: false, text: data.response } : m
        )
      );
    } catch {
      updateMessages(activeId, (prev) =>
        prev.map((m) =>
          m.id === typingId
            ? { ...m, isTyping: false, text: "⚠️ Erreur de connexion au serveur Ollama. Vérifiez que le serveur est démarré.", isError: true }
            : m
        )
      );
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNew = () => {
    const conv = createConversation("Nouvelle conversation");
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDelete = (id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeId && next.length > 0) setActiveId(next[0].id);
      if (next.length === 0) {
        const fresh = createConversation("Nouvelle conversation");
        setActiveId(fresh.id);
        return [fresh];
      }
      return next;
    });
  };

  return (
    <>
      {/* Bounce animation for typing dots */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${rgba(colors.outlineVariant, 0.5)}; border-radius: 2px; }
      `}</style>

      <div
        className="h-screen flex flex-col"
        style={{ ...font, background: colors.background, color: colors.onSurface }}
      >
        <TopNavBar connected={connected} activeTitle={activeConv?.title} />

        <div className="flex flex-1 overflow-hidden">
          <SideNavBar
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => { setActiveId(id); setInput(""); }}
            onNew={handleNew}
            onDelete={handleDelete}
          />

          <main
            className="flex-1 flex flex-col relative overflow-hidden"
            style={{ background: colors.background }}
          >
            {/* Background glows */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div
                className="absolute rounded-full"
                style={{
                  top: "-10%", right: "-10%", width: "50%", height: "50%",
                  background: rgba(colors.primaryFixedDim, 0.1),
                  filter: "blur(120px)",
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  bottom: "-5%", left: "-5%", width: "40%", height: "40%",
                  background: rgba(colors.secondaryFixedDim, 0.1),
                  filter: "blur(100px)",
                }}
              />
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 py-8 relative z-10"
            >
              {messages.length <= 1 && messages[0]?.id === "welcome" ? (
                <WelcomeScreen />
              ) : (
                <div className="space-y-8 max-w-4xl mx-auto">
                  {messages.map((m) =>
                    m.role === "user" ? (
                      <UserBubble key={m.id} text={m.text} time={m.time} />
                    ) : (
                      <AssistantBubble
                        key={m.id}
                        text={m.text}
                        isTyping={m.isTyping}
                        isError={m.isError}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-6 pb-8 pt-2 relative z-20">
              <div className="max-w-4xl mx-auto">
                <div
                  className="flex items-center px-4 py-2 rounded-2xl transition-all"
                  style={{
                    ...glassPanel,
                    border: `1px solid ${rgba(colors.outlineVariant, 0.4)}`,
                  }}
                >
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm resize-none"
                    style={{ color: colors.onSurface, maxHeight: 120, overflowY: "auto" }}
                    placeholder="Posez votre question financière…  (Entrée pour envoyer)"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: colors.primaryContainer,
                      color: colors.onPrimaryContainer,
                      ...glowPrimary,
                    }}
                    aria-label="Envoyer"
                  >
                    <Send size={16} fill={colors.onPrimaryContainer} />
                  </button>
                </div>

                <div className="flex justify-center gap-6 mt-3">
                  <span
                    className="text-[10px] uppercase tracking-widest flex items-center gap-1"
                    style={{ color: rgba(colors.onSurfaceVariant, 0.4) }}
                  >
                    <Zap size={12} />
                    Ollama Local
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-widest flex items-center gap-1"
                    style={{ color: rgba(colors.onSurfaceVariant, 0.4) }}
                  >
                    <Bot size={12} />
                    phi3.5-financial
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-widest flex items-center gap-1"
                    style={{ color: rgba(colors.onSurfaceVariant, 0.4) }}
                  >
                    <ShieldCheck size={12} />
                    Données locales
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
