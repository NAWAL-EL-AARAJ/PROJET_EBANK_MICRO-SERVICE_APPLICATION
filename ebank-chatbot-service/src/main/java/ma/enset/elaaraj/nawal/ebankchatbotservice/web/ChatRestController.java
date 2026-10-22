package ma.enset.elaaraj.nawal.ebankchatbotservice.web;

import ma.enset.elaaraj.nawal.ebankchatbotservice.agents.BankAgent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint REST pour tester l'agent sans Telegram.
 * Exemple : GET http://localhost:8058/chat?question=Donne moi la liste des clients
 */
@RestController
public class ChatRestController {

    private final BankAgent bankAgent;

    public ChatRestController(BankAgent bankAgent) {
        this.bankAgent = bankAgent;
    }

    @GetMapping(value = "/chat", produces = "text/plain;charset=UTF-8")
    public String chat(@RequestParam String question,
                       // identifiant de conversation optionnel (pour garder la mémoire entre deux appels)
                       @RequestParam(defaultValue = "web") String chatId) {
        return bankAgent.askAgent(chatId, question);
    }
}
