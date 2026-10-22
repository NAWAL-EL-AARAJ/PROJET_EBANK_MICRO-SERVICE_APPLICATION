package ma.enset.elaaraj.nawal.ebankchatbotservice.telegram;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import ma.enset.elaaraj.nawal.ebankchatbotservice.agents.BankAgent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Bot Telegram en "long polling", sans librairie externe :
 * 1. on appelle getUpdates (Telegram garde la connexion ouverte jusqu'à 30 s s'il n'y a pas de message) ;
 * 2. pour chaque message reçu, on interroge le BankAgent ;
 * 3. on renvoie la réponse avec sendMessage.
 * Le token est lu depuis la variable d'environnement TELEGRAM_BOT_TOKEN (voir application.yml).
 */
@Service
@Slf4j
public class TelegramBotService {

    private static final int POLLING_TIMEOUT_SECONDS = 30;
    private static final int TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

    private final BankAgent bankAgent;
    private final String token;
    private final RestClient restClient;
    private volatile boolean running = true;
    // id du prochain update à lire (permet de ne pas traiter deux fois le même message)
    private long offset = 0;

    public TelegramBotService(BankAgent bankAgent,
                              @Value("${telegram.bot.token:}") String token) {
        this.bankAgent = bankAgent;
        this.token = token;

        // le délai de lecture doit être plus long que le timeout du long polling
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(10_000);
        requestFactory.setReadTimeout((POLLING_TIMEOUT_SECONDS + 10) * 1000);

        this.restClient = RestClient.builder()
                .baseUrl("https://api.telegram.org/bot" + token)
                .requestFactory(requestFactory)
                .build();
    }

    /** Démarre la boucle de polling dans un thread séparé une fois l'application prête. */
    @EventListener(ApplicationReadyEvent.class)
    public void start() {
        if (token == null || token.isBlank()) {
            log.warn("TELEGRAM_BOT_TOKEN non défini : le bot Telegram est désactivé (GET /chat reste disponible).");
            return;
        }
        Thread thread = new Thread(this::pollingLoop, "telegram-bot");
        thread.setDaemon(true);
        thread.start();
        log.info("Bot Telegram démarré (long polling).");
    }

    @PreDestroy
    public void stop() {
        running = false;
    }

    private void pollingLoop() {
        while (running) {
            try {
                UpdatesResponse response = restClient.get()
                        .uri("/getUpdates?timeout={timeout}&offset={offset}", POLLING_TIMEOUT_SECONDS, offset)
                        .retrieve()
                        .body(UpdatesResponse.class);

                if (response == null || response.result() == null) continue;

                for (Update update : response.result()) {
                    offset = update.updateId() + 1;
                    handleUpdate(update);
                }
            } catch (Exception e) {
                // ne jamais afficher le token dans les logs (il fait partie de l'URL)
                log.error("Erreur pendant le polling Telegram : {}", hideToken(e.getMessage()));
                pause(5_000);
            }
        }
    }

    private void handleUpdate(Update update) {
        Message message = update.message();
        // on ignore ce qui n'est pas un message texte (photos, stickers, ...)
        if (message == null || message.text() == null || message.chat() == null) return;

        long chatId = message.chat().id();
        String answer;
        if (message.text().startsWith("/start")) {
            answer = "Bonjour 👋 Je suis l'assistant eBank. Posez-moi une question sur les clients ou les comptes bancaires.";
        } else {
            try {
                // la mémoire de conversation est séparée pour chaque chat Telegram
                answer = bankAgent.askAgent(String.valueOf(chatId), message.text());
            } catch (Exception e) {
                log.error("Erreur de l'agent : {}", e.getMessage());
                answer = "Désolé, une erreur est survenue. Réessayez dans un instant.";
            }
        }
        sendMessage(chatId, answer);
    }

    private void sendMessage(long chatId, String text) {
        if (text == null || text.isBlank()) text = "(réponse vide)";
        if (text.length() > TELEGRAM_MAX_MESSAGE_LENGTH) {
            text = text.substring(0, TELEGRAM_MAX_MESSAGE_LENGTH);
        }
        try {
            restClient.post()
                    .uri("/sendMessage")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("chat_id", chatId, "text", text))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Impossible d'envoyer le message Telegram : {}", hideToken(e.getMessage()));
        }
    }

    private String hideToken(String text) {
        return text == null ? null : text.replace(token, "***");
    }

    private void pause(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            running = false;
        }
    }

    // ---- Objets JSON minimaux de l'API Telegram (seuls les champs utiles sont déclarés) ----

    @JsonIgnoreProperties(ignoreUnknown = true)
    record UpdatesResponse(boolean ok, List<Update> result) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Update(@JsonProperty("update_id") long updateId, Message message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Message(Chat chat, String text) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Chat(long id) {}
}
