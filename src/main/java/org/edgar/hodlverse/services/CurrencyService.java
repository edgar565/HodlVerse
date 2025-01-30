package org.edgar.hodlverse.services;

import org.edgar.hodlverse.entities.CryptoData;
import org.edgar.hodlverse.entities.Currency;
import org.edgar.hodlverse.entities.History;
import org.edgar.hodlverse.repositories.CurrencyRepository;
import org.edgar.hodlverse.repositories.HistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CurrencyService {

    @Autowired
    private CurrencyRepository currencyRepository;

    @Autowired
    private HistoryRepository historyRepository;

    private static final Logger logger = LoggerFactory.getLogger(CurrencyService.class);



    @Scheduled(fixedRate = 300000) // Ejecuta cada 5 min
    public void fetchAndSaveCryptoData() {
        String[] cryptos = {"bitcoin", "ethereum"}; // Lista de criptomonedas a monitorear

        for (String cryptoId : cryptos) {
            CryptoData cryptoData = getCryptoData(cryptoId);

            if (cryptoData == null) {
                logger.warn("No se obtuvieron datos para {}", cryptoId);
                continue;
            }

            // Buscar o crear la criptomoneda en la BD
            Currency currency = currencyRepository.findByTicker(cryptoData.getSymbol())
                    .orElseGet(() -> {
                        Currency newCurrency = new Currency();
                        newCurrency.setName(cryptoData.getName());
                        newCurrency.setSymbol(cryptoData.getSymbol());
                        newCurrency.setImage(cryptoData.getImage());
                        newCurrency.setTicker(cryptoData.getSymbol());
                        logger.info("Creando nueva entrada de Currency para: {}", cryptoData.getName());
                        return currencyRepository.save(newCurrency);
                    });

            // Guardar historial de datos
            History history = new History();
            history.setCurrency(currency);
            history.setCurrentPrice(getSafeValue(cryptoData.getCurrentPrice()));
            history.setMarketCap(getSafeValue(cryptoData.getMarketCap()));
            history.setMarketCapRank(cryptoData.getMarketCapRank() != null ? cryptoData.getMarketCapRank() : 0);
            history.setTotalVolume(getSafeValue(cryptoData.getTotalVolume()));
            history.setHigh24h(getSafeValue(cryptoData.getHigh24h()));
            history.setLow24h(getSafeValue(cryptoData.getLow24h()));
            history.setPriceChange24h(getSafeValue(cryptoData.getPriceChange24h()));
            history.setPriceChangePercentage24h(getSafeValue(cryptoData.getPriceChangePercentage24h()));
            history.setMarketCapChange24h(getSafeValue(cryptoData.getMarketCapChange24h()));
            history.setMarketCapChangePercentage24h(getSafeValue(cryptoData.getMarketCapChangePercentage24h()));
            history.setTotalSupply(getSafeValue(cryptoData.getTotalSupply()));
            history.setLastUpdated(LocalDateTime.now());

            historyRepository.save(history);
            logger.info("Historial guardado para {} con precio actual {}", cryptoData.getName(), cryptoData.getCurrentPrice());
        }
    }

    public CryptoData getCryptoData(String cryptoId) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids="
                + cryptoId + "&x_cg_demo_api_key=CG-5XtP4exze6boDu6Tj6Ly3bwD";

        logger.info("Haciendo solicitud a la API: {}", url);

        try {
            CryptoData[] response = restTemplate.getForObject(url, CryptoData[].class);
            return response != null && response.length > 0 ? response[0] : null;
        } catch (HttpClientErrorException e) {
            logger.error("Error en la solicitud a la API: {} - Status: {}", e.getMessage(), e.getStatusCode());
        } catch (Exception e) {
            logger.error("Error inesperado al hacer la solicitud: {}", e.getMessage());
        }
        return null;
    }


    // Método para evitar valores nulos en BigDecimal
    private BigDecimal getSafeValue(BigDecimal value) {
        return Optional.ofNullable(value).orElse(BigDecimal.ZERO);
    }
}
