package org.edgar.hodlverse.services;

import org.edgar.hodlverse.entities.*;
import org.edgar.hodlverse.repositories.HistoryRepository;
import org.edgar.hodlverse.repositories.TransactionRepository;
import org.edgar.hodlverse.repositories.WalletRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final HistoryRepository historyRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(WalletRepository walletRepository, HistoryRepository historyRepository, TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.historyRepository = historyRepository;
        this.transactionRepository = transactionRepository;
    }

    // Obtener todas las billeteras
    public List<Wallet> findAll() {
        return walletRepository.findAll();
    }

    // Guardar una nueva billetera
    public Wallet save(Wallet wallet) {
        return walletRepository.save(wallet);
    }

    // Buscar una billetera por su ID
    public Optional<Wallet> findById(Long id) {
        return walletRepository.findById(id);
    }

    // Eliminar una billetera por su ID
    public void deleteById(Long id) {
        walletRepository.deleteById(id);
    }

    public BigDecimal calculateTotalWalletValueInUSD(Long userId) {
        Wallet wallet = walletRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

        List<Balance> balances = wallet.getBalances();
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Balance balance : balances) {
            Currency currency = balance.getCurrency();
            BigDecimal exchangeRate = getLatestExchangeRate(currency);

            BigDecimal valueInUSD = balance.getWalletAmount().multiply(exchangeRate);
            totalValue = totalValue.add(valueInUSD);
        }

        return totalValue;
    }

    private BigDecimal getLatestExchangeRate(Currency currency) {
        return historyRepository.findTopByCurrencyOrderByLastUpdatedDesc(currency)
                .map(History::getCurrentPrice)
                .orElseThrow(() -> new RuntimeException("Exchange rate not found for currency: " + currency.getTicker()));
    }

    public List<Currency> getCurrenciesByUserId(Long userId) {
        Optional<Wallet> walletOpt = walletRepository.findByUserUserId(userId);

        if (walletOpt.isEmpty()) {
            throw new RuntimeException("No se encontró una billetera para el usuario con ID: " + userId);
        }

        Wallet wallet = walletOpt.get();

        return wallet.getBalances().stream()
                .map(Balance::getCurrency) // Obtener las divisas de cada balance
                .distinct() // Evitar duplicados
                .collect(Collectors.toList());
    }

    public Optional<Wallet> getWalletByUserId(Long userId) {
        return walletRepository.findByUserUserId(userId);
    }

}