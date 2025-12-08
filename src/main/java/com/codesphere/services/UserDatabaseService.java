
package com.codesphere.services;

import com.codesphere.models.User;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;
import java.util.List;

/**
 * Service for database operations on users
 */
public class UserDatabaseService {
    private final EntityManagerFactory emf;
    
    public UserDatabaseService() {
        // Create EntityManagerFactory using persistence.xml configuration
        this.emf = Persistence.createEntityManagerFactory("codesphere-persistence-unit");
    }
    
    /**
     * Save or update a user in the database
     */
    public User saveUser(User user) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin();
            User savedUser = em.merge(user); // merge handles both insert and update
            em.getTransaction().commit();
            return savedUser;
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            e.printStackTrace();
            throw e;
        } finally {
            em.close();
        }
    }
    
    /**
     * Find a user by ID
     */
    public User findUserById(String id) {
        EntityManager em = emf.createEntityManager();
        try {
            return em.find(User.class, id);
        } finally {
            em.close();
        }
    }
    
    /**
     * Find a user by name (exact match)
     */
    public User findUserByName(String name) {
        EntityManager em = emf.createEntityManager();
        try {
            TypedQuery<User> query = em.createQuery(
                    "SELECT u FROM User u WHERE u.name = :name", User.class);
            query.setParameter("name", name);
            List<User> results = query.getResultList();
            return results.isEmpty() ? null : results.get(0);
        } finally {
            em.close();
        }
    }
    
    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        EntityManager em = emf.createEntityManager();
        try {
            TypedQuery<User> query = em.createQuery("SELECT u FROM User u", User.class);
            return query.getResultList();
        } finally {
            em.close();
        }
    }
    
    /**
     * Delete a user
     */
    public void deleteUser(User user) {
        EntityManager em = emf.createEntityManager();
        try {
            em.getTransaction().begin();
            User managedUser = em.find(User.class, user.getId());
            if (managedUser != null) {
                em.remove(managedUser);
            }
            em.getTransaction().commit();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            e.printStackTrace();
        } finally {
            em.close();
        }
    }
    
    /**
     * Close the EntityManagerFactory
     */
    public void shutdown() {
        if (emf != null && emf.isOpen()) {
            emf.close();
        }
    }
}
