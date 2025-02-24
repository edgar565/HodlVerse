package org.edgar.hodlverse.services;

import org.edgar.hodlverse.entities.Balance;
import org.edgar.hodlverse.repositories.BalanceRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BalanceService {

    private final BalanceRepository balanceRepository;

    public BalanceService(BalanceRepository balanceRepository) {
        this.balanceRepository = balanceRepository;
    }

    // Obtener todos los balances
    public List<Balance> findAll() {
        return balanceRepository.findAll();
    }

    // Guardar un nuevo balance
    public Balance save(Balance balance) {
        return balanceRepository.save(balance);
    }

    // Buscar un balance por su ID
    public Optional<Balance> findById(Long id) {
        return balanceRepository.findById(id);
    }

    // Eliminar un balance por su ID
    public void deleteById(Long id) {
        balanceRepository.deleteById(id);
    }

    public List<Balance> findByCurrencyId(Long currencyId) {
        return balanceRepository.findByCurrencyCurrencyId(currencyId);
    }

    // Método para obtener la suma de walletAmount
    public BigDecimal getTotalWalletAmount(Long walletId, Long currencyId) {
        return balanceRepository.getTotalWalletAmount(walletId, currencyId);
    }

    public List<Balance> findByWalletId(Long walletId) {
        return balanceRepository.findByWalletWalletId(walletId);
    }

}