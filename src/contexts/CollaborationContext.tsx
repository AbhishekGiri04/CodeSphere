import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserContext } from "./UserContext";

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

  // On room join, add the real user to activeUsers
  useEffect(() => {
    if (roomId && currentUser) {
      // Set joinedAt to now when joining a new room
      const userWithJoinTime = { ...currentUser, joinedAt: new Date(), lastActivity: new Date() };
      setConnected(true);
      setActiveUsers([userWithJoinTime]);
      setUserPositions([]);
      setMessages([]);
    } else {
      setConnected(false);
      setActiveUsers([]);
      setUserPositions([]);
      setMessages([]);
    }
  }, [roomId, currentUser]);

  const sendMessage = (content: string) => {
    if (!roomId || !connected || !currentUser) return;
    const mentionRegex = /@(\w+)/g;
    const mentions = Array.from(content.matchAll(mentionRegex), match => match[1]);
    const newMessage: CollaborationMessage = {
      id: `msg${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.name,
      content,
      timestamp: new Date(),
      mentions
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const updateUserPosition = (line: number, column: number) => {
    if (!roomId || !connected || !currentUser) return;
    setUserPositions([{ userId: currentUser.id, username: currentUser.name, color: currentUser.color, line, column, lastActivity: new Date() }]);
  };

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
      setUsersOpen
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
