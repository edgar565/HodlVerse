package org.edgar.hodlverse.services;

import org.edgar.hodlverse.entities.User;
import org.edgar.hodlverse.repositories.UserRepository;
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
}
