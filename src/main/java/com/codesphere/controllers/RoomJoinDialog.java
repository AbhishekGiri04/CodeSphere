
package com.codesphere.controllers;

import com.codesphere.models.User;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.GridPane;
import javafx.util.Pair;

/**
 * Dialog for joining a room
 */
public class RoomJoinDialog extends Dialog<Pair<String, Boolean>> {
    
    private final TextField roomIdField;
    private final CheckBox createNewRoomCheckbox;
    private final User currentUser;
    
    public RoomJoinDialog(User currentUser) {
        this.currentUser = currentUser;
        
        setTitle("Join Collaboration Room");
        setHeaderText("Enter a room code to join or create a collaboration session");
        
        // Set the button types
        ButtonType joinButtonType = new ButtonType("Join Room", ButtonBar.ButtonData.OK_DONE);
        ButtonType createButtonType = new ButtonType("Create New Room", ButtonBar.ButtonData.OTHER);
        getDialogPane().getButtonTypes().addAll(joinButtonType, createButtonType, ButtonType.CANCEL);
        
        // Create the room ID field and checkbox
        roomIdField = new TextField();
        roomIdField.setPromptText("Room Code");
        roomIdField.setPrefWidth(250);
        
        // If this is the first time joining (no code), generate a random one
        if (currentUser.getLastRoomId() == null || currentUser.getLastRoomId().isEmpty()) {
            roomIdField.setText(generateRandomRoomCode());
        } else {
            roomIdField.setText(currentUser.getLastRoomId());
        }
        
        createNewRoomCheckbox = new CheckBox("Create new room if it doesn't exist");
        createNewRoomCheckbox.setSelected(true);
        
        // Create layout with better padding and spacing
        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(20, 20, 10, 10));
        
        grid.add(new Label("Room Code:"), 0, 0);
        grid.add(roomIdField, 1, 0);
        grid.add(createNewRoomCheckbox, 0, 1, 2, 1);
        
        // Add option to generate a random room code
        Hyperlink generateLink = new Hyperlink("Generate random room code");
        generateLink.setOnAction(event -> roomIdField.setText(generateRandomRoomCode()));
        grid.add(generateLink, 1, 2);
        
        // Enable/Disable join button depending on whether a room ID was entered
        Button joinButton = (Button) getDialogPane().lookupButton(joinButtonType);
        joinButton.setDisable(false); // Enable by default since we provide a code
        
        // Create New Room button handler
        Button createButton = (Button) getDialogPane().lookupButton(createButtonType);
        createButton.setOnAction(event -> {
            roomIdField.setText(generateRandomRoomCode());
            createNewRoomCheckbox.setSelected(true);
            // Fire join button to close dialog with the generated code
            joinButton.fire();
        });
        
        // Do validation for empty field
        roomIdField.textProperty().addListener((observable, oldValue, newValue) -> {
            joinButton.setDisable(newValue.trim().isEmpty());
        });
        
        getDialogPane().setContent(grid);
        
        // Request focus on the room ID field by default
        roomIdField.requestFocus();
        
        // Convert the result to a pair when the join button is clicked
        setResultConverter(dialogButton -> {
            if (dialogButton == joinButtonType) {
                String roomCode = roomIdField.getText().trim();
                if (!roomCode.isEmpty()) {
                    // Save the room code to user for next time
                    currentUser.setLastRoomId(roomCode);
                    return new Pair<>(roomCode, createNewRoomCheckbox.isSelected());
                }
            }
            return null;
        });
    }
    
    private String generateRandomRoomCode() {
        // Generate a simple random 6-character alphanumeric code
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitting similar characters
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return sb.toString();
    }
    
    public String getRoomId() {
        return roomIdField.getText();
    }
    
    public boolean shouldCreateNewRoom() {
        return createNewRoomCheckbox.isSelected();
    }
}
