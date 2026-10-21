package ma.enset.elaaraj.nawal.ebankservice.controllers;
import ma.enset.elaaraj.nawal.ebankservice.entities.BankAccount;
import ma.enset.elaaraj.nawal.ebankservice.services.EbankService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class EbankRestController {
    private EbankService ebankService;
    public EbankRestController(EbankService ebankService) {
        this.ebankService = ebankService;
    }
    @GetMapping("/accounts")
    public List<BankAccount> getAllBankAccounts() {
        return ebankService.getAllBankAccounts();
    }
    @GetMapping("/accounts/{id}")
    public BankAccount getBankAccountById(@PathVariable String id) {
        return ebankService.getBankAccountById(id);
    }
    @PostMapping("/accounts")
    public BankAccount save(@RequestBody BankAccount bankAccount){
                return ebankService.save(bankAccount);
    }

}
