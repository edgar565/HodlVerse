package org.edgar.hodlverse.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Future;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La dificultad no puede ser nula")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @NotNull(message = "El crédito inicial no puede ser nulo")
    @DecimalMin(value = "0.0", message = "El crédito inicial debe ser mayor o igual a 0")
    @Column(nullable = false)
    private BigDecimal initialCredit;

    @NotNull(message = "El objetivo no puede ser nulo")
    @DecimalMin(value = "0.0", message = "El objetivo debe ser mayor o igual a 0")
    @Column(nullable = false)
    private BigDecimal objective;

    @Min(value = 1, message = "La duración debe ser al menos 1 día")
    @Column(nullable = false)
    private int duration;

    @NotNull(message = "La fecha de inicio no puede ser nula")
    @Future(message = "La fecha de inicio debe ser una fecha futura")
    @Column(nullable = false)
    private LocalDateTime startDate;

    @NotNull(message = "La fecha de fin no puede ser nula")
    @Column(nullable = false)
    private LocalDateTime endDate;

    @NotNull(message = "El usuario no puede ser nulo")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private Result result;

    public enum Difficulty {
        BEGINNER,
        EXPERIENCED,
        PERSONALIZED
    }

    // Constructor con lógica para calcular endDate
    public Game(Difficulty difficulty, BigDecimal initialCredit, BigDecimal objective, int duration, LocalDateTime startDate, User user) {
        this.difficulty = difficulty;
        this.initialCredit = initialCredit;
        this.objective = objective;
        this.duration = duration;
        this.startDate = startDate;
        this.endDate = startDate.plusDays(30); // Calcula endDate sumando 30 días a startDate
        this.user = user;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public BigDecimal getInitialCredit() {
        return initialCredit;
    }

    public void setInitialCredit(BigDecimal initialCredit) {
        this.initialCredit = initialCredit;
    }

    public BigDecimal getObjective() {
        return objective;
    }

    public void setObjective(BigDecimal objective) {
        this.objective = objective;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
        this.endDate = startDate.plusDays(30); // Asegura que endDate se actualice si startDate cambia
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Result getResult() {
        return result;
    }

    public void setResult(Result result) {
        this.result = result;
    }
}