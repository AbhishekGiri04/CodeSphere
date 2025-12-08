
package com.codesphere;

import com.codesphere.controllers.MainController;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

import java.io.IOException;

/**
 * Main application class for CodeSphere
 */
public class CodeSphereApplication extends Application {
    private MainController controller;

    @Override
    public void start(Stage primaryStage) throws IOException {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/Main.fxml"));
        Parent root = loader.load();
        controller = loader.getController();
        controller.initialize();
        
        Scene scene = new Scene(root, 1280, 800);
        scene.getStylesheets().add(getClass().getResource("/styles/main.css").toExternalForm());
        
        primaryStage.setTitle("CodeSphere");
        primaryStage.getIcons().add(new Image(getClass().getResourceAsStream("/images/favicon.png")));
        primaryStage.setScene(scene);
        primaryStage.setOnCloseRequest(event -> {
            controller.handleApplicationShutdown();
        });
        primaryStage.show();
    }
    
    @Override
    public void stop() {
        // Additional cleanup if needed
        if (controller != null) {
            controller.handleApplicationShutdown();
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}
