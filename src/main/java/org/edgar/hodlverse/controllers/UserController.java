package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.User;
import org.edgar.hodlverse.services.NotFoundException;
import org.edgar.hodlverse.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@Validated
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Crear un nuevo usuario
    @PostMapping
    public ResponseEntity<User> newUser(@Valid @RequestBody User newUser) {
        User savedUser = userService.save(newUser);
        return ResponseEntity.ok(savedUser);
    }

    // Obtener información del usuario autenticado
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserInfo(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            throw new RuntimeException("Usuario no autenticado");
        }

        User user = userService.saveOAuth2User(principal);

        Map<String, Object> response = Map.of(
                "id", user.getUserId(),
                "name", user.getUsername(),
                "email", user.getEmail(),
                "picture", user.getPicture()
        );

        return ResponseEntity.ok(response);
    }

    // Obtener un usuario específico por su ID
    @GetMapping("/{id}")
    public ResponseEntity<User> findUserById(@PathVariable @NotNull Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Usuario con ID " + id + " no encontrado."));
    }

    // Actualizar un usuario existente
    @PutMapping("/{id}")
    public ResponseEntity<User> replaceUser(@PathVariable @NotNull Long id, @Valid @RequestBody User newUser) {
        return userService.findById(id)
                .map(user -> {
                    user.setUsername(newUser.getUsername());
                    user.setEmail(newUser.getEmail());
                    user.setPassword(newUser.getPassword());
                    user.setRegistrationDate(newUser.getRegistrationDate());
                    return ResponseEntity.ok(userService.save(user));
                })
                .orElseGet(() -> {
                    newUser.setUserId(id);
                    return ResponseEntity.ok(userService.save(newUser));
                });
    }

    // Eliminar un usuario por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable @NotNull Long id) {
        if (userService.findById(id).isEmpty()) {
            throw new NotFoundException("Usuario con ID " + id + " no encontrado.");
        }
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Obtener todos los usuarios
    @GetMapping("/all")
    public ResponseEntity<List<User>> all() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }
}
