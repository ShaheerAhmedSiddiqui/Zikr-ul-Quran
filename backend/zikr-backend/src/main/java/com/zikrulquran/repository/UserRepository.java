package com.zikrulquran.repository;

import com.zikrulquran.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> { // Changed from Long to Integer

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    // NEW: Find user with playlists eagerly loaded
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.playlists WHERE u.userId = :userId")
    Optional<User> findByIdWithPlaylists(@Param("userId") Integer userId);

    // NEW: Find user by username or email
    Optional<User> findByUsernameOrEmail(String username, String email);

    // NEW: Check if username or email exists (for registration validation)
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.username = :username OR u.email = :email")
    Boolean existsByUsernameOrEmail(@Param("username") String username, @Param("email") String email);
}