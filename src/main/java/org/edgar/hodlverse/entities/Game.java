package org.edgar.hodlverse.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@Entity
public class Game {
    public Game() {}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(nullable = false)
    @JsonProperty("initial_credit")
    private BigDecimal initialCredit;

    @Column(nullable = false)
    private BigDecimal objective;

    @Column(nullable = false)
    private int duration;

    @Column(nullable = false)
    @JsonProperty("start_date")
    private LocalDateTime startDate;

    @Column(nullable = false)
    @JsonProperty("end_date")
    private LocalDateTime endDate; // Calculado automáticamente

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

    // Constructor con lógica corregida para calcular endDate correctamente
    public Game(Difficulty difficulty, BigDecimal initialCredit, BigDecimal objective, int duration, LocalDateTime startDate, User user) {
        this.difficulty = difficulty;
        this.initialCredit = initialCredit;
        this.objective = objective;
        this.duration = duration;
        this.startDate = startDate;
        this.endDate = startDate.plusDays(duration); // Ahora usa duration correctamente
        this.user = user;
    }

    // Getters y Setters

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
        if (this.startDate != null) {
            this.endDate = this.startDate.plusDays(duration); // Asegura que endDate se actualice si cambia duration
        }
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
        if (this.duration > 0) {
            this.endDate = startDate.plusDays(duration); // Asegura que endDate se actualice si cambia startDate
        }
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
