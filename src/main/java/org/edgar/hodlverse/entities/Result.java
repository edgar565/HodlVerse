package org.edgar.hodlverse.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "result")
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resultId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Ending ending;  // Enum con los valores bankruptcy, outOfTime, goalReached

    @Column(nullable = false)
    private Double profit;  // Porcentaje de beneficios

    @OneToOne
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;  // Relación con la entidad Game

    @Column(nullable = false)
    private LocalDateTime resultDate;  // Fecha en la que se registra el resultado

    // Getters and Setters
    public Long getResultId() {
        return resultId;
    }

    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }

    public Ending getEnding() {
        return ending;
    }

    public void setEnding(Ending ending) {
        this.ending = ending;
    }

    public Double getProfit() {
        return profit;
    }

    public void setProfit(Double profit) {
        this.profit = profit;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public LocalDateTime getResultDate() {
        return resultDate;
    }

    public void setResultDate(LocalDateTime resultDate) {
        this.resultDate = resultDate;
    }

    // Enum para los resultados del juego
    public enum Ending {
        BANKRUPTCY,
        OUT_OF_TIME,
        GOAL_REACHED
    }
}
