
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
    <div className="w-64 h-full border-r border-border bg-card/50 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border bg-background/80">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-codeSphere-blue-primary" />
          <h2 className="font-semibold text-foreground">Collaborators</h2>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUsersOpen(false)}
            className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-grow">
        {activeUsers.length === 0 ? (
          <div className="p-4 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">No active users</div>
            <div className="text-xs text-muted-foreground mt-1">Share the room link to invite collaborators</div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {activeUsers.map((user, index) => {
              const isOnline = user.lastActivity > new Date(Date.now() - 300000);
              const isOwner = index === 0; // First user is room owner
              
              return (
                <div
                  key={user.id}
                  className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border/50"
                >
                  <div className="relative mr-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    {isOwner && (
                      <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm truncate">{user.name}</div>
                      {isOwner && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                          Owner
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Circle className={`h-2 w-2 ${isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} />
                      {isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
