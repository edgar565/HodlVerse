package org.edgar.hodlverse.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Entity
public class History {
    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @NotNull(message = "El precio actual no puede ser nulo")
    @DecimalMin(value = "0.0", message = "El precio actual debe ser mayor o igual a 0")
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal currentPrice; // Precio actual de la criptomoneda (USD)

    @NotNull(message = "La capitalización de mercado no puede ser nula")
    @DecimalMin(value = "0.0", message = "La capitalización de mercado debe ser mayor o igual a 0")
    @Column(nullable = false)
    private BigDecimal marketCap; // Capitalización de mercado (USD)

    @NotNull(message = "El ranking de capitalización de mercado no puede ser nulo")
    @Column(nullable = false)
    private Integer marketCapRank; // Ranking basado en capitalización de mercado

    @NotNull(message = "El volumen total no puede ser nulo")
    @DecimalMin(value = "0.0", message = "El volumen total debe ser mayor o igual a 0")
    @Column(nullable = false)
    private BigDecimal totalVolume; // Volumen total de transacciones en 24 horas (USD)

    @NotNull(message = "El precio más alto en 24h no puede ser nulo")
    @DecimalMin(value = "0.0", message = "El precio más alto en 24h debe ser mayor o igual a 0")
    @Column(nullable = false)
    private BigDecimal high24h; // Precio más alto en las últimas 24 horas (USD)

    @NotNull(message = "El precio más bajo en 24h no puede ser nulo")
    @DecimalMin(value = "0.0", message = "El precio más bajo en 24h debe ser mayor o igual a 0")
    @Column(nullable = false)
    private BigDecimal low24h; // Precio más bajo en las últimas 24 horas (USD)

    @NotNull(message = "El cambio de precio en 24h no puede ser nulo")
    @Column(nullable = false)
    private BigDecimal priceChange24h; // Cambio de precio en 24 horas (USD)

    @NotNull(message = "El cambio porcentual de precio en 24h no puede ser nulo")
    @Column(nullable = false)
    private BigDecimal priceChangePercentage24h; // Cambio porcentual del precio en 24 horas

    @NotNull(message = "El cambio de capitalización en 24h no puede ser nulo")
    @Column(nullable = false)
    private BigDecimal marketCapChange24h; // Cambio de capitalización en 24 horas (USD)

    @NotNull(message = "El cambio porcentual de capitalización en 24h no puede ser nulo")
    @Column(nullable = false)
    private BigDecimal marketCapChangePercentage24h;// Cambio porcentual de capitalización en 24 horas

    @NotNull(message = "El suministro total no puede ser nulo")
    @DecimalMin(value = "0.0", message = "El suministro total debe ser mayor o igual a 0")
    @Column(nullable = false)
    private BigDecimal totalSupply; // Suministro total

    @NotNull(message = "La fecha de última actualización no puede ser nula")
    @Column(nullable = false)
    private LocalDateTime lastUpdated; // Última fecha y hora de actualización de los datos

    @NotNull(message = "La moneda no puede ser nula")
    @ManyToOne
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    public Long getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getMarketCap() {
        return marketCap;
    }

    public void setMarketCap(BigDecimal marketCap) {
        this.marketCap = marketCap;
    }

    public Integer getMarketCapRank() {
        return marketCapRank;
    }

    public void setMarketCapRank(Integer marketCapRank) {
        this.marketCapRank = marketCapRank;
    }

    public BigDecimal getTotalVolume() {
        return totalVolume;
    }

    public void setTotalVolume(BigDecimal totalVolume) {
        this.totalVolume = totalVolume;
    }

    public BigDecimal getHigh24h() {
        return high24h;
    }

    public void setHigh24h(BigDecimal high24h) {
        this.high24h = high24h;
    }

    public BigDecimal getLow24h() {
        return low24h;
    }

    public void setLow24h(BigDecimal low24h) {
        this.low24h = low24h;
    }

    public BigDecimal getPriceChange24h() {
        return priceChange24h;
    }

    public void setPriceChange24h(BigDecimal priceChange24h) {
        this.priceChange24h = priceChange24h;
    }

    public BigDecimal getPriceChangePercentage24h() {
        return priceChangePercentage24h;
    }

    public void setPriceChangePercentage24h(BigDecimal priceChangePercentage24h) {
        this.priceChangePercentage24h = priceChangePercentage24h;
    }

    public BigDecimal getMarketCapChange24h() {
        return marketCapChange24h;
    }

    public void setMarketCapChange24h(BigDecimal marketCapChange24h) {
        this.marketCapChange24h = marketCapChange24h;
    }

    public BigDecimal getMarketCapChangePercentage24h() {
        return marketCapChangePercentage24h;
    }

    public void setMarketCapChangePercentage24h(BigDecimal marketCapChangePercentage24h) {
        this.marketCapChangePercentage24h = marketCapChangePercentage24h;
    }

    public BigDecimal getTotalSupply() {
        return totalSupply;
    }

    public void setTotalSupply(BigDecimal totalSupply) {
        this.totalSupply = totalSupply;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Currency currency) {
        this.currency = currency;
    }
}

