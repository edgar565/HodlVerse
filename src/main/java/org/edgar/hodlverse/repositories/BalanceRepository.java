package org.edgar.hodlverse.repositories;
import org.edgar.hodlverse.entities.Balance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BalanceRepository extends JpaRepository<Balance, Long> {
    List<Balance> findByCurrencyCurrencyId(Long currencyId); // Buscar balances por ID de divisa

    // Método para obtener la suma de walletAmount para una combinación de walletId y currencyId
    @Query("SELECT SUM(b.walletAmount) FROM Balance b WHERE b.wallet.walletId = :walletId AND b.currency.currencyId = :currencyId")
    BigDecimal getTotalWalletAmount(@Param("walletId") Long walletId, @Param("currencyId") Long currencyId);

    List<Balance> findByWalletWalletId(Long walletId);



}