
package com.codesphere.services;

import com.codesphere.models.User;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * Service for user management
 */
public class UserService {
    
    private final UserDatabaseService databaseService;
    
    public UserService() {
        this.databaseService = new UserDatabaseService();
    }
    
    /**
     * Generate a default user if the user doesn't exist
     */
    public User generateDefaultUser() {
        // First check if we have a stored user
        List<User> existingUsers = databaseService.getAllUsers();
        if (!existingUsers.isEmpty()) {
            // Return the first user
            return existingUsers.get(0);
        }
        
        // Generate a new user
        User user = new User();
        user.setName(generateRandomUsername());
        user.setColor(getRandomColor());
        
        // Save to database
        return databaseService.saveUser(user);
    }
    
    /**
     * Update user information
     */
    public User updateUser(User user) {
        return databaseService.saveUser(user);
    }
    
    /**
     * Find a user by ID
     */
    public User findUserById(String id) {
        return databaseService.findUserById(id);
    }
    
    /**
     * Generate a random username
     */
    public String generateRandomUsername() {
        List<String> adjectives = Arrays.asList(
                "Clever", "Quick", "Smart", "Bright", "Agile", 
                "Bold", "Calm", "Eager", "Fresh", "Happy");
        
        List<String> nouns = Arrays.asList(
                "Coder", "Hacker", "Ninja", "Wizard", "Developer", 
                "Engineer", "Builder", "Creator", "Maker", "Designer");
        
        Random random = new Random();
        String adjective = adjectives.get(random.nextInt(adjectives.size()));
        String noun = nouns.get(random.nextInt(nouns.size()));
        int number = random.nextInt(1000);
        
        return adjective + noun + number;
    }
    
    /**
     * Get a random color for user
     */
    public String getRandomColor() {
        List<String> colors = Arrays.asList(
                "#4285F4", // Google Blue
                "#EA4335", // Google Red
                "#FBBC05", // Google Yellow
                "#34A853", // Google Green
                "#9C27B0", // Purple
                "#FF5722", // Deep Orange
                "#795548", // Brown
                "#607D8B"  // Blue Grey
        );
        
        Random random = new Random();
        return colors.get(random.nextInt(colors.size()));
    }
    
    /**
     * Shutdown the service
     */
    public void shutdown() {
        if (databaseService != null) {
            databaseService.shutdown();
        }
    }
}
