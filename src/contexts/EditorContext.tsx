import { createContext, useContext, useState, ReactNode } from "react";

type Language = "java" | "python" | "cpp" | "javascript";
type Mode = "code" | "whiteboard";

interface EditorContextType {
  code: string;
  setCode: (code: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  lineNumber: number;
  setLineNumber: (line: number) => void;
  columnNumber: number;
  setColumnNumber: (column: number) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

const defaultCode = {
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeSphere!");
        int sum = 5 + 3;
        System.out.println("Sum: " + sum);
    }
}`,
  python: `print("Hello, CodeSphere!")
for i in range(3):
    print(f"Number: {i}")`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CodeSphere!" << endl;
    int sum = 5 + 3;
    cout << "Sum: " << sum << endl;
    return 0;
}`,
  javascript: `console.log("Hello, CodeSphere!");
let numbers = [1, 2, 3, 4, 5];
let sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);`
};

export function EditorContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("java");
  const [code, setCode] = useState<string>(defaultCode.java);
  const [mode, setMode] = useState<Mode>("code");
  const [lineNumber, setLineNumber] = useState(1);
  const [columnNumber, setColumnNumber] = useState(1);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(defaultCode[newLanguage]);
    setLineNumber(1);
    setColumnNumber(1);
  };

  return (
    <EditorContext.Provider
      value={{
        code,
        setCode,
        language,
        setLanguage: handleLanguageChange,
        mode,
        setMode,
        lineNumber,
        setLineNumber,
        columnNumber,
        setColumnNumber,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditorContext must be used within an EditorContextProvider");
  }
  return context;
}