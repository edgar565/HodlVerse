package org.edgar.hodlverse.services;

import org.edgar.hodlverse.entities.Game;
import org.edgar.hodlverse.repositories.GameRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    // Obtener todas las partidas
    public List<Game> findAll() {
        return gameRepository.findAll();
    }

    // Guardar una nueva partida
    public Game save(Game game) {
        return gameRepository.save(game);
    }

    // Buscar una partida por ID
    public Optional<Game> findById(Long id) {
        return gameRepository.findById(id);
    }

    // Eliminar una partida por ID
    public void deleteById(Long id) {
        gameRepository.deleteById(id);
    }
}
