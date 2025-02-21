package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Currency;
import org.edgar.hodlverse.entities.Transaction;
import org.edgar.hodlverse.entities.Wallet;
import org.edgar.hodlverse.services.NotFoundException;
import org.edgar.hodlverse.services.TransactionService;
import org.edgar.hodlverse.services.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/wallets") // Ruta base para el controlador
public class WalletController {

    private final WalletService walletService;
    private final TransactionService transactionService;

    public WalletController(WalletService walletService, TransactionService transactionService) {
        this.walletService = walletService;
        this.transactionService = transactionService;
    }

    // Obtener todas las billeteras
    @GetMapping
    public List<Wallet> all() {
        return walletService.findAll();
    }

    // Crear una nueva billetera
    @PostMapping
    public Wallet newWallet(@RequestBody Wallet newWallet) {
        return walletService.save(newWallet);
    }

    // Obtener una billetera específica por su ID
    @GetMapping("/{id}")
    public Wallet one(@PathVariable Long id) {
        return walletService.findById(id)
                .orElseThrow(() -> new NotFoundException("Billetera con ID " + id + " no encontrada."));
    }

    // Actualizar una billetera existente
    @PutMapping("/{id}")
    public Wallet replaceWallet(@RequestBody Wallet newWallet, @PathVariable Long id) {
        return walletService.findById(id)
                .map(wallet -> {
                    wallet.setWalletName(newWallet.getWalletName());
                    wallet.setCreationDate(newWallet.getCreationDate());
                    wallet.setUser(newWallet.getUser());
                    return walletService.save(wallet);
                })
                .orElseGet(() -> {
                    newWallet.setWalletId(id);
                    return walletService.save(newWallet);
                });
    }

    // Eliminar una billetera por su ID
    @DeleteMapping("/{id}")
    public void deleteWallet(@PathVariable Long id) {
        if (walletService.findById(id).isEmpty()) {
            throw new NotFoundException("Wallet con ID " + id + " no encontrada.");
        }
        walletService.deleteById(id);
    }

    @GetMapping("/totalBalance/{userId}")
    public ResponseEntity<BigDecimal> getWalletValue(@PathVariable Long userId) {
        BigDecimal totalValue = walletService.calculateTotalWalletValueInUSD(userId);
        return ResponseEntity.ok(totalValue);
    }

    @GetMapping("/{userId}/currencies")
    public List<Currency> getCurrenciesByUserId(@PathVariable Long userId) {
        return walletService.getCurrenciesByUserId(userId);
    }

    @GetMapping("/user/{userId}/balance/on/{date}")
    public ResponseEntity<BigDecimal> getUserBalanceOnSpecificDate(
            @PathVariable Long userId,
            @PathVariable String date) {

        try {
            LocalDate targetDate = LocalDate.parse(date);

            // Obtener todas las transacciones antes de la fecha dada, en orden ascendente
            List<Transaction> transactions = transactionService.findTransactionsByUserIdAndTransactionDateGreaterThanEqual(userId, targetDate);

            if (transactions.isEmpty()) {
                // Si no hay transacciones antes de la fecha, devolver el balance más antiguo disponible
                return ResponseEntity.ok(BigDecimal.ZERO);
            }

            // Obtener el balance actual
            BigDecimal currentBalance = walletService.calculateTotalWalletValueInUSD(userId);

            // Calcular el balance histórico
            BigDecimal historicalBalance = calculateHistoricalBalance(currentBalance, transactions);

            return ResponseEntity.ok(historicalBalance);

        } catch (NotFoundException e) {
            return ResponseEntity.status(404).body(BigDecimal.ZERO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(BigDecimal.ZERO);
        }
    }

    // Método para calcular el balance histórico basado en transacciones en orden cronológico
    private BigDecimal calculateHistoricalBalance(BigDecimal currentBalance, List<Transaction> transactions) {
        // Ordenar las transacciones en orden cronológico (ya debería venir así, pero por seguridad)
        Collections.reverse(transactions);

        BigDecimal balance = currentBalance;

        for (Transaction transaction : transactions) {
            switch (transaction.getTransactionType().toLowerCase()) {
                case "buy":
                    balance = balance.add(transaction.getOriginTransactionAmount().multiply(transaction.getOriginUnitPrice()));
                    balance = balance.subtract(transaction.getDestinationTransactionAmount().multiply(transaction.getDestinationUnitPrice()));
                    break;
                case "sell":
                    balance = balance.subtract(transaction.getOriginTransactionAmount().multiply(transaction.getOriginUnitPrice()));
                    balance = balance.add(transaction.getDestinationTransactionAmount().multiply(transaction.getDestinationUnitPrice()));
                    break;
                case "exchange":
                    balance = balance.add(transaction.getOriginTransactionAmount().multiply(transaction.getOriginUnitPrice()));
                    balance = balance.subtract(transaction.getDestinationTransactionAmount().multiply(transaction.getDestinationUnitPrice()));
                    break;
                default:
                    continue;
            }
        }

        return balance;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getWalletByUserId(@PathVariable Long userId) {
        Optional<Wallet> wallet = walletService.getWalletByUserId(userId);
        if (wallet.isPresent()) {
            return ResponseEntity.ok(wallet.get());
        } else {
            return ResponseEntity.badRequest().body("No se encontró una billetera para el usuario con ID " + userId);
        }
    }

}
