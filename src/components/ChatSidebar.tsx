import { useState } from "react";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useUserContext } from "@/contexts/UserContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Send, MessageSquare, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ChatSidebar() {
  const { 
    messages, 
    sendMessage, 
    chatOpen, 
    setChatOpen, 
    activeUsers 
  } = useCollaborationContext();
  const { currentUser } = useUserContext();
  
  const [messageText, setMessageText] = useState("");
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    sendMessage(messageText);
    setMessageText("");
  };

  if (!chatOpen) {
    return null;
  }

  return (
    <div className="w-80 h-full border-l border-border bg-background/95 backdrop-blur-sm flex flex-col shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-foreground text-lg">Team Chat</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setChatOpen(false)}
          className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-grow p-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium mb-2">No messages yet</div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Start the conversation with your team!
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map((message) => {
              const user = activeUsers.find(u => u.id === message.userId) || (currentUser && message.userId === currentUser.id ? currentUser : undefined);
              const color = user ? user.color : "#8B5CF6";
              return (
                <div key={message.id} className="group">
                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {message.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{message.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed">
                        {message.content.split(/@(\w+)/g).map((segment, i) => {
                          if (i % 2 === 1) {
                            return (
                              <span key={i} className="bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
                                @{segment}
                              </span>
                            );
                          }
                          return segment;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-border bg-muted/20">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-grow relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="pl-10 bg-background border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button 
            type="submit" 
            size="sm" 
            className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-500"
            disabled={!messageText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
