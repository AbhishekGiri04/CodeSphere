package com.codesphere;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.HashMap;
import java.util.Map;

public class CodeSphereSwing extends JFrame {
    
    private JTextArea codeArea;
    private JTextArea outputArea;
    private JComboBox<String> languageBox;
    private JPanel drawingPanel;
    private JToggleButton penButton, eraseButton;
    private JButton clearButton;
    private Color currentColor = Color.BLACK;
    private int penSize = 3;
    private boolean isDrawing = false;
    private Point lastPoint;
    private Graphics2D g2d;
    private BufferedImage canvas;
    
    // Language templates
    private Map<String, String> codeTemplates;
    
    public CodeSphereSwing() {
        initializeTemplates();
        initializeUI();
    }
    
    private void initializeTemplates() {
        codeTemplates = new HashMap<>();
        codeTemplates.put("Java", "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello CodeSphere!\");\n    }\n}");
        codeTemplates.put("Python", "# Python Code\nprint(\"Hello CodeSphere!\")");
        codeTemplates.put("JavaScript", "// JavaScript Code\nconsole.log(\"Hello CodeSphere!\");");
        codeTemplates.put("C++", "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello CodeSphere!\" << endl;\n    return 0;\n}");
    }
    
    private void initializeUI() {
        setTitle("CodeSphere - Desktop Code Editor");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1200, 800);
        setLocationRelativeTo(null);
        
        // Set icon
        try {
            setIconImage(Toolkit.getDefaultToolkit().getImage("https://img.icons8.com/color/1200/visual-studio.jpg"));
        } catch (Exception e) {
            // Fallback - create simple icon
            setIconImage(createDefaultIcon());
        }
        
        // Set look and feel - removed for compatibility
        
        // Main panel with tabs
        JTabbedPane tabbedPane = new JTabbedPane();
        
        // Code Editor Tab
        JPanel codePanel = createCodeEditorPanel();
        tabbedPane.addTab("Code Editor", codePanel);
        
        // Whiteboard Tab
        JPanel whiteboardPanel = createWhiteboardPanel();
        tabbedPane.addTab("Whiteboard", whiteboardPanel);
        
        add(tabbedPane);
    }
    
    private Image createDefaultIcon() {
        BufferedImage icon = new BufferedImage(32, 32, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = icon.createGraphics();
        g2.setColor(new Color(66, 153, 225));
        g2.fillRect(0, 0, 32, 32);
        g2.setColor(Color.WHITE);
        g2.setFont(new Font("Arial", Font.BOLD, 20));
        g2.drawString("CS", 6, 22);
        g2.dispose();
        return icon;
    }
    
    private JPanel createCodeEditorPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        
        // Top toolbar
        JPanel toolbar = createCodeToolbar();
        mainPanel.add(toolbar, BorderLayout.NORTH);
        
        // Center panel with code editor
        JPanel centerPanel = createCenterPanel();
        mainPanel.add(centerPanel, BorderLayout.CENTER);
        
        // Bottom panel with output
        JPanel bottomPanel = createBottomPanel();
        mainPanel.add(bottomPanel, BorderLayout.SOUTH);
        
        return mainPanel;
    }
    
    private JPanel createCodeToolbar() {
        JPanel toolbar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        toolbar.setBackground(new Color(45, 55, 72));
        toolbar.setBorder(new EmptyBorder(10, 10, 10, 10));
        
        JLabel titleLabel = new JLabel("CodeSphere Desktop");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        
        languageBox = new JComboBox<>(new String[]{"Java", "Python", "JavaScript", "C++"});
        languageBox.setSelectedItem("Java");
        languageBox.setBackground(Color.WHITE);
        languageBox.setForeground(Color.BLACK);
        languageBox.addActionListener(e -> updateCodeTemplate());
        
        JButton runButton = new JButton("Run Code");
        runButton.setBackground(new Color(66, 153, 225));
        runButton.setForeground(Color.WHITE);
        runButton.setFocusPainted(false);
        runButton.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        runButton.addActionListener(new RunCodeListener());
        
        JButton saveButton = new JButton("Save");
        saveButton.setBackground(new Color(72, 187, 120));
        saveButton.setForeground(Color.WHITE);
        saveButton.setFocusPainted(false);
        saveButton.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        saveButton.addActionListener(e -> saveCode());
        
        JButton copyButton = new JButton("Copy");
        copyButton.setBackground(new Color(128, 90, 213));
        copyButton.setForeground(Color.WHITE);
        copyButton.setFocusPainted(false);
        copyButton.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        copyButton.addActionListener(e -> copyCode());
        
        JButton loadButton = new JButton("Load");
        loadButton.setBackground(new Color(237, 137, 54));
        loadButton.setForeground(Color.WHITE);
        loadButton.setFocusPainted(false);
        loadButton.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        loadButton.addActionListener(e -> loadCode());
        
        JLabel langLabel = new JLabel("Language:");
        langLabel.setForeground(Color.WHITE);
        
        toolbar.add(titleLabel);
        toolbar.add(Box.createHorizontalStrut(20));
        toolbar.add(langLabel);
        toolbar.add(languageBox);
        toolbar.add(Box.createHorizontalStrut(20));
        toolbar.add(runButton);
        toolbar.add(saveButton);
        toolbar.add(copyButton);
        toolbar.add(loadButton);
        
        return toolbar;
    }
    
    private JPanel createCenterPanel() {
        JPanel centerPanel = new JPanel(new BorderLayout());
        
        JLabel codeLabel = new JLabel("Code Editor:");
        codeLabel.setFont(new Font("Arial", Font.BOLD, 12));
        codeLabel.setBorder(new EmptyBorder(5, 0, 5, 0));
        
        codeArea = new JTextArea();
        codeArea.setText(codeTemplates.get("Java"));
        codeArea.setFont(new Font("Courier New", Font.PLAIN, 14));
        codeArea.setTabSize(4);
        codeArea.setBackground(new Color(40, 44, 52));
        codeArea.setForeground(new Color(171, 178, 191));
        codeArea.setCaretColor(Color.WHITE);
        
        JScrollPane codeScrollPane = new JScrollPane(codeArea);
        codeScrollPane.setPreferredSize(new Dimension(0, 400));
        
        centerPanel.add(codeLabel, BorderLayout.NORTH);
        centerPanel.add(codeScrollPane, BorderLayout.CENTER);
        
        return centerPanel;
    }
    
    private JPanel createBottomPanel() {
        JPanel bottomPanel = new JPanel(new BorderLayout());
        
        JLabel outputLabel = new JLabel("Output:");
        outputLabel.setFont(new Font("Arial", Font.BOLD, 12));
        outputLabel.setBorder(new EmptyBorder(10, 0, 5, 0));
        
        outputArea = new JTextArea();
        outputArea.setEditable(false);
        outputArea.setFont(new Font("Courier New", Font.PLAIN, 12));
        outputArea.setBackground(new Color(26, 32, 44));
        outputArea.setForeground(new Color(226, 232, 240));
        outputArea.setText("Ready to run code...");
        
        JScrollPane outputScrollPane = new JScrollPane(outputArea);
        outputScrollPane.setPreferredSize(new Dimension(0, 150));
        
        bottomPanel.add(outputLabel, BorderLayout.NORTH);
        bottomPanel.add(outputScrollPane, BorderLayout.CENTER);
        
        return bottomPanel;
    }
    
    private JPanel createWhiteboardPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        
        // Whiteboard toolbar
        JPanel toolbar = createWhiteboardToolbar();
        mainPanel.add(toolbar, BorderLayout.NORTH);
        
        // Drawing area
        drawingPanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                if (canvas != null) {
                    g.drawImage(canvas, 0, 0, null);
                }
            }
        };
        drawingPanel.setBackground(Color.WHITE);
        drawingPanel.setPreferredSize(new Dimension(800, 600));
        
        // Mouse listeners for drawing
        MouseAdapter mouseHandler = new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                if (penButton.isSelected()) {
                    isDrawing = true;
                    lastPoint = e.getPoint();
                    initCanvas();
                }
            }
            
            @Override
            public void mouseDragged(MouseEvent e) {
                if (isDrawing && penButton.isSelected()) {
                    drawLine(lastPoint, e.getPoint());
                    lastPoint = e.getPoint();
                } else if (eraseButton.isSelected()) {
                    erase(e.getPoint());
                }
            }
            
            @Override
            public void mouseReleased(MouseEvent e) {
                isDrawing = false;
            }
        };
        
        drawingPanel.addMouseListener(mouseHandler);
        drawingPanel.addMouseMotionListener(mouseHandler);
        
        JScrollPane scrollPane = new JScrollPane(drawingPanel);
        mainPanel.add(scrollPane, BorderLayout.CENTER);
        
        return mainPanel;
    }
    
    private JPanel createWhiteboardToolbar() {
        JPanel toolbar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        toolbar.setBackground(new Color(45, 55, 72));
        toolbar.setBorder(new EmptyBorder(10, 10, 10, 10));
        
        JLabel titleLabel = new JLabel("Whiteboard");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 16));
        
        penButton = new JToggleButton("Pen");
        penButton.setSelected(true);
        penButton.setBackground(new Color(66, 153, 225));
        penButton.setForeground(Color.WHITE);
        penButton.setFocusPainted(false);
        penButton.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        
        eraseButton = new JToggleButton("Eraser");
        eraseButton.setBackground(new Color(245, 101, 101));
        eraseButton.setForeground(Color.WHITE);
        eraseButton.setFocusPainted(false);
        eraseButton.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        
        // Button group for pen/eraser
        ButtonGroup toolGroup = new ButtonGroup();
        toolGroup.add(penButton);
        toolGroup.add(eraseButton);
        
        clearButton = new JButton("Clear All");
        clearButton.setBackground(new Color(237, 137, 54));
        clearButton.setForeground(Color.WHITE);
        clearButton.setFocusPainted(false);
        clearButton.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        clearButton.addActionListener(e -> clearCanvas());
        
        // Color buttons
        JButton blackBtn = createColorButton(Color.BLACK);
        JButton redBtn = createColorButton(Color.RED);
        JButton blueBtn = createColorButton(Color.BLUE);
        JButton greenBtn = createColorButton(Color.GREEN);
        
        // Pen size slider
        JSlider sizeSlider = new JSlider(1, 10, 3);
        sizeSlider.setBackground(new Color(45, 55, 72));
        sizeSlider.setForeground(Color.WHITE);
        sizeSlider.addChangeListener(e -> penSize = sizeSlider.getValue());
        
        JLabel colorLabel = new JLabel("Colors:");
        colorLabel.setForeground(Color.WHITE);
        
        JLabel sizeLabel = new JLabel("Size:");
        sizeLabel.setForeground(Color.WHITE);
        
        toolbar.add(titleLabel);
        toolbar.add(Box.createHorizontalStrut(20));
        toolbar.add(penButton);
        toolbar.add(eraseButton);
        toolbar.add(Box.createHorizontalStrut(10));
        toolbar.add(colorLabel);
        toolbar.add(blackBtn);
        toolbar.add(redBtn);
        toolbar.add(blueBtn);
        toolbar.add(greenBtn);
        toolbar.add(Box.createHorizontalStrut(10));
        toolbar.add(sizeLabel);
        toolbar.add(sizeSlider);
        toolbar.add(Box.createHorizontalStrut(10));
        toolbar.add(clearButton);
        
        return toolbar;
    }
    
    private JButton createColorButton(Color color) {
        JButton btn = new JButton();
        btn.setPreferredSize(new Dimension(30, 30));
        btn.setBackground(color);
        btn.setOpaque(true);
        btn.setBorderPainted(true);
        btn.setBorder(BorderFactory.createLineBorder(Color.WHITE, 2));
        btn.setFocusPainted(false);
        btn.addActionListener(e -> {
            currentColor = color;
            // Visual feedback - highlight selected color
            Component[] components = ((JButton)e.getSource()).getParent().getComponents();
            for (Component comp : components) {
                if (comp instanceof JButton && ((JButton)comp).getPreferredSize().width == 30) {
                    ((JButton)comp).setBorder(BorderFactory.createLineBorder(Color.GRAY, 1));
                }
            }
            btn.setBorder(BorderFactory.createLineBorder(Color.YELLOW, 3));
        });
        return btn;
    }
    
    private void initCanvas() {
        if (canvas == null) {
            canvas = new BufferedImage(drawingPanel.getWidth(), drawingPanel.getHeight(), BufferedImage.TYPE_INT_ARGB);
            g2d = canvas.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        }
    }
    
    private void drawLine(Point from, Point to) {
        if (g2d != null) {
            g2d.setColor(currentColor);
            g2d.setStroke(new BasicStroke(penSize, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
            g2d.drawLine(from.x, from.y, to.x, to.y);
            drawingPanel.repaint();
        }
    }
    
    private void erase(Point point) {
        if (g2d != null) {
            g2d.setComposite(AlphaComposite.Clear);
            g2d.fillOval(point.x - penSize*2, point.y - penSize*2, penSize*4, penSize*4);
            g2d.setComposite(AlphaComposite.SrcOver);
            drawingPanel.repaint();
        }
    }
    
    private void clearCanvas() {
        if (canvas != null) {
            g2d.setComposite(AlphaComposite.Clear);
            g2d.fillRect(0, 0, canvas.getWidth(), canvas.getHeight());
            g2d.setComposite(AlphaComposite.SrcOver);
            drawingPanel.repaint();
        }
    }
    
    private void updateCodeTemplate() {
        String selectedLanguage = (String) languageBox.getSelectedItem();
        if (codeTemplates.containsKey(selectedLanguage)) {
            codeArea.setText(codeTemplates.get(selectedLanguage));
        }
    }
    
    private void saveCode() {
        JFileChooser fileChooser = new JFileChooser();
        if (fileChooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
            try (FileWriter writer = new FileWriter(fileChooser.getSelectedFile())) {
                writer.write(codeArea.getText());
                outputArea.append("\nCode saved successfully!");
            } catch (IOException e) {
                outputArea.append("\nError saving file: " + e.getMessage());
            }
        }
    }
    
    private void loadCode() {
        JFileChooser fileChooser = new JFileChooser();
        if (fileChooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            try (BufferedReader reader = new BufferedReader(new FileReader(fileChooser.getSelectedFile()))) {
                StringBuilder content = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    content.append(line).append("\n");
                }
                codeArea.setText(content.toString());
                outputArea.append("\nCode loaded successfully!");
            } catch (IOException e) {
                outputArea.append("\nError loading file: " + e.getMessage());
            }
        }
    }
    
    private void copyCode() {
        String code = codeArea.getText();
        Toolkit.getDefaultToolkit().getSystemClipboard().setContents(
            new java.awt.datatransfer.StringSelection(code), null);
        outputArea.append("\nCode copied to clipboard!");
    }
    
    private class RunCodeListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            String code = codeArea.getText();
            String language = (String) languageBox.getSelectedItem();
            
            outputArea.setText("Running " + language + " code...\n\n");
            
            // Real code execution in separate thread
            new Thread(() -> {
                try {
                    String result = executeCode(code, language);
                    SwingUtilities.invokeLater(() -> {
                        outputArea.append(result);
                    });
                } catch (Exception ex) {
                    SwingUtilities.invokeLater(() -> {
                        outputArea.append("Error: " + ex.getMessage());
                    });
                }
            }).start();
        }
    }
    
    private String executeCode(String code, String language) throws Exception {
        StringBuilder output = new StringBuilder();
        
        switch (language) {
            case "Java":
                return executeJava(code);
            case "Python":
                return executePython(code);
            case "JavaScript":
                return executeJavaScript(code);
            case "C++":
                return executeCpp(code);
            default:
                return "Language not supported";
        }
    }
    
    private String executeJava(String code) throws Exception {
        // Create temp directory
        File tempDir = new File("temp");
        if (!tempDir.exists()) tempDir.mkdir();
        
        // Write Java file
        File javaFile = new File(tempDir, "Main.java");
        try (FileWriter writer = new FileWriter(javaFile)) {
            writer.write(code);
        }
        
        // Compile
        Process compileProcess = Runtime.getRuntime().exec("javac " + javaFile.getAbsolutePath());
        compileProcess.waitFor();
        
        if (compileProcess.exitValue() != 0) {
            return "Compilation failed: " + readStream(compileProcess.getErrorStream());
        }
        
        // Run
        Process runProcess = Runtime.getRuntime().exec("java -cp " + tempDir.getAbsolutePath() + " Main");
        runProcess.waitFor();
        
        String result = readStream(runProcess.getInputStream());
        String error = readStream(runProcess.getErrorStream());
        
        // Cleanup
        new File(tempDir, "Main.class").delete();
        javaFile.delete();
        
        return result + (error.isEmpty() ? "" : "\nErrors: " + error) + "\nProcess finished with exit code " + runProcess.exitValue();
    }
    
    private String executePython(String code) throws Exception {
        // Create temp file
        File tempFile = File.createTempFile("python_code", ".py");
        try (FileWriter writer = new FileWriter(tempFile)) {
            writer.write(code);
        }
        
        // Run Python
        Process process = Runtime.getRuntime().exec("python3 " + tempFile.getAbsolutePath());
        process.waitFor();
        
        String result = readStream(process.getInputStream());
        String error = readStream(process.getErrorStream());
        
        // Cleanup
        tempFile.delete();
        
        return result + (error.isEmpty() ? "" : "\nErrors: " + error) + "\nProcess finished with exit code " + process.exitValue();
    }
    
    private String executeJavaScript(String code) throws Exception {
        // Create temp file
        File tempFile = File.createTempFile("js_code", ".js");
        try (FileWriter writer = new FileWriter(tempFile)) {
            writer.write(code);
        }
        
        // Run with Node.js
        Process process = Runtime.getRuntime().exec("node " + tempFile.getAbsolutePath());
        process.waitFor();
        
        String result = readStream(process.getInputStream());
        String error = readStream(process.getErrorStream());
        
        // Cleanup
        tempFile.delete();
        
        return result + (error.isEmpty() ? "" : "\nErrors: " + error) + "\nProcess finished with exit code " + process.exitValue();
    }
    
    private String executeCpp(String code) throws Exception {
        // Create temp files
        File tempDir = new File("temp");
        if (!tempDir.exists()) tempDir.mkdir();
        
        File cppFile = new File(tempDir, "main.cpp");
        File exeFile = new File(tempDir, "main");
        
        try (FileWriter writer = new FileWriter(cppFile)) {
            writer.write(code);
        }
        
        // Compile
        Process compileProcess = Runtime.getRuntime().exec("g++ -o " + exeFile.getAbsolutePath() + " " + cppFile.getAbsolutePath());
        compileProcess.waitFor();
        
        if (compileProcess.exitValue() != 0) {
            return "Compilation failed: " + readStream(compileProcess.getErrorStream());
        }
        
        // Run
        Process runProcess = Runtime.getRuntime().exec(exeFile.getAbsolutePath());
        runProcess.waitFor();
        
        String result = readStream(runProcess.getInputStream());
        String error = readStream(runProcess.getErrorStream());
        
        // Cleanup
        cppFile.delete();
        exeFile.delete();
        
        return result + (error.isEmpty() ? "" : "\nErrors: " + error) + "\nProcess finished with exit code " + runProcess.exitValue();
    }
    
    private String readStream(InputStream stream) throws IOException {
        StringBuilder result = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                result.append(line).append("\n");
            }
        }
        return result.toString();
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new CodeSphereSwing().setVisible(true);
        });
    }
}