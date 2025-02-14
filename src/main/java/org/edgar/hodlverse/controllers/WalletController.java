package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Currency;
import org.edgar.hodlverse.entities.Wallet;
import org.edgar.hodlverse.services.NotFoundException;
import org.edgar.hodlverse.services.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/wallets")
@Validated
public class WalletController {

    private final WalletService walletService;

    @Autowired
    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    // Obtener todas las billeteras
    @GetMapping
    public ResponseEntity<List<Wallet>> all() {
        List<Wallet> wallets = walletService.findAll();
        return ResponseEntity.ok(wallets);
    }

    // Crear una nueva billetera
    @PostMapping
    public ResponseEntity<Wallet> newWallet(@Valid @RequestBody Wallet newWallet) {
        Wallet savedWallet = walletService.save(newWallet);
        return ResponseEntity.ok(savedWallet);
    }

    // Obtener una billetera específica por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Wallet> one(@PathVariable @NotNull Long id) {
        return walletService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Billetera con ID " + id + " no encontrada."));
    }

    // Actualizar una billetera existente
    @PutMapping("/{id}")
    public ResponseEntity<Wallet> replaceWallet(@PathVariable @NotNull Long id, @Valid @RequestBody Wallet newWallet) {
        return walletService.findById(id)
                .map(wallet -> {
                    wallet.setWalletName(newWallet.getWalletName());
                    wallet.setCreationDate(newWallet.getCreationDate());
                    wallet.setUser(newWallet.getUser());
                    return ResponseEntity.ok(walletService.save(wallet));
                })
                .orElseGet(() -> {
                    newWallet.setWalletId(id);
                    return ResponseEntity.ok(walletService.save(newWallet));
                });
    }

    // Eliminar una billetera por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWallet(@PathVariable @NotNull Long id) {
        if (walletService.findById(id).isEmpty()) {
            throw new NotFoundException("Billetera con ID " + id + " no encontrada.");
        }
        walletService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Obtener el valor total de una billetera en USD
    @GetMapping("/totalBalance/{userId}")
    public ResponseEntity<BigDecimal> getWalletValue(@PathVariable @NotNull Long userId) {
        BigDecimal totalValue = walletService.calculateTotalWalletValueInUSD(userId);
        return ResponseEntity.ok(totalValue);
    }

    // Obtener las divisas asociadas a un usuario
    @GetMapping("/{userId}/currencies")
    public ResponseEntity<List<Currency>> getCurrenciesByUserId(@PathVariable @NotNull Long userId) {
        List<Currency> currencies = walletService.getCurrenciesByUserId(userId);
        return ResponseEntity.ok(currencies);
    }

    // Obtener el balance total de un usuario en una fecha específica
    @GetMapping("/totalBalance/{userId}/on/{date}")
    public ResponseEntity<BigDecimal> getUserBalanceOnDate(
            @PathVariable @NotNull Long userId,
            @PathVariable @NotNull String date) {

        try {
            LocalDate targetDate = LocalDate.parse(date);
            BigDecimal totalBalance = walletService.calculateUserBalanceOnDate(userId, targetDate);
            return ResponseEntity.ok(totalBalance);
        } catch (Exception e) {
            throw new NotFoundException("Fecha inválida o datos no encontrados para el usuario con ID " + userId);
        }
    }
}
