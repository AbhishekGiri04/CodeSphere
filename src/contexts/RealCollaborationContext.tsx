import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "./UserContext";
import { useSocket } from "../hooks/useSocket";

interface Message {
  id: string;
  content: string;
  user: User;
  timestamp: Date;
}

interface CollaborationContextType {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  messages: Message[];
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  usersOpen: boolean;
  setUsersOpen: (open: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  updateUserPosition: (line: number, column: number) => void;
  sendMessage: (message: string, user: User) => void;
  joinRoom: (roomId: string, user: User) => void;
}

const RealCollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const RealCollaborationContextProvider = ({ children }: { children: ReactNode }) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [usersOpen, setUsersOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  
  const socket = useSocket('http://localhost:3001');

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('room-state', (data) => {
      setUsers(data.users);
    });

    socket.on('user-joined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    socket.on('user-left', (user) => {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    });

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-state');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('new-message');
    };
  }, [socket]);

  const joinRoom = (roomId: string, user: User) => {
    if (socket) {
      socket.emit('join-room', { roomId, user });
      setRoomId(roomId);
    }
  };

  const sendMessage = (message: string, user: User) => {
    if (socket && roomId) {
      socket.emit('chat-message', { roomId, message, user });
    }
  };

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateUserPosition = (line: number, column: number) => {
    if (socket && roomId) {
      socket.emit('cursor-position', { roomId, position: { line, column } });
    }
  };

  return (
    <RealCollaborationContext.Provider
      value={{
        roomId,
        setRoomId,
        connected,
        setConnected,
        users,
        setUsers,
        messages,
        addMessage,
        usersOpen,
        setUsersOpen,
        chatOpen,
        setChatOpen,
        updateUserPosition,
        sendMessage,
        joinRoom,
      }}
    >
      {children}
    </RealCollaborationContext.Provider>
  );
};

export const useRealCollaborationContext = () => {
  const context = useContext(RealCollaborationContext);
  if (context === undefined) {
    throw new Error("useRealCollaborationContext must be used within a RealCollaborationContextProvider");
  }
  return context;
};