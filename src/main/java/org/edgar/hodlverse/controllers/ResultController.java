package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Result;
import org.edgar.hodlverse.services.ResultService;
import org.edgar.hodlverse.services.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/results")
@Validated
public class ResultController {

    private final ResultService resultService;

    @Autowired
    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    // Obtener todos los resultados
    @GetMapping
    public ResponseEntity<List<Result>> getAllResults() {
        List<Result> results = resultService.getAllResults();
        return ResponseEntity.ok(results);
    }

    // Obtener un resultado por ID
    @GetMapping("/{id}")
    public ResponseEntity<Result> getResultById(@PathVariable @NotNull Long id) {
        return resultService.getResultById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Resultado con ID " + id + " no encontrado."));
    }

    // Obtener un resultado por el ID del juego
    @GetMapping("/game/{gameId}")
    public ResponseEntity<Result> getResultByGameId(@PathVariable @NotNull Long gameId) {
        return resultService.getResultByGameId(gameId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Resultado para el juego con ID " + gameId + " no encontrado."));
    }

    // Crear o actualizar un resultado
    @PostMapping
    public ResponseEntity<Result> createResult(@Valid @RequestBody Result result) {
        Result savedResult = resultService.saveResult(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedResult);
    }

    // Eliminar un resultado
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable @NotNull Long id) {
        resultService.deleteResult(id);
        return ResponseEntity.noContent().build();
    }
}
