package org.edgar.hodlverse.controllers;

import org.edgar.hodlverse.entities.Transaction;
import org.edgar.hodlverse.services.NotFoundException;
import org.edgar.hodlverse.services.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/transactions") // Ruta base para el controlador
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Obtener todas las transacciones
    @GetMapping("/all")
    public List<Transaction> all() {
        return transactionService.findAll();
    }

    @PostMapping
    public Transaction newTransaction(@RequestBody Transaction newTransaction) {
        // Si el ID no se pasa, lo manejamos automáticamente en la base de datos
        if (newTransaction.getTransactionId() != null) {
            return transactionService.save(newTransaction);
        } else {
            // La base de datos genera el ID automáticamente
            return transactionService.save(newTransaction);
        }
    }


    // Obtener una transacción específica por su ID
    @GetMapping("/{id}")
    public Transaction one(@PathVariable Long id) {
        return transactionService.findById(id)
                .orElseThrow(() -> new RuntimeException("Transacción con ID " + id + " no encontrada."));
    }

    // Actualizar una transacción existente
    @PutMapping("/{id}")
    public Transaction replaceTransaction(@RequestBody Transaction newTransaction, @PathVariable Long id) {
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
                    return transactionService.save(transaction);
                })
                .orElseGet(() -> {
                    // Si la transacción no existe, asignamos el ID desde la URL
                    newTransaction.setTransactionId(id);
                    return transactionService.save(newTransaction);
                });
    }


    // Eliminar una transacción por su ID
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        if (transactionService.findById(id).isEmpty()) {
            throw new NotFoundException("Transacción con id " + id + " no encontrada.");
        }
        transactionService.deleteById(id);
    }
    // Obtener todas las transacciones de un usuario por su ID
    @GetMapping("/all/{id}")
    public List<Transaction> getTransactionsByUserId(@PathVariable Long id) {
        List<Transaction> transactions = transactionService.findTransactionsByUserId(id);

        if (transactions.isEmpty()) {
            throw new NotFoundException("No se encontraron transacciones para el usuario con ID " + id);
        }

        return transactions;
    }

    // Obtener las últimas 5 transacciones de un usuario por su ID
    @GetMapping("/latest/{id}")
    public List<Transaction> getLatestTransactionsByUserId(@PathVariable Long id) {
        List<Transaction> transactions = transactionService.findTransactionsByUserId(id);

        if (transactions.isEmpty()) {
            throw new NotFoundException("No se encontraron transacciones para el usuario con ID " + id);
        }

        // Devolver solo las últimas 5 transacciones
        return transactions.stream()
                .sorted(Comparator.comparing(Transaction::getTransactionDate).reversed()) // Ordenar por fecha descendente
                .limit(3) // Tomar las primeras 5
                .collect(Collectors.toList());
    }


}
