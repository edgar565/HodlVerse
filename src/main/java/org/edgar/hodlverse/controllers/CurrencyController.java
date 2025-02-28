package org.edgar.hodlverse.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.edgar.hodlverse.entities.Currency;
import org.edgar.hodlverse.services.CurrencyService;
import org.edgar.hodlverse.services.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/currencies") // Ruta base para el controlador
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    // Obtener todas las monedas
    @GetMapping
    public ResponseEntity<List<Currency>> all() {
        List<Currency> currencies = currencyService.findAll();
        return ResponseEntity.ok(currencies);
    }

    // Crear una nueva moneda
    @PostMapping
    public ResponseEntity<Currency> newCurrency(@RequestBody Currency newCurrency) {
        Currency savedCurrency = currencyService.save(newCurrency);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCurrency);
    }

    // Obtener una moneda específica por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Currency> one(@PathVariable Long id) {
        Currency currency = currencyService.findById(id)
                .orElseThrow(() -> new NotFoundException("Moneda con ID " + id + " no encontrada."));
        return ResponseEntity.ok(currency);
    }

    // Actualizar una moneda existente
    @PutMapping("/{id}")
    public ResponseEntity<Currency> replaceCurrency(@RequestBody Currency newCurrency, @PathVariable Long id) {
        return currencyService.findById(id)
                .map(currency -> {
                    currency.setTicker(newCurrency.getTicker());
                    currency.setName(newCurrency.getName());
                    currency.setImage(newCurrency.getImage());
                    return ResponseEntity.ok(currencyService.save(currency));
                })
                .orElseGet(() -> {
                    newCurrency.setCurrencyId(id);
                    return ResponseEntity.status(HttpStatus.CREATED).body(currencyService.save(newCurrency));
                });
    }

    // Eliminar una moneda por su ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCurrency(@PathVariable Long id) {
        Currency currency = currencyService.findById(id)
                .orElseThrow(() -> new NotFoundException("Moneda con ID " + id + " no encontrada."));

        currencyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /*
    @GetMapping("/random")
    public List<Currency> getAllCurrenciesRandom() {
        return currencyService.getAllCurrenciesRandom();
    }

     */

    @GetMapping("/ticker/{ticker}")
    public ResponseEntity<Currency> getByTicker(@PathVariable String ticker) {
        Currency currency = currencyService.findByTicker(ticker)
                .orElseThrow(() -> new NotFoundException("Moneda con ticker " + ticker + " no encontrada."));
        return ResponseEntity.ok(currency);
    }

    @GetMapping("/random")
    public List<Currency> getAllCurrenciesRandom(HttpServletResponse response,
                                                 @CookieValue(value = "currencyIds", required = false) String currencyIdsCookie) throws UnsupportedEncodingException {
        List<Currency> currencies;

        if (currencyIdsCookie == null) {
            // Si la cookie no existe, obtener las monedas de la base de datos
            currencies = currencyService.getAllCurrenciesRandom();

            // Almacenar solo los IDs en la cookie, mezclados
            List<Long> currencyIds = currencies.stream().map(Currency::getCurrencyId).collect(Collectors.toList());
            Collections.shuffle(currencyIds); // Mezclar los IDs
            String currencyIdsJson = convertToJson(currencyIds);
            String encodedCurrencyIdsJson = URLEncoder.encode(currencyIdsJson, StandardCharsets.UTF_8.toString());
            Cookie cookie = new Cookie("currencyIds", encodedCurrencyIdsJson);
            cookie.setMaxAge(60 * 60 * 24); // Duración de la cookie, por ejemplo, 1 día
            cookie.setPath("/");
            cookie.setHttpOnly(true); // Opcional: para mejorar la seguridad
            cookie.setSecure(true); // Opcional: si estás usando HTTPS
            response.addCookie(cookie);
        } else {
            // Si la cookie existe, usar los IDs de la cookie para obtener los datos completos
            String decodedCurrencyIdsJson = URLDecoder.decode(currencyIdsCookie, StandardCharsets.UTF_8.toString());
            List<Long> currencyIds = convertFromJson(decodedCurrencyIdsJson, new TypeReference<List<Long>>() {});
            currencies = currencyService.findAllByIds(currencyIds);
        }

        // Generar aleatoriedad en el lado del cliente o servidor
        Collections.shuffle(currencies);
        return currencies;
    }

    // Métodos para convertir a y desde JSON
    private String convertToJson(Object object) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(object);
        } catch (Exception e) {
            throw new RuntimeException("Error converting object to JSON", e);
        }
    }

    private <T> T convertFromJson(String json, TypeReference<T> typeReference) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, typeReference);
        } catch (Exception e) {
            throw new RuntimeException("Error converting JSON to object", e);
        }
    }

    @GetMapping("/search/{name}")
    public ResponseEntity<List<Currency>> findCurrenciesByName(@PathVariable String name) {
        List<Currency> currencies = currencyService.findByNameContaining(name);
        if (currencies.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(currencies);
    }

}