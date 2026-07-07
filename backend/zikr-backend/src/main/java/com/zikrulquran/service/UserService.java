package com.zikrulquran.service;

import com.zikrulquran.model.User;
import com.zikrulquran.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(String username, String email, String rawPassword) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        if (rawPassword == null || rawPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        // Check if username or email already exists
        if (userRepository.existsByUsernameOrEmail(username, email)) {
            throw new RuntimeException("Username or email already exists");
        }

        // Create new user with encoded password
        User user = new User(username.trim(), email.trim(), passwordEncoder.encode(rawPassword));

        return userRepository.save(user);
    }

    public boolean validateUser(String username, String password) {
        if (username == null || password == null) {
            throw new IllegalArgumentException("Username and password cannot be null");
        }

        Optional<User> user = userRepository.findByUsername(username);

        if (user.isPresent()) {
            return passwordEncoder.matches(password, user.get().getPasswordHash());
        }
        return false;
    }

    public Optional<User> getUserByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        return userRepository.findByUsername(username.trim());
    }

    public Optional<User> getUserById(Integer userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return userRepository.findById(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        return userRepository.findByEmail(email.trim());
    }

    // NEW: Check if username exists
    public boolean usernameExists(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
        return userRepository.existsByUsername(username.trim());
    }

    // NEW: Check if email exists
    public boolean emailExists(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty");
        }
        return userRepository.existsByEmail(email.trim());
    }
}