package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Game;
import org.edgar.hodlverse.services.GameService;
import org.edgar.hodlverse.services.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/games")
@Validated
public class GameController {

    private final GameService gameService;

    @Autowired
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    // Obtener todas las partidas
    @GetMapping
    public ResponseEntity<List<Game>> all() {
        List<Game> games = gameService.findAll();
        return ResponseEntity.ok(games);
    }

    // Crear una nueva partida
    @PostMapping
    public ResponseEntity<Game> newGame(@Valid @RequestBody Game newGame) {
        Game savedGame = gameService.save(newGame);
        return ResponseEntity.ok(savedGame);
    }

    // Obtener una partida por ID
    @GetMapping("/{id}")
    public ResponseEntity<Game> one(@PathVariable @NotNull Long id) {
        return gameService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Partida con ID " + id + " no encontrada."));
    }

    // Actualizar una partida
    @PutMapping("/{id}")
    public ResponseEntity<Game> updateGame(@PathVariable @NotNull Long id, @Valid @RequestBody Game newGame) {
        return gameService.findById(id)
                .map(game -> {
                    game.setDifficulty(newGame.getDifficulty());
                    game.setInitialCredit(newGame.getInitialCredit());
                    game.setObjective(newGame.getObjective());
                    game.setDuration(newGame.getDuration());
                    game.setStartDate(newGame.getStartDate());
                    return ResponseEntity.ok(gameService.save(game));
                })
                .orElseThrow(() -> new NotFoundException("Partida con ID " + id + " no encontrada."));
    }

    // Eliminar una partida
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable @NotNull Long id) {
        if (gameService.findById(id).isEmpty()) {
            throw new NotFoundException("Partida con ID " + id + " no encontrada.");
        }
        gameService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
