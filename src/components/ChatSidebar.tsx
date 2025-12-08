import { useState } from "react";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useUserContext } from "@/contexts/UserContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Send } from "lucide-react";
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
    return (
      <Button 
        variant="ghost" 
        className="absolute top-2 right-2 z-10"
        onClick={() => setChatOpen(true)}
        size="sm"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="w-72 h-full border-l border-border bg-secondary flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="font-semibold text-foreground">Chat</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setChatOpen(false)}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-grow p-3">
        {messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="flex flex-col-reverse">
            {messages.map((message) => {
              // Find the user's color from activeUsers or fallback to currentUser
              const user = activeUsers.find(u => u.id === message.userId) || (currentUser && message.userId === currentUser.id ? currentUser : undefined);
              const color = user ? user.color : "#8B5CF6";
              return (
                <div key={message.id} className="mb-4">
                  <div className="flex items-center mb-1">
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-sm">{message.username}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="pl-4 text-sm">
                    {message.content.split(/@(\w+)/g).map((segment, i) => {
                      if (i % 2 === 1) {
                        // This is a mention
                        return (
                          <span key={i} className="text-codeSphere-blue-light font-medium">
                            @{segment}
                          </span>
                        );
                      }
                      return segment;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow"
        />
        <Button type="submit" size="icon" className="h-9 w-9 p-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
