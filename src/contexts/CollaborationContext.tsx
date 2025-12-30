import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserContext } from "./UserContext";
import { io, Socket } from "socket.io-client";

type UserPosition = {
  userId: string;
  username: string;
  color: string;
  line: number;
  column: number;
  lastActivity: Date;
};

type CollaborationMessage = {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  mentions: string[];
};

type ActiveUser = {
  id: string;
  name: string;
  color: string;
  joinedAt: Date;
  lastActivity: Date;
};

type CollaborationContextType = {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
  activeUsers: ActiveUser[];
  userPositions: UserPosition[];
  messages: CollaborationMessage[];
  sendMessage: (content: string) => void;
  updateUserPosition: (line: number, column: number) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  usersOpen: boolean;
  setUsersOpen: (open: boolean) => void;
  joinRoom: (roomId: string, user: any) => void;
  socket: Socket | null;
};

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useUserContext();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('https://codesphere-dev.onrender.com', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('room-state', (data) => {
      console.log('Room state received:', data);
      setActiveUsers(data.users || []);
    });

    newSocket.on('user-joined', (user) => {
      console.log('User joined:', user);
      setActiveUsers(prev => [...prev, { ...user, lastActivity: new Date() }]);
    });

    newSocket.on('user-left', (user) => {
      console.log('User left:', user);
      setActiveUsers(prev => prev.filter(u => u.id !== user.id));
    });

    newSocket.on('new-message', (message) => {
      console.log('New message:', message);
      setMessages(prev => [{
        id: message.id.toString(),
        userId: message.user.id,
        username: message.user.name,
        content: message.message,
        timestamp: new Date(message.timestamp),
        mentions: []
      }, ...prev]);
    });

    newSocket.on('cursor-update', (data) => {
      setUserPositions(prev => {
        const filtered = prev.filter(p => p.userId !== data.userId);
        return [...filtered, {
          userId: data.userId,
          username: data.username || 'Unknown',
          color: data.color || '#8B5CF6',
          line: data.position.line,
          column: data.position.column,
          lastActivity: new Date()
        }];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (roomId: string, user: any) => {
    if (socket && user) {
      console.log('Joining room:', roomId, user);
      socket.emit('join-room', { roomId, user });
      setRoomId(roomId);
    }
  };

  const sendMessage = (content: string) => {
    if (!roomId || !connected || !currentUser || !socket) return;
    
    // Only emit to server - don't add locally to avoid duplicates
    socket.emit('chat-message', {
      roomId,
      message: content,
      user: currentUser
    });
  };

  const updateUserPosition = (line: number, column: number) => {
    if (!roomId || !connected || !currentUser || !socket) return;
    
    socket.emit('cursor-position', {
      roomId,
      position: { line, column },
      user: currentUser
    });
  };

  // On room join, add the real user to activeUsers
  useEffect(() => {
    if (roomId && currentUser && connected) {
      const userWithJoinTime = { ...currentUser, joinedAt: new Date(), lastActivity: new Date() };
      setActiveUsers(prev => {
        const exists = prev.find(u => u.id === currentUser.id);
        if (!exists) {
          return [userWithJoinTime, ...prev];
        }
        return prev;
      });
    }
  }, [roomId, currentUser, connected]);

  return (
    <CollaborationContext.Provider value={{ 
      roomId, 
      setRoomId, 
      connected, 
      setConnected,
      activeUsers,
      userPositions, 
      messages,
      sendMessage,
      updateUserPosition,
      chatOpen,
      setChatOpen,
      usersOpen,
      setUsersOpen,
      joinRoom,
      socket
    }}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaborationContext = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error("useCollaborationContext must be used within a CollaborationContextProvider");
  }
  return context;
};
