import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useEditorContext } from "@/contexts/EditorContext";
import { useCollaborationContext } from "@/contexts/CollaborationContext";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function MonacoCodeEditor() {
  const { code, setCode, language } = useEditorContext();
  const { updateUserPosition } = useCollaborationContext();
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      updateUserPosition(e.position.lineNumber, e.position.column);
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    
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
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`Connection Error: Backend server not running on localhost:3001`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Professional Header */}
      <div className="flex justify-between items-center bg-slate-900/90 backdrop-blur-sm p-3 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-sm font-medium text-slate-300">
            {language.toUpperCase()} • CodeSphere Editor
          </div>
        </div>
        <Button 
          onClick={runCode} 
          disabled={isRunning} 
          size="sm" 
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
        >
          <Play className="w-4 h-4 mr-2" /> 
          {isRunning ? "Executing..." : "Run Code"}
        </Button>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 15,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            minimap: { enabled: true, scale: 0.8 },
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
              showSnippets: true
            },
            padding: { top: 16, bottom: 16 },
            lineHeight: 24,
            letterSpacing: 0.5
          }}
        />
      </div>
      
      {/* Professional Terminal Output */}
      {output && (
        <div className="bg-slate-950 border-t border-slate-700/50">
          <div className="flex items-center justify-between bg-slate-900/50 px-4 py-2 border-b border-slate-700/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-300">Terminal Output</span>
            </div>
            <div className="text-xs text-slate-500">CodeSphere Runtime</div>
          </div>
          <div className="bg-black/80 text-green-400 p-4 font-mono text-sm h-40 overflow-auto">
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <span>$</span>
              <span className="text-slate-400">java Main</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
            <div className="flex items-center gap-1 mt-2 text-slate-500">
              <div className="w-2 h-3 bg-green-400 animate-pulse"></div>
              <span className="text-xs">Process completed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}