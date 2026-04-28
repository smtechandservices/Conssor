"use client";

import { useEffect, useState } from "react";
import PortalShell from "@/components/PortalShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, User, Search, Paperclip, MoreVertical, Shield, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Engagement, Consultant } from "@/lib/types";

export default function MessagesPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("conssor_client");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    fetch(`http://localhost:8000/api/client/${user.client_id}/engagements/`)
      .then(res => res.json())
      .then(data => {
        const active = (data.engagements || []).filter((e: Engagement) => e.consultant !== null);
        setEngagements(active);
        if (active.length > 0) {
          setSelectedEngagement(active[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const fetchMessages = () => {
    if (!selectedEngagement) return;
    fetch(`http://localhost:8000/api/engagements/${selectedEngagement.id}/messages/`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMessages();
    // Simple polling every 5 seconds for real-time feel
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedEngagement]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedEngagement) return;
    const userStr = localStorage.getItem("conssor_client");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    fetch(`http://localhost:8000/api/engagements/${selectedEngagement.id}/messages/send/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_type: 'client',
        sender_id: user.client_id,
        text: newMessage
      })
    })
      .then(res => res.json())
      .then(() => {
        setNewMessage("");
        fetchMessages();
      })
      .catch(err => console.error(err));
  };

  return (
    <PortalShell heading="Collaboration Hub">
      <div className="p-8 h-[calc(100vh-80px)] overflow-hidden">
        <div className="flex h-full gap-6">
          
          {/* Sidebar: Consultant List */}
          <Card className="w-80 bg-secondary/20 border-white/5 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  placeholder="Search consultants..." 
                  className="w-full bg-background border border-white/5 rounded-sm pl-9 pr-4 py-2 text-[10px] outline-none focus:border-primary/40 transition-all uppercase tracking-widest"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-10 text-center text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 animate-pulse">Syncing...</div>
              ) : engagements.length === 0 ? (
                <div className="p-10 text-center text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 italic leading-loose">
                  No active consultants yet.<br/>Messages appear once matched.
                </div>
              ) : (
                engagements.map((e) => (
                  <div 
                    key={e.id} 
                    onClick={() => setSelectedEngagement(e)}
                    className={cn(
                      "p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5",
                      selectedEngagement?.id === e.id && "bg-primary/10 border-l-2 border-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{e.consultant?.full_name}</p>
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground truncate">{e.scope[0]}</p>
                      </div>
                      <div className="text-[8px] uppercase tracking-tighter text-muted-foreground shrink-0">10:15 AM</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Main Chat Area */}
          <Card className="flex-1 bg-secondary/10 border-white/5 flex flex-col overflow-hidden">
            {selectedEngagement && selectedEngagement.consultant ? (
              <>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-background/40 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm bg-primary/20 flex items-center justify-center border border-primary/30">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{selectedEngagement.consultant.full_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Vetted Expert • Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-sm mr-4">
                      <Shield className="w-3 h-3 text-primary" />
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Secure Environment</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col">
                  <div className="text-center my-4">
                    <span className="px-4 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Engagement Discussion</span>
                  </div>
                  
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[75%]", msg.sender_type === 'client' ? "ml-auto items-end" : "mr-auto items-start")}>
                      <div className={cn(
                        "p-4 rounded-sm text-xs leading-relaxed",
                        msg.sender_type === 'client' 
                          ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10" 
                          : "bg-white/5 border border-white/10 text-foreground rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground mt-2 font-bold">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-white/5 bg-background/50">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <input 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="REPLY TO CONSULTANT..." 
                        className="w-full bg-background border border-white/10 rounded-sm pl-4 pr-12 py-3 text-xs outline-none focus:border-primary/50 transition-all font-sans tracking-wide"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-all">
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
                    <Button size="icon" className="w-12 h-12 rounded-sm shadow-xl shadow-primary/20" onClick={handleSendMessage}>
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                 <MessageSquare className="w-16 h-16 mb-6 text-muted-foreground" />
                 <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Select a consultant to start messaging</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}
