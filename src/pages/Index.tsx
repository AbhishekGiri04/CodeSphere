import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/contexts/UserContext";
import { useEditorContext } from "@/contexts/EditorContext";
import { Code, PencilRuler, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, generateUserColor } = useUserContext();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Set username from context if available
    if (currentUser?.name) {
      setUsername(currentUser.name);
    }
  }, [currentUser]);

  const handleJoinRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    
    setIsJoining(true);
    
    // Create a user if none exists
    if (!currentUser) {
      setCurrentUser({
        id: crypto.randomUUID(),
        name: username,
        color: generateUserColor(),
        joinedAt: new Date(),
        isActive: true
      });
    } else if (currentUser.name !== username) {
      // Update username if changed
      setCurrentUser({
        ...currentUser,
        name: username
      });
    }
    
    // Simulate API call to check if room exists
    setTimeout(() => {
      // Join the room
      navigate(`/room/${roomCode}`);
      setIsJoining(false);
    }, 800);
  };
  
  const handleCreateRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    setIsCreating(true);
    
    // Create a user if none exists
    if (!currentUser) {
      setCurrentUser({
        id: crypto.randomUUID(),
        name: username,
        color: generateUserColor(),
        joinedAt: new Date(),
        isActive: true
      });
    } else if (currentUser.name !== username) {
      setCurrentUser({
        ...currentUser,
        name: username
      });
    }
    
    // Create a random room ID and navigate to it
    setTimeout(() => {
      const randomRoomId = Math.random().toString(36).substring(2, 9).toUpperCase();
      navigate(`/room/${randomRoomId}`);
      setIsCreating(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Geometric background lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      </div>
      
      <div className="w-full max-w-4xl px-4 relative z-10">
        <div className="text-center mb-16 mt-12">
          <h1 className="text-8xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent mb-8 tracking-tight">
            CodeSphere
          </h1>
          <div className="flex items-center justify-center gap-4 max-w-3xl mx-auto">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
            <p className="text-xl text-slate-300 leading-relaxed text-center">
              A Java-Centric Collaborative Code Editor with Whiteboard & Real-Time Execution
            </p>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700 hover:border-emerald-400 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer">
            <div className="relative px-12 py-10">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-4 rounded-xl w-fit mx-auto mb-6">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-3 text-white text-lg text-center">Code Editor</h3>
              <p className="text-slate-400 leading-relaxed text-sm text-center">
                Multi-language support with syntax highlighting and real-time execution
              </p>
            </div>
          </div>
          
          <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700 hover:border-purple-400 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer">
            <div className="relative px-12 py-10">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl w-fit mx-auto mb-6">
                <PencilRuler className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-3 text-white text-lg text-center">Whiteboard</h3>
              <p className="text-slate-400 leading-relaxed text-sm text-center">
                Draw diagrams, flowcharts, and illustrations to explain your code
              </p>
            </div>
          </div>
          
          <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-700 hover:border-cyan-400 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer">
            <div className="relative px-12 py-10">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl w-fit mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-3 text-white text-lg text-center">Real-Time Collaboration</h3>
              <p className="text-slate-400 leading-relaxed text-sm text-center">
                Code together with live cursors, chat, and presence indicators
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-12 max-w-2xl mx-auto mb-32">
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium mb-3 text-blue-300">
              Your Name
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 bg-slate-800 border-slate-600 focus:border-blue-400 focus:bg-slate-700 focus:shadow-lg focus:shadow-blue-400/20 text-white placeholder:text-slate-400 rounded-lg transition-all duration-200"
              placeholder="Enter your name"
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="roomCode" className="block text-sm font-medium mb-3 text-blue-300">
              Room Code
            </label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full h-12 bg-slate-800 border-slate-600 focus:border-blue-400 focus:bg-slate-700 focus:shadow-lg focus:shadow-blue-400/20 text-white placeholder:text-slate-400 rounded-lg transition-all duration-200"
              placeholder="Enter room code to join"
            />
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleJoinRoom} 
              disabled={!username.trim() || !roomCode.trim() || isJoining}
              className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500 font-medium rounded-lg transition-colors"
            >
              {isJoining ? "Joining..." : "Join Room"}
            </Button>
            <Button 
              onClick={handleCreateRoom}
              disabled={!username.trim() || isCreating}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
            >
              {isCreating ? "Creating..." : "Create New Room"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
