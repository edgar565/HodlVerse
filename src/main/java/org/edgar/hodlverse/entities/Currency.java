package org.edgar.hodlverse.entities;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Currency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long currencyId;

    @NotBlank(message = "El ticker no puede estar en blanco")
    @Size(max = 10, message = "El ticker no puede tener más de 10 caracteres")
    @Column(nullable = false, unique = true, length = 10)
    private String ticker; // Símbolo corto de la criptomoneda

    @NotBlank(message = "El nombre no puede estar en blanco")
    @Column(nullable = false)
    private String name; // Ejemplo: Bitcoin

    @NotBlank(message = "La URL de la imagen no puede estar en blanco")
    @Column(nullable = false)
    private String image; // URL del logo de la criptomoneda

    @JsonIgnore
    @OneToMany(mappedBy = "currency", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Balance> balances = new ArrayList<>();

    @OneToMany(mappedBy = "originCurrency", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Transaction> originTransactions = new ArrayList<>();

    @OneToMany(mappedBy = "destinationCurrency", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Transaction> destinationTransactions = new ArrayList<>();

    @OneToMany(mappedBy = "currency", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<History> history = new ArrayList<>();

    public Long getCurrencyId() {
        return currencyId;
    }

    public void setCurrencyId(Long currencyId) {
        this.currencyId = currencyId;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public List<Balance> getBalances() {
        return balances;
    }

    public void setBalances(List<Balance> balances) {
        this.balances = balances;
    }

    public List<Transaction> getOriginTransactions() {
        return originTransactions;
    }

    public void setOriginTransactions(List<Transaction> originTransactions) {
        this.originTransactions = originTransactions;
    }

    public List<Transaction> getDestinationTransactions() {
        return destinationTransactions;
    }

    public void setDestinationTransactions(List<Transaction> destinationTransactions) {
        this.destinationTransactions = destinationTransactions;
    }

    public List<History> getHistory() {
        return history;
    }

    public void setHistory(List<History> history) {
        this.history = history;
    }
}

