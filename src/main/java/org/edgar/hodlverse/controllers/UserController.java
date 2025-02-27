package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.User;
import org.edgar.hodlverse.services.NotFoundException;
import org.edgar.hodlverse.services.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/users") // Ruta base para el controlador
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Crear un nuevo usuario
    @PostMapping
    public User newUser(@RequestBody User newUser) {
        return userService.save(newUser);
    }

    // Obtener un usuario específico por su ID
    @GetMapping("/{id}")
    public User findUserById(@PathVariable Long id) {
        return userService.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario con ID " + id + " no encontrado."));
    }


    // Actualizar un usuario existente
    @PutMapping("/{id}")
    public User replaceUser(@RequestBody User newUser, @PathVariable Long id) {
        return userService.findById(id)
                .map(user -> {
                    user.setName(newUser.getName());
                    user.setEmail(newUser.getEmail());
                    user.setPassword(newUser.getPassword());
                    user.setRegistrationDate(newUser.getRegistrationDate());
                    user.setPicture(newUser.getPicture());
                    user.setToken(newUser.getToken());
                    user.setWallet(newUser.getWallet());
                    return userService.save(user);
                })
                .orElseGet(() -> {
                    newUser.setUserId(id);
                    return userService.save(newUser);
                });
    }

    // Eliminar un usuario por su ID
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        if (userService.findById(id).isEmpty()) {
            throw new NotFoundException("Usuario con ID " + id + " no encontrado.");
        }
        userService.deleteById(id);
    }
    @GetMapping("/all")
    public List<User> all() {
        return userService.findAll();
    }
}
