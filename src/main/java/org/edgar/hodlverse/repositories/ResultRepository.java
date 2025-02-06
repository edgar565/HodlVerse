package org.edgar.hodlverse.repositories;

import org.edgar.hodlverse.entities.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    Optional<Result> findByGameId(Long gameId);  // Buscar un resultado por el ID del juego
}
