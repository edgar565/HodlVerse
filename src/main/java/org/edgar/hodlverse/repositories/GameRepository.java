package org.edgar.hodlverse.repositories;

import org.edgar.hodlverse.entities.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    // Consulta personalizada para encontrar el juego activo de un usuario (sin resultado asociado)
    @Query("SELECT g FROM Game g WHERE g.user.userId = :userId AND g.result IS NULL")
    Optional<Game> findActiveGameByUserId(Long userId);

    // Consulta personalizada para encontrar el último juego terminado de un usuario
    @Query("SELECT g FROM Game g WHERE g.user.userId = :userId AND g.result IS NOT NULL ORDER BY g.endDate DESC")
    Optional<Game> findLastFinishedGameByUserId(Long userId);

    // Consulta personalizada para encontrar todos los juegos de un usuario
    @Query("SELECT g FROM Game g WHERE g.user.userId = :userId")
    List<Game> findAllGamesByUserId(Long userId);
}
