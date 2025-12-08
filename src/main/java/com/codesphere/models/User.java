
package com.codesphere.models;

import javax.persistence.*;
import java.util.Date;
import java.util.UUID;

/**
 * Represents a user in the system
 */
@Entity
@Table(name = "users")
public class User {
    
    @Id
    private String id;
    
    private String name;
    private String color;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date joinedAt;
    
    @Transient // Don't persist activity status
    private boolean isActive;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastSeen;
    
    private String lastRoomId;
    
    // For JPA
    public User() {
        this.id = UUID.randomUUID().toString();
        this.joinedAt = new Date();
        this.isActive = true;
        this.lastSeen = new Date();
    }
    
    public User(String name, String color) {
        this();
        this.name = name;
        this.color = color;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Date getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Date joinedAt) {
        this.joinedAt = joinedAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
        if (active) {
            this.lastSeen = new Date();
        }
    }
    
    public Date getLastSeen() {
        return lastSeen;
    }
    
    public void setLastSeen(Date lastSeen) {
        this.lastSeen = lastSeen;
    }
    
    public String getLastRoomId() {
        return lastRoomId;
    }
    
    public void setLastRoomId(String lastRoomId) {
        this.lastRoomId = lastRoomId;
    }
    
    // For calculating online status
    public boolean isOnline() {
        if (lastSeen == null) {
            return false;
        }
        
        // User is online if seen in the last 5 minutes
        long fiveMinutesInMs = 5 * 60 * 1000;
        return System.currentTimeMillis() - lastSeen.getTime() < fiveMinutesInMs;
    }
    
    // For display in UI
    public String getStatusText() {
        if (isOnline()) {
            return "Online";
        } else if (lastSeen != null) {
            // Format the last seen time
            long timeDiffMs = System.currentTimeMillis() - lastSeen.getTime();
            if (timeDiffMs < 60_000) { // Less than a minute
                return "Last seen just now";
            } else if (timeDiffMs < 3_600_000) { // Less than an hour
                return "Last seen " + (timeDiffMs / 60_000) + " min ago";
            } else if (timeDiffMs < 86_400_000) { // Less than a day
                return "Last seen " + (timeDiffMs / 3_600_000) + " hours ago";
            } else {
                return "Last seen " + (timeDiffMs / 86_400_000) + " days ago";
            }
        }
        return "Offline";
    }
}
