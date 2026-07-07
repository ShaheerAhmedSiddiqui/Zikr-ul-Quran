package com.zikrulquran.controller;

import com.zikrulquran.model.User;
import com.zikrulquran.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    // Register new user - FIXED: Now accepts separate parameters
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> registrationRequest) {
        try {
            System.out.println("=== REGISTER REQUEST ===");
            System.out.println("Username: " + registrationRequest.get("username"));
            System.out.println("Email: " + registrationRequest.get("email"));
            System.out.println("Password: " + (registrationRequest.get("password") != null ? "***" : "null"));

            String username = registrationRequest.get("username");
            String email = registrationRequest.get("email");
            String password = registrationRequest.get("password");

            if (username == null || email == null || password == null) {
                throw new RuntimeException("Username, email, and password are required");
            }

            // Use the fixed service method that accepts separate parameters
            User newUser = userService.registerUser(username, email, password);

            System.out.println("=== REGISTER SUCCESS ===");
            System.out.println("User ID: " + newUser.getUserId());
            System.out.println("Username: " + newUser.getUsername());

            // Return user data without password
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("user", Map.of(
                    "userId", newUser.getUserId(),
                    "username", newUser.getUsername(),
                    "email", newUser.getEmail()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("=== REGISTER ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // User login - This method is correct, no changes needed
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            System.out.println("=== LOGIN REQUEST ===");
            System.out.println("Username: " + loginRequest.get("username"));
            System.out.println("Password: " + (loginRequest.get("password") != null ? "***" : "null"));

            String username = loginRequest.get("username");
            String password = loginRequest.get("password");

            if (username == null || password == null) {
                throw new RuntimeException("Username and password are required");
            }

            boolean isValid = userService.validateUser(username, password);

            if (isValid) {
                // Get user details for response
                User user = userService.getUserByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                System.out.println("=== LOGIN SUCCESS ===");
                System.out.println("User ID: " + user.getUserId());
                System.out.println("Username: " + user.getUsername());

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("user", Map.of(
                        "userId", user.getUserId(),
                        "username", user.getUsername(),
                        "email", user.getEmail()
                ));

                return ResponseEntity.ok(response);
            } else {
                System.out.println("=== LOGIN FAILED ===");
                System.out.println("Invalid credentials for user: " + username);

                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid username or password");
                return ResponseEntity.badRequest().body(error);
            }
        } catch (Exception e) {
            System.out.println("=== LOGIN ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // NEW: Get user by ID
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Integer userId) {
        try {
            User user = userService.getUserById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            Map<String, Object> response = new HashMap<>();
            response.put("user", Map.of(
                    "userId", user.getUserId(),
                    "username", user.getUsername(),
                    "email", user.getEmail()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // NEW: Check if username exists
    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsernameExists(@PathVariable String username) {
        try {
            boolean exists = userService.usernameExists(username);

            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("exists", exists);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // NEW: Check if email exists
    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = userService.emailExists(email);

            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
            response.put("exists", exists);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}