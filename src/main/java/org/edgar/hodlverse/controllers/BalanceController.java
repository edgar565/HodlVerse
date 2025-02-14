package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Balance;
import org.edgar.hodlverse.services.BalanceService;
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
@RequestMapping("/balances")
@Validated
public class BalanceController {

    private final BalanceService balanceService;

    @Autowired
    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    // Obtener todos los balances
    @GetMapping
    public ResponseEntity<List<Balance>> all() {
        List<Balance> balances = balanceService.findAll();
        return ResponseEntity.ok(balances);
    }

    // Crear un nuevo balance
    @PostMapping
    public ResponseEntity<Balance> newBalance(@Valid @RequestBody Balance newBalance) {
        Balance savedBalance = balanceService.save(newBalance);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBalance);
    }

    // Obtener un balance específico por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Balance> findBalanceById(@PathVariable @NotNull Long id) {
        return balanceService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Balance con ID " + id + " no encontrado."));
    }

    // Actualizar un balance existente
    @PutMapping("/{id}")
    public ResponseEntity<Balance> replaceBalance(@PathVariable @NotNull Long id, @Valid @RequestBody Balance newBalance) {
        return balanceService.findById(id)
                .map(balance -> {
                    balance.setWalletAmount(newBalance.getWalletAmount());
                    balance.setWallet(newBalance.getWallet());
                    balance.setCurrency(newBalance.getCurrency());
                    return ResponseEntity.ok(balanceService.save(balance));
                })
                .orElseGet(() -> {
                    newBalance.setBalanceId(id);
                    return ResponseEntity.status(HttpStatus.CREATED).body(balanceService.save(newBalance));
                });
    }

    // Eliminar un balance por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBalance(@PathVariable @NotNull Long id) {
        if (balanceService.findById(id).isEmpty()) {
            throw new NotFoundException("Balance con ID " + id + " no encontrado.");
        }
        balanceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Obtener balances por currency ID
    @GetMapping("/currency/{currencyId}")
    public ResponseEntity<List<Balance>> balancesByCurrency(@PathVariable @NotNull Long currencyId) {
        List<Balance> balances = balanceService.findByCurrencyId(currencyId);
        if (balances.isEmpty()) {
            throw new NotFoundException("No se encontraron balances para la divisa con ID " + currencyId);
        }
        return ResponseEntity.ok(balances);
    }
}
