package org.edgar.hodlverse.repositories;

import org.edgar.hodlverse.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Métodos personalizados (si los necesitas)
    List<Transaction> findByUserUserId(Long userId); // Buscar transacciones por ID de usuario
    List<Transaction> findByOriginCurrencyCurrencyId(Long currencyId); // Buscar transacciones por ID de divisa origen
    List<Transaction> findByDestinationCurrencyCurrencyId(Long currencyId); // Buscar transacciones por ID de divisa destino
    List<Transaction> findByUser_UserId(Long userId); //Buscar transacciones por el id de usuario.
}
