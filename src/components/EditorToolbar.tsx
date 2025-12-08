
import { useEditorContext } from "@/contexts/EditorContext";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { Button } from "@/components/ui/button";
import {
  Code,
  PencilRuler,
  Share2,
  Copy,
  Users,
  MessageSquare,
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";

export default function EditorToolbar() {
  const { mode, setMode, language, setLanguage } = useEditorContext();
  const { roomId, usersOpen, setUsersOpen, chatOpen, setChatOpen } = useCollaborationContext();

  const handleShareClick = () => {
    if (!roomId) return;
    
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Room link copied to clipboard!");
  };

  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <Button
          variant={mode === "code" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("code")}
          className={mode === "code" ? "bg-codeSphere-purple-primary hover:bg-codeSphere-purple-dark text-white" : ""}
        >
          <Code className="h-4 w-4 mr-1" /> Code
        </Button>
        <Button
          variant={mode === "whiteboard" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("whiteboard")}
          className={mode === "whiteboard" ? "bg-codeSphere-purple-primary hover:bg-codeSphere-purple-dark text-white" : ""}
        >
          <PencilRuler className="h-4 w-4 mr-1" /> Whiteboard
        </Button>
        
        {mode === "code" && (
          <div className="ml-2">
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as any)}
            >
              <SelectTrigger className="w-28 h-8">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant={usersOpen ? "default" : "outline"} 
          size="sm" 
          onClick={() => setUsersOpen(!usersOpen)}
          className={usersOpen ? "bg-codeSphere-blue-primary hover:bg-codeSphere-blue-dark" : ""}
        >
          <Users className="h-4 w-4 mr-1" />
          Collaborators
        </Button>
        
        <Button 
          variant={chatOpen ? "default" : "outline"} 
          size="sm" 
          onClick={() => setChatOpen(!chatOpen)}
          className={chatOpen ? "bg-codeSphere-purple-primary hover:bg-codeSphere-purple-dark" : ""}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Chat
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleShareClick}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => {
          navigator.clipboard.writeText(document.querySelector('.editor')?.textContent || "");
          toast.success("Code copied to clipboard!");
        }}>
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </div>
    </div>
  );
}
