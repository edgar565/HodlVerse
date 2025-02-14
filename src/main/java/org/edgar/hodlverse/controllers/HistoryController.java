package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.History;
import org.edgar.hodlverse.services.HistoryService;
import org.edgar.hodlverse.services.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/history")
@Validated
public class HistoryController {

    private final HistoryService historyService;

    @Autowired
    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    // Obtener todas las entradas de historial
    @GetMapping
    public ResponseEntity<List<History>> all() {
        List<History> histories = historyService.findAll();
        return ResponseEntity.ok(histories);
    }

    // Crear una nueva entrada de historial
    @PostMapping
    public ResponseEntity<History> newHistory(@Valid @RequestBody History newHistory) {
        History savedHistory = historyService.save(newHistory);
        return ResponseEntity.ok(savedHistory);
    }

    // Obtener una entrada de historial específica por su ID
    @GetMapping("/{id}")
    public ResponseEntity<History> one(@PathVariable @NotNull Long id) {
        return historyService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Historial con ID " + id + " no encontrado."));
    }

    // Actualizar una entrada de historial existente
    @PutMapping("/{id}")
    public ResponseEntity<History> replaceHistory(@PathVariable @NotNull Long id, @Valid @RequestBody History newHistory) {
        return historyService.findById(id)
                .map(history -> {
                    history.setCurrentPrice(newHistory.getCurrentPrice());
                    history.setMarketCap(newHistory.getMarketCap());
                    history.setMarketCapRank(newHistory.getMarketCapRank());
                    history.setTotalVolume(newHistory.getTotalVolume());
                    history.setHigh24h(newHistory.getHigh24h());
                    history.setLow24h(newHistory.getLow24h());
                    history.setPriceChange24h(newHistory.getPriceChange24h());
                    history.setPriceChangePercentage24h(newHistory.getPriceChangePercentage24h());
                    history.setMarketCapChange24h(newHistory.getMarketCapChange24h());
                    history.setMarketCapChangePercentage24h(newHistory.getMarketCapChangePercentage24h());
                    history.setTotalSupply(newHistory.getTotalSupply());
                    history.setLastUpdated(newHistory.getLastUpdated());
                    history.setCurrency(newHistory.getCurrency());
                    return ResponseEntity.ok(historyService.save(history));
                })
                .orElseGet(() -> {
                    newHistory.setHistoryId(id);
                    return ResponseEntity.ok(historyService.save(newHistory));
                });
    }

    // Eliminar una entrada de historial por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable @NotNull Long id) {
        if (historyService.findById(id).isEmpty()) {
            throw new NotFoundException("Historial con ID " + id + " no encontrado.");
        }
        historyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para obtener todas las monedas ordenadas por priceChangePercentage24h descendente
    @GetMapping("/topWinners")
    public ResponseEntity<List<History>> getCurrenciesOrderedByPriceChangePercentage() {
        List<History> histories = historyService.getCurrenciesOrderedByPriceChangePercentage();
        return ResponseEntity.ok(histories);
    }

    // Endpoint para obtener todas las monedas ordenadas por priceChangePercentage24h ascendente
    @GetMapping("/topLosers")
    public ResponseEntity<List<History>> getCurrenciesOrderedByPriceChangePercentageAsc() {
        List<History> histories = historyService.getCurrenciesOrderedByPriceChangePercentageAsc();
        return ResponseEntity.ok(histories);
    }

    // Endpoint para obtener todas las monedas ordenadas por marketCapRank ascendente
    @GetMapping("/trending-coins")
    public ResponseEntity<List<History>> getCoinsOrderedByMarketCapRank() {
        List<History> histories = historyService.getCoinsOrderedByMarketCapRankAsc();
        return ResponseEntity.ok(histories);
    }

    // Endpoint para obtener todas las monedas ordenadas por totalVolume descendente
    @GetMapping("/highest-volume")
    public ResponseEntity<List<History>> getCurrenciesOrderedByTotalVolumeDesc() {
        List<History> histories = historyService.getCurrenciesOrderedByTotalVolumeDesc();
        return ResponseEntity.ok(histories);
    }

    @GetMapping("/{currencyId}/daily-prices")
    public ResponseEntity<Map<String, Object>> getDailyPrices(
            @PathVariable @NotNull Long currencyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) {
            date = LocalDate.now(); // Si no se proporciona una fecha, usar la fecha actual
        }

        HistoryService.Record record = historyService.getDailyPrices(currencyId, date);

        Map<String, Object> response = Map.of(
                "currency_id", currencyId,
                "date", date,
                "open_price", record.getOpenPrice(),
                "close_price", record.getClosePrice(),
                "high_24h", record.getHigh24h(),
                "low_24h", record.getLow24h()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/total-market-cap")
    public ResponseEntity<BigDecimal> getTotalMarketCap() {
        BigDecimal totalMarketCap = historyService.getTotalMarketCap();
        return ResponseEntity.ok(totalMarketCap);
    }

    @GetMapping("/total-volume")
    public ResponseEntity<BigDecimal> getTotalVolume() {
        BigDecimal totalVolume = historyService.getTotalVolume();
        return ResponseEntity.ok(totalVolume);
    }
}
