import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Code, Users, Zap, LogOut, User } from "lucide-react";
import { toast } from "sonner";

export default function AuthScreen() {
  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const { currentUser: firebaseUser, logout } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomStatus, setRoomStatus] = useState<string>("");

  // Check room status when room code changes
  useEffect(() => {
    if (roomCode.trim().length >= 3) {
      const checkRoom = async () => {
        try {
          const backendUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001' 
            : 'https://codesphere-dev.onrender.com';
          
          const response = await fetch(`${backendUrl}/room/${roomCode.toUpperCase()}`);
          const data = await response.json();
          
          if (data.exists) {
            setRoomStatus(`Room exists • ${data.userCount} user(s) online`);
          } else {
            setRoomStatus("New room • Will be created when you join");
          }
        } catch (error) {
          setRoomStatus("");
        }
      };
      
      const debounceTimer = setTimeout(checkRoom, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setRoomStatus("");
    }
  }, [roomCode]);

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    
    const finalRoomCode = roomCode.toUpperCase();
    setIsJoining(true);
    
    setTimeout(() => {
      navigate(`/room/${finalRoomCode}`);
      setIsJoining(false);
    }, 800);
  };
  
  const handleCreateRoom = () => {
    setIsCreating(true);
    
    setTimeout(() => {
      const randomRoomId = Math.random().toString(36).substring(2, 9).toUpperCase();
      navigate(`/room/${randomRoomId}`);
      setIsCreating(false);
    }, 800);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700">
        <CardHeader className="text-center">
          {/* User Info */}
          {firebaseUser && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {firebaseUser.photoURL ? (
                  <img 
                    src={firebaseUser.photoURL} 
                    alt={firebaseUser.displayName || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-blue-400"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-medium text-white">
                    {firebaseUser.displayName || 'Anonymous'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {firebaseUser.email}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl">
              <Code className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome to CodeSphere
          </CardTitle>
          <CardDescription className="text-slate-400">
            Start collaborating with your team in real-time
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="roomCode" className="text-sm font-medium text-blue-300">
              Room Code (Optional)
            </label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="bg-slate-800 border-slate-600 focus:border-blue-400 focus:bg-slate-700 text-white placeholder:text-slate-400"
              placeholder="Enter room code to join"
              maxLength={10}
            />
            {roomStatus && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {roomStatus}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Room...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Create New Room
                </div>
              )}
            </Button>
            
            <Button 
              onClick={handleJoinRoom} 
              disabled={!roomCode.trim() || isJoining}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500 font-medium py-3 rounded-lg transition-colors"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Joining Room...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Join Existing Room
                </div>
              )}
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              Ready to collaborate with your authenticated account
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}