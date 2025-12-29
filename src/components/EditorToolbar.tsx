import { useEditorContext } from "@/contexts/EditorContext";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Code,
  PencilRuler,
  Share2,
  Copy,
  Users,
  MessageSquare,
  LogOut,
  User
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { ThemeToggle } from "./ThemeToggle";

export default function EditorToolbar() {
  const { mode, setMode, language, setLanguage } = useEditorContext();
  const { roomId, usersOpen, setUsersOpen, chatOpen, setChatOpen } = useCollaborationContext();
  const { currentUser: firebaseUser, logout } = useAuth();

  const handleShareClick = () => {
    if (!roomId) return;
    
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Room link copied to clipboard!");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <Button
          variant={mode === "code" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("code")}
          className={mode === "code" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
        >
          <Code className="h-4 w-4 mr-1" /> Code
        </Button>
        <Button
          variant={mode === "whiteboard" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("whiteboard")}
          className={mode === "whiteboard" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
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
        {/* User Info */}
        {firebaseUser && (
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 rounded-lg">
            {firebaseUser.photoURL ? (
              <img 
                src={firebaseUser.photoURL} 
                alt={firebaseUser.displayName || 'User'}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
            )}
            <span className="text-sm text-slate-300 hidden md:block">
              {firebaseUser.displayName || 'Anonymous'}
            </span>
          </div>
        )}
        
        <Button 
          variant={usersOpen ? "default" : "outline"} 
          size="sm" 
          onClick={() => setUsersOpen(!usersOpen)}
          className={usersOpen ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <Users className="h-4 w-4 mr-1" />
          Collaborators
        </Button>
        
        <Button 
          variant={chatOpen ? "default" : "outline"} 
          size="sm" 
          onClick={() => setChatOpen(!chatOpen)}
          className={chatOpen ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Chat
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleShareClick}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        
        <ThemeToggle />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}