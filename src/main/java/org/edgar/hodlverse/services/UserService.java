package org.edgar.hodlverse.services;

import org.edgar.hodlverse.entities.User;
import org.edgar.hodlverse.repositories.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Obtener todos los usuarios
    public List<User> findAll() {
        return userRepository.findAll();
    }

    // Guardar un nuevo usuario
    public User save(User user) {
        return userRepository.save(user);
    }

    // Buscar un usuario por su ID
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // Eliminar un usuario por su ID
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    // Método para guardar un usuario autenticado vía OAuth2
    public User saveOAuth2User(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");

        // Verifica si el usuario ya existe en la base de datos
        User user = userRepository.findByEmail(email);

        if (user == null) {
            // Si no existe, crea un nuevo usuario
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPicture(picture);
            user.setRegistrationDate(LocalDate.now());
            user.setPassword(""); // O usa un valor por defecto

            user = userRepository.save(user);
        }

        return user;
    }

}