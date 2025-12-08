
package com.codesphere.models;

/**
 * Enum representing programming languages supported in the editor
 */
public enum EditorLanguage {
    JAVA("Java"),
    PYTHON("Python"),
    CPP("C++"),
    JAVASCRIPT("JavaScript");
    
    private final String displayName;
    
    EditorLanguage(String displayName) {
        this.displayName = displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
