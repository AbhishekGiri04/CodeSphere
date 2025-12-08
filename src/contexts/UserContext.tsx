import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
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

  useEffect(() => {
    if (!currentUser) {
      // Only restore from localStorage if available
      const storedUser = localStorage.getItem("codeSphereUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } else {
      localStorage.setItem("codeSphereUser", JSON.stringify(currentUser));
    }
  }, [currentUser]);

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
