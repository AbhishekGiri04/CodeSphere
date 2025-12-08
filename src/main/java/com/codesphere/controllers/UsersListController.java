package com.codesphere.controllers;

import com.codesphere.models.CollaborationEvent;
import com.codesphere.models.User;
import com.codesphere.services.CollaborationService;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.Tooltip;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Controller for the users sidebar
 */
public class UsersListController {
    
    @FXML
    private VBox usersContainer;
    
    @FXML
    private ListView<User> usersList;
    
    private CollaborationService collaborationService;
    private Timer refreshTimer;
    private final SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss");
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("MMM dd, yyyy HH:mm:ss");
    private User currentUser;
    
    public void initialize(User currentUser, CollaborationService collaborationService) {
        this.currentUser = currentUser;
        this.collaborationService = collaborationService;
        
        // Set up the ListView with a custom cell factory
        usersList.setCellFactory(lv -> new UserListCell());
        
        // Add listeners for collaboration events to update the user list
        collaborationService.addCollaborationEventListener(this::handleCollaborationEvent);
        
        // Initial refresh of the users list
        refreshUsersList();
        
        // Start a timer to refresh the users list periodically
        refreshTimer = new Timer(true);
        refreshTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                Platform.runLater(() -> refreshUsersList());
            }
        }, 5000, 5000); // Refresh every 5 seconds
    }
    
    private void handleCollaborationEvent(CollaborationEvent event) {
        if ("JOIN".equals(event.getType()) || "LEAVE".equals(event.getType()) || "CURSOR_MOVE".equals(event.getType())) {
            Platform.runLater(this::refreshUsersList);
        }
    }
    
    private void refreshUsersList() {
        if (collaborationService == null) return;
        
        List<User> activeUsers = collaborationService.getActiveUsers();
        
        // Find the index of the current user to keep them at the top
        User currentUserInList = null;
        for (User user : activeUsers) {
            if (user.getId().equals(currentUser.getId())) {
                currentUserInList = user;
                break;
            }
        }
        
        // Remove and re-add current user at the top
        if (currentUserInList != null) {
            activeUsers.remove(currentUserInList);
            activeUsers.add(0, currentUserInList);
        }
        
        usersList.getItems().clear();
        usersList.getItems().addAll(activeUsers);
    }
    
    public void cleanup() {
        if (refreshTimer != null) {
            refreshTimer.cancel();
            refreshTimer = null;
        }
    }
    
    /**
     * Custom cell for displaying user information
     */
    private class UserListCell extends javafx.scene.control.ListCell<User> {
        private final HBox container = new HBox(8);
        private final Circle statusIndicator = new Circle(5);
        private final VBox textContainer = new VBox(2);
        private final Label nameLabel = new Label();
        private final Label statusLabel = new Label();
        
        public UserListCell() {
            container.setAlignment(Pos.CENTER_LEFT);
            textContainer.setAlignment(Pos.CENTER_LEFT);
            HBox.setHgrow(textContainer, Priority.ALWAYS);
            
            nameLabel.getStyleClass().add("user-name");
            statusLabel.getStyleClass().add("user-status");
            statusLabel.setStyle("-fx-font-size: 10px; -fx-text-fill: #666666;");
            
            textContainer.getChildren().addAll(nameLabel, statusLabel);
            container.getChildren().addAll(statusIndicator, textContainer);
            
            setContentDisplay(javafx.scene.control.ContentDisplay.GRAPHIC_ONLY);
        }
        
        @Override
        protected void updateItem(User user, boolean empty) {
            super.updateItem(user, empty);
            
            if (empty || user == null) {
                setGraphic(null);
            } else {
                // Set user name and color
                nameLabel.setText(user.getName());
                
                // Special styling for current user
                if (user.getId().equals(currentUser.getId())) {
                    nameLabel.setText(user.getName() + " (You)");
                    nameLabel.setStyle("-fx-font-weight: bold;");
                } else {
                    nameLabel.setStyle(null);
                }
                
                // Set status indicator
                boolean isOnline = collaborationService.isUserOnline(user.getId());
                statusIndicator.setFill(isOnline ? Color.GREEN : Color.GRAY);
                
                // Set status text and tooltip
                if (isOnline) {
                    statusLabel.setText("Online");
                    
                    Date joinedAt = user.getJoinedAt();
                    String joinTime = joinedAt != null ? "Joined at " + timeFormat.format(joinedAt) : "";
                    Tooltip.install(container, new Tooltip(joinTime));
                } else {
                    Date lastActive = collaborationService.getLastActivityTime(user.getId());
                    if (lastActive != null) {
                        statusLabel.setText("Last seen: " + timeFormat.format(lastActive));
                        Tooltip.install(container, new Tooltip("Last active: " + dateFormat.format(lastActive)));
                    } else {
                        statusLabel.setText("Offline");
                    }
                }
                
                setGraphic(container);
            }
        }
    }
}
