package ma.enset.elaaraj.nawal.ebankservice.mcp;

import ma.enset.elaaraj.nawal.ebankservice.entities.BankAccount;
import ma.enset.elaaraj.nawal.ebankservice.services.EbankService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Outils MCP exposés par ebank-service.
 * L'agent IA (ebank-chatbot-service) les appelle via MCP Streamable HTTP (endpoint /mcp).
 */
@Component
public class EbankMcpTools {

    private final EbankService ebankService;

    public EbankMcpTools(EbankService ebankService) {
        this.ebankService = ebankService;
    }

    @Tool(name = "getAllBankAccounts",
            description = "Retourne la liste de tous les comptes bancaires (id, solde, type, date de création, id du client)")
    public List<BankAccount> getAllBankAccounts() {
        return ebankService.getAllBankAccounts();
    }

    @Tool(name = "getBankAccountById",
            description = "Retourne un compte bancaire à partir de son identifiant, avec les informations de son client")
    public BankAccount getBankAccountById(
            @ToolParam(description = "Identifiant du compte bancaire (UUID)") String id) {
        // EbankService récupère aussi le client via Feign (customer-service)
        return ebankService.getBankAccountById(id);
    }
}
