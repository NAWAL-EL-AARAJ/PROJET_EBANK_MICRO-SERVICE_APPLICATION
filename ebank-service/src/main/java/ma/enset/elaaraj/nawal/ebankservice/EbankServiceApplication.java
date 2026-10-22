package ma.enset.elaaraj.nawal.ebankservice;

import ma.enset.elaaraj.nawal.ebankservice.entities.BankAccount;
import ma.enset.elaaraj.nawal.ebankservice.mcp.EbankMcpTools;
import ma.enset.elaaraj.nawal.ebankservice.services.EbankService;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableFeignClients
public class EbankServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EbankServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(EbankService ebankService) {
        return args -> {
            for (int i = 1; i <= 3; i++) {
                for (int j = 0; j < 5; j++) {
                    ebankService.save(BankAccount.builder()
                            .type(Math.random() > 0.5 ? "Current-account" : "saving-account")
                            .balance(1000 + Math.random() * 60000)
                            .customerId(i)
                            .build());
                }
            }

        };

    }

    // Enregistre les méthodes @Tool de EbankMcpTools comme outils du serveur MCP
    @Bean
    ToolCallbackProvider ebankTools(EbankMcpTools ebankMcpTools) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(ebankMcpTools)
                .build();
    }
}
