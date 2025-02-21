package org.edgar.hodlverse.services;

import org.edgar.hodlverse.entities.Transaction;
import org.edgar.hodlverse.repositories.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Obtener todas las transacciones
    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    // Guardar una nueva transacción
    public Transaction save(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    // Buscar una transacción por su ID
    public Optional<Transaction> findById(Long id) {
        return transactionRepository.findById(id);
    }

    // Eliminar una transacción por su ID
    public void deleteById(Long id) {
        transactionRepository.deleteById(id);
    }

    // Método para obtener las transacciones por userId
    public List<Transaction> findTransactionsByUserId(Long userId) {
        return transactionRepository.findByUser_UserId(userId);
    }

    // Obtener todas las transacciones del usuario desde una fecha específica (la buena)
    public List<Transaction> findTransactionsByUserIdAndTransactionDateGreaterThanEqual(Long userId, LocalDate startDate) {
        return transactionRepository.findTransactionsBeforeDate(userId, startDate);
    }
}