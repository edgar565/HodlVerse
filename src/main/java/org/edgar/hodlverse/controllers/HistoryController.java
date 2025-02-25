package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.History;
import org.edgar.hodlverse.services.HistoryService;
import org.edgar.hodlverse.services.NotFoundException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/history") // Ruta base para el controlador
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    // Obtener todas las entradas de historial
    @GetMapping
    public List<History> all() {
        return historyService.findAll();
    }

    // Crear una nueva entrada de historial
    @PostMapping
    public History newHistory(@RequestBody History newHistory) {
        return historyService.save(newHistory);
    }

    // Obtener una entrada de historial específica por su ID
    @GetMapping("/{id}")
    public History one(@PathVariable Long id) {
        return historyService.findById(id)
                .orElseThrow(() -> new NotFoundException("Historial con ID " + id + " no encontrado."));
    }

    // Actualizar una entrada de historial existente
    @PutMapping("/{id}")
    public History replaceHistory(@RequestBody History newHistory, @PathVariable Long id) {
        return historyService.findById(id)
                .map(history -> {
                    // Actualizar todos los campos
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
                    return historyService.save(history);
                })
                .orElseGet(() -> {
                    newHistory.setHistoryId(id);
                    return historyService.save(newHistory);
                });
    }

    // Eliminar una entrada de historial por su ID
    @DeleteMapping("/{id}")
    public void deleteHistory(@PathVariable Long id) {
        if (historyService.findById(id).isEmpty()) {
            throw new NotFoundException("Historial con ID " + id + " no encontrado.");
        }
        historyService.deleteById(id);
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

    //Endpoint para obterner las monedas ordenadas por marketCapRank ascendente
    @GetMapping("/trending-coins")
    public List<History> getCoinsOrderedByMarketCapRank() {
        return historyService.getCoinsOrderedByMarketCapRankAsc();
    }

    // Endpoint para obtener todas las monedas ordenadas por totalVolume descendente
    @GetMapping("/highest-volume")
    public ResponseEntity<List<History>> getCurrenciesOrderedByTotalVolumeDesc() {
        List<History> histories = historyService.getCurrenciesOrderedByTotalVolumeDesc();
        return ResponseEntity.ok(histories);
    }

    @GetMapping("/{currencyId}/daily-prices")
    public ResponseEntity<Map<String, Object>> getDailyPrices(
            @PathVariable Long currencyId,
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
    public BigDecimal getTotalMarketCap() {
        return historyService.getTotalMarketCap();
    }

    @GetMapping("/total-volume")
    public BigDecimal getTotalVolume() {
        return historyService.getTotalVolume();
    }

    // Endpoint para obtener la última entrada de History para una moneda por su ID
    @GetMapping("/latest/{currencyId}")
    public ResponseEntity<History> getLatestHistoryByCurrencyId(@PathVariable Long currencyId) {
        Optional<History> latestHistory = historyService.getLatestHistoryByCurrencyId(currencyId);

        if (latestHistory.isEmpty()) {
            throw new NotFoundException("No se encontró ninguna entrada de History para la moneda con ID " + currencyId + ".");
        }

        return ResponseEntity.ok(latestHistory.get());
    }

    @GetMapping("/currency/{currencyId}/all")
    public List<History> getAllHistoryByCurrencyId(@PathVariable Long currencyId) {
        return historyService.getAllHistoryByCurrencyId(currencyId);
    }


}