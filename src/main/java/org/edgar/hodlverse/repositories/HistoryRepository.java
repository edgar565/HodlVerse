package org.edgar.hodlverse.repositories;
import org.edgar.hodlverse.entities.Currency;
import org.edgar.hodlverse.entities.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {

    @Query("SELECT h FROM History h WHERE h.historyId IN ( " +
            "SELECT MAX(h2.historyId) FROM History h2 GROUP BY h2.currency.currencyId ) " +
            "ORDER BY h.priceChangePercentage24h DESC")
    List<History> findLatestHistoriesOrderByPriceChangePercentageDesc();

    @Query("SELECT h FROM History h WHERE h.historyId IN ( " +
            "SELECT MAX(h2.historyId) FROM History h2 GROUP BY h2.currency.currencyId ) " +
            "ORDER BY h.priceChangePercentage24h ASC")
    List<History> findLatestHistoriesOrderByPriceChangePercentageAsc();

    @Query("SELECT h FROM History h WHERE h.historyId IN ( " +
            "SELECT MAX(h2.historyId) FROM History h2 GROUP BY h2.currency.currencyId ) " +
            "ORDER BY h.marketCapRank ASC")
    List<History> findLatestHistoriesOrderByMarketCapRankAsc();

    @Query("SELECT h FROM History h WHERE h.historyId IN ( " +
            "SELECT MAX(h2.historyId) FROM History h2 GROUP BY h2.currency.currencyId ) " +
            "ORDER BY h.totalVolume DESC")
    List<History> findLatestHistoriesOrderByTotalVolumeDesc();

    @Query("SELECT h FROM History h WHERE h.currency.currencyId = :currencyId AND h.lastUpdated > :start ORDER BY h.lastUpdated ASC")
    Optional<History> findFirstByCurrencyIdAndLastUpdatedAfterOrderByLastUpdatedAsc(@Param("currencyId") Long currencyId, @Param("start") LocalDateTime start);

    @Query("SELECT h FROM History h WHERE h.currency.currencyId = :currencyId AND h.lastUpdated < :end ORDER BY h.lastUpdated DESC")
    Optional<History> findFirstByCurrencyIdAndLastUpdatedBeforeOrderByLastUpdatedDesc(@Param("currencyId") Long currencyId, @Param("end") LocalDateTime end);

    Optional<History> findTopByCurrencyOrderByLastUpdatedDesc(Currency currency);

    @Query("SELECT h FROM History h WHERE h.historyId IN ( " +
            "SELECT MAX(h2.historyId) FROM History h2 GROUP BY h2.currency.currencyId )")
    List<History> findLatestHistories();

    // Obtener el historial más reciente de una divisa antes o en la fecha especificada
    @Query("SELECT h FROM History h WHERE h.currency = :currency AND h.lastUpdated <= :date ORDER BY h.lastUpdated DESC")
    Optional<History> findLatestHistoryByCurrencyBeforeDate(
            org.edgar.hodlverse.entities.Currency currency, LocalDate date);

    // Consulta personalizada para encontrar la última entrada de History para una moneda
    @Query("SELECT h FROM History h WHERE h.currency.currencyId = :currencyId ORDER BY h.lastUpdated DESC LIMIT 1")
    Optional<History> findLatestHistoryByCurrencyId(@Param("currencyId") Long currencyId);

    List<History> findByCurrency_CurrencyId(Long currencyId);

}

