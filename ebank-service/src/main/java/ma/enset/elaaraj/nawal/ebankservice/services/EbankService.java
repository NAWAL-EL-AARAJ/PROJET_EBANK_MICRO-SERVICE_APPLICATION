package ma.enset.elaaraj.nawal.ebankservice.services;

import ma.enset.elaaraj.nawal.ebankservice.entities.BankAccount;
import ma.enset.elaaraj.nawal.ebankservice.feign.CustomerRestClient;
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
        bankAccount.setCustomer(customerRestClient.getCustomerById(bankAccount.getCustomerId()));
        return bankAccount;   // <-- manquait
    }

    public BankAccount save(BankAccount bankAccount) {
        bankAccount.setId(UUID.randomUUID().toString());
        bankAccount.setCreatedAt(new Date());
        return accountRepository.save(bankAccount);
    }
}