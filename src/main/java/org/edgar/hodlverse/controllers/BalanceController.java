package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Balance;
import org.edgar.hodlverse.services.BalanceService;
import org.edgar.hodlverse.services.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/balances")
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @GetMapping
    public List<Balance> all() {
        return balanceService.findAll();
    }

    @PostMapping
    public Balance newBalance(@RequestBody Balance newBalance) {
        return balanceService.save(newBalance);
    }

    @GetMapping("/{id}")
    public Balance findBalanceById(@PathVariable Long id) {
        return balanceService.findById(id)
                .orElseThrow(() -> new NotFoundException("Balance con ID " + id + " no encontrado."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Balance> replaceBalance(@RequestBody Balance newBalance, @PathVariable Long id) {
        if (newBalance.getWallet() == null || newBalance.getCurrency() == null) {
            return ResponseEntity.badRequest().build();
        }
        return balanceService.findById(id)
                .map(balance -> {
                    balance.setWalletAmount(newBalance.getWalletAmount());
                    balance.setWallet(newBalance.getWallet());
                    balance.setCurrency(newBalance.getCurrency());
                    return ResponseEntity.ok(balanceService.save(balance));
                })
                .orElseGet(() -> {
                    newBalance.setBalanceId(id);
                    return ResponseEntity.ok(balanceService.save(newBalance));
                });
    }

    @DeleteMapping("/{id}")
    public void deleteBalance(@PathVariable Long id) {
        if (balanceService.findById(id).isEmpty()) {
            throw new NotFoundException("Balance con ID " + id + " no encontrado.");
        }
        balanceService.deleteById(id);
    }

    @GetMapping("/currency/{currencyId}")
    public List<Balance> balancesByCurrency(@PathVariable Long currencyId) {
        return balanceService.findByCurrencyId(currencyId);
    }

    @GetMapping("/wallet/{walletId}")
    public List<Balance> balancesByWallet(@PathVariable Long walletId) {
        return balanceService.findByWalletId(walletId);
    }

    @GetMapping("/total/{walletId}/{currencyId}")
    public BigDecimal getTotalWalletAmount(
            @PathVariable Long walletId,
            @PathVariable Long currencyId
    ) {
        return balanceService.getTotalWalletAmount(walletId, currencyId);
    }
}
