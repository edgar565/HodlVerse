package org.edgar.hodlverse.services;

import org.edgar.hodlverse.entities.History;
import org.edgar.hodlverse.repositories.HistoryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class HistoryService {

    private final HistoryRepository historyRepository;

    public HistoryService(HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    // Obtener todas las entradas de historial
    public List<History> findAll() {
        return historyRepository.findAll();
    }

    // Guardar una nueva entrada de historial
    public History save(History history) {
        return historyRepository.save(history);
    }

    // Buscar una entrada de historial por su ID
    public Optional<History> findById(Long id) {
        return historyRepository.findById(id);
    }

    // Eliminar una entrada de historial por su ID
    public void deleteById(Long id) {
        historyRepository.deleteById(id);
    }

    public List<History> getCurrenciesOrderedByPriceChangePercentage() {
        return historyRepository.findLatestHistoriesOrderByPriceChangePercentageDesc();
    }

    public List<History> getCurrenciesOrderedByPriceChangePercentageAsc() {
        return historyRepository.findLatestHistoriesOrderByPriceChangePercentageAsc();
    }

    public List<History> getCoinsOrderedByMarketCapRankAsc() {
        return historyRepository.findLatestHistoriesOrderByMarketCapRankAsc();
    }

    public List<History> getCurrenciesOrderedByTotalVolumeDesc() {
        return historyRepository.findLatestHistoriesOrderByTotalVolumeDesc();
    }

    public BigDecimal getTotalMarketCap() {
        return historyRepository.findLatestHistories().stream()
                .map(History::getMarketCap)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalVolume() {
        return historyRepository.findLatestHistories().stream()
                .map(History::getTotalVolume)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Record getDailyPrices(Long currencyId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59);

        // Buscar el precio más cercano al inicio del día
        Optional<History> startPrice = historyRepository.findFirstByCurrencyIdAndLastUpdatedAfterOrderByLastUpdatedAsc(currencyId, startOfDay.minusMinutes(5));

        // Buscar el precio más cercano al final del día
        Optional<History> endPrice = historyRepository.findFirstByCurrencyIdAndLastUpdatedBeforeOrderByLastUpdatedDesc(currencyId, endOfDay.plusMinutes(5));

        BigDecimal openPrice = startPrice.map(History::getCurrentPrice).orElse(BigDecimal.ZERO);
        BigDecimal closePrice = endPrice.map(History::getCurrentPrice).orElse(BigDecimal.ZERO);
        BigDecimal high24h = endPrice.map(History::getHigh24h).orElse(BigDecimal.ZERO);
        BigDecimal low24h = endPrice.map(History::getLow24h).orElse(BigDecimal.ZERO);

        return new Record(openPrice, closePrice, high24h, low24h);
    }

    // Obtener la última entrada de History para una moneda por su ID
    public Optional<History> getLatestHistoryByCurrencyId(Long currencyId) {
        return historyRepository.findLatestHistoryByCurrencyId(currencyId);
    }

    public List<History> getAllHistoryByCurrencyId(Long currencyId) {
        return historyRepository.findByCurrency_CurrencyId(currencyId);
    }


    public static class Record {
        private BigDecimal openPrice;
        private BigDecimal closePrice;
        private BigDecimal high24h;
        private BigDecimal low24h;

        public Record(BigDecimal openPrice, BigDecimal closePrice, BigDecimal high24h, BigDecimal low24h) {
            this.openPrice = openPrice;
            this.closePrice = closePrice;
            this.high24h = high24h;
            this.low24h = low24h;
        }

        public BigDecimal getOpenPrice() {
            return openPrice;
        }

        public BigDecimal getClosePrice() {
            return closePrice;
        }

        public BigDecimal getHigh24h() {
            return high24h;
        }

        public BigDecimal getLow24h() {
            return low24h;
        }

    }
}