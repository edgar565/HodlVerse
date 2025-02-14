package org.edgar.hodlverse.repositories;
import org.edgar.hodlverse.entities.Balance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BalanceRepository extends JpaRepository<Balance, Long> {
    List<Balance> findByCurrencyCurrencyId(Long currencyId); // Buscar balances por ID de divisa
}