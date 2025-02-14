package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Transaction;
import org.edgar.hodlverse.services.NotFoundException;
import org.edgar.hodlverse.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/transactions")
@Validated
public class TransactionController {

    private final TransactionService transactionService;

    @Autowired
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Obtener todas las transacciones
    @GetMapping
    public ResponseEntity<List<Transaction>> all() {
        List<Transaction> transactions = transactionService.findAll();
        return ResponseEntity.ok(transactions);
    }

    // Crear una nueva transacción
    @PostMapping
    public ResponseEntity<Transaction> newTransaction(@Valid @RequestBody Transaction newTransaction) {
        Transaction savedTransaction = transactionService.save(newTransaction);
        return ResponseEntity.ok(savedTransaction);
    }

    // Obtener una transacción específica por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> one(@PathVariable @NotNull Long id) {
        return transactionService.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new NotFoundException("Transacción con ID " + id + " no encontrada."));
    }

    // Actualizar una transacción existente
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> replaceTransaction(@PathVariable @NotNull Long id, @Valid @RequestBody Transaction newTransaction) {
        return transactionService.findById(id)
                .map(transaction -> {
                    transaction.setTransactionType(newTransaction.getTransactionType());
                    transaction.setOriginTransactionAmount(newTransaction.getOriginTransactionAmount());
                    transaction.setDestinationTransactionAmount(newTransaction.getDestinationTransactionAmount());
                    transaction.setOriginUnitPrice(newTransaction.getOriginUnitPrice());
                    transaction.setDestinationUnitPrice(newTransaction.getDestinationUnitPrice());
                    transaction.setTransactionDate(newTransaction.getTransactionDate());
                    transaction.setUser(newTransaction.getUser());
                    transaction.setOriginCurrency(newTransaction.getOriginCurrency());
                    transaction.setDestinationCurrency(newTransaction.getDestinationCurrency());
                    return ResponseEntity.ok(transactionService.save(transaction));
                })
                .orElseGet(() -> {
                    newTransaction.setTransactionId(id);
                    return ResponseEntity.ok(transactionService.save(newTransaction));
                });
    }

    // Eliminar una transacción por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable @NotNull Long id) {
        if (transactionService.findById(id).isEmpty()) {
            throw new NotFoundException("Transacción con ID " + id + " no encontrada.");
        }
        transactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Obtener todas las transacciones de un usuario por su ID
    @GetMapping("/all/{id}")
    public ResponseEntity<List<Transaction>> getTransactionsByUserId(@PathVariable @NotNull Long id) {
        List<Transaction> transactions = transactionService.findTransactionsByUserId(id);
        if (transactions.isEmpty()) {
            throw new NotFoundException("No se encontraron transacciones para el usuario con ID " + id);
        }
        return ResponseEntity.ok(transactions);
    }

    // Obtener las últimas 5 transacciones de un usuario por su ID
    @GetMapping("/latest/{id}")
    public ResponseEntity<List<Transaction>> getLatestTransactionsByUserId(@PathVariable @NotNull Long id) {
        List<Transaction> transactions = transactionService.findTransactionsByUserId(id);
        if (transactions.isEmpty()) {
            throw new NotFoundException("No se encontraron transacciones para el usuario con ID " + id);
        }
        return ResponseEntity.ok(transactions.subList(0, Math.min(transactions.size(), 5)));
    }
}
