import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Users, Crown, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ThemeToggle } from "./ThemeToggle";

export default function UsersSidebar() {
  const { 
    activeUsers, 
    usersOpen, 
    setUsersOpen 
  } = useCollaborationContext();

  if (!usersOpen) {
    return null;
  }

  return (
    <div className="w-72 h-full border-r border-border bg-background/95 backdrop-blur-sm flex flex-col shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="font-semibold text-foreground text-lg">Collaborators</h2>
          <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
            {activeUsers.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUsersOpen(false)}
            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-grow">
        {activeUsers.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">No active users</div>
            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Share the room link to invite collaborators and start coding together
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {activeUsers.map((user, index) => {
              const isOnline = user.lastActivity > new Date(Date.now() - 300000);
              const isOwner = index === 0;
              
              return (
                <div
                  key={user.id}
                  className="flex items-center p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/50 group"
                >
                  <div className="relative mr-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                      isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    {isOwner && (
                      <Crown className="absolute -top-2 -right-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-foreground truncate">{user.name}</div>
                      {isOwner && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
                          Owner
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Circle className={`h-2 w-2 ${isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
                      <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                      {isOnline && (
                        <span className="text-muted-foreground/70">• Active now</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="text-xs text-muted-foreground text-center">
          <span className="font-medium">CodeSphere</span> • Real-time collaboration
        </div>
      </div>
    </div>
  );
}
