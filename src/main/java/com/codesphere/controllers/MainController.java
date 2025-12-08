package com.codesphere.controllers;

import com.codesphere.models.User;
import com.codesphere.models.EditorLanguage;
import com.codesphere.services.CollaborationService;
import com.codesphere.services.UserService;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;
import javafx.util.Pair;
import javafx.scene.input.Clipboard;
import javafx.scene.input.ClipboardContent;
import java.io.File;
import java.io.IOException;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

/**
 * Controller for the main application window
 */
public class MainController {

    @FXML
    private BorderPane mainContainer;
    
    @FXML
    private TabPane mainTabPane;
    
    @FXML
    private MenuBar menuBar;
    
    @FXML
    private Label connectionStatus;
    
    @FXML
    private Label roomIdLabel;
    
    @FXML
    private Label userCountLabel;
    
    private UserService userService;
    private User currentUser;
    private CollaborationService collaborationService;
    private String currentRoomId;
    
    private CodeEditorController codeEditorController;
    private WhiteboardController whiteboardController;
    private ChatController chatController;
    private UsersListController usersListController;

    public void initialize() {
        userService = new UserService();
        currentUser = userService.generateDefaultUser();
        
        try {
            initializeUI();
        } catch (IOException e) {
            e.printStackTrace();
            showErrorDialog("Error initializing UI", e.getMessage());
        }
    }
    
    private void initializeUI() throws IOException {
        // Initialize collaboration service
        collaborationService = new CollaborationService(currentUser);
        
        // Load the code editor tab
        FXMLLoader codeEditorLoader = new FXMLLoader(getClass().getResource("/fxml/CodeEditor.fxml"));
        Tab codeEditorTab = new Tab("Code Editor", codeEditorLoader.load());
        codeEditorController = codeEditorLoader.getController();
        codeEditorController.initialize(currentUser);
        
        // Load the whiteboard tab
        FXMLLoader whiteboardLoader = new FXMLLoader(getClass().getResource("/fxml/Whiteboard.fxml"));
        Tab whiteboardTab = new Tab("Whiteboard", whiteboardLoader.load());
        whiteboardController = whiteboardLoader.getController();
        whiteboardController.initialize(currentUser);
        
        // Add tabs to the main tab pane
        mainTabPane.getTabs().addAll(codeEditorTab, whiteboardTab);
        
        // Load and set up the chat sidebar
        FXMLLoader chatLoader = new FXMLLoader(getClass().getResource("/fxml/ChatSidebar.fxml"));
        chatController = new ChatController();
        chatLoader.setController(chatController);
        mainContainer.setRight(chatLoader.load());
        
        // Load and set up the users sidebar
        FXMLLoader usersLoader = new FXMLLoader(getClass().getResource("/fxml/UsersSidebar.fxml"));
        usersListController = new UsersListController();
        usersLoader.setController(usersListController);
        mainContainer.setLeft(usersLoader.load());
        
        // Update UI elements for room status
        connectionStatus.setText("Not connected");
        roomIdLabel.setText("");
        userCountLabel.setText("Users: 1");
        
        // Check if user has a saved room to join
        if (currentUser.getLastRoomId() != null && !currentUser.getLastRoomId().isEmpty()) {
            Platform.runLater(() -> joinRoom(currentUser.getLastRoomId()));
        } else {
            // Ask user to join a room
            Platform.runLater(this::showJoinRoomDialog);
        }
    }
    
    @FXML
    public void showJoinRoomDialog() {
        RoomJoinDialog dialog = new RoomJoinDialog(currentUser);
        dialog.setTitle("Join Collaboration Room");
        dialog.setHeaderText("Enter a room code to join or create a collaboration session");
        
        // Show dialog and wait for result
        dialog.showAndWait().ifPresent(roomInfo -> {
            String roomId = roomInfo.getKey();
            boolean createIfNeeded = roomInfo.getValue();
            
            if (roomId != null && !roomId.trim().isEmpty()) {
                joinRoom(roomId);
                
                // Update user in the database with the new room ID
                currentUser.setLastRoomId(roomId);
                userService.updateUser(currentUser);
                
                // Update status
                connectionStatus.setText("Connected to room: " + roomId);
                roomIdLabel.setText("Room: " + roomId);
            }
        });
    }
    
    @FXML
    public void createAndJoinNewRoom() {
        String roomId = generateRoomId();
        joinRoom(roomId);
        
        // Update user in the database with the new room ID
        currentUser.setLastRoomId(roomId);
        userService.updateUser(currentUser);
        
        // Update status UI
        connectionStatus.setText("Connected to room: " + roomId);
        roomIdLabel.setText("Room: " + roomId);
        
        // Show dialog with room information
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Room Created");
        alert.setHeaderText("Room created successfully!");
        alert.setContentText("Your room code is: " + roomId + "\nShare this code with others to collaborate.");
        
        // Add a copy button to the alert
        ButtonType copyButtonType = new ButtonType("Copy Room Code", ButtonBar.ButtonData.OK_DONE);
        alert.getButtonTypes().add(copyButtonType);
        
        alert.showAndWait().ifPresent(buttonType -> {
            if (buttonType == copyButtonType) {
                final Clipboard clipboard = Clipboard.getSystemClipboard();
                final ClipboardContent content = new ClipboardContent();
                content.putString(roomId);
                clipboard.setContent(content);
            }
        });
    }
    
    @FXML
    public void leaveCurrentRoom() {
        if (currentRoomId != null) {
            if (collaborationService != null) {
                collaborationService.disconnect();
            }
            
            currentRoomId = null;
            
            // Reset controllers
            if (codeEditorController != null) {
                // Reset code editor to default state
                codeEditorController.setLanguage(EditorLanguage.JAVA);
            }
            
            // Update UI
            connectionStatus.setText("Not connected");
            roomIdLabel.setText("");
            userCountLabel.setText("Users: 1");
            
            // Update user in database
            currentUser.setLastRoomId(null);
            userService.updateUser(currentUser);
            
            showInfoDialog("Left Room", "You have left the current room.");
        }
    }
    
    private String generateRoomId() {
        // Generate a short random room ID (6 alphanumeric characters)
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitting similar characters
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.util.Random();
        
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return sb.toString();
    }
    
    private void joinRoom(String roomId) {
        // Clean up previous room connections
        if (collaborationService != null) {
            collaborationService.disconnect();
        }
        
        // Connect to the new room
        collaborationService = new CollaborationService(currentUser);
        collaborationService.connect(roomId);
        currentRoomId = roomId;
        
        // Update window title with room information
        Platform.runLater(() -> {
            // Update controllers with the collaboration service
            if (codeEditorController != null) {
                codeEditorController.connectToRoom(roomId);
            }
            
            // Initialize the users list controller with the collaboration service
            if (usersListController != null) {
                usersListController.initialize(currentUser, collaborationService);
            }
            
            // Update the chat controller
            if (chatController != null) {
                chatController.initialize(); // No arguments
            }
            
            // Update status UI
            connectionStatus.setText("Connected to room: " + roomId);
            roomIdLabel.setText("Room: " + roomId);
            
            // Listen for user count changes
            collaborationService.addCollaborationEventListener(event -> {
                if ("JOIN".equals(event.getType()) || "LEAVE".equals(event.getType())) {
                    int userCount = collaborationService.getActiveUsers().size();
                    Platform.runLater(() -> userCountLabel.setText("Users: " + userCount));
                }
            });
        });
    }
    
    @FXML
    public void changeUserName() {
        TextInputDialog dialog = new TextInputDialog(currentUser.getName());
        dialog.setTitle("Change Name");
        dialog.setHeaderText("Enter a new username");
        dialog.setContentText("Name:");
        
        dialog.showAndWait().ifPresent(name -> {
            if (!name.trim().isEmpty()) {
                currentUser.setName(name);
                
                // Save to database
                userService.updateUser(currentUser);
                
                // Rejoin room to update name
                if (currentRoomId != null) {
                    joinRoom(currentRoomId);
                }
            }
        });
    }
    
    @FXML
    public void executeCode() {
        if (codeEditorController != null) {
            codeEditorController.executeCode();
        }
    }
    
    @FXML
    public void formatCode() {
        if (codeEditorController != null) {
            codeEditorController.formatCode();
        }
    }
    
    // The following methods are commented out because they are undefined in CodeEditorController
    /*
    @FXML
    public void handleNewFile() {
        if (codeEditorController != null) {
            codeEditorController.newFile();
        }
    }
    @FXML
    public void handleOpenFile() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Open File");
        fileChooser.getExtensionFilters().addAll(
            new FileChooser.ExtensionFilter("Java Files", "*.java"),
            new FileChooser.ExtensionFilter("Python Files", "*.py"),
            new FileChooser.ExtensionFilter("C++ Files", "*.cpp", "*.h"),
            new FileChooser.ExtensionFilter("JavaScript Files", "*.js"),
            new FileChooser.ExtensionFilter("All Files", "*.*")
        );
        
        Stage stage = (Stage) mainContainer.getScene().getWindow();
        File selectedFile = fileChooser.showOpenDialog(stage);
        
        if (selectedFile != null && codeEditorController != null) {
            codeEditorController.openFile(selectedFile);
        }
    }
    @FXML
    public void handleSaveFile() {
        if (codeEditorController != null) {
            codeEditorController.saveFile(false);
        }
    }
    @FXML
    public void handleSaveFileAs() {
        if (codeEditorController != null) {
            codeEditorController.saveFile(true);
        }
    }
    @FXML
    public void handleCut() {
        if (codeEditorController != null) {
            codeEditorController.cut();
        }
    }
    @FXML
    public void handleCopy() {
        if (codeEditorController != null) {
            codeEditorController.copy();
        }
    }
    @FXML
    public void handlePaste() {
        if (codeEditorController != null) {
            codeEditorController.paste();
        }
    }
    @FXML
    public void handleUndo() {
        if (codeEditorController != null) {
            codeEditorController.undo();
        }
    }
    @FXML
    public void handleRedo() {
        if (codeEditorController != null) {
            codeEditorController.redo();
        }
    }
    */
    
    @FXML
    public void handleExit() {
        handleApplicationShutdown();
        Platform.exit();
    }
    
    @FXML
    public void showAboutDialog() {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("About CodeSphere");
        alert.setHeaderText("CodeSphere");
        alert.setContentText("Version 1.0\n\nA Java-centric collaborative code editor with real-time collaboration, whiteboard, and code execution capabilities.");
        alert.showAndWait();
    }
    
    private void showErrorDialog(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle("Error");
        alert.setHeaderText(title);
        alert.setContentText(content);
        alert.showAndWait();
    }
    
    private void showInfoDialog(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Information");
        alert.setHeaderText(title);
        alert.setContentText(content);
        alert.showAndWait();
    }
    
    public void handleApplicationShutdown() {
        // Clean up resources
        if (collaborationService != null) {
            collaborationService.disconnect();
        }
        
        if (codeEditorController != null) {
            codeEditorController.cleanup();
        }
        
        if (usersListController != null) {
            usersListController.cleanup();
        }
        
        // Shutdown user service
        if (userService != null) {
            userService.shutdown();
        }
    }
}
