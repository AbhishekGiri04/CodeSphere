
package com.codesphere.controllers;

import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.ListView;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;

/**
 * Controller for the chat sidebar
 */
public class ChatController {
    
    @FXML
    private VBox chatContainer;
    
    @FXML
    private ListView<String> messagesList;
    
    @FXML
    private TextField messageInput;
    
    @FXML
    private Button sendButton;
    
    public void initialize() {
        // Initialize the messages list
        messagesList.getItems().add("System: Welcome to CodeSphere Chat!");
        
        // Configure the send button
        sendButton.setOnAction(event -> sendMessage());
        
        // Handle enter key in text field
        messageInput.setOnAction(event -> sendMessage());
    }
    
    private void sendMessage() {
        String message = messageInput.getText().trim();
        if (!message.isEmpty()) {
            messagesList.getItems().add("You: " + message);
            messageInput.clear();
        }
    }
}
