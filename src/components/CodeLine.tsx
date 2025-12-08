
import React, { useEffect, useRef } from "react";
import { useEditorContext } from "@/contexts/EditorContext";

type CodeLineProps = {
  lineNum: number;
  content: string;
  isActive: boolean;
  columnNumber: number;
  onCursorChange: (columnIndex: number) => void;
};

export default function CodeLine({ lineNum, content, isActive, columnNumber, onCursorChange }: CodeLineProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const { language } = useEditorContext();
  
  // Keywords for syntax highlighting
  const javaKeywords = ["public", "class", "static", "void", "main", "String", "System", "out", "println", "if", "for", "while", "return", "int", "boolean", "char", "double", "float"];
  const pythonKeywords = ["def", "if", "elif", "else", "for", "while", "return", "import", "from", "as", "class", "True", "False", "None", "print"];
  const cppKeywords = ["include", "using", "namespace", "std", "int", "void", "return", "cout", "endl", "if", "for", "while", "class", "public", "private"];
  const jsKeywords = ["function", "const", "let", "var", "return", "if", "else", "for", "while", "console", "log"];
  
  const getKeywordsForLanguage = (): string[] => {
    switch (language) {
      case "java": return javaKeywords;
      case "python": return pythonKeywords;
      case "cpp": return cppKeywords;
      case "javascript": return jsKeywords;
      default: return [];
    }
  };
  
  const keywords = getKeywordsForLanguage();
  
  // Apply syntax highlighting
  const highlightSyntax = (text: string): JSX.Element[] => {
    // Simple tokenization for demonstration
    // In a real app, you'd use a proper syntax highlighter library
    const result: JSX.Element[] = [];
    
    // Split by spaces initially to find keywords
    const parts = text.split(/(\s+|[^\w\s]+)/);
    
    parts.forEach((part, index) => {
      if (keywords.includes(part)) {
        // Keywords
        result.push(<span key={index} className="text-blue-500">{part}</span>);
      } else if (part.match(/^["'].*["']$/)) {
        // Strings
        result.push(<span key={index} className="text-green-500">{part}</span>);
      } else if (part.match(/^\/\/.*$/)) {
        // Comments
        result.push(<span key={index} className="text-gray-500">{part}</span>);
      } else if (part.match(/^[A-Z][A-Za-z0-9_]*\(/)) {
        // Function calls
        result.push(<span key={index} className="text-purple-500">{part}</span>);
      } else if (part.match(/[+\-*/=<>!&|^~?:]/)) {
        // Operators
        result.push(<span key={index} className="text-red-500">{part}</span>);
      } else {
        // Other text
        result.push(<span key={index}>{part}</span>);
      }
    });
    
    return result;
  };
  
  useEffect(() => {
    if (isActive && lineRef.current) {
      lineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive]);

  const handleLineClick = (e: React.MouseEvent) => {
    if (!lineRef.current) return;
    
    const rect = lineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - 48; // Subtract line number width
    
    // Create temporary span to measure text width
    const tempSpan = document.createElement('span');
    tempSpan.style.font = 'monospace';
    tempSpan.style.fontSize = '14px';
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    document.body.appendChild(tempSpan);
    
    let columnIndex = 0;
    for (let i = 0; i <= content.length; i++) {
      tempSpan.textContent = content.substring(0, i);
      if (tempSpan.offsetWidth >= clickX) {
        columnIndex = i;
        break;
      }
      columnIndex = i;
    }
    
    document.body.removeChild(tempSpan);
    onCursorChange(columnIndex);
  };

  return (
    <div 
      ref={lineRef}
      className={`flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-editor-activeLineBackground' : ''}`}
      onClick={handleLineClick}
    >
      <div className="text-gray-500 w-12 text-right pr-2 select-none border-r border-gray-300 dark:border-gray-700 mr-2">
        {lineNum}
      </div>
      <div className="px-2 flex-1 relative">
        {content ? highlightSyntax(content) : <span>&nbsp;</span>}
        {isActive && (
          <span 
            className="absolute w-[2px] h-5 animate-pulse"
            style={{ 
              backgroundColor: 'var(--editor-cursor)',
              left: `${8 + (columnNumber - 1) * 8.4}px`,
              top: '2px'
            }}
          />
        )}
      </div>
    </div>
  );
}
