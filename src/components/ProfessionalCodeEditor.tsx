import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useEditorContext } from "@/contexts/EditorContext";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { Button } from "@/components/ui/button";
import { Play, Download, Copy, Undo, Redo } from "lucide-react";
import { toast } from "sonner";

export default function ProfessionalCodeEditor() {
  const { code, setCode, language } = useEditorContext();
  const { updateUserPosition, socket, roomId } = useCollaborationContext();
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const editorRef = useRef<any>(null);

  // Listen for theme changes and update Monaco theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (editorRef.current) {
        const isDark = document.documentElement.classList.contains('dark');
        const monaco = (window as any).monaco;
        if (monaco) {
          monaco.editor.setTheme(isDark ? 'codesphere-dark' : 'codesphere-light');
        }
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Listen for code updates from other users
  useEffect(() => {
    if (socket) {
      socket.on('code-update', (data) => {
        if (editorRef.current && data.code !== code) {
          const position = editorRef.current.getPosition();
          setCode(data.code);
          // Restore cursor position after update
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.setPosition(position);
            }
          }, 0);
        }
      });

      return () => {
        socket.off('code-update');
      };
    }
  }, [socket, code, setCode]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // VS Code-like themes for light and dark mode
    monaco.editor.defineTheme('codesphere-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2A2D2E',
        'editor.selectionBackground': '#264F78',
        'editorCursor.foreground': '#AEAFAD',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
      }
    });
    
    monaco.editor.defineTheme('codesphere-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
        { token: 'type', foreground: '267F99' },
        { token: 'function', foreground: '795E26' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F3F3F3',
        'editor.selectionBackground': '#ADD6FF',
        'editorCursor.foreground': '#000000',
        'editorLineNumber.foreground': '#237893',
        'editorLineNumber.activeForeground': '#0B216F',
      }
    });
    
    // Set theme based on current theme
    const isDark = document.documentElement.classList.contains('dark');
    monaco.editor.setTheme(isDark ? 'codesphere-dark' : 'codesphere-light');
    
    // Enable keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'undo', null);
      toast.success("Undo");
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY, () => {
      editor.trigger('keyboard', 'redo', null);
      toast.success("Redo");
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        editor.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
        toast.success("Selection copied");
      }
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      navigator.clipboard.readText().then(text => {
        const selection = editor.getSelection();
        if (selection) {
          editor.executeEdits('paste', [{
            range: selection,
            text: text
          }]);
          toast.success("Content pasted");
        }
      }).catch(() => {
        editor.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
      });
    });

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      updateUserPosition(e.position.lineNumber, e.position.column);
    });
    editor.onDidChangeModelContent((e: any) => {
      if (socket && roomId) {
        socket.emit('code-change', {
          roomId,
          code: editor.getValue()
        });
      }
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    const startTime = Date.now();
    
    const backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://codesphere-dev.onrender.com';
    
    try {
      const response = await fetch(`${backendUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      
      const result = await response.json();
      setOutput(result.output || result.error || "No output");
      setExecutionTime(Date.now() - startTime);
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`❌ Connection Error: Backend server not available\n\nPlease check if the backend service is running.`);
      setExecutionTime(Date.now() - startTime);
    } finally {
      setIsRunning(false);
    }
  };

  const handleUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
      toast.success("Undo action performed");
    }
  };

  const handleRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', null);
      toast.success("Redo action performed");
    }
  };

  const handleCopy = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      if (selection && !selection.isEmpty()) {
        editorRef.current.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
        toast.success("Selection copied to clipboard");
      } else {
        navigator.clipboard.writeText(code);
        toast.success("All code copied to clipboard");
      }
    }
  };

  const handlePaste = async () => {
    if (editorRef.current) {
      try {
        const text = await navigator.clipboard.readText();
        const selection = editorRef.current.getSelection();
        if (selection) {
          editorRef.current.executeEdits('paste', [{
            range: selection,
            text: text
          }]);
          toast.success("Content pasted");
        }
      } catch (error) {
        editorRef.current.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
        toast.success("Content pasted");
      }
    }
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code.${language === 'javascript' ? 'js' : language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Professional Header */}
      <div className="flex justify-between items-center bg-muted/50 p-4 border-b border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {language.toUpperCase()}
            </div>
            <div className="text-muted-foreground">•</div>
            <div className="text-sm text-foreground">CodeSphere Editor</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleUndo}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRedo}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={downloadCode}
            className="text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            onClick={runCode} 
            disabled={isRunning} 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            <Play className="w-4 h-4 mr-2" /> 
            {isRunning ? "Executing..." : "Run Code"}
          </Button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 16,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace",
            fontWeight: "400",
            minimap: { enabled: true, scale: 0.7, showSlider: "mouseover" },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            lineNumbers: "on",
            renderWhitespace: "selection",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            contextmenu: true,
            mouseWheelZoom: true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true
            },
            padding: { top: 20, bottom: 20 },
            lineHeight: 26,
            letterSpacing: 0.5,
            renderLineHighlight: "gutter",
            occurrencesHighlight: "singleFile",
            selectionHighlight: true,
            foldingStrategy: "indentation",
            showFoldingControls: "mouseover",
            quickSuggestions: true,
            parameterHints: { enabled: true },
            formatOnPaste: true,
            formatOnType: true
          }}
        />
      </div>
      
      {/* Professional Terminal Output */}
      {output && (
        <div className="bg-background border-t border-border shadow-lg">
          <div className="flex items-center justify-between bg-muted/50 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm font-semibold text-foreground">Terminal</span>
              {executionTime > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
                  {executionTime}ms
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">CodeSphere Runtime</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="bg-slate-950 dark:bg-slate-950 light:bg-slate-100 text-green-400 dark:text-green-400 light:text-slate-800 p-4 font-mono text-sm max-h-64 overflow-auto">
            <div className="flex items-center gap-2 mb-2 text-blue-400 dark:text-blue-400 light:text-blue-600">
              <span className="text-green-500">➜</span>
              <span className="text-muted-foreground font-semibold">
                {language === 'java' ? 'javac Main.java && java Main' : 
                 language === 'python' ? 'python3 script.py' :
                 language === 'cpp' ? 'g++ -o program program.cpp && ./program' :
                 'node script.js'}
              </span>
            </div>
            <div className="border-l-2 border-green-500/30 pl-3 ml-2">
              <pre className="whitespace-pre-wrap leading-relaxed text-green-400 dark:text-green-400 light:text-slate-700">{output}</pre>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800 dark:border-slate-800 light:border-slate-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Process completed • Exit code: 0</span>
              <span className="text-xs text-muted-foreground ml-auto">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}