package com.codesphere.services;

import com.codesphere.models.CollaborationEvent;
import com.codesphere.models.EditorChange;
import com.codesphere.models.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

/**
 * Service handling real-time collaboration features
 */
public class CollaborationService {
    private final String serverUrl = "ws://localhost:8080/collaboration";
    private WebSocketSession session;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final List<Consumer<EditorChange>> editorChangeListeners = new ArrayList<>();
    private final List<Consumer<CollaborationEvent>> collaborationEventListeners = new ArrayList<>();
    private User currentUser;
    private String currentRoomId;
    
    // Track all active users
    private final Map<String, User> activeUsers = new ConcurrentHashMap<>();
    private final Map<String, Date> lastActivityMap = new ConcurrentHashMap<>();

    public CollaborationService(User user) {
        this.currentUser = user;
        // Add current user to active users
        activeUsers.put(user.getId(), user);
        lastActivityMap.put(user.getId(), new Date());
        
        // Set the join time if not already set
        if (user.getJoinedAt() == null) {
            user.setJoinedAt(new Date());
        }
    }

    public void connect(String roomId) {
        this.currentRoomId = roomId;
        try {
            // Only add the real user who is joining
            activeUsers.put(currentUser.getId(), currentUser);
            lastActivityMap.put(currentUser.getId(), new Date());
            // Set the join time if not already set
            if (currentUser.getJoinedAt() == null) {
                currentUser.setJoinedAt(new Date());
            }
            // Notify listeners about the join event
            CollaborationEvent joinEvent = new CollaborationEvent();
            joinEvent.setType("JOIN");
            joinEvent.setUser(currentUser);
            Map<String, Object> data = new HashMap<>();
            data.put("roomId", roomId);
            data.put("joinTime", new Date());
            joinEvent.setData(data);
            for (Consumer<CollaborationEvent> listener : collaborationEventListeners) {
                listener.accept(joinEvent);
            }
            // Real WebSocket connection logic (if needed) can go here
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public void disconnect() {
        // Simulate a leave event for the real user
        CollaborationEvent leaveEvent = new CollaborationEvent();
        leaveEvent.setType("LEAVE");
        leaveEvent.setUser(currentUser);
        leaveEvent.setData(null);
        for (Consumer<CollaborationEvent> listener : collaborationEventListeners) {
            listener.accept(leaveEvent);
        }
        activeUsers.remove(currentUser.getId());
    }

    public void sendEditorChange(EditorChange change) {
        // Update current user activity time
        updateUserActivity(currentUser.getId());
        change.setUser(currentUser);
        // Notify listeners directly
        for (Consumer<EditorChange> listener : editorChangeListeners) {
            listener.accept(change);
        }
    }

    public void sendCursorPosition(int line, int column) {
        // Update current user activity time
        updateUserActivity(currentUser.getId());
        CollaborationEvent event = new CollaborationEvent();
        event.setType("CURSOR_MOVE");
        event.setUser(currentUser);
        event.setData(Map.of("line", line, "column", column));
        for (Consumer<CollaborationEvent> listener : collaborationEventListeners) {
            if (currentUser.getId().equals(event.getUser().getId())) continue;
            listener.accept(event);
        }
    }
    
    private void updateUserActivity(String userId) {
        lastActivityMap.put(userId, new Date());
        
        // Update user active status
        User user = activeUsers.get(userId);
        if (user != null) {
            user.setActive(true);
        }
    }
    
    public boolean isUserOnline(String userId) {
        Date lastActivity = lastActivityMap.get(userId);
        if (lastActivity == null) {
            return false;
        }
        
        // Consider a user offline if no activity in the last 5 minutes
        long fiveMinutesInMs = 5 * 60 * 1000;
        return System.currentTimeMillis() - lastActivity.getTime() < fiveMinutesInMs;
    }
    
    public Date getLastActivityTime(String userId) {
        return lastActivityMap.get(userId);
    }
    
    public List<User> getActiveUsers() {
        List<User> users = new ArrayList<>(activeUsers.values());
        
        // Update online status for each user
        for (User user : users) {
            user.setActive(isUserOnline(user.getId()));
        }
        
        return users;
    }

    public void addEditorChangeListener(Consumer<EditorChange> listener) {
        editorChangeListeners.add(listener);
    }

    public void addCollaborationEventListener(Consumer<CollaborationEvent> listener) {
        collaborationEventListeners.add(listener);
    }

    private class CollaborationWebSocketHandler extends TextWebSocketHandler {
        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            try {
                // Send a join event
                CollaborationEvent joinEvent = new CollaborationEvent();
                joinEvent.setType("JOIN");
                joinEvent.setUser(currentUser);
                joinEvent.setData(Map.of("roomId", currentRoomId, "joinTime", new Date()));
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(joinEvent)));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void handleTextMessage(WebSocketSession session, TextMessage message) {
            try {
                String payload = message.getPayload();
                // Determine if it's an editor change or collaboration event
                if (payload.contains("\"type\":")) {
                    CollaborationEvent event = objectMapper.readValue(payload, CollaborationEvent.class);
                    
                    // Handle user presence
                    if ("JOIN".equals(event.getType())) {
                        // Add the user to active users
                        activeUsers.put(event.getUser().getId(), event.getUser());
                        lastActivityMap.put(event.getUser().getId(), new Date());
                    } else if ("LEAVE".equals(event.getType())) {
                        // Remove the user from active users
                        activeUsers.remove(event.getUser().getId());
                    } else {
                        // Update user activity time for other events
                        updateUserActivity(event.getUser().getId());
                    }
                    
                    // Don't process events from the current user
                    if (!event.getUser().getId().equals(currentUser.getId())) {
                        for (Consumer<CollaborationEvent> listener : collaborationEventListeners) {
                            listener.accept(event);
                        }
                    }
                } else {
                    EditorChange change = objectMapper.readValue(payload, EditorChange.class);
                    
                    // Update user activity time
                    updateUserActivity(change.getUser().getId());
                    
                    // Don't process changes from the current user
                    if (!change.getUser().getId().equals(currentUser.getId())) {
                        for (Consumer<EditorChange> listener : editorChangeListeners) {
                            listener.accept(change);
                        }
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
            // Handle reconnection logic here if needed
        }
    }
}
