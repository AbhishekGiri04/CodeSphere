import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useEditorContext } from "@/contexts/EditorContext";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { Button } from "@/components/ui/button";
import { Play, Settings, Download, Copy } from "lucide-react";

export default function ProfessionalCodeEditor() {
  const { code, setCode, language } = useEditorContext();
  const { updateUserPosition } = useCollaborationContext();
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Custom theme matching CodeSphere
    monaco.editor.defineTheme('codesphere-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '60A5FA', fontStyle: 'bold' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'type', foreground: '8B5CF6' },
        { token: 'function', foreground: '06B6D4' },
      ],
      colors: {
        'editor.background': '#0F172A',
        'editor.foreground': '#E2E8F0',
        'editor.lineHighlightBackground': '#1E293B',
        'editor.selectionBackground': '#334155',
        'editorCursor.foreground': '#06B6D4',
        'editorLineNumber.foreground': '#64748B',
        'editorLineNumber.activeForeground': '#06B6D4',
      }
    });
    
    monaco.editor.setTheme('codesphere-dark');
    
    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      updateUserPosition(e.position.lineNumber, e.position.column);
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:3001/execute', {
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
      setOutput(`❌ Connection Error: Backend server not running on localhost:3001\n\nTo fix this:\n1. Open terminal\n2. Run: cd server && node index.js`);
      setExecutionTime(Date.now() - startTime);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
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
    <div className="flex flex-col h-full bg-slate-950">
      {/* Professional Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-b border-slate-700/50 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {language.toUpperCase()}
            </div>
            <div className="text-slate-400">•</div>
            <div className="text-sm text-slate-300">CodeSphere Editor</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyCode}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={downloadCode}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            onClick={runCode} 
            disabled={isRunning} 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
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
            showFoldingControls: "mouseover"
          }}
        />
      </div>
      
      {/* Professional Terminal Output */}
      {output && (
        <div className="bg-slate-950 border-t border-slate-700/50 shadow-2xl">
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 border-b border-slate-700/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-sm font-semibold text-slate-200">Terminal Output</span>
              {executionTime > 0 && (
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  {executionTime}ms
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 font-mono">CodeSphere Runtime v1.0</div>
          </div>
          <div className="bg-black/90 text-green-400 p-5 font-mono text-sm max-h-48 overflow-auto">
            <div className="flex items-center gap-2 mb-3 text-cyan-400">
              <span className="text-blue-400">$</span>
              <span className="text-slate-400">
                {language === 'java' ? 'javac Main.java && java Main' : 
                 language === 'python' ? 'python3 script.py' :
                 language === 'cpp' ? 'g++ -o program program.cpp && ./program' :
                 'node script.js'}
              </span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed text-green-300">{output}</pre>
            <div className="flex items-center gap-2 mt-3 text-slate-500 border-t border-slate-800 pt-2">
              <div className="w-2 h-3 bg-green-400 animate-pulse"></div>
              <span className="text-xs">Process completed successfully</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}