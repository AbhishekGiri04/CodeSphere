
package com.codesphere.controllers;

import com.codesphere.models.User;
import com.codesphere.models.WhiteboardTool;
import javafx.fxml.FXML;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.control.Button;
import javafx.scene.control.ToggleButton;
import javafx.scene.control.ToggleGroup;
import javafx.scene.control.Tooltip;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

/**
 * Controller for the whiteboard component
 */
public class WhiteboardController {

    @FXML
    private Canvas canvas;
    
    @FXML
    private HBox toolbox;
    
    @FXML
    private Pane canvasContainer;
    
    private GraphicsContext gc;
    private WhiteboardTool selectedTool = WhiteboardTool.PEN;
    private double startX, startY;
    private boolean isDrawing = false;
    private User currentUser;
    
    private final ToggleGroup toolGroup = new ToggleGroup();

    public void initialize(User user) {
        this.currentUser = user;
        
        // Initialize canvas and get graphics context
        gc = canvas.getGraphicsContext2D();
        
        // Set default canvas background
        gc.setFill(Color.WHITE);
        gc.fillRect(0, 0, canvas.getWidth(), canvas.getHeight());
        
        // Make canvas resize with its container
        canvasContainer.widthProperty().addListener((obs, oldVal, newVal) -> {
            canvas.setWidth(newVal.doubleValue());
            redrawCanvas();
        });
        
        canvasContainer.heightProperty().addListener((obs, oldVal, newVal) -> {
            canvas.setHeight(newVal.doubleValue());
            redrawCanvas();
        });
        
        // Set up mouse event handlers
        canvas.addEventHandler(MouseEvent.MOUSE_PRESSED, this::startDrawing);
        canvas.addEventHandler(MouseEvent.MOUSE_DRAGGED, this::draw);
        canvas.addEventHandler(MouseEvent.MOUSE_RELEASED, this::finishDrawing);
        
        // Initialize the toolbar
        initializeToolbar();
    }
    
    private void initializeToolbar() {
        // Create toggle buttons for each tool
        createToolButton("Select", WhiteboardTool.SELECT);
        createToolButton("Pen", WhiteboardTool.PEN);
        createToolButton("Rectangle", WhiteboardTool.RECTANGLE);
        createToolButton("Arrow", WhiteboardTool.ARROW);
        createToolButton("Text", WhiteboardTool.TEXT);
        createToolButton("Flowchart", WhiteboardTool.FLOWCHART);
        createToolButton("Eraser", WhiteboardTool.ERASER);
        
        // Select pen tool by default
        toolGroup.getToggles().stream()
                .filter(toggle -> ((ToggleButton) toggle).getUserData() == WhiteboardTool.PEN)
                .findFirst()
                .ifPresent(toggle -> toggle.setSelected(true));
    }
    
    private void createToolButton(String name, WhiteboardTool tool) {
        ToggleButton button = new ToggleButton(name);
        button.setUserData(tool);
        button.setToggleGroup(toolGroup);
        button.setTooltip(new Tooltip(name));
        button.getStyleClass().add("tool-button");
        
        button.setOnAction(event -> selectedTool = tool);
        
        toolbox.getChildren().add(button);
    }
    
    private void redrawCanvas() {
        // In a real application, we would store drawing actions and replay them
        // For now, just clear to white
        gc.setFill(Color.WHITE);
        gc.fillRect(0, 0, canvas.getWidth(), canvas.getHeight());
    }
    
    private void startDrawing(MouseEvent event) {
        startX = event.getX();
        startY = event.getY();
        isDrawing = true;
        
        if (selectedTool == WhiteboardTool.PEN) {
            gc.setStroke(Color.BLACK);
            gc.setLineWidth(2);
            gc.beginPath();
            gc.moveTo(startX, startY);
        } else if (selectedTool == WhiteboardTool.ERASER) {
            gc.setStroke(Color.WHITE);
            gc.setLineWidth(20);
            gc.beginPath();
            gc.moveTo(startX, startY);
        }
    }
    
    private void draw(MouseEvent event) {
        if (!isDrawing) return;
        
        double currentX = event.getX();
        double currentY = event.getY();
        
        if (selectedTool == WhiteboardTool.PEN || selectedTool == WhiteboardTool.ERASER) {
            gc.lineTo(currentX, currentY);
            gc.stroke();
        }
    }
    
    private void finishDrawing(MouseEvent event) {
        if (!isDrawing) return;
        
        double endX = event.getX();
        double endY = event.getY();
        
        switch (selectedTool) {
            case RECTANGLE:
                drawRectangle(startX, startY, endX, endY);
                break;
            case ARROW:
                drawArrow(startX, startY, endX, endY);
                break;
            case TEXT:
                drawText("Text", endX, endY);
                break;
            case FLOWCHART:
                drawEllipse(startX, startY, endX, endY);
                break;
        }
        
        isDrawing = false;
    }
    
    private void drawRectangle(double startX, double startY, double endX, double endY) {
        gc.setStroke(Color.BLACK);
        gc.setLineWidth(2);
        gc.strokeRect(
                Math.min(startX, endX),
                Math.min(startY, endY),
                Math.abs(endX - startX),
                Math.abs(endY - startY)
        );
    }
    
    private void drawArrow(double startX, double startY, double endX, double endY) {
        double headLength = 10;
        double angle = Math.atan2(endY - startY, endX - startX);
        
        gc.setStroke(Color.BLACK);
        gc.setLineWidth(2);
        
        // Draw the line
        gc.beginPath();
        gc.moveTo(startX, startY);
        gc.lineTo(endX, endY);
        gc.stroke();
        
        // Draw the arrowhead
        gc.beginPath();
        gc.moveTo(endX, endY);
        gc.lineTo(
                endX - headLength * Math.cos(angle - Math.PI/6),
                endY - headLength * Math.sin(angle - Math.PI/6)
        );
        gc.moveTo(endX, endY);
        gc.lineTo(
                endX - headLength * Math.cos(angle + Math.PI/6),
                endY - headLength * Math.sin(angle + Math.PI/6)
        );
        gc.stroke();
    }
    
    private void drawText(String text, double x, double y) {
        gc.setFill(Color.BLACK);
        gc.fillText(text, x, y);
    }
    
    private void drawEllipse(double startX, double startY, double endX, double endY) {
        double width = Math.abs(endX - startX);
        double height = Math.abs(endY - startY);
        double x = Math.min(startX, endX);
        double y = Math.min(startY, endY);
        
        gc.setStroke(Color.BLACK);
        gc.setLineWidth(2);
        gc.strokeOval(x, y, width, height);
    }
}
