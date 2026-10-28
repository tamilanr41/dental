import { useEffect, useRef, useState } from "react";
import { Paperclip, Search, Send } from "lucide-react";
import { PortalHeader } from "@/components/patient-portal/PortalHeader";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const conversations = [
  { id: 1, name: "Dr. Sarah Johnson", lastMsg: "Your appointment is confirmed for July 15th.", time: "2h ago", unread: 1, online: true },
  { id: 2, name: "Reception Desk", lastMsg: "We have your insurance information on file.", time: "1d ago", unread: 0, online: true },
  { id: 3, name: "Dr. Michael Chen", lastMsg: "Please send your recent X-rays before the consultation.", time: "3d ago", unread: 0, online: false },
];

const initialMessages = [
  { id: 1, sender: "them", text: "Hi there! How can I help you today?", time: "10:30 AM" },
  { id: 2, sender: "me", text: "I wanted to confirm my appointment for next week.", time: "10:32 AM" },
  { id: 3, sender: "them", text: "Sure! Your appointment with Dr. Johnson is on July 15th at 10:00 AM.", time: "10:33 AM" },
  { id: 4, sender: "them", text: "Is there anything specific you'd like to discuss during the visit?", time: "10:34 AM" },
];

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(1);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!messageText.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "me",
        text: messageText.trim(),
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      },
    ]);
    setMessageText("");
  };

  const active = conversations.find((c) => c.id === activeChat);

  return (
    <main className="min-h-screen bg-background">
      <PortalHeader
        eyebrow="Patient portal"
        title="Messages"
        description="Secure, encrypted conversations with your care team."
      />

      <section className="container-x py-10 md:py-12">
        <div className="grid overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <div className="border-b border-border/70 lg:border-b-0 lg:border-r">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations…"
                  className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                />
              </div>
            </div>

            <div className="max-h-56 space-y-1 overflow-y-auto px-2 pb-3 lg:max-h-none">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv.id)}
                  className={cn(
                    "w-full rounded-xl p-3 text-left transition-colors",
                    activeChat === conv.id
                      ? "bg-primary-50/80"
                      : "hover:bg-secondary-50/70"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 text-[12px] font-semibold text-foreground/70">
                          {conv.name.split(" ")[1]?.charAt(0) ?? conv.name.charAt(0)}
                        </div>
                        {conv.online && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {conv.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">{conv.lastMsg}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-muted-foreground">{conv.time}</p>
                      {conv.unread > 0 && (
                        <Badge size="sm" className="mt-1">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex h-[520px] flex-col">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-[11px] font-semibold text-white">
                  {active?.name.split(" ")[1]?.charAt(0) ?? "S"}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{active?.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {active?.online ? "Online now" : "Typically replies within a day"}
                  </p>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-secondary-50/40 p-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.sender === "me" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-2.5",
                      msg.sender === "me"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm border border-border/60 bg-card text-foreground/85"
                    )}
                  >
                    <p className="text-[13px] leading-relaxed">{msg.text}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/70 p-4">
              <div className="flex items-center gap-2">
                <button
                  aria-label="Attach file"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary-300 hover:text-primary-700"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type your message…"
                  className="h-10 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                />
                <button
                  onClick={send}
                  disabled={!messageText.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-800 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
