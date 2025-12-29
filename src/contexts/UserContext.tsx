import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  joinedAt: Date;
  isActive: boolean;
};

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  generateUserColor: () => string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { currentUser: firebaseUser } = useAuth();

  const generateUserColor = () => {
    const colors = [
      "#8B5CF6", // Purple
      "#0EA5E9", // Blue
      "#F97316", // Orange
      "#10B981", // Green
      "#EC4899", // Pink
      "#EAB308", // Yellow
      "#6366F1", // Indigo
      "#EF4444", // Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Sync with Firebase user
  useEffect(() => {
    if (firebaseUser && !currentUser) {
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || '',
        color: generateUserColor(),
        joinedAt: new Date(),
        isActive: true
      };
      setCurrentUser(user);
      localStorage.setItem("codeSphereUser", JSON.stringify(user));
    } else if (!firebaseUser && currentUser) {
      setCurrentUser(null);
      localStorage.removeItem("codeSphereUser");
    }
  }, [firebaseUser, currentUser]);

  // Restore from localStorage on mount
  useEffect(() => {
    if (!currentUser && !firebaseUser) {
      const storedUser = localStorage.getItem("codeSphereUser");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem("codeSphereUser");
        }
      }
    }
  }, [currentUser, firebaseUser]);

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      generateUserColor
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
