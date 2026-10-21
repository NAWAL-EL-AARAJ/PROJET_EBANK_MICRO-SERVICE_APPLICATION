package ma.enset.elaaraj.nawal.ebankservice.services;

import ma.enset.elaaraj.nawal.ebankservice.entities.BankAccount;
import ma.enset.elaaraj.nawal.ebankservice.repository.BankAccountrepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service

public class EbankService {
    private BankAccountrepository accountRepository;

    public EbankService(BankAccountrepository accountRepository) {
        this.accountRepository = accountRepository;
    }
    public List<BankAccount> getAllBankAccounts(){
        return accountRepository.findAll();

    }
    public BankAccount getBankAccountById(String id){
        return accountRepository.findById(id).orElseThrow(()->new RuntimeException("Account not found "));
    }
    public BankAccount save(BankAccount bankAccount) {
        bankAccount.setId(UUID.randomUUID().toString());
        bankAccount.setCreatedAt(new Date());
        return accountRepository.save(bankAccount);
    }
}
