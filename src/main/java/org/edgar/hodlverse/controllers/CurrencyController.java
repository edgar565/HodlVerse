package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Currency;
import org.edgar.hodlverse.services.CurrencyService;
import org.edgar.hodlverse.services.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/currencies")
@Validated
public class CurrencyController {

    private final CurrencyService currencyService;

    @Autowired
    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    // Obtener todas las monedas
    @GetMapping
    public ResponseEntity<List<Currency>> all() {
        List<Currency> currencies = currencyService.findAll();
        return ResponseEntity.ok(currencies);
    }

    // Crear una nueva moneda
    @PostMapping
    public ResponseEntity<Currency> newCurrency(@Valid @RequestBody Currency newCurrency) {
        Currency savedCurrency = currencyService.save(newCurrency);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCurrency);
    }

    // Obtener una moneda específica por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Currency> one(@PathVariable @NotNull Long id) {
        return currencyService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Moneda con ID " + id + " no encontrada."));
    }

    // Actualizar una moneda existente
    @PutMapping("/{id}")
    public ResponseEntity<Currency> replaceCurrency(@PathVariable @NotNull Long id, @Valid @RequestBody Currency newCurrency) {
        return currencyService.findById(id)
                .map(currency -> {
                    currency.setTicker(newCurrency.getTicker());
                    currency.setName(newCurrency.getName());
                    currency.setImage(newCurrency.getImage());
                    return ResponseEntity.ok(currencyService.save(currency));
                })
                .orElseGet(() -> {
                    newCurrency.setCurrencyId(id);
                    return ResponseEntity.status(HttpStatus.CREATED).body(currencyService.save(newCurrency));
                });
    }

    // Eliminar una moneda por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCurrency(@PathVariable @NotNull Long id) {
        if (currencyService.findById(id).isEmpty()) {
            throw new NotFoundException("Moneda con ID " + id + " no encontrada.");
        }
        currencyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
