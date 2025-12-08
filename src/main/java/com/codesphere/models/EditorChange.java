
package com.codesphere.models;

/**
 * Represents a change in the code editor
 */
public class EditorChange {
    private User user;
    private int startPosition;
    private int endPosition;
    private String insertedText;
    private String removedText;
    
    public EditorChange() {
    }
    
    public EditorChange(int startPosition, int endPosition, String insertedText, String removedText) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.insertedText = insertedText;
        this.removedText = removedText;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public int getStartPosition() {
        return startPosition;
    }
    
    public void setStartPosition(int startPosition) {
        this.startPosition = startPosition;
    }
    
    public int getEndPosition() {
        return endPosition;
    }
    
    public void setEndPosition(int endPosition) {
        this.endPosition = endPosition;
    }
    
    public String getInsertedText() {
        return insertedText;
    }
    
    public void setInsertedText(String insertedText) {
        this.insertedText = insertedText;
    }
    
    public String getRemovedText() {
        return removedText;
    }
    
    public void setRemovedText(String removedText) {
        this.removedText = removedText;
    }
}
