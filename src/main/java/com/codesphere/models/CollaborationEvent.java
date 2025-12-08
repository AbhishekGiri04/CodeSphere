
package com.codesphere.models;

import java.util.Map;

/**
 * Represents a collaboration event (cursor move, join, leave, etc.)
 */
public class CollaborationEvent {
    private String type; // JOIN, LEAVE, CURSOR_MOVE, etc.
    private User user;
    private Map<String, Object> data;
    
    public CollaborationEvent() {
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Map<String, Object> getData() {
        return data;
    }
    
    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
