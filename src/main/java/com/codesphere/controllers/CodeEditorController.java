package com.codesphere.controllers;

import com.codesphere.models.EditorChange;
import com.codesphere.models.EditorLanguage;
import com.codesphere.models.User;
import com.codesphere.services.CollaborationService;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import org.fxmisc.richtext.CodeArea;
import org.fxmisc.richtext.LineNumberFactory;
import org.fxmisc.richtext.model.StyleSpans;
import org.fxmisc.richtext.model.StyleSpansBuilder;

import java.time.Duration;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.List;
import java.util.ArrayList;
import java.util.regex.MatchResult;

/**
 * Controller for the code editor component
 */
public class CodeEditorController {
    
    @FXML
    private BorderPane codeEditorContainer;
    
    @FXML
    private ComboBox<EditorLanguage> languageSelector;
    
    @FXML
    private Label collaborationStatusLabel;
    
    @FXML
    private HBox activeCursorsContainer;
    
    @FXML
    private TextArea outputArea;
    
    private CodeArea codeArea;
    private User currentUser;
    private CollaborationService collaborationService;
    private ExecutorService executor;
    private String roomId = "default-room";
    private boolean isDirtyFlag = false;
    private boolean isInitialLoad = true;
    
    // Maps to track remote cursors
    private final Map<String, Integer> remoteCursors = new HashMap<>();
    
    // Pattern for Java syntax highlighting
    private static final String JAVA_KEYWORDS = "\\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|true|try|void|volatile|while)\\b";
    private static final String JAVA_STRING_PATTERN = "\"([^\"\\\\]|\\\\.)*\"";
    private static final String JAVA_COMMENT_PATTERN = "//[^\n]*" + "|" + "/\\*(.|\\R)*?\\*/";
    private static final Pattern JAVA_PATTERN = Pattern.compile(
            "(?<KEYWORD>" + JAVA_KEYWORDS + ")"
            + "|(?<STRING>" + JAVA_STRING_PATTERN + ")"
            + "|(?<COMMENT>" + JAVA_COMMENT_PATTERN + ")"
    );
    
    // Pattern for Python syntax highlighting
    private static final String PYTHON_KEYWORDS = "\\b(and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\\b";
    private static final String PYTHON_STRING_PATTERN = "\"\"\"(.|\\R)*?\"\"\"" + "|" + "'''(.|\\R)*?'''" + "|" + "\"([^\"\\\\]|\\\\.)*\"" + "|" + "'([^'\\\\]|\\\\.)*'";
    private static final String PYTHON_COMMENT_PATTERN = "#[^\n]*";
    private static final Pattern PYTHON_PATTERN = Pattern.compile(
            "(?<KEYWORD>" + PYTHON_KEYWORDS + ")"
            + "|(?<STRING>" + PYTHON_STRING_PATTERN + ")"
            + "|(?<COMMENT>" + PYTHON_COMMENT_PATTERN + ")"
    );
    
    // Pattern for C++ syntax highlighting
    private static final String CPP_KEYWORDS = "\\b(auto|break|case|catch|char|class|const|continue|default|delete|do|double|else|enum|explicit|export|extern|float|for|friend|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|register|return|short|signed|sizeof|static|struct|switch|template|this|throw|throws|transient|true|try|typeof|var|void|volatile|while)\\b";
    private static final String CPP_STRING_PATTERN = "\"([^\"\\\\]|\\\\.)*\"";
    private static final String CPP_COMMENT_PATTERN = "//[^\n]*" + "|" + "/\\*(.|\\R)*?\\*/";
    private static final Pattern CPP_PATTERN = Pattern.compile(
            "(?<KEYWORD>" + CPP_KEYWORDS + ")"
            + "|(?<STRING>" + CPP_STRING_PATTERN + ")"
            + "|(?<COMMENT>" + CPP_COMMENT_PATTERN + ")"
    );
    
    // Pattern for JavaScript syntax highlighting
    private static final String JS_KEYWORDS = "\\b(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield)\\b";
    private static final String JS_STRING_PATTERN = "\"([^\"\\\\]|\\\\.)*\"" + "|" + "'([^'\\\\]|\\\\.)*'";
    private static final String JS_COMMENT_PATTERN = "//[^\n]*" + "|" + "/\\*(.|\\R)*?\\*/";
    private static final Pattern JS_PATTERN = Pattern.compile(
            "(?<KEYWORD>" + JS_KEYWORDS + ")"
            + "|(?<STRING>" + JS_STRING_PATTERN + ")"
            + "|(?<COMMENT>" + JS_COMMENT_PATTERN + ")"
    );
    
    private static final String JAVA_TEMPLATE = "public class Main {\n" +
            "    public static void main(String[] args) {\n" +
            "        System.out.println(\"Hello, CodeSphere!\");\n" +
            "    }\n" +
            "}";
    
    private static final String PYTHON_TEMPLATE = "def main():\n" +
            "    print(\"Hello, CodeSphere!\")\n" +
            "\n" +
            "if __name__ == \"__main__\":\n" +
            "    main()";
    
    private static final String CPP_TEMPLATE = "#include <iostream>\n" +
            "\n" +
            "int main() {\n" +
            "    std::cout << \"Hello, CodeSphere!\" << std::endl;\n" +
            "    return 0;\n" +
            "}";
    
    private static final String JAVASCRIPT_TEMPLATE = "function main() {\n" +
            "    console.log(\"Hello, CodeSphere!\");\n" +
            "}\n" +
            "\n" +
            "main();";
    
    public void initialize(User user) {
        this.currentUser = user;
        this.executor = Executors.newSingleThreadExecutor();
        
        // Initialize code area with proper settings to enable editing
        codeArea = new CodeArea();
        codeArea.setParagraphGraphicFactory(LineNumberFactory.get(codeArea));
        codeArea.setWrapText(true);
        
        // Important: Make sure editor is editable and focusable
        codeArea.setEditable(true);
        codeArea.setFocusTraversable(true);
        codeArea.requestFocus();
        
        codeArea.setStyle("-fx-font-family: 'Monospaced'; -fx-font-size: 14px;");
        
        // Add syntax highlighting
        codeArea.richChanges()
                .filter(ch -> !ch.getInserted().equals(ch.getRemoved())) // Filter out no-op changes
                .successionEnds(Duration.ofMillis(500))
                .supplyTask(() -> {
                    javafx.concurrent.Task<StyleSpans<Collection<String>>> task = new javafx.concurrent.Task<>() {
                        @Override
                        protected StyleSpans<Collection<String>> call() {
                            return computeHighlighting();
                        }
                    };
                    return task;
                })
                .awaitLatest(codeArea.richChanges())
                .filterMap(t -> {
                    if (t.isSuccess()) {
                        return java.util.Optional.of(t.get());
                    } else {
                        t.getFailure().printStackTrace();
                        return java.util.Optional.empty();
                    }
                })
                .subscribe(this::applyHighlighting);
        
        // Track changes for collaboration
        codeArea.textProperty().addListener((obs, oldText, newText) -> {
            if (oldText == null || newText == null) return;
            
            // Skip initial loading changes
            if (isInitialLoad) {
                isInitialLoad = false;
                return;
            }
            
            isDirtyFlag = true;
            
            // Only send changes if connected to a room and not initial loading
            if (collaborationService != null && isDirtyFlag) {
                EditorChange change = new EditorChange();
                change.setStartPosition(0);
                change.setEndPosition(oldText.length());
                change.setInsertedText(newText);
                change.setRemovedText(oldText);
                
                collaborationService.sendEditorChange(change);
            }
        });
        
        // Add code area to the container
        codeEditorContainer.setCenter(codeArea);
        
        // Set up language selector
        languageSelector.getItems().addAll(EditorLanguage.values());
        languageSelector.setValue(EditorLanguage.JAVA);
        languageSelector.setOnAction(event -> setLanguage(languageSelector.getValue()));
        
        // Initialize with Java code
        setLanguage(EditorLanguage.JAVA);
        
        // Click handler for the code area to ensure it gets focus
        codeEditorContainer.setOnMouseClicked(event -> {
            codeArea.requestFocus();
        });
    }
    
    public void connectToRoom(String roomId) {
        this.roomId = roomId;
        
        // Initialize collaboration service
        collaborationService = new CollaborationService(currentUser);
        collaborationService.connect(roomId);
        
        collaborationStatusLabel.setText("Connected to room: " + roomId);
        
        // Listen for cursor position changes
        codeArea.caretPositionProperty().addListener((obs, oldPos, newPos) -> {
            int line = codeArea.getCurrentParagraph();
            int column = codeArea.getCaretColumn();
            
            // Send cursor position to collaborators
            collaborationService.sendCursorPosition(line, column);
        });
        
        // Listen for editor changes from collaborators
        collaborationService.addEditorChangeListener(change -> {
            Platform.runLater(() -> {
                // Don't process our own changes to avoid circular updates
                if (!change.getUser().getId().equals(currentUser.getId())) {
                    // Temporarily disable dirty flag to avoid sending the change back
                    isDirtyFlag = false;
                    codeArea.replaceText(change.getStartPosition(), change.getEndPosition(), change.getInsertedText());
                    isDirtyFlag = true;
                }
            });
        });
        
        // Listen for collaboration events (cursor movements, etc.)
        collaborationService.addCollaborationEventListener(event -> {
            if ("CURSOR_MOVE".equals(event.getType())) {
                String userId = event.getUser().getId();
                Map<String, Object> data = event.getData();
                int line = (int) data.get("line");
                int column = (int) data.get("column");
                
                // Store cursor position
                remoteCursors.put(userId, codeArea.getAbsolutePosition(line, column));
                
                // Update UI to show remote cursors
                Platform.runLater(() -> {
                    updateRemoteCursorsDisplay();
                });
            }
        });
    }
    
    private void updateRemoteCursorsDisplay() {
        activeCursorsContainer.getChildren().clear();
        
        remoteCursors.forEach((userId, position) -> {
            // Find the user from the collaboration service
            User user = collaborationService.getActiveUsers().stream()
                    .filter(u -> u.getId().equals(userId))
                    .findFirst().orElse(null);
            
            if (user != null) {
                Label cursorLabel = new Label(user.getName());
                cursorLabel.getStyleClass().add("remote-cursor-indicator");
                cursorLabel.setStyle("-fx-background-color: " + user.getColor() + ";");
                activeCursorsContainer.getChildren().add(cursorLabel);
            }
        });
    }
    
    public void setLanguage(EditorLanguage language) {
        // Store current text if it's been modified
        String currentText = codeArea.getText();
        boolean wasEmpty = currentText.trim().isEmpty();
        boolean isDefault = isDefaultTemplate(currentText);
        
        // Only replace with template if empty or contains a default template
        if (wasEmpty || isDefault) {
            isInitialLoad = true;  // Prevent sending template as collaboration change
            
            switch (language) {
                case JAVA:
                    codeArea.replaceText(JAVA_TEMPLATE);
                    break;
                case PYTHON:
                    codeArea.replaceText(PYTHON_TEMPLATE);
                    break;
                case CPP:
                    codeArea.replaceText(CPP_TEMPLATE);
                    break;
                case JAVASCRIPT:
                    codeArea.replaceText(JAVASCRIPT_TEMPLATE);
                    break;
            }
            
            // Reset dirty flag as this is just template loading
            isDirtyFlag = false;
        }
        
        // Trigger syntax highlighting
        codeArea.setStyleSpans(0, computeHighlighting());
    }
    
    private boolean isDefaultTemplate(String code) {
        return code.equals(JAVA_TEMPLATE) || 
               code.equals(PYTHON_TEMPLATE) || 
               code.equals(CPP_TEMPLATE) || 
               code.equals(JAVASCRIPT_TEMPLATE);
    }
    
    public void executeCode() {
        // Get the code and language
        String code = codeArea.getText();
        EditorLanguage language = languageSelector.getValue();
        
        // Clear previous output
        outputArea.clear();
        outputArea.setText("Executing " + language + " code...\n");
        
        // Here we would normally send to a backend service to execute
        // For now, just simulate execution with a delay
        new Thread(() -> {
            try {
                // Simulate processing time
                Thread.sleep(1000);
                
                // Generate output based on language
                String output;
                switch (language) {
                    case JAVA:
                        output = simulateJavaExecution(code);
                        break;
                    case PYTHON:
                        output = simulatePythonExecution(code);
                        break;
                    case CPP:
                        output = simulateCppExecution(code);
                        break;
                    case JAVASCRIPT:
                        output = simulateJavaScriptExecution(code);
                        break;
                    default:
                        output = "Unsupported language";
                }
                
                // Update UI on JavaFX thread
                Platform.runLater(() -> {
                    outputArea.appendText("\n" + output);
                });
            } catch (InterruptedException e) {
                Platform.runLater(() -> {
                    outputArea.appendText("\nExecution interrupted");
                });
            }
        }).start();
    }
    
    private String simulateJavaExecution(String code) {
        StringBuilder output = new StringBuilder();
        
        try {
            // Check if code contains System.out.println
            if (code.contains("System.out.println") || code.contains("System.out.print")) {
                // Extract content inside println
                List<String> printStatements = new ArrayList<>();
                
                // Handle both println and print
                String printlnRegex = "System\\.out\\.println\\s*\\(\\s*[\"'](.+?)[\"']\\s*\\)";
                String printRegex = "System\\.out\\.print\\s*\\(\\s*[\"'](.+?)[\"']\\s*\\)";
                
                Pattern printlnPattern = Pattern.compile(printlnRegex);
                Matcher printlnMatcher = printlnPattern.matcher(code);
                while (printlnMatcher.find()) {
                    printStatements.add(printlnMatcher.group(1) + "\n");
                }
                
                Pattern printPattern = Pattern.compile(printRegex);
                Matcher printMatcher = printPattern.matcher(code);
                while (printMatcher.find()) {
                    printStatements.add(printMatcher.group(1));
                }
                
                if (!printStatements.isEmpty()) {
                    for (String statement : printStatements) {
                        output.append(statement);
                    }
                } else {
                    // Handle more complex print statements with variables
                    output.append("Output contains dynamic variables (not shown in simulation)\n");
                }
            } else {
                output.append("No output detected in code.\n");
            }
            
            // Additional code analysis for educational purposes
            if (code.contains("for") && code.contains("while")) {
                output.append("\nNote: Your code contains both for and while loops.\n");
            }
            
            if (code.contains("try") && code.contains("catch")) {
                output.append("Note: Your code includes exception handling.\n");
            }
            
            output.append("\nJava compilation successful.\nExecution completed in 0.25s");
        } catch (Exception e) {
            output.append("Error analyzing code: ").append(e.getMessage()).append("\n");
        }
        
        return output.toString();
    }
    
    private String simulatePythonExecution(String code) {
        StringBuilder output = new StringBuilder();
        
        try {
            // Check if code contains print
            if (code.contains("print")) {
                // Extract content inside print
                List<String> printStatements = new ArrayList<>();
                String regex = "print\\s*\\(\\s*[\"'](.+?)[\"']\\s*\\)";
                Pattern pattern = Pattern.compile(regex);
                Matcher matcher = pattern.matcher(code);
                
                while (matcher.find()) {
                    printStatements.add(matcher.group(1));
                }
                
                if (!printStatements.isEmpty()) {
                    for (String statement : printStatements) {
                        output.append(statement).append("\n");
                    }
                } else {
                    // Handle more complex print statements with variables
                    output.append("Output contains dynamic variables (not shown in simulation)\n");
                }
            } else {
                output.append("No output detected in code.\n");
            }
            
            // Additional code analysis
            if (code.contains("def ")) {
                output.append("\nNote: Your code defines one or more functions.\n");
            }
            
            if (code.contains("class ")) {
                output.append("Note: Your code defines one or more classes.\n");
            }
            
            output.append("\nPython execution completed in 0.12s");
        } catch (Exception e) {
            output.append("Error analyzing code: ").append(e.getMessage()).append("\n");
        }
        
        return output.toString();
    }
    
    private String simulateCppExecution(String code) {
        StringBuilder output = new StringBuilder();
        
        try {
            // Check if code contains cout
            if (code.contains("cout") || code.contains("printf")) {
                // Extract content inside cout
                List<String> printStatements = new ArrayList<>();
                String coutRegex = "cout\\s*<<\\s*[\"'](.+?)[\"']";
                String printfRegex = "printf\\s*\\(\\s*[\"'](.+?)[\"']";
                
                Pattern coutPattern = Pattern.compile(coutRegex);
                Matcher coutMatcher = coutPattern.matcher(code);
                while (coutMatcher.find()) {
                    printStatements.add(coutMatcher.group(1));
                }
                
                Pattern printfPattern = Pattern.compile(printfRegex);
                Matcher printfMatcher = printfPattern.matcher(code);
                while (printfMatcher.find()) {
                    printStatements.add(printfMatcher.group(1));
                }
                
                if (!printStatements.isEmpty()) {
                    for (String statement : printStatements) {
                        output.append(statement).append("\n");
                    }
                } else {
                    // Handle more complex print statements with variables
                    output.append("Output contains dynamic variables (not shown in simulation)\n");
                }
            } else {
                output.append("No output detected in code.\n");
            }
            
            // Additional code analysis
            if (code.contains("struct ")) {
                output.append("\nNote: Your code defines one or more structs.\n");
            }
            
            if (code.contains("template")) {
                output.append("Note: Your code uses C++ templates.\n");
            }
            
            output.append("\nC++ compilation successful.\nExecution completed in 0.18s");
        } catch (Exception e) {
            output.append("Error analyzing code: ").append(e.getMessage()).append("\n");
        }
        
        return output.toString();
    }
    
    private String simulateJavaScriptExecution(String code) {
        StringBuilder output = new StringBuilder();
        
        try {
            // Check if code contains console.log
            if (code.contains("console.log")) {
                // Extract content inside console.log
                List<String> printStatements = new ArrayList<>();
                String regex = "console\\.log\\s*\\(\\s*[\"'](.+?)[\"']\\s*\\)";
                Pattern pattern = Pattern.compile(regex);
                Matcher matcher = pattern.matcher(code);
                
                while (matcher.find()) {
                    printStatements.add(matcher.group(1));
                }
                
                if (!printStatements.isEmpty()) {
                    for (String statement : printStatements) {
                        output.append(statement).append("\n");
                    }
                } else {
                    // Handle more complex print statements with variables
                    output.append("Output contains dynamic variables (not shown in simulation)\n");
                }
            } else if (code.contains("alert")) {
                output.append("Alert dialog would be shown in a web browser\n");
            } else {
                output.append("No output detected in code.\n");
            }
            
            // Additional code analysis
            if (code.contains("async") && code.contains("await")) {
                output.append("\nNote: Your code uses asynchronous JavaScript features.\n");
            }
            
            if (code.contains("=>")) {
                output.append("Note: Your code uses arrow functions.\n");
            }
            
            output.append("\nJavaScript execution completed in 0.09s");
        } catch (Exception e) {
            output.append("Error analyzing code: ").append(e.getMessage()).append("\n");
        }
        
        return output.toString();
    }
    
    private StyleSpans<Collection<String>> computeHighlighting() {
        String text = codeArea.getText();
        
        Matcher matcher = null;
        switch (languageSelector.getValue()) {
            case JAVA:
                matcher = JAVA_PATTERN.matcher(text);
                break;
            case PYTHON:
                matcher = PYTHON_PATTERN.matcher(text);
                break;
            case CPP:
                matcher = CPP_PATTERN.matcher(text);
                break;
            case JAVASCRIPT:
                matcher = JS_PATTERN.matcher(text);
                break;
        }
        
        if (matcher == null) {
            // Default to no highlighting
            return StyleSpans.singleton(Collections.emptyList(), text.length());
        }
        
        int lastKwEnd = 0;
        StyleSpansBuilder<Collection<String>> spansBuilder = new StyleSpansBuilder<>();
        
        while (matcher.find()) {
            String styleClass = 
                matcher.group("KEYWORD") != null ? "keyword" :
                matcher.group("STRING") != null ? "string" :
                matcher.group("COMMENT") != null ? "comment" :
                null;
            
            assert styleClass != null;
            spansBuilder.add(Collections.emptyList(), matcher.start() - lastKwEnd);
            spansBuilder.add(Collections.singleton(styleClass), matcher.end() - matcher.start());
            lastKwEnd = matcher.end();
        }
        
        spansBuilder.add(Collections.emptyList(), text.length() - lastKwEnd);
        return spansBuilder.create();
    }
    
    private void applyHighlighting(StyleSpans<Collection<String>> highlighting) {
        codeArea.setStyleSpans(0, highlighting);
    }
    
    public void cleanup() {
        if (collaborationService != null) {
            collaborationService.disconnect();
        }
        
        if (executor != null) {
            executor.shutdown();
        }
    }
    
    // Add public getter for code
    public String getCode() {
        return codeArea.getText();
    }
    
    // Add method to explicitly set code content
    public void setCode(String newCode) {
        codeArea.replaceText(newCode);
    }
    
    public void formatCode() {
        // A simple code formatting function
        String currentCode = codeArea.getText();
        EditorLanguage currentLanguage = languageSelector.getValue();
        
        try {
            // Apply basic formatting based on language
            switch (currentLanguage) {
                case JAVA:
                case CPP:
                case JAVASCRIPT:
                    // Apply braces formatting for C-style languages
                    String formatted = formatBraces(currentCode);
                    formatted = formatIndentation(formatted);
                    codeArea.replaceText(formatted);
                    break;
                case PYTHON:
                    // Python relies on indentation
                    String pythonFormatted = formatPythonIndentation(currentCode);
                    codeArea.replaceText(pythonFormatted);
                    break;
            }
        } catch (Exception e) {
            outputArea.setText("Error formatting code: " + e.getMessage());
        }
    }
    
    private String formatBraces(String code) {
        // Very simple braces formatter - add newline after {
        return code.replaceAll("\\{\\s*", "{\n")
                   .replaceAll("\\s*\\}", "\n}");
    }
    
    private String formatIndentation(String code) {
        // Simplified indentation - this would be much more sophisticated in a real IDE
        String[] lines = code.split("\n");
        StringBuilder formatted = new StringBuilder();
        int indentLevel = 0;
        
        for (String line : lines) {
            String trimmed = line.trim();
            
            // Decrease indent for closing braces
            if (trimmed.startsWith("}")) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add proper indentation
            if (!trimmed.isEmpty()) {
                formatted.append("    ".repeat(indentLevel)).append(trimmed).append("\n");
            } else {
                formatted.append("\n");
            }
            
            // Increase indent after opening brace
            if (trimmed.endsWith("{")) {
                indentLevel++;
            }
        }
        
        return formatted.toString();
    }
    
    private String formatPythonIndentation(String code) {
        // Very simplified Python formatter
        String[] lines = code.split("\n");
        StringBuilder formatted = new StringBuilder();
        int indentLevel = 0;
        
        for (String line : lines) {
            String trimmed = line.trim();
            
            // Calculate indent level based on Python rules
            if (trimmed.endsWith(":")) {
                // Add the current line with its indentation
                formatted.append("    ".repeat(indentLevel)).append(trimmed).append("\n");
                indentLevel++;
            } else if (trimmed.equals("break") || trimmed.equals("continue") || 
                    trimmed.equals("pass") || trimmed.equals("return") || 
                    trimmed.startsWith("return ")) {
                // Statements that may decrease indent after
                formatted.append("    ".repeat(indentLevel)).append(trimmed).append("\n");
            } else if (trimmed.isEmpty()) {
                // Just add empty lines
                formatted.append("\n");
            } else {
                // Normal line
                formatted.append("    ".repeat(indentLevel)).append(trimmed).append("\n");
            }
        }
        
        return formatted.toString();
    }
}
