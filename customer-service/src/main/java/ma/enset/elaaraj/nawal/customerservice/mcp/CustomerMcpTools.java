package ma.enset.elaaraj.nawal.customerservice.mcp;

import ma.enset.elaaraj.nawal.customerservice.entities.Customer;
import ma.enset.elaaraj.nawal.customerservice.service.CustomerService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Outils MCP exposés par customer-service.
 * Chaque méthode annotée @Tool devient un outil que l'agent IA (LLM)
 * peut appeler à distance via le protocole MCP (Streamable HTTP, endpoint /mcp).
 * La description aide le LLM à choisir le bon outil.
 */
@Component
public class CustomerMcpTools {

    private final CustomerService customerService;

    public CustomerMcpTools(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Tool(name = "getAllCustomers",
            description = "Retourne la liste de tous les clients de la banque (id, nom, email)")
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @Tool(name = "getCustomerById",
            description = "Retourne un client de la banque à partir de son identifiant")
    public Customer getCustomerById(@ToolParam(description = "Identifiant du client") Long id) {
        return customerService.findCustomerById(id);
    }
}
