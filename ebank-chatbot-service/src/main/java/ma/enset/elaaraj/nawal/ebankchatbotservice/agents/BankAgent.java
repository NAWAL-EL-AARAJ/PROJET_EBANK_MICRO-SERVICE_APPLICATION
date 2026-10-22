package ma.enset.elaaraj.nawal.ebankchatbotservice.agents;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.stereotype.Service;

/**
 * Agent IA de la banque.
 * - Le LLM (Ollama / qwen3:8b) comprend la question en langage naturel.
 * - Les outils MCP (fournis par customer-service et ebank-service) lui donnent accès aux vraies données.
 * - La mémoire garde l'historique de chaque conversation (une conversation = un chatId).
 */
@Service
public class BankAgent {

    private static final String SYSTEM_PROMPT = """
            Tu es l'assistant virtuel de la banque eBank.
            Tu réponds toujours en français, de façon claire et concise.
            Pour toute question sur les clients ou les comptes bancaires, utilise obligatoirement
            les outils mis à ta disposition : n'invente jamais un client, un compte ou un solde.
            Si un outil ne renvoie aucun résultat ou une erreur, dis-le simplement à l'utilisateur.
            Les montants sont en dirhams (MAD), arrondis à deux décimales.
            Si la question ne concerne pas la banque, réponds poliment que tu es limité aux
            informations sur les clients et les comptes bancaires.
            /no_think
            """;
    // "/no_think" : interrupteur de Qwen3 qui désactive le raisonnement (<think>...</think>),
    // ce qui rend les réponses beaucoup plus rapides sur un PC sans carte graphique.

    private final ChatClient chatClient;

    public BankAgent(ChatClient.Builder chatClientBuilder,
                     SyncMcpToolCallbackProvider mcpTools) {

        // Mémoire en RAM : on garde les 20 derniers messages de chaque conversation
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .maxMessages(20)
                .build();

        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                // outils distants découverts via MCP (getAllCustomers, getBankAccountById, ...)
                .defaultToolCallbacks(mcpTools)
                // ajoute automatiquement l'historique de la conversation à chaque requête
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }

    /**
     * Pose une question à l'agent.
     *
     * @param chatId   identifiant de la conversation (ex : id du chat Telegram) pour la mémoire
     * @param question question de l'utilisateur
     * @return la réponse générée par le LLM
     */
    public String askAgent(String chatId, String question) {
        String answer = chatClient.prompt()
                .user(question)
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, chatId))
                .call()
                .content();
        return removeReasoning(answer);
    }

    /**
     * Certains modèles (ex : qwen3) écrivent leur raisonnement avant la balise </think>.
     * On ne garde que la réponse finale destinée à l'utilisateur.
     */
    private String removeReasoning(String answer) {
        if (answer == null) return null;
        int end = answer.lastIndexOf("</think>");
        return end >= 0 ? answer.substring(end + "</think>".length()).trim() : answer.trim();
    }
}
