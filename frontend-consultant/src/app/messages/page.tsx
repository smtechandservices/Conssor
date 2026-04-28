"use client";

import { useEffect, useState } from "react";
import { BaseLayout } from "@/components/BaseLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, User, Search, Paperclip, MoreVertical, Shield, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("conssor_user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    
    fetch(`http://localhost:8000/api/consultant/${user.consultant_id}/clients/`)
      .then(res => res.json())
      .then(data => {
        const activeClients = data.clients || [];
        setClients(activeClients);
        if (activeClients.length > 0) {
          setSelectedClient(activeClients[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const fetchMessages = () => {
    if (!selectedClient) return;
    fetch(`http://localhost:8000/api/engagements/${selectedClient.engagement_id}/messages/`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedClient]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedClient) return;
    const userStr = localStorage.getItem("conssor_user");
    if (!userStr) return;
    const user = JSON.parse(userStr);

    fetch(`http://localhost:8000/api/engagements/${selectedClient.engagement_id}/messages/send/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_type: 'consultant',
        sender_id: user.consultant_id,
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

  const labelCls = "block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-semibold";

  return (
    <BaseLayout>
      <header className="mb-6">
        <h1 className="text-3xl font-heading font-medium tracking-tight mb-2">Collaboration Hub</h1>
        <p className="text-muted-foreground text-sm font-sans">Secure communication with your active clients.</p>
      </header>

      <div className="flex h-[70vh] gap-6">
        {/* Sidebar: Conversations List */}
        <Card className="w-80 bg-[#112A42]/30 border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                placeholder="Search conversations..." 
                className="w-full bg-white/5 border border-white/5 rounded-sm pl-9 pr-4 py-2 text-[10px] outline-none focus:border-primary/40 transition-all uppercase tracking-widest"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 text-center text-[10px] uppercase tracking-widest text-muted-foreground opacity-50">Syncing...</div>
            ) : clients.length === 0 ? (
              <div className="p-10 text-center text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 italic">No active clients yet</div>
            ) : (
              clients.map((client) => (
                <div 
                  key={client.id} 
                  onClick={() => setSelectedClient(client)}
                  className={cn(
                    "p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5",
                    selectedClient?.id === client.id && "bg-primary/10 border-l-2 border-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center border border-white/10">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-medium truncate">{client.name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground truncate">{client.domain}</p>
                    </div>
                    <div className="text-[8px] uppercase tracking-tighter text-muted-foreground">10:20 AM</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Main: Active Chat Area */}
        <Card className="flex-1 bg-[#112A42]/50 border-white/5 flex flex-col overflow-hidden">
          {selectedClient ? (
            <>
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#112A42]/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-sm bg-primary/20 flex items-center justify-center border border-primary/30">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedClient.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Online • {selectedClient.contact}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-sm mr-4">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">End-to-End Encrypted</span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="text-center">
                  <span className="px-4 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Today</span>
                </div>
                
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col", msg.sender_type === 'consultant' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[70%] p-4 rounded-sm text-xs leading-relaxed",
                      msg.sender_type === 'consultant' 
                        ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10" 
                        : "bg-white/5 border border-white/10 text-muted-foreground rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground mt-2 font-bold">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-white/5 bg-[#112A42]/50">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="TYPE YOUR MESSAGE..." 
                      className="w-full bg-white/5 border border-white/10 rounded-sm pl-4 pr-12 py-3 text-xs outline-none focus:border-primary/50 transition-all font-sans tracking-wide"
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
               <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">Select a conversation to begin collaborating</p>
            </div>
          )}
        </Card>
      </div>
    </BaseLayout>
  );
}
