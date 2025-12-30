import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditorContext } from "@/contexts/EditorContext";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { useUserContext } from "@/contexts/UserContext";
import { toast } from "sonner";
import ProfessionalCodeEditor from "@/components/ProfessionalCodeEditor";
import RealWhiteboard from "@/components/RealWhiteboard";
import UsersSidebar from "@/components/UsersSidebar";
import ChatSidebar from "@/components/ChatSidebar";
import EditorToolbar from "@/components/EditorToolbar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Room() {
  const { roomId: roomIdParam } = useParams<{ roomId: string }>();
  const { mode } = useEditorContext();
  const { 
    setRoomId, 
    connected, 
    setConnected,
    usersOpen,
    chatOpen,
    joinRoom 
  } = useCollaborationContext();
  const { currentUser } = useUserContext();
  const navigate = useNavigate();
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [showConnectionStatus, setShowConnectionStatus] = useState(true);
  const hasShownConnectedToast = useRef(false);
  
  useEffect(() => {
    // Redirect to home if no user or room ID
    if (!currentUser || !roomIdParam) {
      toast.error("Missing user information or room ID");
      navigate("/");
      return;
    }
    
    // Join room with WebSocket
    if (typeof joinRoom === 'function') {
      console.log('Joining room:', roomIdParam, currentUser);
      joinRoom(roomIdParam, currentUser);
    } else {
      setRoomId(roomIdParam);
    }
    
    return () => {
      setRoomId(null);
      hasShownConnectedToast.current = false;
    };
  }, [roomIdParam, currentUser, joinRoom, setRoomId, navigate]);
  
  // Auto-hide loading screen after 2 seconds or when connected
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConnectionStatus(false);
    }, 2000);
    
    if (connected) {
      clearTimeout(timer);
      setShowConnectionStatus(false);
    }
    
    return () => clearTimeout(timer);
  }, [connected]);
  useEffect(() => {
    if (connected && !hasShownConnectedToast.current) {
      toast.success(`Connected to room: ${roomIdParam}`, {
        description: `Room code: ${roomIdParam?.toUpperCase()}`,
      });
      hasShownConnectedToast.current = true;
      setShowConnectionStatus(false);
    }
  }, [connected, roomIdParam]);
  
  // Show loading state only briefly
  if (showConnectionStatus) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <EditorToolbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Connecting to room...</h2>
            <p className="mt-2 text-muted-foreground">Room code: {roomIdParam?.toUpperCase()}</p>
            <button 
              onClick={() => setShowConnectionStatus(false)}
              className="mt-4 text-sm text-blue-500 hover:underline"
            >
              Continue anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorToolbar />
      
      <div className="flex flex-1 overflow-hidden">
        {usersOpen && <UsersSidebar />}
        
        <div className="flex-1 h-full overflow-auto relative">
          {mode === "code" && <ProfessionalCodeEditor />}
          {mode === "whiteboard" && <RealWhiteboard />}
        </div>
        
        {chatOpen && <ChatSidebar />}
      </div>
    </div>
  );
}
