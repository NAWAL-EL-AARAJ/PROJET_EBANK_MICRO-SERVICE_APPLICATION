package ma.enset.elaaraj.nawal.ebankservice.services;

import feign.FeignException;
import ma.enset.elaaraj.nawal.ebankservice.entities.BankAccount;
import ma.enset.elaaraj.nawal.ebankservice.feign.CustomerRestClient;
import ma.enset.elaaraj.nawal.ebankservice.model.Customer;
import ma.enset.elaaraj.nawal.ebankservice.repository.BankAccountrepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class EbankService {

    private final BankAccountrepository accountRepository;
    private final CustomerRestClient customerRestClient;

    public EbankService(BankAccountrepository accountRepository,
                        CustomerRestClient customerRestClient) {
        this.accountRepository = accountRepository;
        this.customerRestClient = customerRestClient;
    }

    public List<BankAccount> getAllBankAccounts() {
        return accountRepository.findAll();
    }

    public BankAccount getBankAccountById(String id) {
        BankAccount bankAccount = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        try {
            Customer customer = customerRestClient.getCustomerById(bankAccount.getCustomerId());
            bankAccount.setCustomer(customer);
        } catch (FeignException e) {
            // customer-service renvoie une erreur (404, 500...) ou est injoignable
            System.err.println("Impossible de récupérer le client "
                    + bankAccount.getCustomerId() + " : " + e.getMessage());
            bankAccount.setCustomer(null);
        } catch (Exception e) {
            // autre erreur (timeout, service non trouvé dans Eureka...)
            System.err.println("Erreur inattendue lors de l'appel à customer-service : " + e.getMessage());
            bankAccount.setCustomer(null);
        }
        return bankAccount;
    }

    public BankAccount save(BankAccount bankAccount) {
        bankAccount.setId(UUID.randomUUID().toString());
        bankAccount.setCreatedAt(new Date());
        return accountRepository.save(bankAccount);
    }
}